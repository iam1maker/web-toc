import cssText from "data-text:~style.css"
import React from "react"

import type { Heading } from "../types"

interface HeadingTreeProps {
  headings: Heading[] | undefined
  article?: HTMLElement
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const HeadingTree: React.FC<HeadingTreeProps> = ({
  headings,
  article
}) => {
  const handleHeadingClick = (heading: Heading) => {
    const targetElement = article?.querySelector(`#${heading.anchor}`)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  const renderHeadingNode = (heading: Heading) => (
    <li key={heading.id} className="mb-2">
      <a
        href={`#${heading.anchor}`}
        onClick={() => handleHeadingClick(heading)}
        className="text-gray-600 hover:text-blue-500">
        {heading.text}
      </a>
    </li>
  )

  const buildHeadingTree = (headings: Heading[]): Heading[][] => {
    const tree: Heading[][] = []

    for (let i = 1; i <= 6; i++) {
      tree.push(headings.filter((heading) => heading.level === i))
    }

    return tree
  }

  const headingTree = buildHeadingTree(headings)

  if (!article) {
    return <div>No article found</div>
  }

  return (
    <div className="fixed right-0 top-0 mt-20 mr-8 max-w-xs bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
      {headingTree.map((levelHeadings, index) => (
        <ul key={index} className="space-y-2">
          {levelHeadings.map(renderHeadingNode)}
        </ul>
      ))}
    </div>
  )
}
