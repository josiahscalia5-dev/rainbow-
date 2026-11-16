/** Reuse the game's route validator, keeping this experiment's results separate. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { Course, validateContinuity } from '../src/world/course';

const course = new Course();
const result = validateContinuity(course);
mkdirSync('qa/reference-fit/tests', { recursive: true });
writeFileSync('qa/reference-fit/tests/route.json', JSON.stringify({
  note: 'Numerical validation of the unchanged gameplay route, not an aesthetic water-seam approval.',
  length: course.length, marks: course.marks, ...result,
}, null, 2) + '\n');
console.log(JSON.stringify({ pass: result.ok, boundaries: result.boundaries.length,
  maxStepTangentDeg: result.maxStepTangentDeg, plunge: result.plunge }));
process.exitCode = result.ok ? 0 : 1;
