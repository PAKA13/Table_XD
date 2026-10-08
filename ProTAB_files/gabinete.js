














function toggleCardColapsable(cardId) {
  var card = document.getElementById(cardId);
  if (card) card.classList.toggle('colapsado');
}






function _sincronizarSenaleticaSegunAlto() {
  var sel = document.getElementById('modalGab_senaletica_tamano');
  if (!sel) return;
  var marco = document.getElementById('marco_gabinete');
  var gabHmm = marco ? (parseFloat(marco.style.height) || 0) * PX_TO_MM : 0;
  var forzar = gabHmm > 0 && gabHmm <= 550;
  var opGrande = sel.querySelector('option[value="300x200"]');
  if (opGrande) {
    opGrande.disabled = forzar;
    opGrande.textContent = forzar ? '30 × 20 cm (no entra ≤550 mm)' : '30 × 20 cm';
  }
  if (forzar) sel.value = '150x100';
  sel.title = forzar
    ? 'Con el gabinete en ' + gabHmm.toFixed(0) + ' mm solo entra la de 15 × 10 cm.'
    : '';
}




function _modeloPuertaPorTipo(tipo) {
  if (tipo === 'mural') tipo = 'adosado';                    
  return (tipo === 'empotrado') ? 'MS603-3' : 'MS-705';
}





var _chapaPuertaManual = false;

function _marcarChapaPuertaManual() {
  _chapaPuertaManual = true;
}

