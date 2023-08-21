#### To start watcher for folders
./cicd.sh /home/boxes-user/opstra-scrap/samco/op/banknifty/2023-04* /home/boxes-user/opstra-scrap/samco/op/banknifty/2023-03* -h opstra-redis -p 6379 -d 0

#### To stop dockers with specific names

./stop_containers.sh -n "expiry-file-watcher-2023-03*"

./stop_containers.sh -n "expiry-file-watcher-2023-05-*" -n "expiry-file-watcher-2023-03-*"
