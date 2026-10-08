























var ALIM_ENTRADA_MM = 20;                                         

var ALIM_COLOR = '#b3bcc7';



function alimRadioMinimo(D) {
  var f = (D < 25) ? 4 : (D <= 50 ? 7 : 8);
  return { factor: f, r: f * D };
}





function alimDatos(igProvisorio) {
  var ig = igProvisorio || window._igData, pb = window._panelBusbarData;
  if (!ig || !pb || typeof uniEntrada !== 'function' || typeof _uniDiamConductor !== 'function') return null;
  var me = (window._unifilarMeta && window._unifilarMeta.entrada) || {};
  var nF = parseInt(pb.fases, 10) || 3, conN = /\+N/.test(pb.fases || '');
  var tierra = (typeof _tierraConfigurada === 'function') ? _tierraConfigurada(pb) : false;
  var en = uniEntrada(me, ig, nF, conN, tierra);
  if (!en || !en.o || !(en.o.S > 0)) return null;
  var d = _uniDiamConductor(en.o.S);
  var multi = (en.cfg && en.cfg.forma === 'multi');
  var nCond = nF + (conN ? 1 : 0);

  var pack = { 1: 1, 2: 2, 3: 2.155, 4: 2.414 }[Math.min(4, nCond)] || 2.414;
  var Ddobla = multi ? d * pack : d;
  return {

    ver: me.alimVer === true,
    llegada: me.alimLlegada === 'abajo' ? 'abajo' : 'arriba',
    lado: me.alimLado === 'der' ? 'der' : 'izq',


    haz: (me.alimHaz === 'sep' || me.alimHaz === 'encima') ? me.alimHaz : 'juntos',


    dx: Math.max(0, parseFloat(me.alimDx) || 0), alto: Math.max(0, parseFloat(me.alimAlto) || 0),
    multi: multi,
    d: d, Ddobla: Ddobla, radio: alimRadioMinimo(Ddobla)
  };
}


function alimRadioTxt(A) {
  var v = (Math.round(A.radio.r * 10) / 10).toFixed(1).replace(/\.0$/, '');
  return A.radio.factor + '·D = ' + v + ' mm' + (A.multi ? ' (multipolar, D aprox.)' : '');
}




function _alimEscalarMarcas() {
  var marco = document.getElementById('marco_gabinete');
  var z = (marco && parseFloat(marco.style.zoom)) || 1;
  document.querySelectorAll('.alim-cable .alim-flecha, .alim-cable .alim-alerta').forEach(function(g) {
    g.setAttribute('transform', 'translate(' + g.getAttribute('data-x') + ' ' + g.getAttribute('data-y') +
                   ') scale(' + (1 / z) + ')');
  });
}






function alimPoner(me, o) {
  ['alimVer', 'alimLlegada', 'alimLado', 'alimHaz', 'alimDx', 'alimAlto'].forEach(function(k) { delete me[k]; });
  if (o.ver) me.alimVer = true;
  if (o.llegada === 'abajo') me.alimLlegada = 'abajo';
  if (o.lado === 'der') me.alimLado = 'der';
  if (o.haz === 'sep' || o.haz === 'encima') me.alimHaz = o.haz;
  var dx = Math.max(0, parseFloat(o.dx) || 0), alto = Math.max(0, parseFloat(o.alto) || 0);
  if (dx) me.alimDx = dx;
  if (alto) me.alimAlto = alto;
  return me;
}

function _alimLimpiar(container) {
  [].slice.call(container.querySelectorAll('.alim-cable')).forEach(function(n) { n.remove(); });
}



