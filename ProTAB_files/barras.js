















var BAR_FIRST_GAP_PX = 250;                                                    
var BAR_INTER_GAP_PX = 175;                                                    


var BARRA_H = 100;                                                                     
var BARRA_EXT_W = { n: 150, pea: 150, pe: 125 };                                
var BARRA_AIS_LADO = 150, BARRA_PERNO_LADO = 80;                                             
var BARRA_SVG = { n: 'bar_n_20mm', pea: 'bar_pe_20mm', pe: 'bar_pe_20mm' };
var BARRA_CLASE = { n: 'bar-n-seg', pea: 'bar-pea-seg', pe: 'bar-pe-seg' };


function _itmNivelBarraPE(itm) {
  if (!itm) return 1;
  return clasificarNivelBarra(itm.tipo, itm.capacidad).nivel;
}







function _itmsTodosBarra() {
  return (typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []);
}
function _itmsOrdenadosBarraPE() {
  return itmsOrdenadosBarraPE(_itmsTodosBarra());
}
function _itmsParaBarraN() {
  return itmsParaBarraN(_itmsTodosBarra(), window._panelBusbarData || {});
}
function _itmsOrdenadosBarraN() {
  return itmsOrdenadosBarraN(_itmsTodosBarra(), window._panelBusbarData || {});
}
function _igNivelBarraPE() {
  var ig = window._igData;
  if (!ig) return 1;
  return clasificarNivelBarra(ig.tipo, ig.corriente).nivel;
}
function _igConectaABarraN() {
  return igConectaABarraN(window._igData, window._panelBusbarData).conecta;
}
function _igSegmentoAncho() {
  return igSegmentoAncho(window._igData);
}



function _barraTieneNeutro(d) {
  d = d || window._panelBusbarData || {};
  return d.fases === '3F+N' || d.fases === '1F+N';
}


function _hayBarraN(d) {
  var dd = d || window._panelBusbarData || {};

  return dd.barraN !== 'ninguno' && _barraTieneNeutro(dd) && _itmsParaBarraN().length > 0;
}



function _tierraConPE(d) {
  d = d || window._panelBusbarData || {};
  return d.barraTierra === 'pe' || d.barraTierra === 'pe+ais';
}
function _tierraConAislada(d) {
  d = d || window._panelBusbarData || {};
  return d.barraTierra === 'pe+ais' || d.barraTierra === 'ais';
}


function _tierraConfigurada(d) {
  return _tierraConPE(d) || _tierraConAislada(d);
}


function _tierraAisladaAlChasis(d) {
  d = d || window._panelBusbarData || {};
  return d.barraTierra === 'ais' && d.tierraChasis !== false;
}
function _hayBarraPE(d) {
  return _tierraConPE(d);
}




function _hayBarraPEA(d) {
  return _tierraConAislada(d) && (_itmsOrdenadosBarraPE().length > 0 || !!window._igData);
}









var BARRAS_MOVIBLES = ['pe', 'n', 'pea'];

var BARRA_NOMBRE = { pe: 'PE', n: 'N', pea: 'PE aislada' };

function _hayBarra(k, d) {
  return (k === 'pe') ? _hayBarraPE(d) : (k === 'n') ? _hayBarraN(d) : _hayBarraPEA(d);
}
var BARRA_LADO_PARED = 250;                                   






var BARRA_LADO_DEF_MM = { ig: 30, pared: 50, fila: 35 };
function _barraLadoMm(k) {
  var m = (window._BARRAS_LADO_MM || {})[k] || {}, out = {};
  Object.keys(BARRA_LADO_DEF_MM).forEach(function(c) {
    out[c] = (typeof m[c] === 'number') ? m[c] : BARRA_LADO_DEF_MM[c];
  });
  out.techo = (typeof m.techo === 'number') ? m.techo : null;
  return out;
}
function _barraLadoSetMm(k, campo, mm) {
  window._BARRAS_LADO_MM = window._BARRAS_LADO_MM || {};
  window._BARRAS_LADO_MM[k] = window._BARRAS_LADO_MM[k] || {};
  window._BARRAS_LADO_MM[k][campo] = mm;
}
function _barraUbicGuardada(k) {
  return ((window._BARRAS_UBIC || {})[k]) || 'abajo';
}




function _ladoIGOcupado(lado, salvo) {
  void salvo;
  if (typeof _bornerasGrupoDe === 'function' && _bornerasGrupoDe(lado)) return true;
  if (lado === 'ig-der' && typeof _presenciaSecciones === 'function' && _presenciaSecciones().length) return true;
  return false;
}


function _barrasDelLado(lado, ubic) {
  var guardadas = Object.keys(window._BARRAS_UBIC || {});
  var out = guardadas.filter(function(k) { return ubic[k] === lado; });
  BARRAS_MOVIBLES.forEach(function(k) { if (ubic[k] === lado && out.indexOf(k) === -1) out.push(k); });
  return out;
}

function _barraEnFilaPropia(u) {
  return u === 'abajo' || (typeof u === 'string' && u.indexOf('bajo-') === 0);
}


function _barraEsDeFila(u) {
  return typeof u === 'string' && (u.indexOf('junto-') === 0 || u.indexOf('izq-') === 0);
}

function _barraRef(u) {
  if (typeof u !== 'string') return null;
  if (u.indexOf('junto-') === 0) return u.slice(6);
  if (u.indexOf('izq-') === 0) return u.slice(4);
  if (u.indexOf('bajo-') === 0) return u.slice(5);
  return null;
}



function _barrasFilaVisual(h, ubic) {
  return _barrasDelLado('izq-' + h, ubic).concat([h], _barrasDelLado('junto-' + h, ubic));
}





