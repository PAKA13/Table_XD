


















var _pbNeutroActual = 'off';
var _pbAisladoTipo  = 'base_3F';
var _pbAisGap3f = 50.0;
var _pbAisGap4f = 33.5;
var _pbAisGap2f = 100.0;














function _pbBarraConNeutro(d) {
  if (!d || d.fases !== '3F+N' || d.subfases === 'R - S - T') return false;
  if ((d.ciclo || []).indexOf('N') !== -1) return true;
  var ig = window._igData;
  return !!(ig && parseInt(ig.polos, 10) === 4);
}
function _pbAisladorSegunNeutro(d) {
  if (!d || d.fases !== '3F+N' || d.subfases === 'R - S - T') return;
  var usaN = _pbBarraConNeutro(d);
  var fam = (d.aisladoTipo && d.aisladoTipo.indexOf('0.5s400') === 0) ? '0.5s400' : 'base';
  var antes = d.aisladoTipo;
  d.aisladoTipo = fam + (usaN ? '_4F' : '_3F');




  if (antes !== d.aisladoTipo && window._MEDIDOR && typeof _medidorAsegurarAlto === 'function') {
    _medidorAsegurarAlto();
  }
}

function _isAis4fDrawing(d) {
  if (!d) return false;
  if (d.aisladoTipo) return d.aisladoTipo === 'base_4F' || d.aisladoTipo === '0.5s400_4F';

  return d.fases === '3F+N' && d.subfases !== 'R - S - T';
}








function pbBarrasX(d) {
  var usarAis4f = _isAis4fDrawing(d);
  var aisNatW = usarAis4f ? 715 : 650;
  var HOLES_3F = {
    R: { x: 75.0,  diam: 42.1 },
    S: { x: 325.0, diam: 42.1 },
    T: { x: 575.0, diam: 42.1 }
  };
  var HOLES_4F = {
    R: { x: 106.3, diam: 31.7 },
    S: { x: 273.8, diam: 31.7 },
    T: { x: 441.3, diam: 31.7 },
    N: { x: 608.8, diam: 31.7 }
  };


  var _bHResp = calcAisladorHoles({
    aisladoTipo: d.aisladoTipo, fases: d.fases,
    aisGap2f: d.aisGap2f, aisGap3f: d.aisGap3f, aisGap4f: d.aisGap4f,
    aisNatW: aisNatW, usarAis4f: usarAis4f
  });
  var _bH = _bHResp.holes;
  if (_bH) {
    if (d.fases === '2F' || d.fases === '1F+N') {
      HOLES_3F.R.x = _bH.R.x;
      HOLES_3F.T.x = _bH.T.x;
    } else if (!usarAis4f) {
      HOLES_3F.R.x = _bH.R.x;
      HOLES_3F.S.x = _bH.S.x;
      HOLES_3F.T.x = _bH.T.x;
    } else {
      HOLES_4F.R.x = _bH.R.x;
      HOLES_4F.S.x = _bH.S.x;
      HOLES_4F.T.x = _bH.T.x;
      HOLES_4F.N.x = _bH.N.x;
    }
  }

  var holes = usarAis4f ? HOLES_4F : HOLES_3F;


  if (d.fases === '2F') {
    var par2f = (d.subfases || 'R - S').split(' - ');
    holes = {};
    holes[par2f[0]] = { x: HOLES_3F.R.x, diam: HOLES_3F.R.diam };
    holes[par2f[1]] = { x: HOLES_3F.T.x, diam: HOLES_3F.T.diam };
  }


  if (d.fases === '3F+N' && d.invertirN && usarAis4f) {
    holes = {
      N: { x: HOLES_4F.R.x, diam: HOLES_4F.R.diam },
      R: { x: HOLES_4F.S.x, diam: HOLES_4F.S.diam },
      S: { x: HOLES_4F.T.x, diam: HOLES_4F.T.diam },
      T: { x: HOLES_4F.N.x, diam: HOLES_4F.N.diam }
    };
  }


  if (d.fases === '1F+N' && !usarAis4f) {
    var faseActiva = (d.subfases || 'R').replace(/-N$/, '');
    var hayN_busbar = (d.subfases && d.subfases.indexOf('-N') !== -1) ||
                      (d.ciclo && d.ciclo.indexOf('N') !== -1);
    holes = {};
    if (hayN_busbar) {
      if (d.invertirN) {
        holes.N = { x: HOLES_3F.R.x, diam: HOLES_3F.R.diam };
        holes[faseActiva] = { x: HOLES_3F.T.x, diam: HOLES_3F.T.diam };
      } else {
        holes[faseActiva] = { x: HOLES_3F.R.x, diam: HOLES_3F.R.diam };
        holes.N = { x: HOLES_3F.T.x, diam: HOLES_3F.T.diam };
      }
    } else {
      holes[faseActiva] = { x: HOLES_3F.S.x, diam: HOLES_3F.S.diam };
    }
  }

  return { holes: holes, h3f: HOLES_3F, h4f: HOLES_4F, usarAis4f: usarAis4f,
           aisNatW: aisNatW, holeRelY: usarAis4f ? 72.6 : 69.9, holeR: usarAis4f ? 15.9 : 21.1 };
}




function pbAisGapKey(d) {
  if (!d) return 'aisGap3f';
  if (d.fases === '2F' || d.fases === '1F+N') return 'aisGap2f';
  return _isAis4fDrawing(d) ? 'aisGap4f' : 'aisGap3f';
}



function abrirModalPB() {
  if (!window._gabineteData) return;
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalPB_overlay').classList.add('activo');


  var _secAisPB = document.getElementById('modalPB_sec_aisladores');
  if (_secAisPB) _secAisPB.style.display = 'none';
  document.getElementById('modalPB_fases').selectedIndex = 0;

  if (window._panelBusbarData) {

    var d = window._panelBusbarData;
    var sel = document.getElementById('modalPB_fases');
    sel.value = d.fases || '3F';
    _pbNeutroActual = d.neutro || 'off';
    document.getElementById('modalPB_barraTierra').value = d.barraTierra || 'pe';
    var _tcSel = document.getElementById('modalPB_tierraChasis');
    if (_tcSel) _tcSel.checked = d.tierraChasis !== false;
    var _bnSel = document.getElementById('modalPB_barraN');
    if (_bnSel) _bnSel.value = (d.barraN === 'ninguno') ? 'ninguno' : 'con';
    document.getElementById('modalPB_polos').value = _pbPolosEfectivos(d) || 12;
    _pbAisladoTipo = d.aisladoTipo || 'base_3F';

    var _3fnConN = d.fases === '3F+N' && d.subfases !== 'R - S - T';
    if (_3fnConN && (_pbAisladoTipo === 'base_3F' || !d.aisladoTipo)) _pbAisladoTipo = 'base_4F';
    if (_3fnConN && _pbAisladoTipo === '0.5s400_3F') _pbAisladoTipo = '0.5s400_4F';
    if (d.aisGap3f) _pbAisGap3f = d.aisGap3f;
    if (d.aisGap4f) _pbAisGap4f = d.aisGap4f;
    if (d.aisGap2f) _pbAisGap2f = d.aisGap2f;
    onFasesChange();
    var aisSel = document.getElementById('modalPB_ais_sel');
    if (aisSel) aisSel.value = _pbAisladoTipo;
    if (d.subfases) {
      document.getElementById('modalPB_subfases_sel').value = d.subfases;
      onSubfasesChange();
    }
    var invNEl = document.getElementById('modalPB_invertirN');
    if (invNEl) invNEl.checked = !!(d.invertirN);
    _actualizarLabelsOrdenN(!!(d.invertirN));
    var conIGEl = document.getElementById('modalPB_conexionIG');
    if (conIGEl) {
      conIGEl.checked = !!(d.conexionIG);


      conIGEl.disabled = !!window._MEDIDOR;
      conIGEl.title = window._MEDIDOR ? 'La pide el medidor multifunción' : '';
    }
  } else {

    _pbAisladoTipo = 'base_3F';
    _pbNeutroActual = 'off';


    _pbAisGap3f = 50.0; _pbAisGap4f = 33.5; _pbAisGap2f = 100.0;
    var _polosNew = document.getElementById('modalPB_polos');
    if (_polosNew) _polosNew.value = '';

    var _ini = window._pbInicial;
    if (_ini && _ini.fases) {
      var _fSel = document.getElementById('modalPB_fases');
      if (_fSel) _fSel.value = _ini.fases;
      if (_polosNew && _ini.polos) _polosNew.value = _ini.polos;
    }
    onFasesChange();                                                   
    if (_ini && _ini.subfases) {
      var _sSel = document.getElementById('modalPB_subfases_sel');
      if (_sSel && Array.prototype.some.call(_sSel.options, function(o) { return o.value === _ini.subfases; })) {
        _sSel.value = _ini.subfases;
        if (typeof onSubfasesChange === 'function') onSubfasesChange();
      }
    }
    var _btNew = document.getElementById('modalPB_barraTierra');
    if (_btNew) _btNew.value = (_ini && _ini.barraTierra) ? _ini.barraTierra : 'pe';
    var _tcNew = document.getElementById('modalPB_tierraChasis');
    if (_tcNew) _tcNew.checked = true;
    var _bnNew = document.getElementById('modalPB_barraN');
    if (_bnNew) _bnNew.value = 'con';
    var _conIGNew = document.getElementById('modalPB_conexionIG');
    if (_conIGNew) { _conIGNew.checked = true; _conIGNew.disabled = false; _conIGNew.title = ''; }
    var _invNNewEl = document.getElementById('modalPB_invertirN');
    if (_invNNewEl) _invNNewEl.checked = false;
    _actualizarLabelsOrdenN(false);
  }

  document.getElementById('modalPB_error').textContent = '';
  var btnConf = document.getElementById('modalPB_btnConfirmar');
  if (btnConf) btnConf.textContent = window._panelBusbarData ? "Guardar cambios" : 'Crear';


  var _esModoCrearPB = !window._panelBusbarData;
  var _cardParam  = document.getElementById('modalPB_card_parametros');
  var _cardBarraT = document.getElementById('modalPB_card_barraTierra');
  if (_cardParam)  _cardParam.style.display = _esModoCrearPB ? 'none' : '';
  _pbBarraNVisible();
  _pbTierraChasisVisible();
  if (_cardBarraT) _cardBarraT.style.borderBottom = _esModoCrearPB ? 'none' : '';
}

