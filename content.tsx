import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

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

const ContentScript = () => {
  const [headings, setHeadings] = useState<HeadingData[]>([])
  const [selectedHeading, setSelectedHeading] = useState<string>("")

  useEffect(() => {
    const collectedHeadings = Array.from(
      document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6")
    ).map((heading, index) => {
      const id = `heading-${index}`
      heading.id = id
      return {
        id,
        text: heading.innerText,
        level: parseInt(heading.tagName.replace("H", ""), 10)
      }
    })

    setHeadings(collectedHeadings)

    const handleScroll = () => {
      let newSelectedHeading = ""
      const fromTop = window.scrollY

      collectedHeadings.forEach((heading) => {
        const headingElement = document.getElementById(heading.id)
        if (headingElement && headingElement.offsetTop <= fromTop) {
          newSelectedHeading = heading.id
        }
      })

      setSelectedHeading(newSelectedHeading)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="fixed top-1/2 left-0 transform -translate-y-1/2 max-h-screen overflow-y-auto">
      <div className="bg-white p-4 shadow-lg max-w-xs">
        <ul className="list-none">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`pl-${heading.level} mb-1  text-lg cursor-pointer ${
                selectedHeading === heading.id ? "font-bold" : ""
              }`}
              onClick={() => {
                const headingElement = document.getElementById(heading.id)
                if (headingElement) {
                  headingElement.scrollIntoView({ behavior: "smooth" })
                }
              }}>
              {heading.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ContentScript
