#### to make rabbit up
docker compose -f rabbit-mq.yaml up
docker compose -f rabbit-mq.yaml up rabbitmq

#### more about rabbit mq
https://www.section.io/engineering-education/dockerize-a-rabbitmq-instance/

#### ssh into running container
docker compose -f rabbit-mq.yaml exec rabbitmq /bin/sh