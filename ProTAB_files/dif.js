






















var DIF_GAB_GAP_LEFT_PX  = 600;                                                  
var DIF_GAB_GAP_RIGHT_PX = 600;                                                  
var DIF_ITM_GAP_LEFT_PX  = 250;                                                  
var DIF_ITM_GAP_RIGHT_PX = 250;                                                  
var DIF_VIS_W_PX         = 425;                                   
var DIF_INF_GAP          = 375;                                                  
var DIF_INF_INTER_GAP    = 375;                                                     
var DIF_INF_NEXT_GAP     = 375;                                                  

window._difLateralNextY = { left: null, right: null };



var CONT_DIF_GAP_LEFT_PX  = 250;
var CONT_DIF_GAP_RIGHT_PX = 250;



var INF_CONT_GAP_PX = 375;
window._contLateralNextY = { left: null, right: null };                      
window._difLatY = {};                                                          

var _equipoITMId = null;




var _equipoOrigen = null;
var _difITMId = null;




function _buscarITM(itmId) {
  var found = null;
  var todos = (typeof _itmTodos === 'function')
    ? _itmTodos() : (window._itmList || []);
  todos.forEach(function(i) { if (i.id === itmId) found = i; });
  return found;
}

function _findDifTri(itmId) {
  var c = document.getElementById('panel_busbar_container');
  return c ? c.querySelector('.dif-tri[data-dif-itm-id="' + itmId + '"]') : null;
}

function _findContactorTri(itmId) {
  var c = document.getElementById('panel_busbar_container');
  return c ? c.querySelector('.contactor-tri[data-contactor-itm-id="' + itmId + '"]') : null;
}


function _slotInfoForItm(itm) {
  if (!itm || itm.tipo !== 'reserva') return null;
  var cmSet = _buildCmConSet();
  var cmRegSet = _buildCmRegConSet();
  var idx = parseInt(itm.conIndex);
  return { esCmReg: !!cmRegSet[idx], esCmFijo: !cmRegSet[idx] && !!cmSet[idx] };
}


function _itmPuedeUsarDIF(itm) {
  return itmPuedeUsarDIF(itm, _slotInfoForItm(itm)).eligible;
}

function _hayDIFsInferiores() {
  return (window._itmList || []).some(function(i) {
    return (i.dif && i.dif.ubicacion === 'inferior') ||
           (i.contactor && i.contactor.ubicacion === 'inferior');
  });
}







function _elementosInferiores() {
  var els = _elementosInferioresBase();





  if (typeof _bornSaltoDeContactor === 'function') {
    for (var i = 0; i + 1 < els.length; i++) {
      if (els[i].kind === 'contactor' && _bornSaltoDeContactor(els[i].itm.id)) els[i + 1].salto = true;
    }
  }
  return els;
}


function _elementosInferioresBase() {



  var difs = [], conts = [];
  (window._itmList || []).forEach(function(i) {
    if (i.dif && i.dif.ubicacion === 'inferior') {
      difs.push({ itm: i, kind: 'dif', w: 90 * (i.dif.polos || 2), h: 425, salto: !!i.dif.salto });
    }
    if (i.contactor && i.contactor.ubicacion === 'inferior') {
      var _mc = _contactorModelo(i.contactor.capacidad);
      conts.push({ itm: i, kind: 'contactor', w: _mc.w, h: _mc.h,
                   salto: !!i.contactor.salto });
    }
  });
  difs = _ordenInfOrdenar(difs, 'dif');
  conts = _ordenInfOrdenar(conts, 'contactor');
  if (difs.length && conts.length) conts[0].salto = true;
  return difs.concat(conts);
}







function _hayVecinoEnFila(itmId, kind) {
  var lay = _layoutInferior();
  if (!lay) return false;
  for (var i = 0; i < lay.els.length; i++) {
    if (lay.els[i].kind !== kind || lay.els[i].itm.id !== itmId) continue;
    return lay.filas[lay.filaDe[i]].length > 1;
  }
  return false;
}
function _ordenInfOrdenar(arr, campo) {
  var hay = arr.some(function(e) { return typeof e.itm[campo].ordenInf === 'number'; });
  if (!hay) return arr;
  return arr.map(function(e, k) {
    var o = e.itm[campo].ordenInf;
    return { e: e, k: k, o: (typeof o === 'number') ? o : 1e6 + k };
  }).sort(function(a, b) { return (a.o - b.o) || (a.k - b.k); })
    .map(function(x) { return x.e; });
}






var _moverInf = null;                                                 

function moverEnFila(itmId, kind) {
  if (_moverInf) _moverInfTerminar(false);
  var campo = (kind === 'contactor') ? 'contactor' : 'dif';
  var lay = _layoutInferior();
  if (!lay) return;
  var antes = {}, pos = 0;
  lay.els.forEach(function(e) {
    if (e.kind !== kind) return;
    var o = e.itm[campo];
    antes[e.itm.id] = { o: o.ordenInf, s: o.salto };
    o.ordenInf = pos++;
  });
  _moverInf = { id: itmId, kind: kind, campo: campo, antes: antes };
  document.addEventListener('keydown', _moverInfTecla);
  _moverInfPintar();
}

function _moverInfTecla(e) {
  if (!_moverInf) return;
  if (e.key === 'Escape') _moverInfTerminar(true);
  else if (e.key === 'Enter') _moverInfTerminar(false);
  else if (e.key === 'ArrowLeft') _moverInfPaso(-1);
  else if (e.key === 'ArrowRight') _moverInfPaso(1);
}


function _moverInfVecino(dir) {
  var m = _moverInf, lay = _layoutInferior();
  if (!m || !lay) return null;
  for (var i = 0; i < lay.els.length; i++) {
    var e = lay.els[i];
    if (e.kind !== m.kind || e.itm.id !== m.id) continue;
    var j = i + dir, v = lay.els[j];
    if (!v || v.kind !== m.kind || lay.filaDe[j] !== lay.filaDe[i]) return null;
    return v.itm;
  }
  return null;
}

function _moverInfPaso(dir) {
  var m = _moverInf;
  if (!m) return;
  var vec = _moverInfVecino(dir), yo = _buscarITM(m.id);
  if (!vec || !yo) return;
  var a = yo[m.campo], b = vec[m.campo];
  var o = a.ordenInf; a.ordenInf = b.ordenInf; b.ordenInf = o;

  var s = !!a.salto; a.salto = !!b.salto; b.salto = s;
  _conReglas(function() { dibujarPanelBusbar(); });
}

function _moverInfTerminar(cancelar) {
  var m = _moverInf;
  if (!m) return;
  _moverInf = null;
  document.removeEventListener('keydown', _moverInfTecla);
  document.querySelectorAll('.mover-inf-ctrl').forEach(function(el) { el.remove(); });
  if (cancelar) {
    Object.keys(m.antes).forEach(function(id) {
      var it = _buscarITM(id), o = it && it[m.campo];
      if (!o) return;
      if (typeof m.antes[id].o === 'number') o.ordenInf = m.antes[id].o; else delete o.ordenInf;
      o.salto = m.antes[id].s;
    });
  }
  _conReglas(function() {
    dibujarPanelBusbar();
    if (!cancelar) guardarSesion();
  });
}



function _moverInfPintar(container) {
  container = container || document.getElementById('panel_busbar_container');
  if (!container || !_moverInf) return;
  container.querySelectorAll('.mover-inf-ctrl').forEach(function(el) { el.remove(); });
  var m = _moverInf;
  var cuerpo = (m.kind === 'dif')
    ? container.querySelector('.dif-inferior[data-dif-itm-id="' + m.id + '"]')
    : container.querySelector('.contactor-inferior[data-contactor-itm-id="' + m.id + '"]');
  if (!cuerpo) { _moverInfTerminar(false); return; }
  var x = parseFloat(cuerpo.style.left) || 0, y = parseFloat(cuerpo.style.top) || 0;
  var w = parseFloat(cuerpo.style.width) || cuerpo.offsetWidth || 0;
  var h = parseFloat(cuerpo.style.height) || cuerpo.offsetHeight || 0;
  function _ctrl(txt, cls, l, t, ancho, alto, fn, titulo) {
    var b = document.createElement('div');
    b.className = 'mover-inf-ctrl ' + cls;
    b.textContent = txt;
    b.title = titulo;
    b.style.cssText = 'position:absolute;left:' + l + 'px;top:' + t + 'px;width:' + ancho +
      'px;height:' + alto + 'px;line-height:' + alto + 'px;';
    b.addEventListener('click', function(e) { e.stopPropagation(); fn(); });
    container.appendChild(b);
  }
  var marco = document.createElement('div');
  marco.className = 'mover-inf-ctrl mover-inf-marco';
  marco.style.cssText = 'position:absolute;left:' + (x - 10) + 'px;top:' + (y - 10) +
    'px;width:' + (w + 20) + 'px;height:' + (h + 20) + 'px;';
  container.appendChild(marco);


  var A = Math.min(110, w / 2 - 10);
  if (_moverInfVecino(-1)) _ctrl('\u25C0', 'mover-inf-flecha', x - A / 2, y + h / 2 - A, A, 2 * A,
                                function() { _moverInfPaso(-1); }, 'Mover a la izquierda');
  if (_moverInfVecino(1))  _ctrl('\u25B6', 'mover-inf-flecha', x + w - A / 2, y + h / 2 - A, A, 2 * A,
                                function() { _moverInfPaso(1); }, 'Mover a la derecha');
  var B = 130, cx = x + w / 2;
  _ctrl('\u2713', 'mover-inf-ok', cx - B - 10, y - B - 40, B, B,
        function() { _moverInfTerminar(false); }, 'Listo');
  _ctrl('\u2715', 'mover-inf-cancelar', cx + 10, y - B - 40, B, B,
        function() { _moverInfTerminar(true); }, "Volver");
}



function _layoutInferior() {
  var els = _elementosInferiores();
  if (!els.length) return null;
  var filas = [[]], filaDe = [];
  els.forEach(function(e, idx) {
    if (idx > 0 && e.salto) filas.push([]);
    filas[filas.length - 1].push(idx);
    filaDe[idx] = filas.length - 1;
  });
  var filaW = filas.map(function(ix, f) {
    var w = ix.reduce(function(a, i) { return a + els[i].w; }, 0);


    if (typeof _bornerasAnchoFilaInferior === 'function') {


      w += _bornerasAnchoFilaInferior(f, ix.map(function(i) {
        return (els[i].kind === 'dif' ? 'dif:' : 'cont:') + els[i].itm.id;
      }));
    }
    return w;
  });
  var filaH = filas.map(function(ix) {
    return ix.reduce(function(a, i) { return Math.max(a, els[i].h); }, 0);
  });

  var filaCont = -1;
  els.forEach(function(e, idx) {
    if (filaCont === -1 && e.kind === 'contactor') filaCont = filaDe[idx];
  });



  var filaIds = filas.map(function(ix) {
    return ix.map(function(i) {
      return (els[i].kind === 'dif' ? 'dif:' : 'cont:') + els[i].itm.id;
    });
  });



  var _canF = (typeof canaletaFilasCfgYAncho === 'function')
    ? canaletaFilasCfgYAncho(filaIds)
    : { cfgs: filaIds.map(function() { return null; }), anchos: filaIds.map(function() { return 0; }) };
  var _cfgF = _canF.cfgs, _anchoF = _canF.anchos;





  filas.forEach(function(ix, f) {
    if (typeof _canaletaOrdenFila !== 'function') return;
    var perm = _canaletaOrdenFila(filaIds[f], _cfgF[f]);
    if (!perm) return;
    var ids0 = filaIds[f];
    filas[f] = perm.map(function(k) { return ix[k]; });
    filaIds[f] = perm.map(function(k) { return ids0[k]; });
  });
  var filaOffX = filas.map(function(ix, f) {
    var antes = (typeof _canaletaHuecosFila === 'function')
      ? _canaletaHuecosFila(filaIds[f], _cfgF[f]) : [];
    var xs = [], x = 0, extra = 0;



    var _huecos = (typeof _bornerasHuecosFila === 'function')
      ? _bornerasHuecosFila(f, filaIds[f], !!_cfgF[f]) : {};
    ix.forEach(function(i, k) {
      x += (antes[k] || 0); extra += (antes[k] || 0);

      x += (_huecos['<' + filaIds[f][k]] || 0);
      xs.push(x);
      x += els[i].w;
      x += (_huecos[filaIds[f][k]] || 0);
    });
    filaW[f] += extra;
    return xs;
  });
  var _fx = function(f) {
    return (typeof _canaletaFilaExtrasIds === 'function')
      ? _canaletaFilaExtrasIds(filaIds[f], filaW[f], filaH[f], _anchoF[f])
      : { arriba: 0, abajo: 0 };
  };
  var filaExt = filas.map(function(ix, f) { return _fx(f); });
  var _falta = function(ocupado, gap) {
    return (typeof _canaletaFaltaHueco === 'function')
      ? _canaletaFaltaHueco(ocupado, gap) : 0;
  };

  var filaOffY = [0];
  for (var f = 1; f < filas.length; f++) {


    var gap = (f === filaCont) ? (window.INF_CONT_GAP_PX || 375) : DIF_INF_INTER_GAP;




    var _oc = filaExt[f - 1].abajo + filaExt[f].arriba;





    gap = filaExt[f].fusionArriba ? _oc : (gap + _falta(_oc, gap));
    filaOffY[f] = filaOffY[f - 1] + filaH[f - 1] + gap;
  }
  return { els: els, filas: filas, filaDe: filaDe, filaW: filaW, filaH: filaH,
           filaIds: filaIds, filaExt: filaExt, filaOffX: filaOffX,
           filaOffY: filaOffY, filaCont: filaCont,
           totalH: filaOffY[filas.length - 1] + filaH[filas.length - 1] };
}




function _difInfGapEff() {
  var lay = _layoutInferior();
  if (!lay || typeof _canaletaFaltaHueco !== 'function') return DIF_INF_GAP;
  return DIF_INF_GAP + _canaletaFaltaHueco(lay.filaExt[0].arriba, DIF_INF_GAP);
}
function _difInfNextGapEff() {
  var lay = _layoutInferior();
  if (!lay || typeof _canaletaFaltaHueco !== 'function') return DIF_INF_NEXT_GAP;
  var u = lay.filaExt[lay.filaExt.length - 1];




  if (typeof _canaletaTiraBarraFusionada === 'function' && _canaletaTiraBarraFusionada()) return u.abajo;
  return DIF_INF_NEXT_GAP + _canaletaFaltaHueco(u.abajo, DIF_INF_NEXT_GAP);
}

function _getTotalDIFInferiorHeight() {
  var lay = _layoutInferior();
  return lay ? lay.totalH : 0;
}



function _infoFilaInferior(itmId, kind) {
  var lay = _layoutInferior();
  if (!lay) return null;
  for (var i = 0; i < lay.els.length; i++) {
    if (lay.els[i].kind === kind && lay.els[i].itm.id === itmId) {


      return { idx: i, fila: lay.filaDe[i], numFilas: lay.filas.length,
               forzado: kind === 'contactor' && i > 0 && lay.els[i - 1].kind === 'dif' };
    }
  }
  return null;
}











var _equipoCanaletaKey = null;

function _findGrupoTri(grupoId) {
  var c = document.getElementById('panel_busbar_container');
  return (c && grupoId) ? c.querySelector('.bornera-tri[data-born-grupo-id="' + grupoId + '"]') : null;
}





var _equipoGrupoId = null;



var _anchoBadgeCanvas = null;
function _anchoBadgeRotulo(texto) {
  try {
    _anchoBadgeCanvas = _anchoBadgeCanvas || document.createElement('canvas');
    var cx = _anchoBadgeCanvas.getContext('2d');
    cx.font = '700 54px "Segoe UI", Arial, sans-serif';
    return Math.ceil(cx.measureText(String(texto || '')).width) + 26;
  } catch (e) { return 146; }
}






function _grupoDelItmLibre(itmId) {
  var g = (typeof _bornerasGrupos === 'function') ? _bornerasGrupos() : [];
  for (var i = 0; i < g.length; i++) {
    if (g[i].origen === itmId && g[i].clase === 'itm') return g[i];
  }
  return null;
}



function _ultimoEslabonDelItmLibre(itmId) {
  var act = _grupoDelItmLibre(itmId);
  if (!act) return null;
  var guard = 0;
  while (guard++ < 20) {
    var hijo = _bornerasGrupoDe('junto', act.id);
    if (!hijo) break;
    act = hijo;
  }
  return act;
}

function _encadenarJuntoAlItmLibre(itmId, clase, extra) {
  var prev = _ultimoEslabonDelItmLibre(itmId);
  if (!prev) return null;
  var g = {
    id: _bornerasNuevoId(), clase: clase, origen: itmId,
    lugar: 'junto', ref: prev.id, cant: 1, gapMm: 30
  };
  if (extra) { for (var k in extra) { if (extra[k] !== undefined) g[k] = extra[k]; } }
  window._BORNERAS_GRUPOS = window._BORNERAS_GRUPOS || [];
  window._BORNERAS_GRUPOS.push(g);
  return g;
}

