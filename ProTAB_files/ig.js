





















function calcularIGH(tipo, polos, corriente) {
  if (tipo === 'cm_fijo') {
    var isMod2 = parseInt(corriente, 10) >= 125;
    return isMod2 ? (165 / PX_TO_MM) : (130 / PX_TO_MM);
  }
  if (tipo === 'cm_reg') return 161 / PX_TO_MM;
  return 425;
}




function igPolosPermitidos(d) {
  if (!d) return [1, 2, 3, 4];
  if (d.fases === '3F') return [3];
  if (d.fases === '3F+N') return (d.subfases === 'R - S - T') ? [3] : [3, 4];
  if (d.fases === '2F') return [2];
  if (d.fases === '1F+N') return (String(d.subfases || '').indexOf('-N') !== -1) ? [1, 2] : [1];
  return [1, 2, 3, 4];
}



function igAlineacionDefault(d, polos) {
  polos = parseInt(polos, 10);
  if (d && d.fases === '2F') return 'MEDIO';
  if (polos >= 4) return 'RSTN';
  if (d && d.fases === '1F+N') {
    if (polos === 2) return 'MEDIO';
    var x2 = String(d.subfases || '').indexOf('-N') !== -1;
    return x2 ? String(d.subfases).replace(/-N$/, '') : 'MEDIO';
  }
  return 'S';
}








var IG_AIRE_MIN_MM = 30;
function igPlacaPx(d) {
  d = d || window._panelBusbarData;
  if (!d || !d.conexionIG) return 0;
  var ext = (typeof _busbarExtMm === 'function') ? _busbarExtMm(d) : 20;
  return ((d.conexionIGAltura || 20) + ext - IG_SOLAPE_MM) / PX_TO_MM;
}
function _recalcIgExtraTop() {
  if (!window._igData) { window._igExtraTop = 0; return; }
  var minGap = igPlacaPx() + IG_AIRE_MIN_MM / PX_TO_MM;
  if (IG_GAP < minGap) { IG_GAP = minGap; window.IG_GAP = minGap; }
  var ig = window._igData;
  var igH = calcularIGH(ig.tipo, ig.polos, ig.corriente);

  var _bl = (typeof _barrasLadoAltoReq === 'function') ? _barrasLadoAltoReq() : 0;
  window._igExtraTop = Math.max(0, igH + IG_GAP + IG_MARGIN_TOP - CV_TOP_PX, _bl);
}

function buildIG(input, panelBusbarData) {
  input = input || {};
  var errors = [];

  var tipo = input.tipo;
  if (!tipo) errors.push('Selecciona el tipo');
  else if (['riel', 'cm_fijo', 'cm_reg'].indexOf(tipo) === -1) {
    errors.push('Tipo invalido: ' + tipo);
  }

  var polos = parseInt(input.polos, 10);
  if (isNaN(polos) || polos < 1 || polos > 4) errors.push('Polos invalido');

  var corriente = input.corriente;
  if (!corriente) errors.push('Elige la capacidad');

  if (panelBusbarData && tipo) {
    var fases = panelBusbarData.fases;
    var subfases = panelBusbarData.subfases;
    if (tipo === 'cm_reg' && (fases === '2F' || fases === '1F+N')) {
      errors.push('CM Reg requiere 3 fases (no compatible con ' + fases + ')');
    }
    if (fases === '3F+N' && subfases === 'R - S - T' && polos === 4) {
      errors.push('4P requiere Orden R-S-T-N (no compatible con R-S-T)');
    }


    if (!isNaN(polos) && igPolosPermitidos(panelBusbarData).indexOf(polos) === -1) {
      errors.push(polos + 'P no existe en ' + fases + (subfases ? ' (' + subfases + ')' : ''));
    }
    if (tipo === 'cm_fijo' && parseInt(corriente, 10) >= 125 && polos < 3) {
      errors.push('CM Fijo Mod2 (125 A o mas) solo en 3P o 4P');
    }
  }

  if (errors.length > 0) return { ok: false, errors: errors };

  var conector = !!input.conector;
  var alineacion = null;
  if (conector) {
    alineacion = input.alineacion || igAlineacionDefault(panelBusbarData, polos);
  }

  return {
    ok: true, errors: [],
    data: { tipo: tipo, polos: polos, corriente: corriente, conector: conector, alineacion: alineacion }
  };
}






function _igAlinearConBarras(arr, d) {
  if (!arr || !d || typeof pbBarrasX !== 'function') return;
  var h = pbBarrasX(d).holes || {};
  arr.forEach(function(e) { if (e && h[e.fase]) e.busbarHoleX = h[e.fase].x; });
}


function _getAisladorHoles(d, aisNatW, usarAis4f) {
  if (!d) return null;
  var r = calcAisladorHoles({
    aisladoTipo: d.aisladoTipo, fases: d.fases,
    aisGap2f: d.aisGap2f, aisGap3f: d.aisGap3f, aisGap4f: d.aisGap4f,
    aisNatW: aisNatW, usarAis4f: usarAis4f
  });
  return r.holes;
}







function _regSugerida(cap) {
  var a = parseFloat(cap);
  return a > 0 ? Math.round(a * 0.8) : '';
}
function _regSync(tipo, capId, wrapId, inpId) {
  var w = document.getElementById(wrapId), inp = document.getElementById(inpId);
  var cap = document.getElementById(capId);
  var on = (tipo === 'cm_reg');
  if (w) w.style.display = on ? '' : 'none';
  if (!on || !inp || !cap) return;
  if (inp.dataset.auto !== '0') inp.value = _regSugerida(cap.value);
  inp.max = cap.value;
}
function _regIniciar(inpId, guardada, cap) {
  var inp = document.getElementById(inpId);
  if (!inp) return;
  var sug = _regSugerida(cap);
  var g = parseFloat(guardada);
  inp.value = (g > 0) ? g : sug;
  inp.dataset.auto = (g > 0 && g !== sug) ? '0' : '1';
}
function _regLeer(inpId, cap) {
  var inp = document.getElementById(inpId);
  var v = inp ? parseFloat(inp.value) : NaN, a = parseFloat(cap);
  if (!(v > 0)) v = _regSugerida(cap);
  if (a > 0 && v > a) v = a;
  return v > 0 ? Math.round(v * 10) / 10 : null;
}
function _regIG() {
  _regSync(document.getElementById('modalIG_tipo').value, 'modalIG_corriente', 'wrap_ig_regulacion', 'modalIG_regulacion');
}


function abrirModalIG() {
  if (!window._panelBusbarData) return;
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalIG_overlay').classList.add('activo');
  _filtrarTipoIG();                                               

  if (window._igData) {
    document.getElementById('modalIG_tipo').value = window._igData.tipo;
    var _tipoSelIG = document.getElementById('modalIG_tipo');
    var _optActIG = _tipoSelIG.querySelector('option[value="' + _tipoSelIG.value + '"]');
    if (!_optActIG || _optActIG.disabled) _tipoSelIG.value = 'riel';
    onIGTipoChange();
    document.getElementById('modalIG_corriente').value = window._igData.corriente || '';
    if (window._igData.tipo === 'cm_fijo') onIGCorrienteChange();
    document.getElementById('modalIG_polos').value = window._igData.polos;
    var chkCon = document.getElementById('modalIG_conectorEnabled');
    chkCon.checked = (window._igData.conector !== false);
    _actualizarAlineacionIG();
    document.getElementById('modalIG_alineacionCard').style.display = chkCon.checked ? 'flex' : 'none';
    var _aliSelIG = document.getElementById('modalIG_alineacion');
    var _is2FAliRest = window._panelBusbarData && window._panelBusbarData.fases === '2F';
    var _dfltAliRest = igAlineacionDefault(window._panelBusbarData, window._igData.polos);
    var _aliRestIG = (chkCon.checked && window._igData.alineacion) ? window._igData.alineacion : _dfltAliRest;
    if (_aliSelIG.querySelector('option[value="' + _aliRestIG + '"]')) {
      _aliSelIG.value = _aliRestIG;
    } else if (_is2FAliRest && _aliSelIG.querySelector('option[value="MEDIO"]')) {
      _aliSelIG.value = 'MEDIO';
    } else if (_aliSelIG.options.length > 0) {
      _aliSelIG.value = _aliSelIG.options[0].value;
    }
  } else {
    document.getElementById('modalIG_tipo').value = 'riel';
    onIGTipoChange();
    document.getElementById('modalIG_conectorEnabled').checked = true;
    document.getElementById('modalIG_alineacionCard').style.display = 'flex';
    _actualizarAlineacionIG();
    var _aliNuevoIG = document.getElementById('modalIG_alineacion');
    var _is2FAliNvo = window._panelBusbarData && window._panelBusbarData.fases === '2F';
    var _polNvo = parseInt((document.getElementById('modalIG_polos') || {}).value, 10);
    var _dfltAliNvo = igAlineacionDefault(window._panelBusbarData, _polNvo);
    if (_aliNuevoIG.querySelector('option[value="' + _dfltAliNvo + '"]')) {
      _aliNuevoIG.value = _dfltAliNvo;
    } else if (_aliNuevoIG.options.length > 0) {
      _aliNuevoIG.value = _aliNuevoIG.options[0].value;
    }
  }

  var _igR = window._igData;
  _regIniciar('modalIG_regulacion', (_igR && _igR.tipo === 'cm_reg') ? _igR.regulacion : null,
              document.getElementById('modalIG_corriente').value);
  _regIG();
  document.getElementById('modalIG_error').textContent = '';

  if (typeof alimIGAbrir === 'function') alimIGAbrir();
}

function cerrarModalIG() {
  document.getElementById('modalIG_overlay').classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';

  if (typeof alimIGCerrar === 'function') alimIGCerrar(true);
}



function _filtrarTipoIG() {
  var d = window._panelBusbarData;
  var fases = d ? d.fases : '3F';
  var tipoSel = document.getElementById('modalIG_tipo');
  if (!tipoSel) return;
  var bloqSet = {};
  if (fases === '2F' || fases === '1F+N') bloqSet['cm_reg'] = true;
  var opciones = tipoSel.querySelectorAll('option');
  for (var j = 0; j < opciones.length; j++) {
    var op = opciones[j];
    var bloqueado = !!bloqSet[op.value];
    op.disabled = bloqueado;
    op.hidden = bloqueado;
  }
  if (bloqSet[tipoSel.value]) tipoSel.value = 'riel';
}

