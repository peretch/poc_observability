"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const prom_client_1 = __importDefault(require("prom-client"));
// Configure AWS SDK
aws_sdk_1.default.config.update({
    region: 'us-east-1',
    accessKeyId: 'test',
    secretAccessKey: 'test',
});
const sns = new aws_sdk_1.default.SNS({ endpoint: 'http://mon-localstack:4566' });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Prometheus metrics setup
const register = new prom_client_1.default.Registry();
// Add default metrics (CPU, memory, etc.)
prom_client_1.default.collectDefaultMetrics({ register });
// Custom metrics for our application
const httpRequestDuration = new prom_client_1.default.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});
const httpRequestTotal = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});
const snsPublishTotal = new prom_client_1.default.Counter({
    name: 'sns_publish_total',
    help: 'Total number of SNS messages published',
    labelNames: ['topic', 'status'],
    registers: [register],
});
const snsPublishDuration = new prom_client_1.default.Histogram({
    name: 'sns_publish_duration_seconds',
    help: 'Duration of SNS publish operations in seconds',
    labelNames: ['topic'],
    registers: [register],
});
const activeConnections = new prom_client_1.default.Gauge({
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
app.get('/metrics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.set('Content-Type', register.contentType);
        res.end(yield register.metrics());
    }
    catch (ex) {
        res.status(500).end(ex);
    }
}));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// Endpoint to receive SNS messages (subscription notifications)
app.post('/sns', express_1.default.json(), (req, res) => {
    const message = req.body;
    // Log the received message
    console.log('Received SNS message:', message);
    // Process the message as needed
    // Example: If you want to send an acknowledgment response
    res.status(200).send('Received SNS message');
});
// Endpoint to publish a message to SNS
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield sns.publish(params).promise();
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
    }
    catch (err) {
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
}));
app.listen(PORT, () => {
    console.log(`Hello world service is running on port ${PORT}`);
});
