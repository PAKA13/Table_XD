



















var _MANDIL_OFFSETS_MM = {
  riel:       { inner: 19, outer: 19 },
  cm_fijo_m1: { inner: 38, outer: 38 },
  cm_fijo_m2: { inner: 50, outer: 50 },
  cm_reg:     { inner: 36, outer: 48 },
  dif:        { inner: 19, outer: 19 },


  timer:      { inner: 19, outer: 19 }
};


var _MANDIL_ROTULO_W_MM = 30;
var _MANDIL_ROTULO_H_MM = 15;
var _MANDIL_ROTULO_GAP_MM = 5;







var _MANDIL_MARCO_TOP_MM = null;               
var _MANDIL_MARCO_LEFT_MM = null;                                        
var _MANDIL_MARCO_ALTO_MM = null;                      
var _MANDIL_MARCO_ANCHO_MM = null;             
var _MANDIL_TOP_IZQ_MM = null;                 
var _MANDIL_ALTO_IZQ_MM = null;                
var _MANDIL_TOP_DER_MM = null;                 
var _MANDIL_ALTO_DER_MM = null;                
var _MANDIL_CHAPA_X_MM = 25;                   
var _MANDIL_CHAPA_Y_MM = null;                                                  
var _MANDIL_CHAPA_Y2_MM = null;                                          



var _MANDIL_CHAPA_Y_CANT = null;


var _MANDIL_CHAPA_DIAM_MM = 29;
var _MANDIL_CHAPA_ALTO_MM = 43;


var _MANDIL_MIN_PX = 25;             

var _MANDIL_INSET_MM = 30;                                                   





var _MANDIL_VAR_KEYS = [
  '_MANDIL_MARCO_TOP_MM', '_MANDIL_MARCO_LEFT_MM',
  '_MANDIL_MARCO_ALTO_MM', '_MANDIL_MARCO_ANCHO_MM',
  '_MANDIL_TOP_IZQ_MM', '_MANDIL_ALTO_IZQ_MM',
  '_MANDIL_TOP_DER_MM', '_MANDIL_ALTO_DER_MM',
  '_MANDIL_CHAPA_X_MM', '_MANDIL_CHAPA_Y_MM', '_MANDIL_CHAPA_Y2_MM',
  '_MANDIL_CHAPA_Y_CANT',
  '_MANDIL_ROTULO_W_MM', '_MANDIL_ROTULO_H_MM', '_MANDIL_ROTULO_GAP_MM'
];
var _MANDIL_VAR_DEFAULTS = {
  _MANDIL_CHAPA_X_MM: 25,
  _MANDIL_ROTULO_W_MM: 30, _MANDIL_ROTULO_H_MM: 15, _MANDIL_ROTULO_GAP_MM: 5
};

function _mandilVars() {
  var o = {};
  _MANDIL_VAR_KEYS.forEach(function(k) {
    o[k] = (typeof window[k] === 'number') ? window[k] : null;
  });
  return o;
}

function _mandilVarsRestore(o) {
  o = o || {};
  _MANDIL_VAR_KEYS.forEach(function(k) {
    var v = o[k];
    if (typeof v !== 'number') v = (k in _MANDIL_VAR_DEFAULTS) ? _MANDIL_VAR_DEFAULTS[k] : null;
    window[k] = v;
  });
}





function _mandilRecortarTramo(ini, largo, total) {
  var min = _MANDIL_MIN_PX;
  ini = Math.max(0, Math.min(ini, total - min));
  largo = Math.max(min, Math.min(largo, total - ini));
  return { ini: ini, largo: largo };
}




function _mandilMarcoBoundsDe(gabW, gabH) {
  if (!(gabW > 0) || !(gabH > 0)) return null;
  var inset = _MANDIL_INSET_MM / PX_TO_MM;              
  var top  = (typeof _MANDIL_MARCO_TOP_MM  === 'number') ? _MANDIL_MARCO_TOP_MM / PX_TO_MM  : inset;
  var left = (typeof _MANDIL_MARCO_LEFT_MM === 'number') ? _MANDIL_MARCO_LEFT_MM / PX_TO_MM : inset;
  var w = (typeof _MANDIL_MARCO_ANCHO_MM === 'number') ? _MANDIL_MARCO_ANCHO_MM / PX_TO_MM : (gabW - 2 * inset);
  var h = (typeof _MANDIL_MARCO_ALTO_MM  === 'number') ? _MANDIL_MARCO_ALTO_MM  / PX_TO_MM : (gabH - 2 * inset);
  if (w <= 0 || h <= 0) return null;
  var v = _mandilRecortarTramo(top, h, gabH);
  var hz = _mandilRecortarTramo(left, w, gabW);
  return { top: v.ini, left: hz.ini, width: hz.largo, height: v.largo };
}

function _mandilMarcoBounds() {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return null;
  return _mandilMarcoBoundsDe(parseFloat(marco.style.width), parseFloat(marco.style.height));
}



function _mandilColBounds(side) {
  var b = _mandilMarcoBounds();
  if (!b) return null;
  var marco = document.getElementById('marco_gabinete');
  var gabH = parseFloat(marco.style.height);
  var topMm  = (side === 'izq') ? _MANDIL_TOP_IZQ_MM  : _MANDIL_TOP_DER_MM;
  var altoMm = (side === 'izq') ? _MANDIL_ALTO_IZQ_MM : _MANDIL_ALTO_DER_MM;
  var t = _mandilRecortarTramo(
    (typeof topMm  === 'number') ? topMm  / PX_TO_MM : b.top,
    (typeof altoMm === 'number') ? altoMm / PX_TO_MM : b.height, gabH);
  return { top: t.ini, height: t.largo };
}



