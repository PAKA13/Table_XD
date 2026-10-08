










(function (raiz) {
'use strict';



function llana(geo) {
  if (geo.index) geo = geo.toNonIndexed();
  geo.deleteAttribute('uv');
  return geo;
}




function quitarCaras(THREE, geo, fuera) {
  const p = geo.attributes.position.array;
  const n = geo.attributes.normal ? geo.attributes.normal.array : null;
  const P = [], N = [];
  for (let t = 0; t < p.length; t += 9) {
    const a = [p[t], p[t + 1], p[t + 2]];
    const b = [p[t + 3], p[t + 4], p[t + 5]];
    const c = [p[t + 6], p[t + 7], p[t + 8]];
    if (fuera(a, b, c)) continue;
    for (let k = 0; k < 9; k++) P.push(p[t + k]);
    if (n) for (let k = 0; k < 9; k++) N.push(n[t + k]);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  if (n) geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  geo.clearGroups();
  return geo;
}












function fundir(THREE, trozos, tol) {
  const q = 1 / (tol || 1e-4), mapa = new Map();
  const pos = [], nor = [], idx = [];
  for (const g of trozos) {
    const p = g.attributes.position.array, n = g.attributes.normal.array;
    for (let t = 0; t < p.length; t += 9) {
      const ux = p[t + 3] - p[t], uy = p[t + 4] - p[t + 1], uz = p[t + 5] - p[t + 2];
      const wx = p[t + 6] - p[t], wy = p[t + 7] - p[t + 1], wz = p[t + 8] - p[t + 2];
      const area2 = Math.hypot(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx);
      if (area2 < 1e-7) continue;
      for (let i = t; i < t + 9; i += 3) {
        const k = Math.round(p[i] * q) + ',' + Math.round(p[i + 1] * q) + ',' +
                  Math.round(p[i + 2] * q) + '|' + Math.round(n[i] * q) + ',' +
                  Math.round(n[i + 1] * q) + ',' + Math.round(n[i + 2] * q);
        let j = mapa.get(k);
        if (j === undefined) {
          j = pos.length / 3;
          mapa.set(k, j);
          pos.push(p[i], p[i + 1], p[i + 2]);
          nor.push(n[i], n[i + 1], n[i + 2]);
        }
        idx.push(j);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(idx);
  return {geo: geo, pos: pos, nor: nor, idx: idx};
}


function volumen(pos, idx) {
  let v = 0;
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    v += (pos[a] * (pos[b + 1] * pos[c + 2] - pos[b + 2] * pos[c + 1])
        - pos[a + 1] * (pos[b] * pos[c + 2] - pos[b + 2] * pos[c])
        + pos[a + 2] * (pos[b] * pos[c + 1] - pos[b + 1] * pos[c])) / 6;
  }
  return v;
}
















function tramoPlano(THREE, forma, t, seg, d, origen, juntas) {
  const geo = llana(new THREE.ExtrudeGeometry(forma,
    {depth: t, bevelEnabled: false, curveSegments: seg}));
  quitarCaras(THREE, geo, (a, b, c) => {
    if (Math.abs(a[2] - b[2]) < 1e-6 && Math.abs(b[2] - c[2]) < 1e-6) return false;        
    return juntas.some(u => Math.abs(a[0] - u) < 1e-4 && Math.abs(b[0] - u) < 1e-4 &&
                            Math.abs(c[0] - u) < 1e-4);
  });
  geo.translate(0, 0, -t / 2);
  const M = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(d[0], d[1], 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(d[1], -d[0], 0));
  M.setPosition(origen[0], origen[1], 0);
  geo.applyMatrix4(M);
  return geo;
}







function pliegue(THREE, c, rIn, rOut, f0, f1, W, seg) {
  const K = Math.max(4, Math.ceil(Math.abs(f1 - f0) / (Math.PI / seg)));
  const P = [], N = [];
  const pto = (f, r, z) => [c[0] + r * Math.cos(f), c[1] + r * Math.sin(f), z];
  const tri = (a, b, d, na, nb, nd, ref) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const wx = d[0] - a[0], wy = d[1] - a[1], wz = d[2] - a[2];
    const gx = uy * wz - uz * wy, gy = uz * wx - ux * wz, gz = ux * wy - uy * wx;
    if (gx * ref[0] + gy * ref[1] + gz * ref[2] < 0) {
      const s = b; b = d; d = s; const sn = nb; nb = nd; nd = sn;
    }
    P.push(...a, ...b, ...d); N.push(...na, ...nb, ...nd);
  };
  const quad = (a, b, d, e, na, nb, nd, ne, ref) => {
    tri(a, b, d, na, nb, nd, ref); tri(a, d, e, na, nd, ne, ref);
  };
  for (let k = 0; k < K; k++) {
    const fa = f0 + (f1 - f0) * k / K, fb = f0 + (f1 - f0) * (k + 1) / K;
    const ea = [Math.cos(fa), Math.sin(fa), 0], eb = [Math.cos(fb), Math.sin(fb), 0];
    const ia = [-ea[0], -ea[1], 0], ib = [-eb[0], -eb[1], 0];
    const em = [Math.cos((fa + fb) / 2), Math.sin((fa + fb) / 2), 0];
    quad(pto(fa, rOut, 0), pto(fb, rOut, 0), pto(fb, rOut, W), pto(fa, rOut, W),
         ea, eb, eb, ea, em);
    quad(pto(fa, rIn, 0), pto(fb, rIn, 0), pto(fb, rIn, W), pto(fa, rIn, W),
         ia, ib, ib, ia, [-em[0], -em[1], 0]);
    const z0 = [0, 0, -1], z1 = [0, 0, 1];
    quad(pto(fa, rIn, 0), pto(fb, rIn, 0), pto(fb, rOut, 0), pto(fa, rOut, 0),
         z0, z0, z0, z0, z0);
    quad(pto(fa, rIn, W), pto(fb, rIn, W), pto(fb, rOut, W), pto(fa, rOut, W),
         z1, z1, z1, z1, z1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  return geo;
}










function trazarCabeza(s, W, uS, uT, cuello, rP, curva, sg) {
  const rE = Math.max(0, (W - cuello) / 2);
  rP = Math.max(0, Math.min(rP, cuello / 2));
  const eps = 1e-6, cw = sg > 0;

  const arco = (cx, cy, r, a0, a1, horario) =>
    s.absarc(sg > 0 ? cx : -cx, cy, r, sg > 0 ? a0 : Math.PI - a0,
             sg > 0 ? a1 : Math.PI - a1, sg > 0 ? horario : !horario);
  const u = x => sg * x;
  if (rE > eps) {
    if (curva) arco(uS + rE, 0, rE, Math.PI, Math.PI / 2, true);
    else { s.lineTo(u(uS), rE); s.lineTo(u(uS + rE), rE); }
  }
  if (rP > eps) {
    s.lineTo(u(uT - rP), rE);
    arco(uT - rP, rE + rP, rP, -Math.PI / 2, 0, false);
    if (W - 2 * (rE + rP) > eps) s.lineTo(u(uT), W - rE - rP);
    arco(uT - rP, W - rE - rP, rP, 0, Math.PI / 2, false);
  } else {
    s.lineTo(u(uT), rE);
    s.lineTo(u(uT), W - rE);
  }
  if (rE > eps) {
    s.lineTo(u(uS + rE), W - rE);
    if (curva) arco(uS + rE, W, rE, -Math.PI / 2, -Math.PI, true);
    else { s.lineTo(u(uS), W - rE); s.lineTo(u(uS), W); }
  }
  s.lineTo(u(uS), W);
  return s;
}








function trazarPunta(s, W, x0, sal, sg) {
  if (sal < 1e-6) { s.lineTo(x0, sg > 0 ? W : 0); return s; }
  const r = (W * W / 4 + sal * sal) / (2 * sal);

  const cx = x0 - sg * (r - sal), th = Math.atan2(W / 2, r - sal);
  if (sg > 0) s.absarc(cx, W / 2, r, -th, th, false);                           
  else s.absarc(cx, W / 2, r, Math.PI - th, Math.PI + th, false);             
  return s;
}


function areaPunta(W, sal) {
  if (sal < 1e-6) return 0;
  const r = (W * W / 4 + sal * sal) / (2 * sal);
  return r * r * Math.acos((r - sal) / r) - (r - sal) * (W / 2);
}

const util = {llana: llana, quitarCaras: quitarCaras, fundir: fundir, volumen: volumen,
              tramoPlano: tramoPlano, pliegue: pliegue, trazarCabeza: trazarCabeza,
              trazarPunta: trazarPunta, areaPunta: areaPunta};
if (typeof module !== 'undefined' && module.exports) module.exports = util;
else raiz.mallaUtil = util;

})(typeof globalThis !== 'undefined' ? globalThis : this);
