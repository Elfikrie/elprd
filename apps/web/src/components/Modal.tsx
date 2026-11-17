// Dialog native menjaga perangkap fokus, Escape, dan pengembalian fokus ke pemicu.
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className="modal" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-head"><h2>{title}</h2><button type="button" className="icon-button" aria-label="Tutup dialog" onClick={onClose}><X size={20}/></button></div>{children}
  </dialog>;
}