function cerrarModalPB() {
  document.getElementById('modalPB_overlay').classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
}




function _pbTierraChasisVisible() {
  var w = document.getElementById('modalPB_tierraChasis_wrap');
  var s = document.getElementById('modalPB_barraTierra');
  if (w) w.style.display = (s && s.value === 'ais') ? '' : 'none';
}


function _pbBarraNVisible() {
  var w = document.getElementById('modalPB_barraN_wrap');
  var f = document.getElementById('modalPB_fases');
  if (w) w.style.display = (f && (f.value === '3F+N' || f.value === '1F+N')) ? '' : 'none';
}

function onFasesChange() {
  _pbBarraNVisible();
  var sel = document.getElementById('modalPB_fases');
  var fases = sel.value;
  var subfasesDiv = document.getElementById('modalPB_subfases');
  var subfasesSel = document.getElementById('modalPB_subfases_sel');

  subfasesDiv.style.display = '';
  var invertirNWrap = document.getElementById('modalPB_invertirN_wrap');
  var _invNDisplay;
  if (fases === '3F+N') {
    _invNDisplay = 'flex';
  } else if (fases === '1F+N') {
    var _curSubfases = subfasesSel.value || '';
    _invNDisplay = (_curSubfases.indexOf('-N') !== -1) ? 'flex' : 'none';
  } else {
    _invNDisplay = 'none';
  }
  if (invertirNWrap) invertirNWrap.style.display = _invNDisplay;

  if (!fases) {
    subfasesSel.innerHTML = '<option value="">— Orden —</option>';
    subfasesSel.disabled = true;
    subfasesSel.style.opacity = '0.4';
  } else if (fases === '3F' || fases === '3F+N') {
    _pbNeutroActual = (fases === '3F+N') ? 'on' : 'off';
    subfasesSel.innerHTML = '';
    if (fases === '3F+N') {
      ['R - S - T - N', 'R - S - T'].forEach(function(o) {
        var opt = document.createElement('option');
        opt.value = o; opt.textContent = o.replace(/ - /g, '-');
        subfasesSel.appendChild(opt);
      });
      subfasesSel.disabled = false;
      subfasesSel.style.opacity = '1';
    } else {
      var opt3f = document.createElement('option');
      opt3f.value = 'R - S - T'; opt3f.textContent = 'R-S-T';
      subfasesSel.appendChild(opt3f);
      subfasesSel.disabled = true;
      subfasesSel.style.opacity = '0.6';
    }
  } else if (fases === '2F') {
    _pbNeutroActual = 'off';
    subfasesSel.innerHTML = '';
    subfasesSel.disabled = false; subfasesSel.style.opacity = '1';
    var _phOpt2F = document.createElement('option');
    _phOpt2F.value = ''; _phOpt2F.textContent = '— Orden —';
    _phOpt2F.disabled = true; _phOpt2F.selected = true;
    subfasesSel.appendChild(_phOpt2F);
    ['R - S', 'S - T', 'R - T'].forEach(function(par) {
      var opt = document.createElement('option');
      opt.value = par; opt.textContent = par.replace(/ - /g, '-');
      subfasesSel.appendChild(opt);
    });
  } else if (fases === '1F+N') {
    _pbNeutroActual = 'on';
    subfasesSel.innerHTML = '';
    subfasesSel.disabled = false; subfasesSel.style.opacity = '1';
    var _phOpt = document.createElement('option');
    _phOpt.value = ''; _phOpt.textContent = '— Orden —';
    _phOpt.disabled = true; _phOpt.selected = true;
    subfasesSel.appendChild(_phOpt);
    ['R', 'S', 'T', 'R-N', 'S-N', 'T-N'].forEach(function(f) {
      var opt = document.createElement('option');
      opt.value = f; opt.textContent = f;
      subfasesSel.appendChild(opt);
    });
  }


  if (fases === '3F+N') {
    var _sfv = subfasesSel.value || '';
    var _sfHasN = _sfv === '' || _sfv === 'R - S - T - N';
    if (_sfHasN) {
      if (_pbAisladoTipo === 'base_3F')    _pbAisladoTipo = 'base_4F';
      if (_pbAisladoTipo === '0.5s400_3F') _pbAisladoTipo = '0.5s400_4F';
    }
  } else {
    if (_pbAisladoTipo === 'base_4F')    _pbAisladoTipo = 'base_3F';
    if (_pbAisladoTipo === '0.5s400_4F') _pbAisladoTipo = '0.5s400_3F';
  }

  var secAis = document.getElementById('modalPB_sec_aisladores');
  if (secAis) secAis.style.display = fases ? 'block' : 'none';

  _updateAisInfo();
}

function onSubfasesChange() {
  var fases = document.getElementById('modalPB_fases').value;
  var subfasesSel = document.getElementById('modalPB_subfases_sel');
  var subfasesVal = (subfasesSel && subfasesSel.value) || '';
  var invertirNWrap = document.getElementById('modalPB_invertirN_wrap');
  var invCb = document.getElementById('modalPB_invertirN');

  if (fases === '3F+N') {
    var tiene3fn = subfasesVal === 'R - S - T - N';
    if (tiene3fn) {
      if (_pbAisladoTipo === 'base_3F')    _pbAisladoTipo = 'base_4F';
      if (_pbAisladoTipo === '0.5s400_3F') _pbAisladoTipo = '0.5s400_4F';
    } else {
      if (_pbAisladoTipo === 'base_4F')    _pbAisladoTipo = 'base_3F';
      if (_pbAisladoTipo === '0.5s400_4F') _pbAisladoTipo = '0.5s400_3F';
      if (invCb) { invCb.checked = false; _actualizarLabelsOrdenN(false); }
    }
    if (invertirNWrap) invertirNWrap.style.display = tiene3fn ? 'flex' : 'none';
    var aisSel = document.getElementById('modalPB_ais_sel');
    if (aisSel) aisSel.value = _pbAisladoTipo;
  } else if (fases === '1F+N') {
    var hasN = subfasesVal.indexOf('-N') !== -1;
    if (invertirNWrap) invertirNWrap.style.display = hasN ? 'flex' : 'none';
    if (!hasN && invCb) { invCb.checked = false; _actualizarLabelsOrdenN(false); }
  }
  _updateAisInfo();
}

function onInvertirNChange() {
  var invCb = document.getElementById('modalPB_invertirN');
  _actualizarLabelsOrdenN(!!(invCb && invCb.checked));
}

function _actualizarLabelsOrdenN(invertido) {
  var sel = document.getElementById('modalPB_subfases_sel');
  if (!sel) return;
  var fases = document.getElementById('modalPB_fases').value;
  if (fases === '3F+N') {
    for (var j = 0; j < sel.options.length; j++) {
      if (sel.options[j].value === 'R - S - T - N') {
        sel.options[j].textContent = invertido ? 'N-R-S-T' : 'R-S-T-N';
      }
    }
  } else {
    for (var i = 0; i < sel.options.length; i++) {
      var opt = sel.options[i];
      if (opt.value.indexOf('-N') !== -1) {
        var fase = opt.value.replace(/-N$/, '');
        opt.textContent = invertido ? ('N-' + fase) : (fase + '-N');
      }
    }
  }
}

function onAisladoTipoChange(tipo) {
  _pbAisladoTipo = tipo;
  var sel = document.getElementById('modalPB_ais_sel');
  if (sel) sel.value = tipo;
  _updateAisInfo();
}

function onConexionIGToggle(checked) {

  void checked;
}

