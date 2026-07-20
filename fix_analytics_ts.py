import pathlib

files = [
    'src/components/analytics/GlobalTimeline.tsx',
    'src/components/analytics/MetricCards.tsx',
    'src/components/analytics/PerformanceHero.tsx',
    'src/components/analytics/ProviderDistribution.tsx',
    'src/components/analytics/RoutingIntelligence.tsx',
    'src/components/analytics/LatencyHeatmap.tsx',
    'src/components/analytics/CostAnalysis.tsx',
    'src/components/analytics/SuccessErrors.tsx',
    'src/components/analytics/TokenUsage.tsx',
    'src/components/analytics/ModelLeaderboard.tsx',
    'src/components/analytics/AIInsightsPanel.tsx',
    'src/pages/Analytics.tsx'
]

for file_path in files:
    path = pathlib.Path(file_path)
    if not path.exists():
        continue
        
    content = path.read_text(encoding='utf-8')
    
    # 1. Remove unused React imports
    content = content.replace("import React, {", "import {")
    content = content.replace("import React from 'react'\n", "")
    
    # 2. Fix specific errors in each file
    if file_path == 'src/pages/Analytics.tsx':
        content = content.replace("const [timeRange, setTimeRange] = useState('Last 24 Hours')", "const [timeRange] = useState('Last 24 Hours')")
        
    if file_path == 'src/components/analytics/GlobalTimeline.tsx':
        content = content.replace("(totalRequests / 1000000).toFixed(2)", "(Number(totalRequests) / 1000000).toFixed(2)")
        
    if file_path == 'src/components/analytics/MetricCards.tsx':
        content = content.replace("(count / 1000).toFixed(2)", "(Number(count) / 1000).toFixed(2)")
        content = content.replace("export function MetricCards({ refreshTrigger }: MetricCardsProps) {", "export function MetricCards({ refreshTrigger }: MetricCardsProps) {\n  void refreshTrigger; // Used in useMemo dependencies")
        
    if file_path == 'src/components/analytics/ProviderDistribution.tsx':
        content = content.replace("formatter={(value: number) =>", "formatter={(value: any) =>")
        content = content.replace("{data.map((entry, index) => (", "{data.map((_, index) => (")
        
    if file_path == 'src/components/analytics/CostAnalysis.tsx':
        content = content.replace("formatter={(value: number) =>", "formatter={(value: any) =>")
        
    if file_path == 'src/components/analytics/SuccessErrors.tsx':
        content = content.replace("formatter={(value: number) =>", "formatter={(value: any) =>")

    path.write_text(content, encoding='utf-8')

print("Fixed TS errors.")
