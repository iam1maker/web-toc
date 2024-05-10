/**
 * 获取指定窗口中所有的iframe元素，包括嵌套的iframe。
 *
 * @param wnd 指定的窗口对象。
 * @returns 返回一个包含所有iframe元素的数组。
 */
const getIframes = (wnd: Window): HTMLIFrameElement[] => {
  let iframes: HTMLIFrameElement[] = []
  try {
    // 尝试获取窗口中所有的iframe元素
    iframes = [].slice.apply(wnd.document.getElementsByTagName("iframe"))
  } catch (error) {
    // 忽略任何错误
  }
  // 递归地收集所有嵌套的iframe元素
  return iframes.reduce((prev, curIframe) => {
    const curWindow = curIframe.contentWindow
    return prev.concat(curIframe, curWindow ? getIframes(curWindow) : [])
  }, [] as HTMLIFrameElement[])
}

/**
 * 获取当前页面中内容区域最大的iframe的contentWindow。
 * 如果不存在iframe或者没有contentWindow，则返回top窗口。
 *
 * @returns 返回内容区域最大的iframe的contentWindow，或者top窗口。
 */
export const getContentWindow = (): Window => {
  // 获取最顶层的窗口
  const rootWindow = window.top
  // 获取所有iframe元素
  const allIframes = getIframes(rootWindow)
  // 计算每个iframe的面积，并按面积降序排序
  const allIframesWithArea = allIframes
    .map((iframe) => {
      return {
        iframe: iframe,
        area: iframe.offsetWidth * iframe.offsetHeight
      }
    })
    .sort((a, b) => b.area - a.area)
  // 如果没有iframe，则直接返回顶层窗口
  if (allIframesWithArea.length === 0) {
    return rootWindow
  }
  // 获取面积最大的iframe
  const largest = allIframesWithArea[0]
  // 计算顶层窗口的面积
  const rootDocument = rootWindow.document.documentElement
  const rootArea = rootDocument.offsetWidth * rootDocument.offsetHeight
  // 如果最大iframe的面积超过顶层窗口面积的一半，则返回该iframe的contentWindow，否则返回顶层窗口
  return largest.area > rootArea * 0.5
    ? largest.iframe.contentWindow || rootWindow
    : rootWindow
}
