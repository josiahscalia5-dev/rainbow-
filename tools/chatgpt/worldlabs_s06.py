#!/usr/bin/env python3
"""Prepare and run one private Screen06 World Labs image job.

Standard library only. Preparation is entirely offline. Network commands read
WLT_API_KEY only at execution time; credentials and signed URLs are never saved.
"""

from __future__ import annotations

import argparse
import contextlib
import copy
import datetime as dt
import fcntl
import hashlib
import ipaddress
import json
import math
import os
from pathlib import Path
import re
import signal
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid


REPO = Path(__file__).resolve().parents[2]
LOCAL_ROOT = REPO / ".cache" / "worldlabs-s06"
API_ORIGIN = "https://api.worldlabs.ai"
API_PREFIX = "/marble/v1"
MODEL = "marble-1.1"
BUDGET_CEILING = 5420
EXPECTED_CREDITS = 1580  # 1,500 world + 80 non-pano image; official tariff below.
PRICING_DATE = dt.date(2026, 11, 20)
MAX_PRICING_AGE_DAYS = 7
PRICING_URL = "https://docs.worldlabs.ai/api/pricing"
MEDIA_PLACEHOLDER = "PREPARE_WILL_SET_MEDIA_ASSET_ID"
MAX_IMAGE_BYTES = 20 * 1024 * 1024  # Conservative client limit, not an API claim.
MAX_RESPONSE_BYTES = 8 * 1024 * 1024
MAX_ASSET_BYTES = 2 * 1024 * 1024 * 1024
PRIVATE = {
    "public": False,
    "allow_id_access": False,
    "allowed_readers": [],
    "allowed_writers": [],
}
SAFE_ID = re.compile(r"[A-Za-z0-9_-]{1,200}\Z")
SAFE_JOB = re.compile(r"[a-z0-9][a-z0-9_-]{0,47}\Z")
URL_RE = re.compile(r"https?://[^\s\"'<>]+", re.IGNORECASE)
SECRET_VALUES: list[str] = []  # Populated only by an explicit network command.


class JobError(Exception):
    """A safe, fixed-message error suitable for terminal output."""


class TimeLimit(JobError):
    pass


class ApiError(JobError):
    def __init__(self, message, *, status=None, response=None, request_id=None):
        super().__init__(message)
        self.status = status
        self.response = response
        self.request_id = request_id


def utc_now():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def sanitized(value):
    """Remove auth material, all URLs, upload instructions, and raw headers."""
    if isinstance(value, dict):
        out = {}
        for key, item in value.items():
            lowered = str(key).lower().replace("-", "_")
            safe_key = sanitized(str(key))
            if any(word in lowered for word in (
                "header", "api_key", "authorization", "cookie", "password",
                "secret", "token", "signature", "curl_example", "upload_info",
            )):
                out[safe_key] = "[omitted]"
            else:
                out[safe_key] = sanitized(item)
        return out
    if isinstance(value, list):
        return [sanitized(item) for item in value]
    if isinstance(value, str):
        for secret in SECRET_VALUES:
            value = value.replace(secret, "[credential omitted]")
        return URL_RE.sub("[URL omitted]", value)
    return value


def sync_directory(path):
    descriptor = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def write_json(path, value, *, redact=False, exclusive=False):
    if path.is_symlink():
        raise JobError("Refusing a symlink in the local job files.")
    data = json.dumps(sanitized(value) if redact else value, indent=2, sort_keys=True).encode() + b"\n"
    if exclusive:
        descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
    else:
        descriptor, temporary = tempfile.mkstemp(prefix=".write-", dir=path.parent)
        try:
            with os.fdopen(descriptor, "wb") as stream:
                stream.write(data)
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(temporary, path)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)
    sync_directory(path.parent)


def read_json(path):
    if path.is_symlink() or not path.is_file() or path.stat().st_size > MAX_RESPONSE_BYTES:
        raise JobError("Missing, oversized, or unsafe local JSON file.")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError):
        raise JobError("The local JSON file is invalid.") from None
    if not isinstance(value, dict):
        raise JobError("The local JSON file must contain an object.")
    return value


def validate_id(value, label="identifier"):
    if not isinstance(value, str) or not SAFE_ID.fullmatch(value):
        raise JobError(f"Invalid {label}; no request was made with it.")
    return value


