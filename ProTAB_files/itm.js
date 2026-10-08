























var _itmNextRotulo = 1;
















window._itmLibres = window._itmLibres || [];



var _itmLibreEditandoId = null;

function _itmLibrePorId(itmId) {
  var l = window._itmLibres || [];
  for (var i = 0; i < l.length; i++) { if (l[i].id === itmId) return l[i]; }
  return null;
}

function editarITMLibre(itmId) {
  var itm = _itmLibrePorId(itmId);
  if (!itm) return;
  _itmLibreEditandoId = itmId;
  _itmEditandoId = null;

  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalITM_overlay').classList.add('activo');
  document.getElementById('modalITM_error').textContent = '';
  _ponerRotuloModalITM(itm.rotulo, false);


  var cardU = document.getElementById('modalITM_card_ubicacion');
  if (cardU) cardU.style.display = 'none';
  setITMUbicacion('libre');

  var st = document.getElementById('modalITM_tipo');
  if (st) { st.value = itm.tipo; }
  if (typeof onITMTipoChange === 'function') onITMTipoChange();
  var sc = document.getElementById('modalITM_capacidad');
  if (sc && itm.capacidad) sc.value = itm.capacidad;
  var spo = document.getElementById('modalITM_polos');
  if (spo) spo.value = String(itm.polos);
  if (typeof _regIniciar === 'function')
    _regIniciar('modalITM_regulacion', itm.tipo === 'cm_reg' ? itm.regulacion : null, itm.capacidad);
  _regITM();

  var btn = document.getElementById('modalITM_btnGuardar');
  if (btn) btn.textContent = "Guardar cambios";
  _tituloModalITM('Editar ITM');
}



function _guardarITMLibreEditado() {
  var itm = _itmLibrePorId(_itmLibreEditandoId);
  if (!itm) return false;
  var tipo = document.getElementById('modalITM_tipo').value;
  var polos = parseInt(document.getElementById('modalITM_polos').value, 10);
  if (!tipo || isNaN(polos)) return false;
  var _eraReserva = itm.tipo === 'reserva';
  var _polosAntesL = itm.polos;
  itm.tipo = tipo;
  itm.polos = polos;
  itm.capacidad = (tipo !== 'reserva')
    ? document.getElementById('modalITM_capacidad').value : null;
  if (tipo === 'cm_reg') itm.regulacion = _regLeer('modalITM_regulacion', itm.capacidad);
  else delete itm.regulacion;

  if (tipo === 'reserva') {
    var _tamWrap = document.getElementById('wrap_reserva_tamano');
    var _tamSel = document.getElementById('modalITM_reserva_tamano');
    if (_tamSel && _tamSel.value && (!_tamWrap || _tamWrap.style.display !== 'none')) itm.tamano = _tamSel.value;
  }



  if (tipo === 'reserva' && !_eraReserva && itm.contactor) {
    if (typeof _quitarContactor === 'function') _quitarContactor(itm);
    else delete itm.contactor;
    delete itm.pulsador;
  }
  if (itm.dif) {
    if (typeof _itmPuedeUsarDIF === 'function' && !_itmPuedeUsarDIF(itm)) {
      delete itm.dif;
      if (itm.contactor && itm.contactor.padre === 'dif') itm.contactor.padre = 'itm';
      if (typeof _avisoFlotante === 'function') _avisoFlotante('Se quitó el diferencial: el nuevo tipo de ITM no lo admite.');
    } else {
      itm.dif.polos = (polos <= 2) ? 2 : 4;
    }
  }

  _dpsReengancharPadre(itm);

  if (typeof _dpsAjustarAlITM === 'function') _dpsAjustarAlITM(itm, _polosAntesL);
  var rotulo = document.getElementById('modalITM_rotulo').textContent;
  _intercambiarRotuloITM(rotulo, itm.id);
  itm.rotulo = rotulo;
  _avanzarRotuloITM();
  _itmLibreEditandoId = null;
  cerrarModalITM();
  if (typeof _postCambioBorneras === 'function') _postCambioBorneras();
  else if (typeof _redibujarPanelConIG === 'function') _redibujarPanelConIG();
  if (typeof guardarSesion === 'function') guardarSesion();
  return true;
}

function eliminarITMLibre(itmId) {

  var g = (typeof _bornerasGrupos === 'function') ? _bornerasGrupos() : [];
  var mios = g.filter(function(x) { return x.origen === itmId; });
  mios.forEach(function(x) {
    if (typeof _bornerasDesenganchar === 'function') _bornerasDesenganchar(x.id);
  });
  window._BORNERAS_GRUPOS = (window._BORNERAS_GRUPOS || [])
    .filter(function(x) { return x.origen !== itmId; });
  window._itmLibres = (window._itmLibres || [])
    .filter(function(x) { return x.id !== itmId; });
  if (typeof _postCambioBorneras === 'function') _postCambioBorneras();
  if (typeof guardarSesion === 'function') guardarSesion();
}










function ordenarRotulosITM() {
  var col = (window._itmList || []).slice();
  var num = function(r) { var m = /(\d+)/.exec(r || ''); return m ? parseInt(m[1], 10) : 0; };
  var porAltura = function(a, b) {
    var d = (parseInt(a.conIndex, 10) || 0) - (parseInt(b.conIndex, 10) || 0);
    if (d) return d;
    d = (parseFloat(a.conY) || 0) - (parseFloat(b.conY) || 0);
    return d || (num(a.rotulo) - num(b.rotulo));
  };
  var izq = col.filter(function(i) { return i.side === 'left'; }).sort(porAltura);
  var der = col.filter(function(i) { return i.side !== 'left'; }).sort(porAltura);
  var lib = (window._itmLibres || []).slice().sort(function(a, b) { return num(a.rotulo) - num(b.rotulo); });
  var orden = izq.concat(der, lib);
  if (!orden.length) return;

  var antes = {}, cambios = 0;
  orden.forEach(function(itm, i) {
    var nuevo = 'C-' + String(i + 1).padStart(2, '0');
    antes[itm.rotulo] = nuevo;
    if (itm.rotulo !== nuevo) cambios++;
    itm.rotulo = nuevo;
  });
  _itmNextRotulo = orden.length + 1;


  var um = window._unifilarMeta;
  if (um && um.salidas) {
    var s2 = {};
    Object.keys(um.salidas).forEach(function(k) { s2[/^C-/.test(k) ? (antes[k] || k) : k] = um.salidas[k]; });
    um.salidas = s2;
  }
  if (!cambios) {
    if (typeof _avisoFlotante === 'function') _avisoFlotante('Los rótulos ya estaban en orden.');
    return;
  }
  if (typeof _redibujarPanelConIG === 'function') _redibujarPanelConIG();
  if (window._vistaActual && window._vistaActual !== 'frontal' && typeof aplicarVista === 'function') {
    aplicarVista(window._vistaActual);
  }
  if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
  if (typeof guardarSesion === 'function') guardarSesion();
  if (typeof _avisoFlotante === 'function') _avisoFlotante('Rótulos ordenados: C-01 a C-' + String(orden.length).padStart(2, '0') + '.');
}

























function plantillaTablero(itmsEnOrden) {
  var pl = [], banda = 0, prev = null;
  itmsEnOrden.forEach(function(it) {
    if (prev === 'right' && it.side === 'left') banda++;
    pl.push({ side: it.side, banda: banda });
    prev = it.side;
  });
  var ult = {}, bMin = {}, bMax = {}, ok = true;
  itmsEnOrden.forEach(function(it, k) {
    var b = pl[k].banda, c = parseInt(it.conIndex, 10), key = b + it.side;
    if (ult[key] !== undefined && c <= ult[key]) ok = false;
    ult[key] = c;
    bMin[b] = bMin[b] === undefined ? c : Math.min(bMin[b], c);
    bMax[b] = bMax[b] === undefined ? c : Math.max(bMax[b], c);
  });
  for (var b = 1; b <= banda; b++) if (bMin[b] <= bMax[b - 1]) ok = false;
  return ok ? pl : null;
}





function reacomodarTableroPorNumero(plantilla) {
  var lista = window._itmList;
  if (!window._panelBusbarData || !lista || !lista.length) return true;
  var num = function(r) { var m = /(\d+)/.exec(r || ''); return m ? parseInt(m[1], 10) : 0; };
  var orden = lista.slice().sort(function(a, b) { return num(a.rotulo) - num(b.rotulo); });
  if (plantilla && plantilla.length === orden.length) {
    return _acomodarItms(orden.map(function(it, n) {
      return { it: it, side: plantilla[n].side, banda: plantilla[n].banda };
    }));
  }
  var nIzq = lista.filter(function(i) { return i.side === 'left'; }).length;
  return _acomodarItms(orden.map(function(it, n) {
    return { it: it, side: n < nIzq ? 'left' : 'right', banda: 0 };
  }));
}











function _acomodarItms(planItms) {
  var d = window._panelBusbarData;
  var lista = window._itmList;
  if (!d || !lista) return true;

  if (!planItms || planItms.length !== lista.length) return false;
  var r;
  try {
    r = acomodarItmsPlan(lista, d, planItms.map(function(p) {
      return { idx: lista.indexOf(p.it), side: p.side, banda: p.banda };
    }));
  } catch (e) {
    console.warn('_acomodarItms:', e);
    return false;
  }
  if (!r || !r.ok) return false;
  var orig = lista.slice();
  d.ciclo = r.ciclo;
  d.aisladoTipo = r.aisladoTipo;
  lista.length = 0;
  r.items.forEach(function(p) {
    var it = orig[p.idx];
    it.conIndex = p.conIndex; it.side = p.side; it.tieneConN = p.tieneConN;
    lista.push(it);
  });
  return true;
}

















function _reservaTamanos(d, clase) {
  if (clase === 'cm_reg') return [3];
  if (d.fases === '3F') return [3, 2];
  if (d.fases === '3F+N') return [3, 1];
  if (d.fases === '2F') return [2];

  if (d.fases === '1F+N' && String(d.subfases || '').indexOf('-N') === -1) return [1];
  return [2, 1];
}



