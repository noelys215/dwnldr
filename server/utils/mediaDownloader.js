import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads/');

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
	fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

const extractVideoId = (url) => {
	const match = url.match(/\/video\/(\d+)/);
	return match ? match[1] : null;
};

const downloadFile = async (url, fileName) => {
	const filePath = path.join(DOWNLOAD_DIR, fileName);
	const response = await fetch(url);
	const fileStream = fs.createWriteStream(filePath);

	return new Promise((resolve, reject) => {
		response.body.pipe(fileStream);
		response.body.on('error', reject);
		fileStream.on('finish', () => resolve(filePath));
	});
};

const getMediaData = async (url, watermark) => {
	const videoId = extractVideoId(url);
	if (!videoId) throw new Error('Invalid TikTok URL');

	const API_URL = `https://api22-normal-c-alisg.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`;
	const response = await fetch(API_URL);
	const data = await response.json();

	if (!data.aweme_list || data.aweme_list.length === 0) {
		throw new Error('Video not found or deleted');
	}

	const item = data.aweme_list[0];
	let videoUrl = null;
	let images = [];

	if (item.image_post_info) {
		images = item.image_post_info.images.map((img) => img.display_image.url_list[1]);
	} else if (item.video) {
		const video = item.video;
		if (watermark && video.download_addr?.url_list?.length > 0) {
			videoUrl = video.download_addr.url_list[0];
		} else if (video.play_addr?.url_list?.length > 0) {
			videoUrl = video.play_addr.url_list[0];
		} else {
			throw new Error('Video URL not available');
		}
	}

	return { videoUrl, images, videoId };
};

const downloadMedia = async (url, watermark) => {
	const { videoUrl, images, videoId } = await getMediaData(url, watermark);

	if (videoUrl) {
		const videoPath = `${videoId}.mp4`;
		return await downloadFile(videoUrl, videoPath);
	}

	if (images.length > 0) {
		const imagePaths = [];
		for (let i = 0; i < images.length; i++) {
			const imagePath = `${videoId}_image_${i + 1}.jpeg`;
			imagePaths.push(await downloadFile(images[i], imagePath));
		}
		return imagePaths;
	}

	throw new Error('No media found to download');
};

export { downloadMedia };
