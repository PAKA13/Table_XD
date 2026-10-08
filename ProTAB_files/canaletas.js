





















function _canGiro(el) {
  var m = /rotate\((-?\d+(?:\.\d+)?)deg\)/.exec((el && el.style && el.style.transform) || '');
  return m ? parseFloat(m[1]) : 0;
}
function _canCajaPropia(el) {
  var st = el.style || {};
  return { l: parseFloat(st.left) || 0, t: parseFloat(st.top) || 0,
           w: parseFloat(st.width) || el.offsetWidth || 0,
           h: parseFloat(st.height) || el.offsetHeight || 0 };
}
function _canRotar(pts, deg, cx, cy) {
  if (!deg) return pts;
  var a = deg * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
  return pts.map(function(q) {
    var x = q[0] - cx, y = q[1] - cy;
    return [cx + x * c - y * sn, cy + x * sn + y * c];
  });
}
function _canCajaEnContainer(el, container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!el || !container) return null;
  var b = _canCajaPropia(el);
  var pts = _canRotar([[b.l, b.t], [b.l + b.w, b.t], [b.l, b.t + b.h], [b.l + b.w, b.t + b.h]],
                      _canGiro(el), b.l + b.w / 2, b.t + b.h / 2);
  var p = el.parentNode, girado = false, guard = 0;
  while (p && p !== container && guard++ < 10) {
    var pb = _canCajaPropia(p), pr = _canGiro(p);
    pts = pts.map(function(q) { return [q[0] + pb.l, q[1] + pb.t]; });
    pts = _canRotar(pts, pr, pb.l + pb.w / 2, pb.t + pb.h / 2);
    if (pr) girado = true;
    p = p.parentNode;
  }
  if (p !== container) return null;
  var xs = pts.map(function(q) { return q[0]; }), ys = pts.map(function(q) { return q[1]; });
  var x = Math.min.apply(null, xs), y = Math.min.apply(null, ys);
  return { x: x, y: y, w: Math.max.apply(null, xs) - x, h: Math.max.apply(null, ys) - y, girado: girado };
}






function _canPintar(padre, r, fill, ref, cls, z) {
  var cv = document.createElement('div');
  cv.className = (cls ? cls + ' ' : '') + 'bornera-canaleta';
  cv.dataset.lado = r.lado;
  if (ref) cv.dataset.canaletaRef = ref;
  cv.style.cssText = 'position:absolute;left:' + r.x + 'px;top:' + r.y +
    'px;width:' + r.w + 'px;height:' + r.h + 'px;' +
    'background:' + fill + ';border:2px solid #000;box-sizing:border-box;' +
    (z == null ? '' : ('z-index:' + z + ';pointer-events:none;'));
  padre.appendChild(cv);
  return cv;
}






var CAN_CAMPOS_CFG = ['anchoMm', 'lados', 'color', 'sepMm', 'sepLados', 'sobranteMm'];
function _canCopiaCfg(c, cambios) {
  var o = {};
  CAN_CAMPOS_CFG.forEach(function(k) { if (c && c[k] !== undefined) o[k] = c[k]; });
  if (cambios) Object.keys(cambios).forEach(function(k) { o[k] = cambios[k]; });
  return o;
}







function _canaletaFlancoColumnaPx(side, cfg) {
  var c = cfg || (window._CANALETAS_ITM || {})[side];
  if (!c || !c.anchoMm) return 0;
  if (!(window._itmList || []).some(function(i) { return i.side === side; })) return 0;
  var lado = (side === 'left') ? 'izq' : 'der';
  var sep = (c.sepLados && typeof c.sepLados[lado] === 'number') ? c.sepLados[lado]
          : (typeof c.sepMm === 'number' ? c.sepMm : BORN_CANALETA_SEP * PX_TO_MM);
  return (c.anchoMm + sep) / PX_TO_MM;
}




function _canaletaColumnaCorrimientoPx(side) {
  if (typeof _canaletaColumnaGeomBase !== 'function') return 0;
  var b = _canaletaColumnaGeomBase(side), g = _canaletaColumnaGeom(side);
  if (!b || !g) return 0;
  var x = g.x, w = g.w;
  var fx = (window._canFusionColX || {})[side];
  if (typeof fx === 'number') x = fx;
  var d = (side === 'left') ? (b.x - x) : ((x + w) - (b.x + b.w));
  return d > 0 ? d : 0;
}






var CAN_GUIA_COLOR = '#8d8d8d';
function _canGuiaLinea(container, col, x, y, w, h, vertical, ref) {
  var g = document.createElement('div');
  g.className = 'canaleta-guia';
  if (ref) g.dataset.ref = ref;
  g.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;' +
    (vertical ? ('width:0;height:' + h + 'px;border-left:4px dashed ' + col + ';')
              : ('height:0;width:' + w + 'px;border-top:4px dashed ' + col + ';')) +
    'box-sizing:border-box;z-index:7;pointer-events:none;opacity:0.7;';
  container.appendChild(g);
  return g;
}



function _canGuiaNombre(container, col, nombre, x, y, ref, eje) {
  if (!nombre) return;
  var t = document.createElement('div');
  t.className = 'canaleta-guia canaleta-guia-nom';
  if (ref) t.dataset.ref = ref;
  if (eje) {
    t.dataset.eje = eje.dir;
    if (typeof eje.min === 'number') t.dataset.ejeMin = String(eje.min);
    if (typeof eje.max === 'number') t.dataset.ejeMax = String(eje.max);
  }
  t.textContent = nombre;
  t.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;' +
    'font:700 40px "Segoe UI",Arial,sans-serif;color:' + col + ';' +
    'background:rgba(255,255,255,0.85);padding:0 10px;border-radius:8px;' +
    'line-height:52px;white-space:nowrap;z-index:8;pointer-events:none;' +
    'transform:translate(-50%,-50%);';
  container.appendChild(t);
}

function _canGuiaEjeTramo(r) {
  if (r.lado === 'arriba' || r.lado === 'abajo') return { dir: 'h', min: r.x + 60, max: r.x + r.w - 60 };
  return { dir: 'v', min: r.y + 30, max: r.y + r.h - 30 };
}





function _canGuiasEsquivar(container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return;
  var noms = [].slice.call(container.querySelectorAll('.canaleta-guia-nom'));
  if (!noms.length) return;
  var cr = container.getBoundingClientRect();
  var k = container.offsetWidth ? cr.width / container.offsetWidth : 0;
  if (!k) return;
  function caja(el) {
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return { x: (r.left - cr.left) / k, y: (r.top - cr.top) / k, w: r.width / k, h: r.height / k };
  }
  var obst = [].slice.call(container.querySelectorAll(
    '.itm-rotulo, .canaleta-tri, .bornera-tri, .itm-tri, .tri-clickeable'))
    .map(caja).filter(function(b) { return !!b; });
  var M = 6;
  function choca(b) {
    for (var i = 0; i < obst.length; i++) {
      var o = obst[i];
      if (b.x < o.x + o.w + M && b.x + b.w + M > o.x && b.y < o.y + o.h + M && b.y + b.h + M > o.y) return true;
    }
    return false;
  }
  noms.forEach(function(n) {
    var b = caja(n);
    if (!b) return;
    var cx = parseFloat(n.style.left) || 0, cy = parseFloat(n.style.top) || 0;
    var dir = n.dataset.eje || 'v';
    var mn = parseFloat(n.dataset.ejeMin), mx = parseFloat(n.dataset.ejeMax);
    var mejor = null;
    for (var i = 0; i <= 60 && mejor === null; i++) {
      var off = 30 * Math.ceil(i / 2) * ((i % 2) ? 1 : -1);
      var nx = cx + (dir === 'h' ? off : 0), ny = cy + (dir === 'v' ? off : 0);
      var pos = (dir === 'h') ? nx : ny;
      if (!isNaN(mn) && pos < mn) continue;
      if (!isNaN(mx) && pos > mx) continue;
      var cand = { x: b.x + (nx - cx), y: b.y + (ny - cy), w: b.w, h: b.h };
      if (!choca(cand)) mejor = { x: nx, y: ny, b: cand };
    }
    if (mejor) {
      n.style.left = mejor.x + 'px';
      n.style.top = mejor.y + 'px';
      obst.push(mejor.b);
    } else {
      obst.push(b);
    }
  });
}


function _canGuiasTramos(container, rs, nombre, ref) {
  var primero = null;
  rs.forEach(function(r) {
    if (r.lado === 'arriba' || r.lado === 'abajo') {
      _canGuiaLinea(container, CAN_GUIA_COLOR, r.x, r.y + r.h / 2, r.w, 0, false, ref);
    } else {
      _canGuiaLinea(container, CAN_GUIA_COLOR, r.x + r.w / 2, r.y, 0, r.h, true, ref);
    }
    if (!primero || r.y < primero.y || (r.y === primero.y && r.x < primero.x)) primero = r;
  });
  if (primero) {
    var hz = (primero.lado === 'arriba' || primero.lado === 'abajo');
    _canGuiaNombre(container, CAN_GUIA_COLOR, nombre,
      primero.x + (hz ? 120 : primero.w / 2), primero.y + (hz ? primero.h / 2 : 60), ref,
      _canGuiaEjeTramo(primero));
  }
}







function _canaletasFila() {
  if (!window._CANALETAS_FILA) window._CANALETAS_FILA = {};
  return window._CANALETAS_FILA;
}
function _canaletaFilaKey(f) {
  return (f && f.miembros && f.miembros.length) ? f.miembros[0] : null;
}







function _canaletaKeyFila(key) {
  var cf = _canaletasFila();
  if (!key || cf[key]) return key;
  var f = _canaletaFilaBuscar(key);
  if (!f) return key;
  for (var i = 0; i < f.miembros.length; i++) if (cf[f.miembros[i]]) return f.miembros[i];
  return key;
}






function _canaletaFilaDeItm(itmId, tipo) {
  var buscado = (tipo || 'cont') + ':' + itmId;
  var filas = _bornerasFilasInf();
  for (var i = 0; i < filas.length; i++) {
    if (filas[i].miembros.indexOf(buscado) !== -1) {
      return _canaletaKeyFila(_canaletaFilaKey(filas[i]));
    }
  }
  return null;
}






function _canaletaFilaBuscar(key, container) {
  var filas = _bornerasFilasInf(container);
  for (var i = 0; i < filas.length; i++) {
    if (filas[i].miembros.indexOf(key) !== -1) return filas[i];
  }
  return null;
}






function _canaletaFilaTraspasar(key) {
  var cf = _canaletasFila();
  if (!key || !cf[key]) return false;
  var f = _canaletaFilaBuscar(key);
  if (!f) return false;
  var otros = f.miembros.filter(function(m) { return m !== key && m.indexOf('grp:') !== 0; });
  if (!otros.length) return false;
  cf[otros[0]] = cf[key];
  delete cf[key];
  return true;
}


function _canaletaCfgDeRef(r) {
  if (!r) return null;
  if (r.indexOf('fila:') === 0) return _canaletasFila()[_canaletaKeyFila(r.slice(5))] || null;
  if (r.indexOf('itm:') === 0) return _canaletasItm()[r.slice(4)] || null;
  if (r === 'presencia') return window._PRESENCIA_CANALETA || null;
  var g = _bornerasGrupoPorId(r);
  return (g && g.canaleta) || null;
}










function canaletasTodas() {
  var out = [];
  if (window._PRESENCIA_CANALETA) {
    out.push({ ref: 'presencia', clase: 'presencia', cfg: window._PRESENCIA_CANALETA });
  }
  (window._BORNERAS_GRUPOS || []).forEach(function(g) {
    if (g && g.canaleta) out.push({ ref: g.id, clase: 'grupo', cfg: g.canaleta });
  });
  var cf = _canaletasFila();
  Object.keys(cf).forEach(function(k) { if (cf[k]) out.push({ ref: 'fila:' + k, clase: 'fila', cfg: cf[k] }); });
  var ci = _canaletasItm();
  Object.keys(ci).forEach(function(sd) { if (ci[sd]) out.push({ ref: 'itm:' + sd, clase: 'col', cfg: ci[sd] }); });
  return out;
}

function canaletaClase(ref) {
  if (ref === 'presencia') return 'presencia';
  if (String(ref).indexOf('fila:') === 0) return 'fila';
  if (String(ref).indexOf('itm:') === 0) return 'col';
  return 'grupo';
}





var CAN_PERSISTE = [
  { clave: 'canaletasFila',     global: '_CANALETAS_FILA',     vacio: function() { return {}; } },
  { clave: 'canaletasItm',      global: '_CANALETAS_ITM',      vacio: function() { return {}; } },
  { clave: 'presenciaCanaleta', global: '_PRESENCIA_CANALETA', vacio: function() { return null; } }
];
function canaletasGuardarEn(o) {
  CAN_PERSISTE.forEach(function(p) { o[p.clave] = window[p.global] || p.vacio(); });
  return o;
}
function canaletasReset() {
  CAN_PERSISTE.forEach(function(p) { window[p.global] = p.vacio(); });
}

function canaletasRestaurarDe(s) {
  CAN_PERSISTE.forEach(function(p) {
    var v = s && s[p.clave];
    window[p.global] = (v && typeof v === 'object') ? v : p.vacio();
  });






  var conCont = {}, conDif = {};
  ((s && s.itmList) || []).forEach(function(i) {
    if (i && i.contactor) conCont[i.id] = true;
    if (i && i.dif)       conDif[i.id]  = true;
  });
  Object.keys(window._CANALETAS_FILA).forEach(function(k) {
    var m = /^(cont|dif):(.+)$/.exec(k);
    if (!m) return;
    var vive = (m[1] === 'cont') ? conCont[m[2]] : conDif[m[2]];
    if (!vive) {
      console.warn('[PM.open] canaleta de fila huerfana descartada:', k);
      delete window._CANALETAS_FILA[k];
    }
  });


  canaletasTodas().forEach(function(c) {
    if ((c.clase === 'grupo' || c.clase === 'presencia') && c.cfg.fusionDominante === 'tira') {
      c.cfg.dominaTira = true;
      delete c.cfg.fusionDominante;
    }
  });



  var _filaDom = null, _cfR = _canaletasFila();
  Object.keys(_cfR).forEach(function(k) {
    if (_cfR[k] && _cfR[k].fusionColumnas && _cfR[k].fusionDominante && _cfR[k].fusionDominante !== 'col') _filaDom = _cfR[k].fusionDominante;
  });
  var _tiraDom = null;
  canaletasTodas().forEach(function(c) {
    if ((c.clase === 'grupo' || c.clase === 'presencia') && c.cfg.dominaTira && !_tiraDom) _tiraDom = 'tira:' + c.ref;
  });
  if (_filaDom && _tiraDom) console.warn('[canaletas] fila y tira dominantes a la vez: queda la fila');
  _canaletaUnSoloDominante(_filaDom || _tiraDom);
}







function _canaletasItm() {
  if (!window._CANALETAS_ITM) window._CANALETAS_ITM = {};
  return window._CANALETAS_ITM;
}






function _cajaLocalEl(el) {
  var x = parseFloat(el.style.left) || 0, y = parseFloat(el.style.top) || 0;
  var w = parseFloat(el.style.width) || el.offsetWidth || 0;
  var h = parseFloat(el.style.height) || el.offsetHeight || 0;
  var t = el.style.transform || '';
  var m = /rotate\((-?\d+(?:\.\d+)?)deg\)/.exec(t);
  if (m && Math.abs(Math.abs(parseFloat(m[1])) - 90) < 0.5) {
    var cx = x + w / 2, cy = y + h / 2;
    return { izq: cx - h / 2, der: cx + h / 2, top: cy - w / 2, bot: cy + w / 2 };
  }
  return { izq: x, der: x + w, top: y, bot: y + h };
}




function _itmColumnaCaja(side, container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return null;
  var b = null;



  container.querySelectorAll(
    '.itm-img, .dif-img:not(.dif-inferior), .dps-img, ' +
    '.contactor-img:not(.contactor-inferior)').forEach(function(el) {
    if (el.classList.contains('itm-tri') || el.classList.contains('dif-tri') ||
        el.classList.contains('contactor-tri') || el.classList.contains('dps-tri')) return;
    var id = el.dataset.itmId || el.dataset.difItmId ||
             el.dataset.dpsItmId || el.dataset.contactorItmId;
    var itm = (id && _buscarITM) ? _buscarITM(id) : null;
    if (!itm || (itm.side || 'left') !== side) return;
    var c = _cajaLocalEl(el);
    b = b ? { izq: Math.min(b.izq, c.izq), der: Math.max(b.der, c.der),
              top: Math.min(b.top, c.top), bot: Math.max(b.bot, c.bot) }
          : c;
  });
  return b;
}




