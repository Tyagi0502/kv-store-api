import express from 'express';
import client from 'prom-client';

const app = express();

export const restResponseTimeHistogram = new client.Histogram({
  name: 'rest_response_time_duration_seconds',
  help: 'REST API response time in seconds',
  labelNames: ['method', 'route', 'statusCode'],
  buckets: [10, 20, 50, 100, 200],
});

export const numberOfKeysInDatabase = new client.Gauge({
  name: 'keys_in_database',
  help: 'Number of keys in database',
});

export function startMetricsServer() {
  const collectDefaultMetrics = client.collectDefaultMetrics;

  collectDefaultMetrics();

  app.get('/metrics', (req, res) => {
    res.set('Content-Type', client.register.contentType);
    client.register
      .metrics()
      .then(metrics => {
        res.send(metrics);
      })
      .catch(err => {
        console.error(err);
      });
  });

  app.listen(9100, () => {
    console.info('Metrics server started at http://localhost:9100');
  });
}
