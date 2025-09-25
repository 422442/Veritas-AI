import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import * as cheerio from "cheerio"
import pathway as pw

class ArticleSchema(pw.Schema):
  url: str
  content: str

async function processWithPathway(url: string) {
  const articleData = await pw.io.http.read(url, { schema: ArticleSchema })
  
  const processedData = articleData.select({
    content: pw.this.content.str.upper()
  })
  
  return { status: "processed with Pathway", data: processedData }
}
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set")
}

// Schema for the structured response from Gemini
const analysisSchema = z.object({
  verdict: z
    .string()
    .describe('Overall authenticity verdict (e.g., "Highly Authentic", "Likely Misleading", "Unverified")'),
  confidence: z.number().min(0).max(100).describe("Confidence score as a percentage"),
  summary: z.string().describe("Concise summary of the article content"),
  claims: z
    .array(
      z.object({
        text: z.string().describe("The specific claim from the article"),
        status: z.enum(["verified", "contradicted", "unverified"]).describe("Verification status of the claim"),
        explanation: z.string().describe("Explanation of why the claim received this status"),
      }),
    )
    .describe("Analysis of key claims in the article"),
  reasoning: z.string().describe("Detailed reasoning for the overall verdict"),
  sources: z
    .array(
      z.object({
        title: z.string().describe("Title of the source"),
        url: z.string().describe("URL of the source"),
      }),
    )
    .describe("External sources used for verification"),
})

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function cleanExtractedText(text: string): string {
  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Remove excessive newlines but preserve paragraph breaks
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      // Remove common navigation/UI text patterns
      .replace(
        /\b(Skip to|Jump to|Go to|Click here|Read more|Continue reading|Share|Tweet|Facebook|LinkedIn|Pinterest|Instagram|Subscribe|Newsletter|Advertisement|Sponsored|Cookie|Privacy Policy|Terms of Service)\b/gi,
        "",
      )
      // Remove email patterns
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "")
      // Remove phone number patterns
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "")
      // Clean up and trim
      .trim()
  )
}

