# Number Voting App

A modern web application where users vote between two random numbers (0-100). Built with Next.js 14, TypeScript, PostgreSQL, and Framer Motion for smooth animations.

## Features

- 🎲 Random number generation (0-100)
- ⚡ Instant voting with smooth animations
- 📊 Vote tracking and statistics
- 🎨 Beautiful gradient UI with glass morphism
- 📱 Fully responsive design
- 🚀 Optimized for Railway deployment

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Railway

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma dev
   npx prisma migrate dev --name init
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Railway Deployment

### Prerequisites
- Railway account ([sign up](https://railway.com))
- GitHub repository with this code

### Deploy Steps

1. **Create a new Railway project:**
   - Go to [Railway](https://railway.com/dashboard)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `number-voting` repository
   - Railway will detect the Dockerfile and begin building

2. **Add PostgreSQL database:**
   - In your Railway project dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Wait for the database to deploy

3. **Configure DATABASE_URL:**
   - Go to your app service → **Variables** tab
   - Click "New Variable" → **Variable** (not Reference)
   - Name: `DATABASE_URL`
   - Value: Go to Postgres service → **Connect** tab → Copy the **Public URL**
   - Paste the public URL (format: `postgresql://postgres:xxxxx@region.proxy.rlwy.net:PORT/railway`)
   - Save and redeploy

4. **Verify deployment:**
   - Railway will automatically:
     - Build using the Dockerfile
     - Run database migrations via `scripts/wait-for-db.sh`
     - Start the application
   - Your app will be available at `https://your-app-name.up.railway.app`

### Important Notes

- **Database Connection**: Use the **public URL** from the Postgres service (not the internal `postgres.railway.internal` reference)
- **Automatic Migrations**: The `wait-for-db.sh` script automatically runs `prisma migrate deploy` on startup
- **Rate Limiting**: For production rate limiting, add Railway Redis (see Environment Variables section)

### Troubleshooting

**P3005 Error (Database not empty)**:
- Delete the PostgreSQL service and create a new one
- This gives you a fresh database without migration conflicts

**Can't reach database**:
- Ensure you're using the public URL, not `postgres.railway.internal`
- Check that "Public Networking" is enabled on the Postgres service

## Environment Variables

| Variable       | Description                         | Required | Default                        |
| -------------- | ----------------------------------- | -------- | ------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string        | Yes      | Set manually in Railway        |
| `NODE_ENV`     | Environment mode                    | No       | `production`                   |
| `REDIS_URL`    | Railway Redis URL for rate limiting | No       | Falls back to no rate limiting |

## API Endpoints

- `GET /api/numbers` - Get two random numbers
- `POST /api/vote` - Submit a vote
- `GET /api/stats` - Get voting statistics

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   └── page.tsx       # Main page
├── components/
│   └── VotingInterface.tsx  # Main voting component
└── lib/
    └── prisma.ts      # Prisma client setup
```

## Performance Features

- **Framer Motion**: Smooth, hardware-accelerated animations
- **Next.js 15**: App Router with React Server Components
- **Turbopack**: Fast development builds
- **Optimized Images**: Next.js automatic image optimization
- **Glass Morphism UI**: Modern, visually appealing design

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Modern browsers with ES2020+ support required for optimal experience.
