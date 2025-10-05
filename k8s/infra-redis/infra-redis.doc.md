# Redis Database Configuration Help

## Overview
This directory contains Kubernetes manifests for a Redis database instance.

## Files
- `redis-deployment.yaml` - Redis pod configuration
- `redis-service.yaml` - Network access to Redis

## Key Configuration Details

### Database Settings
- **Password**: redis
- **Port**: 6379
- **Version**: Redis 7 (Alpine Linux)
- **Persistence**: AOF (Append Only File) enabled

### Resource Limits
- **Memory Request**: 128Mi
- **Memory Limit**: 256Mi
- **CPU Request**: 50m
- **CPU Limit**: 200m

### Health Checks
- **Liveness Probe**: redis-cli ping
- **Readiness Probe**: redis-cli ping
- **Initial Delay**: 30s (liveness), 5s (readiness)

### Storage
- Uses `PersistentVolumeClaim` (data persists across restarts)
- **Storage Size**: 5Gi
- **Access Mode**: ReadWriteOnce (single node)
- **Storage Class**: local-path
- AOF persistence enabled for data durability

## Connection Details
- **Internal Service**: infra-redis:6379
- **Local Access**: localhost:6379 (via port-forward)
- **Connection String**: redis://:redis@infra-redis:6379

## Common Commands

### Connect to Redis
```bash
# Via port-forward
redis-cli -h localhost -p 6379 -a redis

# From within cluster
kubectl exec -it deployment/infra-redis -- redis-cli -a redis
```

### Check Redis Status
```bash
kubectl get pods -l app=infra-redis
kubectl logs deployment/infra-redis
```

### Redis Commands
```bash
# Test connection
redis-cli -h localhost -p 6379 -a redis ping

# Set a key
redis-cli -h localhost -p 6379 -a redis set mykey "Hello Redis"

# Get a key
redis-cli -h localhost -p 6379 -a redis get mykey

# List all keys
redis-cli -h localhost -p 6379 -a redis keys *
```

## Persistent Volume Management

### Check PVC Status
```bash
kubectl get pvc redis-pvc
kubectl describe pvc redis-pvc
```

### Check Storage Usage
```bash
kubectl exec -it deployment/infra-redis -- df -h /data
```

### Backup Redis Data
```bash
# Create backup
kubectl exec -it deployment/infra-redis -- redis-cli -a redis --rdb /data/backup.rdb

# List keys
kubectl exec -it deployment/infra-redis -- redis-cli -a redis keys "*"
```

## Security Notes
- Default password is for development only
- Use Kubernetes secrets for production
- Consider enabling Redis AUTH for production
- Redis data persists across pod restarts (AOF + PVC)
- PVC provides additional data durability beyond AOF
