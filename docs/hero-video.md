# Aset hero

Saat ini hero adalah ilustrasi SVG orisinal (HeroArt.tsx), **bukan video Seedance**. Tidak ada klaim video sudah dibuat atau pengukuran bobot video. Aset final memerlukan pembuatan/ekspor di akun Higgsfield pengguna.

Rekomendasi: video statis sekali buat, tanpa pemanggilan API per kunjungan. Arah abu-abu menggantikan biru tua dari lampiran. Pilihan prompt bahasa Inggris:

1. **Paper architecture.** A minimalist product-design still life, three offset sheets of matte white paper floating over a soft neutral gray surface, precise charcoal architectural diagram lines on the top sheet, extremely slow orbital camera, diffused studio daylight, monochrome palette #F5F5F5 #DADADA #292929, eight-second seamless loop with matching start and end positions, no readable text, no logos, no people, no faces, no purple or blue hues.
2. **Quiet structure.** Pale gray modular blocks gently aligning into a precise architectural grid, a single charcoal block providing focus, orthographic camera with a very subtle forward movement that returns to its starting point, soft contact shadows, restrained monochrome studio lighting, eight-second seamless loop, no text, no people, no screens, no branding.
3. **From line to plan.** Fine graphite lines slowly assemble a simple geometric floor plan on matte light gray paper, small paper layers lift and settle in a looping breath, locked three-quarter overhead camera, diffuse white light, silver gray and charcoal palette, six-second seamless loop, no words, no logos, no hands, no faces.

## Integrasi setelah aset ada
Simpan hero.mp4, hero.webm, hero-mobile.mp4, hero-mobile.webm, hero-poster.webp di apps/web/public/media. Gunakan video autoplay muted loop playsInline preload=metadata, mobile source media max-width 600px, dan poster. Pertahankan SVG sebagai fallback.

Jangan autoplay jika prefers-reduced-motion. Pause saat document.hidden atau elemen keluar viewport via IntersectionObserver. Teks tetap di area terpisah agar kontras tidak bergantung frame video. Target mobile <1.5 MB dan LCP <2.5 s adalah target, bukan hasil ukur. Ukur dengan aset final sebelum mengklaim terpenuhi.

