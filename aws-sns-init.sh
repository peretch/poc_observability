#!/bin/bash

# Step 1: Get pod name for localstack
localstack_pod=$(kubectl get pods -l app=mon-localstack -o jsonpath='{.items[0].metadata.name}')

if [ -z "$localstack_pod" ]; then
  echo "Localstack pod not found."
  exit 1
fi

echo "Localstack pod found: $localstack_pod"

# Step 2: Execute awslocal create topic
topic_name="hello-world-topic"
kubectl exec -it "$localstack_pod" -- awslocal sns create-topic --name "$topic_name"

echo "Topic '$topic_name' created in Localstack."

# Step 3: Publish a message to the SNS topic
message='{"app": "hello-world", "message": "Hello World!"}'
kubectl exec -it "$localstack_pod" -- awslocal sns publish --topic-arn arn:aws:sns:us-east-1:000000000000:$topic_name --message "$message"

echo "Message published to SNS topic '$topic_name'."
