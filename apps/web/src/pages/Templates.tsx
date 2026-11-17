// Katalog contoh yang ditandai jelas; setiap template membuka input yang dapat diubah.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, CalendarDays, Wallet, BookOpen, Package, Users, Coffee, Search } from 'lucide-react';
import { templates } from '../../../../packages/shared/templates';
const icons = { calendar: CalendarDays, wallet: Wallet, book: BookOpen, box: Package, users: Users, coffee: Coffee };
export default function Templates() {
  const [category, setCategory] = useState('Semua'); const [query, setQuery] = useState('');
  const shown = templates.filter(t => (category === 'Semua' || t.category === category) && (t.title + t.description).toLowerCase().includes(query.toLowerCase()));
  return <div className="page-width inner-page"><div className="eyebrow"><span className="eyebrow-line"/>TIDAK HARUS DARI NOL</div><div className="page-heading"><div><h1>Temukan titik awalmu.</h1><p>Pilih contoh yang dekat dengan idemu. Ubah sesuai kebutuhanmu.</p></div><span className="count-label">06 TEMPLATE AWAL</span></div>
  <div className="filter-toolbar"><div className="filter-tabs" aria-label="Kategori template">{['Semua', 'Bisnis', 'Produktivitas', 'Pendidikan', 'Komunitas'].map(c => <button key={c} className={c === category ? 'active' : ''} aria-pressed={c === category} onClick={() => setCategory(c)}>{c}</button>)}</div><label className="search-input"><Search size={16}/><input aria-label="Cari template" placeholder="Cari template…" value={query} onChange={e => setQuery(e.target.value)}/></label></div>
  <div className="template-grid">{shown.map(t => { const Icon = icons[t.icon]; return <article className="template-card" key={t.id}><div className={'template-art template-art-' + t.id}><Icon size={48} strokeWidth={.9}/><span className="template-art-cross cross-one">+</span><span className="template-art-cross cross-two">+</span><span className="template-code">{t.id.toUpperCase()} / 01</span></div><div className="template-body"><span className="badge">{t.category}</span><h2>{t.title}</h2><p>{t.description}</p><div className="template-actions"><Link to={'/?template=' + t.id} className="text-link">Gunakan template<ArrowRight size={15}/></Link><Link to={'/contoh/' + t.id} className="icon-button" aria-label={'Lihat contoh ' + t.title}><ArrowUpRight size={18}/></Link></div></div></article>; })}</div>
  {shown.length === 0 && <div className="empty-state"><Search size={30}/><h2>Belum ada yang cocok.</h2><p>Coba kata kunci atau kategori lain.</p><button className="button" onClick={() => { setQuery(''); setCategory('Semua'); }}>Reset pencarian</button></div>}
  <div className="template-footnote"><BookOpen size={16}/><p>Semua contoh adalah draf ilustratif berbasis template. Tinjau asumsi dan lengkapi aturan bisnis sebelum membangun.</p></div></div>;
}