function _reservaJuego(L, tam, okInicio) {
  var best = [{ cub: 0, piezas: [] }];
  for (var i = 1; i <= L; i++) {
    var b = { cub: best[i - 1].cub, piezas: best[i - 1].piezas.concat([0]) };                      
    tam.forEach(function(t) {
      if (t > i) return;
      if (okInicio && !okInicio(i - t)) return;
      var c = best[i - t].cub + t, n = best[i - t].piezas.filter(Boolean).length + 1;
      var bn = b.piezas.filter(Boolean).length;
      if (c > b.cub || (c === b.cub && n < bn)) b = { cub: c, piezas: best[i - t].piezas.concat([t]) };
    });
    best.push(b);
  }
  return best[L].piezas;                                                 
}
function sugerirReservas() {
  var d = window._panelBusbarData;
  var lista = window._itmList || [];
  if (!d || !d.ciclo) return { piezas: [], sueltas: 0 };
  var spliceN = d.fases === '3F+N' && d.subfases !== 'R - S - T';
  var invP = !!d.invertirNConectores;
  var prueba = lista.slice();
  var piezas = [], sueltas = 0;
  ['left', 'right'].forEach(function(side) {
    var ocup = {}, claseFila = {};
    lista.forEach(function(it) {
      var r = rangoOcupado(it, invP);
      for (var k = r.start; k < r.end; k++) {
        if (it.side === side) ocup[k] = true;
        else claseFila[k] = clasificarTamanoITM(it) || 'riel';
      }
    });




    if (spliceN) {
      lista.forEach(function(it) {
        if (it.side === side || !it.tieneConN) return;
        var r = rangoOcupado(it, invP);
        for (var k = r.start; k < r.end; k++) if (ocup[k]) return;
        var res = {
          id: 'itm_' + Date.now() + '_' + piezas.length, tipo: 'reserva',
          polos: parseInt(it.polos, 10) || 2, capacidad: null,
          tamano: clasificarTamanoITM(it) || 'riel', side: side,
          conIndex: parseInt(it.conIndex, 10), fase: d.ciclo[parseInt(it.conIndex, 10)],
          tieneConN: true, invertirN: !!it.invertirN
        };
        var lib = verificarPolosLibres(res.conIndex, res.polos, side, prueba, d, res.invertirN);
        var comp = verificarSlotTipoCompatible(res, res.conIndex, side, prueba, d);
        var plan = calcSpliceN(res, d, prueba);
        if (!lib.libre || !comp.compatible || !plan || plan.ok === false || !plan.reusedExistingN) return;
        piezas.push(res);
        prueba.push(res);
        for (var k2 = r.start; k2 < r.end; k2++) ocup[k2] = true;
      });
    }

    var huecos = [], act = null;
    for (var k = 0; k <= d.ciclo.length; k++) {
      var esN = d.ciclo[k] === 'N';
      var libre = k < d.ciclo.length && !ocup[k] && !(spliceN && esN);
      var cl = claseFila[k] || 'riel';
      if (libre && act && act.clase === cl && act.ini + act.L === k) { act.L++; continue; }
      if (act) huecos.push(act);


      act = (libre && !esN) ? { ini: k, L: 1, clase: cl } : null;
    }
    huecos.forEach(function(h) {
      var juego = _reservaJuego(h.L, _reservaTamanos(d, h.clase), function(off) {
        return d.ciclo[h.ini + off] !== 'N';
      });
      var k = h.ini;
      juego.forEach(function(p) {
        if (!p) { sueltas++; k++; return; }
        var res = {
          id: 'itm_' + Date.now() + '_' + piezas.length, tipo: 'reserva', polos: p,
          capacidad: null, tamano: h.clase, side: side, conIndex: k, fase: d.ciclo[k],
          tieneConN: false, invertirN: false
        };
        var ok = verificarPolosLibres(k, p, side, prueba, d, false).libre &&
                 verificarSlotTipoCompatible(res, k, side, prueba, d).compatible;
        if (ok) { piezas.push(res); prueba.push(res); }
        else sueltas += p;
        k += p;
      });
    });
  });
  return { piezas: piezas, sueltas: sueltas };
}


function instalarReservas(piezas) {
  if (!piezas || !piezas.length) return 0;

  _itmTodos().forEach(function(it) {
    var m = /(\d+)/.exec(it.rotulo || '');
    if (m) _itmNextRotulo = Math.max(_itmNextRotulo, parseInt(m[1], 10) + 1);
  });
  piezas.slice().sort(function(a, b) {
    return a.side === b.side ? a.conIndex - b.conIndex : (a.side === 'left' ? -1 : 1);
  }).forEach(function(r) {
    r.rotulo = 'C-' + String(_itmNextRotulo).padStart(2, '0');
    _itmNextRotulo++;
    r.conW = r.tamano === 'cm_reg' ? CM_REG_CON_W : (r.tamano === 'cm_fijo' ? CM_CON_W : (RIEL_CON_W || 115));
    r.conH = r.tamano === 'cm_reg' ? CM_REG_CON_H : (r.tamano === 'cm_fijo' ? CM_CON_H : 90);
    window._itmList.push(r);
  });
  return piezas.length;
}

function _itmTodos() {
  return (window._itmList || []).concat(window._itmLibres || []);
}








var _itmRotuloOriginal = null;
var _itmRotuloEsNuevo = false;
function _numRotuloITM(r) { var m = /(\d+)/.exec(r || ''); return m ? parseInt(m[1], 10) : 0; }
function _limiteRotuloITM() {
  return Math.max(_itmTodos().length + (_itmRotuloEsNuevo ? 1 : 0), _numRotuloITM(_itmRotuloOriginal));
}
function _ponerRotuloModalITM(rotulo, esNuevo) {
  _itmRotuloOriginal = rotulo;
  _itmRotuloEsNuevo = !!esNuevo;
  document.getElementById('modalITM_rotulo').textContent = rotulo;
  _cancelarRotuloModalITM();
}
function _editarRotuloModalITM() {
  var inp = document.getElementById('modalITM_rotulo_num');
  inp.max = _limiteRotuloITM();
  inp.value = _numRotuloITM(document.getElementById('modalITM_rotulo').textContent) || '';
  document.getElementById('modalITM_rotulo').style.display = 'none';
  document.getElementById('modalITM_rotulo_btn').style.display = 'none';
  document.getElementById('modalITM_rotulo_edit').style.display = 'flex';
  inp.focus();
  inp.select();
}
function _cancelarRotuloModalITM() {
  var ed = document.getElementById('modalITM_rotulo_edit');
  if (ed) ed.style.display = 'none';
  document.getElementById('modalITM_rotulo').style.display = '';
  document.getElementById('modalITM_rotulo_btn').style.display = '';
}
function _aplicarRotuloModalITM() {
  var ed = document.getElementById('modalITM_rotulo_edit');
  if (!ed || ed.style.display === 'none') return;
  var n = parseInt(document.getElementById('modalITM_rotulo_num').value, 10);
  var lim = _limiteRotuloITM(), errEl = document.getElementById('modalITM_error');
  if (isNaN(n) || n < 1 || n > lim) {
    if (errEl) errEl.textContent = 'El rótulo va de C-01 a C-' + String(lim).padStart(2, '0');
    _cancelarRotuloModalITM();
    return;
  }
  if (errEl) errEl.textContent = '';
  document.getElementById('modalITM_rotulo').textContent = 'C-' + String(n).padStart(2, '0');
  _cancelarRotuloModalITM();
}


function _intercambiarRotuloITM(nuevo, excluirId) {
  var orig = _itmRotuloOriginal;
  if (!orig || !nuevo || nuevo === orig) return;
  var otro = false;
  _itmTodos().forEach(function(i) {
    if (i.id !== excluirId && i.rotulo === nuevo) { i.rotulo = orig; otro = true; }
  });



  if (otro) setTimeout(function() {
    if (typeof _redibujarPanelConIG === 'function') _redibujarPanelConIG();
    if (window._vistaActual && window._vistaActual !== 'frontal' && typeof aplicarVista === 'function') {
      aplicarVista(window._vistaActual);
    }
    if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
    if (typeof guardarSesion === 'function') guardarSesion();
  }, 0);

  var um = window._unifilarMeta;
  if (um && um.salidas) {
    var a = um.salidas[nuevo], b = um.salidas[orig];
    delete um.salidas[nuevo]; delete um.salidas[orig];
    if (a !== undefined) um.salidas[orig] = a;
    if (b !== undefined) um.salidas[nuevo] = b;
  }
}


function _avanzarRotuloITM() {
  var max = 0;
  _itmTodos().forEach(function(i) { max = Math.max(max, _numRotuloITM(i.rotulo)); });
  _itmNextRotulo = Math.max(_itmNextRotulo, max + 1);
}








function _itmDimsLibre(itm) {
  if (!itm) return { w: 425, h: 90, src: '' };
  var polos = parseInt(itm.polos, 10) || 1;
  var natW, natH, svg;
  if (itm.tipo === 'cm_reg') {
    natW = (polos * 35) / PX_TO_MM;
    natH = 161 / PX_TO_MM;
    svg = 'itm' + polos + 'p_cm_reg-vf.svg';
  } else if (itm.tipo === 'cm_fijo') {
    var mod2 = parseInt(itm.capacidad, 10) >= 125;
    natW = (polos * (mod2 ? 35 : 25)) / PX_TO_MM;
    natH = (mod2 ? 165 : 130) / PX_TO_MM;
    svg = 'itm' + polos + 'p_cm_fijo_' + (mod2 ? 'mod2' : 'mod1') + '-vf.svg';
  } else {

    natW = 90 * polos;
    natH = 425;
    svg = 'itm' + polos + 'p_riel.svg';
  }
  return { w: natW, h: natH,
           src: (itm.tipo === 'reserva') ? '' : ('assets/panel-busbar/' + svg) };
}






var _itmUbicacion = 'busbar';

