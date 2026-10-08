









































(function (raiz) {
'use strict';

function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }





function doblezRecto(SALTO, AV, R) {
  if (!(AV > 0)) throw new Error('el perfil necesita avanzar algo');
  function subidaDe(th) {
    var c = Math.cos(th), s = Math.sin(th);
    var l3 = (AV - 2 * R * s) / c;
    return (l3 < 0) ? Infinity : (2 * R * (1 - c) + l3 * s);
  }
  var lo = 1e-4, hi = 1.45, TH, k;                                      
  if (subidaDe(hi) < SALTO)
    throw new Error('con un avance de ' + AV.toFixed(1) +
      ' no se llega a un salto de ' + SALTO.toFixed(1) +
      ': hace falta mas rampa');
  for (k = 0; k < 80; k++) {
    TH = (lo + hi) / 2;
    if (subidaDe(TH) < SALTO) lo = TH; else hi = TH;
  }
  TH = (lo + hi) / 2;
  return {TH: TH, L3: (AV - 2 * R * Math.sin(TH)) / Math.cos(TH)};
}






function armarPerfil(u1, R, TH, L3, uMin, uMax, PASO) {
  var est = [], i;
  var s = uMin, M = uMin, N = 0;
  function meter(u, MM, NN, aa) { est.push({u: u, M: MM, N: NN, a: aa}); }
  meter(s, M, N, 0);

  var nPl = Math.max(1, Math.ceil((u1 - uMin) / PASO));
  for (i = 1; i <= nPl; i++) {
    var uu = uMin + (u1 - uMin) * i / nPl;
    meter(uu, uMin + (uu - uMin), 0, 0);
  }
  M = u1; N = 0;

  var nAr = Math.max(4, Math.ceil(R * TH / PASO));
  for (i = 1; i <= nAr; i++) {
    var a = TH * i / nAr;
    meter(u1 + R * a, u1 + R * Math.sin(a), R * (1 - Math.cos(a)), a);
  }
  M = u1 + R * Math.sin(TH); N = R * (1 - Math.cos(TH));

  var uR0 = u1 + R * TH;
  var nRe = Math.max(1, Math.ceil(L3 / PASO));
  for (i = 1; i <= nRe; i++) {
    var d = L3 * i / nRe;
    meter(uR0 + d, M + d * Math.cos(TH), N + d * Math.sin(TH), TH);
  }
  M += L3 * Math.cos(TH); N += L3 * Math.sin(TH);



  var uA0 = uR0 + L3;
  var cx = M + R * Math.sin(TH), cy = N - R * Math.cos(TH);
  for (i = 1; i <= nAr; i++) {
    var b = TH * (1 - i / nAr);
    meter(uA0 + R * (TH - b), cx - R * Math.sin(b), cy + R * Math.cos(b), b);
  }
  M = cx; N = cy + R;

  var uF = uA0 + R * TH;
  var nFi = Math.max(1, Math.ceil((uMax - uF) / PASO));
  for (i = 1; i <= nFi; i++) {
    var e = (uMax - uF) * i / nFi;
    meter(uF + e, M + e, N, 0);
  }
  return function perfil(u) {
    if (u <= est[0].u) return est[0];
    var n = est.length;
    if (u >= est[n - 1].u) return est[n - 1];
    var a = 0, b = n - 1;
    while (b - a > 1) { var m = (a + b) >> 1; if (est[m].u <= u) a = m; else b = m; }
    var p = est[a], q = est[b], f = (u - p.u) / (q.u - p.u || 1);
    return {M: p.M + (q.M - p.M) * f, N: p.N + (q.N - p.N) * f,
            a: p.a + (q.a - p.a) * f};
  };
}








































function construirConectorC1(o) {
  o = o || {};
  var W = num(o.ancho, 20), t = num(o.espesor, 3), R = num(o.radio, 3);
  var SALTO = num(o.salto, 22), LAT = num(o.lateral, 0);




  var SGN = (LAT < 0) ? -1 : 1, LATA = Math.abs(LAT);
  var ALFA = num(o.alfa, 45) * Math.PI / 180;
  var ALFAMAX = num(o.alfaMax, 0) * Math.PI / 180;
  var PA = num(o.pestanaA, 24), PB = num(o.pestanaB, 25);
  var DIA = num(o.agujero, 7), DA = num(o.desdeA, 10), DB = num(o.desdeB, 9);


  var PASO = num(o.paso, 1.0), NZ = Math.max(2, Math.round(num(o.nz, 16)));
  var KA = num(o.curvaA, 0) * Math.PI / 180, KB = num(o.curvaB, 0) * Math.PI / 180;
  var RHO = num(o.radioPlanta, 40), LKA = RHO * Math.abs(KA), LKB = RHO * Math.abs(KB);
  var HGA = num(o.holguraA, 5), HGB = num(o.holguraB, 5);
  if ((KA || KB) && !(RHO > W / 2 + 1))
    throw new Error('la curva de canto pide un radio mayor que media anchura');
  var i, j, k;

  if (!(SALTO > 0)) throw new Error('el conector necesita un salto');
  if (LATA === 0) ALFA = 0;
  else if (!(ALFA > 0))
    throw new Error('sin inclinar la linea de pliegue no hay corrimiento lateral');



























  var TH, L3, AV;

  function rectoDe(th) {
    return (SALTO - 2 * R * (1 - Math.cos(th))) / Math.sin(th);
  }
  function retrocesoDe(th) {
    var l3 = rectoDe(th);
    return (l3 < 0) ? -Infinity
                    : (2 * R * (th - Math.sin(th)) + l3 * (1 - Math.cos(th)));
  }

  var lo = 1e-4, hi;
  if (LATA) {






    var techo = Math.min(80, num(o.pliegueMax, 80)) * Math.PI / 180;
    if (2 * R * (1 - Math.cos(techo)) > SALTO)
      techo = Math.acos(1 - SALTO / (2 * R));
    var RETMAX = retrocesoDe(techo);



    if (RETMAX * Math.sin(ALFA) < LATA && ALFAMAX > ALFA)
      ALFA = Math.min(ALFAMAX, Math.max(ALFA,
                      Math.asin(Math.min(1, LATA / RETMAX))));
    var maxLat = RETMAX * Math.sin(ALFA);
    if (!(maxLat >= LATA)) {



      if (!o.recorta)
        throw new Error('con pliegues a ' + (ALFA * 180 / Math.PI).toFixed(0) +
          ' grados y un salto de ' + SALTO.toFixed(1) + ' no se corre mas de ' +
          maxLat.toFixed(1) + ' de lado, y piden ' + LATA.toFixed(1) +
          ': hace falta mas inclinacion o mas salto');
      LATA = maxLat;
    }
    var RET = LATA / Math.sin(ALFA);
    hi = techo;
    for (k = 0; k < 80; k++) {
      TH = (lo + hi) / 2;
      if (retrocesoDe(TH) < RET) lo = TH; else hi = TH;
    }
    TH = (lo + hi) / 2;
    L3 = rectoDe(TH);
    AV = 2 * R * Math.sin(TH) + L3 * Math.cos(TH);
  } else {


    AV = num(o.avance, 16.1);
    var dr = doblezRecto(SALTO, AV, R);
    TH = dr.TH; L3 = dr.L3;
  }

  if (!(L3 >= 0)) throw new Error('el tramo recto del doblez sale negativo');


  var sube = 2 * R * (1 - Math.cos(TH)) + L3 * Math.sin(TH);
  if (Math.abs(sube - SALTO) > 0.05)
    throw new Error('el doblez solo sube ' + sube.toFixed(1) +
      ' y hacen falta ' + SALTO.toFixed(1) + ': hace falta mas rampa');
  var RETR = 2 * R * (TH - Math.sin(TH)) + L3 * (1 - Math.cos(TH));





  if (SGN < 0) ALFA = -ALFA;                                    
  var cosA = Math.cos(ALFA), senA = Math.sin(ALFA);
  var u1 = PA * cosA;                                                
  var uDoblez = 2 * R * TH + L3;
  var u2 = u1 + uDoblez;                                              
  var LX = u2 / cosA + PB;                                                
  var DES = LX;                                                               





  var margen = (W / 2) * Math.abs(senA) + 1;


  if (KA || KB)
    margen += (LX * Math.max(Math.abs(Math.sin(KA)), Math.abs(Math.sin(KB))) + W)
              * Math.abs(senA) + 1;


















  var xK1 = u1 / cosA - (W / 2) * Math.abs(senA) / cosA - HGA;                   
  var xA0 = xK1 - LKA;                                                         
  var xK2 = (u2 + (W / 2) * Math.abs(senA)) / cosA + HGB;                           
  if (KA && xA0 < 0)
    throw new Error('la curva de canto de la pestana A no cabe: hace falta ' +
      (-xA0).toFixed(1) + ' mas de pestana');
  function planta(x, z) {
    var ze, sg, k, ph, X, Z;
    if (KB && x > xK2) {
      sg = (KB < 0) ? -1 : 1; ze = sg * (z - W / 2); k = Math.abs(KB);
      var s2 = x - xK2;
      if (s2 < LKB) {
        ph = s2 / RHO;
        X = xK2 + (RHO - ze) * Math.sin(ph);
        Z = RHO - (RHO - ze) * Math.cos(ph);
      } else {
        ph = k;
        X = xK2 + (RHO - ze) * Math.sin(k) + (s2 - LKB) * Math.cos(k);
        Z = RHO - (RHO - ze) * Math.cos(k) + (s2 - LKB) * Math.sin(k);
      }
      return [X, W / 2 + sg * Z, sg * ph];
    }
    if (KA && x < xK1) {



      sg = (KA < 0) ? -1 : 1; ze = sg * (z - W / 2); k = Math.abs(KA);
      var sb = xK1 - x;
      if (sb < LKA) {
        ph = sb / RHO;
        X = xK1 - (RHO + ze) * Math.sin(ph);
        Z = (RHO + ze) * Math.cos(ph) - RHO;
      } else {
        ph = k;
        X = xK1 - (RHO + ze) * Math.sin(k) - (sb - LKA) * Math.cos(k);
        Z = (RHO + ze) * Math.cos(k) - RHO - (sb - LKA) * Math.sin(k);
      }
      return [X, W / 2 + sg * Z, sg * ph];
    }
    return [x, z, 0];
  }
  var uMin = -margen, uMax = LX * cosA + margen;

  var perfil = armarPerfil(u1, R, TH, L3, uMin, uMax, PASO);





  var mx = cosA, mz = -senA;                                             
  var ax = senA, az = cosA;                                              

  function sitio(x, z, w) {
    var pl = planta(x, z);
    x = pl[0]; z = pl[1];
    var zp = z - W / 2;
    var u = x * cosA - zp * senA, v = x * senA + zp * cosA;
    var P = perfil(u), ca = Math.cos(P.a), sa = Math.sin(P.a);

    var nmx = -sa * mx, nmy = ca, nmz = -sa * mz;
    return [P.M * mx + v * ax + w * nmx,
            P.N      +          w * nmy,
            P.M * mz + v * az + w * nmz];
  }

  function giroNormal(x, z, n) {
    var pl = planta(x, z);
    x = pl[0]; z = pl[1];

    if (pl[2]) {
      var cp = Math.cos(pl[2]), sp = Math.sin(pl[2]);
      n = [n[0] * cp - n[2] * sp, n[1], n[0] * sp + n[2] * cp];
    }
    var zp = z - W / 2;
    var u = x * cosA - zp * senA;
    var P = perfil(u), ca = Math.cos(P.a), sa = Math.sin(P.a);

    var Mx = ca * mx, My = sa, Mz = ca * mz;                               
    var Nx = -sa * mx, Ny = ca, Nz = -sa * mz;                        
    var ex = cosA * Mx + senA * ax, ey = cosA * My, ez = cosA * Mz + senA * az;
    var gx = -senA * Mx + cosA * ax, gy = -senA * My, gz = -senA * Mz + cosA * az;
    return [n[0] * ex + n[1] * Nx + n[2] * gx,
            n[0] * ey + n[1] * Ny + n[2] * gy,
            n[0] * ez + n[1] * Nz + n[2] * gz];
  }







  var xa = DA, xb = LX - DB, rAg = DIA / 2;


  var CON_B = (o.agujeroB !== false);
  var REB = (o.puntaB && num(o.puntaB.largo, 0) > 0 &&
             num(o.puntaB.ancho, W) < W - 1e-6) ? o.puntaB : null;
  var WB = REB ? num(REB.ancho, W) : W, LB = REB ? num(REB.largo, 0) : 0;
  var DESV = REB ? num(REB.desvio, 0) : 0, xN = LX - LB;
  if (REB && !(WB > 0.5))
    throw new Error('el rebaje de la punta B no deja pletina');
  if (REB && (W / 2 + DESV - WB / 2 < -1e-6 || W / 2 + DESV + WB / 2 > W + 1e-6))
    throw new Error('la punta rebajada se sale de la pletina: desvio ' +
      DESV.toFixed(1) + ' con ancho ' + WB.toFixed(1) + ' en ' + W);




  if (xa * cosA + rAg > u1)
    throw new Error('el agujero de la pestana A cae sobre el pliegue: la ' +
      'pestana tiene que medir al menos ' + (xa + rAg / cosA).toFixed(1));
  if (CON_B && xb * cosA - rAg < u2)
    throw new Error('el agujero de la pestana B cae sobre el pliegue: la ' +
      'pestana tiene que medir al menos ' + (DB + rAg / cosA).toFixed(1));
  if (CON_B && KB && xb - rAg < xK2 + LKB)
    throw new Error('el agujero de la pestana B cae en la curva de canto: ' +
      'hace falta al menos ' + (xK2 + LKB + rAg + DB - LX).toFixed(1) + ' mas');
  if (REB) {


    var finDoblez = (u2 + (W / 2) * Math.abs(senA)) / cosA;
    if (KB) finDoblez = Math.max(finDoblez, xK2 + LKB);
    if (xN < finDoblez)
      throw new Error('el rebaje de la punta B pisa el pliegue: hace falta ' +
        (finDoblez - xN).toFixed(1) + ' mas de pestana');
    if (CON_B && rAg >= WB / 2 - 0.5)
      throw new Error('el agujero de ' + DIA + ' no cabe en la punta rebajada a ' + WB);
  }
  if (KA && xa + rAg > xA0)
    throw new Error('el agujero de la pestana A cae en la curva de canto: ' +
      'hace falta al menos ' + (xa + rAg - xA0).toFixed(1) + ' mas de pestana');
  var banda = Math.max(rAg + 2.5, 8);
  var zonas = [
    {x0: 0,            x1: xa - banda},
    {x0: xa - banda,   x1: xa + banda, ag: xa}
  ];
  if (CON_B) zonas.push({x0: xa + banda,   x1: xb - banda},
                        {x0: xb - banda,   x1: xb + banda, ag: xb},
                        {x0: xb + banda,   x1: LX});
  else       zonas.push({x0: xa + banda,   x1: LX});
  for (i = 0; i < zonas.length; i++)
    if (zonas[i].x1 - zonas[i].x0 < 0.5)
      throw new Error('los agujeros no caben en las pestanas de esta pieza');



  if (REB) {
    var conRebaje = [];
    for (i = 0; i < zonas.length; i++) {
      var zq = zonas[i];
      if (zq.x1 <= xN + 1e-9) { conRebaje.push(zq); continue; }
      if (zq.x0 >= xN - 1e-9) { zq.angosta = true; conRebaje.push(zq); continue; }
      if (zq.ag !== undefined)
        throw new Error('el rebaje de la punta B pisa un agujero');
      if (xN - zq.x0 < 0.5) { xN = zq.x0; zq.angosta = true; conRebaje.push(zq); }
      else if (zq.x1 - xN < 0.5) { xN = zq.x1; conRebaje.push(zq); }
      else {
        conRebaje.push({x0: zq.x0, x1: xN});
        conRebaje.push({x0: xN, x1: zq.x1, angosta: true});
      }
    }
    zonas = conRebaje;
    LB = LX - xN;
  }
  if (rAg >= W / 2 - 0.5)
    throw new Error('el agujero de ' + DIA + ' no cabe en el ancho de ' + W);
















  var zL = [];
  var zB0 = W / 2 + DESV - WB / 2, zB1 = zB0 + WB;





  function meterZ(z) {
    for (var r = 0; r < zL.length; r++) if (Math.abs(zL[r] - z) < 1e-3) return;
    zL.push(z);
  }
  meterZ(0); meterZ(W);
  if (REB) { meterZ(zB0); meterZ(zB1); }
  for (i = 0; i <= NZ; i++) meterZ((W * i) / NZ);
  zL.sort(function (p, q) { return p - q; });






  if (REB) {
    var pasoZ = W / NZ, medios = [], zAnt = null;
    for (i = 0; i < zL.length; i++) {
      if (zL[i] < zB0 - 1e-6 || zL[i] > zB1 + 1e-6) continue;
      if (zAnt !== null && zL[i] - zAnt > pasoZ + 1e-6) {
        var nMed = Math.ceil((zL[i] - zAnt) / pasoZ);
        for (j = 1; j < nMed; j++) medios.push(zAnt + (zL[i] - zAnt) * j / nMed);
      }
      zAnt = zL[i];
    }
    if (medios.length) {
      for (i = 0; i < medios.length; i++) meterZ(medios[i]);
      zL.sort(function (p, q) { return p - q; });
    }
  }


  function iZ(z) {
    var mejor = 0, d = Infinity;
    for (var r = 0; r < zL.length; r++) {
      var e = Math.abs(zL[r] - z);
      if (e < d) { d = e; mejor = r; }
    }
    return mejor;
  }
  var iB0 = REB ? iZ(zB0) : 0, iB1 = REB ? iZ(zB1) : zL.length - 1;
  var zN = REB ? zL.slice(iB0, iB1 + 1) : zL;
  if (REB && zN.length < 2)
    throw new Error('la punta rebajada no coge ni un corte de ancho');

  var xL = [0];
  for (i = 0; i < zonas.length; i++) {
    var zn = zonas[i], nX = Math.max(1, Math.ceil((zn.x1 - zn.x0) / PASO));
    zn.i0 = xL.length - 1;
    for (j = 1; j <= nX; j++) xL.push(zn.x0 + (zn.x1 - zn.x0) * j / nX);
    zn.i1 = xL.length - 1;
  }






  if (o.soloMedidas)
    return {pos: null, nor: null, idx: null, volumen: null,
            ancho: W, espesor: t, radio: R,
            desarrollo: DES, largo: LX,
            alto: SALTO, lateral: RETR * senA, avance: AV, retroceso: RETR,
            pliegue: TH * 180 / Math.PI, alfa: ALFA * 180 / Math.PI,
            curvaA: KA * 180 / Math.PI, curvaB: KB * 180 / Math.PI,
            radioPlanta: RHO, curvas: {a0: xA0, a1: xK1, b0: xK2, b1: xK2 + LKB},
            recto: L3, agujeros: null,
            refB: sitio(xb, W / 2 + DESV, 0),
            puntaB: REB ? {ancho: WB, largo: LB, desvio: DESV, desde: LX - LB} : null,
            conAgujeroB: CON_B, soloMedidas: true};

  var pos = [], nor = [], idx = [];
  function v(x, z, w, n) {
    var p = sitio(x, z, w), g = giroNormal(x, z, n);
    pos.push(p[0], p[1], p[2]); nor.push(g[0], g[1], g[2]);
    return pos.length / 3 - 1;
  }















  var diagBD = senA < 0;
  function rejilla(zn) {


    var zs = zn.angosta ? zN : zL;
    for (var q = zn.i0; q < zn.i1; q++) {
      var xA = xL[q], xB = xL[q + 1];
      for (var r = 0; r + 1 < zs.length; r++) {
        var z0 = zs[r], z1 = zs[r + 1];
        var a1 = v(xA, z0, t / 2, [0, 1, 0]), b1 = v(xB, z0, t / 2, [0, 1, 0]);
        var c1 = v(xB, z1, t / 2, [0, 1, 0]), d1 = v(xA, z1, t / 2, [0, 1, 0]);
        if (diagBD) idx.push(a1, d1, b1, b1, d1, c1);
        else        idx.push(a1, c1, b1, a1, d1, c1);
        var a2 = v(xA, z0, -t / 2, [0, -1, 0]), b2 = v(xB, z0, -t / 2, [0, -1, 0]);
        var c2 = v(xB, z1, -t / 2, [0, -1, 0]), d2 = v(xA, z1, -t / 2, [0, -1, 0]);
        if (diagBD) idx.push(a2, b2, d2, b2, c2, d2);
        else        idx.push(a2, b2, c2, a2, c2, d2);
      }
    }
  }






  var agujeros = [];
  function conAgujero(zn) {
    var xc = zn.ag, zc = W / 2, b = [], s, k2;


    var zs = zn.angosta ? zN : zL;
    var nx = zn.i1 - zn.i0, nz = zs.length - 1;
    for (s = 0; s < nx; s++)  b.push([xL[zn.i0 + s], zs[0]]);
    for (s = 0; s < nz; s++)  b.push([xL[zn.i1], zs[s]]);
    for (s = nx; s > 0; s--)  b.push([xL[zn.i0 + s], zs[nz]]);
    for (s = nz; s > 0; s--)  b.push([xL[zn.i0], zs[s]]);
    var n = b.length;
    var th = b.map(function (q) { return Math.atan2(q[1] - zc, q[0] - xc); });





    var lejos = 0;
    for (s = 0; s < n; s++)
      lejos = Math.max(lejos, Math.hypot(b[s][0] - (xc + rAg * Math.cos(th[s])),
                                         b[s][1] - (zc + rAg * Math.sin(th[s]))));
    var NA = Math.max(1, Math.ceil(lejos / PASO)), ll, ff;

    for (var cara = 0; cara < 2; cara++) {
      var w = cara ? -t / 2 : t / 2, nn = [0, cara ? -1 : 1, 0];
      var capas = [];
      for (ll = 0; ll <= NA; ll++) {
        ff = ll / NA;
        var fila = [];
        for (s = 0; s < n; s++) {
          var cx2 = xc + rAg * Math.cos(th[s]), cz2 = zc + rAg * Math.sin(th[s]);
          fila.push(v(b[s][0] + (cx2 - b[s][0]) * ff,
                      b[s][1] + (cz2 - b[s][1]) * ff, w, nn));
        }
        capas.push(fila);
      }
      for (ll = 0; ll < NA; ll++) {
        var iR = capas[ll], iC = capas[ll + 1];
        for (s = 0; s < n; s++) {
          k2 = (s + 1) % n;
          if (!cara) idx.push(iR[s], iC[k2], iR[k2], iR[s], iC[s], iC[k2]);
          else       idx.push(iR[s], iR[k2], iC[k2], iR[s], iC[k2], iC[s]);
        }
      }
    }



    var A = [], B = [];
    for (s = 0; s < n; s++) {
      var px = xc + rAg * Math.cos(th[s]), pz = zc + rAg * Math.sin(th[s]);
      var nw = [-Math.cos(th[s]), 0, -Math.sin(th[s])];
      A.push(v(px, pz, t / 2, nw));
      B.push(v(px, pz, -t / 2, nw));
    }
    for (s = 0; s < n; s++) {
      k2 = (s + 1) % n;
      idx.push(A[s], B[s], B[k2], A[s], B[k2], A[k2]);
    }







    agujeros.push({p: sitio(xc, zc, 0), n: giroNormal(xc, zc, [0, 1, 0]),
                   r: rAg, u: xc, v: zc, desdeExtremo: (zn.ag === xa) ? DA : DB});
  }

  for (i = 0; i < zonas.length; i++) {
    if (zonas[i].ag !== undefined) conAgujero(zonas[i]);
    else rejilla(zonas[i]);
  }


  function canto(z, sig, q0, q1) {
    var nn = [0, 0, sig];
    for (var q = q0; q < q1; q++) {
      var xA = xL[q], xB = xL[q + 1];
      var a = v(xA, z, -t / 2, nn), b = v(xA, z, t / 2, nn);
      var c = v(xB, z, t / 2, nn), d = v(xB, z, -t / 2, nn);
      if (sig > 0) idx.push(a, d, c, a, c, b);
      else         idx.push(a, b, c, a, c, d);
    }
  }

  var iN = xL.length - 1;
  if (REB) {
    var mejorD = Infinity;
    for (i = 0; i < xL.length; i++)
      if (Math.abs(xL[i] - xN) < mejorD) { mejorD = Math.abs(xL[i] - xN); iN = i; }
  }
  canto(W, 1, 0, iN);
  canto(0, -1, 0, iN);
  if (REB) {
    canto(zN[zN.length - 1], 1, iN, xL.length - 1);
    canto(zN[0], -1, iN, xL.length - 1);
  }




  function tapa(x, sig, zs) {
    var nn = [sig, 0, 0];
    for (var r = 0; r + 1 < zs.length; r++) {
      var a = v(x, zs[r], -t / 2, nn), b = v(x, zs[r], t / 2, nn);
      var c = v(x, zs[r + 1], t / 2, nn), d = v(x, zs[r + 1], -t / 2, nn);
      if (sig > 0) idx.push(a, b, c, a, c, d);
      else         idx.push(a, d, c, a, c, b);
    }
  }
  tapa(LX, 1, REB ? zN : zL);
  tapa(0, -1, zL);




  if (REB) {
    if (iB0 > 0)              tapa(xN, 1, zL.slice(0, iB0 + 1));
    if (iB1 < zL.length - 1)  tapa(xN, 1, zL.slice(iB1));
  }





  var vol = 0;
  for (i = 0; i < idx.length; i += 3) {
    var a3 = idx[i] * 3, b3 = idx[i + 1] * 3, c3 = idx[i + 2] * 3;
    vol += (pos[a3] * (pos[b3 + 1] * pos[c3 + 2] - pos[b3 + 2] * pos[c3 + 1])
          - pos[a3 + 1] * (pos[b3] * pos[c3 + 2] - pos[b3 + 2] * pos[c3])
          + pos[a3 + 2] * (pos[b3] * pos[c3 + 1] - pos[b3 + 1] * pos[c3])) / 6;
  }
  var esperado = LX * W * t - (CON_B ? 2 : 1) * Math.PI * rAg * rAg * t
               - (W - WB) * LB * t;
  if (Math.abs(vol - esperado) > esperado * 0.01) {
    var aviso = 'volumen ' + vol.toFixed(1) + ' mm3, esperaba ' +
      esperado.toFixed(1) + ': la malla no esta cerrada o hay caras al reves';


    if (!o.diag) throw new Error(aviso);
    if (typeof console !== 'undefined') console.warn(aviso);
  }

  return {pos: pos, nor: nor, idx: idx, volumen: vol,
          ancho: W, espesor: t, radio: R,
          desarrollo: DES, largo: LX,
          alto: SALTO, lateral: RETR * senA, avance: AV, retroceso: RETR,
          pliegue: TH * 180 / Math.PI, alfa: ALFA * 180 / Math.PI,
          curvaA: KA * 180 / Math.PI, curvaB: KB * 180 / Math.PI,
          radioPlanta: RHO, curvas: {a0: xA0, a1: xK1, b0: xK2, b1: xK2 + LKB},
          recto: L3, agujeros: agujeros,


          refB: sitio(xb, W / 2 + DESV, 0),
          puntaB: REB ? {ancho: WB, largo: LB, desvio: DESV, desde: LX - LB} : null,
          conAgujeroB: CON_B};
}




































function construirConectorPlanta(o) {
  o = o || {};
  var t = num(o.espesor, 3), R = num(o.radio, 3);
  var SALTO = num(o.salto, 22), AV = num(o.avance, 16.1);
  var PASO = num(o.paso, 0.6), NZ = Math.max(2, Math.round(num(o.nz, 20)));
  var tramos = o.tramos || [];
  if (!tramos.length) throw new Error('la silueta no tiene tramos');
  var i, j, k, q;

  var X0 = [], LX = 0;
  for (i = 0; i < tramos.length; i++) {
    var tr = tramos[i];
    if (!(tr.largo > 0) || !(tr.w0 > 0) || !(tr.w1 > 0))
      throw new Error('el tramo ' + (i + 1) + ' de la silueta no tiene medida');
    X0.push(LX); LX += tr.largo;
  }
  X0.push(LX);

  var dr = doblezRecto(SALTO, AV, R), TH = dr.TH, L3 = dr.L3;
  var u1 = num(o.pliegueEn, 20), uDoblez = 2 * R * TH + L3, u2 = u1 + uDoblez;
  if (u2 > LX)
    throw new Error('el doblez acaba en ' + u2.toFixed(1) +
      ' y la pieza mide ' + LX.toFixed(1));
  var perfil = armarPerfil(u1, R, TH, L3, -1, LX + 1, PASO);

  var ag = o.agujero || null, rAg = ag ? ag.diam / 2 : 0;
  if (ag && ag.x + rAg > u1)
    throw new Error('el agujero cae sobre el pliegue');


  function borde(ti, X) {
    var tr = tramos[ti], f = (X - X0[ti]) / tr.largo;
    return {zL: tr.zL0 + (tr.zL1 - tr.zL0) * f, w: tr.w0 + (tr.w1 - tr.w0) * f,
            dL: (tr.zL1 - tr.zL0) / tr.largo,
            dR: ((tr.zL1 + tr.w1) - (tr.zL0 + tr.w0)) / tr.largo};
  }


  function sitio(X, z, w) {
    var P = perfil(X), ca = Math.cos(P.a), sa = Math.sin(P.a);
    return [P.M - w * sa, P.N + w * ca, z];
  }
  function giroNormal(X, n) {
    var P = perfil(X), ca = Math.cos(P.a), sa = Math.sin(P.a);
    return [n[0] * ca - n[1] * sa, n[0] * sa + n[1] * ca, n[2]];
  }

  var pos = [], nor = [], idx = [];
  function v(X, z, w, n) {
    var p = sitio(X, z, w), g = giroNormal(X, n);
    pos.push(p[0], p[1], p[2]); nor.push(g[0], g[1], g[2]);
    return pos.length / 3 - 1;
  }
  function nrm(a) {
    var L = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / L, a[1] / L, a[2] / L];
  }




  function rejilla(ti, xa, xb) {
    var nX = Math.max(1, Math.ceil((xb - xa) / PASO));
    for (q = 0; q < nX; q++) {
      var XA = xa + (xb - xa) * q / nX, XB = xa + (xb - xa) * (q + 1) / nX;
      var bA = borde(ti, XA), bB = borde(ti, XB);
      for (j = 0; j < NZ; j++) {
        var zA0 = bA.zL + bA.w * j / NZ, zA1 = bA.zL + bA.w * (j + 1) / NZ;
        var zB0 = bB.zL + bB.w * j / NZ, zB1 = bB.zL + bB.w * (j + 1) / NZ;
        var a1 = v(XA, zA0, t / 2, [0, 1, 0]), b1 = v(XB, zB0, t / 2, [0, 1, 0]);
        var c1 = v(XB, zB1, t / 2, [0, 1, 0]), d1 = v(XA, zA1, t / 2, [0, 1, 0]);
        idx.push(a1, c1, b1, a1, d1, c1);
        var a2 = v(XA, zA0, -t / 2, [0, -1, 0]), b2 = v(XB, zB0, -t / 2, [0, -1, 0]);
        var c2 = v(XB, zB1, -t / 2, [0, -1, 0]), d2 = v(XA, zA1, -t / 2, [0, -1, 0]);
        idx.push(a2, b2, c2, a2, c2, d2);
      }
    }
  }



  var agujeros = [];
  function conAgujero(ti, xa, xb) {
    var b0 = borde(ti, xa), zA = b0.zL, zB = b0.zL + b0.w;
    var xc = ag.x, zc = ag.z, b = [], s2, k2;
    var nx = Math.max(1, Math.ceil((xb - xa) / PASO));
    var xL = [], zL = [];
    for (s2 = 0; s2 <= nx; s2++) xL.push(xa + (xb - xa) * s2 / nx);
    for (s2 = 0; s2 <= NZ; s2++) zL.push(zA + (zB - zA) * s2 / NZ);
    for (s2 = 0; s2 < nx; s2++)  b.push([xL[s2], zA]);
    for (s2 = 0; s2 < NZ; s2++)  b.push([xb, zL[s2]]);
    for (s2 = nx; s2 > 0; s2--)  b.push([xL[s2], zB]);
    for (s2 = NZ; s2 > 0; s2--)  b.push([xa, zL[s2]]);
    var n = b.length;
    var th = b.map(function (pt) { return Math.atan2(pt[1] - zc, pt[0] - xc); });
    var lejos = 0;
    for (s2 = 0; s2 < n; s2++)
      lejos = Math.max(lejos, Math.hypot(b[s2][0] - (xc + rAg * Math.cos(th[s2])),
                                         b[s2][1] - (zc + rAg * Math.sin(th[s2]))));
    var NA = Math.max(1, Math.ceil(lejos / PASO)), ll, ff;
    for (var cara = 0; cara < 2; cara++) {
      var w = cara ? -t / 2 : t / 2, nn = [0, cara ? -1 : 1, 0];
      var capas = [];
      for (ll = 0; ll <= NA; ll++) {
        ff = ll / NA;
        var fila = [];
        for (s2 = 0; s2 < n; s2++) {
          var cx2 = xc + rAg * Math.cos(th[s2]), cz2 = zc + rAg * Math.sin(th[s2]);
          fila.push(v(b[s2][0] + (cx2 - b[s2][0]) * ff,
                      b[s2][1] + (cz2 - b[s2][1]) * ff, w, nn));
        }
        capas.push(fila);
      }
      for (ll = 0; ll < NA; ll++) {
        var iR = capas[ll], iC = capas[ll + 1];
        for (s2 = 0; s2 < n; s2++) {
          k2 = (s2 + 1) % n;
          if (!cara) idx.push(iR[s2], iC[k2], iR[k2], iR[s2], iC[s2], iC[k2]);
          else       idx.push(iR[s2], iR[k2], iC[k2], iR[s2], iC[k2], iC[s2]);
        }
      }
    }
    var A = [], B = [];
    for (s2 = 0; s2 < n; s2++) {
      var px = xc + rAg * Math.cos(th[s2]), pz = zc + rAg * Math.sin(th[s2]);
      var nw = [-Math.cos(th[s2]), 0, -Math.sin(th[s2])];
      A.push(v(px, pz, t / 2, nw));
      B.push(v(px, pz, -t / 2, nw));
    }
    for (s2 = 0; s2 < n; s2++) {
      k2 = (s2 + 1) % n;
      idx.push(A[s2], B[s2], B[k2], A[s2], B[k2], A[k2]);
    }
    agujeros.push({p: sitio(xc, zc, 0), n: giroNormal(xc, [0, 1, 0]), r: rAg,
                   u: xc, v: zc});
  }


  for (i = 0; i < tramos.length; i++) {
    var xa = X0[i], xb = X0[i + 1], tr2 = tramos[i];
    if (ag && ag.x >= xa && ag.x < xb) {
      if (tr2.w0 !== tr2.w1 || tr2.zL0 !== tr2.zL1)
        throw new Error('el agujero tiene que caer en un tramo rectangular');
      var banda = Math.max(rAg + 2.5, 8);
      if (ag.x - banda < xa || ag.x + banda > xb)
        throw new Error('el agujero queda demasiado cerca del borde de su tramo');
      if (ag.z - rAg <= tr2.zL0 + 0.5 || ag.z + rAg >= tr2.zL0 + tr2.w0 - 0.5)
        throw new Error('el agujero no cabe en el ancho de su tramo');
      if (ag.x - banda > xa + 0.5) rejilla(i, xa, ag.x - banda);
      conAgujero(i, Math.max(xa, ag.x - banda), Math.min(xb, ag.x + banda));
      if (ag.x + banda < xb - 0.5) rejilla(i, ag.x + banda, xb);
    } else rejilla(i, xa, xb);
  }



  function canto(ti, sig) {
    var xa = X0[ti], xb = X0[ti + 1];
    var nX = Math.max(1, Math.ceil((xb - xa) / PASO));
    for (q = 0; q < nX; q++) {
      var XA = xa + (xb - xa) * q / nX, XB = xa + (xb - xa) * (q + 1) / nX;
      var bA = borde(ti, XA), bB = borde(ti, XB);
      var zA = (sig < 0) ? bA.zL : bA.zL + bA.w, zB = (sig < 0) ? bB.zL : bB.zL + bB.w;
      var dz = (sig < 0) ? bA.dL : bA.dR;
      var nn = nrm(sig < 0 ? [dz, 0, -1] : [-dz, 0, 1]);
      var a = v(XA, zA, -t / 2, nn), b = v(XA, zA, t / 2, nn);
      var c = v(XB, zB, t / 2, nn), d = v(XB, zB, -t / 2, nn);
      if (sig > 0) idx.push(a, d, c, a, c, b);
      else         idx.push(a, b, c, a, c, d);
    }
  }
  for (i = 0; i < tramos.length; i++) { canto(i, -1); canto(i, 1); }




  function caraX(X, z0, z1, sig) {
    if (z1 - z0 < 1e-6) return;
    var nn = [sig, 0, 0], nZ = Math.max(1, Math.ceil((z1 - z0) / PASO));
    for (j = 0; j < nZ; j++) {
      var za = z0 + (z1 - z0) * j / nZ, zb = z0 + (z1 - z0) * (j + 1) / nZ;
      var a = v(X, za, -t / 2, nn), b = v(X, za, t / 2, nn);
      var c = v(X, zb, t / 2, nn), d = v(X, zb, -t / 2, nn);
      if (sig > 0) idx.push(a, b, c, a, c, d);
      else         idx.push(a, d, c, a, c, b);
    }
  }
  caraX(0, tramos[0].zL0, tramos[0].zL0 + tramos[0].w0, -1);
  var ult = tramos[tramos.length - 1];
  caraX(LX, ult.zL1, ult.zL1 + ult.w1, 1);
  for (i = 0; i + 1 < tramos.length; i++) {
    var X = X0[i + 1], lo1 = tramos[i].zL1, hi1 = lo1 + tramos[i].w1;
    var lo2 = tramos[i + 1].zL0, hi2 = lo2 + tramos[i + 1].w0;

    if (lo2 > lo1 + 1e-6) caraX(X, lo1, lo2, 1); else if (lo1 > lo2 + 1e-6) caraX(X, lo2, lo1, -1);
    if (hi2 < hi1 - 1e-6) caraX(X, hi2, hi1, 1); else if (hi1 < hi2 - 1e-6) caraX(X, hi1, hi2, -1);
  }


  var vol = 0;
  for (i = 0; i < idx.length; i += 3) {
    var a3 = idx[i] * 3, b3 = idx[i + 1] * 3, c3 = idx[i + 2] * 3;
    vol += (pos[a3] * (pos[b3 + 1] * pos[c3 + 2] - pos[b3 + 2] * pos[c3 + 1])
          - pos[a3 + 1] * (pos[b3] * pos[c3 + 2] - pos[b3 + 2] * pos[c3])
          + pos[a3 + 2] * (pos[b3] * pos[c3 + 1] - pos[b3 + 1] * pos[c3])) / 6;
  }
  var area = 0;
  for (i = 0; i < tramos.length; i++) area += tramos[i].largo * (tramos[i].w0 + tramos[i].w1) / 2;
  var esperado = area * t - Math.PI * rAg * rAg * t;
  if (Math.abs(vol - esperado) > esperado * 0.01) {
    var aviso = 'volumen ' + vol.toFixed(1) + ' mm3, esperaba ' +
      esperado.toFixed(1) + ': la malla no esta cerrada o hay caras al reves';
    if (!o.diag) throw new Error(aviso);
    if (typeof console !== 'undefined') console.warn(aviso);
  }

  return {pos: pos, nor: nor, idx: idx, volumen: vol,
          largo: LX, alto: SALTO, espesor: t,
          pliegue: TH * 180 / Math.PI, recto: L3, doblezHasta: u2,
          agujeros: agujeros,
          punta: sitio(LX, ult.zL1 + ult.w1 / 2, 0)};
}
if (typeof module !== 'undefined' && module.exports)
  module.exports = {construirConectorC1: construirConectorC1,
                    construirConectorPlanta: construirConectorPlanta};
else {
  raiz.construirConectorC1 = construirConectorC1;
  raiz.construirConectorPlanta = construirConectorPlanta;
}

})(typeof globalThis !== 'undefined' ? globalThis : this);