function abrirModalEquipo(itmId, origen, grupoId) {


  window._equipoOrigenPend = null;
  _equipoITMId = itmId;
  _equipoOrigen = origen || 'itm';
  _equipoGrupoId = grupoId || null;
  _pulseTri((origen === 'grupo' || origen === 'itmlibre') ? _findGrupoTri(grupoId)
          : origen === 'dif' ? _findDifTri(itmId)
          : origen === 'contactor' ? _findContactorTri(itmId)
          : _findItmTri(itmId));

  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalEquipo_overlay').classList.add('activo');

  document.querySelectorAll('.equipo-option').forEach(function(btn) {
    btn.classList.remove('equipo-activo');
  });


  var itm = _buscarITM(itmId);


  function _setEq(btn, ok, motivo) {
    if (!btn) return;
    btn.classList.toggle('equipo-disabled', !ok);
    btn.disabled = !ok;
    btn.classList.toggle('equipo-activo', ok);
    btn.title = ok ? '' : (motivo || '');
  }
  var _tieneDif = !!(itm && itm.dif);
  _setEq(document.getElementById('equipo_dif'),
         _itmPuedeUsarDIF(itm) && !_tieneDif,
         _tieneDif ? 'Este circuito ya tiene diferencial' : 'No admite diferencial');
  var _tieneDps = !!(itm && itm.dps);
  _setEq(document.getElementById('equipo_dps'), !_tieneDps, 'Este circuito ya tiene DPS');




  if (itm && itm.libre) {
    _setEq(document.getElementById('equipo_dif'), false,
           'Todavia no disponible para un ITM libre');


  }
  var _tieneCont = !!(itm && itm.contactor);
  _setEq(document.getElementById('equipo_contactor'), !_tieneCont, 'Este circuito ya tiene contactor');





  var soloContactor = (origen === 'dif');
  var desdeContactor = (origen === 'contactor');


  var desdeGrupo = (origen === 'grupo');


  var desdeItmLibre = (origen === 'itmlibre');
  ['equipo_dif', 'equipo_dps'].forEach(function(id) {
    var b = document.getElementById(id);
    if (b) b.style.display = (soloContactor || desdeContactor ||
                              (desdeGrupo && !desdeItmLibre)) ? 'none' : '';
  });
  var bCont = document.getElementById('equipo_contactor');
  if (bCont) bCont.style.display = (desdeContactor ||
                                    (desdeGrupo && !desdeItmLibre)) ? 'none' : '';


  ['equipo_pulsador', 'equipo_borneras', 'equipo_temporizador'].forEach(function(id) {
    var b = document.getElementById(id);
    if (!b) return;
    b.style.display = (desdeContactor && !desdeGrupo) ? '' : 'none';
    b.classList.remove('equipo-disabled');
    b.disabled = false;
    b.classList.add('equipo-activo');
  });






  var _canEq = canaletaParaEquipo({
    origen: origen, itm: itm, itmId: itmId, grupoId: _equipoGrupoId,
    desdeContactor: desdeContactor, desdeGrupo: desdeGrupo, desdeItmLibre: desdeItmLibre
  });
  _equipoCanaletaKey = _canEq.ref;
  var _yaCan = _canEq.ya, _motivoCan = _canEq.motivo;
  var _bCan = document.getElementById('equipo_canaleta');
  if (_bCan) {
    _bCan.style.display = _equipoCanaletaKey ? '' : 'none';
    if (_equipoCanaletaKey) {
      _bCan.classList.toggle('equipo-disabled', _yaCan);
      _bCan.classList.toggle('equipo-activo', !_yaCan);
      _bCan.disabled = _yaCan;
      _bCan.title = _yaCan ? _motivoCan : '';
    }
  }




  if (desdeContactor) {
    var _bloquear = function(id, cerrado, motivo) {
      var b = document.getElementById(id);
      if (!b) return;
      b.classList.toggle('equipo-disabled', cerrado);
      b.classList.toggle('equipo-activo', !cerrado);
      b.disabled = cerrado;
      b.title = cerrado ? motivo : '';
    };
    _bloquear('equipo_pulsador', !!(itm && itm.pulsador),
      'Este circuito ya tiene pulsador');



    var _yaBorn = (typeof _bornerasGrupoDeOrigen === 'function')
      ? _bornerasGrupoDeOrigen(itmId, 'bornera') : null;
    var _yaTimer = (typeof _bornerasGrupoDeOrigen === 'function')
      ? _bornerasGrupoDeOrigen(itmId, 'timer') : null;
    var _sinLugar = (typeof _bornerasSitiosDisponibles === 'function') &&
      _bornerasSitiosDisponibles(itmId).length === 0;
    _bloquear('equipo_borneras', !!_yaBorn || _sinLugar,
      _yaBorn ? 'Este circuito ya tiene borneras'
              : 'No quedan lugares libres para borneras');
    _bloquear('equipo_temporizador', !!_yaTimer || _sinLugar,
      _yaTimer ? 'Este circuito ya tiene timer'
               : 'No quedan lugares libres para el timer');
  }
}

function cerrarModalEquipo() {
  document.getElementById('modalEquipo_overlay').classList.remove('activo');
  _unpulseTri(_findItmTri(_equipoITMId));
  _unpulseTri(_findDifTri(_equipoITMId));
  _unpulseTri(_findContactorTri(_equipoITMId));
  _unpulseTri(_findGrupoTri(_equipoGrupoId));
  _unpulseTodos();
  _equipoITMId = null;
  _equipoOrigen = null;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'none';
}

function seleccionarEquipo(btn, tipo) {
  if (btn.classList.contains('equipo-activo')) {
    var savedItmId = _equipoITMId;


    window._equipoOrigenPend = _equipoOrigen;
    cerrarModalEquipo();
    if (tipo === 'dif') abrirModalDIF(savedItmId);
    if (tipo === 'dps') abrirModalDPS(savedItmId);
    if (tipo === 'contactor') abrirModalContactor(savedItmId);
    if (tipo === 'pulsador') abrirModalPulsador(savedItmId);


    if (tipo === 'borneras') iniciarUbicacionBorneras(savedItmId, 'bornera');

    if (tipo === 'timer') iniciarUbicacionBorneras(savedItmId, 'timer');



    if (tipo === 'canaleta' && _equipoCanaletaKey) {
      abrirModalCanaleta(_equipoCanaletaKey);
    }
    return;
  }
  document.querySelectorAll('.equipo-option').forEach(function(b) {
    b.classList.remove('equipo-activo');
  });
  btn.classList.add('equipo-activo');
}



function _padreEquipo(previo, porDefecto) {




  if (previo) {
    window._equipoOrigenPend = null;
    return previo.padre || porDefecto || 'itm';
  }
  var o = window._equipoOrigenPend;
  window._equipoOrigenPend = null;



  if (o === 'itmlibre' || o === 'grupo') o = 'itm';
  return o || porDefecto || 'itm';
}



function _hijosDe(itm, padre) {
  var out = [];
  if (!itm) return out;

  if (padre !== 'pulsador'  && itm.pulsador  && itm.pulsador.padre  === padre) out.push('pulsador');
  if (padre !== 'dps'       && itm.dps       && itm.dps.padre       === padre) out.push('dps');
  if (padre !== 'contactor' && itm.contactor && itm.contactor.padre === padre) out.push('contactor');
  return out;
}



function _borrarHijosDe(itm, padre) {
  var hijos = _hijosDe(itm, padre);
  for (var i = 0; i < hijos.length; i++) {
    var prop = hijos[i];
    _borrarHijosDe(itm, prop);                       
    delete itm[prop];

    if (prop === 'dps' && typeof _bornerasBorrarClaseDe === 'function') {
      _bornerasBorrarClaseDe(itm.id, 'dps');
    }


    if (prop === 'contactor') {
      if (typeof _bornerasBorrarTimersDe === 'function') _bornerasBorrarTimersDe(itm.id);
      _canaletaQuitarFilaContactor(itm.id);
    }
  }
  return hijos.length;
}


function abrirModalDIF(itmId) {
  _difITMId = itmId;
  var itm = _buscarITM(itmId);
  _pulseTri(itm && itm.dif ? _findDifTri(itmId) : _findItmTri(itmId));

  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalDIF_overlay').classList.add('activo');


  var ubicacionFijada = null;
  var cardUbicacion = document.getElementById('modalDIF_ubicacion').closest('.m1-card');
  (window._itmList || []).forEach(function(it) {
    if (it.dif && it.dif.ubicacion && !ubicacionFijada) ubicacionFijada = it.dif.ubicacion;
  });
  if (ubicacionFijada) {
    if (cardUbicacion) cardUbicacion.style.display = 'none';
    setDIFUbicacion(ubicacionFijada);
  } else {
    if (cardUbicacion) cardUbicacion.style.display = '';
    setDIFUbicacion('lateral');
  }


  document.getElementById('modalDIF_sensibilidad').value = '30';
  document.getElementById('modalDIF_corriente').value = '25';
  document.getElementById('modalDIF_tipo').value = 'riel';
  document.getElementById('modalDIF_error').textContent = '';


  var rotEl = document.getElementById('modalDIF_rotulo');
  if (rotEl) {
    rotEl.textContent = _rotuloID(itm && itm.rotulo, 'ID-??');
  }


  var polosEl = document.getElementById('modalDIF_polos');
  if (polosEl && itm) {
    polosEl.textContent = ((parseInt(itm.polos, 10) <= 2) ? 2 : 4) + 'P';
  }


  if (itm && itm.dif) {
    setDIFUbicacion(itm.dif.ubicacion || ubicacionFijada || 'lateral');
    document.getElementById('modalDIF_sensibilidad').value = itm.dif.sensibilidad || '30';
    document.getElementById('modalDIF_corriente').value = itm.dif.corriente || '25';
    document.getElementById('modalDIF_tipo').value = itm.dif.tipo || 'riel';

    var otrosDifs = window._itmList.filter(function(it) { return it.dif && it.id !== itm.id; });
    if (otrosDifs.length === 0 && cardUbicacion) cardUbicacion.style.display = '';
  }

  onDIFTipoChange();

  var _bD = document.getElementById('modalDIF_btnGuardar');
  if (_bD) _bD.textContent = (itm && itm.dif) ? "Guardar cambios" : 'Crear';
}


function onDIFTipoChange() {
  var tipoSel = document.getElementById('modalDIF_tipo');
  if (!tipoSel) return;
  var esReserva = tipoSel.value === 'reserva';
  var cardCapSens = document.getElementById('modalDIF_cardCapSens');
  if (cardCapSens) cardCapSens.style.display = 'flex';
  var wrapCap  = document.getElementById('wrap_dif_capacidad');
  var wrapSens = document.getElementById('wrap_dif_sensibilidad');
  var wrapResv = document.getElementById('wrap_dif_reserva_info');
  if (wrapCap)  wrapCap.style.display  = esReserva ? 'none' : '';
  if (wrapSens) wrapSens.style.display = esReserva ? 'none' : '';
  if (wrapResv) wrapResv.style.display = esReserva ? ''     : 'none';
}

function cerrarModalDIF() {
  document.getElementById('modalDIF_overlay').classList.remove('activo');
  _unpulseTri(_findItmTri(_difITMId));
  _unpulseTri(_findDifTri(_difITMId));
  _unpulseTodos();
  _difITMId = null;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'none';
}

function setDIFUbicacion(val) {
  document.querySelectorAll('#modalDIF_ubicacion .seg-btn').forEach(function(btn) {
    btn.classList.toggle('activo', btn.dataset.val === val);
  });
}

function confirmarModalDIF() {
  var errEl = document.getElementById('modalDIF_error');
  errEl.textContent = '';

  var itm = _buscarITM(_difITMId);
  if (!itm) { errEl.textContent = 'ITM no encontrado'; return; }

  var input = {
    ubicacion: document.querySelector('#modalDIF_ubicacion .seg-btn.activo').dataset.val,
    sensibilidad: document.getElementById('modalDIF_sensibilidad').value,
    corriente: document.getElementById('modalDIF_corriente').value,
    tipo: document.getElementById('modalDIF_tipo').value || 'riel'
  };


  var resp = buildDIF(input, itm, _slotInfoForItm(itm));
  if (!resp.ok) {
    errEl.textContent = (resp.errors || ['Error al armar DIF']).join(' / ');
    return;
  }


  if (itm.dif && itm.dif.salto && resp.data.ubicacion === 'inferior') resp.data.salto = true;
  itm.dif = resp.data;




  cerrarModalDIF();
  _conReglas(function() {
    dibujarPanelBusbar();
    guardarSesion();
  });
}


























function _itmOcupaColLat(itm) {
  if (!itm) return false;
  return !!((itm.dif && itm.dif.ubicacion === 'lateral') || _dpsEnColumna(itm) ||
            (itm.contactor && itm.contactor.ubicacion === 'lateral'));
}





function _dpsEnColumna(itm) {
  return !!(itm && itm.dps && itm.dps.ubicacion !== 'libre');
}














function _slotAltoDe(itm) {
  var idx = parseInt(itm.conIndex);
  if (_buildCmRegConSet()[idx]) return CM_REG_CON_H;
  if (_buildCmConSet()[idx])    return CM_CON_H;
  return 90;
}

function _itmYRel(itm, conHOverride) {
  var idx = parseInt(itm.conIndex);
  var y = getConY(idx, 0, _buildCmConSet(), _buildCmRegConSet());
  var h = (typeof conHOverride === 'number') ? conHOverride : _slotAltoDe(itm);
  var d = window._panelBusbarData;
  var effInvN = !!(d && d.invertirNConectores) !== !!itm.invertirN;
  return (itm.tieneConN && !effInvN) ? (y - h) : y;
}



function _itmAltoCuerpo(itm) {
  var polos = parseInt(itm.polos, 10) || 1;
  var t = itm.tipo;
  if (t === 'reserva') {
    var idx = parseInt(itm.conIndex);
    if (_buildCmRegConSet()[idx])   t = 'cm_reg';
    else if (_buildCmConSet()[idx]) t = 'cm_fijo';
    else                            t = 'riel';
  }
  if (t === 'cm_reg') return (polos * 35) / PX_TO_MM;
  if (t === 'cm_fijo') {
    return (polos * (parseInt(itm.capacidad, 10) >= 125 ? 35 : 25)) / PX_TO_MM;
  }
  return polos * _slotAltoDe(itm);
}










function _columnaLateralSpanY(side) {
  var lista = [];
  (window._itmList || []).forEach(function(it) {
    if (it.side === side && _itmOcupaColLat(it)) lista.push(it);
  });
  if (!lista.length) return null;
  lista.sort(function(a, b) { return _itmYRel(a) - _itmYRel(b); });

  var next = null, y0 = null, y1 = null;
  var poner = function(itmY, h) {
    var y = (next !== null && next > itmY) ? next : itmY;
    next = y + h;
    if (y0 === null || y < y0) y0 = y;
    if (y1 === null || next > y1) y1 = next;
  };
  lista.forEach(function(it) {

    var itmY = _itmYRel(it);                                             
    var tieneDifLat = it.dif && it.dif.ubicacion === 'lateral';
    if (tieneDifLat) poner(itmY, 90 * it.dif.polos);
    if (it.contactor && it.contactor.ubicacion === 'lateral' && !tieneDifLat) {


      poner(itmY, _contactorModelo(it.contactor.capacidad).w);
    }
    if (_dpsEnColumna(it)) {
      var dm = (typeof _DPS_DIMS !== 'undefined')
        ? _dpsDims(it.dps.polos) : null;
      if (dm) poner(itmY, dm.w);
    }
  });
  return (y0 === null) ? null : { y0: y0, y1: y1 };
}



function _anclaColumnaLateral(side) {
  var span = _columnaLateralSpanY(side);
  if (!span) return null;

  var d = window._panelBusbarData;
  var aisNatW = _isAis4fDrawing(d) ? 715 : 650;
  var cmS = _buildCmConSet(), cmRS = _buildCmRegConSet();
  var edge = null;

  (window._itmList || []).forEach(function(itm) {
    if (itm.side !== side) return;
    if (!_itmOcupaColLat(itm)) {


      var y0 = _itmYRel(itm);
      var y1 = y0 + _itmAltoCuerpo(itm);
      if (y1 <= span.y0 + 1e-6 || span.y1 <= y0 + 1e-6) return;
    }
    var e = itmLateralEdgeRelX(itm, side, aisNatW, cmS, cmRS,
                               RIEL_CON_W || 115, CM_CON_W, CM_REG_CON_W);
    if (e === null) return;
    if (edge === null || (side === 'left' ? e < edge : e > edge)) edge = e;
  });
  return edge;
}


