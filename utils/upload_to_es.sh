for file in /home/runner/work/oblt-playwright/perf_test_*.json; do
    echo "Found file: $file"
    curl -XPOST "$ELASTICSEARCH_HOST/$REPORTING_CLUSTER_INDEX/_doc/?pretty" -H "Authorization: $REPORTING_CLUSTER_API_KEY" -H "Content-Type: application/json" --data-binary "@$file"
done
