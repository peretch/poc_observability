# Prometheus Monitoring Help

## What's in this directory?

This directory contains Kubernetes manifests for Prometheus (metrics collection and monitoring).

## Files:

- `mon-prometheus-deployment.yaml`: Runs Prometheus server
- `mon-prometheus-service.yaml`: Exposes Prometheus web UI
- `mon-prometheus-configmap.yaml`: Configuration for scraping targets

## What is Prometheus?

Prometheus is a monitoring system that:

- Scrapes metrics from your applications
- Stores time-series data
- Provides query language (PromQL)
- Supports alerting and visualization

## Key Components:

### Deployment

- **Image**: prom/prometheus:latest
- **Port**: 9090 (web UI)
- **Storage**: 200 hours retention
- **Resources**: 512Mi-1Gi memory, 250m-500m CPU

### Service

- **Type**: ClusterIP (internal access)
- **Port**: 9090
- **DNS**: mon-prometheus:9090

### ConfigMap

- **Purpose**: Contains prometheus.yml configuration
- **Scrape targets**: Defines what to monitor
- **Intervals**: How often to collect metrics

## Scraping Configuration:

- **app-hello-world**: Your main application (every 5s)
- **mon-localstack**: LocalStack service (every 15s)
- **prometheus**: Self-monitoring (every 15s)

## Accessing Prometheus:

1. Port-forward: `kubectl port-forward svc/mon-prometheus 9090:9090`
2. Open: http://localhost:9090
3. Check targets: Status → Targets
4. Query metrics: Graph → Enter PromQL query

## Sample PromQL Queries

### Application Metrics

```promql
# HTTP requests per second by service
rate(http_requests_total[5m])

# Request duration (95th percentile)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate (4xx and 5xx responses)
rate(http_requests_total{status_code=~"4..|5.."}[5m]) / rate(http_requests_total[5m]) * 100

# Authentication attempts rate
rate(auth_attempts_total[5m])

# Authentication success rate
rate(auth_attempts_total{status="success"}[5m]) / rate(auth_attempts_total[5m]) * 100

# Active sessions count
active_sessions_total
```

### System Metrics

```promql
# Memory usage by container
container_memory_usage_bytes{container!="POD"}

# CPU usage percentage
rate(container_cpu_usage_seconds_total[5m]) * 100

# Node.js heap size
nodejs_heap_size_used_bytes

# Event loop lag
nodejs_eventloop_lag_seconds

# Garbage collection duration
rate(nodejs_gc_duration_seconds_total[5m])
```

### Business Metrics

```promql
# OAuth provider usage
sum by (provider) (auth_attempts_total{type="oauth"})

# Failed login attempts
rate(auth_attempts_total{status="failure"}[5m])

# Top endpoints by request count
topk(10, sum by (route) (rate(http_requests_total[5m])))

# Response time by endpoint
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) by (route)
```

### Alerting Queries

```promql
# High error rate (>5%)
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100 > 5

# High memory usage (>80%)
nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes * 100 > 80

# High event loop lag (>100ms)
nodejs_eventloop_lag_seconds > 0.1

# Too many failed auth attempts (>10/min)
rate(auth_attempts_total{status="failure"}[1m]) > 10
```

## Next steps:

- Add Prometheus client to your Node.js app
- Create custom metrics
- Set up Grafana for visualization
- Configure alerting rules
