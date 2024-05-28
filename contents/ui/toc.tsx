import cssText from "data-text:~style.css"
import { Ellipsis, Minus, Plus, SunDim, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import Draggable from "react-draggable"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "~/components/ui/popover"
import { injectMainStyles } from "~/lib/utils"

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

//拆分为各个不同的组件
export const HeadingTree: React.FC<HeadingTreeProps> = ({
  headings,
  article,
  loading
}) => {
  injectMainStyles(cssText)

  const [activeDrags, setActiveDrags] = useState(0)
  const [activeHeading, setActiveHeading] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && headings && headings.length > 0) {
      setActiveHeading(headings[0].id)
      const allCollapsed = headings.reduce((collapsedState, heading) => {
        collapsedState[heading.id] = true
        return collapsedState
      }, {})
      setCollapsedNodes(allCollapsed)
    }
  }, [headings])

  /**
   * 处理标题点击事件的函数。
   * 设置当前活动标题，并根据标题滚动到相应位置。
   *
   * @param heading 表示被点击的标题对象，包含标题文本、id和锚点等信息。
   * @param href 表示标题的链接，用于设置活动标题的链接。
   */
  const handleHeadingClick = (heading: Heading, href: string) => {
    // 设置当前活动的标题id
    setActiveHeading(heading.id)

    // 尝试通过id直接获取目标元素
    let targetElement = article?.querySelector(`#${heading.anchor}`)

    // 如果无法通过id找到目标元素，则通过文本内容在所有相同标签名的元素中查找
    if (!targetElement && heading.text) {
      const elements = article?.querySelectorAll(heading.dom.localName)
      elements.forEach((e) => {
        if (e.textContent?.trim() === heading.text.trim()) {
          targetElement = e
        }
      })
    }

    // 如果找到目标元素，则计算位置并平滑滚动到该元素
    if (targetElement) {
      const offset = -80 // 设置滚动偏移量，用于调整目标元素顶部与浏览器视口顶部的距离
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset + offset

      window.scroll({
        top: elementPosition,
        behavior: "smooth" // 平滑滚动行为
      })
      // 注释掉的代码是另一种实现滚动的备用方法
      // targetElement.scrollIntoView({ behavior: "smooth" })
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

  const renderTree = (nodes: HeadingNode[]): React.ReactNode => (
    <ul className="space-y-2 ml-2 mt-2">
      {nodes.map((node) => (
        <li key={node.id} className="mb-2 group">
          <div className="flex items-center hover:bg-red-200">
            <a
              href={`#${node.anchor ? node.anchor : ":~:text=" + node.text}`}
              onClick={(e) => {
                const href = e.currentTarget.href
                e.preventDefault()
                handleHeadingClick(node, href)
              }}
              style={{ color: activeHeading === node.id ? "blue" : "" }}
              className="text-gray-600 hover:text-blue-700 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {node.text}
            </a>
            {node.children.length > 0 && (
              <button
                onClick={() => toggleCollapse(node.id)}
                className="ml-auto mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {collapsedNodes[node.id] === undefined ||
                !collapsedNodes[node.id] ? (
                  <Minus size={12} />
                ) : (
                  <Plus size={12} />
                )}
              </button>
            )}
          </div>
          {node.children.length > 0 &&
            (collapsedNodes[node.id] === undefined ||
              !collapsedNodes[node.id]) &&
            renderTree(node.children)}
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {loading ? (
        <div className="text-center mx-auto">loading...</div>
      ) : (
        <Draggable handle="strong" {...draggableHandlers}>
          <div className=" resize-none hover:resize overflow-auto group fixed max-w-md bg-white p-4 rounded-lg shadow-lg">
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"ghost"} className=" h-auto w-auto p-2">
                    <Ellipsis className=" mx-1 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className=" w-80"
                  side={"right"}
                  align={"start"}>
                  {/* <PopoverClose asChild>
          <Button
            className=" h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600 bg-white"
            variant={"ghost"}>
            <X className="h-4 w-4" />
          </Button>
        </PopoverClose> */}

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Dimensions</h4>
                      <p className="text-sm text-muted-foreground">
                        Set the dimensions for the layer.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="width">Width</Label>
                        <Input
                          id="width"
                          defaultValue="100%"
                          className="col-span-2 h-8"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="maxWidth">Max. width</Label>
                        <Input
                          id="maxWidth"
                          defaultValue="300px"
                          className="col-span-2 h-8"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          defaultValue="25px"
                          className="col-span-2 h-8"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="maxHeight">Max. height</Label>
                        <Input
                          id="maxHeight"
                          defaultValue="none"
                          className="col-span-2 h-8"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {renderTree(headingTree)}
          </div>
        </Draggable>
      )}
    </>
  )
}
