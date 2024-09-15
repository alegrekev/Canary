/*chrome.storage.sync.get('blockedKeywords', function(data) {
    const keywords = data.blockedKeywords || [];
    if (keywords.length > 0) {
        blockContent(keywords);
    }
});

function blockContent(keywords) {
    const elements = document.body.getElementsByTagName('*');

    for (let element of elements) {
        // Check all text content in the element
        if (element.children.length === 0 && element.textContent) {
            let elementText = element.textContent.toLowerCase();

            keywords.forEach(keyword => {
                if (elementText.includes(keyword.toLowerCase())) {
                    element.style.display = 'none'; // Hide the element
                }
            });
        }
    }
}
*/
/*
// Function to scrape all search result links from the page
function scrapeGoogleSearchLinks() {
    // Google search result links are typically inside <a> tags within .yuRUbf elements
    const links = Array.from(document.querySelectorAll('.yuRUbf a')).map(link => link.href);
    
    // Send the scraped links to the background script
    chrome.runtime.sendMessage({ action: 'scrapeLinks', links: links }, function(response) {
        console.log('Links sent to background:', response);
    });
}

// Run the scrape function when the content script is loaded
scrapeGoogleSearchLinks();
*/
// Send the current page's URL to the background script
function sendCurrentPageUrl() {
    const currentPageUrl = window.location.href;  // Get the current page URL
    console.log("Current Page URL:", currentPageUrl);

    // Send the URL to the background script
    chrome.runtime.sendMessage({ action: 'pageLoaded', url: currentPageUrl }, function(response) {
        console.log('URL sent to background:', response);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showPopup') {
        showPopup(message.score, message.keyword_count);
    }
});

function showPopup(score, keyword_count) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Darker background for more visibility
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.backdropFilter = 'blur(10px)'; // Increase blur intensity
    overlay.style.overflowY = 'auto'; // Allow scrolling if the popup exceeds the viewport height
    document.body.appendChild(overlay);

    // Create popup
    const popup = document.createElement('div');
    popup.style.backgroundColor = '#ffffff'; // White background
    popup.style.padding = '30px'; // Padding for content
    popup.style.borderRadius = '15px'; // Rounded corners
    popup.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    popup.style.zIndex = '10000';
    popup.style.textAlign = 'center';
    popup.style.width = '400px'; // Adjust width as needed
    popup.style.maxWidth = '90%'; // Ensure it fits smaller screens
    popup.style.maxHeight = '80vh'; // Max height to ensure popup doesn't exceed viewport height
    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
    popup.style.justifyContent = 'space-between'; // Ensure proper spacing between content and button

    let keywordsHtml = '';
    if (Object.keys(keyword_count).length > 0) {
        // Filter keywords with 1 or more detections
        const filteredKeywords = Object.entries(keyword_count)
            .filter(([keyword, count]) => count > 0)
            .map(([keyword, count]) => `<li>${keyword}, ${count}</li>`)
            .join('');

        if (filteredKeywords) {
            keywordsHtml = `
                <h3>Detected Keywords:</h3>
                <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 5px; border-radius: 5px; background-color: #f0f0f0;">
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${filteredKeywords}
                    </ul>
                </div>
            `;
        } else {
            keywordsHtml = '';
        }
    } else {
        keywordsHtml = '';
    }

    popup.innerHTML = `
        <div>
            <h2 style="font-size: 24px; font-weight: bold;">Content Warning</h2>
            <p style="font-size: 20px; font-weight: bold;">Canary Score: ${score}%</p>
            <p>This page contains content that may be offensive in nature. Please proceed with caution.</p>
            ${keywordsHtml}
        </div>
        <button id="closePopup" style="
            background-color: #ff0500; /* Red background */
            color: #ffffff; /* White text */
            border: none; /* Remove border */
            border-radius: 5px; /* Rounded corners */
            padding: 12px 24px; /* Increased size */
            font-size: 18px; /* Larger text */
            font-weight: bold; /* Bold text */
            cursor: pointer; /* Pointer cursor */
            margin-top: 20px; /* Space above button */
            transition: background-color 0.3s ease; /* Smooth background color transition */
            align-self: center;
        ">Close</button>
    `;
    overlay.appendChild(popup);

    // Add close button functionality
    document.getElementById('closePopup').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
}



// Run as soon as the page loads
sendCurrentPageUrl();