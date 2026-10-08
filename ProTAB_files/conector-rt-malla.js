





































(function (raiz) {
'use strict';

const util = (typeof module !== 'undefined' && module.exports)
  ? require('./malla-util.js') : raiz.mallaUtil;

function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }






function formaTramo(THREE, L, W, o) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(L, 0);
  util.trazarPunta(s, W, L, o.puntaFin || 0, 1);
  s.lineTo(0, W);
  util.trazarPunta(s, W, 0, o.puntaIni || 0, -1);
  s.closePath();
  if (o.ranura) {
    const r = o.ranura.ancho / 2, a = o.ranura.largo / 2 - r, cu = o.ranura.u;
    const h = new THREE.Path();
    h.moveTo(cu - a, W / 2 - r);
    h.lineTo(cu + a, W / 2 - r);
    h.absarc(cu + a, W / 2, r, -Math.PI / 2, Math.PI / 2, false);
    h.lineTo(cu - a, W / 2 + r);
    h.absarc(cu - a, W / 2, r, Math.PI / 2, Math.PI * 1.5, false);
    h.closePath();
    s.holes.push(h);
  }
  if (o.agujero) {
    const h = new THREE.Path();
    h.absarc(o.agujero.u, W / 2, o.agujero.diam / 2, 0, Math.PI * 2, true);
    s.holes.push(h);
  }
  return s;
}























function construirSoporteRT(THREE, o) {
  o = o || {};
  const W = num(o.ancho, 10), t = num(o.espesor, 2), Ri = num(o.radio, 2);
  const Rm = Ri + t / 2, Ro = Ri + t;
  const sal = Math.max(0, num(o.saliente, 2));
  const pie = num(o.pie, 16.66);
  const ran = Object.assign({desde: 6.5, largo: 7, ancho: 5}, o.ranura || {});
  const esc = (o.escalon === null || o.escalon === false) ? null
            : Object.assign({alto: 11.3, angulo: 42, tramo: 15.49}, o.escalon || {});
  const alto = num(o.alto, 44.5);
  const brida = Object.assign({largo: 7.5, agujero: 5, desde: 3.5}, o.brida || {});
  const seg = Math.max(8, Math.round(num(o.segmentos, 24)));
  if (ran.desde - ran.largo / 2 < 0.5 || ran.desde + ran.largo / 2 > pie - 0.5)
    throw new Error('la ranura de ' + ran.largo + ' no cabe en un pie de ' + pie.toFixed(1));
  if (brida.desde - brida.agujero / 2 < 0.5 || brida.desde + brida.agujero / 2 > brida.largo - 0.5)
    throw new Error('el agujero Ø' + brida.agujero + ' no cabe en una brida de ' + brida.largo.toFixed(1));


  const trozos = [];
  let p = [sal, -t / 2], a = 0;                                                   
  let desarrollo = 0;




  const plano = [];




  const recto = (L, forma, juntas) => {
    const d = [Math.cos(a), Math.sin(a)];
    const f = forma || formaTramo(THREE, L, W, {});
    trozos.push(util.tramoPlano(THREE, f, t, seg, d, p, juntas || [0, L]));
    p = [p[0] + L * d[0], p[1] + L * d[1]];
    plano.push({tipo: 'recto', desde: desarrollo, hasta: desarrollo + L, largo: L});
    desarrollo += L;
  };
  const giro = grados => {
    const g = grados * Math.PI / 180, izq = g > 0;
    const n = izq ? [-Math.sin(a), Math.cos(a)] : [Math.sin(a), -Math.cos(a)];
    const c = [p[0] + Rm * n[0], p[1] + Rm * n[1]];
    const f0 = izq ? a - Math.PI / 2 : a + Math.PI / 2, f1 = f0 + g;
    trozos.push(util.pliegue(THREE, c, Ri, Ro, f0, f1, W, seg));
    p = [c[0] + Rm * Math.cos(f1), c[1] + Rm * Math.sin(f1)];
    a += g;
    const arc = Rm * Math.abs(g);
    plano.push({tipo: 'giro', desde: desarrollo, hasta: desarrollo + arc,
                largo: arc, grados: grados});
    desarrollo += arc;
  };


  recto(pie, formaTramo(THREE, pie, W, {puntaIni: sal, ranura: {u: ran.desde, largo: ran.largo, ancho: ran.ancho}}), [pie]);
  const yBrida = alto - 2 * t - t / 2;                                  
  if (esc) {
    const th = esc.angulo * Math.PI / 180;
    const L = (esc.alto - 2 * Rm * (1 - Math.cos(th))) / Math.sin(th);
    if (L < 0.5) throw new Error('con ' + esc.angulo + '° los dos pliegues ya suben mas que el escalon de ' + esc.alto);
    giro(esc.angulo); recto(L); giro(-esc.angulo);
    recto(esc.tramo);
    giro(90);
  } else {
    giro(90);
  }

  const alma = (yBrida - Rm) - p[1];
  if (alma < 1)
    throw new Error('con ' + alto.toFixed(1) + ' de alto no queda alma: pide al menos ' +
                    (alto - alma + 1).toFixed(1));
  recto(alma);
  giro(-90);
  const xBrida = p[0];
  recto(brida.largo, formaTramo(THREE, brida.largo, W, {puntaFin: sal, agujero: {u: brida.desde, diam: brida.agujero}}), [0]);

  const f = util.fundir(THREE, trozos, 1e-4);
  const vol = util.volumen(f.pos, f.idx);
  const areaRanura = (ran.largo - ran.ancho) * ran.ancho + Math.PI * ran.ancho * ran.ancho / 4;
  const teorico = (desarrollo * W + 2 * util.areaPunta(W, sal) - areaRanura
                   - Math.PI * brida.agujero * brida.agujero / 4) * t;
  if (Math.abs(vol - teorico) > 0.012 * teorico)
    throw new Error('la malla del soporte no cierra: volumen ' + vol.toFixed(1) +
                    ' contra ' + teorico.toFixed(1));

  return {
    pos: f.pos, nor: f.nor, idx: f.idx, geo: f.geo,
    volumen: vol, teorico: teorico, desarrollo: desarrollo, plano: plano,
    ancho: W, espesor: t, radio: Ri, alto: alto, alma: alma, saliente: sal,
    largo: xBrida + brida.largo + sal,

    pie: {cx: sal + ran.desde, cz: W / 2, y: -t, yTop: 0, paso: ran.ancho,
          largo: ran.largo},

    agujero: {cx: xBrida + brida.desde, cz: W / 2, ymin: yBrida - t / 2,
              ymax: yBrida + t / 2, r: brida.agujero / 2},

    ficha: {pie: pie, ranura: ran, brida: brida, escalon: esc},
    alcance: xBrida + brida.desde - (sal + ran.desde),
    xBrida: xBrida,
  };
}