function abrirModalGab() {
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';


  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  var modal = document.getElementById('modalGab_overlay');
  modal.classList.add('activo');

  if (window._gabineteData) {

    var d = window._gabineteData;
    setGabTipo(d.tipo || '');

    var ipEl = document.getElementById('modalGab_ip');
    if (ipEl) ipEl.value = d.ip || '';

    window._colorGabSel    = d.colorGab    || '#D7D7D7';
    window._colorPlacaSel  = d.colorPlaca  || '#F75E25';
    window._colorPuertaSel = d.colorPuerta || '#D7D7D7';
    window._colorMandilSel = d.colorMandil || '#D7D7D7';
    _restaurarSwatches();

    var _siChk = document.getElementById('modalGab_selIndependiente');
    var _siVal = !!d.selIndependiente;
    if (_siChk) _siChk.checked = _siVal;

    var panelDefs = [
      { sfx: '',        panel: 'cuerpo', key: 'cuerpo' },
      { sfx: '_puerta', panel: 'puerta', key: 'puerta' },
      { sfx: '_placa',  panel: 'placa',  key: 'placa'  },
      { sfx: '_mandil', panel: 'mandil', key: 'mandil' }
    ];
    for (var i = 0; i < panelDefs.length; i++) {
      var s = panelDefs[i].sfx;
      var pPanel = panelDefs[i].panel;
      var p = d[panelDefs[i].key];
      if (!p) continue;

      var sel = document.getElementById('modalGab_plancha' + s);
      if (sel) sel.value = p.plancha || 'laf';

      var el = document.getElementById('modalGab_espesor' + s);
      if (el) el.value = p.espesor || '1.5';

      var acabSel = document.getElementById('modalGab_acabado' + s);
      if (acabSel) { acabSel.value = p.acabado || 'pintura'; onAcabadoChange(pPanel, p.acabado || 'pintura'); }

      var ralId = s === '' ? 'modalGab_ral' : 'modalGab_ral' + s;
      var ralEl = document.getElementById(ralId);
      if (ralEl) ralEl.value = p.ral || '7035';

      var micEl = document.getElementById('modalGab_micraje' + s);
      if (micEl) micEl.value = p.micras || '100';

      var micGEl = document.getElementById('modalGab_micraje_galv' + s);
      if (micGEl) micGEl.value = p.micrasGalv || '100';

      var chk = document.getElementById('modalGab_prepSup_check' + s);
      if (chk) { chk.checked = !!p.prepActiva; onPrepSupToggle(pPanel, !!p.prepActiva); }

      var prepSel = document.getElementById('modalGab_prepSup' + s);
      if (prepSel) { prepSel.value = p.prepTipo || 'quimico'; if (p.prepActiva) onPrepSupChange(pPanel, p.prepTipo || 'quimico'); }

      var desgEl = document.getElementById('modalGab_desengrasado' + s);
      if (desgEl) desgEl.checked = !!p.desengrasado;
      var deoxEl = document.getElementById('modalGab_desoxidado' + s);
      if (deoxEl) deoxEl.checked = !!p.desoxidado;
      var fosfEl = document.getElementById('modalGab_fosfatizado' + s);
      if (fosfEl) fosfEl.checked = !!p.fosfatizado;
    }

    switchMgabTab('cuerpo');
    _aplicarModoSelIndependiente(_siVal);
  } else {
    _resetModalGab();
  }

  document.getElementById('modalGab_error').textContent = '';
  _initGabInputListeners();



  var _esModoCrear = !window._gabineteData;
  var _cardIp     = document.getElementById('modalGab_card_ip');
  var _cardCaract = document.getElementById('modalGab_card_caract');
  var _cardCerr   = document.getElementById('modalGab_card_cerradura');
  var _cardSen    = document.getElementById('modalGab_card_senaletica');
  var _cardTipo   = document.getElementById('modalGab_card_tipo');
  if (_cardIp)     _cardIp.style.display     = _esModoCrear ? 'none' : '';
  if (_cardCaract) _cardCaract.style.display = _esModoCrear ? 'none' : '';
  if (_cardCerr)   _cardCerr.style.display   = _esModoCrear ? 'none' : '';
  if (_cardSen)    _cardSen.style.display    = _esModoCrear ? 'none' : '';
  if (_cardTipo)   _cardTipo.style.borderBottom = _esModoCrear ? 'none' : '';




  var _bodyCaract = _cardCaract && _cardCaract.querySelector('.m1-colapsable-body');
  if (_bodyCaract && _cardTipo && _cardIp) {
    if (_esModoCrear) {
      _cardCaract.parentNode.insertBefore(_cardTipo, _cardCaract);
      _cardCaract.parentNode.insertBefore(_cardIp, _cardCaract);
      _cardTipo.classList.remove('m1-subcard');
      _cardIp.classList.remove('m1-subcard');
    } else {
      _bodyCaract.insertBefore(_cardIp, _bodyCaract.firstChild);
      _bodyCaract.insertBefore(_cardTipo, _bodyCaract.firstChild);
      _cardTipo.classList.add('m1-subcard');
      _cardIp.classList.add('m1-subcard');
    }
  }


  if (_cardCaract) _cardCaract.classList.add('colapsado');
  if (_cardCerr)   _cardCerr.classList.add('colapsado');
  if (_cardSen)    _cardSen.classList.add('colapsado');

  var _btnConf = document.getElementById('modalGab_btnConfirmar');
  if (_btnConf) _btnConf.textContent = _esModoCrear ? 'Crear' : "Guardar cambios";


  var _cerr = (window._gabineteData && window._gabineteData.cerradura && window._gabineteData.cerradura.mandil) || {};
  var _selCerrM = document.getElementById('modalGab_cerr_mandil_modelo');
  var _selCerrQ = document.getElementById('modalGab_cerr_mandil_cantidad');
  if (_selCerrM) _selCerrM.value = _cerr.modelo || 'MS-406';
  if (_selCerrQ) _selCerrQ.value = String(_cantidadChapaMandil(_cerr.cantidad));

  var _cerrP = (window._gabineteData && window._gabineteData.cerradura && window._gabineteData.cerradura.puerta) || {};
  var _selCerrPM = document.getElementById('modalGab_cerr_puerta_modelo');
  var _selCerrPQ = document.getElementById('modalGab_cerr_puerta_cantidad');
  var _tipoGabP = modalGabTipoActual || (window._gabineteData && window._gabineteData.tipo) || 'adosado';
  if (_tipoGabP === 'mural') _tipoGabP = 'adosado';
  _chapaPuertaManual = !!_cerrP.modelo &&
                       _cerrP.modelo !== _modeloPuertaPorTipo(_tipoGabP);
  if (_selCerrPM) _selCerrPM.value = _cerrP.modelo || _modeloPuertaPorTipo(_tipoGabP);
  if (_selCerrPQ) _selCerrPQ.value = String(_cantidadChapaPuerta(_cerrP.cantidad));


  var _sen = (window._gabineteData && window._gabineteData.senaletica) || {};
  var _selSen = document.getElementById('modalGab_senaletica_tamano');
  if (_selSen) _selSen.value = _sen.tamano || '300x200';
  _sincronizarSenaleticaSegunAlto();
}