def job_path(name):
    if not SAFE_JOB.fullmatch(name):
        raise JobError("Job names must use 1-48 lowercase letters, digits, underscores, or hyphens.")
    for path in (REPO / ".cache", LOCAL_ROOT, LOCAL_ROOT / name):
        if path.is_symlink():
            raise JobError("Refusing a symlink in the job directory path.")
    LOCAL_ROOT.mkdir(parents=True, exist_ok=True, mode=0o700)
    return LOCAL_ROOT / name


@contextlib.contextmanager
def task_lock():
    descriptor = os.open(LOCAL_ROOT / "task.lock", os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    try:
        try:
            fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise JobError("Another World Labs command holds this task's lock.") from None
        yield
    finally:
        os.close(descriptor)


class Deadline:
    def __init__(self, seconds):
        self.end = time.monotonic() + seconds

    def remaining(self):
        remaining = self.end - time.monotonic()
        if remaining <= 0:
            raise TimeLimit("Runtime limit reached; retain the job files and resume the existing operation.")
        return remaining

    def timeout(self):
        return min(30.0, self.remaining())


@contextlib.contextmanager
def runtime_limit(seconds):
    """Wall-clock timer also interrupts a stalled or indefinitely streaming body."""
    def expired(_signum, _frame):
        raise TimeLimit("Runtime limit reached; retain the job files and resume the existing operation.")

    previous = signal.signal(signal.SIGALRM, expired)
    signal.setitimer(signal.ITIMER_REAL, seconds)
    try:
        yield Deadline(seconds)
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, previous)


def validate_request(request, *, prepared=False):
    permitted = {"display_name", "model", "permission", "seed", "tags", "world_prompt"}
    if set(request) - permitted or request.get("model") != MODEL:
        raise JobError("Only the fixed marble-1.1 image request fields are permitted.")
    if request.get("permission") != PRIVATE:
        raise JobError("The world permission must be fully private, with no extra readers or writers.")
    name = request.get("display_name")
    if not isinstance(name, str) or not 1 <= len(name) <= 64:
        raise JobError("display_name must contain 1-64 characters.")
    tags = request.get("tags", [])
    if not isinstance(tags, list) or len(tags) > (10 if prepared else 9):
        raise JobError("The request has too many tags; one slot is reserved for job correlation.")
    if any(not isinstance(tag, str) or not 1 <= len(tag) <= 32 for tag in tags):
        raise JobError("Each tag must contain 1-32 characters.")
    if "seed" in request and (type(request["seed"]) is not int or not 0 <= request["seed"] <= 4294967295):
        raise JobError("seed must be an unsigned 32-bit integer.")
    prompt = request.get("world_prompt")
    if not isinstance(prompt, dict) or set(prompt) - {
        "type", "image_prompt", "is_pano", "text_prompt", "disable_recaption"
    }:
        raise JobError("Unsupported image prompt fields.")
    if prompt.get("type") != "image" or prompt.get("is_pano") is not False:
        raise JobError("This job requires type=image and is_pano=false.")
    if prompt.get("image_prompt") != {"source": "media_asset", "media_asset_id": MEDIA_PLACEHOLDER}:
        raise JobError("image_prompt must use the documented local media-asset placeholder.")
    if "disable_recaption" in prompt and type(prompt["disable_recaption"]) is not bool:
        raise JobError("disable_recaption must be a boolean.")
    if "text_prompt" in prompt and (not isinstance(prompt["text_prompt"], str) or not prompt["text_prompt"].strip()):
        raise JobError("text_prompt must be a nonempty string when supplied.")


def image_bytes(path):
    if not path.is_file() or path.stat().st_size > MAX_IMAGE_BYTES:
        raise JobError("The explicit image input must be a file of at most 20 MiB.")
    data = path.read_bytes()
    checks = (
        ("png", data.startswith(b"\x89PNG\r\n\x1a\n"), "image/png"),
        ("jpg", data.startswith(b"\xff\xd8\xff"), "image/jpeg"),
        ("webp", data.startswith(b"RIFF") and data[8:12] == b"WEBP", "image/webp"),
    )
    if data and len(data) <= MAX_IMAGE_BYTES:
        for extension, matches, mime in checks:
            if matches:
                # Some original reference files use .png names for JPEG bytes.
                # Correct the upload metadata only; never rewrite input bytes.
                return data, extension, mime
    raise JobError("The input must contain a PNG, JPEG, or WebP signature.")


