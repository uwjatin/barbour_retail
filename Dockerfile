FROM node:20 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Nuxt types first (this creates .nuxt directory with tsconfig files)
RUN npx nuxt prepare

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.output .output
COPY --from=builder /app/node_modules/.prisma node_modules/.prisma

# Copy public assets (including products.json)
COPY public ./public

# Copy prisma schema for migrations
COPY prisma ./prisma

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl --fail http://localhost:3000/api/health || exit 1

# Run migrations on startup, then start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node .output/server/index.mjs"]