function _resetModalGab() {
  setGabTipo('');
  var ip = document.getElementById('modalGab_ip');
  if (ip) ip.value = '';

  switchMgabTab('cuerpo');

  var panels = [
    { sfx: '',        panel: 'cuerpo' },
    { sfx: '_puerta', panel: 'puerta' },
    { sfx: '_placa',  panel: 'placa'  },
    { sfx: '_mandil', panel: 'mandil' }
  ];
  for (var i = 0; i < panels.length; i++) {
    var s = panels[i].sfx;
    var p = panels[i].panel;
    var sel, el;

    sel = document.getElementById('modalGab_plancha' + s);
    if (sel) sel.value = 'laf';

    el = document.getElementById('modalGab_espesor' + s);
    if (el) el.value = '1.5';

    sel = document.getElementById('modalGab_acabado' + s);
    if (sel) { sel.value = 'pintura'; onAcabadoChange(p, 'pintura'); }

    var ralId = s === '' ? 'modalGab_ral' : 'modalGab_ral' + s;
    el = document.getElementById(ralId);
    if (el) el.value = '7035';

    el = document.getElementById('modalGab_micraje' + s);
    if (el) el.value = '100';

    el = document.getElementById('modalGab_micraje_galv' + s);
    if (el) el.value = '100';

    var chk = document.getElementById('modalGab_prepSup_check' + s);
    if (chk) { chk.checked = false; onPrepSupToggle(p, false); }

    sel = document.getElementById('modalGab_prepSup' + s);
    if (sel) sel.value = 'quimico';

    var desg = document.getElementById('modalGab_desengrasado' + s);
    var deox = document.getElementById('modalGab_desoxidado' + s);
    var fosf = document.getElementById('modalGab_fosfatizado' + s);
    if (desg) desg.checked = false;
    if (deox) deox.checked = false;
    if (fosf) fosf.checked = false;
  }

  window._colorGabSel    = '#D7D7D7';
  window._colorPuertaSel = '#D7D7D7';
  window._colorMandilSel = '#D7D7D7';
  window._colorPlacaSel  = '#F75E25';
  _restaurarSwatches();

  var selIndChk = document.getElementById('modalGab_selIndependiente');
  if (selIndChk) selIndChk.checked = false;
  _aplicarModoSelIndependiente(false);
}


function cerrarModalGab() {
  document.getElementById('modalGab_overlay').classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
}


function setGabTipo(val) {
  if (val === 'mural') val = 'adosado';                   
  var previo = modalGabTipoActual;
  modalGabTipoActual = val || null;
  var sel = document.getElementById('modalGab_tipo');
  if (sel) {
    if (!val) sel.selectedIndex = 0;
    else sel.value = val;
  }







  var selCerr = document.getElementById('modalGab_cerr_puerta_modelo');
  if (val && selCerr && !_chapaPuertaManual && val !== previo) {
    selCerr.value = _modeloPuertaPorTipo(val);
  }
}


