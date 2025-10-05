#!/bin/sh
# wait-for-db.sh - Wait for database to be ready before running migrations

echo "Waiting for database to be ready..."

# Maximum number of retries
MAX_RETRIES=60
RETRY_COUNT=0

# Keep trying to run migrations until it succeeds
until npx prisma migrate deploy; do
  RETRY_COUNT=$((RETRY_COUNT + 1))

  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Failed to connect to database after $MAX_RETRIES attempts"
    echo "Last error shown above"
    exit 1
  fi

  echo "Database not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES)... retrying in 2s"
  sleep 2
done

echo "Database migrations completed successfully!"
echo "Starting application..."
exec "$@"
