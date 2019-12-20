var wallet_rate = 0;
var s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
(document.head || document.documentElement).appendChild(s);
s.onload = function () {
    s.parentNode.removeChild(s);
};

chrome.storage.sync.get('e_rate', function (result) {
    let localRate = 0;
    localRate = result.e_rate ? result.e_rate : 14; // default wallet rate
    document.getElementById('content').setAttribute('e_wallet_rate', localRate);
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message) {
            document.getElementById('content').setAttribute('e_wallet_rate', request.message);
            sendResponse({ farewell: "Get success rate" });
        }
    });