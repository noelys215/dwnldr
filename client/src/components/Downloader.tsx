import React, { useState } from 'react';
import { downloadTikTokVideo } from '../api/downloader';
import '../styles/Downloader.css';

const Downloader: React.FC = () => {
	const [url, setUrl] = useState('');
	const [status, setStatus] = useState('');
	const [downloadLink, setDownloadLink] = useState<string | null>(null);

	// Handles the download process
	const handleDownload = async () => {
		setStatus('Downloading...');
		setDownloadLink(null);

		try {
			const filePath = await downloadTikTokVideo(url);
			setStatus('Download successful!');
			setDownloadLink(`http://localhost:5000${filePath}`);
		} catch (error: unknown) {
			if (error instanceof Error) {
				setStatus(error.message);
			} else {
				setStatus('An unknown error occurred.');
			}
		}
	};

	return (
		<div className="downloader">
			<h1 className="title">TikTok Video Downloader</h1>
			<input
				type="text"
				placeholder="Enter TikTok video URL"
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				className="input-url"
			/>
			<button onClick={handleDownload} className="download-button" disabled={!url}>
				Download
			</button>
			<p className="status">{status}</p>
			{downloadLink && (
				<div className="download-link">
					<a href={downloadLink} target="_blank" rel="noopener noreferrer">
						Click here to download your video
					</a>
				</div>
			)}
		</div>
	);
};

export default Downloader;
