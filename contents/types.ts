// 定义一个标题对象的接口，包含标题的DOM元素、级别、文本、ID，可选的锚点和相对于文章顶部的位置
export interface Heading {
  dom: HTMLElement
  level: number
  text: string
  id: number
  anchor?: string
  fromArticleTop?: number
}
