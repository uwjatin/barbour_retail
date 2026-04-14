# Barbour Application Deployment Guide

## Prerequisites

### 1. Traefik Network Setup
The Traefik proxy must be running with a `traefik-public` network:

```bash
docker network create traefik-public
```

### 2. Cloudflare Configuration
Ensure Traefik has the `cloudflare` cert resolver configured in its settings.

### 3. Git Repository
The application should be pushed to a Git repository accessible by Portainer.

## Portainer Deployment Steps

### Option 1: Git Repository Deployment (Recommended)

1. **Navigate to Portainer Stack Section**
   - Go to "Stacks" in the left menu
   - Click "Add stack"

2. **Configure Stack**
   - **Name**: `barbour`
   - **Build method**: Git Repository
   - **Repository URL**: Your Git repository URL
   - **Repository Branch**: main (or your branch)
   - **Repository Authentication**: If private, enter credentials
   - **Compose path**: `stack.yml`

3. **Set Environment Variables**
   Click "Advanced mode" or "Environment variables" and add:
   ```
   DB_PASSWORD=barbour2024secure
   NOTIFICATION_MODE=mock
   ```
   
   Optional (for real notifications):
   ```
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=your_phone
   EMAIL_HOST=smtp.host
   EMAIL_USER=smtp_user
   EMAIL_PASSWORD=smtp_password
   EMAIL_FROM=noreply@styleanglais.fr
   ```

4. **Deploy**
   - Click "Deploy the stack"
   - Monitor the logs to ensure successful startup

### Option 2: Docker Compose Deployment

1. **Navigate to Portainer Stack Section**
   - Go to "Stacks" → "Add stack"

2. **Configure Stack**
   - **Name**: `barbour`
   - **Build method**: Web editor
   - **Compose file**: Paste the content of `docker-compose.yml`

3. **Set Environment Variables**
   Same as Option 1.

4. **Deploy**
   - Click "Deploy the stack"

## Verification

### 1. Check Container Status
```bash
docker ps | grep barbour
```

Expected output:
- `app` container should be running and healthy
- `db` container should be running

### 2. Verify HTTPS Access
- Navigate to: https://barbour.unikweb.fr
- Should show the application with valid SSL certificate

### 3. Test API Endpoints
```bash
curl https://barbour.unikweb.fr/api/health
curl https://barbour.unikweb.fr/api/products
```

### 4. Check Traefik Routing
```bash
docker logs <traefik-container-id> | grep barbour
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `NODE_ENV` | Environment mode | `production` |
| `NOTIFICATION_MODE` | Notification type | `mock` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | - |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | - |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | - |
| `EMAIL_HOST` | SMTP server host | - |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASSWORD` | SMTP password | - |
| `EMAIL_FROM` | Sender email | `noreply@styleanglais.fr` |

## Troubleshooting

### Database Connection Issues
```bash
# Check database logs
docker logs barbour_db_1

# Verify database is accessible
docker exec -it barbour_db_1 psql -U postgres -d styleanglais
```

### Application Startup Issues
```bash
# Check app logs
docker logs barbour_app_1

# Verify Prisma migrations ran
docker exec -it barbour_app_1 ls -la /app/prisma/migrations
```

### Traefik Routing Issues
```bash
# Check Traefik logs
docker logs traefik | grep barbour

# Verify network connectivity
docker network inspect traefik-public
```

### SSL Certificate Issues
```bash
# Check certificate resolver logs
docker logs traefik | grep cloudflare

# Verify DNS propagation
dig barbour.unikweb.fr
```

## Database Migration

The application runs Prisma migrations automatically on container startup via the Dockerfile CMD:

```dockerfile
CMD ["/bin/sh", "-c", "cd /app && ./node_modules/.bin/prisma migrate deploy && node .output/server/index.mjs"]
```

## Seed Data

To re-seed the database (use with caution in production):

```bash
docker exec -it barbour_app_1 node prisma/seed.mjs
```

## Scaling

To scale the application:

```bash
docker update --restart=always barbour_app_1
```

Note: For horizontal scaling with multiple replicas, consider using Docker Swarm or Kubernetes with proper session management.
