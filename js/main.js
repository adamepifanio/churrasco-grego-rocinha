/* Churrasco Grego v2 — "Cinema da brasa": loader, lanche flutuante com mergulho, brasas, processo real no scroll,
   vitrines com ingredientes, tampa que levita, colagem em profundidade, reels, nav e barra de pedido. */
(function () {
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = () => innerWidth >= 900;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasG = !!window.gsap;
  const DPR = Math.min(2, devicePixelRatio || 1);
  $('#ano').textContent = new Date().getFullYear();
  if (hasG) gsap.registerPlugin(ScrollTrigger);

  /* ---------- scroll suave + âncoras ---------- */
  let lenis = null;
  if (!reduz && window.Lenis && hasG) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  window.CG_scrollTo = (el, cb) => {
    if (typeof el === 'string') el = $(el); if (!el) return;
    const sec = el.matches('section, #cardapio');
    if (lenis) lenis.scrollTo(el, { offset: sec ? 0 : -140, duration: 1.5, onComplete: cb });
    else { el.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: sec ? 'start' : 'center' }); cb && setTimeout(cb, 700); }
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-goto], .nav__links a, .logo'); if (!a) return;
    const sel = a.dataset.goto || a.getAttribute('href'); if (!sel || sel[0] !== '#') return;
    e.preventDefault(); window.CG_scrollTo(sel);
  });

  /* ---------- brasas ---------- */
  let heroVis = true;
  const video = $('#heroVideo');
  new IntersectionObserver(([e]) => { heroVis = e.isIntersecting; if (video) { if (heroVis) video.play().catch(() => {}); else video.pause(); } }).observe($('#topo'));
  (function embers() {
    const c = $('#embers'), x = c.getContext('2d'); let W, H; const P = [];
    const rs = () => { W = c.width = c.offsetWidth * DPR; H = c.height = c.offsetHeight * DPR; }; rs(); addEventListener('resize', rs);
    const novo = (y) => ({ x: Math.random() * W, y: y ?? H + Math.random() * 40, r: (Math.random() * 1.5 + .4) * DPR, v: (Math.random() * .6 + .25) * DPR, w: Math.random() * 6.28, a: Math.random() * .55 + .25 });
    for (let i = 0; i < (desk() ? 60 : 32); i++) P.push(novo(Math.random() * H));
    if (reduz) return;
    (function f() {
      if (heroVis) { x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
        P.forEach((p, i) => { p.y -= p.v; p.w += .02; p.x += Math.sin(p.w) * .35 * DPR; const life = Math.max(0, p.y / H);
          x.fillStyle = `rgba(255,${130 + 80 * life | 0},50,${p.a * Math.min(1, life * 1.5)})`; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.28); x.fill(); if (p.y < -10) P[i] = novo(); }); }
      requestAnimationFrame(f);
    })();
  })();

  /* ---------- quadros do processo (carregados cedo) ---------- */
  const seqN = 160, frames = new Array(seqN);
  const loadFrame = (i) => new Promise((ok) => { if (frames[i]) return ok(); const im = new Image(); im.onload = im.onerror = () => { frames[i] = im; ok(); }; im.src = `assets/seq/${String(i + 1).padStart(3, '0')}.webp`; });

  /* ---------- loader + entrada ---------- */
  const bull = $('#heroBull');
  const pronto = Promise.all([new Promise((ok) => (bull.complete ? ok() : bull.addEventListener('load', ok, { once: true }))), document.fonts ? document.fonts.ready : 0, loadFrame(0)]);
  function intro() {
    if (!hasG || reduz) { $('#loader').remove(); return; }
    gsap.timeline()
      .to('#loader', { opacity: 0, duration: .5, ease: 'power2.out', onComplete: () => $('#loader').remove() })
      .from('#heroBull', { y: 140, opacity: 0, duration: 1.5, ease: 'expo.out' }, '-=.2')
      .from('.h3ro__halo', { scale: .4, opacity: 0, duration: 1.8, ease: 'expo.out' }, '<')
      .from('#heroFood', { y: -60, scale: .6, opacity: 0, duration: 1.3, ease: 'back.out(1.6)' }, '<.35')
      .from('#heroText > *', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .07 }, '<-.2')
      .from('#heroBubble', { scale: .5, opacity: 0, transformOrigin: '80% 100%', duration: .7, ease: 'back.out(2)' }, '-=.4')
      .from('.h3ro__tag', { x: 30, opacity: 0, duration: .8, ease: 'expo.out' }, '<.1')
      .from('.nav', { opacity: 0, duration: .8 }, '<');
  }
  if (hasG && !reduz) gsap.to('#loaderBar', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' });
  Promise.race([Promise.all([pronto, new Promise((ok) => setTimeout(ok, reduz ? 0 : 1150))]), new Promise((ok) => setTimeout(ok, 3500))]).then(intro);
  if (!hasG) return;

  /* ---------- hero: parallax leve (sem ampliar imagem) ---------- */
  if (!reduz) {
    gsap.timeline({ scrollTrigger: { trigger: '#topo', start: 'top top', end: 'bottom top', scrub: .6 } })
      .to('#heroBull', { y: 90, ease: 'none' }, 0)
      .to('#heroFood', { y: -70, rotate: 8, ease: 'none' }, 0)
      .to('#heroBubble, .h3ro__tag', { y: -40, opacity: 0, ease: 'none' }, 0)
      .to('#heroText', { y: -50, opacity: .2, ease: 'none' }, 0);
    if (matchMedia('(pointer: fine)').matches) {
      const fx = gsap.quickTo('#heroFood', 'x', { duration: 1, ease: 'power3.out' }), fy = gsap.quickTo('#heroFood', 'rotationY', { duration: 1, ease: 'power3.out' });
      const bx = gsap.quickTo('#heroBull', 'x', { duration: 1.2, ease: 'power3.out' });
      gsap.set('#heroFood', { transformPerspective: 800 });
      $('#topo').addEventListener('pointermove', (e) => { const x = e.clientX / innerWidth - .5; fx(x * 30); fy(x * 16); bx(x * -14); });
    }
  }

  /* ---------- processo ---------- */
  const pc = $('#procCanvas'), px = pc.getContext('2d'), CH = [0, 20, 52, 92, 124], steps = $$('#steps li');
  steps.forEach((li, i) => (li.dataset.n = i + 1));
  let cur = -1, stepOn = 0;
  function sizeProc() { const r = pc.getBoundingClientRect(); pc.width = Math.round(r.width * DPR); pc.height = Math.round(r.height * DPR); cur = -1; }
  function drawProc(i) {
    let im = frames[i]; for (let d = 1; d < 12 && !(im && im.naturalWidth); d++) im = frames[i - d] || frames[i + d];
    if (!im || !im.naturalWidth) return;
    const W = pc.width, H = pc.height, k = Math.max(W / im.naturalWidth, H / im.naturalHeight);
    px.drawImage(im, (W - im.naturalWidth * k) / 2, (H - im.naturalHeight * k) / 2, im.naturalWidth * k, im.naturalHeight * k);
  }
  function setStep(n) {
    if (n === stepOn) return; steps[stepOn].classList.remove('is-on'); steps[n].classList.add('is-on'); stepOn = n;
    if (!desk()) gsap.fromTo(steps[n], { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'expo.out' });
  }
  sizeProc();
  ScrollTrigger.create({ trigger: '#processo', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (s) => {
    const i = Math.min(seqN - 1, Math.round(s.progress * (seqN - 1))); if (i !== cur) { cur = i; drawProc(i); }
    let n = 0; CH.forEach((c, k) => { if (i >= c) n = k; }); setStep(n); } });
  gsap.from('.proc__media canvas', { scale: .86, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#processo', start: 'top 70%' } });
  const ordem = []; for (let i = 0; i < seqN; i += 4) ordem.push(i); for (let i = 0; i < seqN; i++) if (i % 4) ordem.push(i);
  (async () => { await new Promise((ok) => setTimeout(ok, 1400)); for (let k = 0; k < ordem.length; k += 6) await Promise.all(ordem.slice(k, k + 6).map(loadFrame)); drawProc(Math.max(cur, 0)); })();
  drawProc(0);

  /* ---------- vitrines: ingredientes com o scroll (computador) ou tour automático (celular) ---------- */
  function vitrine(sec) {
    const pin = $('.show__pin', sec), obj = $('.show__obj', sec), tags = $$('.tag2', sec);
    const cap = document.createElement('p'); cap.className = 'show__cap'; cap.setAttribute('aria-live', 'polite');
    $('.show__stage', sec).after(cap);
    const mm2 = gsap.matchMedia();
    mm2.add('(min-width: 900px)', () => {
      gsap.from($('.show__info', sec).children, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: sec, start: 'top 55%' } });
      const g = sec.id === 'gourmet';
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .8 } });
      tl.fromTo(obj, { scale: .8, rotate: g ? -16 : -6, y: 60 }, { scale: 1, rotate: g ? -6 : 0, y: 0, duration: .25, ease: 'power2.out' }, 0);
      tags.forEach((t, i) => tl.fromTo(t, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .06, ease: 'back.out(2)' }, .2 + i * (.55 / tags.length)));
      tl.to(obj, { scale: 1.03, rotate: g ? -3 : 1, duration: .55, ease: 'none' }, .25);
    });
    mm2.add('(max-width: 899px)', () => {
      gsap.from(obj, { y: 40, scale: .9, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: obj, start: 'top 85%' } });
      gsap.from($('.show__info', sec).children, { y: 24, opacity: 0, duration: .9, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: $('.show__info', sec), start: 'top 88%' } });
      let k = 0, t = null;
      const passo = () => { tags.forEach((x, i) => x.classList.toggle('is-on', i === k % tags.length)); cap.textContent = tags[k % tags.length].textContent.trim(); k++; };
      const io = new IntersectionObserver(([e]) => { clearInterval(t); if (e.isIntersecting) { passo(); t = setInterval(passo, 1600); } }, { threshold: .4 }); io.observe(obj);
      return () => { io.disconnect(); clearInterval(t); };
    });
  }
  if (!reduz) { vitrine($('#gourmet')); vitrine($('#classico')); }

  /* ---------- colagem em profundidade ---------- */
  $$('#depth [data-speed]').forEach((el) => {
    const s = +el.dataset.speed;
    gsap.fromTo(el, { y: () => s * (desk() ? -320 : -60) }, { y: () => s * (desk() ? 320 : 60), ease: 'none', scrollTrigger: { trigger: '#depth', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  });
  gsap.from('#depth .d', { opacity: 0, scale: .92, duration: 1.2, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '#depth', start: 'top 80%' } });

  /* ---------- entradas suaves (sem cortar letras) ---------- */
  $$('.menu-intro, .drinks__head, .center-head, .where__info, .trust, .order__head, .faq__head').forEach((el) =>
    gsap.from(el.children, { y: 36, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: el, start: 'top 82%' } }));
  gsap.from('.reel', { y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .14, scrollTrigger: { trigger: '.reels__grid', start: 'top 85%' } });
  gsap.from('.dcard', { y: 24, opacity: 0, duration: .8, ease: 'expo.out', stagger: .04, scrollTrigger: { trigger: '.drinks__grid', start: 'top 88%' } });
  gsap.from('.faq details', { y: 20, opacity: 0, duration: .8, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: '.faq__list', start: 'top 88%' } });
  gsap.from('.foot__bull', { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.foot__band', start: 'top 85%' } });
  gsap.from('.where__img img', { scale: 1.2, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.where', start: 'top 75%' } });
  gsap.from('.foot__logo', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 85%' } });

  /* ---------- reels ---------- */
  const phones = $$('[data-reel]');
  phones.forEach((f) => {
    const v = $('video', f);
    $('.phone__play', f).addEventListener('click', () => { phones.forEach((o) => { if (o !== f) { $('video', o).pause(); o.classList.remove('is-playing'); } }); v.muted = false; v.play(); f.classList.add('is-playing'); });
    v.addEventListener('click', () => { if (v.paused) { v.play(); f.classList.add('is-playing'); } else { v.pause(); f.classList.remove('is-playing'); } });
    v.addEventListener('ended', () => f.classList.remove('is-playing'));
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && !v.paused) { v.pause(); f.classList.remove('is-playing'); } }, { threshold: .2 }).observe(f);
  });

  /* ---------- nav e barra de pedido ---------- */
  const nav = $('#nav'), navLinks = $$('.nav__links a'); let lastY = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { const y = s.scroll(); nav.classList.toggle('is-solid', y > 40);
    if (y > innerHeight * 1.4 && y > lastY + 2) nav.classList.add('is-hidden'); else if (y < lastY - 2 || y < innerHeight) nav.classList.remove('is-hidden'); lastY = y; } });
  [['#processo', '#processo'], ['#cardapio', '#cardapio'], ['#gourmet', '#cardapio'], ['#classico', '#cardapio'], ['#bebidas', '#bebidas'], ['#loja', '#loja'], ['#duvidas', '#duvidas']].forEach(([sec, href]) =>
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => { if (s.isActive) navLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === href)); } }));
  const obar = $('#obar'); let qtd = 0, noPedido = false, passou = false;
  const upd = () => obar.classList.toggle('is-on', (passou || qtd > 0) && !noPedido);
  document.addEventListener('comanda', (e) => { qtd = e.detail.qtd; upd(); });
  qtd = window.CG ? window.CG.conta().qtd : 0;
  ScrollTrigger.create({ trigger: '#processo', start: 'top 60%', onEnter: () => { passou = true; upd(); }, onLeaveBack: () => { passou = false; upd(); } });
  ScrollTrigger.create({ trigger: '#pedido', start: 'top 70%', end: 'bottom 30%', onToggle: (s) => { noPedido = s.isActive; upd(); } });
  upd();

  addEventListener('resize', () => { sizeProc(); drawProc(Math.max(cur, 0)); });
  addEventListener('load', () => ScrollTrigger.refresh());
})();
