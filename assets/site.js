/*    LPK Cahaya Subarashi - interaksi
   Easing & timing mengikuti panduan anti-slop 5.7. */
(function () {
  'use strict';

  var kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- split headline per kata (anti-slop 5.5) ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var isi = el.textContent.trim();
    el.setAttribute('aria-label', isi);
    var kata = isi.split(/\s+/);
    el.innerHTML = kata.map(function (k, i) {
      return '<span class="kata" style="transition-delay:' + (0.25 + i * 0.08).toFixed(2) + 's" aria-hidden="true">' + k + '</span>';
    }).join(' ');
  });

  /* ---------- reveal on scroll ---------- */
  var target = document.querySelectorAll('.rv, [data-split]');
  if ('IntersectionObserver' in window && !kurangiGerak) {
    var io = new IntersectionObserver(function (entri) {
      entri.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('masuk'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    target.forEach(function (el) { io.observe(el); });
  } else {
    target.forEach(function (el) { el.classList.add('masuk'); });
  }

  /* ---------- header menempel + progress bar ---------- */
  var hdr = document.getElementById('hdr');
  var barTop = document.getElementById('barTop');
  function saatScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (hdr) hdr.classList.toggle('menempel', y > 24);
    if (barTop) {
      var tinggi = document.documentElement.scrollHeight - window.innerHeight;
      barTop.style.width = (tinggi > 0 ? (y / tinggi) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', saatScroll, { passive: true });
  saatScroll();

  /* ---------- hero slideshow (7 detik, crossfade) ---------- */
  var slide = document.querySelectorAll('.hero-slide');
  var dots = document.querySelectorAll('#heroDots button');
  var idx = 0, timer = null;
  function tampilSlide(n) {
    idx = (n + slide.length) % slide.length;
    slide.forEach(function (s, i) { s.classList.toggle('aktif', i === idx); });
    dots.forEach(function (d, i) { d.setAttribute('aria-selected', String(i === idx)); });
  }
  function jalan() {
    if (kurangiGerak || slide.length < 2) return;
    timer = setInterval(function () { tampilSlide(idx + 1); }, 7000);
  }
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () {
      clearInterval(timer); tampilSlide(i); jalan();
    });
  });
  jalan();

  /* ---------- drawer mobile + focus trap ---------- */
  var drawer = document.getElementById('drawer');
  var burger = document.getElementById('burger');
  var scrim = document.getElementById('scrim');
  var tutupDrawer = document.getElementById('tutupDrawer');

  function bukaDrawer() {
    drawer.classList.add('buka');
    drawer.setAttribute('aria-hidden', 'false');
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add('tampil'); });
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (tutupDrawer) tutupDrawer.focus();
  }
  function tutupDrawerFn() {
    drawer.classList.remove('buka');
    drawer.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('tampil');
    setTimeout(function () { scrim.hidden = true; }, 500);
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger.focus();
  }
  if (burger) burger.addEventListener('click', bukaDrawer);
  if (tutupDrawer) tutupDrawer.addEventListener('click', tutupDrawerFn);
  if (scrim) scrim.addEventListener('click', tutupDrawerFn);
  if (drawer) drawer.querySelectorAll('nav a').forEach(function (a) {
    a.addEventListener('click', tutupDrawerFn);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('buka')) tutupDrawerFn();
  });

  /* ---------- accordion FAQ ---------- */
  document.querySelectorAll('.acc-head').forEach(function (h) {
    h.setAttribute('aria-expanded', 'false');
    h.addEventListener('click', function () {
      var acc = h.parentElement;
      var buka = acc.classList.toggle('buka');
      h.setAttribute('aria-expanded', String(buka));
    });
  });

  /* ---------- lightbox galeri ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightImg = document.getElementById('lightImg');
  var lightCap = document.getElementById('lightCap');
  var tutupLight = document.getElementById('tutupLight');
  var terakhirFokus = null;

  document.querySelectorAll('.galeri img').forEach(function (img) {
    img.addEventListener('click', function () {
      terakhirFokus = img;
      lightImg.src = img.src;
      lightImg.alt = img.alt;
      lightCap.textContent = img.alt;
      lightbox.classList.add('buka');
      document.body.style.overflow = 'hidden';
      if (tutupLight) tutupLight.focus();
    });
  });
  function tutupLightbox() {
    lightbox.classList.remove('buka');
    document.body.style.overflow = '';
    if (terakhirFokus) terakhirFokus.focus();
  }
  if (tutupLight) tutupLight.addEventListener('click', tutupLightbox);
  if (lightbox) lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) tutupLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('buka')) tutupLightbox();
  });

  /* ---------- form → WhatsApp ---------- */
  var form = document.getElementById('formDaftar');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = document.getElementById('formErr');
      if (!form.checkValidity()) {
        if (err) err.style.display = 'block';
        var gagal = form.querySelector(':invalid');
        if (gagal) gagal.focus();
        return;
      }
      if (err) err.style.display = 'none';
      var d = new FormData(form);
      var teks = 'Halo LPK Cahaya Subarashi, saya mau daftar.%0A%0A'
        + 'Nama: ' + encodeURIComponent(d.get('nama') || '') + '%0A'
        + 'Usia: ' + encodeURIComponent(d.get('usia') || '') + '%0A'
        + 'WhatsApp: ' + encodeURIComponent(d.get('wa') || '') + '%0A'
        + 'Pendidikan: ' + encodeURIComponent(d.get('pendidikan') || '') + '%0A'
        + 'Minat: ' + encodeURIComponent(d.get('program') || '') + '%0A'
        + 'Pertanyaan: ' + encodeURIComponent(d.get('pesan') || '-');
      window.open('https://wa.me/6281339265091?text=' + teks, '_blank', 'noopener');
    });
  }

  /* ---------- bar dekoratif: sembunyi begitu footer masuk layar ----------
     Bar ini duduk tetap di dasar viewport, jadi saat footer masuk ia menimpa
     teks footer (blok brand, kontak). Disembunyikan selama footer terlihat. */
  var bar = document.querySelector('.frame-bawah');
  var kaki = document.querySelector('.footer');
  if (bar && kaki && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (ent) {
      bar.classList.toggle('sembunyi', ent[0].isIntersecting);
    }, { threshold: 0.02 }).observe(kaki);
  }

  /* ---------- tahun footer ---------- */
  var thn = document.getElementById('tahun');
  if (thn) thn.textContent = String(new Date().getFullYear());

  /* ---------- kursor kustom (pointer presisi saja) ---------- */
  var kursor = document.getElementById('kursor');
  var halus = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (kursor && halus && !kurangiGerak) {
    var x = 0, y = 0, tx = 0, ty = 0, jalanKursor = false;
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!jalanKursor) { kursor.classList.add('aktif'); jalanKursor = true; }
    });
    (function loop() {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      kursor.style.left = x + 'px'; kursor.style.top = y + 'px';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseleave', function () { kursor.classList.remove('aktif'); jalanKursor = false; });
  }

  /* ---------- animasi kirim label ---------- */
  document.querySelectorAll('.kirim').forEach(function (el) {
    el.addEventListener('click', function () {
      var asal = el.textContent;
      el.textContent = 'TERSALIN';
      setTimeout(function () { el.textContent = asal; }, 1600);
    });
  });
})();
