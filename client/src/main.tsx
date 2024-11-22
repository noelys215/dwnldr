import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/Downloader.css'; // Global styles for the app

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