function confirmarModalGab() {


  var _esCrear = !window._gabineteData;

  window._gabSenaleticaPrev = window._gabineteData ? window._gabineteData.senaletica : null;
  var errEl = document.getElementById('modalGab_error');
  errEl.textContent = '';

  function _leerPanel(sfx) {
    var ralId = sfx === '' ? 'modalGab_ral' : 'modalGab_ral' + sfx;
    var chk   = document.getElementById('modalGab_prepSup_check' + sfx);
    var desg  = document.getElementById('modalGab_desengrasado' + sfx);
    var deox  = document.getElementById('modalGab_desoxidado'  + sfx);
    var fosf  = document.getElementById('modalGab_fosfatizado' + sfx);
    return {
      plancha:      (document.getElementById('modalGab_plancha'      + sfx) || {}).value || 'laf',
      espesor:      (document.getElementById('modalGab_espesor'      + sfx) || {}).value || '1.5',
      acabado:      (document.getElementById('modalGab_acabado'      + sfx) || {}).value || 'pintura',
      ral:          (document.getElementById(ralId) || {}).value || '',
      micras:       (document.getElementById('modalGab_micraje'      + sfx) || {}).value || '',
      micrasGalv:   (document.getElementById('modalGab_micraje_galv' + sfx) || {}).value || '',
      prepActiva:   chk ? chk.checked : false,
      prepTipo:     (document.getElementById('modalGab_prepSup' + sfx) || {}).value || 'quimico',
      desengrasado: desg ? desg.checked : false,
      desoxidado:   deox ? deox.checked : false,
      fosfatizado:  fosf ? fosf.checked : false
    };
  }



  var _gd = window._gabineteData;
  var _esAdo = (modalGabTipoActual === 'adosado');
  var _profGabPart    = (_gd && typeof _gd.profGabMm    === 'number') ? _gd.profGabMm    : 120;




  var _profPuertaPart = _esAdo
    ? ((_gd && typeof _gd.profPuertaMm === 'number' && _gd.profPuertaMm > 0) ? _gd.profPuertaMm : 15)
    : 0;

  var _siChk = document.getElementById('modalGab_selIndependiente');
  var _gabInput = {
    tipo:      modalGabTipoActual,
    ip:        (document.getElementById('modalGab_ip') || {}).value || '',
    espesor:   document.getElementById('modalGab_espesor').value.trim(),
    ral:       document.getElementById('modalGab_ral').value.trim(),
    ralPlaca:  document.getElementById('modalGab_ral_placa').value.trim(),
    micraje:   document.getElementById('modalGab_micraje').value.trim(),
    colorGab:    window._colorGabSel,
    colorPlaca:  window._colorPlacaSel,
    colorPuerta: window._colorPuertaSel,
    colorMandil: window._colorMandilSel,
    selIndependiente: !!(_siChk && _siChk.checked),
    profTotalMm:  _profGabPart + _profPuertaPart,
    profPuertaMm: _profPuertaPart,
    cuerpo: _leerPanel(''),
    puerta: _leerPanel('_puerta'),
    placa:  _leerPanel('_placa'),
    mandil: _leerPanel('_mandil')
  };


  var resp = buildGabinete(_gabInput);
  if (!resp.ok) {
    errEl.textContent = (resp.errors || ['Error al armar Gabinete']).join(' / ');
    return;
  }

  window._gabineteData = resp.data;



  var _defaultCant = (_gabHmm() >= 500) ? 2 : 1;
  var _mandilCant = parseInt((document.getElementById('modalGab_cerr_mandil_cantidad') || {}).value, 10) || 1;
  var _puertaCant = parseInt((document.getElementById('modalGab_cerr_puerta_cantidad') || {}).value, 10) || 1;
  window._gabineteData.cerradura = {
    mandil: {
      modelo:   (document.getElementById('modalGab_cerr_mandil_modelo') || {}).value || 'MS-406',
      cantidad: _mandilCant,
      userOverride: (_mandilCant !== _defaultCant)
    },
    puerta: {
      modelo:   (document.getElementById('modalGab_cerr_puerta_modelo') || {}).value
                || _modeloPuertaPorTipo(modalGabTipoActual),
      cantidad: _puertaCant,
      userOverride: (_puertaCant !== _defaultCant)
    }
  };






  var _selSen = document.getElementById('modalGab_senaletica_tamano') || {};
  var _opGr = _selSen.querySelector ? _selSen.querySelector('option[value="300x200"]') : null;
  var _senPrev = (window._gabSenaleticaPrev || {}).tamano;
  window._gabineteData.senaletica = {
    tamano: (_opGr && _opGr.disabled) ? (_senPrev || '300x200') : (_selSen.value || '300x200')
  };

  cerrarModalGab();
  dibujarGabinete();


  if (window._panelBusbarData && typeof dibujarPanelBusbar === 'function') {
    dibujarPanelBusbar();
  }
  actualizarBibliotecaGabinete();
  if (typeof actualizarBibliotecaPB === 'function') actualizarBibliotecaPB();


  if (typeof _reaplicarVistaSiNoFrontal === 'function') _reaplicarVistaSiNoFrontal();





  if (_esCrear && typeof zoomAjustar === 'function') {
    setTimeout(function() { zoomAjustar(0); }, 50);
  }
  guardarSesion();
}








function _dibujarDiagonalesGab(d, gabW, gabH, gapPx, subGapPx) {
  var svgDiag = document.getElementById('svg_diagonales');
  if (!svgDiag) return;
  svgDiag.style.width = gabW + 'px';
  svgDiag.style.height = gabH + 'px';
  svgDiag.setAttribute('width', gabW);
  svgDiag.setAttribute('height', gabH);
  svgDiag.setAttribute('viewBox', '0 0 ' + gabW + ' ' + gabH);
  svgDiag.setAttribute('preserveAspectRatio', 'none');
  var miLeft = gapPx, miTop = gapPx;
  var miRight = gabW - gapPx, miBottom = gabH - gapPx;
  var dxL, dyT, dxR, dyB;
  if (d && d.tipo === 'empotrado') {
    dxL = 0; dyT = 0; dxR = gabW; dyB = gabH;
  } else {
    dxL = miLeft; dyT = miTop; dxR = miRight; dyB = miBottom;
  }
  var linea = function(id, x1, y1, x2, y2) {
    var l = document.getElementById(id);
    if (!l) return;
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
  };
  linea('diag_tl', miLeft + subGapPx,  miTop + subGapPx,    dxL, dyT);
  linea('diag_tr', miRight - subGapPx, miTop + subGapPx,    dxR, dyT);
  linea('diag_bl', miLeft + subGapPx,  miBottom - subGapPx, dxL, dyB);
  linea('diag_br', miRight - subGapPx, miBottom - subGapPx, dxR, dyB);
}




