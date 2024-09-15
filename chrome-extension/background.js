let keywords = [];

// Function to send keywords and the current URL to Flask server
// Function to send keywords and the current URL to Flask server
function sendKeywordsAndUrlToFlask(url) {
    chrome.storage.sync.get(['contentWarningActive'], function(data) {
        const contentWarningActive = data.contentWarningActive || false;

        if (contentWarningActive) {
            console.log("Sending data to Flask. URL:", url, "Keywords:", keywords);

            fetch('http://127.0.0.1:5000/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url, keywords: keywords })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                const { score, keyword_count } = data;

                // Check if the score is above the threshold
                if (score > 50) {
                    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { 
                            action: 'showPopup', 
                            score: score, 
                            keyword_count: keyword_count 
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            console.log("Toggle inactive. Skipping POST request.");
        }
    });
}

// Listen for messages from the popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateKeywords') {
        // Update the stored keywords and toggle states
        keywords = message.keywords;

        console.log("Updated keywords:", keywords);
        sendResponse({ status: 'keywordsUpdated' });
    }
    if (message.action === 'pageLoaded') {
        // When a page is loaded/reloaded, send the URL and the stored keywords
        const currentUrl = message.url;
        sendKeywordsAndUrlToFlask(currentUrl);
        sendResponse({ status: 'urlReceived' });
    }
});