function _dibujarAlimentadorIG(container) {
  if (!container) return;
  _alimLimpiar(container);
  var A = alimDatos();
  var igEl = container.querySelector('.ig-img');
  var marco = document.getElementById('marco_gabinete');
  window._alimAvisos = [];
  if (!A || !A.ver || !igEl || !marco) return;
  var px = function(mm) { return mm / PX_TO_MM; };


  var cTop = parseFloat(container.style.top) || 0, cLeft = parseFloat(container.style.left) || 0;
  var gab = { top: -cTop, left: -cLeft,
              bottom: (parseFloat(marco.style.height) || 0) - cTop,
              right: (parseFloat(marco.style.width) || 0) - cLeft };


  var igL = parseFloat(igEl.style.left) || 0, igW = parseFloat(igEl.style.width) || 0;
  var igT = parseFloat(igEl.style.top) || 0, igH = parseFloat(igEl.style.height) || 0;
  var polos = parseInt(window._igData.polos, 10) || 3;
  var xs = [];
  for (var i = 0; i < polos; i++) xs.push(igL + igW * (i + 0.5) / polos);
  var yT = igT + igH * 0.08;

  var D = px(A.d), R = px(A.radio.r);
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'alim-cable');
  svg.setAttribute('width', '1'); svg.setAttribute('height', '1');
  svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:9';
  container.appendChild(svg);
  var trazo = function(d) {
    var p1 = document.createElementNS(ns, 'path');
    p1.setAttribute('d', d);
    p1.setAttribute('fill', 'none'); p1.setAttribute('stroke', ALIM_COLOR);
    p1.setAttribute('stroke-width', String(D)); p1.setAttribute('stroke-opacity', '0.75');
    svg.appendChild(p1);
    var p2 = document.createElementNS(ns, 'path');
    p2.setAttribute('d', d);
    p2.setAttribute('fill', 'none'); p2.setAttribute('stroke', '#ffffff');
    p2.setAttribute('stroke-width', String(Math.max(3, D * 0.08)));
    p2.setAttribute('stroke-dasharray', (D * 0.6) + ' ' + (D * 0.4));
    p2.setAttribute('stroke-opacity', '0.6');
    svg.appendChild(p2);
  };
  var mmTxt = function(v) { return (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, ''); };

  if (A.llegada === 'arriba') {

    xs.forEach(function(x) { trazo('M' + x + ' ' + gab.top + 'V' + yT); });
    return;
  }











  var izq = (A.lado === 'izq'), n = xs.length, s = izq ? -1 : 1;
  var sw = izq ? 1 : 0;
  var yE = yT - px(ALIM_ENTRADA_MM);                                               
  var yA = yE - px(A.alto);                                                   
  var orden = [];                                                                                 
  for (var o = 0; o < n; o++) orden.push(izq ? o : n - 1 - o);
  var xC0 = xs[orden[0]] + s * R;                                                 
  var xCL = xC0 + s * px(A.dx);                                                    





  var vueltas = orden.map(function(k, j) {
    var x = xs[k], r, rb;
    if (A.haz === 'sep') { r = rb = Math.abs(x - xC0); }
    else {
      r = R + (A.haz === 'juntos' ? j * D : 0);
      rb = Math.max(R, Math.min(r, Math.abs(x - xC0)));
    }
    var top = yA - r;
    return { x: x, pata: xCL + s * r, top: top,
             d: 'V' + yA + 'A' + r + ' ' + r + ' 0 0 ' + sw + ' ' + xCL + ' ' + top +
                'H' + (x + s * rb) + 'A' + rb + ' ' + rb + ' 0 0 ' + sw + ' ' + x + ' ' + (top + rb) };
  });


  var yDesde = Math.max((gab.top + gab.bottom) / 2, yA + px(30));
  var topMin = yE, bordePata = vueltas[0].pata;
  vueltas.forEach(function(v) {
    topMin = Math.min(topMin, v.top);
    bordePata = izq ? Math.min(bordePata, v.pata) : Math.max(bordePata, v.pata);
    trazo('M' + v.pata + ' ' + yDesde + v.d + 'V' + yT);
  });
  bordePata += s * D / 2;


  var faltaArr = gab.top - (topMin - D / 2);
  var faltaLat = izq ? (gab.left - bordePata) : (bordePata - gab.right);
  var avisos = [];
  if (faltaArr > 0.5) avisos.push('faltan ' + mmTxt(faltaArr * PX_TO_MM) + ' mm sobre el IG');
  if (faltaLat > 0.5) avisos.push('faltan ' + mmTxt(faltaLat * PX_TO_MM) + ' mm al costado');



  window._alimAvisos = avisos;
  if (avisos.length) _alimAlerta(svg, igL + igW / 2, igT, avisos);





  if (_alimMoviendo) {
    var xP = 0;
    vueltas.forEach(function(v) { xP += v.pata; });
    _alimFlecha(svg, (xCL + xs[orden[0]]) / 2, (topMin + vueltas[0].top) / 2, 'alto', s);
    _alimFlecha(svg, xP / n, (yDesde + yA) / 2, 'dx', s);
  }
  _alimEscalarMarcas();
  if (_alimModalAbierto()) _alimModalAviso();
}



