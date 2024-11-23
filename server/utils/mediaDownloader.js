import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads/');

// Ensure the downloads directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
	fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

/**
 * Uses Playwright to scrape the direct video URL from TikTok.
 * @param {string} tiktokUrl - The TikTok video URL.
 * @returns {Promise<string>} - The direct video URL.
 */
const scrapeVideoUrl = async (tiktokUrl) => {
	const browser = await chromium.launch({ headless: false }); // Launch browser in non-headless mode for debugging
	const context = await browser.newContext({
		userAgent:
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
		viewport: { width: 1280, height: 720 },
		javaScriptEnabled: true,
	});

	const page = await context.newPage();

	try {
		// Navigate to the TikTok URL
		await page.goto(tiktokUrl, { waitUntil: 'networkidle' });

		// Log the page content to inspect the DOM structure
		const pageContent = await page.content();
		console.log(pageContent);

		// Wait for the video element to load
		await page.waitForSelector('video', { timeout: 15000 });

		// Extract the video URL
		const videoUrl = await page.evaluate(() => {
			const videoElement = document.querySelector('video');
			return videoElement ? videoElement.src : null;
		});

		if (!videoUrl) {
			throw new Error('Failed to extract video URL from TikTok');
		}

		return videoUrl;
	} finally {
		await browser.close();
	}
};

/**
 * Downloads a video from a direct video URL.
 * @param {string} videoUrl - The direct video URL.
 * @param {string} videoId - The TikTok video ID for naming the file.
 * @returns {Promise<string>} - The path to the downloaded video file.
 */
const downloadVideo = async (videoUrl, videoId) => {
	const fileName = `${videoId}.mp4`;
	const filePath = path.join(DOWNLOAD_DIR, fileName);

	const response = await fetch(videoUrl);
	if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);

	const fileStream = fs.createWriteStream(filePath);
	return new Promise((resolve, reject) => {
		response.body.pipe(fileStream);
		response.body.on('error', reject);
		fileStream.on('finish', () => resolve(filePath));
	});
};

/**
 * Main function to handle downloading TikTok videos.
 * @param {string} url - The TikTok video URL.
 * @returns {Promise<string>} - The path to the downloaded video file.
 */
const downloadTikTokVideo = async (url) => {
	try {
		// Use Playwright to scrape the video URL
		const videoUrl = await scrapeVideoUrl(url);

		// Extract the video ID from the TikTok URL
		const videoIdMatch = url.match(/\/video\/(\d+)/);
		const videoId = videoIdMatch ? videoIdMatch[1] : Date.now().toString();

		// Download the video
		return await downloadVideo(videoUrl, videoId);
	} catch (error) {
		throw new Error(`Error downloading TikTok video: ${error.message}`);
	}
};

export { downloadTikTokVideo };
