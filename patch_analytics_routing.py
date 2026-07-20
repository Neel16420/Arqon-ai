import pathlib
import os

# 1. Update Sidebar.tsx
sidebar_path = pathlib.Path('src/components/Sidebar.tsx')
sidebar_content = sidebar_path.read_text(encoding='utf-8')

# Move { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} />, p1: true }, from p1Items to navItems
nav_items_target = """const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'requests', label: 'Requests', icon: <Activity size={18} /> },
  { id: 'models', label: 'Models', icon: <Layers size={18} /> },"""
nav_items_replacement = """const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'requests', label: 'Requests', icon: <Activity size={18} /> },
  { id: 'models', label: 'Models', icon: <Layers size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },"""

if "{ id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} /> }" not in sidebar_content:
    sidebar_content = sidebar_content.replace(nav_items_target, nav_items_replacement)

p1_items_target = """const p1Items: NavItem[] = [
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} />, p1: true },
  { id: 'playground', label: 'Playground', icon: <Terminal size={18} />, p1: true },
]"""
p1_items_replacement = """const p1Items: NavItem[] = [
  { id: 'playground', label: 'Playground', icon: <Terminal size={18} />, p1: true },
]"""

if "id: 'analytics'" in p1_items_target and p1_items_target in sidebar_content:
    sidebar_content = sidebar_content.replace(p1_items_target, p1_items_replacement)
sidebar_path.write_text(sidebar_content, encoding='utf-8')

# 2. Update App.tsx
app_path = pathlib.Path('src/App.tsx')
app_content = app_path.read_text(encoding='utf-8')

if "import Analytics from './pages/Analytics'" not in app_content:
    app_content = app_content.replace(
        "import Models from './pages/Models'",
        "import Models from './pages/Models'\nimport Analytics from './pages/Analytics'"
    )
    
    app_content = app_content.replace(
        "{activePage === 'models' && <Models />}",
        "{activePage === 'models' && <Models />}\n        {activePage === 'analytics' && <Analytics />}"
    )

app_path.write_text(app_content, encoding='utf-8')

# 3. Create analytics component directory
os.makedirs('src/components/analytics', exist_ok=True)

# 4. Create boilerplate for Analytics.tsx
analytics_path = pathlib.Path('src/pages/Analytics.tsx')
analytics_content = """import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, RefreshCw, Download, FileJson } from 'lucide-react'

// Subcomponents (to be implemented)
import { MetricCards } from '../components/analytics/MetricCards'
import { PerformanceHero } from '../components/analytics/PerformanceHero'
import { ProviderDistribution } from '../components/analytics/ProviderDistribution'
import { RoutingIntelligence } from '../components/analytics/RoutingIntelligence'
import { LatencyHeatmap } from '../components/analytics/LatencyHeatmap'
import { CostAnalysis } from '../components/analytics/CostAnalysis'
import { SuccessErrors } from '../components/analytics/SuccessErrors'
import { TokenUsage } from '../components/analytics/TokenUsage'
import { ModelLeaderboard } from '../components/analytics/ModelLeaderboard'
import { GlobalTimeline } from '../components/analytics/GlobalTimeline'
import { AIInsightsPanel } from '../components/analytics/AIInsightsPanel'

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('Last 24 Hours')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const exportBlob = (type: 'csv' | 'json') => {
    const data = type === 'json' ? '{ "mock": "data" }' : 'mock,data\\n1,2'
    const blob = new Blob([data], { type: type === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arqon_analytics_export.${type}`
    a.click()
  }

  return (
    <div className="flex flex-col h-full bg-background pb-20">
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 lg:px-12 space-y-8 custom-scrollbar">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-foreground font-space">Analytics</h1>
            <p className="text-sm text-muted mt-1 max-w-xl leading-relaxed">
              AI performance, cost & routing intelligence
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="h-9 px-4 flex items-center gap-2 bg-surface/50 border border-border/40 rounded-lg text-sm text-foreground hover:bg-surface transition-colors">
              {timeRange} <ChevronDown size={14} className="text-muted" />
            </button>
            
            <button 
              onClick={handleRefresh}
              className={`h-9 w-9 flex items-center justify-center bg-surface/50 border border-border/40 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            
            <div className="flex items-center gap-2 border-l border-border/40 pl-3">
              <button onClick={() => exportBlob('csv')} className="h-9 px-3 flex items-center gap-2 bg-surface/50 border border-border/40 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition-colors">
                <Download size={14} /> CSV
              </button>
              <button onClick={() => exportBlob('json')} className="h-9 px-3 flex items-center gap-2 bg-surface/50 border border-border/40 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition-colors">
                <FileJson size={14} /> JSON
              </button>
            </div>
          </div>
        </motion.div>

        {/* Global Timeline Strip */}
        <GlobalTimeline refreshTrigger={isRefreshing} />

        {/* First Row: Top Stats */}
        <MetricCards refreshTrigger={isRefreshing} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Second Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <PerformanceHero refreshTrigger={isRefreshing} />
              </div>
              <div className="xl:col-span-1">
                <ProviderDistribution refreshTrigger={isRefreshing} />
              </div>
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RoutingIntelligence refreshTrigger={isRefreshing} />
              <LatencyHeatmap refreshTrigger={isRefreshing} />
            </div>

            {/* Fourth & Fifth Row */}
            <CostAnalysis refreshTrigger={isRefreshing} />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SuccessErrors refreshTrigger={isRefreshing} />
              <TokenUsage refreshTrigger={isRefreshing} />
            </div>

            {/* Premium Enhancement: Leaderboard */}
            <ModelLeaderboard refreshTrigger={isRefreshing} />

          </div>

          {/* Right Sidebar: AI Insights Panel */}
          <div className="lg:col-span-3">
            <div className="sticky top-0">
              <AIInsightsPanel refreshTrigger={isRefreshing} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
"""
analytics_path.write_text(analytics_content, encoding='utf-8')
print("Patched routing and created Analytics.tsx boilerplate.")