def prepare_job(args):
    directory = job_path(args.job)
    request = read_json(Path(args.request_json).expanduser().resolve())
    validate_request(request)
    path = Path(args.input).expanduser().resolve()
    data, extension, mime = image_bytes(path)
    request_id = uuid.uuid4().hex
    correlation_tag = f"s06-{request_id[:24]}"
    request.setdefault("tags", []).append(correlation_tag)
    validate_request(request, prepared=True)
    with task_lock():
        if directory.exists():
            raise JobError("This job already exists. Preparation never overwrites a job or its attempt history.")
        directory.mkdir(mode=0o700)
        manifest = {
            "schema_version": 1,
            "job_name": args.job,
            "prepared_at": utc_now(),
            "local_request_id": request_id,
            "correlation_tag": correlation_tag,
            "input": {"path": str(path), "sha256": digest(data), "bytes": len(data), "extension": extension, "mime": mime},
            "request_sha256": digest(canonical(request)),
            "budget": {
                "ceiling_credits": BUDGET_CEILING,
                "expected_credits": EXPECTED_CREDITS,
                "pricing_verified_on": PRICING_DATE.isoformat(),
                "pricing_source": PRICING_URL,
            },
            "network_requests": 0,
            "visual_match_guaranteed": False,
        }
        write_json(directory / "request.json", request, exclusive=True)
        write_json(directory / "prepared.json", manifest, exclusive=True)
    print(f"Prepared {args.job}: image SHA-256 {digest(data)}; expected {EXPECTED_CREDITS} credits. No network request or charge.")
    print(f"Job files: {directory}")
    return 0


class Receipt:
    def __init__(self, directory):
        self.directory = directory
        self.prepared = read_json(directory / "prepared.json")
        self.request = read_json(directory / "request.json")
        validate_request(self.request, prepared=True)
        if digest(canonical(self.request)) != self.prepared.get("request_sha256"):
            raise JobError("The prepared request changed. Preserve this job and investigate before any execution.")
        path = directory / "state.json"
        self.state = read_json(path) if path.exists() else {
            "local_request_id": self.prepared["local_request_id"],
            "submission": {"outcome": "not_attempted"},
            "events": [],
            "budget": copy.deepcopy(self.prepared["budget"]),
        }
        if self.state.get("local_request_id") != self.prepared.get("local_request_id"):
            raise JobError("The local request identifiers do not agree.")

    def save(self):
        self.state["updated_at"] = utc_now()
        write_json(self.directory / "state.json", self.state, redact=True)

    def event(self, label, **fields):
        self.state["events"].append({"at": utc_now(), "event": label, **sanitized(fields)})
        self.save()

    def api(self, client, label, method, path, body=None):
        try:
            response, request_id = client.api(method, path, body)
        except ApiError as error:
            self.event(label, status=error.status, error=str(error), server_request_id=error.request_id, response=error.response)
            raise
        self.event(label, server_request_id=request_id, response=response)
        return response


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def checked_external_url(url):
    if not isinstance(url, str) or len(url) > 16384 or any(ord(char) < 33 for char in url):
        raise JobError("The API returned an invalid asset URL.")
    try:
        parsed = urllib.parse.urlsplit(url)
        if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password or parsed.port not in (None, 443):
            raise ValueError
        hostname = parsed.hostname.lower()
        if hostname == "localhost" or hostname.endswith((".localhost", ".local")) or "." not in hostname:
            raise ValueError
        try:
            address = ipaddress.ip_address(hostname)
        except ValueError:
            address = None
        if address is not None and not address.is_global:
            raise ValueError
    except ValueError:
        raise JobError("Only HTTPS asset URLs on public hosts without embedded credentials are accepted.") from None
    if any(secret in url for secret in SECRET_VALUES):
        raise JobError("Refusing an asset URL that contains the API credential.")
    return parsed


