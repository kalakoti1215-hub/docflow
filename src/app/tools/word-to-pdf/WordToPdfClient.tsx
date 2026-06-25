'use client'
import { useState } from 'react'

export default function WordToPdfClient() {
  const [file, setFile] = useState<File | null>(null)
  const [stage, setStage] = useState<'idle' | 'done' | 'error'>('idle')
  const [url, setUrl] = useState<string | null>(null)
  const [err, setErr] = useState('')

  const convert = async () => {
    if (!file) return
    setErr('')
    try {
      const mammoth = await import('mammoth')
      const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() })
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Calibri,sans-serif;margin:40px;font-size:12pt;line-height:1.5}</style></head><body>${result.value}</body></html>`
      setUrl(URL.createObjectURL(new Blob([html], { type: 'text/html' })))
      setStage('done')
    } catch (e: any) { setErr(e.message || 'Failed'); setStage('error') }
  }

  const reset = () => { setFile(null); setStage('idle'); setUrl(null); setErr('') }

  return (
    <main style={{ minHeight: '80vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>Word to PDF</h1>
        <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 32 }}>Convert .docx files to PDF in your browser.</p>
        {stage === 'idle' && (
          <div>
            <label style={{ display: 'block', padding: '48px', borderRadius: 16, border: '2px dashed #e5e7eb', cursor: 'pointer', marginBottom: 16 }}>
              <input type="file" accept=".docx,.doc" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              <div style={{ fontWeight: 600, color: '#374151' }}>{file ? file.name : 'Choose .docx file'}</div>
            </label>
            {file && (
              <button onClick={convert} style={{ width: '100%', padding: '13px', borderRadius: 10, background: '#16a34a', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Convert to PDF</button>
            )}
          </div>
        )}
        {stage === 'done' && url && (
          <div style={{ padding: '40px', borderRadius: 16, border: '1px solid #dcfce7', background: '#f0fdf4' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#166534', marginBottom: 16 }}>Conversion complete!</div>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Open the file in your browser and use File → Print → Save as PDF to save it.</p>
            <a href={url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 10, background: '#16a34a', color: 'white', fontWeight: 700, textDecoration: 'none', marginBottom: 16 }}>Open document</a>
            <div><button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>Convert another</button></div>
          </div>
        )}
        {stage === 'error' && (
          <div style={{ padding: '32px', borderRadius: 16, border: '1px solid #fecaca', background: '#fef2f2' }}>
            <div style={{ color: '#dc2626', marginBottom: 16 }}>{err}</div>
            <button onClick={reset} style={{ padding: '10px 24px', borderRadius: 8, background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer' }}>Try again</button>
          </div>
        )}
      </div>
    </main>
  )
}