function _dibujarDIF(itm) {
  if (!itm.dif) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;

  var d = window._panelBusbarData;
  var conH = 90;
  var scaleF = 1;

  var difPolos = itm.dif.polos;
  var difNatW = 90 * difPolos;
  var difNatH = 425;
  var difVisW = difNatH * scaleF;                                     
  var difVisH = difNatW * scaleF;                                     

  var svgFile = 'dif' + difPolos + 'p_itm.svg';
  var difGap = (itm.dif.ubicacion === 'lateral')
    ? (itm.side === 'left' ? DIF_ITM_GAP_LEFT_PX : DIF_ITM_GAP_RIGHT_PX)
    : 2;


  var itmConX = parseFloat(itm.conX);
  var itmConW = parseFloat(itm.conW);
  var itmVisW_itm = 425 * scaleF;
  var itmX_itm = (itm.side === 'left') ? (itmConX - itmVisW_itm) : (itmConX + itmConW);



  var itmY_itm = _itmBodyYReal(itm);

  var difX, difY;

  if (itm.dif.ubicacion === 'lateral') {

    if (!window._difLateralNextY) window._difLateralNextY = { left: null, right: null };
    var sideKey = itm.side;
    if (window._difLateralNextY[sideKey] !== null && window._difLateralNextY[sideKey] > itmY_itm) {
      difY = window._difLateralNextY[sideKey];
    } else {
      difY = itmY_itm;
    }
    window._difLateralNextY[sideKey] = difY + difVisH;
    if (!window._difLatY) window._difLatY = {};
    window._difLatY[itm.id] = difY;



    var refEdge = _anclaColumnaLateral(itm.side);

    if (refEdge !== null) {
      difX = (itm.side === 'left') ? (refEdge - difVisW - difGap) : (refEdge + difGap);
    } else {
      difX = (itm.side === 'left') ? (itmX_itm - difVisW - difGap) : (itmX_itm + itmVisW_itm + difGap);
    }

    if (itm.dif.tipo === 'reserva') {
      var difResv = document.createElement('div');
      difResv.className = 'dif-img itm-reserva dif-reserva';
      difResv.dataset.difItmId = itm.id;
      difResv.style.position = 'absolute';
      difResv.style.left = difX + 'px';
      difResv.style.top = difY + 'px';
      difResv.style.width = difVisW + 'px';
      difResv.style.height = difVisH + 'px';
      difResv.textContent = 'Reserva';
      difResv.style.zIndex = '6';
      container.appendChild(difResv);
    } else {
      var imgW = difNatW * scaleF;
      var imgH = difNatH * scaleF;
      var cx = difX + difVisW / 2;
      var cy = difY + difVisH / 2;
      var rot = itm.side === 'left' ? 90 : -90;
      var img = _crearImg('assets/panel-busbar/' + svgFile, cx - imgW / 2, cy - imgH / 2, imgW, imgH);
      img.style.transformOrigin = 'center center';
      img.style.transform = 'rotate(' + rot + 'deg)';
      img.dataset.difItmId = itm.id;
      img.className = 'dif-img';
      img.style.zIndex = '6';
      container.appendChild(img);
    }

  } else {

    var usarAis4f_d = _isAis4fDrawing(d);
    var aisW_d = usarAis4f_d ? 715 : 650;
    var aisH_d = usarAis4f_d ? 145 : 140;
    var _cmS_d = _buildCmConSet();
    var _cmRS_d = _buildCmRegConSet();
    var totalConH_d = getTotalConH(d.ciclo, _cmS_d, _cmRS_d);
    var aisInfY_d = CV_TOP_INNER + (window._igExtraTop || 0) + aisH_d + totalConH_d;
    var fila1Y = aisInfY_d + aisH_d + _difInfGapEff();

    difVisW = difNatW * scaleF;                                   
    difVisH = difNatH * scaleF;                             


    var lay = _layoutInferior();
    var miIdx = -1;
    for (var ei = 0; ei < lay.els.length; ei++) {
      if (lay.els[ei].kind === 'dif' && lay.els[ei].itm.id === itm.id) { miIdx = ei; break; }
    }
    var miFila = lay.filaDe[miIdx];
    var offsetX = 0;
    var rowIdxs = lay.filas[miFila];
    for (var di = 0; di < rowIdxs.length; di++) {
      if (rowIdxs[di] === miIdx) { offsetX = lay.filaOffX[miFila][di]; break; }
    }

    difX = (aisW_d - lay.filaW[miFila]) / 2 + offsetX;
    difY = fila1Y + lay.filaOffY[miFila];

    if (itm.dif.tipo === 'reserva') {
      var difResvInf = document.createElement('div');
      difResvInf.className = 'dif-img dif-inferior itm-reserva dif-reserva';
      difResvInf.dataset.difItmId = itm.id;
      difResvInf.dataset.difFila = miFila + 1;
      difResvInf.style.position = 'absolute';
      difResvInf.style.left = difX + 'px';
      difResvInf.style.top = difY + 'px';
      difResvInf.style.width = difVisW + 'px';
      difResvInf.style.height = difVisH + 'px';
      difResvInf.textContent = 'Reserva';
      difResvInf.style.zIndex = '6';
      container.appendChild(difResvInf);
    } else {
      var imgInf = _crearImg('assets/panel-busbar/' + svgFile, difX, difY, difVisW, difVisH);
      imgInf.dataset.difItmId = itm.id;
      imgInf.className = 'dif-img dif-inferior';
      imgInf.dataset.difFila = miFila + 1;
      imgInf.style.zIndex = '6';
      container.appendChild(imgInf);
    }

  }


  var rotulo = document.createElement('div');
  rotulo.className = 'itm-rotulo';
  rotulo.dataset.difItmId = itm.id;
  rotulo.style.position = 'absolute';
  rotulo.style.zIndex = '10';

  var badge = document.createElement('div');
  badge.className = 'itm-rotulo-badge';
  badge.textContent = _rotuloID(itm.rotulo, 'DIF');
  rotulo.appendChild(badge);

  if (itm.dif.ubicacion === 'lateral') {
    var triDifW_r = 45;
    if (itm.side === 'left') {
      rotulo.style.left = (difX - triDifW_r - 1 - 4) + 'px';
      rotulo.style.top = (difY + difVisH / 2) + 'px';
      rotulo.style.transform = 'translateX(-100%) translateY(-50%)';
    } else {
      rotulo.style.left = (difX + difVisW + 1 + triDifW_r + 4) + 'px';
      rotulo.style.top = (difY + difVisH / 2) + 'px';
      rotulo.style.transform = 'translateY(-50%)';
    }
  } else {
    rotulo.style.left = (difX + difVisW / 2) + 'px';
    rotulo.style.top = (difY + difVisH + 45 + 6) + 'px';
    rotulo.style.transform = 'translateX(-50%)';
    rotulo.style.textAlign = 'center';
  }
  container.appendChild(rotulo);



  if (itm.dif.ubicacion === 'lateral') {
    var triW2 = 45, triH2 = difVisH, triX2;
    var esRightDif = itm.side !== 'left';
    triX2 = esRightDif ? (difX + difVisW + 1) : (difX - triW2 - 1);

    var triSvgDif = itm.contactor ? 'boton_trian_verde.svg' : 'boton_trian_rojo.svg';
    var triDif = _crearImg('assets/panel-busbar/' + triSvgDif, triX2, difY, triW2, triH2);
    triDif.className = 'dif-img dif-tri' + (esRightDif ? ' tri-right' : '');
    triDif.dataset.difItmId = itm.id;
    triDif.style.zIndex = '6';
    triDif.style.cursor = 'pointer';
    triDif.addEventListener('click', function() { onDIFTriangleClick(this); });
    container.appendChild(triDif);
  } else {

    var triInfW = 45;
    var triInfH = difVisW;
    var triInfX = difX + difVisW / 2 - 22.5;
    var triInfY = difY + difVisH + 1 + 22.5 - difVisW / 2;
    var triSvgDifInf = itm.contactor ? 'boton_trian_verde.svg' : 'boton_trian_rojo.svg';
    var triInf = _crearImg('assets/panel-busbar/' + triSvgDifInf, triInfX, triInfY, triInfW, triInfH);
    triInf.className = 'dif-img dif-tri';
    triInf.dataset.difItmId = itm.id;
    triInf.style.zIndex = '6';
    triInf.style.cursor = 'pointer';
    triInf.style.transform = 'rotate(-90deg)';
    triInf.addEventListener('click', function() { onDIFTriangleClick(this); });
    container.appendChild(triInf);
  }
}


function onDIFTriangleClick(triImg) {
  var itmId = triImg.dataset.difItmId;
  if (!itmId) return;


  if (typeof _modoCopiaActivoContactor !== 'undefined' && _modoCopiaActivoContactor) {
    if (triImg.classList.contains('modo-copia-target')) {
      _insertarContactorCopia(triImg);
    }
    return;
  }

  var prev = document.getElementById('tri_context_menu');
  if (prev) prev.remove();
  _cerrarMenuTriangulo();

  var menu = document.createElement('div');
  menu.id = 'tri_context_menu';
  menu.className = 'dif-context-menu';

  var itmMenu = _buscarITM(itmId);



  var btnAgregarD = document.createElement('button');
  btnAgregarD.className = 'dif-context-btn';
  btnAgregarD.textContent = 'Agregar';
  btnAgregarD.addEventListener('click', function() {
    menu.remove();
    if (typeof abrirModalEquipo === 'function') abrirModalEquipo(itmId, 'dif');
  });
  menu.appendChild(btnAgregarD);

  var btnEditar = document.createElement('button');
  btnEditar.className = 'dif-context-btn';
  btnEditar.textContent = 'Editar';
  btnEditar.addEventListener('click', function() {
    menu.remove();
    if (itmMenu) abrirModalDIF(itmMenu.id);
  });
  menu.appendChild(btnEditar);


  if (itmMenu && itmMenu.dif && itmMenu.dif.ubicacion === 'inferior' && _hayVecinoEnFila(itmId, 'dif')) {
    var btnMoverD = document.createElement('button');
    btnMoverD.className = 'dif-context-btn';
    btnMoverD.textContent = 'Mover';
    btnMoverD.addEventListener('click', function() { menu.remove(); moverEnFila(itmId, 'dif'); });
    menu.appendChild(btnMoverD);
  }


  if (itmMenu && itmMenu.dif && _hayDestinosCopiaValidosDIF(itmMenu)) {
    var btnCopiarDIF = document.createElement('button');
    btnCopiarDIF.className = 'dif-context-btn';
    btnCopiarDIF.textContent = 'Copiar ' + _rotuloID(itmMenu.rotulo, 'DIF');
    btnCopiarDIF.addEventListener('click', function() {
      menu.remove();
      _activarModoCopiaDIF(itmId);
    });
    menu.appendChild(btnCopiarDIF);
  }


  if (itmMenu && itmMenu.dif && itmMenu.dif.ubicacion === 'inferior') {
    var infoM = _infoFilaInferior(itmMenu.id, 'dif');
    if (infoM && infoM.idx > 0 && (itmMenu.dif.salto || infoM.numFilas < 5)) {
      var btnSalto = document.createElement('button');
      btnSalto.className = 'dif-context-btn';
      if (itmMenu.dif.salto) {
        btnSalto.textContent = 'Quitar salto';
      } else {
        btnSalto.textContent = 'Saltar a F' + (infoM.fila + 2);
      }
      btnSalto.addEventListener('click', function() {
        menu.remove();
        _saltoFilaDIF(itmId);
      });
      menu.appendChild(btnSalto);
    }
  }

  var btnEliminar = document.createElement('button');
  btnEliminar.className = 'dif-context-btn';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.style.color = '#ff6b6b';
  btnEliminar.addEventListener('click', function() {
    menu.remove();
    _eliminarDIF(itmId);
  });
  menu.appendChild(btnEliminar);

  _abrirMenuTriangulo(menu, triImg);
}

function _saltoFilaDIF(itmId) {
  var itm = _buscarITM(itmId);
  if (!itm || !itm.dif || itm.dif.ubicacion !== 'inferior') return;

  var info = _infoFilaInferior(itmId, 'dif');
  if (!info || info.idx <= 0) return;                                        

  if (itm.dif.salto) {
    itm.dif.salto = false;
  } else {
    if (info.numFilas >= 5) return;                      
    itm.dif.salto = true;
  }

  _conReglas(function() {
    dibujarPanelBusbar();
    guardarSesion();
  });
}

function _saltoFilaContactor(itmId) {
  var itm = _buscarITM(itmId);
  if (!itm || !itm.contactor || itm.contactor.ubicacion !== 'inferior') return;

  var infoK = _infoFilaInferior(itmId, 'contactor');
  if (!infoK || infoK.idx <= 0 || infoK.forzado) return;

  if (itm.contactor.salto) {
    itm.contactor.salto = false;
  } else {
    if (infoK.numFilas >= 5) return;
    itm.contactor.salto = true;
  }

  _postCambioContactorPrep();
}

function _eliminarDIF(itmId) {
  var itm = _buscarITM(itmId);
  if (!itm || !itm.dif) return;
  delete itm.dif;



  _borrarHijosDe(itm, 'dif');
  if (window._CANALETAS_FILA && !(typeof _canaletaFilaTraspasar === 'function' &&
                                  _canaletaFilaTraspasar('dif:' + itmId))) {
    delete window._CANALETAS_FILA['dif:' + itmId];
  }
  _conReglas(function() {
    dibujarPanelBusbar();                                                            
    guardarSesion();
  });
}






var _modoCopiaActivoDIF = false;
var _modoCopiaITMSrc = null;


function _esTargetCopiaDIFValido(tri) {
  if (!tri || !tri.src || tri.src.indexOf('boton_trian_rojo') === -1) return false;
  var tid = tri.dataset.itmId;
  var titm = tid ? _buscarITM(tid) : null;
  if (!titm || titm.dif) return false;
  return _itmPuedeUsarDIF(titm);
}

function _hayDestinosCopiaValidosDIF(itmSrc) {
  if (!itmSrc || !itmSrc.dif) return false;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return false;
  var tris = container.querySelectorAll('.itm-tri');
  for (var i = 0; i < tris.length; i++) {
    if (_esTargetCopiaDIFValido(tris[i])) return true;
  }
  return false;
}

function _activarModoCopiaDIF(itmId) {
  var itm = _buscarITM(itmId);
  if (!itm || !itm.dif) return;
  _modoCopiaActivoDIF = true;
  _modoCopiaITMSrc = itm;
  _actualizarTargetsCopiaDIF();
  _mostrarHintCopiaDIF();
  document.addEventListener('keydown', _escModoCopiaDIF);
  setTimeout(function() {
    document.addEventListener('click', _clickFueraCopiaDIF);
  }, 50);
}

function _desactivarModoCopiaDIF() {
  _modoCopiaActivoDIF = false;
  _modoCopiaITMSrc = null;
  var container = document.getElementById('panel_busbar_container');
  if (container) {
    container.querySelectorAll('.modo-copia-target').forEach(function(el) {
      el.classList.remove('modo-copia-target');
    });
  }
  var hint = document.getElementById('modo_copia_hint');
  if (hint) hint.remove();
  document.removeEventListener('keydown', _escModoCopiaDIF);
  document.removeEventListener('click', _clickFueraCopiaDIF);
}

function _escModoCopiaDIF(e) {
  if (e.key === 'Escape') _desactivarModoCopiaDIF();
}

function _clickFueraCopiaDIF(e) {

  if (window._redibujoSafariEnCurso) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;

  var path = e.composedPath ? e.composedPath() : [];
  var dentro = container.contains(e.target) || path.indexOf(container) !== -1;
  if (!dentro) _desactivarModoCopiaDIF();
}

function _actualizarTargetsCopiaDIF() {
  if (!_modoCopiaITMSrc) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;
  container.querySelectorAll('.itm-tri').forEach(function(tri) {
    tri.classList.toggle('modo-copia-target', _esTargetCopiaDIFValido(tri));
  });
}

function _mostrarHintCopiaDIF() {
  var old = document.getElementById('modo_copia_hint');
  if (old) old.remove();
  var dif = _modoCopiaITMSrc.dif;
  var hint = document.createElement('div');
  hint.id = 'modo_copia_hint';
  var ubicTxt = dif.ubicacion === 'lateral' ? 'Lat' : 'Inf';
  var _specs = (dif.tipo === 'reserva')
    ? 'Reserva · ' + ubicTxt
    : (dif.sensibilidad + 'mA · ' + dif.corriente + 'A · ' + ubicTxt);
  hint.textContent = 'Click en un ITM libre para copiar DIF (' + _specs + ')  ·  ' + _txtSalir();
  document.body.appendChild(hint);
}

function _insertarDIFCopia(triDest) {
  if (!_modoCopiaITMSrc || !_modoCopiaITMSrc.dif) return;
  var itmId = triDest.dataset.itmId;
  var itm = itmId ? _buscarITM(itmId) : null;
  if (!itm || itm.dif) return;

  if (!_itmPuedeUsarDIF(itm)) return;

  var srcDIF = _modoCopiaITMSrc.dif;

  itm.dif = {
    ubicacion:    srcDIF.ubicacion,
    sensibilidad: srcDIF.sensibilidad,
    corriente:    srcDIF.corriente,
    polos:        (itm.polos <= 2) ? 2 : 4,
    tipo:         srcDIF.tipo || 'riel'
  };



  _conReglas(function() {
    dibujarPanelBusbar();

    _actualizarTargetsCopiaDIF();
    guardarSesion();
  });
}




