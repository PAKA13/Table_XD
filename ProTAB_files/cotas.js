





















var _CV_RANGOS = {
  'CV-01':    { min: 30, max: 500 },
  'CV-IG-01': { min: 50, max: 350 },
  'CB-IG-02': { min: 30, max: 200 },                                                           
  'CV-04':    { min: 20, max: 500 },
  'CV-05':    { min: 20, max: 500 },
  'CV-08':    { min: 20, max: 200 },
  'CV-09':    { min: 30, max: 500 },
  'CV-11':    { min: 15, max: 100 },
  'CV-12':    { min: 15, max: 100 },
  'CV-13':    { min: 20, max: 300 },
  'CV-14':    { min: 20, max: 300 },
  'CV-15':    { min: 20, max: 300 },
  'CV-15b':   { min: 15, max: 100 },
  'CV-16':    { min: 15, max: 100 },
  'CV-22':    { min: 10, max: 200 },                                                  
  'CV-28':    { min: 10, max: 300 },                                         



  'CV-29':    { min: 20, max: 500 },                                         
  'CV-23':    { min: 20, max: 300 },                                            
  'CV-24':    { min: 20, max: 300 },                                       
  'CV-25':    { min: 10, max: 400 },                                                         
  'CV-26':    { min: 10, max: 400 },                                                             
  'CV-27':    { min: 20, max: 300 },                                                 
  'CV-30':    { min: 5,  max: 300 },                                             
  'CV-31':    { min: 10, max: 300 },                                       
  'CV-32':    { min: 20, max: 500 },                                          
  'CV-33':    { min: 20, max: 300 },                                                       
  'CV-34':    { min: 20, max: 1000 },                                                      

  'CR-01':    { min: 10, max: 80 },
  'CR-02':    { min: 8,  max: 50 },
  'CR-03':    { min: 1,  max: 100 },

  'CT-01':    { min: 1,  max: 2000 },
  'CT-02':    { min: 1,  max: 2000 },
  'CT-03':    { min: 1,  max: 2000 },
  'CT-04':    { min: 1,  max: 2000 },
  'CT-05':    { min: 1,  max: 2000 },
  'CT-06':    { min: 1,  max: 2000 },
  'CT-07':    { min: 5,  max: 2000 },
  'CT-08':    { min: 5,  max: 2000 },
  'CT-13':    { min: 5,  max: 500 },
  'CT-14':    { min: 5,  max: 2000 },
  'CT-15':    { min: 5,  max: 2000 },
  'CT-16':    { min: 48, max: 2000 }                           
};








var _CV_CONSTS = [
  ['cvTopMm',       'CV_TOP_PX'],
  ['cvLeftMm',      'CV_LEFT_PX'],
  ['cvRightMm',     'CV_RIGHT_PX'],
  ['gabBotMm',      'GAB_BOT_GAP_PX'],
  ['igGapMm',       'IG_GAP'],
  ['igMarginTopMm', 'IG_MARGIN_TOP'],
  ['barFirstMm',    'BAR_FIRST_GAP_PX'],
  ['barInterMm',    'BAR_INTER_GAP_PX'],
  ['difInfGapMm',   'DIF_INF_GAP'],
  ['difInfInterMm', 'DIF_INF_INTER_GAP'],
  ['difInfNextMm',  'DIF_INF_NEXT_GAP'],
  ['difGabLMm',     'DIF_GAB_GAP_LEFT_PX'],
  ['difGabRMm',     'DIF_GAB_GAP_RIGHT_PX'],
  ['difItmLMm',     'DIF_ITM_GAP_LEFT_PX'],
  ['difItmRMm',     'DIF_ITM_GAP_RIGHT_PX'],
  ['contDifLMm',    'CONT_DIF_GAP_LEFT_PX'],
  ['contDifRMm',    'CONT_DIF_GAP_RIGHT_PX'],
  ['bornIgParedMm', 'BORN_IG_PARED_PX'],
  ['bornContLMm',   'BORN_CONT_GAP_LEFT_PX'],
  ['bornContRMm',   'BORN_CONT_GAP_RIGHT_PX'],
  ['infContMm',     'INF_CONT_GAP_PX']
];
var _CV_DEFAULTS = {};
_CV_CONSTS.forEach(function(k) { _CV_DEFAULTS[k[1]] = window[k[1]]; });


var _CV_GAP_GRUPO_MM = 30;

function _cotasConstantes() {
  var out = {};
  _CV_CONSTS.forEach(function(k) { out[k[0]] = window[k[1]] * PX_TO_MM; });

  out.rotWMm   = (typeof _MANDIL_ROTULO_W_MM !== 'undefined')   ? _MANDIL_ROTULO_W_MM   : 30;
  out.rotHMm   = (typeof _MANDIL_ROTULO_H_MM !== 'undefined')   ? _MANDIL_ROTULO_H_MM   : 15;
  out.rotGapMm = (typeof _MANDIL_ROTULO_GAP_MM !== 'undefined') ? _MANDIL_ROTULO_GAP_MM : 5;
  return out;
}

function _aplicarCotasGuardadas(c) {
  if (!c) return;
  _CV_CONSTS.forEach(function(k) {
    var mm = c[k[0]];
    if (typeof mm === 'number' && !isNaN(mm)) window[k[1]] = mm / PX_TO_MM;
  });
  CV_TOP_INNER = CV_TOP_PX - (PB_INSET_MM / PX_TO_MM);

  if (typeof c.rotWMm === 'number' && !isNaN(c.rotWMm))     _MANDIL_ROTULO_W_MM = c.rotWMm;
  if (typeof c.rotHMm === 'number' && !isNaN(c.rotHMm))     _MANDIL_ROTULO_H_MM = c.rotHMm;
  if (typeof c.rotGapMm === 'number' && !isNaN(c.rotGapMm)) _MANDIL_ROTULO_GAP_MM = c.rotGapMm;
}

function _resetCotasConstantes() {
  _CV_CONSTS.forEach(function(k) { window[k[1]] = _CV_DEFAULTS[k[1]]; });
  CV_TOP_INNER = CV_TOP_PX - (PB_INSET_MM / PX_TO_MM);
  _MANDIL_ROTULO_W_MM = 30; _MANDIL_ROTULO_H_MM = 15; _MANDIL_ROTULO_GAP_MM = 5;
}







function restablecerCotas() {
  _resetCotasConstantes();



  var _dR = window._panelBusbarData;
  if (_dR && _dR.conexionIG && typeof igPlacaPx === 'function') {
    IG_GAP = _CV_DEFAULTS.IG_GAP + igPlacaPx(_dR) - (20 / PX_TO_MM);
    window.IG_GAP = IG_GAP;
  }



  window._BORNERAS_GAP_MM = _CV_GAP_GRUPO_MM;
  window._BARRAS_LADO_MM = {};                                                    
  (window._BORNERAS_GRUPOS || []).forEach(function(g) {
    if (typeof g.gapMm === 'number') g.gapMm = _CV_GAP_GRUPO_MM;
  });
  if (typeof _recalcIgExtraTop === 'function') _recalcIgExtraTop();
  if (typeof dibujarPanelBusbar === 'function') dibujarPanelBusbar();
  if (typeof guardarSesion === 'function') guardarSesion();
  if (typeof _avisoFlotante === 'function') {
    _avisoFlotante('Cotas restablecidas a sus valores por defecto.');
  }
}









function _igGapSigueAlCuadro(altoAnterior, altoNuevo) {
  var da = (altoNuevo || 0) - (altoAnterior || 0);
  if (!da || !window._igData) return;



  IG_GAP = IG_GAP + da / PX_TO_MM;
  _recalcIgExtraTop();
}