function _canaletaColumnaGeomBase(side, container) {
  var cfg = _canaletasItm()[side];
  if (!cfg) return null;
  var caja = _itmColumnaCaja(side, container);
  if (!caja) return null;
  var lado = (side === 'left') ? 'izq' : 'der';
  var can = _bornerasCanaleta({ canaleta: _canCopiaCfg(cfg, { lados: [lado] }) },
    { w: caja.der - caja.izq, h: caja.bot - caja.top }, 0, 1);
  if (!can || !can.rects.length) return null;
  var r = can.rects[0];
  return { x: caja.izq + r.x, w: r.w, top: caja.top + r.y, bot: caja.top + r.y + r.h,
           can: can, caja: caja, lado: r.lado };
}




function _canaletaColumnaGeom(side, container) {
  var g = _canaletaColumnaGeomBase(side, container);
  var p = g && (window._canFusionTira || {})[side];
  if (p) {
    if (typeof p.x === 'number') { g.x = p.x; g.w = p.w; }
    if (p.top < g.top) g.top = p.top;
  }
  return g;
}




window._canFusionCol = {};



window._canFusionColX = {};

function _dibujarCanaletasItm(container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return;
  container.querySelectorAll('.canaleta-itm').forEach(function(el) { el.remove(); });
  ['left', 'right'].forEach(function(side) {
    var g = _canaletaColumnaGeom(side, container);
    if (!g) return;


    var bot = g.bot;
    var fy = (window._canFusionCol || {})[side];
    if (typeof fy === 'number' && fy > bot) bot = fy;



    var fx = (window._canFusionColX || {})[side];
    if (typeof fx === 'number') g.x = fx;
    _canPintar(container, { lado: g.lado, x: g.x, y: g.top, w: g.w, h: bot - g.top },
               g.can.fill, 'itm:' + side, 'canaleta-itm', 5);


    if (typeof fy === 'number') return;
    _bornerasTrianguloCanaleta(container, g.can, 'itm:' + side,
                               g.caja.izq, g.caja.top, 'canaleta-itm',
                               { x: g.x - g.caja.izq, y: g.top - g.caja.top });
  });
  _canaletaFusionarTiras(container);
}










function _canaletaTiraCfg(ref) {
  if (ref === 'presencia') return window._PRESENCIA_CANALETA || null;
  var g = _bornerasGrupoPorId(ref);
  return (g && g.canaleta) || null;
}

function _canaletaPiezasDe(ref, container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return [];
  return [].map.call(container.querySelectorAll('.bornera-canaleta[data-canaleta-ref="' + ref + '"]'),
    function(el) {
      var b = _canCajaEnContainer(el, container);
      return b ? { el: el, lado: el.dataset.lado, x: b.x, y: b.y, w: b.w, h: b.h, girado: b.girado } : null;
    }).filter(function(c) { return !!c; });
}




function _canaletaUnSoloDominante(quien) {
  if (!quien) return;
  if (quien.indexOf('tira:') === 0) {
    var cf = _canaletasFila();
    Object.keys(cf).forEach(function(k) {
      if (cf[k] && cf[k].fusionColumnas && cf[k].fusionDominante) delete cf[k].fusionDominante;
    });
    canaletasTodas().forEach(function(c) {
      if ((c.clase === 'grupo' || c.clase === 'presencia') && 'tira:' + c.ref !== quien) delete c.cfg.dominaTira;
    });
  } else {
    canaletasTodas().forEach(function(c) {
      if (c.clase === 'grupo' || c.clase === 'presencia') delete c.cfg.dominaTira;
    });
  }
}




function _canaletaNumFila(ref) {
  var key = ref.slice(5), filas = _bornerasFilasInf();
  for (var i = 0; i < filas.length; i++) {
    if (_canaletaFilaKey(filas[i]) === key || filas[i].miembros.indexOf(key) !== -1) return i + 1;
  }
  return 0;
}
function _canaletaDesc(ref, side) {
  if (typeof ref !== 'string' || !ref) return '';
  if (ref.indexOf('itm:') === 0) {
    return 'lado ' + (ref.slice(4) === 'left' ? 'izquierdo' : 'derecho') + ' del panel busbar';
  }
  if (ref.indexOf('fila:') === 0) {
    var n = _canaletaNumFila(ref);
    return n ? ('fila ' + n + ' inferior') : 'fila inferior';
  }
  var _grD = _bornerasGrupoPorId(ref);
  if (_grD && _grD.lugar === 'pila') _grD = _bornPilaRaiz(_grD);
  var l = (ref === 'presencia') ? 'der' : _canaletaTiraJuntoIG(_grD);
  if (l) return 'lado ' + (l === 'izq' ? 'izquierdo' : 'derecho') + ' del IG';
  if (_grD && /^(pe|n)-(arriba|abajo)$/.test(_grD.lugar || '')) {
    var _pz = _grD.lugar.split('-');
    return _pz[1] + ' de la barra ' + (_pz[0] === 'pe' ? 'de tierra' : 'de neutro');
  }
  return side ? ('arriba, ' + (side === 'left' ? 'izquierda' : 'derecha')) : 'arriba';
}



function _canaletaOrdenTablero(refs) {
  function peso(r) {
    if (r.indexOf('itm:') === 0) return 100 + (r === 'itm:left' ? 0 : 1);
    if (r.indexOf('fila:') === 0) return 200 + _canaletaNumFila(r);
    var _gO = _bornerasGrupoPorId(r);
    if (_gO && (_gO.lugar === 'pila' || /^(pe|n)-(arriba|abajo)$/.test(_gO.lugar || ''))) {

      var _rz = _bornPilaRaiz(_gO), _st = _rz ? [_rz].concat(_bornPilaSobre(_rz)) : [_gO];
      return 300 + (_st.length - _st.indexOf(_gO));
    }
    var l = (r === 'presencia') ? 'der' : _canaletaTiraJuntoIG(_gO);
    return l === 'der' ? 1 : 0;
  }
  return refs.slice().sort(function(a, b) { return peso(a) - peso(b); });
}

function _canaletaNomDesc(ref, nombres, side) {
  var n = (nombres || _canaletaNombresSueltos())[ref] || 'CA';
  var d = _canaletaDesc(ref, side);
  return d ? (n + ' · ' + d) : n;
}



function _canaletaTiraJuntoIG(gr) {
  if (!gr) return null;
  if (gr.lugar === 'ig-izq') return 'izq';
  if (gr.lugar === 'ig-der') return 'der';
  return null;
}


function _canTiraDomina(cfg) {
  return !!(cfg && (cfg.dominaTira || cfg.fusionDominante === 'tira'));
}



function _canaletaTirasFusionables(container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return [];
  var refs = canaletasTodas().filter(function(c) {
    return c.clase === 'presencia' || c.clase === 'grupo';
  }).map(function(c) { return c.ref; });
  var anchoCont = parseFloat(container.style.width) || container.offsetWidth || 0;
  var out = [];
  refs.forEach(function(ref) {
    var cajas = _canaletaPiezasDe(ref, container);
    if (!cajas.length || cajas.some(function(c) { return c.girado; })) return;
    var izq = Infinity, der = -Infinity, top = Infinity, bot = -Infinity;
    cajas.forEach(function(c) {
      izq = Math.min(izq, c.x); der = Math.max(der, c.x + c.w);
      top = Math.min(top, c.y); bot = Math.max(bot, c.y + c.h);
    });
    var side = ((izq + der) / 2 < anchoCont / 2) ? 'left' : 'right';
    var col = _canaletaColumnaGeomBase(side, container);
    if (!col || bot > col.top + 1) return;
    var hs = cajas.filter(function(c) { return c.lado === 'arriba' || c.lado === 'abajo'; })
                  .sort(function(a, b) { return a.y - b.y; });
    if (!hs.length) return;
    var lado = (side === 'left') ? 'izq' : 'der', vT = null;
    cajas.forEach(function(c) { if (c.lado === lado) vT = c; });
    out.push({ ref: ref, side: side, caja: { izq: izq, der: der, top: top, bot: bot },
               cajas: cajas, hs: hs, hTop: hs[0], hBot: hs[hs.length - 1], vT: vT });
  });
  return out;
}





window._canFusionTira = {};
function _canaletaPlanTiras(container) {
  window._canFusionTira = {};
  _canaletaTirasFusionables(container).forEach(function(t) {
    var cfg = _canaletaTiraCfg(t.ref);
    if (!cfg || !cfg.fusionColumna) return;
    var domTira = _canTiraDomina(cfg) && !!t.vT;
    var plan = domTira ? { x: t.vT.x, w: t.vT.w, top: t.vT.y } : { top: t.hTop.y };






    if (!domTira) {
      var colB = _canaletaColumnaGeomBase(t.side, container);
      if (colB && t.side === 'left' && t.caja.izq < colB.x) {
        plan.x = t.caja.izq; plan.w = colB.w;
      } else if (colB && t.side === 'right' && t.caja.der > colB.x + colB.w) {
        plan.x = t.caja.der - colB.w; plan.w = colB.w;
      }
    }
    plan.ref = t.ref; plan.domTira = domTira; plan.t = t;
    var prev = window._canFusionTira[t.side];
    if (!prev || plan.top < prev.top) window._canFusionTira[t.side] = plan;
  });
}








function _canaletaFusionarTiras(container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return;
  var plan = window._canFusionTira || {};
  var guias = [];
  Object.keys(plan).forEach(function(side) {
    var p = plan[side], t = p.t;
    var colEl = container.querySelector('.canaleta-itm[data-canaleta-ref="itm:' + side + '"]');
    if (!colEl || !t) return;
    var cx = parseFloat(colEl.style.left) || 0, cw = parseFloat(colEl.style.width) || 0;
    if (t.vT && t.vT.el.parentNode) t.vT.el.parentNode.removeChild(t.vT.el);





    t.hs.forEach(function(h) {
      var x0 = (side === 'left') ? (cx + cw - 2) : h.x;
      var x1 = (side === 'left') ? (h.x + h.w) : (cx + 2);
      if (x0 === h.x && x1 === h.x + h.w) return;


      var dl = h.x - (parseFloat(h.el.style.left) || 0);
      h.el.style.left = (x0 - dl) + 'px';
      h.el.style.width = (x1 - x0) + 'px';
    });
    container.querySelectorAll('.canaleta-tri[data-canaleta-ref="' + t.ref + '"]').forEach(function(el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    container.querySelectorAll('.canaleta-tri').forEach(function(tri) {
      var rs = _canaletaRefsDe(tri);
      if (rs.indexOf('itm:' + side) !== -1 && rs.indexOf(t.ref) === -1) {
        tri.dataset.canaletaRefs = rs.concat([t.ref]).join('|');
      }
    });
    guias.push({ side: side, t: t });
  });





  if (!guias.length) return;
  var nom = _canaletaNombresSueltos(container);
  guias.forEach(function(gq) {
    _canGuiasTramos(container, gq.t.cajas, nom[gq.t.ref], gq.t.ref);
    var refC = 'itm:' + gq.side;
    if (container.querySelector('.canaleta-guia[data-ref="' + refC + '"]')) return;
    var gC = _canaletaColumnaGeomBase(gq.side, container);
    if (!gC) return;
    _canGuiaLinea(container, CAN_GUIA_COLOR, gC.x + gC.w / 2, gC.top, 0, gC.bot - gC.top, true, refC);
    _canGuiaNombre(container, CAN_GUIA_COLOR, nom[refC], gC.x + gC.w / 2, gC.top + 60, refC,
                   { dir: 'v', min: gC.top + 30, max: gC.bot - 30 });
  });
}








function _canaletaBorrarRef(ref) {
  if (!ref) return;
  if (ref.indexOf('itm:') === 0) {
    var sdB = ref.slice(4);

    _canaletaTirasFusionables().forEach(function(t) {
      if (t.side !== sdB) return;
      var ct = _canaletaTiraCfg(t.ref);
      if (ct) { delete ct.fusionColumna; delete ct.dominaTira; delete ct.fusionDominante; }
    });
    delete _canaletasItm()[sdB];

    if (!Object.keys(_canaletasItm()).length) {
      var cf = _canaletasFila();
      Object.keys(cf).forEach(function(k) {
        if (cf[k] && cf[k].fusionColumnas) { delete cf[k].fusionColumnas; delete cf[k].fusionDominante; }
      });
    }
    return;
  }
  if (ref === 'presencia') {
    window._PRESENCIA_CANALETA = null;
    _canaletaSoltarDentro('presencia');
    return;
  }
  if (ref.indexOf('fila:') === 0) {
    var k = _canaletaKeyFila(ref.slice(5));
    delete _canaletasFila()[k];



    var _fK = _canaletaFilaBuscar(k);
    var _miembrosK = (_fK && _fK.miembros) || [k];
    (_bornerasGrupos() || []).forEach(function(g) {
      if (typeof g.dentroCanaleta === 'boolean' && _miembrosK.indexOf(_grupoFilaRef(g)) !== -1) {
        delete g.dentroCanaleta;
      }
    });
    return;
  }
  var g = _bornerasGrupoPorId(ref);
  if (g) { delete g.canaleta; _canaletaSoltarDentro(g.id); }
}

function _canaletaSoltarDentro(refRaiz) {
  var a = _bornerasGrupoDe('junto', refRaiz), guard = 0;
  while (a && guard++ < 30) {
    delete a.dentro;
    a = _bornerasGrupoDe('junto', a.id);
  }
}


function _canaletaIgualarFusionTira(ref) {
  var plan = window._canFusionTira || {};
  Object.keys(plan).forEach(function(sd) {
    var p = plan[sd];
    var colC = _canaletasItm()[sd], tiraC = _canaletaTiraCfg(p.ref);
    if (!colC || !tiraC || !tiraC.fusionColumna) return;
    var src = (ref === 'itm:' + sd) ? colC : (ref === p.ref ? tiraC : null);
    if (!src) return;
    var dst = (src === colC) ? tiraC : colC;
    dst.anchoMm = src.anchoMm;
    if (src.color) dst.color = src.color;
  });
}









function _grupoDentroCanaleta(gr) {
  var a = gr, g = 0;
  while (a && g++ < 20) {
    if (typeof a.dentroCanaleta === 'boolean') return a.dentroCanaleta;
    if (a.lugar !== 'junto') return false;
    a = _bornerasGrupoPorId(a.ref);
  }
  return false;
}







function _canaletaOrdenFila(ids, cfg) {
  if (!cfg || !cfg.excluidos || cfg._enBloque) return null;
  var dentro = [], fuera = [];
  ids.forEach(function(id, k) { (cfg.excluidos[id] ? fuera : dentro).push(k); });
  if (!fuera.length || !dentro.length) return null;
  return dentro.concat(fuera);
}



function _canaletaHuecosFila(ids, cfg) {
  var antes = ids.map(function() { return 0; });
  if (!cfg || !cfg.excluidos || cfg._enBloque) return antes;
  var primeroFuera = -1;
  ids.forEach(function(id, k) { if (primeroFuera === -1 && cfg.excluidos[id]) primeroFuera = k; });
  if (primeroFuera <= 0) return antes;                                
  if ((cfg.lados || []).indexOf('der') === -1) return antes;                                            
  var sep = (cfg.sepLados && typeof cfg.sepLados.der === 'number') ? cfg.sepLados.der
          : ((typeof cfg.sepMm === 'number') ? cfg.sepMm : 10);
  antes[primeroFuera] = (2 * sep + (cfg.anchoMm || 40)) / PX_TO_MM;
  return antes;
}




function _canaletaCajaFila(f, cfg) {

  var ex = (cfg && !cfg._enBloque && cfg.excluidos) || {};
  var b = null;
  (f.miembros || []).forEach(function(id) {
    if (ex[id]) return;
    var c = f.cajas && f.cajas[id];
    if (!c) return;
    b = b ? { izq: Math.min(b.izq, c.x), der: Math.max(b.der, c.x + c.w),
              top: Math.min(b.top, c.y), bot: Math.max(b.bot, c.y + c.h) }
          : { izq: c.x, der: c.x + c.w, top: c.y, bot: c.y + c.h };
  });

  return b || { izq: f.izq, der: f.der, top: f.top, bot: f.bot };
}









var BORN_CANALETA_ANCHOS_MM = [25, 30, 40, 50, 60, 70, 80];
var BORN_CANALETA_SOBRANTE  = 100;                               
var BORN_CANALETA_SEP       = 50;                                                  



var BORN_CANALETA_SEP_COL   = 250;                     



var BORN_CANALETA_COLORES   = { gris: '#c4c4c4', celeste: '#a8d4e8' };
var BORN_CANALETA_COLOR_DEF = 'gris';
var BORN_CANALETA_LADOS     = ['arriba', 'abajo', 'izq', 'der'];






function _bornerasCanaletaDueno(gr) {
  var a = gr, g = 0;
  while (a && a.lugar === 'junto' && g++ < 20) {
    if (a.ref === 'presencia') return 'presencia';
    var p = _bornerasGrupoPorId(a.ref);
    if (!p) break;
    a = p;
  }
  return a ? a.id : gr.id;
}




function _bornerasLargoDentro(gr) {
  if (!gr || gr.dentro) return 0;
  var total = 0, a = _bornerasGrupoDe('junto', gr.id), g = 0;
  while (a && a.dentro && g++ < 20) {
    total += _bornerasDims(a).w;
    a = _bornerasGrupoDe('junto', a.id);
  }
  return total;
}




var CANALETA_HOLGURA = 125;              









function _canaletaNormalizarFusion(cfgs) {





  (cfgs || []).forEach(function(c, i) {
    if (c && c.fusionArriba && (i === 0 || !cfgs[i - 1])) delete c.fusionArriba;
  });
  var prevFusCol = false;
  (cfgs || []).forEach(function(c) {
    if (!c) { prevFusCol = false; return; }
    if (c.fusionColumnas && prevFusCol) {
      c.fusionArriba = true;
      delete c.fusionColumnas;
    }
    prevFusCol = c.fusionArriba ? prevFusCol : !!c.fusionColumnas;
  });




  (cfgs || []).forEach(function(c, i) {
    if (!c) return;
    var sig = cfgs[i + 1];
    var en = !!(c.fusionArriba || c.fusionColumnas || (sig && sig.fusionArriba));
    Object.defineProperty(c, '_enBloque', { value: en, writable: true, configurable: true, enumerable: false });
  });


  var cadena = [];
  function _cerrar() {
    var conCol = cadena.some(function(c) { return !!c.fusionColumnas; });
    cadena.forEach(function(c) {
      Object.defineProperty(c, '_bloqueConCol', { value: conCol, writable: true, configurable: true, enumerable: false });
    });
    cadena = [];
  }
  (cfgs || []).forEach(function(c) {
    if (!c) { _cerrar(); return; }
    if (!c.fusionArriba) _cerrar();
    cadena.push(c);
  });
  _cerrar();
}


function _canaletaCfgDeIds(ids) {
  var cfgs = window._CANALETAS_FILA;
  if (!cfgs || !ids) return null;
  for (var i = 0; i < ids.length; i++) if (cfgs[ids[i]]) return cfgs[ids[i]];
  return null;
}



function _canaletaAnchoEfectivoRef(ref) {
  if (typeof ref !== 'string' || ref.indexOf('fila:') !== 0) return 0;
  var key = ref.slice(5), cfgs = _canaletasFila();
  var filas = _bornerasFilasInf(), lista = [], idx = -1;
  for (var i = 0; i < filas.length; i++) {
    if (_canaletaFilaKey(filas[i]) === key || filas[i].miembros.indexOf(key) !== -1) { idx = i; break; }
  }
  if (idx < 0) return 0;



  var ini = idx;
  while (ini > 0) {
    var c = _canaletaCfgDeIds(filas[ini].miembros);
    if (!c || !c.fusionArriba || !_canaletaCfgDeIds(filas[ini - 1].miembros)) break;
    ini--;
  }
  var f = ini;
  while (f < filas.length) {
    var cf = _canaletaCfgDeIds(filas[f].miembros);
    if (!cf) break;
    if (f > ini && !cf.fusionArriba) break;
    lista.push(cf);
    f++;
  }
  return (lista.length > 1) ? _canaletaAnchoBloque(lista) : 0;
}





function _canaletaAnchoBloque(lista) {
  var a = 0;
  (lista || []).forEach(function(c) { if (c && c.anchoMm > a) a = c.anchoMm; });
  return a;
}





function _canaletaSobrealtoGrupos(ids, hFila) {
  var max = 0;
  (_bornerasGrupos() || []).forEach(function(g) {
    var fr = _grupoFilaRef(g);
    if (!fr || !ids || ids.indexOf(fr) === -1) return;
    if (!_grupoDentroCanaleta(g)) return;
    var d = _bornerasDims(g);
    var hg = d.hTotal || d.h || 0;
    if (hg > max) max = hg;
  });
  return Math.max(0, (max - (hFila || 0)) / 2);
}





function _canaletaFilaExtrasIds(ids, w, h, anchoEff) {
  var vacio = { arriba: 0, abajo: 0 };
  var cfg = _canaletaCfgDeIds(ids);
  if (!cfg) return vacio;
  if (anchoEff && anchoEff !== cfg.anchoMm) {
    var _bcc = !!cfg._bloqueConCol;
    cfg = _canCopiaCfg(cfg, { anchoMm: anchoEff, fusionArriba: cfg.fusionArriba });
    if (_bcc) Object.defineProperty(cfg, '_bloqueConCol', { value: true, enumerable: false });
  }
  var conCol = !!cfg._bloqueConCol;
  var can = _bornerasCanaleta({ canaleta: cfg }, { w: w, h: h }, 0, 1,
                              { sinArriba: !!cfg.fusionArriba });
  if (!can) return vacio;


  var sob = _canaletaSobrealtoGrupos(ids, h);






  return { arriba: can.extra.arriba + sob, abajo: can.extra.abajo + sob,
           izq: conCol ? 0 : can.extra.izq, der: conCol ? 0 : can.extra.der,
           conCol: conCol, izqPropio: can.extra.izq, derPropio: can.extra.der,
           fusionArriba: !!cfg.fusionArriba };
}




function _canaletaFaltaHueco(ocupado, gap) {




  if (!ocupado) return 0;
  return Math.max(0, CANALETA_HOLGURA - (gap - ocupado));
}





function _canaletaFilaExtras(topRel) {
  var vacio = { arriba: 0, abajo: 0 };
  var cfgs = window._CANALETAS_FILA;
  if (!cfgs) return vacio;
  var filas = _bornerasFilasInf();
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];



    if (Math.abs((f.topEq !== undefined ? f.topEq : f.top) - topRel) > 2) continue;
    var cfg = _canaletaCfgDeIds(f.miembros);
    if (!cfg) return vacio;
    var caja = _canaletaCajaFila(f, cfg);
    var can = _bornerasCanaleta({ canaleta: cfg },
      { w: caja.der - caja.izq, h: caja.bot - caja.top }, 0, 1,
      { sinArriba: !!cfg.fusionArriba });
    if (!can) return vacio;



    var topEq = (f.topEq !== undefined) ? f.topEq : f.top;
    var botEq = (f.botEq !== undefined) ? f.botEq : f.bot;
    return { arriba: topEq - (caja.top - can.extra.arriba),
             abajo: (caja.bot + can.extra.abajo) - botEq };
  }
  return vacio;
}





















