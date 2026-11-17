// Titik masuk client; hash router memungkinkan tautan langsung pada hosting statis.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { WorkspaceProvider } from './context';
import Layout from './components/Layout';
import Home from './pages/Home';
import Templates from './pages/Templates';
import History from './pages/History';
import PlanPage from './pages/PlanPage';
import './styles.css';
function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return <WorkspaceProvider><Layout><Routes><Route path="/" element={<Home/>}/><Route path="/template" element={<Templates/>}/><Route path="/riwayat" element={<History/>}/><Route path="/plan/:id" element={<PlanPage/>}/><Route path="/contoh/:id" element={<PlanPage example/>}/><Route path="*" element={<div className="empty-state"><h1>Halaman tidak ditemukan.</h1><Link className="button dark" to="/">Kembali ke beranda</Link></div>}/></Routes></Layout></WorkspaceProvider>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><HashRouter><App/></HashRouter></React.StrictMode>);

