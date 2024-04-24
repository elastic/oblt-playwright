require('dotenv').config();
const fs = require('fs');
const path = require('path');

const reportFile = process.env.REPORT_FILE;
const inputFilePath = reportFile;
const rawData = fs.readFileSync(inputFilePath);
const jsonData = JSON.parse(rawData);
const testSuites = jsonData.suites;
const outputDirectory = path.dirname(inputFilePath);
const currentDate = new Date().toISOString().replace(/:/g, '_').split('.')[0] + 'Z';
const stepName = "Poll SLO indices for a document with certain timestamp.";
let stepValue;
let testName;

testSuites.forEach(suite => {
  suite.specs.forEach((spec) => {
    spec.tests.forEach(test => {
        test.results.forEach(result => {
            (result.steps || []).forEach(step => {
                if (step.title === stepName) {
                    stepValue = step.duration;
                    testName = spec.title
                }
            });
        });
    });
  });
});

const result = {
    date: Date.now(),
    transformDuration: stepValue,
    title: testName
};

const fileName = `${currentDate}_${testName.replace(/\s/g, "_").toLowerCase()}.json`;
const outputPath = path.join(outputDirectory, fileName);
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`File "${fileName}" has been created successfully.`);