function _geoCotas() {
  var d = window._panelBusbarData;
  var marco = document.getElementById('marco_gabinete');
  var container = document.getElementById('panel_busbar_container');
  if (!d || !marco || !container || container.style.display === 'none') return null;

  var usarAis4f = _isAis4fDrawing(d);
  var aisNatH = usarAis4f ? 145 : 140;
  var aisW = usarAis4f ? 715 : 650;
  var contLeft = parseFloat(container.style.left) || 0;
  var contTop = parseFloat(container.style.top) || (PB_INSET_MM / PX_TO_MM);
  var gabW = parseFloat(marco.style.width) || 750;
  var gabH = parseFloat(marco.style.height) || 750;

  var aisY = CV_TOP_INNER + (window._igExtraTop || 0);
  var sets = buildCmSets(window._itmList || [], !!d.invertirNConectores);
  var totalConH = getTotalConH(d.ciclo || [], sets.cmConSet, sets.cmRegConSet);
  var aisInfY = aisY + aisNatH + totalConH;
  var aisInfBottom = aisInfY + aisNatH;


  var igH = null, igY = null;
  if (window._igData) {
    igH = calcularIGH(window._igData.tipo, window._igData.polos, window._igData.corriente);
    igY = aisY - IG_GAP - igH;
  }


  var _layInf = (typeof _layoutInferior === 'function') ? _layoutInferior() : null;
  var hayDifInf = !!_layInf;
  var filaYs = [], filaHs = [], difBlockBottom = null;
  if (hayDifInf) {
    var y0 = aisInfBottom + ((typeof _difInfGapEff === 'function') ? _difInfGapEff() : DIF_INF_GAP);
    for (var f = 0; f < _layInf.filaOffY.length; f++) {
      filaYs.push(y0 + _layInf.filaOffY[f]);
      filaHs.push(_layInf.filaH[f]);
    }
    difBlockBottom = y0 + _layInf.totalH;
  }



  var _Lb = (typeof _barrasLayout === 'function') ? _barrasLayout(d) : null;

  var _ab = function(k) { return !!(_Lb && _Lb.orden.indexOf(k) !== -1); };
  var hayBarraN = _ab('n'), hayPEA = _ab('pea'), hayPE = _ab('pe');
  var BAR_H = (typeof BARRA_H !== 'undefined') ? BARRA_H : 100;
  var barN_Y = hayBarraN ? _Lb.y.n : null, barPEA_Y = hayPEA ? _Lb.y.pea : null,
      barPE_Y = hayPE ? _Lb.y.pe : null;
  var barN_VisTop = null, barN_VisBot = null, barPE_VisTop = null, barPE_VisBot = null;




  (function() {
    var ctr = document.getElementById('panel_busbar_container');
    if (!ctr) return;


    function medir(cls) {
      var cuerpo = null, visTop = null, visBot = null;
      ctr.querySelectorAll('.' + cls).forEach(function(sg) {
        if (sg.closest('.barra-lado-ig')) return;                                     
        var t = parseFloat(sg.style.top), h = parseFloat(sg.style.height) || 0;
        if (isNaN(t)) return;
        var src = sg.getAttribute('src') || '';
        if (src.indexOf('bar_') !== -1 && (cuerpo === null || t < cuerpo)) cuerpo = t;
        if (visTop === null || t < visTop) visTop = t;
        if (visBot === null || t + h > visBot) visBot = t + h;
      });
      return { cuerpo: cuerpo, visTop: visTop, visBot: visBot };
    }
    var n = medir('bar-n-seg'), pea = medir('bar-pea-seg'), pe = medir('bar-pe-seg');
    if (hayBarraN && n.cuerpo !== null) { barN_Y = n.cuerpo; barN_VisTop = n.visTop; barN_VisBot = n.visBot; }
    if (hayPEA && pea.cuerpo !== null) barPEA_Y = pea.cuerpo;
    if (hayPE && pe.cuerpo !== null) { barPE_Y = pe.cuerpo; barPE_VisTop = pe.visTop; barPE_VisBot = pe.visBot; }
  })();



  var _yDe = { n: barN_Y, pea: barPEA_Y, pe: barPE_Y };
  var filasBarras = (_Lb ? _Lb.orden : []).filter(function(k) { return _yDe[k] !== null; })
    .map(function(k) { return { k: k, y: _yDe[k] }; });

  var lastBottom = aisInfBottom;
  if (hayDifInf) lastBottom = difBlockBottom;
  if (filasBarras.length) lastBottom = filasBarras[filasBarras.length - 1].y + BAR_H;

  return {
    d: d, usarAis4f: usarAis4f, aisNatH: aisNatH, aisW: aisW,
    contLeft: contLeft, contTop: contTop, gabW: gabW, gabH: gabH,
    aisY: aisY, aisInfY: aisInfY, aisInfBottom: aisInfBottom,
    igH: igH, igY: igY,
    hayDifInf: hayDifInf, filaYs: filaYs, filaHs: filaHs, difBlockBottom: difBlockBottom,
    hayBarraN: hayBarraN, hayPEA: hayPEA, hayPE: hayPE,
    barN_Y: barN_Y, barPEA_Y: barPEA_Y, barPE_Y: barPE_Y, BAR_H: BAR_H, filasBarras: filasBarras,
    barN_VisTop: barN_VisTop, barN_VisBot: barN_VisBot, barPE_VisTop: barPE_VisTop, barPE_VisBot: barPE_VisBot,
    lastBottom: lastBottom,
    sets: (function() { return buildCmSets(window._itmList || [], !!d.invertirNConectores); })()
  };
}


function _limpiarCotas(marco, clase) {
  marco.querySelectorAll('.' + clase).forEach(function(el) { el.remove(); });
}

function _mmTxt(px) { return (px * PX_TO_MM).toFixed(1); }


function _cotaV(marco, clase, x, y, h, valMm, codigo, apply) {
  var el = document.createElement('div');
  el.className = 'cota-mi cota-mi-v ' + clase;
  el.style.left = (x - 10) + 'px';
  el.style.top = y + 'px';
  el.style.height = h + 'px';
  el.style.setProperty('--cota-h', h + 'px');
  var span = document.createElement('span');
  span.className = 'cota-mi-val cota-val-horiz';
  span.textContent = valMm;
  el.appendChild(span);
  if (apply) _hacerEditable(span, codigo, apply);
  marco.appendChild(el);
  return el;
}


function _cotaH(marco, clase, x, y, w, valMm, codigo, apply) {
  var el = document.createElement('div');
  el.className = 'cota-mi cota-mi-h ' + clase;
  el.style.left = x + 'px';
  el.style.top = (y - 10) + 'px';
  el.style.width = w + 'px';
  el.style.setProperty('--cota-w', w + 'px');
  var span = document.createElement('span');
  span.className = 'cota-mi-val';
  span.textContent = valMm;
  el.appendChild(span);
  if (apply) _hacerEditable(span, codigo, apply);
  marco.appendChild(el);
  return el;
}


function _hacerEditable(span, codigo, apply) {
  span.classList.add('cota-editable');
  span.title = codigo + ' — click para editar';
  span.style.pointerEvents = 'auto';
  span.addEventListener('click', function(e) {
    e.stopPropagation();
    _cvEditarValor(span, codigo, apply);
  });
}





function _quienMandaElAncho(codigo) {
  var d = window._floorLatDebug;
  if (!d) return 'el ancho que piden los equipos del panel';
  var nombres = {
    cm: 'el cuerpo de un ITM caja moldeada',
    igAncho: 'el ancho del interruptor general',
    barras: 'una barra que sobresale de los equipos',
    filaInferior: 'la fila inferior de equipos',
    barraLado: 'la barra de pie junto al IG',
    grupoBarra: 'una tira o cadena sobre una barra',
    grupoIgIzq: 'el grupo al costado izquierdo del IG',
    grupoIgDer: 'el grupo al costado derecho del IG',
    cv0405: 'la cota CV-04/05 (gabinete ↔ ITM)'
  };
  nombres.columnaLateral = 'la columna lateral de equipos';
  var quien = d._manda || null;
  if (!quien) {
    for (var k in d) {
      if (k.charAt(0) === '_') continue;
      if (d[k] === d._total) { quien = k; break; }
    }
  }
  if (!quien) return 'el ancho que piden los equipos del panel';


  var propio = {
    'CV-29': ['grupoIgIzq', 'grupoIgDer'],
    'CV-13': ['columnaLateral'], 'CV-14': ['columnaLateral'],
    'CV-04': ['cv0405'], 'CV-05': ['cv0405'],
    'CV-32': ['barraLado']
  }[codigo];
  if (propio && propio.indexOf(quien) !== -1) {
    return 'el tamaño del propio conjunto que estás midiendo';
  }
  return nombres[quien] || quien;
}

function _valorCotaActual(codigo, lado) {




  var vs = _valoresCota(codigo);
  for (var i = 0; i < vs.length; i++) {
    if (!lado || vs[i].lado === lado) return vs[i].v;
  }
  return null;
}







































var _CV_LATERALES = ['CV-04', 'CV-05', 'CV-13', 'CV-29', 'CV-32'];
function _cvEsLateral(codigo) { return _CV_LATERALES.indexOf(codigo) !== -1; }

function _cvOtraBajoMinimo(codigo, lado) {
  var otras = _CV_LATERALES;
  for (var i = 0; i < otras.length; i++) {
    var r = _CV_RANGOS[otras[i]];
    var vs = _valoresCota(otras[i]);
    for (var j = 0; j < vs.length; j++) {
      if (otras[i] === codigo && vs[j].lado === lado) continue;                   
      if (r && vs[j].v < r.min - 0.3) return otras[i];
    }
  }
  return null;
}



