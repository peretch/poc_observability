# Microservices POC - Observability Testing Ground

A microservices proof-of-concept project designed for testing and learning observability tools and practices.

## Naming Convention

This project follows a structured naming convention:

- **`app-*`**: Application microservices (e.g., `app-hello-world`, `app-user-service`)
- **`mon-*`**: Monitoring and observability services (e.g., `mon-prometheus`, `mon-grafana`)
- **`infra-*`**: Infrastructure services (e.g., `infra-postgres`, `infra-redis`, `infra-localstack`)

## Current Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  app-hello-world│───▶│   LocalStack    │───▶│   AWS SNS       │
│   Service       │    │   (SNS)         │    │   (Simulated)   │
│   (Node.js)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kubernetes    │    │   infra-postgres│    │   infra-redis    │
│   (Skaffold)    │    │   (Database)    │    │   (Cache)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Components

- **app-hello-world Service**: Node.js/TypeScript Express service

  - Publishes messages to SNS
  - Receives SNS webhook notifications
  - Port: 3000

- **LocalStack**: Local AWS services simulation

  - SNS service for message publishing
  - Port: 4566

- **infra-postgres**: PostgreSQL database

  - Database: microservices_db
  - Port: 5432
  - Username: postgres, Password: postgres

- **infra-redis**: Redis cache database

  - Port: 6379
  - Password: redis
  - AOF persistence enabled

- **Kubernetes**: Container orchestration
  - Managed by Skaffold for development workflow
  - Includes deployments and services

## Getting Started

### Prerequisites

- Docker
- Kubernetes (minikube, kind, or cloud provider)
- Skaffold
- kubectl

### Running the Project

1. **Start the services**:

   ```bash
   ./run-skaffold.sh
   ```

2. **Initialize SNS topic**:

   ```bash
   ./aws-sns-init.sh
   ```

3. **Test the service**:

   ```bash
   curl http://localhost:3000
   ```

4. **Access Services**:

   ```bash
   # Application
   curl http://localhost:3000
   curl http://localhost:3000/health
   curl http://localhost:3000/metrics

   # Monitoring
   # Prometheus: http://localhost:9090

   # Databases
   # PostgreSQL: localhost:5432 (postgres/postgres)
   # Redis: localhost:6379 (password: redis)
   ```

## Observability Roadmap

This project serves as a testing ground for implementing and learning various observability tools and practices.

### Phase 1: Metrics & Monitoring 🎯

#### 1.1 Prometheus Integration

- **Goal**: Implement metrics collection and monitoring
- **Tasks**:
  - Add Prometheus client library to the Node.js service
  - Expose `/metrics` endpoint
  - Create custom metrics (request count, duration, errors)
  - Deploy Prometheus server in Kubernetes
  - Configure service discovery for automatic target detection

#### 1.2 Grafana Dashboards

- **Goal**: Visualize metrics and create monitoring dashboards
- **Tasks**:
  - Deploy Grafana in Kubernetes
  - Configure Prometheus as data source
  - Create dashboards for:
    - Service health metrics
    - Request rates and latencies
    - Error rates and types
    - SNS message publishing metrics

### Phase 2: Distributed Tracing 🔍

#### 2.1 OpenTelemetry Integration

- **Goal**: Implement distributed tracing across services
- **Tasks**:
  - Add OpenTelemetry SDK to Node.js service
  - Instrument Express routes and AWS SDK calls
  - Deploy Jaeger or Zipkin for trace visualization
  - Create traces for SNS message flow
  - Add custom spans for business logic

#### 2.2 Trace Correlation

- **Goal**: Correlate traces across service boundaries
- **Tasks**:
  - Propagate trace context through SNS messages
  - Implement trace correlation in webhook handlers
  - Create end-to-end trace visualization

### Phase 3: Error Tracking & Alerting 🚨

#### 3.1 Sentry Integration

- **Goal**: Implement error tracking and performance monitoring
- **Tasks**:
  - Add Sentry SDK to Node.js service
  - Configure error capture and performance monitoring
  - Set up release tracking
  - Create custom error contexts
  - Implement user feedback collection

#### 3.2 Alerting System

