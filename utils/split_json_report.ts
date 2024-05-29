require('dotenv').config();
const fs = require('fs');
const path = require('path');

const inputFilePath = process.env.REPORT_FILE;
const rawData = fs.readFileSync(inputFilePath);
const jsonData = JSON.parse(rawData);
const testSuites = jsonData.suites;
const outputDirectory = path.dirname(inputFilePath);
const currentDate = new Date().toISOString().replace(/:/g, '_').split('.')[0] + 'Z';

testSuites.forEach(suite => {
  suite.specs.forEach((spec) => {
    spec.tests.forEach(test => {
        test.results.forEach(result => {
            let stepData = {};
            (result.steps || []).forEach(step => {
                stepData[step.title] = step.duration;
            });
            const jsonData = {
              title: spec.title,
              startTime: result.startTime,
              status: result.status,
              duration: result.duration,
              ...stepData,
              workerIndex: result.workerIndex,
              retry: result.retry,
              errors: result.errors,
              timeout: test.timeout,
              stdout: result.stdout,
            };
            const fileName = `${currentDate}_${spec.title.replace(/\s/g, "_").toLowerCase()}.json`;
            const outputPath = path.join(outputDirectory, fileName);
            fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
            console.log(`File "${fileName}" has been created successfully.`);
      });
    });
  });
});