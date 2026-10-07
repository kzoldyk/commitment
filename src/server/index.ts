import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getDb, DatabaseInstance } from './db';
import { AuthService } from './modules/auth/auth.service';
import { CommitmentService } from './modules/commitments/commitment.service';
import { EvaluationService } from './modules/evaluation/evaluation.service';
import { UserService } from './modules/users/user.service';
import { DashboardService } from './modules/dashboard/dashboard.service';
import { EmailService } from './modules/notifications/email.service';
import { NotificationService } from './modules/notifications/notification.service';

export type Bindings = {
  DB?: D1Database;
  ASSETS?: Fetcher;
  ENVIRONMENT?: string;
  SESSION_SECRET?: string;
  RESEND_API_KEY?: string;
  BREVO_API_KEY?: string;
  GMAIL_USER?: string;
  GMAIL_APP_PASSWORD?: string;
  EMAIL_FROM?: string;
  CRON_SECRET?: string;
};

export type Variables = {
  db: DatabaseInstance;
  user?: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    timezone: string;
    status: string;
  } | null;
};

export const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const authService = new AuthService();
const commitmentService = new CommitmentService();
const evaluationService = new EvaluationService();
const userService = new UserService();
const dashboardService = new DashboardService();

// Middleware: DB initialization & Logger
app.use('*', logger());
app.use('*', async (c, next) => {
  const db = getDb(c.env?.DB);
  c.set('db', db);

  const sessionId = getCookie(c, 'commitment_session');
  if (sessionId) {
    const user = await authService.validateSession(db, sessionId);
    c.set('user', user);
  } else {
    c.set('user', null);
  }

  await next();
});

// Require Auth Guard Helper
const requireAuth = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
  }
  await next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.get('db');
    const { user, session } = await authService.register(db, body);

    setCookie(c, 'commitment_session', session.id, {
      httpOnly: true,
      secure: c.env?.ENVIRONMENT === 'production',
      sameSite: 'Lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return c.json({ user });
  } catch (err: any) {
    return c.json({ error: { code: 'REGISTER_FAILED', message: err.message } }, 400);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.get('db');
    const { user, session } = await authService.login(db, body);

    setCookie(c, 'commitment_session', session.id, {
      httpOnly: true,
      secure: c.env?.ENVIRONMENT === 'production',
      sameSite: 'Lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return c.json({ user });
  } catch (err: any) {
    return c.json({ error: { code: 'LOGIN_FAILED', message: err.message } }, 401);
  }
});

app.post('/api/auth/logout', async (c) => {
  const sessionId = getCookie(c, 'commitment_session');
  if (sessionId) {
    const db = c.get('db');
    await authService.logout(db, sessionId);
    deleteCookie(c, 'commitment_session', { path: '/' });
  }
  return c.json({ success: true });
});

app.get('/api/auth/me', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ user: null });
  }
  return c.json({ user });
});

// --- DASHBOARD ROUTE ---
app.get('/api/dashboard', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  try {
    const data = await dashboardService.getDashboardData(db, user.id);
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: { code: 'DASHBOARD_ERROR', message: err.message } }, 500);
  }
});

// --- COMMITMENT ROUTES ---
app.post('/api/commitments', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  try {
    const body = await c.req.json();
    const commitment = await commitmentService.create(db, {
      ...body,
      creatorId: user.id,
    }, c.env);
    return c.json({ commitment }, 201);
  } catch (err: any) {
    return c.json({ error: { code: 'CREATE_COMMITMENT_FAILED', message: err.message } }, 400);
  }
});

app.get('/api/commitments', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const list = await commitmentService.listForUser(db, user.id);
  return c.json({ commitments: list });
});

app.get('/api/commitments/:id', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const id = c.req.param('id');
  try {
    const commitment = await commitmentService.getById(db, id, user.id);
    return c.json({ commitment });
  } catch (err: any) {
    return c.json({ error: { code: 'COMMITMENT_NOT_FOUND', message: err.message } }, 404);
  }
});

app.patch('/api/commitments/:id', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const id = c.req.param('id');
  try {
    const body = await c.req.json();
    const commitment = await commitmentService.updatePending(db, id, user.id, body, c.env);
    return c.json({ commitment });
  } catch (err: any) {
    return c.json({ error: { code: 'UPDATE_FAILED', message: err.message } }, 400);
  }
});

app.post('/api/commitments/:id/accept', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const id = c.req.param('id');
  try {
    const commitment = await commitmentService.accept(db, id, user.id, c.env);
    return c.json({ commitment });
  } catch (err: any) {
    return c.json({ error: { code: 'ACCEPT_FAILED', message: err.message } }, 400);
  }
});

app.post('/api/commitments/:id/decline', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const id = c.req.param('id');
  try {
    const result = await commitmentService.decline(db, id, user.id);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: { code: 'DECLINE_FAILED', message: err.message } }, 400);
  }
});

app.post('/api/commitments/:id/cancel', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const id = c.req.param('id');
  try {
    const result = await commitmentService.cancel(db, id, user.id);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: { code: 'CANCEL_FAILED', message: err.message } }, 400);
  }
});