function setITMUbicacion(val) {
  _itmUbicacion = (val === 'libre') ? 'libre' : 'busbar';
  var ctrl = document.getElementById('modalITM_ubicacion');
  if (ctrl) {
    ctrl.querySelectorAll('.seg-btn').forEach(function(b) {
      b.classList.toggle('activo', b.dataset.val === _itmUbicacion);
    });
  }

  var wrapInv = document.getElementById('modalITM_invertirN_wrap');
  if (wrapInv && _itmUbicacion === 'libre') wrapInv.style.display = 'none';







  var selTipo = document.getElementById('modalITM_tipo');
  var selPolos = document.getElementById('modalITM_polos');
  if (_itmUbicacion === 'libre') {
    if (selTipo) {
      var _tipoPrev = selTipo.value;
      selTipo.innerHTML =
        '<option value="riel">ITM Riel</option>' +
        '<option value="cm_fijo">ITM CM Fijo</option>' +
        '<option value="cm_reg">ITM CM Reg</option>' +
        '<option value="reserva">Reserva</option>';
      selTipo.value = _tipoPrev || 'riel';
      if (!selTipo.value) selTipo.value = 'riel';
    }


    if (typeof onITMTipoChange === 'function') onITMTipoChange();
    if (selPolos) {
      var _polPrev = selPolos.value;
      selPolos.innerHTML = '<option value="1">1P</option>' +
        '<option value="2">2P</option>' +
        '<option value="3">3P</option>' +
        '<option value="4">4P</option>';
      selPolos.value = _polPrev && _polPrev >= '1' && _polPrev <= '4' ? _polPrev : '2';
    }
  } else if (_itmClickedTriangle && typeof _aplicarRestriccionTipoLado === 'function') {

    _aplicarRestriccionTipoLado(_itmClickedTriangle.dataset.side, _itmEditandoId || null);
    if (typeof onITMTipoChange === 'function') onITMTipoChange();
  }
}
var _itmEditandoId = null;





function _dpsReengancharPadre(itm) {
  if (!itm || !itm.dps) return;
  var p = itm.dps.padre;
  if ((p === 'contactor' && !itm.contactor) || (p === 'dif' && !itm.dif)) itm.dps.padre = 'itm';
}
var _itmClickedTriangle = null;


function _buildCmConSet() {
  var d = window._panelBusbarData || {};
  return buildCmSets(window._itmList || [], d.invertirNConectores).cmConSet;
}
function _buildCmRegConSet() {
  var d = window._panelBusbarData || {};
  return buildCmSets(window._itmList || [], d.invertirNConectores).cmRegConSet;
}
function _getConY(conIndex, startY, cmConSet, cmRegConSet) {
  return getConY(conIndex, startY, cmConSet, cmRegConSet);
}



function _polosPosiblesEnSlot(conIndex, side) {
  var d = window._panelBusbarData;
  if (!d || !d.ciclo) return [];



  var ops = itmPolosPermitidos(d);
  var out = [];
  for (var i = 0; i < ops.length; i++) {
    if (_verificarPolosLibres(conIndex, ops[i], side)) out.push(ops[i]);
  }
  return out;
}

function _verificarPolosLibres(conIndex, numPolos, side, invertirN) {
  return verificarPolosLibres(conIndex, numPolos, side,
    window._itmList || [], window._panelBusbarData || {}, invertirN).libre;
}



function _duenoDelN(slot) {
  var d = window._panelBusbarData || {}, lista = window._itmList || [];
  for (var i = 0; i < lista.length; i++) {
    var it = lista[i];
    if (!it.tieneConN) continue;
    var effInv = (!!d.invertirNConectores) !== (!!it.invertirN);
    var nPh = (parseInt(it.polos, 10) || 2) - 1;
    var nIdx = effInv ? (parseInt(it.conIndex, 10) + nPh) : (parseInt(it.conIndex, 10) - 1);
    if (nIdx === slot) return it.rotulo;
  }
  return null;
}







function _explicarPolosBloqueados(conIndex, side, opciones) {
  var d = window._panelBusbarData || {}, lista = window._itmList || [];
  var partes = [], porN = false;
  for (var i = 0; i < opciones.length; i++) {
    var p = opciones[i];
    var r = verificarPolosLibres(conIndex, p, side, lista, d, false);
    if (r.libre) continue;
    var raz = String(r.razon || ''), m, txt;
    if ((m = raz.match(/^Slot (\d+) es N/))) {
      var due = _duenoDelN(parseInt(m[1], 10));
      txt = 'cae sobre el conector N' + (due ? ' de ' + due : '');
      porN = true;
    } else if ((m = raz.match(/ocupad[oa] por (C-\d+)/))) {
      txt = 'pisa a ' + m[1];
    } else if (/termina antes/.test(raz)) {
      txt = 'la corrida termina antes';
    } else if ((m = raz.match(/partiría en dos a (C-\d+)/))) {
      txt = 'su N partiría a ' + m[1];
    } else if (/debe ser R|R\+1|R\+2/.test(raz)) {
      txt = 'tiene que arrancar en R';
    } else {
      txt = raz;
    }
    partes.push(p + 'P: ' + txt);
  }
  var out = partes.join(' · ');
  if (porN) out += ' — para 3P o 4P, arrancá en una R con S y T libres debajo';
  return out;
}
function _mostrarNotaPolos(texto) {
  var el = document.getElementById('modalITM_polos_nota');
  if (!el) return;
  el.textContent = texto || '';
  el.style.display = texto ? '' : 'none';
}


function _pulseTri(tri)   { if (tri && tri.classList) tri.classList.add('tri-pulse'); }
function _unpulseTri(tri) { if (tri && tri.classList) tri.classList.remove('tri-pulse'); }





function _unpulseTodos() {
  document.querySelectorAll('.tri-pulse').forEach(function(t) { t.classList.remove('tri-pulse'); });
}
function _findItmTri(itmId) {
  var c = document.getElementById('panel_busbar_container');
  return c ? c.querySelector('.itm-tri[data-itm-id="' + itmId + '"]') : null;
}


function _getTriangleData(triImg) {
  return {
    conIndex: parseInt(triImg.dataset.conIndex, 10),
    side: triImg.dataset.side,
    fase: triImg.dataset.fase,
    conX: parseFloat(triImg.dataset.conX),
    conY: parseFloat(triImg.dataset.conY),
    conW: parseFloat(triImg.dataset.conW),
    conH: parseFloat(triImg.dataset.conH)
  };
}

function onTriangleClick(triImg) {

  if (_modoCopiaActivo) {
    if (triImg.classList.contains('modo-copia-target')) {
      _insertarITMDesdeTriangulo(triImg);
    } else {




      _hintCopiaError(_motivoNoTarget(triImg));
    }
    return;
  }
  if (triImg.classList.contains('tri-insertado')) return;
  _mostrarMenuTriangulo(triImg);
}

function _mostrarMenuTriangulo(triImg) {
  _cerrarMenuTriangulo();

  var menu = document.createElement('div');
  menu.className = 'dif-context-menu';
  menu.id = 'tri_context_menu';

  var btnAgregar = document.createElement('button');
  btnAgregar.className = 'dif-context-btn';
  btnAgregar.textContent = 'Agregar';
  btnAgregar.addEventListener('click', function() {
    _cerrarMenuTriangulo();
    _unpulseTri(_itmClickedTriangle);
    _itmClickedTriangle = triImg;
    _pulseTri(triImg);
    abrirModalITM(triImg);
  });

  var btnAnular = document.createElement('button');
  btnAnular.className = 'dif-context-btn';
  btnAnular.textContent = 'Anular';
  btnAnular.addEventListener('click', function() { _cerrarMenuTriangulo(); });

  menu.appendChild(btnAgregar);
  menu.appendChild(btnAnular);


  var side = triImg.dataset.side;
  _abrirMenuTriangulo(menu, triImg, { lado: side === 'left' ? 'left' : 'right',
                                      centrado: true });
}



function _cerrarMenuTriangulo() {
  _cerrarMenusTriangulo();
}



function _tituloModalITM(t) {
  var h = document.querySelector('#modalITM_overlay .modal-titulo');
  if (h) h.textContent = t;
}


function abrirModalITM(triImg) {
  _itmEditandoId = null;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalITM_overlay').classList.add('activo');


  _ponerRotuloModalITM('C-' + String(_itmNextRotulo).padStart(2, '0'), true);


  _itmLibreEditandoId = null;
  var _cardUb = document.getElementById('modalITM_card_ubicacion');
  if (_cardUb) _cardUb.style.display = '';
  setITMUbicacion('busbar');



  var data = _getTriangleData(triImg);
  var d_pb = window._panelBusbarData;
  _mostrarNotaPolos(_explicarPolosBloqueados(data.conIndex, data.side, itmPolosPermitidos(d_pb)));

  document.getElementById('modalITM_tipo').value = 'riel';
  document.getElementById('wrap_itm_capacidad').style.display = '';
  document.getElementById('modalITM_error').textContent = '';

  _aplicarRestriccionTipoLado(data.side, null);


  var _tSel = document.getElementById('modalITM_tipo');
  if (!_itmPolosQueEntran(_tSel.value).length) {
    for (var _to = 0; _to < _tSel.options.length; _to++) {
      if (_itmPolosQueEntran(_tSel.options[_to].value).length) { _tSel.value = _tSel.options[_to].value; break; }
    }
  }
  onITMTipoChange();


  var invN = document.getElementById('modalITM_invertirN');
  if (invN) invN.checked = false;
  _actualizarInvertirNITM();

  if (typeof _regIniciar === 'function')
    _regIniciar('modalITM_regulacion', null, document.getElementById('modalITM_capacidad').value);
  _regITM();

  var btn = document.getElementById('modalITM_btnGuardar');
  if (btn) btn.textContent = 'Insertar';
  _tituloModalITM('Insertar ITM');
}





function abrirModalITMLibre() {
  if (!window._panelBusbarData) {
    _avisoFlotante('Primero inserta el Panel Busbar.');
    return;
  }

  if (typeof _unpulseTri === 'function') {
    _unpulseTri(_itmClickedTriangle);
    if (_itmEditandoId != null) _unpulseTri(_findItmTri(_itmEditandoId));
  }
  _itmEditandoId = null;
  _itmLibreEditandoId = null;
  _itmClickedTriangle = null;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalITM_overlay').classList.add('activo');
  document.getElementById('modalITM_error').textContent = '';
  _mostrarNotaPolos('');
  _ponerRotuloModalITM('C-' + String(_itmNextRotulo).padStart(2, '0'), true);

  var cardU = document.getElementById('modalITM_card_ubicacion');
  if (cardU) cardU.style.display = 'none';
  var invN = document.getElementById('modalITM_invertirN');
  if (invN) invN.checked = false;
  document.getElementById('modalITM_tipo').value = 'riel';
  setITMUbicacion('libre');

  if (typeof _regIniciar === 'function')
    _regIniciar('modalITM_regulacion', null, document.getElementById('modalITM_capacidad').value);
  _regITM();

  var btn = document.getElementById('modalITM_btnGuardar');
  if (btn) btn.textContent = 'Insertar';
  _tituloModalITM('Insertar ITM');
}






