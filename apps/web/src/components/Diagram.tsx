// Mermaid dimuat hanya saat diperlukan. Mode strict membatasi HTML dan tautan diagram.
import { useEffect, useId, useRef, useState } from 'react';
export default function Diagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null); const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', fontFamily: 'Arial, sans-serif', themeVariables: { primaryColor: '#f1f1f1', primaryTextColor: '#333333', primaryBorderColor: '#a3a3a3', lineColor: '#737373', secondaryColor: '#fafafa', tertiaryColor: '#f5f5f5' } });
      await mermaid.parse(code);
      const { svg } = await mermaid.render('diagram' + id, code);
      if (active && ref.current) ref.current.innerHTML = svg;
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [code, id]);
  return failed ? <div className="diagram-fallback"><p>Diagram belum bisa ditampilkan. Kode sumber tetap tersedia.</p><pre><code>{code}</code></pre></div> : <div className="diagram-render" ref={ref} aria-label="Diagram rancangan sistem"><span className="muted">Memuat diagram…</span></div>;
}

