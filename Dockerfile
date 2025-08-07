# Multi-stage build for Encore.ts application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application with Encore.ts
RUN npx encore build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 encore

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from Encore.ts build
COPY --from=builder --chown=encore:nodejs /app/dist ./dist
COPY --from=deps --chown=encore:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=encore:nodejs /app/package*.json ./

# Switch to non-root user
USER encore

# Expose the port the app runs on
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application
CMD ["npx", "encore", "run"]