function _canaletaTiraBarraFusionada() {
  if (typeof _bornerasGrupoDe !== 'function') return null;
  var gr = _bornPilaTope(_barraPrimeraTira());
  if (!gr || !gr.canaleta || !gr.canaleta.fusionArriba) return null;
  var fs = (typeof _bornerasFilasInf === 'function') ? _bornerasFilasInf() : [];
  if (!fs.length) return null;
  var cU = _canaletaCfgDeIds(fs[fs.length - 1].miembros);
  if (!cU || (cU.lados || []).indexOf('abajo') === -1) return null;
  return gr;
}



function _canaletaTiraBarraItems(container) {
  if (typeof _bornerasGrupoDe !== 'function') return [];
  var raiz = _barraPrimeraTira();
  if (!raiz) return [];
  return [raiz].concat(_bornPilaSobre(raiz)).reverse().map(function(g) {
    var it = _canaletaItemDeTira(g, container);
    return (it && it.cfg) ? it : null;
  });
}
function _canaletaTiraBarraItem(container) {
  if (typeof _bornerasGrupoDe !== 'function') return null;
  return _canaletaItemDeTira(_bornPilaTope(_barraPrimeraTira()), container);
}


function _canaletaItemDeTira(gr, container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container || !gr) return null;
  var izq = Infinity, der = -Infinity, top = Infinity, bot = -Infinity, a = gr, g = 0;
  while (a && g++ < 30) {
    var w = container.querySelector('.bornera-wrap[data-born-grupo-id="' + a.id + '"]');
    if (w && !w.dataset.rotado) {
      var cx = parseFloat(w.dataset.visCx), cy = parseFloat(w.dataset.visCy);
      var tw = parseFloat(w.dataset.tiraW), th = parseFloat(w.dataset.tiraH);
      if (!isNaN(cx) && !isNaN(cy) && !isNaN(tw) && !isNaN(th)) {
        izq = Math.min(izq, cx - tw / 2); der = Math.max(der, cx + tw / 2);
        top = Math.min(top, cy - th / 2); bot = Math.max(bot, cy + th / 2);
      }
    }
    var hijo = _bornerasGrupoDe('junto', a.id);
    a = (hijo && hijo.dentro) ? hijo : null;
  }
  if (izq === Infinity) return null;
  return { f: null, key: gr.id, ref: gr.id, tira: gr, cfg: gr.canaleta || null,
           caja: { izq: izq, der: der, top: top, bot: bot } };
}

function _canaletaEsTiraBarra(ref) {


  if (typeof _bornerasGrupoDe !== 'function') return false;
  var raiz = _barraPrimeraTira();
  if (!raiz) return false;
  return [raiz].concat(_bornPilaSobre(raiz)).some(function(g) { return g.id === ref; });
}



function _canaletaApiladaUnida(gr) {
  if (!gr || !gr.canaleta || !gr.canaleta.fusionArriba || typeof _bornerasGrupoDe !== 'function') return false;
  var enc = _bornerasGrupoDe('pila', gr.id);
  return !!(enc && enc.canaleta && (enc.canaleta.lados || []).indexOf('abajo') !== -1);
}


function _canaletaHayFilaConCanaletaArriba(ref) {
  if (typeof ref !== 'string' || ref.indexOf('fila:') !== 0) return false;
  var key = ref.slice(5), filas = _bornerasFilasInf();
  for (var i = 0; i < filas.length; i++) {
    if (_canaletaFilaKey(filas[i]) !== key && filas[i].miembros.indexOf(key) === -1) continue;
    for (var j = 0; j < i; j++) {
      if (_canaletaCfgDeIds(filas[j].miembros)) return true;
    }
    return false;
  }
  return false;
}
function _canaletaFusionVecina(ref) {
  if (typeof ref === 'string' && _canaletaEsTiraBarra(ref)) {
    var _encV = _bornerasGrupoDe('pila', ref);
    if (_encV) {
      var _gV = _bornerasGrupoPorId(ref);
      if (_gV && _gV.canaleta && (_gV.canaleta.lados || []).indexOf('arriba') === -1) return null;
      return (_encV.canaleta && (_encV.canaleta.lados || []).indexOf('abajo') !== -1) ? _encV.id : null;
    }
    var tb = _canaletaTiraBarraItem();
    if (tb.cfg && (tb.cfg.lados || []).indexOf('arriba') === -1) return null;
    var fs = _bornerasFilasInf();
    if (!fs.length) return null;
    var ult = fs[fs.length - 1];
    var cU = _canaletaCfgDeIds(ult.miembros);
    if (!cU || (cU.lados || []).indexOf('abajo') === -1) return null;
    var cfgsU = _canaletasFila(), kU = null;
    ult.miembros.forEach(function(m) { if (!kU && cfgsU[m] === cU) kU = m; });
    return kU ? ('fila:' + kU) : null;
  }
  if (typeof ref !== 'string' || ref.indexOf('fila:') !== 0) return null;
  var key = ref.slice(5), cfgs = _canaletasFila();
  var filas = _bornerasFilasInf();
  for (var i = 1; i < filas.length; i++) {
    if (_canaletaFilaKey(filas[i]) !== key && filas[i].miembros.indexOf(key) === -1) continue;


    var propia = _canaletaCfgDeIds(filas[i].miembros);
    if (propia && (propia.lados || []).indexOf('arriba') === -1) return null;



    var arriba = _canaletaCfgDeIds(filas[i - 1].miembros);
    if (!arriba || (arriba.lados || []).indexOf('abajo') === -1) return null;
    var kArr = null;
    filas[i - 1].miembros.forEach(function(m) { if (!kArr && cfgs[m] === arriba) kArr = m; });
    return kArr ? ('fila:' + kArr) : null;
  }
  return null;
}




