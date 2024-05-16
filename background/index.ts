import { sendToContentScript } from "@plasmohq/messaging"

export {}
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // 检查页面是否已完成加载
  if (changeInfo.status === "complete") {
    // 在这里执行你的操作
    sendToContentScript({
      name: "showHeading",
      body: {}
    })
  }
})