function dibujarGabinete() {
  var d = window._gabineteData;
  if (!d) return;

  var marco = document.getElementById('marco_gabinete');
  var _existingW = parseFloat(marco.style.width);
  var _existingH = parseFloat(marco.style.height);

  var gabW = (_existingW > 0) ? _existingW : (GAB_DEFAULT_MM / PX_TO_MM);
  var gabH = (_existingH > 0) ? _existingH : (GAB_DEFAULT_MM / PX_TO_MM);

  marco.style.width = gabW + 'px';
  marco.style.height = gabH + 'px';
  marco.style.background = d.colorGab || '#D7D7D7';
  marco.style.display = 'block';




  var _tipoBody = (d.tipo === 'mural') ? 'adosado' : d.tipo;
  document.body.classList.toggle('gab-empotrado', _tipoBody === 'empotrado');
  document.body.classList.toggle('gab-adosado', _tipoBody === 'adosado');


  var pbInset = PB_INSET_MM / PX_TO_MM;             
  var svgPB = document.getElementById('svg_placa_base');
  svgPB.style.position = 'absolute';
  svgPB.style.top = pbInset + 'px';
  svgPB.style.left = pbInset + 'px';
  svgPB.style.width = (gabW - 2 * pbInset) + 'px';
  svgPB.style.height = (gabH - 2 * pbInset) + 'px';
  svgPB.querySelector('rect').setAttribute('fill', d.colorPlaca);


  var gapMm = d.tipo === 'empotrado' ? 5 : 12;
  var gapPx = gapMm / PX_TO_MM;
  var miDiv = document.getElementById('marco_interno');
  miDiv.style.position = 'absolute';
  miDiv.style.top = gapPx + 'px';
  miDiv.style.left = gapPx + 'px';
  var miW = gabW - 2 * gapPx;
  var miH = gabH - 2 * gapPx;
  miDiv.style.width = miW + 'px';
  miDiv.style.height = miH + 'px';

  var subGapPx = SUBMARCO_GAP_MM / PX_TO_MM;
  var svgMI = document.getElementById('svg_marco_interno');
  svgMI.setAttribute('viewBox', '0 0 ' + miW + ' ' + miH);

  var outerRect = document.getElementById('rect_int_outer');
  outerRect.setAttribute('x', 0);
  outerRect.setAttribute('y', 0);
  outerRect.setAttribute('width', miW);
  outerRect.setAttribute('height', miH);
  outerRect.style.display = d.tipo === 'empotrado' ? 'none' : '';

  var innerRect = document.getElementById('rect_int_inner');
  innerRect.setAttribute('x', subGapPx);
  innerRect.setAttribute('y', subGapPx);
  innerRect.setAttribute('width', miW - 2 * subGapPx);
  innerRect.setAttribute('height', miH - 2 * subGapPx);


  _dibujarDiagonalesGab(d, gabW, gabH, gapPx, subGapPx);


  var pernoOff = PERNO_OFFSET_MM / PX_TO_MM;
  var pernoSz  = PERNO_SIZE_MM / PX_TO_MM;
  var pernoHalf = pernoSz / 2;

  var pTL = document.getElementById('perno_pb_tl');
  var pTR = document.getElementById('perno_pb_tr');
  var pBL = document.getElementById('perno_pb_bl');
  var pBR = document.getElementById('perno_pb_br');

  var placaTop = pbInset, placaLeft = pbInset;
  var placaRight = gabW - pbInset, placaBottom = gabH - pbInset;

  [pTL, pTR, pBL, pBR].forEach(function(p) {
    p.style.width = pernoSz + 'px';
    p.style.height = pernoSz + 'px';
  });

  pTL.style.top  = (placaTop + pernoOff - pernoHalf) + 'px';
  pTL.style.left = (placaLeft + pernoOff - pernoHalf) + 'px';
  pTR.style.top  = (placaTop + pernoOff - pernoHalf) + 'px';
  pTR.style.left = (placaRight - pernoOff - pernoHalf) + 'px';
  pBL.style.top  = (placaBottom - pernoOff - pernoHalf) + 'px';
  pBL.style.left = (placaLeft + pernoOff - pernoHalf) + 'px';
  pBR.style.top  = (placaBottom - pernoOff - pernoHalf) + 'px';
  pBR.style.left = (placaRight - pernoOff - pernoHalf) + 'px';
}