function _dibujarCanaletasFila(container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return;
  container.querySelectorAll('.canaleta-fila, .canaleta-guia').forEach(function(el) { el.remove(); });

  _canaletaPlanTiras(container);
  var cfgs = _canaletasFila();
  var filas = _bornerasFilasInf(container);



  filas.forEach(function(f) {
    var vistas = [];
    f.miembros.forEach(function(id) { if (cfgs[id]) vistas.push(id); });
    if (vistas.length < 2) return;


    var mejor = vistas[0], score = -1;
    vistas.forEach(function(id) {
      var c = cfgs[id], n = Object.keys(c).length + (c.fusionArriba ? 3 : 0) +
              (c.fusionColumnas ? 3 : 0) + (c.excluidos ? 2 : 0);
      if (n > score) { score = n; mejor = id; }
    });
    vistas.forEach(function(id) { if (id !== mejor) delete cfgs[id]; });
  });
  window._canFusionCol = {};
  window._canFusionColX = {};






  var _GUIA_COLORES = ['#8d8d8d'];


  function _guiaLinea(col, x, y, w, h, vertical, ref) {
    return _canGuiaLinea(container, col, x, y, w, h, vertical, ref);
  }
  function _guiaNombre(col, nombre, x, y, ref, eje) {
    _canGuiaNombre(container, col, nombre, x, y, ref, eje);
  }


  function _tramosSueltos(it) {
    var can = _bornerasCanaleta({ canaleta: it.cfg },
      { w: it.caja.der - it.caja.izq, h: it.caja.bot - it.caja.top }, 0, 1);
    if (!can) return [];
    return can.rects.map(function(r) {
      return { lado: r.lado, x: it.caja.izq + r.x, y: it.caja.top + r.y, w: r.w, h: r.h };
    });
  }


  function _domDe(its) {
    var d = its[0] && its[0].cfg.fusionDominante;
    var res = _canaletaResolverDominante(its.map(function(it) {
      return { key: it.key, caja: it.caja, cfg: it.cfg };
    }), d);
    if (res === 'col' || res < 0) return null;
    return its[res];
  }
  function _guiasBloque(its, conColumnas) {
    if (its.length < 2 && !conColumnas) return;
    var nom = _canaletaNombresSueltos(container), k = 0;
    if (conColumnas) {
      ['left', 'right'].forEach(function(sd) {
        var g = _canaletaColumnaGeom(sd, container);
        if (!g) return;
        var col = _GUIA_COLORES[k++ % _GUIA_COLORES.length];
        _guiaLinea(col, g.x + g.w / 2, g.top, 0, g.bot - g.top, true, 'itm:' + sd);


        _guiaNombre(col, nom['itm:' + sd], g.x + g.w / 2, g.top - 45, 'itm:' + sd,
                    { dir: 'v', max: g.bot - 30 });
      });
    }
    its.forEach(function(it) {
      var col = _GUIA_COLORES[k++ % _GUIA_COLORES.length];
      var rs = _tramosSueltos(it), primero = null;
      rs.forEach(function(r) {
        if (r.lado === 'arriba' || r.lado === 'abajo') {
          _guiaLinea(col, r.x, r.y + r.h / 2, r.w, 0, false, it.ref);
        } else {
          _guiaLinea(col, r.x + r.w / 2, r.y, 0, r.h, true, it.ref);
        }
        if (!primero || r.y < primero.y || (r.y === primero.y && r.x < primero.x)) primero = r;
      });
      if (primero) {
        _guiaNombre(col, nom[it.ref],
          primero.x + ((primero.lado === 'arriba' || primero.lado === 'abajo') ? 120 : primero.w / 2),
          primero.y + ((primero.lado === 'arriba' || primero.lado === 'abajo') ? primero.h / 2 : 60),
          it.ref, _canGuiaEjeTramo(primero));
      }
    });
  }







  var _fusEsq = null;                                                          





  function _fusionarConColumnas(rects, domIt) {
    var gL = _canaletaColumnaGeom('left', container);
    var gR = _canaletaColumnaGeom('right', container);
    _fusEsq = null;
    if (!gL && !gR) return rects;
    if (domIt) {
      var gE0 = gL || gR;
      _fusEsq = { x: gE0.x, y: gE0.top };
      var propios = _tramosSueltos(domIt);
      var vI = null, vD = null;
      propios.forEach(function(r) { if (r.lado === 'izq') vI = r; if (r.lado === 'der') vD = r; });

      rects.forEach(function(r) {
        if (r.lado === 'izq' && vI) { r.x = vI.x; r.w = vI.w; }
        if (r.lado === 'der' && vD) { r.x = vD.x; r.w = vD.w; }
      });




      var xIzq = null, xDer = null, inIzq = null, inDer = null;
      rects.forEach(function(r) {
        if (r.lado === 'izq') {
          if (xIzq === null || r.x < xIzq) xIzq = r.x;
          if (inIzq === null || r.x + r.w > inIzq) inIzq = r.x + r.w;
        }
        if (r.lado === 'der') {
          if (xDer === null || r.x + r.w > xDer) xDer = r.x + r.w;
          if (inDer === null || r.x < inDer) inDer = r.x;
        }
      });





      if (xIzq === null && gL) { xIzq = gL.x; inIzq = gL.x + gL.w; }
      if (xDer === null && gR) { xDer = gR.x + gR.w; inDer = gR.x; }


      var arrTop = null;
      rects.forEach(function(r) { if (r.lado === 'arriba' && (!arrTop || r.y < arrTop.y)) arrTop = r; });
      rects.forEach(function(r) {
        if (r.lado !== 'arriba' && r.lado !== 'abajo') return;
        if (r === arrTop) {





          var x0 = r.x, x1 = r.x + r.w;
          if (gL) x0 = Math.min(x0, gL.x);
          if (gR) x1 = Math.max(x1, gR.x + gR.w);
          if (xIzq !== null) x0 = Math.min(x0, xIzq);
          if (xDer !== null) x1 = Math.max(x1, xDer);
          r.x = x0; r.w = x1 - x0;
        } else if (inIzq !== null || inDer !== null) {



          var x0b = (inIzq !== null) ? inIzq : r.x;
          var x1b = (inDer !== null) ? inDer : (r.x + r.w);
          r.x = x0b; r.w = x1b - x0b;
        }
      });



      if (arrTop) {
        var yIni = arrTop.y + arrTop.h;



        if (gL) window._canFusionCol.left = Math.max(window._canFusionCol.left || 0, arrTop.y + 2);
        if (gR) window._canFusionCol.right = Math.max(window._canFusionCol.right || 0, arrTop.y + 2);
        rects.forEach(function(r) {
          if ((r.lado === 'izq' || r.lado === 'der') && r.y < yIni) {
            r.h -= (yIni - r.y); r.y = yIni;
          }
        });
      }
      return rects;
    }



    var gE = gL || gR;






    var xColL = gL ? gL.x : null;
    var xColR = gR ? (gR.x + gR.w) : null;
    rects.forEach(function(r) {
      if (r.lado === 'izq' && gL && r.x < xColL) xColL = r.x;
      if (r.lado === 'der' && gR && (r.x + r.w) > xColR) xColR = r.x + r.w;
    });
    if (gL && xColL !== gL.x) window._canFusionColX.left = xColL;
    if (gR && xColR !== (gR.x + gR.w)) window._canFusionColX.right = xColR - gR.w;
    _fusEsq = { x: (gL ? xColL : (xColR - gR.w)), y: gE.top };
    rects.forEach(function(r) {
      if (r.lado === 'izq' && gL) { r.x = xColL; r.w = gL.w; }
      if (r.lado === 'der' && gR) { r.x = xColR - gR.w; r.w = gR.w; }
    });





    var inIzq = gL ? (xColL + gL.w) : null;
    var inDer = gR ? (xColR - gR.w) : null;
    rects.forEach(function(r) {
      if (r.lado !== 'arriba' && r.lado !== 'abajo') return;
      var x0 = (inIzq !== null) ? inIzq : r.x;
      var x1 = (inDer !== null) ? inDer : (r.x + r.w);
      r.x = x0; r.w = x1 - x0;
    });



    var fuera = {};
    rects.forEach(function(r) {
      if (r.lado === 'izq' && gL) {
        window._canFusionCol.left = Math.max(window._canFusionCol.left || 0, r.y + r.h);
        fuera.izq = true;
      }
      if (r.lado === 'der' && gR) {
        window._canFusionCol.right = Math.max(window._canFusionCol.right || 0, r.y + r.h);
        fuera.der = true;
      }
    });
    return rects.filter(function(r) { return !fuera[r.lado]; });
  }

  function _pinta(lado, x, y, w, h, fill, ref) {
    _canPintar(container, { lado: lado, x: x, y: y, w: w, h: h }, fill, ref, 'canaleta-fila', 5);
  }


  var info = filas.map(function(f) {


    var cfg = _canaletaCfgDeIds(f.miembros);
    var key = null;
    if (cfg) {
      for (var i = 0; i < f.miembros.length && !key; i++) {
        if (cfgs[f.miembros[i]] === cfg) key = f.miembros[i];
      }
    }

    return cfg ? { f: f, key: key, ref: 'fila:' + key, cfg: cfg, caja: _canaletaCajaFila(f, cfg) } : null;
  });


  if (info.length) _canaletaTiraBarraItems(container).forEach(function(it) { info.push(it); });







  _canaletaNormalizarFusion(info.map(function(it) { return it ? it.cfg : null; }));




  var bloques = [];
  info.forEach(function(it, i) {
    if (!it) return;
    var ult = bloques.length ? bloques[bloques.length - 1] : null;
    if (it.cfg.fusionArriba && ult && ult.fin === i - 1 && info[i - 1]) {
      ult.items.push(it); ult.fin = i;
    } else {
      bloques.push({ items: [it], fin: i });
    }
  });

  bloques.forEach(function(b) {
    var its = b.items;

    if (its.length === 1 && its[0].tira) return;


    its.forEach(function(it) {
      if (!it.tira) return;
      _canaletaPiezasDe(it.ref, container).forEach(function(pz) {
        if (pz.el.parentNode) pz.el.parentNode.removeChild(pz.el);
      });
      container.querySelectorAll('.canaleta-tri[data-canaleta-ref="' + it.ref + '"]').forEach(function(t) {
        if (t.parentNode) t.parentNode.removeChild(t);
      });
    });




    _fusEsq = null;



    var anchoDom = _canaletaAnchoBloque(its.map(function(it) { return it.cfg; }));
    its.forEach(function(it) {
      var c = it.cfg;
      if (anchoDom && anchoDom !== c.anchoMm) {
        c = _canCopiaCfg(c, { anchoMm: anchoDom, fusionArriba: c.fusionArriba });
      }
      it.can = _bornerasCanaleta({ canaleta: c },
        { w: it.caja.der - it.caja.izq, h: it.caja.bot - it.caja.top }, 0, 1,
        { sinArriba: !!c.fusionArriba });
    });
    its = b.items = its.filter(function(it) { return !!it.can; });
    if (!its.length) return;







    var refs = its.map(function(it) { return it.ref; });
    function _tri(esq) {
      _bornerasTrianguloCanaleta(container, its[0].can, refs[0],
                                 its[0].caja.izq, its[0].caja.top, 'canaleta-fila', esq);
      var t0 = container.querySelector(
        '.canaleta-tri[data-canaleta-ref="' + refs[0] + '"]');
      if (!t0) return;



      var todos = refs.slice();
      if (its[0].cfg.fusionColumnas) {
        ['left', 'right'].forEach(function(sd) {
          if (typeof (window._canFusionCol || {})[sd] === 'number') todos.push('itm:' + sd);
        });
      }
      t0.dataset.canaletaRefs = todos.join('|');
    }

    if (its.length === 1) {
      var u = its[0];
      var rs1 = u.can.rects.map(function(r) {
        return { lado: r.lado, x: u.caja.izq + r.x, y: u.caja.top + r.y, w: r.w, h: r.h };
      });
      if (u.cfg.fusionColumnas) rs1 = _fusionarConColumnas(rs1, _domDe(its));
      rs1.forEach(function(r) { _pinta(r.lado, r.x, r.y, r.w, r.h, u.can.fill, u.ref); });
      _tri(_fusEsq ? { x: _fusEsq.x - u.caja.izq, y: _fusEsq.y - u.caja.top } : null);
      _guiasBloque(its, !!_fusEsq);
      return;
    }


    var izqU = Infinity, derU = -Infinity;
    its.forEach(function(it) {
      izqU = Math.min(izqU, it.caja.izq - it.can.extra.izq);
      derU = Math.max(derU, it.caja.der + it.can.extra.der);
    });
    var topU = its[0].caja.top + _rectY(its[0], 'arriba');
    var botU = its[its.length - 1].caja.top + _rectY(its[its.length - 1], 'abajo', true);
    var fill = its[0].can.fill;
    var rsB = [];




    its.forEach(function(it, i) {
      it.can.rects.forEach(function(r) {
        if (r.lado !== 'arriba' && r.lado !== 'abajo') return;
        if (r.lado === 'arriba' && i > 0) return;                                     
        rsB.push({ lado: r.lado, x: izqU, y: it.caja.top + r.y, w: derU - izqU, h: r.h });
      });
    });




    ['izq', 'der'].forEach(function(lado) {
      var mejor = null;
      its.forEach(function(it) {
        it.can.rects.forEach(function(r) {
          if (r.lado !== lado) return;
          var x = it.caja.izq + r.x;
          if (!mejor) { mejor = { x: x, w: r.w }; return; }

          if (r.w > mejor.w || (r.w === mejor.w &&
              ((lado === 'izq' && x < mejor.x) || (lado === 'der' && x > mejor.x)))) {
            mejor = { x: x, w: r.w };
          }
        });
      });
      if (!mejor) return;
      var x = (lado === 'izq') ? Math.min(mejor.x, izqU) : Math.max(mejor.x, derU - mejor.w);
      rsB.push({ lado: lado, x: x, y: topU, w: mejor.w, h: botU - topU });
    });






    var _vIzqB = null, _vDerB = null;
    rsB.forEach(function(r) { if (r.lado === 'izq') _vIzqB = r; if (r.lado === 'der') _vDerB = r; });
    rsB.forEach(function(r) {
      if (r.lado !== 'arriba' && r.lado !== 'abajo') return;
      var x0 = _vIzqB ? (_vIzqB.x + _vIzqB.w) : r.x;
      var x1 = _vDerB ? _vDerB.x : (r.x + r.w);
      r.x = x0; r.w = x1 - x0;
    });
    if (its[0].cfg.fusionColumnas) rsB = _fusionarConColumnas(rsB, _domDe(its));
    rsB.forEach(function(r) { _pinta(r.lado, r.x, r.y, r.w, r.h, fill, refs[0]); });
    var esqX = izqU, esqY = topU;
    rsB.forEach(function(r) { if (r.x < esqX) esqX = r.x; });
    if (_fusEsq) { esqX = _fusEsq.x; esqY = Math.min(esqY, _fusEsq.y); }
    _tri({ x: esqX - its[0].caja.izq, y: esqY - its[0].caja.top });
    _guiasBloque(its, !!_fusEsq);
  });
}



function _rectY(it, lado, fin) {
  var rs = it.can.rects;
  for (var i = 0; i < rs.length; i++) {
    if (rs[i].lado === lado) return fin ? (rs[i].y + rs[i].h) : rs[i].y;
  }

  return fin ? (it.caja.bot - it.caja.top + it.can.extra.abajo) : -it.can.extra.arriba;
}







function _bornerasTrianguloCanaleta(padre, can, ref, offX, offY, cls, esquina) {
  if (!can || !can.rects.length) return;




  var cx0 = Infinity, cy0 = Infinity;
  can.rects.forEach(function(r) {
    if (r.x < cx0) cx0 = r.x;
    if (r.y < cy0) cy0 = r.y;
  });



  if (esquina) { cx0 = esquina.x; cy0 = esquina.y; }



  var CAN_ROT_H = 60, CAN_INSET = 15;
  var vx = (offX || 0) + cx0 + CAN_INSET;
  var vy = (offY || 0) + cy0 + CAN_INSET + CAN_ROT_H + 8;


  var px = vx + 45, py = vy + 22.5;
  var tri = document.createElement('img');
  tri.src = 'assets/panel-busbar/boton_trian_verde.svg';



  tri.className = (cls || 'bornera-grupo') + ' bornera-tri canaleta-tri';
  tri.dataset.canaletaRef = ref;
  tri.style.cssText = 'position:absolute;left:' + (px - 22.5) + 'px;top:' +
    (py - 45) + 'px;width:45px;height:90px;' +




    'transform:rotate(-90deg);z-index:8;cursor:pointer;pointer-events:auto;';
  tri.addEventListener('click', function(e) {
    e.stopPropagation();
    onCanaletaTriangleClick(this);
  });
  padre.appendChild(tri);
}



function _bornerasCorridaCanaleta(ref) {
  function _desc(cant, tipo, clase, gr) {

    if (clase === 'contactor') {
      var _iK = (gr && typeof _buscarITM === 'function') ? _buscarITM(gr.origen) : null;
      return (_iK && _iK.contactor && typeof _contactorDesc === 'function')
        ? _contactorDesc(_iK.contactor) : 'Contactor';
    }
    if (clase === 'timer') {
      var _rT = gr && (gr.reserva || (typeof _timerComprado === 'function' && !_timerComprado(gr)));
      return _rT ? 'Timer (reserva)' : (cant || 1) + ' × timer';
    }
    if (clase === 'termostato') return (cant || 1) + ' × termostato';
    if (clase === 'dps') return 'DPS ' + ((gr && gr.polos) || 2) + 'P';                      
    if (clase === 'itm') return (cant || 1) + ' × ITM';
    var n = { '2.5': '2.5 mm²', '4': '4 mm²', '6': '6 mm²',
              'pf4': 'portafusible vidrio 4 mm²',
              'pfcart': 'portafusible cartucho' }[tipo] || tipo;
    return (cant || 1) + ' × ' + n;
  }
  var out = [];
  if (ref && ref.indexOf('itm:') === 0) {
    var _sideL = ref.slice(4);
    (window._itmList || []).forEach(function(itm) {
      if ((itm.side || 'left') !== _sideL) return;
      var _cap = itm.capacidad ? (' ' + itm.capacidad + ' A') : '';
      out.push({ rot: itm.rotulo || '—',
                 desc: (itm.tipo === 'reserva' ? 'Reserva' : 'ITM') + _cap });
    });
    return out;
  }
  if (ref && ref.indexOf('fila:') === 0) {



    var f = _canaletaFilaBuscar(ref.slice(5));
    if (!f) return out;
    var ex = ((_canaletasFila()[_canaletaKeyFila(ref.slice(5))] || {}).excluidos) || {};
    f.miembros.forEach(function(mid) {
      var rot = '—', desc = '';
      var dentro;
      if (mid.indexOf('grp:') === 0) {
        var gr = _bornerasGrupoPorId(mid.slice(4));
        if (!gr) return;
        rot = (_bornEsEquipo(gr.clase) ? '' : '(B) ') +
              (_bornerasPertenece(gr) || '—');
        desc = _desc(gr.cant, gr.tipo, gr.clase, gr);


        dentro = _grupoDentroCanaleta(gr);
      } else {
        var esDif = mid.indexOf('dif:') === 0;
        var itm = (typeof _buscarITM === 'function') ? _buscarITM(mid.slice(esDif ? 4 : 5)) : null;
        rot = (itm && itm.rotulo) ? (esDif ? _rotuloID(itm.rotulo) : _rotuloK(itm.rotulo)) : '—';
        var cap = itm && (esDif ? (itm.dif && itm.dif.corriente)
                                : (itm.contactor && itm.contactor.capacidad));
        desc = esDif ? ((itm && itm.dif && itm.dif.tipo === 'reserva') ? 'Diferencial (reserva)'
                        : ('Diferencial' + (cap ? (' ' + cap + ' A') : '')))
                     : ((itm && itm.contactor) ? _contactorDesc(itm.contactor) : 'Contactor');
      }
      out.push({ id: mid, rot: rot, desc: desc,
                 dentro: (typeof dentro === 'boolean') ? dentro : !ex[mid] });
    });
    return out;
  }

  if (ref === 'presencia') {
    _presenciaSecciones().forEach(function(sc) {
      out.push({ rot: 'PT', desc: _desc(sc.cant, sc.tipo, 'bornera') });
    });
  } else {
    var g0 = _bornerasGrupoPorId(ref);
    if (!g0) return out;
    out.push({ rot: (_bornEsEquipo(g0.clase) ? '' : '(B) ') +
                    (_bornerasPertenece(g0) || '—'),
               desc: _desc(g0.cant, g0.tipo, g0.clase, g0) });
  }





  var a = _bornerasGrupoDe('junto', ref), guard = 0;
  while (a && guard++ < 20) {
    out.push({ id: 'cad:' + a.id,
               rot: (_bornEsEquipo(a.clase) ? '' : '(B) ') +
                    (_bornerasPertenece(a) || '—'),
               desc: _desc(a.cant, a.tipo, a.clase, a), dentro: !!a.dentro });
    a = _bornerasGrupoDe('junto', a.id);
  }
  return out;
}






function _bornerasCanaletaPresencia() {
  var p = window._PRESENCIA_POS;
  if (!p || !window._PRESENCIA_CANALETA) return null;
  return _bornerasCanaleta({ id: 'presencia', canaleta: window._PRESENCIA_CANALETA },
                           { w: p.w, h: p.h },
                           _bornerasLargoDentro({ id: 'presencia' }), 1);
}