function _barraUbic(k, d, visto) {
  var u = _barraUbicGuardada(k);
  if (u === 'abajo' || !_hayBarra(k, d)) return 'abajo';
  var h = _barraRef(u);
  if (h) {
    visto = visto || {};
    if (visto[k] || h === k || BARRAS_MOVIBLES.indexOf(h) === -1 || !_hayBarra(h, d)) return 'abajo';
    visto[k] = true;
    var uh = _barraUbic(h, d, visto);
    if (_barraEsDeFila(u)) return _barraEnFilaPropia(uh) ? u : 'abajo';
    return (_barraEnFilaPropia(uh) || _barraEsDeFila(uh)) ? u : 'abajo';
  }
  if (!window._igData) return 'abajo';
  return _ladoIGOcupado(u, k) ? 'abajo' : u;
}




function _barrasOrdenFilas(ubic, hay) {
  var orden = ['n', 'pea', 'pe'].filter(function(k) { return hay[k] && ubic[k] === 'abajo'; });
  var pend = Object.keys(window._BARRAS_UBIC || {}).concat(BARRAS_MOVIBLES)
    .filter(function(k, i, a) {
      return a.indexOf(k) === i && hay[k] && typeof ubic[k] === 'string' && ubic[k].indexOf('bajo-') === 0;
    });
  function raiz(b) {
    for (var n = 0; n < 5 && _barraEsDeFila(ubic[b]); n++) b = _barraRef(ubic[b]);
    return b;
  }
  for (var vuelta = 0; pend.length && vuelta < 5; vuelta++) {
    pend = pend.filter(function(k) {
      var i = orden.indexOf(raiz(ubic[k].slice(5)));
      if (i === -1) return true;
      orden.splice(i + 1, 0, k);
      return false;
    });
  }
  return orden.concat(pend);                                               
}


function _barraEnLado(lado) {
  for (var i = 0; i < BARRAS_MOVIBLES.length; i++) {
    if (_barraUbic(BARRAS_MOVIBLES[i]) === lado) return BARRAS_MOVIBLES[i];
  }
  return null;
}

function _barraAbajo(k, d) {
  return _hayBarra(k, d) && _barraEnFilaPropia(_barraUbic(k, d));
}

function _barraIgAnchoPx() {
  var ig = window._igData;
  if (!ig) return 0;
  var p = parseInt(ig.polos, 10) || 3;
  if (ig.tipo === 'riel') return 90 * p;
  return p * ((ig.tipo === 'cm_reg' || parseInt(ig.corriente, 10) >= 125) ? 175 : 125);
}




function _barraPrimeraKey(d) {
  var hay = { n: _hayBarraN(d), pea: _hayBarraPEA(d), pe: _hayBarraPE(d) };
  return _barrasOrdenFilas(_barrasUbicMapa(d), hay)[0] || null;
}

function _barraPrimeraTira() {
  var k = _barraPrimeraKey();
  return (k && typeof _bornerasGrupoDe === 'function') ? _bornerasGrupoDe(k + '-arriba') : null;
}


function _totalConHBarras(d) {
  var sets = buildCmSets(window._itmList || [], !!(d && d.invertirNConectores));
  return getTotalConH((d && d.ciclo) || [], sets.cmConSet, sets.cmRegConSet);
}








