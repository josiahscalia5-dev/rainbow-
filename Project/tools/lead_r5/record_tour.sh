set -u
W=/tmp/claude-0/-home-user-rainbow-/1d643cf4-a037-5022-a0b9-c571467e1f20/scratchpad/wt; C=/tmp/claude-0/-home-user-rainbow-/1d643cf4-a037-5022-a0b9-c571467e1f20/scratchpad/cap; K=/tmp/claude-0/-home-user-rainbow-/1d643cf4-a037-5022-a0b9-c571467e1f20/scratchpad/clips; T=/tmp/claude-0/-home-user-rainbow-/1d643cf4-a037-5022-a0b9-c571467e1f20/scratchpad/tools/rec_tour.mjs
laneA() {
  cd $W/lead && node scripts/capture.mjs --out=$C/default > $C/default.log 2>&1; echo "cap default exit=$?" >> $C/done.txt
  for s in 01 02 03 09 10 11; do cd $W/lead && node $T $s '' $K/$s 5401 5 >> $K/log.txt 2>&1; echo "clip $s done" >> $C/done.txt; done
}
laneB() {
  cd $W/s04 && node scripts/capture.mjs 04 --out=$C/s04 '--q=match04=1' > $C/s04.log 2>&1; echo "cap s04 exit=$?" >> $C/done.txt
  cd $W/s05 && node scripts/capture.mjs 05 --out=$C/s05 '--q=match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1' > $C/s05.log 2>&1; echo "cap s05 exit=$?" >> $C/done.txt
  cd $W/s06 && node scripts/capture.mjs 06 --out=$C/s06 '--q=match06=1' > $C/s06.log 2>&1; echo "cap s06 exit=$?" >> $C/done.txt
  cd $W/s07 && node scripts/capture.mjs 07 --out=$C/s07 '--q=match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1' > $C/s07.log 2>&1; echo "cap s07 exit=$?" >> $C/done.txt
  cd $W/s08b && node scripts/capture.mjs 08 --out=$C/s08b '--q=match08=1' > $C/s08b.log 2>&1; echo "cap s08b exit=$?" >> $C/done.txt
  cd $W/s04 && node $T 04 'match04=1' $K/04 5402 5 >> $K/log.txt 2>&1; echo "clip 04 done" >> $C/done.txt
  cd $W/s05 && node $T 05 'match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1' $K/05 5402 5 >> $K/log.txt 2>&1; echo "clip 05 done" >> $C/done.txt
  cd $W/s06 && node $T 06 'match06=1' $K/06 5402 5 >> $K/log.txt 2>&1; echo "clip 06 done" >> $C/done.txt
  cd $W/s07 && node $T 07 'match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1' $K/07 5402 5 >> $K/log.txt 2>&1; echo "clip 07 done" >> $C/done.txt
  cd $W/s08b && node $T 08 'match08=1' $K/08 5402 5 >> $K/log.txt 2>&1; echo "clip 08 done" >> $C/done.txt
}
laneA & laneB & wait
echo ALLDONE >> $C/done.txt
