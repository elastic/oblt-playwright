#!/bin/bash

### Place this script in the root elasticdump directory.
### INPUT_PATH must contain directories, each corresponds to a specific index.
### sudo bash ./export_all.sh /mnt/disks/<disk_name>/<indices_directory> https://testing-internal:<password>@<elasticsearch_instance>

INPUT_PATH=$1
OUTPUT_PATH=$2

EXPORT_SCRIPT="export.sh"
CONCURRENCY=8

process_index() {
    local index_dir=$1
    local index_name="${index_dir##*/}"
    sudo bash "${EXPORT_SCRIPT}" "$index_dir" "$index_name" "${OUTPUT_PATH}" > "export_log.txt" 2>&1
}

export -f process_index
export EXPORT_SCRIPT INPUT_PATH OUTPUT_PATH

find "$INPUT_PATH" -mindepth 1 -maxdepth 1 -type d | while read -r index_dir; do
    ((i=i%CONCURRENCY)); ((i++==0)) && wait
    process_index "$index_dir" &
done

wait