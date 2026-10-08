






















(function (raiz) {
  'use strict';

const MM = 96 / 25.4;
const BAND = 18, CELDA = 113, TB = 64;



function medidas(vertical) {
  const a = 420 * MM - 2 * 20 - 2 * 4, b = 297 * MM - 2 * 20 - 2 * 4;
  const W = vertical ? b : a, H = vertical ? a : b;
  const GW = W - 2 * BAND, GH = H - 2 * BAND;
  const COLS = Math.max(1, Math.round(GW / CELDA));
  const ROWS = Math.max(1, Math.round(GH / CELDA));
  return {W, H, COLS, ROWS, CW: GW / COLS, CH: (H - BAND - TB) / ROWS};
}
const H0 = medidas(false);

const TBCOLS = [9, 27, 17, 9, 24, 7, 7];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const n = v => (+v).toFixed(2);


function componer(C, m, F) {
  m = Object.assign({}, m);
  const {W, H, COLS, ROWS, CW, CH} = medidas(!!C.vertical);




  const X0 = C.sinCajetin ? BAND : 0, Y0 = X0;
  const HH = C.sinCajetin ? H - TB : H;
  const P = [];
  P.push('<rect x="' + X0 + '" y="' + Y0 + '" width="' + n(W - X0) +
         '" height="' + n(HH - Y0) + '" fill="#fff"/>');


  if (!C.sinCajetin) {
  for (let i = 1; i < COLS; i++) {
    const x = BAND + i * CW;
    P.push('<line x1="' + n(x) + '" y1="0" x2="' + n(x) + '" y2="' + BAND + '" stroke="#000"/>');
  }
  for (let i = 1; i < ROWS; i++) {
    const y = BAND + i * CH;
    P.push('<line x1="0" y1="' + n(y) + '" x2="' + BAND + '" y2="' + n(y) + '" stroke="#000"/>');
  }
  const TXT = ' text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600">';
  for (let i = 0; i < COLS; i++)
    P.push('<text x="' + n(BAND + (i + 0.5) * CW) + '" y="' + (BAND / 2) + '"' + TXT +
           String.fromCharCode(65 + i) + '</text>');
  for (let i = 0; i < ROWS; i++)
    P.push('<text x="' + (BAND / 2) + '" y="' + n(BAND + (i + 0.5) * CH) + '"' + TXT + (i + 1) + '</text>');


  P.push('<path d="M' + BAND + ' ' + n(H - TB) + ' V' + BAND + ' H' + n(W) +
         '" fill="none" stroke="#000" stroke-width="1.5"/>');
  }





  const IW = W - BAND, IH = H - BAND - TB, PAD = 8 * MM, LABEL = C.sinRotulo ? 0 : 12 * MM;
  const availW = IW - 2 * PAD, availH = IH - 2 * PAD - LABEL;
  let k, fw, fh, fx, fy, resumen;
  const encaja = (w, h) => {
    k = Math.min(availW / w, availH / h);
    fw = w * k; fh = h * k;
    fx = BAND + (IW - fw) / 2; fy = BAND + PAD + LABEL + (availH - fh) / 2;
  };
  const dentro = [];

  if (F.png) {


    const dim = {w: F.png.w, h: F.png.h}, cap = {etiquetas: F.png.etiquetas || []};
    const R = C.recorte || {x: 0, y: 0, w: dim.w, h: dim.h};
    encaja(R.w, R.h);

    dentro.push('<svg x="' + n(fx) + '" y="' + n(fy) + '" width="' + n(fw) + '" height="' + n(fh) +
           '" viewBox="' + R.x + ' ' + R.y + ' ' + R.w + ' ' + R.h + '">' +
           '<image x="0" y="0" width="' + dim.w + '" height="' + dim.h +
           '" href="' + F.png.href + '"/></svg>');
    dentro.push('<rect x="' + n(fx) + '" y="' + n(fy) + '" width="' + n(fw) + '" height="' + n(fh) +
           '" fill="none" stroke="#000"/>');


    for (const e of (C.cotas === false ? [] : cap.etiquetas || [])) {
      const x = fx + (e.x * dim.w / 100 - R.x) * k, y = fy + (e.y * dim.h / 100 - R.y) * k;
      const tag = e.tag ? e.tag + ' ' : '';
      const ancho = (tag.length * 4.6 + String(e.valor).length * 5.2) + 8;
      dentro.push('<g transform="translate(' + n(x) + ' ' + n(y) + ')">' +
             '<rect x="' + n(-ancho / 2) + '" y="-6.5" width="' + n(ancho) + '" height="13" rx="3" fill="#fff" stroke="' +
             (e.clave ? '#b45309' : '#000') + '"/>' +
             '<text y="3" text-anchor="middle" font-size="8.5" font-weight="600" fill="' +
             (e.clave ? '#7c2d12' : '#000') + '">' +
             (e.tag ? '<tspan font-weight="400" fill="#444">' + esc(e.tag) + ' </tspan>' : '') +
             esc(e.valor) + '</text></g>');
    }
    resumen = 'vista a ' + k.toFixed(3) + ', ' +
              (C.cotas === false ? 'sin cotas' : (cap.etiquetas || []).length + ' cotas');
  } else {





    const raw = F.svg;
    const vb = (raw.match(/viewBox="([^"]+)"/) || [])[1];
    if (!vb) throw new Error('la lamina de «' + C.l1 + '» no trae viewBox');
    const q = vb.split(/\s+/).map(Number);
    const cuerpo = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    encaja(q[2], q[3]);
    dentro.push('<svg x="' + n(fx) + '" y="' + n(fy) + '" width="' + n(fw) + '" height="' + n(fh) +
           '" viewBox="' + vb + '">' + cuerpo + '</svg>');




    if (C.pxPorMm) {
      const e = C.pxPorMm * k / MM;
      m.escala = (e >= 1 ? e.toFixed(1) + ' : 1' : '1 : ' + (1 / e).toFixed(1)) + ' en A3';
    }
    resumen = 'lamina a ' + k.toFixed(3) + ', escala ' + m.escala;
  }

  const cx = fx + fw / 2;
  if (!C.sinRotulo) {
  P.push('<text x="' + n(cx) + '" y="' + n(fy - LABEL + 14) +
         '" text-anchor="middle" font-size="12" font-weight="700">' + esc(C.l1) + '</text>');
  P.push('<text x="' + n(cx) + '" y="' + n(fy - LABEL + 28) +
         '" text-anchor="middle" font-size="10" font-weight="500" fill="#444">' + esc(C.l2) + '</text>');
  }
  dentro.forEach(d => P.push(d));






  if (!C.sinCajetin) {
  const y0 = H - TB, ym = y0 + TB / 2;
  P.push('<line x1="0" y1="' + n(y0) + '" x2="' + n(W) + '" y2="' + n(y0) + '" stroke="#000" stroke-width="1.5"/>');
  const xs = [0];
  TBCOLS.forEach(p => xs.push(xs[xs.length - 1] + W * p / 100));
  xs[xs.length - 1] = W;
  for (let i = 1; i < xs.length - 1; i++)
    P.push('<line x1="' + n(xs[i]) + '" y1="' + n(y0) + '" x2="' + n(xs[i]) + '" y2="' + n(H) +
           '" stroke="#000" stroke-width="1.5"/>');
  const cel = (xa, xb, ya, lbl, val) =>
    '<text x="' + n(xa + 5) + '" y="' + n(ya + 11) + '" font-size="9">' + esc(lbl) + '</text>' +
    '<text x="' + n(xa + 5) + '" y="' + n(ya + 25) + '" font-size="11" font-weight="600">' + esc(val) + '</text>';
  const media = (xa, xb) => '<line x1="' + n(xa) + '" y1="' + n(ym) + '" x2="' + n(xb) + '" y2="' + n(ym) +
                            '" stroke="#000" stroke-width="1.5"/>';
  P.push('<image x="' + n(xs[0] + 8) + '" y="' + n(y0 + 12) + '" width="' + n(xs[1] - xs[0] - 16) +
         '" height="' + (TB - 24) + '" preserveAspectRatio="xMidYMid meet" href="' + F.logo + '"/>');
  P.push(media(xs[1], xs[2]) + cel(xs[1], xs[2], y0, 'Descripción del proyecto:', m.proyecto) +
         cel(xs[1], xs[2], ym, 'Cliente:', m.cliente));
  P.push(cel(xs[2], xs[3], y0, 'Descripción de la página:', m.pagina));
  P.push(media(xs[3], xs[4]) + cel(xs[3], xs[4], y0, 'Proyectista:', m.proyectista) +
         cel(xs[3], xs[4], ym, 'Fecha:', m.fecha));
  const xm5 = (xs[4] + xs[5]) / 2;
  P.push(media(xs[4], xs[5]) + cel(xs[4], xs[5], y0, 'N° de plano:', m.plano) +
         '<line x1="' + n(xm5) + '" y1="' + n(ym) + '" x2="' + n(xm5) + '" y2="' + n(H) +
         '" stroke="#000" stroke-width="1.5"/>' +
         cel(xs[4], xm5, ym, 'N° cotización:', m.cotizacion) + cel(xm5, xs[5], ym, 'N° orden:', m.orden));
  P.push(media(xs[5], xs[6]) + cel(xs[5], xs[6], y0, 'Rev.:', m.rev) + cel(xs[5], xs[6], ym, 'Escala:', m.escala));
  P.push(media(xs[6], xs[7]) + cel(xs[6], xs[7], y0, 'Hoja:', m.hoja) + cel(xs[6], xs[7], ym, 'Total de hojas:', m.total));

  }


  P.push('<rect x="' + n(X0 + 0.75) + '" y="' + n(Y0 + 0.75) + '" width="' + n(W - X0 - 1.5) +
         '" height="' + n(HH - Y0 - 1.5) + '" fill="none" stroke="#000" stroke-width="1.5"/>');

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + Math.round(W - X0) +
    '" height="' + Math.round(HH - Y0) +
    '"\n     viewBox="' + n(X0) + ' ' + n(Y0) + ' ' + n(W - X0) + ' ' + n(HH - Y0) + '" role="img"\n' +
    '     font-family="Segoe UI,system-ui,Arial,sans-serif" fill="#000"\n' +


    '     aria-label="' + esc(C.alt).replace(/"/g, '&quot;') + '">\n  ' +
    P.join('\n  ') + '\n</svg>\n';
  return {svg: svg, resumen: resumen, ancho: Math.round(W - X0), alto: Math.round(HH - Y0)};
}


  const api = {componer: componer, ANCHO: H0.W, ALTO: H0.H, medidas: medidas};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.hojaProtab = api;

})(typeof globalThis !== 'undefined' ? globalThis : this);
