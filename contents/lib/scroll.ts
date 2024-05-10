/**
 * 判断元素是否可以滚动。
 * @param el 指定的HTMLElement元素。
 * @returns 返回一个布尔值，表示元素是否可滚动。
 */
export const canScroll = (el: HTMLElement) => {
  // 判断元素的overflowY属性是否为'auto'或'scroll'，且元素的高度是否小于其内容高度
  return (
    ["auto", "scroll"].includes(window.getComputedStyle(el)!.overflowY!) &&
    el.clientHeight + 1 < el.scrollHeight
  )
}

/**
 * 获取可以滚动的元素。
 * 该函数从指定的HTMLElement开始向上遍历其父元素，直到找到一个可以滚动的元素或达到`document.body`。
 * @param elem - 开始检查的HTMLElement元素。
 * @returns 找到的第一个可以滚动的HTMLElement元素，如果没有找到则返回`document.body`。
 */
export const getScrollElement = (elem: HTMLElement): HTMLElement => {
  // 循环检查当前元素及其父元素是否可以滚动，直到找到可以滚动的元素或达到document.body
  while (elem && elem !== document.body && !canScroll(elem)) {
    elem = elem.parentElement!
  }
  // 如果处于调试模式，用紫色绘制找到的元素边界
  //   if (isDebugging) {
  //     draw(elem, "purple")
  //   }
  return elem
}
