# Kubernetes Concepts Documentation

## Overview

This document explains the key Kubernetes concepts used in this microservices project.

## Core Concepts

### Deployment

**Purpose**: Manages application pods and ensures desired state

- **Replicas**: Number of identical pods to run
- **Rolling Updates**: Zero-downtime deployments
- **Self-Healing**: Automatically restarts failed pods
- **Scaling**: Can increase/decrease pod count

**Example**: `app-hello-world-deployment.yaml`

```yaml
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app-hello-world
```

### Service

**Purpose**: Provides stable network access to pods

- **ClusterIP**: Internal cluster access only
- **NodePort**: Exposes service on node's IP
- **LoadBalancer**: External load balancer
- **DNS**: Other services can reach via service name

**Example**: `app-hello-world-service.yaml`

```yaml
spec:
  selector:
    app: app-hello-world
  ports:
    - port: 3000
      targetPort: 3000
```

### PersistentVolumeClaim (PVC)

**Purpose**: Requests storage for applications

- **Storage Size**: Amount of storage needed
- **Access Mode**: How storage can be accessed
- **Storage Class**: Type of storage (local-path, SSD, etc.)
- **Persistence**: Data survives pod restarts

**Example**: `postgres-pvc.yaml`

```yaml
spec:
  resources:
    requests:
      storage: 10Gi
  accessModes:
    - ReadWriteOnce
```

### ConfigMap

**Purpose**: Stores configuration data

- **Non-sensitive**: Configuration files, environment variables
- **Mountable**: Can be mounted as volumes
- **Updatable**: Changes can be applied without rebuilding images

**Example**: `mon-prometheus-configmap.yaml`

```yaml
data:
  prometheus.yml: |
    scrape_configs:
      - job_name: 'app-hello-world'
```

### Secret

**Purpose**: Stores sensitive data

- **Encrypted**: Base64 encoded (not secure, just obfuscated)
- **Types**: Opaque, TLS, Docker registry
- **Usage**: Passwords, API keys, certificates

**Example**: `app-hello-world-secret.yaml`

```yaml
data:
  AWS_ACCESS_KEY_ID: <base64-encoded>
  AWS_SECRET_ACCESS_KEY: <base64-encoded>
```

## Resource Types in This Project

### Application Services

- **app-hello-world**: Main application service
- **app-auth**: Authentication microservice

### Infrastructure Services

- **infra-postgres**: PostgreSQL database
- **infra-redis**: Redis cache/session store

### Monitoring Services

- **mon-prometheus**: Metrics collection
- **mon-grafana**: Visualization dashboards
- **mon-localstack**: Local AWS services

## Common Patterns

### Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
```

### Resource Limits

```yaml
resources:
  requests:
    memory: '256Mi'
    cpu: '100m'
  limits:
    memory: '512Mi'
    cpu: '500m'
```

### Environment Variables

```yaml
env:
  - name: DATABASE_URL
    value: 'postgresql://user:pass@host:5432/db'
  - name: SECRET_KEY
    valueFrom:
      secretKeyRef:
        name: app-secret
        key: secret-key
```

## Networking

### Internal Communication

- Services communicate via DNS names
- Example: `app-auth` connects to `infra-postgres:5432`
- Port forwarding for local access: `kubectl port-forward svc/app-auth 3001:3001`

### Service Discovery

- Kubernetes provides DNS for service names
- No need for hardcoded IPs
- Automatic load balancing

## Storage

### Volume Types

- **PersistentVolumeClaim**: Long-term storage
- **ConfigMap**: Configuration files
- **Secret**: Sensitive data
- **EmptyDir**: Temporary storage

### Data Persistence

- PVC data survives pod restarts
- ConfigMaps and Secrets are mounted as volumes
- Database data persists across deployments

## Common Commands

### Check Resources

```bash
kubectl get pods
kubectl get services
kubectl get pvc
kubectl get configmaps
```

### View Logs

```bash
kubectl logs deployment/app-hello-world
kubectl logs -f deployment/app-auth
```

### Port Forwarding

```bash
kubectl port-forward svc/app-hello-world 3000:3000
kubectl port-forward svc/mon-prometheus 9090:9090
```

### Execute Commands

```bash
kubectl exec -it deployment/infra-postgres -- psql -U postgres
kubectl exec -it deployment/infra-redis -- redis-cli -a redis
```

## Best Practices

### Labels and Selectors

- Use consistent labeling strategy
- Labels enable service discovery
- Selectors match pods to services

### Resource Management

- Set appropriate CPU/memory limits
- Use requests for scheduling decisions
- Monitor resource usage

### Security

- Use Secrets for sensitive data
- Implement proper RBAC
- Regular security updates

### Monitoring

- Health checks for all services
- Metrics endpoints for monitoring
- Log aggregation and analysis
