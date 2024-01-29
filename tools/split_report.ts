require('dotenv').config();
const fs = require('fs');
const path = require('path');

const reportFile = process.env.REPORT_FILE;
const inputFilePath = reportFile;
const rawData = fs.readFileSync(inputFilePath);
const jsonData = JSON.parse(rawData);

// Extract "suites" array.
const testSuites = jsonData.suites;

// Return the flatten structure.
const flattenTestResult = (spec, test) => {
  return {
    title: spec.title,
    status: test.status,
    timeout: test.timeout,
    ...test.results[0],  // Properties from "results" array.
  };
};

const outputDirectory = path.dirname(inputFilePath);
const currentDate = new Date().toISOString().replace(/:/g, '_').split('.')[0] + 'Z';

testSuites.forEach((suite) => {
  suite.specs.forEach((spec) => {
    spec.tests.forEach((test) => {
      // Create a new JSON object for each "test" array.
      const flattenedTestResult = flattenTestResult(spec, test);

      const fileName = `${currentDate} - ${spec.title}.json`;
      const outputPath = path.join(outputDirectory, fileName);

      fs.writeFileSync(outputPath, JSON.stringify(flattenedTestResult, null, 2));
      console.log(`File ${fileName} created successfully.`);
    });
  });
});