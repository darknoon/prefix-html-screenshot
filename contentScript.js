(function () {
  let startX, startY, endX, endY;
  let selectionBox = document.createElement("div");
  selectionBox.style.position = "absolute";
  selectionBox.style.border = "2px dashed #000";
  selectionBox.style.backgroundColor = "rgba(0, 0, 255, 0.2)";
  selectionBox.style.pointerEvents = "none";
  document.body.appendChild(selectionBox);

  function onMouseDown(e) {
    startX = e.pageX;
    startY = e.pageY;
    selectionBox.style.left = startX + "px";
    selectionBox.style.top = startY + "px";
    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e) {
    endX = e.pageX;
    endY = e.pageY;
    selectionBox.style.width = Math.abs(endX - startX) + "px";
    selectionBox.style.height = Math.abs(endY - startY) + "px";
    selectionBox.style.left = Math.min(startX, endX) + "px";
    selectionBox.style.top = Math.min(startY, endY) + "px";
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    captureSelection();
    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";
  }

  async function captureSelection() {
    const message = {
      type: "capture",
      startX,
      startY,
      endX,
      endY,
    };
    console.log("sending message to background", message);
    const response = await chrome.runtime.sendMessage(message);
    console.log("response", response);
    const dataURL = "data:image/png;base64," + response.data;
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "screenshot.png";
    link.click();
  }

  document.addEventListener("mousedown", onMouseDown);
})();