def checked_upload_headers(value, mime):
    if value is None:
        value = {}
    if not isinstance(value, dict) or len(value) > 32:
        raise JobError("Invalid signed-upload header instructions.")
    result = {}
    blocked = {"wlt-api-key", "authorization", "cookie", "cookie2", "proxy-authorization", "host", "transfer-encoding", "connection", "content-length"}
    for name, content in value.items():
        if not isinstance(name, str) or not re.fullmatch(r"[A-Za-z0-9-]{1,80}", name) or name.lower() in blocked:
            raise JobError("Refusing a credential-bearing or transport-control upload header.")
        if not isinstance(content, str) or len(content) > 8192 or any(char in content for char in "\r\n"):
            raise JobError("Invalid signed-upload header value.")
        if any(secret in content for secret in SECRET_VALUES):
            raise JobError("Refusing an upload header that contains the API credential.")
        result[name] = content
    if not any(name.lower() == "content-type" for name in result):
        result["Content-Type"] = mime
    return result


def server_request_id(headers):
    # Save only this identifier, never the response headers themselves.
    for name in ("x-request-id", "request-id", "x-correlation-id"):
        value = headers.get(name)
        if isinstance(value, str) and SAFE_ID.fullmatch(value):
            return value
    return None


class Client:
    def __init__(self, deadline):
        key = os.environ.get("WLT_API_KEY")
        if not key or key != key.strip() or any(char in key for char in "\r\n"):
            raise JobError("WLT_API_KEY must be securely bound to this process before network commands; do not paste it into chat or arguments.")
        self.key = key
        SECRET_VALUES.append(key)
        self.deadline = deadline
        # Both honor standard configured proxy environment settings. Neither has
        # an auth/cookie handler; redirects are disabled on both.
        self.api_opener = urllib.request.build_opener(urllib.request.ProxyHandler(), NoRedirect())
        self.asset_opener = urllib.request.build_opener(urllib.request.ProxyHandler(), NoRedirect())

    def api(self, method, path, body=None):
        if not path.startswith(API_PREFIX + "/") or "?" in path or "#" in path or ".." in path:
            raise JobError("Invalid API path.")
        url = API_ORIGIN + path
        if urllib.parse.urlsplit(url).hostname != "api.worldlabs.ai":
            raise JobError("API authentication is restricted to api.worldlabs.ai.")
        payload = canonical(body) if body is not None else None
        request = urllib.request.Request(url, data=payload, method=method, headers={"Accept": "application/json"})
        request.add_unredirected_header("WLT-Api-Key", self.key)
        if payload is not None:
            request.add_header("Content-Type", "application/json")
        try:
            with self.api_opener.open(request, timeout=self.deadline.timeout()) as response:
                raw = response.read(MAX_RESPONSE_BYTES + 1)
                request_id = server_request_id(response.headers)
                if len(raw) > MAX_RESPONSE_BYTES:
                    raise ApiError("API response exceeded the client size limit.", request_id=request_id)
                try:
                    value = json.loads(raw)
                except (ValueError, UnicodeError):
                    raise ApiError("API returned an invalid JSON response; do not repeat a generation submission.", request_id=request_id) from None
                if not isinstance(value, dict):
                    raise ApiError("API returned an unexpected JSON type.", request_id=request_id)
                return value, request_id
        except urllib.error.HTTPError as error:
            # Error bodies can contain signed URLs or echoed secrets. Sanitize
            # before handing them to any receipt or terminal path.
            try:
                raw = error.read(MAX_RESPONSE_BYTES + 1)
                detail = sanitized(json.loads(raw)) if len(raw) <= MAX_RESPONSE_BYTES else None
            except (ValueError, UnicodeError, OSError):
                detail = {"message": "Response body omitted."}
            raise ApiError(f"API request returned HTTP {error.code}.", status=error.code, response=detail, request_id=server_request_id(error.headers)) from None
        except (urllib.error.URLError, TimeoutError, OSError):
            raise ApiError("API connection failed or timed out; a generation submission may have reached the server.") from None

    def upload(self, url, data, required_headers, mime):
        checked_external_url(url)
        headers = checked_upload_headers(required_headers, mime)
        request = urllib.request.Request(url, data=data, method="PUT", headers=headers)
        try:
            with self.asset_opener.open(request, timeout=self.deadline.timeout()) as response:
                if not 200 <= response.status < 300:
                    raise JobError("Signed image upload did not succeed.")
        except (urllib.error.URLError, TimeoutError, OSError):
            raise JobError("Signed image upload failed; no generation was submitted by this upload step.") from None

    def download(self, url, target):
        checked_external_url(url)
        descriptor, temporary = tempfile.mkstemp(prefix=".download-", dir=target.parent)
        sha = hashlib.sha256()
        size = 0
        try:
            request = urllib.request.Request(url, method="GET")
            with os.fdopen(descriptor, "wb") as stream:
                try:
                    with self.asset_opener.open(request, timeout=self.deadline.timeout()) as response:
                        declared_size = response.headers.get("Content-Length")
                        try:
                            declared_size = int(declared_size) if declared_size is not None else None
                        except ValueError:
                            raise JobError("The asset server returned an invalid content length.") from None
                        if declared_size is not None and not 0 < declared_size <= MAX_ASSET_BYTES:
                            raise JobError("The declared asset size is empty or exceeds the client limit.")
                        while True:
                            self.deadline.remaining()
                            chunk = response.read(1024 * 1024)
                            if not chunk:
                                break
                            size += len(chunk)
                            if size > MAX_ASSET_BYTES:
                                raise JobError("Asset exceeded the 2 GiB per-file client limit.")
                            sha.update(chunk)
                            stream.write(chunk)
                        if declared_size is not None and size != declared_size:
                            raise JobError("The asset response ended before the declared byte count; no complete file was saved.")
                except (urllib.error.URLError, TimeoutError, OSError):
                    raise JobError("Asset download failed. Resume to fetch a fresh API-provided URL; never resubmit generation.") from None
                if not size:
                    raise JobError("The API asset download was empty.")
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(temporary, target)
            sync_directory(target.parent)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)
        return {"file": target.name, "bytes": size, "sha256": sha.hexdigest()}


