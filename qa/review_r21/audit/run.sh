set -u
cd /home/user/wt/s04p && timeout 1500 node /home/user/rainbow-/tools/lead21/audit_screen.mjs /home/user/rainbow-/qa/review_r21/audit/04 04 "$(cat /home/user/rainbow-/qa/review_r21/audit/QUERY_04.txt)" > /home/user/rainbow-/qa/review_r21/audit/04.log 2>&1
cd /home/user/wt/a05 && timeout 1500 node /home/user/rainbow-/tools/lead21/audit_screen.mjs /home/user/rainbow-/qa/review_r21/audit/05 05 "$(cat /home/user/rainbow-/qa/review_r21/audit/QUERY_05.txt)" > /home/user/rainbow-/qa/review_r21/audit/05.log 2>&1
cd /home/user/wt/a06 && timeout 1500 node /home/user/rainbow-/tools/lead21/audit_screen.mjs /home/user/rainbow-/qa/review_r21/audit/06 06 "$(cat /home/user/rainbow-/qa/review_r21/audit/QUERY_06.txt)" > /home/user/rainbow-/qa/review_r21/audit/06.log 2>&1
cd /home/user/wt/a07 && timeout 1500 node /home/user/rainbow-/tools/lead21/audit_screen.mjs /home/user/rainbow-/qa/review_r21/audit/07 07 "$(cat /home/user/rainbow-/qa/review_r21/audit/QUERY_07.txt)" > /home/user/rainbow-/qa/review_r21/audit/07.log 2>&1
cd /home/user/wt/a08 && timeout 1500 node /home/user/rainbow-/tools/lead21/audit_screen.mjs /home/user/rainbow-/qa/review_r21/audit/08 08 "$(cat /home/user/rainbow-/qa/review_r21/audit/QUERY_08.txt)" > /home/user/rainbow-/qa/review_r21/audit/08.log 2>&1
echo AUDIT-DONE > /home/user/rainbow-/qa/review_r21/audit/done.flag
