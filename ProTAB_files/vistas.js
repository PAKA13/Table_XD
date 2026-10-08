



















window._vistaActual = 'frontal';
window._vistaFrontalDims = null;                                                   



var _VISTA_LABELS = {
  frontal:        'Vista Frontal (sin puerta)',
  frontal_mandil: 'Vista Frontal (con mandil)',
  frontal_puerta: 'Vista Frontal (con puerta)',
  lateral:        'Vista Lateral'
};

function _syncVistaUI() {
  var sel = document.getElementById('sel_vista');
  var val = document.getElementById('vista_valor');
  var v = sel ? sel.value : 'frontal';




  if (val) val.textContent = _VISTA_LABELS[v] || v;
  document.querySelectorAll('#vista_popover .vista-popover-item').forEach(function(it) {
    it.classList.toggle('activo', it.dataset.v === v);
  });
}

function toggleVistaDropdown(e) {
  if (e) e.stopPropagation();
  var pop = document.getElementById('vista_popover');
  var card = document.getElementById('vista_flotante');
  if (!pop) return;
  var abierto = pop.style.display !== 'none';
  pop.style.display = abierto ? 'none' : 'block';
  if (card) card.classList.toggle('abierto', !abierto);
  if (!abierto) {
    _syncVistaUI();
    setTimeout(function() {
      document.addEventListener('click', _cerrarVistaDropdownFuera);
    }, 10);
  } else {
    document.removeEventListener('click', _cerrarVistaDropdownFuera);
  }
}

function _cerrarVistaDropdownFuera(e) {
  var card = document.getElementById('vista_flotante');
  if (card && card.contains(e.target)) return;
  _cerrarVistaDropdown();
}

function _cerrarVistaDropdown() {
  var pop = document.getElementById('vista_popover');
  var card = document.getElementById('vista_flotante');
  if (pop) pop.style.display = 'none';
  if (card) card.classList.remove('abierto');
  document.removeEventListener('click', _cerrarVistaDropdownFuera);
}

function seleccionarVista(e, v) {
  if (e) e.stopPropagation();
  _cerrarVistaDropdown();
  var sel = document.getElementById('sel_vista');
  if (sel) sel.value = v;
  onVistaChange(v);
}

function onVistaChange(v) {
  aplicarVista(v);
  guardarSesion();
}

function aplicarVista(v) {

  if (typeof _cerrarMenusTriangulo === 'function') _cerrarMenusTriangulo();

  if (typeof _moverInf !== 'undefined' && _moverInf && typeof _moverInfTerminar === 'function') _moverInfTerminar(false);
  if (typeof _moverBarra !== 'undefined' && _moverBarra && typeof _moverBarraTerminar === 'function') _moverBarraTerminar(false);
  var marco = document.getElementById('marco_gabinete');
  if (!marco || marco.style.display === 'none' || !window._gabineteData) {

    var sel0 = document.getElementById('sel_vista');
    if (sel0) sel0.value = 'frontal';
    window._vistaActual = 'frontal';
    if (typeof _syncVistaUI === 'function') _syncVistaUI();
    return;
  }

  var vAnterior = window._vistaActual;
  window._vistaActual = v;
  var sel = document.getElementById('sel_vista');
  if (sel && sel.value !== v) sel.value = v;
  if (typeof _syncVistaUI === 'function') _syncVistaUI();





  if (vAnterior !== 'lateral' && v !== vAnterior) {
    window._vistaFrontalDims = {
      w: parseFloat(marco.style.width) || 750,
      h: parseFloat(marco.style.height) || 750
    };
  }


  _limpiarOverlaysVistas();

  document.body.classList.toggle('vista-puerta-active', v === 'frontal_puerta');
  document.body.classList.toggle('vista-lateral-active', v === 'lateral');
  document.body.classList.toggle('vista-mandil-active', v === 'frontal_mandil');



  if (vAnterior === 'lateral' && v !== 'lateral' && window._vistaFrontalDims) {
    redimensionarGabinete(window._vistaFrontalDims.w, window._vistaFrontalDims.h);
  }

  if (v === 'frontal') {
    if (typeof posicionarCotas === 'function') posicionarCotas();
  } else if (v === 'frontal_mandil') {

    if (typeof _renderMandilOverlays === 'function') _renderMandilOverlays();
    if (typeof posicionarCotasGabinete === 'function') posicionarCotasGabinete();
    if (typeof actualizarCotasEscala === 'function') actualizarCotasEscala();
  } else if (v === 'frontal_puerta') {
    _aplicarVistaPuerta();
  } else if (v === 'lateral') {
    _aplicarVistaLateral();
  }


  if (typeof _actualizarCotasSegunVista === 'function') _actualizarCotasSegunVista(v);



}






function _reaplicarVistaSiNoFrontal() {
  if (window._vistaActual && window._vistaActual !== 'frontal') {
    aplicarVista(window._vistaActual);
  }
}

function _limpiarOverlaysVistas() {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;

  marco.querySelectorAll('.vista-lat-overlay, .cota-cp, .puerta-rotulo, .puerta-piloto, .puerta-pulsador, .puerta-analizador').forEach(function(el) { el.remove(); });

  if (typeof _renderMandilOverlays === 'function') _renderMandilOverlays(true);

  ['senaletica_riesgo_puerta', 'chapa_hermetica_puerta', 'chapa_hermetica_puerta_2',
   'chapa_push_puerta', 'chapa_push_puerta_2', 'rejilla_puerta', 'rejilla_lateral',
   'marco_empotrado_exterior', 'marco_empotrado_interior', 'marco_empotrado_interior_der'
  ].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}







function _bajarHastaDespejar(top, alto, left, ancho, ocupados) {
  var PASO = 250;              
  function choca(t) {
    var b = t + alto, r = left + ancho;
    for (var i = 0; i < (ocupados || []).length; i++) {
      var o = ocupados[i];
      if (t < o.bot && b > o.top && left < o.right && r > o.left) return true;
    }
    return false;
  }
  var guard = 0;
  while (choca(top) && guard++ < 20) top += PASO;
  return top;
}


