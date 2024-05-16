// import cssText from "data-text:~/contents/plasmo-overlay.css"
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetOverlayAnchor } from "plasmo"
import React from "react"
import Draggable from "react-draggable"

import { extractArticle, extractHeadings } from "./lib/extract"
import { HeadingTree } from "./ui/toc"

export const config: PlasmoCSConfig = {
  matches: ["https://sspai.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const TocPage = () => {
  const article = extractArticle()
  const headings = article && extractHeadings(article)

  console.log(headings)

  return (
    <div>
      <HeadingTree headings={headings} article={article} />
    </div>
  )
}

export default TocPage
