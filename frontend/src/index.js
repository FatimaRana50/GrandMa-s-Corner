import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './theme.css';

// Inject premium Google Fonts (Playfair Display for headings, Inter for body)
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,700&family=Inter:wght@400;500;600;700;800&display=swap';
document.head.appendChild(fontLink);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);