function _aplicarVistaPuerta() {
  var marco = document.getElementById('marco_gabinete');
  var gabW = parseFloat(marco.style.width) || 750;
  var gabH = parseFloat(marco.style.height) || 750;

  var plan = buildPuertaPlan({
    gabineteData: window._gabineteData,
    gabWmm: gabW * PX_TO_MM,
    gabHmm: gabH * PX_TO_MM,

    chapaXmm:  window._PUERTA_CHAPA_X_MM,
    chapaYmm:  window._PUERTA_CHAPA_Y_MM,
    chapaY2mm: window._PUERTA_CHAPA_Y2_MM
  });




  var sen = document.getElementById('senaletica_riesgo_puerta');
  var _senW = 1000, _senH = 1500;
  if (sen) {
    sen.style.display = plan.senaletica.visible ? 'block' : 'none';


    var _senTam = (window._gabineteData && window._gabineteData.senaletica &&
                   window._gabineteData.senaletica.tamano) || '300x200';



    var _senChica = (_senTam === '150x100') || (gabH * PX_TO_MM <= 550);
    _senW = _senChica ? 500 : 1000;
    _senH = _senChica ? 750 : 1500;
    sen.style.width = _senW + 'px';
    sen.style.height = _senH + 'px';
  }







  var _gabWLane = parseFloat(marco.style.width) || 750;
  var _laneN = 0;




  var _topProj = null;
  function _nuevoCarril() {
    _laneN++;
    var x = _gabWLane + 250 * _laneN;
    if (!_topProj) {
      _topProj = document.createElement('div');
      _topProj.className = 'cota-cp';
      _topProj.style.cssText = 'position:absolute;left:' + _gabWLane + 'px;top:0;height:0;' +
        'border-top:2px dashed rgba(6,182,212,0.5);pointer-events:none;';
      marco.appendChild(_topProj);
    }
    _topProj.style.width = (x - _gabWLane) + 'px';
    return x;
  }
  var CP_LANE_PIL = 0, CP_LANE_PUL = 0, CP_LANE_SEN = 0;

  function _refCota(xCarril, xElem, y) {
    var l = document.createElement('div');
    l.className = 'cota-cp';
    l.style.cssText = 'position:absolute;left:' + Math.min(xCarril, xElem) + 'px;' +
      'top:' + y + 'px;width:' + Math.abs(xElem - xCarril) + 'px;height:0;' +
      'border-top:2px dashed rgba(6,182,212,0.5);pointer-events:none;';
    marco.appendChild(l);
  }



  var _ocupadoPuerta = [];


  var _pilotosInfo = null;


  function _chapa(id, pos) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = pos ? 'block' : 'none';
    if (pos) {
      el.style.left = pos.left + 'px';
      el.style.top = pos.top + 'px';



      var _cw = 140, _ch = /push/.test(id) ? 415 : 140;
      _ocupadoPuerta.push({ top: pos.top, bot: pos.top + _ch, left: pos.left, right: pos.left + _cw });
    }
  }
  _chapa('chapa_hermetica_puerta',   plan.chapas.hermetica1);
  _chapa('chapa_hermetica_puerta_2', plan.chapas.hermetica2);
  _chapa('chapa_push_puerta',        plan.chapas.push1);
  _chapa('chapa_push_puerta_2',      plan.chapas.push2);


  var me = plan.marcosEmpotrado;
  var mExt = document.getElementById('marco_empotrado_exterior');
  var mInt = document.getElementById('marco_empotrado_interior');
  var mDer = document.getElementById('marco_empotrado_interior_der');
  if (mExt) {
    mExt.style.display = me.visible ? 'block' : 'none';
    mExt.style.backgroundColor = me.visible ? me.colorFondo : '';
  }
  if (mInt) mInt.style.display = me.visible ? 'block' : 'none';
  if (mDer) {
    mDer.style.display = me.visible ? 'block' : 'none';
    if (me.visible) _dibujarLineasBisagra(mDer, me.bisagraStep);
  }















  var _cn = plan.chapaNominal || {};
  var _gabWmmCp = gabW * PX_TO_MM;
  var _gabHmmCp = gabH * PX_TO_MM;
  var _chapaHmm = (_cn.tipo === 'push') ? 83 : 28;
  var _medioH   = _chapaHmm / 2;
  var _medioW   = 14;
  var _dosChapas = (_cn.cant >= 2);


  var _yCp  = (typeof window._PUERTA_CHAPA_Y_MM === 'number')
    ? window._PUERTA_CHAPA_Y_MM : (_cn.yPx || 0) * PX_TO_MM;
  var _y2Cp = (typeof window._PUERTA_CHAPA_Y2_MM === 'number')
    ? window._PUERTA_CHAPA_Y2_MM : (_cn.y2Px || 0) * PX_TO_MM;




  function _rangoCp(min, max) {
    return { min: min, max: Math.max(min, max) };
  }
  var _RANGOS_CP = {
    'CP-01': _rangoCp(_medioW, _gabWmmCp - _medioW),
    'CP-02': _dosChapas ? _rangoCp(_medioH, _y2Cp - _chapaHmm)
                        : _rangoCp(_medioH, _gabHmmCp - _medioH),
    'CP-03': _dosChapas ? _rangoCp(_medioH, _gabHmmCp - _yCp - _chapaHmm)
                        : _rangoCp(_medioH, _gabHmmCp - _medioH),
    'CP-04': _rangoCp(_chapaHmm, _gabHmmCp - _yCp - _medioH)
  };

  function _aplicarCotaChapa(code, mm) {
    if (code === 'CP-01')      window._PUERTA_CHAPA_X_MM = mm;
    else if (code === 'CP-02') window._PUERTA_CHAPA_Y_MM = mm;
    else if (code === 'CP-04') window._PUERTA_CHAPA_Y2_MM = _yCp + mm;
    else if (code === 'CP-03') {

      if (_dosChapas) window._PUERTA_CHAPA_Y2_MM = _gabHmmCp - mm;
      else            window._PUERTA_CHAPA_Y_MM  = _gabHmmCp - mm;
    }
  }

  plan.cotasCP.forEach(function(c) {
    var el = document.createElement('div');
    el.className = 'cota-mi cota-cp ' + (c.kind === 'h' ? 'cota-mi-h' : 'cota-mi-v');
    if (c.kind === 'h') {
      el.style.left = c.leftPx + 'px';
      el.style.top = (c.topPx - 10) + 'px';
      el.style.width = c.lenPx + 'px';
      el.style.setProperty('--cota-w', c.lenPx + 'px');
    } else {
      el.style.left = (c.leftPx - 10) + 'px';
      el.style.top = c.topPx + 'px';
      el.style.height = c.lenPx + 'px';
      el.style.setProperty('--cota-h', c.lenPx + 'px');
    }
    var span = document.createElement('span');
    span.className = 'cota-mi-val' + (c.kind === 'v' ? ' cota-val-horiz' : '');
    span.textContent = c.valueMm.toFixed(1);
    span.title = c.code + ' — click para editar';
    span.classList.add('cota-editable');
    span.style.pointerEvents = 'auto';
    var _rCp = _RANGOS_CP[c.code] || { min: 5, max: 2000 };
    (function(code) {
      span.addEventListener('click', function(e) {
        e.stopPropagation();
        _puertaCotaEditar(span, code, _rCp.min, _rCp.max, function(mm) {
          _aplicarCotaChapa(code, mm);
        });
      });
    })(c.code);
    el.appendChild(span);
    marco.appendChild(el);
  });





  var rotW = 500, rotH = 200;                    
  var topMm = (typeof window._PUERTA_ROTULO_TOP_MM === 'number')
    ? window._PUERTA_ROTULO_TOP_MM : 40;
  var rotY = topMm / PX_TO_MM;
  var rotX = (gabW - rotW) / 2;
  var rotTxt = '';
  try {
    var _metaR = PM.meta();
    var _pR = _metaR.projects.find(function(x) { return x.id === _metaR.activeId; });
    rotTxt = _pR ? _pR.name : '';
  } catch (e) {}



  var _filasRot = (typeof _tableroLineas === 'function') ? _tableroLineas() : [];
  if (!_filasRot.length) _filasRot = [rotTxt || 'TABLERO'];
  var rot = document.createElement('div');
  rot.className = 'puerta-rotulo';
  rot.style.cssText = 'position:absolute;left:' + rotX + 'px;top:' + rotY +
    'px;width:' + rotW + 'px;height:' + rotH + 'px;z-index:21;' +
    'flex-direction:column;';


  var _hFila = rotH / _filasRot.length;
  _filasRot.forEach(function(txt, i) {
    var _max = Math.min(i === 0 ? 85 : 68, _hFila * 0.78);
    var linea = document.createElement('div');
    linea.style.cssText = 'font-size:' + _fontRotuloFit(txt, rotW - 20, _max) +
      'px;line-height:' + _hFila + 'px;white-space:nowrap;';
    linea.textContent = txt;
    rot.appendChild(linea);
  });
  marco.appendChild(rot);
  _ocupadoPuerta.push({ top: rotY, bot: rotY + rotH, left: rotX, right: rotX + rotW });


  if (rotY > 0) {
    var cpr = document.createElement('div');
    cpr.className = 'cota-mi cota-mi-v cota-cp';
    cpr.style.left = (gabW / 2 - 10) + 'px';
    cpr.style.top = '0px';
    cpr.style.height = rotY + 'px';
    cpr.style.setProperty('--cota-h', rotY + 'px');
    var cprSpan = document.createElement('span');
    cprSpan.className = 'cota-mi-val cota-val-horiz cota-editable';
    cprSpan.textContent = topMm.toFixed(1);
    cprSpan.title = 'CP-R — click para editar';
    cprSpan.style.pointerEvents = 'auto';
    cprSpan.addEventListener('click', function(e) {
      e.stopPropagation();
      _puertaRotuloEditar(cprSpan);
    });
    cpr.appendChild(cprSpan);
    marco.appendChild(cpr);
  }





  window._PILOTOS_PUERTA = null;
  var nLeds = window._PILOTOS_LEDS || 0;
  if (nLeds > 0) {
    var pilTopMm = (typeof window._PILOTOS_TOP_MM === 'number')
      ? window._PILOTOS_TOP_MM : 150;
    var pilCy = pilTopMm / PX_TO_MM;
    var PIL_D = 150;                              
    var PIL_SEP = 400;                                          
    var cx0 = gabW / 2;
    var xs = (nLeds === 1) ? [cx0]
           : (nLeds === 2) ? [cx0 - PIL_SEP / 2, cx0 + PIL_SEP / 2]
           : [cx0 - PIL_SEP, cx0, cx0 + PIL_SEP];

    var PIL_ROT_W = 150, PIL_ROT_H = 75, PIL_ROT_GAP = 25;
    var _fasesPil = (typeof _fasesPilotos === 'function') ? _fasesPilotos() : [];



    var _pilLeft = Math.min(xs[0] - PIL_D / 2, xs[0] - PIL_ROT_W / 2);
    var _pilRight = Math.max(xs[xs.length - 1] + PIL_D / 2,
                             xs[xs.length - 1] + PIL_ROT_W / 2);
    var _pilAncho = _pilRight - _pilLeft;
    var _pilAlto = PIL_ROT_H + PIL_ROT_GAP + PIL_D;
    var _pilTopBloque = _bajarHastaDespejar(
      pilCy - PIL_D / 2 - PIL_ROT_GAP - PIL_ROT_H, _pilAlto,
      _pilLeft, _pilAncho, _ocupadoPuerta);
    pilCy = _pilTopBloque + PIL_ROT_H + PIL_ROT_GAP + PIL_D / 2;
    pilTopMm = pilCy * PX_TO_MM;
    _pilotosInfo = { cy: pilCy, left: _pilLeft, right: _pilRight };

    window._PILOTOS_PUERTA = { cy: pilCy };

    var pilFondo = _LED_HEX[window._PILOTOS_COLOR] || _LED_HEX.verde;
    var _fontFase = (typeof _fontRotuloGrupo === 'function')
      ? _fontRotuloGrupo(_fasesPil, PIL_ROT_W, 42) : 42;
    var _rotFaseTop = pilCy - PIL_D / 2 - PIL_ROT_GAP - PIL_ROT_H;
    xs.forEach(function(px, i) {

      var fase = _fasesPil[i];
      if (fase) {
        var rotF = document.createElement('div');
        rotF.className = 'puerta-piloto puerta-rotulo';
        rotF.style.cssText = 'position:absolute;left:' + (px - PIL_ROT_W / 2) + 'px;top:' +
          _rotFaseTop + 'px;width:' + PIL_ROT_W + 'px;height:' + PIL_ROT_H + 'px;' +
          'font-size:' + _fontFase + 'px;z-index:22;';
        rotF.textContent = fase;
        marco.appendChild(rotF);
      }

      var fondo = document.createElement('div');
      fondo.className = 'puerta-piloto';
      fondo.style.cssText = 'position:absolute;left:' + (px - PIL_D / 2) + 'px;top:' +
        (pilCy - PIL_D / 2) + 'px;width:' + PIL_D + 'px;height:' + PIL_D + 'px;' +
        'border-radius:50%;background:' + pilFondo + ';z-index:20;pointer-events:none;';
      marco.appendChild(fondo);
      var img = document.createElement('img');
      img.src = 'assets/Aparamenta/Piloto-vf.svg';
      img.className = 'puerta-piloto';
      img.style.cssText = 'position:absolute;left:' + (px - PIL_D / 2) + 'px;top:' +
        (pilCy - PIL_D / 2) + 'px;width:' + PIL_D + 'px;height:' + PIL_D + 'px;' +
        'z-index:21;pointer-events:none;';
      marco.appendChild(img);
      _ocupadoPuerta.push({ top: _rotFaseTop, bot: pilCy + PIL_D / 2,
                            left: Math.min(px - PIL_D / 2, px - PIL_ROT_W / 2),
                            right: Math.max(px + PIL_D / 2, px + PIL_ROT_W / 2) });
    });



    var _pilTop = _rotFaseTop, _pilBot = pilCy + PIL_D / 2;
    var _pilCx = (_pilLeft + _pilLeft + _pilAncho) / 2;
    var auraPil = document.createElement('div');
    auraPil.className = 'puerta-piloto puerta-puls-aura';
    auraPil.style.cssText = 'left:' + (_pilLeft - 14) + 'px;top:' + (_pilTop - 14) +
      'px;width:' + (_pilAncho + 28) + 'px;height:' + (_pilBot - _pilTop + 28) + 'px;z-index:19;';
    marco.appendChild(auraPil);

    var _triWpil = 45;
    var triPil = document.createElement('img');
    triPil.src = 'assets/panel-busbar/boton_trian_verde.svg';
    triPil.className = 'puerta-piloto puerta-puls-tri';
    triPil.style.cssText = 'position:absolute;left:' + (_pilCx - _triWpil / 2) + 'px;top:' +

      (_pilBot + 22 - (PIL_D / 2 - _triWpil / 2)) + 'px;' +
      'width:' + _triWpil + 'px;height:' + PIL_D + 'px;' +
      'transform:rotate(-90deg);z-index:23;cursor:pointer;pointer-events:auto;';
    triPil.addEventListener('mouseenter', function() { auraPil.style.display = 'block'; });
    triPil.addEventListener('mouseleave', function() { auraPil.style.display = 'none'; });
    triPil.addEventListener('click', function(e) {
      e.stopPropagation();
      if (typeof onPilotosTriangleClick === 'function') onPilotosTriangleClick(this);
    });
    marco.appendChild(triPil);




    CP_LANE_PIL = _nuevoCarril();
    _refCota(CP_LANE_PIL, xs[xs.length - 1] + PIL_D / 2, pilCy);
    var cpp = document.createElement('div');
    cpp.className = 'cota-mi cota-mi-v cota-cp';
    cpp.style.left = (CP_LANE_PIL - 10) + 'px';
    cpp.style.top = '0px';
    cpp.style.height = pilCy + 'px';
    cpp.style.setProperty('--cota-h', pilCy + 'px');
    var cppSpan = document.createElement('span');
    cppSpan.className = 'cota-mi-val cota-val-horiz cota-editable';
    cppSpan.textContent = pilTopMm.toFixed(1);
    cppSpan.title = 'CP-P — click para editar';
    cppSpan.style.pointerEvents = 'auto';
    cppSpan.addEventListener('click', function(e) {
      e.stopPropagation();


      _puertaCotaEditar(cppSpan, 'CP-P', 40, Math.max(40, Math.floor(gabH * PX_TO_MM - 15)), function(mm) {
        window._PILOTOS_TOP_MM = mm;
      });
    });
    cpp.appendChild(cppSpan);
    marco.appendChild(cpp);



    for (var pi = 0; pi < xs.length - 1; pi++) {
      var c80 = document.createElement('div');
      c80.className = 'cota-mi cota-mi-h cota-cp';
      c80.style.left = xs[pi] + 'px';
      c80.style.top = (pilCy - 10) + 'px';
      c80.style.width = (xs[pi + 1] - xs[pi]) + 'px';
      c80.style.setProperty('--cota-w', (xs[pi + 1] - xs[pi]) + 'px');
      var s80 = document.createElement('span');
      s80.className = 'cota-mi-val';
      s80.textContent = (PIL_SEP * PX_TO_MM).toFixed(1);
      s80.title = 'CP-P2';
      c80.appendChild(s80);
      marco.appendChild(c80);
    }
  }










  window._ANALIZADOR_PUERTA = null;
  if (window._MEDIDOR) {
    var ANA_W = 96.72 / PX_TO_MM, ANA_H = 96.75 / PX_TO_MM;
    var ANA_GAP_DEF = 40 / PX_TO_MM;
    var anaCy;
    if (typeof window._ANALIZADOR_TOP_MM === 'number') {
      anaCy = window._ANALIZADOR_TOP_MM / PX_TO_MM;
    } else {



      var _aL = gabW / 2 - ANA_W / 2, _aR = _aL + ANA_W;
      var _ultBot = 0;
      _ocupadoPuerta.forEach(function(o) {
        if (o.left < _aR && o.right > _aL && o.bot > _ultBot) _ultBot = o.bot;
      });
      anaCy = _ultBot + ANA_GAP_DEF + ANA_H / 2;
    }
    var anaTopMm = anaCy * PX_TO_MM;
    var anaLeft = gabW / 2 - ANA_W / 2;

    var ANA_ROT_W = 150, ANA_ROT_H = 75, ANA_ROT_GAP = 25;
    var _anaAlto = ANA_H + ANA_ROT_GAP + ANA_ROT_H;
    var anaTop = _bajarHastaDespejar(anaCy - ANA_H / 2, _anaAlto, anaLeft, ANA_W, _ocupadoPuerta);

    if (anaTop + _anaAlto > gabH) anaTop = Math.max(0, gabH - _anaAlto);
    anaCy = anaTop + ANA_H / 2;
    anaTopMm = anaCy * PX_TO_MM;

    var imgA = document.createElement('img');
    imgA.src = 'assets/Aparamenta/Analizador_de_red-vf.svg';
    imgA.className = 'puerta-analizador';
    imgA.style.cssText = 'position:absolute;left:' + anaLeft + 'px;top:' + anaTop +
      'px;width:' + ANA_W + 'px;height:' + ANA_H + 'px;z-index:20;pointer-events:none;';
    marco.appendChild(imgA);


    var anaRotTop = anaTop + ANA_H + ANA_ROT_GAP;
    var rotA = document.createElement('div');
    rotA.className = 'puerta-analizador puerta-rotulo';
    rotA.style.cssText = 'position:absolute;left:' + (gabW / 2 - ANA_ROT_W / 2) + 'px;top:' +
      anaRotTop + 'px;width:' + ANA_ROT_W + 'px;height:' + ANA_ROT_H + 'px;' +
      'font-size:' + ((typeof _fontRotuloFit === 'function') ? _fontRotuloFit('PM', ANA_ROT_W, 42) : 42) +
      'px;z-index:22;';
    rotA.textContent = 'PM';
    marco.appendChild(rotA);
    var anaBot = anaRotTop + ANA_ROT_H;
    _ocupadoPuerta.push({ top: anaTop, bot: anaBot, left: anaLeft, right: anaLeft + ANA_W });


    var auraA = document.createElement('div');
    auraA.className = 'puerta-analizador puerta-puls-aura';
    auraA.style.cssText = 'left:' + (anaLeft - 14) + 'px;top:' + (anaTop - 14) +
      'px;width:' + (ANA_W + 28) + 'px;height:' + (anaBot - anaTop + 28) + 'px;z-index:19;';
    marco.appendChild(auraA);
    var _triWa = 45, _triHa = 150;
    var triA = document.createElement('img');
    triA.src = 'assets/panel-busbar/boton_trian_verde.svg';
    triA.className = 'puerta-analizador puerta-puls-tri';
    triA.style.cssText = 'position:absolute;left:' + (gabW / 2 - _triWa / 2) + 'px;top:' +
      (anaBot + 22 - (_triHa / 2 - _triWa / 2)) + 'px;' +
      'width:' + _triWa + 'px;height:' + _triHa + 'px;' +
      'transform:rotate(-90deg);z-index:23;cursor:pointer;pointer-events:auto;';
    triA.addEventListener('mouseenter', function() { auraA.style.display = 'block'; });
    triA.addEventListener('mouseleave', function() { auraA.style.display = 'none'; });
    triA.addEventListener('click', function(e) {
      e.stopPropagation();
      if (typeof onAnalizadorTriangleClick === 'function') onAnalizadorTriangleClick(this);
    });
    marco.appendChild(triA);



    var CP_LANE_ANA = _nuevoCarril();

    _refCota(CP_LANE_ANA, anaLeft + ANA_W, anaCy);
    var cpa = document.createElement('div');
    cpa.className = 'cota-mi cota-mi-v cota-cp';
    cpa.style.left = (CP_LANE_ANA - 10) + 'px';
    cpa.style.top = '0px';
    cpa.style.height = anaCy + 'px';
    cpa.style.setProperty('--cota-h', anaCy + 'px');
    var cpaSpan = document.createElement('span');
    cpaSpan.className = 'cota-mi-val cota-val-horiz cota-editable';
    cpaSpan.textContent = anaTopMm.toFixed(1);
    cpaSpan.title = 'CP-A — click para editar';
    cpaSpan.style.pointerEvents = 'auto';
    cpaSpan.addEventListener('click', function(e) {
      e.stopPropagation();

      _puertaCotaEditar(cpaSpan, 'CP-A', 60,
        Math.max(60, Math.floor((gabH - ANA_ROT_GAP - ANA_ROT_H - ANA_H / 2) * PX_TO_MM)), function(mm) {
        window._ANALIZADOR_TOP_MM = mm;
      });
    });
    cpa.appendChild(cpaSpan);
    marco.appendChild(cpa);

    window._ANALIZADOR_PUERTA = { cy: anaCy, h: ANA_H };
  }








  var _pulsList = (window._itmList || []).filter(function(i) { return i.pulsador && i.contactor; });
  if (_pulsList.length > 0) {
    var pulTopMm = (typeof window._PULSADORES_TOP_MM === 'number')
      ? window._PULSADORES_TOP_MM : 200;
    var pulCy = pulTopMm / PX_TO_MM;
    var PUL_W = 150, PUL_H = 250;                      
    var SEL_D = 150;                                        
    var COL_SEP = 250;                                                   
    var PUL_SEP = 400;                                          
    var pcx0 = gabW / 2;
    var CJT_D = 150;                                                           
    var CJT_ROT_W = 150, CJT_ROT_H = 75;                         
    var CJT_ROT_GAP = 25;                                               



    var CJT_SEP = CJT_D + CJT_ROT_GAP + CJT_ROT_H;
    var PUL_FILA_GAP = 250;                                  



    var _filasP = [[]];
    _pulsList.forEach(function(p, i) {
      if (i > 0 && p.pulsador && p.pulsador.salto) _filasP.push([]);
      _filasP[_filasP.length - 1].push(i);
    });




    var SEL_EXTRA = CJT_ROT_GAP + SEL_D + CJT_ROT_GAP + CJT_ROT_H;



    function _pulsAncho(p) {
      if (typeof _pulsadorBotoneraOn === 'function' && !_pulsadorBotoneraOn(p)) return CJT_ROT_W;
      var tipo = (typeof _pulsadorTipo === 'function') ? _pulsadorTipo(p) : 'doble';
      return (tipo === 'columnas') ? (COL_SEP + CJT_ROT_W) : CJT_ROT_W;
    }


    function _pulsSep(pa, pb) {
      return Math.max(PUL_SEP, (_pulsAncho(pa) + _pulsAncho(pb)) / 2 + CJT_ROT_GAP);
    }
    function _pulsSepsFila(fila) {
      var seps = [];
      for (var s = 0; s < fila.length - 1; s++) {
        seps.push(_pulsSep(_pulsList[fila[s]], _pulsList[fila[s + 1]]));
      }
      return seps;
    }
    function _pulsAnchoFila(fila) {
      var seps = _pulsSepsFila(fila), tot = 0;
      seps.forEach(function(v) { tot += v; });
      return tot + _pulsAncho(_pulsList[fila[0]]) / 2 +
                   _pulsAncho(_pulsList[fila[fila.length - 1]]) / 2;
    }
    function _pulsExtent(p) {
      var tipo = (typeof _pulsadorTipo === 'function') ? _pulsadorTipo(p) : 'doble';
      var extra = (typeof _pulsadorSelectorOn === 'function' &&
                   _pulsadorSelectorOn(p)) ? SEL_EXTRA : 0;


      if (typeof _pulsadorBotoneraOn === 'function' && !_pulsadorBotoneraOn(p)) {
        return { arriba: SEL_D / 2,
                 abajo: SEL_D / 2 + CJT_ROT_GAP + CJT_ROT_H + CJT_ROT_GAP + CJT_ROT_H };
      }


      if (tipo === 'columnas') {
        return { arriba: CJT_D / 2 + CJT_ROT_GAP + CJT_ROT_H,
                 abajo: CJT_SEP + CJT_D / 2 + CJT_ROT_GAP + CJT_ROT_H + extra };
      }
      if (tipo === 'conjunto') {
        return { arriba: CJT_D / 2 + CJT_ROT_GAP + CJT_ROT_H,
                 abajo: 2 * CJT_SEP + CJT_D / 2 + CJT_ROT_GAP + CJT_ROT_H + extra };
      }
      return { arriba: PUL_H / 2,
               abajo: PUL_H / 2 + CJT_ROT_GAP + CJT_ROT_H + extra };
    }





    function _pulsExtFila(fila) {
      var a = 0, b = 0;
      fila.forEach(function(idx) {
        var e = _pulsExtent(_pulsList[idx]);
        if (e.arriba > a) a = e.arriba;
        if (e.abajo > b) b = e.abajo;
      });
      return { arriba: a, abajo: b };
    }
    var MIN_CC_PIL = 350;                                                    




    var _filaCy = [], _filaTop = [], _filaBot = [];
    var _cursorTop = pulCy - _pulsExtFila(_filasP[0]).arriba;
    _filasP.forEach(function(fila, fi) {
      var ex = _pulsExtFila(fila), ancho = _pulsAnchoFila(fila);
      var L = pcx0 - ancho / 2, R = pcx0 + ancho / 2;
      for (var _g = 0; _g < 5; _g++) {
        var antes = _cursorTop;
        _cursorTop = _bajarHastaDespejar(_cursorTop, ex.arriba + ex.abajo, L, ancho, _ocupadoPuerta);



        if (fi === 0 && _pilotosInfo && L < _pilotosInfo.right && R > _pilotosInfo.left &&
            (_cursorTop + ex.arriba - _pilotosInfo.cy) < MIN_CC_PIL) {
          _cursorTop = _pilotosInfo.cy + MIN_CC_PIL - ex.arriba;
        }
        if (_cursorTop === antes) break;
      }
      var cy = _cursorTop + ex.arriba;
      _filaCy.push(cy);
      _filaTop.push(_cursorTop);
      _filaBot.push(cy + ex.abajo);
      _cursorTop = cy + ex.abajo + PUL_FILA_GAP;
    });



    pulCy = _filaCy[0];
    pulTopMm = pulCy * PX_TO_MM;






    var pxs = [], _filaDe = [], _posEnFila = [], _sepsDe = [];
    _filasP.forEach(function(fila, fi) {


      var seps = _pulsSepsFila(fila), tot = 0;
      seps.forEach(function(v) { tot += v; });
      _sepsDe[fi] = seps;
      var x = pcx0 - tot / 2;
      fila.forEach(function(idx, k) {
        pxs[idx] = x;
        if (k < seps.length) x += seps[k];
        _filaDe[idx] = fi;
        _posEnFila[idx] = k;
      });
    });

    pxs.forEach(function(pxx, pki) {



      var pulCyF = _filaCy[_filaDe[pki]];
      var pulCy = pulCyF;
      var _tipoP = (typeof _pulsadorTipo === 'function')
        ? _pulsadorTipo(_pulsList[pki]) : 'doble';
      var badgeTop, grpTop;
      var _botOnP = (typeof _pulsadorBotoneraOn === 'function') ? _pulsadorBotoneraOn(_pulsList[pki]) : true;
      if (!_botOnP) {



        grpTop = pulCy - SEL_D / 2;
        badgeTop = grpTop;
      } else if (_tipoP === 'conjunto') {



        var _pulsP = _pulsList[pki].pulsador || {};
        var _ledColorP = (_pulsP.ledColor === 'rojo') ? _LED_HEX.rojo : _LED_HEX.verde;



        var _mapEl = {
          piloto: { svg: 'Piloto-vf.svg',   fondo: _ledColorP, rotulo: 'PILOTO', d: 150 },
          verde:  { svg: 'Pulsador-vf.svg', fondo: _LED_HEX.verde,  rotulo: 'MARCHA', d: 142.5 },
          rojo:   { svg: 'Pulsador-vf.svg', fondo: _LED_HEX.rojo,  rotulo: 'PARADA', d: 142.5 }
        };
        var _ordP = (_pulsP.orden && _pulsP.orden.length === 3)
          ? _pulsP.orden : ['piloto', 'verde', 'rojo'];
        var _els = _ordP.map(function(k) { return _mapEl[k] || _mapEl.piloto; });
        var _fontRot = _fontRotuloGrupo(
          _els.map(function(e) { return e.rotulo; }), CJT_ROT_W, 42);
        _els.forEach(function(el, ei) {
          var cy = pulCy + ei * CJT_SEP;
          if (ei === 0) grpTop = cy - CJT_D / 2 - CJT_ROT_GAP - CJT_ROT_H;

          var rot = document.createElement('div');
          rot.className = 'puerta-pulsador puerta-rotulo';
          rot.style.cssText = 'position:absolute;left:' + (pxx - CJT_ROT_W / 2) + 'px;top:' +
            (cy - CJT_D / 2 - CJT_ROT_GAP - CJT_ROT_H) + 'px;width:' + CJT_ROT_W + 'px;' +
            'height:' + CJT_ROT_H + 'px;font-size:' + _fontRot + 'px;z-index:22;';
          rot.textContent = el.rotulo;
          marco.appendChild(rot);



          var _dEl = el.d || CJT_D;
          var fondo = document.createElement('div');
          fondo.className = 'puerta-pulsador';
          fondo.style.cssText = 'position:absolute;left:' + (pxx - _dEl / 2) + 'px;top:' +
            (cy - _dEl / 2) + 'px;width:' + _dEl + 'px;height:' + _dEl + 'px;' +
            'border-radius:50%;background:' + el.fondo + ';z-index:20;pointer-events:none;';
          marco.appendChild(fondo);
          var im = document.createElement('img');
          im.src = 'assets/Aparamenta/' + el.svg;
          im.className = 'puerta-pulsador';
          im.style.cssText = 'position:absolute;left:' + (pxx - _dEl / 2) + 'px;top:' +
            (cy - _dEl / 2) + 'px;width:' + _dEl + 'px;height:' + _dEl + 'px;' +
            'z-index:21;pointer-events:none;';
          marco.appendChild(im);
        });

        for (var ci = 0; ci < 2; ci++) {
          var c30 = document.createElement('div');
          c30.className = 'cota-mi cota-mi-v cota-cp puerta-pulsador';
          c30.style.left = (pxx - CJT_D / 2 - 40 - 10) + 'px';
          c30.style.top = (pulCy + ci * CJT_SEP) + 'px';
          c30.style.left = (pxx - CJT_D / 2 - CJT_ROT_W / 2 - 40 - 10) + 'px';
          c30.style.height = CJT_SEP + 'px';
          c30.style.setProperty('--cota-h', CJT_SEP + 'px');
          var s30 = document.createElement('span');
          s30.className = 'cota-mi-val cota-val-horiz';
          s30.textContent = (CJT_SEP * PX_TO_MM).toFixed(1);
          s30.title = 'CP-B3';
          c30.appendChild(s30);
          marco.appendChild(c30);
        }
        badgeTop = pulCy + 2 * CJT_SEP + CJT_D / 2 + CJT_ROT_GAP;
      } else if (_tipoP === 'columnas') {



        var _cols = (typeof _PULS_COLUMNAS !== 'undefined') ? _PULS_COLUMNAS : [];
        var _rotsCol = [];
        _cols.forEach(function(c) {
          c.forEach(function(e) { _rotsCol.push(e.rotulo); });
        });
        var _fontCol = _fontRotuloGrupo(_rotsCol, CJT_ROT_W, 42);
        _cols.forEach(function(col, ci) {
          var cx = pxx + (ci === 0 ? -COL_SEP / 2 : COL_SEP / 2);
          col.forEach(function(el, ei) {
            var cyc = pulCy + ei * CJT_SEP;
            var rotc = document.createElement('div');
            rotc.className = 'puerta-pulsador puerta-rotulo';
            rotc.style.cssText = 'position:absolute;left:' + (cx - CJT_ROT_W / 2) + 'px;top:' +
              (cyc - CJT_D / 2 - CJT_ROT_GAP - CJT_ROT_H) + 'px;width:' + CJT_ROT_W + 'px;' +
              'height:' + CJT_ROT_H + 'px;font-size:' + _fontCol + 'px;z-index:22;';
            rotc.textContent = el.rotulo;
            marco.appendChild(rotc);
            var _dc = el.d || CJT_D;
            var fondoc = document.createElement('div');
            fondoc.className = 'puerta-pulsador';
            fondoc.style.cssText = 'position:absolute;left:' + (cx - _dc / 2) + 'px;top:' +
              (cyc - _dc / 2) + 'px;width:' + _dc + 'px;height:' + _dc + 'px;' +
              'border-radius:50%;background:' + el.fondo + ';z-index:20;pointer-events:none;';
            marco.appendChild(fondoc);
            var imc = document.createElement('img');
            imc.src = 'assets/Aparamenta/' + el.svg;
            imc.className = 'puerta-pulsador';
            imc.style.cssText = 'position:absolute;left:' + (cx - _dc / 2) + 'px;top:' +
              (cyc - _dc / 2) + 'px;width:' + _dc + 'px;height:' + _dc + 'px;' +
              'z-index:21;pointer-events:none;';
            marco.appendChild(imc);
          });
        });
        grpTop = pulCy - CJT_D / 2 - CJT_ROT_GAP - CJT_ROT_H;
        badgeTop = pulCy + CJT_SEP + CJT_D / 2 + CJT_ROT_GAP;
      } else {
        var pimg = document.createElement('img');
        pimg.src = 'assets/Aparamenta/Pulsador_doble_marcha_parada_piloto-vf.svg';
        pimg.className = 'puerta-pulsador';
        pimg.style.cssText = 'position:absolute;left:' + (pxx - PUL_W / 2) + 'px;top:' +
          (pulCy - PUL_H / 2) + 'px;width:' + PUL_W + 'px;height:' + PUL_H + 'px;' +
          'z-index:20;pointer-events:none;';
        marco.appendChild(pimg);
        grpTop = pulCy - PUL_H / 2;
        badgeTop = pulCy + PUL_H / 2 + CJT_ROT_GAP;
      }


      if (typeof _pulsadorSelectorOn === 'function' &&
          _pulsadorSelectorOn(_pulsList[pki])) {
        var _selTop = badgeTop;                                        
        var simg = document.createElement('img');
        simg.src = 'assets/Aparamenta/Selector-vf.svg';
        simg.className = 'puerta-pulsador';
        simg.style.cssText = 'position:absolute;left:' + (pxx - SEL_D / 2) + 'px;top:' +
          _selTop + 'px;width:' + SEL_D + 'px;height:' + SEL_D + 'px;' +
          'z-index:20;pointer-events:none;';
        marco.appendChild(simg);
        var _txtLey = (typeof _pulsadorLeyendaTexto === 'function')
          ? _pulsadorLeyendaTexto(_pulsList[pki]) : '1 - 0 - 2';
        var _leyTop = _selTop + SEL_D + CJT_ROT_GAP;
        var ley = document.createElement('div');
        ley.className = 'puerta-pulsador puerta-rotulo';
        ley.style.cssText = 'position:absolute;left:' + (pxx - CJT_ROT_W / 2) + 'px;top:' +
          _leyTop + 'px;width:' + CJT_ROT_W + 'px;height:' + CJT_ROT_H + 'px;' +
          'font-size:' + _fontRotuloFit(_txtLey, CJT_ROT_W, 42) + 'px;z-index:22;';
        ley.textContent = _txtLey;
        marco.appendChild(ley);
        badgeTop = _leyTop + CJT_ROT_H + CJT_ROT_GAP;
      }



      var _txtK = _rotuloK(_pulsList[pki].rotulo);
      var pbadge = document.createElement('div');
      pbadge.className = 'puerta-pulsador puerta-rotulo';
      pbadge.style.cssText = 'position:absolute;left:' + (pxx - CJT_ROT_W / 2) + 'px;top:' +
        badgeTop + 'px;width:' + CJT_ROT_W + 'px;height:' + CJT_ROT_H + 'px;' +
        'font-size:' + _fontRotuloFit(_txtK, CJT_ROT_W, 42) + 'px;z-index:22;';
      pbadge.textContent = _txtK;
      marco.appendChild(pbadge);



      var grpBot = badgeTop + CJT_ROT_H;
      var _wGrp = _pulsAncho(_pulsList[pki]);
      _ocupadoPuerta.push({ top: grpTop, bot: grpBot,
                            left: pxx - _wGrp / 2, right: pxx + _wGrp / 2 });
      var aura = document.createElement('div');
      aura.className = 'puerta-pulsador puerta-puls-aura';
      aura.dataset.pulsadorItmId = _pulsList[pki].id;
      aura.style.cssText = 'left:' + (pxx - _wGrp / 2 - 14) + 'px;top:' +
        (grpTop - 14) + 'px;width:' + (_wGrp + 28) + 'px;height:' +
        (grpBot - grpTop + 28) + 'px;z-index:19;';
      marco.appendChild(aura);


      var triW_p = 45;
      var triP = document.createElement('img');
      triP.src = 'assets/panel-busbar/boton_trian_verde.svg';
      triP.className = 'puerta-pulsador puerta-puls-tri';
      triP.dataset.pulsadorItmId = _pulsList[pki].id;
      triP.style.cssText = 'position:absolute;left:' + (pxx - triW_p / 2) + 'px;top:' +



        (grpBot + 22 - (CJT_ROT_W / 2 - triW_p / 2)) + 'px;' +
        'width:' + triW_p + 'px;height:' + CJT_ROT_W + 'px;' +
        'transform:rotate(-90deg);z-index:23;cursor:pointer;pointer-events:auto;';
      triP.addEventListener('mouseenter', function() { aura.style.display = 'block'; });
      triP.addEventListener('mouseleave', function() { aura.style.display = 'none'; });
      triP.addEventListener('click', function(e) {
        e.stopPropagation();
        if (typeof onPulsadorTriangleClick === 'function') onPulsadorTriangleClick(this);
      });
      marco.appendChild(triP);
    });




    CP_LANE_PUL = _nuevoCarril();
    var _f0Ult = _filasP[0][_filasP[0].length - 1];
    _refCota(CP_LANE_PUL, pxs[_f0Ult] + _pulsAncho(_pulsList[_f0Ult]) / 2, pulCy);
    var cpb = document.createElement('div');
    cpb.className = 'cota-mi cota-mi-v cota-cp';
    cpb.style.left = (CP_LANE_PUL - 10) + 'px';
    cpb.style.top = '0px';
    cpb.style.height = pulCy + 'px';
    cpb.style.setProperty('--cota-h', pulCy + 'px');
    var cpbSpan = document.createElement('span');
    cpbSpan.className = 'cota-mi-val cota-val-horiz cota-editable';
    cpbSpan.textContent = pulTopMm.toFixed(1);
    cpbSpan.title = 'CP-B — click para editar';
    cpbSpan.style.pointerEvents = 'auto';
    cpbSpan.addEventListener('click', function(e) {
      e.stopPropagation();

      _puertaCotaEditar(cpbSpan, 'CP-B', 40,
        Math.max(40, Math.floor((gabH - _pulsExtFila(_filasP[0]).abajo) * PX_TO_MM)), function(mm) {
        window._PULSADORES_TOP_MM = mm;
      });
    });
    cpb.appendChild(cpbSpan);
    marco.appendChild(cpb);


    _filasP.forEach(function(fila, fi) {
      for (var pj = 0; pj < fila.length - 1; pj++) {
        var a = fila[pj], b = fila[pj + 1];
        var c80b = document.createElement('div');
        c80b.className = 'cota-mi cota-mi-h cota-cp';
        c80b.style.left = pxs[a] + 'px';
        c80b.style.top = (_filaCy[fi] - 10) + 'px';
        c80b.style.width = (pxs[b] - pxs[a]) + 'px';
        c80b.style.setProperty('--cota-w', (pxs[b] - pxs[a]) + 'px');
        var s80b = document.createElement('span');
        s80b.className = 'cota-mi-val';


        s80b.textContent = ((pxs[b] - pxs[a]) * PX_TO_MM).toFixed(1);
        s80b.title = 'CP-B2';
        c80b.appendChild(s80b);
        marco.appendChild(c80b);
      }
    });


    for (var fk = 0; fk < _filasP.length - 1; fk++) {
      var cGap = document.createElement('div');
      cGap.className = 'cota-mi cota-mi-v cota-cp';
      cGap.style.left = (pcx0 - 10) + 'px';
      cGap.style.top = _filaBot[fk] + 'px';
      cGap.style.height = PUL_FILA_GAP + 'px';
      cGap.style.setProperty('--cota-h', PUL_FILA_GAP + 'px');
      var sGap = document.createElement('span');
      sGap.className = 'cota-mi-val cota-val-horiz';
      sGap.textContent = (PUL_FILA_GAP * PX_TO_MM).toFixed(1);
      sGap.title = 'CP-B4';
      cGap.appendChild(sGap);
      marco.appendChild(cGap);
    }










    window._PULSADORES_LAT = _filasP.map(function(fila, fi) {
      var piezas = [], vistos = {};
      function _agregarPieza(cy, kind, color) {



        var k = Math.round(cy) + '|' + kind;
        if (vistos[k]) return;                                                
        vistos[k] = 1;
        piezas.push({ cy: cy, kind: kind, color: color || null });
      }
      fila.forEach(function(idx) {
        var p = _pulsList[idx];
        var tipo = (typeof _pulsadorTipo === 'function') ? _pulsadorTipo(p) : 'doble';
        var abajo;                                                               
        if (typeof _pulsadorBotoneraOn === 'function' && !_pulsadorBotoneraOn(p)) {

          abajo = _filaCy[fi] - SEL_D / 2 - CJT_ROT_GAP;
        } else if (tipo === 'columnas') {

          _agregarPieza(_filaCy[fi], 'piloto', _LED_HEX.verde);
          _agregarPieza(_filaCy[fi] + CJT_SEP, 'verde', _LED_HEX.verde);
          abajo = _filaCy[fi] + CJT_SEP + CJT_D / 2;
        } else if (tipo === 'conjunto') {
          var pp = p.pulsador || {};
          var led = (pp.ledColor === 'rojo') ? _LED_HEX.rojo : _LED_HEX.verde;
          var ord = (pp.orden && pp.orden.length === 3) ? pp.orden : ['piloto', 'verde', 'rojo'];
          ord.forEach(function(k, ei) {
            _agregarPieza(_filaCy[fi] + ei * CJT_SEP, k,
                          (k === 'piloto') ? led : (k === 'rojo') ? _LED_HEX.rojo : _LED_HEX.verde);
          });
          abajo = _filaCy[fi] + 2 * CJT_SEP + CJT_D / 2;
        } else {
          _agregarPieza(_filaCy[fi], 'doble');
          abajo = _filaCy[fi] + PUL_H / 2;
        }

        if (typeof _pulsadorSelectorOn === 'function' && _pulsadorSelectorOn(p)) {
          _agregarPieza(abajo + CJT_ROT_GAP + SEL_D / 2, 'selector');
        }
      });
      return { cy: _filaCy[fi], piezas: piezas };
    });
  } else {
    window._PULSADORES_LAT = [];
  }






  var REJ_LADO = ((typeof _REJILLA_LADO_MM === 'number') ? _REJILLA_LADO_MM : 150) / PX_TO_MM;
  window._REJILLA_PUERTA = null;
  var REJ_GAP  = 100;                                                
  var _senBotEf = null;                                                    

  if (sen && plan.senaletica.visible) {
    function _colocarSen() {
      var x = (gabW - _senW) / 2;
      var def = (gabH - _senH) / 2;                                    



      if (window._REJILLA && typeof window._REJILLA_TOP_MM !== 'number') {
        var _insS = (window._gabineteData && window._gabineteData.tipo === 'empotrado') ? 125 : 0;
        def = Math.max(0, Math.min(def, gabH - _insS - REJ_LADO - REJ_GAP - _senH));
      }
      var t = (typeof window._SENALETICA_TOP_MM === 'number')
        ? (window._SENALETICA_TOP_MM / PX_TO_MM) : def;
      return { x: x, top: _bajarHastaDespejar(t, _senH, x, _senW, _ocupadoPuerta) };
    }
    var _posSen = _colocarSen();




    if (window._REJILLA && typeof window._REJILLA_TOP_MM !== 'number' && _senH > 750 &&
        (_posSen.top + _senH + REJ_GAP + REJ_LADO) > gabH) {
      _senW = 500; _senH = 750;
      sen.style.width = _senW + 'px';
      sen.style.height = _senH + 'px';
      _posSen = _colocarSen();
    }
    var senX = _posSen.x;
    var senTop = _posSen.top;
    _senBotEf = senTop + _senH;

    sen.style.left = senX + 'px';
    sen.style.top = senTop + 'px';
    sen.style.transform = 'none';

    _ocupadoPuerta.push({ top: senTop, bot: senTop + _senH, left: senX, right: senX + _senW });


    if (senTop > 0) {
      var cps = document.createElement('div');
      cps.className = 'cota-mi cota-mi-v cota-cp';
      CP_LANE_SEN = _nuevoCarril();
      _refCota(CP_LANE_SEN, senX + _senW, senTop);                         
      cps.style.left = (CP_LANE_SEN - 10) + 'px';
      cps.style.top = '0px';
      cps.style.height = senTop + 'px';
      cps.style.setProperty('--cota-h', senTop + 'px');
      var cpsSpan = document.createElement('span');
      cpsSpan.className = 'cota-mi-val cota-val-horiz cota-editable';
      cpsSpan.textContent = (senTop * PX_TO_MM).toFixed(1);
      cpsSpan.title = 'CP-S — click para editar';
      cpsSpan.style.pointerEvents = 'auto';
      cpsSpan.addEventListener('click', function(e) {
        e.stopPropagation();
        _puertaCotaEditar(cpsSpan, 'CP-S', 0, Math.max(0, Math.floor((gabH - _senH) * PX_TO_MM)), function(mm) {
          window._SENALETICA_TOP_MM = mm;
        });
      });
      cps.appendChild(cpsSpan);
      marco.appendChild(cps);
    }
  }


  if (typeof posicionarCotasGabinete === 'function') posicionarCotasGabinete();
  if (typeof actualizarCotasEscala === 'function') actualizarCotasEscala();






  var rej = document.getElementById('rejilla_puerta');
  if (rej) {
    if (!window._REJILLA) {
      rej.style.display = 'none';
    } else {
      rej.style.display = 'block';
      var rejX = (gabW - REJ_LADO) / 2;
      var _rejDef = (_senBotEf !== null) ? (_senBotEf + REJ_GAP)
                                         : (gabH - REJ_LADO) / 2;
      var rejTop = (typeof window._REJILLA_TOP_MM === 'number')
        ? (window._REJILLA_TOP_MM / PX_TO_MM) : _rejDef;
      rejTop = _bajarHastaDespejar(rejTop, REJ_LADO, rejX, REJ_LADO, _ocupadoPuerta);


      var _insetR = (window._gabineteData && window._gabineteData.tipo === 'empotrado') ? 125 : 0;
      var _rejMax = gabH - _insetR - REJ_LADO;
      if (rejTop > _rejMax) {


        var _choca = function(t) {
          return _ocupadoPuerta.some(function(o) {
            return t < o.bot && t + REJ_LADO > o.top && rejX < o.right && rejX + REJ_LADO > o.left;
          });
        };
        var _t = Math.max(_insetR, _rejMax);
        while (_t > _insetR && _choca(_t)) _t -= 250;
        rejTop = Math.max(_insetR, _choca(_t) ? _rejMax : _t);
      }
      rej.style.left = rejX + 'px';
      rej.style.top = rejTop + 'px';
      rej.style.width = REJ_LADO + 'px';
      rej.style.height = REJ_LADO + 'px';
      rej.style.zIndex = '21';
      _ocupadoPuerta.push({ top: rejTop, bot: rejTop + REJ_LADO,
                            left: rejX, right: rejX + REJ_LADO });


      window._REJILLA_PUERTA = { top: rejTop, lado: REJ_LADO };


      var auraRej = document.createElement('div');
      auraRej.className = 'puerta-pulsador equipo-aura';
      auraRej.style.cssText = 'position:absolute;left:' + (rejX - 10) + 'px;top:' +
        (rejTop - 10) + 'px;width:' + (REJ_LADO + 20) + 'px;height:' +
        (REJ_LADO + 20) + 'px;display:none;z-index:22;pointer-events:none;' +
        'border:3px solid #27ae60;border-radius:6px;';
      marco.appendChild(auraRej);

      var _triWrej = 45, _triHrej = 150;                                                           
      var triRej = document.createElement('img');
      triRej.src = 'assets/panel-busbar/boton_trian_verde.svg';
      triRej.className = 'puerta-pulsador puerta-puls-tri';
      triRej.style.cssText = 'position:absolute;left:' + (rejX + REJ_LADO / 2 - _triWrej / 2) +
        'px;top:' + (rejTop + REJ_LADO + 22 - (_triHrej / 2 - _triWrej / 2)) + 'px;' +
        'width:' + _triWrej + 'px;height:' + _triHrej + 'px;' +
        'transform:rotate(-90deg);z-index:23;cursor:pointer;pointer-events:auto;';
      triRej.addEventListener('mouseenter', function() { auraRej.style.display = 'block'; });
      triRej.addEventListener('mouseleave', function() { auraRej.style.display = 'none'; });
      triRej.addEventListener('click', function(e) {
        e.stopPropagation();
        if (typeof onRejillaTriangleClick === 'function') onRejillaTriangleClick(this);
      });
      marco.appendChild(triRej);


      if (rejTop > 0) {
        var CP_LANE_REJ = _nuevoCarril();
        _refCota(CP_LANE_REJ, rejX + REJ_LADO, rejTop);                         
        var cpv = document.createElement('div');
        cpv.className = 'cota-mi cota-mi-v cota-cp';
        cpv.style.left = (CP_LANE_REJ - 10) + 'px';
        cpv.style.top = '0px';
        cpv.style.height = rejTop + 'px';
        cpv.style.setProperty('--cota-h', rejTop + 'px');
        var cpvSpan = document.createElement('span');
        cpvSpan.className = 'cota-mi-val cota-val-horiz cota-editable';
        cpvSpan.textContent = (rejTop * PX_TO_MM).toFixed(1);
        cpvSpan.title = 'CP-V — click para editar';
        cpvSpan.style.pointerEvents = 'auto';
        cpvSpan.addEventListener('click', function(e) {
          e.stopPropagation();
          _puertaCotaEditar(cpvSpan, 'CP-V', 0, Math.max(0, Math.floor((gabH - REJ_LADO) * PX_TO_MM)), function(mm) {
            window._REJILLA_TOP_MM = mm;
          });
        });
        cpv.appendChild(cpvSpan);
        marco.appendChild(cpv);
      }
    }
  }

}






