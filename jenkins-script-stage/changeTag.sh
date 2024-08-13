#!/bin/bash
set -x
sed -i "s/tagVersion/$1/" jenkins-script-stage/kubectl/ip-service-stage.yaml
echo "Updated YAML file:"
cat jenkins-script-stage/kubectl/ip-service-stage.yaml