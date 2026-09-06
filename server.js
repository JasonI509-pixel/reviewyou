import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow handling base64 image payloads up to 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// API Endpoint for scanning
app.post('/scan', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ result: 'No image data sent.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = "Look at this image. Identify the primary item or furniture shown. Provide its estimated market price range in USD and a brief 1-2 sentence description of what it is.";

    const imagePart = {
      inlineData: {
        data: image,
        mimeType: 'image/jpeg'
      }
    };

    const apiResponse = await model.generateContent([prompt, imagePart]);
    const responseText = apiResponse.response.text();

    res.json({ result: responseText });
  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({ result: 'Error analyzing the image.' });
  }
});

app.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});