function onIGTipoChange() {
  var tipo = document.getElementById('modalIG_tipo').value;
  var polSel = document.getElementById('modalIG_polos');
  var corSel = document.getElementById('modalIG_corriente');
  var corPrev = corSel ? corSel.value : '';

  if (corSel) {
    if (tipo === 'cm_fijo') {
      var _d_cor = window._panelBusbarData;
      var _fases_cor = _d_cor ? (_d_cor.fases || '3F') : '3F';
      var _mod1CorHTML =
          '<option value="15">15A</option><option value="16">16A</option>'
        + '<option value="20">20A</option><option value="25">25A</option>'
        + '<option value="30">30A</option><option value="32">32A</option>'
        + '<option value="40">40A</option><option value="50">50A</option>'
        + '<option value="60">60A</option><option value="75">75A</option>'
        + '<option value="80">80A</option><option value="100">100A</option>';

      if (_fases_cor === '2F' || _fases_cor === '1F+N') {
        corSel.innerHTML = '<option value="">—</option>' + _mod1CorHTML;
      } else {
        corSel.innerHTML = '<option value="">—</option>'
          + '<optgroup label="Mod1 — hasta 100A">' + _mod1CorHTML + '</optgroup>'
          + '<optgroup label="Mod2 — 125A en adelante">'
          + '<option value="125">125A</option><option value="150">150A</option>'
          + '<option value="160">160A</option><option value="175">175A</option>'
          + '<option value="200">200A</option><option value="225">225A</option>'
          + '<option value="250">250A</option></optgroup>';
      }
      corSel.value = corPrev;
      if (!corSel.value) corSel.value = '';
    } else if (tipo === 'cm_reg') {
      corSel.innerHTML = '<option value="">—</option>'
        + '<option value="80">80A</option><option value="100">100A</option>'
        + '<option value="125">125A</option><option value="150">150A</option>'
        + '<option value="160">160A</option><option value="200">200A</option>'
        + '<option value="220">220A</option><option value="250">250A</option>';
      corSel.value = corPrev;
      if (!corSel.value) corSel.value = '';
    } else {
      corSel.innerHTML =
        '<option value="">—</option>'
        + '<option value="6">6A</option><option value="10">10A</option>'
        + '<option value="16">16A</option><option value="20">20A</option>'
        + '<option value="25">25A</option><option value="32">32A</option>'
        + '<option value="40">40A</option><option value="50">50A</option>'
        + '<option value="63">63A</option>';
      corSel.value = corPrev;
    }
  }

  if (tipo === 'cm_fijo') {
    var d_ig_pb = window._panelBusbarData;
    var _fasesCM = d_ig_pb ? (d_ig_pb.fases || '3F') : '3F';
    if (_fasesCM === '2F' || _fasesCM === '1F+N') {
      var _sf1fnCM = d_ig_pb ? (d_ig_pb.subfases || '') : '';
      if (_fasesCM === '2F') {
        polSel.innerHTML = '<option value="2" selected>2P</option>';
      } else if (_sf1fnCM.indexOf('-N') === -1) {
        polSel.innerHTML = '<option value="1" selected>1P</option>';
      } else {
        polSel.innerHTML = '<option value="1">1P</option><option value="2" selected>2P</option>';
      }
      polSel.disabled = false;
    } else {
      var ig4PDisponible = d_ig_pb && d_ig_pb.fases === '3F+N' && d_ig_pb.subfases !== 'R - S - T';
      polSel.innerHTML = '<option value="3" selected>3P</option>'
        + (ig4PDisponible ? '<option value="4">4P</option>' : '');
      polSel.disabled = false;
    }
  } else if (tipo === 'cm_reg') {
    var d_ig_cr = window._panelBusbarData;
    var ig4PDisponible_cr = d_ig_cr && d_ig_cr.fases === '3F+N' && d_ig_cr.subfases !== 'R - S - T';
    polSel.innerHTML = '<option value="3" selected>3P</option>'
      + (ig4PDisponible_cr ? '<option value="4">4P</option>' : '');
    polSel.disabled = false;
  } else {
    polSel.disabled = false;
    _actualizarPolosIG();
  }
  _actualizarAlineacionIG();
  _regIG();
}

function onIGCorrienteChange() {
  _regIG();
  var tipo = document.getElementById('modalIG_tipo').value;
  if (tipo !== 'cm_fijo') return;
  _actualizarAlineacionIG();
}

function onIGPolosChange() {
  _actualizarAlineacionIG();
}

function _actualizarPolosIG() {
  var tipo = document.getElementById('modalIG_tipo').value;
  if (tipo === 'cm_fijo' || tipo === 'cm_reg') return;
  var d = window._panelBusbarData;
  var fases = d ? d.fases : '3F';
  var opciones = [];
  if      (fases === '3F')   opciones = [3];
  else if (fases === '3F+N') {
    var subfasesIG = d ? (d.subfases || '') : '';
    opciones = (subfasesIG === 'R - S - T') ? [3] : [3, 4];
  }
  else if (fases === '2F')   opciones = [2];
  else if (fases === '1F+N') {
    var _sf1fn = d ? (d.subfases || '') : '';
    opciones = (_sf1fn.indexOf('-N') !== -1) ? [1, 2] : [1];
  }
  var selPolos = document.getElementById('modalIG_polos');
  if (opciones.length === 0) {
    selPolos.innerHTML = '<option value="">—</option>';
  } else {
    selPolos.innerHTML = opciones.map(function(p) {
      return '<option value="' + p + '">' + p + 'P</option>';
    }).join('');
  }
  _actualizarAlineacionIG();
}

function _actualizarAlineacionIG() {
  var polSel = document.getElementById('modalIG_polos');
  var aliSel = document.getElementById('modalIG_alineacion');
  if (!polSel || !aliSel) return;
  var polos = parseInt(polSel.value, 10) || 0;
  var val = aliSel.value;
  var _pbAli = window._panelBusbarData;
  var _fasesAli = _pbAli ? (_pbAli.fases || '3F') : '3F';
  var _sfAli = _pbAli ? (_pbAli.subfases || '') : '';
  var _is1fnX1Ali = (_fasesAli === '1F+N' && _sfAli.indexOf('-N') === -1);
  var _is1P_multiBus = (polos === 1 && (
      (_fasesAli === '1F+N' && _sfAli.indexOf('-N') !== -1) ||
      _fasesAli === '2F'
  ));
  var _lockAli = _is1fnX1Ali || _is1P_multiBus;
  var _soloMedio = (!_lockAli && _fasesAli === '1F+N' && _sfAli.indexOf('-N') !== -1);

  if (_lockAli) {
    var _lockLabel = '';
    var _lockVal = 'MEDIO';
    if (_is1P_multiBus) {
      if (_fasesAli === '1F+N' && _sfAli.indexOf('-N') !== -1) {
        _lockVal = _sfAli.replace(/-N$/, '');
        _lockLabel = _lockVal;
      } else if (_fasesAli === '2F' && _pbAli && _pbAli.ciclo && _pbAli.ciclo.length > 0) {
        _lockVal = _pbAli.ciclo[0];
        _lockLabel = _lockVal;
      }
    }
    aliSel.innerHTML = '<option value="' + _lockVal + '">' + _lockLabel + '</option>';
    aliSel.disabled = true;
  } else {
    aliSel.disabled = false;
  }
  if (_soloMedio) {
    aliSel.innerHTML = '<option value="MEDIO">Medio</option>';
    aliSel.disabled = true;
  } else if (!_lockAli) {
    if (_fasesAli === '2F' && _pbAli && _pbAli.subfases) {
      var _2fParts = _pbAli.subfases.split(' - ');
      var _2fF1 = (_2fParts[0] || 'R').trim();
      var _2fF2 = (_2fParts[1] || 'S').trim();
      aliSel.innerHTML = (polos === 2 ? '<option value="MEDIO">Medio</option>' : '')
        + '<option value="' + _2fF1 + '">' + _2fF1 + '</option>'
        + '<option value="' + _2fF2 + '">' + _2fF2 + '</option>';
    } else {
      aliSel.innerHTML = (polos >= 4 ? '<option value="RSTN">Medio</option>' : '')
        + '<option value="R">R</option>'
        + '<option value="S">S</option>'
        + '<option value="T">T</option>'
        + (polos === 2 ? '<option value="MEDIO">Medio</option>' : '')
        + (polos >= 4 ? '<option value="N">N</option>' : '');
    }
  }




  var cambioPolos = (_igAliPolosPrev !== polos);
  _igAliPolosPrev = polos;
  if (cambioPolos && polos >= 4 && aliSel.querySelector('option[value="RSTN"]')) {
    aliSel.value = 'RSTN';
    return;
  }
  if (aliSel.querySelector('option[value="' + val + '"]')) {
    aliSel.value = val;
  } else if (_fasesAli === '2F' && aliSel.querySelector('option[value="MEDIO"]')) {
    aliSel.value = 'MEDIO';
  } else if (aliSel.querySelector('option[value="S"]')) {
    aliSel.value = 'S';
  }
}
var _igAliPolosPrev = null;

function onIGConectorChange() {
  var enabled = document.getElementById('modalIG_conectorEnabled').checked;
  document.getElementById('modalIG_alineacionCard').style.display = enabled ? 'flex' : 'none';
}


function confirmarModalIG() {
  var errEl = document.getElementById('modalIG_error');
  errEl.textContent = '';

  var _igInput = {
    tipo:       document.getElementById('modalIG_tipo').value,
    polos:      parseInt(document.getElementById('modalIG_polos').value, 10),
    corriente:  document.getElementById('modalIG_corriente').value,
    conector:   document.getElementById('modalIG_conectorEnabled').checked,
    alineacion: document.getElementById('modalIG_conectorEnabled').checked
                  ? document.getElementById('modalIG_alineacion').value
                  : null
  };

  var resp = buildIG(_igInput, window._panelBusbarData || null);
  if (!resp.ok) {
    errEl.textContent = (resp.errors || ['Error al armar Interruptor General']).join(' / ');
    return;
  }

  window._igData = resp.data;
  if (resp.data.tipo === 'cm_reg') {
    window._igData.regulacion = _regLeer('modalIG_regulacion', resp.data.corriente);
  }


  _recalcIgExtraTop();


  if (typeof alimIGCerrar === 'function') alimIGCerrar(false);
  cerrarModalIG();




  _conReglas(function() {
    dibujarPanelBusbar();
    actualizarBibliotecaIG();

    guardarSesion();
  });
}




function onIGTriangleClick(tri) {
  var menu = document.createElement('div');
  menu.className = 'dif-context-menu';
  var btnEditar = document.createElement('button');
  btnEditar.className = 'dif-context-btn';
  btnEditar.textContent = 'Editar';
  btnEditar.addEventListener('click', function() { abrirModalIG(); });
  menu.appendChild(btnEditar);

  if (typeof alimDesplazable === 'function' && alimDesplazable()) {
    var btnMover = document.createElement('button');
    btnMover.className = 'dif-context-btn';
    btnMover.textContent = 'Desplazar alimentador';
    btnMover.addEventListener('click', function() { desplazarAlimentador(); });
    menu.appendChild(btnMover);
  }
  var btnEliminar = document.createElement('button');
  btnEliminar.className = 'dif-context-btn';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.style.color = '#ff6b6b';
  btnEliminar.addEventListener('click', function() { eliminarIG(); });
  menu.appendChild(btnEliminar);
  _abrirMenuTriangulo(menu, tri, { centrado: true });
}







function eliminarIG() {
  if (!window._igData) return;
  limpiarIG();                                                      


  _conReglas(function() {
    dibujarPanelBusbar();
    actualizarBibliotecaIG();
    guardarSesion();
  });
}


function limpiarIG(soloDom) {
  var container = document.getElementById('panel_busbar_container');
  if (container) {
    container.querySelectorAll('.ig-img, .ig-rotulo, .ig-insert, [data-ig-item]').forEach(function(el) { el.remove(); });
  }
  if (soloDom) return;
  window._igData = null;
  window._igExtraTop = 0;
}