function _redibujarTodosITMsYDIFs() {
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;

  container.querySelectorAll('.itm-img:not(.ig-img), .itm-rotulo:not(.ig-rotulo):not(.bornera-presencia-rotulo):not(.bornera-rotulo), .dif-img, [data-dif-itm-id], .dps-img, [data-dps-itm-id], .contactor-img, [data-contactor-itm-id]')
    .forEach(function(el) { el.remove(); });

  window._difLateralNextY = { left: null, right: null };
  window._contLateralNextY = { left: null, right: null };
  window._difLatY = {};


  window._itmList.forEach(function(itm) {
    _dibujarITM(itm);
    _marcarTriangulosOcupados(itm);
    if (itm.dif) {

      container.querySelectorAll('.itm-tri[data-itm-id="' + itm.id + '"]').forEach(function(tri) {
        tri.src = tri.src.replace('boton_trian_rojo', 'boton_trian_verde');
      });
    }
  });



  var _dibLat = function(side) {
    var lat = [];
    for (var i = 0; i < window._itmList.length; i++) {
      var it = window._itmList[i];
      if (it.side !== side) continue;
      if ((it.dif && it.dif.ubicacion === 'lateral') || _dpsEnColumna(it) ||
          (it.contactor && it.contactor.ubicacion === 'lateral')) lat.push(it);
    }
    lat.sort(function(a, b) { return parseFloat(a.conY) - parseFloat(b.conY); });
    for (var j = 0; j < lat.length; j++) {

      if (lat[j].dif && lat[j].dif.ubicacion === 'lateral') _dibujarDIF(lat[j]);
      if (lat[j].contactor && lat[j].contactor.ubicacion === 'lateral') _dibujarContactor(lat[j]);
      if (lat[j].dps && typeof _dibujarDPS === 'function') _dibujarDPS(lat[j]);
    }
  };
  _dibLat('left');
  _dibLat('right');


  for (var k = 0; k < window._itmList.length; k++) {
    var itk = window._itmList[k];
    if (itk.dif && itk.dif.ubicacion === 'inferior') _dibujarDIF(itk);
    if (itk.contactor && itk.contactor.ubicacion === 'inferior') _dibujarContactor(itk);
  }
}










var _dpsITMId = null;


var _DPS_DIMS = {
  2: { w: 175,   h: 415 },                     
  3: { w: 265,   h: 415 },                     
  4: { w: 354,   h: 415 }                      
};








function _dpsPolosSistema() {
  var d = window._panelBusbarData || {};
  if (d.fases === '1F+N' || d.fases === '2F') return [2];
  if (d.fases === '3F' || (d.fases === '3F+N' && d.subfases === 'R - S - T')) return [2, 3];
  return [2, 3, 4];
}
function _dpsPolosCircuito(itm) {
  var sis = _dpsPolosSistema(), max = sis[sis.length - 1];
  var p = parseInt(itm && itm.polos, 10) || 1;
  var n = (p >= 4) ? 4 : (p === 3 ? 3 : 2);
  return Math.min(n, max);
}


function _dpsAjustarAlITM(itm, polosAntes) {
  if (!itm || !itm.dps) return;
  if (parseInt(polosAntes, 10) === parseInt(itm.polos, 10)) return;
  itm.dps.polos = _dpsPolosCircuito(itm);
  var gr = (typeof _bornerasGrupoDeOrigen === 'function') ? _bornerasGrupoDeOrigen(itm.id, 'dps') : null;
  if (gr) gr.polos = itm.dps.polos;
}

function _dpsPolos(p) { p = parseInt(p, 10); return (p === 3 || p === 4) ? p : 2; }
function _dpsDims(polos) { return _DPS_DIMS[_dpsPolos(polos)]; }
function _dpsSrc(polos) { return 'assets/Aparamenta/DPS_' + _dpsPolos(polos) + 'p-vf.svg'; }

function _dpsAvisosTodos() {
  var out = [];
  var lista = (typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []);
  lista.forEach(function(it) {
    if (!it.dps) return;
    var av = _dpsAvisos(it.dps);
    if (av.length) out.push('DPS de ' + (it.rotulo || '') + ': ' + av.join('; '));
  });
  return out;
}


function _selectConValor(sel, val, txt) {
  if (!sel || val == null || val === '') return;
  var v = String(val);
  var hay = [].some.call(sel.options, function(o) { return o.value === v; });
  if (!hay) {
    var op = document.createElement('option');
    op.value = v; op.textContent = txt || v;
    sel.appendChild(op);
  }
  sel.value = v;
}



function onDPSTriangleClick(triImg) {
  var itmId = triImg.dataset.dpsItmId;
  if (!itmId) return;
  var prev = document.getElementById('tri_context_menu');
  if (prev) prev.remove();
  _cerrarMenuTriangulo();
  var menu = document.createElement('div');
  menu.id = 'tri_context_menu';
  menu.className = 'dif-context-menu';
  var bE = document.createElement('button');
  bE.className = 'dif-context-btn';
  bE.textContent = 'Editar';
  bE.addEventListener('click', function() { menu.remove(); abrirModalDPS(itmId); });
  menu.appendChild(bE);
  var bX = document.createElement('button');
  bX.className = 'dif-context-btn';
  bX.textContent = 'Eliminar';
  bX.style.color = '#ff6b6b';
  bX.addEventListener('click', function() { menu.remove(); _dpsITMId = itmId; quitarDPS(); });
  menu.appendChild(bX);
  _abrirMenuTriangulo(menu, triImg);
}

function abrirModalDPS(itmId) {
  _dpsITMId = itmId;
  var itm = _buscarITM(itmId);
  _pulseTri(_findItmTri(itmId));

  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalDPS_overlay').classList.add('activo');

  var sel = document.getElementById('modalDPS_polos');
  if (sel) {


    var _txtPol = { 2: '2P — 35 × 83 mm', 3: '3P — 53 × 83 mm', 4: '4P — 70.8 × 83 mm' };
    sel.innerHTML = _dpsPolosSistema().map(function(p) {
      return '<option value="' + p + '">' + _txtPol[p] + '</option>';
    }).join('');
    var _pGuard = itm && itm.dps && itm.dps.polos;
    _selectConValor(sel, _pGuard || _dpsPolosCircuito(itm), _pGuard ? (_txtPol[_pGuard] || (_pGuard + 'P')) : null);
  }
  var _od = _dpsDatos(itm && itm.dps);
  [['tipo', _od.tipo], ['uc', _od.uc], ['imax', _od.imax], ['iimp', _od.iimp],
   ['up', _od.up], ['isc', _od.isc]].forEach(function(p) {
    var e = document.getElementById('modalDPS_' + p[0]);
    if (!e) return;
    if (e.tagName === 'SELECT') _selectConValor(e, p[1]);
    else e.value = String(p[1]);
  });
  _dpsMostrarCampos();


  var _itmEsLibD = !!(itm && itm.libre);
  document.querySelectorAll('#modalDPS_ubicacion .seg-btn').forEach(function(b) {
    var soloLibre = _itmEsLibD && b.dataset.val !== 'libre';
    b.disabled = soloLibre;
    b.style.display = soloLibre ? 'none' : '';
  });
  setDPSUbicacion(_itmEsLibD ? 'libre'
    : ((itm && itm.dps && itm.dps.ubicacion) || 'lateral'));
  var btnQ = document.getElementById('modalDPS_btnQuitar');
  if (btnQ) btnQ.style.display = (itm && itm.dps) ? '' : 'none';
  var btnC = document.getElementById('modalDPS_btnConfirmar');
  if (btnC) btnC.textContent = (itm && itm.dps) ? "Guardar cambios" : 'Crear';
}







var _DPS_UC = [275, 320, 385, 440], _DPS_ISC = [10, 25, 50];
function _dpsNumeros(txt) {
  return (String(txt || '').replace(',', '.').match(/\d+(?:\.\d+)?/g) || []).map(parseFloat);
}
function _dpsFicha() {
  return (typeof _fichaDatos === 'function') ? _fichaDatos() : { tension: '380 / 220 V', icc: '10 kA' };
}

function _dpsUo() {
  var n = _dpsNumeros(_dpsFicha().tension).filter(function(v) { return v >= 50; });
  return n.length ? Math.min.apply(null, n) : 220;
}
function _dpsIcc() {
  var n = _dpsNumeros(_dpsFicha().icc);
  return n.length ? n[0] : 10;
}
function _dpsPrimeroQueCubre(lista, min) {
  for (var i = 0; i < lista.length; i++) if (lista[i] >= min - 1e-9) return lista[i];
  return lista[lista.length - 1];
}
function _dpsDefectos() {
  return { tipo: 'T2', uc: _dpsPrimeroQueCubre(_DPS_UC, 1.1 * _dpsUo()),
           imax: 40, iimp: 12.5, up: 1.5, isc: _dpsPrimeroQueCubre(_DPS_ISC, _dpsIcc()) };
}

function _dpsDatos(dps) {
  var d = _dpsDefectos(), o = {};
  Object.keys(d).forEach(function(k) {
    o[k] = (dps && dps[k] != null && dps[k] !== '') ? dps[k] : d[k];
  });
  o.polos = (dps && dps.polos) || 2;
  return o;
}
function _dpsLlevaIimp(tipo) { return tipo === 'T1' || tipo === 'T1+T2'; }
function _dpsLlevaImax(tipo) { return tipo !== 'T1'; }
function _dpsTipoTxt(tipo) { return { T1: 'Tipo 1', 'T1+T2': 'Tipo 1+2', T2: 'Tipo 2', T3: 'Tipo 3' }[tipo] || tipo; }

function _dpsCorrienteKa(o) { return _dpsLlevaIimp(o.tipo) ? o.iimp : o.imax; }

function _dpsDesc(dps) {
  var o = _dpsDatos(dps);
  var partes = [_dpsTipoTxt(o.tipo), 'Uc ' + o.uc + ' V'];
  if (_dpsLlevaIimp(o.tipo)) partes.push('Iimp ' + o.iimp + ' kA');
  if (_dpsLlevaImax(o.tipo)) partes.push('Imax ' + o.imax + ' kA');
  partes.push('Up ≤ ' + o.up + ' kV', 'Icc ' + o.isc + ' kA');
  return 'DPS ' + o.polos + 'P ' + partes.join(' · ');
}

function _dpsAvisos(dps) {
  var o = _dpsDatos(dps), out = [];
  var ucMin = 1.1 * _dpsUo();
  if (o.uc < ucMin - 1e-9) out.push('Uc ' + o.uc + ' V es menor que 1.1 × ' + _dpsUo() + ' V (' + Math.ceil(ucMin) + ' V)');
  if (o.isc < _dpsIcc() - 1e-9) out.push('su capacidad de cortocircuito (' + o.isc + ' kA) es menor que la Icc del tablero (' + _dpsIcc() + ' kA)');
  return out;
}
function _dpsMostrarCampos() {
  var t = (document.getElementById('modalDPS_tipo') || {}).value || 'T2';
  document.querySelectorAll('#modalDPS_overlay [data-dps="iimp"]').forEach(function(e) {
    e.style.display = _dpsLlevaIimp(t) ? '' : 'none';
  });
  document.querySelectorAll('#modalDPS_overlay [data-dps="imax"]').forEach(function(e) {
    e.style.display = _dpsLlevaImax(t) ? '' : 'none';
  });
}

function setDPSUbicacion(val) {
  document.querySelectorAll('#modalDPS_ubicacion .seg-btn').forEach(function(btn) {
    btn.classList.toggle('activo', btn.dataset.val === val);
  });
}

function cerrarModalDPS() {
  document.getElementById('modalDPS_overlay').classList.remove('activo');
  _unpulseTri(_findItmTri(_dpsITMId));
  _unpulseTodos();
  _dpsITMId = null;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'none';
}

function confirmarModalDPS() {
  var itm = _buscarITM(_dpsITMId);
  if (!itm) { cerrarModalDPS(); return; }
  var sel = document.getElementById('modalDPS_polos');
  var ubicBtnD = document.querySelector('#modalDPS_ubicacion .seg-btn.activo');
  var _ubicD = (ubicBtnD && ubicBtnD.dataset.val) || 'lateral';
  if (itm.libre) _ubicD = 'libre';
  var _dpsPrevio = itm.dps ? JSON.parse(JSON.stringify(itm.dps)) : null;
  var _vD = function(id) { var e = document.getElementById('modalDPS_' + id); return e ? e.value : ''; };
  var _tipoD = _vD('tipo') || 'T2';



  var _defD = _dpsDefectos();
  var _ucD = parseFloat(_vD('uc')) || null, _iscD = parseFloat(_vD('isc')) || null;
  if (_ucD === _defD.uc) _ucD = null;
  if (_iscD === _defD.isc) _iscD = null;
  itm.dps = { polos: parseInt(sel ? sel.value : '2', 10) || 2,
              ubicacion: _ubicD,
              padre: _padreEquipo(itm.dps, 'itm'),
              tipo: _tipoD,
              uc: _ucD,
              up: parseFloat(_vD('up')) || null,
              isc: _iscD };

  if (_dpsLlevaImax(_tipoD)) itm.dps.imax = parseFloat(_vD('imax')) || null;
  if (_dpsLlevaIimp(_tipoD)) itm.dps.iimp = parseFloat(_vD('iimp')) || null;
  var _avD = _dpsAvisos(itm.dps);
  if (_avD.length && typeof _avisoFlotante === 'function') {
    _avisoFlotante('DPS de ' + (itm.rotulo || '') + ': ' + _avD.join('; ') + '.');
  }
  cerrarModalDPS();
  var _refrescarDPS = function() {

    dibujarPanelBusbar();
    if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
    if (typeof _renderListaCircuitos === 'function') _renderListaCircuitos();
    guardarSesion();
  };



  var _grD = (typeof _bornerasGrupoDeOrigen === 'function')
    ? _bornerasGrupoDeOrigen(itm.id, 'dps') : null;
  if (_ubicD === 'libre') {
    if (_grD) {
      _grD.polos = itm.dps.polos;                                        
      _refrescarDPS();
    } else if (itm.libre && typeof _grupoDelItmLibre === 'function' &&
               _grupoDelItmLibre(itm.id)) {

      _encadenarJuntoAlItmLibre(itm.id, 'dps', { polos: itm.dps.polos });
      _refrescarDPS();
    } else {
      window._bornEsperandoLugar = true;
      _refrescarDPS();
      if (typeof iniciarUbicacionBorneras === 'function') {
        iniciarUbicacionBorneras(itm.id, 'dps', function() {



          if (_dpsPrevio) itm.dps = _dpsPrevio;
          else delete itm.dps;
          _refrescarDPS();
        });
      }
    }
    return;
  }

  if (_grD && typeof _bornerasBorrarClaseDe === 'function') {
    _bornerasBorrarClaseDe(itm.id, 'dps');
  }
  _refrescarDPS();
}

function quitarDPS() {
  var itm = _buscarITM(_dpsITMId);
  if (itm) {
    delete itm.dps;
    if (typeof _bornerasBorrarClaseDe === 'function') _bornerasBorrarClaseDe(itm.id, 'dps');
  }
  cerrarModalDPS();
  dibujarPanelBusbar();
  if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
  if (typeof _renderListaCircuitos === 'function') _renderListaCircuitos();
  guardarSesion();
}


function _dibujarDPS(itm) {
  if (!itm.dps) return;

  if (itm.dps.ubicacion === 'libre') return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;

  var d = window._panelBusbarData;
  var conH = 90;
  var dims = _dpsDims(itm.dps.polos);
  var dpsVisW = dims.h;                                                 
  var dpsVisH = dims.w;                                                 

  var gap = (itm.side === 'left') ? DIF_ITM_GAP_LEFT_PX : DIF_ITM_GAP_RIGHT_PX;

  var itmConX = parseFloat(itm.conX);
  var itmConW = parseFloat(itm.conW);
  var itmVisW_itm = 425;
  var itmX_itm = (itm.side === 'left') ? (itmConX - itmVisW_itm) : (itmConX + itmConW);
  var itmY_itm = _itmBodyYReal(itm);                             


  if (!window._difLateralNextY) window._difLateralNextY = { left: null, right: null };
  var sideKey = itm.side;
  var dpsY;
  if (window._difLateralNextY[sideKey] !== null && window._difLateralNextY[sideKey] > itmY_itm) {
    dpsY = window._difLateralNextY[sideKey];
  } else {
    dpsY = itmY_itm;
  }
  window._difLateralNextY[sideKey] = dpsY + dpsVisH;


  var refEdge = _anclaColumnaLateral(itm.side);

  var dpsX;
  if (refEdge !== null) {
    dpsX = (itm.side === 'left') ? (refEdge - dpsVisW - gap) : (refEdge + gap);
  } else {
    dpsX = (itm.side === 'left') ? (itmX_itm - dpsVisW - gap) : (itmX_itm + itmVisW_itm + gap);
  }


  var cx = dpsX + dpsVisW / 2;
  var cy = dpsY + dpsVisH / 2;
  var rot = itm.side === 'left' ? 90 : -90;
  var img = _crearImg(_dpsSrc(itm.dps.polos),
    cx - dims.w / 2, cy - dims.h / 2, dims.w, dims.h);
  img.style.transformOrigin = 'center center';
  img.style.transform = 'rotate(' + rot + 'deg)';
  img.dataset.dpsItmId = itm.id;
  img.className = 'dps-img';
  img.style.zIndex = '6';
  container.appendChild(img);



  var rotulo = document.createElement('div');
  rotulo.className = 'itm-rotulo';
  rotulo.dataset.dpsItmId = itm.id;
  rotulo.style.position = 'absolute';
  rotulo.style.zIndex = '10';
  var badge = document.createElement('div');
  badge.className = 'itm-rotulo-badge';
  badge.textContent = 'DPS';
  rotulo.appendChild(badge);



  var _triWd = 45;
  var _esDerD = itm.side !== 'left';
  var triD = _crearImg('assets/panel-busbar/boton_trian_rojo.svg',
    _esDerD ? (dpsX + dpsVisW + 1) : (dpsX - _triWd - 1), dpsY, _triWd, dpsVisH);
  triD.className = 'dps-img dps-tri' + (_esDerD ? ' tri-right' : '');
  triD.dataset.dpsItmId = itm.id;
  triD.style.zIndex = '6';
  triD.style.cursor = 'pointer';
  triD.addEventListener('click', function() { onDPSTriangleClick(this); });
  container.appendChild(triD);

  var triDifW_p = 45;
  if (itm.side === 'left') {
    rotulo.style.left = (dpsX - triDifW_p - 1 - 4) + 'px';
    rotulo.style.top = (dpsY + dpsVisH / 2) + 'px';
    rotulo.style.transform = 'translateX(-100%) translateY(-50%)';
  } else {
    rotulo.style.left = (dpsX + dpsVisW + 1 + triDifW_p + 4) + 'px';
    rotulo.style.top = (dpsY + dpsVisH / 2) + 'px';
    rotulo.style.transform = 'translateY(-50%)';
  }
  container.appendChild(rotulo);
}












