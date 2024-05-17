import { type Heading } from "../types"
import { toArray } from "../util/dom/to_array"
import { canScroll } from "./scroll"

/**
 * 获取指定元素的所有祖先元素数组。
 * @param elem 要获取祖先的HTMLElement元素。
 * @param maxDepth 最大深度，默认为-1，表示无限制深度。
 * @returns 返回一个包含从指定元素到其最近祖先元素的HTMLElement数组。
 */
const getAncestors = function (
  elem: HTMLElement,
  maxDepth = -1
): HTMLElement[] {
  const ancestors: HTMLElement[] = [] // 用于存储祖先元素的数组
  let cur: HTMLElement | null = elem // 当前遍历的元素
  // 循环遍历，直到达到指定的最大深度或遍历到没有父元素为止
  while (cur && maxDepth--) {
    ancestors.push(cur) // 将当前元素添加到祖先数组中
    cur = cur.parentElement // 将当前元素设置为其父元素，用于下一次循环
  }
  return ancestors // 返回祖先元素数组
}

/**
 * 定义文章标签的权重。
 * 键是HTML标签（如h1，h2）或选择器（如article，.sidebar），
 * 值是对应的权重数组。权重用于算法中对不同标签的重要性进行评分。
 * 权重值的计算是基于预设的一组基础权重，通过乘以不同的缩放因子来调整。
 *
 * 示例：
 * h1标签的权重是基础权重数组的值乘以0.4，
 * 而strong标签的权重是基础权重数组的值乘以0.5再乘以0.5。
 *
 * 特定的选择器（如'.article'，'#article'）具有相同的权重值，
 * 这表示它们在算法中被视为等同的重要程度。
 * 负权重表示对应标签或选择器在评分算法中起着降低权重的作用。
 */
const ARTICLE_TAG_WEIGHTS: { [Selector: string]: number[] } = {
  h1: [0, 100, 60, 40, 30, 25, 22, 18].map((s) => s * 0.4),
  h2: [0, 100, 60, 40, 30, 25, 22, 18],
  h3: [0, 100, 60, 40, 30, 25, 22, 18].map((s) => s * 0.5),
  h4: [0, 100, 60, 40, 30, 25, 22, 18].map((s) => s * 0.5 * 0.5),
  h5: [0, 100, 60, 40, 30, 25, 22, 18].map((s) => s * 0.5 * 0.5 * 0.5),
  h6: [0, 100, 60, 40, 30, 25, 22, 18].map((s) => s * 0.5 * 0.5 * 0.5 * 0.5),
  strong: [0, 100, 60, 40, 30, 25, 22, 18].map((s) => s * 0.5 * 0.5 * 0.5),
  article: [500],
  ".article": [500],
  "#article": [500],
  ".content": [101],
  sidebar: [-500, -100, -50],
  ".sidebar": [-500, -100, -50],
  "#sidebar": [-500, -100, -50],
  aside: [-500, -100, -50],
  ".aside": [-500, -100, -50],
  "#aside": [-500, -100, -50],
  nav: [-500, -100, -50],
  ".nav": [-500, -100, -50],
  ".navigation": [-500, -100, -50],
  ".toc": [-500, -100, -50],
  ".table-of-contents": [-500, -100, -50],
  ".comment": [-500, -100, -50]
}
/**
 * 获取元素数组中左边位置对齐的元素的最大数量。
 *
 * @param elems 一个包含HTMLElement对象的数组。
 * @returns 返回一个数字，表示左边位置对齐的元素的最大数量。如果没有元素对齐，返回undefined。
 */
const getElemsCommonLeft = (elems: HTMLElement[]): number | undefined => {
  // 如果输入的元素数组为空，则直接返回undefined
  if (!elems.length) {
    return undefined
  }

  // 使用一个对象来记录每个左边位置出现的次数
  const lefts: { [Left: number]: number } = {}
  elems.forEach((el) => {
    // 获取元素的左边位置
    const left = el.getBoundingClientRect().left
    // 如果这个左边位置还没有被记录，则初始化其计数为0
    if (!lefts[left]) {
      lefts[left] = 0
    }
    // 对这个左边位置的计数加一
    lefts[left]++
  })

  const count = elems.length

  // 判断是否足够多的元素对齐，这里认为少于30%的元素对齐不算对齐
  const isAligned = Object.keys(lefts).length <= Math.ceil(0.3 * count)
  // 如果没有足够的元素对齐，则返回undefined
  if (!isAligned) {
    return undefined
  }

  // 根据计数从大到小排序左边位置
  const sortedByCount = Object.keys(lefts).sort((a, b) => lefts[b] - lefts[a])
  // 获取计数最大的左边位置
  const most = Number(sortedByCount[0])
  return most
}

/**
 * 从文档中提取最有可能是文章内容的HTMLElement。
 * 该函数综合考虑多个因素对页面元素进行评分，并选择评分最高的元素作为文章内容的代表。
 *
 * @returns {HTMLElement | undefined} 返回评分最高的元素，如果没有合适的元素，则返回undefined。
 */
