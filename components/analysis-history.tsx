"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Clock, ExternalLink, Trash2, Shield } from "lucide-react"
import type { AnalysisResult } from "@/app/page"

interface HistoryItem {
  id: string
  timestamp: Date
  results: AnalysisResult
  sourceUrl?: string
  inputType: "text" | "url"
}

interface AnalysisHistoryProps {
  onLoadHistory: (item: HistoryItem) => void
}

export function AnalysisHistory({ onLoadHistory }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("veritas-ai-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setHistory(parsed)
      } catch (error) {
        console.error("Failed to load history:", error)
      }
    }
  }, [])

  const saveToHistory = (results: AnalysisResult, sourceUrl?: string, inputType: "text" | "url" = "text") => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      results,
      sourceUrl,
      inputType,
    }

    const updatedHistory = [newItem, ...history.slice(0, 9)] // Keep only last 10 items
    setHistory(updatedHistory)

    try {
      localStorage.setItem("veritas-ai-history", JSON.stringify(updatedHistory))
    } catch (error) {
      console.error("Failed to save history:", error)
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("veritas-ai-history")
  }

  const deleteItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("veritas-ai-history", JSON.stringify(updatedHistory))
  }

  const getVerdictColor = (verdict: string) => {
    const lower = verdict.toLowerCase()
    if (lower.includes("highly authentic") || lower.includes("mostly authentic")) {
      return "bg-success/10 text-success border-success/20"
    }
    if (lower.includes("highly misleading") || lower.includes("likely misleading")) {
      return "bg-destructive/10 text-destructive border-destructive/20"
    }
    return "bg-warning/10 text-warning border-warning/20"
  }

  // Expose saveToHistory function globally
  useEffect(() => {
    ;(window as any).saveAnalysisToHistory = saveToHistory
  }, [history])

  if (history.length === 0) return null

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Recent Analyses
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{history.length}</Badge>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getVerdictColor(item.results.verdict)} variant="outline">
                            {item.results.verdict}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.results.confidence}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.sourceUrl || item.results.summary.substring(0, 60) + "..."}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => onLoadHistory(item)} className="h-8 w-8 p-0">
                          <Shield className="h-4 w-4" />
                        </Button>
                        {item.sourceUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.sourceUrl, "_blank")}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {history.length > 0 && (
                <div className="pt-3 border-t border-border/50 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    className="w-full text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All History
                  </Button>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
