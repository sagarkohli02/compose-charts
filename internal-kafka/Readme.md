kafka-topics --create --bootstrap-server kafka-broker:9092 --topic test-topic --replication-factor 3 --partitions 3


producer
======
kafka-console-producer --broker-list kafka-broker:9092 --topic test-topic

consumer
==========
kafka-console-consumer --bootstrap-server kafka-broker:9092 --topic test-topic --from-beginning