function _bornerasCanaletaAloja(gr) {
  var a = gr, g = 0;
  while (a && a.dentro && g++ < 20) {
    if (a.ref === 'presencia') return _bornerasCanaletaPresencia();
    a = _bornerasGrupoPorId(a.ref);
  }
  return a ? _bornerasDims(a).canaleta : null;
}





function _bornerasFlancos(gr) {
  var can = _bornerasCanaletaAloja(gr);
  if (!can) return { salida: 0, entrada: 0 };
  var f = can.flanco, pos = _bornerasSignoCadena(gr) > 0;
  return { salida: pos ? f.der : f.izq, entrada: pos ? f.izq : f.der };
}







function _bornerasAltoDentro(gr) {
  if (!gr || !gr.id || gr.dentro) return 0;
  var hMax = 0, a = _bornerasGrupoDe('junto', gr.id), g = 0;
  while (a && a.dentro && g++ < 20) {
    var h = _bornerasDims(a).h || 0;
    if (h > hMax) hMax = h;
    a = _bornerasGrupoDe('junto', a.id);
  }
  return hMax;
}





function _bornerasCanaleta(gr, d, largoDentro, signo, opts) {
  var c = gr && gr.canaleta;
  if (!c || !c.anchoMm) return null;
  var lados = c.lados || [];
  if (!lados.length) return null;

  var a = c.anchoMm / PX_TO_MM;



  var hMax = Math.max(d.h, _bornerasAltoDentro(gr));
  var dy = (hMax - d.h) / 2;






  var ext = largoDentro || 0;
  var xIni = ((signo || 1) < 0) ? -ext : 0;
  var wTira = d.w + ext;


  var sob = (typeof c.sobranteMm === 'number')
    ? (c.sobranteMm / PX_TO_MM) : BORN_CANALETA_SOBRANTE;



  var fusionArr = !!(opts && opts.sinArriba) ||
    !!(gr && gr.id && gr.canaleta && gr.canaleta.fusionArriba &&
       (_canaletaApiladaUnida(gr) || _canaletaTiraBarraFusionada() === gr));
  var arr = !fusionArr && lados.indexOf('arriba') !== -1;
  var aba = lados.indexOf('abajo') !== -1;
  var izq = lados.indexOf('izq')    !== -1, der = lados.indexOf('der')   !== -1;
  var hayH = arr || aba, hayV = izq || der;



  var sep = (typeof c.sepMm === 'number')
    ? (c.sepMm / PX_TO_MM) : BORN_CANALETA_SEP;


  function _sepDe(l) {
    return (c.sepLados && typeof c.sepLados[l] === 'number')
      ? (c.sepLados[l] / PX_TO_MM) : sep;
  }
  var sA = _sepDe('arriba'), sB = _sepDe('abajo'), sI = _sepDe('izq'), sD = _sepDe('der');
  var eIzq = izq ? (a + sI) : (hayH ? sob : 0);
  var eDer = der ? (a + sD) : (hayH ? sob : 0);
  var eArr = fusionArr ? sA : (arr ? (a + sA) : (hayV ? sob : 0));
  var eAba = aba ? (a + sB) : (hayV ? sob : 0);









  var hIzq = izq ? sI : eIzq;
  var hDer = der ? sD : eDer;
  var rects = [];
  if (arr) rects.push({ lado: 'arriba', x: xIni - hIzq, y: -dy - a - sA, w: wTira + hIzq + hDer, h: a });
  if (aba) rects.push({ lado: 'abajo',  x: xIni - hIzq, y: d.h + dy + sB, w: wTira + hIzq + hDer, h: a });
  if (izq) rects.push({ lado: 'izq', x: xIni - a - sI, y: -dy - eArr, w: a, h: hMax + eArr + eAba });
  if (der) rects.push({ lado: 'der', x: xIni + wTira + sD, y: -dy - eArr, w: a, h: hMax + eArr + eAba });

  return {
    rects: rects,


    fill: BORN_CANALETA_COLORES[c.color] ||
          BORN_CANALETA_COLORES[BORN_CANALETA_COLOR_DEF],
    anchoPx: a,
    sobrantePx: sob,
    sepPx: sep,




    flanco: { izq: eIzq, der: eDer, arriba: eArr + dy, abajo: eAba + dy },



    extra: { izq: eIzq + ((signo || 1) < 0 ? ext : 0),
             der: eDer + ((signo || 1) < 0 ? 0 : ext),
             arriba: eArr + dy, abajo: eAba + dy }
  };
}










function _rotularCanaletas(container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return;
  container.querySelectorAll('.canaleta-rotulo').forEach(function(el) { el.remove(); });
  window._CANALETA_ROTULOS = {};
  var tris = [].slice.call(container.querySelectorAll('.canaleta-tri'));
  if (!tris.length) return;



  var items = tris.map(function(t) {
    var r = _canCajaEnContainer(t, container) || { x: 0, y: 0, w: 0, h: 0 };
    return { tri: t, refs: _canaletaRefsDe(t), x: r.x, y: r.y, w: r.w, h: r.h };
  });
  items.sort(function(a, b) {
    return (Math.abs(a.y - b.y) > 5) ? (a.y - b.y) : (a.x - b.x);
  });





  var nCA = 0, nCAF = 0;
  items.forEach(function(it) {
    var fus = it.refs.length > 1;
    var n = fus ? ('CAF-' + (++nCAF < 10 ? '0' : '') + nCAF)
                : ('CA-'  + (++nCA  < 10 ? '0' : '') + nCA);
    it.refs.forEach(function(r, i) {
      window._CANALETA_ROTULOS[r] = n;
      if (fus) window._CANALETA_ROTULOS[r + '#pos'] = (i + 1) + ' de ' + it.refs.length;
    });
    var rot = document.createElement('div');
    rot.className = 'canaleta-rotulo itm-rotulo rot-grupo-chico';
    rot.dataset.canaletaRef = it.refs[0];


    rot.style.cssText = 'position:absolute;left:' + it.x + 'px;top:' +
      (it.y - 8) + 'px;transform:translateY(-100%);z-index:9;pointer-events:none;';
    var badge = document.createElement('div');
    badge.className = 'itm-rotulo-badge';
    badge.textContent = n;
    rot.appendChild(badge);
    container.appendChild(rot);
  });
  _canGuiasEsquivar(container);
}



function _canaletaRefsDe(triImg) {
  var l = triImg.dataset.canaletaRefs || triImg.dataset.canaletaRef || '';
  return l.split('|').filter(function(x) { return !!x; });
}




function onCanaletaTriangleClick(triImg) {
  var refs = _canaletaRefsDe(triImg);
  var ref = refs[0];
  if (!ref) return;
  var prev = document.getElementById('tri_context_menu');
  if (prev) prev.remove();
  if (typeof _cerrarMenuTriangulo === 'function') _cerrarMenuTriangulo();

  var menu = document.createElement('div');
  menu.id = 'tri_context_menu';
  menu.className = 'dif-context-menu';

  function _btn(txt, rojo, fn) {
    var b = document.createElement('button');
    b.className = 'dif-context-btn';
    b.textContent = txt;
    if (rojo) b.style.color = '#ff6b6b';
    b.addEventListener('click', function() { menu.remove(); fn(); });
    menu.appendChild(b);
  }
  function _tras() {
    if (typeof _redibujarPanelConIG === 'function') _redibujarPanelConIG();
    if (typeof guardarSesion === 'function') guardarSesion();
  }

  var rots = window._CANALETA_ROTULOS || {};
  if (refs.length > 1) {



    _btn('Editar ' + (rots[refs[0]] || 'canaleta'), false, function() {
      abrirModalCanaletaBloque(refs);
    });


    _btn('Quitar las ' + refs.length + ' canaletas', true, function() {
      refs.forEach(_canaletaBorrarRef); _tras();
    });
  } else {
    _btn('Editar canaleta', false, function() { abrirModalCanaleta(ref); });
    _btn('Quitar canaleta', true, function() { _canaletaBorrarRef(ref); _tras(); });
  }

  _abrirMenuTriangulo(menu, triImg);
}





var _canaletaGrupoId = null;


var _canaletaBloqueRefs = null;
var _canaletaBloqueTiras = [];



var _canaletaBloqueEdit = null;                                                                       




function _canaletaSobranteUI() {
  var inSob = document.getElementById('canaleta_sobrante');
  var nota = document.getElementById('canaleta_sobrante_nota');
  if (!inSob) return;
  var marcados = BORN_CANALETA_LADOS.filter(function(k) {
    var c = document.getElementById('canaleta_lado_' + k);
    return c && c.checked && (!c.parentNode || c.parentNode.style.display !== 'none');
  });
  var cerrada = (marcados.length === 4);
  inSob.disabled = cerrada;
  inSob.style.opacity = cerrada ? '0.5' : '';
  if (nota) nota.style.display = cerrada ? 'block' : 'none';



  if (cerrada) {
    if (inSob.value !== '') inSob.dataset.val = inSob.value;
    inSob.value = '';
    inSob.placeholder = 'no aplica';
  } else {
    inSob.placeholder = '';
    if (inSob.value === '' && inSob.dataset.val !== undefined) inSob.value = inSob.dataset.val;
  }
}


function _canaletaSobranteValor(def) {
  var inSob = document.getElementById('canaleta_sobrante');
  if (!inSob) return def;
  var v = parseFloat(inSob.value);
  if (isNaN(v)) v = parseFloat(inSob.dataset.val);
  return isNaN(v) ? def : Math.max(0, Math.min(200, v));
}
function _canaletaSobranteHook() {
  BORN_CANALETA_LADOS.forEach(function(k) {
    var c = document.getElementById('canaleta_lado_' + k);
    if (c && !c._sobHook) { c._sobHook = true; c.addEventListener('change', _canaletaSobranteUI); }
  });
}




function _canaletaLeerSepLados(def) {
  var out = {};
  BORN_CANALETA_LADOS.forEach(function(k) {
    var v = parseFloat((document.getElementById('canaleta_sep_' + k) || {}).value);
    out[k] = isNaN(v) ? def : Math.max(0, Math.min(200, v));
  });
  return out;
}
function _canaletaEscribirSepLados(sl, def) {
  BORN_CANALETA_LADOS.forEach(function(k) {
    var el = document.getElementById('canaleta_sep_' + k);
    if (!el) return;
    var v = (sl && typeof sl[k] === 'number') ? sl[k] : def;
    el.value = String(v);
  });
}
function _canaletaSepGeneral(sl, lados, def) {
  for (var i = 0; i < (lados || []).length; i++) {
    if (sl && typeof sl[lados[i]] === 'number') return sl[lados[i]];
  }
  return def;
}
function _canaletaBloqueLeerCampos() {
  var lados = BORN_CANALETA_LADOS.filter(function(k) {
    var c = document.getElementById('canaleta_lado_' + k);
    return c && c.checked;
  });
  function _n(id, def) {
    var v = parseFloat((document.getElementById(id) || {}).value);
    return isNaN(v) ? def : Math.max(0, Math.min(200, v));
  }
  var sl = _canaletaLeerSepLados(10);
  return { lados: lados, sepLados: sl, sepMm: _canaletaSepGeneral(sl, lados, 10),
           sobranteMm: _canaletaSobranteValor(20) };
}



function _canaletaSpanFila(caja, cfg) {
  var sep = (typeof cfg.sepMm === 'number') ? cfg.sepMm : 10;
  var sI = (cfg.sepLados && typeof cfg.sepLados.izq === 'number') ? cfg.sepLados.izq : sep;
  var sD = (cfg.sepLados && typeof cfg.sepLados.der === 'number') ? cfg.sepLados.der : sep;
  return (caja.der + sD / PX_TO_MM) - (caja.izq - sI / PX_TO_MM);
}








function _canaletaResolverDominante(lista, guardado) {
  if (!lista || !lista.length) return 'col';
  var spans = lista.map(function(x) { return _canaletaSpanFila(x.caja, x.cfg); });
  var maxR = Math.max.apply(null, spans);
  var filasOk = spans.map(function(sp) { return sp >= maxR - 1; });
  var gL = _canaletaColumnaGeom('left'), gR = _canaletaColumnaGeom('right');





  var colOk = !!(gL || gR);
  if (guardado && guardado !== 'col') {
    for (var i = 0; i < lista.length; i++) {
      if ('fila:' + lista[i].key === guardado && filasOk[i]) return i;
    }
  }
  if (colOk) return 'col';
  return filasOk.indexOf(true);
}




function _canaletaCandidatosDom(filaRefs) {
  var cont = document.getElementById('panel_busbar_container');
  var out = [];
  if (!cont || !filaRefs) return out;
  var filas = _bornerasFilasInf(cont);
  filaRefs.forEach(function(r) {
    var key = r.slice(5), f = null;
    for (var i = 0; i < filas.length; i++) {
      if (_canaletaFilaKey(filas[i]) === key || filas[i].miembros.indexOf(key) !== -1) { f = filas[i]; break; }
    }
    var cfg = f && _canaletaCfgDeIds(f.miembros);
    if (!f || !cfg) return;
    out.push({ ref: r, key: key, caja: _canaletaCajaFila(f, cfg), cfg: cfg });
  });
  return out;
}




function _canaletaFilaDominada(ref) {
  var e = _canaletaBloqueEdit;
  if (!e || !_canaletaBloqueRefs || !ref || ref.indexOf('fila:') !== 0) return false;
  var filaRefs = _canaletaBloqueRefs.filter(function(r) { return r.indexOf('fila:') === 0; });
  var c0 = _canaletaCfgDeRef(filaRefs[0]);
  var chk = document.getElementById('canaleta_fusion_col');
  var conCol = chk ? chk.checked : !!(c0 && c0.fusionColumnas);
  if (!conCol) return false;
  var selD = document.getElementById('canaleta_fusion_dom');
  var dom = (selD && selD.value) || (c0 && c0.fusionDominante) || 'col';
  return dom !== ref;                                                                
}



function _canaletaSepEfectivaFila(ref) {
  var cont = document.getElementById('panel_busbar_container');
  if (!cont || !ref || ref.indexOf('fila:') !== 0) return null;
  var key = ref.slice(5), filas = _bornerasFilasInf(cont), f = null;
  for (var i = 0; i < filas.length; i++) {
    if (_canaletaFilaKey(filas[i]) === key || filas[i].miembros.indexOf(key) !== -1) { f = filas[i]; break; }
  }
  if (!f) return null;
  var cfg = _canaletaCfgDeIds(f.miembros);
  if (!cfg) return null;
  var caja = _canaletaCajaFila(f, cfg);
  var cy = (caja.top + caja.bot) / 2;
  var izq = null, der = null;
  cont.querySelectorAll('.canaleta-fila.bornera-canaleta, .canaleta-itm.bornera-canaleta').forEach(function(el) {
    var lado = el.dataset.lado;
    if (lado !== 'izq' && lado !== 'der') return;
    var y0 = parseFloat(el.style.top), y1 = y0 + parseFloat(el.style.height);
    if (cy < y0 || cy > y1) return;                           
    var x0 = parseFloat(el.style.left), x1 = x0 + parseFloat(el.style.width);
    if (lado === 'izq') { var d = caja.izq - x1; if (d >= 0 && (izq === null || d < izq)) izq = d; }
    else { var d2 = x0 - caja.der; if (d2 >= 0 && (der === null || d2 < der)) der = d2; }
  });
  return { izq: (izq === null) ? null : +(izq * PX_TO_MM).toFixed(1),
           der: (der === null) ? null : +(der * PX_TO_MM).toFixed(1) };
}

function _canaletaBloqueEscribirCampos(v, ref) {
  var esCol = (typeof ref === 'string' && ref.indexOf('itm:') === 0);
  var soloLado = esCol ? ((ref.slice(4) === 'left') ? 'izq' : 'der') : null;
  BORN_CANALETA_LADOS.forEach(function(k) {
    var chk = document.getElementById('canaleta_lado_' + k);
    if (!chk) return;


    var celda = chk.parentNode && chk.parentNode.parentNode;
    if (soloLado) {
      var esEste = (k === soloLado);
      if (celda && celda.style) celda.style.display = esEste ? '' : 'none';
      chk.checked = esEste; chk.disabled = esEste;
    } else {
      if (celda && celda.style) celda.style.display = '';
      chk.disabled = false;
      chk.checked = (v.lados || []).indexOf(k) !== -1;
    }
  });
  var tiraBox = document.getElementById('canaleta_tira_box');
  if (tiraBox) tiraBox.textContent = 'EQUIPOS';
  _canaletaEscribirSepLados(v.sepLados, (typeof v.sepMm === 'number') ? v.sepMm : 10);
  var inSob = document.getElementById('canaleta_sobrante');
  if (inSob) { inSob.value = String(v.sobranteMm); delete inSob.dataset.val; }



  var dominada = _canaletaFilaDominada(ref);
  var efect = dominada ? _canaletaSepEfectivaFila(ref) : null;
  ['izq', 'der'].forEach(function(k) {
    var chk = document.getElementById('canaleta_lado_' + k);
    var inp = document.getElementById('canaleta_sep_' + k);
    if (chk && !soloLado) { chk.disabled = dominada; chk.parentNode.style.opacity = dominada ? '0.6' : ''; }
    if (inp) {
      inp.disabled = dominada;
      inp.style.opacity = dominada ? '0.6' : '';
      inp.title = dominada ? 'Lo fija la canaleta dominante: distancia real al vertical' : 'Separación a los equipos por este lado (mm)';
      if (dominada && efect && efect[k] !== null) inp.value = String(efect[k]);
    }
  });
  _canaletaSobranteUI();
}


