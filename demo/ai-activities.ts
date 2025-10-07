import { createXLogger } from '../src';

/**
 * AI Activities Demo
 * 
 * Demonstrates AI activity logging with request/response tracking
 */

const logger = createXLogger(
  { packageName: 'ai-activities-demo' },
  {
    gateway: {
      logToConsole: true,
      logLevel: 'info'
    },
    chronos: {
      chronosConfig: {
        databases: {
          logs: {
            dbConnRef: process.env.MONGO_URI || 'mongodb://localhost:27017',
            spaceConnRef: process.env.MONGO_URI || 'mongodb://localhost:27017',
            bucket: 'logs',
            dbName: 'chrono_logs_demo'
          }
        }
      },
      collections: {
        activities: 'ai_activities',
        errors: 'ai_errors'
      }
    }
  }
);

async function runAIDemo() {
  console.log('\n=== AI Activities Demo ===\n');

  // Log AI request
  logger.logActivityRequest({
    jobId: 'job-123',
    request: { prompt: 'Explain quantum computing', max_tokens: 500 },
    model: 'gpt-4',
    provider: 'openai',
    userId: 'user-456',
    requestStatus: 'accepted'
  }, { tenantId: 'tenant-a', correlationId: 'ai-001' });

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Log AI response
  logger.logActivityResponse({
    jobId: 'job-123',
    response: { text: 'Quantum computing uses qubits...' },
    cost: { tokens: 350, usd: 0.007 },
    responseStatus: 'completed'
  }, { tenantId: 'tenant-a', correlationId: 'ai-001' });

  await logger.flush({ timeoutMs: 5000 });
  console.log('\n=== AI Demo Complete ===\n');
}

runAIDemo().catch(console.error);

export { logger };
