<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000?style=for-the-badge&logo=vercel" alt="Vercel" />
</p>

<h1 align="center">🎯 RankSure</h1>
<h3 align="center">AP EAPCET College Predictor 2025</h3>

<p align="center">
  <strong>Enter your rank → Get instant, data-driven predictions for 328+ engineering colleges in Andhra Pradesh.</strong>
</p>

<p align="center">
  <a href="https://ranksure.vercel.app">🌐 Live App</a> •
  <a href="#-features">Features</a> •
  <a href="#-prediction-algorithm">Algorithm</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Setup</a>
</p>

---

## 🧠 What is RankSure?

Every year, **~3 lakh students** take the AP EAPCET exam and face the overwhelming task of choosing the right engineering college during counselling. Most rely on outdated PDFs, word-of-mouth, or expensive coaching centre advice.

**RankSure** solves this with a free, instant, statistically-powered prediction engine that tells you exactly which colleges are **Safe**, **Medium**, or **Reach** for your rank — backed by **6,243 official cutoff records** spanning 3 years (2023–2025).

> **Free. No login required. No ads gating results.**

---

## ✨ Features

### 🎯 Core Prediction Engine
- **Trend-Adjusted Normal Distribution Model** — not simple threshold matching
- **3-year time-series analysis** with volatility measurement and trend dampening
- **Probability percentages** (1–99%) for every college-branch combination
- **Tiered classification**: Safe (≥75%) · Medium (40–74%) · Reach (<40%)

### 🏫 College Intelligence (328+ Colleges)
- **Detailed profiles** — location, type (Govt/Private/Autonomous), annual fees, placement ratings
- **Cutoff history pages** — interactive Recharts trend charts across 3 years per branch
- **Transport & accessibility** — nearest railway stations, bus stands, and airports with distances
- **Side-by-side comparison** — compare up to 3 colleges with composite scoring (weighted: 40% probability, 35% placement, 25% fees)

### 🛠️ Student Tools
- **Counselling Dates Tracker** — live countdown timers with PASSED/UPCOMING/SOON badges
- **Scholarship Finder** — 10 government schemes (AP Vidya Deevena, Vasathi Deevena, TS ePASS, etc.) with eligibility checking
- **Fee Reimbursement Calculator** — instant eligibility check for tuition reimbursement
- **Document Checklist** — complete counselling preparation list

### 📝 Blog & Guides
- EAPCET Counselling Process 2025 — Complete Guide
- Best Engineering Colleges in AP — Data-Driven Rankings
- Rank-wise College List — Breakdown by rank range

### 📱 Mobile-First Design
- Premium glassmorphic UI with warm cream + deep navy design system
- Touch-optimized targets (≥44px), full-screen slide-out navigation drawer
- Responsive comparison cards that replace desktop tables on mobile
- Bottom navigation bar for instant access to key sections

### 🔍 SEO & GEO Optimized
- Server-side rendering for all 138+ pages with `generateStaticParams`
- JSON-LD structured data (Organization, WebApplication, Article, FAQPage, BreadcrumbList)
- Dynamic sitemap with 660+ URLs
- AI crawler optimization (`llms.txt`, `llms-full.txt`)

---

## 🧮 Prediction Algorithm

RankSure uses a **Trend-Adjusted Normal Distribution Model** — a statistical approach that goes beyond simple rank-to-cutoff matching:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. TIME-SERIES TREND ANALYSIS                             │
│      Compare latest year's cutoff with previous year        │
│      Dampen trend by 50%, clamp to ±15% swing               │
│                                                             │
│   2. EXPECTED CUTOFF                                        │
│      expected = latestClosing + trendAdjustment             │
│                                                             │
│   3. VOLATILITY (SPREAD MEASUREMENT)                        │
│      σ = max(spread × 0.4, expected × 0.05)                │
│      where spread = closingRank − openingRank               │
│                                                             │
│   4. Z-SCORE → PROBABILITY                                  │
│      z = (expected − userRank) / σ                          │
│      probability = Φ(z)  [Normal CDF]                       │
│                                                             │
│   5. HARD THRESHOLD CAPS                                    │
│      If rank > 1.5× expected → cap at 5%                   │
│                                                             │
│   6. TIER ASSIGNMENT                                        │
│      ≥ 75% → Safe  │  40–74% → Medium  │  < 40% → Reach   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

This model captures **cutoff trends** (are ranks getting more competitive year-over-year?) and **admission volatility** (how wide is the opening-to-closing rank spread?) to produce meaningfully calibrated probabilities rather than binary yes/no answers.

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router, Turbopack) | SSR, SSG, API routes, ISR |
| **Frontend** | React 19 + TypeScript 5 | UI components with strict typing |
| **Styling** | Tailwind CSS 4 + Vanilla CSS | Design system with CSS custom properties |
| **Database** | Supabase (PostgreSQL) | 6,243 cutoff records, real-time queries |
| **Charts** | Recharts 3 | Interactive cutoff trend visualizations |
| **Icons** | Lucide React + Material Symbols | Consistent iconography |
| **Deployment** | Vercel | Edge CDN, automatic previews |
| **Data Pipeline** | Python + TypeScript scripts | CSV → JSON → Supabase import |
| **SEO** | Dynamic sitemaps, JSON-LD, OG images | Full search engine optimization |

---

## 📁 Project Structure

