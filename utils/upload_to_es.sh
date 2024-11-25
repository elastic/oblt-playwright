#!/bin/bash

REPORT_DIR=/home/runner/work/oblt-playwright/
FILES=$(find "$REPORT_DIR" -type f -name "perf_test_*")
for file in $FILES; do
    echo "Found file: $file"
    curl -XPOST "$REPORTING_CLUSTER_ES/$REPORTING_CLUSTER_INDEX/_doc/?pretty" -H "Authorization: $REPORTING_CLUSTER_API_KEY" -H "Content-Type: application/json" --data-binary "@$file"
done
