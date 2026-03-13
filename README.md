# Amazon Clone — Next.js + AI Search

A full Amazon shopping clone built with Next.js, Tailwind CSS, and AI-powered search using Groq/Anthropic.

## Features
- 🛒 Full shopping cart with quantity controls
- 🔍 AI-powered natural language search (Anthropic API)
- 📱 Responsive design matching Amazon's UI
- 🏷️ Category filtering, sort options, badges
- ✓ Prime, ratings, reviews

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your API key
Edit `.env.local`:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```
Get your key from: https://console.anthropic.com

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
```
src/
├── app/
│   ├── api/ai-search/route.js   # AI search API endpoint
│   ├── globals.css              # Global styles
│   ├── layout.jsx               # Root layout with CartProvider
│   └── page.jsx                 # Main homepage
├── components/
│   ├── Navbar.jsx               # Top navigation bar
│   ├── ProductCard.jsx          # Individual product card
│   ├── CartPanel.jsx            # Slide-in cart drawer
│   ├── AISearch.jsx             # AI search bar + results
│   └── Toast.jsx                # Toast notifications
├── context/
│   └── CartContext.jsx          # Global cart state
└── data/
    └── products.js              # Product catalog
```

## Deploy to Vercel
```bash
git init && git add . && git commit -m "initial commit"
# Push to GitHub, then connect to Vercel
# Add ANTHROPIC_API_KEY in Vercel environment variables
```
