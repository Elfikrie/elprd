// Form ide dan kebutuhan; validasi yang sama digunakan oleh client dan server.
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, SlidersHorizontal, ChevronDown, Monitor, Layers, Sparkles, LoaderCircle, X, ArrowUpRight } from 'lucide-react';
import { planInputSchema, type PlanInput } from '../../../../packages/shared/schema';
import { templates } from '../../../../packages/shared/templates';
import { createDraft } from '../../../../packages/shared/generator';
import { useWorkspace } from '../context';
import { API_URL, streamPlan } from '../api';
const blank: PlanInput = { idea: '', name: '', audience: '', features: '', platform: 'Website', detail: 'Lengkap' };
export default function Composer() {
  const [search] = useSearchParams(); const navigate = useNavigate(); const { save, toast, user } = useWorkspace();
  const [input, setInput] = useState<PlanInput>(() => { try { return { ...blank, ...JSON.parse(sessionStorage.getItem('rancang:input') || '{}') }; } catch { return blank; } });
  const [expanded, setExpanded] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [progress, setProgress] = useState(0);
  const controller = useRef<AbortController | null>(null); const textarea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const template = templates.find(t => t.id === search.get('template'));
    if (template) { setInput(template.input); setError(''); textarea.current?.focus(); }
    else if (search.has('baru')) { setInput(blank); setError(''); textarea.current?.focus(); }
  }, [search]);
  useEffect(() => { try { sessionStorage.setItem('rancang:input', JSON.stringify(input)); } catch { /* Input tetap tersedia di memori saat browser membatasi storage. */ } }, [input]);
  useEffect(() => () => controller.current?.abort(), []);
  function update<K extends keyof PlanInput>(key: K, value: PlanInput[K]) { setInput(current => ({ ...current, [key]: value })); setError(''); }
  async function generate(event: React.FormEvent) {
    event.preventDefault(); const valid = planInputSchema.safeParse(input);
    if (!valid.success) { setError(valid.error.issues[0].message); textarea.current?.focus(); return; }
    if (API_URL && !user) { setError('Masuk melalui tombol di kanan atas sebelum membuat plan AI.'); return; }
    setBusy(true); setProgress(0); controller.current = new AbortController();
    try {
      const now = new Date().toISOString();
      const plan = API_URL ? await streamPlan(valid.data, controller.current.signal, setProgress) : { ...createDraft(valid.data), input: valid.data, id: crypto.randomUUID(), createdAt: now, updatedAt: now, archived: false, mode: 'template' as const };
      await save(plan); toast('Rancangan tersimpan. Saatnya meninjau idemu.'); navigate('/plan/' + plan.id);
    } catch (err) { setError(err instanceof Error && err.name === 'AbortError' ? 'Penyusunan dihentikan. Idemu tetap tersimpan di formulir.' : err instanceof Error ? err.message : 'Draf belum bisa disimpan. Periksa ruang penyimpanan browser.'); }
    finally { setBusy(false); }
  }
  return <section className="composer-section" aria-label="Buat rancangan baru">
    <form className={'composer ' + (busy ? 'is-busy' : '')} onSubmit={generate}>
      <div className="composer-top"><label htmlFor="idea"><span className="tiny-plus">+</span>Apa yang ingin kamu bangun?</label><span className="label-mono">MULAI DARI SEBUAH IDE</span></div>
      <textarea ref={textarea} id="idea" name="idea" placeholder="Aku ingin membuat aplikasi untuk…" value={input.idea} onChange={e => update('idea', e.target.value)} maxLength={6000} aria-describedby={error ? 'idea-error' : 'idea-hint'} disabled={busy}/>
      <div className="composer-hint"><span id="idea-hint">Ceritakan idemu, siapa penggunanya, dan masalah yang ingin diselesaikan.</span><span>{input.idea.length.toLocaleString('id-ID')} / 6.000</span></div>
      {expanded && <div className="advanced-fields"><div className="field-row"><label>Nama produk <span>opsional</span><input value={input.name} maxLength={80} onChange={e => update('name', e.target.value)} placeholder="Misalnya: Ruang Belajar" disabled={busy}/></label><label>Pengguna sasaran <span>opsional</span><input value={input.audience} maxLength={400} onChange={e => update('audience', e.target.value)} placeholder="Siapa yang akan menggunakannya?" disabled={busy}/></label></div><label>Fitur utama <span>pisahkan dengan titik koma</span><input value={input.features} maxLength={2000} onChange={e => update('features', e.target.value)} placeholder="Katalog; Pencarian; Pemesanan; Laporan" disabled={busy}/></label></div>}
      {error && <p className="form-error composer-error" id="idea-error" role="alert">{error}</p>}
      <div className="composer-bottom"><div className="composer-options"><label className="select-chip"><Monitor size={15}/><select aria-label="Platform produk" value={input.platform} onChange={e => update('platform', e.target.value as PlanInput['platform'])} disabled={busy}><option>Website</option><option>Aplikasi mobile</option><option>Website & mobile</option></select><ChevronDown size={13}/></label><label className="select-chip"><Layers size={15}/><select aria-label="Detail dokumen" value={input.detail} onChange={e => update('detail', e.target.value as PlanInput['detail'])} disabled={busy}><option>Lengkap</option><option>Ringkas</option></select><ChevronDown size={13}/></label><button type="button" className={'options-button ' + (expanded ? 'selected' : '')} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><SlidersHorizontal size={15}/><span>Atur kebutuhan</span></button></div>
      <button className="button dark generate-button" type="submit" disabled={busy}>{busy ? <><LoaderCircle size={17} className="spin"/>Menyusun…</> : <>Buat rancangan<ArrowRight size={18}/></>}</button></div>
      {busy && <div className="generation-progress" role="status"><span>{progress ? `Menerima ${progress.toLocaleString('id-ID')} karakter dari AI…` : 'Menyiapkan dokumen…'}</span><button type="button" className="text-button" onClick={() => controller.current?.abort()}><X size={14}/>Hentikan</button></div>}
    </form>
    <div className="composer-meta"><span><span className="status-dot"/>{API_URL ? 'Claude melalui server privat' : 'Mode template · Tanpa akun, tersimpan di browser'}</span><span>Hasil berupa PRD, diagram & task list<ArrowUpRight size={12}/></span></div>
    <div className="idea-starters"><span>Butuh titik awal?</span>{templates.slice(0, 3).map(t => <button key={t.id} type="button" disabled={busy} onClick={() => { setInput(t.input); textarea.current?.focus(); setError(''); }}><Sparkles size={13}/>{t.id === 'booking' ? 'Aplikasi booking' : t.id === 'finance' ? 'Catatan keuangan' : 'Platform belajar'}<ArrowUpRight size={12}/></button>)}</div>
  </section>;
}

