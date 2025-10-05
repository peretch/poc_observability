#!/bin/bash

# Deploy using Skaffold
skaffold dev &
SKAFFOLD_PID=$!

# Wait for deployment to finish (you can adjust this based on your deployment time)
sleep 10

# Run your custom script after deployment
./aws-sns-init.sh

# Optionally, clean up or perform other tasks

# Wait for Skaffold to finish
wait $SKAFFOLD_PID
