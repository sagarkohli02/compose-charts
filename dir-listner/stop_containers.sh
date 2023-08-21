#!/bin/bash

# parse command-line arguments
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -n|--name)
    NAME_FILTERS+=("$2")
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    echo "Unknown option: $key"
    exit 1
    ;;
esac
done

# loop through the container names and stop/delete them
for FILTER in "${NAME_FILTERS[@]}"
do
  CONTAINERS=$(docker ps -a --format "{{.Names}}" | grep "$FILTER")
  if [ -z "$CONTAINERS" ]
  then
    echo "No containers found matching $FILTER"
  else
    echo "Stopping/deleting containers matching $FILTER:"
    echo "$CONTAINERS" | xargs docker stop >/dev/null 2>&1
    echo "$CONTAINERS" | xargs docker rm >/dev/null 2>&1
    echo "$CONTAINERS"
  fi
done
