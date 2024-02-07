"use client"

import * as React from "react"

import { Progress } from "@/components/ui/progress"

export default function Loading() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className="relative top-52 flex justify-center">
        <Progress value={progress} className="w-[60%] bg-green-950" />
      </div>
    </>
  )
}
