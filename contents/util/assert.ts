/**
 * 断言一个条件是否为真，如果不是，则抛出一个错误。
 * @param condition - 需要满足的条件，任意类型。
 * @param message - 当条件不满足时，抛出错误包含的信息。
 * @returns 无返回值，但通过类型断言告知编译器 condition 必定为真。
 */
export function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

/**
 * 当传入的参数为 never 类型时，抛出一个 TypeError。
 * 通常用于类型守卫，以处理理论上不应发生的情况。
 * @param o - 传入的参数，预期为 never 类型。
 * @returns 无返回值，因为函数的目的是抛出异常。
 */
export const assertNever = (o: never): never => {
  throw new TypeError("Unexpected type:" + JSON.stringify(o))
}
