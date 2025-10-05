# LocalStack Service Help

## What's in this directory?
This directory contains Kubernetes manifests for LocalStack (local AWS services simulator).

## Files:
- `localstack-deployment.yaml`: Runs LocalStack container
- `localstack-service.yaml`: Exposes LocalStack to other services

## What is LocalStack?
LocalStack provides local AWS services for development:
- SNS (Simple Notification Service)
- SQS (Simple Queue Service)
- S3 (Simple Storage Service)
- Lambda, DynamoDB, and more

## Configuration:
- **SERVICES**: Only enables SNS (saves resources)
- **DEBUG**: Enables debug logging
- **Port 4566**: Main LocalStack API endpoint

## How your app uses it:
1. Your app connects to mon-localstack:4566
2. Publishes SNS messages to LocalStack
3. LocalStack simulates AWS SNS behavior
4. No real AWS credentials needed

## Benefits:
- Test AWS integrations locally
- No AWS costs during development
- Faster development cycle
- Offline development capability

## Common commands:
```bash
# Create SNS topic
awslocal sns create-topic --name my-topic

# List topics
awslocal sns list-topics

# Publish message
awslocal sns publish --topic-arn arn:aws:sns:us-east-1:000000000000:my-topic --message "Hello"
```
