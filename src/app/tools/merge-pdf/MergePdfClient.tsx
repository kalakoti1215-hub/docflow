'use client'
import { useState, useCallback } from 'react'

export default function MergePdfClient() {
  const [files, setFiles] = useState<File[]>([])
  const [stage, setStage] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const addFiles = useCallback((f: FileList | File[]) => {
    const pdfs = Array.from(f).filter(f => f.type === 'application/pdf')
    setFiles(prev => [...prev, ...pdfs])
  }, [])

  const merge = async () => {
    if (files.length < 2) return
    setStage('merging'); setProgress(10); setErrorMsg('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const merged = await PDFDocument.create()
      for (let i = 0; i < files.length; i++) {
        const buf = await files[i].arrayBuffer()
        const pdf = await PDFDocument.load(buf)
        const pages = await merged.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(p => merged.addPage(p))
        setProgress(20 + Math.round(((i + 1) / files.length) * 70))
      }
      const bytes = await merged.save()
      setDownloadUrl(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })))
      setProgress(100); setStage('done')
    } catch (err: any) {
      setStage('error'); setErrorMsg(err?.message || 'Merge failed.')
    }
  }

  const reset = () => { setFiles([]); setStage('idle'); setProgress(0); setDownloadUrl(null); setErrorMsg('') }

  return (
    <main style={{ minHeight: '80vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>Merge PDF Files</h1>
          <p style={{ fontSize: 16, color: '#6b7280' }}>Combine multiple PDFs into one document.</p>
        </div>
        {stage === 'idle' && (
          <div>
            <div className="drop-zone" onDragOver={e => { e.preventDefault() }} onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }} onClick={() => document.getElementById('merge-input')?.click()} style={{ padding: '48px 24px', textAlign: 'center', marginBottom: 16 }}>
              <input id="merge-input" type="file" accept=".pdf" multiple onChange={e => e.target.files && addFiles(e.target.files)} style={{ display: 'none' }} />
              <div style={{ fontWeight: 600, fontSize: 16, color: '#374151' }}>Drop PDFs here or click to browse</div>
            </div>
            {files.length > 0 && (
              <div>
                {files.map((f, idx) => (<div key={idx} style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #e5e7eb', marginBottom: 8 }}>{f.name}</div>))}
                <button onClick={merge} disabled={files.length < 2} style={{ width: '100%', marginTop: 8, padding: '13px', borderRadius: 10, background: files.length >= 2 ? '#2563eb' : '#9ca3af', color: 'white', fontWeight: 700, border: 'none', cursor: files.length >= 2 ? 'pointer' : 'not-allowed' }}>
                  {files.length < 2 ? 'Add at least 2 PDFs' : `Merge ${files.length} PDFs`}
                </button>
              </div>
            )}
          </div>
        )}
        {stage === 'merging' && <div style={{ padding: '40px', textAlign: 'center' }}>Merging... {progress}%</div>}
        {stage === 'done' && downloadUrl && (
          <div style={{ padding: '40px', borderRadius: 16, border: '1px solid #dcfce7', background: '#f0fdf4', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#166534', marginBottom: 16 }}>Merge complete!</div>
            <a href={downloadUrl} download="merged.pdf" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 10, background: '#16a34a', color: 'white', fontWeight: 700, textDecoration: 'none' }}>Download merged.pdf</a>
            <div style={{ marginTop: 16 }}><button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>Merge more</button></div>
          </div>
        )}
        {stage === 'error' && (
          <div style={{ padding: '32px', borderRadius: 16, border: '1px solid #fecaca', background: '#fef2f2', textAlign: 'center' }}>
            <div style={{ color: '#dc2626', fontWeight: 700, marginBottom: 8 }}>Error: {errorMsg}</div>
            <button onClick={reset} style={{ padding: '10px 24px', borderRadius: 8, background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer' }}>Try again</button>
          </div>
        )}
      </div>
    </main>
  )
}
