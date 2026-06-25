'use client'
import { useState } from 'react'

export default function PdfToJpgClient() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const convert = async () => {
    if (!file) return
    setBusy(true); setErr(''); setImages([])
    try {
      const lib: any = await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        s.onload = () => {
          const l = (window as any).pdfjsLib
          l.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          resolve(l)
        }
        s.onerror = reject
        document.head.appendChild(s)
      })
      const buf = await file.arrayBuffer()
      const pdf = await lib.getDocument({ data: buf }).promise
      const urls: string[] = []
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i)
        const vp = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = vp.width; canvas.height = vp.height
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
        urls.push(canvas.toDataURL('image/jpeg', 0.92))
      }
      setImages(urls)
    } catch (e: any) { setErr(e.message || 'Failed') }
    setBusy(false)
  }

  return (
    <main style={{ minHeight: '80vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#111827', marginBottom: 32 }}>PDF to JPG</h1>
        <label style={{ display: 'block', padding: '48px', borderRadius: 16, border: '2px dashed #e5e7eb', cursor: 'pointer', marginBottom: 16 }}>
          <input type="file" accept=".pdf" onChange={e => { setFile(e.target.files?.[0] || null); setImages([]) }} style={{ display: 'none' }} />
          <div style={{ fontWeight: 600, color: '#374151' }}>{file ? file.name : 'Choose PDF file'}</div>
        </label>
        {file && !busy && images.length === 0 && (
          <button onClick={convert} style={{ width: '100%', padding: '13px', borderRadius: 10, background: '#7c3aed', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Convert to JPG</button>
        )}
        {busy && <div style={{ padding: '24px' }}>Converting...</div>}
        {err && <div style={{ padding: '16px', background: '#fef2f2', color: '#dc2626', marginTop: 12 }}>{err}</div>}
        {images.map((url, i) => (
          <div key={i} style={{ marginTop: 16 }}>
            <img src={url} alt={`Page ${i + 1}`} style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <a href={url} download={`page-${i + 1}.jpg`} style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 8, background: '#7c3aed', color: 'white', fontWeight: 600, textDecoration: 'none', marginTop: 8 }}>Download page {i + 1}</a>
          </div>
        ))}
      </div>
    </main>
  )
}
