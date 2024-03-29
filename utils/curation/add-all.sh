#!/bin/bash

# Check if filename is provided as argument
if [ $# -eq 0 ]; then
    echo "Usage: $0 <filename>"
    exit 1
fi

filename=$1
command_to_run="python utils/curation/add-comic.py"

# Check if the file exists
if [ ! -f "$filename" ]; then
    echo "File $filename not found!"
    exit 1
fi

# Read each line from the file and execute the command
while IFS= read -r line; do
    $command_to_run "$line" < /dev/tty
done < "$filename"

exit 0