function _updateAisInfo() {
  var fases = document.getElementById('modalPB_fases').value;
  var is3fn = fases === '3F+N';
  var subfasesSel = document.getElementById('modalPB_subfases_sel');
  var subfasesVal = (subfasesSel && subfasesSel.value) ? subfasesSel.value : '';
  var is1fn = fases === '1F+N';
  var is1fn_conN = is1fn && subfasesVal.indexOf('-N') !== -1;
  var is1fn_sinN = is1fn && !is1fn_conN;
  var is2hole = (fases === '2F') || is1fn_conN;
  var is1hole = is1fn_sinN;

  var aisSel = document.getElementById('modalPB_ais_sel');
  if (aisSel) {
    var opt4f   = aisSel.querySelector('option[value="base_4F"]');
    var optBase = aisSel.querySelector('option[value="base_3F"]');
    var opt054f = aisSel.querySelector('option[value="0.5s400_4F"]');
    var opt05   = aisSel.querySelector('option[value="0.5s400_3F"]');
    var _show4f = is3fn && (subfasesVal === 'R - S - T - N' || subfasesVal === '');
    if (opt4f)   opt4f.style.display   = _show4f ? '' : 'none';
    if (opt054f) opt054f.style.display = _show4f ? '' : 'none';
    if (optBase) optBase.style.display = _show4f ? 'none' : '';
    if (opt05)   opt05.style.display   = _show4f ? 'none' : '';
    if (_show4f && (_pbAisladoTipo === 'base_3F' || _pbAisladoTipo === '0.5s400_3F')) {
      _pbAisladoTipo = (_pbAisladoTipo === 'base_3F') ? 'base_4F' : '0.5s400_4F';
    }
    if (!_show4f && (_pbAisladoTipo === 'base_4F' || _pbAisladoTipo === '0.5s400_4F')) {
      _pbAisladoTipo = (_pbAisladoTipo === 'base_4F') ? 'base_3F' : '0.5s400_3F';
    }
    if (opt05) {
      if (is1hole)      opt05.textContent = 'Aislador 0.5/400 (x1)';
      else if (is2hole) opt05.textContent = 'Aislador 0.5/400 (x2)';
      else              opt05.textContent = 'Aislador 0.5/400 (x3)';
    }
    aisSel.value = _pbAisladoTipo;
  }

}


function confirmarModalPB() {
  var errEl = document.getElementById('modalPB_error');
  errEl.textContent = '';

  var _polosStr = (document.getElementById('modalPB_polos') || {}).value;
  if (!_polosStr || isNaN(parseInt(_polosStr, 10))) {
    errEl.textContent = 'Indica el N° de Polos';
    return;
  }
  var _fasesValChk = (document.getElementById('modalPB_fases') || {}).value;
  var _ordenValChk = ((document.getElementById('modalPB_subfases_sel') || {}).value) || '';
  if ((_fasesValChk === '1F+N' || _fasesValChk === '2F') && !_ordenValChk) {
    errEl.textContent = 'Indica el Orden';
    return;
  }

  var esModoEdicion = !!window._panelBusbarData;

  var fasesVal = document.getElementById('modalPB_fases').value;
  var subfasesVal = null;
  if (fasesVal === '2F' || fasesVal === '1F+N' || fasesVal === '3F+N') {
    subfasesVal = (document.getElementById('modalPB_subfases_sel') || {}).value || null;
  }
  var invNEl = document.getElementById('modalPB_invertirN');

  var _pbInput = {
    fases: fasesVal,
    subfases: subfasesVal,
    polos: _pbPolosDesdeCampo(document.getElementById('modalPB_polos').value),
    neutro: _pbNeutroActual,
    barraTierra: document.getElementById('modalPB_barraTierra').value,
    tierraChasis: !!(document.getElementById('modalPB_tierraChasis') || { checked: true }).checked,
    barraN: (document.getElementById('modalPB_barraN') || {}).value || 'con',
    aisladoTipo: _pbAisladoTipo,
    aisGap2f: _pbAisGap2f,
    aisGap3f: _pbAisGap3f,
    aisGap4f: _pbAisGap4f,
    invertirN: !!(invNEl && invNEl.checked),
    invertirNConectores: false,                                                   
    conexionIG: !!(document.getElementById('modalPB_conexionIG') && document.getElementById('modalPB_conexionIG').checked),
    conexionIGAltura: (window._panelBusbarData && window._panelBusbarData.conexionIGAltura) || 20,
    busbarExtMm: _busbarExtMm(window._panelBusbarData || {}),
    tcAireMm: tcAireMm(window._panelBusbarData || {}),
    conRielAnMm: (window._panelBusbarData && window._panelBusbarData.conRielAnMm) || 23,
    conRielAltoMm:   (window._panelBusbarData && window._panelBusbarData.conRielAltoMm)   || CON_RIEL_ALTO_MM,
    conRielCabezaMm: (window._panelBusbarData && window._panelBusbarData.conRielCabezaMm) || CON_RIEL_CABEZA_MM,
    conMod1AnMm: (window._panelBusbarData && window._panelBusbarData.conMod1AnMm) || 35,
    conMod2AnMm: (window._panelBusbarData && window._panelBusbarData.conMod2AnMm) || 45
  };


  var resp = buildPanelBusbar(_pbInput, window._panelBusbarData || null, window._itmList || []);
  if (!resp.ok) {
    if (resp.outOfRange && resp.outOfRange.length > 0) {
      errEl.textContent = 'Fuera de rango: ' + resp.outOfRange.join(', ');
    } else {
      errEl.textContent = (resp.errors || ['Error al armar Panel Busbar']).join(' / ');
    }
    return;
  }


  if (resp.itmShifts && resp.itmShifts.length > 0) {
    for (var _si = 0; _si < resp.itmShifts.length; _si++) {
      var _shift = resp.itmShifts[_si];
      for (var _li = 0; _li < window._itmList.length; _li++) {
        if (window._itmList[_li].id === _shift.id) {
          window._itmList[_li].conIndex = _shift.conIndex;
          break;
        }
      }
    }
  }

  window._panelBusbarData = resp.data;
  _applyConDims(window._panelBusbarData);

  cerrarModalPB();


  if (typeof sincronizarPilotosConFases === 'function') sincronizarPilotosConFases();



  if (typeof _medidorAsegurarAlto === 'function' && _medidorAsegurarAlto()) {
    if (typeof _recalcIgExtraTop === 'function') _recalcIgExtraTop();
  }
  dibujarPanelBusbar();
  actualizarBibliotecaPB();





  if (!esModoEdicion && typeof zoomAjustar === 'function') zoomAjustar(0);
  guardarSesion();
}


function limpiarPanelBusbar() {

  if (typeof limpiarIG === 'function') limpiarIG(true);
  var container = document.getElementById('panel_busbar_container');
  if (container) {
    container.innerHTML = '';
    container.style.display = 'none';
  }
}





function _dibujarTrianguloIG(container) {
  if (!container || window._igData) return;
  var bars = container.querySelectorAll('.busbar-rect');
  if (!bars.length) return;
  var x0 = Infinity, x1 = -Infinity, top = Infinity;
  bars.forEach(function(b) {
    var l = parseFloat(b.style.left), t = parseFloat(b.style.top);
    var w = parseFloat(b.style.width) || parseFloat(b.getAttribute('width')) || 0;
    if (isNaN(l) || isNaN(t)) return;
    x0 = Math.min(x0, l); x1 = Math.max(x1, l + w); top = Math.min(top, t);
  });
  if (!isFinite(x0) || !isFinite(top)) return;




  var ALTO = 45, largo = x1 - x0, R = 16, E = 3, LW = 3;
  var ch = 11, cxm = largo / 2, cym = ALTO / 2;
  var d = 'M0 ' + ALTO + 'V' + R + 'Q0 0 ' + R + ' 0H' + (largo - R) + 'Q' + largo + ' 0 ' + largo + ' ' + R + 'V' + ALTO + 'Z';
  var dIn = 'M' + E + ' ' + (ALTO - E) + 'V' + (R + 1) + 'Q' + E + ' ' + E + ' ' + (R + 1) + ' ' + E +
            'H' + (largo - R - 1) + 'Q' + (largo - E) + ' ' + E + ' ' + (largo - E) + ' ' + (R + 1) + 'V' + (ALTO - E) + 'Z';
  var tri = document.createElement('div');
  tri.style.cssText = 'position:absolute;left:' + x0 + 'px;top:' + (top - 6 - ALTO) + 'px;width:' + largo + 'px;height:' + ALTO + 'px';
  tri.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ' + largo + ' ' + ALTO + '" style="display:block">' +
    '<path d="' + d + '" fill="#CC2222"/>' +
    '<path d="' + dIn + '" fill="none" stroke="#FFB3B3" stroke-width="' + LW + '" stroke-linejoin="round"/>' +
    '<path d="M' + (cxm - ch * 1.6) + ' ' + (cym + ch / 2) + 'L' + cxm + ' ' + (cym - ch / 2) + 'L' + (cxm + ch * 1.6) + ' ' + (cym + ch / 2) + '" ' +
      'fill="none" stroke="#FFB3B3" stroke-width="' + (LW + 1) + '" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  tri.className = 'ig-tri';
  tri.style.zIndex = '6';
  tri.style.cursor = 'pointer';
  tri.title = 'Agregar el interruptor general';
  tri.addEventListener('click', function(e) {
    e.stopPropagation();
    if (typeof abrirModalIG === 'function') abrirModalIG();
  });
  container.appendChild(tri);
}

function _crearImg(src, x, y, w, h) {
  var img = document.createElement('img');
  img.src = src;
  img.style.position = 'absolute';
  img.style.left = x + 'px';
  img.style.top = y + 'px';
  img.style.width = w + 'px';
  img.style.height = h + 'px';
  return img;
}


