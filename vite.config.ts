import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { Readable } from 'stream';

function honoDevPlugin(): Plugin {
  return {
    name: 'hono-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        try {
          const { default: app } = await server.ssrLoadModule('/src/server/index.ts');
          const protocol = req.headers['x-forwarded-proto'] || 'http';
          const host = req.headers.host || 'localhost:5173';
          const url = new URL(req.url, `${protocol}://${host}`);

          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (Array.isArray(value)) {
              value.forEach((v) => headers.append(key, v));
            } else if (value) {
              headers.set(key, value);
            }
          }

          const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
          const request = new Request(url.toString(), {
            method: req.method,
            headers,
            body: hasBody ? (Readable.toWeb(req) as any) : undefined,
            // @ts-ignore
            duplex: hasBody ? 'half' : undefined,
          });

          const response = await app.fetch(request);

          res.statusCode = response.status;
          response.headers.forEach((val, key) => {
            if (key.toLowerCase() === 'set-cookie') {
              const cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [val];
              res.setHeader('Set-Cookie', cookies);
            } else {
              res.setHeader(key, val);
            }
          });

          if (response.body) {
            const reader = response.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(value);
            }
          }
          res.end();
        } catch (err: any) {
          console.error('API Middleware Error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: { message: err.message || 'Internal Server Error' } }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), honoDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
    },
    build: {
      outDir: 'dist',
    },
  };
});
