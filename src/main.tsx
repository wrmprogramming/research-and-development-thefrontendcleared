import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './assets/css/bootstrap.min.css';
import './assets/css/lineicons.css';
import './assets/css/materialdesignicons.min.css';
import './assets/css/fullcalendar.css';
// import './assets/css/main.css';
import './assets/js/bootstrap.bundle.min.js';
import './assets/js/Chart.min.js';
import './assets/js/dynamic-pie-chart.js';
// import './assets/js/moment.min.js';
import './assets/js/fullcalendar.js';
import './assets/js/jvectormap.min.js';
import './assets/js/world-merc.js';
import './assets/js/polyfill.js';
import './assets/css/style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
