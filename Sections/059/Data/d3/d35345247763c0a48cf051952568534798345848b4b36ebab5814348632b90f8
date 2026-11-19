import asyncio, datetime, json, os, pathlib, sys
from mcp import ClientSession,StdioServerParameters
from mcp.client.stdio import stdio_client
import tomllib
w=pathlib.Path.cwd()
config=tomllib.loads((w/'.codex/config.toml').read_text())['mcp_servers']['blender']
async def main():
    p=StdioServerParameters(command=config['command'],args=config['args'],env={**config['env'],'LANG':'C.UTF-8','PATH':os.environ['PATH'],'PYTHONDONTWRITEBYTECODE':'1'},cwd=w)
    if sys.argv[1]=='inspect':
        code="import bpy\nresult={'version':bpy.app.version_string,'scene':bpy.context.scene.name,'objects':[o.name for o in bpy.context.scene.objects]}"
    else:
        arg=sys.argv[1]
        code="from pathlib import Path\nrun_root=Path("+repr(str(w))+")\n"+(w/'bin/blender_scene.py').read_text()+"\nresult=run_pass("+repr(arg)+")"
    with (w/'client.log').open('a') as log:
        async with stdio_client(p,errlog=log) as (rd,wr):
            async with ClientSession(rd,wr) as s:
                await s.initialize()
                listing=await s.list_tools()
                assert 'execute_blender_code' in [x.name for x in listing.tools]
                res=await s.call_tool('execute_blender_code',{'code':code},read_timeout_seconds=datetime.timedelta(seconds=145))
                blocks=[json.loads(x.text) if x.type=='text' else x.type for x in res.content]
                with (w/'image2blender-runs/s07_banks/mcp-log.jsonl').open('a') as f: f.write(json.dumps({'step':sys.argv[1],'results':blocks})+'\n')
                print(json.dumps(blocks)[:1600])
                if res.isError or any(isinstance(x,dict) and x.get('status') not in ('ok','success') for x in blocks):raise SystemExit(1)
asyncio.run(main())