var _itmClaseFila = null;
function _itmClaseFilaOpuesta(side, excluirId) {
  var conIdx = _itmClickedTriangle ? parseInt(_itmClickedTriangle.dataset.conIndex) : -1;
  if (conIdx < 0) return null;
  var op = (side === 'left') ? 'right' : 'left';
  var inv = !!(window._panelBusbarData && window._panelBusbarData.invertirNConectores);
  var clase = null;
  (window._itmList || []).forEach(function(it) {
    if (clase || it.id === excluirId || it.side !== op) return;
    var rg = rangoOcupado(it, inv);
    if (conIdx >= rg.start && conIdx < rg.end) clase = clasificarTamanoITM(it) || 'riel';
  });
  return clase;
}




function _itmPolosQueEntran(tipo) {
  var d = window._panelBusbarData;
  if (typeof _itmUbicacion !== 'undefined' && _itmUbicacion === 'libre') return [1, 2, 3, 4];
  var cap = (document.getElementById('modalITM_capacidad') || {}).value;
  var tamano = null;
  if (tipo === 'reserva') {
    var wT = document.getElementById('wrap_reserva_tamano');
    var eT = document.getElementById('modalITM_reserva_tamano');
    tamano = (wT && wT.style.display !== 'none' && eT) ? eT.value : _itmClaseFila;
  }
  if (tipo === 'cm_fijo' && _itmClaseFila === 'cm_reg') cap = cap && parseInt(cap, 10) >= 125 ? cap : '125';
  var lista = itmPolosPermitidos(d, tipo, { capacidad: cap, tamano: tamano });
  if (_itmEditandoId) {
    var it = null;
    (window._itmList || []).forEach(function(i) { if (i.id === _itmEditandoId) it = i; });
    var pa = it ? parseInt(it.polos, 10) : NaN;
    if (pa && it.tipo === tipo && lista.indexOf(pa) === -1) lista = lista.concat([pa]).sort();
    return lista;
  }
  if (_itmClickedTriangle) {
    var ci = parseInt(_itmClickedTriangle.dataset.conIndex), sd = _itmClickedTriangle.dataset.side;
    lista = lista.filter(function(p) { return _verificarPolosLibres(ci, p, sd); });
  }
  return lista;
}



function _itmLlenarPolos() {
  var sel = document.getElementById('modalITM_polos');
  if (!sel) return;
  var tipo = document.getElementById('modalITM_tipo').value;
  var prev = parseInt(sel.value, 10);
  var lista = _itmPolosQueEntran(tipo);
  sel.innerHTML = '';
  lista.forEach(function(p) {
    var o = document.createElement('option');
    o.value = p; o.textContent = p + 'P';
    sel.appendChild(o);
  });
  sel.disabled = false;
  if (lista.indexOf(prev) !== -1) sel.value = String(prev);
  else if ((tipo === 'cm_fijo' || tipo === 'cm_reg') && lista.indexOf(3) !== -1) sel.value = '3';
  else if (lista.length) sel.value = String(lista[0]);
  _actualizarInvertirNITM();
}

function _aplicarRestriccionTipoLado(side, excluirId) {
  var tipoSelect = document.getElementById('modalITM_tipo');





  var claseFila = _itmClaseFilaOpuesta(side, excluirId);
  _itmClaseFila = claseFila;

  var opcionesPermitidas;
  if (claseFila === 'riel') {
    opcionesPermitidas = [
      { value: 'riel', text: 'ITM Riel' },
      { value: 'reserva', text: 'Reserva' }
    ];
  } else if (claseFila === 'cm_fijo') {
    opcionesPermitidas = [
      { value: 'cm_fijo', text: 'ITM CM Fijo' },
      { value: 'reserva', text: 'Reserva' }
    ];
  } else if (claseFila === 'cm_reg') {

    opcionesPermitidas = [
      { value: 'cm_reg', text: 'ITM CM Reg' },
      { value: 'cm_fijo', text: 'ITM CM Fijo' },
      { value: 'reserva', text: 'Reserva' }
    ];
  } else {
    opcionesPermitidas = [
      { value: 'riel', text: 'ITM Riel' },
      { value: 'cm_fijo', text: 'ITM CM Fijo' },
      { value: 'cm_reg', text: 'ITM CM Reg' },
      { value: 'reserva', text: 'Reserva' }
    ];
  }


  var _d_filt = window._panelBusbarData;
  var _fases_filt = _d_filt ? _d_filt.fases : '3F';
  if (_fases_filt === '2F' || _fases_filt === '1F+N') {
    opcionesPermitidas = opcionesPermitidas.filter(function(o) { return o.value !== 'cm_reg'; });
  }

  var valorActual = tipoSelect.value;
  tipoSelect.innerHTML = '';
  opcionesPermitidas.forEach(function(o) {
    var opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.text;
    tipoSelect.appendChild(opt);
  });
  var valorValido = opcionesPermitidas.some(function(o) { return o.value === valorActual; });
  tipoSelect.value = valorValido ? valorActual : opcionesPermitidas[0].value;
}

function cerrarModalITM() {
  document.getElementById('modalITM_overlay').classList.remove('activo');
  _unpulseTri(_itmClickedTriangle);
  if (_itmEditandoId != null) _unpulseTri(_findItmTri(_itmEditandoId));
  _unpulseTodos();
  _itmClickedTriangle = null;
  _itmEditandoId = null;                                                                             


  _itmLibreEditandoId = null;
  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'none';
}


function onITMTipoChange() {
  var tipo = document.getElementById('modalITM_tipo').value;
  var polosSel = document.getElementById('modalITM_polos');

  document.getElementById('wrap_itm_capacidad').style.display = tipo === 'reserva' ? 'none' : '';


  var _capSel = document.getElementById('modalITM_capacidad');
  if (_capSel) {
    var _capPrev = _capSel.value;
    if (tipo === 'cm_fijo') {
      var _mod1HTML = '<optgroup label="Mod1 — hasta 100A">'
        + '<option value="15">15A</option><option value="16">16A</option>'
        + '<option value="20">20A</option><option value="25">25A</option>'
        + '<option value="30">30A</option><option value="32">32A</option>'
        + '<option value="40">40A</option><option value="50">50A</option>'
        + '<option value="60">60A</option><option value="75">75A</option>'
        + '<option value="80">80A</option><option value="100">100A</option>'
        + '</optgroup>';
      var _mod2HTML = '<optgroup label="Mod2 — 125A en adelante">'
        + '<option value="125">125A</option><option value="150">150A</option>'
        + '<option value="160">160A</option><option value="175">175A</option>'
        + '<option value="200">200A</option><option value="225">225A</option>'
        + '<option value="250">250A</option></optgroup>';
      var _fases_cm = window._panelBusbarData ? (window._panelBusbarData.fases || '3F') : '3F';



      var _sin2 = (_fases_cm === '2F' || _fases_cm === '1F+N');
      var _libreUb = (typeof _itmUbicacion !== 'undefined' && _itmUbicacion === 'libre');
      if (!_libreUb && _itmClaseFila === 'cm_reg' && !_sin2) _capSel.innerHTML = _mod2HTML;
      else if (_sin2 || (!_libreUb && _itmClaseFila === 'cm_fijo')) _capSel.innerHTML = _mod1HTML;
      else _capSel.innerHTML = _mod1HTML + _mod2HTML;
      _capSel.value = _capPrev;
      if (!_capSel.value) _capSel.value = _capSel.options.length ? _capSel.options[0].value : '16';
      if (_capSel.querySelector('option[value="16"]') && !_capPrev) _capSel.value = '16';
    } else if (tipo === 'cm_reg') {
      _capSel.innerHTML =
        '<option value="80">80A</option><option value="100">100A</option>'
        + '<option value="125">125A</option><option value="150">150A</option>'
        + '<option value="160">160A</option><option value="200">200A</option>'
        + '<option value="220">220A</option><option value="250">250A</option>';
      _capSel.value = _capPrev;
      if (!_capSel.value) _capSel.value = '100';
    } else {
      _capSel.innerHTML =
        '<option value="6">6A</option><option value="10">10A</option>'
        + '<option value="16">16A</option><option value="20">20A</option>'
        + '<option value="25">25A</option><option value="32">32A</option>'
        + '<option value="40">40A</option><option value="50">50A</option>'
        + '<option value="63">63A</option>';
      _capSel.value = _capPrev;
      if (!_capSel.value) _capSel.value = '16';
    }
  }


  var wrapTamano = document.getElementById('wrap_reserva_tamano');
  if (wrapTamano) {
    var mostrarTamano = false;
    if (tipo === 'reserva' && _itmClickedTriangle) {
      var _conIdxT = parseInt(_itmClickedTriangle.dataset.conIndex);
      var _sideT = _itmClickedTriangle.dataset.side;
      var _ladoOp = _sideT === 'left' ? 'right' : 'left';
      var _opLibre = true;
      (window._itmList || []).forEach(function(_itmT) {
        if (_itmT.side !== _ladoOp) return;

        var _rgT = rangoOcupado(_itmT, !!(window._panelBusbarData && window._panelBusbarData.invertirNConectores));
        var _rs = _rgT.start, _re = _rgT.end - 1;
        if (_conIdxT >= _rs && _conIdxT <= _re) _opLibre = false;
      });
      mostrarTamano = _opLibre;
    }
    wrapTamano.style.display = mostrarTamano ? '' : 'none';
  }


  _itmLlenarPolos();
  if (tipo === 'cm_fijo') onITMPolosChange();
  _regITM();
}


function _actualizarInvertirNITM() {
  var wrap = document.getElementById('modalITM_invertirN_wrap');
  if (!wrap) return;
  var pb = window._panelBusbarData;
  if (!pb) { wrap.style.display = 'none'; return; }
  var fases = pb.fases || '';
  var subfases = pb.subfases || '';
  var polos = parseInt((document.getElementById('modalITM_polos') || {}).value, 10);
  var visible = false;
  if (fases === '1F+N' && subfases.indexOf('-N') !== -1 && polos === 2) visible = true;
  if (fases === '3F+N' && subfases === 'R - S - T - N' && (polos === 2 || polos === 4)) visible = true;
  wrap.style.display = visible ? '' : 'none';
  if (visible) _actualizarPreviewInvertirN();
}


