// import cssText from "data-text:~/contents/plasmo-overlay.css"
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import React, { useState } from "react"

import { useMessage } from "@plasmohq/messaging/hook"

import { extractArticle, extractHeadings } from "./lib/extract"
import { Heading } from "./types"
import { HeadingTree } from "./ui/toc"

export const config: PlasmoCSConfig = {
  // matches: ["https://sspai.com/*"]
  matches: ["https://juejin.cn/*"]
  // matches: ["https://juejin.cn/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const TocPage = () => {
  const [headings, setHeadings] = useState<Heading[]>()
  const [loading, setLoading] = useState(false)
  const [article, setArticle] = useState<HTMLElement>()

  useMessage<string, string>(async (req, res) => {
    setLoading(true)
    if (req.name === "showHeading") {
      setTimeout(() => {
        const result = extractArticle()
        const headings = result && extractHeadings(result)
        setArticle(result)
        setHeadings(headings)
        // 执行其他逻辑...
      }, 1000) // 延迟500毫秒

      console.log("headings:", headings)
    }
    setLoading(false)
  })

  return (
    <div>
      <HeadingTree headings={headings} article={article} loading={loading} />
    </div>
  )
}

export default TocPage