function _barrasLayout(d, forzar) {
  d = d || window._panelBusbarData;
  if (!d) return null;


  var ubic = _barrasUbicMapa(d);
  Object.keys(forzar || {}).forEach(function(k) { ubic[k] = forzar[k]; });
  var usarAis4f = _isAis4fDrawing(d);
  var aisNatH = usarAis4f ? 145 : 140;
  var aisW = usarAis4f ? 715 : 650;
  var aisInfY = CV_TOP_INNER + (window._igExtraTop || 0) + aisNatH + _totalConHBarras(d);
  var hay = { n: _hayBarraN(d), pea: _hayBarraPEA(d), pe: _hayBarraPE(d) };


  var orden = _barrasOrdenFilas(ubic, hay);
  var todas = ['n', 'pea', 'pe'].filter(function(k) { return hay[k]; });
  var antes = (typeof _bornExtraAntes === 'function') ? _bornExtraAntes : function() { return 0; };
  var despues = (typeof _bornExtraDespues === 'function') ? _bornExtraDespues : function() { return 0; };

  var base = aisInfY + aisNatH + (BAR_FIRST_GAP_PX || 250);


  var arriba = aisInfY + aisNatH;
  if (typeof _hayDIFsInferiores === 'function' && _hayDIFsInferiores()) {
    arriba = aisInfY + aisNatH + _difInfGapEff() + _getTotalDIFInferiorHeight();
    base = arriba + _difInfNextGapEff();
  }
  var y = {}, cur = 0;
  orden.forEach(function(k, i) {
    if (i === 0) cur = base + antes(k);
    else cur += BARRA_H + (BAR_INTER_GAP_PX || 175) + despues(orden[i - 1]) + antes(k);
    y[k] = cur;
  });




  var itmsPE = _itmsOrdenadosBarraPE(), itmsN = _itmsOrdenadosBarraN();
  var igW = window._igData ? _igSegmentoAncho() : 0;
  var segs = {}, w = {}, x = {}, overhang = 0;
  if (hay.n)   segs.n   = { itms: itmsN,  numMedio: itmsN.length,  numItm: itmsN.length,  ig: _igConectaABarraN() };
  if (hay.pea) segs.pea = { itms: itmsPE, numMedio: itmsPE.length, numItm: itmsPE.length, ig: !!window._igData };
  if (hay.pe) {
    var nm = hay.pea ? 3 : (3 + itmsPE.length);                                                 
    segs.pe = { itms: itmsPE, numMedio: nm, numItm: nm - 3, ig: !!window._igData };
  }
  todas.forEach(function(k) {
    var s = segs[k];
    w[k] = 2 * BARRA_EXT_W[k] + anchoTotalSegmentosBarraR(s.itms, s.numMedio, s.numItm) + (s.ig ? igW : 0);
  });




  var fila = {}, filaDe = {};
  orden.forEach(function(h) {
    var ks = _barrasFilaVisual(h, ubic).filter(function(k) { return hay[k]; });
    ks.forEach(function(k) { filaDe[k] = h; });
    var anchoFila = 0;
    ks.forEach(function(k, i) { anchoFila += w[k] + (i ? _barraLadoMm(k).fila / PX_TO_MM : 0); });
    var cx = (aisW - anchoFila) / 2;
    overhang = Math.max(overhang, -cx);
    ks.forEach(function(k, i) {
      if (i) { cx += _barraLadoMm(k).fila / PX_TO_MM; fila[k] = ks[i - 1]; }
      y[k] = y[h];
      x[k] = cx;
      cx += w[k];
    });
  });











  var aisY = CV_TOP_INNER + (window._igExtraTop || 0);
  var libre = (aisW - _barraIgAnchoPx()) / 2;
  var refIzq = Math.min(0, libre), refDer = aisW - Math.min(0, libre);
  var _ctn = document.getElementById('panel_busbar_container');
  var _igEl = _ctn && _ctn.querySelector('.ig-img');
  if (_igEl && !isNaN(parseFloat(_igEl.style.left))) {
    var _igL = parseFloat(_igEl.style.left), _igR = _igL + (parseFloat(_igEl.style.width) || 0);
    refIzq = Math.min(0, _igL); refDer = Math.max(aisW, _igR);
  }
  var lado = {}, ohLado = { izq: 0, der: 0 }, piso = { izq: 0, der: 0 };



  ['ig-izq', 'ig-der'].forEach(function(ladoK) {
    var izq = (ladoK === 'ig-izq'), s = izq ? 'izq' : 'der';
    var borde = izq ? refIzq : refDer, previa = null;
    _barrasDelLado(ladoK, ubic).forEach(function(k) {
      if (!hay[k]) return;
      var t = (k === 'pe') ? BARRA_H : BARRA_AIS_LADO;                                      
      var mm = _barraLadoMm(k), gap = mm.ig / PX_TO_MM, pared = mm.pared / PX_TO_MM;
      var bx = izq ? (borde - gap - t) : (borde + gap);
      var yTop = (mm.techo !== null) ? (mm.techo / PX_TO_MM - PB_INSET_MM / PX_TO_MM)
                                     : _barraLadoYCentrada(w[k], aisY);
      lado[k] = { lado: ladoK, x: bx, y: yTop, t: t, l: w[k],
                  ref: borde, adentro: previa, pared: pared };
      borde = izq ? bx : bx + t;
      previa = k;
      var oh = izq ? -bx : (bx + t - aisW);
      ohLado[s] = oh;                                                    
      piso[s] = oh + pared;
    });
  });

  var ult = orden[orden.length - 1];
  return { d: d, aisW: aisW, aisNatH: aisNatH, aisInfY: aisInfY, hay: hay, orden: orden,
           ubic: ubic, y: y, x: x, w: w, segs: segs, overhang: overhang,
           lado: lado, ohLado: ohLado, pisoLado: piso, fila: fila, filaDe: filaDe, arriba: arriba,
           bottom: ult ? y[ult] + BARRA_H : null };
}








function _barraLadoYCentrada(l, aisY) {
  var y = aisY - l;                               
  var ig = window._igData;
  if (ig && typeof calcularIGH === 'function') {
    var igH = calcularIGH(ig.tipo, ig.polos, ig.corriente);
    var cIG = aisY - (window.IG_GAP || IG_GAP) - igH / 2;
    y = Math.min(y, cIG - l / 2);
  }
  var techoMin = BARRA_LADO_PARED - PB_INSET_MM / PX_TO_MM;
  return Math.max(techoMin, y);
}






function _barrasLadoAltoReq() {
  var d = window._panelBusbarData;
  if (!d || !window._igData) return 0;
  var req = 0;
  BARRAS_MOVIBLES.forEach(function(k) {
    if (_barraUbic(k, d) === 'abajo') return;
    var L = _barrasLayout(d);
    var techo = _barraLadoMm(k).techo;
    var arriba = (techo !== null) ? techo / PX_TO_MM : BARRA_LADO_PARED;
    if (L && L.lado[k]) req = Math.max(req, L.lado[k].l + arriba - CV_TOP_PX);
  });
  return req;
}



function _crearSegmentoBarraIG(container, curX, barY, barH, svgPrefix, className) {
  var nivel = _igNivelBarraPE();
  var segW = (nivel === 2) ? 100 : 50;
  var suffix = (nivel === 2) ? '_1s4' : '_3s16';
  var seg = _crearImg('assets/panel-busbar/' + svgPrefix + '_sup' + suffix + '.svg',
    curX, barY, segW, barH);
  seg.className = className;
  seg.style.zIndex = '2';
  seg.dataset.nivelPe = String(nivel);
  seg.dataset.segRol = 'ig';
  seg.dataset.igSeg = '1';
  seg.dataset.lado = (nivel === 2) ? 'centro' : 'sup';
  container.appendChild(seg);
  return segW;
}


