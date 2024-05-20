import { hrtime } from "process"
import cssText from "data-text:~style.css"
import { Ellipsis, Minus, Plus, SunDim } from "lucide-react"
import React, { useState } from "react"
import Draggable, {
  type DraggableData,
  type DraggableEvent
} from "react-draggable"

import type { Heading } from "../types"

interface HeadingTreeProps {
  headings: Heading[] | undefined
  article?: HTMLElement
  loading: boolean
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
  article,
  loading
}) => {
  const handleHeadingClick = (heading: Heading, href: string) => {
    let targetElement = article?.querySelector(`#${heading.anchor}`)

    if (!targetElement && heading.text) {
      const elements = article?.querySelectorAll(heading.dom.localName)
      elements.forEach((e) => {
        if (e.textContent?.trim() === heading.text.trim()) {
          targetElement = e
        }
      })
    }

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

  // 在HeadingTree组件中
  const headingTree = buildNestedHeadingTree(headings || [])

  const [activeDrags, setActiveDrags] = useState(0)

  /**
   * 使用状态管理器useState初始化一个记录折叠节点的对象。
   * 初始时，对象为空，没有任何节点被标记为折叠或非折叠状态。
   * @type {Object} 一个键为节点ID，值为布尔值的对象。布尔值表示节点是否被折叠。
   */
  const [collapsedNodes, setCollapsedNodes] = useState<{
    [key: number]: boolean
  }>({})

  /**
   * 切换指定节点的折叠状态。
   * 如果节点当前是折叠的，则将其设置为非折叠状态；反之亦然。
   * @param {number} id - 要切换折叠状态的节点的ID。
   */
  const toggleCollapse = (id: number) => {
    // 使用setCollapsedNodes更新collapsedNodes对象，
    // 对象的[id]属性值取反，以实现折叠状态的切换。
    setCollapsedNodes((prevState) => ({
      ...prevState,
      [id]: !prevState[id]
    }))
  }

  const handleStart = () => {
    setActiveDrags((prevActiveDrags) => prevActiveDrags + 1)
  }
  const handleStop = () => {
    setActiveDrags((prevActiveDrags) => prevActiveDrags - 1)
  }

  const draggableHandlers = { onStart: handleStart, onStop: handleStop }

  /**
   * 折叠所有标题节点。
   * 该函数遍历 `headingTree`，为每个节点及其子节点设置折叠状态。
   * 不接受参数，也不返回值。
   */
  const collapseAll = () => {
    // 初始化一个新的对象来存储所有被折叠的节点
    const newCollapsedNodes = {}
    // 遍历所有的节点，并设置它们为折叠状态
    headingTree.forEach((node) => {
      newCollapsedNodes[node.id] = true
      // 同时遍历它们的子节点，并设置为折叠状态
      node.children.forEach((child) => {
        newCollapsedNodes[child.id] = true
      })
    })
    // 更新存储折叠状态的对象
    setCollapsedNodes(newCollapsedNodes)
  }

  const expandAll = () => {
    const newCollapsedNodes = {}
    headingTree.forEach((node) => {
      newCollapsedNodes[node.id] = false
      node.children.forEach((child) => {
        newCollapsedNodes[child.id] = false
      })
    })
    setCollapsedNodes(newCollapsedNodes)
  }

  if (!article) {
    return <div>No article found</div>
  }

  return (
    <>
      {loading ? (
        <div className="text-center mx-auto">loading...</div>
      ) : (
        <Draggable handle="strong" {...draggableHandlers}>
          <div className="group fixed right-0 top-0 mt-20 mr-8 max-w-xs bg-white p-4 rounded-lg shadow-lg">
            <strong className="cursor-move pb-1">
              <div>Toc</div>
            </strong>
            <div className="pb-2 flex items-center justify-end">
              <button onClick={expandAll} className="mx-1 h-4 w-4">
                <Plus className="mx-1 h-4 w-4" />
              </button>
              <button onClick={collapseAll} className="mx-1 h-4 w-4">
                <Minus className="mx-1 h-4 w-4" />
              </button>

              <SunDim className="mx-1 h-4 w-4" />
              <Ellipsis className=" mx-1 h-4 w-4" />
            </div>
            <ul className="space-y-2 ml-2">
              {headingTree.map((node) => (
                <li key={node.id} className="mb-2 group">
                  <div className=" flex items-center">
                    <a
                      href={`#${node.anchor ? node.anchor : ":~:text=" + node.text}`}
                      onClick={(e) => {
                        const href = e.currentTarget.href
                        e.preventDefault()
                        handleHeadingClick(node, href)
                      }}
                      className="text-gray-600 hover:text-blue-500 flex-1 overflow-hidden text- whitespace-nowrap">
                      {node.text}
                    </a>
                    {node.children.length > 0 && (
                      <button
                        onClick={() => toggleCollapse(node.id)}
                        className=" ml-auto mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {collapsedNodes[node.id] ? (
                          <Plus size={12} />
                        ) : (
                          <Minus size={12} />
                        )}
                      </button>
                    )}
                  </div>
                  {node.children.length > 0 && !collapsedNodes[node.id] && (
                    <ul className="ml-4">
                      {node.children.map((child) => (
                        <li key={child.id} className="mb-2 group">
                          <div className=" flex items-center">
                            <a
                              href={`#${child.anchor ? child.anchor : ":~:text=" + child.text}`}
                              onClick={(e) => {
                                const href = e.currentTarget.href
                                e.preventDefault()
                                handleHeadingClick(child, href)
                              }}
                              className="text-gray-600 hover:text-blue-500 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                              {child.text}
                            </a>
                            {child.children.length > 0 && (
                              <button
                                onClick={() => toggleCollapse(child.id)}
                                className=" ml-auto mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {collapsedNodes[child.id] ? (
                                  <Plus size={12} />
                                ) : (
                                  <Minus size={12} />
                                )}
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Draggable>
      )}
    </>
  )
}
