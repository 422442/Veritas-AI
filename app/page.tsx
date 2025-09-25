"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { InputSection } from "@/components/input-section"
import { ResultsSection } from "@/components/results-section"
import { ExportReport } from "@/components/export-report"
import { Sparkles, Shield, Zap, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export interface AnalysisResult {
  verdict: string
  confidence: number
  summary: string
  claims: Array<{
    text: string
    status: "verified" | "contradicted" | "unverified"
    explanation: string
  }>
  reasoning: string
  sources: Array<{
    title: string
    url: string
  }>
}

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | undefined>()

  const handleAnalyze = async (input: { text?: string; url?: string }) => {
    setIsAnalyzing(true)
    setError(null)
    setResults(null)
    setSourceUrl(input.url)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analysis failed")
      }

      const data = await response.json()
      setResults(data)

      // Save to history
      if ((window as any).saveAnalysisToHistory) {
        ;(window as any).saveAnalysisToHistory(data, input.url, input.url ? "url" : "text")
      }

      toast.success("Pathway analysis completed successfully")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error("Pathway analysis failed: " + errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Header />

      <main className="container mx-auto px-4 pt-32 pb-6 md:pt-36 md:pb-12 relative">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <motion.div
            className="text-center space-y-4 md:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-3">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-medium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                Pathway Framework Integration
              </motion.div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Verify News Authenticity
              </h1>

              <p className="text-base md:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed px-4">
                Advanced AI analysis powered by Pathway Framework with real-time fact-checking to help you distinguish
                between authentic journalism and misinformation.
              </p>
            </div>

            <motion.div
              className="flex flex-wrap justify-center gap-4 md:gap-6 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Shield className="h-3 w-3 md:h-4 md:w-4 text-success" />
                <span className="hidden sm:inline">Real-time verification</span>
                <span className="sm:hidden">Verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Zap className="h-3 w-3 md:h-4 md:w-4 text-warning" />
                <span className="hidden sm:inline">Pathway analysis</span>
                <span className="sm:hidden">Fast</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                <span className="hidden sm:inline">Source validation</span>
                <span className="sm:hidden">Validated</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 md:p-6 text-center backdrop-blur-sm"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
                <p className="text-destructive font-medium text-sm md:text-base">Pathway Analysis Error</p>
              </div>
              <p className="text-destructive/80 text-xs md:text-sm">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <ResultsSection results={results} />
                <ExportReport results={results} sourceUrl={sourceUrl} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}