function _crearSegmentoBarraMedio(container, curX, barY, barH, idx, svgPrefix, className, itm, esAux) {
  var nivel = esAux ? 1 : _itmNivelBarraPE(itm);
  var segW = (nivel === 2) ? 100 : 50;
  var suffix = (nivel === 2) ? '_1s4' : '_3s16';
  var baseSvg = (idx % 2 === 0) ? (svgPrefix + '_sup') : (svgPrefix + '_inf');
  var seg = _crearImg('assets/panel-busbar/' + baseSvg + suffix + '.svg', curX, barY, segW, barH);
  seg.className = className;
  seg.style.zIndex = '2';
  seg.dataset.nivelPe = String(nivel);
  seg.dataset.segRol = esAux ? 'aux' : 'itm';




  seg.dataset.lado = (nivel === 2) ? 'centro' : ((idx % 2 === 0) ? 'sup' : 'inf');
  if (!esAux && itm && itm.rotulo) seg.dataset.itmRotulo = String(itm.rotulo);
  container.appendChild(seg);
  return segW;
}




function _crearExtremoBarra(container, k, x, y, der) {
  var ancho = BARRA_EXT_W[k];
  var svg = (k === 'pe') ? 'bar_pe_20mm_ext_3s16' : (k === 'n' ? 'bar_n_20mm_ext' : 'bar_pe_ais_20mm_ext');
  var ext = _crearImg('assets/panel-busbar/' + svg + '.svg', x, y, ancho, BARRA_H);
  ext.className = BARRA_CLASE[k];
  ext.style.zIndex = '2';
  if (k === 'pe') { ext.dataset.segRol = 'ext'; ext.dataset.lado = 'centro'; }
  if (der) { ext.style.transformOrigin = 'center center'; ext.style.transform = 'rotate(180deg)'; }
  container.appendChild(ext);
  if (k === 'pe') return;
  var ax = x + ancho / 2 - BARRA_AIS_LADO / 2, ay = y + BARRA_H / 2 - BARRA_AIS_LADO / 2;
  var ais = _crearImg('assets/panel-busbar/ais_0.5s400-vf.svg', ax, ay, BARRA_AIS_LADO, BARRA_AIS_LADO);
  ais.className = BARRA_CLASE[k];
  ais.style.zIndex = '1';
  container.appendChild(ais);
  var off = (BARRA_AIS_LADO - BARRA_PERNO_LADO) / 2;
  var perno = _crearImg('assets/panel-busbar/perno_3s4_aran_ac-vf.svg', ax + off, ay + off,
    BARRA_PERNO_LADO, BARRA_PERNO_LADO);
  perno.className = BARRA_CLASE[k];
  perno.style.zIndex = '3';
  container.appendChild(perno);
}



function _dibujarBarra(container, L, k, x0, y0) {
  var s = L.segs[k], cls = BARRA_CLASE[k], svg = BARRA_SVG[k];
  var y = (typeof y0 === 'number') ? y0 : L.y[k];
  var curX = (typeof x0 === 'number') ? x0 : L.x[k];
  _crearExtremoBarra(container, k, curX, y, false);
  curX += BARRA_EXT_W[k];
  if (s.ig) curX += _crearSegmentoBarraIG(container, curX, y, BARRA_H, svg, cls);
  var off = s.ig ? 1 : 0;                                                     
  for (var m = 0; m < s.numMedio; m++) {
    var esAux = (m >= s.numItm);
    curX += _crearSegmentoBarraMedio(container, curX, y, BARRA_H, m + off, svg, cls,
      esAux ? null : s.itms[m], esAux);
  }
  _crearExtremoBarra(container, k, curX, y, true);
}




function _barrasFijarAlto(L) {
  if (!L || L.bottom === null) return;
  var container = document.getElementById('panel_busbar_container');
  var marco = document.getElementById('marco_gabinete');
  if (!container || !marco) return;
  var pbInset = PB_INSET_MM / PX_TO_MM;
  var botGap = GAB_BOT_GAP_PX || 350;
  container.style.height = (L.bottom + botGap - pbInset) + 'px';
  var nuevoGabH = L.bottom + pbInset + botGap;
  var nuevoGabW = parseFloat(marco.style.width) || (GAB_DEFAULT_MM / PX_TO_MM);
  if (nuevoGabH > GAB_DEFAULT_MM / PX_TO_MM) redimensionarGabinete(nuevoGabW, nuevoGabH);
}

function _redibujarBarra(k) {
  var d = window._panelBusbarData;
  if (!d || !window._gabineteData) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;



  if (BARRAS_MOVIBLES.indexOf(k) !== -1 && _barraUbicGuardada(k) !== 'abajo' && _barraUbic(k, d) === 'abajo' &&
      _hayBarra(k, d)) {
    var g = _barraUbicGuardada(k), gRef = _barraRef(g);
    delete window._BARRAS_UBIC[k];
    if (typeof _avisoFlotante === 'function') {
      _avisoFlotante('La barra ' + BARRA_NOMBRE[k] + ' volvió abajo: ' +
        (gRef ? 'la barra ' + (BARRA_NOMBRE[gRef] || '') + ' ya no está abajo.'
              : 'ese lado del IG ya no está libre.'));
    }
  }
  var L = _barrasLayout(d);
  if (!L) return;


  var fila = [k];
  if (!L.lado[k] && L.filaDe[k]) {
    fila = Object.keys(L.filaDe).filter(function(o) { return L.filaDe[o] === L.filaDe[k]; });
  }
  fila.forEach(function(b) {
    container.querySelectorAll('.' + BARRA_CLASE[b] + ', .barra-lado-ig[data-barra="' + b + '"], ' +
      '.barra-tri[data-barra="' + b + '"]').forEach(function(el) { el.remove(); });
    if (!L.hay[b]) return;
    if (L.lado[b]) _dibujarBarraDePie(container, L, b);
    else _dibujarBarra(container, L, b);
    if (BARRAS_MOVIBLES.indexOf(b) !== -1) _barraTriangulo(container, L, b);
  });
  if (fila.indexOf(L.orden[L.orden.length - 1]) !== -1) _barrasFijarAlto(L);
}




