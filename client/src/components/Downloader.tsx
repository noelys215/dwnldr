import React, { useState } from 'react';
import { downloadMedia } from '../api/downloader';
// import './Downloader.css'; // Optional CSS for styling

const Downloader: React.FC = () => {
	const [url, setUrl] = useState('');
	const [watermark, setWatermark] = useState(false);
	const [status, setStatus] = useState<string | null>(null);
	const [downloadLink, setDownloadLink] = useState<string | null>(null);

	const handleDownload = async () => {
		setStatus('Downloading...');
		setDownloadLink(null);

		try {
			const response = await downloadMedia(url, watermark);
			setStatus('Download complete!');

			// Create a download link for user
			if (typeof response.filePath === 'string') {
				setDownloadLink(`/downloads/${response.filePath}`);
			} else {
				// Multiple images (slideshow)
				const links = response.filePath.map(
					(path: string) => `<a href="/downloads/${path}" target="_blank">${path}</a>`
				);
				setDownloadLink(links.join('<br/>'));
			}
		} catch (error) {
			if (error instanceof Error) {
				setStatus(`Error: ${error.message}`);
			} else {
				setStatus('An unknown error occurred');
			}
		}
	};

	return (
		<div className="downloader">
			<h1>DWNLDR</h1>
			<input
				type="text"
				placeholder="Enter video URL"
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				className="input-url"
			/>
			<label>
				<input
					type="checkbox"
					checked={watermark}
					onChange={(e) => setWatermark(e.target.checked)}
				/>
				With Watermark
			</label>
			<button onClick={handleDownload} className="download-button">
				Download
			</button>
			{status && <p className="status">{status}</p>}
			{downloadLink && (
				<div>
					<h3>Download Link:</h3>
					<div dangerouslySetInnerHTML={{ __html: downloadLink }} />
				</div>
			)}
		</div>
	);
};

export default Downloader;
