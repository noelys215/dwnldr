import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads/');

// Ensure the downloads directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
	fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

/**
 * Utility function to add delay.
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Utility function for retries with exponential backoff.
 */
const fetchWithRetry = async (url, options, retries = 3, delayMs = 1000) => {
	try {
		const response = await fetch(url, options);
		if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
		return response;
	} catch (err) {
		if (retries === 0) throw err;
		console.log(`Retrying... Attempts left: ${retries}`);
		await delay(delayMs);
		return fetchWithRetry(url, options, retries - 1, delayMs * 2);
	}
};

/**
 * Extracts the video ID from the TikTok URL.
 */
const extractVideoId = (url) => {
	const match = url.match(/\/video\/(\d+)/);
	if (!match) throw new Error('Invalid TikTok URL format');
	console.log(`Extracted Video ID: ${match[1]}`);
	return match[1];
};

/**
 * Retrieves the video metadata from TikTok's API.
 */
const getVideoMetadata = async (videoId) => {
	const API_URL = `https://api22-normal-c-alisg.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`;
	const headers = {
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
		Referer: 'https://www.tiktok.com/',
		Accept: 'application/json',
	};

	const response = await fetch(API_URL, { headers });
	const rawBody = await response.text();

	// Log response details for debugging
	console.log(`Status Code: ${response.status}`);
	console.log('Response Headers:', response.headers.raw());
	console.log(`Response Body: ${rawBody}`);

	if (!response.ok || !rawBody) {
		throw new Error(
			`TikTok API returned an empty or invalid response. Status: ${response.status}`
		);
	}

	let data;
	try {
		data = JSON.parse(rawBody);
	} catch (err) {
		throw new Error('Failed to parse TikTok API response as JSON');
	}

	if (!data.aweme_list || data.aweme_list.length === 0) {
		throw new Error('Video not found or unavailable');
	}

	return data.aweme_list[0];
};

/**
 * Downloads the video file from the given URL.
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
 * Main function to handle downloading TikTok videos without watermark.
 */
const downloadTikTokVideo = async (url) => {
	try {
		// Step 1: Extract video ID from URL
		const videoId = extractVideoId(url);

		// Step 2: Fetch video metadata
		const videoData = await getVideoMetadata(videoId);

		// Step 3: Get video URL without watermark
		const playAddr = videoData.video.play_addr;
		if (!playAddr || !playAddr.url_list || playAddr.url_list.length === 0) {
			throw new Error('No downloadable video URL found');
		}
		const videoUrl = playAddr.url_list[0]; // URL without watermark

		// Step 4: Download the video
		return await downloadVideo(videoUrl, videoId);
	} catch (error) {
		throw new Error(`Error downloading TikTok video: ${error.message}`);
	}
};

export { downloadTikTokVideo };
