#!/bin/bash

echo "waiting for rabbitmq service"
/app/wait-for-it.sh -t 0 opstra-rabbit-instance:5672
echo "Service is up"

# Define the exchange name
EXCHANGE_NAME="expiry-topic"
echo ">>>>>>>>> $RABBITMQ_DEFAULT_USER"
# Create the topic exchange
rabbitmqadmin --username=$RABBITMQ_DEFAULT_USER --password=$RABBITMQ_DEFAULT_PASS declare exchange name=$EXCHANGE_NAME type=topic

# Read the expiry dates from the CSV file
IFS=$'\n' read -d '' -r -a expiry_dates < <(tail -n +2 /app/utils/expiries.csv)

# Read the symbols from the CSV file
IFS=$'\n' read -d '' -r -a symbols < <(tail -n +2 /app/utils/symbols.csv)

# Loop through each expiry date
for expiry in "${expiry_dates[@]}"; do
  expiry_date=$(echo $expiry | cut -d',' -f1)

  # Loop through each symbol
  for symbol in "${symbols[@]}"; do
    symbol_name=$(echo $symbol | cut -d',' -f1)

    # Define the queue name
    queue_name="${expiry_date}.${symbol_name}"

    # Create the queue
    rabbitmqadmin --username=$RABBITMQ_DEFAULT_USER --password=$RABBITMQ_DEFAULT_PASS declare queue name=$queue_name durable=true

    # Bind the queue to the exchange
    rabbitmqadmin --username=$RABBITMQ_DEFAULT_USER --password=$RABBITMQ_DEFAULT_PASS declare binding source=$EXCHANGE_NAME destination=$queue_name routing_key="$expiry_date.$symbol_name"
  done
done
