import { useState, useEffect } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'single' | 'bulk'>('bulk')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const handleCheck = async () => {
    if (!input.trim()) return;
    
    setLoading(true)
    setError(null)
    setResults([])
    const extensions = input.split(/[\n,]+/).map(ext => ext.trim()).filter(Boolean)
    
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensions })
      })
      if (!res.ok) throw new Error('API request failed')
      const data = await res.json()
      setResults(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results })
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'extension_results.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen p-8 flex flex-col items-center pb-20 relative">
      <button 
        onClick={() => setIsDark(!isDark)}
        className="absolute top-8 right-8 border-4 border-neo-border p-2 bg-neo-surface shadow-neo-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hard-hover transition-all font-heading font-bold"
      >
        {isDark ? '☀️ LIGHT' : '🌙 DARK'}
      </button>

      <header className="mb-12 text-center mt-8 md:mt-0">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src="/logo.png" alt="ExtSafe Logo" className="w-16 h-16 object-contain" />
          <h1 className="font-heading text-5xl font-bold uppercase tracking-tighter m-0">ExtSafe</h1>
        </div>
        <p className="text-neo-border/80 font-body">Analyze Chrome Extensions for potential risks instantly.</p>
      </header>

      <main className="w-full max-w-4xl">
        <div className="bg-neo-surface border-4 border-neo-border p-6 shadow-neo-hard mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <label className="font-heading font-bold text-2xl">Enter Extension IDs or Names:</label>
            
            <div className="flex border-4 border-neo-border shadow-[2px_2px_0px_#141414]">
              <button 
                onClick={() => setMode('single')} 
                className={`px-4 py-2 font-heading font-bold transition-colors ${mode === 'single' ? 'bg-neo-accent' : 'bg-neo-surface hover:bg-gray-100'} border-r-4 border-neo-border`}
              >
                Single Check
              </button>
              <button 
                onClick={() => setMode('bulk')} 
                className={`px-4 py-2 font-heading font-bold transition-colors ${mode === 'bulk' ? 'bg-neo-accent' : 'bg-neo-surface hover:bg-gray-100'}`}
              >
                Bulk Check
              </button>
            </div>
          </div>
          
          {mode === 'single' ? (
            <input
              type="text"
              className="w-full border-4 border-neo-border p-4 mb-6 focus:outline-none font-body shadow-neo-hard"
              placeholder="e.g. kpkfjpbnccenpdneakbmlgdkafmpifke"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
          ) : (
            <>
              <p className="text-sm mb-3 opacity-70 font-body -mt-2">(Separate multiple IDs or names by comma or newline)</p>
              <textarea
                className="w-full border-4 border-neo-border p-4 mb-6 focus:outline-none font-body shadow-neo-hard resize-y h-32"
                placeholder="e.g. Adblock&#10;cfhdojbkjhnklbpkdaibdccddilifddb"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
            </>
          )}
          
          <button 
            onClick={handleCheck}
            disabled={loading}
            className="w-full md:w-auto bg-neo-accent hover:bg-neo-accent-dark active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-hard-hover transition-all font-heading font-bold text-xl border-4 border-neo-border px-8 py-3 shadow-neo-hard disabled:opacity-50"
          >
            {loading ? 'CHECKING...' : 'CHECK EXTENSIONS'}
          </button>
          
          {loading && (
            <div className="w-full mt-6">
              <p className="font-heading font-bold mb-2 uppercase text-sm">Scanning sources...</p>
              <div className="w-full h-6 border-4 border-neo-border bg-neo-surface overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-neo-accent w-1/2 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-200 border-4 border-neo-border p-4 shadow-neo-hard mb-8 font-bold text-red-900">
            Error: {error}
          </div>
        )}

        {results.length > 0 && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center border-b-4 border-neo-border pb-4">
              <h2 className="font-heading font-bold text-3xl">Preview Results</h2>
              <button 
                onClick={handleExport}
                disabled={exporting}
                className="bg-green-400 hover:bg-green-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-hard-hover transition-all font-heading font-bold text-lg border-4 border-neo-border px-6 py-2 shadow-neo-hard disabled:opacity-50"
              >
                {exporting ? 'EXPORTING...' : 'EXPORT TO EXCEL'}
              </button>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto border-4 border-neo-border p-4 bg-white shadow-neo-hard space-y-4">
              {results.map((res, i) => (
                <div key={i} className="bg-neo-surface border-2 border-neo-border p-5 shadow-[2px_2px_0px_#141414] flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-heading font-bold text-xl">{res.name}</h3>
                    <span className={`px-4 py-1 border-2 border-neo-border font-bold uppercase ${res.risk === 'High' ? 'bg-red-400' : 'bg-green-400'}`}>
                      {res.risk} RISK
                    </span>
                  </div>
                  <p className="font-mono text-xs opacity-60">ID: {res.id}</p>
                  <p className="font-body text-sm line-clamp-3">{res.desc}</p>
                  <a href={res.url} target="_blank" rel="noreferrer" className="text-sm underline font-bold hover:bg-neo-accent inline-block w-max mt-2">
                    View on Extpose
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