export const extractArticle = function (): HTMLElement | undefined {
  const elemScores = new Map<HTMLElement, number>()

  // 根据预定义的选择器权重，为每个匹配的元素计算得分
  Object.keys(ARTICLE_TAG_WEIGHTS).forEach((selector) => {
    /**
     * 将查询选择器匹配的所有元素转换为数组，并根据特定条件筛选元素。
     * @param selector 用于查询DOM元素的选择器字符串。
     * @returns 筛选后的HTMLElement数组。
     */
    let elems = toArray(document.querySelectorAll(selector)) as HTMLElement[]
    // 如果选择器为'strong'，对元素进行进一步的筛选
    if (selector.toLowerCase() === "strong") {
      // 计算这些<strong>元素在左侧的共同偏移量
      const commonLeft = getElemsCommonLeft(elems)
      // 如果没有共同偏移量，或共同偏移量大于屏幕宽度的一半，则不考虑这些元素作为标题
      if (commonLeft === undefined || commonLeft > window.innerWidth / 2) {
        elems = []
      } else {
        // 保留与共同偏移量匹配的元素，作为潜在的标题元素
        elems = elems.filter(
          (elem) => elem.getBoundingClientRect().left === commonLeft
        )
      }
    }
    /**
     * 遍历每个元素并计算基于祖先元素的得分。
     * 对于每个元素，根据选择器定义的权重，为其祖先元素累加得分。
     *
     * @param elems 要遍历的元素数组
     * @param selector 用于选择特定权重配置的选择器
     * @param elemScores 用于存储元素得分的Map
     * @param getAncestors 函数用于获取给定元素的所有祖先元素
     * @param ARTICLE_TAG_WEIGHTS 包含选择器和对应权重的对象
     */
    elems.forEach((elem) => {
      // 根据选择器获取权重数组
      const weights = ARTICLE_TAG_WEIGHTS[selector]
      // 获取当前元素的所有祖先元素，数量根据权重数组的长度确定
      const ancestors = getAncestors(elem as HTMLElement, weights.length)
      // 遍历祖先元素，为每个祖先元素累加得分
      ancestors.forEach((elem, distance) => {
        elemScores.set(
          elem,
          (elemScores.get(elem) || 0) + weights[distance] || 0
        )
      })
    })
  })

  // 根据得分对元素进行排序
  const sortedByScore = [...elemScores].sort((a, b) => b[1] - a[1])

  // 从排序后的元素中挑选 top 5 作为候选
  const candicates = sortedByScore
    .slice(0, 5)
    .filter(Boolean)
    .map(([elem, score]) => {
      return { elem, score }
    })

  // 根据元素的高度、链接数量和宽度等因素，重新计算候选元素的得分
  const reweighted = candicates
    .map(({ elem, score }) => {
      return {
        elem,
        score:
          score *
          Math.log(
            (elem.scrollHeight * elem.scrollHeight) /
              (elem.querySelectorAll("a").length || 1)
          )
      }
    })
    .sort((a, b) => b.score - a.score)

  // 选择得分最高的元素作为文章内容，如果没有则返回undefined
  const article = reweighted.length ? reweighted[0].elem : undefined

  return article
}

/**
 * 定义一个常量对象，用于表示不同标题标签（和强调标签）的权重。
 * 标签的权重是根据它们在文档中的重要性来分配的，权重越高表示越重要。
 * 此对象用于在某些算法中根据标签类型来计算得分或排序。
 *
 * @type {Object}
 * @property {number} H1 - 一级标题的权重，赋予4的权重值。
 * @property {number} H2 - 二级标题的权重，赋予9的权重值。
 * @property {number} H3 - 三级标题的权重，赋予9的权重值。
 * @property {number} H4 - 四级标题的权重，赋予10的权重值。
 * @property {number} H5 - 五级标题的权重，赋予10的权重值。
 * @property {number} H6 - 六级标题的权重，赋予10的权重值。
 * @property {number} STRONG - 强调标签的权重，赋予5的权重值。
 */
const HEADING_TAG_WEIGHTS = {
  H1: 4,
  H2: 9,
  H3: 9,
  H4: 10,
  H5: 10,
  H6: 10,
  STRONG: 5
}

/**
 * 从给定的HTML元素中提取标题信息。
 * @param articleDom 代表文章内容的HTML元素，从中提取标题。
 * @returns Heading[] 返回一个包含标题信息的数组，每个标题包括DOM元素、文本内容、级别、唯一ID和锚点。
 */
