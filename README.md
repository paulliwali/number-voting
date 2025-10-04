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
- Railway account
- GitHub repository

### Deploy Steps

1. **Connect your GitHub repo to Railway:**
   - Go to [Railway](https://railway.com)
   - Click "Deploy Now" → "Deploy from GitHub repo"
   - Select your repository

2. **Add PostgreSQL database:**
   - In your Railway project dashboard
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable

3. **Configure environment variables:**
   Railway will automatically detect and set most variables, but ensure:
   - `DATABASE_URL` is set (auto-configured with PostgreSQL addon)
   - `NODE_ENV` is set to `production` (auto-configured)

4. **Deploy:**
   - Railway will automatically build and deploy your app
   - Your app will be available at `https://your-app-name.railway.app`

### Database Migration on Railway

The app will automatically run `prisma generate` during the build process. For the initial deployment, Railway will need to run the database migration:

1. In Railway dashboard, go to your service
2. Open the "Settings" tab
3. Add a custom start command: `npx prisma migrate deploy && npm start`

Or manually run the migration after deployment:
```bash
railway run npx prisma migrate deploy
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Railway |
| `NODE_ENV` | Environment mode | `production` |

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
