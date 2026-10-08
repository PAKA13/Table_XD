




















var _BORN_TIPOS = {
  '2.5':    { src: 'assets/Aparamenta/Bornera_2.5mm2-vf.svg',                  w: 25, h: 212.5 },
  '4':      { src: 'assets/Aparamenta/Bornera_4mm2-vf.svg',                    w: 30, h: 212.5 },
  '6':      { src: 'assets/Aparamenta/Bornera_6mm2-vf.svg',                    w: 40, h: 212.5 },
  'pf4':    { src: 'assets/Aparamenta/Bornera_portafusible_vidrio_4mm2-vf.svg', w: 40, h: 362.5 },
  'pfcart': { src: 'assets/Aparamenta/Portafusible_tipo_Cartucho-vf.svg',      w: 90, h: 437.5 }
};
var _BORN_TOPE = { src: 'assets/Aparamenta/Tope-vf.svg', w: 40, h: 225 };
var _BORN_SEPARADOR = { src: 'assets/Aparamenta/Bornera_separador-vf.svg', w: 10, h: 212.5 };














function _presenciaSecciones() {


  if (!window._igData) return [];
  var s = window._PRESENCIA_SECCIONES;
  if (s && s.length) return s;
  if ((window._BORNERAS_CANT | 0) > 0) {
    return [{ tipo: window._BORNERAS_TIPO || '2.5',
              cant: window._BORNERAS_CANT | 0,
              extIzq: window._EXT_IZQ || _BORN_EXT_IZQ_DEF,
              extDer: window._EXT_DER || _BORN_EXT_DER_DEF,
              cantManual: false }];
  }
  return [];
}

var _BORN_EXT_IZQ_DEF = 'tope';
var _BORN_EXT_DER_DEF = 'separador';

function _bornPiezaExtremo(v) {
  if (v === 'tope')      return _BORN_TOPE;
  if (v === 'separador') return _BORN_SEPARADOR;
  return null;                                    
}
function _bornAnchoExtremo(v) {
  var p = _bornPiezaExtremo(v);
  return p ? p.w : 0;
}


function _bornExtremos(o) {
  var izq = o && o.extIzq, der = o && o.extDer;
  if (izq === undefined || der === undefined) {
    var t = (o && o.topes) || 0;
    if (t) {                                                            
      if (izq === undefined) izq = 'tope';
      if (der === undefined) der = (t >= 2) ? 'tope' : 'ninguno';
    } else {
      if (izq === undefined) izq = _BORN_EXT_IZQ_DEF;
      if (der === undefined) der = _BORN_EXT_DER_DEF;
    }
  }
  return { izq: izq, der: der };
}




var _BORN_TIMER = { src: 'assets/Aparamenta/Timer-vf.svg', w: 180, h: 425 };


var _BORN_TERMOSTATO = { src: 'assets/Aparamenta/Termostato-vf.svg', w: 165, h: 300 };
var _BORN_GAP = 150;                                                        






var BORN_IG_PARED_PX = 250;

var BORN_CONT_GAP_LEFT_PX  = 250;
var BORN_CONT_GAP_RIGHT_PX = 250;


function _bornerasGrupoContactor(side) {
  return _bornerasGrupoDe('lat-' + side);
}



function _bornerasAnchoLateral(side) {
  var raiz = _bornerasGrupoContactor(side);
  if (!raiz) return 0;
  var max = 0, actual = raiz;
  var guard = 0;
  while (actual && guard++ < 20) {
    var w = _bornerasDims(actual).hTotal;
    if (w > max) max = w;
    actual = _bornerasGrupoDe('junto', actual.id);
  }
  return max;
}





function _bornerasGrupoDeOrigen(itmId, clase) {
  if (!itmId) return null;




  var buscada = clase || 'bornera';
  var g = _bornerasGrupos();
  for (var i = 0; i < g.length; i++) {
    if (g[i].origen !== itmId) continue;
    if ((g[i].clase || 'bornera') === buscada) return g[i];
  }
  return null;
}





var _bornSeq = 0;
function _bornerasNuevoId() {
  _bornSeq++;
  return 'brn' + Date.now() + '_' + _bornSeq;
}

function _bornerasGrupos() {
  if (!Array.isArray(window._BORNERAS_GRUPOS)) window._BORNERAS_GRUPOS = [];
  return window._BORNERAS_GRUPOS;
}

function _bornerasGrupoDe(lugar, ref) {
  var g = _bornerasGrupos();
  for (var i = 0; i < g.length; i++) {
    if (g[i].lugar === lugar && (!ref || g[i].ref === ref)) return g[i];
  }
  return null;
}






function _bornerasFilasInf(container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return [];
  var porY = {};
  container.querySelectorAll('.dif-inferior, .contactor-inferior').forEach(function(el) {
    var y = Math.round(parseFloat(el.style.top) || 0);
    var x = parseFloat(el.style.left) || 0;
    var w = parseFloat(el.style.width) || 0;
    var h = parseFloat(el.style.height) || 0;
    var id = el.dataset.difItmId ? ('dif:' + el.dataset.difItmId)
           : (el.dataset.contactorItmId ? ('cont:' + el.dataset.contactorItmId) : null);
    var f = porY[y];
    if (!f) { porY[y] = { izq: x, der: x + w, top: y, bot: y + h, miembros: [], cajas: {} }; f = porY[y]; }
    else {
      if (x < f.izq) f.izq = x;
      if (x + w > f.der) f.der = x + w;
      if (y + h > f.bot) f.bot = y + h;
    }
    if (id && f.miembros.indexOf(id) === -1) f.miembros.push(id);


    if (id) {
      var c = f.cajas[id];
      f.cajas[id] = c
        ? { x: Math.min(c.x, x), y: Math.min(c.y, y),
            w: Math.max(c.x + c.w, x + w) - Math.min(c.x, x),
            h: Math.max(c.y + c.h, y + h) - Math.min(c.y, y) }
        : { x: x, y: y, w: w, h: h };
    }
  });
  var filas = Object.keys(porY).sort(function(a, b) { return a - b; })
    .map(function(y) { return porY[y]; });



  filas.forEach(function(f) { f.topEq = f.top; f.botEq = f.bot; });











  container.querySelectorAll('.bornera-wrap').forEach(function(w) {
    var gr = _bornerasGrupoPorId(w.dataset.bornGrupoId);
    if (!gr) return;
    var fref = _grupoFilaRef(gr);
    if (!fref) return;
    var cx = parseFloat(w.dataset.visCx), cy = parseFloat(w.dataset.visCy);
    var vw = parseFloat(w.dataset.visW), vh = parseFloat(w.dataset.visH);
    if (isNaN(cx) || isNaN(vw)) return;
    for (var i = 0; i < filas.length; i++) {
      if (filas[i].miembros.indexOf(fref) === -1) continue;
      var gid = 'grp:' + gr.id;
      if (filas[i].miembros.indexOf(gid) === -1) filas[i].miembros.push(gid);
      if (!_grupoDentroCanaleta(gr)) break;                                           
      filas[i].izq = Math.min(filas[i].izq, cx - vw / 2);
      filas[i].der = Math.max(filas[i].der, cx + vw / 2);
      filas[i].top = Math.min(filas[i].top, cy - vh / 2);
      filas[i].bot = Math.max(filas[i].bot, cy + vh / 2);
      filas[i].cajas[gid] = { x: cx - vw / 2, y: cy - vh / 2, w: vw, h: vh };
      break;
    }
  });
  return filas;
}









function _bornSaltoValido(gr) {
  return !!(gr && gr.salto && gr.origen && gr.lugar && gr.lugar.indexOf('dif-inf-') === 0 &&
            !gr.alFinal && gr.filaRef === 'cont:' + gr.origen);
}


function _bornSaltoDestino(gr) {
  if (!gr || !gr.origen || typeof _elementosInferioresBase !== 'function') return null;
  var els = _elementosInferioresBase();
  for (var i = 0; i + 1 < els.length; i++) {
    if (els[i].kind === 'contactor' && els[i].itm.id === gr.origen) {
      var n = els[i + 1];
      return (n.kind === 'dif' ? 'dif:' : 'cont:') + n.itm.id;
    }
  }
  return null;
}

function _bornSaltoDeContactor(itmId) {
  var g = _bornerasGrupos();
  for (var i = 0; i < g.length; i++) {
    if (g[i].origen === itmId && _bornSaltoValido(g[i])) return true;
  }
  return false;
}

function _bornFilaRefEf(gr) {
  if (!gr) return null;
  if (_bornSaltoValido(gr)) { var d = _bornSaltoDestino(gr); if (d) return d; }
  return gr.filaRef || null;
}

function _saltoFilaGrupo(id) {
  var gr = _bornerasGrupoPorId(id);
  if (!gr) return;
  if (gr.salto) {
    delete gr.salto;
  } else {
    if (!_bornSaltoOpcion(gr)) return;
    gr.salto = true;
  }
  _conReglas(function() {
    dibujarPanelBusbar();
    if (typeof guardarSesion === 'function') guardarSesion();
  });
}

function _bornSaltoOpcion(gr) {
  if (!gr || !gr.origen || !gr.lugar || gr.lugar.indexOf('dif-inf-') !== 0) return null;
  if (gr.alFinal || gr.filaRef !== 'cont:' + gr.origen) return null;
  var dest = _bornSaltoDestino(gr);
  if (!dest) return null;
  if (gr.salto) return 'Quitar salto';
  if (typeof _infoFilaInferior !== 'function' || typeof _layoutInferior !== 'function') return null;
  var lay = _layoutInferior(), inf = _infoFilaInferior(gr.origen, 'contactor');
  if (!lay || !inf) return null;

  var ids = lay.filaIds[inf.fila] || [];
  var hayCan = !!(typeof _canaletaCfgDeIds === 'function' && _canaletaCfgDeIds(ids));
  if (_bornerasDuenoEnFila(gr, ids, hayCan) !== 'cont:' + gr.origen) return null;

  var destAbre = false;
  for (var i = 0; i < lay.els.length; i++) {
    var k = (lay.els[i].kind === 'dif' ? 'dif:' : 'cont:') + lay.els[i].itm.id;
    if (k === dest) destAbre = lay.filaDe[i] !== inf.fila;
  }
  if (!destAbre && inf.numFilas >= 5) return null;
  return 'Saltar a F' + (inf.fila + 2);
}




function _grupoFilaRef(gr) {
  var a = gr, g = 0;
  while (a && g++ < 20) {
    if (a.filaRef) return _bornFilaRefEf(a);
    if (a.lugar !== 'junto') return null;
    a = _bornerasGrupoPorId(a.ref);
  }
  return null;
}


function _bornerasRaizCadena(gr) {
  var a = gr, g = 0;
  while (a && a.lugar === 'junto' && g++ < 20) a = _bornerasGrupoPorId(a.ref);
  return a || gr;
}





function _bornerasSignoCadena(gr) {
  var lg = (_bornerasRaizCadena(gr) || {}).lugar;
  return (lg === 'ig-izq' || lg === 'lat-right') ? -1 : 1;
}


function _bornerasDims(gr) {



  if (gr.clase === 'contactor') {
    var _mc = (typeof _contactorModelo === 'function')
      ? _contactorModelo(gr.capacidad) : { src: '', w: 225, h: 385 };
    var dC = { t: _mc, topes: 0, contactor: true,
               w: (gr.cant || 1) * _mc.w, h: _mc.h };
    dC.canaleta = gr.dentro ? null
      : _bornerasCanaleta(gr, dC, _bornerasLargoDentro(gr), _bornerasSignoCadena(gr));
    var eC = dC.canaleta ? dC.canaleta.extra
                         : { izq: 0, der: 0, arriba: 0, abajo: 0 };
    dC.wTotal = dC.w + eC.izq + eC.der;
    dC.hTotal = dC.h + eC.arriba + eC.abajo;
    return dC;
  }
  if (gr.clase === 'itm') {



    var _mi = (typeof _buscarITM === 'function') ? _buscarITM(gr.origen) : null;
    var _dimI = (typeof _itmDimsLibre === 'function') ? _itmDimsLibre(_mi)
                                                     : { w: 425, h: 90 };
    var dI = { t: { src: _dimI.src, w: _dimI.w, h: _dimI.h }, topes: 0,
               itmLibre: true, reservaItm: (_mi && _mi.tipo === 'reserva'),
               w: _dimI.w, h: _dimI.h };
    dI.canaleta = gr.dentro ? null
      : _bornerasCanaleta(gr, dI, _bornerasLargoDentro(gr), _bornerasSignoCadena(gr));
    var eI = dI.canaleta ? dI.canaleta.extra
                         : { izq: 0, der: 0, arriba: 0, abajo: 0 };
    dI.wTotal = dI.w + eI.izq + eI.der;
    dI.hTotal = dI.h + eI.arriba + eI.abajo;
    return dI;
  }
  if (gr.clase === 'dps') {





    var _mdp = (typeof _dpsDims === 'function') ? _dpsDims(gr.polos) : { w: 175, h: 415 };
    var _tdp = { src: (typeof _dpsSrc === 'function') ? _dpsSrc(gr.polos)
                      : 'assets/Aparamenta/DPS_' + (gr.polos || 2) + 'p-vf.svg',
                 w: _mdp.w, h: _mdp.h };
    var dD = { t: _tdp, topes: 0, dps: true,
               w: (gr.cant || 1) * _tdp.w, h: _tdp.h };
    dD.canaleta = gr.dentro ? null
      : _bornerasCanaleta(gr, dD, _bornerasLargoDentro(gr), _bornerasSignoCadena(gr));
    var eD = dD.canaleta ? dD.canaleta.extra
                         : { izq: 0, der: 0, arriba: 0, abajo: 0 };
    dD.wTotal = dD.w + eD.izq + eD.der;
    dD.hTotal = dD.h + eD.arriba + eD.abajo;
    return dD;
  }
  if (gr.clase === 'termostato') {

    var dS = { t: _BORN_TERMOSTATO, topes: 0, termostato: true,
               w: (gr.cant || 1) * _BORN_TERMOSTATO.w, h: _BORN_TERMOSTATO.h };
    dS.canaleta = gr.dentro ? null
      : _bornerasCanaleta(gr, dS, _bornerasLargoDentro(gr), _bornerasSignoCadena(gr));
    var eS = dS.canaleta ? dS.canaleta.extra
                         : { izq: 0, der: 0, arriba: 0, abajo: 0 };
    dS.wTotal = dS.w + eS.izq + eS.der;
    dS.hTotal = dS.h + eS.arriba + eS.abajo;
    return dS;
  }
  if (gr.clase === 'timer') {



    var dT = { t: _BORN_TIMER, topes: 0, timer: true,
               w: (gr.cant || 1) * _BORN_TIMER.w, h: _BORN_TIMER.h };
    dT.canaleta = gr.dentro ? null
      : _bornerasCanaleta(gr, dT, _bornerasLargoDentro(gr), _bornerasSignoCadena(gr));
    var eT = dT.canaleta ? dT.canaleta.extra
                         : { izq: 0, der: 0, arriba: 0, abajo: 0 };
    dT.wTotal = dT.w + eT.izq + eT.der;
    dT.hTotal = dT.h + eT.arriba + eT.abajo;
    return dT;
  }
  var t = _BORN_TIPOS[gr.tipo] || _BORN_TIPOS['2.5'];
  var ext = _bornExtremos(gr);
  var pIzq = _bornPiezaExtremo(ext.izq), pDer = _bornPiezaExtremo(ext.der);
  var d = {
    t: t,
    ext: ext,
    pIzq: pIzq,
    pDer: pDer,
    w: _bornAnchoExtremo(ext.izq) + (gr.cant || 1) * t.w + _bornAnchoExtremo(ext.der),
    h: Math.max(t.h, pIzq ? pIzq.h : 0, pDer ? pDer.h : 0)
  };






  d.canaleta = gr.dentro ? null
    : _bornerasCanaleta(gr, d, _bornerasLargoDentro(gr), _bornerasSignoCadena(gr));
  var e = d.canaleta ? d.canaleta.extra : { izq: 0, der: 0, arriba: 0, abajo: 0 };
  d.wTotal = d.w + e.izq + e.der;
  d.hTotal = d.h + e.arriba + e.abajo;
  return d;
}





