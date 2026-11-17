// Pembaca PRD, kode Markdown, dan diagram dengan ekspor serta daftar isi.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, Copy, FileText, Code2, GitBranch, Check, Pencil, ChevronRight } from 'lucide-react';
import { templates } from '../../../../packages/shared/templates';
import { createDraft } from '../../../../packages/shared/generator';
import { safeFilename, toMarkdown, type Plan } from '../../../../packages/shared/schema';
import { useWorkspace } from '../context';
import { API_URL } from '../api';
import Markdown from '../components/Markdown';
export default function PlanPage({ example = false }: { example?: boolean }) {
  const { id } = useParams(); const { plans, toast } = useWorkspace(); const [tab, setTab] = useState('document'); const [copied, setCopied] = useState(''); const [active, setActive] = useState('overview');
  const template = templates.find(t => t.id === id);
  const plan: Plan | undefined = example && template ? { ...createDraft(template.input), input: template.input, id: template.id, archived: false, mode: 'template', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : plans.find(p => p.id === id);
  if (!plan) return <div className="page-width empty-state"><FileText size={36}/><h1>Rancangan belum ditemukan.</h1><p>Rancangan lokal hanya tersedia di browser tempat kamu membuatnya.</p><Link to="/riwayat" className="button">Buka riwayat<ArrowRight size={16}/></Link></div>;
  async function copy(text: string, key: string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); toast('Teks berhasil disalin.'); setTimeout(() => setCopied(''), 2000); }
    catch { toast('Browser membatasi clipboard. Kamu bisa mengunduh file Markdown.'); }
  }
  async function download() {
    try {
      let blob: Blob;
      if (API_URL && !example && plan!.mode === 'ai') {
        const response = await fetch(API_URL + '/api/plans/' + plan!.id + '/export', { credentials: 'include' });
        if (!response.ok) throw new Error('Unduhan belum berhasil. Coba lagi.'); blob = await response.blob();
      } else blob = new Blob([toMarkdown(plan!)], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = safeFilename(plan!.title); anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Dokumen Markdown siap diunduh.');
    } catch (e) { toast(e instanceof Error ? e.message : 'Unduhan gagal.'); }
  }
  function jump(section: string) { setTab('document'); setActive(section); setTimeout(() => document.getElementById('section-' + section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }
  return <div className="page-width plan-page"><div className="breadcrumb"><Link to={example ? '/template' : '/riwayat'}><ArrowLeft size={14}/>{example ? 'Template' : 'Riwayat'}</Link><ChevronRight size={13}/><span>{plan.title}</span></div>
    {example && <div className="example-banner"><span><FileText size={16}/>Contoh hasil · Draf ilustratif berbasis template</span><Link to={'/?template=' + id}>Gunakan template ini<ArrowRight size={15}/></Link></div>}
    <div className="plan-heading"><div><div className="eyebrow"><span className="status-dot"/>{plan.mode === 'template' ? 'DRAF TEMPLATE' : 'DRAF BERBANTUAN AI'}<span className="eyebrow-separator">/</span>{plan.input.platform.toUpperCase()}</div><h1>{plan.title}</h1><p>{plan.summary}</p></div><div className="plan-heading-actions"><button className="button" onClick={() => void copy(toMarkdown(plan), 'all')}>{copied === 'all' ? <Check size={16}/> : <Copy size={16}/>}Salin</button><button className="button dark" onClick={() => void download()}><Download size={16}/>Unduh .md</button></div></div>
    <div className="document-workspace"><aside className="document-sidebar"><div className="sidebar-label">DALAM DOKUMEN INI<span>{plan.sections.length}</span></div><nav aria-label="Daftar isi PRD">{plan.sections.map((section, i) => <button key={section.id} className={active === section.id ? 'active' : ''} onClick={() => jump(section.id)}><span>{String(i + 1).padStart(2, '0')}</span>{section.title}</button>)}</nav><div className="sidebar-note"><Pencil size={16}/><p>Rancangan yang baik<br/>dimulai dari pertanyaan.<br/><strong>Tinjau setiap asumsi.</strong></p></div></aside>
    <div className="document-main"><div className="document-toolbar"><div className="document-tabs"><button className={tab === 'document' ? 'active' : ''} aria-pressed={tab === 'document'} onClick={() => setTab('document')}><FileText size={15}/>Dokumen</button><button className={tab === 'diagrams' ? 'active' : ''} aria-pressed={tab === 'diagrams'} onClick={() => setTab('diagrams')}><GitBranch size={15}/>Diagram</button><button className={tab === 'markdown' ? 'active' : ''} aria-pressed={tab === 'markdown'} onClick={() => setTab('markdown')}><Code2 size={15}/>Markdown</button></div><span className="document-format">.md</span></div>
      <div className="document-paper">{tab === 'markdown' ? <pre className="raw-markdown">{toMarkdown(plan)}</pre> : <>{tab === 'document' && <div className="document-title"><span className="label-mono">PRODUCT REQUIREMENTS DOCUMENT</span><h2>{plan.title}</h2><div><span>Versi 1.0 · Draf</span><span>{plan.input.detail}</span></div></div>}{plan.sections.filter(s => tab !== 'diagrams' || s.content.includes('```mermaid')).map(section => <section id={'section-' + section.id} key={section.id} className="prd-section"><div className="prd-section-heading"><h2>{section.title}</h2><button className="icon-button" aria-label={'Salin bagian ' + section.title} title="Salin bagian" onClick={() => void copy(section.content, section.id)}>{copied === section.id ? <Check size={15}/> : <Copy size={15}/>}</button></div><div className="markdown-body"><Markdown>{section.content}</Markdown></div></section>)}</>}</div>
    </div></div></div>;
}