function _dibujarBarraDePie(container, L, k) {
  var c = L.lado[k];
  var H = c.t, W = c.l;
  var wrap = document.createElement('div');
  wrap.className = 'barra-lado-ig';
  wrap.dataset.barra = k;
  wrap.style.cssText = 'position:absolute;left:' + (c.x + c.t / 2 - W / 2) + 'px;top:' +
    (c.y + c.l / 2 - H / 2) + 'px;width:' + W + 'px;height:' + H + 'px;' +
    'transform:rotate(90deg);transform-origin:center center;z-index:2;pointer-events:none;';
  container.appendChild(wrap);
  _dibujarBarra(wrap, L, k, 0, (H - BARRA_H) / 2);
}







function _barraOpcionesMenu(k) {
  var out = [];
  if (_barraLugaresDisponibles(k).length) out.push('lugar');
  if (_barraLadoLista(k).length > 1) out.push('mover');
  out.push('eliminar');                                      
  return out;
}
function _barraTriangulo(container, L, k) {
  if (!_barraOpcionesMenu(k).length) return;
  var tri = document.createElement('img');
  tri.src = 'assets/panel-busbar/boton_trian_verde.svg';
  tri.className = 'barra-tri';
  tri.dataset.barra = k;
  if (L.lado[k]) {

    var cx = L.lado[k].x + L.lado[k].t / 2, top = L.lado[k].y + L.lado[k].l + 10;
    tri.style.cssText = 'position:absolute;left:' + (cx - 22.5) + 'px;top:' + (top - 22.5) + 'px;' +
      'width:45px;height:90px;transform:rotate(-90deg);z-index:7;cursor:pointer;';
  } else {






    var ym = L.y[k] + BARRA_H / 2;
    tri.style.cssText = 'position:absolute;left:' + (L.x[k] + L.w[k] + 8) + 'px;top:' + (ym - 45) + 'px;' +
      'width:45px;height:90px;transform:scaleX(-1);z-index:7;cursor:pointer;';
  }
  tri.addEventListener('click', function(e) { e.stopPropagation(); onBarraTriangleClick(this); });
  container.appendChild(tri);
}




function _cotasBarrasLado(marco, ct, cLeft, gabW) {
  var L = _barrasLayout();
  if (!L) return;


  Object.keys(L.fila).forEach(function(k) {
    var p = L.fila[k];
    var x1 = cLeft + L.x[p] + L.w[p], x2 = cLeft + L.x[k];
    if (x2 - x1 <= 1) return;
    var e33 = _cotaH(marco, 'cota-cv', x1, ct + L.y[k] - 45, x2 - x1, _mmTxt(x2 - x1),
      'CV-33', function(mm) { _barraLadoSetMm(k, 'fila', mm); });
    var s33 = e33 && e33.querySelector('.cota-mi-val');
    if (s33) s33.dataset.cvLado = BARRA_NOMBRE[p] + ' ' + BARRA_NOMBRE[k];
  });
  var ctr = document.getElementById('panel_busbar_container');
  var ig = ctr && ctr.querySelector('.ig-img');
  if (!ig) return;
  var igL = parseFloat(ig.style.left), igW = parseFloat(ig.style.width) || 0;
  var igT = parseFloat(ig.style.top), igH = parseFloat(ig.style.height) || 0;
  Object.keys(L.lado).forEach(function(k) {
    var c = L.lado[k], izq = (c.lado === 'ig-izq');

    var yc = igT + igH / 2;
    if (yc < c.y || yc > c.y + c.l) yc = c.y + c.l / 2;
    var y = ct + yc;

    var lbl = (izq ? 'izq' : 'der') + ' ' + k.toUpperCase();
    var masAfuera = !Object.keys(L.lado).some(function(o) { return L.lado[o].adentro === k; });
    var desdeIG, hastaIG, desdeP, hastaP;


    var ad = c.adentro ? L.lado[c.adentro] : null;
    if (izq) {
      desdeP = 0; hastaP = cLeft + c.x;
      desdeIG = cLeft + c.x + c.t; hastaIG = cLeft + (ad ? ad.x : igL);
    } else {
      desdeIG = cLeft + (ad ? ad.x + ad.t : igL + igW); hastaIG = cLeft + c.x;
      desdeP = cLeft + c.x + c.t; hastaP = gabW;
    }




    var difRef = ad ? 0 : (izq ? (igL - c.ref) : (c.ref - (igL + igW)));
    if (hastaIG - desdeIG > 1) {
      var e31 = _cotaH(marco, 'cota-cv', desdeIG, y, hastaIG - desdeIG, _mmTxt(hastaIG - desdeIG),
        'CV-31', function(mm) { _barraLadoSetMm(k, 'ig', Math.max(10, mm - difRef * PX_TO_MM)); });
      var s31 = e31 && e31.querySelector('.cota-mi-val');
      if (s31) s31.dataset.cvLado = lbl;
    }



    var hTecho = ct + c.y;
    if (hTecho > 1) {
      var e34 = _cotaV(marco, 'cota-cv', cLeft + c.x + c.t / 2, 0, hTecho, _mmTxt(hTecho),
        'CV-34', function(mm) {
          _barraLadoSetMm(k, 'techo', mm);
          if (typeof _recalcIgExtraTop === 'function') _recalcIgExtraTop();
        });
      var s34 = e34 && e34.querySelector('.cota-mi-val');
      if (s34) s34.dataset.cvLado = lbl;
    }
    if (masAfuera && hastaP - desdeP > 1) {
      var e32 = _cotaH(marco, 'cota-cv', desdeP, y, hastaP - desdeP, _mmTxt(hastaP - desdeP),
        'CV-32', function(mm) { _barraLadoSetMm(k, 'pared', mm); });
      var s32 = e32 && e32.querySelector('.cota-mi-val');
      if (s32) s32.dataset.cvLado = lbl;
    }
  });
}

