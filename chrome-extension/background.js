let keywords = [];

// Function to send keywords and the current URL to Flask server
function sendKeywordsAndUrlToFlask(url, contentWarningActive, keywordWarningActive) {
    // Only proceed if at least one of the toggle switches is active
    if (contentWarningActive || keywordWarningActive) {
        console.log("Sending data to Flask. URL:", url, "Keywords:", keywords);
        
        fetch('http://127.0.0.1:5000/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url, keywords: keywords })
        })
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        console.log("Both toggle switches are inactive. Skipping POST request.");
    }
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
        // Retrieve stored toggle states
        chrome.storage.sync.get(['contentWarningActive', 'keywordWarningActive'], function(data) {
            const contentWarningActive = data.contentWarningActive
            const keywordWarningActive = data.keywordWarningActive
            console.log(contentWarningActive)
            console.log(keywordWarningActive)
            // When a page is loaded/reloaded, send the URL and the stored keywords
            const currentUrl = message.url;
            sendKeywordsAndUrlToFlask(currentUrl, contentWarningActive, keywordWarningActive);
            sendResponse({ status: 'urlReceived' });
        });
    }
});
