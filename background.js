function getLocalRate() {
    return new Promise((resolve, reject) => {
        let inputField = document.getElementById('e_wallet_rate');
        let localRate = 0;
        chrome.storage.sync.get('e_rate', function (result) {
            localRate = result.e_rate ? result.e_rate : 14; // default wallet rate
            if(inputField)
                inputField.value = localRate; // set value to input
            resolve(result.e_rate);
        });
    })
}

document.addEventListener("DOMContentLoaded", function () {

    getLocalRate().then(res => sendRateToContent(res));

    const changeBtn = document.getElementById("e_change");
    if(changeBtn)
        changeBtn.addEventListener("click", saveRateToLocal); // popup save button

    function saveRateToLocal() {
        // Get a value saved in a form.
        let value = document.getElementById('e_wallet_rate').value;
        let messageTag = document.getElementById('e_message');
        // Save it using the Chrome extension storage API.
        if (value && parseFloat(value) > 0) {
            chrome.storage.sync.set({ 'e_rate': parseFloat(value) }, function () {
                messageTag.innerHTML = 'Settings saved';
                sendRateToContent(value);
            });
        } else {
            messageTag.innerHTML = 'Error: No value specified';
        }
    }

    function sendRateToContent(rate) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { message: rate }, function (response) {
                if(response)
                    console.log(response.farewell);
            });
        });
    }
});