function construirPlacaRT(THREE, o) {
  o = o || {};
  const W = num(o.ancho, 10), t = num(o.espesor, 2);
  const recto = num(o.recto, 23), cabeza = num(o.cabeza, 11);
  const cuello = num(o.cuello, 5.2), rP = num(o.radioPunta, 2.6);
  const curva = (o.curvaEscalon !== false);
  const agujero = num(o.agujero, 5), seg = Math.max(8, Math.round(num(o.segmentos, 24)));
  const uS = recto / 2, uT = recto / 2 + cabeza;
  if (recto < agujero + 2) throw new Error('el recto de ' + recto.toFixed(1) + ' no deja sitio al agujero');
  if (cabeza < Math.max(rP, (W - cuello) / 2) + 0.5)
    throw new Error('la cabeza de ' + cabeza.toFixed(1) + ' no da para el escalon y la punta');

  const s = new THREE.Shape();
  s.moveTo(-uS, 0);
  s.lineTo(uS, 0);
  util.trazarCabeza(s, W, uS, uT, cuello, rP, curva, 1);                        
  s.lineTo(-uS, W);


  const cab = new THREE.Shape();
  cab.moveTo(-uS, 0);
  util.trazarCabeza(cab, W, uS, uT, cuello, rP, curva, -1);
  const pts = cab.getPoints(seg).reverse();
  for (const q of pts) s.lineTo(q.x, q.y);
  s.closePath();
  if (agujero > 0) {
    const h = new THREE.Path();
    h.absarc(0, W / 2, agujero / 2, 0, Math.PI * 2, true);
    s.holes.push(h);
  }
  const geo = util.tramoPlano(THREE, s, t, seg, [1, 0], [0, t / 2], []);
  const f = util.fundir(THREE, [geo], 1e-4);
  const vol = util.volumen(f.pos, f.idx);
  const rE = Math.max(0, (W - cuello) / 2), rPe = Math.max(0, Math.min(rP, cuello / 2));
  const quitaCabeza = 2 * rE * cabeza - (curva ? 2 * (1 - Math.PI / 4) * rE * rE : 0)
                    + 2 * (1 - Math.PI / 4) * rPe * rPe;
  const teorico = ((recto + 2 * cabeza) * W - 2 * quitaCabeza - Math.PI * agujero * agujero / 4) * t;
  if (Math.abs(vol - teorico) > 0.012 * teorico)
    throw new Error('la malla de la placa no cierra: volumen ' + vol.toFixed(1) +
                    ' contra ' + teorico.toFixed(1));
  return {
    pos: f.pos, nor: f.nor, idx: f.idx, geo: f.geo,
    volumen: vol, teorico: teorico, desarrollo: recto + 2 * cabeza,
    largo: recto + 2 * cabeza, ancho: W, espesor: t,
    agujero: {cx: 0, cz: W / 2, ymin: 0, ymax: t, r: agujero / 2},
    uEscalon: uS, uPunta: uT,
  };
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = {construirSoporteRT: construirSoporteRT, construirPlacaRT: construirPlacaRT};
else { raiz.construirSoporteRT = construirSoporteRT; raiz.construirPlacaRT = construirPlacaRT; }

})(typeof globalThis !== 'undefined' ? globalThis : this);
