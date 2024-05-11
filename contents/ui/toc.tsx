import cssText from "data-text:~style.css"
import React, { useCallback, useEffect, useRef, useState } from "react"
import Draggable, {
  type DraggableData,
  type DraggableEvent
} from "react-draggable"

import type { Heading } from "../types"

interface HeadingTreeProps {
  headings: Heading[] | undefined
  article?: HTMLElement
}

// 扩展Heading类型来包含children
interface HeadingNode extends Heading {
  children: HeadingNode[]
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

  const buildNestedHeadingTree = (headings: Heading[]): HeadingNode[] => {
    // 创建一个虚拟的根节点，方便构建嵌套结构
    const root: HeadingNode = { children: [] } as HeadingNode

    const stack: HeadingNode[] = [root]

    headings.forEach((heading) => {
      const item: HeadingNode = { ...heading, children: [] }

      // 由于root节点没有level属性，我们在比较之前需要做检查
      while (
        stack.length > 0 &&
        "level" in stack[stack.length - 1] &&
        stack[stack.length - 1].level >= item.level
      ) {
        stack.pop()
      }

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(item)
      }
      stack.push(item)
    })

    return root.children
  }

  // const revealACtiveHeading = (

  // )

  const renderHeadingNode = (heading) => (
    <li key={heading.id} className="mb-2">
      <a
        href={`#${heading.anchor}`}
        onClick={() => handleHeadingClick(heading)}
        className="text-gray-600 hover:text-blue-500">
        {heading.text}
      </a>
      {heading.children.length > 0 && (
        <ul className="ml-4">{heading.children.map(renderHeadingNode)}</ul>
      )}
    </li>
  )

  // 在HeadingTree组件中
  const headingTree = buildNestedHeadingTree(headings || [])

  const [activeDrags, setActiveDrags] = useState(0)

  const handleStart = () => {
    setActiveDrags((prevActiveDrags) => prevActiveDrags + 1)
  }
  const handleStop = () => {
    setActiveDrags((prevActiveDrags) => prevActiveDrags - 1)
  }

  const draggableHandlers = { onStart: handleStart, onStop: handleStop }

  // 定义开始拖动事件处理函数

  if (!article) {
    return <div>No article found</div>
  }

  return (
    // <Draggable>
    //   <div className="fixed right-0 top-0 mt-20 mr-8 max-w-xs bg-white p-4 rounded-lg shadow-lg">
    //     <h2 className="text-lg font-semibold mb-4">Contents</h2>
    //     <ul className="space-y-2">{headingTree.map(renderHeadingNode)}</ul>
    //   </div>
    // </Draggable>
    <Draggable handle="strong" {...draggableHandlers}>
      {/* <div className="bg-white border border-gray-300 rounded-md w-44 h-44 m-4 p-4 float-left cursor-auto"> */}
      <div className="fixed right-0 top-0 mt-20 mr-8 max-w-xs bg-white p-4 rounded-lg shadow-lg">
        <strong className=" cursor-move pb-1">
          <div className=" pb-2">Drag here</div>
        </strong>
        {/* <h2 className="text-lg font-semibold mb-4">Contents</h2> */}
        <ul className="space-y-2">{headingTree.map(renderHeadingNode)}</ul>
      </div>
      {/* </div> */}
    </Draggable>
  )
}