function _mandilSubmarcoMm() {
  var d = window._gabineteData || {};
  return ((d.tipo === 'empotrado') ? 5 : 12) + 9;
}



function _colorMandil() {
  var d = window._gabineteData || {};
  return d.colorMandil || window._colorMandilSel || '#D7D7D7';
}



function _mandilSolidificarColumnas() {
  var b = _mandilMarcoBounds();
  if (!b) return;
  if (typeof _MANDIL_TOP_IZQ_MM  !== 'number') _MANDIL_TOP_IZQ_MM  = b.top * PX_TO_MM;
  if (typeof _MANDIL_ALTO_IZQ_MM !== 'number') _MANDIL_ALTO_IZQ_MM = b.height * PX_TO_MM;
  if (typeof _MANDIL_TOP_DER_MM  !== 'number') _MANDIL_TOP_DER_MM  = b.top * PX_TO_MM;
  if (typeof _MANDIL_ALTO_DER_MM !== 'number') _MANDIL_ALTO_DER_MM = b.height * PX_TO_MM;
}


function _mandilChapaInfo() {
  var b = _mandilMarcoBounds();
  if (!b) return null;
  var savedQ = (window._gabineteData && window._gabineteData.cerradura &&
    window._gabineteData.cerradura.mandil) ? window._gabineteData.cerradura.mandil.cantidad : null;
  var cant = (typeof _cantidadChapaMandil === 'function') ? _cantidadChapaMandil(savedQ) : 1;
  var altoMm = b.height * PX_TO_MM, anchoMm = b.width * PX_TO_MM;

  var vigentes = !(typeof _MANDIL_CHAPA_Y_CANT === 'number' && _MANDIL_CHAPA_Y_CANT !== cant);
  var y1 = (vigentes && typeof _MANDIL_CHAPA_Y_MM === 'number') ? _MANDIL_CHAPA_Y_MM
         : ((cant >= 2) ? 100 : altoMm / 2);
  var y2 = (vigentes && typeof _MANDIL_CHAPA_Y2_MM === 'number') ? _MANDIL_CHAPA_Y2_MM : (altoMm - 100);


  var hD = _MANDIL_CHAPA_DIAM_MM / 2, hA = _MANDIL_CHAPA_ALTO_MM / 2;
  function rango(v, a, z) { return (z < a) ? (a + z) / 2 : Math.max(a, Math.min(z, v)); }
  var xMm = rango(_MANDIL_CHAPA_X_MM, hD, anchoMm - hD);
  y1 = rango(y1, hA, altoMm - hA);
  if (cant >= 2) {
    var sep = _MANDIL_CHAPA_ALTO_MM + 5;
    y2 = rango(y2, hA, altoMm - hA);
    if (y2 < y1 + sep) {
      y2 = Math.min(altoMm - hA, y1 + sep);
      if (y2 < y1 + sep) y1 = Math.max(hA, y2 - sep);
    }
  }
  return { cant: cant, xMm: xMm, y1Mm: y1, y2Mm: y2, altoMm: altoMm, b: b };
}


function _mandilTipoEfectivo(itm) {
  if (itm.tipo === 'cm_fijo') {
    return parseInt(itm.capacidad, 10) >= 125 ? 'cm_fijo_m2' : 'cm_fijo_m1';
  }
  if (itm.tipo === 'cm_reg') return 'cm_reg';
  if (itm.tipo === 'riel') return 'riel';
  if (itm.tipo === 'reserva') {
    var cmRegSet = _buildCmRegConSet();
    var cmSet = _buildCmConSet();
    var idx = parseInt(itm.conIndex, 10);
    if (cmRegSet[idx]) return 'cm_reg';
    if (cmSet[idx]) return 'cm_fijo_m1';
    return 'riel';
  }
  return 'riel';
}

function _mandilTipoEfectivoIG(igD) {
  if (igD.tipo === 'cm_fijo') {
    return parseInt(igD.corriente, 10) >= 125 ? 'cm_fijo_m2' : 'cm_fijo_m1';
  }
  if (igD.tipo === 'cm_reg') return 'cm_reg';
  return 'riel';
}


function _addMandilOverlayRect(container, leftPx, topPx, widthPx, heightPx, kind, label, itmId) {

  var marco = document.getElementById('marco_gabinete');
  var parent = marco || container;
  var cTop = parseFloat(container.style.top) || 0;
  var cLeft = parseFloat(container.style.left) || 0;
  var x0 = cLeft + leftPx, y0 = cTop + topPx;
  var x1 = x0 + widthPx, y1 = y0 + heightPx;
  if (!(isFinite(x0) && isFinite(y0) && isFinite(x1) && isFinite(y1))) return;


  var b = _mandilMarcoBounds();
  if (b) {
    x0 = Math.max(x0, b.left); y0 = Math.max(y0, b.top);
    x1 = Math.min(x1, b.left + b.width); y1 = Math.min(y1, b.top + b.height);
  }
  if (x1 - x0 < 1 || y1 - y0 < 1) return;
  var rect = document.createElement('div');
  rect.className = 'mandil-overlay';
  rect.dataset.kind = kind || 'itm';
  if (itmId) rect.dataset.itmId = itmId;


  if (label) rect.dataset.reserva = '1';
  rect.style.cssText = 'position:absolute;pointer-events:none;box-sizing:border-box;' +
    'left:' + x0 + 'px;top:' + y0 + 'px;' +
    'width:' + (x1 - x0) + 'px;height:' + (y1 - y0) + 'px;' +
    'border:2px solid #000000;background:transparent;z-index:11;';

  if (label) {



    var badge = document.createElement('div');
    badge.className = 'mandil-reserva-label';
    badge.textContent = label;
    badge.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'color:#000;font-family:Segoe UI,Arial,sans-serif;font-size:42px;font-weight:700;' +
      'line-height:1;text-align:center;white-space:nowrap;pointer-events:none;';
    rect.appendChild(badge);
  }
  parent.appendChild(rect);
}


