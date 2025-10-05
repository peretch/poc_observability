# app-hello-world

A Node.js microservice that demonstrates AWS SNS integration with comprehensive Prometheus monitoring.

## 🎯 What This Service Does

This service is a **microservice example** that:

1. **Publishes messages to AWS SNS** via LocalStack (local AWS simulation)
2. **Receives SNS webhook notifications**
3. **Exposes comprehensive metrics** for monitoring and observability
4. **Provides health checks** for Kubernetes readiness/liveness probes

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  app-hello-world│───▶│   LocalStack    │───▶│   AWS SNS       │
│   (Node.js)     │    │   (SNS)         │    │   (Simulated)   │
│                 │    │                 │    │                 │
│  ┌─────────────┐│    └─────────────────┘    └─────────────────┘
│  │ Prometheus  ││
│  │ Metrics     ││
│  └─────────────┘│
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Prometheus    │
│   (Scraping)    │
└─────────────────┘
```

## 🚀 API Endpoints

### `GET /`

- **Purpose**: Main endpoint that publishes a message to SNS
- **Response**: JSON with message details and SNS status
- **Example**:
  ```json
  {
    "message": "Hello World!",
    "sns": {
      "topic": "hello-world-topic",
      "status": "published",
      "duration": "0.045s"
    }
  }
  ```

### `POST /sns`

- **Purpose**: Webhook endpoint to receive SNS notifications
- **Body**: SNS message payload
- **Response**: Confirmation message

### `GET /metrics`

- **Purpose**: Prometheus metrics endpoint
- **Content-Type**: `text/plain`
- **Usage**: Scraped by Prometheus every 5 seconds

### `GET /health`

- **Purpose**: Health check endpoint for Kubernetes
- **Response**: Service health status
- **Example**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-10-05T21:45:00.000Z",
    "uptime": 3600
  }
  ```

## 📊 Prometheus Metrics

### Default Metrics (Automatic)

- **Node.js metrics**: Memory usage, CPU usage, event loop lag
- **Process metrics**: Uptime, file descriptors, etc.

### Custom Application Metrics

#### HTTP Request Metrics

```promql
# Total HTTP requests
http_requests_total{method="GET", route="/", status_code="200"}

# Request duration
http_request_duration_seconds{method="GET", route="/", status_code="200"}

# Active connections
active_connections
```

#### SNS Integration Metrics

```promql
# SNS publish operations
sns_publish_total{topic="hello-world-topic", status="success"}

# SNS publish duration
sns_publish_duration_seconds{topic="hello-world-topic"}
```

### Example Prometheus Queries

```promql
# Request rate per second
rate(http_requests_total[5m])

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# SNS success rate
rate(sns_publish_total{status="success"}[5m]) / rate(sns_publish_total[5m])

# Error rate
rate(http_requests_total{status_code!="200"}[5m]) / rate(http_requests_total[5m])
```

## 🔧 How Prometheus Integration Works

### 1. **Metrics Collection**

- **prom-client library**: Official Prometheus client for Node.js
- **Default metrics**: Automatic collection of system metrics
- **Custom metrics**: Business logic specific metrics

### 2. **Metrics Types Used**

- **Counter**: `http_requests_total`, `sns_publish_total` (always increasing)
- **Histogram**: `http_request_duration_seconds`, `sns_publish_duration_seconds` (timing data)
- **Gauge**: `active_connections` (current value)

### 3. **Labels for Dimensionality**

- **HTTP metrics**: `method`, `route`, `status_code`
- **SNS metrics**: `topic`, `status`
- **Enables**: Filtering, grouping, and detailed analysis

### 4. **Middleware Integration**

- **Automatic tracking**: All HTTP requests are automatically measured
- **Performance monitoring**: Request duration, status codes, error rates
- **Business metrics**: SNS operations, success/failure rates

## 🐳 Docker & Kubernetes

### Dockerfile

```dockerfile
FROM node:22
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Kubernetes Deployment

- **Image**: `app-hello-world`
- **Port**: 3000
- **Environment**: AWS credentials for LocalStack
- **Health checks**: `/health` endpoint

### Service Discovery

- **Service name**: `app-hello-world`
- **DNS**: `app-hello-world:3000`
- **Prometheus scraping**: `http://app-hello-world:3000/metrics`

## 🛠️ Development

### Prerequisites

- Node.js 22+
- Docker
- Kubernetes cluster
- LocalStack (for AWS simulation)

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Test endpoints
curl http://localhost:3000
curl http://localhost:3000/health
curl http://localhost:3000/metrics
```

### Building & Deploying

```bash
# Build Docker image
docker build -t app-hello-world .

# Deploy with Skaffold
skaffold dev --port-forward
```

## 📈 Monitoring & Observability

### What Gets Monitored

1. **Application Performance**

   - Request rates and response times
   - Error rates and status codes
   - Active connections

2. **Business Logic**

   - SNS message publishing success/failure
   - SNS operation duration
   - Message throughput

3. **System Health**
   - Memory usage and garbage collection
   - CPU utilization
   - Event loop performance

### Prometheus Scraping Configuration

```yaml
- job_name: 'app-hello-world'
  static_configs:
    - targets: ['app-hello-world:3000']
  metrics_path: '/metrics'
  scrape_interval: 5s
```

### Grafana Dashboard Ideas

- **Request Rate**: `rate(http_requests_total[5m])`
- **Response Time**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- **Error Rate**: `rate(http_requests_total{status_code!="200"}[5m])`
- **SNS Success Rate**: `rate(sns_publish_total{status="success"}[5m])`

## 🔍 Troubleshooting

### Common Issues

1. **SNS Connection Errors**

   - Check LocalStack is running: `kubectl get pods -l app=mon-localstack`
   - Verify service name: `mon-localstack:4566`
   - Check SNS topic exists: `./aws-sns-init.sh`

2. **Metrics Not Appearing**

   - Verify `/metrics` endpoint: `curl http://localhost:3000/metrics`
   - Check Prometheus targets: http://localhost:9090/targets
   - Ensure scraping configuration is correct

3. **Health Check Failures**
   - Test health endpoint: `curl http://localhost:3000/health`
   - Check application logs: `kubectl logs -l app=app-hello-world`

### Debug Commands

```bash
# Check service status
kubectl get pods -l app=app-hello-world

# View application logs
kubectl logs -l app=app-hello-world -f

# Test metrics endpoint
curl http://localhost:3000/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets
```

## 🚀 Next Steps

1. **Add Grafana Dashboards**: Visualize metrics with beautiful dashboards
2. **Implement Alerting**: Set up alerts for error rates, response times
3. **Add Distributed Tracing**: Implement OpenTelemetry for request tracing
4. **Enhance Metrics**: Add more business-specific metrics
5. **Load Testing**: Test performance under load

## 📚 Learning Resources

- [Prometheus Client for Node.js](https://github.com/siimon/prom-client)
- [Prometheus Query Language (PromQL)](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Kubernetes Monitoring Best Practices](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-usage-monitoring/)
- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)

---

**Happy Monitoring! 📊**
