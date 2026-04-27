import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import OBSPage from './OBSPage.tsx'
import NotFoundPage from './components/NotFoundPage.tsx'
import './index.css'

// Simple routing based on pathname
const path = window.location.pathname;
const knownRoutes = ['/', '/demo', '/obs', '/archive'];
const isDemoPage = path.includes('/demo') || path.includes('/obs');
const isKnownRoute = knownRoutes.some(route => path === route || path.startsWith(route + '/'));

let AppComponent: React.ComponentType;
if (isDemoPage) {
  AppComponent = OBSPage;
} else if (isKnownRoute) {
  AppComponent = App;
} else {
  AppComponent = NotFoundPage;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
)
