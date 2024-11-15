const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const startDate = new Date('1970-01-01');
const endDate = new Date('1970-12-31');

// Ensure disk has space equivalent to the target index size.
const dirPath = path.join(__dirname, '<index_directory>');

const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(dirPath, file));

function randomDate(start, end) {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString();
}

function updateTimestamps(obj, startDate, endDate) {
    let modified = false;

    function recursiveUpdate(obj) {
        if (typeof obj !== 'object' || obj === null) return;
        for (const key in obj) {
            if (key === '@timestamp' && typeof obj[key] === 'string') {
                obj[key] = randomDate(startDate, endDate);
                modified = true;
            } else if (typeof obj[key] === 'object') {
                recursiveUpdate(obj[key]);
            }
        }
    }
    recursiveUpdate(obj);
    return modified;
}

async function processFile(filePath, startDate, endDate) {
    const tempFilePath = `${filePath}.tmp`;
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(tempFilePath);

    const rl = readline.createInterface({ input: readStream });
    let modified = false;

    for await (const line of rl) {
        if (line.trim()) {
            try {
                const jsonObject = JSON.parse(line);
                if (updateTimestamps(jsonObject, startDate, endDate, filePath)) {
                    modified = true;
                }
                writeStream.write(JSON.stringify(jsonObject) + '\n');
            } catch (error) {
                console.error("Error parsing JSON:", error);
                writeStream.write(line + '\n');
            }
        } else {
            writeStream.write(line + '\n');
        }
    }

    writeStream.end();
    await new Promise((resolve) => writeStream.on('finish', resolve));

    if (modified) {
        fs.renameSync(tempFilePath, filePath);
        parentPort.postMessage(`File processed and modified: ${filePath}`);
    } else {
        fs.unlinkSync(tempFilePath);
        parentPort.postMessage(`File processed but no @timestamp fields found: ${filePath}`);
    }
}

if (isMainThread) {
    async function processFiles(files, startDate, endDate, numWorkers = 8) {
        let fileIndex = 0;
    
        const runWorker = () => {
            if (fileIndex >= files.length) return Promise.resolve();
    
            const filePath = files[fileIndex++];
            return new Promise((resolve, reject) => {
                const worker = new Worker(__filename, {
                    workerData: { filePath, startDate, endDate },
                });
    
                worker.on('message', (message) => {
                    console.log(message);
                    resolve();
                });
    
                worker.on('error', (error) => {
                    console.error(`Error in worker: ${error}`);
                    resolve();
                });
    
                worker.on('exit', (code) => {
                    if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
                    resolve();
                });
            }).then(runWorker);
        };
    
        await Promise.all(Array.from({ length: numWorkers }).map(runWorker));
        console.log("All files processed.");
    }

    processFiles(files, startDate, endDate);

} else {
    const { filePath, startDate, endDate } = workerData;
    if (filePath && typeof filePath === 'string') {
        processFile(filePath, new Date(startDate), new Date(endDate));
    } else {
        console.error("Invalid file path provided to worker.");
    }
}
