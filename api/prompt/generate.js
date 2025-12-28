module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const {
        mainSubject,
        style,
        quality,
        lighting,
        colorScheme,
        additionalDetails,
        aspectRatio,
        negativePrompt
      } = req.body;

      // Logika generate prompt
      const promptText = `${mainSubject}, ${style}, ${quality}, ${lighting} lighting, ${colorScheme} color scheme${additionalDetails ? ', ' + additionalDetails : ''}`;

      // Menentukan ukuran berdasarkan aspect ratio
      const getDimensions = (ratio) => {
        switch (ratio) {
          case '1:1': return { width: 1024, height: 1024 };
          case '16:9': return { width: 1920, height: 1080 };
          case '9:16': return { width: 1080, height: 1920 };
          case '4:3': return { width: 1600, height: 1200 };
          case '3:2': return { width: 1800, height: 1200 };
          default: return { width: 1024, height: 1024 };
        }
      };

      const dimensions = getDimensions(aspectRatio);

      const promptJSON = {
        prompt: promptText,
        negative_prompt: negativePrompt || "blurry, low quality, distorted",
        width: dimensions.width,
        height: dimensions.height,
        steps: 30,
        cfg_scale: 7.5,
        sampler: "DPM++ 2M Karras",
        model: "sd_xl_base_1.0",
        seed: -1
      };

      res.status(200).json({
        text: promptText,
        json: promptJSON,
        formattedText: `[SUBJEK] ${mainSubject}\n[GAYA] ${style}\n[KUALITAS] ${quality}\n[PENCATAYAAN] ${lighting}\n[WARNA] ${colorScheme}\n[DETAIL] ${additionalDetails || '-'}\n[RASIO] ${aspectRatio}\n[NEGATIF] ${negativePrompt || 'blurry, low quality'}`,
        metadata: {
          generatedAt: new Date().toISOString(),
          aspectRatio: aspectRatio,
          wordCount: promptText.split(' ').length
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
