




























(function () {
  const N = v => (Math.round(v * 10000) / 10000).toString();
  const CURVA = 16;                         


  function segmentos(d) {
    const tok = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) || [];
    const subs = [];
    let i = 0, cmd = '', cx = 0, cy = 0, sx = 0, sy = 0, sub = null, lastC = null, lastQ = null;
    const num = () => parseFloat(tok[i++]);
    while (i < tok.length) {
      if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      const ox = rel ? cx : 0, oy = rel ? cy : 0;
      if (C === 'M') {
        cx = num() + ox; cy = num() + oy; sx = cx; sy = cy;
        sub = { ini: [cx, cy], segs: [], cerrado: false }; subs.push(sub);
        cmd = rel ? 'l' : 'L'; lastC = lastQ = null; continue;
      }
      if (!sub) { sub = { ini: [cx, cy], segs: [], cerrado: false }; subs.push(sub); }
      if (C === 'Z') { sub.segs.push({ t: 'L', x: sx, y: sy }); sub.cerrado = true; cx = sx; cy = sy; lastC = lastQ = null; continue; }
      if (C === 'L') { cx = num() + ox; cy = num() + oy; sub.segs.push({ t: 'L', x: cx, y: cy }); lastC = lastQ = null; continue; }
      if (C === 'H') { cx = num() + ox; sub.segs.push({ t: 'L', x: cx, y: cy }); lastC = lastQ = null; continue; }
      if (C === 'V') { cy = num() + oy; sub.segs.push({ t: 'L', x: cx, y: cy }); lastC = lastQ = null; continue; }
      if (C === 'C' || C === 'S') {
        let x1, y1;
        if (C === 'C') { x1 = num() + ox; y1 = num() + oy; }
        else { x1 = lastC ? 2 * cx - lastC[0] : cx; y1 = lastC ? 2 * cy - lastC[1] : cy; }
        const x2 = num() + ox, y2 = num() + oy, x = num() + ox, y = num() + oy;
        sub.segs.push({ t: 'C', x0: cx, y0: cy, x1, y1, x2, y2, x, y });
        lastC = [x2, y2]; lastQ = null; cx = x; cy = y; continue;
      }
      if (C === 'Q' || C === 'T') {
        let x1, y1;
        if (C === 'Q') { x1 = num() + ox; y1 = num() + oy; }
        else { x1 = lastQ ? 2 * cx - lastQ[0] : cx; y1 = lastQ ? 2 * cy - lastQ[1] : cy; }
        const x = num() + ox, y = num() + oy;
        sub.segs.push({ t: 'Q', x0: cx, y0: cy, x1, y1, x, y });
        lastQ = [x1, y1]; lastC = null; cx = x; cy = y; continue;
      }
      if (C === 'A') {
        const rx = num(), ry = num(), rot = num(), la = num(), sw = num(), x = num() + ox, y = num() + oy;
        sub.segs.push({ t: 'A', x0: cx, y0: cy, rx, ry, rot, la, sw, x, y });
        lastC = lastQ = null; cx = x; cy = y; continue;
      }
      i++;                                      
    }
    return subs;
  }


  function puntosArco(s) {
    let { x0, y0, rx, ry, rot, la, sw, x, y } = s;
    if (!rx || !ry) return [[x, y]];
    rx = Math.abs(rx); ry = Math.abs(ry);
    const f = rot * Math.PI / 180, cf = Math.cos(f), sf = Math.sin(f);
    const dx = (x0 - x) / 2, dy = (y0 - y) / 2;
    const x1p = cf * dx + sf * dy, y1p = -sf * dx + cf * dy;
    const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
    const sg = (la === sw) ? -1 : 1;
    const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
    const co = sg * Math.sqrt(Math.max(0, num / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)));
    const cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx;
    const ccx = cf * cxp - sf * cyp + (x0 + x) / 2, ccy = sf * cxp + cf * cyp + (y0 + y) / 2;
    const ang = (ux, uy, vx, vy) => {
      const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
      return a;
    };
    const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!sw && dt > 0) dt -= 2 * Math.PI;
    if (sw && dt < 0) dt += 2 * Math.PI;
    const n = Math.max(4, Math.ceil(CURVA * Math.abs(dt) / Math.PI)), out = [];
    for (let k = 1; k <= n; k++) {
      const t = t1 + dt * k / n, px = rx * Math.cos(t), py = ry * Math.sin(t);
      out.push([cf * px - sf * py + ccx, sf * px + cf * py + ccy]);
    }
    return out;
  }

  function puntosSub(sub) {
    const pts = [sub.ini.slice()];
    let curva = false;
    sub.segs.forEach(s => {
      if (s.t === 'L') { pts.push([s.x, s.y]); return; }
      curva = true;
      if (s.t === 'A') { puntosArco(s).forEach(p => pts.push(p)); return; }
      for (let k = 1; k <= CURVA; k++) {
        const t = k / CURVA, u = 1 - t;
        if (s.t === 'C') pts.push([u * u * u * s.x0 + 3 * u * u * t * s.x1 + 3 * u * t * t * s.x2 + t * t * t * s.x,
                                   u * u * u * s.y0 + 3 * u * u * t * s.y1 + 3 * u * t * t * s.y2 + t * t * t * s.y]);
        else pts.push([u * u * s.x0 + 2 * u * t * s.x1 + t * t * s.x, u * u * s.y0 + 2 * u * t * s.y1 + t * t * s.y]);
      }
    });
    return { pts, curva, cerrado: sub.cerrado };
  }



  const ACI = [[1, 255, 0, 0], [2, 255, 255, 0], [3, 0, 255, 0], [4, 0, 255, 255], [5, 0, 0, 255],
               [6, 255, 0, 255], [30, 255, 127, 0], [40, 255, 191, 0], [150, 0, 127, 255],
               [14, 165, 0, 0], [174, 0, 63, 127], [94, 0, 127, 0], [54, 191, 191, 0]];
  function colorAci(css) {
    const m = String(css || '').match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (!m) return null;
    if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;
    const r = +m[1], g = +m[2], b = +m[3];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx - mn < 40) {                                   
      if (mx < 70 || mn > 225) return null;                                        
      return mx < 150 ? 8 : 9;
    }
    let mejor = null, dm = Infinity;
    ACI.forEach(c => {
      const d = (c[1] - r) * (c[1] - r) + (c[2] - g) * (c[2] - g) + (c[3] - b) * (c[3] - b);
      if (d < dm) { dm = d; mejor = c[0]; }
    });
    return mejor;
  }



  function convertir(svgTexto, opts) {
    const soloLineas = !!(opts && opts.soloLineas);
    const doc = new DOMParser().parseFromString(svgTexto, 'image/svg+xml');
    const svg = document.importNode(doc.documentElement, true);
    const caja = document.createElement('div');


    caja.style.cssText = 'position:absolute;left:-100000px;top:0;opacity:0;pointer-events:none';
    caja.appendChild(svg);
    document.body.appendChild(caja);
    try {
      const raiz = svg.getScreenCTM().inverse();
      const tiposLinea = {};                                
      let ent = [];                                                                            
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const M = el => raiz.multiply(el.getScreenCTM());
      const P = (m, x, y) => {
        const X = m.a * x + m.c * y + m.e, Y = -(m.b * x + m.d * y + m.f);
        minX = Math.min(minX, X); maxX = Math.max(maxX, X); minY = Math.min(minY, Y); maxY = Math.max(maxY, Y);
        return [X, Y];
      };
      const escala = m => Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));





      const blanco = c => {
        const mb = String(c || '').match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
        return !!mb && +mb[1] >= 245 && +mb[2] >= 245 && +mb[3] >= 245;
      };
      const lleno = cs => cs.fill && cs.fill !== 'none' && !/rgba\(.*, 0\)$/.test(cs.fill) && !blanco(cs.fill);
      const trazado = cs => cs.stroke && cs.stroke !== 'none';
      const tipoLinea = (cs, m) => {
        const da = cs.strokeDasharray;
        if (!da || da === 'none') return null;
        const v = da.split(/[ ,]+/).map(parseFloat).filter(n => n > 0).map(n => n * escala(m));
        if (v.length < 2) return null;
        const clave = v.map(n => N(n)).join('_');
        if (!tiposLinea[clave]) tiposLinea[clave] = { nombre: 'TRAZOS_' + (Object.keys(tiposLinea).length + 1), v };
        return tiposLinea[clave].nombre;
      };
      const capaDe = (el, def) => {
        const c = el.closest && el.closest('[data-capa]');
        return c ? c.getAttribute('data-capa') : def;
      };
      const poli = (pts, cerrado, lt, capa, col) => {
        if (pts.length < 2) return;
        if (pts.length === 2 && !cerrado) { ent.push({ t: 'LINE', a: pts[0], b: pts[1], lt, capa, col }); return; }
        ent.push({ t: 'POLY', pts, cerrado, lt, capa, col });
      };
      const figura = (el, subs, m, cs) => {
        const lt = tipoLinea(cs, m), capa = capaDe(el, 'SIMBOLOS');
        const colT = colorAci(trazado(cs) ? cs.stroke : cs.fill), colR = colorAci(cs.fill);
        subs.forEach(sb => {
          const r = puntosSub(sb);
          let pts = r.pts.map(p => P(m, p[0], p[1]));
          const cerr = r.cerrado || (pts.length > 2 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 1e-6);
          if (cerr && pts.length > 1 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 1e-6) pts = pts.slice(0, -1);
          if (!soloLineas && lleno(cs) && cerr && !r.curva && (pts.length === 3 || pts.length === 4)) {
            ent.push({ t: 'SOLID', pts, capa, col: colR });
            if (!trazado(cs)) return;
          }
          if (trazado(cs) || lleno(cs)) poli(pts, cerr, lt, capa, colT);
        });
      };

      const procesar = (el, m, cs, dest) => {
        const prev = ent; ent = dest;
        try { dibujar(el, m, cs); } finally { ent = prev; }
      };
      const dibujar = (el, m, cs) => {
        const tag = el.tagName.toLowerCase(), A = n => parseFloat(el.getAttribute(n) || 0);
        if (tag === 'path') { figura(el, segmentos(el.getAttribute('d') || ''), m, cs); return; }
        if (tag === 'rect') {
          const x = A('x'), y = A('y'), w = A('width'), h = A('height');
          figura(el, [{ ini: [x, y], segs: [{ t: 'L', x: x + w, y }, { t: 'L', x: x + w, y: y + h }, { t: 'L', x, y: y + h }, { t: 'L', x, y }], cerrado: true }], m, cs);
          return;
        }
        if (tag === 'line') { figura(el, [{ ini: [A('x1'), A('y1')], segs: [{ t: 'L', x: A('x2'), y: A('y2') }], cerrado: false }], m, cs); return; }
        if (tag === 'polyline' || tag === 'polygon') {
          const v = (el.getAttribute('points') || '').trim().split(/[ ,]+/).map(parseFloat);
          const segs = [];
          for (let k = 2; k + 1 < v.length; k += 2) segs.push({ t: 'L', x: v[k], y: v[k + 1] });
          figura(el, [{ ini: [v[0], v[1]], segs, cerrado: tag === 'polygon' }], m, cs);
          return;
        }
        if (tag === 'circle' || tag === 'ellipse') {
          const cx = A('cx'), cy = A('cy');
          const rx = tag === 'circle' ? A('r') : A('rx'), ry = tag === 'circle' ? A('r') : A('ry');
          const c = P(m, cx, cy), k = escala(m), capa = capaDe(el, 'SIMBOLOS');
          if (tag === 'circle' || Math.abs(rx - ry) < 1e-9) {
            if (lleno(cs) && !soloLineas) ent.push({ t: 'PUNTO', c, r: rx * k, capa, col: colorAci(cs.fill) });
            else ent.push({ t: 'CIRCLE', c, r: rx * k, lt: tipoLinea(cs, m), capa,
                            col: colorAci(lleno(cs) && !trazado(cs) ? cs.fill : cs.stroke) });
            P(m, cx - rx, cy - ry); P(m, cx + rx, cy + ry);
            return;
          }
          const pts = [];
          for (let q = 0; q < 48; q++) { const t = q / 48 * 2 * Math.PI; pts.push(P(m, cx + rx * Math.cos(t), cy + ry * Math.sin(t))); }
          poli(pts, true, tipoLinea(cs, m), capa, colorAci(trazado(cs) ? cs.stroke : cs.fill));
          return;
        }
        if (tag === 'text') {
          const txt = el.textContent.replace(/\s+/g, ' ').trim();
          if (!txt) return;
          const p = P(m, A('x'), A('y'));
          const tam = parseFloat(cs.fontSize) || 9;
          const ang = Math.atan2(-m.b, m.a) * 180 / Math.PI;
          const anc = cs.textAnchor === 'middle' ? 1 : (cs.textAnchor === 'end' ? 2 : 0);
          ent.push({ t: 'TEXT', p, h: tam * escala(m) * 0.72, txt, ang, anc, capa: capaDe(el, 'TEXTOS'),
                     col: colorAci(cs.fill), oculto: el.hasAttribute('data-oculto') });
        }
      };










      const sueltos = [], instancias = [], porGrupo = new Map();
      const recortes = new Map();                                                                  
      const ventanasDe = rg => {
        if (recortes.has(rg)) return recortes.get(rg);
        const m = M(rg), v = [];
        (rg.getAttribute('data-recorte') || '').split(';').forEach(t => {
          const n = t.split(',').map(parseFloat);
          if (n.length !== 4 || n.some(isNaN)) return;
          const X = (x, y) => m.a * x + m.c * y + m.e, Y = (x, y) => -(m.b * x + m.d * y + m.f);
          const xs = [X(n[0], n[1]), X(n[0] + n[2], n[1] + n[3])], ys = [Y(n[0], n[1]), Y(n[0] + n[2], n[1] + n[3])];
          v.push([Math.min(xs[0], xs[1]), Math.min(ys[0], ys[1]), Math.max(xs[0], xs[1]), Math.max(ys[0], ys[1])]);
        });
        recortes.set(rg, v);
        return v;
      };
      svg.querySelectorAll('path, rect, line, polyline, polygon, circle, ellipse, text').forEach(el => {
        if (el.closest('defs, clipPath, style')) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;


        const rg = el.closest('[data-recorte]');
        if (rg) {
          const tmp = [];
          procesar(el, M(el), cs, tmp);
          const v = ventanasDe(rg);
          tmp.forEach(e => recortar(e, v).forEach(x => sueltos.push(x)));
          return;
        }
        const g = el.closest('[data-bloque]');
        if (!g) { procesar(el, M(el), cs, sueltos); return; }
        let I = porGrupo.get(g);
        if (!I) { I = { nombre: g.getAttribute('data-bloque'), B: M(g), ents: [], textos: [], capa: capaDe(g, 'SIMBOLOS') }; porGrupo.set(g, I); instancias.push(I); }
        const loc = [];
        procesar(el, I.B.inverse().multiply(M(el)), cs, loc);
        loc.forEach(e => {
          if (e.t !== 'TEXT') { I.ents.push(e); return; }
          const mundo = [];
          procesar(el, M(el), cs, mundo);
          const ids = Array.prototype.map.call(el.querySelectorAll('tspan[id]'), t => t.id);

          if (!ids.length) { I.ents.push(e); return; }
          const base = (ids.length ? ids.join('_') : 'TEXTO').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
          I.textos.push({ loc: e, mundo: mundo[0], base });
        });
      });





      const LARGO_R12 = 31;
      const legalR12 = s => String(s || 'BLOQUE').toUpperCase().replace(/[^A-Z0-9_$-]/g, '_') || 'BLOQUE';
      const cortoR12 = (base, suf) => base.slice(0, LARGO_R12 - suf.length) + suf;


      const R = v => Math.round(v * 1000) / 1000;
      const firmaDe = e => JSON.stringify(e, (k, v) => typeof v === 'number' ? R(v) : v);
      const bloques = [], defPorNombre = {};
      instancias.forEach(I => {
        const usados = {};
        I.textos.forEach(t => {
          const bt = legalR12(t.base);
          let tag = cortoR12(bt, ''), n = 1;
          while (usados[tag]) tag = cortoR12(bt, '_' + (++n));
          usados[tag] = 1; t.tag = tag;
        });
        const firma = I.ents.map(firmaDe).join('|') + '#' + I.textos.map(t => t.tag + firmaDe(Object.assign({}, t.loc, { txt: '' }))).join('|');
        const baseN = legalR12(I.nombre);
        let nombre = cortoR12(baseN, ''), k = 1;
        while (defPorNombre[nombre] && defPorNombre[nombre].firma !== firma) nombre = cortoR12(baseN, '_' + (++k));
        if (!defPorNombre[nombre]) {
          defPorNombre[nombre] = { nombre, firma, ents: I.ents, atts: I.textos.map(t => Object.assign({}, t.loc, { tag: t.tag })) };
          bloques.push(defPorNombre[nombre]);
        }
        const B = I.B;
        sueltos.push({ t: 'INSERT', nombre, p: [B.e, -B.f], esc: Math.hypot(B.a, B.b), ang: Math.atan2(-B.b, B.a) * 180 / Math.PI,
          capa: I.capa, attribs: I.textos.map(t => Object.assign({}, t.mundo, { tag: t.tag })) });
      });

      const vb = svg.viewBox.baseVal;
      return armar(sueltos, tiposLinea, [vb.x, -(vb.y + vb.height), vb.x + vb.width, -vb.y], bloques);
    } finally {
      caja.remove();
    }
  }






  function dentro(p, v) {
    return v.some(w => p[0] >= w[0] - 1e-6 && p[0] <= w[2] + 1e-6 && p[1] >= w[1] - 1e-6 && p[1] <= w[3] + 1e-6);
  }
  function tramosDentro(a, b, v) {
    const iv = [];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    v.forEach(w => {
      let t0 = 0, t1 = 1;
      const p = [-dx, dx, -dy, dy], q = [a[0] - w[0], w[2] - a[0], a[1] - w[1], w[3] - a[1]];
      for (let i = 0; i < 4; i++) {
        if (Math.abs(p[i]) < 1e-12) { if (q[i] < 0) return; continue; }
        const r = q[i] / p[i];
        if (p[i] < 0) { if (r > t1) return; if (r > t0) t0 = r; }
        else { if (r < t0) return; if (r < t1) t1 = r; }
      }
      if (t1 - t0 > 1e-9) iv.push([t0, t1]);
    });
    iv.sort((x, y) => x[0] - y[0]);
    const u = [];
    iv.forEach(x => { const l = u[u.length - 1]; if (l && x[0] <= l[1] + 1e-9) l[1] = Math.max(l[1], x[1]); else u.push(x.slice()); });
    return u;
  }
  function recortar(e, v) {
    if (!v.length) return [];
    if (e.t === 'TEXT') return dentro(e.p, v) ? [e] : [];
    if (e.t === 'PUNTO') return dentro(e.c, v) ? [e] : [];
    if (e.t === 'SOLID') return e.pts.every(p => dentro(p, v)) ? [e] : [];
    let pts, cerrado;
    if (e.t === 'CIRCLE') {
      const caja = [[e.c[0] - e.r, e.c[1] - e.r], [e.c[0] + e.r, e.c[1] + e.r]];
      if (v.some(w => caja[0][0] >= w[0] && caja[1][0] <= w[2] && caja[0][1] >= w[1] && caja[1][1] <= w[3])) return [e];
      pts = [];
      for (let k = 0; k < 48; k++) { const t = k / 48 * 2 * Math.PI; pts.push([e.c[0] + e.r * Math.cos(t), e.c[1] + e.r * Math.sin(t)]); }
      cerrado = true;
    } else if (e.t === 'LINE') { pts = [e.a, e.b]; cerrado = false; }
    else if (e.t === 'POLY') { pts = e.pts; cerrado = e.cerrado; }
    else return [e];
    const segs = [];
    for (let i = 0; i + 1 < pts.length; i++) segs.push([pts[i], pts[i + 1]]);
    if (cerrado && pts.length > 2) segs.push([pts[pts.length - 1], pts[0]]);
    const corridas = [];
    let cur = null;
    segs.forEach(s => {
      const [a, b] = s, P = t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      const iv = tramosDentro(a, b, v);
      if (!iv.length) { cur = null; return; }
      iv.forEach(x => {
        if (cur && x[0] < 1e-9) cur.push(P(x[1]));
        else { cur = [P(x[0]), P(x[1])]; corridas.push(cur); }
        if (x[1] < 1 - 1e-9) cur = null;
      });
    });

    if (cerrado && corridas.length === 1 && corridas[0].length === segs.length + 1) {
      return [Object.assign({}, e, e.t === 'CIRCLE' ? {} : { pts: corridas[0].slice(0, -1) })];
    }
    const base = { lt: e.lt, capa: e.capa, col: e.col };
    return corridas.map(c => c.length === 2
      ? Object.assign({ t: 'LINE', a: c[0], b: c[1] }, base)
      : Object.assign({ t: 'POLY', pts: c, cerrado: false }, base));
  }


  const txtDxf = s => s.replace(/[^\x20-\x7e]/g, c => '\\U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'));

  function armar(ent, tiposLinea, ext, bloques) {
    const o = [];
    const g = (c, v) => { o.push(String(c)); o.push(String(v)); };
    const lts = Object.keys(tiposLinea).map(k => tiposLinea[k]);
    g(0, 'SECTION'); g(2, 'HEADER');
    g(9, '$ACADVER'); g(1, 'AC1009');
    g(9, '$INSBASE'); g(10, 0); g(20, 0); g(30, 0);
    g(9, '$EXTMIN'); g(10, N(ext[0])); g(20, N(ext[1])); g(30, 0);
    g(9, '$EXTMAX'); g(10, N(ext[2])); g(20, N(ext[3])); g(30, 0);
    g(9, '$LTSCALE'); g(40, 1);
    g(0, 'ENDSEC');
    g(0, 'SECTION'); g(2, 'TABLES');
    g(0, 'TABLE'); g(2, 'LTYPE'); g(70, lts.length + 1);
    g(0, 'LTYPE'); g(2, 'CONTINUOUS'); g(70, 0); g(3, 'Solid line'); g(72, 65); g(73, 0); g(40, 0);
    lts.forEach(l => {
      const tot = l.v.reduce((a, b) => a + b, 0);
      g(0, 'LTYPE'); g(2, l.nombre); g(70, 0); g(3, 'Trazos ' + l.v.map(N).join(' ')); g(72, 65); g(73, l.v.length); g(40, N(tot));
      l.v.forEach((n, i) => g(49, N(i % 2 ? -n : n)));
    });
    g(0, 'ENDTAB');
    const capas = ['0', 'SIMBOLOS', 'TEXTOS'];
    const juntar = e => { if (e.capa && capas.indexOf(e.capa) === -1) capas.push(e.capa); };
    ent.forEach(juntar);
    (bloques || []).forEach(b => { b.ents.forEach(juntar); b.atts.forEach(juntar); });
    g(0, 'TABLE'); g(2, 'LAYER'); g(70, capas.length);
    capas.forEach(c => { g(0, 'LAYER'); g(2, c); g(70, 0); g(62, 7); g(6, 'CONTINUOUS'); });
    g(0, 'ENDTAB');
    g(0, 'TABLE'); g(2, 'STYLE'); g(70, 1);
    g(0, 'STYLE'); g(2, 'STANDARD'); g(70, 0); g(40, 0); g(41, 1); g(50, 0); g(71, 0); g(42, 2.5); g(3, 'arial.ttf'); g(4, '');
    g(0, 'ENDTAB');
    g(0, 'ENDSEC');

    const texto = (tipo, e) => {
      g(0, tipo); g(8, e.capa); if (e.col) g(62, e.col);
      g(10, N(e.p[0])); g(20, N(e.p[1])); g(30, 0); g(40, N(e.h)); g(1, txtDxf(e.txt));
      if (tipo === 'ATTDEF') { g(3, e.tag); g(2, e.tag); g(70, e.oculto ? 1 : 0); }
      if (tipo === 'ATTRIB') { g(2, e.tag); g(70, e.oculto ? 1 : 0); }
      if (Math.abs(e.ang) > 1e-6) g(50, N(e.ang));
      g(7, 'STANDARD');
      if (e.anc) { g(72, e.anc); g(11, N(e.p[0])); g(21, N(e.p[1])); g(31, 0); }
    };
    const escribir = e => {
      if (e.t === 'INSERT') {
        g(0, 'INSERT'); g(8, e.capa); if (e.attribs.length) g(66, 1); g(2, e.nombre);
        g(10, N(e.p[0])); g(20, N(e.p[1])); g(30, 0);
        if (Math.abs(e.esc - 1) > 1e-6) { g(41, N(e.esc)); g(42, N(e.esc)); g(43, N(e.esc)); }
        if (Math.abs(e.ang) > 1e-6) g(50, N(e.ang));
        if (e.attribs.length) { e.attribs.forEach(a => texto('ATTRIB', a)); g(0, 'SEQEND'); g(8, e.capa); }
        return;
      }
      if (e.t === 'TEXT') { texto('TEXT', e); return; }
      dibujo(e);
    };
    g(0, 'SECTION'); g(2, 'BLOCKS');
    (bloques || []).forEach(b => {
      g(0, 'BLOCK'); g(8, '0'); g(2, b.nombre); g(70, b.atts.length ? 2 : 0); g(10, 0); g(20, 0); g(30, 0); g(3, b.nombre);
      b.ents.forEach(escribir);
      b.atts.forEach(a => texto('ATTDEF', a));
      g(0, 'ENDBLK'); g(8, '0');
    });
    g(0, 'ENDSEC');
    g(0, 'SECTION'); g(2, 'ENTITIES');
    ent.forEach(escribir);
    g(0, 'ENDSEC');
    g(0, 'EOF');
    return o.join('\r\n') + '\r\n';

    function dibujo(e) {
      if (e.t === 'LINE') {
        g(0, 'LINE'); g(8, e.capa); if (e.lt) g(6, e.lt); if (e.col) g(62, e.col);
        g(10, N(e.a[0])); g(20, N(e.a[1])); g(30, 0); g(11, N(e.b[0])); g(21, N(e.b[1])); g(31, 0);
      } else if (e.t === 'POLY') {
        g(0, 'POLYLINE'); g(8, e.capa); if (e.lt) g(6, e.lt); if (e.col) g(62, e.col); g(66, 1); g(10, 0); g(20, 0); g(30, 0); g(70, e.cerrado ? 1 : 0);
        e.pts.forEach(p => { g(0, 'VERTEX'); g(8, e.capa); g(10, N(p[0])); g(20, N(p[1])); g(30, 0); });
        g(0, 'SEQEND'); g(8, e.capa);
      } else if (e.t === 'SOLID') {
        const p = e.pts, q = p.length === 4 ? [p[0], p[1], p[3], p[2]] : [p[0], p[1], p[2], p[2]];
        g(0, 'SOLID'); g(8, e.capa); if (e.col) g(62, e.col);
        q.forEach((v, i) => { g(10 + i, N(v[0])); g(20 + i, N(v[1])); g(30 + i, 0); });
      } else if (e.t === 'CIRCLE') {
        g(0, 'CIRCLE'); g(8, e.capa); if (e.lt) g(6, e.lt); if (e.col) g(62, e.col); g(10, N(e.c[0])); g(20, N(e.c[1])); g(30, 0); g(40, N(e.r));
      } else if (e.t === 'PUNTO') {

        const r = e.r;
        g(0, 'POLYLINE'); g(8, e.capa); if (e.col) g(62, e.col); g(66, 1); g(10, 0); g(20, 0); g(30, 0); g(70, 1); g(40, N(r)); g(41, N(r));
        [[e.c[0] - r / 2, e.c[1]], [e.c[0] + r / 2, e.c[1]]].forEach(p => {
          g(0, 'VERTEX'); g(8, e.capa); g(10, N(p[0])); g(20, N(p[1])); g(30, 0); g(42, 1);
        });
        g(0, 'SEQEND'); g(8, e.capa);
      }
    }
  }


  window.exportarDxf = function (boton) {
    const src = document.getElementById(boton.getAttribute('data-dxf'));
    if (!src) return;
    const dxf = convertir(src.textContent);
    const blob = new Blob([dxf], { type: 'application/dxf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = boton.getAttribute('data-nombre') || 'dibujo.dxf';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  window.convertirSvgADxf = convertir;
})();













function guardarPdfHtml(nombre, html, alTerminar) {
  var fin = function() { if (typeof alTerminar === 'function') alTerminar(); };
  var aviso = function(t) { if (typeof _avisoFlotante === 'function') _avisoFlotante(t); };
  var tauri = window.__TAURI_INTERNALS__;
  if (tauri && typeof tauri.invoke === 'function') {

    if (window._pdfGenerando) {
      aviso('Ya se está generando un PDF.');
      fin();
      return Promise.resolve(false);
    }
    window._pdfGenerando = true;
    var listo = function(r) { window._pdfGenerando = false; fin(); return r; };
    return tauri.invoke('guardar_pdf', { nombre: nombre, html: html }).then(function(ruta) {
      if (ruta) aviso('Guardado: ' + ruta);
      return listo(!!ruta);
    }, function(e) {
      console.warn('[guardarPdfHtml]', e);
      aviso('No se pudo generar el PDF.');
      return listo(false);
    });
  }
  var ifr = document.createElement('iframe');
  ifr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(ifr);
  var doc = ifr.contentDocument;
  if (!doc) { ifr.remove(); fin(); return Promise.resolve(false); }
  doc.open(); doc.write(html); doc.close();
  return new Promise(function(listo) {
    setTimeout(function() {
      try { ifr.contentWindow.focus(); ifr.contentWindow.print(); }
      catch (e) { console.warn('[guardarPdfHtml] print fallo:', e); }
      setTimeout(function() { ifr.remove(); fin(); listo(true); }, 4000);
    }, 600);
  });
}





var _EXPORTAR_DOCS = {
  plano:    { pdf: function() { abrirModalPDF(); },        dxf: function() { exportarTableroDxf(); } },
  unifilar: { pdf: function() { imprimirUnifilarHoja(); }, dxf: function() { exportarUnifilarDxf(); } },
  control:  { pdf: function() { imprimirControl(); },      dxf: function() { exportarControlDxf(); } },
  fab:      { pdf: function() { imprimirFabricacion(); } },

  ficha:    { pdf: function() { imprimirHoja('ficha'); },   xlsx: function() { exportarHojaExcel('ficha'); } },
  metrado:  { pdf: function() { imprimirHoja('metrado'); }, xlsx: function() { exportarHojaExcel('metrado'); } },
  senal:    { pdf: function() { imprimirHoja('senal'); },   xlsx: function() { exportarHojaExcel('senal'); } }
};
var _ICONO_ARCHIVO = function(color, txt) {
  return '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fff" stroke="' + color + '" stroke-width="1.5"/>' +
    '<path d="M14 2v5h5" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<rect x="1.5" y="12" width="15" height="7" rx="1.5" fill="' + color + '"/>' +
    '<text x="9" y="17.4" text-anchor="middle" font-size="5.4" font-weight="700" fill="#fff" ' +
    'font-family="Segoe UI, Arial, sans-serif">' + txt + '</text></svg>';
};
function _cerrarMenuExportar() {
  var m = document.getElementById('exp_menu');
  if (m) m.remove();
  document.removeEventListener('pointerdown', _expFuera, true);
  document.removeEventListener('keydown', _expEsc, true);
}
function _expFuera(e) {
  if (e.target.closest && (e.target.closest('#exp_menu') || e.target.closest('.exp-btn'))) return;
  _cerrarMenuExportar();
}
function _expEsc(e) {
  if (e.key !== 'Escape') return;

  e.stopPropagation();
  _cerrarMenuExportar();
}
function abrirMenuExportar(btn, doc) {
  var abierto = document.getElementById('exp_menu');
  if (abierto) { var mismo = abierto._btn === btn; _cerrarMenuExportar(); if (mismo) return; }
  var acc = _EXPORTAR_DOCS[doc];
  if (!acc) return;
  var menu = document.createElement('div');
  menu.id = 'exp_menu';
  menu.className = 'exp-menu';
  menu._btn = btn;
  [['pdf', 'PDF', '#d92d20'], ['dxf', 'DXF', '#1570ef'], ['xlsx', 'Excel', '#079455', 'XLS']].forEach(function(o) {
    if (!acc[o[0]]) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'exp-opcion';
    b.innerHTML = _ICONO_ARCHIVO(o[2], o[3] || o[1]) + '<span>' + o[1] + '</span>';
    b.addEventListener('click', function() { _cerrarMenuExportar(); acc[o[0]](); });
    menu.appendChild(b);
  });
  document.body.appendChild(menu);
  var r = btn.getBoundingClientRect();
  menu.style.top = (r.bottom + 6) + 'px';
  menu.style.left = Math.max(8, r.right - menu.offsetWidth) + 'px';
  document.addEventListener('pointerdown', _expFuera, true);
  document.addEventListener('keydown', _expEsc, true);
}


function nombreArchivoDoc(sufijo, ext) {
  var nombre = 'tablero';
  try {
    var pm = PM.meta();
    (pm.projects || []).forEach(function(p) { if (p.id === pm.activeId) nombre = p.name || nombre; });
  } catch (e) {}
  return String(nombre).replace(/[^\w.-]+/g, '_') + '_' + sufijo + '.' + (ext || 'pdf');
}


function guardarArchivoBinario(nombre, bytes, extension, descripcion, mime) {
  var tauri = window.__TAURI_INTERNALS__;
  if (tauri && typeof tauri.invoke === 'function') {
    return tauri.invoke('guardar_archivo_binario', {
      nombre: nombre, datos: Array.from(bytes),
      extension: extension || '', descripcion: descripcion || ''
    }).then(function(ruta) {
      if (ruta && typeof _avisoFlotante === 'function') _avisoFlotante('Guardado: ' + ruta);
      return !!ruta;
    });
  }
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([bytes], { type: mime || 'application/octet-stream' }));
  a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 2000);
  return Promise.resolve(true);
}

function guardarArchivoTexto(nombre, texto, extension, descripcion) {
  var tauri = window.__TAURI_INTERNALS__;
  if (tauri && typeof tauri.invoke === 'function') {
    return tauri.invoke('guardar_archivo', {
      nombre: nombre, contenido: texto,
      extension: extension || '', descripcion: descripcion || ''
    }).then(function(ruta) {
      if (ruta && typeof _avisoFlotante === 'function') _avisoFlotante('Guardado: ' + ruta);
      return !!ruta;
    });
  }
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([texto], { type: 'application/octet-stream' }));
  a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 2000);
  return Promise.resolve(true);
}
