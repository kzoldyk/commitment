import { app } from './index';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import fs from 'fs';
import path from 'path';

import { getDb } from './db';
import { EvaluationService } from './modules/evaluation/evaluation.service';

const PORT = Number(process.env.PORT) || 3000;
const evaluationService = new EvaluationService();

// Serve static frontend assets if built
if (fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
  app.use('/*', serveStatic({ root: './dist' }));
  app.get('*', (c) => {
    const html = fs.readFileSync(path.resolve(process.cwd(), 'dist/index.html'), 'utf-8');
    return c.html(html);
  });
}

// Local development 1-minute background cron runner
setInterval(async () => {
  try {
    const db = getDb();
    const result = await evaluationService.runEvaluation(db);
    if (result.evaluatedDays > 0) {
      console.log(`⏰ [1-MIN CRON TRIGGER] Evaluated ${result.evaluatedDays} due day(s) (✅ Success: ${result.successes}, ❌ Failures: ${result.failures}, 💖 Restorations: ${result.restorations})`);
    }
  } catch (err) {
    console.error('❌ [1-MIN CRON ERROR]:', err);
  }
}, 60 * 1000);
console.log('⏰ [LOCAL CRON RUNNER] Active — running evaluation check every 1 minute.');

console.log(`\n🚀 Commitment API & Application running at http://localhost:${PORT}\n`);

serve({
  fetch: app.fetch,
  port: PORT,
});