function _actualizarPreviewInvertirN() {
  var preview = document.getElementById('modalITM_invertirN_preview');
  if (!preview) return;
  preview.innerHTML = '';
  var pb = window._panelBusbarData;
  if (!pb) return;
  var polos = parseInt((document.getElementById('modalITM_polos') || {}).value, 10);
  if (isNaN(polos)) return;

  var fase = 'R';
  if (_itmEditandoId) {
    var itmEd = (window._itmList || []).find(function(i) { return i.id === _itmEditandoId; });
    if (itmEd) fase = itmEd.fase || 'R';
  } else if (_itmClickedTriangle) {
    fase = _itmClickedTriangle.dataset.fase || 'R';
  }

  var ordenDefault;
  if (polos === 2)      ordenDefault = ['N', fase];
  else if (polos === 4) ordenDefault = ['N', 'R', 'S', 'T'];
  else return;

  var panelInv = !!pb.invertirNConectores;
  var chk = document.getElementById('modalITM_invertirN');
  var itmInv = !!(chk && chk.checked);
  var effInv = (panelInv !== itmInv);

  var orden;
  if (polos === 2) orden = effInv ? [ordenDefault[1], ordenDefault[0]] : ordenDefault;
  else             orden = effInv ? ['R', 'S', 'T', 'N'] : ['N', 'R', 'S', 'T'];

  orden.forEach(function(f) {
    var sq = document.createElement('div');
    sq.style.cssText = 'width:14px;height:14px;background:' + (BUSBAR_COLORS[f] || '#ccc') +
                       ';border:1px solid #555;border-radius:2px;';
    sq.title = f;
    preview.appendChild(sq);
  });
}

function onITMPolosChange() {
  _actualizarInvertirNITM();
  var tipo = document.getElementById('modalITM_tipo').value;
  if (tipo !== 'cm_fijo') return;
  var polos = parseInt(document.getElementById('modalITM_polos').value, 10);
  if (isNaN(polos)) return;
  var capSel = document.getElementById('modalITM_capacidad');
  if (!capSel) return;
  var capActual = parseInt(capSel.value, 10);
  var isMod2actual = capActual >= 125;
  var ocultarMod2 = (polos < 3);
  if (ocultarMod2 && isMod2actual) {
    var opts = capSel.querySelectorAll('option');
    for (var oi = 0; oi < opts.length; oi++) {
      if (parseInt(opts[oi].value, 10) < 125) { capSel.value = opts[oi].value; break; }
    }
  }

  var grps = capSel.querySelectorAll('optgroup');
  for (var gi = 0; gi < grps.length; gi++) {
    var lbl = grps[gi].label || '';
    if (lbl.indexOf('Mod2') !== -1 || lbl.indexOf('125') !== -1) {
      grps[gi].querySelectorAll('option').forEach(function(o) { o.disabled = ocultarMod2; });
      grps[gi].style.color = ocultarMod2 ? '#555' : '';
    }
  }
}

function _regITM() {
  if (typeof _regSync === 'function')
    _regSync(document.getElementById('modalITM_tipo').value, 'modalITM_capacidad', 'wrap_itm_regulacion', 'modalITM_regulacion');
}
function onITMCapacidadChange() {
  _regITM();
  var tipo = document.getElementById('modalITM_tipo').value;
  if (tipo !== 'cm_fijo') return;
  var capSel = document.getElementById('modalITM_capacidad');
  if (!capSel) return;

  _itmLlenarPolos();
}

function onITMTamanoChange() {
  var tipo = document.getElementById('modalITM_tipo').value;
  if (tipo !== 'reserva') return;
  var wrapT = document.getElementById('wrap_reserva_tamano');
  var tamanoEl = document.getElementById('modalITM_reserva_tamano');
  if (!tamanoEl || !wrapT || wrapT.style.display === 'none') return;

  _itmLlenarPolos();
}


function _insertarConectorNExtra(itmData) {
  var d = window._panelBusbarData;
  if (!d) return;

  itmData.tieneConN = true;
  var plan = calcSpliceN(itmData, d, window._itmList || []);


  if (plan.ok === false) {
    itmData.tieneConN = false;
    var _errMsg = plan.error || 'No se puede insertar el conector N en esta posición';
    var errEl = document.getElementById('modalITM_error');
    if (errEl) errEl.textContent = _errMsg;
    itmData._spliceRejected = true;
    itmData._spliceError = _errMsg;
    return;
  }

  d.ciclo = plan.newCiclo;
  d.aisladoTipo = plan.newAisladoTipo;

  if (plan.itmShifts && plan.itmShifts.length > 0) {
    var shiftMap = {};
    plan.itmShifts.forEach(function(s) { shiftMap[s.id] = s.newConIndex; });
    (window._itmList || []).forEach(function(itm) {
      if (shiftMap[itm.id] !== undefined) itm.conIndex = shiftMap[itm.id];
    });
  }
  itmData.conIndex = plan.newItmConIndex;


  dibujarPanelBusbar();
}


