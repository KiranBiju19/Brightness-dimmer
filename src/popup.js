document.getElementById("brightness").addEventListener("input", function (e) {
  const val = e.target.value;
  document.getElementById("value").innerText = `${val}%`;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (val) => {
        let overlay = document.getElementById("dim-overlay");
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.id = "dim-overlay";
          document.body.appendChild(overlay);
        }
        overlay.style.cssText = `
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, ${val / 100});
          pointer-events: none;
          z-index: 999999;
        `;
      },
      args: [parseInt(val)]
    });
  });
});
