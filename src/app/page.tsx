import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const tools = [
  { href: '/tools/pdf-to-word', label: 'PDF to Word', desc: 'Convert PDF to editable Word document', color: '#dbeafe' },
  { href: '/tools/word-to-pdf', label: 'Word to PDF', desc: 'Turn Word docs into PDF instantly', color: '#dcfce7' },
  { href: '/tools/merge-pdf', label: 'Merge PDF', desc: 'Combine multiple PDFs into one file', color: '#fef3c7' },
  { href: '/tools/compress-pdf', label: 'Compress PDF', desc: 'Reduce PDF file size', color: '#fce7f3' },
  { href: '/tools/pdf-to-jpg', label: 'PDF to JPG', desc: 'Extract pages as images', color: '#f3e8ff' },
  { href: '/tools/jpg-to-pdf', label: 'JPG to PDF', desc: 'Convert images to PDF', color: '#ffedd5' },
  { href: '/tools/split-pdf', label: 'Split PDF', desc: 'Separate pages into individual files', color: '#ecfdf5' },
  ]

export default function HomePage() {
    return (
          <>
                <Navbar />
                <section style={{ background: 'linear-gradient(160deg, #eff6ff 0%, #ffffff 60%)', padding: '72px 24px 64px', textAlign: 'center' }}>
                        <div style={{ maxWidth: 760, margin: '0 auto' }}>
                                  <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#111827', marginBottom: 20 }}>
                                              PDF tools that actually <span style={{ color: '#2563eb' }}>work</span>span>
                                  </h1>h1>
                                  <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.7 }}>
                                              Convert, compress, merge PDFs in seconds. No installation. No watermarks.
                                  </p>p>
                                  <Link href="/tools/pdf-to-word" style={{ padding: '14px 28px', borderRadius: 10, background: '#2563eb', color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>Convert PDF to Word</Link>Link>
                        </div>div>
                </section>section>
                <section id="tools" style={{ padding: '72px 24px' }}>
                        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
                                  <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#111827', marginBottom: 48 }}>All your PDF tools, one place</h2>h2>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                                    {tools.map(({ href, label, desc, color }) => (
                          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                                          <div style={{ padding: '24px', borderRadius: 16, border: '1px solid #e5e7eb', background: 'white' }}>
                                                            <div style={{ width: 48, height: 48, borderRadius: 12, background: color, marginBottom: 16 }}></div>div>
                                                            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 6 }}>{label}</div>div>
                                                            <div style={{ fontSize: 13, color: '#6b7280' }}>{desc}</div>div>
                                          </div>div>
                          </Link>Link>
                        ))}
                                  </div>div>
                        </div>div>
                </section>section>
                <Footer />
          </>>
        )
}</>
