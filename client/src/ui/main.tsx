import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { UI } from './ui';

createRoot(document.getElementById('ui')!).render(
  <StrictMode>
    <UI />
  </StrictMode>,
);
