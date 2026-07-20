import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Download, RefreshCw, Square, Check } from 'lucide-react'

SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('python', python)

const MOCK_RESPONSE = `Here is a production-ready example of how you can implement a highly optimized sorting algorithm in TypeScript.

### Quick Sort Implementation

We will use the **Quick Sort** algorithm because of its excellent average-case time complexity of \`O(n log n)\`.

\`\`\`typescript
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}

const unsorted = [34, 7, 23, 32, 5, 62, 32, 2];
console.log(quickSort(unsorted));
\`\`\`

### Performance Analysis

| Case | Time Complexity | Space Complexity |
|------|----------------|------------------|
| Best | \`O(n log n)\` | \`O(log n)\` |
| Avg  | \`O(n log n)\` | \`O(log n)\` |
| Worst| \`O(n²)\`      | \`O(n)\` |

Let me know if you need help analyzing the space complexity further!
`

const MEMOIZED_PLUGINS = [remarkGfm]

const MEMOIZED_COMPONENTS = {
  code({node, inline, className, children, ...props}: any) {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <div className="rounded-lg overflow-hidden border border-border/40 my-4 shadow-lg">
        <div className="bg-surface-2 px-4 py-2 text-xs text-muted font-mono flex justify-between items-center border-b border-border/40">
          {match[1]}
        </div>
        <SyntaxHighlighter
          {...props}
          style={vscDarkPlus as any}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, padding: '16px', background: 'transparent' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code {...props} className="bg-surface-2 px-1.5 py-0.5 rounded text-accent font-mono text-[13px]">
        {children}
      </code>
    )
  },
  table({children}: any) {
    return <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse border border-border/40 rounded-lg">{children}</table></div>
  },
  th({children}: any) {
    return <th className="bg-surface-2/50 border border-border/40 px-4 py-2 font-medium">{children}</th>
  },
  td({children}: any) {
    return <td className="border border-border/40 px-4 py-2 text-muted">{children}</td>
  }
}

interface ResponsePanelProps {
  content: string
  setContent: (val: string) => void
  isGenerating: boolean
  onStop: () => void
}

export function ResponsePanel({ content, setContent, isGenerating, onStop }: ResponsePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  // Simulation of streaming response
  useEffect(() => {
    if (isGenerating) {
      setContent('')
      let currentIndex = 0
      const words = MOCK_RESPONSE.split(/( |\n)/) // split by space or newline to preserve formatting
      
      const interval = setInterval(() => {
        if (currentIndex < words.length) {
          setContent(words.slice(0, currentIndex + 1).join(''))
          currentIndex++
          
          // Auto-scroll to bottom while streaming
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          }
        } else {
          clearInterval(interval)
          onStop() // Stop generating when done
        }
      }, 40) // 40ms chunk delay

      return () => clearInterval(interval)
    }
  }, [isGenerating, onStop, setContent])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arqon_response_${Date.now()}.md`
    a.click()
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest">Response Output</h2>
        
        {content && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-center gap-1"
          >
            <ActionButton icon={copied ? <Check size={12} className="text-success" /> : <Copy size={12} />} onClick={handleCopy} />
            <ActionButton icon={<Download size={12} />} onClick={handleDownload} />
            <ActionButton icon={<RefreshCw size={12} />} onClick={() => {}} disabled={isGenerating} />
          </motion.div>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-surface-2/30 border border-border/40 rounded-xl p-6 overflow-y-scroll custom-scrollbar relative"
      >
        {!content && !isGenerating ? (
          <div className="h-full flex items-center justify-center text-muted/50 text-sm">
            AI output will appear here...
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-sm text-foreground/90 leading-relaxed font-sans">
            <ReactMarkdown
              remarkPlugins={MEMOIZED_PLUGINS}
              components={MEMOIZED_COMPONENTS}
            >
              {content}
            </ReactMarkdown>

            {/* Blinking Cursor */}
            <AnimatePresence>
              {isGenerating && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="inline-block w-2 h-4 bg-accent ml-1 align-middle"
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Stop Button during generation */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
            className="absolute bottom-6 left-1/2"
          >
            <button 
              onClick={onStop}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border hover:border-accent/50 text-sm text-foreground hover:text-accent shadow-lg transition-all group"
            >
              <Square size={14} className="fill-current" />
              Stop Generating
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ActionButton({ icon, onClick, disabled = false }: { icon: React.ReactNode, onClick: () => void, disabled?: boolean }) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className="p-1.5 rounded hover:bg-surface-2 text-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
    </button>
  )
}
