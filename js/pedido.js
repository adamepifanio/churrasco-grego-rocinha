/* Comanda: carrinho, bebidas, totais e mensagem pronta para o WhatsApp. */
(function () {
  const WHATS = '5521981201998', ENTREGA = 5, CREDITO = 3;
  const ITENS = {
    gourmet: { nome: 'Grego Gourmet + suco Del Valle', curto: 'Grego Gourmet', d: 'molho de alho, de ervas e Big Tasty', preco: 35, lanche: true },
    classico: { nome: 'Churrasco Grego + Guara Camp', curto: 'Clássico', d: 'com Guara Camp', preco: 20, lanche: true },
    coca: { nome: 'Coca-Cola', ds: 'Lata', preco: 5, c: '#E41E2B' }, cocazero: { nome: 'Coca-Cola Zero', ds: 'Lata', preco: 5, c: '#2a2a2a' },
    fantal: { nome: 'Fanta Laranja', ds: 'Lata', preco: 5, c: '#F7931E' }, fantau: { nome: 'Fanta Uva', ds: 'Lata', preco: 5, c: '#6B2C91' },
    guarana: { nome: 'Guaraná Antarctica', ds: 'Gelado', preco: 5, c: '#0B8A3E' }, h2oh: { nome: 'H2OH! Limão', ds: 'Gelado', preco: 5, c: '#A6CE39' },
    guaravitton: { nome: 'Guaravitton', ds: 'Gelado', preco: 5, c: '#E8B400' }, coca2l: { nome: 'Coca-Cola 2 litros', ds: 'Pra dividir', preco: 12, c: '#B5121B' },
    guaracamp: { nome: 'Guara Camp', ds: 'Copo 285 ml', preco: 2, c: '#3CA34B' }, agua: { nome: 'Água mineral', ds: 'Gelada', preco: 2, c: '#6FB7E8' },
  };
  const BEBIDAS = ['coca', 'cocazero', 'fantal', 'fantau', 'guarana', 'h2oh', 'guaravitton', 'coca2l', 'guaracamp', 'agua'];
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const brl = (v) => 'R$ ' + v.toFixed(2).replace('.', ',');
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem('cg-comanda') || '{}') || {}; } catch (e) { cart = {}; }
  Object.keys(cart).forEach((k) => { if (!ITENS[k] || !(cart[k] > 0)) delete cart[k]; });
  const save = () => { try { localStorage.setItem('cg-comanda', JSON.stringify(cart)); } catch (e) {} };

  // lista de bebidas
  $('#drinksList').innerHTML = BEBIDAS.map((k) => `<li class="dcard" data-card="${k}"><i class="dcard__sw" style="--c:${ITENS[k].c}" aria-hidden="true"></i>
    <span class="dcard__t"><b>${ITENS[k].nome}</b><span>${ITENS[k].ds}</span><em>${brl(ITENS[k].preco)}</em></span>
    <div class="step" data-step="${k}"><button type="button" data-d="-1" aria-label="Tirar ${ITENS[k].nome}">−</button><output>0</output><button type="button" data-d="1" aria-label="Adicionar ${ITENS[k].nome}">+</button></div></li>`).join('');

  const form = $('#orderForm');
  const val = (n) => (form.elements[n] && form.elements[n].value || '').trim();
  const modo = () => (form.querySelector('[name=modo]:checked') || {}).value || 'entrega';
  const pag = () => (form.querySelector('[name=pag]:checked') || {}).value || 'Pix';
  const conta = () => {
    const linhas = Object.entries(cart).filter(([, q]) => q > 0);
    const sub = linhas.reduce((s, [k, q]) => s + ITENS[k].preco * q, 0);
    const lanches = linhas.reduce((s, [k, q]) => s + (ITENS[k].lanche ? q : 0), 0);
    const qtd = linhas.reduce((s, [, q]) => s + q, 0);
    const ent = qtd && modo() === 'entrega' ? ENTREGA : 0;
    const cred = pag() === 'Crédito' ? lanches * CREDITO : 0;
    return { linhas, sub, ent, cred, qtd, total: sub + ent + cred };
  };

  let ultimo = null;
  function render() {
    const c = conta();
    $$('[data-step]').forEach((el) => { el.querySelector('output').textContent = cart[el.dataset.step] || 0; });
    $$('.dcard').forEach((el) => el.classList.toggle('has', (cart[el.dataset.card] || 0) > 0));
    const ul = $('#ticketItems');
    ul.innerHTML = c.linhas.map(([k, q]) => `<li data-k="${k}"><span class="q">${q}x</span><span>${ITENS[k].curto || ITENS[k].nome}${ITENS[k].d ? `<span class="ds">${ITENS[k].d}</span>` : ''}</span>
      <span>${brl(ITENS[k].preco * q)}</span><button type="button" class="x" data-del="${k}" aria-label="Remover ${ITENS[k].nome}">×</button></li>`).join('');
    $('#ticketEmpty').hidden = c.qtd > 0;
    $('#tSub').textContent = brl(c.sub);
    $('#rowEntrega').hidden = modo() !== 'entrega';
    $('#tEnt').textContent = brl(c.qtd ? ENTREGA : 0);
    $('#rowCred').hidden = !c.cred; $('#tCred').textContent = brl(c.cred);
    $('#tTotal').textContent = brl(c.total);
    $('#ticketNote').textContent = pag() === 'Crédito' ? 'No crédito: acréscimo de R$ 3 por lanche. Você confere tudo no WhatsApp antes de mandar.' : 'Você confere tudo no WhatsApp antes de mandar.';
    const nc = $('#navCount'); nc.hidden = !c.qtd; nc.textContent = c.qtd;
    $('#obarItems').textContent = c.qtd ? `${c.qtd} ${c.qtd > 1 ? 'itens' : 'item'} na comanda` : 'Sua comanda';
    $('#obarTotal').textContent = c.qtd ? brl(c.total) : 'Monte seu pedido';
    $('#obarGo span').textContent = c.qtd ? 'Enviar' : 'Pedir';
    if (ultimo && window.gsap) { const li = ul.querySelector(`[data-k="${ultimo}"]`); if (li) gsap.fromTo(li, { clipPath: 'inset(0 0 100% 0)', y: -6 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: .45, ease: 'expo.out' }); }
    ultimo = null;
    $$('[data-if=entrega]').forEach((f) => (f.hidden = modo() !== 'entrega'));
    $$('[data-if=dinheiro]').forEach((f) => (f.hidden = pag() !== 'Dinheiro'));
    document.dispatchEvent(new CustomEvent('comanda', { detail: c }));
  }
  let tt;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-on'), 2200); }
  function mudar(k, d, aviso) {
    cart[k] = Math.max(0, Math.min(30, (cart[k] || 0) + d)); if (!cart[k]) delete cart[k];
    if (d > 0) { ultimo = k; const tk = $('#ticket'); tk.classList.remove('is-bump'); void tk.offsetWidth; tk.classList.add('is-bump'); if (aviso) toast(`${ITENS[k].curto || ITENS[k].nome} na comanda ✓`); }
    save(); render();
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-d]'); if (b) { const s = b.closest('[data-step]'); mudar(s.dataset.step, +b.dataset.d, false); return; }
    const a = e.target.closest('[data-add]'); if (a) { mudar(a.dataset.add, 1, true); return; }
    const x = e.target.closest('[data-del]'); if (x) { delete cart[x.dataset.del]; save(); render(); }
  });
  form.addEventListener('change', render);
  form.addEventListener('submit', (e) => e.preventDefault());

  function enviar() {
    const c = conta();
    const ir = (sel, msg) => { toast(msg); const el = $(sel); if (window.CG_scrollTo) window.CG_scrollTo(el, () => el.focus && el.focus({ preventScroll: true })); else el.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    if (!c.qtd) return ir('#ticket', 'Escolha pelo menos um lanche 🙂');
    if (!val('nome')) return ir('#fNome', 'Diz seu nome pra gente');
    if (modo() === 'entrega' && !val('endereco')) return ir('#fEnd', 'Falta o endereço da entrega');
    const L = ['*Pedido pelo site — Churrasco Grego* 🔥', ''];
    c.linhas.forEach(([k, q]) => L.push(`${q}x ${ITENS[k].nome} — ${brl(ITENS[k].preco * q)}`));
    L.push('', `Subtotal: ${brl(c.sub)}`);
    if (c.ent) L.push(`Entrega: ${brl(c.ent)}`);
    if (c.cred) L.push(`Acréscimo crédito: ${brl(c.cred)}`);
    L.push(`*Total: ${brl(c.total)}*`, '', `Nome: ${val('nome')}`);
    if (modo() === 'entrega') L.push(`Entregar em: ${val('endereco')}${val('referencia') ? ` (ref.: ${val('referencia')})` : ''}`); else L.push('Vou retirar na loja (Largo do Boiadeiro)');
    L.push(`Pagamento: ${pag()}${pag() === 'Dinheiro' && val('troco') ? ` — troco para R$ ${val('troco')}` : ''}`);
    if (val('obs')) L.push(`Obs.: ${val('obs')}`);
    window.open(`https://wa.me/${WHATS}?text=${encodeURIComponent(L.join('\n'))}`, '_blank', 'noopener');
  }
  $('#sendOrder').addEventListener('click', enviar);
  $('#obarGo').addEventListener('click', () => { if (conta().qtd) enviar(); else window.CG_scrollTo ? window.CG_scrollTo($('#pedido')) : $('#pedido').scrollIntoView(); });
  $('#ticketNo').textContent = String(new Date().getHours() * 100 + new Date().getMinutes()).padStart(4, '0');
  window.CG = { mudar, conta, toast };
  render();
})();
