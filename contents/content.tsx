import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import "../style.css"

export const config: PlasmoCSConfig = {
  matches: ["https://juejin.cn/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

interface HeadingData {
  id: string
  text: string
  level: number
}

/**
 * ContentScript组件用于生成和管理页面上的标题导航。
 * 该组件利用React的useState和useEffect钩子，监听页面滚动事件，
 * 动态更新当前选中的标题，并提供点击标题跳转到相应位置的功能。
 *
 * @returns 返回该组件的JSX结构。
 */
const ContentScript = () => {
  // 使用useState管理页面标题列表的状态
  const [headings, setHeadings] = useState<HeadingData[]>([])
  // 使用useState管理当前选中标题的状态
  const [selectedHeading, setSelectedHeading] = useState<string>("")

  // 使用useEffect钩子来收集页面上的标题，并设置滚动事件的监听器
  useEffect(() => {
    // 收集页面上的h1到h6标题，生成包含id、文本和级别的标题数组
    const collectedHeadings = Array.from(
      document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6")
    ).map((heading, index) => {
      const id = `heading-${index}` // 为每个标题生成唯一的id
      heading.id = id // 设置标题元素的id
      return {
        id,
        text: heading.innerText, // 标题文本
        level: parseInt(heading.tagName.replace("H", ""), 10) // 标题级别
      }
    })

    setHeadings(collectedHeadings) // 更新标题列表状态

    // 定义滚动事件处理函数，用于更新当前选中的标题
    const handleScroll = () => {
      let newSelectedHeading = "" // 初始化新的选中标题
      const fromTop = window.scrollY // 获取当前滚动位置

      // 遍历标题列表，找到当前可视区域内的最高标题
      collectedHeadings.forEach((heading) => {
        const headingElement = document.getElementById(heading.id)
        if (headingElement && headingElement.offsetTop <= fromTop) {
          newSelectedHeading = heading.id
        }
      })

      setSelectedHeading(newSelectedHeading) // 更新选中标题状态
    }

    // 添加滚动事件监听器
    window.addEventListener("scroll", handleScroll)

    // 清理函数，移除滚动事件监听器
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, []) // useEffect的依赖数组为空，表示这个Effect只在组件挂载时执行一次

  // 返回该组件的JSX结构
  return (
    <div className="fixed top-1/2 left-0 transform -translate-y-1/2 max-h-screen overflow-y-auto">
      <div className="bg-white p-4 shadow-lg max-w-xs">
        <ul className="list-none">
          {headings.map((heading) => (
            // 遍历标题列表，生成可点击的列表项
            <li
              key={heading.id} // 使用标题的id作为key
              className={`pl-${heading.level} mb-1  text-lg cursor-pointer ${
                selectedHeading === heading.id ? "font-bold" : ""
              }`} // 根据是否为当前选中标题，添加不同的样式
              onClick={() => {
                // 点击列表项时，滚动到对应标题的位置
                const headingElement = document.getElementById(heading.id)
                if (headingElement) {
                  headingElement.scrollIntoView({ behavior: "smooth" })
                }
              }}>
              {heading.text} // 标题文本
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ContentScript
