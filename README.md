# Veritas AI - News Authenticity Analyzer

A Next.js application that uses Google's Gemini AI and the Pathway framework to analyze news articles for authenticity and fact-checking.

## Features

- **AI-Powered Analysis**: Uses Google Gemini AI for in-depth analysis.
- **Real-time Data Processing**: Leverages the Pathway framework for real-time data ingestion and processing.
- **URL Extraction**: Can extract and analyze content from web URLs.
- **Fact Checking**: Provides detailed claim verification.
- **Modern UI**: Built with Next.js, React, and Tailwind CSS.

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Google Gemini API key
- Python 3.10+ and Pathway installed for backend processing (conceptual)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd veritas-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` and add your Google Gemini API key:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
   ```

4. **Get your Google Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key or use an existing one
   - Copy the key to your `.env.local` file

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel Deployment

### Step 1: Deploy to Vercel

1. **Connect your repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure build settings**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
   - Output Directory: `.next` (default)

### Step 2: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following environment variable:
   - **Name**: `GOOGLE_GENERATIVE_AI_API_KEY`
   - **Value**: Your Google Gemini API key
   - **Environments**: Select Production, Preview, and Development

### Step 3: Deploy

1. Click **Deploy** in Vercel
2. Wait for the deployment to complete
3. Test your application at the provided Vercel URL

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google Gemini API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL (for production) | No |

## API Endpoints

### POST /api/analyze

Analyzes a news article for authenticity. This endpoint conceptually relies on a Pathway pipeline for data ingestion and preprocessing before sending the content to the Gemini AI model.

**Request Body:**

```json
{
  "text": "Article text to analyze...", // Optional if URL provided
  "url": "https://example.com/article" // Optional if text provided
}
```

**Response:**

```json
{
  "verdict": "Highly Authentic",
  "confidence": 85,
  "summary": "Article summary...",
  "claims": [
    {
      "text": "Specific claim from article",
      "status": "verified",
      "explanation": "Explanation of verification"
    }
  ],
  "reasoning": "Detailed reasoning for verdict",
  "sources": [
    {
      "title": "Source title",
      "url": "https://source-url.com"
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **"Google Generative AI API key is not configured"**
   - Make sure you've added the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable
   - Verify the API key is correct and active

2. **Build failures on Vercel**
   - Check that all dependencies are listed in `package.json`
   - Ensure TypeScript errors are resolved

3. **API timeouts**
   - The Vercel function timeout is set to 30 seconds
   - Large articles are automatically truncated to prevent token limits

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Vercel deployment docs](https://vercel.com/docs)
- Visit [Google AI Studio](https://aistudio.google.com/) for API help

## Project Structure

```
├── app/
│   ├── api/analyze/route.ts    # Main API endpoint with Pathway integration
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                 # React components
│   ├── ui/                     # Reusable UI components
│   └── ...                     # Feature components
├── lib/
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Pathway Framework** - Real-time data processing and pipeline management
- **Google Gemini AI** - AI analysis
- **Cheerio** - Web scraping
- **Zod** - Schema validation
- **Vercel** - Deployment platform