function redimensionarGabinete(nuevoGabW, nuevoGabH) {
  var d = window._gabineteData;
  if (!d) return;

  var pbInset = PB_INSET_MM / PX_TO_MM;
  var pernoOff = PERNO_OFFSET_MM / PX_TO_MM;
  var pernoSz = PERNO_SIZE_MM / PX_TO_MM;
  var pernoHalf = pernoSz / 2;

  var marco = document.getElementById('marco_gabinete');
  marco.style.width = nuevoGabW + 'px';
  marco.style.height = nuevoGabH + 'px';


  var nuevaPlacaW = nuevoGabW - 2 * pbInset;
  var nuevaPlacaH = nuevoGabH - 2 * pbInset;
  var svgPB = document.getElementById('svg_placa_base');
  svgPB.style.width = nuevaPlacaW + 'px';
  svgPB.style.height = nuevaPlacaH + 'px';


  var gapMm = d.tipo === 'empotrado' ? 5 : 12;
  var gapPx = gapMm / PX_TO_MM;
  var subGapPx = SUBMARCO_GAP_MM / PX_TO_MM;
  var miW = nuevoGabW - 2 * gapPx;
  var miH = nuevoGabH - 2 * gapPx;
  var miDiv = document.getElementById('marco_interno');
  miDiv.style.width = miW + 'px';
  miDiv.style.height = miH + 'px';

  var svgMI = document.getElementById('svg_marco_interno');
  svgMI.setAttribute('viewBox', '0 0 ' + miW + ' ' + miH);
  var outerRect = document.getElementById('rect_int_outer');
  outerRect.setAttribute('width', miW);
  outerRect.setAttribute('height', miH);
  var innerRect = document.getElementById('rect_int_inner');
  innerRect.setAttribute('x', subGapPx);
  innerRect.setAttribute('y', subGapPx);
  innerRect.setAttribute('width', miW - 2 * subGapPx);
  innerRect.setAttribute('height', miH - 2 * subGapPx);


  _dibujarDiagonalesGab(d, nuevoGabW, nuevoGabH, gapPx, subGapPx);


  var placaRight = nuevoGabW - pbInset;
  var placaBottom = nuevoGabH - pbInset;
  var _setP = function(id, top, left) {
    var p = document.getElementById(id);
    p.style.top = top + 'px';
    p.style.left = left + 'px';
  };
  _setP('perno_pb_tl', pbInset + pernoOff - pernoHalf,     pbInset + pernoOff - pernoHalf);
  _setP('perno_pb_tr', pbInset + pernoOff - pernoHalf,     placaRight - pernoOff - pernoHalf);
  _setP('perno_pb_bl', placaBottom - pernoOff - pernoHalf, pbInset + pernoOff - pernoHalf);
  _setP('perno_pb_br', placaBottom - pernoOff - pernoHalf, placaRight - pernoOff - pernoHalf);
}


function onPrepSupToggle(panel, enabled) {
  var suffix = panel === 'cuerpo' ? '' : '_' + panel;
  var sel = document.getElementById('modalGab_prepSup' + suffix);
  if (sel) { sel.style.opacity = enabled ? '1' : '0.4'; sel.style.pointerEvents = enabled ? '' : 'none'; }
  var quimico = document.getElementById('prepSup_' + panel + '_quimico');
  if (quimico) {
    if (!enabled) { quimico.style.display = 'none'; }
    else if (sel && sel.value === 'quimico') { quimico.style.display = 'flex'; }
  }
  _gabPropagar();
}

function onPrepSupChange(panel, val) {
  var quimico = document.getElementById('prepSup_' + panel + '_quimico');
  if (quimico) quimico.style.display = val === 'quimico' ? 'flex' : 'none';
  _gabPropagar();
}

function onAcabadoChange(panel, val) {
  var sfx = (panel === 'cuerpo') ? '' : '_' + panel;
  var _show = function(el, sh) { if (el) el.style.display = sh ? '' : 'none'; };
  var _isPint = (val === 'pintura');
  var _isGalv = (val === 'galvanizado');
  var _isEspV = _isPint || _isGalv;
  _show(document.getElementById('ralcolor_row_' + panel),  _isPint);
  _show(document.getElementById('espesor_lbl_' + panel),   _isEspV);
  _show(document.getElementById('modalGab_micraje'      + sfx), _isPint);
  _show(document.getElementById('modalGab_micraje_galv' + sfx), _isGalv);
  _gabPropagar();
}

function switchMgabTab(tab) {
  var tabs = ['cuerpo', 'puerta', 'placa', 'mandil'];
  var visible = (tab === 'todos') ? 'cuerpo' : tab;
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    var panel = document.getElementById('mgab_panel_' + t);
    if (panel) panel.style.display = (t === visible) ? '' : 'none';
  }
  var sel = document.getElementById('mgab_panel_select');
  if (sel && sel.value !== tab) sel.value = tab;
}