function _fontRotuloFit(txt, anchoPx, maxFont) {
  var cv = _fontRotuloFit._cv ||
    (_fontRotuloFit._cv = document.createElement('canvas'));
  var ctx = cv.getContext('2d');
  ctx.font = "700 100px 'Segoe UI', Arial, sans-serif";
  var wAt100 = ctx.measureText(txt || '').width;
  if (!wAt100 || !anchoPx) return maxFont;
  var fit = Math.floor(100 * (anchoPx * 0.92) / wAt100);                     
  return Math.max(8, Math.min(maxFont, fit));
}



function _fontRotuloGrupo(textos, anchoPx, maxFont) {
  var f = maxFont;
  (textos || []).forEach(function(t) {
    f = Math.min(f, _fontRotuloFit(t, anchoPx, maxFont));
  });
  return f;
}



function _puertaRotuloEditar(span) {
  _puertaCotaEditar(span, 'CP-R', 20, 300, function(mm) {
    window._PUERTA_ROTULO_TOP_MM = mm;
  });
}



function _puertaCotaEditar(span, code, MIN, MAX, aplicar) {



  if (!document.body.classList.contains('cp-edit-mode')) return;
  if (document.getElementById('_cv_edit_input')) return;
  var rect = span.getBoundingClientRect();

  var input = document.createElement('input');
  input.id = '_cv_edit_input';
  input.type = 'text';

  input.setAttribute('inputmode', 'decimal');
  input.value = parseFloat(span.textContent) || '';
  input.className = 'cv-edit-input';
  input.style.left = (rect.left + rect.width / 2 - 40) + 'px';
  input.style.top = (rect.top + rect.height / 2 - 13) + 'px';

  var badge = document.createElement('div');
  badge.id = '_cv_edit_badge';
  badge.className = 'cv-edit-badge';
  badge.textContent = code + '  ·  ' + MIN + ' – ' + MAX + ' mm';
  badge.style.left = (rect.left + rect.width / 2) + 'px';
  badge.style.top = (rect.top - 8) + 'px';

  document.body.appendChild(badge);
  document.body.appendChild(input);
  input.focus();
  input.select();

  var done = false;
  function cerrar() {
    if (done) return;
    done = true;
    input.remove();
    badge.remove();
  }
  function commit() {
    if (done) return;
    var mm = parseFloat(input.value);
    cerrar();
    if (isNaN(mm)) return;
    mm = Math.max(MIN, Math.min(MAX, mm));
    aplicar(mm);
    aplicarVista('frontal_puerta');
    if (typeof guardarSesion === 'function') guardarSesion();
  }
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') cerrar();
  });
  input.addEventListener('blur', function() { commit(); });
}


