import pathlib

def update_file(filepath):
    path = pathlib.Path(filepath)
    if not path.exists(): return
    content = path.read_text(encoding='utf-8')
    
    # 1. Import useReducedMotion
    if 'useReducedMotion' not in content:
        content = content.replace("import { motion } from 'framer-motion'", "import { motion, useReducedMotion } from 'framer-motion'")
        content = content.replace("import { motion, AnimatePresence } from 'framer-motion'", "import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'")
    
    # 2. Add shouldReduceMotion variable
    if 'const shouldReduceMotion = useReducedMotion()' not in content:
        if 'export function' in content:
            func_def_start = content.find('export function')
            brace_idx = content.find('{', func_def_start)
            content = content[:brace_idx+1] + '\n  const shouldReduceMotion = useReducedMotion()' + content[brace_idx+1:]
            
    # 3. Add hover lifts to motion.divs representing cards
    content = content.replace('initial={{ opacity: 0, y: 20 }}', 'initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}')
    content = content.replace('initial={{ opacity: 0, x: 20 }}', 'initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}')
    content = content.replace('transition={{ delay: 0', 'transition={{ delay: shouldReduceMotion ? 0 : 0')
    
    if 'whileHover={{ y: -2 }}' not in content and filepath != 'src/components/analytics/GlobalTimeline.tsx':
        content = content.replace('transition={{ delay: shouldReduceMotion ? 0 : 0.9 }}\n      className="', 'transition={{ delay: shouldReduceMotion ? 0 : 0.9 }}\n      whileHover={{ y: -2 }}\n      className="')
        content = content.replace('transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}\n      className="', 'transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}\n      whileHover={{ y: -2 }}\n      className="')
        content = content.replace('hover:border-border transition-colors', 'transition-all hover:border-border hover:bg-surface/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] group')
        
    path.write_text(content, encoding='utf-8')

update_file('src/components/analytics/ModelLeaderboard.tsx')
update_file('src/components/analytics/AIInsightsPanel.tsx')
update_file('src/components/analytics/GlobalTimeline.tsx')

print("Applied micro-interactions and reduced motion to remaining files.")
