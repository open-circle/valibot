import jscodeshift, { type Transform } from 'jscodeshift';
import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

const ALLOWED_EXTENSIONS = ['.ts', '.tsx'];
export type ElementFrom<T extends unknown[]> = T[number];

export function defineTests(transform: Transform, selectedTests?: string[]) {
  const testFixturesPath = path.join(process.cwd(), '__testfixtures__');
  const testsFromDir = fs.readdirSync(testFixturesPath);
  if (typeof selectedTests === 'undefined') {
    selectedTests = testsFromDir;
  } else {
    const testsFromDirSt = new Set(testsFromDir);
    const selectedTestsInDir: string[] = [];
    for (const selectedTest of selectedTests) {
      if (!testsFromDirSt.has(selectedTest)) {
        console.warn(
          `Test "${selectedTest}" was not found in the test directory`
        );
        continue;
      }
      selectedTestsInDir.push(selectedTest);
    }
    selectedTests = selectedTestsInDir;
  }
  for (const selectedTest of selectedTests) {
    const testPath = path.join(testFixturesPath, selectedTest);
    const testFiles = fs.readdirSync(testPath);
    if (testFiles.length === 0) {
      console.error(`No test files found for "${selectedTest}" test`);
      continue;
    }
    let inputFile = '';
    let outputFile = '';
    for (const testFile of testFiles) {
      if (testFile.startsWith('input') && inputFile === '') {
        inputFile = testFile;
      }
      if (testFile.startsWith('output') && outputFile === '') {
        outputFile = testFile;
      }
      if (inputFile !== '' && outputFile !== '') {
        break;
      }
    }
    if (inputFile === '' || outputFile === '') {
      console.error(`Invalid test file structure for "${selectedTest}" test`);
      continue;
    }
    const inputFileExt = path.extname(inputFile);
    if (!ALLOWED_EXTENSIONS.includes(inputFileExt)) {
      console.error(`Invalid input file extension for "${selectedTest}" test`);
      continue;
    }
    const j = jscodeshift.withParser(inputFileExt.slice(1));
    const source = fs.readFileSync(path.join(testPath, inputFile), 'utf8');
    const expectedOutput = fs.readFileSync(
      path.join(testPath, outputFile),
      'utf8'
    );
    test(selectedTest, async () => {
      const output = await transform(
        { path: inputFile, source },
        { j, jscodeshift: j, stats: () => {}, report: () => {} },
        {}
      );
      fs.writeFile(
        path.join(testPath, '_actual.ts'),
        output?.trim() ?? '',
        () => {}
      );
      expect(output?.trim()).toBe(expectedOutput.trim());
    });
  }
}

export function getIsTypeFn<T extends string[]>(
  allowedValues: readonly [...T]
): (arg: string) => arg is T[number] {
  const st = new Set<string>(allowedValues);
  return (arg: string): arg is T[number] => st.has(arg);
}

export function assertNever(x: never): never {
  throw new Error(`this should be unreachable. received: ${x}`);
}
