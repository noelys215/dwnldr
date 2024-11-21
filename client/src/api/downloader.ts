import axios from 'axios';

export const downloadMedia = async (url: string, watermark: boolean) => {
	try {
		const response = await axios.post('/api/download', { url, watermark });
		return response.data;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			throw new Error(error.response?.data.message || error.message);
		} else {
			throw new Error(String(error));
		}
	}
};
