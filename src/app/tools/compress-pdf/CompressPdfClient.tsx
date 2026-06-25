'use client'
import { useState } from 'react'

export default function CompressPdfClient() {
  const [file, setFile] = useState<File | null>(null)
  const [stage, setStage] = useState('idle')
  const [result, setResult] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const compress = async () => {
    if (!file) return
    setStage('compressing'); setErrorMsg('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const buf = await file.arrayBuffer()
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true })
      const compressed = await pdf.save({ useObjectStreams: true })
      const blob = new Blob([compressed], { type: 'application/pdf' })
      setResult({ url: URL.createObjectURL(blob), original: file.size, compressed: blob.size })
      setStage('done')
    } catch (err: any) { setStage('error'); setErrorMsg(err?.message || 'Failed') }
  }

  const reset = () => { setFile(null); setStage('idle'); setResult(null); setErrorMsg('') }

  const pct = result ? Math.round((1 - result.compressed / result.original) * 100) : 0

  return (
    <main style={{ minHeight: '80vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>Compress PDF</h1>
          <p style={{ fontSize: 16, color: '#6b7280' }}>Reduce PDF file size instantly.</p>
        </div>
        {stage === 'idle' && !file && (
          <div className="drop-zone" onClick={() => document.getElementById('compress-input')?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') setFile(f) }} style={{ padding: '60px 24px', textAlign: 'center' }}>
            <input id="compress-input" type="file" accept=".pdf" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }} style={{ display: 'none' }} />
            <div style={{ fontWeight: 600, fontSize: 18, color: '#374151', marginBottom: 16 }}>Drop PDF here or click to browse</div>
            <div style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 8, background: '#2563eb', color: 'white', fontWeight: 600 }}>Choose PDF file</div>
          </div>
        )}
        {stage === 'idle' && file && (
          <div style={{ padding: '32px', borderRadius: 16, border: '1px solid #e5e7eb', background: 'white' }}>
            <div style={{ marginBottom: 24, fontWeight: 600 }}>{file.name} ({(file.size / 1024).toFixed(0)} KB)</div>
            <button onClick={compress} style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#db2777', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}>Compress PDF</button>
          </div>
        )}
        {stage === 'compressing' && <div style={{ padding: '40px', textAlign: 'center' }}>Compressing...</div>}
        {stage === 'done' && result && (
          <div style={{ padding: '40px', borderRadius: 16, border: '1px solid #dcfce7', background: '#f0fdf4', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#166534', marginBottom: 8 }}>Compression complete!</div>
            <div style={{ color: '#6b7280', marginBottom: 24 }}>
              {(result.original / 1024).toFixed(0)} KB → {(result.compressed / 1024).toFixed(0)} KB {pct > 0 ? `(${pct}% smaller)` : ''}
            </div>
            <a href={result.url} download={file?.name || 'compressed.pdf'} style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 10, background: '#16a34a', color: 'white', fontWeight: 700, textDecoration: 'none', marginBottom: 16 }}>Download compressed PDF</a>
            <div><button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>Compress another</button></div>
          </div>
        )}
        {stage === 'error' && (
          <div style={{ padding: '32px', borderRadius: 16, border: '1px solid #fecaca', background: '#fef2f2', textAlign: 'center' }}>
            <div style={{ color: '#dc2626', marginBottom: 16 }}>{errorMsg}</div>
            <button onClick={reset} style={{ padding: '10px 24px', borderRadius: 8, background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer' }}>Try again</button>
          </div>
        )}
      </div>
    </main>
  )
}
