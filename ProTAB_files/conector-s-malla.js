






































(function (raiz) {
'use strict';

const util = (typeof module !== 'undefined' && module.exports)
  ? require('./malla-util.js') : raiz.mallaUtil;

function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }





function formaBrazo(THREE, W, uS, uT, cuello, rP, curva) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(uS, 0);
  util.trazarCabeza(s, W, uS, uT, cuello, rP, curva, 1);
  s.lineTo(0, W);
  s.closePath();
  return s;
}

const tramoPlano = util.tramoPlano, pliegue = util.pliegue;
















function construirConectorS(THREE, o) {
  o = o || {};
  const W = num(o.ancho, 10), t = num(o.espesor, 2), Ri = num(o.radio, 2);
  const Rm = Ri + t / 2, Ro = Ri + t;
  const base = num(o.base, 19), alto = num(o.alto, 44.5);
  const recto = num(o.recto, 23), cabeza = num(o.cabeza, 11);
  const L = num(o.inclinacion, 3.97) * Math.PI / 180;
  const cuello = num(o.cuello, 5.2), rP = num(o.radioPunta, 2.6);
  const curva = (o.curvaEscalon !== false);
  const agujero = num(o.agujero, 5), seg = Math.max(8, Math.round(num(o.segmentos, 24)));

  const xc = base / 2 - Ro;                                                       
  if (xc <= agujero / 2 + 0.5)
    throw new Error('con ' + base.toFixed(1) + ' de base no cabe el agujero entre los pliegues');
  const yBase = -t / 2, yBrazo = alto - 1.5 * t;
  const c1 = [-xc, yBase + Rm];                                                             
  const p1 = [c1[0] - Rm * Math.cos(L), c1[1] + Rm * Math.sin(L)];                         
  const d = [Math.sin(L), Math.cos(L)];                                  

  const s2 = (yBrazo - Rm - p1[1] - Rm * Math.sin(L)) / Math.cos(L);
  if (s2 < 1) throw new Error('con ' + alto.toFixed(1) + ' de alto no queda pata entre los pliegues');
  const c2 = [p1[0] + s2 * d[0] - Rm * Math.cos(L), yBrazo - Rm];                         
  const uS = recto / 2 + c2[0], uT = recto / 2 + cabeza + c2[0];
  if (uS < 0)
    throw new Error('el recto de ' + recto.toFixed(1) + ' no llega a las patas: pide al menos ' +
                    (2 * -c2[0]).toFixed(1));
  if (uT - uS < Math.max(rP, (W - cuello) / 2) + 0.5)
    throw new Error('la cabeza de ' + cabeza.toFixed(1) + ' no da para el escalon y la punta');

  const trozos = [];

  const fB = new THREE.Shape();
  fB.moveTo(-xc, 0); fB.lineTo(xc, 0); fB.lineTo(xc, W); fB.lineTo(-xc, W); fB.closePath();
  if (agujero > 0) {
    const h = new THREE.Path();
    h.absarc(0, W / 2, agujero / 2, 0, Math.PI * 2, true);
    fB.holes.push(h);
  }
  trozos.push(tramoPlano(THREE, fB, t, seg, [1, 0], [0, yBase], [-xc, xc]));



  for (const lado of [-1, 1]) {
    const cx1 = [-lado * c1[0], c1[1]], cx2 = [-lado * c2[0], c2[1]];

    trozos.push(pliegue(THREE, cx1, Ri, Ro, -Math.PI / 2,
                        -Math.PI / 2 + lado * (Math.PI / 2 + L), W, seg));

    const fP = new THREE.Shape();
    fP.moveTo(0, 0); fP.lineTo(s2, 0); fP.lineTo(s2, W); fP.lineTo(0, W); fP.closePath();
    trozos.push(tramoPlano(THREE, fP, t, seg, [-lado * d[0], d[1]],
                           [-lado * p1[0], p1[1]], [0, s2]));

    const fPata = (lado < 0) ? -L : Math.PI + L;
    trozos.push(pliegue(THREE, cx2, Ri, Ro, fPata, Math.PI / 2, W, seg));

    trozos.push(tramoPlano(THREE, formaBrazo(THREE, W, uS, uT, cuello, rP, curva),
                           t, seg, [lado, 0], [-lado * c2[0], yBrazo], [0]));
  }

  const f = util.fundir(THREE, trozos, 1e-4);
  const vol = util.volumen(f.pos, f.idx);
  const arco = Rm * (Math.PI / 2 + L);
  const desarrollo = 2 * (xc + arco + s2 + arco + uT);



  const rE = Math.max(0, (W - cuello) / 2), rPe = Math.max(0, Math.min(rP, cuello / 2));
  const quitaCabeza = 2 * rE * (uT - uS) - (curva ? 2 * (1 - Math.PI / 4) * rE * rE : 0)
                    + 2 * (1 - Math.PI / 4) * rPe * rPe;
  const teorico = (desarrollo * W - Math.PI * agujero * agujero / 4 - 2 * quitaCabeza) * t;
  if (Math.abs(vol - teorico) > 0.012 * teorico)
    throw new Error('la malla de la S no cierra: volumen ' + vol.toFixed(1) +
                    ' contra ' + teorico.toFixed(1));

  return {
    pos: f.pos, nor: f.nor, idx: f.idx, geo: f.geo,
    volumen: vol, teorico: teorico, desarrollo: desarrollo,
    largo: recto + 2 * cabeza, alto: alto, ancho: W, espesor: t,
    pata: s2, inclinacion: L * 180 / Math.PI, radio: Ri,
    xBrazo: -c2[0], uEscalon: uS, uPunta: uT,
    agujero: {p: [0, yBase, W / 2], n: [0, 1, 0], r: agujero / 2},


    pataIzq: {p0: [p1[0] - (t / 2) * Math.cos(L), p1[1] + (t / 2) * Math.sin(L)],
              p1: [p1[0] - (t / 2) * Math.cos(L) + s2 * d[0],
                   p1[1] + (t / 2) * Math.sin(L) + s2 * d[1]]},
    puntas: [[-(recto / 2 + cabeza), yBrazo, W / 2], [recto / 2 + cabeza, yBrazo, W / 2]],
  };
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = {construirConectorS: construirConectorS};
else raiz.construirConectorS = construirConectorS;

})(typeof globalThis !== 'undefined' ? globalThis : this);