function _dibujarIG(container) {
  if (!window._igData || !window._panelBusbarData) return;
  var d = window._panelBusbarData;
  var igD = window._igData;
  var usarAis4f = _isAis4fDrawing(d);
  var aisNatW = usarAis4f ? 715 : 650;
  var aisY = CV_TOP_INNER + (window._igExtraTop || 0);

  var igX, igY, igW, igH, svgFile, imgW, imgH;

  if (igD.tipo === 'riel') {
    imgW = 90 * igD.polos;
    imgH = 425;
    igW = imgW;
    igH = imgH;
    svgFile = 'itm' + igD.polos + 'p_riel.svg';
    igY = aisY - igH - IG_GAP;
    if (igD.conector !== false && igD.alineacion) {
      var _rMa = {
        1: { vbX:743, vbW:176, cx:[831] },
        2: { vbX:653, vbW:368, cx:[747.6, 927.6] },
        3: { vbX:566, vbW:568, cx:[663.9, 850.4, 1036.6] },
        4: { vbX:517, vbW:668, cx:[604.1, 769.0, 933.9, 1099.0] }
      };
      var _rm_r = _rMa[igD.polos] || _rMa[3];
      var _rSx = igW / _rm_r.vbW;
      var _rPBr = d;
      var _rHa = [];
      var _is1fnX1 = _rPBr.fases === '1F+N' && (!_rPBr.subfases || _rPBr.subfases.indexOf('-N') === -1);
      if (_is1fnX1) {
        var _sf1fnX1_rha = (_rPBr.subfases || 'R').trim();
        if (_rm_r.cx[0] !== undefined) _rHa.push({ fase:_sf1fnX1_rha, relX:(_rm_r.cx[0]-_rm_r.vbX)*_rSx, busbarHoleX: aisNatW / 2 });
      } else if (_rPBr.fases === '2F' || _rPBr.fases === '1F+N') {
        var _2fLft_rha = 'R', _2fRgt_rha = 'S';
        if (_rPBr.fases === '2F' && _rPBr.subfases) {
          var _2fPts_rha = _rPBr.subfases.split(' - ');
          _2fLft_rha = _2fPts_rha[0].trim();
          _2fRgt_rha = _2fPts_rha[1] ? _2fPts_rha[1].trim() : 'S';
        } else if (_rPBr.fases === '1F+N') {


          var _sfR = (_rPBr.subfases || 'R').replace(/-N$/, '');
          _2fLft_rha = (_rPBr.invertirN && igD.polos !== 1) ? 'N' : _sfR;
          _2fRgt_rha = (_rPBr.invertirN && igD.polos !== 1) ? _sfR : 'N';
        }
        if (_rm_r.cx[0] !== undefined) _rHa.push({ fase:_2fLft_rha, relX:(_rm_r.cx[0]-_rm_r.vbX)*_rSx, busbarHoleX:75.0 });
        if (_rm_r.cx[1] !== undefined) _rHa.push({ fase:_2fRgt_rha, relX:(_rm_r.cx[1]-_rm_r.vbX)*_rSx, busbarHoleX:575.0 });
      } else {
        var _rFdef = [
          { fase:'R', ci:0, bx: usarAis4f ? 106.3 : 75.0,  ok: true },
          { fase:'S', ci:1, bx: usarAis4f ? 273.8 : 325.0, ok: _rPBr.fases !== '1F+N' },
          { fase:'T', ci:2, bx: usarAis4f ? 441.3 : 575.0, ok: (_rPBr.fases==='3F'||_rPBr.fases==='3F+N') },
          { fase:'N', ci:3, bx: usarAis4f ? 608.8 : 575.0, ok: igD.polos >= 4 && usarAis4f }
        ];
        for (var _rfj=0; _rfj<_rFdef.length; _rfj++) {
          var _rf = _rFdef[_rfj];
          var _cx = _rm_r.cx[_rf.ci];
          if (_rf.ok && _cx !== undefined) _rHa.push({ fase:_rf.fase, relX:(_cx-_rm_r.vbX)*_rSx, busbarHoleX:_rf.bx });
        }
        if (_rHa.length > igD.polos) _rHa = _rHa.slice(0, igD.polos);
      }

      var _bH_rx = _getAisladorHoles(d, usarAis4f ? 715 : 650, usarAis4f);
      if (_bH_rx) {
        if (_is1fnX1) {
          if (_rHa.length > 0) _rHa[0].busbarHoleX = aisNatW / 2;
        } else if (d.fases === '2F' || d.fases === '1F+N') {
          if (_rHa.length > 0 && _bH_rx.R) _rHa[0].busbarHoleX = _bH_rx.R.x;
          if (_rHa.length > 1 && _bH_rx.T) _rHa[1].busbarHoleX = _bH_rx.T.x;
        } else {
          for (var _ov_rx = 0; _ov_rx < _rHa.length; _ov_rx++) {
            var _fi_rx = _rHa[_ov_rx].fase;
            if (_bH_rx[_fi_rx]) _rHa[_ov_rx].busbarHoleX = _bH_rx[_fi_rx].x;
          }
        }
      }

      if (_rPBr.invertirN && usarAis4f) {
        if (_rHa.length >= 4) {
          var _iF4r = ['N','R','S','T'];
          for (var _qi4r = 0; _qi4r < 4 && _qi4r < _rHa.length; _qi4r++) _rHa[_qi4r].fase = _iF4r[_qi4r];
        }
        var _invBxR;
        var _bH_inv = _getAisladorHoles(_rPBr, 715, true);
        if (_bH_inv) {
          _invBxR = { N: _bH_inv.R.x, R: _bH_inv.S.x, S: _bH_inv.T.x, T: _bH_inv.N.x };
        } else {
          _invBxR = { N: 106.3, R: 273.8, S: 441.3, T: 608.8 };
        }
        for (var _qiR = 0; _qiR < _rHa.length; _qiR++) {
          if (_invBxR[_rHa[_qiR].fase] !== undefined) _rHa[_qiR].busbarHoleX = _invBxR[_rHa[_qiR].fase];
        }
      }

      if (_rPBr.fases === '1F+N' && _rPBr.invertirN &&
          _rPBr.subfases && _rPBr.subfases.indexOf('-N') !== -1 &&
          igD.polos === 1 && _rHa.length === 1) {
        var _bxT_1fn1p = 575.0;
        var _bH_1p = _getAisladorHoles(d, 650, false);
        if (_bH_1p && _bH_1p.T) _bxT_1fn1p = _bH_1p.T.x;
        _rHa[0].busbarHoleX = _bxT_1fn1p;
      }
      _igAlinearConBarras(_rHa, d);

      if (_rHa.length === 0) {
        igX = (aisNatW - igW) / 2;
      } else if (igD.alineacion === 'MEDIO' && _rHa.length >= 2) {
        var _rH0_m = _rHa[0], _rHL_m = _rHa[_rHa.length - 1];
        igX = (_rH0_m.busbarHoleX + _rHL_m.busbarHoleX) / 2
            - (_rH0_m.relX        + _rHL_m.relX)        / 2;
      } else if (igD.alineacion === 'RSTN' && igD.polos >= 4) {
        var _rS_rstn = null, _rT_rstn = null;
        for (var _rj2=0; _rj2<_rHa.length; _rj2++) {
          if (_rHa[_rj2].fase === 'S') _rS_rstn = _rHa[_rj2];
          if (_rHa[_rj2].fase === 'T') _rT_rstn = _rHa[_rj2];
        }
        if (_rS_rstn && _rT_rstn) {
          igX = (_rS_rstn.busbarHoleX + _rT_rstn.busbarHoleX) / 2
              - (_rS_rstn.relX        + _rT_rstn.relX)        / 2;
        } else {
          igX = (aisNatW - igW) / 2;
        }
      } else {
        var _rAs = igD.alineacion, _rAi = 0;
        for (var _rj=0; _rj<_rHa.length; _rj++) { if (_rHa[_rj].fase===_rAs) { _rAi=_rj; break; } }
        var _rAh = _rHa[_rAi];
        var _rIF = (_rAi === 0), _rIL = (_rAi === _rHa.length-1);
        if (_rIF && !_rIL) { igX = _rAh.busbarHoleX + 12.5 - _rAh.relX; }
        else if (_rIL && !_rIF) { igX = _rAh.busbarHoleX - 12.5 - _rAh.relX; }
        else { igX = _rAh.busbarHoleX - _rAh.relX; }
      }
    } else {
      igX = (aisNatW - igW) / 2;
    }
  } else if (igD.tipo === 'cm_reg') {
    imgW = (igD.polos === 4 ? 140 : 105) / PX_TO_MM;
    imgH = 161 / PX_TO_MM;
    igW = imgW;
    igH = imgH;
    svgFile = igD.polos === 4 ? 'itm4p_cm_reg-vf.svg' : 'itm3p_cm_reg-vf.svg';
    {
      var _hR_cr = true;
      var _hS_cr = d.fases !== '1F+N';
      var _hT_cr = (d.fases === '3F' || d.fases === '3F+N');
      var _hN_cr = igD.polos === 4 && usarAis4f;
      var _igHolesTab_cr = igD.polos === 4 ? [
        { fase:'R', relX: 86.4,  busbarHoleX: usarAis4f ? 106.3 : 75.0,  exists: _hR_cr },
        { fase:'S', relX: 261.3, busbarHoleX: usarAis4f ? 273.8 : 325.0, exists: _hS_cr },
        { fase:'T', relX: 436.4, busbarHoleX: usarAis4f ? 441.3 : 575.0, exists: _hT_cr },
        { fase:'N', relX: 611.4, busbarHoleX: 608.8,                      exists: _hN_cr }
      ] : [
        { fase:'R', relX: 86.47, busbarHoleX: usarAis4f ? 106.3 : 75.0,  exists: _hR_cr },
        { fase:'S', relX: 261.3, busbarHoleX: usarAis4f ? 273.8 : 325.0, exists: _hS_cr },
        { fase:'T', relX: 436.3, busbarHoleX: usarAis4f ? 441.3 : 575.0, exists: _hT_cr }
      ];
      var _igActiveH_cr = [];
      for (var _ighi_cr = 0; _ighi_cr < _igHolesTab_cr.length; _ighi_cr++) {
        if (_igHolesTab_cr[_ighi_cr].exists) _igActiveH_cr.push(_igHolesTab_cr[_ighi_cr]);
      }
      if (_igActiveH_cr.length === 0) _igActiveH_cr = [_igHolesTab_cr[0]];
      var _bH_cr = _getAisladorHoles(d, usarAis4f ? 715 : 650, usarAis4f);
      if (_bH_cr) {
        for (var _ov_cr = 0; _ov_cr < _igActiveH_cr.length; _ov_cr++) {
          var _fi_cr = _igActiveH_cr[_ov_cr].fase;
          if (_bH_cr[_fi_cr]) _igActiveH_cr[_ov_cr].busbarHoleX = _bH_cr[_fi_cr].x;
        }
      }
      if (d.invertirN && usarAis4f) {
        if (_igActiveH_cr.length >= 4) {
          var _iF4cr = ['N','R','S','T'];
          for (var _qi4cr = 0; _qi4cr < 4 && _qi4cr < _igActiveH_cr.length; _qi4cr++) _igActiveH_cr[_qi4cr].fase = _iF4cr[_qi4cr];
        }
        var _invBxCr;
        var _bH_invCr = _getAisladorHoles(d, 715, true);
        if (_bH_invCr) {
          _invBxCr = { N: _bH_invCr.R.x, R: _bH_invCr.S.x, S: _bH_invCr.T.x, T: _bH_invCr.N.x };
        } else {
          _invBxCr = { N: 106.3, R: 273.8, S: 441.3, T: 608.8 };
        }
        for (var _qiCr = 0; _qiCr < _igActiveH_cr.length; _qiCr++) {
          if (_invBxCr[_igActiveH_cr[_qiCr].fase] !== undefined) _igActiveH_cr[_qiCr].busbarHoleX = _invBxCr[_igActiveH_cr[_qiCr].fase];
        }
      }
      _igAlinearConBarras(_igActiveH_cr, d);
      var _aliStr_cr = (igD.conector !== false && igD.alineacion) ? igD.alineacion : 'S';
      var _cmRW_cr = 20 / PX_TO_MM;
      var _cmR2W_cr = 20 / PX_TO_MM;
      if (_aliStr_cr === 'MEDIO' && _igActiveH_cr.length >= 2) {
        var _crH0_m = _igActiveH_cr[0], _crHL_m = _igActiveH_cr[_igActiveH_cr.length - 1];
        igX = (_crH0_m.busbarHoleX + _crHL_m.busbarHoleX) / 2
            - (_crH0_m.relX        + _crHL_m.relX)        / 2;
      } else if (_aliStr_cr === 'RSTN' && igD.polos >= 4) {
        var _crS_rstn = null, _crT_rstn = null;
        for (var _aii_cr2 = 0; _aii_cr2 < _igActiveH_cr.length; _aii_cr2++) {
          if (_igActiveH_cr[_aii_cr2].fase === 'S') _crS_rstn = _igActiveH_cr[_aii_cr2];
          if (_igActiveH_cr[_aii_cr2].fase === 'T') _crT_rstn = _igActiveH_cr[_aii_cr2];
        }
        if (_crS_rstn && _crT_rstn) {
          igX = (_crS_rstn.busbarHoleX + _crT_rstn.busbarHoleX) / 2
              - (_crS_rstn.relX        + _crT_rstn.relX)        / 2;
        } else {
          igX = (aisNatW - igW) / 2;
        }
      } else {
        var _aliIdx_cr = 0;
        for (var _aii_cr = 0; _aii_cr < _igActiveH_cr.length; _aii_cr++) {
          if (_igActiveH_cr[_aii_cr].fase === _aliStr_cr) { _aliIdx_cr = _aii_cr; break; }
        }
        var _aliH_cr = _igActiveH_cr[_aliIdx_cr];
        var _isFirst_cr = (_aliIdx_cr === 0);
        var _isLast_cr = (_aliIdx_cr === _igActiveH_cr.length - 1);
        if (_isFirst_cr && !_isLast_cr) {
          igX = _aliH_cr.busbarHoleX + _cmR2W_cr / 2 - _aliH_cr.relX - _cmRW_cr / 2;
        } else if (_isLast_cr && !_isFirst_cr) {
          igX = _aliH_cr.busbarHoleX + _cmRW_cr / 2 - _aliH_cr.relX - _cmR2W_cr / 2;
        } else {
          igX = _aliH_cr.busbarHoleX - _aliH_cr.relX;
        }
      }
    }
    igY = aisY - igH - IG_GAP;
  } else {

    var _isMod2IG = parseInt(igD.corriente, 10) >= 125;
    if (_isMod2IG) {
      imgW = (igD.polos * 35) / PX_TO_MM;
      imgH = 165 / PX_TO_MM;
    } else {
      imgW = (igD.polos * 25) / PX_TO_MM;
      imgH = 130 / PX_TO_MM;
    }
    igW = imgW;
    igH = imgH;
    svgFile = 'itm' + igD.polos + 'p_cm_fijo_' + (_isMod2IG ? 'mod2' : 'mod1') + '-vf.svg';
    {
      var _hR_ig = true;
      var _hS_ig = d.fases !== '1F+N';
      var _hT_ig = (d.fases === '3F' || d.fases === '3F+N');
      var _hN_ig = usarAis4f && igD.polos >= 4;
      var _igHolesTab = igD.polos >= 4
        ? ( _isMod2IG
          ? [ { fase:'R', relX: 87.63,  busbarHoleX: usarAis4f ? 106.3 : 75.0,  exists: _hR_ig },
              { fase:'S', relX: 262.64, busbarHoleX: usarAis4f ? 273.8 : 325.0, exists: _hS_ig },
              { fase:'T', relX: 437.62, busbarHoleX: usarAis4f ? 441.3 : 575.0, exists: _hT_ig },
              { fase:'N', relX: 612.61, busbarHoleX: 608.8,                      exists: _hN_ig } ]
          : [ { fase:'R', relX: 62.56,  busbarHoleX: usarAis4f ? 106.3 : 75.0,  exists: _hR_ig },
              { fase:'S', relX: 187.73, busbarHoleX: usarAis4f ? 273.8 : 325.0, exists: _hS_ig },
              { fase:'T', relX: 312.77, busbarHoleX: usarAis4f ? 441.3 : 575.0, exists: _hT_ig },
              { fase:'N', relX: 437.75, busbarHoleX: 608.8,                      exists: _hN_ig } ] )
        : ( _isMod2IG
          ? [ { fase:'R', relX: 87.58,  busbarHoleX: usarAis4f ? 106.3 : 75.0,  exists: _hR_ig },
              { fase:'S', relX: 262.50, busbarHoleX: usarAis4f ? 273.8 : 325.0, exists: _hS_ig },
              { fase:'T', relX: 437.43, busbarHoleX: usarAis4f ? 441.3 : 575.0, exists: _hT_ig } ]
          : [ { fase:'R', relX: 64.65,  busbarHoleX: usarAis4f ? 106.3 : 75.0,  exists: _hR_ig },
              { fase:'S', relX: 187.58, busbarHoleX: usarAis4f ? 273.8 : 325.0, exists: _hS_ig },
              { fase:'T', relX: 310.65, busbarHoleX: usarAis4f ? 441.3 : 575.0, exists: _hT_ig } ] );
      var _igActiveH = [];
      for (var _ighi = 0; _ighi < _igHolesTab.length; _ighi++) {
        if (_igHolesTab[_ighi].exists) _igActiveH.push(_igHolesTab[_ighi]);
      }
      if (_igActiveH.length === 0) _igActiveH = [_igHolesTab[0]];
      var _is1fnX1_ig = d.fases === '1F+N' && (!d.subfases || d.subfases.indexOf('-N') === -1);
      if (_is1fnX1_ig && _igActiveH.length === 1) {
        _igActiveH[0].busbarHoleX = aisNatW / 2;
        _igActiveH[0].fase = (d.subfases || 'R').trim();
      }
      var _is1fnX2_ig = d.fases === '1F+N' && d.subfases && d.subfases.indexOf('-N') !== -1;
      if (_is1fnX2_ig) {
        var _sf1fn_ig = (d.subfases || 'R').replace(/-N$/, '');
        var _relX1_ig = _igHolesTab.length > 1 ? _igHolesTab[1].relX : 187.58;
        var _bxL_1fn = 75.0;
        var _bxR_1fn = 575.0;
        if (igD.polos === 1) {
          _igActiveH = [
            { fase: _sf1fn_ig, relX: _igHolesTab[0].relX,
              busbarHoleX: d.invertirN ? _bxR_1fn : _bxL_1fn, exists: true }
          ];
        } else if (d.invertirN) {
          _igActiveH = [
            { fase: 'N',       relX: _igHolesTab[0].relX, busbarHoleX: _bxL_1fn, exists: true },
            { fase: _sf1fn_ig, relX: _relX1_ig,            busbarHoleX: _bxR_1fn, exists: true }
          ];
        } else {
          _igActiveH = [
            { fase: _sf1fn_ig, relX: _igHolesTab[0].relX, busbarHoleX: _bxL_1fn, exists: true },
            { fase: 'N',       relX: _relX1_ig,            busbarHoleX: _bxR_1fn, exists: true }
          ];
        }
      }
      var _bH_ig = !_is1fnX1_ig ? _getAisladorHoles(d, usarAis4f ? 715 : 650, usarAis4f) : null;
      if (_bH_ig) {
        for (var _ov_ig = 0; _ov_ig < _igActiveH.length; _ov_ig++) {
          var _fi_ig = _igActiveH[_ov_ig].fase;
          if (_bH_ig[_fi_ig]) _igActiveH[_ov_ig].busbarHoleX = _bH_ig[_fi_ig].x;
        }
      }

      if (d.fases === '2F') {
        var _g2f_ig_bx = (d.aisGap2f || 100.0) / PX_TO_MM;
        var _bxL_2f_ig = (650 - _g2f_ig_bx) / 2;
        var _bxR_2f_ig = (650 + _g2f_ig_bx) / 2;
        var _2fPts_ig = (d.subfases || 'R - S').split(' - ');
        var _2fLft_ig = _2fPts_ig[0].trim();
        var _2fRgt_ig = _2fPts_ig[1] ? _2fPts_ig[1].trim() : 'S';
        var _2fRX0_ig = _igHolesTab[0].relX;
        var _2fRX1_ig = _igHolesTab.length > 1 ? _igHolesTab[1].relX : 187.58;
        _igActiveH = [
          { fase: _2fLft_ig, relX: _2fRX0_ig, busbarHoleX: _bxL_2f_ig, exists: true },
          { fase: _2fRgt_ig, relX: _2fRX1_ig, busbarHoleX: _bxR_2f_ig, exists: true }
        ];
      }
      if (d.invertirN && usarAis4f) {
        if (_igActiveH.length >= 4) {
          var _iF4ig = ['N','R','S','T'];
          for (var _qi4ig = 0; _qi4ig < 4 && _qi4ig < _igActiveH.length; _qi4ig++) _igActiveH[_qi4ig].fase = _iF4ig[_qi4ig];
        }
        var _invBxIg;
        if (d.aisladoTipo === '0.5s400_4F') {
          var _gIgI = (d.aisGap4f || 33.5) / PX_TO_MM; var _fIgI = (715 - 3 * _gIgI) / 2;
          _invBxIg = { N: _fIgI, R: _fIgI + _gIgI, S: _fIgI + 2 * _gIgI, T: _fIgI + 3 * _gIgI };
        } else {
          _invBxIg = { N: 106.3, R: 273.8, S: 441.3, T: 608.8 };
        }
        for (var _qiIg = 0; _qiIg < _igActiveH.length; _qiIg++) {
          if (_invBxIg[_igActiveH[_qiIg].fase] !== undefined) _igActiveH[_qiIg].busbarHoleX = _invBxIg[_igActiveH[_qiIg].fase];
        }
      }
      _igAlinearConBarras(_igActiveH, d);
      var _aliStr_ig = (igD.conector !== false && igD.alineacion) ? igD.alineacion : 'S';
      var _cmRW_ig = (igD.tipo === 'cm_fijo' && parseInt(igD.corriente, 10) >= 125 ? 20 : 15) / PX_TO_MM;
      var _cmR2W_ig = 20 / PX_TO_MM;
      if (_aliStr_ig === 'MEDIO' && _igActiveH.length >= 2) {
        var _igH0_m = _igActiveH[0], _igHL_m = _igActiveH[_igActiveH.length - 1];
        igX = (_igH0_m.busbarHoleX + _igHL_m.busbarHoleX) / 2
            - (_igH0_m.relX        + _igHL_m.relX)        / 2;
      } else if (_aliStr_ig === 'RSTN' && igD.polos >= 4) {
        var _igS_rstn = null, _igT_rstn = null;
        for (var _aii2 = 0; _aii2 < _igActiveH.length; _aii2++) {
          if (_igActiveH[_aii2].fase === 'S') _igS_rstn = _igActiveH[_aii2];
          if (_igActiveH[_aii2].fase === 'T') _igT_rstn = _igActiveH[_aii2];
        }
        if (_igS_rstn && _igT_rstn) {
          igX = (_igS_rstn.busbarHoleX + _igT_rstn.busbarHoleX) / 2
              - (_igS_rstn.relX        + _igT_rstn.relX)        / 2;
        } else {
          igX = (aisNatW - igW) / 2;
        }
      } else {
        var _aliIdx_ig = 0;
        for (var _aii = 0; _aii < _igActiveH.length; _aii++) {
          if (_igActiveH[_aii].fase === _aliStr_ig) { _aliIdx_ig = _aii; break; }
        }
        var _aliH_ig = _igActiveH[_aliIdx_ig];
        var _isFirst_ig = (_aliIdx_ig === 0);
        var _isLast_ig = (_aliIdx_ig === _igActiveH.length - 1);
        if (_isFirst_ig && !_isLast_ig) {
          igX = _aliH_ig.busbarHoleX + _cmR2W_ig / 2 - _aliH_ig.relX - _cmRW_ig / 2;
        } else if (_isLast_ig && !_isFirst_ig) {
          igX = _aliH_ig.busbarHoleX + _cmRW_ig / 2 - _aliH_ig.relX - _cmR2W_ig / 2;
        } else {
          igX = _aliH_ig.busbarHoleX - _aliH_ig.relX;
        }
      }
    }
    igY = aisY - igH - IG_GAP;
  }


  var igImg = _crearImg('assets/panel-busbar/' + svgFile, 0, 0, imgW, imgH);
  igImg.className = 'itm-img ig-img';
  igImg.style.zIndex = '5';
  igImg.dataset.igItem = '1';
  var cx = igX + igW / 2;
  var cy = igY + igH / 2;
  igImg.style.left = (cx - imgW / 2) + 'px';
  igImg.style.top = (cy - imgH / 2) + 'px';
  container.appendChild(igImg);


  if ((igD.tipo === 'cm_fijo' || igD.tipo === 'cm_reg') && igD.conector !== false) {
    var d_cm = d;
    var usarAis4f_cm = usarAis4f;
    var hayBusbarR = true;
    var hayBusbarS = d_cm.fases !== '1F+N';
    var hayBusbarT = (d_cm.fases === '3F' || d_cm.fases === '3F+N');
    var hayBusbarN = usarAis4f_cm;

    var cmHoleRelY, cmHoles;
    var _isMod2ins = igD.tipo === 'cm_fijo' && parseInt(igD.corriente, 10) >= 125;
    if (igD.tipo === 'cm_reg') {
      cmHoleRelY = 760.0;
      cmHoles = igD.polos === 4 ? [
        { relX: 86.4,  fase: 'R', busbarHoleX: usarAis4f_cm ? 106.3 : 75.0,  exists: hayBusbarR },
        { relX: 261.3, fase: 'S', busbarHoleX: usarAis4f_cm ? 273.8 : 325.0, exists: hayBusbarS },
        { relX: 436.4, fase: 'T', busbarHoleX: usarAis4f_cm ? 441.3 : 575.0, exists: hayBusbarT },
        { relX: 611.4, fase: 'N', busbarHoleX: 608.8,                         exists: hayBusbarN }
      ] : [
        { relX: 86.47, fase: 'R', busbarHoleX: usarAis4f_cm ? 106.3 : 75.0,  exists: hayBusbarR },
        { relX: 261.3, fase: 'S', busbarHoleX: usarAis4f_cm ? 273.8 : 325.0, exists: hayBusbarS },
        { relX: 436.3, fase: 'T', busbarHoleX: usarAis4f_cm ? 441.3 : 575.0, exists: hayBusbarT }
      ];
    } else if (_isMod2ins && igD.polos === 4) {
      cmHoleRelY = 772.5;
      cmHoles = [
        { relX: 87.63,  fase: 'R', busbarHoleX: usarAis4f_cm ? 106.3 : 75.0,  exists: hayBusbarR },
        { relX: 262.64, fase: 'S', busbarHoleX: usarAis4f_cm ? 273.8 : 325.0, exists: hayBusbarS },
        { relX: 437.62, fase: 'T', busbarHoleX: usarAis4f_cm ? 441.3 : 575.0, exists: hayBusbarT },
        { relX: 612.61, fase: 'N', busbarHoleX: 608.8,                         exists: hayBusbarN }
      ];
    } else if (_isMod2ins) {
      cmHoleRelY = 772.4;
      cmHoles = [
        { relX: 87.58,  fase: 'R', busbarHoleX: usarAis4f_cm ? 106.3 : 75.0,  exists: hayBusbarR },
        { relX: 262.50, fase: 'S', busbarHoleX: usarAis4f_cm ? 273.8 : 325.0, exists: hayBusbarS },
        { relX: 437.43, fase: 'T', busbarHoleX: usarAis4f_cm ? 441.3 : 575.0, exists: hayBusbarT },
        { relX: null,   fase: 'N', busbarHoleX: null,                          exists: false }
      ];
    } else if (igD.polos === 4) {
      cmHoleRelY = 614.2;
      cmHoles = [
        { relX: 62.56,  fase: 'R', busbarHoleX: usarAis4f_cm ? 106.3 : 75.0,  exists: hayBusbarR },
        { relX: 187.73, fase: 'S', busbarHoleX: usarAis4f_cm ? 273.8 : 325.0, exists: hayBusbarS },
        { relX: 312.77, fase: 'T', busbarHoleX: usarAis4f_cm ? 441.3 : 575.0, exists: hayBusbarT },
        { relX: 437.75, fase: 'N', busbarHoleX: 608.8,                         exists: hayBusbarN }
      ];
    } else {
      cmHoleRelY = 610.1;
      cmHoles = [
        { relX: 64.65,  fase: 'R', busbarHoleX: usarAis4f_cm ? 106.3 : 75.0,  exists: hayBusbarR },
        { relX: 187.58, fase: 'S', busbarHoleX: usarAis4f_cm ? 273.8 : 325.0, exists: hayBusbarS },
        { relX: 310.65, fase: 'T', busbarHoleX: usarAis4f_cm ? 441.3 : 575.0, exists: hayBusbarT },
        { relX: null,   fase: 'N', busbarHoleX: null,                          exists: false }
      ];
    }
    var _bH_cm = _getAisladorHoles(d_cm, usarAis4f_cm ? 715 : 650, usarAis4f_cm);
    if (_bH_cm) {
      for (var _ov = 0; _ov < cmHoles.length; _ov++) {
        var _idx_ov = cmHoles[_ov].fase;
        if (_bH_cm[_idx_ov]) cmHoles[_ov].busbarHoleX = _bH_cm[_idx_ov].x;
      }
    }


    if (d_cm.invertirN && usarAis4f_cm) {
      if (igD.polos >= 4) {
        var _invFcm = ['N','R','S','T'];
        for (var _qifcm = 0; _qifcm < 4 && _qifcm < cmHoles.length; _qifcm++) cmHoles[_qifcm].fase = _invFcm[_qifcm];
      }
      var _invBxCmIns;
      var _bH_invCm = _getAisladorHoles(d_cm, 715, true);
      if (_bH_invCm) {
        _invBxCmIns = { N: _bH_invCm.R.x, R: _bH_invCm.S.x, S: _bH_invCm.T.x, T: _bH_invCm.N.x };
      } else {
        _invBxCmIns = { N: 106.3, R: 273.8, S: 441.3, T: 608.8 };
      }
      for (var _qibxcm = 0; _qibxcm < cmHoles.length; _qibxcm++) {
        if (_invBxCmIns[cmHoles[_qibxcm].fase] !== undefined) cmHoles[_qibxcm].busbarHoleX = _invBxCmIns[cmHoles[_qibxcm].fase];
      }
    }


    if (d_cm.fases === '2F') {
      var _g2f_cm = (d_cm.aisGap2f || 100.0) / PX_TO_MM;
      var _bxL_2f_cm = (650 - _g2f_cm) / 2;
      var _bxR_2f_cm = (650 + _g2f_cm) / 2;
      var _2fPts_cm = (d_cm.subfases || 'R - S').split(' - ');
      var _2fLft_cm = _2fPts_cm[0].trim();
      var _2fRgt_cm = _2fPts_cm[1] ? _2fPts_cm[1].trim() : 'S';
      var _cmRX0 = cmHoles[0].relX;
      var _cmRX1 = cmHoles.length > 1 ? cmHoles[1].relX : 187.58;
      cmHoles = [
        { relX: _cmRX0, fase: _2fLft_cm, busbarHoleX: _bxL_2f_cm, exists: true },
        { relX: _cmRX1, fase: _2fRgt_cm, busbarHoleX: _bxR_2f_cm, exists: true }
      ];
    }


    var _is1fnX1_cm = d_cm.fases === '1F+N' && (!d_cm.subfases || d_cm.subfases.indexOf('-N') === -1);
    var _is1fnX2_cm = d_cm.fases === '1F+N' && d_cm.subfases && d_cm.subfases.indexOf('-N') !== -1;
    if (_is1fnX1_cm) {
      cmHoles[0].fase = (d_cm.subfases || 'R').trim();
      cmHoles[0].busbarHoleX = 650 / 2;
      for (var _ci1 = 1; _ci1 < cmHoles.length; _ci1++) cmHoles[_ci1].exists = false;
    } else if (_is1fnX2_cm) {
      var _sf1fn_cm = (d_cm.subfases || 'R').replace(/-N$/, '');
      var _bx1fnL = cmHoles[0].busbarHoleX;
      var _bx1fnR = 575.0;
      var _bH_1fn = _getAisladorHoles(
        (d_cm.aisladoTipo === '0.5s400_4F' || d_cm.aisladoTipo === '0.5s400_3F')
          ? { aisladoTipo: '0.5s400_3F', fases: '3F', aisGap3f: d_cm.aisGap3f } : null,
        650, false);
      if (_bH_1fn && _bH_1fn.T) _bx1fnR = _bH_1fn.T.x;
      if (igD.polos === 1) {
        cmHoles[0].fase = _sf1fn_cm;
        cmHoles[0].busbarHoleX = d_cm.invertirN ? _bx1fnR : _bx1fnL;
      } else if (d_cm.invertirN) {
        cmHoles[0].fase = 'N';
        cmHoles[0].busbarHoleX = _bx1fnL;
        cmHoles[1].exists = true;
        cmHoles[1].fase = _sf1fn_cm;
        cmHoles[1].busbarHoleX = _bx1fnR;
      } else {
        cmHoles[0].fase = _sf1fn_cm;
        cmHoles[0].busbarHoleX = _bx1fnL;
        cmHoles[1].exists = true;
        cmHoles[1].fase = 'N';
        cmHoles[1].busbarHoleX = _bx1fnR;
      }
    }

    _igAlinearConBarras(cmHoles, d_cm);
    var lastActiveHoleIdx = 0;
    for (var _lh = 0; _lh < cmHoles.length; _lh++) {
      if (cmHoles[_lh].exists && cmHoles[_lh].relX !== null) lastActiveHoleIdx = _lh;
    }

    var cmRectW   = (igD.tipo === 'cm_reg' || _isMod2ins ? 20 : 15) / PX_TO_MM;
    var cmRectH   = (10 + 13) / PX_TO_MM;
    var cmRectUp  = 10 / PX_TO_MM;
    var cmRect2W  = 20 / PX_TO_MM;
    var cmRect2H  = 20 / PX_TO_MM;
    var cmInsTop  = igY + cmHoleRelY - cmRectUp;
    var cmIns2Top = cmInsTop + cmRectH;
    var _busExtMmCm = d_cm.conexionIG ? (d_cm.conexionIGAltura || 20) : 0;




    var _solapeFinCm = aisY - ((_busbarExtMm(d_cm) - IG_SOLAPE_MM) / PX_TO_MM);
    var busbarTopY_cm = (_busExtMmCm > 0)
      ? (_solapeFinCm - (_busExtMmCm / PX_TO_MM))
      : aisY;
    var _aisHoleRelY_cm = usarAis4f_cm ? 72.6 : 69.9;











    var cmF4HoleCy = (_busExtMmCm > 0)
      ? ((_busExtMmCm - 10) / PX_TO_MM)
      : _aisHoleRelY_cm;
    var lineStartY_cm = cmIns2Top + cmRect2H;
    var ns_cm = 'http://www.w3.org/2000/svg';

    for (var hi = 0; hi < cmHoles.length; hi++) {
      var hole = cmHoles[hi];
      if (!hole.exists || hole.relX === null) continue;

      var holeAbsX = igX + hole.relX;
      var cmColor = BUSBAR_COLORS[hole.fase] || 'none';
      var cmTextColor = (hole.fase === 'N') ? '#333333' : '#ffffff';


      var ins = document.createElement('div');
      ins.className = 'ig-insert';
      ins.dataset.igItem = '1';
      ins.style.cssText = 'position:absolute;box-sizing:border-box;border:2px solid #000;pointer-events:none;z-index:3;display:flex;align-items:center;justify-content:center;font:bold 12px Arial;';
      ins.style.width = cmRectW + 'px';
      ins.style.height = cmRectH + 'px';
      ins.style.left = (holeAbsX - cmRectW / 2) + 'px';
      ins.style.top = cmInsTop + 'px';



      ins.dataset.borneY = (igY + cmHoleRelY) + '';
      ins.style.background = cmColor;
      ins.style.color = cmTextColor;
      var insNum = document.createElement('span');
      insNum.className = 'ig-insert-num';
      insNum.textContent = (hi + 1).toString();
      ins.appendChild(insNum);
      container.appendChild(ins);


      var ins2Left;
      if (hi === 0 && lastActiveHoleIdx === 0) {
        ins2Left = holeAbsX - cmRect2W / 2;
      } else if (hi === 0) {
        ins2Left = holeAbsX - cmRectW / 2 + cmRectW - cmRect2W;
      } else if (hi === lastActiveHoleIdx) {
        ins2Left = holeAbsX - cmRectW / 2;
      } else {
        ins2Left = holeAbsX - cmRect2W / 2;
      }
      var ins2 = document.createElement('div');
      ins2.className = 'ig-insert';
      ins2.dataset.igItem = '1';
      ins2.style.cssText = 'position:absolute;box-sizing:border-box;border:2px solid #000;pointer-events:none;z-index:3;display:flex;align-items:center;justify-content:center;font:bold 12px Arial;';
      ins2.style.width = cmRect2W + 'px';
      ins2.style.height = cmRect2H + 'px';
      ins2.style.left = ins2Left + 'px';
      ins2.style.top = cmIns2Top + 'px';
      ins2.style.background = cmColor;
      ins2.style.color = cmTextColor;
      var ins2Num = document.createElement('span');
      ins2Num.className = 'ig-insert-num';
      ins2Num.textContent = (hi + 5).toString();
      ins2.appendChild(ins2Num);
      container.appendChild(ins2);


      var busbarBxL = hole.busbarHoleX - 100 / 2;
      var ins2RightX = ins2Left + cmRect2W;
      var cm4Left = busbarBxL;
      var cm4Right = cm4Left + (20 / PX_TO_MM);

      var cmTrapLeft = Math.min(ins2Left, cm4Left);
      var cmTrapRight = Math.max(ins2RightX, cm4Right);
      var cmTrapW = cmTrapRight - cmTrapLeft;
      var cmTrapH = busbarTopY_cm - lineStartY_cm;

      var cmTrapSvg = document.createElementNS(ns_cm, 'svg');
      cmTrapSvg.setAttribute('class', 'ig-insert');
      cmTrapSvg.dataset.igItem = '1';
      cmTrapSvg.setAttribute('width', cmTrapW);
      cmTrapSvg.setAttribute('height', Math.max(1, cmTrapH));
      cmTrapSvg.setAttribute('overflow', 'visible');
      cmTrapSvg.style.cssText = 'position:absolute;pointer-events:none;z-index:3;';
      cmTrapSvg.style.left = cmTrapLeft + 'px';
      cmTrapSvg.style.top = lineStartY_cm + 'px';

      var cTL_x = ins2Left - cmTrapLeft,  cTL_y = 0;
      var cTR_x = ins2RightX - cmTrapLeft, cTR_y = 0;
      var cBR_x = cm4Right - cmTrapLeft,   cBR_y = cmTrapH;
      var cBL_x = cm4Left - cmTrapLeft,    cBL_y = cmTrapH;

      var cmPoly = document.createElementNS(ns_cm, 'polygon');
      cmPoly.setAttribute('points',
        cTL_x + ',' + cTL_y + ' ' + cTR_x + ',' + cTR_y + ' ' +
        cBR_x + ',' + cBR_y + ' ' + cBL_x + ',' + cBL_y);
      cmPoly.setAttribute('fill', cmColor);
      cmPoly.setAttribute('stroke', 'none');
      cmTrapSvg.appendChild(cmPoly);

      var mkCmL = function(x1, y1, x2, y2) {
        var l = document.createElementNS(ns_cm, 'line');
        l.setAttribute('x1', x1); l.setAttribute('y1', y1);
        l.setAttribute('x2', x2); l.setAttribute('y2', y2);
        l.setAttribute('stroke', '#000000'); l.setAttribute('stroke-width', '2');
        return l;
      };
      cmTrapSvg.appendChild(mkCmL(cTL_x, cTL_y, cBL_x, cBL_y));
      cmTrapSvg.appendChild(mkCmL(cTR_x, cTR_y, cBR_x, cBR_y));

      var cmTxt = document.createElementNS(ns_cm, 'text');
      cmTxt.setAttribute('x', ((cTL_x + cTR_x + cBL_x + cBR_x) / 4) + '');
      cmTxt.setAttribute('y', (cmTrapH / 2 + 4) + '');
      cmTxt.setAttribute('text-anchor', 'middle');
      cmTxt.setAttribute('fill', cmTextColor);
      cmTxt.setAttribute('font-size', '12');
      cmTxt.setAttribute('font-family', 'Arial, sans-serif');
      cmTxt.setAttribute('font-weight', 'bold');
      cmTxt.setAttribute('class', 'ig-insert-num');
      cmTxt.textContent = (hi + 9).toString();
      cmTrapSvg.appendChild(cmTxt);
      container.appendChild(cmTrapSvg);


      var cmF4W = 20 / PX_TO_MM;
      var cmF4H = (_busExtMmCm / PX_TO_MM);
      var cmF4Svg = document.createElementNS(ns_cm, 'svg');
      cmF4Svg.setAttribute('class', 'ig-insert');
      cmF4Svg.dataset.igItem = '1';
      cmF4Svg.dataset.igF4 = '1';                                    
      cmF4Svg.style.cssText = 'position:absolute;pointer-events:none;z-index:3;';
      cmF4Svg.style.left = cm4Left + 'px';
      cmF4Svg.style.top = busbarTopY_cm + 'px';
      cmF4Svg.setAttribute('width', cmF4W);
      cmF4Svg.setAttribute('height', cmF4H);
      cmF4Svg.setAttribute('overflow', 'visible');

      var cmF4MaskId = 'cmf4m_' + hi + '_' + hole.fase;
      var cmF4Defs = document.createElementNS(ns_cm, 'defs');
      var cmF4Mask = document.createElementNS(ns_cm, 'mask');
      cmF4Mask.setAttribute('id', cmF4MaskId);
      var cmF4mW = document.createElementNS(ns_cm, 'rect');
      cmF4mW.setAttribute('x', '0'); cmF4mW.setAttribute('y', '0');
      cmF4mW.setAttribute('width', cmF4W); cmF4mW.setAttribute('height', cmF4H);
      cmF4mW.setAttribute('fill', 'white');
      cmF4Mask.appendChild(cmF4mW);
      var cmF4mH = document.createElementNS(ns_cm, 'circle');
      cmF4mH.setAttribute('cx', cmF4W / 2);
      cmF4mH.setAttribute('cy', cmF4HoleCy);
      cmF4mH.setAttribute('r', (6 / PX_TO_MM) / 2);
      cmF4mH.setAttribute('fill', 'black');
      cmF4Mask.appendChild(cmF4mH);
      cmF4Defs.appendChild(cmF4Mask);
      cmF4Svg.appendChild(cmF4Defs);

      var cmF4Rect = document.createElementNS(ns_cm, 'rect');
      cmF4Rect.setAttribute('x', '0'); cmF4Rect.setAttribute('y', '0');
      cmF4Rect.setAttribute('width', cmF4W); cmF4Rect.setAttribute('height', cmF4H);
      cmF4Rect.setAttribute('fill', cmColor);
      cmF4Rect.setAttribute('mask', 'url(#' + cmF4MaskId + ')');
      cmF4Svg.appendChild(cmF4Rect);

      var cmF4Bdr = document.createElementNS(ns_cm, 'rect');
      cmF4Bdr.setAttribute('x', '1'); cmF4Bdr.setAttribute('y', '1');
      cmF4Bdr.setAttribute('width', cmF4W - 2); cmF4Bdr.setAttribute('height', Math.max(0, cmF4H - 2));
      cmF4Bdr.setAttribute('fill', 'none');
      cmF4Bdr.setAttribute('stroke', '#000000');
      cmF4Bdr.setAttribute('stroke-width', '2');
      cmF4Svg.appendChild(cmF4Bdr);

      var cmF4Ring = document.createElementNS(ns_cm, 'circle');
      cmF4Ring.setAttribute('cx', cmF4W / 2);
      cmF4Ring.setAttribute('cy', cmF4HoleCy);
      cmF4Ring.setAttribute('r', (6 / PX_TO_MM) / 2);
      cmF4Ring.setAttribute('fill', 'none');
      cmF4Ring.setAttribute('stroke', '#000000');
      cmF4Ring.setAttribute('stroke-width', '2');
      cmF4Svg.appendChild(cmF4Ring);

      var cmF4Txt = document.createElementNS(ns_cm, 'text');
      cmF4Txt.setAttribute('x', cmF4W / 2);
      cmF4Txt.setAttribute('y', '14');
      cmF4Txt.setAttribute('text-anchor', 'middle');
      cmF4Txt.setAttribute('fill', cmTextColor);
      cmF4Txt.setAttribute('font-size', '12');
      cmF4Txt.setAttribute('font-family', 'Arial, sans-serif');
      cmF4Txt.setAttribute('font-weight', 'bold');
      cmF4Txt.setAttribute('class', 'ig-insert-num');
      cmF4Txt.textContent = (hi + 13).toString();
      cmF4Svg.appendChild(cmF4Txt);

      container.appendChild(cmF4Svg);
    }
  }


  if (igD.tipo === 'riel' && igD.conector !== false) {
    var d_r = d;
    var hayR_r = true;
    var hayS_r = d_r.fases !== '1F+N';
    var hayT_r = (d_r.fases === '3F' || d_r.fases === '3F+N');
    var hayN_r = igD.polos >= 4 && usarAis4f;


    var rMeta = {
      1: { vbX: 743, vbY: 179, vbW: 176, vbH: 810, cyBot: 913.0, cyTop: 254.0, cx: [831] },
      2: { vbX: 653, vbY: 157, vbW: 368, vbH: 872, cyBot: 948.0, cyTop: 237.6, cx: [747.6, 927.6] },
      3: { vbX: 566, vbY: 143, vbW: 568, vbH: 902, cyBot: 960.9, cyTop: 225.6, cx: [663.9, 850.4, 1036.6] },
      4: { vbX: 517, vbY: 186, vbW: 668, vbH: 800, cyBot: 910.5, cyTop: 259.9, cx: [604.1, 769.0, 933.9, 1099.0] }
    };
    var rm = rMeta[igD.polos] || rMeta[3];

    var rScaleX = igW / rm.vbW;
    var rScaleY = igH / rm.vbH;
    var rHoleBotY = (rm.cyBot - rm.vbY) * rScaleY;


    var bxMap = {
      R: usarAis4f ? 106.3 : 75.0,
      S: usarAis4f ? 273.8 : 325.0,
      T: usarAis4f ? 441.3 : 575.0,
      N: usarAis4f ? 608.8 : 575.0
    };
    var _bH_bx = _getAisladorHoles(d_r, usarAis4f ? 715 : 650, usarAis4f);
    if (_bH_bx) {
      if (_bH_bx.R) bxMap['R'] = _bH_bx.R.x;
      if (_bH_bx.S) bxMap['S'] = _bH_bx.S.x;
      if (_bH_bx.T) bxMap['T'] = _bH_bx.T.x;
      if (_bH_bx.N) bxMap['N'] = _bH_bx.N.x;
    }
    if (d_r.invertirN && usarAis4f) {
      var _bxR_i = bxMap['R'], _bxS_i = bxMap['S'], _bxT_i = bxMap['T'], _bxN_i = bxMap['N'];
      bxMap['N'] = _bxR_i; bxMap['R'] = _bxS_i; bxMap['S'] = _bxT_i; bxMap['T'] = _bxN_i;
    }


    var rHoleDefs;
    if (d_r.fases === '2F') {
      var fases2F = [];
      if (d_r.ciclo) {
        for (var ci2 = 0; ci2 < d_r.ciclo.length; ci2++) {
          var f2 = d_r.ciclo[ci2];
          if (fases2F.indexOf(f2) === -1) fases2F.push(f2);
          if (fases2F.length === 2) break;
        }
      }
      if (fases2F.length < 2) fases2F = ['R', 'S'];
      rHoleDefs = [
        { cx: rm.cx[0], busbarHoleX: bxMap['R'], exists: true,  fase: fases2F[0] || 'R' },
        { cx: rm.cx[1], busbarHoleX: bxMap['T'], exists: true,  fase: fases2F[1] || 'S' },
        { cx: rm.cx[2], busbarHoleX: bxMap['T'], exists: false, fase: 'T' },
        { cx: rm.cx[3], busbarHoleX: bxMap['N'], exists: false, fase: 'N' }
      ];
    } else if (d_r.fases === '1F+N') {
      var sf1FN = (d_r.subfases || 'R').replace(/-N$/, '');
      var _is1fnX1_ins = !d_r.subfases || d_r.subfases.indexOf('-N') === -1;
      if (_is1fnX1_ins) {
        rHoleDefs = [
          { cx: rm.cx[0], busbarHoleX: aisNatW / 2, exists: true,  fase: sf1FN },
          { cx: rm.cx[1], busbarHoleX: aisNatW / 2, exists: false, fase: 'S' },
          { cx: rm.cx[2], busbarHoleX: aisNatW / 2, exists: false, fase: 'T' },
          { cx: rm.cx[3], busbarHoleX: aisNatW / 2, exists: false, fase: 'N' }
        ];
      } else if (d_r.invertirN) {
        rHoleDefs = [
          { cx: rm.cx[0], busbarHoleX: bxMap['R'], exists: true,  fase: 'N' },
          { cx: rm.cx[1], busbarHoleX: bxMap['T'], exists: true,  fase: sf1FN },
          { cx: rm.cx[2], busbarHoleX: bxMap['T'], exists: false, fase: 'T' },
          { cx: rm.cx[3], busbarHoleX: bxMap['N'], exists: false, fase: 'N' }
        ];
      } else {
        rHoleDefs = [
          { cx: rm.cx[0], busbarHoleX: bxMap['R'], exists: true,  fase: sf1FN },
          { cx: rm.cx[1], busbarHoleX: bxMap['T'], exists: true,  fase: 'N' },
          { cx: rm.cx[2], busbarHoleX: bxMap['T'], exists: false, fase: 'T' },
          { cx: rm.cx[3], busbarHoleX: bxMap['N'], exists: false, fase: 'N' }
        ];
      }

      if (igD.polos === 1 && !_is1fnX1_ins) {
        rHoleDefs[0].fase = sf1FN;
        rHoleDefs[0].busbarHoleX = d_r.invertirN ? bxMap['T'] : bxMap['R'];
      }
    } else {
      if (d_r.invertirN && usarAis4f && igD.polos >= 4) {
        rHoleDefs = [
          { cx: rm.cx[0], busbarHoleX: bxMap['N'], exists: hayN_r, fase: 'N' },
          { cx: rm.cx[1], busbarHoleX: bxMap['R'], exists: hayR_r, fase: 'R' },
          { cx: rm.cx[2], busbarHoleX: bxMap['S'], exists: hayS_r, fase: 'S' },
          { cx: rm.cx[3], busbarHoleX: bxMap['T'], exists: hayT_r, fase: 'T' }
        ];
      } else {
        rHoleDefs = [
          { cx: rm.cx[0], busbarHoleX: bxMap['R'], exists: hayR_r, fase: 'R' },
          { cx: rm.cx[1], busbarHoleX: bxMap['S'], exists: hayS_r, fase: 'S' },
          { cx: rm.cx[2], busbarHoleX: bxMap['T'], exists: hayT_r, fase: 'T' },
          { cx: rm.cx[3], busbarHoleX: bxMap['N'], exists: hayN_r, fase: 'N' }
        ];
      }
    }
    _igAlinearConBarras(rHoleDefs, d_r);
    var rHoles = [];
    for (var ri0 = 0; ri0 < rHoleDefs.length; ri0++) {
      var rhd = rHoleDefs[ri0];
      var cx_i = rm.cx[ri0];
      rHoles.push({
        relX: cx_i !== undefined ? (cx_i - rm.vbX) * rScaleX : 0,
        busbarHoleX: rhd.busbarHoleX,
        exists: rhd.exists && cx_i !== undefined,
        fase: rhd.fase
      });
    }


    var rActiveCount = 0;
    for (var ra = 0; ra < rHoles.length; ra++) {
      if (rHoles[ra].exists) {
        rActiveCount++;
        if (rActiveCount > igD.polos) rHoles[ra].exists = false;
      }
    }

    var rFirstIdx = -1, rLastIdx = -1;
    for (var rf = 0; rf < rHoles.length; rf++) {
      if (rHoles[rf].exists) {
        if (rFirstIdx === -1) rFirstIdx = rf;
        rLastIdx = rf;
      }
    }


    var rW1 = 10 / PX_TO_MM;                  
    var rH1 = 15 / PX_TO_MM;            
    var rUp1 = 5 / PX_TO_MM;                                              
    var rW2 = 15 / PX_TO_MM;                  
    var rH2 = 15 / PX_TO_MM;
    var rW4 = 15 / PX_TO_MM;                  
    var rH4 = 20 / PX_TO_MM;             
    var rBusW = 100;
    var _busExtMmIg = d_r.conexionIG ? (d_r.conexionIGAltura || 20) : 0;
    var _solapeFinR = aisY - ((_busbarExtMm(d_r) - IG_SOLAPE_MM) / PX_TO_MM);
    var rBusTopY = (_busExtMmIg > 0)
      ? (_solapeFinR - (_busExtMmIg / PX_TO_MM))
      : aisY;
    var _aisHoleRelY_r = usarAis4f ? 72.6 : 69.9;






    var ri4HoleCy = (_busExtMmIg > 0)
      ? ((_busExtMmIg - 10) / PX_TO_MM)
      : _aisHoleRelY_r;
    var rH4_eff = (_busExtMmIg / PX_TO_MM);
    var ns_r = 'http://www.w3.org/2000/svg';

    for (var ri = 0; ri < rHoles.length; ri++) {
      var rh = rHoles[ri];
      if (!rh.exists) continue;

      var isRFirst = (ri === rFirstIdx);
      var isRLast = (ri === rLastIdx);

      var rBotAbsX = igX + rh.relX;
      var rBotAbsY = igY + rHoleBotY;

      var rColor = BUSBAR_COLORS[rh.fase] || 'none';
      var rTextColor = (rh.fase === 'N') ? '#333333' : '#ffffff';


      var ri1 = document.createElement('div');
      ri1.className = 'ig-insert';
      ri1.dataset.igItem = '1';
      ri1.style.cssText = 'position:absolute;box-sizing:border-box;border:2px solid #000;pointer-events:none;z-index:3;display:flex;align-items:center;justify-content:center;font:bold 12px Arial;';
      ri1.style.width = rW1 + 'px';
      ri1.style.height = rH1 + 'px';
      ri1.style.left = (rBotAbsX - rW1 / 2) + 'px';
      ri1.style.top = (rBotAbsY - rUp1) + 'px';

      ri1.dataset.borneY = rBotAbsY + '';
      ri1.style.background = rColor;
      ri1.style.color = rTextColor;
      var ri1Num = document.createElement('span');
      ri1Num.className = 'ig-insert-num';
      ri1Num.textContent = (ri + 1).toString();
      ri1.appendChild(ri1Num);
      container.appendChild(ri1);


      var ri2Left = (isRFirst && isRLast) ? (rBotAbsX - rW2 / 2)
                  : isRFirst ? (rBotAbsX + rW1 / 2 - rW2)
                  : isRLast  ? (rBotAbsX - rW1 / 2)
                  :            (rBotAbsX - rW2 / 2);
      var ri2Top = rBotAbsY - rUp1 + rH1;

      var ri2 = document.createElement('div');
      ri2.className = 'ig-insert';
      ri2.dataset.igItem = '1';
      ri2.style.cssText = 'position:absolute;box-sizing:border-box;border:2px solid #000;pointer-events:none;z-index:3;display:flex;align-items:center;justify-content:center;font:bold 12px Arial;';
      ri2.style.width = rW2 + 'px';
      ri2.style.height = rH2 + 'px';
      ri2.style.left = ri2Left + 'px';
      ri2.style.top = ri2Top + 'px';
      ri2.style.background = rColor;
      ri2.style.color = rTextColor;
      var ri2Num = document.createElement('span');
      ri2Num.className = 'ig-insert-num';
      ri2Num.textContent = (ri + 5).toString();
      ri2.appendChild(ri2Num);
      container.appendChild(ri2);


      if (rh.busbarHoleX !== null) {
        var rBxL = rh.busbarHoleX - rBusW / 2;
        var rF2Right = ri2Left + rW2;
        var rTopY = ri2Top + rH2;

        var ri4Left = rBxL + (rBusW - rW4) / 2;
        var ri4Right = ri4Left + rW4;

        var trapSvgLeft = Math.min(ri2Left, ri4Left);
        var trapSvgRight = Math.max(rF2Right, ri4Right);
        var trapSvgW = trapSvgRight - trapSvgLeft;
        var trapSvgH = rBusTopY - rTopY;

        var rTrapSvg = document.createElementNS(ns_r, 'svg');
        rTrapSvg.setAttribute('width', trapSvgW);
        rTrapSvg.setAttribute('height', Math.max(1, trapSvgH));
        rTrapSvg.setAttribute('overflow', 'visible');
        rTrapSvg.style.cssText = 'position:absolute;pointer-events:none;z-index:3;';
        rTrapSvg.style.left = trapSvgLeft + 'px';
        rTrapSvg.style.top = rTopY + 'px';
        rTrapSvg.setAttribute('class', 'ig-insert');
        rTrapSvg.dataset.igItem = '1';

        var vTL_x = ri2Left - trapSvgLeft,  vTL_y = 0;
        var vTR_x = rF2Right - trapSvgLeft, vTR_y = 0;
        var vBR_x = ri4Right - trapSvgLeft, vBR_y = trapSvgH;
        var vBL_x = ri4Left - trapSvgLeft,  vBL_y = trapSvgH;

        var rPoly = document.createElementNS(ns_r, 'polygon');
        rPoly.setAttribute('points',
          vTL_x + ',' + vTL_y + ' ' + vTR_x + ',' + vTR_y + ' ' +
          vBR_x + ',' + vBR_y + ' ' + vBL_x + ',' + vBL_y);
        rPoly.setAttribute('fill', rColor);
        rPoly.setAttribute('stroke', 'none');
        rTrapSvg.appendChild(rPoly);

        var mkTL = function(x1, y1, x2, y2) {
          var l = document.createElementNS(ns_r, 'line');
          l.setAttribute('x1', x1); l.setAttribute('y1', y1);
          l.setAttribute('x2', x2); l.setAttribute('y2', y2);
          l.setAttribute('stroke', '#000000'); l.setAttribute('stroke-width', '2');
          return l;
        };
        rTrapSvg.appendChild(mkTL(vTL_x, vTL_y, vBL_x, vBL_y));
        rTrapSvg.appendChild(mkTL(vTR_x, vTR_y, vBR_x, vBR_y));

        var rTxt = document.createElementNS(ns_r, 'text');
        rTxt.setAttribute('x', ((vTL_x + vTR_x + vBL_x + vBR_x) / 4) + '');
        rTxt.setAttribute('y', (trapSvgH / 2 + 4) + '');
        rTxt.setAttribute('text-anchor', 'middle');
        rTxt.setAttribute('fill', rTextColor);
        rTxt.setAttribute('font-size', '12');
        rTxt.setAttribute('font-family', 'Arial, sans-serif');
        rTxt.setAttribute('font-weight', 'bold');
        rTxt.setAttribute('class', 'ig-insert-num');
        rTxt.textContent = (ri + 9).toString();
        rTrapSvg.appendChild(rTxt);
        container.appendChild(rTrapSvg);


        var ri4Svg = document.createElementNS(ns_r, 'svg');
        ri4Svg.setAttribute('class', 'ig-insert');
        ri4Svg.dataset.igItem = '1';
        ri4Svg.dataset.igF4 = '1';                                   
        ri4Svg.style.cssText = 'position:absolute;pointer-events:none;z-index:3;';
        ri4Svg.style.left = ri4Left + 'px';
        ri4Svg.style.top = rBusTopY + 'px';
        ri4Svg.setAttribute('width', rW4);
        ri4Svg.setAttribute('height', rH4_eff);
        ri4Svg.setAttribute('overflow', 'visible');

        var ri4MaskId = 'ri4m_' + ri + '_' + rh.fase;
        var ri4Defs = document.createElementNS(ns_r, 'defs');
        var ri4Mask = document.createElementNS(ns_r, 'mask');
        ri4Mask.setAttribute('id', ri4MaskId);
        var ri4mW = document.createElementNS(ns_r, 'rect');
        ri4mW.setAttribute('x', '0'); ri4mW.setAttribute('y', '0');
        ri4mW.setAttribute('width', rW4); ri4mW.setAttribute('height', rH4_eff);
        ri4mW.setAttribute('fill', 'white');
        ri4Mask.appendChild(ri4mW);
        var ri4mH = document.createElementNS(ns_r, 'circle');
        ri4mH.setAttribute('cx', rW4 / 2);
        ri4mH.setAttribute('cy', ri4HoleCy);
        ri4mH.setAttribute('r', (6 / PX_TO_MM) / 2);
        ri4mH.setAttribute('fill', 'black');
        ri4Mask.appendChild(ri4mH);
        ri4Defs.appendChild(ri4Mask);
        ri4Svg.appendChild(ri4Defs);

        var ri4Rect = document.createElementNS(ns_r, 'rect');
        ri4Rect.setAttribute('x', '0'); ri4Rect.setAttribute('y', '0');
        ri4Rect.setAttribute('width', rW4); ri4Rect.setAttribute('height', rH4_eff);
        ri4Rect.setAttribute('fill', rColor);
        ri4Rect.setAttribute('mask', 'url(#' + ri4MaskId + ')');
        ri4Svg.appendChild(ri4Rect);

        var ri4Bdr = document.createElementNS(ns_r, 'rect');
        ri4Bdr.setAttribute('x', '1'); ri4Bdr.setAttribute('y', '1');
        ri4Bdr.setAttribute('width', rW4 - 2); ri4Bdr.setAttribute('height', Math.max(0, rH4_eff - 2));
        ri4Bdr.setAttribute('fill', 'none');
        ri4Bdr.setAttribute('stroke', '#000000');
        ri4Bdr.setAttribute('stroke-width', '2');
        ri4Svg.appendChild(ri4Bdr);

        var ri4Ring = document.createElementNS(ns_r, 'circle');
        ri4Ring.setAttribute('cx', rW4 / 2);
        ri4Ring.setAttribute('cy', ri4HoleCy);
        ri4Ring.setAttribute('r', (6 / PX_TO_MM) / 2);
        ri4Ring.setAttribute('fill', 'none');
        ri4Ring.setAttribute('stroke', '#000000');
        ri4Ring.setAttribute('stroke-width', '2');
        ri4Svg.appendChild(ri4Ring);

        var ri4Txt = document.createElementNS(ns_r, 'text');
        ri4Txt.setAttribute('x', rW4 / 2);
        ri4Txt.setAttribute('y', '14');
        ri4Txt.setAttribute('text-anchor', 'middle');
        ri4Txt.setAttribute('fill', rTextColor);
        ri4Txt.setAttribute('font-size', '12');
        ri4Txt.setAttribute('font-family', 'Arial, sans-serif');
        ri4Txt.setAttribute('font-weight', 'bold');
        ri4Txt.setAttribute('class', 'ig-insert-num');
        ri4Txt.textContent = (ri + 13).toString();
        ri4Svg.appendChild(ri4Txt);

        container.appendChild(ri4Svg);
      }
    }
  }





  var TRI_W = 45, TRI_H = 90;
  var triCx = igX + igW / 2, triCy = igY + igH + 4 + TRI_W / 2;
  var triIG = document.createElement('img');
  triIG.src = 'assets/panel-busbar/boton_trian_verde.svg';
  triIG.className = 'ig-tri';
  triIG.dataset.igItem = '1';
  triIG.title = 'Editar el interruptor general';
  triIG.style.cssText = 'position:absolute;left:' + (triCx - TRI_W / 2) + 'px;top:' + (triCy - TRI_H / 2) + 'px;' +
    'width:' + TRI_W + 'px;height:' + TRI_H + 'px;transform:rotate(-90deg);z-index:7;cursor:pointer;';
  triIG.addEventListener('click', function(e) {
    e.stopPropagation();
    onIGTriangleClick(this);
  });
  container.appendChild(triIG);



  var rotulo = document.createElement('div');
  rotulo.className = 'itm-rotulo ig-rotulo';
  rotulo.dataset.igItem = '1';
  rotulo.style.left = triCx + 'px';
  rotulo.style.top = (triCy - TRI_W / 2 - 4) + 'px';
  rotulo.style.transform = 'translateX(-50%) translateY(-100%)';

  var badge = document.createElement('div');
  badge.className = 'itm-rotulo-badge';
  badge.textContent = 'IG';
  rotulo.appendChild(badge);
  container.appendChild(rotulo);
}






