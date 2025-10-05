import express from 'express';
import AWS from 'aws-sdk';
import client from 'prom-client';

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test', // Use test credentials for LocalStack
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
});

const sns = new AWS.SNS({ endpoint: 'http://mon-localstack:4566' });
const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus metrics setup
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics for our application
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const snsPublishTotal = new client.Counter({
  name: 'sns_publish_total',
  help: 'Total number of SNS messages published',
  labelNames: ['topic', 'status'],
  registers: [register],
});

const snsPublishDuration = new client.Histogram({
  name: 'sns_publish_duration_seconds',
  help: 'Duration of SNS publish operations in seconds',
  labelNames: ['topic'],
  registers: [register],
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// Middleware to track HTTP requests
app.use((req, res, next) => {
  const start = Date.now();

  // Increment active connections
  activeConnections.inc();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    // Record metrics
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    httpRequestTotal.labels(req.method, route, res.statusCode.toString()).inc();

    // Decrement active connections
    activeConnections.dec();
  });

  next();
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Endpoint to receive SNS messages (subscription notifications)
app.post('/sns', express.json(), (req, res) => {
  const message = req.body;

  // Log the received message
  console.log('Received SNS message:', message);

  // Process the message as needed
  // Example: If you want to send an acknowledgment response
  res.status(200).send('Received SNS message');
});

// Endpoint to publish a message to SNS
app.get('/', async (req, res) => {
  const topicArn = 'arn:aws:sns:us-east-1:000000000000:hello-world-topic';
  const start = Date.now();

  const params = {
    Message: JSON.stringify({
      app: 'app-hello-world',
      message: 'Hello World!',
      timestamp: new Date().toISOString(),
    }),
    TopicArn: topicArn,
  };

  try {
    await sns.publish(params).promise();

    // Record successful SNS publish metrics
    const duration = (Date.now() - start) / 1000;
    snsPublishTotal.labels('hello-world-topic', 'success').inc();
    snsPublishDuration.labels('hello-world-topic').observe(duration);

    res.json({
      message: 'Hello World!',
      sns: {
        topic: 'hello-world-topic',
        status: 'published',
        duration: `${duration}s`,
      },
    });
  } catch (err: any) {
    console.error(err);

    // Record failed SNS publish metrics
    const duration = (Date.now() - start) / 1000;
    snsPublishTotal.labels('hello-world-topic', 'error').inc();
    snsPublishDuration.labels('hello-world-topic').observe(duration);

    res.status(500).json({
      error: 'Error publishing to SNS',
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Hello world service is running on port ${PORT}`);
});