```
eapcet-predictor/
├── app/
│   ├── api/
│   │   ├── predict/route.ts      # POST: prediction engine, GET: filter options
│   │   ├── college/route.ts      # College detail data API
│   │   ├── geocode/route.ts      # Location geocoding proxy
│   │   └── track/route.ts        # Analytics event tracking
│   ├── blog/
│   │   ├── page.tsx              # Blog listing (SSG)
│   │   └── [slug]/page.tsx       # Blog post template with Article JSON-LD
│   ├── college/
│   │   └── [name]/
│   │       ├── page.tsx          # College detail (SSR + ISR, 1-day revalidation)
│   │       └── cutoff/page.tsx   # Cutoff history with trend charts
│   ├── compare/page.tsx          # Side-by-side college comparison
│   ├── predict/page.tsx          # Standalone prediction page
│   ├── tools/
│   │   ├── counselling/          # Counselling dates + countdown tracker
│   │   ├── reimbursement/        # Fee reimbursement eligibility checker
│   │   └── scholarships/         # 10 government scholarship schemes
│   ├── layout.tsx                # Root layout with JSON-LD schemas
│   ├── page.tsx                  # Homepage — prediction form + results
│   ├── globals.css               # Design system (36KB+ of custom styles)
│   ├── sitemap.ts                # Dynamic sitemap (660+ URLs)
│   └── opengraph-image.tsx       # Dynamic OG image generation
├── components/
│   ├── college/
│   │   ├── CollegeDetailClient   # Client-side college detail interactions
│   │   ├── ComparisonTable       # Battle-card comparison grid
│   │   ├── RecommendationCard    # Composite score + winner badge
│   │   ├── CutoffClient          # Trend chart + historical table
│   │   ├── FilterBar             # Branch/location/type filter chips
│   │   └── TransportSection      # Nearest hubs (rail/bus/air)
│   ├── layout/
│   │   ├── Header.tsx            # Desktop/mobile unified header
│   │   └── BottomNav.tsx         # Mobile bottom navigation bar
│   ├── MobileNav.tsx             # Full-screen slide drawer
│   ├── Breadcrumb.tsx            # Breadcrumbs + BreadcrumbList JSON-LD
│   ├── CounsellingWidget.tsx     # Live countdown + date cards
│   ├── DocumentChecklist.tsx     # Counselling document checklist
│   └── ShareButton.tsx           # WhatsApp/native share
├── lib/
│   ├── prediction.ts             # Core prediction logic
│   ├── scholarshipRules.ts       # 10 scheme definitions + eligibility engine
│   ├── counsellingDates.ts       # AP/TS counselling date data
│   ├── supabase.ts               # Supabase client singleton
│   ├── share.ts                  # Share text generators
│   └── utils.ts                  # parseRank, parseFee, formatINR, etc.
├── data/
│   ├── eapcet_data.json          # 6,243 cutoff records (1.9 MB)
│   └── blog-posts.json           # Blog article content
├── scripts/
│   ├── convert_csv.py            # CSV → JSON data converter
│   ├── importData.ts             # JSON → Supabase bulk importer
│   └── supabase_import.py        # REST API import script
├── public/
│   ├── robots.txt                # Search engine + AI crawler rules
│   ├── llms.txt                  # AI crawler guidance
│   └── llms-full.txt             # Detailed AI-optimized site description
└── types/
    └── index.ts                  # Shared TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Supabase** project with the `eapcet_cutoffs` table populated

### 1. Clone the repository

```bash
git clone https://github.com/charankumarnaidu703-sketch/eapcet-predictor.git
cd eapcet-predictor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Import data into Supabase

```bash
# Convert CSV data to JSON
npm run convert:data

# Import into Supabase
npm run import:data
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the RankSure homepage.

### 6. Build for production

```bash
npm run build
npm start
```

---

## 📊 Database Schema

The core `eapcet_cutoffs` table in Supabase:

| Column | Type | Description |
|--------|------|-------------|
| `id` | `bigint` | Primary key |
| `college_name` | `text` | Full college name |
| `branch` | `text` | Engineering branch (e.g., CSE, ECE, MECH) |
| `year` | `int` | Academic year (2021–2025) |
| `opening_rank` | `text` | Opening rank for the year |
| `closing_rank` | `text` | Closing rank for the year |
| `location` | `text` | District/city |
| `type` | `text` | Govt / Private / Autonomous / University |
| `annual_fees` | `text` | Annual fee string |
| `placement_rating` | `float` | Rating out of 5 |

**Stats:** 328 colleges · 117 branches · 26 locations · 6,243 records

---

## 🌐 Deployment

RankSure is deployed on **Vercel** with automatic deployments on push to `main`.

```bash
# Production URL
https://ranksure.vercel.app
```

### Vercel Configuration
- **Framework Preset:** Next.js
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Environment Variables:** Set in Vercel Dashboard (DATABASE_URL, GOOGLE_MAPS_API_KEY, etc.)

---

## 🗺️ Roadmap

- [x] Rank-based college prediction engine
- [x] Detailed college profiles with cutoff history
- [x] Side-by-side college comparison (up to 3)
- [x] Counselling dates tracker with live countdown
- [x] Scholarship finder (10 government schemes)
- [x] Fee reimbursement calculator
- [x] Blog with SEO-optimized guides
- [x] Mobile-first responsive design
- [x] Full SEO + GEO optimization
- [x] Google AdSense integration
- [ ] Push notifications for counselling date reminders
- [ ] User accounts with saved predictions
- [ ] Branch-wise cutoff prediction (ML model)
- [ ] TS EAMCET data expansion
- [ ] Multi-language support (Telugu)

---

## 🤝 Contributing

Contributions are welcome! If you'd like to help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with ❤️ for AP EAPCET aspirants</strong>
  <br />
  <a href="https://ranksure.vercel.app">ranksure.vercel.app</a>
</p>
