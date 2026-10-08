























(function (raiz) {
  'use strict';


  var PLANO_PUNTA = 20;
  var RADIO_PLANTA = 40;































  function acodado(cfg, lat, altura, reb, ancho, soloMedidas, encajar, dib) {



    if (dib && typeof dib.y2 === 'number' && typeof dib.desdeArriba === 'number')
      return enS(cfg, lat, altura, reb, ancho, soloMedidas, dib);
    var construirConectorC1 = cfg.construirConectorC1, C1 = cfg.C1;
    var RADIO_C1 = C1.radio, saltoIG = cfg.salto;
    var W = ancho || C1.ancho;
    var sg = (lat < 0) ? -1 : 1, LAT = Math.abs(lat), RHO = RADIO_PLANTA;









    var ABIERTO = 1e3;                                                                         


    var recta = LAT < 0.05;
    var resolver = function (alfa) {
      var com = {ancho: W, espesor: C1.espesor, salto: saltoIG,
                 radio: RADIO_C1, lateral: recta ? 0 : sg * ABIERTO, alfa: alfa, alfaMax: alfa,
                 pliegueMax: 70, recorta: true, radioPlanta: RHO,
                 agujero: C1.agujero, desdeA: C1.desdeA, desdeB: C1.desdeB,
                 puntaB: reb || null, agujeroB: !reb};
      var t = construirConectorC1(Object.assign({pestanaA: 40, pestanaB: 40, soloMedidas: true}, com));
      var latF = Math.abs(t.lateral);                                                         
      if (latF > LAT + 0.02) return null;                                            
      var ca = Math.cos(t.alfa * Math.PI / 180);
      var comido = t.retroceso * ca;
      var sesgo = (W / 2) * Math.abs(Math.tan(t.alfa * Math.PI / 180));
      var doblez = t.desarrollo - 80;                                        


      var PA = PLANO_PUNTA + sesgo;




      var sK = (PA - C1.desdeA) + doblez + sesgo + 5 - comido;


      var corre = function (g) {
        return sK * Math.sin(g) + latF * Math.cos(g) + RHO * (1 - Math.cos(g));
      };
      var g = 0, k, lo, hi;
      if (LAT > latF + 0.02) {
        lo = 0; hi = 75 * Math.PI / 180;
        if (corre(hi) < LAT) return null;                                         
        for (k = 0; k < 60; k++) {
          g = (lo + hi) / 2;
          if (corre(g) < LAT) lo = g; else hi = g;
        }
        g = (lo + hi) / 2;
      }



      var subeFijo = sK * Math.cos(g) - latF * Math.sin(g) + RHO * Math.sin(g);


      var restoMin = Math.max(PLANO_PUNTA - C1.desdeB, C1.agujero / 2 + 1,
                              reb ? reb.largo - C1.desdeB : 0);
      var resto = Math.max(altura - subeFijo, restoMin);
      return {com: com, latF: latF, g: g, sesgo: sesgo, PA: PA, LK: RHO * g,
              resto: resto, alturaMin: subeFijo + resto};
    };









    var r = null;
    for (var alfa = 45; alfa >= 1; alfa--) {
      var q = resolver(alfa);
      if (!q) continue;
      r = q;
      if (!encajar || q.alturaMin <= altura + 0.05) break;
    }
    if (!r) throw new Error('ni girada 75 grados llega a ' + LAT.toFixed(1) + ' de lado');
    var PB = r.sesgo + 5 + r.LK + r.resto + C1.desdeB;
    var m = construirConectorC1(Object.assign(
      {pestanaA: r.PA, pestanaB: PB, curvaB: -sg * r.g * 180 / Math.PI,
       soloMedidas: !!soloMedidas}, r.com));
    m.latF = sg * r.latF;
    m.giro = sg * r.g;                                                          
    m.alturaMin = r.alturaMin;                                            
    m.corrio = (r.g > 0) ? LAT : r.latF;
    return m;
  }

































  var HOLGURA_MIN = 5;                                                       
  var CANTO_MAX = 60 * Math.PI / 180;                                         
  function enS(cfg, lat, altura, reb, ancho, soloMedidas, dib) {
    var construirConectorC1 = cfg.construirConectorC1, C1 = cfg.C1;
    var W = ancho || C1.ancho, RHO = RADIO_PLANTA;
    var sg = (lat < 0) ? -1 : 1, LAT = Math.abs(lat);
    var recta = LAT < 0.05;
    var base = {ancho: W, espesor: C1.espesor, salto: cfg.salto, radio: C1.radio,
                lateral: 0, radioPlanta: RHO, agujero: C1.agujero,
                desdeA: C1.desdeA, desdeB: C1.desdeB,
                puntaB: reb || null, agujeroB: !reb};
    if (typeof C1.avance === 'number') base.avance = C1.avance;


    var t0 = construirConectorC1(Object.assign({pestanaA: 40, pestanaB: 40, soloMedidas: true}, base));
    var AV = t0.avance;
    var Mmin = AV + 2 * HOLGURA_MIN;




    var y4 = Math.max(0, dib.y4 || 0);
    var tabA = C1.desdeA + dib.desdeArriba + y4;
    var HS = Math.max(0, dib.y2 - y4);




    var puntaMin = Math.max(PLANO_PUNTA, C1.agujero / 2 + 1 + C1.desdeB,
                            reb ? reb.largo + 1 : 0);

    var th = 0, M, k, lo, hi;
    if (recta) {
      M = Math.max(HS, Mmin);
    } else {



      var F = function (a) { return HS * Math.tan(a) - 2 * RHO * (1 / Math.cos(a) - 1); };
      var tope = (HS < 2 * RHO) ? Math.asin(HS / (2 * RHO)) : CANTO_MAX;
      tope = Math.min(tope, CANTO_MAX);
      M = -1;
      if (F(tope) >= LAT) {
        lo = 0; hi = tope;
        for (k = 0; k < 60; k++) { th = (lo + hi) / 2; if (F(th) < LAT) lo = th; else hi = th; }
        th = (lo + hi) / 2;
        M = (HS - 2 * RHO * Math.sin(th)) / Math.cos(th);
      }




      if (M < Mmin) {
        M = Mmin;
        var G = function (a) { return 2 * RHO * (1 - Math.cos(a)) + M * Math.sin(a); };
        if (G(CANTO_MAX) < LAT)
          throw new Error('ni con curvas de canto a 60 grados llega a ' + LAT.toFixed(1) + ' de lado');
        lo = 0; hi = CANTO_MAX;
        for (k = 0; k < 60; k++) { th = (lo + hi) / 2; if (G(th) < LAT) lo = th; else hi = th; }
        th = (lo + hi) / 2;
      }
    }
    var HSreal = 2 * RHO * Math.sin(th) + M * Math.cos(th);
    var holg = (M - AV) / 2;


    var tabB = Math.max(altura + C1.desdeB - dib.desdeArriba - y4 - HSreal, puntaMin);
    var LK = RHO * th;
    var m = construirConectorC1(Object.assign(
      {pestanaA: tabA + LK + holg, pestanaB: holg + LK + tabB,
       curvaA: -sg * th * 180 / Math.PI, curvaB: -sg * th * 180 / Math.PI,
       holguraA: holg, holguraB: holg,
       soloMedidas: !!soloMedidas}, base));
    m.latF = 0;                                                                          
    m.giro = sg * th;                                                                                         
    m.canto = th * 180 / Math.PI;                                                               
    m.enS = true;



    m.alturaMin = dib.desdeArriba + y4 + HSreal + puntaMin - C1.desdeB;
    m.subeS = HSreal;                                                                                 
    m.corrio = LAT;
    return m;
  }

















  function plan(cfg) {
    var C1 = cfg.C1, fases = cfg.fases || [], n = fases.length;
    var alIG = cfg.alIG, filasIG = cfg.filasIG;
    var delDibujo = !!(alIG && fases.every(function (f) {
      return typeof alIG[f] === 'number';
    }));
    var entreObj = (typeof cfg.hastaIG === 'number')
                 ? cfg.hastaIG + cfg.desdeArriba : C1.entre;



    var encajar = (typeof cfg.hastaIG === 'number');
    var paso = cfg.paso || 0;

    var lista = fases.map(function (f, i) {
      var fi = filasIG && filasIG[f];
      var lat = delDibujo ? (fi ? fi.dx2 : alIG[f]) : (((n - 1) / 2 - i) * paso);
      var ancho = (fi && fi.w2 > 0.5) ? fi.w2 : C1.ancho;



      var reb = (fi && fi.w1 > 0 && fi.w1 < ancho - 0.05)
        ? {ancho: fi.w1, largo: fi.h1, desvio: fi.dx1 - fi.dx2} : null;





      var dib = (delDibujo && fi && typeof fi.y2 === 'number' && isFinite(fi.y2) &&
                 typeof cfg.desdeArriba === 'number')
        ? {desdeArriba: cfg.desdeArriba, y2: fi.y2,
           y4: (typeof fi.y4 === 'number' && isFinite(fi.y4)) ? fi.y4 : 0}
        : null;
      return {fase: f, lat: lat, ancho: ancho, reb: reb, dib: dib};
    });



    var entreUsado = entreObj;
    for (var i = 0; i < lista.length; i++) {
      var q = lista[i];
      if (!q.dib && Math.abs(q.lat) < 0.05 && !q.reb && Math.abs(entreObj - C1.entre) < 0.1 &&
          Math.abs(cfg.salto - C1.salto) < 0.05) continue;
      try {
        entreUsado = Math.max(entreUsado,
          acodado(cfg, q.lat, entreObj, q.reb, q.ancho, true, encajar, q.dib).alturaMin);
      } catch (e) {                                                   }
    }
    return {delDibujo: delDibujo, entreObj: entreObj, entreUsado: entreUsado,
            encajar: encajar, fases: lista};
  }





  function esCatalogo(cfg, q, entreUsado) {
    var C1 = cfg.C1;
    if (q.dib) return false;                                                         
    return Math.abs(q.lat) < 0.05 && !q.reb &&
           Math.abs(q.ancho - C1.ancho) < 0.05 &&
           Math.abs(entreUsado - C1.entre) < 0.1 &&
           Math.abs(cfg.salto - C1.salto) < 0.05;
  }

  var api = {acodado: acodado, plan: plan, esCatalogo: esCatalogo,
             PLANO_PUNTA: PLANO_PUNTA, RADIO_PLANTA: RADIO_PLANTA};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.c1AlIG = api;

})(typeof globalThis !== 'undefined' ? globalThis : this);