function _bornerasAnchoCadena(raiz) {
  var total = 0, actual = raiz, guard = 0, tapado = false;
  while (actual && guard++ < 20) {
    var dm = _bornerasDims(actual);






    if (!(actual.dentro && tapado)) {
      total += dm.wTotal;
      if (!actual.dentro) tapado = !!dm.canaleta;
    }
    actual = _bornerasGrupoDe('junto', actual.id);
  }
  return total;
}








function _bornerasDuenoEnFila(raiz, ids, hayCanaleta) {
  if (!raiz || !raiz.origen || !ids) return null;


  if (raiz.alFinal) return null;
  if (hayCanaleta && !_grupoDentroCanaleta(raiz)) return null;

  if (_bornSaltoValido(raiz)) {
    var dS = _bornSaltoDestino(raiz);
    if (dS) return ids.indexOf(dS) === -1 ? null : '<' + dS;
  }
  var k = 'cont:' + raiz.origen;
  return ids.indexOf(k) === -1 ? null : k;
}




function _bornerasRaicesFila(idxFila, itmIds) {
  var g = _bornerasGrupos(), out = [];
  for (var i = 0; i < g.length; i++) {
    if (!g[i].lugar || g[i].lugar.indexOf('dif-inf-') !== 0) continue;
    var _fr = _bornFilaRefEf(g[i]);
    var enFila = _fr ? !!(itmIds && itmIds.indexOf(_fr) !== -1)
                              : (g[i].lugar === 'dif-inf-' + idxFila);
    if (enFila) out.push(g[i]);
  }
  return out;
}



function _bornerasHuecosFila(idxFila, itmIds, hayCanaleta) {
  var out = {};
  _bornerasRaicesFila(idxFila, itmIds).forEach(function(r) {
    var k = _bornerasDuenoEnFila(r, itmIds, hayCanaleta) || '';
    out[k] = (out[k] || 0) + _bornerasAnchoCadena(r);
  });
  return out;
}






function _bornerasXEnFila(gr, sitio) {
  var eqs = sitio.miembros.filter(function(m) { return m.indexOf('grp:') !== 0; });
  if (!eqs.length) return null;
  var hayCan = !!_canaletaCfgDeIds(eqs);
  var dueno = sitio.fuera ? null : _bornerasDuenoEnFila(gr, eqs, hayCan);

  if (dueno && dueno.charAt(0) === '<' && sitio.cajas[dueno.slice(1)]) {
    return sitio.cajas[dueno.slice(1)].x - _bornerasAnchoCadena(gr);
  }
  if (dueno && sitio.cajas[dueno]) return sitio.cajas[dueno].x + sitio.cajas[dueno].w;
  if (sitio.fuera) return null;

  var ult = eqs[eqs.length - 1], cj = sitio.cajas[ult];
  if (!cj) return null;
  var hu = _bornerasHuecosFila(null, eqs, hayCan);
  return cj.x + cj.w + (hu[ult] || 0);
}

function _bornerasAnchoFilaInferior(idxFila, itmIds) {
  var tot = 0;
  _bornerasRaicesFila(idxFila, itmIds).forEach(function(r) { tot += _bornerasAnchoCadena(r); });
  return tot;
}




function _bornerasPresenciaBorde(container) {
  if (!container || !(window._BORNERAS_CANT > 0)) return null;
  var max = null;
  container.querySelectorAll('.bornera-img').forEach(function(img) {
    if (img.closest('.bornera-wrap')) return;                              
    if (img.classList.contains('bornera-presencia-tri')) return;                    
    if (img.classList.contains('equipo-aura')) return;                         
    var r = (parseFloat(img.style.left) || 0) + (parseFloat(img.style.width) || 0);
    if (max === null || r > max) max = r;
  });
  return max;
}




function _bornerasLugares(container, itmIdContactor, grActual) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return [];
  var out = [];

  var ig = container.querySelector('.ig-img');
  if (ig) {
    var igX = parseFloat(ig.style.left) || 0;
    var igY = parseFloat(ig.style.top) || 0;
    var igW = parseFloat(ig.style.width) || 0;
    var igH = parseFloat(ig.style.height) || 0;
    var cyIG = igY + igH / 2;


    var gapIG = (grActual && typeof grActual.gapMm === 'number')
      ? (grActual.gapMm / PX_TO_MM) : _BORN_GAP;
    out.push({ lugar: 'ig-izq', label: 'Izquierda del IG', cx: igX - gapIG, cy: cyIG,
               anclaDer: true, hacia: 'left' });



    var _presDer = _bornerasPresenciaBorde(container);
    out.push({ lugar: 'ig-der', label: 'Derecha del IG',
               cx: (_presDer !== null) ? _presDer : (igX + igW + gapIG),
               cy: cyIG, hacia: 'right' });
  }







  var _lat = { left: null, right: null };
  container.querySelectorAll('.contactor-img[data-contactor-itm-id]:not(.contactor-tri):not(.contactor-inferior)').forEach(function(kimg) {
    var kitm = (typeof _buscarITM === 'function') ? _buscarITM(kimg.dataset.contactorItmId) : null;
    if (!kitm) return;
    var kx = parseFloat(kimg.style.left) || 0;
    var ky = parseFloat(kimg.style.top) || 0;
    var kw = parseFloat(kimg.style.width) || 0;
    var kh = parseFloat(kimg.style.height) || 0;
    var kcx = kx + kw / 2, kcy = ky + kh / 2;


    var _sinGiro = kimg.classList.contains('itm-reserva');
    var _hVis = _sinGiro ? kh : kw;                         
    var _wVis = _sinGiro ? kw : kh;                          
    var borde = (kitm.side === 'left') ? (kcx - _wVis / 2) : (kcx + _wVis / 2);
    var vTop = kcy - _hVis / 2, vBot = kcy + _hVis / 2;
    var a = _lat[kitm.side];
    if (!a) {
      _lat[kitm.side] = { borde: borde, cyTop: kcy, top: vTop, bot: vBot };
    } else {


      if (kitm.side === 'left') { if (borde < a.borde) a.borde = borde; }
      else                      { if (borde > a.borde) a.borde = borde; }
      if (kcy < a.cyTop) a.cyTop = kcy;
      if (vTop < a.top) a.top = vTop;
      if (vBot > a.bot) a.bot = vBot;
    }
  });
  ['left', 'right'].forEach(function(sd) {
    var a = _lat[sd];
    if (!a) return;



    if (typeof _colLatBordeExterno === 'function') {
      var _bc = _colLatBordeExterno(sd);
      if (_bc !== null) a.borde = (sd === 'left') ? Math.min(a.borde, _bc) : Math.max(a.borde, _bc);
    }
    var gapK = (sd === 'left') ? BORN_CONT_GAP_LEFT_PX : BORN_CONT_GAP_RIGHT_PX;
    out.push({ lugar: 'lat-' + sd,
               label: 'Lateral ' + (sd === 'left' ? 'izquierdo' : 'derecho'),
               rotado: true, side: sd, cy: a.cyTop,
               cx: (sd === 'left') ? (a.borde - gapK) : (a.borde + gapK),
               anclaDer: (sd === 'left'),

               top: a.top, alto: a.bot - a.top });
  });
  void itmIdContactor;                                                    











  var _filasL = _bornerasFilasInf(container);
  var _infoL = _filasL.map(function(f) {
    var cfg = _canaletaCfgDeIds(f.miembros);
    if (!cfg) return null;
    var cj = _canaletaCajaFila(f, cfg);
    var can = _bornerasCanaleta({ canaleta: cfg }, { w: cj.der - cj.izq, h: cj.bot - cj.top }, 0, 1,
                                { sinArriba: !!cfg.fusionArriba });
    return can ? { cfg: cfg, cj: cj, can: can, outer: cj.der + can.extra.der } : null;
  });
  function _outerBloque(i) {
    var a = i, b = i;
    while (a > 0 && _infoL[a] && _infoL[a].cfg.fusionArriba && _infoL[a - 1]) a--;
    while (b + 1 < _infoL.length && _infoL[b + 1] && _infoL[b + 1].cfg.fusionArriba) b++;
    var o = -Infinity;
    for (var k = a; k <= b; k++) if (_infoL[k] && _infoL[k].outer > o) o = _infoL[k].outer;
    if (_infoL[a] && _infoL[a].cfg.fusionColumnas && typeof _canaletaColumnaGeom === 'function') {
      var gR = _canaletaColumnaGeom('right', container);
      if (gR && gR.x + gR.w > o) o = gR.x + gR.w;
    }
    return o;
  }
  _filasL.forEach(function(f, i) {








    var _cfgF = _canaletaCfgDeIds(f.miembros);
    var _cjF = _cfgF ? _canaletaCajaFila(f, _cfgF) : null;
    var _canF = _cfgF ? _bornerasCanaleta({ canaleta: _cfgF },
      { w: _cjF.der - _cjF.izq, h: _cjF.bot - _cjF.top }, 0, 1,
      { sinArriba: !!_cfgF.fusionArriba }) : null;


    var _fT = (typeof f.topEq === 'number') ? f.topEq : f.top;
    var _fB = (typeof f.botEq === 'number') ? f.botEq : f.bot;
    if (_canF) {
      out.push({ lugar: 'dif-inf-' + i, label: 'Dentro de la canaleta',
                 dentroCanaleta: true,
                 cx: f.der, cy: (f.top + f.bot) / 2, hacia: 'right',
                 filaTop: _fT, filaBot: _fB, miembros: f.miembros, cajas: f.cajas });




      var _outer = Math.max(_cjF.der + _canF.extra.der, _outerBloque(i));
      var _cyF = (_fT + _fB) / 2;
      container.querySelectorAll('.canaleta-fila.bornera-canaleta[data-lado="der"], ' +
                                 '.canaleta-itm.bornera-canaleta[data-lado="der"]').forEach(function(el) {
        var y0 = parseFloat(el.style.top), y1 = y0 + parseFloat(el.style.height);
        if (_cyF < y0 || _cyF > y1) return;
        var x1 = parseFloat(el.style.left) + parseFloat(el.style.width);
        if (x1 > _outer) _outer = x1;
      });
      out.push({ lugar: 'dif-inf-' + i, label: 'Fuera de la canaleta', fuera: true,
                 cx: _outer, cy: (f.top + f.bot) / 2,
                 hacia: 'right', filaTop: _fT, filaBot: _fB, miembros: f.miembros, cajas: f.cajas });
    } else {
      out.push({ lugar: 'dif-inf-' + i, label: 'Al lado de la fila ' + (i + 1),
                 cx: f.der, cy: (f.top + f.bot) / 2, hacia: 'right',
                 filaTop: _fT, filaBot: _fB, miembros: f.miembros, cajas: f.cajas });
    }
  });



  var gapBarra = (grActual && typeof grActual.gapMm === 'number')
    ? (grActual.gapMm / PX_TO_MM) : _BORN_GAP;
  var barras = [];
  [['pe', '.bar-pe-seg', 'la barra de tierra'], ['n', '.bar-n-seg', 'la barra de neutro']]
    .forEach(function(b) {



      if (typeof _barraAbajo === 'function' && !_barraAbajo(b[0])) return;
      var segs = [].filter.call(container.querySelectorAll(b[1]), function(s) {
        return !s.closest('.barra-lado-ig');
      });
      if (!segs.length) return;
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      segs.forEach(function(s) {
        var x = parseFloat(s.style.left) || 0, y = parseFloat(s.style.top) || 0;
        var w = parseFloat(s.style.width) || 0, h = parseFloat(s.style.height) || 0;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x + w > maxX) maxX = x + w;
        if (y + h > maxY) maxY = y + h;
      });
      barras.push({ key: b[0], label: b[2], cx: (minX + maxX) / 2,
                    top: minY, bot: maxY });
    });



  barras.sort(function(a, b) { return a.top - b.top; });
  barras.forEach(function(bb, i) {
    out.push({ lugar: bb.key + '-arriba', label: 'Arriba de ' + bb.label, cx: bb.cx,
               cy: bb.top - gapBarra, anclaAbajo: true, barTop: bb.top, barBot: bb.bot,
               hueco: 'h' + i });
    out.push({ lugar: bb.key + '-abajo',  label: 'Abajo de ' + bb.label,  cx: bb.cx,
               cy: bb.bot + gapBarra, barTop: bb.top, barBot: bb.bot,
               hueco: 'h' + (i + 1) });
  });

  return out;
}









