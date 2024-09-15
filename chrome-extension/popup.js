document.addEventListener('DOMContentLoaded', function() {
    // Load blocked keywords and toggle states on popup open
    chrome.storage.sync.get(['blockedKeywords', 'contentWarningActive'], function(data) {
        const keywords = data.blockedKeywords || [];
        const contentWarningActive = data.contentWarningActive || false;

        updateKeywordList(keywords);

        // Set the toggle switch states based on stored values
        document.getElementById('contentWarningToggle').checked = contentWarningActive;
    });

    // Add new keyword when the button is clicked
    document.getElementById('addBtn').addEventListener('click', function() {
        const newKeyword = document.getElementById('newKeyword').value.trim();

        if (newKeyword) {
            chrome.storage.sync.get('blockedKeywords', function(data) {
                const keywords = data.blockedKeywords || [];
                keywords.push(newKeyword);

                chrome.storage.sync.set({ blockedKeywords: keywords }, function() {
                    updateKeywordList(keywords); // Update the UI
                    document.getElementById('newKeyword').value = ''; // Clear input

                    // Send updated keywords to background script
                    chrome.runtime.sendMessage({
                        action: 'updateKeywords',
                        keywords: keywords
                    }, function(response) {
                        console.log('Message sent to background script:', response);
                    });
                });
            });
        }
    });

    // Add event listeners to save toggle states
    document.getElementById('contentWarningToggle').addEventListener('change', function() {
        const contentWarningActive = this.checked;
        chrome.storage.sync.set({ contentWarningActive: contentWarningActive }, function() {
            console.log('Content Warning Toggle state saved:', contentWarningActive);
        });
    });
});

function updateKeywordList(keywords) {
    const keywordList = document.getElementById('keywordList');
    keywordList.innerHTML = '';

    keywords.forEach(keyword => {
        const li = document.createElement('li');
        li.innerHTML = keyword + ' <span class="remove-btn">x</span>'; // Add the "x" button
        keywordList.appendChild(li);
    });

    // Reattach event listener for dynamically added "x" buttons
    document.getElementById('keywordList').addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('remove-btn')) {
            removeKeyword(event.target);
        }
    });
}

function removeKeyword(element) {
    const listItem = element.closest('li');
    if (listItem) {
        const keyword = listItem.textContent.replace(' x', '').trim();

        chrome.storage.sync.get('blockedKeywords', function(data) {
            const keywords = data.blockedKeywords || [];
            const index = keywords.indexOf(keyword);
            if (index !== -1) {
                keywords.splice(index, 1);
                chrome.storage.sync.set({ blockedKeywords: keywords }, function() {
                    updateKeywordList(keywords); // Update the UI
                    chrome.runtime.sendMessage({
                        action: 'updateKeywords',
                        keywords: keywords
                    }, function(response) {
                        console.log('Message sent to background script:', response);
                    });
                });
            }
        });
    }
}