function _crearConector(fase, x, y, w, h) {
  var rh;
  if (h <= 90)       { rh = 50;  }
  else if (h <= 125) { rh = 75;  }
  else               { rh = 100; }
  var ry = Math.round((h - rh) / 2);
  var fillColor = BUSBAR_COLORS[fase] || '#888888';
  var ns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.style.position = 'absolute';
  svg.style.left = x + 'px';
  svg.style.top = y + 'px';
  svg.classList.add('con-svg');
  svg.dataset.fase = fase;







  if (h <= 90) { svg.dataset.editable = '1'; svg.dataset.tipo3d = 'riel'; }
  else if (h <= 125) svg.dataset.tipo3d = 'cm_fijo';
  var ri = document.createElementNS(ns, 'rect');
  ri.setAttribute('x', 0);
  ri.setAttribute('y', ry);
  ri.setAttribute('width', w);
  ri.setAttribute('height', rh);
  ri.setAttribute('fill', fillColor);
  ri.setAttribute('stroke', '#000000');
  ri.setAttribute('stroke-width', '2');
  svg.appendChild(ri);
  return svg;
}



function dibujarPanelBusbar() {
  var d = window._panelBusbarData;
  if (!d || !window._gabineteData) return;

  limpiarPanelBusbar();
  var container = document.getElementById('panel_busbar_container');
  container.style.display = 'block';


  if (!d.ciclo || !d.ciclo.length) {
    if (d.fases === '3F') d.ciclo = ['R', 'S', 'T'];
    else if (d.fases === '3F+N') d.ciclo = ['R', 'S', 'T'];
    else d.ciclo = ['R', 'N'];
  }


  _pbAisladorSegunNeutro(d);


  if (window._igData && window._BARRAS_UBIC && Object.keys(window._BARRAS_UBIC).length &&
      typeof _recalcIgExtraTop === 'function') _recalcIgExtraTop();

  var usarAis4f = _isAis4fDrawing(d);
  var aisFile = usarAis4f ? 'ais_4f.svg' : 'ais_3f.svg';
  var aisNatW = usarAis4f ? 715 : 650;
  var aisNatH = usarAis4f ? 145 : 140;

  var aisW = aisNatW;
  var aisH = aisNatH;
  var pbInset = PB_INSET_MM / PX_TO_MM;

  var conW = RIEL_CON_W || 115;
  var conH = 90;
  var numConectores = d.ciclo.length;


  var _cmSets = buildCmSets(window._itmList || [], d.invertirNConectores);
  var cmConSet_pb = _cmSets.cmConSet;
  var cmRegConSet_pb = _cmSets.cmRegConSet;




  (window._itmList || []).forEach(function(it0) {
    var i0 = parseInt(it0.conIndex);
    it0.conH = cmRegConSet_pb[i0] ? CM_REG_CON_H : (cmConSet_pb[i0] ? CM_CON_H : 90);
    it0.conW = cmRegConSet_pb[i0] ? CM_REG_CON_W : (cmConSet_pb[i0] ? CM_CON_W : (RIEL_CON_W || 115));
  });
  var totalConH = getTotalConH(d.ciclo, cmConSet_pb, cmRegConSet_pb);






  var CM_FIJO_MOD1_GAP_PX = 1300;
  var CM_MOD2_REG_GAP_PX  = 1500;








  var _ovItmLado = function(sd) {
    if (typeof outerItmEdgeRelX !== 'function' || !window._itmList) return null;
    var e = outerItmEdgeRelX(sd, window._itmList, aisW, cmConSet_pb, cmRegConSet_pb,
      RIEL_CON_W || 115, CM_CON_W, CM_REG_CON_W);
    if (e === null) return null;
    return (sd === 'left') ? -e : (e - aisW);
  };
  var _pisoItm = function(sd, plano) {
    var m = _ovItmLado(sd);
    return (m === null) ? plano : m;
  };








  var _ovRefL = _ovItmLado('left'), _ovRefR = _ovItmLado('right');
  var PARED_PX = 250;
  var _pisoElem = function(ov, sd) {
    var ref = (sd === 'left') ? _ovRefL : _ovRefR;
    if (ref === null || ov > ref) return ov + PARED_PX;
    return ov;                                                   
  };
  var leftReq = CV_LEFT_PX, rightReq = CV_RIGHT_PX;



  var _floorLat = 0;




  var _floorLatNoDif = 0;




  var _floorLatSinGrupo = 0;


  var _colLatL = false, _colLatR = false;

  var _floorQuien = {};
  var _pisoNoDif = function(px, quien) {
    _floorQuien[quien] = Math.round(px * PX_TO_MM);
    if (px > _floorLatNoDif) _floorLatNoDif = px;
  };
  var _cmL = false, _cmRegL = false, _cmR = false, _cmRegR = false;
  (window._itmList || []).forEach(function(itm) {
    var t = clasificarTamanoITM(itm);
    if (t === null && itm.tipo === 'reserva') {
      var _si = parseInt(itm.conIndex);
      if (cmRegConSet_pb[_si]) t = 'cm_reg';
      else if (cmConSet_pb[_si]) t = 'cm_fijo';
      else t = 'riel';
    }
    if (itm.side === 'left') {
      if (t === 'cm_fijo') _cmL = true;
      if (t === 'cm_reg')  _cmRegL = true;
    } else {
      if (t === 'cm_fijo') _cmR = true;
      if (t === 'cm_reg')  _cmRegR = true;
    }
  });





  var _igD_pb = window._igData;
  if (_igD_pb && (_igD_pb.tipo === 'cm_fijo' || _igD_pb.tipo === 'cm_reg')) {
    var _igMod2 = _igD_pb.tipo === 'cm_reg' || parseInt(_igD_pb.corriente, 10) >= 125;
    var _igPolos = parseInt(_igD_pb.polos, 10) || 3;

    var _igW_pb = _igPolos * (_igMod2 ? 175 : 125);
    var _igOh = Math.max(0, (_igW_pb - aisW) / 2);




    var _pigL = _pisoElem(_igOh, 'left'), _pigR = _pisoElem(_igOh, 'right');
    if (_pigL > 0 || _pigR > 0) {
      leftReq  = Math.max(leftReq,  _pigL);
      rightReq = Math.max(rightReq, _pigR);
      _floorLat = Math.max(_floorLat, _pigL); _floorLatSinGrupo = Math.max(_floorLatSinGrupo, _pigL); _pisoNoDif(_pigL, 'igAncho');
    }
  }



  var _canItmPb = window._CANALETAS_ITM || {};
  function _flancoCanItm(side) {


    return _canaletaFlancoColumnaPx(side, _canItmPb[side]);
  }

  var _cmPisoL = (_cmRegL || _cmL)
    ? _pisoItm('left',  _cmRegL ? CM_MOD2_REG_GAP_PX : CM_FIJO_MOD1_GAP_PX) : 0;
  var _cmPisoR = (_cmRegR || _cmR)
    ? _pisoItm('right', _cmRegR ? CM_MOD2_REG_GAP_PX : CM_FIJO_MOD1_GAP_PX) : 0;
  if (_cmPisoL) { leftReq  = Math.max(leftReq,  _cmPisoL); _floorLat = Math.max(_floorLat, _cmPisoL); _floorLatSinGrupo = Math.max(_floorLatSinGrupo, _cmPisoL); _pisoNoDif(_cmPisoL, 'cm'); }
  if (_cmPisoR) { rightReq = Math.max(rightReq, _cmPisoR); _floorLat = Math.max(_floorLat, _cmPisoR); _floorLatSinGrupo = Math.max(_floorLatSinGrupo, _cmPisoR); _pisoNoDif(_cmPisoR, 'cm'); }



  if (typeof getReferenceItmCV14 === 'function' && window._itmList) {

    var _ocupaColLat = _itmOcupaColLat;                               
    var _hayDifL = window._itmList.some(function(i) { return i.side === 'left' && _ocupaColLat(i); });
    var _hayDifR = window._itmList.some(function(i) { return i.side === 'right' && _ocupaColLat(i); });
    _colLatL = _hayDifL; _colLatR = _hayDifR;
    if (_hayDifL || _hayDifR) {
      var _difVisW_pb = (typeof DIF_VIS_W_PX !== 'undefined') ? DIF_VIS_W_PX : 425;



      var _hayCol2 = function(sd) {
        return window._itmList.some(function(i) {
          return i.side === sd && i.dif && i.dif.ubicacion === 'lateral' &&
                 i.contactor && i.contactor.ubicacion === 'lateral';
        });
      };





      var _contAltoLado = function(sd) {
        return (typeof _col2WLado === 'function' ? _col2WLado(sd) : 0) || 385;
      };
      var _bornLat = function(sd) {
        if (typeof _bornerasAnchoLateral !== 'function') return 0;
        var w = _bornerasAnchoLateral(sd);
        if (!w) return 0;
        return w + ((sd === 'left') ? (window.BORN_CONT_GAP_LEFT_PX || 250)
                                    : (window.BORN_CONT_GAP_RIGHT_PX || 250));
      };
      if (_hayDifL) {




        var _edgeL = (typeof _anclaColumnaLateral === 'function')
          ? _anclaColumnaLateral('left') : null;
        var _ovL = (_edgeL !== null) ? -_edgeL : 157.5;


        var _c1L = (typeof _col1WLado === 'function') ? (_col1WLado('left') || _difVisW_pb) : _difVisW_pb;
        var _reqDifL = (window.DIF_GAB_GAP_LEFT_PX || 600) + _c1L + (window.DIF_ITM_GAP_LEFT_PX || 250) + _ovL;
        if (_hayCol2('left')) _reqDifL += _contAltoLado('left') + (window.CONT_DIF_GAP_LEFT_PX || 250);
        _reqDifL += _bornLat('left');





        var _pisoCmL = _cmPisoL;
        leftReq = Math.max(_reqDifL, _pisoCmL);
        _floorQuien.columnaLateral = Math.max(_floorQuien.columnaLateral || 0,
          Math.round(_reqDifL * PX_TO_MM));
        _ovRefL = _reqDifL - (window.DIF_GAB_GAP_LEFT_PX || 600);
        _floorLat = Math.max(_floorLat, _reqDifL); _floorLatSinGrupo = Math.max(_floorLatSinGrupo, _reqDifL);
      }
      if (_hayDifR) {
        var _edgeR = (typeof _anclaColumnaLateral === 'function')
          ? _anclaColumnaLateral('right') : null;
        var _ovR = (_edgeR !== null) ? (_edgeR - aisW) : 157.5;
        var _c1R = (typeof _col1WLado === 'function') ? (_col1WLado('right') || _difVisW_pb) : _difVisW_pb;
        var _reqDifR = (window.DIF_GAB_GAP_RIGHT_PX || 600) + _c1R + (window.DIF_ITM_GAP_RIGHT_PX || 250) + _ovR;
        if (_hayCol2('right')) _reqDifR += _contAltoLado('right') + (window.CONT_DIF_GAP_RIGHT_PX || 250);
        _reqDifR += _bornLat('right');
        var _pisoCmR = _cmPisoR;
        rightReq = Math.max(_reqDifR, _pisoCmR);
        _floorQuien.columnaLateral = Math.max(_floorQuien.columnaLateral || 0,
          Math.round(_reqDifR * PX_TO_MM));
        _ovRefR = _reqDifR - (window.DIF_GAB_GAP_RIGHT_PX || 600);
        _floorLat = Math.max(_floorLat, _reqDifR); _floorLatSinGrupo = Math.max(_floorLatSinGrupo, _reqDifR);
      }
    }
  }







  var _Lb = (typeof _barrasLayout === 'function') ? _barrasLayout(d) : null;
  var _maxOh = _Lb ? _Lb.overhang : 0;
  if (_maxOh > 0) {
    var _pbL = _pisoElem(_maxOh, 'left'), _pbR = _pisoElem(_maxOh, 'right');
    leftReq  = Math.max(leftReq,  _pbL);
    rightReq = Math.max(rightReq, _pbR);
    _floorLat = Math.max(_floorLat, _pbL); _floorLatSinGrupo = Math.max(_floorLatSinGrupo, _pbL); _pisoNoDif(_pbL, 'barras');
  }





  var _layInf_pb = (typeof _layoutInferior === 'function') ? _layoutInferior() : null;
  if (_layInf_pb) {











    var _flColL = _flancoCanItm('left'), _flColR = _flancoCanItm('right');
    var _ohL = 0, _ohR = 0, _ohLcaf = 0, _ohRcaf = 0;
    _layInf_pb.filaW.forEach(function(fw, f) {
      var ex = (_layInf_pb.filaExt && _layInf_pb.filaExt[f]) || {};
      var base = (fw - aisW) / 2;
      if (ex.conCol && _flColL > 0) _ohLcaf = Math.max(_ohLcaf, base + (ex.izqPropio || 0) - _flColL);
      else _ohL = Math.max(_ohL, base + (ex.izq || 0));
      if (ex.conCol && _flColR > 0) _ohRcaf = Math.max(_ohRcaf, base + (ex.derPropio || 0) - _flColR);
      else _ohR = Math.max(_ohR, base + (ex.der || 0));
    });
    var _fiL = Math.max(_ohL > 0 ? _pisoElem(_ohL, 'left') : 0, _ohLcaf);
    var _fiR = Math.max(_ohR > 0 ? _pisoElem(_ohR, 'right') : 0, _ohRcaf);
    if (_fiL > 0) {
      leftReq  = Math.max(leftReq,  _fiL);
      _floorLat = Math.max(_floorLat, _fiL); _floorLatSinGrupo = Math.max(_floorLatSinGrupo, _fiL); _pisoNoDif(_fiL, 'filaInferior');
    }
    if (_fiR > 0) {
      rightReq = Math.max(rightReq, _fiR);
      _floorLat = Math.max(_floorLat, _fiR); _floorLatSinGrupo = Math.max(_floorLatSinGrupo, _fiR); _pisoNoDif(_fiR, 'filaInferior');
    }
  }











  function _tiraEnBloqueCol(g) {


    if (typeof _barraPrimeraTira !== 'function' || typeof _canaletaCfgDeIds !== 'function') return false;
    var lay = _layInf_pb, nF = lay && lay.filaIds ? lay.filaIds.length : 0;
    var ult = nF && lay.filaExt && lay.filaExt[nF - 1];
    if (!ult || !ult.conCol) return false;
    var cU = _canaletaCfgDeIds(lay.filaIds[nF - 1]);
    if (!cU || (cU.lados || []).indexOf('abajo') === -1) return false;
    var tope = _bornPilaTope(_barraPrimeraTira());
    if (!tope || !tope.canaleta || !tope.canaleta.fusionArriba) return false;
    var a = g, n = 0;
    while (a && n++ < 30) {
      if (a === tope) return true;
      if (!_canaletaApiladaUnida(a)) return false;
      a = _bornerasGrupoDe('pila', a.id);
    }
    return false;
  }
  if (typeof _bornerasGrupos === 'function' && typeof _bornerasAnchoCadena === 'function') {
    var _ohBar = 0, _ohBarCafL = 0, _ohBarCafR = 0;
    _bornerasGrupos().forEach(function(g) {
      if (!(g.lugar === 'pila' || /^(pe|n|pea)-(arriba|abajo)$/.test(g.lugar || ''))) return;
      var oh = (_bornerasAnchoCadena(g) - aisW) / 2;
      if (_tiraEnBloqueCol(g) && (_flColL > 0 || _flColR > 0)) {
        if (_flColL > 0) _ohBarCafL = Math.max(_ohBarCafL, oh - _flColL); else _ohBar = Math.max(_ohBar, oh);
        if (_flColR > 0) _ohBarCafR = Math.max(_ohBarCafR, oh - _flColR); else _ohBar = Math.max(_ohBar, oh);
      } else {
        _ohBar = Math.max(_ohBar, oh);
      }
    });
    if (_ohBar > 0 || _ohBarCafL > 0 || _ohBarCafR > 0) {
      var _fbL = Math.max(_ohBar > 0 ? _pisoElem(_ohBar, 'left') : 0, _ohBarCafL);
      var _fbR = Math.max(_ohBar > 0 ? _pisoElem(_ohBar, 'right') : 0, _ohBarCafR);
      leftReq = Math.max(leftReq, _fbL);
      rightReq = Math.max(rightReq, _fbR);
      _floorLat = Math.max(_floorLat, _fbL, _fbR);
      _floorLatSinGrupo = Math.max(_floorLatSinGrupo, _fbL, _fbR);
      _pisoNoDif(Math.max(_fbL, _fbR), 'grupoBarra');
    }
  }







  window._reqSinGrupoIgPx = Math.max(leftReq, rightReq);

  if (typeof _bornerasOverhangIG === 'function' && window._igData) {
    var _igW_gr = _barraIgAnchoPx();
    var _ohIG = _bornerasOverhangIG(aisW, _igW_gr);


    var _Lbl = (typeof _barrasLayout === 'function') ? _barrasLayout(d) : null;
    if (_Lbl) {
      if (_Lbl.pisoLado.izq > 0) {
        leftReq = Math.max(leftReq, _Lbl.pisoLado.izq);
        _floorLat = Math.max(_floorLat, _Lbl.pisoLado.izq); _pisoNoDif(_Lbl.pisoLado.izq, 'barraLado');
      }
      if (_Lbl.pisoLado.der > 0) {
        rightReq = Math.max(rightReq, _Lbl.pisoLado.der);
        _floorLat = Math.max(_floorLat, _Lbl.pisoLado.der); _pisoNoDif(_Lbl.pisoLado.der, 'barraLado');
      }
    }
    var _pared = (typeof BORN_IG_PARED_PX !== 'undefined') ? BORN_IG_PARED_PX : 250;





    var _paredL = Math.max(_pared, 100 - _flancoCanItm('left'));
    var _paredR = Math.max(_pared, 100 - _flancoCanItm('right'));
    if (_ohIG.izq > 0) {
      leftReq = Math.max(leftReq, _ohIG.izq + _paredL);
      _floorLat = Math.max(_floorLat, _ohIG.izq + _paredL); _pisoNoDif(_ohIG.izq + _paredL, 'grupoIgIzq');






      _floorLatSinGrupo = Math.max(_floorLatSinGrupo,
        _ohIG.izq - _flancoCanItm('left'));
    }
    if (_ohIG.der > 0) {
      rightReq = Math.max(rightReq, _ohIG.der + _paredR);
      _floorLat = Math.max(_floorLat, _ohIG.der + _paredR); _pisoNoDif(_ohIG.der + _paredR, 'grupoIgDer');
      _floorLatSinGrupo = Math.max(_floorLatSinGrupo,
        _ohIG.der - _flancoCanItm('right'));
    }
  }



  var _flIzqCan = _flancoCanItm('left'), _flDerCan = _flancoCanItm('right');
  leftReq  += _flIzqCan;
  rightReq += _flDerCan;
  window._flancoCanMaxPx = Math.max(_flIzqCan, _flDerCan);


  window._flancoCanPx = { left: _flIzqCan, right: _flDerCan };


  var _reqFinal = Math.round(Math.max(leftReq - _flIzqCan, rightReq - _flDerCan) * PX_TO_MM);
  window._reqFinalLatPx = _reqFinal;                                                            



  window._floorLateralPx = _floorLat;
  window._floorLateralSinGrupoPx = _floorLatSinGrupo;



  var _cvBase = 0;
  if (!_colLatL) _cvBase = Math.max(_cvBase, CV_LEFT_PX);
  if (!_colLatR) _cvBase = Math.max(_cvBase, CV_RIGHT_PX);
  window._floorLateralNoDifPx = Math.max(_floorLatNoDif, _cvBase);
  _floorQuien.cv0405 = Math.round(_cvBase * PX_TO_MM);



  var _reqSG = Math.round((window._reqSinGrupoIgPx || 0) * PX_TO_MM);





  var _flr = Math.round(_floorLat * PX_TO_MM);


  _floorQuien._manda = null;
  for (var _qk in _floorQuien) {
    if (_qk.charAt(0) === '_') continue;
    if (_floorQuien[_qk] === (window._reqFinalLatPx || 0)) {
      _floorQuien._manda = _qk; break;
    }
  }
  _floorQuien._mandaPiso = null;
  for (var _fk in _floorQuien) {
    if (_fk.charAt(0) === '_') continue;
    if (_floorQuien[_fk] === _flr) { _floorQuien._mandaPiso = _fk; break; }
  }
  _floorQuien._mandaSinGrupo = null;
  for (var _sk in _floorQuien) {
    if (_sk.charAt(0) === '_') continue;
    if (_floorQuien[_sk] === _reqSG) { _floorQuien._mandaSinGrupo = _sk; break; }
  }
  _floorQuien._total = Math.round(window._floorLateralNoDifPx * PX_TO_MM);
  window._floorLatDebug = _floorQuien;


  var _eqReq = Math.max(leftReq, rightReq);
  leftReq = rightReq = _eqReq;




  if (window._autosnapComercial === true && window._SNAP_EXTRA_PX > 0) {
    leftReq += window._SNAP_EXTRA_PX;
    rightReq += window._SNAP_EXTRA_PX;
  }

  var nuevoGabW = leftReq + aisW + rightReq;
  var gabDefaultW = GAB_DEFAULT_MM / PX_TO_MM;
  nuevoGabW = Math.max(gabDefaultW, nuevoGabW);

  var aisX = 0;
  var aisY = CV_TOP_INNER + (window._igExtraTop || 0);

  var conectoresStartY_pre = aisY + aisH;
  var aisInfY_pre = conectoresStartY_pre + totalConH;



  var _pbBX = pbBarrasX(d);
  var HOLES_3F = _pbBX.h3f, HOLES_4F = _pbBX.h4f, holes = _pbBX.holes;

  var holeRelY = usarAis4f ? 72.6 : 69.9;
  var holeR = usarAis4f ? 15.9 : 21.1;


  var busbarFases = [];
  d.ciclo.forEach(function(f) {
    if (busbarFases.indexOf(f) === -1 && holes[f]) busbarFases.push(f);
  });
  if (usarAis4f && d.fases === '3F+N' && busbarFases.indexOf('N') === -1 && holes.N) {
    busbarFases.push('N');
  }

  var busbarH = (aisInfY_pre + aisH) - aisY;
  var busbarIGExt = d.conexionIG ? (_busbarExtMm(d) / PX_TO_MM) : 0;
  busbarH += busbarIGExt;


  busbarFases.forEach(function(fase, idx) {
    var h = holes[fase];
    var bw = 100;            
    var bx = aisX + h.x - bw / 2;
    var by = aisY - busbarIGExt;

    var holeSup = holeRelY + busbarIGExt;
    var holeInf = (aisInfY_pre - aisY) + holeRelY + busbarIGExt;

    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', bw);
    svg.setAttribute('height', busbarH);
    svg.setAttribute('data-busbar-fase', fase);
    svg.style.position = 'absolute';
    svg.style.left = bx + 'px';
    svg.style.top = by + 'px';
    svg.style.zIndex = '3';
    svg.style.overflow = 'visible';

    var maskId = 'busbar_mask_' + fase + '_' + idx;
    var defs = document.createElementNS(ns, 'defs');
    var mask = document.createElementNS(ns, 'mask');
    mask.setAttribute('id', maskId);

    var maskRect = document.createElementNS(ns, 'rect');
    maskRect.setAttribute('width', '100%');
    maskRect.setAttribute('height', '100%');
    maskRect.setAttribute('fill', 'white');
    mask.appendChild(maskRect);

    var c1 = document.createElementNS(ns, 'circle');
    c1.setAttribute('cx', bw / 2);
    c1.setAttribute('cy', holeSup);
    c1.setAttribute('r', holeR);
    c1.setAttribute('fill', 'black');
    mask.appendChild(c1);

    var c2 = document.createElementNS(ns, 'circle');
    c2.setAttribute('cx', bw / 2);
    c2.setAttribute('cy', holeInf);
    c2.setAttribute('r', holeR);
    c2.setAttribute('fill', 'black');
    mask.appendChild(c2);

    if (busbarIGExt > 0) {




      var cPerno = document.createElementNS(ns, 'circle');
      cPerno.setAttribute('cx', bw / 2);
      cPerno.setAttribute('cy', 10 / PX_TO_MM);
      cPerno.setAttribute('r', (6 / PX_TO_MM) / 2);
      cPerno.setAttribute('fill', 'black');
      mask.appendChild(cPerno);
    }

    defs.appendChild(mask);
    svg.appendChild(defs);

    var rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('width', bw);
    rect.setAttribute('height', busbarH);
    rect.setAttribute('fill', BUSBAR_COLORS[fase]);
    rect.setAttribute('rx', '2');
    rect.setAttribute('mask', 'url(#' + maskId + ')');
    svg.appendChild(rect);

    var rectBorder = document.createElementNS(ns, 'rect');
    rectBorder.setAttribute('width', bw);
    rectBorder.setAttribute('height', busbarH);
    rectBorder.setAttribute('fill', 'none');
    rectBorder.setAttribute('stroke', '#000000');
    rectBorder.setAttribute('stroke-width', '2');
    rectBorder.setAttribute('rx', '2');
    svg.appendChild(rectBorder);

    if (busbarIGExt > 0) {


      var cPernoBorde = document.createElementNS(ns, 'circle');
      cPernoBorde.setAttribute('cx', bw / 2);
      cPernoBorde.setAttribute('cy', busbarIGExt - 10 / PX_TO_MM);
      cPernoBorde.setAttribute('r', (6 / PX_TO_MM) / 2);
      cPernoBorde.setAttribute('fill', 'none');
      cPernoBorde.setAttribute('stroke', '#000000');
      cPernoBorde.setAttribute('stroke-width', '2');
      svg.appendChild(cPernoBorde);
    }

    svg.setAttribute('class', 'busbar-rect');
    svg.dataset.fase = fase;
    container.appendChild(svg);
  });







  if (window._MEDIDOR && busbarIGExt > 0) {
    var tcW = TC_ANCHO_MM / PX_TO_MM, tcH = TC_ALTO_MM / PX_TO_MM;

    var fasesTC = busbarFases.filter(function(f) { return f !== 'N' && holes[f]; });
    fasesTC.sort(function(a, b) { return holes[a].x - holes[b].x; });



    var seSolapan = false;
    for (var fi = 1; fi < fasesTC.length; fi++) {
      if (holes[fasesTC[fi]].x - holes[fasesTC[fi - 1]].x < tcW) seSolapan = true;
    }
    var tcBotFila0 = aisY - tcBaseMm(d) / PX_TO_MM;
    var tcBotFila1 = tcBotFila0 - tcH - TC_FILA_GAP_MM / PX_TO_MM;
    fasesTC.forEach(function(fase, i) {
      var fila = (seSolapan && (i % 2 === 1)) ? 1 : 0;
      var bot = fila ? tcBotFila1 : tcBotFila0;
      var cx = aisX + holes[fase].x;
      var tc = _crearImg('assets/Aparamenta/Transformador_corriente-vf.svg',
        cx - tcW / 2, bot - tcH, tcW, tcH);
      tc.className = 'trafo-img';
      tc.dataset.fase = fase;
      tc.dataset.fila = String(fila);
      tc.style.zIndex = '4';                                           
      tc.style.pointerEvents = 'none';
      container.appendChild(tc);



      var rotTc = document.createElement('div');
      rotTc.className = 'trafo-rotulo';
      rotTc.dataset.fase = fase;
      rotTc.style.cssText = 'position:absolute;left:' + cx + 'px;top:' + (bot - tcH / 2) +
        'px;transform:translate(-50%,-50%);z-index:5;pointer-events:none;';
      var badgeTc = document.createElement('div');
      badgeTc.className = 'itm-rotulo-badge';

      var _tcRot = (typeof _medidorInfo === 'function') ? _medidorInfo().porFase[fase] : null;
      badgeTc.textContent = _tcRot || ('CT' + (i + 1));
      rotTc.appendChild(badgeTc);
      container.appendChild(rotTc);
    });
  }


  if (!d.aisladoTipo || d.aisladoTipo === 'base_3F' || d.aisladoTipo === 'base_4F') {
    var aisSupImg = _crearImg('assets/panel-busbar/' + aisFile, aisX, aisY, aisW, aisH);
    aisSupImg.style.zIndex = '1';
    container.appendChild(aisSupImg);
  }


  var conectoresStartY = aisY + aisH;
  var triW = 45, triH = 90;



  var visualCiclo = d.ciclo.slice();
  var _es1FNx2_pb = (d.fases === '1F+N' && d.subfases && d.subfases.indexOf('-N') !== -1);
  if (_es1FNx2_pb && window._itmList) {
    for (var _vci = 0; _vci < window._itmList.length; _vci++) {
      var _itmVc = window._itmList[_vci];
      if (parseInt(_itmVc.polos, 10) !== 2) continue;
      if (!_itmVc.invertirN) continue;
      var _ciVc = parseInt(_itmVc.conIndex, 10);
      if (_ciVc < 0 || _ciVc + 1 >= visualCiclo.length) continue;
      var _s0 = visualCiclo[_ciVc];
      visualCiclo[_ciVc] = visualCiclo[_ciVc + 1];
      visualCiclo[_ciVc + 1] = _s0;
    }
  }

  for (var i = 0; i < numConectores; i++) {
    var tipo = visualCiclo[i];
    var isCMReg = !!cmRegConSet_pb[i];
    var isCM = !isCMReg && !!cmConSet_pb[i];
    var iConW = isCMReg ? CM_REG_CON_W : (isCM ? CM_CON_W : conW);                    
    var iConH = isCMReg ? CM_REG_CON_H : (isCM ? CM_CON_H : conH);                    
    var iConX = (aisW - iConW) / 2;
    var conY = getConY(i, conectoresStartY, cmConSet_pb, cmRegConSet_pb);

    var conSvg = _crearConector(tipo, iConX, conY, iConW, iConH);
    conSvg.style.zIndex = '4';
    container.appendChild(conSvg);


    if (tipo === 'N') continue;






    if (typeof _polosPosiblesEnSlot === 'function' &&
        !_polosPosiblesEnSlot(i, 'left').length &&
        !_polosPosiblesEnSlot(i, 'right').length) continue;

    var triY = conY + (iConH - triH) / 2;

    var triLeft = _crearImg('assets/panel-busbar/boton_trian_rojo.svg', iConX - triW - 2, triY, triW, triH);
    triLeft.style.zIndex = '5';
    triLeft.className = 'tri-clickeable';
    triLeft.dataset.conIndex = i;
    triLeft.dataset.side = 'left';
    triLeft.dataset.fase = tipo;
    triLeft.dataset.conX = iConX;
    triLeft.dataset.conY = conY;
    triLeft.dataset.conW = iConW;
    triLeft.dataset.conH = iConH;
    triLeft.addEventListener('click', function() { onTriangleClick(this); });
    container.appendChild(triLeft);

    var triRight = _crearImg('assets/panel-busbar/boton_trian_rojo.svg', iConX + iConW + 2, triY, triW, triH);
    triRight.style.zIndex = '5';
    triRight.className = 'tri-clickeable tri-right';
    triRight.dataset.conIndex = i;
    triRight.dataset.side = 'right';
    triRight.dataset.fase = tipo;
    triRight.dataset.conX = iConX;
    triRight.dataset.conY = conY;
    triRight.dataset.conW = iConW;
    triRight.dataset.conH = iConH;
    triRight.addEventListener('click', function() { onTriangleClick(this); });
    container.appendChild(triRight);
  }


  var aisInfY = aisInfY_pre;
  if (!d.aisladoTipo || d.aisladoTipo === 'base_3F' || d.aisladoTipo === 'base_4F') {
    var aisInfImg = _crearImg('assets/panel-busbar/' + aisFile, aisX, aisInfY, aisW, aisH);
    aisInfImg.style.zIndex = '1';
    container.appendChild(aisInfImg);
  }


  if (d.aisladoTipo === '0.5s400_3F' || d.aisladoTipo === '0.5s400_4F') {
    var _allHK, _allH;
    if (d.fases === '2F' || d.fases === '1F+N') {
      _allHK = [];
      for (var _hKey in holes) {
        if (holes.hasOwnProperty(_hKey)) _allHK.push(_hKey);
      }
      _allH = holes;
    } else {
      _allHK = usarAis4f ? ['R', 'S', 'T', 'N'] : ['R', 'S', 'T'];
      _allH = usarAis4f ? HOLES_4F : HOLES_3F;
    }
    var _ais05W = 150, _ais05H = 150;
    var _aisYs05 = [aisY, aisInfY];
    for (var _ay = 0; _ay < _aisYs05.length; _ay++) {
      for (var _hi = 0; _hi < _allHK.length; _hi++) {
        var _hh = _allH[_allHK[_hi]];
        if (!_hh) continue;
        var _img05 = _crearImg(
          'assets/panel-busbar/ais_0.5s400-vf.svg',
          aisX + _hh.x - _ais05W / 2,
          _aisYs05[_ay] + holeRelY - _ais05H / 2,
          _ais05W, _ais05H
        );
        _img05.style.zIndex = '2';
        _img05.className = 'ais05s400-img';
        container.appendChild(_img05);
      }
    }
  }




  var barPEBottomY = aisInfY + aisH;


  if (typeof _hayDIFsInferiores === 'function' && _hayDIFsInferiores()) {
    var _difInfGap_pb = (typeof _difInfGapEff === 'function') ? _difInfGapEff() : 375;
    var _difInfNext_pb = (typeof _difInfNextGapEff === 'function') ? _difInfNextGapEff() : 375;




    if (!_barraPrimeraKey(d)) _difInfNext_pb = 0;
    barPEBottomY = aisInfY + aisH + _difInfGap_pb + _getTotalDIFInferiorHeight() + _difInfNext_pb;
  }

  container.style.left = leftReq + 'px';
  container.style.top = pbInset + 'px';
  container.style.width = aisW + 'px';
  var _botGapPb = GAB_BOT_GAP_PX || 350;
  container.style.height = (barPEBottomY + _botGapPb - pbInset) + 'px';

  var nuevoGabH = Math.max(gabDefaultW, barPEBottomY + pbInset + _botGapPb);

  if (nuevoGabW > gabDefaultW || nuevoGabH > gabDefaultW) {
    redimensionarGabinete(nuevoGabW, nuevoGabH);
  }




  if (typeof _maybeAutosnapComercial === 'function') _maybeAutosnapComercial();





  if (window._itmList && window._itmList.length > 0 && typeof _dibujarITM === 'function') {

    window._itmList.forEach(function(itm) {
      var idx = parseInt(itm.conIndex);
      var _isCMRegI = !!cmRegConSet_pb[idx];
      var _isCMI = !_isCMRegI && !!cmConSet_pb[idx];
      itm.conW = _isCMRegI ? CM_REG_CON_W : (_isCMI ? CM_CON_W : (RIEL_CON_W || 115));
      itm.conH = _isCMRegI ? CM_REG_CON_H : (_isCMI ? CM_CON_H : 90);
      itm.conX = (aisW - itm.conW) / 2;
      itm.conY = getConY(idx, conectoresStartY, cmConSet_pb, cmRegConSet_pb);


      if (d.ciclo && d.ciclo[idx]) itm.fase = d.ciclo[idx];
    });


    if (typeof _redibujarTodosITMsYDIFs === 'function') {
      _redibujarTodosITMsYDIFs();
    } else {
      window._itmList.forEach(function(itm) {
        _dibujarITM(itm);
        _marcarTriangulosOcupados(itm);
      });
    }
  }


  if (window._igData && typeof _dibujarIG === 'function') {
    _dibujarIG(container);
  }


  if (typeof _dibujarBorneras === 'function') {
    _dibujarBorneras(container);
  }



  if (typeof redibujarBarras === 'function') {
    redibujarBarras();
  }




  if (typeof _dibujarGruposBorneras === 'function') {
    _dibujarGruposBorneras(container);
  }



  if (typeof _dibujarCanaletasFila === 'function') {
    _dibujarCanaletasFila(container);
  }



  if (typeof _dibujarCanaletasItm === 'function') {
    _dibujarCanaletasItm(container);
  }



  if (typeof _rotularCanaletas === 'function') {
    _rotularCanaletas(container);
  }



  _dibujarTrianguloIG(container);



  if (typeof _dibujarAlimentadorIG === 'function') _dibujarAlimentadorIG(container);



  if (typeof _bornerasRepintarSitiosSiEligiendo === 'function') {
    _bornerasRepintarSitiosSiEligiendo(container);
  }

  if (typeof _moverInfPintar === 'function') _moverInfPintar(container);
  if (typeof _moverBarraPintar === 'function') _moverBarraPintar(container);


  if (typeof posicionarCotas === 'function') {
    posicionarCotas();
  }




  if (typeof _autoBumpCerradura === 'function') {
    _autoBumpCerradura();
  }





  if (window._vistaActual === 'frontal_mandil' && typeof _renderMandilOverlays === 'function') {
    _renderMandilOverlays();
  }
}
