function _addMandilRectForItm(itm, container) {
  var tipoEf = _mandilTipoEfectivo(itm);
  var offs = _MANDIL_OFFSETS_MM[tipoEf];
  if (!offs) return;

  var conX = parseFloat(itm.conX);
  var conW = parseFloat(itm.conW);
  var conH = parseFloat(itm.conH);



  if (!isFinite(conX) || !isFinite(conW) || !isFinite(conH)) return;

  var itmVisW, itmVisH;
  if (tipoEf === 'cm_reg') {
    itmVisW = 161 / PX_TO_MM;
    itmVisH = (itm.polos * 35) / PX_TO_MM;
  } else if (tipoEf === 'cm_fijo_m2') {
    itmVisW = 165 / PX_TO_MM;
    itmVisH = (itm.polos * 35) / PX_TO_MM;
  } else if (tipoEf === 'cm_fijo_m1') {
    itmVisW = 130 / PX_TO_MM;
    itmVisH = (itm.polos * 25) / PX_TO_MM;
  } else {
    var scaleF = conH / 90;
    itmVisW = 425 * scaleF;
    itmVisH = 90 * itm.polos * scaleF;
  }

  var itmY = _itmBodyYReal(itm, conH);
  var itmX = (itm.side === 'left') ? (conX - itmVisW) : (conX + conW);
  if (!isFinite(itmY) || !isFinite(itmVisH)) return;

  var innerPx = offs.inner / PX_TO_MM;
  var outerPx = offs.outer / PX_TO_MM;
  var rectLeft, rectWidth;
  if (itm.side === 'left') {
    rectLeft = itmX + outerPx;
    rectWidth = itmVisW - outerPx - innerPx;
  } else {
    rectLeft = itmX + innerPx;
    rectWidth = itmVisW - innerPx - outerPx;
  }
  if (rectWidth <= 0) return;

  var label = (itm.tipo === 'reserva') ? 'Reserva' : null;
  _addMandilOverlayRect(container, rectLeft, itmY, rectWidth, itmVisH, tipoEf, label, itm.id);


  if (window.__mandilCutoutAccum && itm.tipo !== 'reserva') {
    var cTop = parseFloat(container.style.top) || 0;
    var cLeft = parseFloat(container.style.left) || 0;
    window.__mandilCutoutAccum.push({
      x: cLeft + rectLeft, y: cTop + itmY, w: rectWidth, h: itmVisH
    });
  }
}


function _addMandilRectForDif(itm, container) {
  if (!itm.dif) return;


  var domDif = container.querySelector('.dif-img:not(.dif-tri)[data-dif-itm-id="' + itm.id + '"]');
  if (!domDif) return;

  var sLeft = parseFloat(domDif.style.left);
  var sTop = parseFloat(domDif.style.top);
  var sWidth = parseFloat(domDif.style.width);
  var sHeight = parseFloat(domDif.style.height);
  if (isNaN(sLeft) || isNaN(sTop)) return;

  var offs = _MANDIL_OFFSETS_MM.dif;
  var innerPx = offs.inner / PX_TO_MM;
  var outerPx = offs.outer / PX_TO_MM;
  var rectLeft, rectTop, rectWidth, rectHeight;

  if (itm.dif.ubicacion === 'lateral') {

    var rotated = (itm.dif.tipo !== 'reserva');
    var visLeft, visTop, visW, visH;
    if (rotated) {
      var cx = sLeft + sWidth / 2;
      var cy = sTop + sHeight / 2;
      visW = sHeight;
      visH = sWidth;
      visLeft = cx - visW / 2;
      visTop = cy - visH / 2;
    } else {
      visLeft = sLeft; visTop = sTop; visW = sWidth; visH = sHeight;
    }
    if (itm.side === 'left') {
      rectLeft = visLeft + outerPx;
      rectWidth = visW - outerPx - innerPx;
    } else {
      rectLeft = visLeft + innerPx;
      rectWidth = visW - innerPx - outerPx;
    }
    rectTop = visTop;
    rectHeight = visH;
  } else if (itm.dif.ubicacion === 'inferior') {

    rectLeft = sLeft;
    rectWidth = sWidth;
    rectTop = sTop + innerPx;
    rectHeight = sHeight - innerPx - outerPx;
  } else {
    return;
  }

  if (rectWidth <= 0 || rectHeight <= 0) return;
  var label = (itm.dif.tipo === 'reserva') ? 'Reserva' : null;
  _addMandilOverlayRect(container, rectLeft, rectTop, rectWidth, rectHeight, 'dif', label, itm.id);

  if (window.__mandilCutoutAccum && itm.dif.tipo !== 'reserva') {
    var cTopD = parseFloat(container.style.top) || 0;
    var cLeftD = parseFloat(container.style.left) || 0;
    window.__mandilCutoutAccum.push({
      x: cLeftD + rectLeft, y: cTopD + rectTop, w: rectWidth, h: rectHeight
    });
  }
}