export const extractHeadings = (articleDom: HTMLElement): Heading[] => {
  console.log("articleDom", articleDom)
  // 定义可见性的判断函数
  const isVisible = (elem: HTMLElement) => elem.offsetHeight !== 0

  type HeadingGroup = {
    tag: string
    elems: HTMLElement[]
    score: number
  }

  /**
   * 判断标题组是否可见。
   * @param group 标题组对象。
   * @returns 返回标题组是否可见的布尔值。
   */
  const isHeadingGroupVisible = (group: HeadingGroup) => {
    return group.elems.filter(isVisible).length >= group.elems.length * 0.5
  }

  /**
   * 根据给定的文档DOM和标题标签权重，生成一个标题组数组，每个标题组包含标签、元素数组和得分。
   * 该数组经过筛选，仅包含可见的、得分高于等于10的、元素数量大于0的标题组，并且最多保留前3个。
   * @param articleDom 文章的DOM元素，用于从中提取标题。
   * @returns {HeadingGroup[]} 处理后的标题组数组。
   */
  const headingTagGroups: HeadingGroup[] = Object.keys(HEADING_TAG_WEIGHTS)
    .map((tag): HeadingGroup => {
      // 将指定标签的所有DOM元素转换为数组
      let elems = toArray(articleDom.getElementsByTagName(tag)) as HTMLElement[]
      // 对<strong>标签进行特殊处理，只保留左对齐的元素作为标题
      if (tag.toLowerCase() === "strong") {
        const commonLeft = getElemsCommonLeft(elems) // 计算所有元素的共同左边缘
        // 如果共同左边缘未定义或超出屏幕宽度的一半，则不将其作为标题
        if (commonLeft === undefined || commonLeft > window.innerWidth / 2) {
          elems = []
        } else {
          // 仅保留与共同左边缘对齐的元素
          elems = elems.filter(
            (elem) => elem.getBoundingClientRect().left === commonLeft
          )
        }
      }
      // 返回标题组对象，包括标签、元素数组和基于元素数量和标签权重计算的得分
      return {
        tag,
        elems,
        score: elems.length * HEADING_TAG_WEIGHTS[tag]
      }
    })
    // 筛选得分大于等于10且元素数量大于0的标题组
    .filter((group) => group.score >= 10 && group.elems.length > 0)
    // 筛选可见的标题组
    .filter((group) => isHeadingGroupVisible(group))
    // 仅保留排名前3的标题组
    .slice(0, 3)

  // 根据文档顺序排列标题标签
  const headingTags = headingTagGroups.map((headings) => headings.tag)

  /**
   * 该函数用于判断给定的HTMLElement节点是否被接受。
   * 它首先检查节点的标签是否属于预定义的一组标签（headingTagGroups）之一，
   * 如果是，然后检查该节点是否在预定义的元素列表中，并且是否可见。
   *
   * @param node - 需要接受检查的HTMLElement节点。
   * @returns 返回一个NodeFilter标志，指示节点是被接受（FILTER_ACCEPT）、跳过（FILTER_SKIP）还是其他操作。
   */
  const acceptNode = (node: HTMLElement) => {
    // 在headingTagGroups中查找与当前节点标签匹配的组
    const group = headingTagGroups.find((g) => g.tag === node.tagName)
    if (!group) {
      // 如果没有找到匹配的组，则跳过该节点
      return NodeFilter.FILTER_SKIP
    }
    // 检查节点是否在组的元素列表中且节点可见
    return group.elems.includes(node) && isVisible(node)
      ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_SKIP
  }

  /**
   * 创建并初始化一个树遍历器（TreeWalker）用于遍历文章DOM。
   * @param articleDom 文章的根DOM元素，遍历将从这个元素开始。
   * @param NodeFilter.SHOW_ELEMENT 指定遍历器只关注元素节点（Element节点）。
   * @param {acceptNode} 过滤器函数，用于进一步筛选节点，决定树遍历器如何处理每个节点。
   * @returns 返回一个配置好的TreeWalker实例，可用于控制和获取DOM元素的遍历。
   */
  const treeWalker = document.createTreeWalker(
    articleDom,
    NodeFilter.SHOW_ELEMENT,
    { acceptNode }
  )

  /**
   * 遍历HTML文档树，生成一个包含所有标题元素的数组。
   * 使用TreeWalker遍历文档，为每个找到的标题元素创建一个对象，该对象包含元素的DOM引用、文本内容、级别、唯一ID和锚点。
   * @returns {Heading[]} 返回一个包含所有标题元素信息的数组。
   */
  const headings: Heading[] = []
  let id = 0

  while (treeWalker.nextNode()) {
    // 获取当前遍历到的节点，并断言为HTMLElement类型。
    const dom = treeWalker.currentNode as HTMLElement

    // 尝试获取节点的id，如果不存在，则从其内部的<a>元素中尝试提取id或href作为锚点。
    console.log("dom.id:", dom.id)

    const anchor =
      // todo 如何获取data-id=""的元素 dom.getAttribute(`data-id`)
      dom.id ||
      toArray(dom.querySelectorAll("a"))
        .map((a) => {
          let href = a.getAttribute("href") || ""
          return href.startsWith("#") ? href.substr(1) : a.id
        })
        .filter(Boolean)[0] // 移除空值并取第一个值。

    // 将标题元素的信息添加到headings数组中。
    headings.push({
      dom,
      text: dom.textContent || "",
      level: headingTags.indexOf(dom.tagName) + 1,
      id,
      anchor
    })

    id++ // 更新id，为下一个标题元素准备。
  }

  return headings
}