function onBarraTriangleClick(triImg) {
  var k = triImg.dataset.barra;
  var menu = document.createElement('div');
  menu.id = 'tri_context_menu';
  menu.className = 'dif-context-menu';
  var ops = _barraOpcionesMenu(k);

  if (ops.indexOf('lugar') !== -1) {
    var bU = document.createElement('button');
    bU.className = 'dif-context-btn';
    bU.textContent = 'Ubicación libre';
    bU.addEventListener('click', function() { menu.remove(); _barraElegirLugar(k); });
    menu.appendChild(bU);
  }


  if (ops.indexOf('mover') !== -1) {
    var bM = document.createElement('button');
    bM.className = 'dif-context-btn';
    bM.textContent = 'Mover';
    bM.addEventListener('click', function() { menu.remove(); moverBarraLado(k); });
    menu.appendChild(bM);
  }
  if (ops.indexOf('eliminar') !== -1) {
    var bD = document.createElement('button');
    bD.className = 'dif-context-btn';
    bD.textContent = { pe: 'Eliminar barra de tierra', n: 'Eliminar barra de neutro',
                       pea: 'Eliminar barra de tierra aislada' }[k];
    bD.style.color = '#ff6b6b';
    bD.addEventListener('click', function() { menu.remove(); _barraEliminar(k); });
    menu.appendChild(bD);
  }
  _abrirMenuTriangulo(menu, triImg);
}






function _barrasUbicMapa(d) {
  return { n: _barraUbic('n', d), pea: _barraUbic('pea', d), pe: _barraUbic('pe', d) };
}



function _barraLadoLista(k) {
  var ubic = _barrasUbicMapa(), u = ubic[k];
  if (u === 'ig-izq' || u === 'ig-der') {
    var l = _barrasDelLado(u, ubic);

    return (u === 'ig-izq') ? l.slice().reverse() : l;
  }
  var h = _barraEsDeFila(u) ? _barraRef(u) : (_barraEnFilaPropia(u) ? k : null);
  if (!h) return [];
  var lista = _barrasFilaVisual(h, ubic).filter(function(b) { return _hayBarra(b); });
  return lista.length > 1 ? lista : [];
}




function _barrasAplicarOrden(m, visual) {
  var U = window._BARRAS_UBIC || {}, nuevo = {};
  if (m.tipo === 'lado') {
    var lista = (m.lado === 'ig-izq') ? visual.slice().reverse() : visual, puestas = false;
    Object.keys(U).forEach(function(b) {
      if (U[b] === m.lado) {
        if (!puestas) { lista.forEach(function(x) { nuevo[x] = m.lado; }); puestas = true; }
        return;
      }
      nuevo[b] = U[b];
    });
    if (!puestas) lista.forEach(function(x) { nuevo[x] = m.lado; });
  } else {
    var h = m.ancla, ih = visual.indexOf(h);
    Object.keys(U).forEach(function(b) { if (b === h || visual.indexOf(b) === -1) nuevo[b] = U[b]; });
    visual.slice(0, ih).forEach(function(b) { nuevo[b] = 'izq-' + h; });
    visual.slice(ih + 1).forEach(function(b) { nuevo[b] = 'junto-' + h; });
  }
  window._BARRAS_UBIC = nuevo;
}
var _moverBarra = null;                                                       
function moverBarraLado(k) {
  if (_moverBarra) _moverBarraTerminar(false);
  var lista = _barraLadoLista(k);
  if (lista.length < 2) return;
  var u = _barraUbic(k);
  var lado = (u === 'ig-izq' || u === 'ig-der');
  _moverBarra = { k: k, tipo: lado ? 'lado' : 'fila', lado: lado ? u : null,
                  ancla: lado ? null : (_barraEsDeFila(u) ? _barraRef(u) : k),
                  antes: JSON.stringify(window._BARRAS_UBIC || {}) };
  document.addEventListener('keydown', _moverBarraTecla);
  _moverBarraPintar();
}
function _moverBarraTecla(e) {
  if (!_moverBarra) return;
  if (e.key === 'ArrowLeft')  { e.preventDefault(); _moverBarraPaso(-1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); _moverBarraPaso(1); }
  else if (e.key === 'Escape') _moverBarraTerminar(true);
  else if (e.key === 'Enter') _moverBarraTerminar(false);
}


function _moverBarraDestino(dir) {
  var m = _moverBarra;
  if (!m) return -1;
  var lista = _barraLadoLista(m.k), i = lista.indexOf(m.k), j = i + dir;
  return (i === -1 || j < 0 || j >= lista.length) ? -1 : j;
}
function _moverBarraPaso(dir) {
  var j = _moverBarraDestino(dir);
  if (j === -1) return;
  var m = _moverBarra, lista = _barraLadoLista(m.k), i = lista.indexOf(m.k);
  lista.splice(i, 1);
  lista.splice(j, 0, m.k);
  _barrasAplicarOrden(m, lista);
  _conReglas(function() { dibujarPanelBusbar(); });
}
function _moverBarraTerminar(cancelar) {
  var m = _moverBarra;
  if (!m) return;
  _moverBarra = null;
  document.removeEventListener('keydown', _moverBarraTecla);
  document.querySelectorAll('.mover-barra-ctrl').forEach(function(el) { el.remove(); });
  if (cancelar && JSON.stringify(window._BARRAS_UBIC || {}) !== m.antes) {
    window._BARRAS_UBIC = JSON.parse(m.antes);
    _conReglas(function() { dibujarPanelBusbar(); });
  }
  if (typeof guardarSesion === 'function') guardarSesion();
}