function _addMandilRectForGrupo(gr, container) {
  if (!gr || gr.clase !== 'timer') return;
  var w = container.querySelector('.bornera-wrap[data-born-grupo-id="' + gr.id + '"]');
  if (!w) return;
  var cx = parseFloat(w.dataset.visCx), cy = parseFloat(w.dataset.visCy);
  var rotado = !!w.dataset.rotado;






  var tw = parseFloat(w.dataset.tiraW), th = parseFloat(w.dataset.tiraH);
  var vw = rotado ? th : tw, vh = rotado ? tw : th;
  if (isNaN(cx) || isNaN(cy) || isNaN(vw) || isNaN(vh)) return;

  var offs = _MANDIL_OFFSETS_MM.timer;
  var innerPx = offs.inner / PX_TO_MM;
  var outerPx = offs.outer / PX_TO_MM;

  var rectLeft, rectTop, rectWidth, rectHeight;
  if (rotado) {
    rectLeft = cx - vw / 2 + outerPx;
    rectWidth = vw - outerPx - innerPx;
    rectTop = cy - vh / 2;
    rectHeight = vh;
  } else {
    rectLeft = cx - vw / 2;
    rectWidth = vw;
    rectTop = cy - vh / 2 + innerPx;
    rectHeight = vh - innerPx - outerPx;
  }
  if (rectWidth <= 0 || rectHeight <= 0) return;



  var _resvT = (typeof _timerComprado === 'function') && !_timerComprado(gr);
  _addMandilOverlayRect(container, rectLeft, rectTop, rectWidth, rectHeight, 'timer', _resvT ? 'Reserva' : null, gr.id);
  if (_resvT) return;

  var cTopG = parseFloat(container.style.top) || 0;
  var cLeftG = parseFloat(container.style.left) || 0;
  if (window.__mandilCutoutAccum) {
    window.__mandilCutoutAccum.push({
      x: cLeftG + rectLeft, y: cTopG + rectTop, w: rectWidth, h: rectHeight
    });
  }

  if (window.__mandilTimerCutouts) {
    window.__mandilTimerCutouts[gr.id] = {
      x: cLeftG + rectLeft, y: cTopG + rectTop, w: rectWidth, h: rectHeight
    };
  }
}


function _addMandilRectForIg(container) {
  var igD = window._igData;
  if (!igD) return;
  var igEl = container.querySelector('.ig-img');
  if (!igEl) return;

  var igX = parseFloat(igEl.style.left);
  var igY = parseFloat(igEl.style.top);
  var igW = parseFloat(igEl.style.width);
  var igH = parseFloat(igEl.style.height);
  if (isNaN(igX) || isNaN(igY) || isNaN(igW) || isNaN(igH)) return;

  var offs = _MANDIL_OFFSETS_MM[_mandilTipoEfectivoIG(igD)];
  if (!offs) return;

  var rectTop = igY + (offs.inner / PX_TO_MM);
  var rectHeight = igH - (offs.inner / PX_TO_MM) - (offs.outer / PX_TO_MM);
  if (rectHeight <= 0) return;

  _addMandilOverlayRect(container, igX, rectTop, igW, rectHeight, 'ig', null, '_ig');

  var cTop = parseFloat(container.style.top) || 0;
  var cLeft = parseFloat(container.style.left) || 0;
  window.__mandilIgCutout = { x: cLeft + igX, y: cTop + rectTop, w: igW, h: rectHeight };
  if (window.__mandilCutoutAccum) {
    window.__mandilCutoutAccum.push({ x: cLeft + igX, y: cTop + rectTop, w: igW, h: rectHeight });
  }
}







function _mandilUnionCalados(rects, b) {
  var R = [];
  rects.forEach(function(r) {
    var x0 = Math.max(r.x, b.left), y0 = Math.max(r.y, b.top);
    var x1 = Math.min(r.x + r.w, b.left + b.width), y1 = Math.min(r.y + r.h, b.top + b.height);
    if (isFinite(x0) && isFinite(y0) && isFinite(x1) && isFinite(y1) &&
        x1 - x0 >= 1 && y1 - y0 >= 1) R.push([x0, y0, x1, y1]);
  });
  var xs = [];
  R.forEach(function(r) { xs.push(r[0], r[2]); });
  xs.sort(function(a, c) { return a - c; });
  xs = xs.filter(function(x, i) { return i === 0 || x !== xs[i - 1]; });
  var out = [], abiertos = {};
  function cerrar(k, xFin) {
    var a = abiertos[k];
    out.push({ x: a.x, y: a.y0, w: xFin - a.x, h: a.y1 - a.y0 });
    delete abiertos[k];
  }
  for (var i = 0; i < xs.length - 1; i++) {
    var xa = xs[i], xb = xs[i + 1], mid = (xa + xb) / 2;
    var iv = R.filter(function(r) { return r[0] < mid && r[2] > mid; })
      .map(function(r) { return [r[1], r[3]]; })
      .sort(function(a, c) { return a[0] - c[0]; });
    var m = [];
    iv.forEach(function(v) {
      if (m.length && v[0] <= m[m.length - 1][1]) m[m.length - 1][1] = Math.max(m[m.length - 1][1], v[1]);
      else m.push([v[0], v[1]]);
    });
    var vivos = {};
    m.forEach(function(v) {
      var k = v[0] + '_' + v[1];
      vivos[k] = true;
      if (!abiertos[k]) abiertos[k] = { x: xa, y0: v[0], y1: v[1] };
    });
    Object.keys(abiertos).forEach(function(k) { if (!vivos[k]) cerrar(k, xa); });
  }
  Object.keys(abiertos).forEach(function(k) { cerrar(k, xs[xs.length - 1]); });
  return out;
}


