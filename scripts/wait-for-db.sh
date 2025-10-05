#!/bin/sh
# wait-for-db.sh - Wait for database to be ready before running migrations

echo "Running database migrations..."

# Try to run migrations
if ! npx prisma migrate deploy 2>&1 | tee /tmp/migrate.log; then
  # Check if it's the "database not empty" error
  if grep -q "P3005" /tmp/migrate.log; then
    echo "Database is not empty. Baselining the database..."
    # Mark all migrations as applied without running them
    npx prisma migrate resolve --applied "20250927222214_init"
    echo "Baseline complete. Running migrations again..."
    npx prisma migrate deploy
  else
    echo "Migration failed with unknown error"
    cat /tmp/migrate.log
    exit 1
  fi
fi

echo "Database migrations completed successfully!"
echo "Starting application..."
exec "$@"