var _gabPropagating = false;

function onSelIndependienteChange(checked) {
  _aplicarModoSelIndependiente(checked);
  if (!checked) _gabPropagar();
}

function _aplicarModoSelIndependiente(checked) {
  var sel = document.getElementById('mgab_panel_select');
  if (checked) {
    if (sel) {
      sel.disabled = false;
      var v = sel.value;
      if (v === 'todos') v = 'cuerpo';
      sel.value = v;
      switchMgabTab(v);
    }
  } else {
    if (sel) {
      sel.value = 'todos';
      sel.disabled = true;
    }
    switchMgabTab('todos');
  }
}

function onGabInputChange() {
  _gabPropagar();
}

function _gabPropagar() {
  if (_gabPropagating) return;
  var chk = document.getElementById('modalGab_selIndependiente');
  if (!chk || chk.checked) return;                                       

  var activeTab = 'cuerpo';
  var panelNames = ['cuerpo', 'puerta', 'placa', 'mandil'];

  var srcSfx = '';
  var srcRalId = 'modalGab_ral';

  var srcPlancha  = (document.getElementById('modalGab_plancha'  + srcSfx) || {}).value || 'laf';
  var srcEspesor  = (document.getElementById('modalGab_espesor'  + srcSfx) || {}).value || '1.5';
  var srcAcabado  = (document.getElementById('modalGab_acabado'  + srcSfx) || {}).value || 'pintura';
  var srcRal      = (document.getElementById(srcRalId)            || {}).value || '7035';
  var srcMicras   = (document.getElementById('modalGab_micraje'  + srcSfx) || {}).value || '100';
  var srcMicrasGalv = (document.getElementById('modalGab_micraje_galv' + srcSfx) || {}).value || '100';
  var srcPrepChkEl  = document.getElementById('modalGab_prepSup_check' + srcSfx);
  var srcPrepChk    = srcPrepChkEl ? srcPrepChkEl.checked : false;
  var srcPrepSel  = (document.getElementById('modalGab_prepSup'  + srcSfx) || {}).value || 'quimico';
  var srcDesg = (document.getElementById('modalGab_desengrasado' + srcSfx) || {}).checked || false;
  var srcDeox = (document.getElementById('modalGab_desoxidado'   + srcSfx) || {}).checked || false;
  var srcFosf = (document.getElementById('modalGab_fosfatizado'  + srcSfx) || {}).checked || false;

  var colorMap = { cuerpo: '_colorGabSel', puerta: '_colorPuertaSel', placa: '_colorPlacaSel', mandil: '_colorMandilSel' };
  var setFnMap = { cuerpo: setColorGab,    puerta: setColorPuerta,    placa: setColorPlaca,    mandil: setColorMandil    };
  var srcColor = window[colorMap[activeTab]] || '#D7D7D7';

  _gabPropagating = true;
  for (var j = 0; j < panelNames.length; j++) {
    var tgt = panelNames[j];
    if (tgt === activeTab) continue;
    var tgtSfx = tgt === 'cuerpo' ? '' : '_' + tgt;
    var tgtRalId = tgtSfx === '' ? 'modalGab_ral' : 'modalGab_ral' + tgtSfx;

    var plEl = document.getElementById('modalGab_plancha'  + tgtSfx); if (plEl) plEl.value = srcPlancha;
    var espEl = document.getElementById('modalGab_espesor' + tgtSfx); if (espEl) espEl.value = srcEspesor;
    var acEl  = document.getElementById('modalGab_acabado' + tgtSfx);
    if (acEl) { acEl.value = srcAcabado; onAcabadoChange(tgt, srcAcabado); }
    var ralEl = document.getElementById(tgtRalId); if (ralEl) ralEl.value = srcRal;
    var micEl  = document.getElementById('modalGab_micraje'     + tgtSfx); if (micEl)  micEl.value  = srcMicras;
    var micGEl = document.getElementById('modalGab_micraje_galv'+ tgtSfx); if (micGEl) micGEl.value = srcMicrasGalv;
    var chkEl  = document.getElementById('modalGab_prepSup_check' + tgtSfx);
    if (chkEl) { chkEl.checked = srcPrepChk; onPrepSupToggle(tgt, srcPrepChk); }
    var prepEl = document.getElementById('modalGab_prepSup' + tgtSfx);
    if (prepEl) { prepEl.value = srcPrepSel; if (srcPrepChk) onPrepSupChange(tgt, srcPrepSel); }
    var desgEl2 = document.getElementById('modalGab_desengrasado' + tgtSfx); if (desgEl2) desgEl2.checked = srcDesg;
    var deoxEl2 = document.getElementById('modalGab_desoxidado'   + tgtSfx); if (deoxEl2) deoxEl2.checked = srcDeox;
    var fosfEl2 = document.getElementById('modalGab_fosfatizado'  + tgtSfx); if (fosfEl2) fosfEl2.checked = srcFosf;
    setFnMap[tgt](srcColor);
  }
  _gabPropagating = false;
}