var _contactorITMId = null;



var _CONTACTOR_MODELOS = [
  { hasta: 18, src: 'assets/Aparamenta/Contactor_9A_18A-vf.svg',  w: 225, h: 385 },
  { hasta: 38, src: 'assets/Aparamenta/Contactor_25A_38A-vf.svg', w: 225, h: 425 }
];

function _contactorModelo(capacidad) {
  var cap = parseInt(capacidad, 10) || 9;
  for (var i = 0; i < _CONTACTOR_MODELOS.length; i++) {
    if (cap <= _CONTACTOR_MODELOS[i].hasta) return _CONTACTOR_MODELOS[i];
  }
  return _CONTACTOR_MODELOS[_CONTACTOR_MODELOS.length - 1];
}







var _CONTACTOR_CATALOGO = [
  { cuerpo: 9,  kw: 4,    ith: 25 },
  { cuerpo: 12, kw: 5.5,  ith: 25 },
  { cuerpo: 18, kw: 7.5,  ith: 32 },
  { cuerpo: 25, kw: 11,   ith: 40 },
  { cuerpo: 32, kw: 15,   ith: 50 },
  { cuerpo: 38, kw: 18.5, ith: 50 }
];
function _contactorCategoria(c) {
  return (c && c.categoria === 'AC1') ? 'AC1' : 'AC3';
}
function _contactorFicha(cuerpo) {
  var cap = parseInt(cuerpo, 10) || 9;
  for (var i = 0; i < _CONTACTOR_CATALOGO.length; i++) {
    if (_CONTACTOR_CATALOGO[i].cuerpo === cap) return _CONTACTOR_CATALOGO[i];
  }
  return { cuerpo: cap, kw: null, ith: cap };
}

function _contactorCorriente(c) {
  var f = _contactorFicha(c && c.capacidad);
  return _contactorCategoria(c) === 'AC1' ? f.ith : f.cuerpo;
}

function _contactorTxt(c) {
  return _contactorCorriente(c) + 'A ' + (_contactorCategoria(c) === 'AC1' ? 'AC-1' : 'AC-3');
}




function _contactorDesc(c, largo) {
  if (c && c.reserva) return largo ? 'Reserva para contactor' : 'Contactor (reserva)';
  if (largo) return 'Contactor electromagnético ' + _contactorCorriente(c) + ' A ' +
                    (_contactorCategoria(c) === 'AC1' ? 'AC-1' : 'AC-3');
  return 'Contactor ' + _contactorTxt(c);
}

function _ubicTxt(u) {
  return u === 'inferior' ? 'Inf' : (u === 'libre' ? 'Libre' : 'Lat');
}

function _contactorCfgGrupo(c) {
  return { capacidad: c.capacidad, categoria: _contactorCategoria(c), reserva: !!c.reserva };
}
function _contactorAplicarAGrupo(gr, c) {
  if (!gr || !c) return;
  var cfg = _contactorCfgGrupo(c);
  gr.capacidad = cfg.capacidad;
  gr.categoria = cfg.categoria;
  if (cfg.reserva) gr.reserva = true; else delete gr.reserva;
}



function _contactorLlenarCapacidad(cat, cuerpoActual) {
  var sel = document.getElementById('modalContactor_capacidad');
  if (!sel) return;
  var html = '', vistos = {}, elegido = null;
  var actual = _contactorFicha(cuerpoActual);
  _CONTACTOR_CATALOGO.forEach(function(f) {
    if (cat === 'AC1') {
      if (vistos[f.ith]) return;
      vistos[f.ith] = true;

      var cu = (f.ith === actual.ith) ? actual.cuerpo : f.cuerpo;
      html += '<option value="' + cu + '">' + f.ith + ' A</option>';
      if (f.ith === actual.ith) elegido = cu;
    } else {
      html += '<option value="' + f.cuerpo + '">' + f.cuerpo + ' A</option>';
      if (f.cuerpo === actual.cuerpo) elegido = f.cuerpo;
    }
  });


  if (elegido === null && cuerpoActual && parseInt(cuerpoActual, 10)) {
    var _cu0 = parseInt(cuerpoActual, 10);
    html += '<option value="' + _cu0 + '">' + _cu0 + ' A</option>';
    elegido = _cu0;
  }
  sel.innerHTML = html;
  sel.value = String(elegido !== null ? elegido : _CONTACTOR_CATALOGO[0].cuerpo);
}
function setContactorCategoria(cat) {
  document.querySelectorAll('#modalContactor_categoria .seg-btn').forEach(function(btn) {
    btn.classList.toggle('activo', btn.dataset.val === cat);
  });
  var sel = document.getElementById('modalContactor_capacidad');
  _contactorLlenarCapacidad(cat, sel && sel.value ? sel.value : 9);
}


function abrirModalContactor(itmId) {
  _contactorITMId = itmId;
  var itm = _buscarITM(itmId);
  _pulseTri(itm && itm.contactor ? _findContactorTri(itmId) : _findItmTri(itmId));

  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalContactor_overlay').classList.add('activo');

  var _catC = _contactorCategoria(itm && itm.contactor);
  document.querySelectorAll('#modalContactor_categoria .seg-btn').forEach(function(btn) {
    btn.classList.toggle('activo', btn.dataset.val === _catC);
  });
  _contactorLlenarCapacidad(_catC, (itm && itm.contactor && itm.contactor.capacidad) || 9);


  var _itmEsLib = !!(itm && itm.libre);
  document.querySelectorAll('#modalContactor_ubicacion .seg-btn').forEach(function(b) {
    var soloLibre = _itmEsLib && b.dataset.val !== 'libre';
    b.disabled = soloLibre;
    b.style.display = soloLibre ? 'none' : '';
  });
  setContactorUbicacion(_itmEsLib ? 'libre'
    : ((itm && itm.contactor && itm.contactor.ubicacion) || 'lateral'));
  var chkR = document.getElementById('modalContactor_reserva');
  if (chkR) chkR.checked = !!(itm && itm.contactor && itm.contactor.reserva);
  var btnQ = document.getElementById('modalContactor_btnQuitar');
  if (btnQ) btnQ.style.display = (itm && itm.contactor) ? '' : 'none';
  var btnC = document.getElementById('modalContactor_btnConfirmar');
  if (btnC) btnC.textContent = (itm && itm.contactor) ? "Guardar cambios" : 'Crear';
}

function cerrarModalContactor() {
  document.getElementById('modalContactor_overlay').classList.remove('activo');
  _unpulseTri(_findItmTri(_contactorITMId));
  _unpulseTri(_findContactorTri(_contactorITMId));
  _unpulseTodos();
  _contactorITMId = null;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'none';
}

function setContactorUbicacion(val) {
  document.querySelectorAll('#modalContactor_ubicacion .seg-btn').forEach(function(btn) {
    btn.classList.toggle('activo', btn.dataset.val === val);
  });
}




function _col1WLado(side) {
  var w = 0;
  (window._itmList || []).forEach(function(i) {
    if (i.side !== side) return;
    var difLat = i.dif && i.dif.ubicacion === 'lateral';
    if (difLat) w = Math.max(w, DIF_VIS_W_PX);
    if (_dpsEnColumna(i)) w = Math.max(w, _DPS_DIMS[2].h);
    if (i.contactor && i.contactor.ubicacion === 'lateral' && !difLat) {
      w = Math.max(w, _contactorModelo(i.contactor.capacidad).h);
    }
  });
  return w;
}




function _col2WLado(side) {
  var w = 0;
  (window._itmList || []).forEach(function(i) {
    if (i.side !== side || !(i.dif && i.dif.ubicacion === 'lateral')) return;
    if (i.contactor && i.contactor.ubicacion === 'lateral') {
      w = Math.max(w, _contactorModelo(i.contactor.capacidad).h);
    }
  });
  return w;
}





function _colLatBordeExterno(side) {
  var ancla = _anclaColumnaLateral(side);
  if (ancla === null) return null;
  var izq = side === 'left';
  var w = (izq ? DIF_ITM_GAP_LEFT_PX : DIF_ITM_GAP_RIGHT_PX) + _col1WLado(side);
  var w2 = _col2WLado(side);
  if (w2) w += (izq ? CONT_DIF_GAP_LEFT_PX : CONT_DIF_GAP_RIGHT_PX) + w2;
  return izq ? ancla - w : ancla + w;
}

function _postCambioContactor() {
  dibujarPanelBusbar();
  if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
  if (typeof _renderListaCircuitos === 'function') _renderListaCircuitos();
  guardarSesion();
}



function _postCambioContactorPrep(despues) {
  _conReglas(function() {
    _postCambioContactor();
    if (despues) despues();
  });
}

function confirmarModalContactor() {
  var itm = _buscarITM(_contactorITMId);
  if (!itm) { cerrarModalContactor(); return; }
  var sel = document.getElementById('modalContactor_capacidad');
  var ubicBtn = document.querySelector('#modalContactor_ubicacion .seg-btn.activo');
  var _ubicNueva = (ubicBtn && ubicBtn.dataset.val) || 'lateral';
  var _ubicPrevia = itm.contactor && itm.contactor.ubicacion;


  var _contPrevio = itm.contactor ? JSON.parse(JSON.stringify(itm.contactor)) : null;
  var _chkR = document.getElementById('modalContactor_reserva');
  var _catBtn = document.querySelector('#modalContactor_categoria .seg-btn.activo');
  itm.contactor = {
    capacidad: parseInt(sel ? sel.value : '9', 10) || 9,
    categoria: (_catBtn && _catBtn.dataset.val === 'AC1') ? 'AC1' : 'AC3',
    ubicacion: _ubicNueva,
    reserva: !!(_chkR && _chkR.checked),

    salto: !!(itm.contactor && itm.contactor.salto && itm.contactor.ubicacion === _ubicNueva),
    padre: _padreEquipo(itm.contactor, 'itm')
  };
  cerrarModalContactor();


  var _grLibre = (typeof _bornerasGrupoDeOrigen === 'function')
    ? _bornerasGrupoDeOrigen(itm.id, 'contactor') : null;
  if (_ubicNueva === 'libre') {
    if (_grLibre) {

      _contactorAplicarAGrupo(_grLibre, itm.contactor);
      _postCambioContactor();
    } else if (itm.libre && typeof _grupoDelItmLibre === 'function' &&
               _grupoDelItmLibre(itm.id)) {

      _encadenarJuntoAlItmLibre(itm.id, 'contactor', _contactorCfgGrupo(itm.contactor));
      _postCambioContactor();
    } else {
      window._bornEsperandoLugar = true;                                       
      _postCambioContactor();
      if (typeof iniciarUbicacionBorneras === 'function') {
        iniciarUbicacionBorneras(itm.id, 'contactor', function() {



          if (_contPrevio && _contPrevio.ubicacion !== 'libre') itm.contactor = _contPrevio;
          else _quitarContactor(itm);
          _postCambioContactor();
        });
      }
    }
    return;
  }

  if (_grLibre && typeof _bornerasBorrarClaseDe === 'function') {
    _bornerasBorrarClaseDe(itm.id, 'contactor');
  }
  void _ubicPrevia;
  _postCambioContactorPrep();
}










function _canaletaQuitarFilaContactor(id) {
  if (!window._CANALETAS_FILA || !window._CANALETAS_FILA['cont:' + id]) return;

  if (typeof _canaletaFilaTraspasar === 'function' && _canaletaFilaTraspasar('cont:' + id)) return;
  if (typeof _canaletaBorrarRef === 'function') _canaletaBorrarRef('fila:cont:' + id);
  else delete window._CANALETAS_FILA['cont:' + id];
}

function _quitarContactor(itm, sinGrupos) {
  if (!itm || !itm.contactor) return false;
  _borrarHijosDe(itm, 'contactor');
  delete itm.contactor;
  if (!sinGrupos && typeof _bornerasBorrarTimersDe === 'function') _bornerasBorrarTimersDe(itm.id);
  _canaletaQuitarFilaContactor(itm.id);
  if (_modoCopiaActivoContactor && _modoCopiaContactorSrc && _modoCopiaContactorSrc.id === itm.id) {
    _desactivarModoCopiaContactor();
  }

  if (_modoCopiaActivoPulsador && _modoCopiaPulsadorSrc && _modoCopiaPulsadorSrc.id === itm.id) {
    _desactivarModoCopiaPulsador();
  }

  if (_modoCopiaActivoGrupo && _modoCopiaGrupoSrc && _modoCopiaGrupoSrc.id === itm.id) {
    _desactivarModoCopiaGrupo();
  }
  _pulsLimpiarSaltoPrimero();
  return true;
}

function quitarContactor() {
  var itm = _buscarITM(_contactorITMId);
  if (itm) _quitarContactor(itm);
  cerrarModalContactor();
  _postCambioContactorPrep();
}