function _canaletaResaltarGuia(ref) {
  document.querySelectorAll('.canaleta-guia').forEach(function(g) {
    g.classList.toggle('canaleta-guia-activa', !!ref && g.dataset.ref === ref);
  });
}


function _canaletaBloqueMostrarMiembro(hay) {
  document.querySelectorAll('#modalCanaleta_overlay .canaleta-miembro').forEach(function(el) {


    if (el.dataset.disp === undefined) el.dataset.disp = el.style.display || '';
    el.style.display = hay ? el.dataset.disp : 'none';
  });
  if (hay) {
    _canaletaSobranteUI();
  } else {
    var nota = document.getElementById('canaleta_sobrante_nota');
    if (nota) nota.style.display = 'none';
  }
  var card = document.getElementById('canaleta_card_lista');
  if (card) card.style.display = hay ? 'block' : 'none';
}

function _canaletaBloqueVolcar() {
  var e = _canaletaBloqueEdit;
  if (!e || !e.sel) return;
  var v = _canaletaBloqueLeerCampos();
  if (e.sel === 'todo') {                                              



    Object.keys(e.porRef).forEach(function(r) {
      var esCol = r.indexOf('itm:') === 0;
      e.porRef[r].sobranteMm = v.sobranteMm;
      if (!esCol) {
        e.porRef[r].sepMm = v.sepMm; e.porRef[r].lados = v.lados.slice();
        e.porRef[r].sepLados = JSON.parse(JSON.stringify(v.sepLados));
      }
    });
  } else if (e.porRef[e.sel]) {
    var esColS = e.sel.indexOf('itm:') === 0;
    var m = e.porRef[e.sel];
    m.sobranteMm = v.sobranteMm;
    if (esColS) {

      var ld = m.lados[0];
      m.sepLados = m.sepLados || {};
      m.sepLados[ld] = v.sepLados[ld];
      m.sepMm = v.sepLados[ld];
    } else {
      var dominada = _canaletaFilaDominada(e.sel);
      var nuevos = JSON.parse(JSON.stringify(v.sepLados));
      if (dominada) {

        nuevos.izq = (m.sepLados && typeof m.sepLados.izq === 'number') ? m.sepLados.izq : m.sepMm;
        nuevos.der = (m.sepLados && typeof m.sepLados.der === 'number') ? m.sepLados.der : m.sepMm;
        v.lados = v.lados.filter(function(l) { return l !== 'izq' && l !== 'der'; })
                         .concat(m.lados.filter(function(l) { return l === 'izq' || l === 'der'; }));
      }
      m.lados = v.lados.slice();
      m.sepLados = nuevos;
      m.sepMm = v.sepMm;
    }
  }
}


function _canaletaBloqueRefrescarSel() {
  var e = _canaletaBloqueEdit;
  if (!e || !e.sel) return;
  _canaletaBloqueVolcar();
  _canaletaBloqueEscribirCampos(e.porRef[e.sel], e.sel);
}



function _canaletaBloqueCambiarSel() {
  var e = _canaletaBloqueEdit;
  var sel = document.getElementById('canaleta_bloque_sel');
  if (!e || !sel) return;
  _canaletaBloqueVolcar();
  e.sel = sel.value;
  _canaletaResaltarGuia(e.sel || null);
  _canaletaBloqueMostrarMiembro(!!e.sel);
  if (!e.sel) return;

  document.querySelectorAll('#canaleta_lista .canaleta-grupo-hd, #canaleta_lista .canaleta-grupo-eq').forEach(function(el) {
    var ver = (el.dataset.ref === e.sel);
    el.style.display = ver ? (el.classList.contains('canaleta-grupo-eq') ? 'flex' : '') : 'none';
  });
  _canaletaBloqueEscribirCampos(e.porRef[e.sel], e.sel);
}







function _canaletaListaExclUI() {
  var cbs = [].slice.call(document.querySelectorAll('#canaleta_lista .canaleta-eq'));
  var chkFA = document.getElementById('canaleta_fusion'), wFA = document.getElementById('canaleta_fusion_wrap');
  var chkFC = document.getElementById('canaleta_fusion_col'), wFC = document.getElementById('canaleta_fusion_col_wrap');
  var fusUI = (chkFA && chkFA.checked && wFA && wFA.style.display !== 'none') ||
              (chkFC && chkFC.checked && wFC && wFC.style.display !== 'none');
  cbs.forEach(function(c) {
    var id = c.dataset.eqId || '';
    if (id.indexOf('cont:') !== 0 && id.indexOf('dif:') !== 0) return;
    var ref = c.dataset.ref || _canaletaGrupoId;
    if (typeof ref !== 'string' || ref.indexOf('fila:') !== 0) return;
    var cfgR = _canaletasFila()[_canaletaKeyFila(ref.slice(5))];


    var desdeAbajo = !!(cfgR && cfgR._enBloque && !cfgR.fusionArriba && !cfgR.fusionColumnas);
    var fusionada = !!_canaletaBloqueRefs || fusUI || desdeAbajo;
    if (fusionada) c.checked = true;
    c.disabled = fusionada;
    var lbl = c.closest('label');
    if (lbl) {
      lbl.style.opacity = fusionada ? '0.45' : '';
      lbl.title = fusionada ? 'Canaleta fusionada: la caja llega hasta el vertical compartido, no se puede dejar un equipo afuera.' : '';
    }
  });
  [chkFA, chkFC].forEach(function(ch) {
    if (!ch || ch._exclHook) return;
    ch._exclHook = true;
    ch.addEventListener('change', _canaletaListaExclUI);
  });
}




function _canaletaFusionTirasUI(refs) {
  var box = document.getElementById('canaleta_fusion_tiras');
  if (!box) return;
  box.innerHTML = '';
  refs = refs || [];
  var tiras = _canaletaTirasFusionables();
  if (!tiras.length) return;
  var esTira = refs.length === 1 && refs[0].indexOf('itm:') !== 0 && refs[0].indexOf('fila:') !== 0;
  var conCol = refs.some(function(r) {
    if (r.indexOf('itm:') === 0) return true;
    var c = r.indexOf('fila:') === 0 ? _canaletaCfgDeRef(r) : null;
    return !!(c && c.fusionColumnas);
  });
  var lista = esTira ? tiras.filter(function(t) { return t.ref === refs[0]; })
                     : (conCol ? tiras : []);
  lista = lista.slice().sort(function(a, b) {
    return (a.side === b.side) ? 0 : (a.side === 'left' ? -1 : 1);
  });
  if (!lista.length) return;
  var nS = _canaletaNombresSueltos();
  box.innerHTML = lista.map(function(t) {
    var cfg = _canaletaTiraCfg(t.ref);
    var nCol = nS['itm:' + t.side] || ('columna ' + (t.side === 'left' ? 'izquierda' : 'derecha'));
    var txt = esTira ? ('Fusionar con la canaleta del ' + _canaletaDesc('itm:' + t.side) + ' (' + nCol + ')')
                     : _canaletaNomDesc(t.ref, nS, t.side);
    var dom = _canTiraDomina(cfg) ? 'tira' : 'col';
    var nTira = nS[t.ref] || 'la de arriba';
    return '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;' +
           'font-size:12px;color:rgba(255,255,255,0.85)">' +
           '<input type="checkbox" class="canaleta-fus-tira" data-ref="' + t.ref + '"' +
           (cfg && cfg.fusionColumna ? ' checked' : '') + ' style="margin:0;cursor:pointer">' +
           txt + '</label>' +

           '<div class="canaleta-fus-tira-domw" data-ref="' + t.ref + '" style="margin:2px 0 6px 22px;' +
           (cfg && cfg.fusionColumna ? '' : 'display:none;') + '">' +
           '<div style="font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:3px">Dominante</div>' +
           '<select class="m1-input-text canaleta-fus-tira-dom" data-ref="' + t.ref + '" style="width:100%">' +
           '<option value="col"' + (dom === 'col' ? ' selected' : '') + '>' + _canaletaNomDesc('itm:' + t.side, nS) + '</option>' +
           '<option value="tira"' + (dom === 'tira' ? ' selected' : '') + '>' + _canaletaNomDesc(t.ref, nS, t.side) + '</option>' +
           '</select></div>';
  }).join('');

  box.querySelectorAll('.canaleta-fus-tira').forEach(function(chk) {
    chk.addEventListener('change', function() {
      if (_canaletaDomConjuntoVisible()) { _canaletaDomUnificado(); return; }
      var w = box.querySelector('.canaleta-fus-tira-domw[data-ref="' + chk.dataset.ref + '"]');
      if (w) w.style.display = chk.checked ? '' : 'none';
    });
  });
  var cardF = document.getElementById('canaleta_card_fusion');
  if (cardF) cardF.style.display = 'block';
  if (_canaletaDomConjuntoVisible()) _canaletaDomUnificado();
}









function _canaletaDomConjuntoVisible() {
  var wC = document.getElementById('canaleta_fusion_col_wrap');
  var selD = document.getElementById('canaleta_fusion_dom');
  return !!(wC && wC.style.display !== 'none' && selD && typeof selD._optCol === 'string');
}
function _canaletaDomUnificado() {
  var wrapD = document.getElementById('canaleta_fusion_dom_wrap');
  var selD = document.getElementById('canaleta_fusion_dom');
  var chk = document.getElementById('canaleta_fusion_col');
  var box = document.getElementById('canaleta_fusion_tiras');
  if (!wrapD || !selD || typeof selD._optCol !== 'string') return;
  var prev = selD.options.length ? selD.value : selD._actual;
  var nS = _canaletaNombresSueltos();
  var conFilas = !!(chk && chk.checked);
  var tiras = box ? [].slice.call(box.querySelectorAll('.canaleta-fus-tira')).filter(function(c) { return c.checked; }) : [];

  var opts = '';
  tiras.forEach(function(c) {
    opts += '<option value="tira:' + c.dataset.ref + '">' + _canaletaNomDesc(c.dataset.ref, nS) + '</option>';
  });
  opts += selD._optCol + (conFilas ? selD._optsFilas : '');
  selD.innerHTML = opts;
  selD.value = prev;
  if (selD.value !== prev && selD.options.length) {
    selD.value = 'col';
    if (selD.value !== 'col') selD.value = selD.options[0].value;
  }
  if (box) box.querySelectorAll('.canaleta-fus-tira-domw').forEach(function(w) { w.style.display = 'none'; });
  wrapD.style.display = (conFilas || tiras.length) ? 'block' : 'none';
}





function _canaletaFusionColUI(ref, filaRefs) {
  var wrap = document.getElementById('canaleta_fusion_col_wrap');
  var chk = document.getElementById('canaleta_fusion_col');
  var cardF = document.getElementById('canaleta_card_fusion');
  if (!wrap || !chk) return;
  if (!chk._refrHook) {
    chk._refrHook = true;
    chk.addEventListener('change', _canaletaBloqueRefrescarSel);
    var _sd = document.getElementById('canaleta_fusion_dom');
    if (_sd) _sd.addEventListener('change', _canaletaBloqueRefrescarSel);
  }
  var esFila = (typeof ref === 'string' && ref.indexOf('fila:') === 0);
  var hayCol = !!(_canaletaColumnaGeom('left') || _canaletaColumnaGeom('right'));



  var cfgsC = _canaletasFila(), propios = (filaRefs && filaRefs.length) ? filaRefs : [ref];
  var otroConCol = Object.keys(cfgsC).some(function(k) {
    if (!cfgsC[k] || !cfgsC[k].fusionColumnas) return false;
    if (propios.indexOf('fila:' + k) !== -1) return false;




    return !!_canaletaFilaBuscar(k);
  });





  var _cfgPropia = esFila ? _canaletasFila()[_canaletaKeyFila(ref.slice(5))] : null;
  var hayMasCerca = esFila && !(_cfgPropia && _cfgPropia.fusionColumnas) &&
                    _canaletaHayFilaConCanaletaArriba(ref);
  if (!esFila || !hayCol || otroConCol || hayMasCerca) {
    wrap.style.display = 'none'; chk.checked = false;
    var wD0 = document.getElementById('canaleta_fusion_dom_wrap');
    if (wD0) wD0.style.display = 'none';
    var sD0 = document.getElementById('canaleta_fusion_dom');
    if (sD0) { sD0._optCol = undefined; sD0._optsFilas = undefined; }

    document.querySelectorAll('#canaleta_fusion_tiras .canaleta-fus-tira').forEach(function(ct) {
      var w = document.querySelector('#canaleta_fusion_tiras .canaleta-fus-tira-domw[data-ref="' + ct.dataset.ref + '"]');
      if (w) w.style.display = ct.checked ? '' : 'none';
    });
    return;
  }
  var c = _canaletasFila()[_canaletaKeyFila(ref.slice(5))];
  chk.checked = !!(c && c.fusionColumnas);
  var _nS = _canaletaNombresSueltos();
  var _colRefs = ['left', 'right'].filter(function(sd) { return !!_canaletaColumnaGeom(sd); })
                                   .map(function(sd) { return 'itm:' + sd; });
  var nombres = _colRefs.map(function(r) {
    return _nS[r] || (r === 'itm:left' ? 'izquierda' : 'derecha');
  });
  var lbl = document.getElementById('canaleta_fusion_col_lbl');
  var enBloque = !!(filaRefs && filaRefs.length);




  if (lbl) lbl.textContent = enBloque
    ? (nombres.join(' / ') + ' · ' + (nombres.length > 1 ? 'lados del panel busbar' : _canaletaDesc(_colRefs[0])))
    : ('Fusionar con las canaletas de los lados del panel busbar (' + nombres.join(' / ') + ')');
  var notaCol = wrap.querySelector('div');
  if (notaCol) notaCol.style.display = enBloque ? 'none' : '';
  wrap.style.display = 'block';
  if (cardF) cardF.style.display = 'block';

  var wrapD = document.getElementById('canaleta_fusion_dom_wrap');
  var selD = document.getElementById('canaleta_fusion_dom');
  if (wrapD && selD) {
    var lista = (filaRefs && filaRefs.length) ? filaRefs : [ref];
    var cands = _canaletaCandidatosDom(lista);
    var guardado = (c && c.fusionDominante) || 'col';
    var res = _canaletaResolverDominante(cands, guardado);


    var spans = cands.map(function(x) { return _canaletaSpanFila(x.caja, x.cfg); });
    var maxR = spans.length ? Math.max.apply(null, spans) : 0;


    var colPuede = !!(_canaletaColumnaGeom('left') || _canaletaColumnaGeom('right'));
    var optCol = colPuede ? ('<option value="col">' + nombres.join(' / ') + ' · ' +
                 (nombres.length > 1 ? 'lados del panel busbar' : _canaletaDesc(_colRefs[0])) + '</option>') : '';
    var optsFilas = '';
    cands.forEach(function(x, i) {
      if (spans[i] < maxR - 1) return;                                              
      var idx = lista.indexOf(x.ref);
      optsFilas += '<option value="' + x.ref + '">' + _canaletaNomDesc(x.ref, _nS) + '</option>';
    });
    var actual = (res === 'col') ? 'col' : ((res >= 0 && cands[res]) ? cands[res].ref : 'col');

    if (actual === 'col') {
      _canaletaTirasFusionables().forEach(function(t) {
        var ct = _canaletaTiraCfg(t.ref);
        if (ct && ct.fusionColumna && _canTiraDomina(ct)) actual = 'tira:' + t.ref;
      });
    }
    selD._optCol = optCol; selD._optsFilas = optsFilas; selD._actual = actual;
    selD.innerHTML = '';
    _canaletaDomUnificado();
    if (!chk._domHook) {
      chk._domHook = true;
      chk.addEventListener('change', _canaletaDomUnificado);
    }
  }
}




function _canaletaEsquina(ref, container) {
  var pz = _canaletaPiezasDe(ref, container);
  if (!pz.length) return null;
  var x = Infinity, y = Infinity;
  pz.forEach(function(c) { if (c.x < x) x = c.x; if (c.y < y) y = c.y; });
  return { x: x, y: y };
}











