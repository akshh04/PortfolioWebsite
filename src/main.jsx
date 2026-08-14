import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
// import './lib/firebase.js' // Ignored in .gitignore to protect API keys / Firebase configuration

/*
 * `document.getElementById('root')` returning null throws inside createRoot with
 * a message that says nothing about the cause. It should never happen — the div
 * is in index.html — but if it ever does, the preloader is still on screen and
 * would spin forever with no explanation.
 */
const container = document.getElementById('root')

if (!container) {
  console.error('Mount point #root is missing from the document — cannot start.')
  document.getElementById('preloader')?.remove()
} else {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      {/*
        Outermost boundary. The per-section boundaries in App.jsx catch anything
        inside a section; this one catches the shell itself — ThemeProvider, the
        preloader hook — which would otherwise blank the document.
      */}
      <ErrorBoundary label="The page">
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}