var COMERCIAL_PASO_MM = 50;


var _COMERCIAL_RANGOS = {
  CV_LEFT_PX:     { min: 20, max: 500 },
  CV_RIGHT_PX:    { min: 20, max: 500 },


  IG_MARGIN_TOP:  { min: 50, max: 350 },
  CV_TOP_PX:      { min: 50, max: 350 },
  GAB_BOT_GAP_PX: { min: 30, max: 500 }
};

function _proximoComercial(mm) {
  return Math.round(mm / COMERCIAL_PASO_MM) * COMERCIAL_PASO_MM;
}



function _setConstanteCV(nombre, valorPx) {
  var r = _COMERCIAL_RANGOS[nombre];
  if (!r) return 0;
  var pedido = valorPx;
  var acotado = Math.min(r.max / PX_TO_MM, Math.max(r.min / PX_TO_MM, pedido));
  window[nombre] = acotado;



  if (nombre === 'CV_TOP_PX') {
    CV_TOP_PX = window.CV_TOP_PX;
    CV_TOP_INNER = window.CV_TOP_PX - (PB_INSET_MM / PX_TO_MM);
    window.CV_TOP_INNER = CV_TOP_INNER;
  }
  if (nombre === 'IG_MARGIN_TOP') IG_MARGIN_TOP = window.IG_MARGIN_TOP;
  if (nombre === 'CV_LEFT_PX')    CV_LEFT_PX    = window.CV_LEFT_PX;
  if (nombre === 'CV_RIGHT_PX')   CV_RIGHT_PX   = window.CV_RIGHT_PX;
  if (nombre === 'GAB_BOT_GAP_PX') GAB_BOT_GAP_PX = window.GAB_BOT_GAP_PX;
  if ((nombre === 'IG_MARGIN_TOP' || nombre === 'CV_TOP_PX') && window._igData) {
    _recalcIgExtraTop();
  }
  return pedido - acotado;                                 
}