function confirmarModalITM() {

  if (window._confirmarModalITM_running) return;
  window._confirmarModalITM_running = true;




  var _snapEdit = null, _editOk = false;
  var _btnG = document.getElementById('modalITM_btnGuardar');
  if (_btnG) { _btnG.disabled = true; _btnG.style.opacity = '0.6'; }

  try {
    var errEl = document.getElementById('modalITM_error');
    errEl.textContent = '';



    if (_itmLibreEditandoId) {
      if (_guardarITMLibreEditado()) return;
      errEl.textContent = 'Revisá tipo y polos';
      return;
    }



    if (_itmEditandoId) {
      var _oldItm = null;
      window._itmList.forEach(function(i) { if (i.id === _itmEditandoId) _oldItm = i; });
      var _editConIndex = _oldItm ? parseInt(_oldItm.conIndex) : null;
      var _editSide = _oldItm ? _oldItm.side : null;
      if (_oldItm) {
        var _pbE = window._panelBusbarData || null;
        _snapEdit = {
          editId: _itmEditandoId,
          viejo: JSON.parse(JSON.stringify(_oldItm)),
          lista: JSON.parse(JSON.stringify(window._itmList)),
          ciclo: (_pbE && _pbE.ciclo) ? _pbE.ciclo.slice() : null,
          aislado: _pbE ? _pbE.aisladoTipo : null,
          grupos: JSON.parse(JSON.stringify(window._BORNERAS_GRUPOS || [])),
          canaletas: JSON.parse(JSON.stringify(window._CANALETAS_ITM || {}))
        };
      }
      var _cicloLenAntes = (window._panelBusbarData && window._panelBusbarData.ciclo)
        ? window._panelBusbarData.ciclo.length : 0;
      eliminarITM(_itmEditandoId);
      _itmEditandoId = null;




      var _cicloLenDesp = (window._panelBusbarData && window._panelBusbarData.ciclo)
        ? window._panelBusbarData.ciclo.length : 0;
      if (_oldItm && _oldItm.tieneConN && _cicloLenDesp < _cicloLenAntes && _editConIndex !== null) {
        var _pbInvE = !!(window._panelBusbarData && window._panelBusbarData.invertirNConectores);
        var _effInvE = _pbInvE !== !!_oldItm.invertirN;
        if (!_effInvE) _editConIndex -= 1;
      }
      if (_editConIndex !== null && _editSide !== null) {
        var _ctr = document.getElementById('panel_busbar_container');
        if (_ctr) {
          var _tris = _ctr.querySelectorAll('.tri-clickeable');
          for (var _ti = 0; _ti < _tris.length; _ti++) {
            if (parseInt(_tris[_ti].dataset.conIndex) === _editConIndex &&
                _tris[_ti].dataset.side === _editSide) {
              _itmClickedTriangle = _tris[_ti];
              break;
            }
          }
        }
      }
    }

    var rotulo = document.getElementById('modalITM_rotulo').textContent;
    var tipo = document.getElementById('modalITM_tipo').value;
    var polos = parseInt(document.getElementById('modalITM_polos').value, 10);
    var capacidad = (tipo !== 'reserva') ? document.getElementById('modalITM_capacidad').value : null;
    var regulacion = (tipo === 'cm_reg' && typeof _regLeer === 'function')
      ? _regLeer('modalITM_regulacion', capacidad) : null;

    var tamano = null;
    if (tipo === 'reserva') {
      var wrapT = document.getElementById('wrap_reserva_tamano');
      var tamanoEl = document.getElementById('modalITM_reserva_tamano');
      if (wrapT && wrapT.style.display !== 'none' && tamanoEl) tamano = tamanoEl.value;
    }

    if (!rotulo) { errEl.textContent = 'Selecciona un rótulo'; return; }
    if (!tipo) { errEl.textContent = 'Selecciona un tipo válido'; return; }
    if (isNaN(polos)) { errEl.textContent = 'Selecciona polos'; return; }





    if (_itmUbicacion === 'libre') {
      var itmLibre = {
        id: 'itm_' + Date.now(),
        rotulo: rotulo, tipo: tipo, polos: polos,
        capacidad: capacidad, tamano: tamano,
        regulacion: regulacion,
        libre: true
      };
      window._itmLibres = window._itmLibres || [];
      _intercambiarRotuloITM(rotulo, itmLibre.id);
      window._bornEsperandoLugar = true;
      window._itmLibres.push(itmLibre);
      _editOk = true;
      _avanzarRotuloITM();
      cerrarModalITM();
      if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
      if (typeof guardarSesion === 'function') guardarSesion();
      if (typeof iniciarUbicacionBorneras === 'function') {


        iniciarUbicacionBorneras(itmLibre.id, 'itm', function() {
          if (typeof eliminarITMLibre === 'function') eliminarITMLibre(itmLibre.id);
        });
      }
      return;
    }

    if (!_itmClickedTriangle) { errEl.textContent = 'Sin conector origen'; return; }

    var triData = _getTriangleData(_itmClickedTriangle);


    var _invNChk = document.getElementById('modalITM_invertirN');
    var _invNWrap = document.getElementById('modalITM_invertirN_wrap');
    var _itmInvertirN = !!(_invNChk && _invNChk.checked &&
                           _invNWrap && _invNWrap.style.display !== 'none');

    var itmData = {
      id: 'itm_' + Date.now(),
      rotulo: rotulo,
      tipo: tipo,
      polos: polos,
      capacidad: capacidad,
      tamano: tamano,
      regulacion: regulacion,
      invertirN: _itmInvertirN,
      conIndex: triData.conIndex,
      side: triData.side,
      fase: triData.fase,
      conX: triData.conX,
      conY: triData.conY,
      conW: triData.conW,
      conH: triData.conH
    };



    var d_pb = window._panelBusbarData;
    var _sub = d_pb ? (d_pb.subfases || '') : '';
    var is3FN_4P = d_pb && d_pb.fases === '3F+N' && polos === 4 && _sub !== 'R - S - T';
    var is3FN_2P = d_pb && d_pb.fases === '3F+N' && polos === 2 && _sub !== 'R - S - T';
    var necesitaSpliceN = is3FN_4P || is3FN_2P;





    if (!necesitaSpliceN && d_pb && d_pb.ciclo && (itmData.conIndex + polos > d_pb.ciclo.length)) {
      errEl.textContent = 'No hay espacio: ' + polos + 'P excede los conectores disponibles';
      return;
    }




    var _chk = verificarPolosLibres(itmData.conIndex, polos, itmData.side,
      window._itmList || [], d_pb || {}, _itmInvertirN);
    if (!_chk.libre) { errEl.textContent = _chk.razon; return; }

    var _chkComp = verificarSlotTipoCompatible(itmData, itmData.conIndex, itmData.side,
      window._itmList || [], d_pb || {});
    if (!_chkComp.compatible) {
      errEl.textContent = 'Slot incompatible: el lado opuesto usa otro tamaño de conector';
      return;
    }

    if (necesitaSpliceN) {
      _insertarConectorNExtra(itmData);
      if (itmData._spliceRejected) return;                                 

      var d_after = window._panelBusbarData;
      var usarAis4f_r = _isAis4fDrawing(d_after);
      var aisH_r = usarAis4f_r ? 145 : 140;
      var aisW_r = usarAis4f_r ? 715 : 650;
      var CV_INNER_r = CV_TOP_PX - (PB_INSET_MM / PX_TO_MM);
      var conectoresStartY_r = CV_INNER_r + (window._igExtraTop || 0) + aisH_r;
      var newIdx = parseInt(itmData.conIndex);
      var _cmS = _buildCmConSet();
      var _cmRS = _buildCmRegConSet();
      var _isCMReg = !!(_cmRS[newIdx]);
      var _isCM = !_isCMReg && !!(_cmS[newIdx]);
      itmData.conW = _isCMReg ? CM_REG_CON_W : (_isCM ? CM_CON_W : (RIEL_CON_W || 115));
      itmData.conH = _isCMReg ? CM_REG_CON_H : (_isCM ? CM_CON_H : 90);
      itmData.conX = (aisW_r - itmData.conW) / 2;
      itmData.conY = _getConY(newIdx, conectoresStartY_r, _cmS, _cmRS);
    }






    var _difQuitado = false;
    if (_snapEdit) {
      var _v = _snapEdit.viejo;
      itmData.id = _v.id;





      if (_v.contactor && (itmData.tipo !== 'reserva' || _v.tipo === 'reserva')) itmData.contactor = _v.contactor;



      if (_v.dps) itmData.dps = _v.dps;
      if (_v.pulsador && itmData.contactor) itmData.pulsador = _v.pulsador;
      window._BORNERAS_GRUPOS = _snapEdit.grupos;
      window._CANALETAS_ITM = _snapEdit.canaletas;


      if (itmData.dps && typeof _dpsAjustarAlITM === 'function') _dpsAjustarAlITM(itmData, _v.polos);


      if (_v.contactor && !itmData.contactor && typeof _bornerasBorrarTimersDe === 'function') {
        _bornerasBorrarTimersDe(_v.id);
      }

      if (_v.contactor && !itmData.contactor) _canaletaQuitarFilaContactor(_v.id);
    }

    _intercambiarRotuloITM(itmData.rotulo, itmData.id);



    var _posEdit = -1;
    if (_snapEdit) {
      for (var _pe = 0; _pe < _snapEdit.lista.length; _pe++) {
        if (_snapEdit.lista[_pe].id === _snapEdit.viejo.id) { _posEdit = _pe; break; }
      }
    }
    if (_posEdit >= 0 && _posEdit <= window._itmList.length) window._itmList.splice(_posEdit, 0, itmData);
    else window._itmList.push(itmData);
    if (_snapEdit && _snapEdit.viejo.dif) {
      var _vD = _snapEdit.viejo;
      if (_itmPuedeUsarDIF(itmData)) {
        itmData.dif = _vD.dif;

        itmData.dif.polos = (parseInt(itmData.polos, 10) <= 2) ? 2 : 4;
      } else {
        _difQuitado = true;


        if (itmData.contactor && itmData.contactor.padre === 'dif') itmData.contactor.padre = 'itm';
      }
    }
    _dpsReengancharPadre(itmData);
    _editOk = true;
    if (_snapEdit && typeof _bornerasLimpiarHuerfanas === 'function') _bornerasLimpiarHuerfanas();
    if (_difQuitado && typeof _avisoFlotante === 'function') {
      _avisoFlotante('Se quitó el diferencial: el nuevo tipo de ITM no lo admite.');
    }
    _avanzarRotuloITM();






    cerrarModalITM();
    _conReglas(function() {
      dibujarPanelBusbar();

      guardarSesion();
    });
  } finally {


    if (_snapEdit && !_editOk) {
      window._itmList = _snapEdit.lista;
      if (window._panelBusbarData) {
        if (_snapEdit.ciclo) window._panelBusbarData.ciclo = _snapEdit.ciclo;
        window._panelBusbarData.aisladoTipo = _snapEdit.aislado;
      }
      window._BORNERAS_GRUPOS = _snapEdit.grupos;
      window._CANALETAS_ITM = _snapEdit.canaletas;
      _itmEditandoId = _snapEdit.editId;
      try { dibujarPanelBusbar(); } catch (e) { console.warn('[confirmarModalITM] restaurar:', e); }
    }
    window._confirmarModalITM_running = false;
    var _btnG2 = document.getElementById('modalITM_btnGuardar');
    if (_btnG2) { _btnG2.disabled = false; _btnG2.style.opacity = ''; }
  }
}




function _itmBodyYReal(itm, conHOverride) {
  var d = window._panelBusbarData;
  var effInvN = !!(d && d.invertirNConectores) !== !!(itm.invertirN);
  var _h = (typeof conHOverride === 'number') ? conHOverride : (parseFloat(itm.conH) || 90);
  var _y = parseFloat(itm.conY);
  return (itm.tieneConN && !effInvN) ? (_y - _h) : _y;
}

function _dibujarITM(itm) {
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;

  var d = window._panelBusbarData;
  var usarAis4f = _isAis4fDrawing(d);
  var aisNatW = usarAis4f ? 715 : 650;

  var conW = itm.conW;
  var conH = itm.conH;
  var gap = 0;


  if (itm.tipo === 'reserva') {
    var _cmSet_cw = _buildCmConSet();
    var _cmRegSet_cw = _buildCmRegConSet();
    var _slotIdx_cw = parseInt(itm.conIndex);
    if (_cmRegSet_cw[_slotIdx_cw])   conW = CM_REG_CON_W;
    else if (_cmSet_cw[_slotIdx_cw]) conW = CM_CON_W;
    else                             conW = RIEL_CON_W || 115;
  } else if (itm.tipo === 'cm_reg') {
    conW = CM_REG_CON_W;
  } else if (itm.tipo === 'cm_fijo') {
    conW = (parseInt(itm.capacidad, 10) >= 125) ? CM_REG_CON_W : CM_CON_W;
  } else {
    conW = RIEL_CON_W || 115;
  }
  itm.conW = conW;
  itm.conX = (aisNatW - conW) / 2;


  var _dimTipo;
  if (itm.tipo === 'reserva') {
    var _cmSet_dt = _buildCmConSet();
    var _cmRegSet_dt = _buildCmRegConSet();
    var _slotIdx_dt = parseInt(itm.conIndex);
    if (_cmRegSet_dt[_slotIdx_dt])   _dimTipo = 'cm_reg';
    else if (_cmSet_dt[_slotIdx_dt]) _dimTipo = 'cm_fijo';
    else                             _dimTipo = 'riel';
  } else {
    _dimTipo = itm.tipo;
  }

  var itmNatW, itmNatH, scaleF, itmVisW, itmVisH;
  if (_dimTipo === 'cm_reg') {
    itmNatW = (itm.polos * 35) / PX_TO_MM;                        
    itmNatH = 161 / PX_TO_MM;                          
    scaleF = 1;
    itmVisW = itmNatH;
    itmVisH = itmNatW;
  } else if (_dimTipo === 'cm_fijo') {
    var _isMod2 = parseInt(itm.capacidad, 10) >= 125;
    if (_isMod2) {
      itmNatW = (itm.polos * 35) / PX_TO_MM;
      itmNatH = 165 / PX_TO_MM;            
    } else {
      itmNatW = (itm.polos * 25) / PX_TO_MM;
      itmNatH = 130 / PX_TO_MM;            
    }
    scaleF = 1;
    itmVisW = itmNatH;
    itmVisH = itmNatW;
  } else {

    itmNatW = 90 * itm.polos;
    itmNatH = 425;
    scaleF = conH / 90;
    itmVisW = itmNatH * scaleF;
    itmVisH = itmNatW * scaleF;
  }

  var itmY = _itmBodyYReal(itm, conH);
  var itmX = (itm.side === 'left')
    ? itm.conX - itmVisW - gap
    : itm.conX + conW + gap;

  if (itm.tipo === 'reserva') {
    var reservaDiv = document.createElement('div');
    reservaDiv.className = 'itm-img itm-reserva';
    reservaDiv.dataset.itmId = itm.id;
    reservaDiv.style.position = 'absolute';
    reservaDiv.style.left = itmX + 'px';
    reservaDiv.style.top = itmY + 'px';
    reservaDiv.style.width = itmVisW + 'px';
    reservaDiv.style.height = itmVisH + 'px';
    reservaDiv.textContent = 'Reserva';
    reservaDiv.style.zIndex = '10';
    container.appendChild(reservaDiv);
  } else {
    var svgFile;
    if (itm.tipo === 'cm_reg') {
      svgFile = 'itm' + itm.polos + 'p_cm_reg-vf.svg';
    } else if (itm.tipo === 'cm_fijo') {
      var _mod2draw = parseInt(itm.capacidad, 10) >= 125;
      svgFile = 'itm' + itm.polos + 'p_cm_fijo_' + (_mod2draw ? 'mod2' : 'mod1') + '-vf.svg';
    } else {
      svgFile = 'itm' + itm.polos + 'p_riel.svg';
    }
    var imgW = itmNatW * scaleF;
    var imgH = itmNatH * scaleF;
    var cx = itmX + itmVisW / 2;
    var cy = itmY + itmVisH / 2;
    var rot = itm.side === 'left' ? 90 : -90;
    var img = _crearImg('assets/panel-busbar/' + svgFile, cx - imgW / 2, cy - imgH / 2, imgW, imgH);
    img.style.transformOrigin = 'center center';
    img.style.transform = 'rotate(' + rot + 'deg)';
    img.dataset.itmId = itm.id;
    img.className = 'itm-img';
    img.style.zIndex = '10';
    container.appendChild(img);
  }


  var triItmW = 45;
  var triItmH = itmVisH;
  var triItmX;
  var esRight = itm.side !== 'left';
  triItmX = esRight ? (itmX + itmVisW + 1) : (itmX - triItmW - 1);
  var triItm = _crearImg('assets/panel-busbar/boton_trian_rojo.svg', triItmX, itmY, triItmW, triItmH);
  triItm.className = 'itm-img itm-tri' + (esRight ? ' tri-right' : '');
  triItm.dataset.itmId = itm.id;
  triItm.style.zIndex = '6';
  triItm.style.cursor = 'pointer';
  triItm.addEventListener('click', function() { onITMTriangleClick(this); });
  container.appendChild(triItm);


  var rotulo = document.createElement('div');
  rotulo.className = 'itm-rotulo';
  rotulo.dataset.itmId = itm.id;
  if (itm.side === 'left') {
    rotulo.style.left = (triItmX - 4) + 'px';
    rotulo.style.top = (itmY + itmVisH / 2) + 'px';
    rotulo.style.transform = 'translateX(-100%) translateY(-50%)';
  } else {
    rotulo.style.left = (triItmX + triItmW + 4) + 'px';
    rotulo.style.top = (itmY + itmVisH / 2) + 'px';
    rotulo.style.transform = 'translateY(-50%)';
  }
  var badge = document.createElement('div');
  badge.className = 'itm-rotulo-badge';
  badge.textContent = itm.rotulo;
  rotulo.appendChild(badge);
  container.appendChild(rotulo);
}

