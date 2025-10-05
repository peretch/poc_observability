# PostgreSQL Database Configuration Help

## Overview
This directory contains Kubernetes manifests for a PostgreSQL database instance.

## Files
- `postgres-deployment.yaml` - PostgreSQL pod configuration
- `postgres-service.yaml` - Network access to PostgreSQL

## Key Configuration Details

### Database Settings
- **Database Name**: microservices_db
- **Username**: postgres
- **Password**: postgres
- **Port**: 5432
- **Version**: PostgreSQL 15 (Alpine Linux)

### Resource Limits
- **Memory Request**: 256Mi
- **Memory Limit**: 512Mi
- **CPU Request**: 100m
- **CPU Limit**: 500m

### Health Checks
- **Liveness Probe**: pg_isready command
- **Readiness Probe**: pg_isready command
- **Initial Delay**: 30s (liveness), 5s (readiness)

### Storage
- Uses `PersistentVolumeClaim` (data persists across restarts)
- **Storage Size**: 10Gi
- **Access Mode**: ReadWriteOnce (single node)
- **Storage Class**: local-path

## Connection Details
- **Internal Service**: infra-postgres:5432
- **Local Access**: localhost:5432 (via port-forward)
- **Connection String**: postgresql://postgres:postgres@infra-postgres:5432/microservices_db

## Common Commands

### Connect to Database
```bash
# Via port-forward
psql -h localhost -p 5432 -U postgres -d microservices_db

# From within cluster
kubectl exec -it deployment/infra-postgres -- psql -U postgres -d microservices_db
```

### Check Database Status
```bash
kubectl get pods -l app=infra-postgres
kubectl logs deployment/infra-postgres
```

## Persistent Volume Management

### Check PVC Status
```bash
kubectl get pvc postgres-pvc
kubectl describe pvc postgres-pvc
```

### Check Storage Usage
```bash
kubectl exec -it deployment/infra-postgres -- df -h /var/lib/postgresql/data
```

### Backup Data
```bash
# Create backup
kubectl exec -it deployment/infra-postgres -- pg_dump -U postgres microservices_db > backup.sql

# Restore backup
kubectl exec -i deployment/infra-postgres -- psql -U postgres microservices_db < backup.sql
```

## Security Notes
- Default credentials are for development only
- Use Kubernetes secrets for production
- Consider enabling SSL/TLS for production
- PVC data persists across pod restarts and updates