- **Goal**: Set up proactive monitoring and alerting
- **Tasks**:
  - Configure Prometheus alerting rules
  - Set up AlertManager for notification routing
  - Create alerts for:
    - High error rates
    - Service downtime
    - Performance degradation
    - SNS publishing failures

### Phase 4: Advanced Observability 🚀

#### 4.1 Log Aggregation

- **Goal**: Centralized logging and log analysis
- **Tasks**:
  - Deploy ELK Stack (Elasticsearch, Logstash, Kibana) or Loki
  - Implement structured logging in Node.js service
  - Create log-based dashboards
  - Set up log-based alerting

#### 4.2 Service Mesh Observability

- **Goal**: Implement service mesh for advanced observability
- **Tasks**:
  - Deploy Istio or Linkerd
  - Implement automatic metrics collection
  - Create service topology visualization
  - Implement distributed tracing at mesh level

#### 4.3 Synthetic Monitoring

- **Goal**: Implement proactive monitoring
- **Tasks**:
  - Set up synthetic tests with tools like Blackbox Exporter
  - Create health check endpoints
  - Implement uptime monitoring
  - Set up performance regression testing

## Learning Objectives

### Prometheus vs OpenTelemetry

**Prometheus**:

- **Purpose**: Metrics collection and monitoring
- **Use Case**: System metrics, business metrics, alerting
- **Data Model**: Time-series data with labels
- **Best For**: Monitoring system health, performance, and business KPIs

**OpenTelemetry**:

- **Purpose**: Observability data collection (metrics, traces, logs)
- **Use Case**: Distributed tracing, application performance monitoring
- **Data Model**: Traces with spans, metrics, logs
- **Best For**: Understanding request flows, debugging performance issues

**Can you use OpenTelemetry like Prometheus?**

- **Short Answer**: Not directly, but they complement each other
- **OpenTelemetry** can collect metrics and send them to Prometheus
- **Prometheus** excels at metrics storage, querying, and alerting
- **Best Practice**: Use OpenTelemetry for data collection, Prometheus for metrics storage

### Recommended Learning Path

1. **Start with Prometheus** - Learn metrics collection and basic monitoring
2. **Add Grafana** - Learn visualization and dashboard creation
3. **Implement OpenTelemetry** - Learn distributed tracing concepts
4. **Add Sentry** - Learn error tracking and performance monitoring
5. **Combine all tools** - Learn how they work together in a complete observability stack

## Project Structure

```
microservices_poc/
├── app-hello-world/             # Node.js service (app-* prefix for microservices)
│   ├── src/
│   │   └── index.ts            # Main service code
│   ├── Dockerfile
│   └── package.json
├── k8s/                         # Kubernetes manifests
│   ├── app-hello-world/         # Hello World service manifests
│   │   ├── hello-world-deployment.yaml
│   │   └── hello-world-service.yaml
│   ├── infra-postgres/          # PostgreSQL database manifests
│   │   ├── postgres-deployment.yaml
│   │   ├── postgres-service.yaml
│   │   └── help.txt
│   ├── infra-redis/             # Redis cache manifests
│   │   ├── redis-deployment.yaml
│   │   ├── redis-service.yaml
│   │   └── help.txt
│   ├── mon-localstack/          # LocalStack manifests
│   │   ├── localstack-deployment.yaml
│   │   └── localstack-service.yaml
│   └── mon-prometheus/          # Prometheus monitoring stack
│       ├── mon-prometheus-deployment.yaml
│       ├── mon-prometheus-service.yaml
│       └── mon-prometheus-configmap.yaml
├── skaffold.yaml              # Skaffold configuration
├── aws-sns-init.sh           # SNS initialization script
└── run-skaffold.sh          # Development startup script
```

## Next Steps

1. **Choose your starting point** from the roadmap above
2. **Implement one tool at a time** to understand each component
3. **Experiment with different configurations** and learn from mistakes
4. **Document your learnings** as you go
5. **Ask questions** - this is a learning project!

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Sentry Documentation](https://docs.sentry.io/)
- [Kubernetes Observability](https://kubernetes.io/docs/concepts/cluster-administration/logging/)

---

**Happy Learning! 🚀**

This project is designed to be your playground for observability. Don't be afraid to break things, experiment, and learn from the process!
