# Automatic Database Migrations with Docker Compose

## Overview
The API service is configured to automatically run Prisma migrations every time the Docker container starts.

## How It Works

1. **Entrypoint Script** (`docker-entrypoint.sh`):
   - Runs `prisma migrate deploy` to apply all pending migrations
   - (Optional) Can run `prisma db seed` to seed the database
   - Starts the NestJS application

2. **Dockerfile**:
   - Copies the entrypoint script into the container
   - Makes it executable
   - Sets it as the container's ENTRYPOINT

## Usage

### Starting the Services
```bash
docker compose up -d
```

The migrations will run automatically when the `api` service starts. You'll see output like:
```
🔄 Running database migrations...
✅ Migrations completed successfully!
🚀 Starting the application...
```

### Viewing Migration Logs
```bash
docker compose logs api -f
```

### Creating New Migrations
When you create new migrations locally:

```bash
cd apps/api
npx prisma migrate dev --name your_migration_name
```

Then rebuild and restart the containers:
```bash
docker compose up --build -d
```

### Running Seeds Automatically (Optional)

If you want to automatically seed the database on startup, edit `docker-entrypoint.sh` and uncomment these lines:

```bash
# echo "🌱 Seeding database..."
# npx prisma db seed
# echo "✅ Seeding completed!"
```

**⚠️ Warning**: Only enable auto-seeding for development environments!

## Troubleshooting

### Migrations Fail on Startup
If migrations fail, the container will exit. Check logs:
```bash
docker compose logs api
```

### Force Re-run Migrations
To force migrations to run again:
```bash
docker compose down
docker compose up --build -d
```

### Reset Database (Development Only)
```bash
docker compose down -v  # This will delete all data!
docker compose up -d
```

## Best Practices

1. **Always test migrations locally** before deploying
2. **Backup production databases** before running migrations
3. **Use `prisma migrate deploy`** in production (not `prisma migrate dev`)
4. **Monitor startup logs** after deployments to ensure migrations succeed
5. **Keep migrations small and focused** to minimize downtime

## Migration Commands Reference

| Command | Description |
|---------|-------------|
| `prisma migrate deploy` | Apply pending migrations (production-safe) |
| `prisma migrate dev` | Create and apply migrations (development) |
| `prisma migrate status` | Check migration status |
| `prisma db seed` | Run seed script |
| `prisma studio` | Open Prisma Studio GUI |