function _canaletaNombresSueltos(container) {
  container = container || document.getElementById('panel_busbar_container');
  var items = [];
  if (!container) return {};
  function _push(ref, resp) {
    var e = _canaletaEsquina(ref, container) || resp;
    if (e) items.push({ ref: ref, x: e.x, y: e.y });
  }
  ['left', 'right'].forEach(function(sd) {
    var g = _canaletaColumnaGeom(sd, container);
    if (g) _push('itm:' + sd, { x: g.x, y: g.top });
  });
  var cfgs = _canaletasFila();
  _bornerasFilasInf(container).forEach(function(f) {
    var cfg = _canaletaCfgDeIds(f.miembros);
    if (!cfg) return;
    var key = null;
    for (var i = 0; i < f.miembros.length && !key; i++) if (cfgs[f.miembros[i]] === cfg) key = f.miembros[i];
    var caja = _canaletaCajaFila(f, cfg);
    _push('fila:' + key, { x: caja.izq, y: caja.top });
  });
  if (window._PRESENCIA_CANALETA) {
    var pp = window._PRESENCIA_POS;
    _push('presencia', pp ? { x: pp.cx - pp.w / 2, y: pp.cy - pp.h / 2 } : null);
  }
  (_bornerasGrupos() || []).forEach(function(g) {
    if (!g.canaleta) return;
    var w = container.querySelector('.bornera-wrap[data-born-grupo-id="' + g.id + '"]');
    var bw = w ? _canCajaEnContainer(w, container) : null;
    _push(g.id, bw ? { x: bw.x, y: bw.y } : null);
  });
  items.sort(function(a, b) { return (Math.abs(a.y - b.y) > 5) ? (a.y - b.y) : (a.x - b.x); });
  var out = {};
  items.forEach(function(it, i) { out[it.ref] = 'CA-' + (i + 1 < 10 ? '0' : '') + (i + 1); });
  return out;
}








function abrirModalCanaletaBloque(refs) {
  if (!refs || refs.length < 2) { abrirModalCanaleta(refs && refs[0]); return; }


  var filaRefs = refs.filter(function(r) { return r.indexOf('fila:') === 0; });
  var itmRefs = refs.filter(function(r) { return r.indexOf('itm:') === 0; });
  if (!filaRefs.length) { abrirModalCanaleta(refs[0]); return; }
  abrirModalCanaleta(filaRefs[0]);
  _canaletaBloqueRefs = filaRefs.concat(itmRefs);


  _canaletaBloqueTiras = refs.filter(function(r) {
    return r.indexOf('fila:') !== 0 && r.indexOf('itm:') !== 0;
  });
  _canaletaFusionTirasUI(_canaletaBloqueRefs);
  var rots = window._CANALETA_ROTULOS || {};
  var ov = document.getElementById('modalCanaleta_overlay');
  var tit = ov && ov.querySelector('.modal-titulo');
  if (tit) tit.textContent = 'Canaleta ' + (rots[filaRefs[0]] || 'fusionada');



  var anchoMax = 0;
  refs.forEach(function(r) {
    var c = _canaletaCfgDeRef(r);
    if (c && c.anchoMm > anchoMax) anchoMax = c.anchoMm;
  });
  var sel = document.getElementById('canaleta_ancho');
  if (sel && anchoMax) sel.value = String(anchoMax);
  var nota = document.getElementById('canaleta_ancho_nota');
  if (nota) nota.style.display = 'none';



  var _nomS = _canaletaNombresSueltos();
  var lista = document.getElementById('canaleta_lista');
  if (lista) {
    var html = '';


    _canaletaOrdenTablero(_canaletaBloqueRefs.concat(_canaletaBloqueTiras)).forEach(function(r, i) {
      var esCol = (r.indexOf('itm:') === 0);
      var esTiraB = _canaletaBloqueTiras.indexOf(r) !== -1;
      var filas = _bornerasCorridaCanaleta(r);
      var nS = _nomS[r] ? (' (' + _nomS[r] + ')') : '';
      html += '<div class="canaleta-grupo-hd" data-ref="' + r + '" style="font-size:11px;color:rgba(255,255,255,0.55);' +
              'text-transform:uppercase;letter-spacing:0.4px;padding:8px 0 2px">' +
              _canaletaDesc(r) + nS + '</div>';
      html += filas.map(function(f) {

        var chk = (f.id && !esCol)
          ? '<input type="checkbox" class="canaleta-eq" data-eq-id="' + f.id +
            '" data-ref="' + r + '"' + (f.dentro ? ' checked' : '') +
            ' style="margin:0 8px 0 0;cursor:pointer">'
          : '';
        return '<label class="canaleta-grupo-eq" data-ref="' + r + '" style="display:flex;align-items:center;justify-content:space-between;' +
               'gap:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);' +
               (f.id ? 'cursor:pointer' : '') + '">' +
               '<span style="color:rgba(255,255,255,0.9);display:flex;align-items:center">' +
               chk + f.rot + '</span>' +
               '<span style="color:rgba(255,255,255,0.55)">' + f.desc + '</span></label>';
      }).join('');
    });
    lista.innerHTML = html;
    var card = document.getElementById('canaleta_card_lista');
    if (card) card.style.display = 'block';
    _canaletaListaExclUI();
  }




  var cardF = document.getElementById('canaleta_card_fusion');
  var listaF = document.getElementById('canaleta_fusion_lista');
  if (cardF && listaF) {
    var _filasYBarra = filaRefs.concat(_canaletaBloqueTiras.filter(_canaletaEsTiraBarra));
    listaF.innerHTML = _filasYBarra.map(function(r, i) {
      var nEsta = _canaletaNomDesc(r, _nomS);
      return '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;' +
             'font-size:12px;color:rgba(255,255,255,0.85)">' +
             '<input type="checkbox" class="canaleta-fus" data-ref="' + r + '" checked ' +
             'style="margin:0;cursor:pointer">' +
             nEsta + '</label>';
    }).join('');
    cardF.style.display = 'block';
    var notaF = document.getElementById('canaleta_fusion_nota');
    if (notaF) notaF.style.display = 'block';


    listaF.querySelectorAll('.canaleta-fus').forEach(function(c) {
      c.addEventListener('change', function() {
        if (c.dataset.ref !== filaRefs[0]) return;
        var chkC = document.getElementById('canaleta_fusion_col');
        var wrapC = document.getElementById('canaleta_fusion_col_wrap');
        var wrapD = document.getElementById('canaleta_fusion_dom_wrap');
        if (!chkC) return;
        if (!c.checked) { chkC.checked = false; chkC.disabled = true; }
        else chkC.disabled = false;
        if (wrapC) wrapC.style.opacity = c.checked ? '' : '0.5';
        if (wrapD) _canaletaDomUnificado();
        _canaletaBloqueRefrescarSel();
      });
    });
  }
  _canaletaFusionColUI(filaRefs[0], filaRefs);


  var _porRef = {};
  _canaletaBloqueRefs.concat(_canaletaBloqueTiras).forEach(function(r) {
    var c = _canaletaCfgDeRef(r) || {};
    var esCol = r.indexOf('itm:') === 0;
    var _sepDefM = (typeof c.sepMm === 'number') ? c.sepMm
             : Math.round((esCol ? BORN_CANALETA_SEP_COL : BORN_CANALETA_SEP) * PX_TO_MM);
    var _sl = {};
    BORN_CANALETA_LADOS.forEach(function(k) {
      _sl[k] = (c.sepLados && typeof c.sepLados[k] === 'number') ? c.sepLados[k] : _sepDefM;
    });
    _porRef[r] = {
      lados: esCol ? [(r.slice(4) === 'left') ? 'izq' : 'der'] : (c.lados || []).slice(),
      sepMm: _sepDefM, sepLados: _sl,
      sobranteMm: (typeof c.sobranteMm === 'number') ? c.sobranteMm
             : Math.round(BORN_CANALETA_SOBRANTE * PX_TO_MM)
    };
  });




  _canaletaBloqueEdit = { sel: '', porRef: _porRef };
  var subB = document.getElementById('canaleta_bloque_sub');
  if (subB) { subB.textContent = 'Todo el bloque (' + (rots[filaRefs[0]] || 'CAF') + ')'; subB.style.display = 'block'; }
  var selB = document.getElementById('canaleta_bloque_sel');
  var wrapB = document.getElementById('canaleta_bloque_wrap');
  if (selB && wrapB) {
    var opts = '<option value="">Elegir...</option>';
    _canaletaOrdenTablero(_canaletaBloqueRefs.concat(_canaletaBloqueTiras)).forEach(function(r) {
      opts += '<option value="' + r + '">' + _canaletaNomDesc(r, _nomS) + '</option>';
    });
    selB.innerHTML = opts;
    selB.value = '';
    wrapB.style.display = 'block';
  }
  ['canaleta_ancho', 'canaleta_color'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.disabled = false; el.style.opacity = ''; }
  });
  _canaletaBloqueEscribirCampos(_porRef[filaRefs[0]], filaRefs[0]);
  _canaletaBloqueMostrarMiembro(false);
  _canaletaResaltarGuia(null);

  var btnQ = document.getElementById('canaleta_btnQuitar');
  if (btnQ) { btnQ.style.display = ''; btnQ.textContent = 'Quitar las ' + (_canaletaBloqueRefs.length + _canaletaBloqueTiras.length); }
  var btnC = document.getElementById('canaleta_btnConfirmar');
  if (btnC) btnC.textContent = "Guardar cambios";
}

function abrirModalCanaleta(destino) {




  if (typeof destino === 'string' && destino !== 'presencia' &&
      destino.indexOf('fila:') !== 0) {
    var _grD = _bornerasGrupoPorId(destino);
    if (_grD) destino = _bornerasCanaletaDueno(_grD);
  }
  _canaletaGrupoId = destino;
  _canaletaBloqueRefs = null;
  _canaletaBloqueEdit = null;
  var _wrapB0 = document.getElementById('canaleta_bloque_wrap');
  if (_wrapB0) _wrapB0.style.display = 'none';
  _canaletaBloqueMostrarMiembro(true);
  _canaletaResaltarGuia(null);
  var _subB0 = document.getElementById('canaleta_bloque_sub');
  if (_subB0) _subB0.style.display = 'none';
  ['canaleta_ancho', 'canaleta_color'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.disabled = false; el.style.opacity = ''; }
  });
  var _cardFus = document.getElementById('canaleta_card_fusion');
  if (_cardFus) _cardFus.style.display = 'none';
  var _listaF0 = document.getElementById('canaleta_fusion_lista');
  if (_listaF0) _listaF0.innerHTML = '';
  var _notaF0 = document.getElementById('canaleta_fusion_nota');
  if (_notaF0) _notaF0.style.display = 'none';
  var _chkC0 = document.getElementById('canaleta_fusion_col');
  if (_chkC0) _chkC0.disabled = false;
  var _wrapC0 = document.getElementById('canaleta_fusion_col_wrap');
  if (_wrapC0) _wrapC0.style.opacity = '';
  _canaletaFusionColUI(destino);
  var _btnQ0 = document.getElementById('canaleta_btnQuitar');
  if (_btnQ0) _btnQ0.textContent = "Retirar";
  var esPres = (destino === 'presencia');
  var esFila = (typeof destino === 'string' && destino.indexOf('fila:') === 0);
  var esItm  = (typeof destino === 'string' && destino.indexOf('itm:') === 0);
  var gr = (esPres || esFila || esItm) ? null : _bornerasGrupoPorId(destino);
  if (!esPres && !esFila && !esItm && !gr) return;
  var c = (esPres ? window._PRESENCIA_CANALETA
        : esFila ? _canaletasFila()[_canaletaKeyFila(destino.slice(5))]
        : esItm  ? _canaletasItm()[destino.slice(4)]
        : (gr && gr.canaleta)) || null;

  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  var ov = document.getElementById('modalCanaleta_overlay');
  ov.classList.add('activo');

  var tit = ov.querySelector('.modal-titulo');
  var rots = window._CANALETA_ROTULOS || {};
  var n = rots[destino], pos = rots[destino + '#pos'];
  if (tit) {
    tit.textContent = n ? ('Canaleta ' + n + (pos ? (' · ' + pos) : '')) : 'Canaleta';
  }

  var sel = document.getElementById('canaleta_ancho');
  if (sel) sel.value = String((c && c.anchoMm) || 40);
  var selC = document.getElementById('canaleta_color');
  if (selC) selC.value = (c && c.color) || BORN_CANALETA_COLOR_DEF;



  var nota = document.getElementById('canaleta_ancho_nota');
  if (nota) {
    var eff = (esFila && typeof _canaletaAnchoEfectivoRef === 'function')
      ? _canaletaAnchoEfectivoRef(destino) : 0;
    if (eff && c && eff !== c.anchoMm) {
      nota.textContent = 'Se dibuja de ' + eff + ' mm: fusionada manda la más ancha.';
      nota.style.display = 'block';
    } else {
      nota.style.display = 'none';
    }
  }



  var wrapF = document.getElementById('canaleta_fusion_wrap');
  var chkF = document.getElementById('canaleta_fusion');
  var vecina = (typeof _canaletaFusionVecina === 'function')
    ? _canaletaFusionVecina(destino) : null;
  if (wrapF) wrapF.style.display = vecina ? 'block' : 'none';
  if (chkF) chkF.checked = !!(c && c.fusionArriba);


  if (vecina) {
    var _cardFusV = document.getElementById('canaleta_card_fusion');
    if (_cardFusV) _cardFusV.style.display = 'block';
  }
  var lblF = document.getElementById('canaleta_fusion_lbl');
  if (lblF && vecina) {
    var nV = _canaletaNombresSueltos()[vecina] || (window._CANALETA_ROTULOS || {})[vecina];
    lblF.textContent = 'Fusionar con la canaleta de arriba' + (nV ? (' (' + nV + ')') : '');
  }

  var _sepDef = (String(destino).indexOf('itm:') === 0)
    ? BORN_CANALETA_SEP_COL : BORN_CANALETA_SEP;
  var _sepGen = (c && typeof c.sepMm === 'number') ? c.sepMm : Math.round(_sepDef * PX_TO_MM);
  _canaletaEscribirSepLados(c && c.sepLados, _sepGen);
  var inSob = document.getElementById('canaleta_sobrante');
  if (inSob) {
    inSob.value = String((c && typeof c.sobranteMm === 'number')
      ? c.sobranteMm : Math.round(BORN_CANALETA_SOBRANTE * PX_TO_MM));
    delete inSob.dataset.val;
  }







  var _tiraBarra = !!(gr && typeof _bornEsLugarBarra === 'function' && _bornEsLugarBarra(gr.lugar));
  var _todosLados = (String(destino).indexOf('fila:') === 0) || _tiraBarra;




  var _ladoIG = esPres ? 'der' : _canaletaTiraJuntoIG(gr);
  var _ladosDef = _todosLados ? BORN_CANALETA_LADOS.slice()
                : _ladoIG ? ['arriba', 'abajo', _ladoIG] : ['arriba'];


  if (!c && _ladoIG && inSob) { inSob.value = '0'; delete inSob.dataset.val; }
  BORN_CANALETA_LADOS.forEach(function(k) {
    var chk = document.getElementById('canaleta_lado_' + k);
    if (chk) chk.checked = c ? (c.lados || []).indexOf(k) !== -1
                             : (_ladosDef.indexOf(k) !== -1);
  });



  var _soloLado = esItm ? ((destino.slice(4) === 'left') ? 'izq' : 'der') : null;
  BORN_CANALETA_LADOS.forEach(function(k) {
    var chk = document.getElementById('canaleta_lado_' + k);
    if (!chk) return;
    var celda = chk.parentNode && chk.parentNode.parentNode;
    if (_soloLado) {
      var esEste = (k === _soloLado);
      if (celda && celda.style) celda.style.display = esEste ? '' : 'none';
      chk.checked = esEste;
      chk.disabled = esEste;
    } else {
      if (celda && celda.style) celda.style.display = '';
      chk.disabled = false;
    }
  });
  var _tiraBox = document.getElementById('canaleta_tira_box');
  if (_tiraBox) _tiraBox.textContent = 'EQUIPOS';




  var _wOtro = document.getElementById('canaleta_col_otro_wrap');
  var _chkOtro = document.getElementById('canaleta_col_otro');
  var _otroSd = esItm ? ((destino.slice(4) === 'left') ? 'right' : 'left') : null;
  var _ofreceOtro = !!(esItm && !c && !_canaletasItm()[_otroSd] &&
    (window._itmList || []).some(function(i) { return (i.side || 'left') === _otroSd; }));
  if (_wOtro) _wOtro.style.display = _ofreceOtro ? 'block' : 'none';
  if (_chkOtro) _chkOtro.checked = _ofreceOtro;
  var _lblOtro = document.getElementById('canaleta_col_otro_lbl');
  if (_lblOtro && _otroSd) {
    _lblOtro.textContent = 'También en el lado ' + (_otroSd === 'right' ? 'derecho' : 'izquierdo') + ' del panel busbar';
  }



  var lista = document.getElementById('canaleta_lista');
  if (lista) {
    var filas = _bornerasCorridaCanaleta(destino);


    lista.innerHTML = filas.map(function(f) {
      var conCheck = !!f.id;





      var marcado = f.dentro || (!c && (esFila || !!_ladoIG || _tiraBarra));
      var chk = f.id
        ? '<input type="checkbox" class="canaleta-eq" data-eq-id="' + f.id + '"' +
          (marcado ? ' checked' : '') + ' style="margin:0 8px 0 0;cursor:pointer">'
        : '';
      return '<label style="display:flex;align-items:center;justify-content:space-between;' +
             'gap:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);' +
             (conCheck ? 'cursor:pointer' : '') + '">' +
             '<span style="color:rgba(255,255,255,0.9);display:flex;align-items:center">' +
             chk + f.rot + '</span>' +
             '<span style="color:rgba(255,255,255,0.55)">' + f.desc + '</span></label>';
    }).join('');
    var card = document.getElementById('canaleta_card_lista');
    if (card) card.style.display = filas.length ? 'block' : 'none';
    _canaletaListaExclUI();
  }

  var btnQ = document.getElementById('canaleta_btnQuitar');
  if (btnQ) btnQ.style.display = c ? '' : 'none';
  var btnC = document.getElementById('canaleta_btnConfirmar');
  if (btnC) btnC.textContent = c ? "Guardar cambios" : 'Crear';

  _canaletaFusionTirasUI(c ? [destino] : []);
  _canaletaSobranteHook();
  _canaletaSobranteUI();
}

