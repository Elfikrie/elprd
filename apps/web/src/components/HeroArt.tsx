// Ilustrasi SVG orisinal: lembar ide menjadi struktur. Tidak diklaim sebagai video Seedance.
export default function HeroArt() {
  return <div className="hero-art" aria-hidden="true">
    <svg viewBox="0 0 470 310" fill="none">
      <defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#d1d1d1"/></pattern><linearGradient id="paper" x1="150" y1="40" x2="350" y2="250" gradientUnits="userSpaceOnUse"><stop stopColor="#fff"/><stop offset="1" stopColor="#ededed"/></linearGradient><filter id="shadow" x="-50%" y="-50%" width="200%" height="230%"><feDropShadow dx="0" dy="16" stdDeviation="15" floodOpacity=".08"/></filter></defs>
      <rect x="8" y="2" width="454" height="306" fill="url(#dots)"/>
      <path d="M42 188H100M368 112H420M235 22V48M235 264V291" stroke="#bdbdbd" strokeDasharray="3 4"/>
      <g filter="url(#shadow)">
        <path d="M111 184 241 111 375 186 245 260Z" fill="#dedede" stroke="#c3c3c3"/>
        <path d="M111 177 241 104 375 179 245 253Z" fill="#f4f4f4" stroke="#c6c6c6"/>
        <path d="M111 155 241 82 375 157 245 231Z" fill="#e7e7e7" stroke="#bdbdbd"/>
        <path d="M111 148 241 75 375 150 245 224Z" fill="#fafafa" stroke="#c6c6c6"/>
        <path d="M111 119 241 46 375 121 245 195Z" fill="#e8e8e8" stroke="#bdbdbd"/>
        <path d="M111 112 241 39 375 114 245 188Z" fill="url(#paper)" stroke="#bcbcbc"/>
        <path d="m141 111 99-55 104 59-99 55Z" stroke="#dedede"/>
        <path d="m164 110 33-18 34 19-33 18Z" fill="#3e3e3e"/>
        <path d="m244 91 33-18 34 19-33 18Z" fill="#ddd" stroke="#bcbcbc"/>
        <path d="m246 138 33-18 34 19-33 18Z" fill="#e6e6e6" stroke="#bcbcbc"/>
        <path d="m215 100 12-7 18 10m-14 17 13 8 12-7" stroke="#858585" strokeWidth="1.2"/>
        <path d="m185 111 8 4 15-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <rect x="42" y="58" width="75" height="28" rx="5" fill="#fafafa" stroke="#d7d7d7"/><circle cx="55" cy="72" r="3" fill="#939393"/><text x="65" y="76" fontSize="10" fill="#686868" fontFamily="monospace">IDE AWAL</text>
      <rect x="328" y="221" width="106" height="30" rx="5" fill="#292929"/><path d="m339 236 4 4 7-8" stroke="#fafafa" strokeWidth="1.3"/><text x="357" y="240" fontSize="10" fill="white" fontFamily="monospace">SIAP DIRANCANG</text>
      <path d="m80 87 27 28m266 91 21 15" stroke="#b8b8b8" strokeDasharray="3 4"/>
      <text x="16" y="282" fontSize="9" fill="#858585" fontFamily="monospace" letterSpacing="2">01 / IDE → STRUKTUR</text>
    </svg>
  </div>;
}