app.post('/api/commitments/:id/days/:dayId/proof', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const commitmentId = c.req.param('id');
  const dayId = c.req.param('dayId');
  try {
    const body = await c.req.json();
    const result = await commitmentService.submitProof(db, {
      commitmentId,
      dayId,
      userId: user.id,
      value: Number(body.value),
      metadataText: body.note,
    });
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: { code: 'PROOF_FAILED', message: err.message } }, 400);
  }
});

// --- USER & PREFERENCE ROUTES ---
app.get('/api/users/search', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const q = c.req.query('q') || '';
  const users = await userService.searchPartners(db, q, user.id);
  return c.json({ users });
});

app.get('/api/users/preferences', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const preferences = await userService.getPreferences(db, user.id);
  return c.json({ preferences });
});

app.patch('/api/users/preferences', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const body = await c.req.json();
  const updated = await userService.updatePreferences(db, user.id, body);
  return c.json({ preferences: updated });
});

app.patch('/api/users/profile', requireAuth, async (c) => {
  const user = c.get('user')!;
  const db = c.get('db');
  const body = await c.req.json();
  const updated = await userService.updateProfile(db, user.id, body);
  return c.json({ user: updated });
});

// --- SCHEDULED EVALUATION TRIGGER ---
app.all('/api/cron/evaluate', async (c) => {
  const authHeader = c.req.header('Authorization');
  const cronSecret = c.env?.CRON_SECRET || (typeof process !== 'undefined' ? process.env?.CRON_SECRET : undefined);
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return c.json({ error: 'Unauthorized cron runner' }, 401);
  }

  const db = c.get('db');
  const result = await evaluationService.runEvaluation(db, c.env);
  return c.json({
    success: true,
    summary: {
      evaluatedDays: result.evaluatedDays,
      goalSuccesses: result.successes,
      goalFailures: result.failures,
      livesRestored: result.restorations,
      contractsFailed: result.failedCommitments,
      emailsDispatched: result.dispatches?.length || 0,
    },
    dispatches: result.dispatches,
    result,
  });
});

// --- SCHEDULED REMINDERS TRIGGER (11:00 PM) ---
app.all('/api/cron/reminders', async (c) => {
  const authHeader = c.req.header('Authorization');
  const cronSecret = c.env?.CRON_SECRET || (typeof process !== 'undefined' ? process.env?.CRON_SECRET : undefined);
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return c.json({ error: 'Unauthorized cron runner' }, 401);
  }

  const db = c.get('db');
  const result = await evaluationService.runReminders(db, c.env);
  return c.json({
    success: true,
    message: `Dispatched ${result.sent} daily reminder email(s).`,
    dispatches: result.dispatches,
  });
});

// --- DIRECT TEST EMAIL ENDPOINT ---
app.all('/api/notifications/test-email', async (c) => {
  const queryTo = c.req.query('to');
  let bodyTo: string | undefined;
  if (c.req.method === 'POST') {
    try {
      const body = await c.req.json();
      bodyTo = body.to;
    } catch {
      // ignore
    }
  }

  const targetEmail = queryTo || bodyTo || c.env?.GMAIL_USER || (typeof process !== 'undefined' ? process.env?.GMAIL_USER : undefined) || 'hp5741609@gmail.com';
  const emailService = new EmailService(c.env);

  const result = await emailService.sendEmail({
    to: targetEmail,
    subject: '🧪 Commitment Test Email — System Verification',
    text: `Hello!\n\nThis is a test notification from your Commitment accountability system.\n\nTime sent: ${new Date().toISOString()}\nProvider: ${emailService.getProviderName()}\n\nYour email service is configured and operational!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-top: 0;">🧪 System Test Email</h2>
        <p style="color: #334155; line-height: 1.6;">This is a test notification from your <strong>Commitment</strong> accountability system.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #0f172a; font-weight: 600;">Status: Operational ✅</p>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Provider: ${emailService.getProviderName()}</p>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
        <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">Commitment Digital Accountability Contract</p>
      </div>
    `,
  });

  return c.json({ success: result.success, targetEmail, provider: emailService.getProviderName(), result });
});

// SPA & Static Asset 404 Fallback in Hono
app.notFound(async (c) => {
  if (c.env?.ASSETS) {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    if (res.status === 404 && c.req.method === 'GET') {
      const indexUrl = new URL('/index.html', c.req.url);
      return c.env.ASSETS.fetch(new Request(indexUrl.toString()));
    }
    return res;
  }
  return c.text('Not Found', 404);
});

// Export Cloudflare Worker handler
export default {
  async fetch(request: Request, env: Bindings, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // 1. If API route, dispatch to Hono backend app
    if (url.pathname.startsWith('/api')) {
      return app.fetch(request, env, ctx);
    }

    // 2. If Cloudflare Static Assets bound, fetch asset or fallback to index.html for SPA routes
    if (env.ASSETS) {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status === 404 && request.method === 'GET' && !url.pathname.includes('.')) {
        const indexUrl = new URL('/index.html', request.url);
        return env.ASSETS.fetch(new Request(indexUrl.toString()));
      }
      return assetRes;
    }

    return app.fetch(request, env, ctx);
  },
  async scheduled(event: any, env: Bindings, ctx: any) {
    const db = getDb(env.DB);
    if (event.cron === '30 17 * * *' || event.cron === '0 23 * * *') {
      ctx.waitUntil(evaluationService.runReminders(db, env));
    } else {
      ctx.waitUntil(evaluationService.runEvaluation(db, env));
    }
  },
};
