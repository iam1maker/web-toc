import type { PlasmoCSConfig } from "plasmo"

export {}

export const config: PlasmoCSConfig = {
  matches: ["https://juejin.cn/*"]
}

chrome.runtime.onMessage.addListener(
  (request: "toggle", sender, sendResponse) => {
    try {
      console.log("success!")
    } catch (e) {
      console.error(e)
    }
  }
)
