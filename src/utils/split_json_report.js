require('dotenv').config();
const fs = require('fs');
const path = require('path');

const inputFilePath = process.env.REPORT_FILE;
const rawData = fs.readFileSync(inputFilePath);
const jsonData = JSON.parse(rawData);
const testSuites = jsonData.suites;
const outputDirectory = path.dirname(inputFilePath);
const currentDate = new Date().toISOString().replace(/:/g, '_').split('.')[0] + 'Z';

async function fetchClusterData() {
  const jsonDataCluster = await fetch(`${process.env.ELASTICSEARCH_HOST}`, {
    method: 'GET',
    headers: {
      "accept": "*/*",
        "Authorization": process.env.API_KEY,
        "kbn-xsrf": "reporting"
    }
  }).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.text();
  }).then(json => {
    return JSON.parse(json);
  });
  return jsonDataCluster;
}

async function parse() {
  let build_flavor;
  let cluster_name;
  let versionNumber;

  await fetchClusterData().then(data => {
    build_flavor = data.version.build_flavor;
    cluster_name = data.cluster_name;
    versionNumber = data.version.number;
  });

  testSuites.forEach(suite => {
    suite.specs.forEach((spec) => {
      spec.tests.forEach(test => {
          test.results.forEach(result => {
              let stepData = {};
              let errorData = {};
              
              (result.steps || []).forEach(step => {
                  stepData[step.title] = step.duration;
              });
              (result.errors || []).forEach(error => {
                  errorData.error = (error.message.match(/:(\s*[\w\s]+)(?=\s|$|[^a-zA-Z0-9])/) || [])[1]?.trim();
              });
              
              const jsonData = {
                    title: spec.title,
                    startTime: result.startTime,
                    period: `Last ${process.env.TIME_VALUE} ${process.env.TIME_UNIT}`,
                    status: result.status,
                    duration: result.duration,
                    ...stepData,
                    workerIndex: result.workerIndex,
                    retry: result.retry,
                    ...errorData,
                    errorData: result.error,
                    timeout: test.timeout,
                    cluster_name: cluster_name,
                    version: versionNumber,
                    build_flavor: build_flavor,
                    ccs_range: process.env.RANGE
                  };
              const fileName = `${currentDate}_${spec.title.replace(/\s/g, "_").toLowerCase()}.json`;
              const outputPath = path.join(outputDirectory, fileName);
              fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
              console.log(`File "${fileName}" has been created successfully.`);
            });
      });
    });
  });
}

parse();