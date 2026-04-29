#!/bin/bash

REPORT_DIR="${REPORT_DIR:-/home/runner/work/oblt-playwright/}"
REPORT_CLUSTER_ES=${REPORT_CLUSTER_ES%/}

FILES=$(find "$REPORT_DIR" -type f -name "20*.json" ! -name "*.network-trace.json" ! -name "results.json" ! -name "package.json" ! -name "package-lock.json")
for file in $FILES; do
    echo "Found file: $file"
    curl -XPOST "$REPORT_CLUSTER_ES/oblt-playwright/_doc/?pretty" -H "Authorization: ApiKey $REPORT_CLUSTER_API_KEY" -H "Content-Type: application/json" --data-binary "@$file"
done

TRACE_FILES=$(find "$REPORT_DIR" -type f -name "*.network-trace.json")
for trace_file in $TRACE_FILES; do
    echo "Found network trace file: $trace_file"
    curl -XPOST "$REPORT_CLUSTER_ES/oblt-playwright-network-traces/_doc/?pretty" -H "Authorization: ApiKey $REPORT_CLUSTER_API_KEY" -H "Content-Type: application/json" --data-binary "@$trace_file"
done

LOG_FILES=$(find "$REPORT_DIR" -type f -name "execution.json.log")
for log_file in $LOG_FILES; do
    echo "Found log file: $log_file"
    curl -XPOST "$REPORT_CLUSTER_ES/playwright-logs/_doc/?pretty" -H "Authorization: ApiKey $REPORT_CLUSTER_API_KEY" -H "Content-Type: application/json" --data-binary "@$log_file"
done