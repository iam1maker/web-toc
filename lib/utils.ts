/**
 * 导入常量模块，用于应用程序中的一致性和可靠性。
 * @remarks 这里的常量可能包括各种全局配置或常量值，具体取决于"constants"模块的实现。
 */
import exp from "constants"
/**
 * 导入clsx模块，用于处理类名的组合。
 * @remarks 这使得在 TypeScript 中更加方便地处理动态类名，提高代码的可读性和可维护性。
 */
import {clsx, type ClassValue} from "clsx"
/**
 * 导入tailwind-merge模块，用于合并Tailwind CSS类。
 * @remarks 这有助于在使用Tailwind CSS时动态生成类名，以实现更灵活的样式配置。
 */
import {twMerge} from "tailwind-merge"

/**
 * 创建一个函数，用于合并类名。
 * @param inputs - 类名的参数列表，可以是字符串、数组或对象。
 * @returns 经过合并处理的类名字符串。
 * @remarks 此函数封装了clsx和tailwind-merge的功能，提供了一种简洁的方式来处理和合并类名。
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * 向文档头部注入自定义CSS样式。
 * @param cssText - 要注入的CSS样式文本。
 * @remarks 此函数允许在运行时动态修改页面的样式，增加了灵活性和动态性。
 */
export const injectMainStyles = (cssText: string) => {
    const style = document.createElement("style")
    style.textContent = cssText
    document.head.appendChild(style)
}
