"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, History, Clock, ExternalLink, Trash2, Shield, ChevronLeft, ChevronRight, X, Plus, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import type { AnalysisResult } from "@/app/page"

interface HistoryItem {
  id: string
  timestamp: Date
  results: AnalysisResult
  sourceUrl?: string
  inputType: "text" | "url"
}

interface SidebarProps {
  onLoadHistory: (item: HistoryItem) => void
}

export function Sidebar({ onLoadHistory }: SidebarProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const isMobileScreen = window.innerWidth < 768
      setIsMobile(isMobileScreen)
      if (isMobileScreen && isOpen) {
        setIsOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [isOpen])

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

  const getVerdictIcon = (verdict: string) => {
    const lower = verdict.toLowerCase()
    if (lower.includes("highly authentic") || lower.includes("mostly authentic")) {
      return <CheckCircle className="h-3 w-3 text-green-500" />
    }
    if (lower.includes("highly misleading") || lower.includes("likely misleading")) {
      return <XCircle className="h-3 w-3 text-red-500" />
    }
    return <AlertCircle className="h-3 w-3 text-yellow-500" />
  }

  const getVerdictColor = (verdict: string) => {
    const lower = verdict.toLowerCase()
    if (lower.includes("highly authentic") || lower.includes("mostly authentic")) {
      return "bg-green-500/10 text-green-600 border-green-500/20"
    }
    if (lower.includes("highly misleading") || lower.includes("likely misleading")) {
      return "bg-red-500/10 text-red-600 border-red-500/20"
    }
    return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
  }

  // Expose saveToHistory function globally
  useEffect(() => {
    ;(window as any).saveAnalysisToHistory = saveToHistory
  }, [history])

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 transition-all duration-300 ${
          isOpen 
            ? "left-[14.75rem] top-3" 
            : "left-3 top-3"
        } hover:bg-accent/80 h-8 w-8 p-0 rounded-md bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm`}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: isMobile ? "-100%" : "-384px" }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? "-100%" : "-384px" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 left-0 h-full bg-background/95 backdrop-blur-sm border-r border-border/50 z-40 ${
              isMobile ? "w-60" : "w-60"
            } shadow-lg`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Veritas AI</h2>
                    <p className="text-xs text-muted-foreground">Analysis History</p>
                  </div>
                </div>
                {isMobile && (
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Navigation */}
              <div className="p-3 border-b border-border/50">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2.5 h-8 px-3 text-sm font-medium hover:bg-accent/50"
                  onClick={() => {
                    // Scroll to top and focus on input
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    // Clear any form inputs
                    const textArea = document.querySelector('textarea') as HTMLTextAreaElement
                    const urlInput = document.querySelector('input[type="url"]') as HTMLInputElement
                    if (textArea) textArea.value = ''
                    if (urlInput) urlInput.value = ''
                    // Close sidebar on mobile
                    if (isMobile) setIsOpen(false)
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Analysis
                </Button>
              </div>

              {/* Recent Section */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent</h3>
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 px-3">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <History className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1 font-medium">
                      No analyses yet
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Start analyzing news articles to see your history here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 pb-4">
                    {history.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50"
                        onClick={() => {
                          onLoadHistory(item)
                          if (isMobile) setIsOpen(false)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getVerdictIcon(item.results.verdict)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-foreground/90 line-clamp-1 group-hover:text-foreground">
                                {item.results.verdict}
                              </h4>
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 font-medium">
                                {item.results.confidence}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                              {item.results.summary}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.timestamp.toLocaleDateString()}
                              </span>
                              {item.sourceUrl && (
                                <span className="line-clamp-1 font-mono text-xs max-w-24 truncate">
                                  {new URL(item.sourceUrl).hostname}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