function cerrarModalCanaleta() {
  var ov = document.getElementById('modalCanaleta_overlay');
  if (ov) ov.classList.remove('activo');
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'none';
  _canaletaGrupoId = null;
  _canaletaBloqueRefs = null;
  _canaletaBloqueTiras = [];
  _canaletaBloqueEdit = null;
  _canaletaResaltarGuia(null);
}

function confirmarModalCanaleta() {



  var _fusTiras = {}, _domTiras = {};
  document.querySelectorAll('#canaleta_fusion_tiras .canaleta-fus-tira').forEach(function(c) {
    _fusTiras[c.dataset.ref] = !!c.checked;
  });
  document.querySelectorAll('#canaleta_fusion_tiras .canaleta-fus-tira-dom').forEach(function(sel) {
    _domTiras[sel.dataset.ref] = sel.value;
  });


  var _selDU = document.getElementById('canaleta_fusion_dom');
  var _domConj = _canaletaDomConjuntoVisible() ? (_selDU.value || 'col') : null;
  if (_domConj !== null) {
    Object.keys(_fusTiras).forEach(function(r) {
      _domTiras[r] = (_domConj === 'tira:' + r) ? 'tira' : 'col';
    });
  }
  var _cfgPrevTira = (typeof _canaletaGrupoId === 'string') ? _canaletaTiraCfg(_canaletaGrupoId) : null;
  if (_cfgPrevTira && _cfgPrevTira.fusionColumna && _fusTiras[_canaletaGrupoId] === undefined) {
    _fusTiras[_canaletaGrupoId] = true;
    if (_canTiraDomina(_cfgPrevTira)) _domTiras[_canaletaGrupoId] = 'tira';
  }
  var esPres = (_canaletaGrupoId === 'presencia');
  var esFila = (typeof _canaletaGrupoId === 'string' &&
                _canaletaGrupoId.indexOf('fila:') === 0);
  var esItm = (typeof _canaletaGrupoId === 'string' &&
               _canaletaGrupoId.indexOf('itm:') === 0);
  var gr = (esPres || esFila || esItm) ? null : _bornerasGrupoPorId(_canaletaGrupoId);
  if (esPres || esFila || esItm || gr) {
    var ancho = parseInt((document.getElementById('canaleta_ancho') || {}).value, 10) || 40;
    var lados = BORN_CANALETA_LADOS.filter(function(k) {
      var c = document.getElementById('canaleta_lado_' + k);
      return c && c.checked;
    });

    function _num(id, def, min, max) {
      var v = parseFloat((document.getElementById(id) || {}).value);
      if (isNaN(v)) return def;
      return Math.max(min, Math.min(max, v));
    }



    var _sepDefC = Math.round(((esItm) ? BORN_CANALETA_SEP_COL : BORN_CANALETA_SEP) * PX_TO_MM);
    var _slC = _canaletaLeerSepLados(_sepDefC);
    var val = lados.length ? {
      anchoMm: ancho, lados: lados,
      color: (document.getElementById('canaleta_color') || {}).value ||
             BORN_CANALETA_COLOR_DEF,
      sepLados:   _slC,
      sepMm:      _canaletaSepGeneral(_slC, lados, _sepDefC),
      sobranteMm: _canaletaSobranteValor(20)
    } : null;





    if (val) {
      var _ex = {};
      var _exPorRef = {};                                                 
      document.querySelectorAll('#canaleta_lista .canaleta-eq').forEach(function(c) {
        var id = c.dataset.eqId;
        if (!id) return;
        if (_canaletaBloqueRefs && c.dataset.ref) {
          if (id.indexOf('grp:') !== 0 && id.indexOf('cad:') !== 0 && !c.checked) {
            (_exPorRef[c.dataset.ref] = _exPorRef[c.dataset.ref] || {})[id] = true;
          }
        }
        if (id.indexOf('grp:') === 0) {


          var g = _bornerasGrupoPorId(id.slice(4));


          if (g) g.dentroCanaleta = !!c.checked;
        } else if (id.indexOf('cad:') === 0) {

          var gc = _bornerasGrupoPorId(id.slice(4));
          if (gc) { if (c.checked) gc.dentro = true; else delete gc.dentro; }
        } else if (!c.checked) {
          _ex[id] = true;
        }
      });
      if (esFila && Object.keys(_ex).length) val.excluidos = _ex;
    }
    var _chkF = document.getElementById('canaleta_fusion');
    var _wF = document.getElementById('canaleta_fusion_wrap');
    if (val && _chkF && _chkF.checked && _wF && _wF.style.display !== 'none') {
      val.fusionArriba = true;
    }
    var _chkC = document.getElementById('canaleta_fusion_col');
    var _wC = document.getElementById('canaleta_fusion_col_wrap');
    if (val && esFila && _chkC && _chkC.checked && _wC && _wC.style.display !== 'none') {
      val.fusionColumnas = true;
      var _selD = document.getElementById('canaleta_fusion_dom');
      if (_selD && _selD.value && _selD.value !== 'col' && _selD.value.indexOf('tira:') !== 0) val.fusionDominante = _selD.value;
    }
    if (_canaletaBloqueRefs && val) {




      var _fusChk = {};
      document.querySelectorAll('#canaleta_fusion_lista .canaleta-fus').forEach(function(c) {
        _fusChk[c.dataset.ref] = !!c.checked;
      });


      _canaletaBloqueVolcar();
      var _pr = (_canaletaBloqueEdit && _canaletaBloqueEdit.porRef) || {};
      var iFila = 0, _prevEnBloque = false;
      _canaletaBloqueRefs.forEach(function(r) {
        var mio = _pr[r] || { lados: val.lados, sepMm: val.sepMm, sobranteMm: val.sobranteMm };
        if (r.indexOf('itm:') === 0) {


          var sd = r.slice(4), cc = _canaletasItm()[sd];
          if (!cc) return;
          cc.anchoMm = val.anchoMm; cc.color = val.color;
          cc.sepMm = mio.sepMm; cc.sobranteMm = mio.sobranteMm;
          if (mio.sepLados) cc.sepLados = JSON.parse(JSON.stringify(mio.sepLados));
          return;
        }
        var cfg = { anchoMm: val.anchoMm, lados: (mio.lados || val.lados).slice(), color: val.color,
                    sepMm: mio.sepMm, sobranteMm: mio.sobranteMm };
        if (mio.sepLados) cfg.sepLados = JSON.parse(JSON.stringify(mio.sepLados));
        if (_exPorRef[r] && Object.keys(_exPorRef[r]).length) cfg.excluidos = _exPorRef[r];
        var _enBloque = (_fusChk[r] !== false);
        if (iFila === 0) {
          if (_enBloque && val.fusionArriba) cfg.fusionArriba = true;
          if (_enBloque && val.fusionColumnas) cfg.fusionColumnas = true;
          if (cfg.fusionColumnas && val.fusionDominante) cfg.fusionDominante = val.fusionDominante;
        }

        else if (_enBloque && _prevEnBloque) cfg.fusionArriba = true;

        if (cfg.fusionDominante && cfg.fusionDominante !== 'col' && _fusChk[cfg.fusionDominante] === false) {
          delete cfg.fusionDominante;
        }
        _prevEnBloque = _enBloque;
        _canaletasFila()[r.slice(5)] = cfg;
        iFila++;
      });
    }
    else if (esPres) { if (val) window._PRESENCIA_CANALETA = val; else _canaletaBorrarRef('presencia'); }
    else if (esItm) {
      var kI = _canaletaGrupoId.slice(4);
      if (val) {
        _canaletasItm()[kI] = val;


        var _chkO = document.getElementById('canaleta_col_otro');
        var _wO = document.getElementById('canaleta_col_otro_wrap');
        var _sdO = (kI === 'left') ? 'right' : 'left';
        if (_chkO && _chkO.checked && _wO && _wO.style.display !== 'none' && !_canaletasItm()[_sdO]) {
          var _ldA = (kI === 'left') ? 'izq' : 'der', _ldO = (_sdO === 'left') ? 'izq' : 'der';
          var vO = _canCopiaCfg(val, { lados: [_ldO] });
          var slO = JSON.parse(JSON.stringify(val.sepLados || {}));
          if (typeof slO[_ldA] === 'number') slO[_ldO] = slO[_ldA];
          vO.sepLados = slO;
          _canaletasItm()[_sdO] = vO;
        }
      }
      else _canaletaBorrarRef('itm:' + kI);
    }
    else if (esFila) {
      var kF = _canaletaKeyFila(_canaletaGrupoId.slice(5));
      if (val) _canaletasFila()[kF] = val;
      else _canaletaBorrarRef('fila:' + kF);
    }
    else if (val) gr.canaleta = val;
    else _canaletaBorrarRef(gr.id);
  }
  if (_canaletaBloqueRefs && val) {
    var _prT = (_canaletaBloqueEdit && _canaletaBloqueEdit.porRef) || {};
    (_canaletaBloqueTiras || []).forEach(function(r) {
      var ctB = _canaletaTiraCfg(r);
      if (!ctB) return;
      ctB.anchoMm = val.anchoMm; ctB.color = val.color;


      var chkT = document.querySelector('#canaleta_fusion_lista .canaleta-fus[data-ref="' + r + '"]');
      if (chkT && !chkT.checked) delete ctB.fusionArriba;
      var mT = _prT[r];
      if (mT && mT.lados && mT.lados.length) {
        ctB.lados = mT.lados.slice();
        ctB.sepMm = mT.sepMm; ctB.sobranteMm = mT.sobranteMm;
        if (mT.sepLados) ctB.sepLados = JSON.parse(JSON.stringify(mT.sepLados));
      }
    });
  } else if (typeof _canaletaGrupoId === 'string') {
    _canaletaIgualarFusionTira(_canaletaGrupoId);
  }
  Object.keys(_fusTiras).forEach(function(r) {
    var ct = _canaletaTiraCfg(r);
    if (!ct) return;


    delete ct.fusionDominante;
    if (_fusTiras[r]) {
      ct.fusionColumna = true;
      if (_domTiras[r] === 'tira') {
        ct.dominaTira = true;
        _canaletaUnSoloDominante('tira:' + r);
      }
      else delete ct.dominaTira;
    } else {
      delete ct.fusionColumna;
      delete ct.dominaTira;
    }
  });
  cerrarModalCanaleta();
  _postCambioBorneras();
}

function quitarCanaleta() {
  if (_canaletaBloqueRefs) {

    (_canaletaBloqueTiras || []).forEach(_canaletaBorrarRef);
    _canaletaBloqueRefs.forEach(_canaletaBorrarRef);
    cerrarModalCanaleta();
    _postCambioBorneras();
    return;
  }
  if (_canaletaGrupoId === 'presencia') {
    _canaletaBorrarRef('presencia');
  } else if (typeof _canaletaGrupoId === 'string' &&
             (_canaletaGrupoId.indexOf('fila:') === 0 ||
              _canaletaGrupoId.indexOf('itm:') === 0)) {


    _canaletaBorrarRef(_canaletaGrupoId);
  } else {
    _canaletaBorrarRef(_canaletaGrupoId);
  }
  cerrarModalCanaleta();
  _postCambioBorneras();
}








function canaletaFilasCfgYAncho(filaIds) {
  var cfgs = filaIds.map(function(ids) { return _canaletaCfgDeIds(ids); });
  _canaletaNormalizarFusion(cfgs);
  var anchos = filaIds.map(function() { return 0; });
  var bl = [];
  cfgs.forEach(function(c, f) {
    if (!c) { bl.push(null); return; }
    var ult = bl.length ? bl[bl.length - 1] : null;
    if (c.fusionArriba && ult && ult.fin === f - 1) { ult.ix.push(f); ult.fin = f; }
    else bl.push({ ix: [f], fin: f });
  });
  bl.forEach(function(b) {
    if (!b) return;
    var a = _canaletaAnchoBloque(b.ix.map(function(f) { return cfgs[f]; }));
    b.ix.forEach(function(f) { anchos[f] = a; });
  });
  return { cfgs: cfgs, anchos: anchos };
}







function canaletaParaEquipo(o) {
  var origen = o.origen, itm = o.itm, itmId = o.itmId;
  var desdeContactor = o.desdeContactor, desdeGrupo = o.desdeGrupo, desdeItmLibre = o.desdeItmLibre;
  var _equipoCanaletaKey = null, _yaCan = false, _motivoCan = '';
  if (desdeItmLibre) {





    var _grL = (typeof _bornerasGrupoPorId === 'function')
      ? _bornerasGrupoPorId(o.grupoId) : null;
    if (_grL && typeof _bornerasCanaletaDueno === 'function') {
      _equipoCanaletaKey = _bornerasCanaletaDueno(_grL);
      _yaCan = !!(typeof _bornerasCanaletaAloja === 'function' && _bornerasCanaletaAloja(_grL));
      _motivoCan = 'Este ITM ya tiene canaleta';
    }
  } else if (desdeGrupo) {





    _motivoCan = 'Esta tira ya tiene canaleta';
    if (o.grupoId === 'presencia') {
      _equipoCanaletaKey = 'presencia';
      _yaCan = !!window._PRESENCIA_CANALETA;
    } else {
      var _grT = (typeof _bornerasGrupoPorId === 'function')
        ? _bornerasGrupoPorId(o.grupoId) : null;
      if (_grT && typeof _bornerasCanaletaDueno === 'function') {
        _equipoCanaletaKey = _bornerasCanaletaDueno(_grT);
        _yaCan = !!(typeof _bornerasCanaletaAloja === 'function' &&
                    _bornerasCanaletaAloja(_grT));
      }
    }
  } else if (itm) {
    var _esInfCont = desdeContactor && itm.contactor &&
                     itm.contactor.ubicacion === 'inferior';
    var _esInfDif  = (origen === 'dif') && itm.dif &&
                     itm.dif.ubicacion === 'inferior';




    var _grLibre = (desdeContactor && itm.contactor &&
                    itm.contactor.ubicacion !== 'inferior' && itm.contactor.ubicacion !== 'lateral' &&
                    typeof _bornerasGrupoDeOrigen === 'function')
      ? _bornerasGrupoDeOrigen(itmId, 'contactor') : null;
    if (_grLibre) {
      _equipoCanaletaKey = _grLibre.dentro ? null : _grLibre.id;
      _yaCan = !!_grLibre.canaleta;
      _motivoCan = 'Este contactor ya tiene canaleta';
    } else if (typeof _canaletaFilaDeItm === 'function' && (_esInfCont || _esInfDif)) {
      var _kF = _canaletaFilaDeItm(itmId, _esInfCont ? 'cont' : 'dif');
      if (_kF) {
        _equipoCanaletaKey = 'fila:' + _kF;
        _yaCan = !!(typeof _canaletasFila === 'function' && _canaletasFila()[_kF]);
        _motivoCan = 'Esta fila ya tiene canaleta';
      }
    } else if (typeof _canaletasItm === 'function') {


      var _sideCan = itm.side || 'left';
      _equipoCanaletaKey = 'itm:' + _sideCan;
      _yaCan = !!_canaletasItm()[_sideCan];
      _motivoCan = 'Esta columna ya tiene canaleta';
    }
  }
  return { ref: _equipoCanaletaKey, ya: _yaCan, motivo: _motivoCan };
}
