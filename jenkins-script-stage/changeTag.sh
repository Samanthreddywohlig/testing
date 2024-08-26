#!/bin/bash

# Enable debug mode to print each command before execution
set -x

# Check if the script received the required argument
if [ -z "$1" ]; then
    echo "Error: No tag version provided."
    echo "Usage: $0 <tagVersion>"
    exit 1
fi

TAG_VERSION="$1"
YAML_FILE="jenkins-script-stage/kubectl/ip-service-stage.yaml"

# Verify if the YAML file exists
if [ ! -f "$YAML_FILE" ]; then
    echo "Error: YAML file '$YAML_FILE' not found."
    exit 1
fi

# Update the YAML file with the provided tag version
sed -i "s/tagVersion/$TAG_VERSION/" "$YAML_FILE"

# Check if the sed command was successful
if [ $? -eq 0 ]; then
    echo "YAML file updated successfully."
else
    echo "Error: Failed to update YAML file."
    exit 1
fi

# Display the updated YAML file content
echo "Updated YAML file:"
cat "$YAML_FILE"