function _rejillaCadenaGrupos() {
  var g = _bornerasGrupos() || [];
  var mios = g.filter(function(x) { return x.origen === 'rejilla'; });
  if (mios.length < 2) return mios;
  var ids = {};
  mios.forEach(function(x) { ids[x.id] = true; });
  var cabeza = null;
  for (var i = 0; i < mios.length; i++) {
    if (!(mios[i].lugar === 'junto' && mios[i].ref && ids[mios[i].ref])) {
      cabeza = mios[i]; break;
    }
  }
  if (!cabeza) cabeza = mios[0];
  var out = [cabeza], act = cabeza, guard = 0;
  while (guard++ < 20) {
    var hijo = _bornerasGrupoDe('junto', act.id);
    if (!hijo || hijo.origen !== 'rejilla') break;
    out.push(hijo);
    act = hijo;
  }
  return out;
}








function _timerDe(itmId) {
  return (typeof _bornerasGrupoDeOrigen === 'function') ? _bornerasGrupoDeOrigen(itmId, 'timer') : null;
}
function _timerComprado(g) {
  if (!g || g.clase !== 'timer' || g.reserva) return false;
  var it = (g.origen && typeof _buscarITM === 'function') ? _buscarITM(g.origen) : null;
  return !!(it && it.contactor && !it.contactor.reserva);
}

function _bornerasPertenece(gr) {




  if (gr.clase === 'itm' && typeof _buscarITM === 'function') {
    var _itmL = _buscarITM(gr.origen);
    if (_itmL && _itmL.rotulo) return _itmL.rotulo;
  }
  var letra = (gr.clase === 'timer') ? 'T-'
            : (gr.clase === 'termostato') ? 'TS-' : 'K-';
  if (gr.origen === 'medidor') return 'PM';

  if (gr.clase === 'dps') return 'DPS';


  if (gr.origen === 'rejilla') return 'RV';
  if (gr.origen && typeof _buscarITM === 'function') {
    var itm = _buscarITM(gr.origen);
    if (itm && itm.rotulo) return itm.rotulo.replace('C-', letra);
  }
  var lg = gr.lugar;
  if (lg === 'junto') {


    if (gr.ref === 'presencia') return 'IG';



    var padre = _bornerasGrupoPorId(gr.ref);
    if (!padre) return '';







    var _pAsk = padre;
    if (padre.origen === 'medidor' || padre.origen === 'rejilla') {
      _pAsk = {};
      for (var _kp in padre) _pAsk[_kp] = padre[_kp];
      _pAsk.origen = null;
    }
    var heredado = _bornerasPertenece(_pAsk);
    return heredado.replace(/^[KT]-/, letra);
  }
  if (lg === 'ig-izq' || lg === 'ig-der') return 'IG';
  if (lg === 'pe-arriba' || lg === 'pe-abajo') return 'Barra PE';
  if (lg === 'n-arriba' || lg === 'n-abajo') return 'Barra N';
  if (lg.indexOf('dif-inf-') === 0) return 'Fila ' + (parseInt(lg.slice(8), 10) + 1);
  if (lg === 'lat-left') return 'Lat. izq';
  if (lg === 'lat-right') return 'Lat. der';
  return '';
}





function _bornerasDireccion(lugar) {
  if (lugar === 'ig-izq') return 'left';
  if (lugar === 'lat-left' || lugar === 'lat-right') return 'down';
  return 'right';
}







var BORN_CLASES_EQUIPO = ['timer', 'contactor', 'termostato', 'itm', 'dps'];
function _bornEsEquipo(clase) { return BORN_CLASES_EQUIPO.indexOf(clase) !== -1; }

function _bornNombreClase(clase) {
  return { timer: 'el timer', contactor: 'el contactor', termostato: 'el termostato',
           itm: 'el ITM', dps: 'el DPS' }[clase] || 'las borneras';
}


function _bornEsLugarBarra(lugar) {
  return lugar === 'pila' || /^(pe|n|pea)-(arriba|abajo)$/.test(lugar || '');
}







function _bornPilaSobre(gr) {
  var out = [], a = gr ? _bornerasGrupoDe('pila', gr.id) : null, g = 0;
  while (a && g++ < 30) { out.push(a); a = _bornerasGrupoDe('pila', a.id); }
  return out;
}

function _bornPilaRaiz(gr) {
  var a = gr, g = 0;
  while (a && a.lugar === 'pila' && g++ < 30) a = _bornerasGrupoPorId(a.ref);
  return a;
}

function _bornPilaTope(raiz) {
  var s = _bornPilaSobre(raiz);
  return s.length ? s[s.length - 1] : raiz;
}



function _bornAltoCadena(gr) {
  var h = _bornerasDims(gr).h, a = _bornerasGrupoDe('junto', gr.id), g = 0;
  while (a && g++ < 30) {
    var da = _bornerasDims(a);
    if (da.h > h) h = da.h;
    a = _bornerasGrupoDe('junto', a.id);
  }
  return h;
}









function _bornerasOrigen(sitio, dims, altoCadena) {





  var _f = dims.canaleta ? dims.canaleta.flanco
                         : { izq: 0, der: 0, arriba: 0, abajo: 0 };
  var x;
  if (sitio.hacia === 'right')     x = sitio.cx + _f.izq;
  else if (sitio.hacia === 'left') x = sitio.cx - dims.w - _f.der;
  else                             x = sitio.cx - dims.w / 2;

  var centradoY = (sitio.lugar === 'ig-izq' || sitio.lugar === 'ig-der' ||
                   sitio.lugar === 'contactor' ||
                   sitio.lugar.indexOf('dif-inf-') === 0);
  var _ex = (altoCadena && altoCadena > dims.h) ? (altoCadena - dims.h) / 2 : 0;
  var y = centradoY ? (sitio.cy - dims.h / 2)
                    : (sitio.anclaAbajo ? (sitio.cy - dims.h - _f.abajo - _ex)
                                        : (sitio.cy + _f.arriba + _ex));
  return { x: x, y: y };
}






function _bornerasRepararSinGrupo() {
  if (document.body.classList.contains('born-eligiendo')) return;                        

  if (window._bornEsperandoLugar) return;
  var nuevo = function(clase, origen, extra) {
    var g = { id: _bornerasNuevoId(), lugar: '__sinLugar', ref: null, origen: origen,
              filaRef: null, clase: clase, tipo: '2.5', cant: 1,
              extIzq: _BORN_EXT_IZQ_DEF, extDer: _BORN_EXT_DER_DEF, gapMm: 30 };
    Object.keys(extra || {}).forEach(function(k) { g[k] = extra[k]; });
    _bornerasGrupos().push(g);
  };
  var todos = (typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []);
  todos.forEach(function(itm) {
    if (!itm || !itm.id) return;
    if (itm.libre && !_bornerasGrupoDeOrigen(itm.id, 'itm')) nuevo('itm', itm.id);

    var pegar = itm.libre && typeof _encadenarJuntoAlItmLibre === 'function' &&
                typeof _grupoDelItmLibre === 'function' && _grupoDelItmLibre(itm.id);
    if (itm.contactor && itm.contactor.ubicacion === 'libre' &&
        !_bornerasGrupoDeOrigen(itm.id, 'contactor')) {
      var ec = { capacidad: itm.contactor.capacidad || 9, reserva: !!itm.contactor.reserva };
      if (pegar) _encadenarJuntoAlItmLibre(itm.id, 'contactor', ec);
      else { if (!ec.reserva) delete ec.reserva; nuevo('contactor', itm.id, ec); }
    }
    if (itm.dps && itm.dps.ubicacion === 'libre' && !_bornerasGrupoDeOrigen(itm.id, 'dps')) {
      var ed = { polos: itm.dps.polos || 2 };
      if (pegar) _encadenarJuntoAlItmLibre(itm.id, 'dps', ed);
      else nuevo('dps', itm.id, ed);
    }
  });
}


