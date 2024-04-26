for file in ./perf-test-report/*.json; do
    curl -XPOST "$ELASTIC_ES/$ELASTIC_SLO_INDEX/_doc/?pretty" -H "Authorization: $API_KEY" -H "Content-Type: application/json" --data-binary "@$file"
done