def credit_balance(response):
    value = response.get("remaining_credits")
    if type(value) not in (int, float) or not math.isfinite(value) or value < 0:
        raise JobError("The API did not return a valid nonnegative remaining_credits value.")
    return value


def capture_credits(receipt, client, label):
    response = receipt.api(client, label, "GET", API_PREFIX + "/credits")
    value = credit_balance(response)
    receipt.state["budget"][label] = {"at": utc_now(), "remaining_credits": value}
    before = receipt.state["budget"].get("before_generation", {}).get("remaining_credits")
    if before is not None and label != "before_generation":
        receipt.state["budget"][label]["balance_difference_from_before"] = before - value
    receipt.save()
    return value


def capture_after_best_effort(receipt, client, label):
    try:
        capture_credits(receipt, client, label)
    except (ApiError, JobError) as error:
        if isinstance(error, TimeLimit):
            raise
        receipt.event(label + "_unavailable", error=str(error))


def check_price_age():
    age = (dt.datetime.now(dt.timezone.utc).date() - PRICING_DATE).days
    if age < 0 or age > MAX_PRICING_AGE_DAYS:
        raise JobError("The pricing verification is stale. Recheck the official tariff and update the reviewed price record before a new start.")
    if EXPECTED_CREDITS > BUDGET_CEILING:
        raise JobError("The documented cost exceeds the authorized client budget ceiling.")