function _dibujarGruposBorneras(container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return;
  container.querySelectorAll('.bornera-grupo').forEach(function(el) { el.remove(); });
  _bornerasRepararSinGrupo();
  var grupos = _bornerasGrupos();
  if (!grupos.length) return;






  var _nextY = { left: null, right: null };
  var _ordenados = grupos.slice();


  var _pos = {};



  var _pp = window._PRESENCIA_POS;
  if (_pp) {
    var _cpP = _bornerasCanaletaPresencia();
    _pos.presencia = { cx: _pp.cx, cy: _pp.cy, w: _pp.w, h: _pp.h,
                       visW: _pp.w, visH: _pp.h,
                       salida: _pp.w / 2 + (_cpP ? _cpP.flanco.der : 0),
                       rotado: false, side: 'right', dir: 'right' };
  }



  var _pendientes = _ordenados.slice();
  var _guard = 0;
  while (_pendientes.length && _guard++ < 20) {
    var _quedan = [];
    _pendientes.forEach(function(gr) {
      if ((gr.lugar === 'junto' || gr.lugar === 'pila') && !_pos[gr.ref]) { _quedan.push(gr); return; }
      _colocar(gr);
    });
    if (_quedan.length === _pendientes.length) break;                  
    _pendientes = _quedan;
  }








  var _reubicados = [];
  _ordenados.forEach(function(gr) {
    if (_pos[gr.id]) return;
    if (gr.lugar === 'junto' && (gr.ref === 'presencia' || _bornerasGrupoPorId(gr.ref))) return;
    if (gr.lugar === 'pila' && _bornerasGrupoPorId(gr.ref)) return;
    var libres = _bornerasSitiosDisponibles(gr.origen || null, container);
    if (!libres.length) return;



    var s0 = libres[0];
    for (var _li = 0; _li < libres.length; _li++) {
      if (libres[_li].filaRefPropio && !libres[_li].alFinal) { s0 = libres[_li]; break; }
    }
    if (s0 === libres[0]) {
      for (var _lj = 0; _lj < libres.length; _lj++) {
        if (libres[_lj].lugar.indexOf('lat-') === 0) { s0 = libres[_lj]; break; }
      }
    }
    gr.lugar = s0.lugar;
    gr.ref = s0.ref || null;





    var _ocupS = /-arriba$/.test(s0.lugar) ? _bornerasGrupoDe(s0.lugar) : null;
    if (_ocupS && _ocupS !== gr) { gr.lugar = 'pila'; gr.ref = _bornPilaTope(_ocupS).id; }
    gr.filaRef = s0.filaRefPropio || (s0.miembros && s0.miembros[0]) || null;
    if (s0.dentro) gr.dentro = true; else delete gr.dentro;
    if (s0.dentroCanaleta) gr.dentroCanaleta = true; else delete gr.dentroCanaleta;


    if (s0.alFinal) gr.alFinal = true; else delete gr.alFinal;
    _colocar(gr);
    if (_pos[gr.id]) _reubicados.push(gr);
  });
  if (_reubicados.length) {
    _pendientes = _ordenados.filter(function(gr) { return !_pos[gr.id] && (gr.lugar === 'junto' || gr.lugar === 'pila'); });
    _guard = 0;
    while (_pendientes.length && _guard++ < 20) {
      var _quedan2 = [];
      _pendientes.forEach(function(gr) {
        if (!_pos[gr.ref]) { _quedan2.push(gr); return; }
        _colocar(gr);
      });
      if (_quedan2.length === _pendientes.length) break;
      _pendientes = _quedan2;
    }
    if (typeof _avisoFlotante === 'function') {
      _avisoFlotante(_reubicados.length === 1
        ? 'Un equipo había quedado sin lugar: se lo puso en uno libre.'
        : _reubicados.length + ' equipos habían quedado sin lugar: se los puso en lugares libres.');
    }
  }

  _crecerGabinetePorBorneras(container);
  _bornerasUnificarRotulosSecciones(container);
  _bornerasEscalonarRotulos(container);

  function _colocar(gr) {
    var sitio = null;
    if (gr.lugar === 'junto') {
      var p = _pos[gr.ref];
      if (!p) return;
      sitio = { lugar: 'junto', junto: p, rotado: p.rotado, side: p.side };
    } else if (gr.lugar === 'pila') {


      var pB = _pos[gr.ref], gB = _bornerasGrupoPorId(gr.ref);
      var raizP = _bornPilaRaiz(gr);
      if (!pB || !gB || !raizP) return;
      var sB = null, stsP = _bornerasLugares(container, raizP.ref, raizP);
      for (var iP = 0; iP < stsP.length; iP++) if (stsP[iP].lugar === raizP.lugar) sB = stsP[iP];
      if (!sB) return;
      var dB = _bornerasDims(gB);
      var topB = Math.min(pB.cy - _bornAltoCadena(gB) / 2,
                          pB.cy - dB.h / 2 - (dB.canaleta ? dB.canaleta.flanco.arriba : 0));
      var gapP = (typeof _canaletaApiladaUnida === 'function' && _canaletaApiladaUnida(gB)) ? 0
               : ((typeof gr.gapMm === 'number' ? gr.gapMm : 30) / PX_TO_MM);
      sitio = { lugar: 'pila', cx: sB.cx, cy: topB - gapP, anclaAbajo: true };
    } else {
      var sitios = _bornerasLugares(container, gr.ref, gr);
      for (var i = 0; i < sitios.length; i++) {






        if (sitios[i].lugar === gr.lugar && (!gr.ref || sitios[i].ref === gr.ref)) {
          if (!!sitios[i].dentroCanaleta === !!gr.dentroCanaleta) sitio = sitios[i];
          else if (!sitio) sitio = sitios[i];
        }
      }



      if (gr.lugar.indexOf('dif-inf-') === 0) {
        var porRef = false;
        var _frEf = _bornFilaRefEf(gr);
        if (_frEf) {
          for (var j = 0; j < sitios.length; j++) {
            if (sitios[j].miembros && sitios[j].miembros.indexOf(_frEf) !== -1) {
              var _exacto = (!!sitios[j].dentroCanaleta === !!gr.dentroCanaleta);
              if (_exacto || !sitio) { sitio = sitios[j]; porRef = true; }
              if (_exacto) break;
            }
          }
        }
        if (sitio && sitio.miembros && sitio.miembros.length) {







          if (!porRef && gr.origen && gr.filaRef === 'cont:' + gr.origen) return;
          if (!porRef) gr.filaRef = sitio.miembros[0];
          gr.lugar = sitio.lugar;
        }
      }
    }
    if (!sitio) return;
    if (gr.lugar.indexOf('dif-inf-') === 0 && sitio.cajas && sitio.miembros) {
      var _xd = _bornerasXEnFila(gr, sitio);
      if (_xd !== null) sitio = Object.assign({}, sitio, { cx: _xd });
    }

    var d = _bornerasDims(gr);




    var rotado = !!sitio.rotado;


    var visW = rotado ? d.hTotal : d.wTotal;
    var visH = rotado ? d.wTotal : d.hTotal;
    var cxVis, cyVis;
    if (sitio.lugar === 'junto') {

      var p = sitio.junto;




      var _den = !!gr.dentro;





      var _fl   = _bornerasFlancos(gr);
      var _sal  = _den ? (p.w || 0) / 2 : (p.salida || (p.w || 0) / 2);
      var _mit  = _den ? d.w / 2        : (d.w / 2 + _fl.entrada);
      if (p.dir === 'left')       { cxVis = p.cx - _sal - _mit; cyVis = p.cy; }
      else if (p.dir === 'down')  { cxVis = p.cx; cyVis = p.cy + _sal + _mit; }
      else                        { cxVis = p.cx + _sal + _mit; cyVis = p.cy; }
      _fin(gr, sitio, d, rotado, visW, visH, cxVis, cyVis, p.dir);
      return;
    }
    cxVis = sitio.anclaDer ? (sitio.cx - visW / 2) : (sitio.cx + visW / 2);
    cyVis = sitio.cy;
    if (!rotado) {
      var o0 = _bornerasOrigen(sitio, d, _bornEsLugarBarra(gr.lugar) ? _bornAltoCadena(gr) : 0);
      cxVis = o0.x + d.w / 2;
      cyVis = o0.y + d.h / 2;





      if (!sitio.hacia && !sitio.haciaY) {
        var cadena = _bornerasAnchoCadena(gr);




        var _flI = d.canaleta ? d.canaleta.extra.izq : 0;
        cxVis = sitio.cx - cadena / 2 + _flI + d.w / 2;
      }
    } else {

      var sd = sitio.side || 'left';
      var top = cyVis - visH / 2;
      if (_nextY[sd] !== null && _nextY[sd] > top) top = _nextY[sd];
      cyVis = top + visH / 2;
      _nextY[sd] = top + visH;
    }

    _fin(gr, sitio, d, rotado, visW, visH, cxVis, cyVis, _bornerasDireccion(gr.lugar));
  }

  function _fin(gr, sitio, d, rotado, visW, visH, cxVis, cyVis, dir) {




    var _bajoTira = d.canaleta ? ((rotado ? d.w : d.h) / 2) : (visH / 2);
    _pos[gr.id] = { cx: cxVis, cy: cyVis, visW: visW, visH: visH,


                    w: d.w, h: d.h,



                    salida: d.w / 2 + _bornerasFlancos(gr).salida,
                    rotado: rotado, side: sitio.side, dir: dir };

    var wrap = document.createElement('div');
    wrap.className = 'bornera-grupo bornera-wrap';
    wrap.dataset.bornGrupoId = gr.id;



    wrap.dataset.rotado = rotado ? '1' : '';
    wrap.dataset.visCx = cxVis;
    wrap.dataset.visCy = cyVis;
    wrap.dataset.tiraW = d.w;
    wrap.dataset.tiraH = d.h;




    var _exW = d.canaleta ? d.canaleta.extra
                          : { izq: 0, der: 0, arriba: 0, abajo: 0 };
    wrap.dataset.extIzq = _exW.izq;
    wrap.dataset.extDer = _exW.der;
    wrap.dataset.extArr = _exW.arriba || 0;
    wrap.dataset.extAba = _exW.abajo || 0;
    wrap.dataset.visW = visW;
    wrap.dataset.visH = visH;
    wrap.style.cssText = 'position:absolute;left:' + (cxVis - d.w / 2) + 'px;top:' +
      (cyVis - d.h / 2) + 'px;width:' + d.w + 'px;height:' + d.h + 'px;' +
      'z-index:6;pointer-events:none;' +
      (rotado ? ('transform:rotate(' + (sitio.side === 'left' ? 90 : -90) + 'deg);' +
                 'transform-origin:center center;') : '');
    container.appendChild(wrap);



    if (d.canaleta) {
      d.canaleta.rects.forEach(function(r) {
        _canPintar(wrap, r, d.canaleta.fill, gr.id, '', null);
      });


      _bornerasTrianguloCanaleta(wrap, d.canaleta, gr.id, 0, 0);
    }




    var _esResv = !!gr.reserva && !!(d.timer || d.contactor || d.termostato);

    if (d.timer && !_esResv && !_timerComprado(gr)) _esResv = true;

    if (d.reservaItm) _esResv = true;
    var x = 0;
    function _put(src, w, h) {
      var el;
      if (_esResv) {
        el = document.createElement('div');
        el.className = 'bornera-img itm-reserva itm-reserva-v';
        el.textContent = 'Reserva';
      } else {
        el = document.createElement('img');
        el.src = src;
        el.className = 'bornera-img';
      }
      el.style.cssText = 'position:absolute;left:' + x + 'px;top:' +
        ((d.h - h) / 2) + 'px;width:' + w + 'px;height:' + h + 'px;';
      wrap.appendChild(el);
      x += w;
    }
    if (d.timer || d.termostato || d.itmLibre || d.dps) {
      for (var kt = 0; kt < (gr.cant || 1); kt++) _put(d.t.src, d.t.w, d.t.h);
    } else {
      if (d.pIzq) _put(d.pIzq.src, d.pIzq.w, d.pIzq.h);
      for (var k = 0; k < (gr.cant || 1); k++) _put(d.t.src, d.t.w, d.t.h);
      if (d.pDer) _put(d.pDer.src, d.pDer.w, d.pDer.h);
    }





    var rotG = document.createElement('div');



    rotG.className = 'itm-rotulo bornera-grupo bornera-rotulo' +
      ((gr.clase === 'timer' || gr.clase === 'termostato' ||
        gr.clase === 'itm' || gr.clase === 'dps') ? '' : ' rot-grupo-chico');
    rotG.dataset.bornGrupoId = gr.id;
    rotG.style.position = 'absolute';
    rotG.style.zIndex = '10';
    if (rotado) {



      var _ladoR = (sitio.side === 'right') ? 1 : -1;
      rotG.style.left = (cxVis + _ladoR * (visW / 2 + 20)) + 'px';
      rotG.style.top = cyVis + 'px';
      rotG.style.transform = 'translate(-50%,-50%) rotate(' +
        (_ladoR > 0 ? 90 : -90) + 'deg)';
      rotG.dataset.rotDir = (_ladoR > 0) ? 'der' : 'izq';

      rotG.dataset.rotFila = String(Math.round(cxVis));
    } else {



      rotG.style.left = cxVis + 'px';
      rotG.style.top = (cyVis + _bajoTira + 65) + 'px';
      rotG.style.transform = 'translateX(-50%)';
      rotG.dataset.rotDir = 'abajo';
      rotG.dataset.rotFila = String(Math.round(cyVis));
      rotG.dataset.grpW = String(visW);
    }


    var badgeG = document.createElement('div');
    badgeG.className = 'itm-rotulo-badge';







    badgeG.textContent = (gr.origen === 'rejilla')
      ? (_bornerasPertenece(gr) || '—')
      : _bornEsEquipo(gr.clase)
        ? (_bornerasPertenece(gr) || '—')
        : ('(B) ' + (_bornerasPertenece(gr) || '—'));
    rotG.appendChild(badgeG);
    container.appendChild(rotG);



    var triH = Math.max(90, visW);
    var tri = document.createElement('img');
    tri.src = 'assets/panel-busbar/boton_trian_verde.svg';
    tri.className = 'bornera-grupo bornera-tri';
    tri.dataset.bornGrupoId = gr.id;
    tri.style.cssText = 'position:absolute;left:' + (cxVis - 22.5) + 'px;top:' +
      (cyVis + _bajoTira + 10 - (triH / 2 - 22.5)) + 'px;' +
      'width:45px;height:' + triH + 'px;' +
      'transform:rotate(-90deg);z-index:7;cursor:pointer;';
    tri.addEventListener('click', function(e) {
      e.stopPropagation();
      onBornerasTriangleClick(this);
    });
    container.appendChild(tri);
  }
}
















function _bornerasCorridasDeSecciones() {
  var porCabeza = {};
  function _sumar(r) {
    if (!r || r.length < 2) return;
    var k = r[0].id;
    if (!porCabeza[k] || porCabeza[k].length < r.length) porCabeza[k] = r;
  }
  if (typeof _medidorGruposBorneras === 'function') _sumar(_medidorGruposBorneras());
  _sumar(_rejillaCadenaGrupos());
  (_bornerasGrupos() || []).forEach(function(g) {
    if (g.seccionDe) return;                                              
    _sumar(_bornerasSeccionesDe(g.id));
  });
  return Object.keys(porCabeza).map(function(k) { return porCabeza[k]; });
}

function _bornerasUnificarRotulosSecciones(container) {
  _bornerasCorridasDeSecciones().forEach(function(secs) {
    _bornerasUnificarUnaCorrida(container, secs);
  });
}

function _bornerasUnificarUnaCorrida(container, secs) {
  if (!secs || secs.length < 2) return;

  function _sel(clase, id) {
    return container.querySelector('.' + clase + '[data-born-grupo-id="' + id + '"]');
  }



  var min = null, max = null, rotada = false;



  var bajo0 = null, bajoMax = null;
  secs.forEach(function(g, k) {
    var w = _sel('bornera-wrap', g.id);
    if (!w) return;
    if (w.dataset.rotado) rotada = true;
    var cx = parseFloat(w.dataset.visCx), tw = parseFloat(w.dataset.tiraW);
    if (isNaN(cx) || isNaN(tw)) return;
    if (min === null || cx - tw / 2 < min) min = cx - tw / 2;
    if (max === null || cx + tw / 2 > max) max = cx + tw / 2;
    var cy = parseFloat(w.dataset.visCy), th = parseFloat(w.dataset.tiraH);
    if (!isNaN(cy) && !isNaN(th)) {
      var b = cy + th / 2;
      if (k === 0) bajo0 = b;
      if (bajoMax === null || b > bajoMax) bajoMax = b;
    }
  });



  for (var i = 1; i < secs.length; i++) {
    ['bornera-rotulo', 'bornera-tri'].forEach(function(cl) {
      var el = _sel(cl, secs[i].id);
      if (el) el.remove();
    });
  }





  if (rotada || min === null || max === null) return;
  var centro = (min + max) / 2, ancho = max - min;



  var bajar = (bajo0 !== null && bajoMax !== null) ? Math.max(0, bajoMax - bajo0) : 0;

  var rot = _sel('bornera-rotulo', secs[0].id);
  if (rot && rot.dataset.rotDir === 'abajo') {
    rot.style.left = centro + 'px';
    rot.dataset.grpW = String(ancho);
    if (bajar) rot.style.top = ((parseFloat(rot.style.top) || 0) + bajar) + 'px';
  }
  var tri = _sel('bornera-tri', secs[0].id);
  if (tri) {



    var hAnt = parseFloat(tri.style.height) || 90;
    var cyTri = (parseFloat(tri.style.top) || 0) + hAnt / 2 + bajar;
    var hNue = Math.max(90, ancho);
    tri.style.height = hNue + 'px';
    tri.style.left = (centro - 22.5) + 'px';
    tri.style.top = (cyTri - hNue / 2) + 'px';
  }
}





