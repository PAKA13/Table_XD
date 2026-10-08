






















(function (raiz) {
'use strict';

function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }

















function construirBarraFase(o) {
  o = o || {};
  var L = num(o.largo, 400), W = num(o.ancho, 20), t = num(o.espesor, 3);
  var NX = Math.max(2, Math.round(num(o.nx, 6)));
  var PASO = num(o.paso, 4), MARGEN = num(o.margen, 0.2);
  var hw = W / 2, i, j, s;

  if (!(L > 0)) throw new Error('la barra necesita un largo');



  var ags = (o.agujeros || []).map(function (a) {
    return {y: L - num(a.desdeArriba, 0), r: num(a.diam, 6) / 2,
            xc: num(a.desvio, 0), rol: a.rol || 'a'};
  }).filter(function (a) {
    return a.r > 0;
  }).sort(function (a, b) { return a.y - b.y; });

  if (!ags.length) throw new Error('la barra de fase no tiene ningun agujero');




  var celdas = [];
  for (i = 0; i < ags.length; i++) {
    var y0 = (i === 0) ? 0 : (ags[i - 1].y + ags[i].y) / 2;
    var y1 = (i === ags.length - 1) ? L : (ags[i].y + ags[i + 1].y) / 2;
    celdas.push({y0: y0, y1: y1, yc: ags[i].y, xc: ags[i].xc, r: ags[i].r,
                 rol: ags[i].rol});
  }




  for (i = 0; i < celdas.length; i++) {
    var c = celdas[i];
    if (Math.abs(c.xc) + c.r >= hw - MARGEN)
      throw new Error('el agujero de ' + (2 * c.r).toFixed(2) +
        (c.xc ? ' corrido ' + c.xc.toFixed(2) : '') +
        ' no cabe en el ancho de ' + W);
    if (c.yc - c.r <= c.y0 + MARGEN || c.yc + c.r >= c.y1 - MARGEN)
      throw new Error('el agujero de ' + (2 * c.r).toFixed(2) + ' a ' +
        (L - c.yc).toFixed(1) + ' del borde de arriba se sale de su tramo');
  }





  var xL = [];
  for (s = 0; s <= NX; s++) xL.push(-hw + (W * s) / NX);

  for (i = 0; i < celdas.length; i++) {
    var ce = celdas[i], n = Math.min(40, Math.max(2,
      Math.round((ce.y1 - ce.y0) / PASO)));
    ce.yL = [];
    for (s = 0; s <= n; s++) ce.yL.push(ce.y0 + ((ce.y1 - ce.y0) * s) / n);
  }

  var pos = [], nor = [], idx = [];
  function v(p, nn) { pos.push(p[0], p[1], p[2]); nor.push(nn[0], nn[1], nn[2]);
                      return pos.length / 3 - 1; }


  function bordeDe(ce) {
    var b = [], k, yL = ce.yL, m = yL.length - 1;
    for (k = 0; k < NX; k++)      b.push([xL[k], ce.y0]);
    for (k = 0; k < m; k++)       b.push([hw, yL[k]]);
    for (k = NX; k > 0; k--)      b.push([xL[k], ce.y1]);
    for (k = m; k > 0; k--)       b.push([-hw, yL[k]]);
    return b;
  }





  function anillo(ce, delante) {
    var z = delante ? t : 0, nn = [0, 0, delante ? 1 : -1];
    var b = bordeDe(ce), n = b.length, k, k2;
    var th = b.map(function (p) { return Math.atan2(p[1] - ce.yc, p[0] - ce.xc); });
    var iR = [], iC = [];
    for (k = 0; k < n; k++) {
      iR.push(v([b[k][0], b[k][1], z], nn));
      iC.push(v([ce.xc + ce.r * Math.cos(th[k]), ce.yc + ce.r * Math.sin(th[k]), z], nn));
    }


    for (k = 0; k < n; k++) {
      k2 = (k + 1) % n;
      if (delante) idx.push(iR[k], iR[k2], iC[k2],  iR[k], iC[k2], iC[k]);
      else         idx.push(iR[k], iC[k2], iR[k2],  iR[k], iC[k], iC[k2]);
    }
    return th;
  }



  function pared(ce, th) {
    var A = [], B = [], k, k2, n = th.length;
    for (k = 0; k < n; k++) {
      var px = ce.xc + ce.r * Math.cos(th[k]), py = ce.yc + ce.r * Math.sin(th[k]);
      var nn = [-Math.cos(th[k]), -Math.sin(th[k]), 0];
      A.push(v([px, py, t], nn));
      B.push(v([px, py, 0], nn));
    }
    for (k = 0; k < n; k++) {
      k2 = (k + 1) % n;
      idx.push(A[k], B[k2], B[k],  A[k], A[k2], B[k2]);
    }
  }

  var agujeros = [], areaHuecos = 0;
  for (i = 0; i < celdas.length; i++) {
    var th = anillo(celdas[i], true);
    anillo(celdas[i], false);
    pared(celdas[i], th);
    agujeros.push({x: celdas[i].xc, y: celdas[i].yc, z: t, r: celdas[i].r,
                   rol: celdas[i].rol, desdeArriba: L - celdas[i].yc});





    var ap = 0, nth = th.length;
    for (j = 0; j < nth; j++) {
      var dth = th[(j + 1) % nth] - th[j];
      dth = Math.atan2(Math.sin(dth), Math.cos(dth));
      ap += 0.5 * celdas[i].r * celdas[i].r * Math.sin(Math.abs(dth));
    }
    areaHuecos += ap;
  }



  function canto(x, sig) {
    var nn = [sig, 0, 0];
    for (i = 0; i < celdas.length; i++) {
      var yL = celdas[i].yL;
      for (j = 0; j + 1 < yL.length; j++) {
        var a = v([x, yL[j], 0], nn), b = v([x, yL[j], t], nn);
        var c2 = v([x, yL[j + 1], t], nn), d = v([x, yL[j + 1], 0], nn);
        if (sig > 0) idx.push(a, d, c2,  a, c2, b);
        else         idx.push(a, b, c2,  a, c2, d);
      }
    }
  }
  canto(hw, 1);
  canto(-hw, -1);


  function tapa(y, sig) {
    var nn = [0, sig, 0];
    for (s = 0; s + 1 < xL.length; s++) {
      var a = v([xL[s], y, 0], nn), b = v([xL[s], y, t], nn);
      var c2 = v([xL[s + 1], y, t], nn), d = v([xL[s + 1], y, 0], nn);
      if (sig > 0) idx.push(a, b, c2,  a, c2, d);
      else         idx.push(a, d, c2,  a, c2, b);
    }
  }
  tapa(L, 1);
  tapa(0, -1);




  var vol = 0;
  for (i = 0; i < idx.length; i += 3) {
    var a3 = idx[i] * 3, b3 = idx[i + 1] * 3, c3 = idx[i + 2] * 3;
    vol += (pos[a3] * (pos[b3 + 1] * pos[c3 + 2] - pos[b3 + 2] * pos[c3 + 1])
          - pos[a3 + 1] * (pos[b3] * pos[c3 + 2] - pos[b3 + 2] * pos[c3])
          + pos[a3 + 2] * (pos[b3] * pos[c3 + 1] - pos[b3 + 1] * pos[c3])) / 6;
  }
  var esperado = L * W * t - areaHuecos * t;
  if (Math.abs(vol - esperado) > esperado * 0.005)
    throw new Error('volumen ' + vol.toFixed(1) + ' mm3, esperaba ' +
      esperado.toFixed(1) + ': la malla no esta cerrada o hay caras al reves');

  return {pos: pos, nor: nor, idx: idx, volumen: vol,
          largo: L, ancho: W, espesor: t,
          agujeros: agujeros, celdas: celdas};
}
































function construirBarraEscalonada(o) {
  o = o || {};
  var L = num(o.largo, 400), W = num(o.ancho, 20), t = num(o.espesor, 3);
  var e = o.escalon || {};
  var H = num(e.alto, 20), R = num(e.radio, t), Rm = R + t / 2;
  var hw = W / 2, i, k;
  if (!(H >= 2 * Rm))
    throw new Error("un escalon de " + H.toFixed(1) + " no cabe con dos pliegues de radio " +
                    R + ": necesita al menos " + (2 * Rm).toFixed(1));
  var desde = num(e.desde, NaN), hasta = num(e.hasta, NaN);
  var conPie1 = isFinite(desde) && desde > 0;                                
  var baja = isFinite(hasta) && hasta < L;                                  
  if (!conPie1 && !baja) throw new Error("el escalon no tiene donde plegarse");
  if (conPie1 && baja && hasta - desde < 4 * Rm + 1)
    throw new Error("entre subir y bajar no queda barra: " + (hasta - desde).toFixed(1) + " mm");
  if (conPie1 && desde + 2 * Rm >= L) throw new Error("el escalon se sale de la barra");
  if (baja && hasta - 2 * Rm <= 0) throw new Error("el escalon se sale de la barra");



  var yPie1 = conPie1 ? desde : 0, ySube = conPie1 ? desde + 2 * Rm : 0;
  var yBaja = baja ? hasta - 2 * Rm : L, yPie2 = baja ? hasta : L;
  var ags = (o.agujeros || []).map(function (a) {
    return {desdeArriba: num(a.desdeArriba, 0), diam: num(a.diam, 6), rol: a.rol || "a",
            desvio: num(a.desvio, 0)};
  });
  for (i = 0; i < ags.length; i++) {
    var d = ags[i].desdeArriba, r = ags[i].diam / 2;
    var enSube = conPie1 && (d + r > yPie1 && d - r < ySube);
    var enBaja = baja && (d + r > yBaja && d - r < yPie2);
    if (enSube || enBaja)
      throw new Error("el agujero a " + d.toFixed(1) + " del borde de arriba cae en el pliegue del escalon");
  }

  var pos = [], nor = [], idx = [], agujeros = [], desarrollo = 0;
  function pegar(m, dy, dz, esp) {
    var base = pos.length / 3;
    for (i = 0; i < m.pos.length; i += 3) {
      var y = m.pos[i + 1], z = m.pos[i + 2];
      if (esp) y = -y;
      pos.push(m.pos[i], y + dy, z + dz);
      nor.push(m.nor[i], esp ? -m.nor[i + 1] : m.nor[i + 1], m.nor[i + 2]);
    }
    for (i = 0; i < m.idx.length; i += 3) {
      if (esp) idx.push(base + m.idx[i], base + m.idx[i + 2], base + m.idx[i + 1]);
      else     idx.push(base + m.idx[i], base + m.idx[i + 1], base + m.idx[i + 2]);
    }
  }




  function plano(dA, dB, alz) {
    var largo = dB - dA, mios = [];
    for (i = 0; i < ags.length; i++)
      if (ags[i].desdeArriba >= dA && ags[i].desdeArriba < dB)
        mios.push({desdeArriba: ags[i].desdeArriba - dA, diam: ags[i].diam, rol: ags[i].rol,
                   desvio: ags[i].desvio});
    var yA = L - dB;                                                      
    if (mios.length) {
      var m = construirBarraFase({largo: largo, ancho: W, espesor: t, agujeros: mios});
      pegar(m, yA, alz, false);
      for (i = 0; i < m.agujeros.length; i++)
        agujeros.push({x: m.agujeros[i].x, y: m.agujeros[i].y + yA, z: t + alz, r: m.agujeros[i].r,
                       rol: m.agujeros[i].rol, desdeArriba: m.agujeros[i].desdeArriba + dA});
    } else {
      pegar(barrido([{p: [0, t / 2], n: [0, 1]}, {p: [largo, t / 2], n: [0, 1]}]), yA, alz, false);
    }
    desarrollo += largo;
  }




  function barrido(cam) {
    var P = [], N = [], I = [], m = cam.length, j, a, b, c, d;
    function v(p, nn) { P.push(p[0], p[1], p[2]); N.push(nn[0], nn[1], nn[2]);
                        return P.length / 3 - 1; }
    function esq(j, sx, sz) {                                                                     
      var q = cam[j];
      return [sx * hw, q.p[0] + sz * q.n[0] * t / 2, q.p[1] + sz * q.n[1] * t / 2];
    }
    for (j = 0; j + 1 < m; j++) {
      var n0 = cam[j].n, n1 = cam[j + 1].n;


      a = v(esq(j, -1, 1), [0, n0[0], n0[1]]);  b = v(esq(j, 1, 1), [0, n0[0], n0[1]]);
      c = v(esq(j + 1, 1, 1), [0, n1[0], n1[1]]); d = v(esq(j + 1, -1, 1), [0, n1[0], n1[1]]);
      I.push(a, b, c,  a, c, d);

      a = v(esq(j, -1, -1), [0, -n0[0], -n0[1]]);  b = v(esq(j, 1, -1), [0, -n0[0], -n0[1]]);
      c = v(esq(j + 1, 1, -1), [0, -n1[0], -n1[1]]); d = v(esq(j + 1, -1, -1), [0, -n1[0], -n1[1]]);
      I.push(a, c, b,  a, d, c);

      a = v(esq(j, 1, -1), [1, 0, 0]); b = v(esq(j, 1, 1), [1, 0, 0]);
      c = v(esq(j + 1, 1, 1), [1, 0, 0]); d = v(esq(j + 1, 1, -1), [1, 0, 0]);
      I.push(a, c, b,  a, d, c);

      a = v(esq(j, -1, -1), [-1, 0, 0]); b = v(esq(j, -1, 1), [-1, 0, 0]);
      c = v(esq(j + 1, -1, 1), [-1, 0, 0]); d = v(esq(j + 1, -1, -1), [-1, 0, 0]);
      I.push(a, b, c,  a, c, d);
    }

    var t0 = tangente(cam, 0), t1 = tangente(cam, m - 1);
    a = v(esq(0, -1, -1), [0, -t0[0], -t0[1]]); b = v(esq(0, 1, -1), [0, -t0[0], -t0[1]]);
    c = v(esq(0, 1, 1), [0, -t0[0], -t0[1]]);   d = v(esq(0, -1, 1), [0, -t0[0], -t0[1]]);
    I.push(a, b, c,  a, c, d);
    a = v(esq(m - 1, -1, -1), [0, t1[0], t1[1]]); b = v(esq(m - 1, 1, -1), [0, t1[0], t1[1]]);
    c = v(esq(m - 1, 1, 1), [0, t1[0], t1[1]]);   d = v(esq(m - 1, -1, 1), [0, t1[0], t1[1]]);
    I.push(a, c, b,  a, d, c);
    return {pos: P, nor: N, idx: I};
  }
  function tangente(cam, j) {
    var q = cam[j].n;
    return [q[1], -q[0]];                                                                  
  }




  function caminoSube() {
    var cam = [], NA = 12, a;
    for (k = 0; k <= NA; k++) {
      a = (Math.PI / 2) * k / NA;
      cam.push({p: [Rm * Math.sin(a), t / 2 + Rm * (1 - Math.cos(a))],
                n: [-Math.sin(a), Math.cos(a)]});
    }
    var zTop = H + t / 2 - Rm;
    if (zTop > t / 2 + Rm + 1e-9) cam.push({p: [Rm, zTop], n: [-1, 0]});
    for (k = 1; k <= NA; k++) {
      a = (Math.PI / 2) * k / NA;
      cam.push({p: [2 * Rm - Rm * Math.cos(a), zTop + Rm * Math.sin(a)],
                n: [-Math.cos(a), Math.sin(a)]});
    }
    return cam;
  }
  var largoEsc = Math.PI * Rm + (H - 2 * Rm);





  if (baja) plano(yPie2, L, 0);
  if (baja) { pegar(barrido(caminoSube()), L - yPie2, 0, false); desarrollo += largoEsc; }
  plano(ySube, yBaja, H);
  if (conPie1) { pegar(barrido(caminoSube()), L - yPie1, 0, true); desarrollo += largoEsc; }
  if (conPie1) plano(0, yPie1, 0);



  var vol = 0;
  for (i = 0; i < idx.length; i += 3) {
    var a3 = idx[i] * 3, b3 = idx[i + 1] * 3, c3 = idx[i + 2] * 3;
    vol += (pos[a3] * (pos[b3 + 1] * pos[c3 + 2] - pos[b3 + 2] * pos[c3 + 1])
          - pos[a3 + 1] * (pos[b3] * pos[c3 + 2] - pos[b3 + 2] * pos[c3])
          + pos[a3 + 2] * (pos[b3] * pos[c3 + 1] - pos[b3 + 1] * pos[c3])) / 6;
  }
  var hueco = 0;
  for (i = 0; i < agujeros.length; i++) hueco += Math.PI * agujeros[i].r * agujeros[i].r * t;
  var esperado = desarrollo * W * t - hueco;
  if (Math.abs(vol - esperado) > esperado * 0.005)
    throw new Error("volumen " + vol.toFixed(1) + " mm3, esperaba " + esperado.toFixed(1) +
                    ": la barra escalonada no esta cerrada o hay caras al reves");

  agujeros.sort(function (p, q) { return p.y - q.y; });
  var y0 = L - yBaja, y1 = L - ySube;
  return {pos: pos, nor: nor, idx: idx, volumen: vol,
          largo: L, ancho: W, espesor: t, desarrollo: desarrollo,
          agujeros: agujeros,
          escalon: {y0: y0, y1: y1, alto: H, radio: R,
                    desde: conPie1 ? desde : null, hasta: baja ? hasta : null,

                    sube: baja ? [L - yPie2, L - yBaja] : null,
                    baja: conPie1 ? [L - ySube, L - yPie1] : null},
          alzada: function (y) { return (y >= y0 && y <= y1) ? H : 0; }};
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = {construirBarraFase: construirBarraFase,
                    construirBarraEscalonada: construirBarraEscalonada};
else {
  raiz.construirBarraFase = construirBarraFase;
  raiz.construirBarraEscalonada = construirBarraEscalonada;
}

})(typeof globalThis !== 'undefined' ? globalThis : this);
