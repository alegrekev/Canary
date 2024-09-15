document.addEventListener('DOMContentLoaded', function() {
    // Load blocked keywords and toggle states on popup open
    chrome.storage.sync.get(['blockedKeywords', 'contentWarningActive', 'keywordWarningActive'], function(data) {
        const keywords = data.blockedKeywords || [];
        updateKeywordList(keywords);
        
        const contentWarningToggle = document.getElementById('contentWarningToggle');
        const keywordWarningToggle = document.getElementById('keywordWarningToggle');

        // Set the toggle states based on the stored values
        contentWarningToggle.checked = data.contentWarningActive || false;
        keywordWarningToggle.checked = data.keywordWarningActive || false;

        // Add new keyword when the button is clicked
        document.getElementById('addBtn').addEventListener('click', function() {
            const newKeyword = document.getElementById('newKeyword').value.trim();
            
            if (newKeyword) {
                chrome.storage.sync.get('blockedKeywords', function(data) {
                    const keywords = data.blockedKeywords || [];
                    keywords.push(newKeyword);

                    chrome.storage.sync.set({
                        blockedKeywords: keywords,
                        contentWarningActive: contentWarningToggle.checked,
                        keywordWarningActive: keywordWarningToggle.checked
                    }, function() {
                        updateKeywordList(keywords); // Update the UI
                        document.getElementById('newKeyword').value = ''; // Clear input

                        // Send updated keywords and toggle states to background script
                        chrome.runtime.sendMessage({
                            action: 'updateKeywords',
                            keywords: keywords,
                            contentWarningActive: contentWarningToggle.checked,
                            keywordWarningActive: keywordWarningToggle.checked
                        }, function(response) {
                            console.log('Message sent to background script:', response);
                        });
                    });
                });
            }
        });

        // Save the toggle states when they change
        contentWarningToggle.addEventListener('change', function() {
            chrome.storage.sync.set({ contentWarningActive: contentWarningToggle.checked });
        });

        keywordWarningToggle.addEventListener('change', function() {
            chrome.storage.sync.set({ keywordWarningActive: keywordWarningToggle.checked });
        });
    });
});

// Update the keyword list in the popup
function updateKeywordList(keywords) {
    const keywordList = document.getElementById('keywordList');
    keywordList.innerHTML = '';

    keywords.forEach(keyword => {
        const li = document.createElement('li');
        li.textContent = keyword;
        keywordList.appendChild(li);
    });
}
