import pathlib
import re

# Patch App.tsx
app_path = pathlib.Path('src/App.tsx')
app_content = app_path.read_text(encoding='utf-8')

app_content = app_content.replace(
    "import Routing from './pages/Routing'",
    "import Routing from './pages/Routing'\nimport Requests from './pages/Requests'"
)

p1_requests = """  requests: {
    title: 'Real-time Request Stream',
    desc: 'A live-updating feed of every request flowing through Arqon, with sub-second granularity and streaming SSE push. Backend work in progress.',
    eta: 'Q1 2025',
  },
"""
app_content = app_content.replace(p1_requests, "")

app_content = app_content.replace(
    "{activePage === 'routing' && <Routing />}",
    "{activePage === 'routing' && <Routing />}\n        {activePage === 'requests' && <Requests />}"
)

app_path.write_text(app_content, encoding='utf-8')

# Create Requests.tsx boilerplate
req_path = pathlib.Path('src/pages/Requests.tsx')
req_content = """import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, X, ChevronRight, Activity, ArrowUpRight, CheckCircle, AlertCircle, RefreshCw, XCircle } from 'lucide-react'
import { useCountUp } from '../motion/useCountUp'
import { ProviderIcon } from '../components/icons/ProviderLogos'
import { formatLatency } from '../utils'
import { useStaggeredList } from '../motion/useStaggeredList'

export default function Requests() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Requests</h1>
          <p className="text-sm text-muted mt-1">Monitor every AI request flowing through Arqon in real time.</p>
        </div>
      </div>
      
      {/* Top Metric Cards placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
           Metrics
        </div>
      </div>
    </div>
  )
}
"""
req_path.write_text(req_content, encoding='utf-8')

print("Patched App.tsx and created Requests.tsx boilerplate")
