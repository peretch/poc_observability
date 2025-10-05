# Grafana Configuration Help

## Overview

Grafana is a visualization and analytics platform that connects to Prometheus to create beautiful dashboards for your metrics.

## Files in this directory:

### mon-grafana-deployment.yaml

- **Deployment**: Runs Grafana container with persistent storage
- **Environment**: Sets admin password and disables signup
- **Plugins**: Installs piechart plugin for better visualizations
- **Volumes**: Mounts persistent storage, datasource config, and dashboards

### mon-grafana-service.yaml

- **Service**: Exposes Grafana on port 3000 within the cluster
- **Type**: ClusterIP (internal access only)

### mon-grafana-pvc.yaml

- **PersistentVolumeClaim**: Provides 1GB storage for Grafana data
- **Storage**: Uses local-path storage class for development

### mon-grafana-datasources.yaml

- **ConfigMap**: Configures Prometheus as the default data source
- **URL**: Points to mon-prometheus:9090 service
- **Auto-configuration**: Grafana automatically loads this config

### mon-grafana-dashboards.yaml

- **ConfigMap**: Contains three pre-built dashboards:
  1. **Authentication Metrics**: Auth attempts, success rates, OAuth usage
  2. **HTTP Performance**: Request rates, response times, error rates
  3. **System Metrics**: Memory, CPU, event loop, garbage collection

## Key Concepts:

### Dashboards

- **Authentication Metrics**: Tracks login/register/OAuth success rates
- **HTTP Performance**: Monitors API response times and error rates
- **System Metrics**: Node.js runtime performance and resource usage

### Metrics Types

- **Counters**: Cumulative values (auth_attempts_total)
- **Gauges**: Current values (active_sessions_total)
- **Histograms**: Request duration distributions
- **Rates**: Calculated from counters over time

### Access

- **URL**: http://localhost:3000 (after port-forward)
- **Login**: admin / admin123
- **Dashboards**: Auto-loaded from ConfigMap

## Dashboard Creation Examples

### Application Logs Dashboard

Create a dashboard to visualize application logs and errors:

**Panel 1: Error Rate Over Time**

```promql
# Error rate percentage
rate(http_requests_total{status_code=~"4..|5.."}[5m]) / rate(http_requests_total[5m]) * 100
```

- **Visualization**: Time series
- **Thresholds**: Green (<1%), Yellow (1-5%), Red (>5%)

**Panel 2: Status Code Distribution**

```promql
# Status codes pie chart
sum by (status_code) (http_requests_total)
```

- **Visualization**: Pie chart
- **Colors**: 2xx (green), 4xx (yellow), 5xx (red)

**Panel 3: Top Error Endpoints**

```promql
# Endpoints with most errors
topk(10, sum by (route) (rate(http_requests_total{status_code=~"4..|5.."}[5m])))
```

- **Visualization**: Table
- **Sort**: Descending by value

### Endpoint Performance Dashboard

Monitor API endpoint performance and response times:

**Panel 1: Response Time Percentiles**

```promql
# 50th, 95th, 99th percentiles
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

- **Visualization**: Time series
- **Legend**: 50th, 95th, 99th percentile

**Panel 2: Request Rate by Endpoint**

```promql
# Requests per second by route
rate(http_requests_total[5m]) by (route)
```

- **Visualization**: Time series
- **Group by**: route

**Panel 3: Slowest Endpoints**

```promql
# Average response time by endpoint
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) by (route)
```

- **Visualization**: Bar chart
- **Sort**: Descending

### Authentication Security Dashboard

Monitor authentication patterns and security events:

**Panel 1: Authentication Attempts**

```promql
# Auth attempts by type
rate(auth_attempts_total[5m]) by (type)
```

- **Visualization**: Time series
- **Legend**: login, register, oauth

**Panel 2: Failed Login Attempts**

```promql
# Failed attempts rate
rate(auth_attempts_total{status="failure"}[5m])
```

- **Visualization**: Time series
- **Thresholds**: Alert if >10/min

**Panel 3: OAuth Provider Usage**

```promql
# OAuth usage by provider
sum by (provider) (auth_attempts_total{type="oauth"})
```

- **Visualization**: Pie chart
- **Colors**: Google (blue), GitHub (black)

**Panel 4: Active Sessions**

```promql
# Current active sessions
active_sessions_total
```

- **Visualization**: Stat panel
- **Thresholds**: Green (<100), Yellow (100-500), Red (>500)

### System Health Dashboard

Monitor application and infrastructure health:

**Panel 1: Memory Usage**

```promql
# Memory usage percentage
nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes * 100
```

- **Visualization**: Gauge
- **Thresholds**: Green (<70%), Yellow (70-90%), Red (>90%)

**Panel 2: CPU Usage**

```promql
# CPU usage rate
rate(nodejs_process_cpu_user_seconds_total[5m]) * 100
```

- **Visualization**: Time series
- **Unit**: Percentage

**Panel 3: Event Loop Lag**

```promql
# Event loop lag in milliseconds
nodejs_eventloop_lag_seconds * 1000
```

- **Visualization**: Time series
- **Thresholds**: Alert if >100ms

**Panel 4: Garbage Collection**

```promql
# GC duration
rate(nodejs_gc_duration_seconds_total[5m])
```

- **Visualization**: Time series
- **Unit**: Seconds

## Dashboard Creation Steps

### 1. Create New Dashboard

1. Click "+" → "Dashboard"
2. Click "Add panel"
3. Select "Time series" or other visualization

### 2. Configure Query

1. Select Prometheus data source
2. Enter PromQL query
3. Set time range and refresh interval

### 3. Customize Visualization

1. Set appropriate units (seconds, percentage, bytes)
2. Configure colors and thresholds
3. Add titles and descriptions

### 4. Set Up Alerts

1. Go to "Alert" tab in panel
2. Define alert conditions
3. Set notification channels

## Usage Tips:

1. Use time range selectors to focus on specific periods
2. Set up alerts for critical thresholds (high error rates, memory usage)
3. Create custom dashboards for specific use cases
4. Export dashboard JSON for version control
5. Use variables for dynamic dashboards
6. Organize panels logically (overview → details)
7. Add descriptions and documentation to panels
