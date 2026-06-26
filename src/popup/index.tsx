import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Popup } from './Popup';
import './index.css';

/** Popup entry: mounts the React UI into `#root`. */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Popup root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
