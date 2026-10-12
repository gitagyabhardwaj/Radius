import re

with open('src/components/EntryGate.tsx', 'r') as f:
    entry_gate = f.read()

with open('src/components/EntryGateGlass.tsx', 'r') as f:
    glass = f.read()

# 1. Extract FullScreenSignalCanvas from Glass
glass_canvas_match = re.search(r'function FullScreenSignalCanvas\(\) \{.*?(?=export default function)', glass, re.DOTALL)
new_canvas = glass_canvas_match.group(0).replace('FullScreenSignalCanvas', 'SignalCanvas')

# 2. Extract the massive glass pane start from Glass
# Up to the "RIGHT COLUMN: Authentication / Select Portal"
# But we need to use flex row for responsiveness instead of absolute positioning.
new_main_start = """  return (
    <div className="w-screen h-screen relative flex items-center justify-center overflow-hidden bg-black text-zinc-200">
      <SignalCanvas />

      {/* THE MASSIVE GLASS PANE */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 80, filter: 'blur(30px)' }}
        animate={{ 
          opacity: [0, 1, 1], 
          y: [80, 0, 0], 
          scale: [0.9, 0.9, 1], 
          filter: ['blur(30px)', 'blur(0px)', 'blur(0px)'] 
        }}
        transition={{ 
          duration: 1.4, 
          times: [0, 0.7, 1], 
          ease: ["easeOut", "backOut"], 
          delay: 0.8 
        }}
        className="absolute inset-4 md:inset-6 z-10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row"
        style={{
          background: 'rgba(15, 17, 22, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderTopColor: 'rgba(255, 255, 255, 0.25)',
          borderLeftColor: 'rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Glossy Diagonal Reflection Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 30%, transparent 50%, transparent 100%)'
        }} />

        {/* LEFT COLUMN: Logo & Tagline */}
        <div className="relative w-full md:w-[60%] p-8 md:p-12 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-white text-xl" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              R.
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-[0.2em] uppercase text-white leading-none">RADIUS</span>
              <span className="text-[10px] font-mono tracking-widest uppercase leading-none mt-1 text-indigo-300">Hyperlocal Escrow</span>
            </div>
          </div>

          <div className="mt-16 md:mt-auto mb-4">
            <p className="text-xs font-mono uppercase tracking-[0.25em] mb-4 text-indigo-400">
              Delhi NCR · Hyperlocal Grid
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white">
              Creator campaigns,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">exactly where they happen.</span>
            </h2>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication / Select Portal */}
        <div className="relative w-full md:w-[40%] p-8 md:p-12 flex flex-col justify-center overflow-y-auto custom-scrollbar">
          
          {/* Tapered Partition Line */}
          <div className="hidden md:block absolute left-0 top-16 bottom-16 w-[1px] bg-gradient-to-b from-transparent via-white/25 to-transparent pointer-events-none" />

          <div className="flex flex-col gap-2 mb-10">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-indigo-400">
              Mission Control
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {selectedRole ? 'Authenticate.' : 'Select your portal.'}
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400 mt-2">
              {selectedRole
                ? 'Sign in securely to access your workspace.'
                : 'Identify your role to enter the hyperlocal escrow network.'}
            </p>
          </div>

          <AnimatePresence mode="wait">"""

# 3. Replace SignalCanvas in EntryGate
entry_gate = re.sub(r'function SignalCanvas\(\) \{.*?(?=// ─── MAIN ENTRYGATE ───)', new_canvas + '\n', entry_gate, flags=re.DOTALL)

# 4. Replace EntryGate return start
old_main_start_pattern = r'  return \(\n    <div className="h-screen flex overflow-hidden".*?<AnimatePresence mode="wait">'
entry_gate = re.sub(old_main_start_pattern, new_main_start, entry_gate, flags=re.DOTALL)

# 5. Fix closing tags at the bottom
old_bottom_pattern = r'        \{\/\* Footer \*\/.*?</div>\n\s+</div>\n\n\s+\{\/\* Walkthrough Modal \*\/\}\n\s+<AnimatePresence>\n\s+\{showDeck && <AppWalkthroughDeck onClose=\{\(\) => setShowDeck\(false\)\} \/>\}\n\s+</AnimatePresence>\n\s+</div>'

new_bottom = """        </div>
      </motion.div>

      {/* Walkthrough Modal */}
      <AnimatePresence>
        {showDeck && <AppWalkthroughDeck onClose={() => setShowDeck(false)} />}
      </AnimatePresence>
    </div>"""

entry_gate = re.sub(old_bottom_pattern, new_bottom, entry_gate, flags=re.DOTALL)

with open('src/components/EntryGate.tsx', 'w') as f:
    f.write(entry_gate)

print("Patch applied successfully.")
