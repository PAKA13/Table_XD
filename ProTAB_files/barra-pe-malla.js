

















(function (raiz) {
'use strict';

function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }























var ALTO_PE_DEFECTO = 20;

function construirBarraPE(o) {
  o = o || {};
  var ANCHO = num(o.ancho, 20), t = num(o.espesor, 3);
  var PATA  = num(o.pata, 16),  ALTO = num(o.alto, ALTO_PE_DEFECTO);
  var RI    = num(o.radio, 3),  SEG  = num(o.seg, 24);
  var NZ    = Math.max(2, Math.round(num(o.nz, 8)));                          
  var PASOX = num(o.pasox, 1.5);                                                 
  var ALAAG = num(o.alaAg, 7.6);
  var rAla  = num(o.agujeroAla, 4.7625) / 2;
  var rPilaAla = num(o.radioPilaAla, 0);
  var piezaAla = o.piezaAla || 'tornillo';
  var celdas = o.celdas || [];
  var i, j, k;

  if (!celdas.length) throw new Error('la barra PE necesita al menos un segmento');

  var R = RI + t / 2;                                                         
  var yB = t / 2, yT = ALTO - t / 2;                                             
  var vert = (yT - yB) - 2 * R;                                            
  if (vert < 0) throw new Error('alto ' + ALTO + ' mm imposible: con radio ' + RI +
    ' y espesor ' + t + ' el minimo es ' + (2 * RI + 2 * t) + ' mm');

  var hw = ANCHO / 2;
  var PUENTE = 0;
  for (i = 0; i < celdas.length; i++) PUENTE += num(celdas[i].ancho, 10);
  var xB0 = PATA + 2 * R, xB1 = xB0 + PUENTE;
  var LARGO = 2 * PATA + PUENTE + 4 * R;






  var zL = [];
  for (j = 0; j <= NZ; j++) zL.push(-hw + ANCHO * j / NZ);





  function celda(x0, x1, xc, dz, r, pieza) {
    var nx = Math.max(3, Math.round((x1 - x0) / PASOX)), s;
    var xL = [];
    for (s = 0; s <= nx; s++) xL.push(x0 + (x1 - x0) * s / nx);
    return {x0: x0, x1: x1, xc: xc, dz: dz, r: r, pieza: pieza, xL: xL};
  }

  var zonas = [
    {x0: 0, x1: PATA, yUp: yB + t / 2, yDn: yB - t / 2,
     celdas: [celda(0, PATA, ALAAG, 0, rAla, piezaAla)]},
    {x0: xB0, x1: xB1, yUp: yT + t / 2, yDn: yT - t / 2, celdas: []},
    {x0: LARGO - PATA, x1: LARGO, yUp: yB + t / 2, yDn: yB - t / 2,
     celdas: [celda(LARGO - PATA, LARGO, LARGO - ALAAG, 0, rAla, piezaAla)]},
  ];

  var xa = xB0;
  for (i = 0; i < celdas.length; i++) {
    var w = num(celdas[i].ancho, 10);
    zonas[1].celdas.push(celda(xa, xa + w, xa + w / 2,
      num(celdas[i].dz, 0), num(celdas[i].agujero, 4.7625) / 2,
      celdas[i].pieza || 'tornillo'));
    xa += w;
  }




  for (i = 0; i < zonas.length; i++) {
    for (j = 0; j < zonas[i].celdas.length; j++) {
      var q = zonas[i].celdas[j];
      if (q.xc - q.r <= q.x0 + 1e-9 || q.xc + q.r >= q.x1 - 1e-9)
        throw new Error('el agujero de ' + (2 * q.r).toFixed(2) + ' no cabe en su ' +
          'segmento de ' + (q.x1 - q.x0).toFixed(1) + ' mm');
      if (Math.abs(q.dz) + q.r >= hw - 1e-9)
        throw new Error('el agujero de ' + (2 * q.r).toFixed(2) + ' con desvio ' +
          q.dz + ' se sale del ancho de ' + ANCHO);
    }
  }









  if (rPilaAla > 0 && ALAAG + rPilaAla > PATA + 1e-9)
    throw new Error('un ala de ' + PATA.toFixed(2) + ' mm no sostiene su ' +
      'tornilleria: apoya hasta ' + (ALAAG + rPilaAla).toFixed(2) +
      ' y ahi ya ha empezado el codo');







  var est = [];
  function push(x, y, nx, ny) {
    var u = est[est.length - 1];
    if (u && Math.abs(u.x - x) < 1e-9 && Math.abs(u.y - y) < 1e-9 &&
        Math.abs(u.nx - nx) < 1e-9 && Math.abs(u.ny - ny) < 1e-9) return;
    est.push({x: x, y: y, nx: nx, ny: ny});
  }
  function arco(cx, cy, a0, a1, fuera) {
    for (var s = 0; s <= SEG; s++) {
      var a = a0 + (a1 - a0) * s / SEG, co = Math.cos(a), si = Math.sin(a);
      var g = fuera ? 1 : -1;
      push(cx + R * co, cy + R * si, g * co, g * si);
    }
  }

  function cortesDe(zn) {
    var out = [], s, m;
    for (s = 0; s < zn.celdas.length; s++)
      for (m = (s === 0 ? 1 : 0); m < zn.celdas[s].xL.length - 1; m++)
        out.push(zn.celdas[s].xL[m]);
    return out;
  }

  var HP = Math.PI / 2, x = 0, zi = [], corte;
  push(x, yB, 0, 1);                                                          
  zi.push(est.length - 1);
  for (corte of cortesDe(zonas[0])) push(corte, yB, 0, 1);
  x += PATA;         push(x, yB, 0, 1);                                   
  zi.push(est.length - 1);
  arco(x, yB + R, -HP, 0, false);              x += R;                     
  push(x, yB + R + vert, -1, 0);                                     
  arco(x + R, yT - R, Math.PI, HP, true);      x += R;                     
  push(x, yT, 0, 1);
  zi.push(est.length - 1);
  for (corte of cortesDe(zonas[1])) push(corte, yT, 0, 1);
  x += PUENTE;       push(x, yT, 0, 1);                            
  zi.push(est.length - 1);
  arco(x, yT - R, HP, 0, true);                x += R;                     
  push(x, yB + R + vert, 1, 0);
  arco(x + R, yB + R, Math.PI, 3 * HP, false); x += R;                      
  push(x, yB, 0, 1);
  zi.push(est.length - 1);
  for (corte of cortesDe(zonas[2])) push(corte, yB, 0, 1);
  x += PATA;         push(x, yB, 0, 1);                                 
  zi.push(est.length - 1);





  for (i = 1; i < est.length; i++) {
    if (est[i - 1].nx * est[i].nx + est[i - 1].ny * est[i].ny <= 0)
      throw new Error('normal volteada en x=' + est[i].x.toFixed(3));
  }

  var desarrollo = 2 * PATA + PUENTE + 2 * vert + 4 * (R * HP);


  var pos = [], nor = [], idx = [], ht = t / 2;
  function v(p, n) { pos.push(p[0], p[1], p[2]); nor.push(n[0], n[1], n[2]);
                     return pos.length / 3 - 1; }
  function P(e, s, z) { return [e.x + s * ht * e.nx, e.y + s * ht * e.ny, z]; }



  function enZona(s) {
    return (s >= zi[0] && s < zi[1]) || (s >= zi[2] && s < zi[3])
        || (s >= zi[4] && s < zi[5]);
  }




  function tira(columna, saltar) {
    var sal = function (s) { return s >= 0 && !!(saltar && saltar(s)); };
    var fila = est.map(function (e, s) {
      return (sal(s) && sal(s - 1)) ? null
           : columna(e).map(function (c) { return v(c[0], c[1]); });
    });
    for (var s = 0; s + 1 < fila.length; s++) {
      if (sal(s)) continue;
      var A = fila[s], B = fila[s + 1];
      for (var m = 0; m + 1 < A.length; m++)
        idx.push(A[m], B[m + 1], B[m],  A[m], A[m + 1], B[m + 1]);
    }
  }
  var colMas  = function (e) { return zL.map(function (z) {
    return [P(e, 1, z), [e.nx, e.ny, 0]]; }); };
  var colMenos = function (e) { var n = [-e.nx, -e.ny, 0]; return zL.map(function (z, s) {
    return [P(e, -1, zL[zL.length - 1 - s]), n]; }); };

  tira(colMas,  enZona);
  tira(colMenos, enZona);
  tira(function (e) { return [[P(e,  1, hw), [0, 0, 1]],
                              [P(e, -1, hw), [0, 0, 1]]]; });
  tira(function (e) { return [[P(e, -1, -hw), [0, 0, -1]],
                              [P(e,  1, -hw), [0, 0, -1]]]; });



  function tapa(e, sig) {
    var T = [sig * e.ny, -sig * e.nx, 0], s;
    var A = zL.map(function (z) { return v(P(e,  1, z), T); });
    var B = zL.map(function (z) { return v(P(e, -1, z), T); });
    for (s = 0; s + 1 < zL.length; s++) {
      if (sig > 0) idx.push(A[s], A[s + 1], B[s + 1],  A[s], B[s + 1], B[s]);
      else         idx.push(A[s], B[s + 1], A[s + 1],  A[s], B[s], B[s + 1]);
    }
  }
  tapa(est[0], -1);
  tapa(est[est.length - 1], 1);













  function bordeDe(cel) {
    var b = [], s, xL = cel.xL, n = xL.length - 1;
    for (s = 0; s < n; s++)               b.push([xL[s], -hw]);
    for (s = 0; s < zL.length - 1; s++)   b.push([cel.x1, zL[s]]);
    for (s = n; s > 0; s--)               b.push([xL[s], hw]);
    for (s = zL.length - 1; s > 0; s--)   b.push([cel.x0, zL[s]]);
    return b;
  }

  function anillo(zn, cel, arriba) {
    var yF = arriba ? zn.yUp : zn.yDn;
    var nA = [0, arriba ? 1 : -1, 0];
    var b = bordeDe(cel), n = b.length, s;
    var th = b.map(function (p) { return Math.atan2(p[1] - cel.dz, p[0] - cel.xc); });
    var iR = [], iC = [];
    for (s = 0; s < n; s++) {
      iR.push(v([b[s][0], yF, b[s][1]], nA));
      iC.push(v([cel.xc + cel.r * Math.cos(th[s]), yF,
                 cel.dz + cel.r * Math.sin(th[s])], nA));
    }


    for (s = 0; s < n; s++) {
      var k2 = (s + 1) % n;
      if (arriba) idx.push(iR[s], iC[k2], iR[k2],  iR[s], iC[s], iC[k2]);
      else        idx.push(iR[s], iR[k2], iC[k2],  iR[s], iC[k2], iC[s]);
    }
    return th;
  }



  function pared(zn, cel, th) {
    var T = [], B = [], s, n = th.length;
    for (s = 0; s < n; s++) {
      var px = cel.xc + cel.r * Math.cos(th[s]), pz = cel.dz + cel.r * Math.sin(th[s]);
      var nn = [-Math.cos(th[s]), 0, -Math.sin(th[s])];
      T.push(v([px, zn.yUp, pz], nn));
      B.push(v([px, zn.yDn, pz], nn));
    }
    for (s = 0; s < n; s++) {
      var k2 = (s + 1) % n;
      idx.push(T[s], B[s], B[k2],  T[s], B[k2], T[k2]);
    }
  }

  var agujeros = [];
  for (i = 0; i < zonas.length; i++) {
    for (j = 0; j < zonas[i].celdas.length; j++) {
      var cel = zonas[i].celdas[j];
      var th = anillo(zonas[i], cel, true);
      anillo(zonas[i], cel, false);
      pared(zonas[i], cel, th);
      agujeros.push({x: cel.xc, z: cel.dz, y: zonas[i].yUp,
                     r: cel.r, pieza: cel.pieza});
    }
  }





  var vol = 0;
  for (i = 0; i < idx.length; i += 3) {
    var a3 = idx[i] * 3, b3 = idx[i + 1] * 3, c3 = idx[i + 2] * 3;
    vol += (pos[a3] * (pos[b3 + 1] * pos[c3 + 2] - pos[b3 + 2] * pos[c3 + 1])
          - pos[a3 + 1] * (pos[b3] * pos[c3 + 2] - pos[b3 + 2] * pos[c3])
          + pos[a3 + 2] * (pos[b3] * pos[c3 + 1] - pos[b3 + 1] * pos[c3])) / 6;
  }
  var hueco = 0;
  for (i = 0; i < agujeros.length; i++)
    hueco += Math.PI * agujeros[i].r * agujeros[i].r * t;
  var esperado = desarrollo * ANCHO * t - hueco;
  if (Math.abs(vol - esperado) > esperado * 0.005)
    throw new Error('volumen ' + vol.toFixed(1) + ' mm3, esperaba ' +
      esperado.toFixed(1) + ': la malla no esta cerrada o hay caras al reves');



  var perfil = est.map(function (e) { return [e.x + ht * e.nx, e.y + ht * e.ny]; })
    .concat(est.map(function (e) { return [e.x - ht * e.nx, e.y - ht * e.ny]; })
               .reverse());

  return {pos: pos, nor: nor, idx: idx, desarrollo: desarrollo, volumen: vol,
          largo: LARGO, puente: PUENTE, pata: PATA, alto: ALTO, vert: vert,
          ancho: ANCHO, espesor: t, radio: RI, codo: R, xPuente: xB0,
          agujeros: agujeros, zonas: zonas, perfil: perfil};
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = {construirBarraPE: construirBarraPE, ALTO_PE_DEFECTO: ALTO_PE_DEFECTO};
else { raiz.construirBarraPE = construirBarraPE; raiz.ALTO_PE_DEFECTO = ALTO_PE_DEFECTO; }

})(typeof globalThis !== 'undefined' ? globalThis : this);