def start_job(args, client):
    directory = job_path(args.job)
    with task_lock():
        receipt = Receipt(directory)
        marker = LOCAL_ROOT / "generation-attempt.json"
        if marker.exists() or receipt.state["submission"].get("outcome") != "not_attempted":
            raise JobError("This task already has a generation-attempt record. Use resume; never delete the marker or resubmit an unknown outcome.")
        check_price_age()
        data, extension, mime = image_bytes(Path(receipt.prepared["input"]["path"]))
        if digest(data) != receipt.prepared["input"]["sha256"] or len(data) != receipt.prepared["input"]["bytes"]:
            raise JobError("The input image changed after preparation; no upload or generation was attempted.")
        before = capture_credits(receipt, client, "before_generation")
        if before < EXPECTED_CREDITS:
            raise JobError("Live API balance is below the full documented 1,580-credit charge; generation was not submitted.")
        media = receipt.state.get("media", {})
        if not media.get("uploaded"):
            safe_name = f"screen06-{receipt.prepared['input']['sha256'][:16]}.{extension}"
            upload = receipt.api(client, "prepare_upload", "POST", API_PREFIX + "/media-assets:prepare_upload", {
                "file_name": safe_name, "extension": extension, "kind": "image",
                "metadata": {"local_request_id": receipt.prepared["local_request_id"], "input_sha256": digest(data)},
            })
            media_asset_id = validate_id(upload.get("media_asset", {}).get("media_asset_id"), "media asset ID")
            info = upload.get("upload_info")
            if not isinstance(info, dict) or info.get("upload_method", "").upper() != "PUT":
                raise JobError("The API did not return the documented signed PUT upload contract.")
            client.upload(info.get("upload_url"), data, info.get("required_headers"), mime)
            receipt.state["media"] = {"media_asset_id": media_asset_id, "uploaded": True, "input_sha256": digest(data), "uploaded_at": utc_now()}
            receipt.event("image_uploaded", media_asset_id=media_asset_id, input_sha256=digest(data))
        else:
            media_asset_id = validate_id(media.get("media_asset_id"), "media asset ID")
            if media.get("input_sha256") != digest(data):
                raise JobError("The uploaded media hash does not match the prepared input.")
        # Recheck the live balance immediately before the paid request. Uploads
        # have no credit cost, but another account operation could have run.
        before = capture_credits(receipt, client, "before_generation")
        if before < EXPECTED_CREDITS:
            raise JobError("Live balance changed below the documented charge; generation was not submitted.")
        actual_request = copy.deepcopy(receipt.request)
        actual_request["world_prompt"]["image_prompt"]["media_asset_id"] = media_asset_id
        write_json(directory / "submitted-request.json", actual_request, exclusive=True)
        attempted = {
            "job_name": args.job,
            "local_request_id": receipt.prepared["local_request_id"],
            "attempted_at": utc_now(),
            "request_sha256": digest(canonical(actual_request)),
            "input_sha256": digest(data),
            "expected_credits": EXPECTED_CREDITS,
            "budget_ceiling_credits": BUDGET_CEILING,
        }
        # This fsynced, O_EXCL marker MUST precede the only generation POST.
        # No path removes it, including 4xx, timeout, malformed JSON, or Ctrl-C.
        write_json(marker, attempted, exclusive=True)
        receipt.state["submission"] = {**attempted, "outcome": "unknown"}
        receipt.save()
        try:
            response = receipt.api(client, "generate_once", "POST", API_PREFIX + "/worlds:generate", actual_request)
            operation_id = validate_id(response.get("operation_id"), "operation ID")
        except BaseException:
            receipt.event("submission_outcome_unknown", action="Keep all state. Recover an operation ID from the provider; do not start again.")
            raise
        # Save the operation ID before any additional HTTP request or download.
        receipt.state["operation_id"] = operation_id
        receipt.state["submission"]["outcome"] = "operation_received"
        receipt.save()
        capture_after_best_effort(receipt, client, "after_submission")
        print(f"Started one private {MODEL} job. Operation: {operation_id}")
        print(f"Expected charge: {EXPECTED_CREDITS} credits; before balance: {before}. Use resume for this existing operation.")
    return 0


def asset_specs(world):
    assets = world.get("assets") or {}
    if not isinstance(assets, dict):
        raise JobError("Invalid world asset response.")
    result = []
    spzs = (assets.get("splats") or {}).get("spz_urls") or {}
    if not isinstance(spzs, dict) or len(spzs) > 16:
        raise JobError("Unexpected SPZ asset listing.")
    for index, (label, url) in enumerate(sorted(spzs.items()), 1):
        if not url:
            continue
        slug = re.sub(r"[^a-zA-Z0-9_-]", "_", str(label))[:36] or "variant"
        result.append((f"spz_{index:02d}_{slug}.spz", f"splats.spz_urls.{label}", url, "spz"))
    collider = (assets.get("mesh") or {}).get("collider_mesh_url")
    pano = (assets.get("imagery") or {}).get("pano_url")
    for role, url, allowed, default in (
        ("collider", collider, {".glb", ".gltf", ".obj", ".ply", ".stl"}, ".bin"),
        ("pano", pano, {".png", ".jpg", ".jpeg", ".webp"}, ".bin"),
    ):
        if url:
            parsed = checked_external_url(url)
            suffix = Path(parsed.path).suffix.lower()
            suffix = suffix if suffix in allowed else default
            field = "mesh.collider_mesh_url" if role == "collider" else "imagery.pano_url"
            result.append((role + suffix, field, url, role))
    return result


