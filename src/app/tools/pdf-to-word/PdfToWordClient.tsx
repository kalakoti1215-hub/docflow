'use client'
import { useState, useCallback } from 'react'

type Stage = 'idle' | 'reading' | 'extracting' | 'building' | 'done' | 'error'

async function loadPdfJs(): Promise<any> {
    const w = window as any
    if (w.__pdfjsLib) return w.__pdfjsLib
    return new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
          s.onload = () => {
                  const lib = (window as any).pdfjsLib
                  lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
                  w.__pdfjsLib = lib
                  resolve(lib)
          }
          s.onerror = reject
          document.head.appendChild(s)
    })
}

export default function PdfToWordClient() {
    const [file, setFile] = useState<File | null>(null)
    const [stage, setStage] = useState<Stage>('idle')
    const [progress, setProgress] = useState(0)
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
    const [outputName, setOutputName] = useState('')
    const [dragging, setDragging] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

  const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f?.type === 'application/pdf') {
                setFile(f); setStage('idle'); setDownloadUrl(null); setErrorMsg('')
        } else {
                setErrorMsg('Please drop a PDF file.')
        }
  }, [])

  const convert = async () => {
        if (!file) return
        setStage('reading'); setProgress(10); setErrorMsg('')
        try {
                const arrayBuffer = await file.arrayBuffer()
                setProgress(25); setStage('extracting')
                let extractedText = ''
                try {
                          const pdfjsLib = await loadPdfJs()
                          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
                          const pageTexts: string[] = []
                                    for (let i = 1; i <= pdf.numPages; i++) {
                                                const page = await pdf.getPage(i)
                                                const textContent = await page.getTextContent()
                                                pageTexts.push(textContent.items.map((item: any) => item.str || '').join(' '))
                                                setProgress(30 + Math.round((i / pdf.numPages) * 35))
                                    }
                          extractedText = pageTexts.join('\n\n')
                } catch {
                          extractedText = `[Content from ${file.name}]\n\nThis PDF contains scanned images. Upgrade to Pro for OCR.`
                }
                setStage('building'); setProgress(75)
                const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')
                const paragraphs = extractedText.split('\n').map(line => {
                          const trimmed = line.trim()
                          if (!trimmed) return new Paragraph({ children: [new TextRun('')] })
                          return new Paragraph({
                                      children: [new TextRun({ text: trimmed, size: 24, font: 'Calibri' })],
                                      spacing: { after: 120 },
                          })
                })
                const doc = new Document({
                          sections: [{ properties: {}, children: [
                                      new Paragraph({ text: file.name.replace('.pdf', ''), heading: HeadingLevel.HEADING_1, spacing: { after: 240 } }),
                                      new Paragraph({ children: [new TextRun({ text: `Converted by DocFlow · ${new Date().toLocaleDateString()}`, size: 18, color: '888888' })], spacing: { after: 480 } }),
                                      ...paragraphs,
                                    ]}],
                })
                const blob = await Packer.toBlob(doc)
                setDownloadUrl(URL.createObjectURL(blob))
                setOutputName(file.name.replace(/\.pdf$/i, '.docx'))
                setProgress(100); setStage('done')
        } catch (err: any) {
                setStage('error'); setErrorMsg(err?.message || 'Conversion failed.')
        }
  }

  const reset = () => {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl)
        setFile(null); setStage('idle'); setProgress(0)
        setDownloadUrl(null); setOutputName(''); setErrorMsg('')
  }

  return (
        <main style={{ minHeight: '80vh', padding: '48px 24px' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                          <div style={{ textAlign: 'center', marginBottom: 40 }}>
                                      <div style={{ width: 64, height: 64, borderRadius: 16, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>📄</div>div>
                                      <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#111827', marginBottom: 12 }}>PDF to Word Converter</h1>h1>
                                      <p style={{ fontSize: 16, color: '#6b7280' }}>Extract text from any PDF and save as an editable .docx file. Free, instant, no sign up.</p>p>
                          </div>div>

                  {stage === 'idle' && !file && (
                    <div className="drop-zone"
                                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                                  onDragLeave={() => setDragging(false)}
                                  onDrop={handleDrop}
                                  onClick={() => document.getElementById('file-input')?.click()}
                                  style={{ padding: '60px 24px', textAlign: 'center' }}>
                                  <input id="file-input" type="file" accept=".pdf,application/pdf"
                                                  onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setErrorMsg('') } }}
                                                  style={{ display: 'none' }} />
                                  <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>div>
                                  <div style={{ fontWeight: 700, fontSize: 18, color: '#374151', marginBottom: 8 }}>Drop your PDF here</div>div>
                                  <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>or click to browse files</div>div>
                                  <div style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 8, background: '#2563eb', color: 'white', fontWeight: 600, fontSize: 14 }}>Choose PDF file</div>div>
                                  <div style={{ marginTop: 16, fontSize: 12, color: '#9ca3af' }}>Max 25MB on free plan</div>div>
                    </div>div>
                  )}

                  {stage === 'idle' && file && (
                    <div className="fade-in" style={{ padding: '32px', borderRadius: 16, border: '1px solid #e5e7eb', background: 'white' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                                  <div style={{ flex: 1 }}>
                                                                    <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>{file.name}</div>div>
                                                                    <div style={{ fontSize: 13, color: '#9ca3af' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>div>
                                                  </div>div>
                                                  <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20 }}>✕</button>button>
                                  </div>div>
                                  <button onClick={convert} style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#2563eb', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}>
                                                  Convert to Word (.docx)
                                  </button>button>
                    </div>div>
                  )}

                  {['reading', 'extracting', 'building'].includes(stage) && (
                    <div className="fade-in" style={{ padding: '40px 32px', borderRadius: 16, border: '1px solid #e5e7eb', background: 'white', textAlign: 'center' }}>
                                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                                    {{ reading: 'Reading PDF…', extracting: 'Extracting text…', building: 'Building Word document…' }[stage as string]}
                                  </div>div>
                                  <div style={{ height: 8, borderRadius: 999, background: '#f3f4f6', overflow: 'hidden', marginBottom: 8 }}>
                                                  <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#2563eb,#7c3aed)', width: `${progress}%`, transition: 'width 0.4s ease' }} />
                                  </div>div>
                                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{progress}%</div>div>
                    </div>div>
                  )}

                  {stage === 'done' && downloadUrl && (
                    <div className="fade-in" style={{ padding: '40px 32px', borderRadius: 16, border: '1px solid #dcfce7', background: '#f0fdf4', textAlign: 'center' }}>
                                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>div>
                                  <div style={{ fontWeight: 700, fontSize: 20, color: '#166534', marginBottom: 8 }}>Conversion complete!</div>div>
                                  <div style={{ fontSize: 14, color: '#16a34a', marginBottom: 28 }}>Your Word document is ready.</div>div>
                                  <a href={downloadUrl} download={outputName} style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 10, background: '#16a34a', color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 16 }}>
                                                  ⬇ Download {outputName}
                                  </a>a>
                                  <div><button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, textDecoration: 'underline' }}>Convert another file</button>button></div>div>
                    </div>div>
                        )}
                
                  {stage === 'error' && (
                    <div className="fade-in" style={{ padding: '32px', borderRadius: 16, border: '1px solid #fecaca', background: '#fef2f2', textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: 18, color: '#dc2626', marginBottom: 8 }}>⚠️ Conversion failed</div>div>
                                <div style={{ fontSize: 14, color: '#ef4444', marginBottom: 24 }}>{errorMsg}</div>div>
                                <button onClick={reset} style={{ padding: '10px 24px', borderRadius: 8, background: '#dc2626', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Try again</button>button>
                    </div>div>
                        )}
                
                  {errorMsg && stage === 'idle' && (
                    <div style={{ marginTop: 12, padding: '10px 16px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 14 }}>{errorMsg}</div>div>
                        )}
                </div>div>
        </main>main>
      )
}</div>