function _valoresCota(codigo) {
  var out = [], marco = document.getElementById('marco_gabinete');
  if (!marco) return out;
  marco.querySelectorAll(
    '.cota-cv .cota-mi-val, .cota-cv .cota-mi-val-v, ' +
    '.cota-pb .cota-mi-val, .cota-pb .cota-mi-val-v, ' +
    '.cota-cr .cota-mi-val, .cota-cr .cota-mi-val-v').forEach(function(sp) {
    if ((sp.title || '').indexOf(codigo + ' ') !== 0) return;
    var v = parseFloat(sp.textContent);
    if (!isNaN(v)) out.push({ v: v, lado: sp.dataset.cvLado || '' });
  });
  return out;
}


function _quienTopa(codigo, lado) {
  var otras = _CV_LATERALES;
  for (var i = 0; i < otras.length; i++) {
    var r = _CV_RANGOS[otras[i]];
    var vs = _valoresCota(otras[i]);
    for (var j = 0; j < vs.length; j++) {
      if (otras[i] === codigo && vs[j].lado === lado) continue;
      if (r && vs[j].v <= r.min + 0.6) {
        return otras[i] + (vs[j].lado ? ' ' + vs[j].lado : '') +
               ' llegó a su mínimo de ' + r.min + ' mm';
      }
    }
  }
  return _quienMandaElAncho(codigo) + ' pide ese lugar';
}
function _cvForzarCota(codigo, mm, lado) {











  var palancas = { 'CV-29': ['pared', 'lateral', 'difGab'],
                   'CV-13': ['difGab', 'lateral', 'pared'] }[codigo]
                 || ['lateral', 'difGab', 'pared'];
  var foto = _cvFotoConstantes();





  var mejorFoto = foto;
  var _vIni = _valorCotaActual(codigo, lado);
  var mejorDist = (_vIni === null) ? Infinity : Math.abs(_vIni - mm);



  palancas = palancas.concat(palancas);
  for (var p = 0; p < palancas.length; p++) {
    var prev = null;
    for (var k = 0; k < 10; k++) {
      var v = _valorCotaActual(codigo, lado);
      if (v === null) { _cvRestaurarConstantes(foto); _cvRedibujar(); return false; }




      if (Math.abs(v - mm) <= 0.05) return true;
      if (prev !== null && Math.abs(v - prev) < 0.05) break;                      
      prev = v;






      var pasoFoto = _cvFotoConstantes(), d = (v - mm) / PX_TO_MM, ok = false;
      for (var t = 0; t < 7; t++) {
        if (palancas[p] === 'pared') BORN_IG_PARED_PX -= d;
        else if (palancas[p] === 'difGab') {
          DIF_GAB_GAP_LEFT_PX -= d; DIF_GAB_GAP_RIGHT_PX = DIF_GAB_GAP_LEFT_PX;
        }
        else { CV_LEFT_PX -= d; CV_RIGHT_PX = CV_LEFT_PX; }
        _cvRedibujar();
        if (!_cvOtraBajoMinimo(codigo, lado)) { ok = true; break; }
        _cvRestaurarConstantes(pasoFoto);
        d /= 2;
      }
      if (!ok) {                                                      
        _cvRestaurarConstantes(mejorFoto); _cvRedibujar(); return false;
      }
      var _vPaso = _valorCotaActual(codigo, lado);
      if (_vPaso !== null && Math.abs(_vPaso - mm) < mejorDist - 0.05) {
        mejorDist = Math.abs(_vPaso - mm);
        mejorFoto = _cvFotoConstantes();
      }
    }
  }
  var fin = _valorCotaActual(codigo, lado);
  if (fin !== null && Math.abs(fin - mm) <= 0.05) return true;



  _cvRestaurarConstantes(mejorFoto);
  _cvRedibujar();
  return false;
}
function _cvRedibujar() {
  dibujarPanelBusbar();
}






var _CV_CONSTS_LAT = ['CV_LEFT_PX', 'CV_RIGHT_PX', 'BORN_IG_PARED_PX',
  'DIF_GAB_GAP_LEFT_PX', 'DIF_GAB_GAP_RIGHT_PX',
  'DIF_ITM_GAP_LEFT_PX', 'DIF_ITM_GAP_RIGHT_PX'];

function _cvFotoConstantes() {
  var f = { _grupos: [] };
  _CV_CONSTS_LAT.forEach(function(k) { f[k] = window[k]; });
  (window._BORNERAS_GRUPOS || []).forEach(function(g) {
    f._grupos.push({ id: g.id, gapMm: g.gapMm });
  });
  return f;
}

function _cvRestaurarConstantes(f) {
  if (!f) return;
  _CV_CONSTS_LAT.forEach(function(k) { if (k in f) window[k] = f[k]; });
  (f._grupos || []).forEach(function(x) {
    (window._BORNERAS_GRUPOS || []).forEach(function(g) {
      if (g.id === x.id) g.gapMm = x.gapMm;
    });
  });
}




function _cvEditarValor(span, codigo, apply) {

  if (document.getElementById('_cv_edit_input')) return;
  var rect = span.getBoundingClientRect();
  var rango = _CV_RANGOS[codigo] || { min: 5, max: 1000 };




  var input = document.createElement('input');
  input.id = '_cv_edit_input';
  input.type = 'text';

  input.setAttribute('inputmode', 'decimal');








  var _valAlAbrir = parseFloat(span.textContent);
  input.value = parseFloat(span.textContent) || '';
  input.className = 'cv-edit-input';

  var badge = document.createElement('div');
  badge.id = '_cv_edit_badge';
  badge.className = 'cv-edit-badge';










  var _sufLado = span.dataset.cvLado ? (' ' + span.dataset.cvLado) : '';
  badge.textContent = codigo + _sufLado + '  ·  ' +
    rango.min + ' – ' + rango.max + ' mm';





  var _canvasEd = document.querySelector('.canvas');
  function _reubicar() {
    var r = span.getBoundingClientRect();
    input.style.left = (r.left + r.width / 2 - 40) + 'px';
    input.style.top = (r.top + r.height / 2 - 13) + 'px';
    badge.style.left = (r.left + r.width / 2) + 'px';
    badge.style.top = (r.top - 8) + 'px';
    if (_canvasEd) {
      var c = _canvasEd.getBoundingClientRect();
      var dentro = (r.bottom > c.top && r.top < c.bottom &&
                    r.right > c.left && r.left < c.right);
      input.style.visibility = dentro ? '' : 'hidden';
      badge.style.visibility = dentro ? '' : 'hidden';
    }
  }
  _reubicar();

  document.body.appendChild(badge);
  document.body.appendChild(input);
  if (_canvasEd) _canvasEd.addEventListener('scroll', _reubicar);
  window.addEventListener('resize', _reubicar);
  input.focus();
  input.select();

  var done = false;
  function cerrar() {
    if (done) return;
    done = true;
    if (_canvasEd) _canvasEd.removeEventListener('scroll', _reubicar);
    window.removeEventListener('resize', _reubicar);
    input.remove();
    badge.remove();
  }
  function commit() {
    if (done) return;
    var mm = parseFloat(input.value);
    cerrar();
    if (isNaN(mm)) return;
    var _tipeado = mm;
    mm = Math.max(rango.min, Math.min(rango.max, mm));



    if (_tipeado > rango.max && typeof _avisoFlotante === 'function') {
      _avisoFlotante(codigo + ': el máximo es ' + rango.max + ' mm.');
    }

    if (!isNaN(_valAlAbrir) && Math.abs(mm - _valAlAbrir) < 0.05) return;





    var _esMandil = /^C[TR]-/.test(codigo);
    if (!_esMandil && window._autosnapComercial === true) {
      window._autosnapComercial = false;
      if (typeof _avisoFlotante === 'function') {
        _avisoFlotante('Se desactivaron las medidas comerciales: ' +
                       'el valor que acabás de escribir manda.');
      }
    }
    apply(mm);




    if (_esMandil) {

    } else if (window._vistaActual === 'lateral' && typeof aplicarVista === 'function') {
      aplicarVista('lateral');
    } else {
      dibujarPanelBusbar();
    }


    if (_cvEsLateral(codigo)) {
      _cvForzarCota(codigo, mm, span.dataset.cvLado || '');
    }







    if (window._vistaActual === 'frontal_mandil' &&
        typeof _renderMandilOverlays === 'function') {
      _renderMandilOverlays();
    }
    guardarSesion();




    var efectivo = _valorCotaActual(codigo, span.dataset.cvLado || '');
    if (efectivo !== null && Math.abs(efectivo - mm) > 0.25 &&
        typeof _avisoFlotante === 'function') {



      var _esLat = _cvEsLateral(codigo);
      _avisoFlotante(codigo + ': el dibujo no ' +
        (efectivo > mm ? 'baja de ' : 'pasa de ') + efectivo.toFixed(1) +
        ' mm' + (_esLat ? (' — ' + _quienTopa(codigo, span.dataset.cvLado || '')) : '') + '.');
    }
  }
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') cerrar();
  });
  input.addEventListener('blur', function() { commit(); });
}




