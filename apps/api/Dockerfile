# Multi-stage build for NestJS API (Simplified without Turbo)
FROM node:20-alpine AS base

# Install OpenSSL and required libraries for Prisma
RUN apk update && apk upgrade
RUN apk add --no-cache openssl libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Create workspace structure and copy package files
RUN mkdir -p apps/api packages/shared
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Copy prisma schema before npm install (needed for postinstall script)
COPY apps/api/prisma ./apps/api/prisma

# Configure npm for better reliability
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5

# Install dependencies with retry logic
RUN npm ci --omit=dev false || npm ci --omit=dev false || npm ci --omit=dev false

# Build API
FROM base AS builder
WORKDIR /app/apps/api

# Copy dependencies from deps stage (to parent directory)
COPY --from=deps /app/node_modules ../../node_modules

# Copy shared package source
COPY packages/shared ../../packages/shared

# Copy API source and configs
COPY apps/api/package*.json ./
COPY apps/api/tsconfig*.json ./
COPY apps/api/nest-cli.json ./
COPY apps/api/src ./src
COPY apps/api/prisma ./prisma

# Generate Prisma Client
RUN npm install prisma@6.17.1 @prisma/client@6.17.1
RUN npx prisma generate

# Build the application
RUN npx nest build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Public URLs for WebSocket and API (used by server config or CORS)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG FRONTEND_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV FRONTEND_URL=${FRONTEND_URL}

# Install wget for health checks
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy all package.json files to install *only* prod dependencies
COPY --chown=nestjs:nodejs package*.json ./
RUN mkdir -p apps/api packages/shared
COPY --chown=nestjs:nodejs apps/api/package*.json ./apps/api/
COPY --chown=nestjs:nodejs packages/shared/package*.json ./packages/shared/

# Copy prisma schema before installing dependencies
COPY --chown=nestjs:nodejs apps/api/prisma ./apps/api/prisma

# Install *only* production dependencies (this will also run prisma generate via postinstall)
RUN npm ci --omit=dev

# Generate Prisma Client explicitly to ensure it's in the right location
RUN cd apps/api && npx prisma generate

# Copy the built application from the builder
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist

# Copy shared package (needed at runtime for workspace resolution)
COPY --chown=nestjs:nodejs packages/shared ./packages/shared

# Copy the runtime-needed package.json for the app
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json

# Copy the entrypoint script
COPY --chown=nestjs:nodejs apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x ./apps/api/docker-entrypoint.sh

USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use the entrypoint script instead of direct node command
ENTRYPOINT ["/app/apps/api/docker-entrypoint.sh"]