function _moverBarraPintar(container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container || !_moverBarra) return;
  container.querySelectorAll('.mover-barra-ctrl').forEach(function(el) { el.remove(); });
  var L = _barrasLayout(), k = _moverBarra.k, c = null;
  if (L && L.lado[k]) c = { x: L.lado[k].x, y: L.lado[k].y, w: L.lado[k].t, h: L.lado[k].l };
  else if (L && L.x[k] !== undefined) c = { x: L.x[k], y: L.y[k], w: L.w[k], h: BARRA_H };
  if (!c || _barraLadoLista(k).length < 2) { _moverBarraTerminar(false); return; }
  function ctrl(txt, cls, l, t, w, h, fn, titulo) {
    var e = document.createElement('div');
    e.className = 'mover-inf-ctrl mover-barra-ctrl ' + cls;
    e.textContent = txt;
    e.title = titulo;
    e.style.cssText = 'position:absolute;left:' + l + 'px;top:' + t + 'px;width:' + w +
      'px;height:' + h + 'px;line-height:' + h + 'px;';
    if (fn) e.addEventListener('click', function(ev) { ev.stopPropagation(); fn(); });
    container.appendChild(e);
  }
  ctrl('', 'mover-inf-marco', c.x - 10, c.y - 10, c.w + 20, c.h + 20, null, '');
  var A = 90, ym = c.y + c.h / 2;
  if (_moverBarraDestino(-1) !== -1) ctrl('\u25C0', 'mover-inf-flecha', c.x - A / 2, ym - A, A, 2 * A,
    function() { _moverBarraPaso(-1); }, 'Mover a la izquierda');
  if (_moverBarraDestino(1) !== -1) ctrl('\u25B6', 'mover-inf-flecha', c.x + c.w - A / 2, ym - A, A, 2 * A,
    function() { _moverBarraPaso(1); }, 'Mover a la derecha');
  var B = 130, cx = c.x + c.w / 2;
  ctrl('\u2713', 'mover-inf-ok', cx - B - 10, c.y - B - 40, B, B,
    function() { _moverBarraTerminar(false); }, 'Listo');
  ctrl('\u2715', 'mover-inf-cancelar', cx + 10, c.y - B - 40, B, B,
    function() { _moverBarraTerminar(true); }, "Volver");
}




function _barrasClave(u, hay) {
  return _barrasOrdenFilas(u, hay).join() + '|' +
    Object.keys(u).filter(function(b) { return _barraEsDeFila(u[b]); })
      .map(function(b) { return b + '>' + u[b]; }).sort().join();
}




function _barrasUbicCon(u, k, lugar) {
  var u2 = {};
  Object.keys(u).forEach(function(b) { u2[b] = u[b]; });
  u2[k] = lugar;
  var ref = _barraRef(lugar);
  if (ref && _barraRef(u2[ref]) === k) u2[ref] = 'abajo';
  return u2;
}



function _barrasNormalizarUbic(d) {
  var U = window._BARRAS_UBIC || {};
  var hay = { n: _hayBarraN(d), pea: _hayBarraPEA(d), pe: _hayBarraPE(d) };
  Object.keys(U).forEach(function(b) {
    if (typeof U[b] !== 'string' || U[b].indexOf('bajo-') !== 0) return;
    var con = _barrasClave(_barrasUbicMapa(d), hay), v = U[b];
    delete U[b];
    if (_barrasClave(_barrasUbicMapa(d), hay) !== con) U[b] = v;
  });
}





