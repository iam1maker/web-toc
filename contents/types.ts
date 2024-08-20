// 定义一个矩形对象的类型，包含上、左、右、下边的位置及高度和宽度
export type Rect = {
    top: number
    left: number
    right: number
    bottom: number
    height: number
    width: number
}

// 定义一个滚动条对象的接口，包含滚动条的DOM元素和矩形描述
export interface Scroller {
    dom: HTMLElement
    rect: Rect
}

// 定义一个文章对象的接口，包含文章的DOM元素、相对滚动条顶部的位置、左右边位置、高度
export interface Article {
    dom: HTMLElement
    fromScrollerTop: number
    left: number
    right: number
    height: number
}

// 定义一个标题对象的接口，包含标题的DOM元素、级别、文本、ID，可选的锚点和相对于文章顶部的位置
export interface Heading {
    dom: HTMLElement
    level: number
    text: string
    id: number
    anchor?: string
    fromArticleTop?: number
}

// 定义一个内容对象的接口，包含文章信息、滚动条信息和标题数组
export interface Content {
    article: Article
    scroller: Scroller
    headings: Heading[]
}

// 定义主题类型的枚举，包括亮色和暗色主题
export enum Theme {
    Light = "light",
    Dark = "dark"
}

// 定义一个偏移量的对象接口，包含x和y轴的偏移量
export interface Offset {
    x: number
    y: number
}