def download_assets(receipt, client, world):
    directory = receipt.directory / "results"
    if directory.is_symlink():
        raise JobError("Refusing a symlink for generated results.")
    directory.mkdir(exist_ok=True, mode=0o700)
    manifest_path = directory / "manifest.json"
    manifest = read_json(manifest_path) if manifest_path.exists() else {
        "world_id": receipt.state.get("world_id"),
        "operation_id": receipt.state["operation_id"],
        "input_sha256": receipt.prepared["input"]["sha256"],
        "files": [],
    }
    existing = {entry["file"]: entry for entry in manifest["files"]}
    specs = asset_specs(world)
    for filename, field, url, role in specs:
        target = directory / filename
        if target.is_symlink():
            raise JobError("Refusing a symlink in generated result files.")
        prior = existing.get(filename)
        if prior and target.is_file() and target.stat().st_size == prior.get("bytes"):
            with target.open("rb") as stream:
                sha = hashlib.file_digest(stream, "sha256").hexdigest()
            if sha == prior.get("sha256"):
                continue
        entry = client.download(url, target)
        entry.update({"api_field": field, "role": role, "source_host": checked_external_url(url).hostname})
        existing[filename] = entry
        manifest["files"] = list(existing.values())
        manifest["updated_at"] = utc_now()
        write_json(manifest_path, manifest, redact=True)
        receipt.event("asset_downloaded", **entry)
    manifest["missing_roles"] = sorted({"spz", "collider", "pano"} - {item[3] for item in specs})
    manifest["updated_at"] = utc_now()
    write_json(manifest_path, manifest, redact=True)
    receipt.state["downloads_complete"] = not manifest["missing_roles"]
    receipt.save()
    return manifest


def finish_operation(receipt, client, operation):
    receipt.state["operation_done"] = True
    receipt.state["settled_cost"] = sanitized(operation.get("cost"))
    if operation.get("error"):
        receipt.state["operation_error"] = sanitized(operation["error"])
        receipt.save()
        capture_after_best_effort(receipt, client, "after_completion")
        raise JobError("The existing generation operation failed. No repeat generation will be submitted.")
    world = operation.get("response")
    metadata = operation.get("metadata") or {}
    world_id = world.get("world_id") if isinstance(world, dict) else metadata.get("world_id")
    if not world_id:
        raise JobError("Completed operation did not return a world ID; state was retained.")
    receipt.state["world_id"] = validate_id(world_id, "world ID")
    receipt.save()
    if not isinstance(world, dict) or not world.get("assets"):
        world = receipt.api(client, "get_world", "GET", API_PREFIX + "/worlds/" + receipt.state["world_id"])
    if world.get("model") not in (None, MODEL) or (world.get("permission") or {}).get("public") is True:
        raise JobError("Returned world model or permission differs from this private marble-1.1 request.")
    if receipt.state.get("operation_id_recovered") and receipt.prepared["correlation_tag"] not in (world.get("tags") or []):
        rejected_id = receipt.state["operation_id"]
        for field in ("operation_id", "operation_id_recovered", "world_id", "operation_done", "settled_cost"):
            receipt.state.pop(field, None)
        receipt.state["submission"]["outcome"] = "unknown"
        receipt.event("recovered_operation_rejected", operation_id=rejected_id)
        raise JobError("Recovered operation does not contain this job's correlation tag. Do not associate or regenerate it automatically.")
    capture_after_best_effort(receipt, client, "after_completion")
    manifest = download_assets(receipt, client, world)
    cost = (operation.get("cost") or {}).get("total_credits")
    print(f"World {receipt.state['world_id']}; settled operation cost: {cost if cost is not None else 'not returned'} credits.")
    print(f"Downloaded {len(manifest['files'])} assets with SHA-256 hashes: {receipt.directory / 'results' / 'manifest.json'}")
    if cost is not None and cost > BUDGET_CEILING:
        raise JobError("Provider-reported settled cost exceeds the client ceiling. Preserve the receipt; no further paid requests are implemented.")
    if manifest["missing_roles"]:
        print("The API has not supplied every requested asset role: " + ", ".join(manifest["missing_roles"]) + ". Resume can recheck.")
        return 3
    return 0


