'use client'
import { useState } from 'react'

export default function JpgToPdfClient() {
  const [files, setFiles] = useState<File[]>([])
  const [url, setUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const convert = async () => {
    if (!files.length) return
    setBusy(true); setErr('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const doc = await PDFDocument.create()
      for (const f of files) {
        const buf = await f.arrayBuffer()
        const img = f.type === 'image/png' ? await doc.embedPng(buf) : await doc.embedJpg(buf)
        const page = doc.addPage([img.width, img.height])
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
      }
      const bytes = await doc.save()
      setUrl(URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })))
    } catch (e: any) { setErr(e.message || 'Failed') }
    setBusy(false)
  }

  return (
    <main style={{ minHeight: '80vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#111827', marginBottom: 32 }}>JPG to PDF</h1>
        <label style={{ display: 'block', padding: '48px', borderRadius: 16, border: '2px dashed #e5e7eb', cursor: 'pointer', marginBottom: 16 }}>
          <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} style={{ display: 'none' }} />
          <div style={{ fontWeight: 600, color: '#374151' }}>{files.length ? `${files.length} image(s) selected` : 'Choose images'}</div>
        </label>
        {files.length > 0 && !busy && !url && (
          <button onClick={convert} style={{ width: '100%', padding: '13px', borderRadius: 10, background: '#ea580c', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Convert to PDF</button>
        )}
        {busy && <div style={{ padding: '24px' }}>Building PDF...</div>}
        {err && <div style={{ padding: '16px', background: '#fef2f2', color: '#dc2626', marginTop: 12 }}>{err}</div>}
        {url && (
          <div style={{ padding: '40px', borderRadius: 16, border: '1px solid #dcfce7', background: '#f0fdf4', marginTop: 16 }}>
            <a href={url} download="images.pdf" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 10, background: '#16a34a', color: 'white', fontWeight: 700, textDecoration: 'none' }}>Download PDF</a>
          </div>
        )}
      </div>
    </main>
  )
}