function _renderMandilFillSvg(cutouts) {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  var fillColor = _colorMandil();

  var bounds = _mandilMarcoBounds();
  if (!bounds) return;
  var gabW = parseFloat(marco.style.width);
  var gabH = parseFloat(marco.style.height);
  if (isNaN(gabW) || isNaN(gabH)) return;

  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'mandil-fill-svg');
  svg.setAttribute('width', gabW);
  svg.setAttribute('height', gabH);
  svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:6;';

  var pathData = 'M' + bounds.left + ',' + bounds.top +
    ' h' + bounds.width + ' v' + bounds.height + ' h' + (-bounds.width) + ' Z';
  var calados = _mandilUnionCalados(cutouts, bounds);


  window.__mandilCalados = calados;
  for (var i = 0; i < calados.length; i++) {
    var c = calados[i];
    pathData += ' M' + c.x + ',' + c.y + ' h' + c.w + ' v' + c.h + ' h' + (-c.w) + ' Z';
  }
  var path = document.createElementNS(ns, 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('fill', fillColor);
  path.setAttribute('fill-rule', 'evenodd');
  svg.appendChild(path);
  marco.appendChild(svg);
}


function _renderMandilPlacaOverlay() {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  var bounds = _mandilMarcoBounds();
  if (!bounds) return;
  var rect = document.createElement('div');
  rect.className = 'mandil-placa-overlay';
  rect.style.cssText = 'position:absolute;pointer-events:none;box-sizing:border-box;' +
    'top:' + bounds.top + 'px;left:' + bounds.left + 'px;' +
    'width:' + bounds.width + 'px;height:' + bounds.height + 'px;' +
    'border:3px solid #000000;background:transparent;z-index:12;';
  marco.appendChild(rect);
}


function _renderMandilExtra(side) {
  var marco = document.getElementById('marco_gabinete');
  var d = window._gabineteData;
  if (!marco || !d) return;
  var bounds = _mandilMarcoBounds();
  if (!bounds) return;
  var gabW = parseFloat(marco.style.width);
  if (isNaN(gabW)) return;
  var innerGapPx = _mandilSubmarcoMm() / PX_TO_MM;                                       
  var leftPx, widthPx;
  if (side === 'izq') {
    leftPx = innerGapPx;
    widthPx = bounds.left - leftPx;
  } else {
    leftPx = bounds.left + bounds.width;
    widthPx = (gabW - innerGapPx) - leftPx;
  }
  if (widthPx <= 0) return;
  var col = _mandilColBounds(side) || bounds;
  var rect = document.createElement('div');
  rect.className = 'mandil-extra-' + side;
  rect.style.cssText = 'position:absolute;pointer-events:none;box-sizing:border-box;' +
    'left:' + leftPx + 'px;top:' + col.top + 'px;' +
    'width:' + widthPx + 'px;height:' + col.height + 'px;' +
    'border:3px solid #000000;background:' + _colorMandil() + ';z-index:7;';
  marco.appendChild(rect);
}


function _renderChapaManijaMandil() {
  var img = document.getElementById('chapa_manija_mandil');
  var img2 = document.getElementById('chapa_manija_mandil_2');
  if (!img && !img2) return;
  var enMandil = document.body.classList.contains('vista-mandil-active');
  var bounds = enMandil ? _mandilMarcoBounds() : null;
  if (!enMandil || !bounds) {
    if (img) img.style.display = 'none';
    if (img2) img2.style.display = 'none';
    return;
  }

  var DIAM_MM = _MANDIL_CHAPA_DIAM_MM, ALTO_MM = _MANDIL_CHAPA_ALTO_MM;
  var IMG_W = (DIAM_MM / PX_TO_MM) * 1684 / 602;
  var IMG_H = (ALTO_MM / PX_TO_MM) * 1190 / 893;
  var PIVOTE_OFFX = 829.48 / 1684 * IMG_W;
  var PIVOTE_OFFY = 444.44 / 1190 * IMG_H;

  var chapa = _mandilChapaInfo();
  if (!chapa) return;
  var cantidad = chapa.cant;

  var pivAbsX = bounds.left + (chapa.xMm / PX_TO_MM);
  var pivAbsY = bounds.top + (chapa.y1Mm / PX_TO_MM);
  var pivAbsY2 = bounds.top + (chapa.y2Mm / PX_TO_MM);

  if (img) {
    img.style.left = (pivAbsX - PIVOTE_OFFX) + 'px';
    img.style.top = (pivAbsY - PIVOTE_OFFY) + 'px';
    img.style.width = IMG_W + 'px';
    img.style.height = IMG_H + 'px';
    img.style.display = 'block';
  }
  if (img2) {
    if (cantidad >= 2) {
      img2.style.left = (pivAbsX - PIVOTE_OFFX) + 'px';
      img2.style.top = (pivAbsY2 - PIVOTE_OFFY) + 'px';
      img2.style.width = IMG_W + 'px';
      img2.style.height = IMG_H + 'px';
      img2.style.display = 'block';
    } else {
      img2.style.display = 'none';
    }
  }
}