function _bornerasEscalonarRotulos(container) {
  var rots = [].slice.call(container.querySelectorAll('.bornera-rotulo'));
  if (!rots.length) return;





  if (typeof window._safariZoomAhora === 'function') {
    try { window._safariZoomAhora(); } catch (e) { console.warn('_safariZoomAhora:', e); }
  }





  rots.forEach(function(r) {
    var dir = r.dataset.rotDir;
    if (dir !== 'arriba' && dir !== 'abajo') return;                            



    if (r.classList.contains('bornera-presencia-rotulo')) return;
    var grpW = parseFloat(r.dataset.grpW) || 0;
    var w = r.offsetWidth || 0;
    if (!w || w <= grpW + 10) return;
    var h = r.offsetHeight || 0;
    var cx = parseFloat(r.style.left) || 0;
    var y0 = parseFloat(r.style.top) || 0;                              


    var cy = (dir === 'abajo') ? (y0 + w / 2) : (y0 - w / 2);
    r.style.left = cx + 'px';
    r.style.top = cy + 'px';
    r.style.transform = 'translate(-50%,-50%) rotate(-90deg)';
    r.dataset.girado = '1';
    void h;
  });

  if (rots.length < 2) return;

  var filas = {};
  rots.forEach(function(r) {
    var k = r.dataset.rotDir + ':' + r.dataset.rotFila;
    (filas[k] = filas[k] || []).push(r);
  });

  Object.keys(filas).forEach(function(k) {
    var lista = filas[k];
    if (lista.length < 2) return;
    var dir = lista[0].dataset.rotDir;



    var vert = (dir === 'izq' || dir === 'der');
    var ejeProp = vert ? 'top' : 'left';
    var pasoProp = vert ? 'left' : 'top';
    var signo = (dir === 'abajo' || dir === 'der') ? 1 : -1;




    var girado = function(r) { return r.dataset.girado === '1' || vert; };
    var anchoVis = function(r) {
      return (girado(r) ? r.offsetHeight : r.offsetWidth) || 130;
    };
    var altoVis = function(r) {
      return (girado(r) ? r.offsetWidth : r.offsetHeight) || 130;
    };

    var largo = function(r) { return vert ? altoVis(r) : anchoVis(r); };
    var grueso = function(r) { return vert ? anchoVis(r) : altoVis(r); };

    lista.sort(function(a, b) {
      return (parseFloat(a.style[ejeProp]) || 0) - (parseFloat(b.style[ejeProp]) || 0);
    });
    var paso = 0;
    lista.forEach(function(r) { paso = Math.max(paso, grueso(r)); });
    paso += 15;

    var ocupado = [];                              
    lista.forEach(function(r) {
      var L = largo(r);
      var ini = (parseFloat(r.style[ejeProp]) || 0) - L / 2;
      var n = 0;
      while (ocupado[n] !== undefined && ini < ocupado[n] + 4) n++;
      ocupado[n] = ini + L;
      if (!n) return;
      r.style[pasoProp] = ((parseFloat(r.style[pasoProp]) || 0) + signo * n * paso) + 'px';
    });
  });
}





function _crecerGabinetePorBorneras(container) {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  var maxY = 0;
  container.querySelectorAll('.bornera-wrap').forEach(function(el) {
    var y = parseFloat(el.dataset.visCy) + parseFloat(el.dataset.visH) / 2;
    if (y > maxY) maxY = y;
  });
  if (maxY <= 0) return;

  var pbInset = PB_INSET_MM / PX_TO_MM;
  var botGap = (typeof GAB_BOT_GAP_PX === 'number' ? GAB_BOT_GAP_PX : 350);
  var needH = maxY + botGap - pbInset;
  if (needH <= (parseFloat(container.style.height) || 0)) return;

  container.style.height = needH + 'px';
  var gabW = parseFloat(marco.style.width) || (GAB_DEFAULT_MM / PX_TO_MM);
  if (typeof redimensionarGabinete === 'function') {
    redimensionarGabinete(gabW, needH + 2 * pbInset);
  }
}





function _bornExtraAntes(barKey) {
  if (typeof _bornerasGrupoDe !== 'function') return 0;
  var gr = _bornerasGrupoDe(barKey + '-arriba');
  if (!gr) return 0;
  var d = _bornerasDims(gr);
  var gap = ((typeof gr.gapMm === 'number') ? gr.gapMm : 30) / PX_TO_MM;






  var aisOver = (barKey === 'n' || barKey === 'pea') ? 25 : 0;


  var total = d.hTotal + (_bornAltoCadena(gr) - d.h) + gap + aisOver;
  var abajo = gr;
  _bornPilaSobre(gr).forEach(function(pz) {
    var dp = _bornerasDims(pz);
    var gp = (typeof _canaletaApiladaUnida === 'function' && _canaletaApiladaUnida(abajo)) ? 0
           : ((typeof pz.gapMm === 'number' ? pz.gapMm : 30) / PX_TO_MM);
    total += dp.hTotal + (_bornAltoCadena(pz) - dp.h) + gp;
    abajo = pz;
  });
  return total;
}







function _bornExtraDespues(barKey) {
  if (typeof _bornerasGrupoDe !== 'function') return 0;
  var gr = _bornerasGrupoDe(barKey + '-abajo');
  if (!gr) return 0;
  var d = _bornerasDims(gr);
  var gap = ((typeof gr.gapMm === 'number') ? gr.gapMm : 30) / PX_TO_MM;
  var aisOver = (barKey === 'n' || barKey === 'pea') ? 25 : 0;
  return d.hTotal + (_bornAltoCadena(gr) - d.h) + gap + aisOver;
}









function _bornerasDeBarra() {
  var ctr = document.getElementById('panel_busbar_container');
  if (!ctr) return [];
  var out = [];
  ctr.querySelectorAll('.bornera-wrap').forEach(function(w) {
    var gr = _bornerasGrupoPorId(w.dataset.bornGrupoId);
    if (!gr || gr.lugar.indexOf('-arriba') === -1 && gr.lugar.indexOf('-abajo') === -1) return;


    var cy = parseFloat(w.dataset.visCy), th = parseFloat(w.dataset.tiraH);
    var eA = parseFloat(w.dataset.extArr) || 0, eB = parseFloat(w.dataset.extAba) || 0;
    if (isNaN(th)) th = parseFloat(w.dataset.visH);
    var top = cy - th / 2 - eA, bot = cy + th / 2 + eB;


    var _miembros = [];
    [gr].concat(_bornPilaSobre(gr)).forEach(function(m, k) {
      if (k > 0) _miembros.push(m);
      var h2 = _bornerasGrupoDe('junto', m.id), g2 = 0;
      while (h2 && g2++ < 30) { _miembros.push(h2); h2 = _bornerasGrupoDe('junto', h2.id); }
    });
    _miembros.forEach(function(m) {
      var wm = ctr.querySelector('.bornera-wrap[data-born-grupo-id="' + m.id + '"]');
      if (!wm) return;
      var cym = parseFloat(wm.dataset.visCy), thm = parseFloat(wm.dataset.tiraH);
      var eAm = parseFloat(wm.dataset.extArr) || 0, eBm = parseFloat(wm.dataset.extAba) || 0;
      if (isNaN(cym) || isNaN(thm)) return;
      if (cym - thm / 2 - eAm < top) top = cym - thm / 2 - eAm;
      if (cym + thm / 2 + eBm > bot) bot = cym + thm / 2 + eBm;
    });
    out.push({ gr: gr, top: top, bot: bot });
  });
  return out;
}


function _bornerasTopIntercalado(ct, desdeRel, hastaAbs) {
  var b = _bornerasDeBarra();
  for (var i = 0; i < b.length; i++) {
    var topAbs = ct + b[i].top;
    if (topAbs > ct + desdeRel && topAbs < hastaAbs) return topAbs - ct;
  }
  return null;
}


function _bornerasBottomAbs() {
  var ctr = document.getElementById('panel_busbar_container');
  if (!ctr) return null;
  var ct = parseFloat(ctr.style.top) || 0;
  var b = _bornerasDeBarra();
  if (!b.length) return null;
  var max = -Infinity;
  b.forEach(function(x) { if (ct + x.bot > max) max = ct + x.bot; });
  return (max === -Infinity) ? null : max;
}

function _cotasGruposBorneras(marco, g, cx, ct) {
  var b = _bornerasDeBarra();
  if (!b.length) return;

  b.forEach(function(item) {
    var gr = item.gr;
    var esArriba = gr.lugar.indexOf('-arriba') !== -1;
    var esPE = gr.lugar.indexOf('pe-') === 0;
    var barra = esPE ? g.barPE_Y : g.barN_Y;
    if (barra === null || barra === undefined) return;



    var barTop = esPE ? (g.barPE_VisTop != null ? g.barPE_VisTop : barra)
                      : (g.barN_VisTop  != null ? g.barN_VisTop  : barra);
    var barBot = esPE ? (g.barPE_VisBot != null ? g.barPE_VisBot : barra + g.BAR_H)
                      : (g.barN_VisBot  != null ? g.barN_VisBot  : barra + g.BAR_H);


    var aplicaDirecto = function(mm) { gr.gapMm = mm; };





    if (esArriba) {
      _cotaV(marco, 'cota-cv', cx, ct + item.bot, barTop - item.bot,
        _mmTxt(barTop - item.bot), 'CV-26', aplicaDirecto);
    } else {
      _cotaV(marco, 'cota-cv', cx, ct + barBot, item.top - barBot,
        _mmTxt(item.top - barBot), 'CV-25', aplicaDirecto);
    }
  });






  var ctr = document.getElementById('panel_busbar_container');
  b.forEach(function(item) {
    var abajo = item.gr;
    _bornPilaSobre(abajo).forEach(function(m) {
      var unida = (typeof _canaletaApiladaUnida === 'function' && _canaletaApiladaUnida(abajo));
      var cA = _bornCajaTira(ctr, m), cB = _bornCajaTira(ctr, abajo);
      abajo = m;
      if (unida || !cA || !cB) return;
      var h = cB.top - cA.bot;
      if (!(h > 0)) return;
      _cotaV(marco, 'cota-cv', cx, ct + cA.bot, h, _mmTxt(h), 'CV-30',
        function(mm) { m.gapMm = mm; });
    });
  });
}



function _bornCajaTira(ctr, gr) {
  if (!ctr || !gr) return null;
  var top = null, bot = null, a = gr, g = 0;
  while (a && g++ < 40) {
    var w = ctr.querySelector('.bornera-wrap[data-born-grupo-id="' + a.id + '"]');
    if (w) {
      var cy = parseFloat(w.dataset.visCy), th = parseFloat(w.dataset.tiraH);
      if (isNaN(th)) th = parseFloat(w.dataset.visH);
      var eA = parseFloat(w.dataset.extArr) || 0, eB = parseFloat(w.dataset.extAba) || 0;
      if (!isNaN(cy) && !isNaN(th)) {
        var t = cy - th / 2 - eA, bo = cy + th / 2 + eB;
        if (top === null || t < top) top = t;
        if (bot === null || bo > bot) bot = bo;
      }
    }
    a = _bornerasGrupoDe('junto', a.id);
  }
  return (top === null) ? null : { top: top, bot: bot };
}







function _bornerasAnchoPresencia() {
  var secs = _presenciaSecciones();
  if (!secs.length || !window._igData) return 0;
  var w = 0;
  secs.forEach(function(sc) {
    var t = _BORN_TIPOS[sc.tipo] || _BORN_TIPOS['2.5'];
    var ext = _bornExtremos({ extIzq: sc.extIzq, extDer: sc.extDer });
    w += _bornAnchoExtremo(ext.izq) + (sc.cant || 0) * t.w + _bornAnchoExtremo(ext.der);
  });


  var _tAlto = _BORN_TIPOS[secs[0].tipo] || _BORN_TIPOS['2.5'];
  var can = _bornerasCanaleta({ id: 'presencia', canaleta: window._PRESENCIA_CANALETA },
                              { w: w, h: _tAlto.h },
                              _bornerasLargoDentro({ id: 'presencia' }), 1);
  if (can) w += can.extra.izq + can.extra.der;
  return w;
}

function _bornerasOverhangIG(aisW, igW) {
  var libre = Math.max(0, (aisW - igW) / 2);                                     
  var out = { izq: 0, der: 0 };



  var anchoPres = _bornerasAnchoPresencia();
  if (anchoPres > 0) {
    var gapPres = (typeof window._BORNERAS_GAP_MM === 'number'
      ? window._BORNERAS_GAP_MM : 30) / PX_TO_MM;






    var _hPres = _bornerasGrupoDe('junto', 'presencia'), _gP = 0;
    var _pcan = !!(window._PRESENCIA_CANALETA && window._PRESENCIA_CANALETA.anchoMm);
    while (_pcan && _hPres && _hPres.dentro && _gP++ < 20) {
      _hPres = _bornerasGrupoDe('junto', _hPres.id);
    }
    var cadenaPres = _hPres ? _bornerasAnchoCadena(_hPres) : 0;
    var ohPres = gapPres + anchoPres + cadenaPres - libre;
    if (ohPres > 0) out.der = ohPres;
  }
  ['ig-izq', 'ig-der'].forEach(function(lugar) {
    var raiz = _bornerasGrupoDe(lugar);
    if (!raiz) return;
    var gap = (typeof raiz.gapMm === 'number') ? (raiz.gapMm / PX_TO_MM) : _BORN_GAP;
    var desde = libre;
    if (lugar === 'ig-der' && anchoPres > 0) {

      desde = libre - ((typeof window._BORNERAS_GAP_MM === 'number'
        ? window._BORNERAS_GAP_MM : 30) / PX_TO_MM) - anchoPres;
      gap = 0;
    }
    var oh = gap + _bornerasAnchoCadena(raiz) - desde;
    var k = (lugar === 'ig-izq') ? 'izq' : 'der';
    if (oh > out[k]) out[k] = oh;
  });
  return out;
}





