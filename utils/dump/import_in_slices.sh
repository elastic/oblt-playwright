#!/bin/bash

### Place this script in the root elasticdump directory.
### sudo bash ./import_in_slices.sh https://testing-internal:<password>@<elasticsearch_instance> <index_name> /mnt/disks/<disk_name>/<index_directory>

INPUT_PATH=$1
INPUT_INDEX=$2
OUTPUT_PATH=$3

sudo mkdir -p ${OUTPUT_PATH}/${INPUT_INDEX}

for (( i=0; i<=9; i++ ))
do
    OUTPUT_FILE="${INPUT_INDEX}-${i}.json"
    SEARCH_BODY=""{\"slice\": {\"id\": ${i},\"max\": 9}}""
    sudo ./bin/elasticdump --input=${INPUT_PATH} --input-index=${INPUT_INDEX} --output=${OUTPUT_PATH}/${OUTPUT_FILE} --searchBody=${SEARCH_BODY} --type=data>
done
wait