function _renderMandilLabels(container) {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  marco.querySelectorAll('.mandil-label').forEach(function(el) { el.remove(); });
  if (window._vistaActual !== 'frontal_mandil') return;

  var cTop = parseFloat(container.style.top) || 0;
  var cLeft = parseFloat(container.style.left) || 0;
  var gapPx = _MANDIL_ROTULO_GAP_MM / PX_TO_MM;

  container.querySelectorAll('.itm-rotulo, .ig-rotulo').forEach(function(orig) {



    if (orig.hasAttribute('data-contactor-itm-id')) return;
    if (orig.hasAttribute('data-dps-itm-id')) return;
    if (orig.classList.contains('bornera-presencia-rotulo')) return;


    if (orig.classList.contains('canaleta-rotulo')) return;


    var grIdLbl = orig.dataset.bornGrupoId || null;
    var cutTimer = (grIdLbl && window.__mandilTimerCutouts)
      ? window.__mandilTimerCutouts[grIdLbl] : null;
    if (orig.classList.contains('bornera-rotulo') && !cutTimer) return;

    var clone = orig.cloneNode(true);
    clone.classList.add('mandil-label');
    var isIg = orig.classList.contains('ig-rotulo');
    var isDif = !isIg && orig.hasAttribute('data-dif-itm-id');

    if (cutTimer) {

      clone.style.left = (cutTimer.x + cutTimer.w / 2) + 'px';
      clone.style.top = (cutTimer.y + cutTimer.h + gapPx) + 'px';
      clone.style.transform = 'translateX(-50%)';
    } else if (isIg && window.__mandilIgCutout) {

      var c = window.__mandilIgCutout;
      clone.style.left = (c.x + c.w / 2) + 'px';
      clone.style.top = (c.y - gapPx) + 'px';
      clone.style.transform = 'translate(-50%, -100%)';
    } else {


      var origLeft = parseFloat(orig.style.left) || 0;
      var origTop = parseFloat(orig.style.top) || 0;
      var newLeft = cLeft + origLeft;
      var newTop = cTop + origTop;

      var itmFound = null;
      var id = isDif ? orig.dataset.difItmId : orig.dataset.itmId;
      if (id) itmFound = _buscarITM(id);

      if (itmFound) {
        var outerMm;
        if (isDif) outerMm = _MANDIL_OFFSETS_MM.dif.outer;
        else outerMm = (_MANDIL_OFFSETS_MM[_mandilTipoEfectivo(itmFound)] || _MANDIL_OFFSETS_MM.riel).outer;
        var shiftPx = (_MANDIL_ROTULO_GAP_MM - (10 + outerMm)) / PX_TO_MM;
        var esInferior = isDif && itmFound.dif && itmFound.dif.ubicacion === 'inferior';
        if (esInferior) {
          newTop += shiftPx;                                                   
        } else {
          if (itmFound.side === 'left') newLeft -= shiftPx;
          else newLeft += shiftPx;
        }
      }
      clone.style.left = newLeft + 'px';
      clone.style.top = newTop + 'px';
      clone.style.transform = orig.style.transform;
    }
    clone.style.zIndex = '13';


    var badge = clone.querySelector('.itm-rotulo-badge');
    if (badge) {
      var wpx = _MANDIL_ROTULO_W_MM / PX_TO_MM;
      var hpx = _MANDIL_ROTULO_H_MM / PX_TO_MM;
      badge.style.width = wpx + 'px';
      badge.style.height = hpx + 'px';
      badge.style.lineHeight = hpx + 'px';
      badge.style.padding = '0';
    }
    marco.appendChild(clone);
  });
}


function _renderMandilOverlays(soloLimpiar) {
  var container = document.getElementById('panel_busbar_container');
  var marco = document.getElementById('marco_gabinete');
  if (!container || !marco) return;


  marco.querySelectorAll('.mandil-overlay, .mandil-placa-overlay, .mandil-fill-svg, ' +
    '.mandil-label, .mandil-extra-izq, .mandil-extra-der, .cota-cr, .cota-ct').forEach(function(el) { el.remove(); });
  window.__mandilCalados = null;
  var ch1 = document.getElementById('chapa_manija_mandil');
  var ch2 = document.getElementById('chapa_manija_mandil_2');
  if (ch1) ch1.style.display = 'none';
  if (ch2) ch2.style.display = 'none';




  if (soloLimpiar) return;
  if (window._vistaActual !== 'frontal_mandil') return;
  if (!window._itmList) return;

  var cutouts = [];
  window.__mandilCutoutAccum = cutouts;
  window.__mandilIgCutout = null;
  window.__mandilTimerCutouts = {};

  _renderMandilPlacaOverlay();
  _renderMandilExtra('izq');
  _renderMandilExtra('der');
  _renderChapaManijaMandil();

  window._itmList.forEach(function(itm) {
    _addMandilRectForItm(itm, container);
    if (itm.dif) _addMandilRectForDif(itm, container);
  });
  if (window._igData) _addMandilRectForIg(container);
  if (typeof _bornerasGrupos === 'function') {
    _bornerasGrupos().forEach(function(gr) { _addMandilRectForGrupo(gr, container); });
  }

  window.__mandilCutoutAccum = null;
  _renderMandilFillSvg(cutouts);
  _renderMandilLabels(container);
  _renderCotasCT();
  _renderCotasCR(container);
}











