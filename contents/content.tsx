// import cssText from "data-text:~/contents/plasmo-overlay.css"
import { injectMainStyles } from "@/lib/utils"
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import React, { useState } from "react"

import { useMessage } from "@plasmohq/messaging/hook"

import { extractArticle, extractHeadings } from "./lib/extract"
import type { Heading } from "./types"
import { HeadingTree } from "./ui/toc"

export const config: PlasmoCSConfig = {
  // matches: ["https://sspai.com/*"]
  // matches: ["https://juejin.cn/*"]
  matches: ["https://juejin.cn/*"]
  // matches: ["https://stackoverflow.com/*"]
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
        console.log("headings:", headings)

        // 执行其他逻辑...
      }, 1000) // 延迟1000毫秒
    }
    setLoading(false)
  })

  //解决样式覆盖问题
  //解决shadcn-ui问题 2024.5.23
  injectMainStyles(cssText)

  return (
    <div>
      <HeadingTree headings={headings} article={article} loading={loading} />
    </div>
  )
}

export default TocPage

// import cssText from "data-text:~/contents/plasmo-overlay.css"
// import type { PlasmoCSConfig } from "plasmo"
// import React from "react"

// export const config: PlasmoCSConfig = {
//   matches: ["https://www.plasmo.com/*"],
//   css: ["font.css"]
// }

// export const getStyle = () => {
//   const style = document.createElement("style")
//   style.textContent = cssText
//   return style
// }

// const PlasmoOverlay = () => {
//   return (
//     <span
//       className="hw-top"
//       style={{
//         padding: 12
//       }}>
//       CSUI OVERLAY FIXED POSITION
//     </span>
//   )
// }

// export default PlasmoOverlay
