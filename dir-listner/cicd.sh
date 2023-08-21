#!/bin/bash

# set the major version number and image name
MAJOR_VERSION=2
IMAGE=expiry-file-watcher
NETWORK_NAME=opstra-network

# parse command-line arguments
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -h|--redis-host)
    REDIS_HOST="$2"
    shift # past argument
    shift # past value
    ;;
    -p|--redis-port)
    REDIS_PORT="$2"
    shift # past argument
    shift # past value
    ;;
    -d|--redis-db)
    REDIS_DB="$2"
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    DIR_PATHS+=("$1")
    shift # past argument
    ;;
esac
done

# function to create Docker network if it doesn't exist
create_network() {
  # create the Docker network if it doesn't exist
  if ! docker network ls | grep -q ${NETWORK_NAME}; then
    echo "Creating Docker network '${NETWORK_NAME}'"
    docker network create ${NETWORK_NAME}
  else
    echo "Docker network '${NETWORK_NAME}' already exists"
  fi
}
create_network 

# loop through the directory paths and convert any relative paths to absolute paths
convert_to_absolute_paths() {
  for DIR_PATH in "${DIR_PATHS[@]}"
  do
    # check if DIR_PATH contains a wildcard
    if [[ "$DIR_PATH" == *"**"* ]]
    then
      # use find to get a list of directories matching the wildcard
      IFS=$'\n' read -d '' -r -a DIR_PATHS_MATCH <<< "$(find $(dirname $DIR_PATH) -name $(basename $DIR_PATH) -type d)"
      # append the matching directories to DIR_PATHS_ABS
      for MATCH in "${DIR_PATHS_MATCH[@]}"
      do
        DIR_PATHS_ABS+=("$MATCH")
        DIR_NAMES+=("$(basename $MATCH)")
      done
    else
      # convert the directory path to an absolute path
      if [[ "$DIR_PATH" != /* ]]
      then
        DIR_PATH="$(pwd)/$DIR_PATH"
      fi
      DIR_NAME=$(basename "$DIR_PATH")
      DIR_PATHS_ABS+=("$DIR_PATH")
      DIR_NAMES+=("$DIR_NAME")
    fi
  done
}
convert_to_absolute_paths

calculate_new_image_version() {
  # get the minor version number of the most recent container for this directory path
  OLD_VERSION=$(docker images --format "{{.Tag}}" $IMAGE:$MAJOR_VERSION* | sort -r -V | head -n1| sed "s/2.//")
  # OLD_VERSION=$(docker ps -a --format "{{.Names}}" | grep "^$IMAGE-$DIR_NAME-" | sort -r | head -n1 | sed "s/$IMAGE-$DIR_NAME-//")
  if [ -z "$OLD_VERSION" ]
  then
      OLD_VERSION=0
  fi

  # calculate the new minor version number
  NEW_VERSION=$(($OLD_VERSION + 1))
}
calculate_new_image_version

# check if the Docker image with the same tag already exists, and if not, build it
if docker images -q $IMAGE:$MAJOR_VERSION.$NEW_VERSION > /dev/null;
then
  # build the Docker image with the new version number
  echo "Docker image '$IMAGE:$MAJOR_VERSION.$NEW_VERSION' does not exist, creating build"

  LAST_MODIFIED=$(stat -c %Y script.py)
  docker build -t $IMAGE:$MAJOR_VERSION.$NEW_VERSION --build-arg LAST_MODIFIED=$LAST_MODIFIED .
else
  echo "Docker image '$IMAGE:$MAJOR_VERSION.$NEW_VERSION' already exists, skipping build"
fi

# loop through the directory paths and spin up a new Docker container for each one
for i in "${!DIR_PATHS_ABS[@]}"
do
    DIR_PATH="${DIR_PATHS_ABS[$i]}"
    DIR_NAME="${DIR_NAMES[$i]}"

    # run the Docker container with the new version number for this directory path
    echo "Running command docker run -d --user $(id -u):$(id -g) --network $NETWORK_NAME --memory 30m -v $DIR_PATH:/app/directory -e REDIS_HOST=$REDIS_HOST -e REDIS_PORT=$REDIS_PORT -e REDIS_DB=$REDIS_DB -e REDIS_CHANNEL=$DIR_NAME --name $IMAGE-$DIR_NAME-$NEW_VERSION $IMAGE:$MAJOR_VERSION.$NEW_VERSION /app/directory $DIR_NAME"
    docker run -d --user $(id -u):$(id -g) --network $NETWORK_NAME --memory 30m -v $DIR_PATH:/app/directory -e REDIS_HOST=$REDIS_HOST -e REDIS_PORT=$REDIS_PORT -e REDIS_DB=$REDIS_DB -e REDIS_CHANNEL=$DIR_NAME --name $IMAGE-$DIR_NAME-$NEW_VERSION $IMAGE:$MAJOR_VERSION.$NEW_VERSION /app/directory $DIR_NAME
    
    # check if a container with the same name is already running and stop and remove it
    OLD_CONTAINER=$IMAGE-$DIR_NAME-$OLD_VERSION
    if [ "$(docker ps -a --format "{{.Names}}" | grep "^$OLD_CONTAINER$")" ]
    then
        if [ "$(docker ps --format "{{.Names}}" | grep "^$OLD_CONTAINER$")" ]
        then
            docker stop $OLD_CONTAINER
        fi
        docker rm $OLD_CONTAINER
    fi
done