function _dibujarLineasBisagra(cont, step) {
  cont.querySelectorAll('.marco-emp-linea').forEach(function(el) { el.remove(); });

  var h = cont.clientHeight || (parseFloat(getComputedStyle(cont).height) || 0);
  if (h <= 0) return;
  var center = h / 2;
  step = (typeof step === 'number' && step > 0) ? step : 75;
  function linea(y) {
    var l = document.createElement('div');
    l.className = 'marco-emp-linea';
    l.style.cssText = 'position:absolute;left:-2px;right:-2px;top:' + y +
      'px;height:2px;background:#000;transform:translateY(-50%);pointer-events:none;';
    cont.appendChild(l);
  }
  linea(center);
  for (var yUp = center - step; yUp > 0; yUp -= step) linea(yUp);
  for (var yDn = center + step; yDn < h; yDn += step) linea(yDn);
}


function _aplicarVistaLateral() {
  var marco = document.getElementById('marco_gabinete');
  var dims = window._vistaFrontalDims || {
    w: parseFloat(marco.style.width) || 750,
    h: parseFloat(marco.style.height) || 750
  };








  if ((window._itmList || []).some(function(i) { return i.pulsador; }) ||
      window._MEDIDOR || window._REJILLA || (window._PILOTOS_LEDS || 0) > 0) {
    marco.style.width = dims.w + 'px';
    marco.style.height = dims.h + 'px';
    _aplicarVistaPuerta();
    _limpiarOverlaysVistas();
  }

  var plan = buildLateralPlan({
    gabineteData: window._gabineteData,
    gabHmm: dims.h * PX_TO_MM
  });


  marco.style.width = plan.marco.latWpx + 'px';
  marco.style.height = plan.marco.latHpx + 'px';

  var latW = plan.marco.latWpx;
  var latH = plan.marco.latHpx;

  function _rect(r, fill, z) {
    var el = document.createElement('div');
    el.className = 'vista-lat-overlay';
    el.style.cssText = 'position:absolute;pointer-events:none;' +
      'left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px;' +
      'z-index:' + (z || 16) + ';';
    if (fill) el.style.background = fill;
    marco.appendChild(el);
    return el;
  }


  if (plan.puertaAdosado && plan.puertaAdosado.visible) {
    var pa = plan.puertaAdosado;
    var el = _rect(pa, pa.fill, 16);
    el.style.border = '2px solid #000';
    el.style.boxSizing = 'border-box';
  }


  if (plan.puertaEmpotrado && plan.puertaEmpotrado.visible) {
    var pe = plan.puertaEmpotrado;
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'vista-lat-overlay');
    svg.setAttribute('width', pe.svg.w);
    svg.setAttribute('height', pe.svg.h);
    svg.style.cssText = 'position:absolute;left:' + pe.svg.x + 'px;top:' + pe.svg.y +
      'px;z-index:16;pointer-events:none;overflow:visible;';
    var fill = document.createElementNS(ns, 'path');
    fill.setAttribute('d', pe.svg.fillPath);
    fill.setAttribute('fill', pe.svg.fillColor);
    fill.setAttribute('stroke', 'none');
    svg.appendChild(fill);
    pe.svg.arcs.forEach(function(a) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', a.d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', '#000');
      p.setAttribute('stroke-width', '2');
      svg.appendChild(p);
    });
    marco.appendChild(svg);

    _rect(pe.linea1, '#000', 17);
    _rect(pe.capTop, '#000', 17);
    _rect(pe.capBot, '#000', 17);
    _rect(pe.linea2, '#000', 17);
    _rect(pe.linea3, '#000', 17);
  }





  var planP = buildPuertaPlan({
    gabineteData: window._gabineteData,
    gabWmm: dims.w * PX_TO_MM,
    gabHmm: dims.h * PX_TO_MM,


    chapaXmm:  window._PUERTA_CHAPA_X_MM,
    chapaYmm:  window._PUERTA_CHAPA_Y_MM,
    chapaY2mm: window._PUERTA_CHAPA_Y2_MM
  });
  if (planP && planP.chapaNominal) {
    var nom = planP.chapaNominal;
    var esPush = nom.tipo === 'push';
    var svgSrc = esPush ? 'assets/cerraduras/chapa_push-vl.svg'
                        : 'assets/cerraduras/chapa_hermetica_circular-vl.svg';
    var chW = esPush ? 22 : 27.5;
    var chH = esPush ? 415 : 139;
    var xLat = latW + 75;                                      
    function _chapaLat(yNomPx) {
      var img = document.createElement('img');
      img.src = svgSrc;
      img.className = 'vista-lat-overlay';
      img.style.cssText = 'position:absolute;left:' + xLat + 'px;' +
        'top:' + (yNomPx - chH / 2) + 'px;width:' + chW + 'px;height:' + chH + 'px;' +
        'z-index:16;pointer-events:none;';
      marco.appendChild(img);
    }
    _chapaLat(nom.yPx);
    if (nom.cant >= 2 && nom.y2Px !== null) _chapaLat(nom.y2Px);
  }





  var _XLAT = latW + 75;                                                 
  var _NS_LAT = 'http://www.w3.org/2000/svg';


  function _pilotoLateral(cy, color) {
    var W = 48.9, H = 133.7;                             
    var pos = 'position:absolute;left:' + _XLAT + 'px;top:' + (cy - H / 2) +
      'px;width:' + W + 'px;height:' + H + 'px;pointer-events:none;';
    var fsvg = document.createElementNS(_NS_LAT, 'svg');
    fsvg.setAttribute('viewBox', '690 243 258.5 706');
    fsvg.setAttribute('class', 'vista-lat-overlay');
    fsvg.style.cssText = pos + 'z-index:15;';
    var r = document.createElementNS(_NS_LAT, 'rect');
    r.setAttribute('x', '697.36'); r.setAttribute('y', '249.92');
    r.setAttribute('width', '184.08'); r.setAttribute('height', '691.92');
    r.setAttribute('fill', color);
    fsvg.appendChild(r);
    var e = document.createElementNS(_NS_LAT, 'ellipse');
    e.setAttribute('cx', '881.44'); e.setAttribute('cy', '596');
    e.setAttribute('rx', '60.5'); e.setAttribute('ry', '330.24');
    e.setAttribute('fill', color);
    fsvg.appendChild(e);
    marco.appendChild(fsvg);
    var im = document.createElement('img');
    im.src = 'assets/Aparamenta/Piloto-vl.svg';
    im.className = 'vista-lat-overlay';
    im.style.cssText = pos + 'z-index:16;';
    marco.appendChild(im);
  }




  function _rasanteLateral(cy, color) {
    var W = 40.3, H = 142.5;                             
    var top = cy - H / 2;
    var cara = document.createElement('div');
    cara.className = 'vista-lat-overlay';
    cara.style.cssText = 'position:absolute;pointer-events:none;z-index:15;' +
      'left:' + (_XLAT + W * 0.9199) + 'px;top:' + (top + H * 0.0667) + 'px;' +
      'width:' + (W * 0.08) + 'px;height:' + (H * 0.8667) + 'px;' +
      'background:' + color + ';border-radius:0 45% 45% 0;';
    marco.appendChild(cara);
    var im = document.createElement('img');
    im.src = 'assets/Aparamenta/Pulsador-vl.svg';
    im.className = 'vista-lat-overlay';
    im.style.cssText = 'position:absolute;left:' + _XLAT + 'px;top:' + top + 'px;' +
      'width:' + W + 'px;height:' + H + 'px;z-index:16;pointer-events:none;';
    marco.appendChild(im);
  }


  function _dobleLateral(cy) {
    var W = 62, H = 250;                                
    var im = document.createElement('img');
    im.src = 'assets/Aparamenta/Pulsador_doble_marcha_parada_piloto-vl.svg';
    im.className = 'vista-lat-overlay';
    im.style.cssText = 'position:absolute;left:' + _XLAT + 'px;top:' + (cy - H / 2) +
      'px;width:' + W + 'px;height:' + H + 'px;z-index:16;pointer-events:none;';
    marco.appendChild(im);
  }




  function _selectorLateral(cy) {
    var W = 122, H = 150;                               
    var im = document.createElement('img');
    im.src = 'assets/Aparamenta/Selector-vl.svg';
    im.className = 'vista-lat-overlay';
    im.style.cssText = 'position:absolute;left:' + _XLAT + 'px;top:' + (cy - H / 2) +
      'px;width:' + W + 'px;height:' + H + 'px;z-index:16;pointer-events:none;';
    marco.appendChild(im);
  }



  if ((window._PILOTOS_LEDS || 0) > 0) {


    var _pilCyL = (window._PILOTOS_PUERTA && window._PILOTOS_PUERTA.cy) ||
      ((typeof window._PILOTOS_TOP_MM === 'number' ? window._PILOTOS_TOP_MM : 150) / PX_TO_MM);
    _pilotoLateral(_pilCyL, _LED_HEX[window._PILOTOS_COLOR] || _LED_HEX.verde);
  }






  if (window._MEDIDOR && window._ANALIZADOR_PUERTA) {
    var _anaH = window._ANALIZADOR_PUERTA.h, _anaCy = window._ANALIZADOR_PUERTA.cy;
    var _anaW = 18.32 / PX_TO_MM;
    var imA = document.createElement('img');
    imA.src = 'assets/Aparamenta/Analizador_de_red-vl.svg';
    imA.className = 'vista-lat-overlay';
    imA.style.cssText = 'position:absolute;left:' + _XLAT + 'px;top:' +
      (_anaCy - _anaH / 2) + 'px;width:' + _anaW + 'px;height:' + _anaH + 'px;' +
      'z-index:16;pointer-events:none;';
    marco.appendChild(imA);
  }




  if (window._REJILLA && window._REJILLA_PUERTA) {
    var _rejLado = window._REJILLA_PUERTA.lado;
    var _rejFondo = 10 / PX_TO_MM;                         
    var imR = document.getElementById('rejilla_lateral');
    if (imR) {
      imR.style.display = 'block';
      imR.style.left = _XLAT + 'px';
      imR.style.top = window._REJILLA_PUERTA.top + 'px';
      imR.style.width = _rejFondo + 'px';
      imR.style.height = _rejLado + 'px';
      imR.style.zIndex = '16';
      imR.style.pointerEvents = 'none';
    }
  }




  (window._PULSADORES_LAT || []).forEach(function(f) {
    (f.piezas || []).forEach(function(p) {
      if (p.kind === 'doble')         _dobleLateral(p.cy);
      else if (p.kind === 'selector') _selectorLateral(p.cy);
      else if (p.kind === 'piloto')   _pilotoLateral(p.cy, p.color || _LED_HEX.verde);
      else                            _rasanteLateral(p.cy, p.color || _LED_HEX.verde);
    });
  });


  if (typeof posicionarCotasGabinete === 'function') posicionarCotasGabinete();
  if (typeof actualizarCotasEscala === 'function') actualizarCotasEscala();
}