function _applyProfGab(mm) {
  if (window._gabineteData) window._gabineteData.profGabMm = mm;
}
function _applyProfPuerta(mm) {
  if (window._gabineteData) window._gabineteData.profPuertaMm = mm;
}


function _applyConst(nombre) {
  return function(mm) {
    window[nombre] = mm / PX_TO_MM;
    if (nombre === 'CV_TOP_PX') {
      CV_TOP_INNER = CV_TOP_PX - (PB_INSET_MM / PX_TO_MM);
    }
    if (nombre === 'CV_TOP_PX' || nombre === 'IG_GAP' || nombre === 'IG_MARGIN_TOP') {
      _recalcIgExtraTop();
    }
  };
}






function _applyConstInf(nombre, extraPx) {
  return function(mm) {
    window[nombre] = (mm / PX_TO_MM) + (extraPx || 0);
  };
}

function _applyConstPar(nombreL, nombreR) {

  return function(mm) {
    window[nombreL] = mm / PX_TO_MM;
    window[nombreR] = mm / PX_TO_MM;
  };
}


function posicionarCotasGabinete() {
  var marco = document.getElementById('marco_gabinete');
  if (!marco || marco.style.display === 'none' || !window._gabineteData) return;

  _limpiarCotas(marco, 'cota-gab');
  _limpiarCotas(marco, 'cota-gab-ext');

  var gabW = parseFloat(marco.style.width) || 750;
  var gabH = parseFloat(marco.style.height) || 750;
  var zoom = parseFloat(marco.style.zoom) || 1;
  var pad = 20 / zoom;
  var arrow = 14 / zoom;
  var extLen = pad + 10 + arrow / 2;

  function cotaH(l, t, w, mm, claseExtra, codigo, apply) {
    var el = document.createElement('div');
    el.className = 'cota-mi cota-mi-h cota-flecha cota-gab' +
      (claseExtra ? ' ' + claseExtra : '');
    el.style.left = l + 'px';
    el.style.top = (t - 10) + 'px';
    el.style.width = w + 'px';
    var v = document.createElement('span');
    v.className = 'cota-mi-val';
    v.textContent = mm.toFixed(0);
    el.appendChild(v);
    if (apply) _hacerEditable(v, codigo, apply);
    marco.appendChild(el);
  }
  function cotaV(l, t, h, mm) {
    var el = document.createElement('div');
    el.className = 'cota-mi cota-mi-v cota-flecha cota-gab';
    el.style.left = (l - 10) + 'px';
    el.style.top = t + 'px';
    el.style.height = h + 'px';
    var v = document.createElement('span');
    v.className = 'cota-mi-val-v';
    v.textContent = mm.toFixed(0);
    el.appendChild(v);
    marco.appendChild(el);
  }
  function ext(l, t, w, h) {
    var e = document.createElement('div');
    e.className = 'cota-gab-ext';
    e.style.left = l + 'px';
    e.style.top = t + 'px';
    e.style.width = w + 'px';
    e.style.height = h + 'px';
    marco.appendChild(e);
  }





  if (document.body.classList.contains('vista-lateral-active')) {
    var tipoLat = window._gabineteData.tipo;
    if (tipoLat === 'mural') tipoLat = 'adosado';
    var esAdoLat = (tipoLat === 'adosado');


    var puerMm = esAdoLat
      ? ((typeof window._gabineteData.profPuertaMm === 'number' &&
          window._gabineteData.profPuertaMm > 0) ? window._gabineteData.profPuertaMm : 15)
      : 15;
    var doorW = puerMm / PX_TO_MM;                                         
    var profMm = gabW * PX_TO_MM;               
    var filaSp = 34 / zoom;                                            







    _CV_RANGOS['CM-08a'] = { min: 80, max: 300 - (esAdoLat ? puerMm : 0) };
    _CV_RANGOS['CM-08b'] = { min: 5, max: 30 };

    cotaH(0, gabH + pad, gabW, profMm, null, 'CM-08a', _applyProfGab);
    ext(0, gabH, 1, extLen);
    ext(gabW - 1, gabH, 1, extLen);

    if (esAdoLat) {

      cotaH(gabW, gabH + pad, doorW, puerMm, 'cota-flecha-fuera', 'CM-08b', _applyProfPuerta);
      ext(gabW + doorW - 1, gabH, 1, extLen);
      cotaH(0, gabH + pad + filaSp, gabW + doorW, profMm + puerMm);                 

      ext(0, gabH + pad, 1, filaSp);
      ext(gabW + doorW - 1, gabH + pad, 1, filaSp);
    }

    var altoX = gabW + doorW + pad;
    cotaV(altoX, 0, gabH, gabH * PX_TO_MM);                                     
    ext(gabW + doorW, 0, extLen, 1);
    ext(gabW + doorW, gabH - 1, extLen, 1);
    return;
  }


  cotaH(0, gabH + pad, gabW, gabW * PX_TO_MM);
  cotaV(gabW + pad, 0, gabH, gabH * PX_TO_MM);
  ext(0, gabH, 1, extLen);                             
  ext(gabW - 1, gabH, 1, extLen);                      
  ext(gabW, 0, extLen, 1);                             
  ext(gabW, gabH - 1, extLen, 1);                      
}