function _alimAlerta(svg, x, y, avisos) {
  var ns = 'http://www.w3.org/2000/svg';
  var g = document.createElementNS(ns, 'g');
  g.setAttribute('class', 'alim-alerta');
  g.setAttribute('data-x', String(x)); g.setAttribute('data-y', String(y));
  g.style.pointerEvents = 'all';
  var t = document.createElementNS(ns, 'title');
  t.textContent = 'No entra la vuelta del alimentador: ' + avisos.join(', ');
  var tri = document.createElementNS(ns, 'path');
  tri.setAttribute('d', 'M0 -12 L12 9 L-12 9 Z');
  tri.setAttribute('fill', '#f5b800'); tri.setAttribute('stroke', '#ffffff'); tri.setAttribute('stroke-width', '2.5');
  tri.setAttribute('stroke-linejoin', 'round'); tri.setAttribute('paint-order', 'stroke');
  var ex = document.createElementNS(ns, 'path');
  ex.setAttribute('d', 'M0 -5 V2 M0 5 V5.5');
  ex.setAttribute('stroke', '#1f2937'); ex.setAttribute('stroke-width', '2.6'); ex.setAttribute('stroke-linecap', 'round');


  var cuerpo = document.createElementNS(ns, 'g');
  cuerpo.setAttribute('transform', 'translate(0 -11)');
  cuerpo.appendChild(tri); cuerpo.appendChild(ex);
  g.appendChild(t); g.appendChild(cuerpo);
  svg.appendChild(g);
}



function _alimModalAbierto() {
  var ov = document.getElementById('modalIG_overlay');
  var tab = document.querySelector('#modalIG_tabs .seg-btn.activo');
  return !!(ov && ov.classList.contains('activo') && tab && tab.getAttribute('data-val') === 'alim');
}





var ALIM_FLECHA_COLOR = '#2563eb';
function _alimFlecha(svg, x, y, que, s) {
  var ns = 'http://www.w3.org/2000/svg';
  var g = document.createElementNS(ns, 'g');
  g.setAttribute('class', 'alim-flecha');
  g.setAttribute('data-x', String(x)); g.setAttribute('data-y', String(y));
  g.style.pointerEvents = 'all';
  g.style.cursor = (que === 'alto') ? 'ns-resize' : 'ew-resize';

  var d = 'M0 -20 L8 -9 L2.5 -9 L2.5 9 L8 9 L0 20 L-8 9 L-2.5 9 L-2.5 -9 L-8 -9 Z';
  var cuerpo = document.createElementNS(ns, 'g');
  if (que !== 'alto') cuerpo.setAttribute('transform', 'rotate(90)');
  var fondo = document.createElementNS(ns, 'circle');
  fondo.setAttribute('r', '16'); fondo.setAttribute('fill', '#ffffff'); fondo.setAttribute('fill-opacity', '0.01');
  var f = document.createElementNS(ns, 'path');
  f.setAttribute('d', d);
  f.setAttribute('fill', ALIM_FLECHA_COLOR); f.setAttribute('stroke', '#ffffff'); f.setAttribute('stroke-width', '2');
  f.setAttribute('paint-order', 'stroke');
  cuerpo.appendChild(fondo); cuerpo.appendChild(f);
  g.appendChild(cuerpo);
  var parar = function(ev) { ev.stopPropagation(); };
  g.addEventListener('click', parar);
  g.addEventListener('mousedown', parar);
  g.addEventListener('pointerdown', function(ev) {
    ev.stopPropagation(); ev.preventDefault();
    _alimArrastrar(ev, que, s);
  });
  svg.appendChild(g);
}