var _COMERCIAL_CONSTS = ['CV_LEFT_PX', 'CV_RIGHT_PX', 'IG_MARGIN_TOP',
                         'CV_TOP_PX', 'GAB_BOT_GAP_PX', 'CV_TOP_INNER',
                         'DIF_GAB_GAP_LEFT_PX', 'DIF_GAB_GAP_RIGHT_PX', 'BORN_IG_PARED_PX'];

function _snapshotComercial() {
  var s = {};
  _COMERCIAL_CONSTS.forEach(function(k) { s[k] = window[k]; });
  s._igExtraTop = window._igExtraTop;
  return s;
}
function _restaurarComercial(s) {
  _COMERCIAL_CONSTS.forEach(function(k) { window[k] = s[k]; });


  CV_LEFT_PX     = window.CV_LEFT_PX;
  CV_RIGHT_PX    = window.CV_RIGHT_PX;
  CV_TOP_PX      = window.CV_TOP_PX;
  CV_TOP_INNER   = window.CV_TOP_INNER;
  IG_MARGIN_TOP  = window.IG_MARGIN_TOP;
  GAB_BOT_GAP_PX = window.GAB_BOT_GAP_PX;
  window._igExtraTop = s._igExtraTop;
}



function _intentarSnap(targetWmm, targetHmm) {
  var marco = document.getElementById('marco_gabinete');
  var wmm = (parseFloat(marco.style.width)  || 0) * PX_TO_MM;
  var hmm = (parseFloat(marco.style.height) || 0) * PX_TO_MM;







  var _ct = document.getElementById('panel_busbar_container');
  var _aisW  = _ct ? (parseFloat(_ct.style.width) || 0) : 0;
  var _reqI  = _ct ? (parseFloat(_ct.style.left)  || 0) : 0;
  var _reqD  = (parseFloat(marco.style.width) || 0) - _reqI - _aisW;





  var _flCan = window._flancoCanPx || { left: 0, right: 0 };
  var dW = (targetWmm - wmm) / PX_TO_MM / 2;





  var _extra = window._SNAP_EXTRA_PX || 0;
  var _efL = _reqI - (_flCan.left  || 0) - _extra;
  var _efR = _reqD - (_flCan.right || 0) - _extra;
  var _cvL = window.CV_LEFT_PX || 0, _cvR = window.CV_RIGHT_PX || 0;
  var _mandaCV = Math.abs(_efL - _cvL) < 0.5 || Math.abs(_efR - _cvR) < 0.5;
  if (_mandaCV && _extra === 0) {
    var _soL = _setConstanteCV('CV_LEFT_PX',  _cvL + dW);
    var _soR = _setConstanteCV('CV_RIGHT_PX', _cvR + dW);

    var _so = Math.max(_soL || 0, _soR || 0);
    if (_so > 0) window._SNAP_EXTRA_PX = _so;
  } else {
    window._SNAP_EXTRA_PX = Math.max(0, _extra + dW);
  }



  var cotaTop = window._igData ? 'IG_MARGIN_TOP' : 'CV_TOP_PX';
  var dH = (targetHmm - hmm) / PX_TO_MM;
  var sobra = _setConstanteCV(cotaTop, window[cotaTop] + dH / 2);
  sobra = _setConstanteCV('GAB_BOT_GAP_PX', window.GAB_BOT_GAP_PX + dH / 2 + sobra);
  if (Math.abs(sobra) > 0.01) _setConstanteCV(cotaTop, window[cotaTop] + sobra);

  if (typeof dibujarPanelBusbar === 'function') dibujarPanelBusbar();
  return {
    w: (parseFloat(marco.style.width)  || 0) * PX_TO_MM,
    h: (parseFloat(marco.style.height) || 0) * PX_TO_MM
  };
}