function posicionarCotasEqui() {
  var marco = document.getElementById('marco_gabinete');
  if (!marco || marco.style.display === 'none') return;
  _limpiarCotas(marco, 'cota-cv');

  var g = _geoCotas();
  if (!g) return;

  var cx = g.contLeft + g.aisW / 2;
  var ct = g.contTop;






  var _Lb = (typeof _barrasLayout === 'function') ? _barrasLayout() : null;
  function _spansFila(h) {
    if (!_Lb || !h || _Lb.x[h] === undefined) return null;
    return Object.keys(_Lb.filaDe || {}).filter(function(k) { return _Lb.filaDe[k] === h; })
      .map(function(k) { return [g.contLeft + _Lb.x[k], g.contLeft + _Lb.x[k] + _Lb.w[k]]; });
  }



  function _xCadena(arriba, abajo) {
    var A = arriba || [[-Infinity, Infinity]], B = abajo || [[-Infinity, Infinity]];
    var best = cx, bestD = Infinity;
    for (var i = 0; i < A.length; i++) {
      for (var j = 0; j < B.length; j++) {
        var i0 = Math.max(A[i][0], B[j][0]), i1 = Math.min(A[i][1], B[j][1]);
        if (i1 - i0 < 1) continue;
        if (cx >= i0 && cx <= i1) return cx;
        var x = (cx < i0) ? Math.min(i0 + 30, (i0 + i1) / 2) : Math.max(i1 - 30, (i0 + i1) / 2);
        if (Math.abs(x - cx) < bestD) { bestD = Math.abs(x - cx); best = x; }
      }
    }
    return best;
  }
  var _filaPrimera = _spansFila(_Lb && _Lb.orden[0]);


  if (g.igY !== null) {

    _cotaV(marco, 'cota-cv', cx, 0, ct + g.igY, _mmTxt(ct + g.igY),
      'CV-IG-01', _applyConst('IG_MARGIN_TOP'));


  } else {

    _cotaV(marco, 'cota-cv', cx, 0, ct + g.aisY, _mmTxt(ct + g.aisY),
      'CV-01', _applyConst('CV_TOP_PX'));
  }


  if (g.hayDifInf) {


    function _extFila(topRel) {
      return (typeof _canaletaFilaExtras === 'function')
        ? _canaletaFilaExtras(topRel) : { arriba: 0, abajo: 0 };
    }

    var _ext0 = _extFila(g.filaYs[0]);
    var _f0Top = g.filaYs[0] - _ext0.arriba;
    _cotaV(marco, 'cota-cv', cx, ct + g.aisInfBottom,
      _f0Top - g.aisInfBottom, _mmTxt(_f0Top - g.aisInfBottom),
      'CV-15', _applyConstInf('DIF_INF_GAP', _ext0.arriba));


    var _layCont = (typeof _layoutInferior === 'function') ? _layoutInferior() : null;
    var _fCont = _layCont ? _layCont.filaCont : -1;
    for (var f = 1; f < g.filaYs.length; f++) {
      var _extArr = _extFila(g.filaYs[f - 1]).abajo;
      var _extAba = _extFila(g.filaYs[f]).arriba;
      var gapTop = ct + g.filaYs[f - 1] + (g.filaHs[f - 1] || 425) + _extArr;
      var gapBot = ct + g.filaYs[f] - _extAba;
      var esCont = (f === _fCont);
      if (gapBot - gapTop > 1) {
        _cotaV(marco, 'cota-cv', cx, gapTop, gapBot - gapTop,
          _mmTxt(gapBot - gapTop),
          esCont ? 'CV-27' : 'CV-15b',
          _applyConstInf(esCont ? 'INF_CONT_GAP_PX' : 'DIF_INF_INTER_GAP',
                         _extArr + _extAba));
      }
    }

    var nextY = g.filasBarras.length ? g.filasBarras[0].y : null;
    if (nextY !== null) {


      var _bTopCv16 = (typeof _bornerasTopIntercalado === 'function')
        ? _bornerasTopIntercalado(ct, g.difBlockBottom, nextY) : null;
      var _finCv16 = (_bTopCv16 !== null) ? _bTopCv16 : nextY;
      var _extUlt = _extFila(g.filaYs[g.filaYs.length - 1]).abajo;
      var _iniCv16 = g.difBlockBottom + _extUlt;
      if (_finCv16 - _iniCv16 > 1) {
        _cotaV(marco, 'cota-cv', _xCadena(null, _filaPrimera), ct + _iniCv16,
          _finCv16 - _iniCv16, _mmTxt(_finCv16 - _iniCv16),
          'CV-16', _applyConstInf('DIF_INF_NEXT_GAP', _extUlt));
      }
    }
  } else {



    var firstBarY = g.filasBarras.length ? g.filasBarras[0].y : null;
    if (firstBarY !== null) {
      var _bTopIntercalado = (typeof _bornerasTopIntercalado === 'function')
        ? _bornerasTopIntercalado(ct, g.aisInfBottom, firstBarY) : null;
      var _finCv08 = (_bTopIntercalado !== null) ? _bTopIntercalado : firstBarY;
      _cotaV(marco, 'cota-cv', _xCadena(null, _filaPrimera), ct + g.aisInfBottom,
        _finCv08 - g.aisInfBottom, _mmTxt(_finCv08 - g.aisInfBottom),
        'CV-08', _applyConst('BAR_FIRST_GAP_PX'));
    }
  }










  function _tramoLibre(desde, hasta) {
    var ini = desde, fin = hasta;
    if (typeof _bornerasDeBarra === 'function') {
      _bornerasDeBarra().forEach(function(it) {
        if (it.top < desde - 1 || it.bot > hasta + 1) return;                              
        if (it.gr.lugar.indexOf('-abajo') !== -1) { if (it.bot > ini) ini = it.bot; }
        else                                      { if (it.top < fin) fin = it.top; }
      });
    }
    return { ini: ini, fin: fin };
  }



  for (var fb = 1; fb < g.filasBarras.length; fb++) {
    var fA = g.filasBarras[fb - 1], fB = g.filasBarras[fb];
    var tF = _tramoLibre(fA.y + g.BAR_H, fB.y);
    if (tF.fin - tF.ini <= 1) continue;
    _cotaV(marco, 'cota-cv', _xCadena(_spansFila(fA.k), _spansFila(fB.k)),
      ct + tF.ini, tF.fin - tF.ini, _mmTxt(tF.fin - tF.ini),
      fA.k === 'n' ? 'CV-11' : 'CV-12', _applyConst('BAR_INTER_GAP_PX'));
  }



  var lastAbs = ct + g.lastBottom;
  if (typeof _bornerasBottomAbs === 'function') {
    var _bBot = _bornerasBottomAbs();
    if (_bBot !== null && _bBot > lastAbs) lastAbs = _bBot;
  }
  if (g.gabH - lastAbs > 5) {

    var _filaUlt = (_Lb && _Lb.bottom !== null && Math.abs(ct + _Lb.bottom - lastAbs) < 1)
      ? _spansFila(_Lb.orden[_Lb.orden.length - 1]) : null;
    _cotaV(marco, 'cota-cv', _xCadena(_filaUlt, null), lastAbs, g.gabH - lastAbs,
      _mmTxt(g.gabH - lastAbs), 'CV-09', _applyConst('GAB_BOT_GAP_PX'));
  }





  if (typeof _cotasGruposBorneras === 'function') _cotasGruposBorneras(marco, g, cx, ct);
  if (typeof _cotasGruposIG === 'function') _cotasGruposIG(marco, ct, g.contLeft, g.gabW);
  if (typeof _cotasBarrasLado === 'function') _cotasBarrasLado(marco, ct, g.contLeft, g.gabW);





  var _ctnB = document.getElementById('panel_busbar_container');
  var _posB = window._PRESENCIA_POS;
  if (_ctnB && _posB) {
    var _igImgB = _ctnB.querySelector('.ig-img');
    if (_igImgB) {
      var _igRightB = (parseFloat(_igImgB.style.left) || 0) + (parseFloat(_igImgB.style.width) || 0);




      var _hastaB = _posB.cx - _posB.w / 2;
      var _canPB = (typeof _bornerasCanaletaPresencia === 'function')
        ? _bornerasCanaletaPresencia() : null;
      if (_canPB) _hastaB -= _canPB.flanco.izq;
      if (_hastaB > _igRightB) {
        _cotaH(marco, 'cota-cv', g.contLeft + _igRightB, ct + _posB.cy,
          _hastaB - _igRightB, _mmTxt(_hastaB - _igRightB),
          'CV-22', function(mm) { window._BORNERAS_GAP_MM = mm; });
      }
    }
  }


  var itms = window._itmList || [];
  ['left', 'right'].forEach(function(side) {
    var lado = itms.filter(function(i) { return i.side === side; });
    if (!lado.length) return;

    var edge = null, refY = null;
    lado.forEach(function(itm) {
      var e = itmLateralEdgeRelX(itm, side, g.aisW, g.sets.cmConSet, g.sets.cmRegConSet,
                                 RIEL_CON_W || 115, CM_CON_W, CM_REG_CON_W);
      if (e === null) return;
      if (edge === null || (side === 'left' ? e < edge : e > edge)) {
        edge = e;
        refY = ct + _itmBodyYReal(itm, itm.conH) + 40;
      }
    });
    if (edge === null) return;
    var edgeAbs = g.contLeft + edge;

    var _lensCol = [];                     
    var _hayCol2Cv = false;                                             
    var _col2H = 0;                                                               
    lado.forEach(function(i) {
      var _difLatCv = i.dif && i.dif.ubicacion === 'lateral';
      if (_difLatCv) _lensCol.push(425);
      if (typeof _dpsEnColumna === 'function' ? _dpsEnColumna(i) : i.dps) _lensCol.push(415);
      if (i.contactor && i.contactor.ubicacion === 'lateral') {


        var _hK = (typeof _contactorModelo === 'function') ? _contactorModelo(i.contactor.capacidad).h : 385;
        if (_difLatCv) { _hayCol2Cv = true; _col2H = Math.max(_col2H, _hK); }                         
        else _lensCol.push(_hK);
      }
    });

    if (typeof _col2WLado === 'function') _col2H = _col2WLado(side) || _col2H;
    if (!_col2H) _col2H = 385;


    var _flCanCol = (typeof _canaletaFlancoColumnaPx === 'function')
      ? _canaletaFlancoColumnaPx(side) : 0;








    _flCanCol += (typeof _canaletaColumnaCorrimientoPx === 'function')
      ? _canaletaColumnaCorrimientoPx(side) : 0;
    var _floorLatCv = window._floorLateralPx || 0;
    var _floorNoDifCv = window._floorLateralNoDifPx || 0;
    var hayDifLat = _lensCol.length > 0;
    if (hayDifLat) {






      var _eCol = (typeof _anclaColumnaLateral === 'function')
        ? _anclaColumnaLateral(side) : null;
      if (_eCol !== null) {
        edge = _eCol;
        edgeAbs = g.contLeft + _eCol;




        var _topCol = null;
        lado.forEach(function(i) {
          if (typeof _itmOcupaColLat !== 'function' || !_itmOcupaColLat(i)) return;
          var y = _itmBodyYReal(i);
          if (_topCol === null || y < _topCol) _topCol = y;
        });
        if (_topCol !== null) refY = ct + _topCol + 40;
      }
      var difGap = (side === 'left') ? DIF_GAB_GAP_LEFT_PX : DIF_GAB_GAP_RIGHT_PX;
      var itmGap = (side === 'left') ? DIF_ITM_GAP_LEFT_PX : DIF_ITM_GAP_RIGHT_PX;


      var difW = (typeof _col1WLado === 'function' && _col1WLado(side)) || Math.max.apply(null, _lensCol);



      var _bornW = (typeof _bornerasAnchoLateral === 'function')
        ? _bornerasAnchoLateral(side) : 0;
      if (side === 'left') {
        var difOuterL = edgeAbs - itmGap - difW;
        var cotaStartL = difOuterL;
        if (_hayCol2Cv) {

          var contGapL = CONT_DIF_GAP_LEFT_PX;
          cotaStartL = difOuterL - contGapL - _col2H;
          _cotaH(marco, 'cota-cv', cotaStartL + _col2H, refY, contGapL, _mmTxt(contGapL),
            'CV-23', _applyConstPar('CONT_DIF_GAP_LEFT_PX', 'CONT_DIF_GAP_RIGHT_PX'));
        }
        if (_bornW) {
          var bGapL = BORN_CONT_GAP_LEFT_PX;
          _cotaH(marco, 'cota-cv', cotaStartL - bGapL, refY, bGapL, _mmTxt(bGapL),
            'CV-24', _applyConstPar('BORN_CONT_GAP_LEFT_PX', 'BORN_CONT_GAP_RIGHT_PX'));
          cotaStartL -= bGapL + _bornW;
        }
        var _fin13L = cotaStartL - _flCanCol;
        var _el13L = _cotaH(marco, 'cota-cv', 0, refY, _fin13L, _mmTxt(_fin13L),
          'CV-13', _applyConstPar('DIF_GAB_GAP_LEFT_PX', 'DIF_GAB_GAP_RIGHT_PX'));




        var _min13L = (_floorNoDifCv + edge + (cotaStartL - edgeAbs)) * PX_TO_MM;
        var _sp13L = _el13L.querySelector('.cota-mi-val');
        if (_sp13L && _min13L > 0) _sp13L.dataset.minMm = _min13L.toFixed(1);
        _cotaH(marco, 'cota-cv', difOuterL + difW, refY, itmGap, _mmTxt(itmGap),
          'CV-14', _applyConstPar('DIF_ITM_GAP_LEFT_PX', 'DIF_ITM_GAP_RIGHT_PX'));
      } else {
        var difOuterR = edgeAbs + itmGap + difW;
        var cotaEndR = difOuterR;
        if (_hayCol2Cv) {
          var contGapR = CONT_DIF_GAP_RIGHT_PX;
          _cotaH(marco, 'cota-cv', difOuterR, refY, contGapR, _mmTxt(contGapR),
            'CV-23', _applyConstPar('CONT_DIF_GAP_LEFT_PX', 'CONT_DIF_GAP_RIGHT_PX'));
          cotaEndR = difOuterR + contGapR + _col2H;
        }
        if (_bornW) {
          var bGapR = BORN_CONT_GAP_RIGHT_PX;
          _cotaH(marco, 'cota-cv', cotaEndR, refY, bGapR, _mmTxt(bGapR),
            'CV-24', _applyConstPar('BORN_CONT_GAP_LEFT_PX', 'BORN_CONT_GAP_RIGHT_PX'));
          cotaEndR += bGapR + _bornW;
        }
        var _ini13R = cotaEndR + _flCanCol;
        var _el13R = _cotaH(marco, 'cota-cv', _ini13R, refY, g.gabW - _ini13R,
          _mmTxt(g.gabW - _ini13R),
          'CV-13', _applyConstPar('DIF_GAB_GAP_LEFT_PX', 'DIF_GAB_GAP_RIGHT_PX'));
        var _min13R = (_floorNoDifCv + g.aisW - edge - (cotaEndR - edgeAbs)) * PX_TO_MM;
        var _sp13R = _el13R.querySelector('.cota-mi-val');
        if (_sp13R && _min13R > 0) _sp13R.dataset.minMm = _min13R.toFixed(1);
        _cotaH(marco, 'cota-cv', edgeAbs, refY, itmGap, _mmTxt(itmGap),
          'CV-14', _applyConstPar('DIF_ITM_GAP_LEFT_PX', 'DIF_ITM_GAP_RIGHT_PX'));
      }
    } else {



      var _floorPx = (typeof window._floorLateralSinGrupoPx === 'number')
        ? window._floorLateralSinGrupoPx : _floorLatCv;




      var _flCan = _flCanCol;


      var _corrFlanco = _flCan - (window._flancoCanMaxPx || 0);
      if (side === 'left') {
        var _lg04 = edgeAbs - _flCan;
        var el04 = _cotaH(marco, 'cota-cv', 0, refY, _lg04, _mmTxt(_lg04),
          'CV-04', function(mm) {






            var target = (mm / PX_TO_MM) - edge + _corrFlanco;
            CV_LEFT_PX = Math.max(100, target);
            CV_RIGHT_PX = CV_LEFT_PX;
          });

        var _min04 = (_floorPx + edge) * PX_TO_MM;
        var sp04 = el04.querySelector('.cota-mi-val');
        if (sp04 && _min04 > 0) sp04.dataset.minMm = _min04.toFixed(1);
      } else {
        var _ini05 = edgeAbs + _flCan;
        var el05 = _cotaH(marco, 'cota-cv', _ini05, refY, g.gabW - _ini05,
          _mmTxt(g.gabW - _ini05),
          'CV-05', function(mm) {



            var target = (mm / PX_TO_MM) + (edge - g.aisW) + _corrFlanco;
            CV_RIGHT_PX = Math.max(100, target);
            CV_LEFT_PX = CV_RIGHT_PX;
          });
        var _min05 = (_floorPx + g.aisW - edge) * PX_TO_MM;
        var sp05 = el05.querySelector('.cota-mi-val');
        if (sp05 && _min05 > 0) sp05.dataset.minMm = _min05.toFixed(1);
      }
    }
  });
}