function _renderCotasCT() {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  marco.querySelectorAll('.cota-ct').forEach(function(el) { el.remove(); });
  if (window._vistaActual !== 'frontal_mandil') return;
  if (typeof _cotaH !== 'function' || typeof _cotaV !== 'function') return;

  var b = _mandilMarcoBounds();
  if (!b) return;
  var gabW = parseFloat(marco.style.width);
  var gabH = parseFloat(marco.style.height);
  if (isNaN(gabW) || isNaN(gabH)) return;

  var izq = _mandilColBounds('izq'), der = _mandilColBounds('der');
  var xIzq = b.left / 2;                                                   
  var xMid = b.left + b.width / 2;                                   
  var xDer = b.left + b.width + (gabW - b.left - b.width) / 2;

  function mm(px) { return (px * PX_TO_MM).toFixed(1); }


  if (izq.top > 1) {
    _cotaV(marco, 'cota-ct', xIzq, 0, izq.top, mm(izq.top), 'CT-01', function(v) {
      var bot = izq.top * PX_TO_MM + izq.height * PX_TO_MM;
      _MANDIL_TOP_IZQ_MM = v;
      _MANDIL_ALTO_IZQ_MM = Math.max(1, bot - v);                                   
    });
  }
  if (b.top > 1) {
    _cotaV(marco, 'cota-ct', xMid, 0, b.top, mm(b.top), 'CT-02', function(v) {
      _mandilSolidificarColumnas();
      var bot = b.top * PX_TO_MM + b.height * PX_TO_MM;
      _MANDIL_MARCO_TOP_MM = v;
      _MANDIL_MARCO_ALTO_MM = Math.max(1, bot - v);
    });
  }
  if (der.top > 1) {
    _cotaV(marco, 'cota-ct', xDer, 0, der.top, mm(der.top), 'CT-03', function(v) {
      var bot = der.top * PX_TO_MM + der.height * PX_TO_MM;
      _MANDIL_TOP_DER_MM = v;
      _MANDIL_ALTO_DER_MM = Math.max(1, bot - v);
    });
  }


  var botIzq = gabH - (izq.top + izq.height);
  var botMid = gabH - (b.top + b.height);
  var botDer = gabH - (der.top + der.height);
  if (botIzq > 1) {
    _cotaV(marco, 'cota-ct', xIzq, izq.top + izq.height, botIzq, mm(botIzq), 'CT-04', function(v) {
      if (typeof _MANDIL_TOP_IZQ_MM !== 'number') _MANDIL_TOP_IZQ_MM = izq.top * PX_TO_MM;
      _MANDIL_ALTO_IZQ_MM = Math.max(1, gabH * PX_TO_MM - _MANDIL_TOP_IZQ_MM - v);
    });
  }
  if (botMid > 1) {
    _cotaV(marco, 'cota-ct', xMid, b.top + b.height, botMid, mm(botMid), 'CT-05', function(v) {
      _mandilSolidificarColumnas();
      if (typeof _MANDIL_MARCO_TOP_MM !== 'number') _MANDIL_MARCO_TOP_MM = b.top * PX_TO_MM;
      _MANDIL_MARCO_ALTO_MM = Math.max(1, gabH * PX_TO_MM - _MANDIL_MARCO_TOP_MM - v);
    });
  }
  if (botDer > 1) {
    _cotaV(marco, 'cota-ct', xDer, der.top + der.height, botDer, mm(botDer), 'CT-06', function(v) {
      if (typeof _MANDIL_TOP_DER_MM !== 'number') _MANDIL_TOP_DER_MM = der.top * PX_TO_MM;
      _MANDIL_ALTO_DER_MM = Math.max(1, gabH * PX_TO_MM - _MANDIL_TOP_DER_MM - v);
    });
  }




  var yAnchos = b.top + b.height + 60;
  if (b.left > 1) {
    _cotaH(marco, 'cota-ct', 0, yAnchos, b.left, mm(b.left), 'CT-07', function(v) {
      if (typeof _MANDIL_MARCO_ANCHO_MM !== 'number') _MANDIL_MARCO_ANCHO_MM = b.width * PX_TO_MM;


      var MIN_SOP = _mandilSubmarcoMm() + 5;
      v = Math.max(v, MIN_SOP);
      _MANDIL_MARCO_LEFT_MM = v;


      var maxAncho = gabW * PX_TO_MM - v - MIN_SOP;
      if (_MANDIL_MARCO_ANCHO_MM > maxAncho) _MANDIL_MARCO_ANCHO_MM = Math.max(1, maxAncho);
    });
  }
  var anchoDer = gabW - (b.left + b.width);
  if (anchoDer > 1) {
    _cotaH(marco, 'cota-ct', b.left + b.width, yAnchos, anchoDer, mm(anchoDer), 'CT-08', function(v) {
      if (typeof _MANDIL_MARCO_LEFT_MM !== 'number') _MANDIL_MARCO_LEFT_MM = b.left * PX_TO_MM;
      v = Math.max(v, _mandilSubmarcoMm() + 5);
      _MANDIL_MARCO_ANCHO_MM = Math.max(1, gabW * PX_TO_MM - _MANDIL_MARCO_LEFT_MM - v);
    });
  }


  var ch = _mandilChapaInfo();
  if (!ch) return;
  var chX = b.left + ch.xMm / PX_TO_MM;
  var chY1 = b.top + ch.y1Mm / PX_TO_MM;
  var chY2 = b.top + ch.y2Mm / PX_TO_MM;



  _cotaH(marco, 'cota-ct', b.left, chY1 + 150, ch.xMm / PX_TO_MM,
    ch.xMm.toFixed(1), 'CT-13', function(v) { _MANDIL_CHAPA_X_MM = v; });


  _cotaV(marco, 'cota-ct', chX + 90, b.top, chY1 - b.top,
    ch.y1Mm.toFixed(1), 'CT-14', function(v) {
      _MANDIL_CHAPA_Y_MM = v; _MANDIL_CHAPA_Y_CANT = ch.cant;
      if (ch.cant >= 2 && typeof _MANDIL_CHAPA_Y2_MM !== 'number') _MANDIL_CHAPA_Y2_MM = ch.y2Mm;
    });

  if (ch.cant >= 2) {



    _cotaV(marco, 'cota-ct', chX + 90, chY1, chY2 - chY1,
      (ch.y2Mm - ch.y1Mm).toFixed(1), 'CT-16', function(v) {
        var delta = v - (ch.y2Mm - ch.y1Mm);
        var n1 = ch.y1Mm - delta / 2, n2 = ch.y2Mm + delta / 2;
        if (n1 < 0) { n2 += -n1; n1 = 0; }
        if (n2 > ch.altoMm) { n1 -= (n2 - ch.altoMm); n2 = ch.altoMm; }
        _MANDIL_CHAPA_Y_MM = Math.max(0, n1);
        _MANDIL_CHAPA_Y2_MM = n2;
        _MANDIL_CHAPA_Y_CANT = ch.cant;
      });

    _cotaV(marco, 'cota-ct', chX + 90, chY2, (b.top + b.height) - chY2,
      (ch.altoMm - ch.y2Mm).toFixed(1), 'CT-15', function(v) {
        _MANDIL_CHAPA_Y2_MM = Math.max(0, ch.altoMm - v);
        if (typeof _MANDIL_CHAPA_Y_MM !== 'number') _MANDIL_CHAPA_Y_MM = ch.y1Mm;
        _MANDIL_CHAPA_Y_CANT = ch.cant;
      });
  } else {

    _cotaV(marco, 'cota-ct', chX + 90, chY1, (b.top + b.height) - chY1,
      (ch.altoMm - ch.y1Mm).toFixed(1), 'CT-15', function(v) {
        _MANDIL_CHAPA_Y_MM = Math.max(0, ch.altoMm - v);
        _MANDIL_CHAPA_Y_CANT = ch.cant;
      });
  }
}













