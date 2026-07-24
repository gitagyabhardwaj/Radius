# Radius — Hyperlocal Creator Matching Platform

Intelligently connects brands with hyper-local content creators for geo-targeted marketing campaigns. Features automated batch dispatching, escrow-based payments, and audience-in-locality matching.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS v4 + Framer Motion
- **Backend:** [Convex](https://convex.dev) (real-time DB, serverless functions, file storage, scheduled jobs)
- **Auth:** [Clerk](https://clerk.com) (email/password, Google OAuth)
- **Deployment:** Vercel (frontend) + Convex Cloud (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account

### Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd Radius
   npm install
   ```

2. **Configure Clerk:**
   - Create a Clerk project at [clerk.com](https://clerk.com)
   - Enable Email + Google sign-in methods
   - Create a JWT Template named `convex` (follow [Convex Clerk docs](https://docs.convex.dev/auth/clerk))
   - Copy your Publishable Key

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `VITE_CONVEX_URL` and `VITE_CLERK_PUBLISHABLE_KEY`.

4. **Initialize Convex:**
   ```bash
   npx convex dev
   ```
   This will create your Convex project, deploy the schema, and generate types.

5. **Set Clerk issuer URL in Convex:**
   ```bash
   npx convex env set CLERK_ISSUER_URL https://your-clerk-instance.clerk.accounts.dev
   ```

6. **Seed demo data (optional):**
   Open the Convex dashboard → Functions → `seed:seedDatabase` → Run

7. **Start development:**
   ```bash
   npm run dev
   ```
   This runs both the Vite frontend (port 3000) and Convex dev server in parallel.

## Project Structure

```
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema (6 tables)
│   ├── auth.config.ts    # Clerk auth configuration
│   ├── users.ts          # User CRUD & profile management
│   ├── campaigns.ts      # Campaign creation & queries
│   ├── matching.ts       # Geo-matching (Haversine) & batch assignment
│   ├── batches.ts        # Batch dispatch & auto-cascade
│   ├── offers.ts         # Creator offer accept/decline
│   ├── submissions.ts    # Content upload & verification
│   ├── escrow.ts         # Escrow state machine & ledger
│   ├── helpers.ts        # Shared utilities (Haversine, tx hash, scoring)
│   └── seed.ts           # Demo data seeding
├── src/
│   ├── App.tsx           # Root app with Clerk auth + Convex data
│   ├── main.tsx          # Provider setup (Clerk + Convex)
│   ├── types.ts          # Frontend TypeScript interfaces
│   └── components/
│       ├── EntryGate.tsx       # Auth & onboarding
│       ├── BrandWorkspace.tsx  # Brand campaign management (4 tabs)
│       ├── CreatorWorkspace.tsx # Creator offers & submissions (4 tabs)
│       └── MinimalMap.tsx      # Custom CSS-based Delhi NCR map
└── index.html
```

## Key Features

- **Hyper-Local Geo-Matching:** Haversine-based creator matching within configurable radius
- **Priority Batch Dispatching:** Campaigns dispatch offers in A/B/C waves with automatic cascade
- **Simulated Escrow:** Budget locking, content verification, and automated payout release
- **Real-Time Updates:** Convex reactive queries keep all clients in sync
- **Interactive Map:** Custom-built Delhi NCR map with geofence visualization

## License

MIT