function _renderCotasPB() {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  _limpiarCotas(marco, 'cota-pb');

  var d = window._panelBusbarData;
  var container = document.getElementById('panel_busbar_container');
  if (!d || !container || container.style.display === 'none') return;
  if (window._vistaActual && window._vistaActual !== 'frontal') return;

  var cL = parseFloat(container.style.left) || 0;
  var cT = parseFloat(container.style.top) || 0;


  var porAncho = {};                                               
  container.querySelectorAll('.con-svg').forEach(function(svg) {
    var w = parseFloat(svg.getAttribute('width'));
    var x = parseFloat(svg.style.left);
    var y = parseFloat(svg.style.top);
    if (isNaN(w) || isNaN(x) || isNaN(y)) return;
    if (!porAncho[w] || y < porAncho[w].y) porAncho[w] = { x: x, y: y, w: w };
  });
  Object.keys(porAncho).forEach(function(wKey) {
    var c = porAncho[wKey];
    var w = c.w;
    var codigo, key;
    if (w === (RIEL_CON_W || 115))        { codigo = 'CB-01'; key = 'conRielAnMm'; _CV_RANGOS['CB-01'] = { min: 15, max: 90 }; }
    else if (w === (CM_CON_W || 175))     { codigo = 'CB-02'; key = 'conMod1AnMm'; _CV_RANGOS['CB-02'] = { min: 25, max: 250 }; }
    else if (w === (CM_REG_CON_W || 225)) { codigo = 'CB-03'; key = 'conMod2AnMm'; _CV_RANGOS['CB-03'] = { min: 35, max: 250 }; }
    else return;
    var el = _cotaH(marco, 'cota-pb', cL + c.x, cT + c.y, w, _mmTxt(w), codigo,
      _applyPB(function(mm) { d[key] = mm; }));
  });


  var bars = [];
  container.querySelectorAll('[data-busbar-fase]').forEach(function(svg) {
    var x = parseFloat(svg.style.left);
    var w = parseFloat(svg.getAttribute('width'));
    var y = parseFloat(svg.style.top);
    var h = parseFloat(svg.getAttribute('height'));
    if (isNaN(x) || isNaN(w)) return;
    bars.push({ cx: x + w / 2, left: x, right: x + w, top: y, h: h });
  });
  bars.sort(function(a, b) { return a.cx - b.cx; });


  if (bars.length >= 2) {
    var esEditable04 = d.aisladoTipo === '0.5s400_3F' || d.aisladoTipo === '0.5s400_4F';


    var gapKey = pbAisGapKey(d);


    _CV_RANGOS['CB-04'] = (gapKey === 'aisGap4f') ? Columna.rangoPaso(4)
      : (gapKey === 'aisGap2f') ? { min: 45, max: 110 } : Columna.rangoPaso(3);
    for (var b = 1; b < bars.length; b++) {
      var y04 = cT + bars[b].top;
      var el04 = _cotaH(marco, 'cota-pb', cL + bars[b - 1].cx, y04,
        bars[b].cx - bars[b - 1].cx, _mmTxt(bars[b].cx - bars[b - 1].cx), 'CB-04',
        esEditable04 ? _applyPB(function(mm) { d[gapKey] = mm; }) : null);
      if (!esEditable04) {
        el04.title = 'CB-04 — editable solo con aislador 0.5/400 (los base tienen posiciones fijas)';
      }
    }
  }




  var _cbOffDer = 25 + (window._MEDIDOR ? (TC_ANCHO_MM / 2 - 10) / PX_TO_MM : 0);






  if (d.conexionIG && bars.length) {
    var extPx = (d.conexionIGAltura || 20) / PX_TO_MM;                        
    var barDer = bars[bars.length - 1];



    var _extBarPx = _busbarExtMm(d) / PX_TO_MM;
    var _aisTopY = cT + barDer.top + _extBarPx;
    _CV_RANGOS['CB-05'] = { min: (window._MEDIDOR ? extSupMinConTcMm(d) : EXT_SUP_MIN_MM), max: EXT_SUP_MAX_MM };






    var _finPlaca = _aisTopY - ((_busbarExtMm(d) - IG_SOLAPE_MM) / PX_TO_MM);
    _cotaV(marco, 'cota-pb', cL + barDer.right + _cbOffDer, _finPlaca - extPx, extPx,
      _mmTxt(extPx), 'CB-05', _applyPB(function(mm) {
        var prev = d.conexionIGAltura || 20;


        if (window._MEDIDOR && typeof extSupMinConTcMm === 'function') {
          mm = Math.max(extSupMinConTcMm(d), mm);
        }
        d.conexionIGAltura = mm;
        _igGapSigueAlCuadro(prev, mm);
      }));




    _CV_RANGOS['CB-07'] = { min: EXT_SUP_MIN_MM, max: 40 };
    _cotaV(marco, 'cota-pb', cL + bars[0].left - 25, _aisTopY - _extBarPx,
      _extBarPx, _mmTxt(_extBarPx), 'CB-07',
      _applyPB(function(mm) {

        var _extAnt = _busbarExtMm(d);
        d.busbarExtMm = mm;
        if (typeof _igGapSigueAlCuadro === 'function') _igGapSigueAlCuadro(_extAnt, _busbarExtMm(d));
      }));




    if (window._MEDIDOR && typeof tcAireMm === 'function') {
      var _airePx = tcAireMm(d) / PX_TO_MM;
      var _yBarra = _aisTopY - _extBarPx;                                 

      _CV_RANGOS['CB-08'] = { min: 10, max: (typeof tcAireMaxMm === 'function') ? tcAireMaxMm(d) : 100 };
      _cotaV(marco, 'cota-pb', cL + bars[0].left - 25, _yBarra - _airePx,
        _airePx, _mmTxt(_airePx), 'CB-08',
        _applyPB(function(mm) {
          d.tcAireMm = mm;


          if (typeof _medidorAsegurarAlto === 'function') _medidorAsegurarAlto();
        }));
    }
  }







  var _igImg = container.querySelector('.ig-img');
  if (_igImg && bars.length) {
    var _igBotPB = cT + parseFloat(_igImg.style.top) + parseFloat(_igImg.style.height);




    var _aisTopPB = cT + bars[0].top + (d.conexionIG ? (_busbarExtMm(d) / PX_TO_MM) : 0);
    var _finPB = _aisTopPB - igPlacaPx(d);

    var _cxPB = cL + bars[bars.length - 1].right + _cbOffDer;
    if (_finPB - _igBotPB > 1) {
      _cotaV(marco, 'cota-pb', _cxPB, _igBotPB, _finPB - _igBotPB,
        _mmTxt(_finPB - _igBotPB), 'CB-IG-02', function(mm) {


          IG_GAP = mm / PX_TO_MM + igPlacaPx(d);
          _recalcIgExtraTop();
          if (typeof _redibujarPanelConIG === 'function') _redibujarPanelConIG();
        });
    }
  }


  if (bars.length && !isNaN(bars[0].h)) {
    var barIzq = bars[0];
    var el06 = _cotaV(marco, 'cota-pb', cL + barIzq.left - 25, cT + barIzq.top,
      barIzq.h, _mmTxt(barIzq.h), 'CB-06', null);

    el06.title = 'CB-06 — informativa: el alto de la barra sale de las demás cotas';
  }
}



