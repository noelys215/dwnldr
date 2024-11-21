import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { downloadMedia } from './utils/mediaDownloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());

// Endpoint for downloading media
app.post('/api/download', async (req, res) => {
	const { url, watermark } = req.body;

	if (!url) {
		return res.status(400).json({ message: 'URL is required' });
	}

	try {
		const filePath = await downloadMedia(url, watermark);
		res.status(200).json({ message: 'Download complete', filePath });
	} catch (error) {
		res.status(500).json({ message: 'Failed to download media', error: error.message });
	}
});

// Serve downloaded files
app.use('/downloads', express.static(path.join(__dirname, '../downloads')));

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