function _barraLugaresDisponibles(k) {
  var out = [], d = window._panelBusbarData;
  var actual = _barraUbic(k, d);
  var ubicAct = _barrasUbicMapa(d);
  var hayAct = { n: _hayBarraN(d), pea: _hayBarraPEA(d), pe: _hayBarraPE(d) };






  var vistos = {};
  if (_barraEnFilaPropia(actual)) vistos[_barrasClave(ubicAct, hayAct)] = true;
  function noCambia(l) {
    var c = _barrasClave(_barrasUbicCon(ubicAct, k, l), hayAct);
    if (vistos[c]) return true;
    vistos[c] = true;
    return false;
  }
  if (actual !== 'abajo' && !noCambia('abajo')) out.push('abajo');
  BARRAS_MOVIBLES.forEach(function(h) {
    if (h !== k && _barraAbajo(h, d) && actual !== 'junto-' + h) out.push('junto-' + h);
  });


  BARRAS_MOVIBLES.forEach(function(h) {
    if (h === k || !_hayBarra(h, d) || actual === 'bajo-' + h) return;
    var uh = ubicAct[h];
    if (!_barraEnFilaPropia(uh) && !_barraEsDeFila(uh)) return;
    if (!noCambia('bajo-' + h)) out.push('bajo-' + h);
  });
  if (window._igData) {
    ['ig-izq', 'ig-der'].forEach(function(l) {
      if (l !== actual && !_ladoIGOcupado(l, k)) out.push(l);
    });
  }
  return out;
}
var _barraEligiendo = null;
function _barraElegirLugar(k) {
  _barraCancelarEleccion();
  var lugares = _barraLugaresDisponibles(k);
  if (!lugares.length) {
    if (typeof _avisoFlotante === 'function') {
      _avisoFlotante('No hay otro lugar libre para la barra.');
    }
    return;
  }
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;



  var Lact = _barrasLayout();
  var contH = parseFloat(container.style.height) || 0;
  function _filaActual(h) {
    return Object.keys(Lact.filaDe).filter(function(b) { return b !== k && Lact.filaDe[b] === h; });
  }
  lugares.forEach(function(l) {
    var f = {}; f[k] = l;


    var ref = _barraRef(l);
    if (ref && _barraRef((window._BARRAS_UBIC || {})[ref]) === k) f[ref] = 'abajo';
    var L = _barrasLayout(null, f);
    if (!L || !Lact) return;
    var m = document.createElement('div');
    var dePie = !!L.lado[k];
    m.className = 'born-sitio barra-sitio' + (dePie ? ' born-sitio-vert' : '');
    m.textContent = '+';
    m.title = (l === 'abajo') ? 'Abajo del panel'
      : (l.indexOf('junto-') === 0) ? 'A la derecha de la barra ' + BARRA_NOMBRE[l.slice(6)]
      : (l.indexOf('bajo-') === 0) ? 'Debajo de la barra ' + BARRA_NOMBRE[l.slice(5)]
      : (l === 'ig-izq' ? 'A la izquierda del IG' : 'A la derecha del IG');
    var cx, cy, w, h;
    if (l.indexOf('junto-') === 0) {

      var fh = _filaActual(l.slice(6)), der = -Infinity;
      fh.forEach(function(b) { der = Math.max(der, Lact.x[b] + Lact.w[b]); });
      var x0 = der + _barraLadoMm(k).fila / PX_TO_MM;


      var marco = document.getElementById('marco_gabinete');
      var xMax = (parseFloat(marco && marco.style.width) || Infinity) -
                 (parseFloat(container.style.left) || 0) - 30;
      w = Math.max(130, Math.min(L.w[k], xMax - x0)); h = 130;
      cx = x0 + w / 2;
      cy = Lact.y[l.slice(6)] + BARRA_H / 2;
    } else if (!dePie) {





      var raizAct = function(b) { return Lact.filaDe[b] || null; };
      var i = L.orden.indexOf(k), prev = null, next = null;
      for (var a = i - 1; a >= 0 && !prev; a--) prev = raizAct(L.orden[a]);
      for (var b = i + 1; b < L.orden.length && !next; b++) next = raizAct(L.orden[b]);
      var top = prev ? Lact.y[prev] + BARRA_H : Lact.arriba;
      var bot = next ? Lact.y[next] : (contH ? contH : top + 200);
      h = Math.max(40, Math.min(130, bot - top - 20));
      cy = (top + bot) / 2;
      w = L.w[k];
      cx = Lact.aisW / 2;
    } else {
      cx = L.lado[k].x + L.lado[k].t / 2; cy = L.lado[k].y + L.lado[k].l / 2;
      w = Math.max(L.lado[k].t, 130); h = L.lado[k].l;
    }
    m.style.left = cx + 'px'; m.style.top = cy + 'px';
    m.style.width = w + 'px'; m.style.height = h + 'px';
    m.addEventListener('click', function(e) {
      e.stopPropagation();
      _barraCancelarEleccion();
      _barraMoverA(k, l);
    });
    container.appendChild(m);
  });
  _barraEligiendo = k;
  document.body.classList.add('born-eligiendo');
  setTimeout(function() {
    document.addEventListener('click', _barraCancelarEleccion);
    document.addEventListener('keydown', _barraEscEleccion);
  }, 10);
}
function _barraEscEleccion(e) { if (e.key === 'Escape') _barraCancelarEleccion(); }
function _barraCancelarEleccion() {
  document.querySelectorAll('.barra-sitio').forEach(function(m) { m.remove(); });
  if (_barraEligiendo !== null) document.body.classList.remove('born-eligiendo');
  _barraEligiendo = null;
  document.removeEventListener('click', _barraCancelarEleccion);
  document.removeEventListener('keydown', _barraEscEleccion);
}
function _barraMoverA(k, lugar) {


  var _mm = (window._BARRAS_LADO_MM || {})[k];
  if (_mm && lugar !== _barraUbicGuardada(k)) delete _mm.techo;
  var U = _barrasUbicCon(window._BARRAS_UBIC || {}, k, lugar);
  Object.keys(U).forEach(function(b) { if (U[b] === 'abajo') delete U[b]; });                          
  window._BARRAS_UBIC = U;
  _barrasNormalizarUbic();
  if (typeof _recalcIgExtraTop === 'function') _recalcIgExtraTop();
  _conReglas(function() {
    dibujarPanelBusbar();
    if (typeof guardarSesion === 'function') guardarSesion();
  });
}





function _barraEliminar(k) {
  if (typeof abrirModalPB !== 'function' || typeof confirmarModalPB !== 'function') return;


  if (!_hayBarra(k)) return;
  if (window._BARRAS_UBIC) delete window._BARRAS_UBIC[k];
  if (k === 'pe' && window._BARRAS_UBIC) delete window._BARRAS_UBIC.pea;
  abrirModalPB();
  var sel = document.getElementById(k === 'n' ? 'modalPB_barraN' : 'modalPB_barraTierra');

  if (sel) sel.value = (k === 'pea' && _tierraConPE()) ? 'pe' : 'ninguno';
  confirmarModalPB();
}


function redibujarBarraN()        { _redibujarBarra('n'); }
function redibujarBarraPEAislada() { _redibujarBarra('pea'); }
function redibujarBarraPE()       { _redibujarBarra('pe'); }


function redibujarBarras() {
  redibujarBarraN();
  redibujarBarraPEAislada();
  redibujarBarraPE();
}
