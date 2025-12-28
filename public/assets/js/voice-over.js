document.addEventListener('DOMContentLoaded', function() {
    const voiceText = document.getElementById('voiceText');
    const voiceSelect = document.getElementById('voiceSelect');
    const emotionSelect = document.getElementById('emotionSelect');
    const styleSelect = document.getElementById('styleSelect');
    const speedRange = document.getElementById('speedRange');
    const speedValue = document.getElementById('speedValue');
    const previewBtn = document.getElementById('previewBtn');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const audioPlayer = document.getElementById('audioPlayer');
    const generatedAudio = document.getElementById('generatedAudio');
    const historyList = document.getElementById('historyList');

    // Update speed value display
    speedRange.addEventListener('input', function() {
        speedValue.textContent = this.value + 'x';
    });

    // Preview button click
    previewBtn.addEventListener('click', async function() {
        if (!voiceText.value.trim()) {
            alert('Masukkan teks terlebih dahulu');
            return;
        }

        const data = {
            text: voiceText.value,
            voiceId: voiceSelect.value,
            emotion: emotionSelect.value,
            style: styleSelect.value,
            speed: parseFloat(speedRange.value)
        };

        try {
            const response = await fetch('/api/voice/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.audioContent) {
                // Decode base64 to audio blob
                const binaryString = atob(result.audioContent);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'audio/mp3' });
                const url = URL.createObjectURL(blob);
                
                generatedAudio.src = url;
                audioPlayer.style.display = 'block';
                downloadBtn.disabled = false;
                downloadBtn.onclick = () => {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `voice-over-${Date.now()}.mp3`;
                    a.click();
                };
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal generate suara');
        }
    });

    // Generate and save button
    generateBtn.addEventListener('click', async function() {
        // Similar to preview but might save to server or cloud storage
        // For now, we'll just trigger the preview and then save
        previewBtn.click();
        
        // Save to history
        const historyItem = {
            text: voiceText.value.substring(0, 100) + (voiceText.value.length > 100 ? '...' : ''),
            voice: voiceSelect.options[voiceSelect.selectedIndex].text,
            timestamp: new Date().toLocaleString()
        };

        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';
        historyElement.innerHTML = `
            <strong>${historyItem.text}</strong><br>
            <small>${historyItem.voice} - ${historyItem.timestamp}</small>
        `;
        historyList.prepend(historyElement);
    });
});
