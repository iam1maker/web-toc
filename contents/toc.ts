import { getScrollElement } from "./lib/scroll"

export interface TocPreference {
  offset: {
    x: number
    y: number
  }
}
export function createToc(options: {
  article: HTMLElement
  preference: TocPreference
}) {
  /**
   * 初始化并管理文章的目录相关的观察者和触发器。
   * @param options 包含文章元素和偏好设置的对象。
   */
  const article = options.article
  const scroller = getScrollElement(article)

  return "a"
}
export type Toc = ReturnType<typeof createToc>