function _marcarTriangulosOcupados(itm) {
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;


  var d = window._panelBusbarData;
  var effInv = !!(d && d.invertirNConectores) !== !!(itm.invertirN);
  var startIdx, endIdx;
  if (itm.tieneConN && !effInv) {
    startIdx = parseInt(itm.conIndex) - 1;
    endIdx = startIdx + itm.polos;
  } else {
    startIdx = parseInt(itm.conIndex);
    endIdx = startIdx + itm.polos;
  }
  container.querySelectorAll('img[data-side="' + itm.side + '"]').forEach(function(tri) {
    var idx = parseInt(tri.dataset.conIndex, 10);
    if (idx >= startIdx && idx < endIdx) {
      tri.src = 'assets/panel-busbar/boton_trian_verde.svg';
      tri.classList.remove('tri-clickeable');
      tri.classList.add('tri-insertado');
    }
  });
}


function onITMTriangleClick(triImg) {
  var itmId = triImg.dataset.itmId;
  if (!itmId) return;


  if (typeof _modoCopiaActivoDIF !== 'undefined' && _modoCopiaActivoDIF) {
    if (triImg.classList.contains('modo-copia-target')) {
      _insertarDIFCopia(triImg);
    }
    return;
  }


  if (typeof _modoCopiaActivoContactor !== 'undefined' && _modoCopiaActivoContactor) {
    if (triImg.classList.contains('modo-copia-target')) {
      _insertarContactorCopia(triImg);
    }
    return;
  }

  _cerrarMenuTriangulo();
  var prev = document.getElementById('itm_context_menu');
  if (prev) prev.remove();

  var itm = null;
  window._itmList.forEach(function(i) { if (i.id === itmId) itm = i; });
  var side = itm ? itm.side : 'left';

  var menu = document.createElement('div');
  menu.id = 'itm_context_menu';
  menu.className = 'dif-context-menu';


  var btnAgregar = document.createElement('button');
  btnAgregar.className = 'dif-context-btn';
  btnAgregar.textContent = 'Agregar';
  btnAgregar.addEventListener('click', function() {
    menu.remove();
    if (typeof abrirModalEquipo === 'function') abrirModalEquipo(itmId);
  });
  menu.appendChild(btnAgregar);





  if (itm && _hayDestinosCopiaValidosITM(itm)) {
    var btnCopiar = document.createElement('button');
    btnCopiar.className = 'dif-context-btn';
    btnCopiar.textContent = 'Copiar ' + itm.rotulo;
    btnCopiar.addEventListener('click', function() {
      menu.remove();
      _activarModoCopia(itmId);
    });
    menu.appendChild(btnCopiar);
  }

  var btnEditar = document.createElement('button');
  btnEditar.className = 'dif-context-btn';
  btnEditar.textContent = 'Editar';
  btnEditar.addEventListener('click', function() {
    menu.remove();
    editarITM(itmId);
  });
  menu.appendChild(btnEditar);

  var btnEliminar = document.createElement('button');
  btnEliminar.className = 'dif-context-btn';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.style.color = '#ff6b6b';
  btnEliminar.addEventListener('click', function() {
    menu.remove();
    eliminarITM(itmId);
    guardarSesion();
  });
  menu.appendChild(btnEliminar);

  _abrirMenuTriangulo(menu, triImg, { lado: side === 'left' ? 'left' : 'right',
                                         centrado: true });
}


function editarITM(itmId) {
  var itm = null;
  window._itmList.forEach(function(i) { if (i.id === itmId) itm = i; });
  if (!itm) return;

  _itmEditandoId = itmId;
  _itmLibreEditandoId = null;



  if (typeof _itmUbicacion !== 'undefined') _itmUbicacion = 'busbar';
  var _segUb = document.querySelectorAll('#modalITM_ubicacion .seg-btn');
  _segUb.forEach(function(b) { b.classList.toggle('activo', b.dataset.val === 'busbar'); });
  _mostrarNotaPolos('');                                                    


  var container = document.getElementById('panel_busbar_container');
  var tris = container.querySelectorAll('.tri-insertado, .tri-clickeable');
  _unpulseTri(_itmClickedTriangle);
  tris.forEach(function(tri) {
    if (parseInt(tri.dataset.conIndex) === parseInt(itm.conIndex) && tri.dataset.side === itm.side) {
      _itmClickedTriangle = tri;
    }
  });
  _pulseTri(_itmClickedTriangle);
  _pulseTri(_findItmTri(itmId));

  var sp = document.getElementById('sidepanel');
  if (sp) sp.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalITM_overlay').classList.add('activo');

  _ponerRotuloModalITM(itm.rotulo, false);
  var _tipoEdit = (itm.tipo === 'reserva' || itm.tipo === 'cm_fijo' || itm.tipo === 'cm_reg') ? itm.tipo : 'riel';
  document.getElementById('modalITM_tipo').value = _tipoEdit;
  _aplicarRestriccionTipoLado(itm.side, itmId);



  var _tipoSel = document.getElementById('modalITM_tipo');
  var _existe = false;
  for (var _toi = 0; _toi < _tipoSel.options.length; _toi++) {
    if (_tipoSel.options[_toi].value === _tipoEdit) { _existe = true; break; }
  }
  if (!_existe) {
    var _opt = document.createElement('option');
    _opt.value = _tipoEdit;
    _opt.textContent = ({
      riel: 'ITM Riel', cm_fijo: 'ITM CM Fijo', cm_reg: 'ITM CM Reg', reserva: 'Reserva'
    })[_tipoEdit] || _tipoEdit;
    _tipoSel.appendChild(_opt);
  }
  _tipoSel.value = _tipoEdit;
  onITMTipoChange();

  if (itm.tipo === 'reserva' && itm.tamano) {
    var tamanoEl = document.getElementById('modalITM_reserva_tamano');
    if (tamanoEl) tamanoEl.value = itm.tamano;
  }


  if (itm.capacidad) {
    var _capSel = document.getElementById('modalITM_capacidad');
    if (_capSel) _capSel.value = itm.capacidad;
  }



  var polosSel = document.getElementById('modalITM_polos');
  polosSel.value = '';
  _itmLlenarPolos();
  polosSel.value = itm.polos;
  if (!polosSel.value && polosSel.options.length > 0) {
    polosSel.value = polosSel.options[polosSel.options.length - 1].value;
  }
  if (_tipoEdit === 'cm_fijo') onITMPolosChange();


  var _invN = document.getElementById('modalITM_invertirN');
  if (_invN) _invN.checked = !!itm.invertirN;
  _actualizarInvertirNITM();

  if (typeof _regIniciar === 'function')
    _regIniciar('modalITM_regulacion', itm.tipo === 'cm_reg' ? itm.regulacion : null,
                document.getElementById('modalITM_capacidad').value);
  _regITM();

  document.getElementById('modalITM_error').textContent = '';
  var btn = document.getElementById('modalITM_btnGuardar');
  if (btn) btn.textContent = "Guardar cambios";
  _tituloModalITM('Editar ITM');
}


