import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Configuración de OpenTelemetry para app-books
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'app-books',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://mon-jaeger:14268/api/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Deshabilitar instrumentaciones que no necesitamos
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

// Inicializar OpenTelemetry
sdk.start();

console.log('🔍 OpenTelemetry initialized for app-books');

export default sdk;
