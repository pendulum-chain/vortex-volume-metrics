import React from "react"

type TooltipContentProps = {
  active?: boolean
  payload?: any[]
  label?: string
  showLabel?: boolean
}

export const ChartTooltipContent: React.FC<TooltipContentProps> = ({
  active,
  payload,
  label,
  showLabel = false,
}) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {showLabel && label && (
        <div className="font-medium">
          Week: {label}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item: any, index: number) => (
          <div
            key={index}
            className="flex w-full flex-wrap items-center gap-2"
          >
            <div
              className="shrink-0 h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex flex-1 justify-between items-center leading-none">
              <span className="text-muted-foreground pr-4">{item.name}</span>
              <span className="font-mono font-medium tabular-nums text-foreground">
                ${item.value.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}