function eliminarITM(itmId) {
  var itm = null, idx = -1;
  window._itmList.forEach(function(i, k) { if (i.id === itmId) { itm = i; idx = k; } });
  if (!itm || idx === -1) return;

  var container = document.getElementById('panel_busbar_container');
  if (!container) return;


  container.querySelectorAll('[data-itm-id="' + itmId + '"]').forEach(function(el) { el.remove(); });


  var conIndex = parseInt(itm.conIndex);
  var side = itm.side;
  var d = window._panelBusbarData;
  var effInv = !!(d && d.invertirNConectores) !== !!(itm.invertirN);
  var startIdx = (itm.tieneConN && !effInv) ? conIndex - 1 : conIndex;
  for (var p = startIdx; p < startIdx + itm.polos; p++) {
    container.querySelectorAll('.tri-insertado').forEach(function(tri) {
      if (parseInt(tri.dataset.conIndex) === p && tri.dataset.side === side) {
        tri.classList.remove('tri-insertado');
        tri.classList.add('tri-clickeable');
        tri.src = tri.src.replace('boton_trian_verde.svg', 'boton_trian_rojo.svg');
      }
    });
  }



  if (typeof _bornerasBorrarTimersDe === 'function') _bornerasBorrarTimersDe(itmId);

  if (typeof _bornerasBorrarClaseDe === 'function') _bornerasBorrarClaseDe(itmId, 'dps');

  window._itmList.splice(idx, 1);




  var _quedanLado = window._itmList.some(function(i) { return i.side === itm.side; });
  if (!_quedanLado && window._CANALETAS_ITM && window._CANALETAS_ITM[itm.side]) {

    if (typeof _canaletaBorrarRef === 'function') _canaletaBorrarRef('itm:' + itm.side);
    else delete window._CANALETAS_ITM[itm.side];
  }


  if (itm.tieneConN && d) {
    var _nPh = (parseInt(itm.polos, 10) || 2) - 1;
    var nIdx = effInv ? (conIndex + _nPh) : (conIndex - 1);
    var otroUsaN = false;
    window._itmList.forEach(function(otro) {
      if (!otro.tieneConN) return;
      var _effO = !!d.invertirNConectores !== !!otro.invertirN;
      var _nPhO = (parseInt(otro.polos, 10) || 2) - 1;
      var _nIdxO = _effO ? (parseInt(otro.conIndex) + _nPhO) : (parseInt(otro.conIndex) - 1);
      if (_nIdxO === nIdx) otroUsaN = true;
    });
    if (!otroUsaN && d.ciclo[nIdx] === 'N') {
      d.ciclo.splice(nIdx, 1);

      window._itmList.forEach(function(otro) {
        if (parseInt(otro.conIndex) > nIdx) otro.conIndex = parseInt(otro.conIndex) - 1;
      });
    }
  }



  dibujarPanelBusbar();
}



function _redibujarPanelConIG() { dibujarPanelBusbar(); }







var _modoCopiaActivo = false;
var _modoCopiaITM = null;

function _copiaSlotCompatible(src, conIndex, side) {
  return verificarSlotTipoCompatible(src, conIndex, side,
    window._itmList || [], window._panelBusbarData || {}).compatible;
}




function _copiaTargetValido(src, td) {
  var d_pb = window._panelBusbarData || {};
  var ciclo = d_pb.ciclo || [];
  var _sub = d_pb.subfases || '';
  var spliceN = d_pb.fases === '3F+N' && _sub !== 'R - S - T'
    && (src.polos === 4 || src.polos === 2);
  var espacio = spliceN ? Math.max(1, src.polos - 1) : src.polos;
  if (td.conIndex + espacio > ciclo.length) return false;
  return _verificarPolosLibres(td.conIndex, src.polos, td.side, !!src.invertirN)
      && _copiaSlotCompatible(src, td.conIndex, td.side);
}


function _hayDestinosCopiaValidosITM(itmSrc) {
  if (!itmSrc) return false;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return false;
  var tris = container.querySelectorAll('.tri-clickeable');
  for (var i = 0; i < tris.length; i++) {
    if (_copiaTargetValido(itmSrc, _getTriangleData(tris[i]))) return true;
  }
  return false;
}

function _activarModoCopia(itmId) {
  var itm = null;
  window._itmList.forEach(function(i) { if (i.id === itmId) itm = i; });

  if (!itm) return;
  _modoCopiaActivo = true;
  _modoCopiaITM = itm;
  _actualizarTargetsCopia();
  _mostrarHintCopia();
  document.addEventListener('keydown', _escModoCopia);
  setTimeout(function() {
    document.addEventListener('click', _clickFueraCopia);
  }, 50);
}

function _desactivarModoCopia() {
  _modoCopiaActivo = false;
  _modoCopiaITM = null;
  var container = document.getElementById('panel_busbar_container');
  if (container) {
    container.querySelectorAll('.modo-copia-target').forEach(function(tri) {
      tri.classList.remove('modo-copia-target');
    });
  }
  var hint = document.getElementById('modo_copia_hint');
  if (hint) hint.remove();
  document.removeEventListener('keydown', _escModoCopia);
  document.removeEventListener('click', _clickFueraCopia);
}

function _escModoCopia(e) {
  if (e.key === 'Escape') _desactivarModoCopia();
}

function _clickFueraCopia(e) {

  if (window._redibujoSafariEnCurso) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;

  var path = e.composedPath ? e.composedPath() : [];
  var dentro = container.contains(e.target) || path.indexOf(container) !== -1;
  if (!dentro) _desactivarModoCopia();
}


function _actualizarTargetsCopia() {
  if (!_modoCopiaITM) return;
  var container = document.getElementById('panel_busbar_container');
  if (!container) return;
  var src = _modoCopiaITM;
  container.querySelectorAll('.tri-clickeable').forEach(function(tri) {
    tri.classList.toggle('modo-copia-target', _copiaTargetValido(src, _getTriangleData(tri)));
  });
}

function _mostrarHintCopia() {
  var old = document.getElementById('modo_copia_hint');
  if (old) old.remove();
  var itm = _modoCopiaITM;
  var _tipoLbl = 'ITM Riel';
  if (itm.tipo === 'cm_fijo') {
    _tipoLbl = (parseInt(itm.capacidad, 10) >= 125) ? 'ITM CM Fijo Mod2' : 'ITM CM Fijo Mod1';
  } else if (itm.tipo === 'cm_reg') {
    _tipoLbl = 'ITM CM Reg';
  } else if (itm.tipo === 'reserva') {
    _tipoLbl = 'Reserva';
  }
  var hint = document.createElement('div');
  hint.id = 'modo_copia_hint';
  var _specs = (itm.tipo === 'reserva')
    ? (_tipoLbl + ' ' + itm.polos + 'P')
    : (_tipoLbl + ' ' + itm.polos + 'P, ' + itm.capacidad + 'A');



  hint.textContent = 'Click en un triángulo que titile para copiar ' + itm.rotulo
    + ' (' + _specs + ')  ·  necesita ' + itm.polos + ' polos seguidos libres'
    + '  ·  ' + _txtSalir();
  document.body.appendChild(hint);
}



function _motivoNoTarget(triImg) {
  var src = _modoCopiaITM;
  var td = _getTriangleData(triImg);
  if (!src || isNaN(td.conIndex)) return 'Acá no se puede copiar.';
  var r = verificarPolosLibres(td.conIndex, src.polos, td.side,
    window._itmList || [], window._panelBusbarData || {}, !!src.invertirN);
  if (!r.libre) return 'Acá no entra ' + src.rotulo + ': ' + (r.razon || 'slot ocupado');
  if (!_copiaSlotCompatible(src, td.conIndex, td.side)) {
    return 'Acá no entra ' + src.rotulo +
           ': el equipo del lado opuesto es de otro tamaño y comparten el slot';
  }
  return 'Acá no se puede copiar ' + src.rotulo + '.';
}


function _hintCopiaError(msg) {
  var hint = document.getElementById('modo_copia_hint');
  if (!hint) return;
  var orig = hint.textContent;
  hint.textContent = msg;
  hint.style.color = '#f87171';
  setTimeout(function() {
    if (document.getElementById('modo_copia_hint')) {
      hint.textContent = orig;
      hint.style.color = '';
    }
  }, 1800);
}

function _insertarITMDesdeTriangulo(triDest) {

  if (window._insertarITM_running) return;
  window._insertarITM_running = true;
  try {
    if (!_modoCopiaITM) return;
    var src = _modoCopiaITM;
    var td = _getTriangleData(triDest);
    var srcInvN = !!src.invertirN;


    if (!_copiaTargetValido(src, td)) {
      _hintCopiaError('Slot no válido para ' + src.polos + 'P (sin espacio o incompatible)');
      return;
    }
    void srcInvN;


    var _srcIsReserva = src.tipo === 'reserva';
    var _srcIsCMReg = (src.tipo === 'cm_reg')
      || (src.tipo === 'cm_fijo' && parseInt(src.capacidad, 10) >= 125)
      || (_srcIsReserva && src.tamano === 'cm_reg');
    var _srcIsCM = (!_srcIsCMReg) && (
      src.tipo === 'cm_fijo' || (_srcIsReserva && src.tamano === 'cm_fijo'));
    var _newConW = _srcIsCMReg ? CM_REG_CON_W : (_srcIsCM ? CM_CON_W : (RIEL_CON_W || 115));
    var _newConH = _srcIsCMReg ? CM_REG_CON_H : (_srcIsCM ? CM_CON_H : 90);



    _avanzarRotuloITM();
    var itmData = {
      id: 'itm_' + Date.now(),
      rotulo: 'C-' + String(_itmNextRotulo).padStart(2, '0'),
      tipo: src.tipo,
      polos: src.polos,
      capacidad: src.capacidad,
      tamano: src.tamano,                                                   
      regulacion: src.regulacion,                                            
      invertirN: !!src.invertirN,                                             
      conIndex: td.conIndex,
      side: td.side,
      fase: td.fase,
      conX: td.conX,
      conY: td.conY,
      conW: _newConW,
      conH: _newConH
    };


    var d_pb = window._panelBusbarData;
    var _sub = d_pb ? (d_pb.subfases || '') : '';
    var necesitaN = d_pb && d_pb.fases === '3F+N' && _sub !== 'R - S - T'
      && (src.polos === 4 || src.polos === 2);

    if (necesitaN) {
      _insertarConectorNExtra(itmData);
      if (itmData._spliceRejected) {
        _hintCopiaError(itmData._spliceError || 'No se puede copiar — splice N rechazado');
        return;
      }
    }

    window._itmList.push(itmData);
    _itmNextRotulo++;



    _conReglas(function() {
      dibujarPanelBusbar();

      _actualizarTargetsCopia();
      guardarSesion();
    });
  } finally {
    window._insertarITM_running = false;
  }
}
