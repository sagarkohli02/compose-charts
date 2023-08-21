import os
import redis
import argparse

# get Redis connection details from environment variables
redis_host = os.environ.get("REDIS_HOST", "localhost")
redis_port = os.environ.get("REDIS_PORT", "6379")
redis_db = os.environ.get("REDIS_DB", "0")

# create a Redis client
r = redis.Redis(host=redis_host, port=redis_port, db=redis_db)

# define command-line arguments
parser = argparse.ArgumentParser(
    description="Monitors a directory for file creation events and sends notifications to a Redis channel."
)
parser.add_argument("dir_path", help="The path to the directory to monitor.")
parser.add_argument(
    "redis_channel", help="The Redis channel name to send notifications to."
)

# parse command-line arguments
args = parser.parse_args()

# specify the directory to monitor
dir_path = args.dir_path


# define a function to handle file creation events
def handle_event(event):
    filename = event.src_path.split("/")[-1]
    # filepath = os.path.join(dir_path, filename)
    r.mset({"Croatia": "Zagreb", "Bahamas": "Nassau"})
    # r.publish(args.redis_channel, filepath)


# create a watchdog observer
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class MyHandler(FileSystemEventHandler):
    def on_created(self, event):
        handle_event(event)

    def on_deleted(self, event):
        print("cdsaddd", event)


observer = Observer()
observer.schedule(MyHandler(), dir_path)

# start the observer
observer.start()

# # run the observer indefinitely
# import time
# while True:
#     time.sleep(1)

# block until the observer is stopped
try:
    while observer.is_alive():
        observer.join(10)
        print("sagar")
except KeyboardInterrupt:
    observer.stop()

# clean up the observer
observer.join()
