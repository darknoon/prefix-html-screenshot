chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["contentScript.js"],
  });
});

async function handleCapture(message, sender) {
  const { startX, startY, endX, endY } = message;
  console.log(`attaching debugger for tab ${sender.tab.id}`);
  await chrome.debugger.attach({ tabId: sender.tab.id }, "1.3");
  console.log(`attached debugger for tab ${sender.tab.id}`);
  console.log(`attempting to send screenshot command for tab ${sender.tab.id}`);
  try {
    const result = await chrome.debugger.sendCommand(
      { tabId: sender.tab.id },
      "Page.captureScreenshot",
      {
        format: "png",
        clip: {
          x: startX,
          y: startY,
          width: endX - startX,
          height: endY - startY,
          scale: 2,
        },
      }
    );
    return result.data;
  } finally {
    // Ensure that we always detach the debugger
    console.log(`detaching debugger for tab ${sender.tab.id}`);
    chrome.debugger.detach({ tabId: sender.tab.id });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("background received message", message);
  if (message.type === "capture") {
    (async () => {
      try {
        const result = await handleCapture(message, sender);
        sendResponse({ status: "success", data: result });
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        sendResponse({ status: "error", error: error });
      }
    })();
    return true;
  }
});
