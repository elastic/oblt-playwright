source .env

for file in ./test-results/*.json; do
    curl -XPOST "$ELASTIC_ES/$ELASTIC_INDEX/_doc/?pretty" -H "Authorization: $API_KEY" -H "Content-Type: application/json" --data-binary "@$file"
done