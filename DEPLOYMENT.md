# Vercel Deployment Guide for Veritas AI

This guide will walk you through deploying your Veritas AI application to Vercel with Google Gemini API integration.

## Before You Start

1. **Get a Google Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the generated key (you'll need it for Vercel)

2. **Ensure your code is pushed to GitHub/GitLab/Bitbucket**

## Deployment Steps

### 1. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Select **"Import Git Repository"**
4. Choose your repository (authorize GitHub if needed)
5. Select your `veritas-ai` repository

### 2. Configure Project Settings

Vercel should auto-detect this as a Next.js project. Verify these settings:

- **Framework Preset**: Next.js
- **Root Directory**: `.` (default)
- **Build Command**: `pnpm build` 
- **Install Command**: `pnpm install`
- **Output Directory**: `.next` (default)

### 3. Add Environment Variables

**IMPORTANT**: Before clicking Deploy, add your environment variables:

1. In the import screen, expand **"Environment Variables"**
2. Add the following variable:
   - **Name**: `GOOGLE_GENERATIVE_AI_API_KEY`
   - **Value**: Paste your Google Gemini API key
   - **Environment**: Select all (Production, Preview, Development)

### 4. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-3 minutes)
3. Once deployed, you'll get a URL like `https://your-project.vercel.app`

### 5. Test Your Deployment

1. Visit your Vercel URL
2. Try analyzing a news article or URL
3. Check that the AI analysis works properly

## After Deployment

### Managing Environment Variables

To update environment variables after deployment:

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Click **Edit** next to `GOOGLE_GENERATIVE_AI_API_KEY`
5. Update the value and save
6. **Important**: Redeploy your application for changes to take effect

### Custom Domain (Optional)

To add a custom domain:

1. In your Vercel project dashboard
2. Go to **Settings** → **Domains**
3. Add your domain name
4. Follow DNS configuration instructions

### Monitoring and Logs

- **Functions Logs**: View in Vercel dashboard → Functions tab
- **Analytics**: Available in Vercel dashboard → Analytics tab
- **Performance**: Monitor Core Web Vitals in Analytics

## Troubleshooting

### Build Failures

If deployment fails:

1. Check the **Build Logs** in Vercel dashboard
2. Common issues:
   - Missing dependencies in package.json
   - TypeScript errors
   - Environment variable issues

### API Key Issues

If you get "API key not configured" errors:

1. Verify the environment variable name is exactly: `GOOGLE_GENERATIVE_AI_API_KEY`
2. Ensure the API key is valid and active
3. Check that the variable is set for the correct environment
4. Redeploy after making changes

### Function Timeouts

If analysis requests timeout:

1. The function timeout is set to 30 seconds (maximum for Hobby plan)
2. Large articles are automatically truncated
3. Consider upgrading to Pro plan for longer timeouts if needed

### CORS Issues

If you encounter CORS errors:

1. This shouldn't happen with the current setup
2. All API routes are on the same domain
3. Contact support if you experience CORS issues

## Next Steps

### Production Optimizations

1. **Enable Analytics**: Already included with `@vercel/analytics`
2. **Add Error Monitoring**: Consider adding Sentry or similar
3. **Performance Monitoring**: Use Vercel Analytics
4. **SEO**: Add proper meta tags and structured data

### Scaling Considerations

1. **Rate Limiting**: Implement rate limiting for the API
2. **Caching**: Consider caching responses for repeated URLs
3. **Database**: Add database for storing analysis history
4. **Authentication**: Add user authentication for personalized experience

## Security Notes

1. **Never commit API keys** to your repository
2. **Use environment variables** for all sensitive data
3. **Keep dependencies updated** for security patches
4. **Monitor function usage** to avoid unexpected charges

## Support

- **Vercel Support**: [vercel.com/help](https://vercel.com/help)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Google AI Docs**: [ai.google.dev](https://ai.google.dev)

## Quick Reference

### Environment Variables
```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### Vercel CLI Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from command line
vercel --prod

# View logs
vercel logs
```

### API Endpoint
```
POST https://your-project.vercel.app/api/analyze
```

Your Veritas AI application is now live on Vercel! 🎉
