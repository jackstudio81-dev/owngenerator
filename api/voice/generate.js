const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Untuk deploy di Vercel, kita perlu menyimpan credential Google Cloud sebagai environment variable
// Kita akan membuat file sementara dari environment variable GOOGLE_APPLICATION_CREDENTIALS_JSON
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const fs = require('fs');
  const os = require('os');
  const credentialPath = path.join(os.tmpdir(), 'google-credentials.json');
  fs.writeFileSync(credentialPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialPath;
}

const client = new TextToSpeechClient();

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { text, voiceId, emotion, style, speed } = req.body;

      // Konfigurasi suara
      const voiceConfig = {
        languageCode: 'id-ID',
        name: voiceId || 'id-ID-Standard-A',
        ssmlGender: voiceId.includes('Female') ? 'FEMALE' : 'MALE'
      };

      // Konfigurasi audio
      const audioConfig = {
        audioEncoding: 'MP3',
        speakingRate: speed || 1.0,
        // Jika ingin menambahkan emotion dan style, mungkin perlu menggunakan SSML
      };

      // Jika ada emotion atau style, kita bisa tambahkan SSML
      let ssmlText = text;
      if (emotion || style) {
        ssmlText = `<speak>${text}</speak>`;
        // Untuk emotion dan style yang lebih advance, mungkin perlu penyesuaian lebih
      }

      const request = {
        input: { text: ssmlText },
        voice: voiceConfig,
        audioConfig: audioConfig,
      };

      const [response] = await client.synthesizeSpeech(request);
      const audioContent = response.audioContent;

      // Mengembalikan audio sebagai base64 atau menyimpannya ke storage
      // Di sini kita kembalikan sebagai base64 untuk simplicity
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        audioContent: audioContent.toString('base64'),
        mimeType: 'audio/mp3'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