function _cotasGruposIG(marco, ct, cLeft, gabW) {
  var ctr = document.getElementById('panel_busbar_container');
  if (!ctr) return;
  var ig = ctr.querySelector('.ig-img');
  if (!ig) return;
  var igL = parseFloat(ig.style.left) || 0;
  var igW = parseFloat(ig.style.width) || 0;




  if (gabW && !_bornerasGrupoDe('ig-der')) {
    var bordePres = _bornerasPresenciaBorde(ctr);
    if (bordePres !== null) {
      var pres = ctr.querySelector('.bornera-img:not(.bornera-presencia-tri)');
      var cyPres = pres
        ? (parseFloat(pres.style.top) || 0) + (parseFloat(pres.style.height) || 0) / 2
        : 0;



      var _ultPres = _bornerasGrupoDe('junto', 'presencia'), _gU = 0;
      while (_ultPres && _gU++ < 20) {
        var _sig = _bornerasGrupoDe('junto', _ultPres.id);
        var _wU = ctr.querySelector('.bornera-wrap[data-born-grupo-id="' + _ultPres.id + '"]');
        if (_wU && !isNaN(parseFloat(_wU.dataset.tiraW))) {
          var _bdU = parseFloat(_wU.dataset.visCx) + parseFloat(_wU.dataset.tiraW) / 2 +
                     (parseFloat(_wU.dataset.extDer) || 0);
          if (_bdU > bordePres) bordePres = _bdU;
        }
        if (!_sig) break;
        _ultPres = _sig;
      }
      var largoPres = gabW - (cLeft + bordePres);
      if (largoPres > 1) {
        var _elPres = _cotaH(marco, 'cota-cv', gabW - largoPres, ct + cyPres, largoPres,
          _mmTxt(largoPres), 'CV-29',
          function(mm) { BORN_IG_PARED_PX = (mm / PX_TO_MM) - (window._flancoCanMaxPx || 0); });


        var _spPres = _elPres && _elPres.querySelector('.cota-mi-val');
        if (_spPres) _spPres.dataset.cvLado = 'der';
      }
    }
  }

  ['ig-izq', 'ig-der'].forEach(function(lugar) {
    var gr = _bornerasGrupoDe(lugar);
    if (!gr) return;
    var w = ctr.querySelector('.bornera-wrap[data-born-grupo-id="' + gr.id + '"]');
    if (!w) return;
    var cx = parseFloat(w.dataset.visCx), vw = parseFloat(w.dataset.visW);
    var cy = parseFloat(w.dataset.visCy);
    if (isNaN(cx) || isNaN(vw)) return;




    function _bordeIzq(el) {
      return parseFloat(el.dataset.visCx) - parseFloat(el.dataset.tiraW) / 2 -
             (parseFloat(el.dataset.extIzq) || 0);
    }
    function _bordeDer(el) {
      return parseFloat(el.dataset.visCx) + parseFloat(el.dataset.tiraW) / 2 +
             (parseFloat(el.dataset.extDer) || 0);
    }





    var extIzq = _bordeIzq(w), extDer = _bordeDer(w);
    var actual = gr, guard = 0;
    while (actual && guard++ < 20) {
      var wa = ctr.querySelector('.bornera-wrap[data-born-grupo-id="' + actual.id + '"]');
      if (wa && !isNaN(parseFloat(wa.dataset.tiraW))) {
        if (_bordeIzq(wa) < extIzq) extIzq = _bordeIzq(wa);
        if (_bordeDer(wa) > extDer) extDer = _bordeDer(wa);
      }
      actual = _bornerasGrupoDe('junto', actual.id);
    }

    var desde, largo;
    if (lugar === 'ig-izq') {
      desde = _bordeDer(w);
      largo = igL - desde;
    } else {


      var borde = _bornerasPresenciaBorde(ctr);
      desde = (borde !== null) ? borde : (igL + igW);
      largo = _bordeIzq(w) - desde;
    }



    if (largo > 1) {




      var el28 = _cotaH(marco, 'cota-cv', cLeft + desde, ct + cy, largo, _mmTxt(largo),
        'CV-28', function(mm) {
          gr.gapMm = mm;





          var _minP29 = ((typeof _CV_RANGOS !== 'undefined' && _CV_RANGOS['CV-29'])
            ? _CV_RANGOS['CV-29'].min : 20) / PX_TO_MM;
          if (BORN_IG_PARED_PX < _minP29) BORN_IG_PARED_PX = _minP29;
        });
      var sp28 = el28 && el28.querySelector('.cota-mi-val');
      if (sp28) sp28.dataset.cvLado = (lugar === 'ig-izq') ? 'izq' : 'der';
    }



    if (!gabW) return;
    var pared, largoP;
    if (lugar === 'ig-izq') {
      pared = 0;
      largoP = (cLeft + extIzq) - pared;
    } else {
      pared = gabW;
      largoP = pared - (cLeft + extDer);
    }
    if (largoP <= 1) return;




    var elP = _cotaH(marco, 'cota-cv', (lugar === 'ig-izq') ? pared : (pared - largoP),
      ct + cy, largoP, _mmTxt(largoP),
      'CV-29', function(mm) {









        BORN_IG_PARED_PX = (mm / PX_TO_MM) - (window._flancoCanMaxPx || 0);
      });






    var _ohP = (lugar === 'ig-izq') ? -extIzq : extDer - (parseFloat(ctr.style.width) || 0);
    var _reqP = window._reqSinGrupoIgPx || 0;
    var _flP  = window._flancoCanMaxPx || 0;
    var _minP = (_reqP + _flP - _ohP) * PX_TO_MM;
    var _spP = elP && elP.querySelector('.cota-mi-val');
    if (_spP) _spP.dataset.cvLado = (lugar === 'ig-izq') ? 'izq' : 'der';
    if (_spP && _minP > 20) _spP.dataset.minMm = _minP.toFixed(1);
  });
}




var _bornSitioElegido = null;
var _bornRefContactor = null;
var _bornClase = 'bornera';





function _bornerasSitiosDisponibles(itmIdContactor, container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container) return [];



  var itmO = (itmIdContactor && typeof _buscarITM === 'function')
    ? _buscarITM(itmIdContactor) : null;
  var lado = itmO ? itmO.side : null;

  var todos = _bornerasLugares(container, itmIdContactor);




  var huecoOcupado = {}, huecoPorAbajo = {};
  todos.forEach(function(s) {
    if (s.hueco && _bornerasGrupoDe(s.lugar, s.ref)) {
      huecoOcupado[s.hueco] = true;
      if (/-abajo$/.test(s.lugar)) huecoPorAbajo[s.hueco] = true;
    }
  });

  var huecoVisto = {};











  var _hayPresencia = !!window._PRESENCIA_POS;
  var _alFinal = [];
  var libres = todos.filter(function(s) {


    if ((s.lugar === 'ig-izq' || s.lugar === 'ig-der') && typeof _barraEnLado === 'function' &&
        _barraEnLado(s.lugar)) return false;




    if (s.fuera) return false;



    if (s.lugar.indexOf('dif-inf-') === 0 && s.miembros) {
      var _eqs = s.miembros.filter(function(m) { return m.indexOf('grp:') !== 0; });
      var _hayC = !!_canaletaCfgDeIds(_eqs);
      var _nuevo = { origen: itmIdContactor || null, dentroCanaleta: !!s.dentroCanaleta };
      var _du = s.fuera ? null : _bornerasDuenoEnFila(_nuevo, _eqs, _hayC);
      var _ocupada = function(k) {
        return _bornerasRaicesFila(null, _eqs).some(function(r) {
          return (_bornerasDuenoEnFila(r, _eqs, _hayC) || '') === k;
        });
      };


      if (_du && !_ocupada('')) {
        var sF = Object.assign({}, s, { alFinal: true, label: 'Al final de la fila' });
        var _xF = _bornerasXEnFila({ origen: _nuevo.origen, alFinal: true, dentroCanaleta: _nuevo.dentroCanaleta }, sF);
        if (_xF !== null) sF.cx = _xF;
        _alFinal.push(sF);
      }
      if (_ocupada(_du || '')) return false;
      var _x = _bornerasXEnFila(_nuevo, s);
      if (_x !== null) s.cx = _x;
      if (_du) s.filaRefPropio = _du;
      return true;
    }



    var _apila = /-arriba$/.test(s.lugar) && !!_bornerasGrupoDe(s.lugar) &&
                 !(s.hueco && huecoPorAbajo[s.hueco]);
    if (_bornerasGrupoDe(s.lugar, s.ref) && !_apila) return false;                      
    if (s.lugar === 'ig-der' && _hayPresencia) return false;
    if (lado && s.lugar.indexOf('lat-') === 0 && s.side !== lado) return false;
    if (s.hueco) {
      if (huecoOcupado[s.hueco] && !_apila) return false;
      if (huecoVisto[s.hueco]) return false;                                    
      huecoVisto[s.hueco] = true;
    }
    return true;
  });
  libres = libres.concat(_alFinal);












  function _sitiosAlLado(ref, dir, cx, cy, vw, vh, tw, can, rotado, fl, th) {
    fl = fl || 0;



    var cajas = can
      ? [{ w: tw, h: tw, dentro: true, largo: fl, lbl: 'Dentro de la canaleta' }]
      : [{ w: vw, h: vh, dentro: false, lbl: 'Al lado' }];





    var enLinea = !rotado && dir !== 'down' && typeof th === 'number' && th > 0;
    cajas.forEach(function(b) {
      var mx = cx, my = cy, hacia = null, haciaY = null;
      if (enLinea) {
        var salto = tw / 2 + (b.dentro ? 0 : fl);                               
        mx = (dir === 'left') ? (cx - salto) : (cx + salto);
        hacia = (dir === 'left') ? 'left' : 'right';
        libres.push({ lugar: 'junto', ref: ref, label: b.lbl, dentro: b.dentro,
                      largo: b.largo || 0,
                      cx: mx, cy: cy, hacia: hacia, haciaY: null,
                      filaTop: cy - th / 2, filaBot: cy + th / 2,
                      rotado: false, side: (dir === 'left') ? 'left' : 'right' });
        return;
      }


      if (dir === 'left')      { mx = cx - b.w / 2; hacia = 'left'; }
      else if (dir === 'down') { my = cy + b.h / 2; haciaY = 'down'; }
      else                     { mx = cx + b.w / 2; hacia = 'right'; }
      libres.push({ lugar: 'junto', ref: ref, label: b.lbl, dentro: b.dentro,
                    largo: b.largo || 0,
                    cx: mx, cy: my, hacia: hacia, haciaY: haciaY,
                    rotado: !!rotado,
                    side: (dir === 'left') ? 'left' : 'right' });
    });
  }





  var _pp = window._PRESENCIA_POS;


  if (_pp && !_bornerasGrupoDe('junto', 'presencia') && !_bornerasGrupoDe('ig-der')) {
    var _cpS = _bornerasCanaletaPresencia();
    _sitiosAlLado('presencia', 'right', _pp.cx, _pp.cy, _pp.w, _pp.h, _pp.w,
                  _cpS, false, _cpS ? _cpS.flanco.der : 0, _pp.h);
  }

  container.querySelectorAll('.bornera-wrap').forEach(function(w) {
    var id = w.dataset.bornGrupoId;
    if (_bornerasGrupoDe('junto', id)) return;
    var gr = _bornerasGrupoPorId(id);
    if (!gr) return;




    var _rz = _bornerasRaizCadena(gr);





    var _rzPropia = _rz && !_rz.alFinal && _rz.filaRef === 'cont:' + _rz.origen;
    if (itmIdContactor && _rz && _rz.origen && _rz.origen !== itmIdContactor &&
        _rz.lugar && _rz.lugar.indexOf('dif-inf-') === 0 && _rzPropia) return;



    if (lado && _rz && _rz.lugar && _rz.lugar.indexOf('lat-') === 0 &&
        _rz.lugar !== 'lat-' + lado) return;






    var dir = _bornerasDireccion(_bornerasRaizCadena(gr).lugar);
    var cx = parseFloat(w.dataset.visCx), cy = parseFloat(w.dataset.visCy);
    var vw = parseFloat(w.dataset.visW), vh = parseFloat(w.dataset.visH);







    var tw = parseFloat(w.dataset.tiraW) || vw;



    _sitiosAlLado(id, dir, cx, cy, vw, vh, tw,
                  _bornerasCanaletaAloja(gr), !!w.dataset.rotado,
                  _bornerasFlancos(gr).salida,
                  parseFloat(w.dataset.tiraH) || vh);
  });
  return libres;
}







var _bornAlCancelar = null;

function iniciarUbicacionBorneras(itmIdContactor, clase, alCancelar) {
  window._bornEsperandoLugar = false;
  var container = document.getElementById('panel_busbar_container');
  if (!container) { if (alCancelar) alCancelar(); return; }
  _bornRefContactor = itmIdContactor || null;
  _bornClase = _bornEsEquipo(clase) ? clase : 'bornera';

  _bornerasCancelarUbicacion();
  _bornAlCancelar = (typeof alCancelar === 'function') ? alCancelar : null;

  var sitios = _bornerasSitiosDisponibles(_bornRefContactor, container);
  if (!sitios.length) {
    _bornerasCancelarUbicacion();
    if (typeof _avisoFlotante === 'function') {
      _avisoFlotante('No quedan lugares libres para ' + _bornNombreClase(_bornClase) +
        ' en este tablero.');
    }
    return;
  }

  _bornerasPintarSitios(container, sitios);

  var hint = document.createElement('div');
  hint.id = 'modo_copia_hint';
  hint.textContent = (_bornEsEquipo(_bornClase)
    ? 'Elegí dónde va ' : 'Elegí dónde van ') + _bornNombreClase(_bornClase) + '  ·  ' + _txtSalir();
  document.body.appendChild(hint);




  document.body.classList.add('born-eligiendo');

  document.addEventListener('keydown', _bornEscUbicacion);
  setTimeout(function() { document.addEventListener('click', _bornClickFuera); }, 50);
}






