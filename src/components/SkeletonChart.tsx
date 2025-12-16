import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export function SkeletonChart() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-stretch space-y-0 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-6">
          <CardTitle className="h-6 w-32 animate-pulse rounded bg-muted/50" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted/30" />
        </div>
        <div className="flex">
          <div className="flex flex-col justify-center gap-1 border-l px-8 py-6 w-[200px]">
             <div className="h-3 w-20 animate-pulse rounded bg-muted/30 mb-1" />
             <div className="h-8 w-24 animate-pulse rounded bg-muted/50" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-6">
        <div className="h-[250px] w-full animate-pulse rounded bg-muted/20" />
      </CardContent>
    </Card>
  )
}