def resume_job(args, client, deadline):
    directory = job_path(args.job)
    with task_lock():
        receipt = Receipt(directory)
        operation_id = receipt.state.get("operation_id")
        if args.operation_id:
            supplied = validate_id(args.operation_id, "operation ID")
            if operation_id and supplied != operation_id:
                raise JobError("Refusing to replace the stored operation ID.")
            marker = read_json(LOCAL_ROOT / "generation-attempt.json")
            if marker.get("local_request_id") != receipt.prepared["local_request_id"]:
                raise JobError("Operation recovery requires this job's intact generation-attempt record.")
            operation_id = supplied
        if not operation_id:
            raise JobError("No operation ID is stored. If a submission outcome is unknown, recover the ID from the provider and use resume --operation-id; never start again.")
        operation_id = validate_id(operation_id, "operation ID")
        while True:
            deadline.remaining()
            operation = receipt.api(client, "get_operation", "GET", API_PREFIX + "/operations/" + operation_id)
            if operation.get("operation_id") != operation_id or type(operation.get("done")) is not bool:
                raise JobError("Operation response does not match the requested ID or documented status schema.")
            if not receipt.state.get("operation_id"):
                receipt.state["operation_id"] = operation_id
                receipt.state["operation_id_recovered"] = True
                receipt.state["submission"]["outcome"] = "operation_recovered"
                receipt.save()
            metadata = operation.get("metadata") or {}
            if isinstance(metadata, dict) and metadata.get("world_id"):
                receipt.state["world_id"] = validate_id(metadata["world_id"], "world ID")
                receipt.save()
            if operation["done"]:
                return finish_operation(receipt, client, operation)
            if args.once:
                print(f"Operation {operation_id} is still running; state saved. Resume only this existing operation.")
                return 3
            print(f"Operation {operation_id} is running; next read in {args.interval:g}s.", flush=True)
            time.sleep(min(args.interval, deadline.remaining()))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("credits", help="Read current API balance; no mutations.")
    prepare = commands.add_parser("prepare", help="Offline: record request, explicit input path, and hashes; no upload or charge.")
    prepare.add_argument("--request-json", required=True)
    prepare.add_argument("--input", required=True)
    prepare.add_argument("--job", default="s06-first")
    start = commands.add_parser("start", help="Upload the prepared image and submit at most one private paid generation attempt.")
    start.add_argument("--job", default="s06-first")
    start.add_argument("--max-seconds", type=int, default=180)
    resume = commands.add_parser("resume", help="Only GET the stored operation and download its existing assets; no paid generation or exports.")
    resume.add_argument("--job", default="s06-first")
    resume.add_argument("--operation-id", help="Explicit recovery ID only when the original attempt has an unknown outcome.")
    resume.add_argument("--max-seconds", type=int, default=600)
    resume.add_argument("--interval", type=float, default=15)
    resume.add_argument("--once", action="store_true", help="Read one operation status without polling.")
    args = parser.parse_args(argv)
    try:
        if args.command == "prepare":
            return prepare_job(args)
        seconds = getattr(args, "max_seconds", 60)
        if not 1 <= seconds <= 1800:
            raise JobError("Runtime limit must be between 1 and 1,800 seconds.")
        if args.command == "resume" and (not math.isfinite(args.interval) or not 1 <= args.interval <= 30):
            raise JobError("Polling interval must be between 1 and 30 seconds.")
        with runtime_limit(seconds) as deadline:
            client = Client(deadline)
            if args.command == "credits":
                response, _ = client.api("GET", API_PREFIX + "/credits")
                print(json.dumps({"at": utc_now(), "remaining_credits": credit_balance(response)}))
                return 0
            if args.command == "start":
                return start_job(args, client)
            return resume_job(args, client, deadline)
    except TimeLimit as error:
        print(str(error), file=sys.stderr)
        return 3
    except KeyboardInterrupt:
        print("Interrupted. Preserve every job file and attempt marker; resume an existing operation, never repeat an unknown submission.", file=sys.stderr)
        return 3
    except (JobError, OSError) as error:
        # OSError text can include a sensitive URL/path supplied by a server.
        print(sanitized(str(error)) if isinstance(error, JobError) else "Local I/O failed; preserve the job state and investigate before continuing.", file=sys.stderr)
        return 2
    except Exception:
        # A malformed nested provider object must never print a raw traceback or
        # exception value containing credentials or signed URLs.
        print("Unexpected response or local state shape. Preserve the receipt and attempt marker; do not repeat a generation submission.", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