function _bornerasPintarSitios(container, sitios) {
  sitios.forEach(function(s) {
    var m = document.createElement('div');
    m.className = 'born-sitio';


    m.textContent = '+';
    m.title = s.label;
    m.style.left = s.cx + 'px';
    m.style.top = s.cy + 'px';



    var ANCHO_LAT = 190;                              



    var LARGO_HORIZ = s.largo || 520;
    if (s.alto) {


      m.classList.add('born-sitio-vert');
      m.style.top = s.top + 'px';
      m.style.height = s.alto + 'px';
      m.style.width = ANCHO_LAT + 'px';
      m.style.left = (s.side === 'left' ? (s.cx - ANCHO_LAT) : s.cx) + 'px';
      m.style.transform = 'none';
    } else if (typeof s.filaTop === 'number') {




      var ANCHO_FILA = 100;              
      m.style.top = s.filaTop + 'px';
      m.style.height = (s.filaBot - s.filaTop) + 'px';
      m.style.width = ANCHO_FILA + 'px';
      m.style.left = ((s.hacia === 'left') ? (s.cx - 8 - ANCHO_FILA) : (s.cx + 8)) + 'px';
      m.style.transform = 'none';
    } else if (typeof s.barTop === 'number') {



      var ALTO_BARRA = 130;
      m.style.height = ALTO_BARRA + 'px';
      m.style.width = LARGO_HORIZ + 'px';
      m.style.left = s.cx + 'px';
      m.style.top = (s.anclaAbajo ? (s.barTop - ALTO_BARRA - 8) : (s.barBot + 8)) + 'px';
      m.style.transform = 'translate(-50%, 0)';
    } else if (s.rotado) {
      m.style.height = ANCHO_LAT + 'px';
      m.style.width = LARGO_HORIZ + 'px';





      if (s.haciaY === 'down') {
        m.style.top = (s.cy + 12 + LARGO_HORIZ / 2) + 'px';
      }
      m.style.transform = 'translate(-50%, -50%) rotate(' +
        (s.side === 'left' ? 90 : -90) + 'deg)';
    } else {


      m.style.height = ANCHO_LAT + 'px';
      m.style.width = LARGO_HORIZ + 'px';
      if (s.hacia === 'right') {


        m.style.transform = 'translate(12px, -50%)';
      } else if (s.hacia === 'left') {
        m.style.transform = 'translate(calc(-100% - 12px), -50%)';
      } else if (s.haciaY === 'down') {
        m.style.transform = 'translate(-50%, 12px)';
      }
    }
    m.addEventListener('click', function(e) {
      e.stopPropagation();
      _bornSitioElegido = { lugar: s.lugar, ref: s.ref || null,
                            dentro: !!s.dentro,
                            dentroCanaleta: !!s.dentroCanaleta,
                            alFinal: !!s.alFinal,
                            filaRef: (s.alFinal ? null : s.filaRefPropio) || (s.miembros && s.miembros[0]) || null };
      _bornAlCancelar = null;                                                
      _bornerasCancelarUbicacion();



      if (_bornEsEquipo(_bornClase)) {


        _bornerasCrearGrupo(1, '2.5', _BORN_EXT_IZQ_DEF, _BORN_EXT_DER_DEF);
        _bornSitioElegido = null;
        _postCambioBorneras();
      } else {
        abrirModalBorneras();
      }
    });
    container.appendChild(m);
  });
}



function _bornerasRepintarSitiosSiEligiendo(container) {
  if (!document.body.classList.contains('born-eligiendo')) return;
  container = container || document.getElementById('panel_busbar_container');
  if (!container || container.querySelector('.born-sitio')) return;
  var sitios = _bornerasSitiosDisponibles(_bornRefContactor, container);
  if (!sitios.length) { _bornerasCancelarUbicacion(); return; }
  _bornerasPintarSitios(container, sitios);
}


function _bornerasCrearGrupo(cant, tipo, extIzq, extDer, canaleta) {
  if (!_bornSitioElegido) return null;
  var g = {
    id: _bornerasNuevoId(),
    lugar: _bornSitioElegido.lugar,
    ref: _bornSitioElegido.ref,


    origen: _bornRefContactor || null,
    filaRef: _bornSitioElegido.filaRef || null,
    clase: _bornClase,
    tipo: tipo || '2.5',
    cant: cant || 1,
    extIzq: extIzq || _BORN_EXT_IZQ_DEF,
    extDer: extDer || _BORN_EXT_DER_DEF,
    gapMm: 30
  };
  if (g.clase === 'contactor') {
    var _itmC = (_bornRefContactor && typeof _buscarITM === 'function')
      ? _buscarITM(_bornRefContactor) : null;
    g.capacidad = (_itmC && _itmC.contactor && _itmC.contactor.capacidad) || 9;
    if (_itmC && _itmC.contactor && _itmC.contactor.reserva) g.reserva = true;
  }
  if (g.clase === 'dps') {
    var _itmD = (_bornRefContactor && typeof _buscarITM === 'function')
      ? _buscarITM(_bornRefContactor) : null;
    g.polos = (_itmD && _itmD.dps && _itmD.dps.polos) || 2;
  }
  if (_bornSitioElegido.dentro) g.dentro = true;
  if (_bornSitioElegido.dentroCanaleta) g.dentroCanaleta = true;
  if (_bornSitioElegido.alFinal) g.alFinal = true;
  if (canaleta) g.canaleta = canaleta;



  if (/-arriba$/.test(g.lugar)) {
    var _ocup = _bornerasGrupoDe(g.lugar);
    if (_ocup) {
      if (typeof _ocup.gapMm === 'number') g.gapMm = _ocup.gapMm;
      _ocup.lugar = 'pila';
      _ocup.ref = g.id;
      _ocup.gapMm = 30;
    }
  }
  _bornerasGrupos().push(g);
  return g;
}


function _bornerasUltimoDeCadena(gr) {
  var actual = gr, guard = 0;
  while (actual && guard++ < 20) {
    var hijo = _bornerasGrupoDe('junto', actual.id);
    if (!hijo) return actual;
    actual = hijo;
  }
  return actual;
}







function _bornerasCrearCopia(src, destItmId) {
  if (!src) return null;
  var cab = (src.seccionDe && _bornerasGrupoPorId(src.seccionDe)) || src;
  var g = _bornerasCrearCopiaUna(cab, destItmId);
  if (!g) return g;
  if (cab.reserva) g.reserva = true;
  if (cab.cantManual) g.cantManual = true;
  if ((cab.clase || 'bornera') === 'bornera') {
    var secs = _bornerasSeccionesDe(cab.id), prev = g;
    for (var i = 1; i < secs.length; i++) {
      prev = _bornerasInsertarSeccion(prev, g.id, {
        tipo: secs[i].tipo, cant: secs[i].cant, extIzq: secs[i].extIzq,
        extDer: secs[i].extDer, cantManual: secs[i].cantManual });
    }
  }
  return g;
}
function _bornerasCrearCopiaUna(src, destItmId) {
  if (!src) return null;








  var raizSrc = _bornerasRaizCadena(src) || src;
  var srcEnFila = !!(raizSrc.lugar && raizSrc.lugar.indexOf('dif-inf-') === 0 && !raizSrc.alFinal);
  var enFila = (destItmId && srcEnFila) ? _bornerasCopiaEnFila(src, destItmId) : null;
  if (enFila) return enFila;
  var fin = _bornerasUltimoDeCadena(src);
  var g = {
    id: _bornerasNuevoId(),
    lugar: 'junto',
    ref: fin.id,
    origen: destItmId || null,
    filaRef: null,
    clase: src.clase || 'bornera',
    tipo: src.tipo || '2.5',
    cant: src.cant || 1,


    dentro: !!fin.dentro,
    extIzq: _bornExtremos(src).izq,
    extDer: _bornExtremos(src).der,
    gapMm: 30
  };

  if (src.canaleta) g.canaleta = JSON.parse(JSON.stringify(_canCopiaCfg(src.canaleta)));
  _bornerasGrupos().push(g);
  return g;
}

function _bornerasCopiaEnFila(src, destItmId) {
  var k = 'cont:' + destItmId, filas = _bornerasFilasInf();
  for (var i = 0; i < filas.length; i++) {
    var eqs = filas[i].miembros.filter(function(m) { return m.indexOf('grp:') !== 0; });
    if (eqs.indexOf(k) === -1) continue;
    var hayCan = !!_canaletaCfgDeIds(eqs);
    var suya = null;
    _bornerasRaicesFila(i, eqs).forEach(function(r) {
      if (!suya && _bornerasDuenoEnFila(r, eqs, hayCan) === k) suya = r;
    });
    var raizSrc = _bornerasRaizCadena(src) || src;
    var g = { id: _bornerasNuevoId(), origen: destItmId, clase: src.clase || 'bornera',
              tipo: src.tipo || '2.5', cant: src.cant || 1,
              extIzq: _bornExtremos(src).izq, extDer: _bornExtremos(src).der, gapMm: 30 };
    if (suya) {
      var fin = _bornerasUltimoDeCadena(suya);
      g.lugar = 'junto'; g.ref = fin.id; g.filaRef = null;
      if (fin.dentro) g.dentro = true;
    } else {
      g.lugar = 'dif-inf-' + i; g.filaRef = k;

      if (hayCan && _grupoDentroCanaleta(raizSrc)) g.dentroCanaleta = true;
    }


    if (src.canaleta) g.canaleta = JSON.parse(JSON.stringify(_canCopiaCfg(src.canaleta)));
    _bornerasGrupos().push(g);
    return g;
  }
  return null;
}

function _bornerasCancelarUbicacion() {
  var deshacer = _bornAlCancelar;
  _bornAlCancelar = null;
  document.body.classList.remove('born-eligiendo');
  document.querySelectorAll('.born-sitio').forEach(function(el) { el.remove(); });
  var hint = document.getElementById('modo_copia_hint');
  if (hint) hint.remove();
  document.removeEventListener('keydown', _bornEscUbicacion);
  document.removeEventListener('click', _bornClickFuera);
  if (deshacer) {
    try { deshacer(); } catch (e) { console.warn('deshacer ubicacion:', e); }
  }
}

function _bornEscUbicacion(e) {
  if (e.key === 'Escape') _bornerasCancelarUbicacion();
}

function _bornClickFuera(e) {

  if (window._redibujoSafariEnCurso) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;
  var path = e.composedPath ? e.composedPath() : [];
  var dentro = container.contains(e.target) || path.indexOf(container) !== -1;
  if (!dentro) _bornerasCancelarUbicacion();
}


var _bornEditandoId = null;





function _bornerasSeccionesDe(grupoId) {
  var g = _bornerasGrupoPorId(grupoId);
  if (!g) return [];
  var out = [g], act = g, guard = 0;
  while (guard++ < 20) {
    var h = _bornerasGrupoDe('junto', act.id);
    if (!h || h.seccionDe !== g.id) break;
    out.push(h);
    act = h;
  }
  return out;
}




function _bornerasInsertarSeccion(prev, raizId, cfg) {
  var g = {
    id: _bornerasNuevoId(), clase: 'bornera', origen: prev.origen || null,
    lugar: 'junto', ref: prev.id, seccionDe: raizId,
    tipo: cfg.tipo, cant: cfg.cant,
    extIzq: cfg.extIzq, extDer: cfg.extDer,
    cantManual: !!cfg.cantManual, gapMm: 30
  };
  var hijo = _bornerasGrupoDe('junto', prev.id);
  if (prev.dentro) g.dentro = true;
  if (prev.dentroCanaleta) g.dentroCanaleta = true;
  if (hijo) hijo.ref = g.id;
  _bornerasGrupos().push(g);
  return g;
}






function _bornerasCantDefecto(itmId) {
  var itm = (itmId && typeof _buscarITM === 'function') ? _buscarITM(itmId) : null;
  if (!itm || !itm.contactor) return 1;
  var sel = !!(itm.pulsador && typeof _pulsadorSelectorOn === 'function' && _pulsadorSelectorOn(itm));
  var bot = !!(itm.pulsador && (typeof _pulsadorBotoneraOn !== 'function' || _pulsadorBotoneraOn(itm)));
  var tim = _timerComprado(_timerDe(itm.id));                                       
  if (bot && !sel && !tim) {
    var conN = /\+N/.test((window._panelBusbarData || {}).fases || '');
    var _conPil = (typeof _pulsadorMando === 'function') && _pulsadorMando(itm).conPiloto;
    return (_conPil || conN) ? 4 : 3;
  }
  return 5;
}

function abrirModalBorneras(grupoId) {
  _bornEditandoId = grupoId || null;
  var gr = grupoId ? _bornerasGrupoPorId(grupoId) : null;


  if (gr) _bornClase = (gr.clase === 'timer' || gr.clase === 'termostato')
    ? gr.clase : 'bornera';
  var esTimer = (_bornClase === 'timer');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalBorneras_overlay').classList.add('activo');



  var tit = document.getElementById('borneras_titulo');
  if (tit) tit.textContent = esTimer ? 'Timer' : 'Borneras';
  var wTipo = document.getElementById('borneras_wrap_tipo');
  if (wTipo) wTipo.style.display = esTimer ? 'none' : '';
  var wTopes = document.getElementById('borneras_wrap_extremos');
  if (wTopes) wTopes.style.display = esTimer ? 'none' : '';




  var wCant = document.getElementById('borneras_wrap_cant');
  if (wCant) wCant.style.display = esTimer ? 'none' : '';


  var cardT = document.getElementById('borneras_tipo');
  cardT = cardT && cardT.closest ? cardT.closest('.m1-card') : null;
  if (cardT) cardT.style.display = esTimer ? 'none' : '';

  var _secsB = grupoId ? _bornerasSeccionesDe(grupoId) : [];
  _seccRender('borneras_secciones', _secsB.length ? _secsB.map(function(g2) {
    var _e2 = _bornExtremos(g2);
    return { tipo: g2.tipo || '2.5', cant: g2.cant || 1,
             extIzq: _e2.izq, extDer: _e2.der, cantManual: !!g2.cantManual };
  }) : [{ tipo: '2.5', cant: esTimer ? 1 : _bornerasCantDefecto(_bornRefContactor),
          extIzq: _BORN_EXT_IZQ_DEF, extDer: _BORN_EXT_DER_DEF, cantManual: false }]);
  var btnQ = document.getElementById('borneras_btn_quitar');
  if (btnQ) btnQ.style.display = gr ? '' : 'none';
}

function cerrarModalBorneras() {
  var ov = document.getElementById('modalBorneras_overlay');
  if (ov) ov.classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
  _bornSitioElegido = null;
  _bornEditandoId = null;
}

function _bornerasGrupoPorId(id) {
  var g = _bornerasGrupos();
  for (var i = 0; i < g.length; i++) if (g[i].id === id) return g[i];
  return null;
}






var _timerEditandoId = null;

