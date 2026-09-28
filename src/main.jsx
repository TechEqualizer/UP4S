import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Self-hosted brand fonts (see .claude/skills/ui-design/SKILL.md → Typography)
import '@fontsource-variable/bricolage-grotesque/opsz.css'
import '@fontsource-variable/figtree'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)