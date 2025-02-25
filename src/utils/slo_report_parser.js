import { REPORT_FILE } from '../../src/env.ts';
const fs = require('fs');
const path = require('path');

const inputFilePath = REPORT_FILE;
const rawData = fs.readFileSync(inputFilePath);
const jsonData = JSON.parse(rawData);
const testSuites = jsonData.suites;
const outputDirectory = path.dirname(inputFilePath);
const currentDate = Date.now();
const stepName = /^From.*/;

testSuites.forEach(suite => {
  suite.specs.forEach((spec) => {
    spec.tests.forEach(test => {
        test.results.forEach(result => {
            (result.steps || []).forEach(step => {  
                if (stepName.test(step.title)) {
                    const resultData = {
                        date: currentDate,
                        transformDuration: step.duration,
                        title: spec.title,
                        step: step.title
                    };
                    const fileName = `perf_test_${spec.title}_${step.title}_${currentDate}.json`;
                    const outputPath = path.join(outputDirectory, fileName);
                    fs.writeFileSync(outputPath, JSON.stringify(resultData, null, 2));
                    console.log(`File "${fileName}" has been created successfully.`);
                };
            });
        });
    });
  });
});
