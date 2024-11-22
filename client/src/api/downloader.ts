import axios from 'axios';

/**
 * Sends a URL to the backend to download a TikTok video.
 * @param url TikTok video URL
 * @returns Download response with the file path
 */
export const downloadTikTokVideo = async (url: string): Promise<string> => {
	try {
		const response = await axios.post('http://localhost:5050/api/download', { url });
		return response.data.filePath; // Returns the file path for the downloaded video
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(error.response?.data.message || 'Failed to download the video');
		} else {
			throw new Error('Failed to download the video');
		}
	}
};