function _dibujarBorneras(container) {
  container.querySelectorAll('.bornera-img').forEach(function(el) { el.remove(); });


  window._PRESENCIA_POS = null;
  var _secsP = (typeof _presenciaSecciones === 'function') ? _presenciaSecciones() : [];
  if (!window._igData || !_secsP.length) return;
  var ig = container.querySelector('.ig-img');
  if (!ig) return;

  var igX = parseFloat(ig.style.left) || 0;
  var igY = parseFloat(ig.style.top) || 0;
  var igW = parseFloat(ig.style.width) || 0;
  var igH = parseFloat(ig.style.height) || 0;
  var gap = (typeof window._BORNERAS_GAP_MM === 'number' ? window._BORNERAS_GAP_MM : 30) / PX_TO_MM;
  var cyIG = igY + igH / 2;

  function _agregar(src, x, w, h, extraCls) {
    var img = document.createElement('img');
    img.src = src;
    img.className = 'bornera-img' + (extraCls ? ' ' + extraCls : '');
    img.style.cssText = 'position:absolute;left:' + x + 'px;top:' + (cyIG - h / 2) +
      'px;width:' + w + 'px;height:' + h + 'px;z-index:6;pointer-events:none;';
    container.appendChild(img);
  }








  var _tabB = (typeof _BORN_TIPOS !== 'undefined') ? _BORN_TIPOS : null;
  var _defB = { src: 'assets/Aparamenta/Bornera_2.5mm2-vf.svg', w: 25, h: 212.5 };









  var _extIzqCan = 0;
  if (typeof _bornerasCanaleta === 'function' && window._PRESENCIA_CANALETA) {
    var _cPre = _bornerasCanaleta({ canaleta: window._PRESENCIA_CANALETA },
                                  { w: 1, h: 1 });
    if (_cPre) _extIzqCan = _cPre.flanco.izq;
  }
  var x0 = igX + igW + gap + _extIzqCan;
  var x = x0;


  var altoFila = 0;
  _secsP.forEach(function(sc) {
    var _tS = (_tabB && (_tabB[sc.tipo] || _tabB['2.5'])) || _defB;
    var _eS = _bornExtremos({ extIzq: sc.extIzq, extDer: sc.extDer });
    var _pI = _bornPiezaExtremo(_eS.izq), _pD = _bornPiezaExtremo(_eS.der);
    if (_pI) { _agregar(_pI.src, x, _pI.w, _pI.h, 'bornera-tope'); x += _pI.w;
               altoFila = Math.max(altoFila, _pI.h); }
    for (var i = 0; i < (sc.cant || 0); i++) { _agregar(_tS.src, x, _tS.w, _tS.h); x += _tS.w; }
    altoFila = Math.max(altoFila, _tS.h);
    if (_pD) { _agregar(_pD.src, x, _pD.w, _pD.h, 'bornera-tope'); x += _pD.w;
               altoFila = Math.max(altoFila, _pD.h); }
  });




  var anchoFila = x - x0;






  window._PRESENCIA_POS = { cx: x0 + anchoFila / 2, cy: cyIG,
                            w: anchoFila, h: altoFila };

  if (typeof _bornerasCanaletaPresencia === 'function' && window._PRESENCIA_CANALETA) {
    var _canP = _bornerasCanaletaPresencia();
    if (_canP) {
      var _ox = x0, _oy = cyIG - altoFila / 2;
      _canP.rects.forEach(function(r) {
        _canPintar(container, { lado: r.lado, x: _ox + r.x, y: _oy + r.y, w: r.w, h: r.h },
                   _canP.fill, 'presencia', 'bornera-img', 5);
      });

      if (typeof _bornerasTrianguloCanaleta === 'function') {
        _bornerasTrianguloCanaleta(container, _canP, 'presencia', _ox, _oy,
                                   'bornera-img');
      }
    }
  }




  var aura = document.createElement('div');
  aura.className = 'bornera-img equipo-aura';
  aura.style.cssText = 'position:absolute;left:' + (x0 - 14) + 'px;top:' +
    (cyIG - altoFila / 2 - 14) + 'px;width:' + (anchoFila + 28) + 'px;' +
    'height:' + (altoFila + 28) + 'px;z-index:5;';
  container.appendChild(aura);






  var rotB = document.createElement('div');
  rotB.className = 'itm-rotulo bornera-rotulo bornera-presencia-rotulo';
  rotB.style.position = 'absolute';
  rotB.style.zIndex = '10';
  rotB.style.left = (x0 + anchoFila / 2) + 'px';
  rotB.style.top = (cyIG + altoFila / 2 + 65) + 'px';
  rotB.style.transform = 'translateX(-50%)';
  rotB.dataset.rotDir = 'abajo';
  rotB.dataset.rotFila = String(Math.round(cyIG));
  rotB.dataset.grpW = String(anchoFila);
  var badgeB = document.createElement('div');
  badgeB.className = 'itm-rotulo-badge';
  badgeB.title = 'Borneras de presencia de tensión';
  badgeB.textContent = '(B) PT';
  rotB.appendChild(badgeB);
  container.appendChild(rotB);

  var triH = Math.max(90, anchoFila);
  var tri = document.createElement('img');
  tri.src = 'assets/panel-busbar/boton_trian_verde.svg';
  tri.className = 'bornera-img bornera-presencia-tri';
  tri.style.cssText = 'position:absolute;left:' + (x0 + anchoFila / 2 - 22.5) + 'px;top:' +
    (cyIG + altoFila / 2 + 10 - (triH / 2 - 22.5)) + 'px;' +
    'width:45px;height:' + triH + 'px;' +
    'transform:rotate(-90deg);z-index:7;cursor:pointer;';
  tri.addEventListener('mouseenter', function() { aura.style.display = 'block'; });
  tri.addEventListener('mouseleave', function() { aura.style.display = 'none'; });
  tri.addEventListener('click', function(e) {
    e.stopPropagation();
    if (typeof onBornerasPresenciaTriangleClick === 'function') {
      onBornerasPresenciaTriangleClick(this);
    }
  });
  container.appendChild(tri);
}