function abrirModalTimer(grupoId) {
  _timerEditandoId = grupoId || null;
  var gr = grupoId ? _bornerasGrupoPorId(grupoId) : null;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  var ov = document.getElementById('modalTimer_overlay');
  if (ov) ov.classList.add('activo');
  var chk = document.getElementById('modalTimer_reserva');
  if (chk) chk.checked = !!(gr && gr.reserva);
  var btn = document.getElementById('modalTimer_btnConfirmar');
  if (btn) btn.textContent = gr ? "Guardar cambios" : 'Crear';
}

function cerrarModalTimer() {
  var ov = document.getElementById('modalTimer_overlay');
  if (ov) ov.classList.remove('activo');
  _timerEditandoId = null;

  _bornSitioElegido = null;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'none';
}

function confirmarModalTimer() {
  var chk = document.getElementById('modalTimer_reserva');
  var esResv = !!(chk && chk.checked);
  if (_timerEditandoId) {
    var gr = _bornerasGrupoPorId(_timerEditandoId);
    if (gr) {
      if (esResv) gr.reserva = true;
      else delete gr.reserva;
    }
  } else if (_bornSitioElegido) {
    var g = _bornerasCrearGrupo(1, '2.5', _BORN_EXT_IZQ_DEF, _BORN_EXT_DER_DEF);
    if (g && esResv) g.reserva = true;
  }
  cerrarModalTimer();
  _postCambioBorneras();
}

function confirmarModalBorneras() {
  var secs = _seccLeer('borneras_secciones');
  if (!secs.length) { cerrarModalBorneras(); return; }



  var raiz = null;
  if (_bornEditandoId) {
    raiz = _bornerasGrupoPorId(_bornEditandoId);
  } else if (_bornSitioElegido) {
    raiz = _bornerasCrearGrupo(secs[0].cant, secs[0].tipo,
                               secs[0].extIzq, secs[0].extDer);
  }
  if (!raiz) { cerrarModalBorneras(); return; }

  raiz.tipo = secs[0].tipo;
  raiz.cant = secs[0].cant;
  raiz.extIzq = secs[0].extIzq;
  raiz.extDer = secs[0].extDer;
  raiz.cantManual = secs[0].cantManual;
  delete raiz.topes;                                                    



  var vivas = _bornerasSeccionesDe(raiz.id);
  var _i;
  for (_i = 1; _i < secs.length; _i++) {
    if (_i < vivas.length) {
      var gv = vivas[_i];
      gv.tipo = secs[_i].tipo;
      gv.cant = secs[_i].cant;
      gv.extIzq = secs[_i].extIzq;
      gv.extDer = secs[_i].extDer;
      gv.cantManual = secs[_i].cantManual;
    } else {
      vivas.push(_bornerasInsertarSeccion(vivas[_i - 1] || raiz, raiz.id, secs[_i]));
    }
  }


  for (_i = vivas.length - 1; _i >= secs.length; _i--) {
    _bornerasDesenganchar(vivas[_i].id);
  }

  cerrarModalBorneras();
  _postCambioBorneras();
}

function quitarBorneras() {
  if (_bornEditandoId) _bornerasEliminar(_bornEditandoId);
  cerrarModalBorneras();
}





function _bornerasDesenganchar(id) {
  var gr = _bornerasGrupoPorId(id);
  var hijo = _bornerasGrupoDe('junto', id);
  if (gr && hijo) {
    if (gr.lugar === 'junto') {
      hijo.ref = gr.ref;                                        
    } else {
      hijo.lugar = gr.lugar;                                     
      hijo.ref = gr.ref;
      hijo.filaRef = gr.filaRef || null;


      if (typeof gr.gapMm === 'number') hijo.gapMm = gr.gapMm;


      if (typeof gr.dentroCanaleta === 'boolean' && typeof hijo.dentroCanaleta !== 'boolean') {
        hijo.dentroCanaleta = gr.dentroCanaleta;
      }
      if (gr.alFinal) hijo.alFinal = true;
    }





    if (hijo.dentro && gr.canaleta && !hijo.canaleta) {
      hijo.canaleta = gr.canaleta;
      delete hijo.dentro;
    }
  }


  var _enc = _bornerasGrupoDe('pila', id);
  if (gr && _enc) {
    if (hijo) {
      _enc.ref = hijo.id;
    } else {
      _enc.ref = gr.ref;
      if (gr.lugar !== 'pila') {
        _enc.lugar = gr.lugar;
        if (typeof gr.gapMm === 'number') _enc.gapMm = gr.gapMm;
      }
    }
  }
  window._BORNERAS_GRUPOS = _bornerasGrupos().filter(function(g) { return g.id !== id; });
}

function _bornerasEliminar(id) {





  var gr = _bornerasGrupoPorId(id);
  if (gr && gr.clase === 'contactor' && gr.origen) {
    var itmK = (typeof _buscarITM === 'function') ? _buscarITM(gr.origen) : null;
    if (itmK && itmK.contactor && itmK.contactor.ubicacion === 'libre') {


      _bornerasBorrarClaseDe(gr.origen, 'timer');
      _bornerasBorrarClaseDe(gr.origen, 'bornera');

      if (typeof _quitarContactor === 'function') _quitarContactor(itmK, true);
      else delete itmK.contactor;
    }
  }


  if (gr && gr.clase === 'dps' && gr.origen) {
    var itmP = (typeof _buscarITM === 'function') ? _buscarITM(gr.origen) : null;
    if (itmP && itmP.dps && itmP.dps.ubicacion === 'libre') delete itmP.dps;
  }



  if (gr && (gr.clase || 'bornera') === 'bornera') {
    var cab = gr.seccionDe ? _bornerasGrupoPorId(gr.seccionDe) : gr;
    var secs = cab ? _bornerasSeccionesDe(cab.id) : [];
    if (secs.length > 1) {
      for (var k = secs.length - 1; k >= 0; k--) _bornerasDesenganchar(secs[k].id);
      _postCambioBorneras();
      return;
    }
  }
  _bornerasDesenganchar(id);
  _postCambioBorneras();
}








function _bornerasBorrarTimersDe(itmId) {
  return _bornerasBorrarClaseDe(itmId, 'timer') +
         _bornerasBorrarClaseDe(itmId, 'bornera') +
         _bornerasBorrarClaseDe(itmId, 'contactor');
}




function _bornerasLimpiarHuerfanas() {
  var n = 0, sigo = true, guard = 0;
  while (sigo && guard++ < 200) {
    sigo = false;
    var g = _bornerasGrupos();
    for (var i = 0; i < g.length; i++) {
      var gr = g[i];
      var _cl = gr.clase || 'bornera';                                        
      if (_cl !== 'bornera' && _cl !== 'timer') continue;
      if (!gr.origen || gr.origen === 'medidor' || gr.origen === 'rejilla') continue;
      var itm = (typeof _buscarITM === 'function') ? _buscarITM(gr.origen) : null;
      if (itm && itm.contactor) continue;
      _bornerasDesenganchar(gr.id);
      n++; sigo = true; break;
    }
  }
  return n;
}

function _bornerasBorrarClaseDe(itmId, clase) {
  if (!itmId) return 0;
  var n = 0, sigo = true, guard = 0;
  while (sigo && guard++ < 50) {
    sigo = false;
    var g = _bornerasGrupos();
    for (var i = 0; i < g.length; i++) {
      if (g[i].origen === itmId && (g[i].clase || 'bornera') === clase) {
        _bornerasDesenganchar(g[i].id);
        n++; sigo = true; break;                                         
      }
    }
  }
  return n;
}

function _postCambioBorneras() {
  if (typeof dibujarPanelBusbar === 'function') dibujarPanelBusbar();
  if (typeof actualizarBibliotecaOtros === 'function') actualizarBibliotecaOtros();
  if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();



  if (window._modoEditor === 'metrado' && typeof _renderModoMetrado === 'function') _renderModoMetrado();
  if (typeof guardarSesion === 'function') guardarSesion();
}

function onBornerasTriangleClick(triImg) {
  var id = triImg.dataset.bornGrupoId;
  if (!id) return;
  var prev = document.getElementById('tri_context_menu');
  if (prev) prev.remove();
  if (typeof _cerrarMenuTriangulo === 'function') _cerrarMenuTriangulo();

  var menu = document.createElement('div');
  menu.id = 'tri_context_menu';
  menu.className = 'dif-context-menu';







  var _grMenu = _bornerasGrupoPorId(id);





  if (_grMenu && _grMenu.clase !== 'contactor' &&
      typeof abrirModalEquipo === 'function') {
    var btnAgG = document.createElement('button');
    btnAgG.className = 'dif-context-btn';
    btnAgG.textContent = 'Agregar';
    btnAgG.addEventListener('click', function() {
      menu.remove();



      var _modo = (_grMenu.clase === 'itm') ? 'itmlibre' : 'grupo';
      abrirModalEquipo(_grMenu.origen || null, _modo, id);
    });
    menu.appendChild(btnAgG);
  }

  var _esContLibre = !!(_grMenu && _grMenu.clase === 'contactor');





  if (_esContLibre && _grMenu.origen && typeof abrirModalEquipo === 'function') {
    var btnAg = document.createElement('button');
    btnAg.className = 'dif-context-btn';
    btnAg.textContent = 'Agregar';
    btnAg.addEventListener('click', function() {
      menu.remove();
      abrirModalEquipo(_grMenu.origen, 'contactor');
    });
    menu.insertBefore(btnAg, menu.firstChild);
  }



  if (_grMenu && _grMenu.clase === 'timer') {
    var btnET = document.createElement('button');
    btnET.className = 'dif-context-btn';
    btnET.textContent = 'Editar';
    btnET.addEventListener('click', function() { menu.remove(); abrirModalTimer(id); });
    menu.appendChild(btnET);
  }
  if (!_grMenu || _grMenu.clase !== 'timer') {
    var btnE = document.createElement('button');
    btnE.className = 'dif-context-btn';
    btnE.textContent = 'Editar';
    btnE.addEventListener('click', function() {
      menu.remove();


      if (_grMenu && _grMenu.origen === 'medidor' && typeof abrirModalMedidor === 'function') {
        abrirModalMedidor();
      } else if (_grMenu && _grMenu.origen === 'rejilla' && typeof abrirModalRejilla === 'function') {

        abrirModalRejilla();
      } else if (_esContLibre && _grMenu.origen && typeof abrirModalContactor === 'function') {
        abrirModalContactor(_grMenu.origen);
      } else if (_grMenu && _grMenu.clase === 'dps' && _grMenu.origen &&
                 typeof abrirModalDPS === 'function') {

        abrirModalDPS(_grMenu.origen);
      } else if (_grMenu && _grMenu.clase === 'itm' && _grMenu.origen &&
                 typeof editarITMLibre === 'function') {

        editarITMLibre(_grMenu.origen);
      } else {
        abrirModalBorneras(id);
      }
    });
    menu.appendChild(btnE);
  }




  if (_esContLibre && _grMenu.origen &&
      typeof _activarModoCopiaContactor === 'function' &&
      typeof _hayDestinosCopiaValidosContactor === 'function' &&
      _hayDestinosCopiaValidosContactor(_buscarITM(_grMenu.origen))) {
    var btnCp = document.createElement('button');
    btnCp.className = 'dif-context-btn';
    btnCp.textContent = 'Copiar ' + (_bornerasPertenece(_grMenu) || 'contactor');
    btnCp.addEventListener('click', function() {
      menu.remove();
      _activarModoCopiaContactor(_grMenu.origen);
    });
    menu.appendChild(btnCp);
  }


  var _optSalto = _bornSaltoOpcion(_grMenu);
  if (_optSalto) {
    var btnSl = document.createElement('button');
    btnSl.className = 'dif-context-btn';
    btnSl.textContent = _optSalto;
    btnSl.addEventListener('click', function() {
      menu.remove();
      _saltoFilaGrupo(_grMenu.id);
    });
    menu.appendChild(btnSl);
  }





  var _clG = _grMenu.clase || 'bornera';
  var _itmOrigG = (_grMenu.origen && typeof _buscarITM === 'function') ? _buscarITM(_grMenu.origen) : null;
  if ((_clG === 'timer' || _clG === 'bornera') && _itmOrigG &&
      typeof _activarModoCopiaGrupo === 'function' &&
      typeof _hayDestinosCopiaValidosGrupo === 'function' &&
      _bornerasGrupoDeOrigen(_grMenu.origen, _clG) === _grMenu &&
      _hayDestinosCopiaValidosGrupo(_grMenu.origen, _clG)) {
    var btnCpG = document.createElement('button');
    btnCpG.className = 'dif-context-btn';
    btnCpG.textContent = (_clG === 'timer')
      ? 'Copiar ' + String(_itmOrigG.rotulo || '').replace('C-', 'T-')
      : 'Copiar borneras ' + _rotuloK(_itmOrigG.rotulo, '');
    btnCpG.addEventListener('click', function() {
      menu.remove();
      _activarModoCopiaGrupo(_grMenu.origen, _clG);
    });
    menu.appendChild(btnCpG);
  }

  var btnD = document.createElement('button');
  btnD.className = 'dif-context-btn';
  btnD.textContent = 'Eliminar';
  btnD.style.color = '#ff6b6b';
  btnD.addEventListener('click', function() {
    menu.remove();


    if (_grMenu && _grMenu.origen === 'medidor' &&
        typeof _medidorGruposBorneras === 'function') {
      var _ss = _medidorGruposBorneras();
      for (var _k = _ss.length - 1; _k >= 0; _k--) _bornerasDesenganchar(_ss[_k].id);
      _postCambioBorneras();
      return;
    }


    if (_grMenu && _grMenu.origen === 'rejilla' && typeof quitarRejilla === 'function') {
      quitarRejilla();
      return;
    }



    if (_grMenu && _grMenu.clase === 'itm' && _grMenu.origen &&
        typeof eliminarITMLibre === 'function') {
      eliminarITMLibre(_grMenu.origen);
      return;
    }
    _bornerasEliminar(id);
  });
  menu.appendChild(btnD);

  _abrirMenuTriangulo(menu, triImg);
}