function _applyPB(mutador) {
  return function(mm) {
    mutador(mm);
    if (typeof _applyConDims === 'function') _applyConDims(window._panelBusbarData);



    if (window._MEDIDOR && typeof _medidorAsegurarAlto === 'function') _medidorAsegurarAlto();



    if (typeof actualizarBibliotecaOtros === 'function') actualizarBibliotecaOtros();
  };
}

function toggleCotasPB() { _syncToggleCota('chk_cotas_pb', 'sin-cotas-pb'); }


function actualizarCotasEscala(saltarApartar) {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  var zoom = parseFloat(marco.style.zoom) || 1;
  marco.style.setProperty('--cota-arrow', (14 / zoom) + 'px');
  marco.style.setProperty('--cota-font', (12 / zoom) + 'px');






  if (!saltarApartar && typeof _apartarCotasDeTriangulos === 'function') {
    _apartarCotasDeTriangulos();
  }
}


function posicionarCotas() {
  actualizarCotasEscala(true);
  posicionarCotasGabinete();
  posicionarCotasEqui();
  _renderCotasPB();
  _apartarCotasDeTriangulos();
}





var _TRI_CLICKEABLES = '.tri-clickeable, .itm-tri, .dif-tri, .contactor-tri, .dps-tri, ' +
  '.bornera-tri, .bornera-presencia-tri, .puerta-puls-tri, .barra-tri';


var _ESTORBAN_COTA = _TRI_CLICKEABLES + ', .itm-rotulo';






function _medidaNominalValor(txt) {
  var cv = _medidaNominalValor._cv ||
    (_medidaNominalValor._cv = document.createElement('canvas'));
  var ctx = cv.getContext('2d');
  ctx.font = "600 " + COTA_FONT_BASE + "px 'Segoe UI', Arial, sans-serif";




  var f = COTA_VALOR_HOLGURA;
  return { w: (ctx.measureText(txt || '').width + 6) * f, h: (COTA_FONT_BASE * 1.3 + 6) * f };
}
var COTA_FONT_BASE = 12;
var COTA_VALOR_HOLGURA = 2.5;