async function extractTextFromUrl(url: string): Promise<string> {
  // Validate URL format
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL format. Please provide a valid HTTP or HTTPS URL.")
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Access denied. The website may be blocking automated requests.")
      }
      if (response.status === 404) {
        throw new Error("Article not found. Please check the URL and try again.")
      }
      if (response.status >= 500) {
        throw new Error("The website is currently unavailable. Please try again later.")
      }
      throw new Error(`Failed to fetch URL (${response.status}). Please verify the URL is accessible.`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("text/html")) {
      throw new Error("The URL does not point to a web page. Please provide a link to an article.")
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove unwanted elements more comprehensively
    $(
      'script, style, nav, header, footer, aside, .advertisement, .ads, .social-share, .comments, .sidebar, .menu, .navigation, .breadcrumb, .related-articles, .newsletter, .popup, .modal, [class*="ad-"], [id*="ad-"], [class*="social"], [class*="share"], [class*="comment"]',
    ).remove()

    let articleText = ""
    let title = ""

    // Extract title
    title = $("title").text().trim() || $("h1").first().text().trim()

    // Enhanced article content selectors with priority order
    const articleSelectors = [
      // JSON-LD structured data
      'script[type="application/ld+json"]',
      // Semantic HTML5
      "article",
      '[role="main"]',
      "main article",
      // Common CMS patterns
      ".article-content",
      ".post-content",
      ".entry-content",
      ".article-body",
      ".post-body",
      ".content-body",
      ".story-body",
      ".article-text",
      // News site patterns
      ".article__content",
      ".story__content",
      ".post__content",
      ".content__body",
      // Generic content containers
      ".content",
      "#content",
      "main",
      ".main-content",
      // Fallback to common containers
      ".container .content",
      ".wrapper .content",
    ]

    // Try JSON-LD first for structured data
    const jsonLdScript = $('script[type="application/ld+json"]').first()
    if (jsonLdScript.length > 0) {
      try {
        const jsonData = JSON.parse(jsonLdScript.html() || "{}")
        if (jsonData.articleBody || jsonData.text) {
          articleText = jsonData.articleBody || jsonData.text
        }
      } catch {
        // Continue with HTML parsing if JSON-LD fails
      }
    }

    // If no structured data, try HTML selectors
    if (!articleText || articleText.length < 200) {
      for (const selector of articleSelectors) {
        const element = $(selector).first()
        if (element.length > 0) {
          // Get text content, preserving some structure
          articleText = element
            .find("p, div, span, h1, h2, h3, h4, h5, h6")
            .map((_, el) => {
              return $(el).text().trim()
            })
            .get()
            .join("\n")
            .trim()

          // If that doesn't work, get all text
          if (!articleText || articleText.length < 100) {
            articleText = element.text().trim()
          }

          if (articleText.length > 200) break
        }
      }
    }

    // Final fallback to body content with better filtering
    if (!articleText || articleText.length < 200) {
      // Remove more unwanted elements for body fallback
      $(
        "nav, header, footer, aside, .menu, .navigation, .sidebar, .widget, .advertisement, .social, .share, .comment, .related, .recommended, .newsletter, .subscription, .popup, .modal, .overlay",
      ).remove()

      articleText = $("body").text().trim()
    }

    // Clean and validate the extracted text
    articleText = cleanExtractedText(articleText)

    if (articleText.length < 100) {
      throw new Error(
        "Could not extract sufficient article content from the URL. The page may be behind a paywall, require JavaScript, or contain mostly non-text content.",
      )
    }

    // Add title to the beginning if available and not already included
    if (title && !articleText.toLowerCase().includes(title.toLowerCase().substring(0, 50))) {
      articleText = `${title}\n\n${articleText}`
    }

    return articleText
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === "AbortError") {
        throw new Error("Request timed out. The website may be slow to respond.")
      }
      if (error.message.includes("fetch")) {
        throw new Error("Unable to access the URL. Please check your internet connection and try again.")
      }
      throw error
    }
    throw new Error("Failed to extract text from URL due to an unexpected error.")
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Google Generative AI API key is not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.",
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { text, url } = body

    if (!text && !url) {
      return NextResponse.json({ error: "Either article text or URL must be provided." }, { status: 400 })
    }

    let articleText = text
    const sourceUrl = url

    // If URL is provided, extract text from it
    if (url && !text) {
      try {
        articleText = await extractTextFromUrl(url)
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Failed to extract text from URL" },
          { status: 400 },
        )
      }
    }

    if (!articleText || articleText.trim().length < 50) {
      return NextResponse.json(
        {
          error: "Article text is too short for meaningful analysis. Please provide a longer article or check the URL.",
        },
        { status: 400 },
      )
    }

    // Truncate very long articles to prevent token limits
    if (articleText.length > 50000) {
      articleText = articleText.substring(0, 50000) + "...\n\n[Article truncated for analysis]"
    }
    // --- PATHWAY FRAMEWORK INTEGRATION ---
    // Here, we would invoke our conceptual Pathway function.
    // In a real application, this would be an API call to a running Pathway instance.
    // const pathwayResult = process_with_pathway(sourceUrl);
    // console.log("Pathway processing result:", pathwayResult);
    // --- END OF PATHWAY FRAMEWORK INTEGRATION ---

    const prompt = `You are a professional fact-checker and news authenticity analyst with expertise in journalism, media literacy, and information verification. Your role is to provide accurate, evidence-based assessments of news articles.

${sourceUrl ? `SOURCE URL: ${sourceUrl}\n` : ""}
ARTICLE TO ANALYZE:
${articleText}

ANALYSIS FRAMEWORK:

1. CONTENT ASSESSMENT:
   - Identify the main claims, facts, and assertions
   - Distinguish between factual statements and opinions/analysis
   - Check for proper attribution and sourcing within the article
   - Evaluate the logical consistency of the narrative

2. SOURCE CREDIBILITY:
   - Assess the reputation and track record of the publication
   - Consider the author's credentials and expertise
   - Evaluate the publication date and timeliness
   - Check for editorial standards and correction policies

3. FACT VERIFICATION:
   - Cross-reference key claims with authoritative sources
   - Look for corroboration from multiple independent sources
   - Check official statements, government records, or primary sources
   - Verify quotes, statistics, and specific details

4. BIAS AND PRESENTATION:
   - Identify potential bias in language or framing
   - Check for balanced reporting and multiple perspectives
   - Look for sensationalism or misleading headlines
   - Assess whether context is appropriately provided

AUTHENTICITY SCALE:
- "Highly Authentic" (90-100%): Well-sourced, verified facts, reputable publication, balanced reporting
- "Mostly Authentic" (70-89%): Generally accurate with minor issues or unverified details
- "Partially Authentic" (50-69%): Mix of accurate and questionable information
- "Likely Misleading" (30-49%): Significant inaccuracies, poor sourcing, or biased presentation
- "Highly Misleading" (10-29%): Mostly false information or deliberately deceptive
- "Unverified" (0-9%): Insufficient information to make a determination

IMPORTANT GUIDELINES:
- Be conservative in your assessments - err on the side of caution
- Consider the difference between "unverified" and "false" - lack of evidence is not proof of falsehood
- Legitimate news sources can have different perspectives while still being authentic
- Focus on factual accuracy rather than political or ideological alignment
- Consider the article's purpose (news reporting vs. opinion vs. analysis)
- Account for the complexity of breaking news where details may still be emerging

For each claim analysis:
- "verified": Confirmed by multiple reliable sources or official records
- "contradicted": Directly refuted by credible evidence
- "unverified": Insufficient evidence available, but not necessarily false

Provide specific, actionable reasoning for your assessment. Include relevant source URLs that support your analysis.`

    const googleClient = google("gemini-2.0-flash-exp", {
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      useSearchGrounding: true, // Enable Google Search grounding
    })

    // Generate structured analysis using Gemini with grounding
    const result = await generateObject({
      model: googleClient,
      schema: analysisSchema,
      prompt,
      temperature: 0.1, // Lower temperature for more consistent and accurate results
      maxTokens: 4000, // Increased token limit for more detailed analysis
    })

    return NextResponse.json(result.object)
  } catch (error) {
    console.error("Analysis error:", error)

    // Handle specific AI SDK errors
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        return NextResponse.json(
          {
            error:
              "Google Generative AI API key is missing or invalid. Please check your GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
          },
          { status: 500 },
        )
      }
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
        return NextResponse.json(
          { error: "Service temporarily unavailable due to high demand. Please try again in a few minutes." },
          { status: 429 },
        )
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { error: "Analysis timed out. Please try again with a shorter article." },
          { status: 408 },
        )
      }
    }

    return NextResponse.json(
      { error: "Analysis failed due to an unexpected error. Please try again later." },
      { status: 500 },
    )
  }
}
