import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

function Root() {
  const navigate = useNavigate();
  const redirect = sessionStorage.getItem('opencode-redirect');
  if (redirect) {
    sessionStorage.removeItem('opencode-redirect');
    // Defer navigation to after render
    setTimeout(() => navigate(redirect, { replace: true }), 0);
  }
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <Root />
    </BrowserRouter>
  </StrictMode>,
);
