# mon-jaeger - Jaeger Tracing Help

## Overview

This directory contains Kubernetes manifests for Jaeger (distributed tracing system) that collects and visualizes traces from your microservices.

## Files in this directory:

- `mon-jaeger-deployment.yaml`: Kubernetes Deployment for Jaeger
- `mon-jaeger-service.yaml`: Kubernetes Service to expose Jaeger internally

## What is Jaeger?

Jaeger is a distributed tracing system that helps you:

- **Track requests** across multiple microservices
- **Identify performance bottlenecks** in your system
- **Debug issues** by following the complete request path
- **Monitor service dependencies** and communication patterns

## How it works with your microservices:

### 1. Request Flow Example:

```
User Request → app-books → app-auth → infra-postgres
     ↓            ↓         ↓           ↓
   Span 1      Span 2    Span 3      Span 4
     ↓            ↓         ↓           ↓
     └────────────┴─────────┴───────────┘
              Complete Trace
```

### 2. What you can see in Jaeger:

- **Service Map**: Visual representation of how services communicate
- **Trace Timeline**: Step-by-step execution of each request
- **Performance Metrics**: Response times, errors, and throughput
- **Dependency Analysis**: Which services depend on others

## Configuration Details

### Service Settings

- **Port**: 16686 (Jaeger UI)
- **Collector Port**: 14268 (receives traces)
- **Agent Port**: 14250 (optional, for agent mode)

### Resource Limits

- **Memory Request**: 256Mi
- **Memory Limit**: 512Mi
- **CPU Request**: 100m
- **CPU Limit**: 500m

### Health Checks

- **Liveness Probe**: HTTP GET `/` on port 16686
- **Readiness Probe**: HTTP GET `/` on port 16686
- **Initial Delay**: 30s (liveness), 5s (readiness)

## Connection Details

- **Internal Service**: `mon-jaeger:16686`
- **Local Access**: `localhost:16686` (via port-forward)
- **Jaeger UI**: `http://localhost:16686`

## Common Commands

### Check Jaeger Status

```bash
kubectl get pods -l app=mon-jaeger
kubectl logs deployment/mon-jaeger
```

### Access Jaeger UI

```bash
# Port forward to access Jaeger UI
kubectl port-forward service/mon-jaeger 16686:16686 &

# Open in browser
open http://localhost:16686
```

### View Traces

1. Open Jaeger UI at `http://localhost:16686`
2. Select a service (e.g., `app-books`, `app-auth`)
3. Click "Find Traces" to see recent traces
4. Click on a trace to see the detailed timeline

## Integration with Your Services

### OpenTelemetry Configuration

Your services are configured to send traces to Jaeger:

- **app-books**: Sends traces for book operations
- **app-auth**: Sends traces for authentication operations
- **Endpoint**: `http://mon-jaeger:14268/api/traces`

### Environment Variables

- `JAEGER_ENDPOINT`: Jaeger collector endpoint
- `NODE_ENV`: Environment (affects trace sampling)

## Example Trace Analysis

### Successful Book Search:

```
1. User → app-books (GET /books)
2. app-books → app-auth (validate JWT)
3. app-auth → Redis (check session)
4. app-books → PostgreSQL (query books)
5. app-books → User (return results)
```

### Error Scenario:

```
1. User → app-books (GET /books)
2. app-books → app-auth (validate JWT)
3. app-auth → Redis (session expired)
4. app-auth → app-books (401 Unauthorized)
5. app-books → User (401 Error)
```

## Troubleshooting

### No Traces Appearing

1. Check if services are running: `kubectl get pods`
2. Check Jaeger logs: `kubectl logs deployment/mon-jaeger`
3. Verify OpenTelemetry configuration in services
4. Check network connectivity between services and Jaeger

### High Memory Usage

- Jaeger stores traces in memory by default
- Consider configuring persistent storage for production
- Monitor memory usage: `kubectl top pod -l app=mon-jaeger`

## Production Considerations

- **Storage**: Configure persistent storage for trace data
- **Retention**: Set appropriate trace retention policies
- **Sampling**: Configure trace sampling rates
- **Security**: Enable authentication for Jaeger UI
- **Scaling**: Consider Jaeger cluster mode for high throughput

## Next Steps

1. **View Traces**: Open Jaeger UI and explore your service traces
2. **Analyze Performance**: Look for slow operations in your traces
3. **Debug Issues**: Use traces to understand error flows
4. **Optimize**: Identify bottlenecks and optimize your services
