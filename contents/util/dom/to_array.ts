/**
 * 将 `NodeListOf<T>` 或 `HTMLCollectionOf<Element>` 类型的集合转换为数组。
 * @param arr 需要转换的节点列表或元素集合。它可以是 `NodeListOf<T>` 或 `HTMLCollectionOf<Element>` 类型。
 * @returns 返回一个由节点或元素组成的数组。
 */
export const toArray = <T extends Node>(
    arr: NodeListOf<T> | HTMLCollectionOf<Element>
): T[] => {
    // 使用 `apply` 将 `slice` 方法应用于 `arr`，将其转换为数组
    //总之，[] 在这里起到了一个中介的作用，它提供了一个 .slice() 方法，然后 apply() 方法将这个方法应用到了 arr 上，从而将非数组对象转换成数组。
    return [].slice.apply(arr)
}
