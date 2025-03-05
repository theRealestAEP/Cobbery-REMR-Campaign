#!/bin/bash

# Remove existing JSON if it exists
rm -f agentFlow_OAI_from_yaml.json

# Convert YAML to JSON using yq
yq -p yaml -o json agentFlow_OAI.yaml >> agentFlow_OAI_from_yaml.json