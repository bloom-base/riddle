import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import OBSPage from './OBSPage.tsx'
import './index.css'

// Simple routing based on pathname
const path = window.location.pathname;
const isDemoPage = path.includes('/demo') || path.includes('/obs');
const AppComponent = isDemoPage ? OBSPage : App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
)
