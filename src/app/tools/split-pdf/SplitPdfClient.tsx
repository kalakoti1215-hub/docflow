'use client'
import { useState } from 'react'

export default function SplitPdfClient() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState(0)
  const [ranges, setRanges] = useState('1-3, 4-6')
  const [results, setResults] = useState<any[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const loadFile = async (f: File) => {
    setFile(f); setResults([]); setErr('')
    const { PDFDocument } = await import('pdf-lib')
    const pdf = await PDFDocument.load(await f.arrayBuffer())
    setPages(pdf.getPageCount())
  }

  const split = async () => {
    if (!file) return
    setBusy(true); setErr('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const src = await PDFDocument.load(await file.arrayBuffer())
      const parts = ranges.split(',').map((r: string) => r.trim()).filter(Boolean)
      const out: any[] = []
      for (const part of parts) {
        const [from, to] = part.includes('-')
          ? part.split('-').map((n: string) => parseInt(n) - 1)
          : [parseInt(part) - 1, parseInt(part) - 1]
        const doc = await PDFDocument.create()
        const pageNums = Array.from({ length: to - from + 1 }, (_: any, i: number) => from + i).filter(n => n >= 0 && n < src.getPageCount())
        const copied = await doc.copyPages(src, pageNums)
        copied.forEach((p: any) => doc.addPage(p))
        const bytes = await doc.save()
        out.push({ url: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })), name: `${file.name.replace('.pdf', '')}-${from + 1}-${to + 1}.pdf` })
      }
      setResults(out)
    } catch (e: any) { setErr(e.message || 'Failed') }
    setBusy(false)
  }

  return (
    <main style={{ minHeight: '80vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#111827', marginBottom: 32 }}>Split PDF</h1>
        <label style={{ display: 'block', padding: '48px', borderRadius: 16, border: '2px dashed #e5e7eb', cursor: 'pointer', marginBottom: 16 }}>
          <input type="file" accept=".pdf" onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f) }} style={{ display: 'none' }} />
          <div style={{ fontWeight: 600, color: '#374151' }}>{file ? `${file.name} (${pages} pages)` : 'Choose PDF'}</div>
        </label>
        {pages > 0 && (
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Page ranges (e.g. 1-3, 4-6, 7)</label>
            <input value={ranges} onChange={e => setRanges(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #d1d5db' }} />
          </div>
        )}
        {pages > 0 && !busy && results.length === 0 && (
          <button onClick={split} style={{ width: '100%', padding: '13px', borderRadius: 10, background: '#059669', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Split PDF</button>
        )}
        {busy && <div style={{ padding: '24px' }}>Splitting...</div>}
        {err && <div style={{ padding: '16px', background: '#fef2f2', color: '#dc2626', marginTop: 12 }}>{err}</div>}
        {results.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, border: '1px solid #e5e7eb', marginBottom: 8 }}>
            <span>{r.name}</span>
            <a href={r.url} download={r.name} style={{ padding: '7px 16px', borderRadius: 8, background: '#059669', color: 'white', fontWeight: 600, textDecoration: 'none' }}>Download</a>
          </div>
        ))}
      </div>
    </main>
  )
}