function _apartarCotasDeTriangulos() {
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  var cotas = [].slice.call(marco.querySelectorAll('.cota-mi')).filter(function(c) {
    return c.querySelector('.cota-editable');
  });
  if (!cotas.length) return;




  var z = parseFloat(marco.style.zoom) || 1;
  var mr = marco.getBoundingClientRect();
  var gabW = parseFloat(marco.style.width) || 0;
  var gabH = parseFloat(marco.style.height) || 0;
  var cajas = [];



  marco.querySelectorAll(_ESTORBAN_COTA).forEach(function(t) {
    if (t.offsetParent === null) return;                         
    var g = t.getBoundingClientRect();
    if (!g.width) return;




    cajas.push({ left: Math.floor((g.left - mr.left) / z),
                 right: Math.ceil((g.right - mr.left) / z),
                 top: Math.floor((g.top - mr.top) / z),
                 bottom: Math.ceil((g.bottom - mr.top) / z) });
  });

  function _pisa(a, b) {
    return a.right > b.left && a.left < b.right &&
           a.bottom > b.top && a.top < b.bottom;
  }

  cotas.forEach(function(c) {



    var vert = c.classList.contains('cota-mi-v');
    var eje = vert ? 'left' : 'top';
    var ejeIni = vert ? 'left' : 'top';
    var ejeFin = vert ? 'right' : 'bottom';

    var base;
    if (c.dataset.baseOff === undefined) {
      base = parseFloat(c.style[eje]) || 0;
      c.dataset.baseOff = String(base);
    } else {
      base = parseFloat(c.dataset.baseOff);
    }
    c.style[eje] = base + 'px';
    var lbl = c.querySelector('.cota-editable');
    lbl.style.marginLeft = '';
    lbl.style.marginTop = '';
    if (!cajas.length) return;




    var cw = vert ? 20 : (parseFloat(c.style.width) || 20);
    var chh = vert ? (parseFloat(c.style.height) || 20) : 20;
    var L0 = parseFloat(c.style.left) || 0, T0 = parseFloat(c.style.top) || 0;
    var nom = _medidaNominalValor(lbl.textContent);


    function _cajas(corr, mv) {
      var dl = vert ? corr : 0, dt = vert ? 0 : corr;
      var cota = { left: L0 + dl, right: L0 + dl + cw,
                   top: T0 + dt, bottom: T0 + dt + chh };


      var cx = cota.left + cw / 2 + (vert ? mv : 0);
      var cy = cota.top + chh / 2 + (vert ? 0 : mv);
      var val = { left: cx - nom.w / 2, right: cx + nom.w / 2,
                  top: cy - nom.h, bottom: cy };
      return { cota: cota, val: val };
    }
    function _estorba(corr, mv) {
      var b = _cajas(corr, mv);
      for (var i = 0; i < cajas.length; i++) {
        if (_pisa(b.cota, cajas[i]) || _pisa(b.val, cajas[i])) return cajas[i];
      }
      return null;
    }


    function _cajasVal(mv) {
      return _cajas(corr, mv).val;
    }
    function _estorbaVal(mv) {
      var v = _cajasVal(mv);
      for (var i = 0; i < cajas.length; i++) if (_pisa(v, cajas[i])) return cajas[i];
      return null;
    }

    var recIni = vert ? 'top' : 'left';
    var recFin = vert ? 'bottom' : 'right';

    var t = _estorba(0, 0);
    if (!t) return;






    function _bloques(corr) {
      var b = _cajas(corr, 0);
      var lo = Math.min(b.cota[recIni], b.val[recIni]);
      var hi = Math.max(b.cota[recFin], b.val[recFin]);
      var tramos = [];
      for (var i = 0; i < cajas.length; i++) {
        var o = cajas[i];
        if (o[recFin] <= lo || o[recIni] >= hi) continue;                        
        tramos.push([o[ejeIni], o[ejeFin]]);
      }
      tramos.sort(function(a, b2) { return a[0] - b2[0]; });
      var out = [];
      tramos.forEach(function(x) {
        var ult = out[out.length - 1];
        if (ult && x[0] <= ult[1] + 1) ult[1] = Math.max(ult[1], x[1]);
        else out.push([x[0], x[1]]);
      });
      return out;
    }

    var corr = 0, vueltas = 0, chocando = true;
    while (chocando && vueltas++ < 6) {
      var b = _cajas(corr, 0);
      var ini = Math.min(b.cota[ejeIni], b.val[ejeIni]);
      var fin = Math.max(b.cota[ejeFin], b.val[ejeFin]);
      var bl = _bloques(corr), estorbo = null;
      for (var q = 0; q < bl.length; q++) {
        if (fin > bl[q][0] && ini < bl[q][1]) { estorbo = bl[q]; break; }
      }
      if (!estorbo) { chocando = false; break; }
      var aMenos = estorbo[0] - fin - 6;                           
      var aMas = estorbo[1] - ini + 6;                             


      corr += (Math.abs(aMenos) <= aMas + 2) ? aMenos : aMas;




      var pos = base + corr;
      var fin2 = pos + (vert ? cw : chh);
      if (pos < 10 || fin2 > (vert ? gabW : gabH) - 10) break;
    }
    if (chocando) corr = 0;                                               
    c.style[eje] = (base + corr) + 'px';




    var lat = 0, giros = 0, obst = _estorbaVal(0);
    while (obst && giros++ < 8) {
      var bv = _cajasVal(lat);
      var aMenos = obst[ejeIni] - bv[ejeFin] - 6;
      var aMas = obst[ejeFin] - bv[ejeIni] + 6;
      lat += (Math.abs(aMenos) <= aMas + 2) ? aMenos : aMas;
      if (Math.abs(lat) > 700) break;
      obst = _estorbaVal(lat);
    }
    if (!obst) {
      if (lat) lbl.style[vert ? 'marginLeft' : 'marginTop'] = lat + 'px';
      return;
    }




    var b0 = _cajas(corr, 0);


    var ini0 = b0.cota[recIni], fin0 = b0.cota[recFin];
    var largoVal = vert ? nom.h : nom.w;


    var bandas = [];
    for (var k = 0; k < cajas.length; k++) {
      var o = cajas[k];

      var cruzaAncho = vert
        ? (o.right > b0.val.left && o.left < b0.val.right)
        : (o.bottom > b0.val.top && o.top < b0.val.bottom);
      if (!cruzaAncho) continue;
      var oIni = o[recIni], oFin = o[recFin];
      if (oFin <= ini0 || oIni >= fin0) continue;
      bandas.push([Math.max(oIni, ini0) - 4, Math.min(oFin, fin0) + 4]);
    }
    if (!bandas.length) return;
    bandas.sort(function(a, b) { return a[0] - b[0]; });

    var libres = [], cursor = ini0;
    bandas.forEach(function(bd) {
      if (bd[0] > cursor) libres.push([cursor, bd[0]]);
      if (bd[1] > cursor) cursor = bd[1];
    });
    if (cursor < fin0) libres.push([cursor, fin0]);

    var mejor = null;
    libres.forEach(function(l) {
      if (!mejor || (l[1] - l[0]) > (mejor[1] - mejor[0])) mejor = l;
    });
    if (!mejor || (mejor[1] - mejor[0]) < largoVal) return;                  



    var centroActual = (ini0 + fin0) / 2;
    var centroLibre = (mejor[0] + mejor[1]) / 2;
    var d = centroLibre - centroActual;
    if (Math.abs(d) < 1) return;
    lbl.style[vert ? 'marginTop' : 'marginLeft'] = d + 'px';
  });
}



function _syncToggleCota(chkId, bodyClass) {
  var chk = document.getElementById(chkId);
  var off = chk ? !chk.checked : false;
  document.body.classList.toggle(bodyClass, off);
}
function toggleCotasGab()  { _syncToggleCota('chk_cotas_gab',  'sin-cotas-gabinete'); }
function toggleCotasEqui() { _syncToggleCota('chk_cotas_equi', 'sin-cotas-equi'); }
function toggleCotasCP() {
  _syncToggleCota('chk_cotas_cp', 'sin-cotas-cp');


  if (document.body.classList.contains('sin-cotas-cp')) _salirEdicionCP();
}






function _toggleEdicionCP() {
  if (document.body.classList.contains('cp-edit-mode')) { _salirEdicionCP(); return; }


  var encendida = !document.body.classList.contains('sin-cotas-cp');
  if (!encendida) {
    var chk = document.getElementById('chk_cotas_cp');
    if (chk) chk.checked = true;
    document.body.classList.remove('sin-cotas-cp');
  }
  document.body.classList.add('cp-edit-mode');
  var btn = document.getElementById('btn_edicion_cp');
  if (btn) { btn.classList.add('activo'); btn.title = 'Terminar de editar'; }
  if (typeof _avisoFlotante === 'function') {
    _avisoFlotante(encendida
      ? 'Edicion activada: haz click en cualquier valor cyan para cambiarlo.'
      : 'Cotas de Puerta encendidas. Haz click en cualquier valor cyan para cambiarlo.');
  }
}

function _salirEdicionCP() {
  if (!document.body.classList.contains('cp-edit-mode')) return;
  document.body.classList.remove('cp-edit-mode');
  var btn = document.getElementById('btn_edicion_cp');
  if (btn) { btn.classList.remove('activo'); btn.title = 'Editar cotas de puerta'; }

  var inp = document.getElementById('_cv_edit_input');
  if (inp) inp.remove();
  var bdg = document.getElementById('_cv_edit_badge');
  if (bdg) bdg.remove();
}
function toggleCotasRotulos() { _syncToggleCota('chk_cotas_rotulos', 'sin-cotas-rotulos'); }
function toggleCotasCT()   { _syncToggleCota('chk_cotas_ct',   'sin-cotas-ct'); }







function _hintEdicionCV() {
  if (typeof _avisoFlotante === 'function') {
    _avisoFlotante('Haz click directamente en cualquier valor verde del canvas para editarlo.');
  }
}









function _hintEdicionPB() {
  var apagada = document.body.classList.contains('sin-cotas-pb');
  if (apagada) {
    var chk = document.getElementById('chk_cotas_pb');
    if (chk) chk.checked = true;
    document.body.classList.remove('sin-cotas-pb');
  }
  if (typeof _avisoFlotante !== 'function') return;
  _avisoFlotante(apagada
    ? 'Cotas de Panel Busbar encendidas. Haz click en cualquier valor mostaza para editarlo.'
    : 'Haz click directamente en cualquier valor mostaza del canvas para editarlo.');
}




var _COTAS_VISTA_MAP = {
  gab:     ['frontal', 'frontal_mandil', 'frontal_puerta', 'lateral'],               
  pb:      ['frontal'],
  equi:    ['frontal'],
  bloque:  ['frontal'],
  mandil:  ['frontal_mandil'],
  rotulos: ['frontal_mandil'],
  cp:      ['frontal_puerta']
};

function _actualizarCotasSegunVista(vista) {
  vista = vista || window._vistaActual || 'frontal';
  document.querySelectorAll('.bib-cotas-row').forEach(function(row) {
    var fam = row.dataset.familia;





    if (!fam) return;
    var enabled = (_COTAS_VISTA_MAP[fam] || []).indexOf(vista) !== -1;


    row.classList.toggle('vista-disabled', !enabled);
  });


  if (vista !== 'frontal_puerta' && typeof _salirEdicionCP === 'function') _salirEdicionCP();
}





function abrirModalCotasCM() {
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  var ov = document.getElementById('modalCotasCM_overlay');
  if (ov) ov.classList.add('activo');
  var chk = document.getElementById('modalCM_comercial');
  if (chk) chk.checked = (window._autosnapComercial === true);
}

function cerrarModalCotasCM() {
  var ov = document.getElementById('modalCotasCM_overlay');
  if (ov) ov.classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
}

function confirmarModalCotasCM() {
  var chk = document.getElementById('modalCM_comercial');
  var activo = !!(chk && chk.checked);
  var cambio = (activo !== (window._autosnapComercial === true));
  window._autosnapComercial = activo;
  cerrarModalCotasCM();


  if (cambio && activo && typeof _aplicarTamanoComercial === 'function') {
    _aplicarTamanoComercial();
    if (typeof posicionarCotas === 'function') posicionarCotas();
  }
  if (typeof guardarSesion === 'function') guardarSesion();
}