function _alimArrastrar(ev, que, s) {
  var marco = document.getElementById('marco_gabinete');
  var z = (marco && parseFloat(marco.style.zoom)) || 1;
  var m = window._unifilarMeta || (window._unifilarMeta = {});
  var me = m.entrada || (m.entrada = {});
  var k = (que === 'alto') ? 'alimAlto' : 'alimDx';
  var v0 = Math.max(0, parseFloat(me[k]) || 0), x0 = ev.clientX, y0 = ev.clientY;
  var mover = function(e) {
    var mm = (que === 'alto') ? -(e.clientY - y0) / z * PX_TO_MM : s * (e.clientX - x0) / z * PX_TO_MM;
    var v = Math.max(0, Math.round(v0 + mm));
    if (v === (parseFloat(me[k]) || 0)) return;
    if (v) me[k] = v; else delete me[k];
    _dibujarAlimentadorIG(document.getElementById('panel_busbar_container'));
  };
  var soltar = function() {
    window.removeEventListener('pointermove', mover);
    window.removeEventListener('pointerup', soltar);
    window.removeEventListener('pointercancel', soltar);

    _alimSoltadoEn = Date.now();
    if (typeof guardarSesion === 'function') guardarSesion();
  };
  window.addEventListener('pointermove', mover);
  window.addEventListener('pointerup', soltar);
  window.addEventListener('pointercancel', soltar);
}





var _alimMoviendo = false, _alimSoltadoEn = 0;


function alimDesplazable() {
  var A = alimDatos();
  return !!(A && A.ver && A.llegada === 'abajo');
}

function desplazarAlimentador() {
  if (!alimDesplazable() || _alimMoviendo) return;
  _alimMoviendo = true;
  _dibujarAlimentadorIG(document.getElementById('panel_busbar_container'));
  var old = document.getElementById('modo_copia_hint');
  if (old) old.remove();
  var hint = document.createElement('div');
  hint.id = 'modo_copia_hint';
  hint.textContent = 'Arrastrá las flechas para desplazar el alimentador  ·  ' +
    (typeof _txtSalir === 'function' ? _txtSalir() : 'ESC para salir');
  document.body.appendChild(hint);
  document.addEventListener('keydown', _alimMoverEsc);

  setTimeout(function() { if (_alimMoviendo) document.addEventListener('click', _alimMoverClickFuera, true); }, 10);
}

function _alimMoverTerminar() {
  if (!_alimMoviendo) return;
  _alimMoviendo = false;
  document.removeEventListener('keydown', _alimMoverEsc);
  document.removeEventListener('click', _alimMoverClickFuera, true);
  var hint = document.getElementById('modo_copia_hint');
  if (hint) hint.remove();
  _dibujarAlimentadorIG(document.getElementById('panel_busbar_container'));
}
function _alimMoverEsc(e) { if (e.key === 'Escape') _alimMoverTerminar(); }
function _alimMoverClickFuera(e) {
  if (Date.now() - _alimSoltadoEn < 400) return;                                    
  if (e.target.closest && e.target.closest('.alim-flecha')) return;
  _alimMoverTerminar();
}







var _alimModalAntes = null;

function _alimModalLeer() {
  var seg = function(id) {
    var b = document.querySelector('#' + id + ' .seg-btn.activo');
    return b ? b.getAttribute('data-val') : '';
  };
  var me = (window._unifilarMeta && window._unifilarMeta.entrada) || {};


  return { ver: document.getElementById('modalIG_alimVer').checked,
           llegada: seg('modalAlim_llegada'), lado: seg('modalAlim_lado'), haz: seg('modalAlim_haz'),
           dx: me.alimDx, alto: me.alimAlto };
}

