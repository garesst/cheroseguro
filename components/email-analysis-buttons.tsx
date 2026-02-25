"use client"

import { Button } from "@/components/ui/button"

interface EmailAnalysisButtonsProps {
  scenario_data: any
}

export function EmailAnalysisButtons({ scenario_data }: EmailAnalysisButtonsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Your Analysis:</h3>
      <div className="grid gap-3">
        {scenario_data.options?.map((option: any) => (
          <Button
            key={option.id}
            variant="outline"
            className="w-full justify-start h-auto p-4 text-left"
            onClick={() => {
              // For now, just alert - we'll implement proper state management later
              const feedback = scenario_data.feedback_responses?.[option.id]
              if (feedback) {
                alert(`${feedback.title}\n\n${feedback.message}`)
              }
            }}
          >
            {option.text}
          </Button>
        ))}
      </div>
    </div>
  )
}