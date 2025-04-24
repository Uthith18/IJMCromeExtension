chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openAlternativesPopup") {
        chrome.windows.create({
            url: chrome.runtime.getURL("alternative.html"),
            type: "popup",
            width: 800,
            height: 900
        });
        sendResponse({ status: "Popup opened" });
    }
});