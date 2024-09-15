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

// Run as soon as the page loads
sendCurrentPageUrl();