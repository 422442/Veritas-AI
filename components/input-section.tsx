"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, FileText, AlertCircle, Sparkles, Globe } from "lucide-react"
import { ProgressBar } from "./progress-bar"

interface InputSectionProps {
  onAnalyze: (input: { text?: string; url?: string }) => void
  isAnalyzing: boolean
}

export function InputSection({ onAnalyze, isAnalyzing }: InputSectionProps) {
  const [activeTab, setActiveTab] = useState("text")
  const [textInput, setTextInput] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [urlError, setUrlError] = useState("")
  const [progressStep, setProgressStep] = useState(0)

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return url.startsWith("http://") || url.startsWith("https://")
    } catch {
      return false
    }
  }

  const handleUrlChange = (value: string) => {
    setUrlInput(value)
    setUrlError("")

    if (value && !validateUrl(value)) {
      setUrlError("Please enter a valid URL starting with http:// or https://")
    }
  }

  const handleSubmit = async () => {
    if (activeTab === "text" && textInput.trim()) {
      setProgressStep(0)
      const progressInterval = setInterval(() => {
        setProgressStep((prev) => {
          if (prev >= 4) {
            clearInterval(progressInterval)
            return 4
          }
          return prev + 1
        })
      }, 800)

      onAnalyze({ text: textInput.trim() })
    } else if (activeTab === "url" && urlInput.trim()) {
      if (!validateUrl(urlInput.trim())) {
        setUrlError("Please enter a valid URL starting with http:// or https://")
        return
      }

      setProgressStep(0)
      const progressInterval = setInterval(() => {
        setProgressStep((prev) => {
          if (prev >= 4) {
            clearInterval(progressInterval)
            return 4
          }
          return prev + 1
        })
      }, 1000)

      onAnalyze({ url: urlInput.trim() })
    }
  }

  const canSubmit = (activeTab === "text" && textInput.trim()) || (activeTab === "url" && urlInput.trim() && !urlError)

  return (
    <div className="space-y-6">
      <ProgressBar isVisible={isAnalyzing} currentStep={progressStep} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 h-10 p-1 bg-muted/50">
                <TabsTrigger
                  value="text"
                  className="flex items-center gap-2 h-8 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Paste Article Text</span>
                  <span className="sm:hidden">Text</span>
                </TabsTrigger>
                <TabsTrigger
                  value="url"
                  className="flex items-center gap-2 h-8 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">Analyze from URL</span>
                  <span className="sm:hidden">URL</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="article-text" className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Article Content
                  </Label>
                  <Textarea
                    id="article-text"
                    placeholder="Paste the complete news article text here for comprehensive fact-checking analysis..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[180px] md:min-h-[200px] resize-none text-sm leading-relaxed border-border/50 focus:border-primary/50 transition-colors"
                    disabled={isAnalyzing}
                  />
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <p className="text-muted-foreground">Minimum 50 characters required</p>
                    <p className="text-muted-foreground">{textInput.length} characters</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4 md:space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="article-url" className="text-sm md:text-base font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Article URL
                  </Label>
                  <Input
                    id="article-url"
                    type="url"
                    placeholder="https://example.com/news-article"
                    value={urlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    disabled={isAnalyzing}
                    className={`h-10 md:h-12 text-sm md:text-base border-border/50 focus:border-primary/50 transition-colors ${urlError ? "border-destructive focus:border-destructive" : ""}`}
                  />
                  {urlError && (
                    <motion.div
                      className="flex items-center gap-2 text-xs md:text-sm text-destructive"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {urlError}
                    </motion.div>
                  )}
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Enter a direct link to a news article. Pathway framework will extract and analyze the content
                    automatically.
                  </p>
                </div>
              </TabsContent>

              <motion.div
                className="pt-4 md:pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isAnalyzing}
                  className="w-full h-12 md:h-14 text-sm md:text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <motion.div className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      <span className="text-sm md:text-base">
                        {activeTab === "url" ? "Pathway Extracting..." : "Pathway Analyzing..."}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-sm md:text-base">Analyze with Pathway AI</span>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