function _alimModalSeg(id, v) {
  document.querySelectorAll('#' + id + ' .seg-btn').forEach(function(b) {
    b.classList.toggle('activo', b.getAttribute('data-val') === v);
  });
}


function _alimIGProvisorio() {
  var v = function(id) { var el = document.getElementById(id); return el ? el.value : ''; };
  var ig = { tipo: v('modalIG_tipo'), polos: parseInt(v('modalIG_polos'), 10) || 3, corriente: v('modalIG_corriente') };
  if (ig.tipo === 'cm_reg' && typeof _regLeer === 'function') ig.regulacion = _regLeer('modalIG_regulacion', ig.corriente);
  return ig.corriente ? ig : null;
}


function _alimModalAplicar() {
  var o = _alimModalLeer();
  document.getElementById('modalAlim_abajo').style.display = (o.llegada === 'abajo') ? '' : 'none';
  var m = window._unifilarMeta || (window._unifilarMeta = {});
  m.entrada = alimPoner(m.entrada || {}, o);
  var Ap = alimDatos(_alimIGProvisorio());
  document.getElementById('modalAlim_radio').textContent = Ap ? alimRadioTxt(Ap) : '—';
  _dibujarAlimentadorIG(document.getElementById('panel_busbar_container'));
}


function _alimModalAviso() {
  var el = document.getElementById('modalAlim_aviso');
  if (!el) return;
  var av = window._alimAvisos || [];
  el.textContent = av.length ? '⚠ ' + av.join(' · ') : '';
  el.style.display = av.length ? '' : 'none';
}

function setAlimModal(id, v) {
  _alimModalSeg(id, v);
  _alimModalAplicar();
}


function setIGPestania(t) {
  var tabA = document.querySelector('#modalIG_tabs .seg-btn[data-val="alim"]');
  if (t === 'alim' && tabA && tabA.disabled) return;
  _alimModalSeg('modalIG_tabs', t);
  document.getElementById('modalIG_panelIG').style.display = (t === 'alim') ? 'none' : '';
  document.getElementById('modalIG_panelAlim').style.display = (t === 'alim') ? '' : 'none';
  if (t === 'alim') _alimModalAplicar();                                         
}


function onIGAlimVer(chk) {
  var tabA = document.querySelector('#modalIG_tabs .seg-btn[data-val="alim"]');
  if (tabA) tabA.disabled = !chk.checked;
  _alimModalAplicar();
}



function alimIGAbrir() {
  var me = (window._unifilarMeta && window._unifilarMeta.entrada) || {};
  _alimModalAntes = JSON.parse(JSON.stringify(me));
  var chk = document.getElementById('modalIG_alimVer');
  chk.checked = me.alimVer === true;
  var tabA = document.querySelector('#modalIG_tabs .seg-btn[data-val="alim"]');
  if (tabA) tabA.disabled = !chk.checked;
  _alimModalSeg('modalAlim_llegada', me.alimLlegada === 'abajo' ? 'abajo' : 'arriba');
  _alimModalSeg('modalAlim_lado', me.alimLado === 'der' ? 'der' : 'izq');
  _alimModalSeg('modalAlim_haz', (me.alimHaz === 'sep' || me.alimHaz === 'encima') ? me.alimHaz : 'juntos');
  document.getElementById('modalAlim_abajo').style.display = (me.alimLlegada === 'abajo') ? '' : 'none';
  _alimModalSeg('modalIG_tabs', 'ig');
  document.getElementById('modalIG_panelIG').style.display = '';
  document.getElementById('modalIG_panelAlim').style.display = 'none';
}



function alimIGCerrar(volver) {
  if (volver && _alimModalAntes) {
    var m = window._unifilarMeta || (window._unifilarMeta = {});
    m.entrada = _alimModalAntes;
  }
  _alimModalAntes = null;
  _alimModalSeg('modalIG_tabs', 'ig');
  _dibujarAlimentadorIG(document.getElementById('panel_busbar_container'));
}
