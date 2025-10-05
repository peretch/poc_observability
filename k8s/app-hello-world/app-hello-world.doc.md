# Application Service Help

## What's in this directory?
This directory contains Kubernetes manifests for your main application service.

## Files:
- `hello-world-deployment.yaml`: Defines how to run your app
- `hello-world-service.yaml`: Exposes your app to other services

## Key Concepts:

### Deployment
- **Purpose**: Manages your application pods
- **Replicas**: Number of identical pods to run
- **Selector**: Labels to identify which pods belong to this deployment
- **Template**: Defines what each pod should look like

### Service
- **Purpose**: Provides stable network access to your pods
- **Selector**: Routes traffic to pods with matching labels
- **Ports**: Maps external port to internal container port
- **DNS**: Other services can reach you via service name

### Labels
- **Purpose**: Key-value pairs for organizing and selecting resources
- **app: app-hello-world**: Identifies this as your main application
- **Used by**: Services to find pods, Prometheus to discover targets

## How it works:
1. Deployment creates pods running your app
2. Service provides stable DNS name (app-hello-world)
3. Other services connect to app-hello-world:3000
4. Prometheus scrapes metrics from /metrics endpoint

## Next steps:
- Add Prometheus client to your Node.js app
- Expose /metrics endpoint
- Add custom metrics for business logic
