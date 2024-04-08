#!/bin/bash
sed -e "s/tagVersion/$1/" jenkins-script-prod/kubectl/ip-service-production.yaml > jenkins-script-prod/kubectl/ip-service-app-pod.yaml
