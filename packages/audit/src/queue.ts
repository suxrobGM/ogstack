import { Queue, Worker } from 'bullmq';
import type { OGAuditResult } from '@ogstack/shared';
import { validateOGTags } from './validator.js';

export interface AuditJob {
  auditId: string;
  url: string;
}

export interface AuditJobResult {
  auditId: string;
  result: OGAuditResult;
}

let _queue: Queue | null = null;

export function getAuditQueue(): Queue {
  if (!_queue) {
    const connection = { url: process.env['REDIS_URL'] ?? 'redis://localhost:6379' };
    _queue = new Queue('og-audit', { connection });
  }
  return _queue;
}

export function startAuditWorker(): Worker {
  const connection = { url: process.env['REDIS_URL'] ?? 'redis://localhost:6379' };
  return new Worker<AuditJob, AuditJobResult>(
    'og-audit',
    async (job) => {
      const result = await validateOGTags(job.data.url);
      return { auditId: job.data.auditId, result };
    },
    { connection },
  );
}

export async function enqueueUrls(auditId: string, urls: string[]): Promise<void> {
  const queue = getAuditQueue();
  const jobs = urls.map((url) => ({
    name: 'validate-url',
    data: { auditId, url } satisfies AuditJob,
  }));
  await queue.addBulk(jobs);
}