function _initGabInputListeners() {
  var sfxList = ['', '_puerta', '_placa', '_mandil'];
  for (var i = 0; i < sfxList.length; i++) {
    var s = sfxList[i];
    var ids = [
      'modalGab_plancha' + s,
      'modalGab_espesor' + s,
      s === '' ? 'modalGab_ral' : 'modalGab_ral' + s,
      'modalGab_micraje' + s,
      'modalGab_micraje_galv' + s,
      'modalGab_desengrasado' + s,
      'modalGab_desoxidado'   + s,
      'modalGab_fosfatizado'  + s
    ];
    for (var j = 0; j < ids.length; j++) {
      (function(id) {
        var el = document.getElementById(id);
        if (!el || el._gabListenerSet) return;
        el._gabListenerSet = true;
        var evName = (el.type === 'checkbox') ? 'change' : 'input';
        el.addEventListener(evName, function() { onGabInputChange(); });
      })(ids[j]);
    }
  }
}


var _COLOR_KEYS = {
  Gab:    { global: '_colorGabSel',    preview: 'colorGab_preview',    drop: 'colorGab_drop'    },
  Puerta: { global: '_colorPuertaSel', preview: 'colorPuerta_preview', drop: 'colorPuerta_drop' },
  Mandil: { global: '_colorMandilSel', preview: 'colorMandil_preview', drop: 'colorMandil_drop' },
  Placa:  { global: '_colorPlacaSel',  preview: 'colorPlaca_preview',  drop: 'colorPlaca_drop'  }
};

function _setColor(key, val) {
  var cfg = _COLOR_KEYS[key];
  if (!cfg) return;
  window[cfg.global] = val;
  var preview = document.getElementById(cfg.preview);
  if (preview) preview.style.background = val;
  var drop = document.getElementById(cfg.drop);
  if (drop) {
    var opts = drop.querySelectorAll('div[data-color]');
    for (var i = 0; i < opts.length; i++) {
      opts[i].style.borderColor = opts[i].dataset.color === val ? '#00bfff' : 'transparent';
    }
  }
}

function _toggleColorDrop(key, e) {
  if (e && e.stopPropagation) e.stopPropagation();
  var cfg = _COLOR_KEYS[key];
  if (!cfg) return;
  var drop = document.getElementById(cfg.drop);
  if (!drop) return;
  drop.style.display = drop.style.display === 'flex' ? 'none' : 'flex';
}

function _selectColor(key, color) {
  _setColor(key, color);
  var cfg = _COLOR_KEYS[key];
  if (cfg) {
    var drop = document.getElementById(cfg.drop);
    if (drop) drop.style.display = 'none';
  }
  _gabPropagar();
}

function setColorGab(val)    { _setColor('Gab', val); }
function setColorPuerta(val) { _setColor('Puerta', val); }
function setColorMandil(val) { _setColor('Mandil', val); }
function setColorPlaca(val)  { _setColor('Placa', val); }

function toggleColorGabDrop(e)    { _toggleColorDrop('Gab', e); }
function toggleColorPuertaDrop(e) { _toggleColorDrop('Puerta', e); }
function toggleColorMandilDrop(e) { _toggleColorDrop('Mandil', e); }
function toggleColorPlacaDrop(e)  { _toggleColorDrop('Placa', e); }

function selectColorGab(color)    { _selectColor('Gab', color); }
function selectColorPuerta(color) { _selectColor('Puerta', color); }
function selectColorMandil(color) { _selectColor('Mandil', color); }
function selectColorPlaca(color)  { _selectColor('Placa', color); }


document.addEventListener('click', function() {
  for (var k in _COLOR_KEYS) {
    if (!_COLOR_KEYS.hasOwnProperty(k)) continue;
    var d = document.getElementById(_COLOR_KEYS[k].drop);
    if (d) d.style.display = 'none';
  }
});

function _restaurarSwatches() {
  setColorGab(window._colorGabSel || '#D7D7D7');
  setColorPuerta(window._colorPuertaSel || '#D7D7D7');
  setColorMandil(window._colorMandilSel || '#D7D7D7');
  setColorPlaca(window._colorPlacaSel || '#F75E25');
}
