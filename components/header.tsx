"use client"

import { motion } from "framer-motion"
import { ShieldCheck } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <motion.header
      className="border-b border-border bg-background/95 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShieldCheck className="h-5 w-5 md:h-7 md:w-7 text-primary" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Veritas AI
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">Powered by Pathway Framework</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <motion.div
              className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full bg-success/10 border border-success/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-success hidden sm:inline">AI Online</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
