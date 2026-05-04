#!/bin/sh
set -e

echo "🔄 Running database migrations..."

# Navigate to the API directory where prisma is located
cd /app/apps/api

# Run Prisma migrations
npx prisma migrate deploy

echo "✅ Migrations completed successfully!"

# Optional: Run seed if you want to seed data automatically
# Uncomment the lines below if you want to run seed on startup
# echo "🌱 Seeding database..."
# npx prisma db seed
# echo "✅ Seeding completed!"

echo "🚀 Starting the application..."

# Start the application
exec node /app/apps/api/dist/src/main.js

