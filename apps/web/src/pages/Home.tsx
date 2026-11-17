// Halaman kerja utama: ide, penyusunan, dan riwayat nyata pengguna.
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, GitBranch, ListChecks, ArrowUpRight } from 'lucide-react';
import HeroArt from '../components/HeroArt';
import Composer from '../components/Composer';
import { useWorkspace } from '../context';
export default function Home() {
  const { plans } = useWorkspace(); const recent = plans.filter(p => !p.archived).slice(0, 3);
  return <div className="home page-width"><section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/>DARI IDE, JADI RENCANA.</div><h1>Ide di kepala.<br/><span>Rencana di depan mata.</span></h1><p>Tuangkan idemu. Susun kebutuhan, petakan sistem,<br className="desktop-break"/> dan mulai membangun dengan arah yang jelas.</p><Link to="/contoh/booking" className="hero-example">Intip contoh hasilnya <ArrowUpRight size={15}/></Link></div><HeroArt/></section>
    <Composer/>
    <section className="deliverables"><div className="section-heading"><h2>Satu ide. Rancangan yang utuh.</h2><span>YANG AKAN KAMU DAPATKAN</span></div><div className="deliverable-grid">
      <article><div className="deliverable-top"><span className="outline-icon"><FileText size={21} strokeWidth={1.5}/></span><span className="step-number">01</span></div><h3>PRD yang terstruktur</h3><p>Tujuan, pengguna, fitur, dan kriteria selesai. <br/>Semua punya tempatnya.</p></article>
      <article><div className="deliverable-top"><span className="outline-icon"><GitBranch size={21} strokeWidth={1.5}/></span><span className="step-number">02</span></div><h3>Sistem yang tergambar</h3><p>Arsitektur dan diagram Mermaid untuk <br/>memahami bagaimana semuanya terhubung.</p></article>
      <article><div className="deliverable-top"><span className="outline-icon"><ListChecks size={21} strokeWidth={1.5}/></span><span className="step-number">03</span></div><h3>Langkah yang bisa dikerjakan</h3><p>Task berurutan, siap dibawa ke editor <br/>atau AI coding agent favoritmu.</p></article>
    </div></section>
    {recent.length > 0 && <section className="recent-section"><div className="section-heading"><h2>Lanjutkan rancanganmu</h2><Link className="text-link" to="/riwayat">Lihat riwayat<ArrowRight size={14}/></Link></div><div className="recent-list">{recent.map(plan => <Link to={'/plan/' + plan.id} key={plan.id}><FileText size={18}/><div><strong>{plan.title}</strong><span>{plan.input.platform} · {new Date(plan.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span></div><ArrowUpRight size={16}/></Link>)}</div></section>}
    <div className="bottom-note"><span className="note-line"/><p>Mulai dari draf. Perjelas sambil jalan.</p><span className="note-line"/></div>
  </div>;
}