function _converger(targetWmm, targetHmm) {
  var r = { w: 0, h: 0 }, errAnt = Infinity;
  for (var i = 0; i < 5; i++) {
    r = _intentarSnap(targetWmm, targetHmm);
    var err = Math.abs(r.w - targetWmm) + Math.abs(r.h - targetHmm);
    if (err < 0.5) break;                               
    if (err >= errAnt - 0.01) break;                           
    errAnt = err;
  }
  return r;
}

function _aplicarTamanoComercial() {
  var marco = document.getElementById('marco_gabinete');
  if (!marco || !window._gabineteData || !window._panelBusbarData) return;




  var _vista = window._vistaActual;
  if (_vista === 'lateral' && window._vistaFrontalDims &&
      typeof redimensionarGabinete === 'function') {
    redimensionarGabinete(window._vistaFrontalDims.w, window._vistaFrontalDims.h);
  }

  window._snappingComercial = true;
  var _ajusto = false;
  try {


    if (window._SNAP_EXTRA_PX > 0) {
      window._SNAP_EXTRA_PX = 0;
      if (typeof dibujarPanelBusbar === 'function') dibujarPanelBusbar();
      _ajusto = true;
    }
    var w0 = (parseFloat(marco.style.width)  || 0) * PX_TO_MM;
    var h0 = (parseFloat(marco.style.height) || 0) * PX_TO_MM;
    var tW = _proximoComercial(w0), tH = _proximoComercial(h0);
    if (tW === w0 && tH === h0) return;                               

    var snap = _snapshotComercial();
    var _extra0 = window._SNAP_EXTRA_PX || 0;
    var r = _converger(tW, tH);
    _ajusto = true;



    var falloW = (tW < w0) && (Math.abs(r.w - tW) > 0.5);
    var falloH = (tH < h0) && (Math.abs(r.h - tH) > 0.5);
    if (falloW || falloH) {
      _restaurarComercial(snap);
      window._SNAP_EXTRA_PX = _extra0;
      var cW = Math.ceil(w0 / COMERCIAL_PASO_MM) * COMERCIAL_PASO_MM;
      var cH = Math.ceil(h0 / COMERCIAL_PASO_MM) * COMERCIAL_PASO_MM;
      _converger(falloW ? cW : tW, falloH ? cH : tH);
    }





    var f = {
      w: (parseFloat(marco.style.width)  || 0) * PX_TO_MM,
      h: (parseFloat(marco.style.height) || 0) * PX_TO_MM
    };
    var offW = Math.abs(f.w - _proximoComercial(f.w)) > 0.5;
    var offH = Math.abs(f.h - _proximoComercial(f.h)) > 0.5;
    if ((offW || offH) && typeof _avisoFlotante === 'function') {
      _avisoFlotante('No se pudo llevar ' +
        (offW && offH ? 'el tablero' : offW ? 'el ancho' : 'el alto') +
        ' a un múltiplo de 50 mm: quedó en ' +
        f.w.toFixed(0) + ' × ' + f.h.toFixed(0) + ' mm.');
    }
  } finally {
    window._snappingComercial = false;





    if (_vista && _vista !== 'frontal') {
      window._vistaFrontalDims = {
        w: parseFloat(marco.style.width)  || 0,
        h: parseFloat(marco.style.height) || 0
      };
      if (typeof aplicarVista === 'function') aplicarVista(_vista);
    }

    if (_ajusto && typeof guardarSesion === 'function') guardarSesion();
  }
}




function _maybeAutosnapComercial() {
  if (window._snappingComercial) return;
  if (window._autosnapComercial !== true) return;
  if (!window._gabineteData) return;
  clearTimeout(window._autosnapTimer);
  window._autosnapTimer = setTimeout(_aplicarTamanoComercial, 80);
}

