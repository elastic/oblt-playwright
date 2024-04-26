require('dotenv').config();
const fs = require('fs');
const path = require('path');

const reportFile = process.env.REPORT_FILE;
const inputFilePath = reportFile;
const rawData = fs.readFileSync(inputFilePath);
const jsonData = JSON.parse(rawData);
const testSuites = jsonData.suites;
const outputDirectory = path.dirname(inputFilePath);
const currentDate = Date.now();
const stepName = "Poll SLO indices.";


testSuites.forEach(suite => {
  suite.specs.forEach((spec) => {
    spec.tests.forEach(test => {
        test.results.forEach(result => {
            let stepValue;
            let testName;
            result.steps.forEach(step => {
                if (step.title === stepName) {
                    stepValue = step.duration;
                    testName = spec.title;
                };
            });
            const resultData = {
                date: currentDate,
                transformDuration: stepValue,
                title: testName
            };
            const fileName = `perf_test_${testName}_${currentDate}.json`;
            const outputPath = path.join(outputDirectory, fileName);
            fs.writeFileSync(outputPath, JSON.stringify(resultData, null, 2));
            console.log(`File "${fileName}" has been created successfully.`);
        });
    });
  });
});
