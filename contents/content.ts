import type { PlasmoCSConfig } from "plasmo"

import { extractArticle, extractHeadings } from "./lib/extract"
import { getContentWindow } from "./lib/iframe"
import { createToc, type Toc, type TocPreference } from "./toc"

export const config: PlasmoCSConfig = {
  matches: ["https://juejin.cn/*"]
}

console.log(
  "You may find that having is not so pleasing a thing as wanting. This is not logical, but it is often true."
)

if (window === getContentWindow()) {
  // 检查当前窗口是否为内容窗口
  let preference: TocPreference = {
    // 初始化TOC偏好设置
    offset: { x: 0, y: 0 }
  }

  let toc: Toc | undefined

  /**
   * 初始化并显示目录。
   * 该函数首先尝试提取文章和标题，如果成功，将创建并显示目录；如果失败，则显示错误消息。
   */
  const start = (): void => {
    const article = extractArticle()
    console.log(article)
    const headings = article && extractHeadings(article)
    // if (!(article && headings && headings.length)) {
    //   console.log("No article or headings found.")
    //   return
    // }

    // if (toc) {
    //   // toc.dispose()
    // }
    // toc = createToc({ article, preference })
    console.log(headings)
  }

  // 添加Chrome扩展的消息监听器
  chrome.runtime.onMessage.addListener(
    (request: "toggle" | "prev" | "next", sender, sendResponse) => {}
  )

  start() // 启动目录生成过程
}
