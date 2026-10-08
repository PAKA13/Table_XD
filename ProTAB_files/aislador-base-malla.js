

























(function (raiz) {
'use strict';

const util = (typeof module !== 'undefined' && module.exports)
  ? require('./malla-util.js') : raiz.mallaUtil;


function formaRedondeada(THREE, x0, y0, w, h, r) {
  const s = new THREE.Shape();
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x0 + r, y0);
  s.lineTo(x0 + w - r, y0);
  s.absarc(x0 + w - r, y0 + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x0 + w, y0 + h - r);
  s.absarc(x0 + w - r, y0 + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x0 + r, y0 + h);
  s.absarc(x0 + r, y0 + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + r);
  s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function agujeroEn(THREE, sh, cx, cy, r) {
  const h = new THREE.Path();
  h.absarc(cx, cy, r, 0, Math.PI * 2, true);
  sh.holes.push(h);
}












function recortarTapas(THREE, geo, zs) {
  const p = geo.attributes.position.array;
  const n = geo.attributes.normal ? geo.attributes.normal.array : null;
  const P = [], N = [];
  for (let t = 0; t < p.length; t += 9) {
    const zc = (p[t + 2] + p[t + 5] + p[t + 8]) / 3;
    const esTapa = Math.abs(p[t + 2] - zc) < 1e-4 && Math.abs(p[t + 5] - zc) < 1e-4;
    if (esTapa && zs.some(z => Math.abs(zc - z) < 1e-4)) continue;
    for (let k = 0; k < 9; k++) P.push(p[t + k]);
    if (n) for (let k = 0; k < 9; k++) N.push(n[t + k]);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  if (n) geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  geo.clearGroups();
  return geo;
}

const llana = util.llana;

























function construirAisladorBase(THREE, p) {
  const fondo = p.fondo, seg = p.segmentos || 24, eps = 1e-6;
  const nervios = p.nervios || [];
  const formaNervio = n =>
    formaRedondeada(THREE, n.x - n.a / 2, n.y - n.b / 2, n.a, n.b, n.radio || 0);
  const ags = p.agujeros.map(a => {
    const rB = (a.base && a.base.diam / 2 > a.r + 0.05) ? a.base.diam / 2 : 0;
    const rC = (a.cima && a.cima.diam / 2 > a.r + 0.05) ? a.cima.diam / 2 : 0;
    return {
      x: a.x, y: a.y, r: a.r, rB: rB, rC: rC,
      zB: rB ? Math.min(a.base.hondo, fondo) : 0,                                           
      zC: rC ? Math.max(0, fondo - a.cima.hondo) : fondo,                                   
    };
  });

  const radioEn = (a, z) => (z < a.zB - eps) ? a.rB : (z > a.zC - eps) ? a.rC : a.r;

  const forma = z => {
    const sh = formaRedondeada(THREE, p.x0, p.y0, p.largo, p.ancho, p.radio);
    for (const a of ags) agujeroEn(THREE, sh, a.x, a.y, radioEn(a, z));
    return sh;
  };

  const cortes = [...new Set([0, fondo].concat(ags.map(a => a.zB), ags.map(a => a.zC)))]
    .filter(z => z >= -eps && z <= fondo + eps)
    .sort((a, b) => a - b);

  const trozos = [];
  for (let t = 0; t + 1 < cortes.length; t++) {
    const z0 = cortes[t], z1 = cortes[t + 1];
    if (z1 - z0 < 0.05) continue;
    const geo = new THREE.ExtrudeGeometry(forma(z0),
      {depth: z1 - z0, bevelEnabled: false, curveSegments: seg});
    const juntas = [];
    if (t > 0) juntas.push(0);
    if (t + 2 < cortes.length) juntas.push(z1 - z0);



    if (nervios.length && t + 2 === cortes.length) juntas.push(z1 - z0);
    const plana = llana(geo);
    if (juntas.length) recortarTapas(THREE, plana, juntas);
    plana.translate(0, 0, z0);
    trozos.push(plana);
  }



  for (let t = 1; t + 1 < cortes.length; t++) {
    const zJ = cortes[t];
    for (const a of ags) {
      const rA = radioEn(a, cortes[t - 1]), rB = radioEn(a, zJ);
      if (Math.abs(rA - rB) < 0.05) continue;




      const anillo = new THREE.RingGeometry(Math.min(rA, rB), Math.max(rA, rB), 2 * seg);
      if (rA > rB) anillo.rotateX(Math.PI);                                          
      anillo.translate(a.x, a.y, zJ);
      trozos.push(llana(anillo));
    }
  }






  if (nervios.length) {
    const tapa = forma(cortes[cortes.length - 2]);
    for (const n of nervios) tapa.holes.push(formaNervio(n));
    const cara = llana(new THREE.ShapeGeometry(tapa, seg));
    cara.translate(0, 0, fondo);
    trozos.push(cara);
    for (const n of nervios) {
      const geo = new THREE.ExtrudeGeometry(formaNervio(n),
        {depth: n.alto, bevelEnabled: false, curveSegments: seg});
      const plana = recortarTapas(THREE, llana(geo), [0]);
      plana.translate(0, 0, fondo);
      trozos.push(plana);
    }
  }
  const f = util.fundir(THREE, trozos, 1e-4);
  f.cortes = cortes;
  return f;
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = {construirAisladorBase: construirAisladorBase};
else raiz.construirAisladorBase = construirAisladorBase;

})(typeof globalThis !== 'undefined' ? globalThis : this);