function _dibujarContactor(itm) {
  if (!itm.contactor) return;

  if (itm.contactor.ubicacion === 'libre') return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;

  var d = window._panelBusbarData;
  var conH = 90;
  var _mod = _contactorModelo(itm.contactor.capacidad);
  var natW = _mod.w;                                                
  var natH = _mod.h;                                                
  var conX, conY, visW, visH;
  var _altoFilaK = 0;                                                     

  if (itm.contactor.ubicacion === 'lateral') {
    visW = natH;                                            
    visH = natW;                                            
    var gap = (itm.side === 'left') ? DIF_ITM_GAP_LEFT_PX : DIF_ITM_GAP_RIGHT_PX;

    var itmConX = parseFloat(itm.conX);
    var itmConW = parseFloat(itm.conW);
    var itmVisW_itm = 425;
    var itmX_itm = (itm.side === 'left') ? (itmConX - itmVisW_itm) : (itmConX + itmConW);
    var itmY_itm = _itmBodyYReal(itm);                             

    var sideKey = itm.side;
    var refEdge = _anclaColumnaLateral(itm.side);
    var tieneDifLat = itm.dif && itm.dif.ubicacion === 'lateral';

    if (tieneDifLat) {


      var baseY = (window._difLatY && typeof window._difLatY[itm.id] === 'number')
        ? window._difLatY[itm.id] : itmY_itm;
      if (!window._contLateralNextY) window._contLateralNextY = { left: null, right: null };
      if (window._contLateralNextY[sideKey] !== null && window._contLateralNextY[sideKey] > baseY) {
        conY = window._contLateralNextY[sideKey];
      } else {
        conY = baseY;
      }
      window._contLateralNextY[sideKey] = conY + visH;

      var col1W = _col1WLado(itm.side);
      var contGap = (itm.side === 'left') ? CONT_DIF_GAP_LEFT_PX : CONT_DIF_GAP_RIGHT_PX;
      var col1Outer;
      if (refEdge !== null) {
        col1Outer = (itm.side === 'left') ? (refEdge - gap - col1W) : (refEdge + gap + col1W);
      } else {
        col1Outer = (itm.side === 'left') ? (itmX_itm - gap - col1W) : (itmX_itm + itmVisW_itm + gap + col1W);
      }
      conX = (itm.side === 'left') ? (col1Outer - contGap - visW) : (col1Outer + contGap);
    } else {


      if (!window._difLateralNextY) window._difLateralNextY = { left: null, right: null };
      if (window._difLateralNextY[sideKey] !== null && window._difLateralNextY[sideKey] > itmY_itm) {
        conY = window._difLateralNextY[sideKey];
      } else {
        conY = itmY_itm;
      }
      window._difLateralNextY[sideKey] = conY + visH;

      if (refEdge !== null) {
        conX = (itm.side === 'left') ? (refEdge - visW - gap) : (refEdge + gap);
      } else {
        conX = (itm.side === 'left') ? (itmX_itm - visW - gap) : (itmX_itm + itmVisW_itm + gap);
      }
    }

    var cx = conX + visW / 2;
    var cy = conY + visH / 2;
    if (itm.contactor.reserva) {



      var resvK = document.createElement('div');
      resvK.className = 'contactor-img itm-reserva';
      resvK.dataset.contactorItmId = itm.id;
      resvK.style.cssText = 'position:absolute;left:' + conX + 'px;top:' + conY +
        'px;width:' + visW + 'px;height:' + visH + 'px;z-index:6;';
      resvK.textContent = 'Reserva';
      container.appendChild(resvK);
    } else {
      var rot = itm.side === 'left' ? 90 : -90;
      var img = _crearImg(_mod.src, cx - natW / 2, cy - natH / 2, natW, natH);
      img.style.transformOrigin = 'center center';
      img.style.transform = 'rotate(' + rot + 'deg)';
      img.dataset.contactorItmId = itm.id;
      img.className = 'contactor-img';
      img.style.zIndex = '6';
      container.appendChild(img);
    }

  } else {

    visW = natW; visH = natH;
    var usarAis4f_c = _isAis4fDrawing(d);
    var aisW_c = usarAis4f_c ? 715 : 650;
    var aisH_c = usarAis4f_c ? 145 : 140;
    var _cmS_c = _buildCmConSet();
    var _cmRS_c = _buildCmRegConSet();
    var totalConH_c = getTotalConH(d.ciclo, _cmS_c, _cmRS_c);
    var aisInfY_c = CV_TOP_INNER + (window._igExtraTop || 0) + aisH_c + totalConH_c;
    var fila1Y_c = aisInfY_c + aisH_c + _difInfGapEff();

    var lay = _layoutInferior();
    var miIdx = -1;
    for (var ei = 0; ei < lay.els.length; ei++) {
      if (lay.els[ei].kind === 'contactor' && lay.els[ei].itm.id === itm.id) { miIdx = ei; break; }
    }
    if (miIdx === -1) return;
    var miFila = lay.filaDe[miIdx];
    var offX = 0;
    var rowIdxs = lay.filas[miFila];
    for (var ri = 0; ri < rowIdxs.length; ri++) {
      if (rowIdxs[ri] === miIdx) { offX = lay.filaOffX[miFila][ri]; break; }
    }
    conX = (aisW_c - lay.filaW[miFila]) / 2 + offX;
    conY = fila1Y_c + lay.filaOffY[miFila];
    _altoFilaK = lay.filaH[miFila] || natH;

    if (itm.contactor.reserva) {

      var resvKI = document.createElement('div');
      resvKI.className = 'contactor-img contactor-inferior itm-reserva itm-reserva-v';
      resvKI.dataset.contactorItmId = itm.id;
      resvKI.style.cssText = 'position:absolute;left:' + conX + 'px;top:' + conY +
        'px;width:' + natW + 'px;height:' + natH + 'px;z-index:6;';
      resvKI.textContent = 'Reserva';
      container.appendChild(resvKI);
    } else {
      var imgInf = _crearImg(_mod.src, conX, conY, natW, natH);
      imgInf.dataset.contactorItmId = itm.id;
      imgInf.className = 'contactor-img contactor-inferior';
      imgInf.style.zIndex = '6';
      container.appendChild(imgInf);
    }
  }




  var rotulo = document.createElement('div');
  rotulo.className = 'itm-rotulo';
  rotulo.dataset.contactorItmId = itm.id;
  rotulo.style.position = 'absolute';
  rotulo.style.zIndex = '10';
  var badge = document.createElement('div');
  badge.className = 'itm-rotulo-badge';
  badge.textContent = _rotuloK(itm.rotulo);
  rotulo.appendChild(badge);

  if (itm.contactor.ubicacion === 'lateral') {
    var triW_c = 45;
    if (itm.side === 'left') {
      rotulo.style.left = (conX - triW_c - 1 - 4) + 'px';
      rotulo.style.top = (conY + visH / 2) + 'px';
      rotulo.style.transform = 'translateX(-100%) translateY(-50%)';
    } else {
      rotulo.style.left = (conX + visW + 1 + triW_c + 4) + 'px';
      rotulo.style.top = (conY + visH / 2) + 'px';
      rotulo.style.transform = 'translateY(-50%)';
    }
  } else {
    rotulo.style.left = (conX + visW / 2) + 'px';
    rotulo.style.top = (conY + (_altoFilaK || visH) + 45 + 6) + 'px';
    rotulo.style.transform = 'translateX(-50%)';
    rotulo.style.textAlign = 'center';
  }
  container.appendChild(rotulo);



  var _cuelga = [];
  if (itm.pulsador) _cuelga.push('Pulsador');
  if (typeof _bornerasGrupoDeOrigen === 'function') {
    if (_bornerasGrupoDeOrigen(itm.id, 'bornera')) _cuelga.push('Bornera');
    if (_bornerasGrupoDeOrigen(itm.id, 'timer')) _cuelga.push('Timer');
  }
  if (_cuelga.length) {


    rotulo.style.flexDirection = 'column';





    rotulo.style.alignItems = 'stretch';



    rotulo.style.gap = '0';


    badge.style.borderBottomLeftRadius = '0';
    badge.style.borderBottomRightRadius = '0';
    badge.style.borderBottomWidth = '0';


    var _wK = _anchoBadgeRotulo(badge.textContent);
    var _fs = (typeof _fontRotuloGrupo === 'function')
      ? _fontRotuloGrupo(_cuelga, _wK - 10, 30) : 24;
    _cuelga.forEach(function(t) {
      var chip = document.createElement('div');
      chip.className = 'itm-rotulo-sub';
      chip.textContent = t;
      chip.style.fontSize = _fs + 'px';
      rotulo.appendChild(chip);
    });
  }



  if (itm.contactor.ubicacion === 'lateral') {
    var triW_t = 45;
    var esRight_t = itm.side !== 'left';
    var triX_t = esRight_t ? (conX + visW + 1) : (conX - triW_t - 1);



    var triSvgCont = itm.pulsador ? 'boton_trian_verde.svg' : 'boton_trian_rojo.svg';
    var triC = _crearImg('assets/panel-busbar/' + triSvgCont, triX_t, conY, triW_t, visH);
    triC.className = 'contactor-img contactor-tri' + (esRight_t ? ' tri-right' : '');
    triC.dataset.contactorItmId = itm.id;
    triC.style.zIndex = '6';
    triC.style.cursor = 'pointer';
    triC.addEventListener('click', function() { onContactorTriangleClick(this); });
    container.appendChild(triC);
  } else {
    var triInfW_t = 45;
    var triInfH_t = visW;
    var triInfX_t = conX + visW / 2 - 22.5;
    var triInfY_t = conY + (_altoFilaK || visH) + 1 + 22.5 - visW / 2;
    var triSvgContInf = itm.pulsador ? 'boton_trian_verde.svg' : 'boton_trian_rojo.svg';
    var triCI = _crearImg('assets/panel-busbar/' + triSvgContInf, triInfX_t, triInfY_t, triInfW_t, triInfH_t);
    triCI.className = 'contactor-img contactor-tri';
    triCI.dataset.contactorItmId = itm.id;
    triCI.style.zIndex = '6';
    triCI.style.cursor = 'pointer';
    triCI.style.transform = 'rotate(-90deg)';
    triCI.addEventListener('click', function() { onContactorTriangleClick(this); });
    container.appendChild(triCI);
  }
}


function onContactorTriangleClick(triImg) {
  var itmId = triImg.dataset.contactorItmId;
  if (!itmId) return;



  if (_modoCopiaActivoPulsador) {
    if (_esTargetCopiaPulsadorValido(triImg)) _insertarPulsadorCopia(triImg);
    return;
  }
  if (_modoCopiaActivoGrupo) {
    if (_esTargetCopiaGrupoValido(triImg)) _insertarGrupoCopia(triImg);
    return;
  }

  var prev = document.getElementById('tri_context_menu');
  if (prev) prev.remove();
  _cerrarMenuTriangulo();

  var menu = document.createElement('div');
  menu.id = 'tri_context_menu';
  menu.className = 'dif-context-menu';

  var itmMenu = _buscarITM(itmId);


  var btnAgregarK = document.createElement('button');
  btnAgregarK.className = 'dif-context-btn';
  btnAgregarK.textContent = 'Agregar';
  btnAgregarK.addEventListener('click', function() {
    menu.remove();
    if (typeof abrirModalEquipo === 'function') abrirModalEquipo(itmId, 'contactor');
  });
  menu.appendChild(btnAgregarK);

  var btnEditar = document.createElement('button');
  btnEditar.className = 'dif-context-btn';
  btnEditar.textContent = 'Editar';
  btnEditar.addEventListener('click', function() {
    menu.remove();
    if (itmMenu) abrirModalContactor(itmMenu.id);
  });
  menu.appendChild(btnEditar);


  if (itmMenu && itmMenu.contactor && itmMenu.contactor.ubicacion === 'inferior' &&
      _hayVecinoEnFila(itmMenu.id, 'contactor')) {
    var btnMoverK = document.createElement('button');
    btnMoverK.className = 'dif-context-btn';
    btnMoverK.textContent = 'Mover';
    btnMoverK.addEventListener('click', function() { menu.remove(); moverEnFila(itmMenu.id, 'contactor'); });
    menu.appendChild(btnMoverK);
  }






  if (itmMenu && itmMenu.contactor && itmMenu.contactor.ubicacion === 'inferior') {
    var infoC = _infoFilaInferior(itmMenu.id, 'contactor');
    if (infoC && infoC.idx > 0 && !infoC.forzado && (itmMenu.contactor.salto || infoC.numFilas < 5)) {
      var btnSaltoC = document.createElement('button');
      btnSaltoC.className = 'dif-context-btn';
      btnSaltoC.textContent = itmMenu.contactor.salto
        ? 'Quitar salto'
        : 'Saltar a F' + (infoC.fila + 2);
      btnSaltoC.addEventListener('click', function() {
        menu.remove();
        _saltoFilaContactor(itmId);
      });
      menu.appendChild(btnSaltoC);
    }
  }


  if (itmMenu && itmMenu.contactor && _hayDestinosCopiaValidosContactor(itmMenu)) {
    var btnCopiar = document.createElement('button');
    btnCopiar.className = 'dif-context-btn';
    btnCopiar.textContent = 'Copiar ' + _rotuloK(itmMenu.rotulo);
    btnCopiar.addEventListener('click', function() {
      menu.remove();
      _activarModoCopiaContactor(itmId);
    });
    menu.appendChild(btnCopiar);
  }


  if (itmMenu && itmMenu.pulsador && _hayDestinosCopiaValidosPulsador(itmMenu)) {
    var btnCopiarP = document.createElement('button');
    btnCopiarP.className = 'dif-context-btn';
    btnCopiarP.textContent = 'Copiar pulsador ' +
      _rotuloK(itmMenu.rotulo, '');
    btnCopiarP.addEventListener('click', function() {
      menu.remove();
      _activarModoCopiaPulsador(itmId);
    });
    menu.appendChild(btnCopiarP);
  }



  [['bornera', 'borneras', 'K-'], ['timer', 'timer', 'T-']].forEach(function(c) {
    var src = (typeof _bornerasGrupoDeOrigen === 'function')
      ? _bornerasGrupoDeOrigen(itmId, c[0]) : null;
    if (!src || !_hayDestinosCopiaValidosGrupo(itmId, c[0])) return;
    var btn = document.createElement('button');
    btn.className = 'dif-context-btn';
    btn.textContent = 'Copiar ' + c[1] + ' ' +
      (itmMenu && itmMenu.rotulo ? itmMenu.rotulo.replace('C-', c[2]) : '');
    btn.addEventListener('click', function() {
      menu.remove();
      _activarModoCopiaGrupo(itmId, c[0]);
    });
    menu.appendChild(btn);
  });

  var btnEliminar = document.createElement('button');
  btnEliminar.className = 'dif-context-btn';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.style.color = '#ff6b6b';
  btnEliminar.addEventListener('click', function() {
    menu.remove();
    _eliminarContactor(itmId);
  });
  menu.appendChild(btnEliminar);

  _abrirMenuTriangulo(menu, triImg);
}

function _eliminarContactor(itmId) {
  var itm = _buscarITM(itmId);
  if (!_quitarContactor(itm)) return;
  _postCambioContactorPrep();
}





var _modoCopiaActivoContactor = false;
var _modoCopiaContactorSrc = null;





function _esTargetCopiaContactorValido(tri) {
  if (!tri) return false;
  var titm = _buscarITM(tri.dataset.itmId);
  return !!(titm && !titm.dif && !titm.contactor);
}

function _esTargetCopiaContactorValidoDif(tri) {
  if (!tri) return false;
  var titm = _buscarITM(tri.dataset.difItmId);
  return !!(titm && titm.dif && !titm.contactor);
}

function _hayDestinosCopiaValidosContactor(itmSrc) {
  if (!itmSrc || !itmSrc.contactor) return false;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return false;
  var difs = container.querySelectorAll('.dif-tri');
  for (var d = 0; d < difs.length; d++) {
    if (_esTargetCopiaContactorValidoDif(difs[d])) return true;
  }
  var tris = container.querySelectorAll('.itm-tri');
  for (var i = 0; i < tris.length; i++) {
    if (_esTargetCopiaContactorValido(tris[i])) return true;
  }
  return false;
}

function _activarModoCopiaContactor(itmId) {
  var itm = _buscarITM(itmId);
  if (!itm || !itm.contactor) return;
  _modoCopiaActivoContactor = true;
  _modoCopiaContactorSrc = itm;
  _actualizarTargetsCopiaContactor();
  _mostrarHintCopiaContactor();
  document.addEventListener('keydown', _escModoCopiaContactor);
  setTimeout(function() {
    document.addEventListener('click', _clickFueraCopiaContactor);
  }, 50);
}

function _desactivarModoCopiaContactor() {
  _modoCopiaActivoContactor = false;
  _modoCopiaContactorSrc = null;
  var container = document.getElementById('panel_busbar_container');
  if (container) {
    container.querySelectorAll('.modo-copia-target').forEach(function(el) {
      el.classList.remove('modo-copia-target');
    });
  }
  var hint = document.getElementById('modo_copia_hint');
  if (hint) hint.remove();
  document.removeEventListener('keydown', _escModoCopiaContactor);
  document.removeEventListener('click', _clickFueraCopiaContactor);
}

function _escModoCopiaContactor(e) {
  if (e.key === 'Escape') _desactivarModoCopiaContactor();
}

function _clickFueraCopiaContactor(e) {

  if (window._redibujoSafariEnCurso) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;
  var path = e.composedPath ? e.composedPath() : [];
  var dentro = container.contains(e.target) || path.indexOf(container) !== -1;
  if (!dentro) _desactivarModoCopiaContactor();
}

function _actualizarTargetsCopiaContactor() {
  if (!_modoCopiaContactorSrc) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;
  container.querySelectorAll('.dif-tri').forEach(function(tri) {
    tri.classList.toggle('modo-copia-target', _esTargetCopiaContactorValidoDif(tri));
  });
  container.querySelectorAll('.itm-tri').forEach(function(tri) {
    tri.classList.toggle('modo-copia-target', _esTargetCopiaContactorValido(tri));
  });
}

function _mostrarHintCopiaContactor() {
  var old = document.getElementById('modo_copia_hint');
  if (old) old.remove();
  var c = _modoCopiaContactorSrc.contactor;
  var ctr = document.getElementById('panel_busbar_container');
  var hayDifs = false, hayItms = false;
  if (ctr) {
    ctr.querySelectorAll('.dif-tri').forEach(function(t) {
      if (_esTargetCopiaContactorValidoDif(t)) hayDifs = true;
    });
    ctr.querySelectorAll('.itm-tri').forEach(function(t) {
      if (_esTargetCopiaContactorValido(t)) hayItms = true;
    });
  }
  var destino = hayDifs
    ? (hayItms ? 'un diferencial (o un ITM sin diferencial)' : 'un diferencial')
    : 'un ITM';
  var hint = document.createElement('div');
  hint.id = 'modo_copia_hint';
  hint.textContent = 'Click en ' + destino + ' libre para copiar ' + _contactorDesc(c) +
    ' · ' + _ubicTxt(c.ubicacion) + '  ·  ' + _txtSalir();
  document.body.appendChild(hint);
}

function _insertarContactorCopia(triDest) {
  if (!_modoCopiaContactorSrc || !_modoCopiaContactorSrc.contactor) return;

  var itmId = triDest.dataset.difItmId || triDest.dataset.itmId;
  var itm = itmId ? _buscarITM(itmId) : null;
  if (!itm || itm.contactor) return;

  var src = _modoCopiaContactorSrc.contactor;


  itm.contactor = { capacidad: src.capacidad, categoria: _contactorCategoria(src), ubicacion: src.ubicacion,
                    reserva: !!src.reserva, padre: itm.dif ? 'dif' : 'itm' };





  if (src.ubicacion === 'libre' && typeof _bornerasGrupoDeOrigen === 'function') {
    var grSrc = _bornerasGrupoDeOrigen(_modoCopiaContactorSrc.id, 'contactor');
    var grNuevo = (grSrc && typeof _bornerasCrearCopia === 'function')
      ? _bornerasCrearCopia(grSrc, itm.id) : null;
    if (grNuevo) _contactorAplicarAGrupo(grNuevo, itm.contactor);

    else itm.contactor.ubicacion = 'lateral';
  }


  _postCambioContactorPrep(_actualizarTargetsCopiaContactor);
}






