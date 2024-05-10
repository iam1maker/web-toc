/**
 * 获取指定元素的滚动顶部位置。
 * @param elem 指定的HTMLElement元素。
 * @returns 返回元素的滚动顶部位置。
 */
export const getScrollTop = (elem: HTMLElement): number => {
  // 当元素为body时，获取文档的滚动顶部位置
  if (elem === document.body) {
    return document.documentElement.scrollTop || document.body.scrollTop
  } else {
    // 否则，直接获取元素的滚动顶部位置
    return elem.scrollTop
  }
}

/**
 * 设置指定元素的滚动顶部位置。
 * @param elem 指定的HTMLElement元素。
 * @param val 要设置的滚动顶部位置。
 */
export const setScrollTop = (elem: HTMLElement, val: number): void => {
  // 当元素为body时，设置文档的滚动顶部位置
  if (elem === document.body) {
    document.documentElement.scrollTop = val
    window.scrollTo(window.scrollX, val)
  } else {
    // 否则，直接设置元素的滚动顶部位置
    elem.scrollTop = val
  }
}

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

/**
 * 使用二次缓动函数计算动画的当前位置。
 * 该函数用于计算动画在给定时间进度下的当前位置，提供了一个平滑的从起始位置到目标位置的过渡。
 * @param progress - 动画的当前进度，范围为0到1。
 * @param start - 动画的起始位置。
 * @param distance - 动画的目标位置与起始位置之间的距离。
 * @returns 计算得到的当前动画位置。
 */
const easeOutQuad = (
  progress: number,
  start: number,
  distance: number
): number => {
  // 使用二次缓出公式计算当前位置
  return distance * progress * (2 - progress) + start
}

/**
 * 实现平滑滚动到指定元素的功能。
 * @param {Object} 参数对象，包含以下属性：
 *  - target: 需要滚动到的HTMLElement目标元素。
 *  - scroller: 用于滚动的HTMLElement容器。
 *  - topMargin: 滚动目标位置上方的额外边距，默认为0。
 *  - maxDuration: 最大滚动持续时间（毫秒），默认为300。
 *  - callback: 滚动完成后的回调函数，默认为空。
 */
export const smoothScroll = ({
  target,
  scroller,
  topMargin = 0,
  maxDuration = 300,
  callback
}: {
  target: HTMLElement
  scroller: HTMLElement
  maxDuration?: number
  topMargin?: number
  callback?(): void
}) => {
  // 使用缓动函数来平滑滚动效果。
  const ease = easeOutQuad
  // 计算目标元素在容器中的顶部位置。
  const targetTop = target.getBoundingClientRect().top
  // 获取容器的顶部位置，如果容器是body，则顶部位置为0。
  const containerTop =
    scroller === document.body ? 0 : scroller.getBoundingClientRect().top

  // 计算滚动的起始和结束位置。
  const scrollStart = getScrollTop(scroller)
  const scrollEnd = targetTop - (containerTop - scrollStart) - topMargin

  // 计算滚动距离，并根据距离调整动画持续时间。
  const distance = scrollEnd - scrollStart
  const distanceRatio = Math.min(1, Math.abs(distance) / 10000)
  const duration = Math.max(
    10,
    maxDuration * distanceRatio * (2 - distanceRatio)
  )

  // 如果最大持续时间为0，则直接跳转到目标位置并执行回调。
  if (maxDuration === 0) {
    setScrollTop(scroller, scrollEnd)
    if (callback) {
      callback()
    }
    return
  }

  // 使用requestAnimationFrame进行平滑滚动。
  let startTime: number
  function update(timestamp: number) {
    if (!startTime) {
      startTime = timestamp
    }
    // 计算当前滚动进度，并根据进度更新滚动位置。
    const progress = (timestamp - startTime) / duration
    if (progress < 1) {
      const scrollPos = ease(progress, scrollStart, distance)
      setScrollTop(scroller, scrollPos)
      window.requestAnimationFrame(update)
    } else {
      // 滚动完成，设置最终位置并执行回调。
      setScrollTop(scroller, scrollEnd)
      if (callback) {
        callback()
      }
    }
  }
  window.requestAnimationFrame(update)
}
