// useHeadings.ts
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

export interface HeadingData {
  id: string
  text: string
  level: number
}

export const useHeadings = () => {
  const [headings, setHeadings] = useState<HeadingData[]>([])

  useEffect(() => {
    const collectedHeadings: HeadingData[] = Array.from(
      document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6")
    ).map((heading, index) => {
      const id = `heading-${index}`
      heading.id = id // Assign an ID
      return {
        id,
        text: heading.innerText,
        level: parseInt(heading.tagName.replace("H", ""), 10)
      }
    })

    setHeadings(collectedHeadings)
  }, [])

  return headings
}