var _modoCopiaActivoPulsador = false;





var _modoCopiaActivoGrupo = false;
var _modoCopiaGrupoSrc = null;
var _modoCopiaGrupoClase = null;

function _esTargetCopiaGrupoValido(tri) {
  if (!tri || !_modoCopiaGrupoClase) return false;
  var id = tri.dataset.contactorItmId;
  var titm = _buscarITM(id);
  if (!titm || !titm.contactor) return false;
  if (_modoCopiaGrupoSrc && id === _modoCopiaGrupoSrc.id) return false;


  return !(typeof _bornerasGrupoDeOrigen === 'function' &&
           _bornerasGrupoDeOrigen(id, _modoCopiaGrupoClase));
}



function _hayDestinosCopiaValidosGrupo(itmIdSrc, clase) {
  var container = document.getElementById('panel_busbar_container');
  if (!container) return false;
  var claseAnt = _modoCopiaGrupoClase, srcAnt = _modoCopiaGrupoSrc;
  _modoCopiaGrupoClase = clase;
  _modoCopiaGrupoSrc = _buscarITM(itmIdSrc);
  var hay = false;
  var tris = container.querySelectorAll('.contactor-tri');
  for (var i = 0; i < tris.length && !hay; i++) {
    if (_esTargetCopiaGrupoValido(tris[i])) hay = true;
  }
  _modoCopiaGrupoClase = claseAnt;
  _modoCopiaGrupoSrc = srcAnt;
  return hay;
}

function _activarModoCopiaGrupo(itmId, clase) {
  var itm = _buscarITM(itmId);
  if (!itm) return;
  _modoCopiaActivoGrupo = true;
  _modoCopiaGrupoSrc = itm;
  _modoCopiaGrupoClase = clase;
  var container = document.getElementById('panel_busbar_container');
  if (container) {
    container.querySelectorAll('.contactor-tri').forEach(function(tri) {
      tri.classList.toggle('modo-copia-target', _esTargetCopiaGrupoValido(tri));
    });
  }
  var old = document.getElementById('modo_copia_hint');
  if (old) old.remove();
  var hint = document.createElement('div');
  hint.id = 'modo_copia_hint';
  hint.textContent = 'Click en un contactor sin ' +
    (clase === 'timer' ? 'timer' : 'borneras') +
    ' para copiar  ·  ' + _txtSalir();
  document.body.appendChild(hint);
  document.addEventListener('keydown', _escModoCopiaGrupo);
  setTimeout(function() {
    document.addEventListener('click', _clickFueraCopiaGrupo);
  }, 50);
}

function _desactivarModoCopiaGrupo() {
  _modoCopiaActivoGrupo = false;
  _modoCopiaGrupoSrc = null;
  _modoCopiaGrupoClase = null;
  var container = document.getElementById('panel_busbar_container');
  if (container) {
    container.querySelectorAll('.modo-copia-target').forEach(function(el) {
      el.classList.remove('modo-copia-target');
    });
  }
  var hint = document.getElementById('modo_copia_hint');
  if (hint) hint.remove();
  document.removeEventListener('keydown', _escModoCopiaGrupo);
  document.removeEventListener('click', _clickFueraCopiaGrupo);
}

function _escModoCopiaGrupo(e) {
  if (e.key === 'Escape') _desactivarModoCopiaGrupo();
}

function _clickFueraCopiaGrupo(e) {

  if (window._redibujoSafariEnCurso) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;
  var path = e.composedPath ? e.composedPath() : [];
  var dentro = container.contains(e.target) || path.indexOf(container) !== -1;
  if (!dentro) _desactivarModoCopiaGrupo();
}

function _insertarGrupoCopia(triDest) {
  if (!_modoCopiaGrupoSrc || !_modoCopiaGrupoClase) return;
  var src = _bornerasGrupoDeOrigen(_modoCopiaGrupoSrc.id, _modoCopiaGrupoClase);
  var destId = triDest.dataset.contactorItmId;
  if (!src || !destId) return;


  _bornerasCrearCopia(src, destId);
  _postCambioBorneras();

  var container = document.getElementById('panel_busbar_container');
  if (container) {
    container.querySelectorAll('.contactor-tri').forEach(function(tri) {
      tri.classList.toggle('modo-copia-target', _esTargetCopiaGrupoValido(tri));
    });
  }
}

var _modoCopiaPulsadorSrc = null;

function _esTargetCopiaPulsadorValido(tri) {
  if (!tri) return false;
  var titm = _buscarITM(tri.dataset.contactorItmId);
  return !!(titm && titm.contactor && !titm.pulsador);
}

function _hayDestinosCopiaValidosPulsador(itmSrc) {
  if (!itmSrc || !itmSrc.pulsador) return false;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return false;
  var tris = container.querySelectorAll('.contactor-tri');
  for (var i = 0; i < tris.length; i++) {
    if (_esTargetCopiaPulsadorValido(tris[i])) return true;
  }
  return false;
}

function _activarModoCopiaPulsador(itmId) {
  var itm = _buscarITM(itmId);
  if (!itm || !itm.pulsador) return;
  _modoCopiaActivoPulsador = true;
  _modoCopiaPulsadorSrc = itm;
  _actualizarTargetsCopiaPulsador();
  _mostrarHintCopiaPulsador();
  document.addEventListener('keydown', _escModoCopiaPulsador);
  setTimeout(function() {
    document.addEventListener('click', _clickFueraCopiaPulsador);
  }, 50);
}

function _desactivarModoCopiaPulsador() {
  _modoCopiaActivoPulsador = false;
  _modoCopiaPulsadorSrc = null;
  var container = document.getElementById('panel_busbar_container');
  if (container) {
    container.querySelectorAll('.modo-copia-target').forEach(function(el) {
      el.classList.remove('modo-copia-target');
    });
  }
  var hint = document.getElementById('modo_copia_hint');
  if (hint) hint.remove();
  document.removeEventListener('keydown', _escModoCopiaPulsador);
  document.removeEventListener('click', _clickFueraCopiaPulsador);
}

function _escModoCopiaPulsador(e) {
  if (e.key === 'Escape') _desactivarModoCopiaPulsador();
}

function _clickFueraCopiaPulsador(e) {

  if (window._redibujoSafariEnCurso) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;
  var path = e.composedPath ? e.composedPath() : [];
  var dentro = container.contains(e.target) || path.indexOf(container) !== -1;
  if (!dentro) _desactivarModoCopiaPulsador();
}

function _actualizarTargetsCopiaPulsador() {
  if (!_modoCopiaPulsadorSrc) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;
  container.querySelectorAll('.contactor-tri').forEach(function(tri) {
    tri.classList.toggle('modo-copia-target', _esTargetCopiaPulsadorValido(tri));
  });
}

function _mostrarHintCopiaPulsador() {
  var old = document.getElementById('modo_copia_hint');
  if (old) old.remove();
  var p = _modoCopiaPulsadorSrc.pulsador;
  var _m = _pulsadorMando(_modoCopiaPulsadorSrc);


  var tipo = !_m.botonera ? ''
    : (_m.tipo === 'conjunto') ? ('conjunto piloto ' + (p.ledColor || 'verde') + ' + pulsadores')
    : (_m.tipo === 'columnas') ? 'marcha y parada con piloto (dos columnas)'
    : 'pulsador doble marcha/parada';
  if (_m.selector) tipo = (tipo ? tipo + ' + ' : '') + 'selector ' + _pulsadorLeyendaTexto(_modoCopiaPulsadorSrc);
  var hint = document.createElement('div');
  hint.id = 'modo_copia_hint';
  hint.textContent = 'Click en un contactor sin pulsador para copiar ' +
    tipo + '  ·  ' + _txtSalir();
  document.body.appendChild(hint);
}

function _insertarPulsadorCopia(triDest) {
  if (!_modoCopiaPulsadorSrc || !_modoCopiaPulsadorSrc.pulsador) return;
  var itm = _buscarITM(triDest.dataset.contactorItmId);
  if (!itm || !itm.contactor || itm.pulsador) return;

  var src = _modoCopiaPulsadorSrc.pulsador;
  itm.pulsador = {



    tipo: (typeof _pulsadorTipo === 'function')
      ? (_pulsadorTipo(_modoCopiaPulsadorSrc) || 'doble') : (src.tipo || 'doble'),
    ledColor: src.ledColor || 'verde',



    selector: (typeof _pulsadorSelectorOn === 'function')
      ? _pulsadorSelectorOn(_modoCopiaPulsadorSrc) : !!src.selector,
    botonera: _pulsadorBotoneraOn(_modoCopiaPulsadorSrc),
    leyenda: (typeof _pulsadorLeyenda === 'function')
      ? _pulsadorLeyenda(_modoCopiaPulsadorSrc) : (src.leyenda || _PULS_LEYENDA_DEF),
    orden: (src.orden || []).slice(),



    padre: 'contactor'
  };



  _postCambioPulsador(false);
  _actualizarTargetsCopiaPulsador();
}










var _pulsadorITMId = null;


function _pulsadorTipo(itm) {
  if (!itm || !itm.pulsador) return null;
  var t = itm.pulsador.tipo || 'doble';


  return (t === 'selector') ? 'doble' : t;
}





function _pulsadorMando(itm) {
  var on = !!(itm && itm.pulsador && itm.contactor);
  var tipo = on ? _pulsadorTipo(itm) : '';
  return { on: on, tipo: tipo,
           botonera: on && _pulsadorBotoneraOn(itm),
           selector: on && _pulsadorSelectorOn(itm),
           leyenda: on ? _pulsadorLeyenda(itm) : null,
           conPiloto: tipo === 'conjunto' || tipo === 'columnas' };
}



function _pulsadoresPuerta() {
  return (window._itmList || []).filter(function(i) { return i.pulsador && i.contactor; });
}
function _pulsLimpiarSaltoPrimero() {
  var l = _pulsadoresPuerta();
  if (l.length && l[0].pulsador && typeof l[0].pulsador === 'object') delete l[0].pulsador.salto;
}



function _pulsadorSelectorOn(itm) {
  var p = itm && itm.pulsador;
  if (!p) return false;
  if (p.tipo === 'selector') return true;                                  
  return !!p.selector;
}



function _pulsadorBotoneraOn(itm) {
  var p = itm && itm.pulsador;
  if (!p) return false;
  return p.botonera !== false;
}




function _pulsBotChk(label) {
  var lb = document.createElement('label');
  lb.style.cssText = 'font-size:12px; color:#bbb; display:flex; align-items:center; gap:6px; cursor:pointer;';
  var chk = document.createElement('input');
  chk.type = 'checkbox';
  chk.className = 'puls-bot-chk';
  chk.checked = window._modalPulsBotOn !== false;
  chk.onchange = function() { onPulsadorBotoneraToggle(chk); };
  lb.appendChild(chk);
  var sp = document.createElement('span');
  sp.textContent = label;
  lb.appendChild(sp);
  return lb;
}
function _pulsDimBotonera() {
  var on = window._modalPulsBotOn !== false;
  document.querySelectorAll('#modalPulsador_overlay .puls-bot-chk').forEach(function(c) { c.checked = on; });
  document.querySelectorAll('#modalPulsador_overlay .puls-bot-el').forEach(function(e) {
    e.style.opacity = on ? '1' : '0.3';
  });
}
function onPulsadorBotoneraToggle(chk) {
  window._modalPulsBotOn = !!(chk && chk.checked);
  _pulsDimBotonera();
}





var _PULS_COLUMNAS = [
  [ { svg: 'Piloto-vf.svg',   fondo: _LED_HEX.verde, rotulo: 'PILOTO', d: 150   },
    { svg: 'Pulsador-vf.svg', fondo: _LED_HEX.verde, rotulo: 'MARCHA', d: 142.5 } ],
  [ { svg: 'Piloto-vf.svg',   fondo: _LED_HEX.rojo, rotulo: 'PILOTO', d: 150   },
    { svg: 'Pulsador-vf.svg', fondo: _LED_HEX.rojo, rotulo: 'PARADA', d: 142.5 } ]
];


var _PULS_ORDEN_DEF = ['piloto', 'verde', 'rojo'];




function _pulsPrefs() {
  if (!window._PULS_PREFS) {
    window._PULS_PREFS = {
      tipo: 'doble', ledColor: 'verde',
      selector: false, leyenda: _PULS_LEYENDA_DEF,
      orden: _PULS_ORDEN_DEF.slice()
    };
  }
  return window._PULS_PREFS;
}
var _PULS_DEF = {
  piloto: { svg: 'Piloto-vf.svg',   label: 'Piloto (LED)',   rotulo: 'PILOTO' },
  verde:  { svg: 'Pulsador-vf.svg', label: 'Pulsador verde', rotulo: 'MARCHA', color: _LED_HEX.verde },
  rojo:   { svg: 'Pulsador-vf.svg', label: 'Pulsador rojo',  rotulo: 'PARADA', color: _LED_HEX.rojo }
};



var _PULS_LEYENDAS = { '1-0-2': '1 - 0 - 2', 'M-0-A': 'M - 0 - A' };
var _PULS_LEYENDA_DEF = '1-0-2';

function _pulsadorLeyenda(itm) {
  var k = itm && itm.pulsador && itm.pulsador.leyenda;
  return _PULS_LEYENDAS[k] ? k : _PULS_LEYENDA_DEF;
}

function _pulsadorLeyendaTexto(itm) {
  return _PULS_LEYENDAS[_pulsadorLeyenda(itm)];
}


function _pulsadorOrden(itm) {
  var o = itm && itm.pulsador && itm.pulsador.orden;
  if (o && o.length === 3) return o.slice();
  return _PULS_ORDEN_DEF.slice();
}



function _pulsadorSetOrden(key, n) {
  var ord = (window._modalPulsOrden || _PULS_ORDEN_DEF).slice();
  var from = ord.indexOf(key);
  var to = n - 1;
  if (from === -1 || to < 0 || to > 2 || to === from) { _renderPulsadorPreview(); return; }
  var otro = ord[to];
  ord[to] = key;
  ord[from] = otro;
  window._modalPulsOrden = ord;
  _renderPulsadorPreview();
}





function _renderPreviewColumnas() {
  var cont = document.getElementById('modalPulsador_columnasPreview');
  if (!cont) return;


  var _addonMov = document.getElementById('modalPulsador_selectorAddon');
  var _casaAddon = document.getElementById('modalPulsador_desc_doble');
  if (_addonMov && _casaAddon && _addonMov.parentNode === cont) {
    _casaAddon.appendChild(_addonMov);
  }
  cont.innerHTML = '';




  var titulo = _pulsBotChk('Marcha y parada, cada una con su piloto');
  titulo.style.marginBottom = '10px';
  cont.appendChild(titulo);

  var fila = document.createElement('div');
  fila.className = 'puls-bot-el';
  fila.style.cssText = 'display:flex; align-items:flex-start; gap:10px; margin-bottom:8px;';
  var hueco = document.createElement('div');
  hueco.style.cssText = 'width:56px; flex:0 0 56px;';
  fila.appendChild(hueco);

  _PULS_COLUMNAS.forEach(function(col) {
    var cw = document.createElement('div');
    cw.style.cssText = 'flex:0 0 60px;';
    col.forEach(function(el) {
      var rot = document.createElement('div');
      rot.style.cssText = 'height:20px;background:#000;color:#fff;display:flex;' +
        'align-items:center;justify-content:center;font-weight:700;font-size:9px;' +
        "font-family:'Segoe UI', Arial, sans-serif;margin-bottom:4px;";
      rot.textContent = el.rotulo;
      cw.appendChild(rot);


      var dpx = Math.round(60 * (el.d / 150));
      var off = (60 - dpx) / 2;
      var caja = document.createElement('div');
      caja.style.cssText = 'position:relative;width:60px;height:60px;margin-bottom:8px;';
      var fondo = document.createElement('div');
      fondo.style.cssText = 'position:absolute;left:' + off + 'px;top:' + off + 'px;' +
        'width:' + dpx + 'px;height:' + dpx + 'px;border-radius:50%;background:' + el.fondo + ';';
      caja.appendChild(fondo);
      var im = document.createElement('img');
      im.src = 'assets/Aparamenta/' + el.svg;
      im.style.cssText = 'position:absolute;left:' + off + 'px;top:' + off + 'px;' +
        'width:' + dpx + 'px;height:' + dpx + 'px;display:block;';
      caja.appendChild(im);
      cw.appendChild(caja);
    });
    fila.appendChild(cw);
  });

  cont.appendChild(fila);


  var rowK = document.createElement('div');



  rowK.style.cssText = 'display:flex; align-items:center; gap:10px; margin-top:2px;' +
    'margin-left:' + _PULS_COL_OFFSET + 'px;';
  var h2 = document.createElement('div');
  h2.style.cssText = 'width:56px; flex:0 0 56px;';
  rowK.appendChild(h2);
  var placa = document.createElement('div');
  placa.style.cssText = 'width:60px;height:30px;flex:0 0 60px;background:#000;color:#fff;' +
    'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;' +
    "font-family:'Segoe UI', Arial, sans-serif;letter-spacing:0.5px;";
  var _itmCol = (typeof _buscarITM === 'function') ? _buscarITM(_pulsadorITMId) : null;
  placa.textContent = _rotuloK(_itmCol && _itmCol.rotulo);
  rowK.appendChild(placa);
  var lbl = document.createElement('div');
  lbl.style.cssText = 'font-size:12px; color:#bbb;';
  lbl.textContent = 'R\u00f3tulo del circuito';
  rowK.appendChild(lbl);
  cont.appendChild(rowK);

  _pulsColocarAddon();
  _pulsDimBotonera();
}

