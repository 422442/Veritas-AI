"use client"

import { motion } from "framer-motion"
import { CheckCircle, Circle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ProgressStep {
  id: string
  label: string
  description: string
  completed: boolean
  active: boolean
}

interface ProgressBarProps {
  isVisible: boolean
  currentStep: number
}

export function ProgressBar({ isVisible, currentStep }: ProgressBarProps) {
  const steps: ProgressStep[] = [
    {
      id: "pathway-connect",
      label: "Connecting to Pathway",
      description: "Establishing connection to Pathway framework",
      completed: currentStep > 0,
      active: currentStep === 0,
    },
    {
      id: "pathway-extract",
      label: "Pathway Data Extraction",
      description: "Using Pathway to extract and process content",
      completed: currentStep > 1,
      active: currentStep === 1,
    },
    {
      id: "pathway-sources",
      label: "Pathway Source Validation",
      description: "Pathway framework validating external sources",
      completed: currentStep > 2,
      active: currentStep === 2,
    },
    {
      id: "ai-analysis",
      label: "AI Analysis",
      description: "Pathway-powered AI performing authenticity analysis",
      completed: currentStep > 3,
      active: currentStep === 3,
    },
    {
      id: "pathway-report",
      label: "Generating Report",
      description: "Pathway framework compiling final results",
      completed: currentStep > 4,
      active: currentStep === 4,
    },
  ]

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-base font-semibold text-primary mb-1">Analysis in Progress</h3>
              <p className="text-xs text-muted-foreground">
                Powered by Pathway Framework
              </p>
            </div>

            <div className="space-y-2">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    step.active
                      ? "bg-primary/10 border border-primary/20"
                      : step.completed
                        ? "bg-success/10 border border-success/20"
                        : "bg-muted/30"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : step.active ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm ${
                        step.active ? "text-primary" : step.completed ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-muted/50 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/80"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}