function _renderCotasCR(container) {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  marco.querySelectorAll('.cota-cr').forEach(function(el) { el.remove(); });
  if (window._vistaActual !== 'frontal_mandil') return;
  if (typeof _cotaH !== 'function') return;


  var label = null, itm = null;
  var labels = marco.querySelectorAll('.mandil-label');
  for (var i = 0; i < labels.length; i++) {
    var lb = labels[i];
    if (lb.classList.contains('ig-rotulo')) continue;
    if (lb.hasAttribute('data-dif-itm-id')) continue;
    var it = (typeof _buscarITM === 'function') ? _buscarITM(lb.dataset.itmId) : null;
    if (it) { label = lb; itm = it; break; }
  }
  if (!label) return;

  var z = parseFloat(marco.style.zoom) || 1;
  var mR = marco.getBoundingClientRect();
  function loc(el) {
    var r = el.getBoundingClientRect();
    return { x: (r.left - mR.left) / z, y: (r.top - mR.top) / z,
             w: r.width / z, h: r.height / z };
  }
  var L = loc(label);
  if (L.w < 1 || L.h < 1) return;


  _cotaH(marco, 'cota-cr', L.x, L.y - 40, L.w,
    _MANDIL_ROTULO_W_MM.toFixed(1), 'CR-01',
    function(mm) { _MANDIL_ROTULO_W_MM = mm; });


  var xAlto = (itm.side === 'left') ? (L.x - 40) : (L.x + L.w + 40);
  _cotaV(marco, 'cota-cr', xAlto, L.y, L.h,
    _MANDIL_ROTULO_H_MM.toFixed(1), 'CR-02',
    function(mm) { _MANDIL_ROTULO_H_MM = mm; });


  var ov = marco.querySelector('.mandil-overlay[data-itm-id="' + itm.id + '"]');
  if (ov) {
    var O = loc(ov);
    var yMid = L.y + L.h / 2;
    if (itm.side === 'left') {
      var gapW = O.x - (L.x + L.w);
      if (gapW > 1) {
        _cotaH(marco, 'cota-cr', L.x + L.w, yMid, gapW,
          _MANDIL_ROTULO_GAP_MM.toFixed(1), 'CR-03',
          function(mm) { _MANDIL_ROTULO_GAP_MM = mm; });
      }
    } else {
      var gapW2 = L.x - (O.x + O.w);
      if (gapW2 > 1) {
        _cotaH(marco, 'cota-cr', O.x + O.w, yMid, gapW2,
          _MANDIL_ROTULO_GAP_MM.toFixed(1), 'CR-03',
          function(mm) { _MANDIL_ROTULO_GAP_MM = mm; });
      }
    }
  }
}