function _renderPulsadorPreview() {
  var _selTipoPrev = document.getElementById('modalPulsador_tipo');
  if (_selTipoPrev && _selTipoPrev.value === 'columnas') { _renderPreviewColumnas(); return; }
  var cont = document.getElementById('modalPulsador_conjuntoPreview');
  if (!cont) return;
  var ord = window._modalPulsOrden || _PULS_ORDEN_DEF;
  var ledSel = document.getElementById('modalPulsador_ledColor');
  var ledCol = (ledSel && ledSel.value === 'rojo') ? _LED_HEX.rojo : _LED_HEX.verde;
  var wrapColor = document.getElementById('modalPulsador_ledColorWrap');





  var _addonMov = document.getElementById('modalPulsador_selectorAddon');
  var _casaAddon = document.getElementById('modalPulsador_desc_doble');
  if (_addonMov && _casaAddon && _addonMov.parentNode === cont) {
    _casaAddon.appendChild(_addonMov);
  }
  cont.innerHTML = '';
  var chkRow = _pulsBotChk('Piloto + pulsador verde + pulsador rojo');
  chkRow.style.marginBottom = '10px';
  cont.appendChild(chkRow);
  ord.forEach(function(key, idx) {
    var d = _PULS_DEF[key];
    if (!d) return;
    var color = (key === 'piloto') ? ledCol : d.color;

    var row = document.createElement('div');
    row.className = 'puls-bot-el';
    row.style.cssText = 'display:flex; align-items:flex-end; gap:10px; margin-bottom:8px;';

    var s = document.createElement('select');
    s.className = 'm1-input-text';
    s.style.cssText = 'width:56px; flex:0 0 56px; text-align:center;';
    s.title = 'Posici\u00f3n de ' + d.label + ' (de arriba a abajo)';
    [1, 2, 3].forEach(function(n) {
      var op = document.createElement('option');
      op.value = n; op.textContent = n;
      if (n === idx + 1) op.selected = true;
      s.appendChild(op);
    });
    s.addEventListener('change', function() {
      _pulsadorSetOrden(key, parseInt(s.value, 10));
    });
    row.appendChild(s);


    var col = document.createElement('div');
    col.style.cssText = 'flex:0 0 60px; line-height:0;';
    var rot = document.createElement('div');
    rot.style.cssText = 'width:60px; height:30px; background:#000; color:#fff; ' +
      'display:flex; align-items:center; justify-content:center; ' +
      'font-family:\'Segoe UI\', Arial, sans-serif; font-weight:700; font-size:11px; ' +
      'letter-spacing:0.5px; margin-bottom:4px;';
    rot.textContent = d.rotulo;
    col.appendChild(rot);
    var circ = document.createElement('div');
    circ.style.cssText = 'position:relative; width:60px; height:60px; line-height:0;';
    var fondo = document.createElement('div');
    fondo.style.cssText = 'position:absolute; inset:0; border-radius:50%; background:' + color + ';';
    circ.appendChild(fondo);
    var im = document.createElement('img');
    im.src = 'assets/Aparamenta/' + d.svg;
    im.style.cssText = 'position:absolute; inset:0; width:60px; height:60px;';
    circ.appendChild(im);
    col.appendChild(circ);
    row.appendChild(col);

    if (key === 'piloto' && wrapColor) {
      wrapColor.style.display = '';
      row.appendChild(wrapColor);
    } else {
      var lbl = document.createElement('div');
      lbl.style.cssText = 'font-size:12px; color:#bbb;';
      lbl.textContent = d.label;
      row.appendChild(lbl);
    }
    cont.appendChild(row);
  });


  var itmK = _buscarITM(_pulsadorITMId);
  var txtK = _rotuloK(itmK && itmK.rotulo);
  var rowK = document.createElement('div');
  rowK.style.cssText = 'display:flex; align-items:center; gap:10px; margin-top:2px;';
  var sp = document.createElement('div');
  sp.style.cssText = 'width:56px; flex:0 0 56px;';                              
  rowK.appendChild(sp);
  var plK = document.createElement('div');
  plK.style.cssText = 'width:60px; height:30px; background:#000; color:#fff; ' +
    'display:flex; align-items:center; justify-content:center; ' +
    'font-family:Segoe UI, Arial, sans-serif; font-weight:700; font-size:11px; ' +
    'letter-spacing:0.5px; flex:0 0 60px;';
  plK.textContent = txtK;
  rowK.appendChild(plK);
  var lblK = document.createElement('div');
  lblK.style.cssText = 'font-size:12px; color:#bbb;';
  lblK.textContent = 'Rótulo del circuito';
  rowK.appendChild(lblK);
  cont.appendChild(rowK);
  _pulsColocarAddon();
  _pulsDimBotonera();
}

function onPulsadorLedColorChange() {
  _renderPulsadorPreview();
}




function _pulsMontarAddonSelector(cont, antesDe) {
  var addon = document.getElementById('modalPulsador_selectorAddon');
  if (!addon || !cont) return;
  if (antesDe && antesDe.parentNode === cont) cont.insertBefore(addon, antesDe);
  else cont.appendChild(addon);
  addon.style.display = '';
}








var _PULS_COL_OFFSET = 35;

function _pulsColocarAddon() {
  var sel = document.getElementById('modalPulsador_tipo');
  var _v = sel ? sel.value : 'doble';
  var _addonC = document.getElementById('modalPulsador_selectorAddon');
  if (_addonC) _addonC.style.marginLeft = (_v === 'columnas') ? (_PULS_COL_OFFSET + 'px') : '';
  if (_v === 'conjunto' || _v === 'columnas') {
    var cont = document.getElementById(_v === 'columnas'
      ? 'modalPulsador_columnasPreview' : 'modalPulsador_conjuntoPreview');

    _pulsMontarAddonSelector(cont, cont ? cont.lastElementChild : null);
  } else {
    _pulsMontarAddonSelector(document.getElementById('modalPulsador_desc_doble'),
                             document.getElementById('modalPulsador_dobleRotuloRow'));
  }
}


function onPulsadorSelectorToggle() {
  var chk = document.getElementById('modalPulsador_selOn');
  var on = !!(chk && chk.checked);
  var fila = document.getElementById('modalPulsador_selLeyendaRow');
  if (fila) fila.style.display = on ? 'flex' : 'none';
  var img = document.getElementById('modalPulsador_selImg');
  if (img) img.style.opacity = on ? '1' : '0.3';
}


function onPulsadorLeyendaChange() {
  var sel = document.getElementById('modalPulsador_selLeyenda');
  var placa = document.getElementById('modalPulsador_selLeyendaPlaca');
  if (placa) {
    placa.textContent = _PULS_LEYENDAS[sel && sel.value] ||
                        _PULS_LEYENDAS[_PULS_LEYENDA_DEF];
  }
}

function onPulsadorTipoChange() {
  var sel = document.getElementById('modalPulsador_tipo');
  var v = sel ? sel.value : 'doble';
  var dD = document.getElementById('modalPulsador_desc_doble');
  var dC = document.getElementById('modalPulsador_desc_conjunto');
  var dCol = document.getElementById('modalPulsador_desc_columnas');
  if (dD) dD.style.display = (v === 'doble') ? '' : 'none';
  if (dC) dC.style.display = (v === 'conjunto') ? '' : 'none';
  if (dCol) dCol.style.display = (v === 'columnas') ? '' : 'none';




  _renderPulsadorPreview();
}

function abrirModalPulsador(itmId) {
  _pulsadorITMId = itmId;
  var itm = _buscarITM(itmId);
  _pulseTri(_findContactorTri(itmId) || _findItmTri(itmId));

  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalPulsador_overlay').classList.add('activo');

  var pf = _pulsPrefs();


  if (pf.tipo === 'selector') { pf.tipo = 'doble'; pf.selector = true; }
  if (['doble', 'conjunto', 'columnas'].indexOf(pf.tipo) === -1) pf.tipo = 'doble';
  if (!_LED_HEX[pf.ledColor] || pf.ledColor === 'blanco') pf.ledColor = 'verde';
  var existe = !!(itm && itm.pulsador);
  var selT = document.getElementById('modalPulsador_tipo');
  if (selT) selT.value = existe ? (_pulsadorTipo(itm) || 'doble') : pf.tipo;
  var _txtK = _rotuloK(itm && itm.rotulo);
  var rotD = document.getElementById('modalPulsador_dobleRotulo');
  if (rotD) rotD.textContent = _txtK;
  var selLey = document.getElementById('modalPulsador_selLeyenda');
  if (selLey) {
    selLey.value = existe ? _pulsadorLeyenda(itm)
                          : (_PULS_LEYENDAS[pf.leyenda] ? pf.leyenda : _PULS_LEYENDA_DEF);
  }
  var selOn = document.getElementById('modalPulsador_selOn');
  if (selOn) selOn.checked = existe ? _pulsadorSelectorOn(itm) : !!pf.selector;
  window._modalPulsBotOn = existe ? _pulsadorBotoneraOn(itm) : (pf.botonera !== false);
  _pulsDimBotonera();
  onPulsadorSelectorToggle();
  onPulsadorLeyendaChange();
  var selL = document.getElementById('modalPulsador_ledColor');
  if (selL) selL.value = existe ? (itm.pulsador.ledColor || 'verde') : pf.ledColor;
  window._modalPulsOrden = existe ? _pulsadorOrden(itm) : (pf.orden || _PULS_ORDEN_DEF).slice();
  onPulsadorTipoChange();
  _renderPulsadorPreview();
  var btnQ = document.getElementById('modalPulsador_btnQuitar');
  if (btnQ) btnQ.style.display = (itm && itm.pulsador) ? '' : 'none';
}

function cerrarModalPulsador() {
  document.getElementById('modalPulsador_overlay').classList.remove('activo');
  _unpulseTri(_findContactorTri(_pulsadorITMId));
  _unpulseTri(_findItmTri(_pulsadorITMId));
  _unpulseTodos();
  _pulsadorITMId = null;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'none';
}




function _postCambioPulsador(irPuerta) {
  _pulsLimpiarSaltoPrimero();
  if (typeof dibujarPanelBusbar === 'function') dibujarPanelBusbar();
  if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
  if (typeof _renderListaCircuitos === 'function') _renderListaCircuitos();
  guardarSesion();
  var v = irPuerta ? 'frontal_puerta' : (window._vistaActual || 'frontal');
  if (typeof aplicarVista === 'function') aplicarVista(v);
}

function confirmarModalPulsador() {
  var itm = _buscarITM(_pulsadorITMId);
  if (!itm) { cerrarModalPulsador(); return; }
  var selT = document.getElementById('modalPulsador_tipo');
  var selL = document.getElementById('modalPulsador_ledColor');
  var selLey = document.getElementById('modalPulsador_selLeyenda');
  var selOn = document.getElementById('modalPulsador_selOn');
  var _ley = (selLey && _PULS_LEYENDAS[selLey.value]) ? selLey.value : _PULS_LEYENDA_DEF;
  var _botOn = window._modalPulsBotOn !== false;
  if (!_botOn && !(selOn && selOn.checked)) {
    if (typeof _avisoFlotante === 'function') _avisoFlotante('Elige el pulsador, el selector o los dos.');
    return;
  }
  itm.pulsador = {
    tipo: (selT && selT.value) || 'doble',
    ledColor: (selL && selL.value) || 'verde',
    botonera: _botOn,
    selector: !!(selOn && selOn.checked),
    leyenda: _ley,
    orden: (window._modalPulsOrden || _PULS_ORDEN_DEF).slice(),

    salto: !!(itm.pulsador && itm.pulsador.salto),
    padre: _padreEquipo(itm.pulsador, 'contactor')
  };

  var pf = _pulsPrefs();
  pf.tipo = itm.pulsador.tipo;
  pf.ledColor = itm.pulsador.ledColor;
  pf.selector = itm.pulsador.selector;
  pf.botonera = itm.pulsador.botonera;
  pf.leyenda = itm.pulsador.leyenda;
  pf.orden = itm.pulsador.orden.slice();
  cerrarModalPulsador();



  _postCambioPulsador(false);
  _preguntarIrPuerta(function(ir) {
    if (ir && typeof aplicarVista === 'function') aplicarVista('frontal_puerta');
  });
}






var _PREF_IR_PUERTA = 'protab_pref_ir_puerta';

function _prefIrPuerta(v) {
  if (v !== undefined) {
    try { localStorage.setItem(_PREF_IR_PUERTA, JSON.stringify(v)); } catch (e) {}
    return v;
  }
  try {
    var raw = localStorage.getItem(_PREF_IR_PUERTA);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { preguntar: true, ir: true };
}

function _preguntarIrPuerta(cb) {


  if (window._vistaActual === 'frontal_puerta') { cb(false); return; }
  var pref = _prefIrPuerta();
  if (pref.preguntar === false) { cb(pref.ir !== false); return; }
  window._irPuertaCb = cb;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  var chk = document.getElementById('modalIrPuerta_noPreguntar');
  if (chk) chk.checked = false;
  var ov = document.getElementById('modalIrPuerta_overlay');
  if (ov) ov.classList.add('activo');
}

function respuestaIrPuerta(ir) {
  ir = !!ir;
  var chk = document.getElementById('modalIrPuerta_noPreguntar');
  if (chk && chk.checked) _prefIrPuerta({ preguntar: false, ir: ir });
  var ov = document.getElementById('modalIrPuerta_overlay');
  if (ov) ov.classList.remove('activo');
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'none';
  var cb = window._irPuertaCb;
  window._irPuertaCb = null;
  if (cb) cb(ir);
}

function quitarPulsador() {
  var itm = _buscarITM(_pulsadorITMId);
  if (itm) delete itm.pulsador;
  cerrarModalPulsador();
  _postCambioPulsador(false);
}



function onPulsadorTriangleClick(triImg) {
  var itmId = triImg.dataset.pulsadorItmId;
  if (!itmId) return;

  var prev = document.getElementById('tri_context_menu');
  if (prev) prev.remove();
  if (typeof _cerrarMenuTriangulo === 'function') _cerrarMenuTriangulo();

  var menu = document.createElement('div');
  menu.id = 'tri_context_menu';
  menu.className = 'dif-context-menu';

  var btnEditar = document.createElement('button');
  btnEditar.className = 'dif-context-btn';
  btnEditar.textContent = 'Editar';
  btnEditar.addEventListener('click', function() {
    menu.remove();
    abrirModalPulsador(itmId);
  });
  menu.appendChild(btnEditar);



  var _pulsL = (window._itmList || []).filter(function(i) { return i.pulsador; });
  var _posP = -1;
  _pulsL.forEach(function(o, i) { if (o.id === itmId) _posP = i; });
  var _filasP2 = 1;
  _pulsL.forEach(function(o, i) { if (i > 0 && o.pulsador && o.pulsador.salto) _filasP2++; });
  var _itmP = _buscarITM(itmId);
  if (_posP > 0 && _itmP && (_itmP.pulsador.salto || _filasP2 < 5)) {
    var _filaActual = 1;
    for (var _q = 1; _q <= _posP; _q++) {
      if (_pulsL[_q].pulsador && _pulsL[_q].pulsador.salto) _filaActual++;
    }
    var btnSaltoP = document.createElement('button');
    btnSaltoP.className = 'dif-context-btn';
    btnSaltoP.textContent = _itmP.pulsador.salto
      ? 'Quitar salto'
      : 'Saltar a F' + (_filaActual + 1);
    btnSaltoP.addEventListener('click', function() {
      menu.remove();
      _saltoFilaPulsador(itmId);
    });
    menu.appendChild(btnSaltoP);
  }

  var btnEliminar = document.createElement('button');
  btnEliminar.className = 'dif-context-btn';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.style.color = '#ff6b6b';
  btnEliminar.addEventListener('click', function() {
    menu.remove();
    _eliminarPulsador(itmId);
  });
  menu.appendChild(btnEliminar);

  _abrirMenuTriangulo(menu, triImg);
}

function _saltoFilaPulsador(itmId) {
  var itm = _buscarITM(itmId);
  if (!itm || !itm.pulsador) return;
  var lista = (window._itmList || []).filter(function(i) { return i.pulsador; });
  var pos = -1;
  lista.forEach(function(o, i) { if (o.id === itmId) pos = i; });
  if (pos <= 0) return;                                         
  if (itm.pulsador.salto) {
    itm.pulsador.salto = false;
  } else {
    var filas = 1;
    lista.forEach(function(o, i) { if (i > 0 && o.pulsador.salto) filas++; });
    if (filas >= 5) return;                       
    itm.pulsador.salto = true;
  }
  _postCambioPulsador(false);
}

function _eliminarPulsador(itmId) {
  var itm = _buscarITM(itmId);
  if (!itm || !itm.pulsador) return;
  delete itm.pulsador;
  _postCambioPulsador(false);
}
