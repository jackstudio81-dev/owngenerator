document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('promptForm');
    const generateBtn = document.getElementById('generateBtn');
    const outputText = document.getElementById('outputText');
    const outputJson = document.getElementById('outputJson');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    const downloadTextBtn = document.getElementById('downloadTextBtn');
    const downloadJsonBtn = document.getElementById('downloadJsonBtn');
    const historyList = document.getElementById('historyList');

    // Generate button click
    generateBtn.addEventListener('click', async function() {
        const formData = {
            mainSubject: document.getElementById('mainSubject').value,
            style: document.getElementById('style').value,
            quality: document.getElementById('quality').value,
            lighting: document.getElementById('lighting').value,
            colorScheme: document.getElementById('colorScheme').value,
            additionalDetails: document.getElementById('additionalDetails').value,
            aspectRatio: document.getElementById('aspectRatio').value,
            negativePrompt: document.getElementById('negativePrompt').value
        };

        try {
            const response = await fetch('/api/prompt/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            // Display results
            outputText.value = result.formattedText;
            outputJson.value = JSON.stringify(result.json, null, 2);

            // Save to history
            const historyItem = {
                subject: formData.mainSubject,
                style: formData.style,
                ratio: formData.aspectRatio,
                timestamp: new Date().toLocaleString()
            };

            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            historyElement.innerHTML = `
                <strong>${historyItem.subject}</strong><br>
                <small>${historyItem.style} - ${historyItem.ratio} - ${historyItem.timestamp}</small>
            `;
            historyList.prepend(historyElement);

        } catch (error) {
            console.error('Error:', error);
            alert('Gagal generate prompt');
        }
    });

    // Copy buttons
    copyTextBtn.addEventListener('click', function() {
        outputText.select();
        document.execCommand('copy');
        alert('Teks prompt disalin!');
    });

    copyJsonBtn.addEventListener('click', function() {
        outputJson.select();
        document.execCommand('copy');
        alert('JSON prompt disalin!');
    });

    // Download buttons
    downloadTextBtn.addEventListener('click', function() {
        const blob = new Blob([outputText.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt-${Date.now()}.txt`;
        a.click();
    });

    downloadJsonBtn.addEventListener('click', function() {
        const blob = new Blob([outputJson.value], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt-${Date.now()}.json`;
        a.click();
    });
});
