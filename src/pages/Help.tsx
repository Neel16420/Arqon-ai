import { ChevronLeft } from 'lucide-react'

export default function Help() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505]">
      <div className="w-full max-w-xl rounded-2xl p-8 bg-[#0a0a0c] border border-white/10 text-center">
        <h1 className="text-2xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Help Center</h1>
        <p className="text-white/40 text-sm mb-8">This page will be connected during backend integration.</p>
        <button 
          onClick={() => window.history.back()}
          className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
        >
          <ChevronLeft size={16} />
          Return to Login
        </button>
      </div>
    </div>
  )
}
