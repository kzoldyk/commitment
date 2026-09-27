# Production Container Build using Oven Bun
FROM oven/bun:1.2-slim AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# Copy source code & build frontend
COPY . .
RUN bun run build

# Run migrations and start server
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "src/server/dev-server.ts"]
