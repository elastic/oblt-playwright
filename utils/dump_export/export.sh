#!/bin/bash

### Place this script in the root elasticdump directory.
### sudo bash ./export.sh /mnt/disks/<disk_name>/<indices_directory> https://testing-internal:<password>@<elasticsearch_instance>

INPUT_PATH=$1
BASE_INDEX_NAME=$2
OUTPUT_PATH=$3

for (( i=0; i<=9; i++ ))
do
	INPUT_FILE="${BASE_INDEX_NAME}-${i}.json"
	sudo ./bin/elasticdump --input=${INPUT_PATH}/${INPUT_FILE} --output=${OUTPUT_PATH}/${BASE_INDEX_NAME} --limit 10000 --noRefresh --esCompress &
done
wait