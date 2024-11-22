import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadTikTokVideo } from './utils/mediaDownloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());

// Endpoint to download a TikTok video
app.post('/api/download', async (req, res) => {
	const { url } = req.body;

	if (!url) {
		return res.status(400).json({ message: 'URL is required' });
	}

	try {
		const filePath = await downloadTikTokVideo(url);
		res.status(200).json({
			message: 'Download successful',
			filePath: `/downloads/${path.basename(filePath)}`,
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: error.message });
	}
});

// Serve downloaded files
app.use('/downloads', express.static(path.join(__dirname, '../downloads')));

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
