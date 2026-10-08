
















window._modoEditor = 'diseno';

function setModoEditor(modo) {


  if (modo !== 'diseno' &&
      !(typeof _tableroListo === 'function' ? _tableroListo()
        : (window._gabineteData && window._panelBusbarData))) return;




  var _irAPlano = (modo === 'plano');
  if (_irAPlano) { modo = 'metrado'; window._metradoTab = 'plano'; }
  if (modo !== 'metrado') modo = 'diseno';
  if (modo !== 'metrado') _cerrarPanelesDocumentos(null);


  if (modo !== window._modoEditor && typeof _cancelarModalAbierto === 'function') _cancelarModalAbierto();

  if (window._uniAbierto && typeof cerrarUnifilar === 'function') cerrarUnifilar();

  if (typeof _v3dAbierto === 'function' && _v3dAbierto()) cerrarConector3D();
  window._modoEditor = modo;
  document.body.classList.toggle('modo-metrado', modo === 'metrado');
  ['diseno', 'metrado'].forEach(function(m) {
    var btn = document.getElementById('modo_btn_' + m);
    if (btn) btn.classList.toggle('activo', m === modo);
  });
  var pM = document.getElementById('modo_metrado');
  if (pM) pM.style.display = (modo === 'metrado') ? 'flex' : 'none';
  if (modo === 'metrado') {
    if (_irAPlano) setMetradoTab('plano');
    else _renderModoMetrado();
  }
}


function _filasMetrado() {

  var itms = (typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []);
  var ig = window._igData || null;

  function _modeloLabel(prefix, tipo, capacidad) {
    if (tipo === 'riel') return prefix + ' Riel';
    if (tipo === 'cm_fijo') {
      var isMod2 = parseInt(capacidad, 10) >= 125;
      return prefix + ' CM Fijo ' + (isMod2 ? 'Mod2' : 'Mod1');
    }
    if (tipo === 'cm_reg') return prefix + ' CM Reg';
    if (tipo === 'reserva') return 'Reserva';
    return prefix;
  }
  function _descITM(tipo, cap, polos) {
    var desc = _modeloLabel('ITM', tipo, cap);
    if (tipo !== 'reserva' && cap) desc += ' ' + cap + 'A';
    if (polos) desc += ' ' + polos + 'P';
    return desc;
  }





  function _construccion(tipo, cap) {
    if (tipo === 'riel') return 'para riel DIN';
    if (tipo === 'cm_fijo') return 'en caja moldeada, disparo fijo';
    if (tipo === 'cm_reg') return 'en caja moldeada, disparo regulable';
    return '';
  }
  function _amp(v) { return v ? (' ' + v + ' A') : ''; }
  function _tecITM(tipo, cap, polos, general) {
    return 'Interruptor ' + (general ? 'general ' : '') + 'termomagnético ' +
           _construccion(tipo, cap) + _amp(cap) + (polos ? ' ' + polos + 'P' : '');
  }
  function _tecDIF(tipo, sens, corr, polos) {
    if (tipo === 'reserva') return 'Reserva para interruptor diferencial' + (polos ? ' ' + polos + 'P' : '');
    return 'Interruptor diferencial para riel DIN' + _amp(corr) + (polos ? ' ' + polos + 'P' : '') +
           (sens ? ' ' + sens + ' mA' : '');
  }
  function _descDIF(tipo, sens, corr, polos) {
    var desc;
    if (tipo === 'reserva') desc = 'DIF Reserva';
    else {
      desc = 'DIF Riel';
      if (sens) desc += ' ' + sens + 'mA';
      if (corr) desc += ' ' + corr + 'A';
    }
    if (polos) desc += ' ' + polos + 'P';
    return desc;
  }

  var grpITM = {}, grpDIF = {}, grpDPS = {}, grpCont = {},
      ordenITM = [], ordenDIF = [], ordenDPS = [], ordenCont = [];
  var grpPuls = { count: 0, circuitos: [] };
  var grpPulsCjt = {};                          
  var grpSel = {};                                              
  var grpPulsCol = { count: 0, circuitos: [] };                                  
  itms.forEach(function(it) {



    if (it.tipo !== 'reserva') {


      var regI = (it.tipo === 'cm_reg' && it.regulacion) ? it.regulacion : '';
      var keyI = (it.tipo || '') + '|' + (it.capacidad || '') + '|' + (it.polos || '') + (regI ? '|' + regI : '');
      if (!grpITM[keyI]) {
        grpITM[keyI] = { tipo: it.tipo, capacidad: it.capacidad, polos: it.polos, regulacion: regI, count: 0, circuitos: [] };
        ordenITM.push(keyI);
      }
      grpITM[keyI].count++;
      if (it.rotulo) grpITM[keyI].circuitos.push(it.rotulo);
    }
    if (it.dif) {
      var dt = it.dif.tipo || 'riel';
      var keyD = dt + '|' + (it.dif.corriente || '') + '|' + (it.dif.sensibilidad || '') + '|' + (it.dif.polos || '');
      if (!grpDIF[keyD]) {
        grpDIF[keyD] = { tipo: dt, corriente: it.dif.corriente, sensibilidad: it.dif.sensibilidad,
                         polos: it.dif.polos, count: 0, circuitos: [] };
        ordenDIF.push(keyD);
      }
      grpDIF[keyD].count++;
      if (it.rotulo) grpDIF[keyD].circuitos.push(_rotuloID(it.rotulo));
    }
    if (it.dps) {

      var _descP = (typeof _dpsDesc === 'function') ? _dpsDesc(it.dps) : ('DPS ' + (it.dps.polos || 2) + 'P');
      var keyP = _descP;
      if (!grpDPS[keyP]) {
        grpDPS[keyP] = { polos: it.dps.polos, desc: _descP, count: 0, circuitos: [] };
        ordenDPS.push(keyP);
      }
      grpDPS[keyP].count++;
      if (it.rotulo) grpDPS[keyP].circuitos.push(it.rotulo);
    }

    if (it.pulsador && it.contactor) {


      if (typeof _pulsadorSelectorOn === 'function' && _pulsadorSelectorOn(it)) {
        var _ly = _pulsadorLeyenda(it);                          
        if (!grpSel[_ly]) grpSel[_ly] = { count: 0, circuitos: [] };
        grpSel[_ly].count++;
        if (it.rotulo) grpSel[_ly].circuitos.push(_rotuloK(it.rotulo));
      }
      var _tpMet = (typeof _pulsadorTipo === 'function') ? _pulsadorTipo(it)
                                                         : it.pulsador.tipo;

      if (typeof _pulsadorBotoneraOn === 'function' && !_pulsadorBotoneraOn(it)) {

      } else if (_tpMet === 'columnas') {
        grpPulsCol.count++;
        if (it.rotulo) grpPulsCol.circuitos.push(_rotuloK(it.rotulo));
      } else if (_tpMet === 'conjunto') {
        var _lc = it.pulsador.ledColor || 'verde';
        if (!grpPulsCjt[_lc]) grpPulsCjt[_lc] = { count: 0, circuitos: [] };
        grpPulsCjt[_lc].count++;
        if (it.rotulo) grpPulsCjt[_lc].circuitos.push(_rotuloK(it.rotulo));
      } else {
        grpPuls.count++;
        if (it.rotulo) grpPuls.circuitos.push(_rotuloK(it.rotulo));
      }
    }
    if (it.contactor) {






      var keyC = it.contactor.reserva ? 'R' : _contactorTxt(it.contactor);
      if (!grpCont[keyC]) {
        grpCont[keyC] = { capacidad: it.contactor.capacidad, txt: _contactorTxt(it.contactor),
                          cat: _contactorCategoria(it.contactor),
                          reserva: !!it.contactor.reserva, count: 0, circuitos: [] };
        ordenCont.push(keyC);
      }
      grpCont[keyC].count++;
      if (it.rotulo) grpCont[keyC].circuitos.push(_rotuloK(it.rotulo));
    }
  });

  var filas = [];
  if (ig) {
    var descIG = _modeloLabel('IG', ig.tipo, ig.corriente);
    if (ig.tipo !== 'reserva' && ig.corriente) descIG += ' ' + ig.corriente + 'A';
    if (ig.polos) descIG += ' ' + ig.polos + 'P';
    filas.push({ cat: 'Interruptor General', clave: 'Interruptor General|' + descIG,
                 desc: _tecITM(ig.tipo, ig.corriente, ig.polos, true), qty: 1, circuitos: ['IG'] });
  }
  ordenITM.forEach(function(k) {
    var g = grpITM[k];
    filas.push({ cat: 'Interruptor Termomagnético',
                 clave: 'Interruptor Termomagnético|' + _descITM(g.tipo, g.capacidad, g.polos) +
                        (g.regulacion ? ' reg ' + g.regulacion + 'A' : ''),
                 desc: _tecITM(g.tipo, g.capacidad, g.polos, false) +
                       (g.regulacion ? ', regulado a ' + g.regulacion + ' A' : ''),
                 qty: g.count, circuitos: g.circuitos });
  });
  ordenDIF.forEach(function(k) {
    var g = grpDIF[k];
    filas.push({ cat: 'Interruptor Diferencial',
                 clave: 'Interruptor Diferencial|' + _descDIF(g.tipo, g.sensibilidad, g.corriente, g.polos),
                 desc: _tecDIF(g.tipo, g.sensibilidad, g.corriente, g.polos),
                 qty: g.count, circuitos: g.circuitos });
  });
  ordenDPS.forEach(function(k) {
    var g = grpDPS[k];
    var _dDps = g.desc || ('DPS ' + g.polos + 'P');
    filas.push({ cat: 'DPS', clave: 'DPS|' + _dDps,
                 desc: _dDps.replace(/^DPS /, 'Dispositivo de protección contra sobretensiones (DPS) '),
                 qty: g.count, circuitos: g.circuitos });
  });
  ordenCont.forEach(function(k) {
    var g = grpCont[k];
    var _dCon = g.reserva ? 'Contactor Reserva' : ('Contactor ' + g.txt);
    filas.push({ cat: 'Contactor', clave: 'Contactor|' + _dCon,
                 desc: _contactorDesc({ capacidad: g.capacidad, categoria: g.cat, reserva: g.reserva }, true),
                 qty: g.count, circuitos: g.circuitos });
  });
  if (grpPuls.count > 0) {
    filas.push({ cat: 'Pulsador', clave: 'Pulsador|Pulsador doble marcha/parada c/piloto',
                 desc: 'Pulsador doble marcha/parada con lámpara piloto',
                 qty: grpPuls.count, circuitos: grpPuls.circuitos });
  }
  Object.keys(grpPulsCjt).forEach(function(lc) {
    var g = grpPulsCjt[lc];
    filas.push({ cat: 'Pulsador', clave: 'Pulsador|Conjunto piloto ' + lc + ' + pulsadores marcha/parada',
                 desc: 'Conjunto lámpara piloto ' + lc + ' + pulsadores marcha/parada',
                 qty: g.count, circuitos: g.circuitos });
  });
  if (grpPulsCol.count > 0) {
    filas.push({ cat: 'Pulsador', clave: 'Pulsador|Piloto verde + marcha y piloto rojo + parada',
                 desc: 'Pulsador de marcha con lámpara piloto verde + pulsador de parada con lámpara piloto roja',
                 qty: grpPulsCol.count, circuitos: grpPulsCol.circuitos });
  }


  Object.keys(grpSel).forEach(function(ly) {
    var g = grpSel[ly];
    var txt = (typeof _PULS_LEYENDAS === 'object' && _PULS_LEYENDAS[ly]) || ly;
    filas.push({ cat: 'Selector', clave: 'Selector|Selector 3 posiciones ' + txt,
                 desc: 'Selector rotativo de 3 posiciones ' + txt,
                 qty: g.count, circuitos: g.circuitos });
  });



  if (window._MEDIDOR) {
    filas.push({ cat: 'Medidor', clave: 'Medidor|Medidor multifunción',
                 desc: 'Medidor multifunción de parámetros eléctricos', qty: 1, circuitos: ['PM'] });

    var _mi = _medidorInfo();
    filas.push({ cat: 'Medidor', clave: 'Medidor|Transformador de corriente',

                 desc: 'Transformador de corriente para medición ' + _mi.relacionTxt, qty: _mi.nTc, circuitos: _mi.tcs });
  }
  _filasPilotosBorneras().forEach(function(f) { filas.push(f); });
  var _gd = _gabDimsMm();
  if (_gd) {
    filas.push({ cat: 'Gabinete', clave: 'gabinete',
      desc: 'Gabinete ' + ((window._gabineteData.tipo === 'empotrado') ? 'empotrado' : 'adosado') +
            ' ' + _gd.alto.toFixed(0) + ' \u00d7 ' + _gd.ancho.toFixed(0) +
            ' \u00d7 ' + _gd.prof.toFixed(0) + ' mm',
      qty: 1, circuitos: [] });
  }



  var _pbM = window._panelBusbarData;
  if (_pbM && _pbM.fases) {
    filas.push({ cat: 'Panel busbar', clave: 'panel-busbar',
      desc: 'Panel busbar ' + _pbM.fases + (_pbM.polos ? ' – ' + _pbPolosEfectivos(_pbM) + ' polos' : ''),
      qty: 1, circuitos: [] });
  }
  _filasCanaletas().forEach(function(f) { filas.push(f); });




  var _prio = { 'gabinete': 0, 'panel-busbar': 1 };
  var _cab = filas.filter(function(f) { return _prio[f.clave] !== undefined; })
    .sort(function(a, b) { return _prio[a.clave] - _prio[b.clave]; });
  filas = _cab.concat(filas.filter(function(f) { return _prio[f.clave] === undefined; }));

  return _metradoAplicarEdiciones(filas);
}







var _BORN_DESC_METRADO = {
  '2.5': 'Bornera de paso 2.5 mm\u00b2', '4': 'Bornera de paso 4 mm\u00b2',
  '6': 'Bornera de paso 6 mm\u00b2', 'pf4': 'Bornera portafusible vidrio 4 mm\u00b2',
  'pfcart': 'Portafusible tipo cartucho'
};

function _metradoDueno(g) {
  try { return (typeof _bornerasPertenece === 'function') ? (_bornerasPertenece(g) || '') : ''; }
  catch (e) { return ''; }
}
function _filasPilotosBorneras() {
  var filas = [];
  var nLed = window._PILOTOS_LEDS | 0;
  if (nLed > 0) {

    filas.push({ cat: 'Piloto', clave: 'piloto:presencia',
                 desc: 'Lámpara de señalización LED ' + (window._PILOTOS_COLOR || 'verde') +
                 ' (presencia de tensión)', qty: nLed, circuitos: ['PT'] });
  }



  var _grEq = (typeof _bornerasGrupos === 'function') ? _bornerasGrupos() : [];
  var _equipo = function(clase, cat, desc) {
    var n = 0, rots = [];
    _grEq.forEach(function(g) {
      if (g.clase !== clase || g.reserva) return;
      if (clase === 'timer' && !_timerComprado(g)) return;                             
      n += (g.cant == null) ? 1 : (g.cant | 0);
      var r = _metradoDueno(g);
      if (r && rots.indexOf(r) === -1) rots.push(r);
    });
    if (n) filas.push({ cat: cat, clave: 'equipo:' + clase, desc: desc, qty: n, circuitos: rots });
  };
  _equipo('timer', 'Interruptor horario', 'Interruptor horario digital para riel DIN');
  _equipo('termostato', 'Termostato', 'Termostato regulable para tablero');
  if (window._REJILLA) {
    filas.push({ cat: 'Rejilla', clave: 'equipo:rejilla', desc: 'Rejilla de ventilación ' + _REJILLA_LADO_MM + ' × ' + _REJILLA_LADO_MM + ' mm', qty: 1, circuitos: ['RV'] });
  }
  var porTipo = {}, orden = [], extremos = { tope: 0, separador: 0 };
  var sumar = function(tipo, cant, rot, ext) {
    if (!(cant > 0)) return;
    tipo = tipo || '2.5';
    if (!porTipo[tipo]) { porTipo[tipo] = { qty: 0, rots: [] }; orden.push(tipo); }
    porTipo[tipo].qty += cant;
    if (rot && porTipo[tipo].rots.indexOf(rot) === -1) porTipo[tipo].rots.push(rot);
    [ext.izq, ext.der].forEach(function(e) { if (extremos[e] !== undefined) extremos[e]++; });
  };
  var presencia = (typeof _presenciaSecciones === 'function') ? _presenciaSecciones() : [];
  presencia.forEach(function(sc) {
    sumar(sc.tipo, sc.cant | 0, 'PT', _bornExtremos(sc));
  });
  var grupos = (typeof _bornerasGrupos === 'function') ? _bornerasGrupos() : [];
  grupos.forEach(function(g) {
    if ((g.clase || 'bornera') !== 'bornera' || g.reserva) return;
    var dueno = _metradoDueno(g);
    sumar(g.tipo, (g.cant == null) ? 1 : (g.cant | 0), dueno ? '(B) ' + dueno : '', _bornExtremos(g));
  });
  var ordenTipos = ['2.5', '4', '6', 'pf4', 'pfcart'];
  orden.sort(function(a, b) { return ordenTipos.indexOf(a) - ordenTipos.indexOf(b); });
  orden.forEach(function(t) {
    filas.push({ cat: 'Bornera', clave: 'bornera:' + t, desc: _BORN_DESC_METRADO[t] || ('Bornera ' + t),
                 qty: porTipo[t].qty, circuitos: porTipo[t].rots });
  });
  if (extremos.tope) filas.push({ cat: 'Bornera', clave: 'bornera:tope', desc: 'Tope final para riel DIN',
                                  qty: extremos.tope, circuitos: [] });
  if (extremos.separador) filas.push({ cat: 'Bornera', clave: 'bornera:separador', desc: 'Separador de bornera',
                                       qty: extremos.separador, circuitos: [] });
  return filas;
}













function _mm1(v) { return (Math.round(v * 10) / 10).toFixed(1); }
function _filasMaterialesPanel() {
  var d = (typeof fabMaterialesDatos === 'function') ? fabMaterialesDatos() : null;
  if (!d) return [];
  var filas = [];
  if (d.cobre && d.cobre.length) {
    filas.push({ subt: 'Pletina de cobre' });
    d.cobre.forEach(function(sec) {
      (sec.filas || []).forEach(function(f) {
        filas.push({ cat: 'Pletina', clave: 'plet:' + sec.seccion + '|' + f.pieza,
          desc: 'Pletina ' + sec.seccion + ' mm · ' + f.pieza +
                (f.nota ? ' (' + f.nota + ')' : '') + ' · ' + _mm1(f.largo) + ' mm c/u',
          qty: f.q, circuitos: [] });
      });



      filas.push({ cat: 'Pletina', clave: 'pletTotal:' + sec.seccion,
        desc: 'Total a cortar · pletina ' + sec.seccion + ' mm',
        qty: (sec.total / 1000).toFixed(2) + ' m', circuitos: [], esTotal: true });
    });
  }
  if (d.perneria && d.perneria.length) {
    filas.push({ subt: 'Pernería' });
    d.perneria.forEach(function(f) {
      filas.push({ cat: 'Pernería', clave: 'pern:' + f.pieza,
        desc: f.pieza + (f.donde ? ' · ' + f.donde : ''), qty: f.n, circuitos: [] });
    });
  }
  return _metradoAplicarEdiciones(filas);
}



function _escAttr(v) { return _escFicha(v).replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

var _METRADO_CAMPOS = ['rot', 'qty', 'unidad', 'desc', 'marca'];



function _partirCantidad(q) {
  var m = String(q == null ? '' : q).trim().match(/^([\d.,]+)\s*([^\d\s].*)$/);
  return m ? { qty: m[1], unidad: m[2] } : { qty: String(q == null ? '' : q), unidad: 'und' };
}
function _metradoRotTxt(f) {
  return (f.rotTxt !== undefined && f.rotTxt !== null) ? f.rotTxt : (_rangosRotulos(f.circuitos) || '');
}
function _metradoAplicarEdiciones(filas) {
  var ed = (window._metradoMeta && window._metradoMeta.filas) || {};
  filas.forEach(function(f) {




    if (f.subt) return;
    f.clave = f.clave || (f.cat + '|' + f.desc);
    var _c = _partirCantidad(f.qty);
    f.qty = _c.qty;
    if (f.unidad === undefined) f.unidad = _c.unidad;
    f.auto = { rot: _rangosRotulos(f.circuitos) || '', qty: String(f.qty), unidad: f.unidad,
               desc: f.desc, marca: f.marca || '' };
    var e = ed[f.clave];
    if (!e) return;
    if (e.rot !== undefined) f.rotTxt = e.rot;
    if (e.qty !== undefined) f.qty = e.qty;
    if (e.unidad !== undefined) f.unidad = e.unidad;
    if (e.desc !== undefined) f.desc = e.desc;
    if (e.marca !== undefined) f.marca = e.marca;
  });
  return filas;
}







function _ubicarPanelDocumentos() {
  var side = document.getElementById('sidepanel');
  if (!side) return;
  side.style.left = side.style.top = side.style.right = side.style.width = '';
  if (!document.body.classList.contains('modo-metrado')) return;
  var hoja = null;
  document.querySelectorAll('#modo_metrado .ficha-hoja').forEach(function(h) {
    if (!hoja && h.offsetParent) hoja = h;
  });
  var base = side.offsetParent;
  if (!hoja || !base) return;
  var rh = hoja.getBoundingClientRect(), rb = base.getBoundingClientRect();




  var wrap = hoja.closest('.metrado-wrap');
  var tope = rb.right;
  if (wrap) {
    var rw = wrap.getBoundingClientRect();
    tope = Math.min(tope, rw.left + wrap.clientLeft + wrap.clientWidth);
  }
  var GAP = 12, libre = tope - rh.right - 2 * GAP;
  if (libre < side.offsetWidth) return;
  side.style.left = Math.round(rh.right - rb.left + GAP) + 'px';
  side.style.width = Math.floor(libre) + 'px';
  side.style.right = 'auto';
  side.style.top = Math.max(0, Math.round(rh.top - rb.top)) + 'px';
}




function _cerrarPanelesDocumentos(tab) {
  var ovM = document.getElementById('modalMetradoFila_overlay');
  if (ovM && ovM.classList.contains('activo') && tab !== 'metrado') cerrarModalMetradoFila();
  var ovF = document.getElementById('modalFicha_overlay');
  if (ovF && ovF.classList.contains('activo') && tab !== 'ficha') cerrarModalFicha();
  var ovS = document.getElementById('modalSenalFila_overlay');
  if (ovS && ovS.classList.contains('activo') && tab !== 'senal') cerrarModalSenalFila();
  var ovP = document.getElementById('modalPDF_overlay');
  if (ovP && ovP.classList.contains('activo') && tab !== 'plano' &&
      typeof cerrarModalPDF === 'function') cerrarModalPDF();
}
function _soltarPanelDocumentos() {
  var side = document.getElementById('sidepanel');
  if (side) side.style.left = side.style.top = side.style.right = side.style.width = '';
}
window.addEventListener('resize', function() {
  var side = document.getElementById('sidepanel');
  if (side && side.style.display !== 'none') _ubicarPanelDocumentos();
});

var _metradoFilaEditando = null;
function abrirModalMetradoFila(clave) {
  var f = null, cols = _MT_COLS_DEF;

  _metradoBloques().forEach(function(bl) {
    bl.filas.forEach(function(x) {
      if (x.clave === clave) { f = x; cols = (bl.cols && bl.cols.length) ? bl.cols : _MT_COLS_DEF; }
    });
  });
  if (!f) return;


  [['rot', 'mtFila_rot'], ['prov', 'mtFila_marca']].forEach(function(par) {
    var hay = cols.indexOf(par[0]) !== -1;
    var lbl = document.getElementById(par[1] + '_lbl');
    var inp = document.getElementById(par[1]);
    if (lbl) lbl.style.display = hay ? '' : 'none';
    if (inp) inp.style.display = hay ? '' : 'none';
  });
  _metradoFilaEditando = f;
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(x) { x.classList.remove('activo'); });
  var ov = document.getElementById('modalMetradoFila_overlay');
  if (!ov) return;
  var val = { rot: _metradoRotTxt(f), qty: String(f.qty), unidad: f.unidad || '',
              desc: f.desc, marca: f.marca || '' };
  _pintarCamposMetradoFila(val);
  ov.classList.add('activo');
  _renderModoMetrado();                                             
  _ubicarPanelDocumentos();
}
function _pintarCamposMetradoFila(val) {
  _METRADO_CAMPOS.forEach(function(k) {
    var el = document.getElementById('mtFila_' + k);
    if (el) el.value = val[k] || '';
  });
}
function restablecerMetradoFila() {
  if (_metradoFilaEditando) _pintarCamposMetradoFila(_metradoFilaEditando.auto);
}
function cerrarModalMetradoFila() {
  var ov = document.getElementById('modalMetradoFila_overlay');
  if (ov) ov.classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
  _soltarPanelDocumentos();
  var _habia = !!_metradoFilaEditando;
  _metradoFilaEditando = null;
  if (_habia) _renderModoMetrado();                           
}
function confirmarModalMetradoFila() {
  var f = _metradoFilaEditando;
  if (!f) { cerrarModalMetradoFila(); return; }
  var e = {};
  _METRADO_CAMPOS.forEach(function(k) {
    var el = document.getElementById('mtFila_' + k);
    var v = el ? String(el.value).trim() : '';
    if (v !== String(f.auto[k] || '')) e[k] = v;
  });
  var meta = window._metradoMeta || { filas: {} };
  if (!meta.filas) meta.filas = {};
  if (Object.keys(e).length) meta.filas[f.clave] = e;
  else delete meta.filas[f.clave];
  window._metradoMeta = Object.keys(meta.filas).length ? meta : null;
  if (typeof guardarSesion === 'function') guardarSesion();
  cerrarModalMetradoFila();                                                   
}





function _gabDimsMm() {
  var d = window._gabineteData;
  if (!d) return null;
  var marco = document.getElementById('marco_gabinete');
  var dims = window._vistaFrontalDims || null;
  if (!dims && marco) {
    dims = { w: parseFloat(marco.style.width) || 750, h: parseFloat(marco.style.height) || 750 };
  }
  if (window._vistaActual !== 'lateral' && marco) {                                                             
    dims = { w: parseFloat(marco.style.width) || dims.w,
             h: parseFloat(marco.style.height) || dims.h };
  }
  if (!dims) return null;
  return { alto: dims.h * PX_TO_MM, ancho: dims.w * PX_TO_MM,
           prof: (d.profGabMm || 120) + (d.profPuertaMm || 0) };
}





function _desglosePiezas(largos, singular, plural) {
  if (!largos.length) return '';
  var min = Math.min.apply(null, largos), max = Math.max.apply(null, largos);
  if (largos.length === 1) return ' (1 ' + singular + ' de ' + min.toFixed(0) + ' mm)';
  if (max - min < 1) {
    return ' (' + largos.length + ' ' + plural + ' de ' + min.toFixed(0) + ' mm)';
  }
  return ' (' + largos.length + ' ' + plural + ')';
}

























function _desarrolladoConectorRiel(modelo, d) {
  var alto   = (d && typeof d.conRielAltoMm   === 'number') ? d.conRielAltoMm   : CON_RIEL_ALTO_MM;
  var recto  = (d && typeof d.conRielAnMm     === 'number') ? d.conRielAnMm     : 23;
  var cabeza = (d && typeof d.conRielCabezaMm === 'number') ? d.conRielCabezaMm : CON_RIEL_CABEZA_MM;
  var placa  = recto + 2 * cabeza;                                                      
  if (modelo === 'RT')    return alto + 50.5 + placa;
  if (modelo === 'INTER') return alto + 28.3 + placa;
  if (modelo === 'S')     return 2 * alto + placa - 4.1;
  return null;
}










function _filasCanaletas() {
  var cont = document.getElementById('panel_busbar_container');
  if (!cont) return [];



  var nombres = window._CANALETA_ROTULOS || {};
  var porAncho = {}, anchos = [];
  cont.querySelectorAll('.bornera-canaleta').forEach(function(el) {
    if (el.style.visibility === 'hidden' || el.style.display === 'none') return;
    var w = parseFloat(el.style.width) || 0;
    var h = parseFloat(el.style.height) || 0;
    if (!w || !h) return;
    var ancho = Math.round(Math.min(w, h) * PX_TO_MM);
    if (!ancho) return;
    if (!porAncho[ancho]) { porAncho[ancho] = { largos: [], nombres: {} }; anchos.push(ancho); }
    porAncho[ancho].largos.push(Math.max(w, h) * PX_TO_MM);
    var ref = el.dataset.canaletaRef;
    if (ref && nombres[ref]) porAncho[ancho].nombres[nombres[ref]] = true;
  });
  anchos.sort(function(a, b) { return a - b; });
  return anchos.map(function(a) {
    var g = porAncho[a];
    var total = g.largos.reduce(function(x, y) { return x + y; }, 0);



    return { cat: 'Canaleta', clave: 'canaleta:' + a,
             desc: 'Canaleta ' + a + ' mm' + _desglosePiezas(g.largos, 'tramo', 'tramos'),
             qty: (total / 1000).toFixed(2) + ' m',
             circuitos: Object.keys(g.nombres).sort() };
  });
}



function _rangosRotulos(rotulos) {
  if (!rotulos || !rotulos.length) return '';
  var parsed = rotulos.map(function(r) {
    var m = /^([A-Z]+)-(\d+)$/.exec(r);
    return m ? { pre: m[1], num: parseInt(m[2], 10), raw: r } : { pre: null, raw: r };
  });
  var out = [], i = 0;
  while (i < parsed.length) {
    var p = parsed[i];
    if (p.pre === null) { out.push(p.raw); i++; continue; }
    var j = i;
    while (j + 1 < parsed.length && parsed[j + 1].pre === p.pre &&
           parsed[j + 1].num === parsed[j].num + 1) j++;
    if (j - i >= 2) out.push(p.raw + ' al ' + parsed[j].raw);
    else for (var k = i; k <= j; k++) out.push(parsed[k].raw);
    i = j + 1;
  }
  return out.join(', ');
}







window._metradoTab = 'plano';
var _DOC_GRUPO = {
  unifilar: { g: 'diag', tab: 'metrado_tab_unifilar' }, control: { g: 'diag', tab: 'metrado_tab_unifilar' },
  plano: { g: 'plano', tab: 'metrado_tab_plano' }, fab: { g: 'plano', tab: 'metrado_tab_plano' }
};
var _docUltimo = { diag: 'unifilar', plano: 'plano' };
var _METRADO_TABS = ['plano', 'unifilar', 'control', 'ficha', 'metrado', 'senal', 'fab'];                                  
function setMetradoTab(t) {
  if (typeof _cerrarMenuExportar === 'function') _cerrarMenuExportar();
  window._metradoTab = (_METRADO_TABS.indexOf(t) !== -1) ? t : 'plano';
  _cerrarPanelesDocumentos(window._metradoTab);
  _METRADO_TABS.forEach(function(k) {
    var hoja = document.getElementById('metrado_hoja_' + k);
    if (hoja) hoja.style.display = (window._metradoTab === k) ? '' : 'none';
    var b = document.getElementById('metrado_tab_' + k);
    if (b) b.classList.toggle('activo', window._metradoTab === k);
  });



  var grupo = _DOC_GRUPO[window._metradoTab];
  if (grupo) {
    _docUltimo[grupo.g] = window._metradoTab;
    var bG = document.getElementById(grupo.tab);
    if (bG) bG.classList.add('activo');
  }



  if (window._metradoTab === 'plano') _renderModoPlano();
  if (window._metradoTab === 'unifilar' && typeof _renderUnifilarHoja === 'function') _renderUnifilarHoja();
  if (window._metradoTab === 'control' && typeof _renderControlHojas === 'function') _renderControlHojas();
  if (window._metradoTab === 'metrado') _renderModoMetrado();
  if (window._metradoTab === 'ficha') _renderFichaTecnica();
  if (window._metradoTab === 'senal') _renderSenalizacion();

  if (window._metradoTab === 'fab' && typeof _renderFabricacion === 'function') _renderFabricacion();
}


function elegirDiagrama(v) {
  setMetradoTab(v === 'control' ? 'control' : 'unifilar');
}

function _escFicha(v) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}



function _fichaOrdenBusbar(d) {
  if (!d) return '';
  if (d.fases === '3F') return 'RST';
  if (d.fases === '3F+N') {
    if (d.subfases === 'R - S - T') return 'RST';

    if (typeof _pbBarraConNeutro === 'function' && !_pbBarraConNeutro(d)) return 'RST';
    return d.invertirN ? 'NRST' : 'RSTN';
  }
  if (d.fases === '2F' && d.subfases) return d.subfases.replace(/ - /g, '');
  if (d.fases === '1F+N' && d.subfases) {
    var sf = d.subfases.trim();
    if (sf.indexOf('-N') === -1) return sf;
    return d.invertirN ? ('N-' + sf.replace('-N', '')) : sf;
  }
  return '';
}

function _tablaFichaGabinete() {
  var d = window._gabineteData;
  if (!d) return '';
  var PL = (typeof _PLANCHA_LBL !== 'undefined') ? _PLANCHA_LBL
         : { laf: 'LAF', lac: 'LAC', inox: 'Inox.', galv: 'Galv.' };
  var html = '<table class="ficha-tabla"><tbody>' +
    '<tr><td colspan="2" class="ft-titulo">Características constructivas de gabinete</td></tr>' +
    '<tr><td class="ft-lbl">Tipo de fijación</td><td class="ft-val">' +
    (d.tipo === 'empotrado' ? 'Empotrado' : 'Adosado') + '</td></tr>';
  if (d.ip) html += '<tr><td class="ft-lbl">Grado de protección</td><td class="ft-val">IP ' + _escFicha(d.ip) + '</td></tr>';


  var paneles = [
    { key: 'cuerpo', lbl: 'Cuerpo' }, { key: 'puerta', lbl: 'Puerta' },
    { key: 'placa', lbl: 'Placa base' }, { key: 'mandil', lbl: 'Mandil' }
  ].filter(function(pd) { return !!d[pd.key]; });
  function _mat(p) { return (PL[p.plancha] || p.plancha || '') + (p.espesor ? ' ' + p.espesor + 'mm' : ''); }
  function _acab(p) {
    if (p.acabado === 'pintura') {
      return 'Pintura electrostática' + (p.ral ? ' RAL ' + _escFicha(p.ral) : '') +
             (p.micras ? ' · ' + p.micras + 'µm' : '');
    }
    return _escFicha(p.acabado || '');
  }
  if (paneles.length) {
    var firma = paneles.map(function(pd) { return _mat(d[pd.key]) + '|' + _acab(d[pd.key]); });
    var iguales = firma.every(function(f) { return f === firma[0]; });
    if (iguales) {
      html += '<tr><td class="ft-lbl ft-lineas">' +
        paneles.map(function(pd) { return '<div>' + pd.lbl + '</div>'; }).join('') +
        '</td><td class="ft-val ft-lineas"><div>Material: ' + _escFicha(_mat(d[paneles[0].key])) +
        '</div><div>Acabado: ' + _acab(d[paneles[0].key]) + '</div></td></tr>';
    } else {
      paneles.forEach(function(pd) {
        var p = d[pd.key];
        html += '<tr><td class="ft-lbl">' + pd.lbl + '</td><td class="ft-val ft-lineas"><div>Material: ' +
          _escFicha(_mat(p)) + '</div><div>Acabado: ' + _acab(p) + '</div></td></tr>';
      });
    }
  }
  var marco = document.getElementById('marco_gabinete');
  var dims = window._vistaFrontalDims || null;
  if (!dims && marco) dims = { w: parseFloat(marco.style.width) || 750, h: parseFloat(marco.style.height) || 750 };
  if (window._vistaActual !== 'lateral' && marco) {                                                             
    dims = { w: parseFloat(marco.style.width) || dims.w, h: parseFloat(marco.style.height) || dims.h };
  }
  if (dims) {
    var profTotal = (d.profGabMm || 120) + (d.profPuertaMm || 0);
    html += '<tr><td class="ft-lbl">Dimensiones<div class="ft-sub">(Alt × An × Prof)</div></td>' +
      '<td class="ft-val">' + (dims.h * PX_TO_MM).toFixed(0) + ' × ' + (dims.w * PX_TO_MM).toFixed(0) +
      ' × ' + profTotal.toFixed(0) + ' mm</td></tr>';
  }
  return html + '</tbody></table>';
}

function _tablaFichaBarras() {
  var d = window._panelBusbarData;
  if (!d) return '';

  var itms = (typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []);
  var html = '<table class="ficha-tabla"><tbody>' +
    '<tr><td colspan="2" class="ft-titulo">Dimensionamiento de barras de cobre</td></tr>' +
    '<tr class="ft-head"><td>Descripción</td><td style="text-align:center">An × Esp</td></tr>' +
    '<tr><td class="ft-lbl">· Barra principal - ' + _escFicha(_fichaOrdenBusbar(d)) + '</td>' +
    '<td class="ft-val ft-num">20 × 3 mm</td></tr>';


  if (window._igData && d.conexionIG) {
    var extDim = (window._igData.tipo === 'riel') ? '15 × 3 mm' : '20 × 3 mm';
    html += '<tr><td class="ft-lbl">· Extensión superior</td><td class="ft-val ft-num">' + extDim + '</td></tr>';
  }
  var sets = (typeof buildCmSets === 'function') ? buildCmSets(itms, !!d.invertirNConectores) : null;
  var porTipo = { riel: [], cm_fijo: [], cm_reg: [] };
  itms.forEach(function(it) {
    var t = it.tipo;
    if (t === 'reserva' && sets) {
      var idx = parseInt(it.conIndex);
      t = sets.cmRegConSet[idx] ? 'cm_reg' : (sets.cmConSet[idx] ? 'cm_fijo' : 'riel');
    }


    if (it.libre) return;
    if (porTipo[t] && it.rotulo) porTipo[t].push(it.rotulo);
  });
  var defs = [
    { k: 'riel',    lbl: '· Barra de Derivación - Tipo 1', dim: '10 × 2 mm' },
    { k: 'cm_fijo', lbl: '· Barra de Derivación - Tipo 2', dim: '15 × 3 mm' },
    { k: 'cm_reg',  lbl: '· Barra de Derivación - Tipo 3', dim: '20 × 3 mm' }
  ];
  defs.forEach(function(df) {
    if (!porTipo[df.k].length) return;
    html += '<tr><td class="ft-lbl">' + df.lbl + '<div class="ft-sub">(' +
      _escFicha(_rangosRotulos(porTipo[df.k])) + ')</div></td><td class="ft-val ft-num">' + df.dim + '</td></tr>';
  });

  if (_hayBarraN(d)) html += '<tr><td class="ft-lbl">· Barra N</td><td class="ft-val ft-num">20 × 3 mm</td></tr>';
  if (_hayBarraPE(d)) {
    html += '<tr><td class="ft-lbl">· Barra PE</td><td class="ft-val ft-num">20 × 3 mm</td></tr>';
  }
  if (_hayBarraPEA(d)) {
    html += '<tr><td class="ft-lbl">· Barra PE Aislada</td><td class="ft-val ft-num">20 × 3 mm</td></tr>';
  }


  return html + '</tbody></table>';
}



var _FICHA_DEF = {
  tension: '380 / 220 V', frecuencia: '60 Hz', icc: '10 kA', uaisl: '1 kV', umando: '220 Vca',
  normas: 'IEC/EN 61439-1\nIEC/EN 61439-3\nIEC 60529',
  lugar: 'Interior', entrada: 'Inferior', accLat: 'No', accPos: 'No',
  ventilacion: 'No', calefaccion: 'No', iluminacion: 'No', portacandado: 'No', releFase: 'No',
  temperatura: '40 °C', humedad: '80 % (sin condensación)', altitud: '< 1000 m', ambiente: 'Normal',
  matBarras: 'Cobre electrolítico', tratBarras: 'Desnudo',
  documentos: '', enPdf: true
};
function _fichaDatos() {
  var m = window._fichaMeta || {};
  var out = {};
  Object.keys(_FICHA_DEF).forEach(function(k) {
    out[k] = (m[k] === undefined || m[k] === null || m[k] === '') ? _FICHA_DEF[k] : m[k];
  });
  if (m.enPdf === false) out.enPdf = false;
  out.metradoEnPdf = (m.metradoEnPdf !== false);

  out.sinCajetin = (m.sinCajetin === true);

  out.senalEnPdf = (m.senalEnPdf === true);



  out.cables = Array.isArray(m.cables) ? m.cables : null;
  out.identificacion = Array.isArray(m.identificacion) ? m.identificacion : null;
  return out;
}





var _FICHA_TABLAS = {
  cables: { ed: 'ficha_cables_ed', cols: ['Tipo', 'Color', 'Sección'], def: function() { return _fichaCablesDef(); } },
  identificacion: { ed: 'ficha_ident_ed', cols: ['Elemento', 'Rótulo'], def: function() { return _fichaIdentDef(); } }
};
function _fichaEdFila(cols, fila) {
  var tr = document.createElement('div');
  tr.className = 'ficha-ed-fila';
  tr.style.gridTemplateColumns = 'repeat(' + cols.length + ', minmax(0, 1fr)) 26px';
  cols.forEach(function(c, i) {
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'm1-input-text';
    inp.value = (fila && fila[i] != null) ? fila[i] : '';
    inp.setAttribute('aria-label', c);
    tr.appendChild(inp);
  });
  var x = document.createElement('button');
  x.type = 'button';
  x.className = 'ficha-ed-quitar';
  x.title = 'Quitar fila';
  x.textContent = '×';
  x.onclick = function() { tr.remove(); };
  tr.appendChild(x);
  return tr;
}
function _fichaEdPintar(clave, filas) {
  var T = _FICHA_TABLAS[clave], box = document.getElementById(T.ed);
  if (!box) return;
  box.innerHTML = '';
  var head = document.createElement('div');
  head.className = 'ficha-ed-fila ficha-ed-head';
  head.style.gridTemplateColumns = 'repeat(' + T.cols.length + ', minmax(0, 1fr)) 26px';
  T.cols.forEach(function(c) { var sp = document.createElement('span'); sp.textContent = c; head.appendChild(sp); });
  head.appendChild(document.createElement('span'));
  box.appendChild(head);
  var cuerpo = document.createElement('div');
  cuerpo.className = 'ficha-ed-cuerpo';
  filas.forEach(function(f) { cuerpo.appendChild(_fichaEdFila(T.cols, f)); });
  box.appendChild(cuerpo);
  var acc = document.createElement('div');
  acc.className = 'ficha-ed-acciones';
  var mas = document.createElement('button');
  mas.type = 'button'; mas.className = 'ficha-ed-btn'; mas.textContent = '+ Agregar fila';
  mas.onclick = function() {
    var fila = _fichaEdFila(T.cols, null);
    cuerpo.appendChild(fila);
    fila.querySelector('input').focus();
  };
  var rst = document.createElement('button');
  rst.type = 'button'; rst.className = 'ficha-ed-btn'; rst.textContent = 'Restablecer';
  rst.onclick = function() { _fichaEdPintar(clave, T.def()); };
  acc.appendChild(mas); acc.appendChild(rst);
  box.appendChild(acc);
}
function _fichaEdLeer(clave) {
  var T = _FICHA_TABLAS[clave], box = document.getElementById(T.ed);
  if (!box) return null;
  var filas = [].slice.call(box.querySelectorAll('.ficha-ed-cuerpo .ficha-ed-fila')).map(function(tr) {
    return [].slice.call(tr.querySelectorAll('input')).map(function(i) { return String(i.value).trim(); });
  }).filter(function(f) { return f.some(function(v) { return v !== ''; }); });
  return (JSON.stringify(filas) === JSON.stringify(T.def())) ? null : filas;
}
var _FICHA_CAMPOS = [
  ['ficha_tension', 'tension'], ['ficha_frecuencia', 'frecuencia'], ['ficha_icc', 'icc'],
  ['ficha_uaisl', 'uaisl'], ['ficha_umando', 'umando'], ['ficha_normas', 'normas'],
  ['ficha_lugar', 'lugar'], ['ficha_entrada', 'entrada'], ['ficha_acc_lat', 'accLat'],
  ['ficha_acc_pos', 'accPos'], ['ficha_ventilacion', 'ventilacion'], ['ficha_calefaccion', 'calefaccion'],
  ['ficha_iluminacion', 'iluminacion'], ['ficha_portacandado', 'portacandado'], ['ficha_relefase', 'releFase'],
  ['ficha_temperatura', 'temperatura'], ['ficha_humedad', 'humedad'], ['ficha_altitud', 'altitud'],
  ['ficha_ambiente', 'ambiente'], ['ficha_mat_barras', 'matBarras'], ['ficha_trat_barras', 'tratBarras'],
  ['ficha_documentos', 'documentos']
];
var _FICHA_TITULOS = {
  1: 'Características eléctricas', 2: 'Normas y ensayos', 3: 'Características constructivas',
  4: 'Componentes', 5: 'Condiciones de ambiente', 6: 'Cables', 7: 'Juego de barras',
  8: 'Identificación', 9: 'Documentos de referencia'
};




function abrirModalFicha(n) {
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(x) { x.classList.remove('activo'); });
  var ov = document.getElementById('modalFicha_overlay');
  if (!ov) return;
  ov.classList.add('activo');
  var m = _fichaDatos();
  _FICHA_CAMPOS.forEach(function(c) {
    var el = document.getElementById(c[0]);
    if (el) el.value = m[c[1]] || '';
  });
  _fichaEdPintar('cables', m.cables || _fichaCablesDef());
  _fichaEdPintar('identificacion', m.identificacion || _fichaIdentDef());
  var sola = (n !== undefined && n !== null) ? String(n) : '';
  ov.querySelectorAll('.m1-card[data-ficha]').forEach(function(c) {
    c.hidden = !!sola && c.getAttribute('data-ficha') !== sola;
  });
  var tit = document.getElementById('modalFicha_titulo');


  if (tit) tit.textContent = sola ? (_FICHA_TITULOS[sola] || '') : 'Datos de la ficha técnica';
  var body = ov.querySelector('.m1-body');
  if (body) body.scrollTop = 0;
  _ubicarPanelDocumentos();
}
function cerrarModalFicha() {
  var ov = document.getElementById('modalFicha_overlay');
  if (ov) ov.classList.remove('activo');
  _soltarPanelDocumentos();
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
}
function confirmarModalFicha() {
  var m = {};
  _FICHA_CAMPOS.forEach(function(c) {
    var el = document.getElementById(c[0]);
    m[c[1]] = el ? String(el.value).trim() : '';
  });


  var _prevF = window._fichaMeta || {};
  m.enPdf = _prevF.enPdf !== false;
  m.metradoEnPdf = _prevF.metradoEnPdf !== false;
  m.senalEnPdf = _prevF.senalEnPdf === true;
  m.sinCajetin = _prevF.sinCajetin === true;
  m.cables = _fichaEdLeer('cables');
  m.identificacion = _fichaEdLeer('identificacion');


  if (_prevF.ocultas) m.ocultas = _prevF.ocultas;
  window._fichaMeta = m;
  if (typeof guardarSesion === 'function') guardarSesion();
  cerrarModalFicha();
  _renderFichaTecnica();


  if (typeof _dpsAvisosTodos === 'function') {
    var _avF = _dpsAvisosTodos();
    if (_avF.length && typeof _avisoFlotante === 'function') _avisoFlotante(_avF.join(' · ') + '.');
  }
}




var _FICHA_LAPIZ = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';


var _FICHA_OJO_OFF = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18 18 0 0 1-2.2 3.2M6.6 6.6A18 18 0 0 0 2 12s3 8 10 8a9 9 0 0 0 5.4-1.6"/>' +
  '<path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m2 2 20 20"/></svg>';
var _FICHA_OJO = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z"/><circle cx="12" cy="12" r="3"/></svg>';
function _fichaCard(n, titulo, inner, conBoton) {
  var acc = conBoton ? ('<div class="ficha-acc">' +
    '<button type="button" class="ficha-edit" onclick="ocultarTablaFicha(' + n + ')" ' +
      'title="Ocultar ' + titulo + '" aria-label="Ocultar ' + titulo + '">' + _FICHA_OJO_OFF + '</button>' +
    '<button type="button" class="ficha-edit" onclick="abrirModalFicha(' + n + ')" ' +
      'title="Editar ' + titulo + '" aria-label="Editar ' + titulo + '">' + _FICHA_LAPIZ + '</button>' +
    '</div>') : '';
  return '<div class="ficha-card">' + acc + '<h3>' + n + '. ' + titulo + '</h3>' + inner + '</div>';
}
function _fichaFila(lbl, val) {
  return '<tr><td class="ft-lbl">' + lbl + '</td><td class="ft-val">' + val + '</td></tr>';
}
function _fichaTabla(filas, head) {
  return '<table class="ficha-tabla"><tbody>' + (head || '') + filas.join('') + '</tbody></table>';
}
function _fichaLista(lineas) {
  var ls = (lineas || []).filter(function(l) { return String(l).trim() !== ''; });
  if (!ls.length) return '<ul class="ficha-lista"><li>&nbsp;</li></ul>';
  return '<ul class="ficha-lista">' + ls.map(function(l) { return '<li>' + _escFicha(l) + '</li>'; }).join('') + '</ul>';
}


function _fichaSistema(d) {
  if (!d) return '—';
  var s = d.fases || '';
  if (s === '3F+N') s = '3F + N';
  if (s === '1F+N') s = '1F + N';
  if (_tierraConPE(d)) s += ' + PE';
  if (_tierraConAislada(d)) s += ' + PE aislada';
  return s || '—';
}


function _fichaElectricas(m) {
  var d = window._panelBusbarData, ig = window._igData;
  var inNom = ig && ig.corriente ? (ig.corriente + ' A') : '—';
  return _fichaTabla([

    _fichaFila('Sistema de alimentación', _escFicha(m.tension) + ' · ' + _escFicha(_fichaSistema(d)) + ' · ' + _escFicha(m.frecuencia)),
    _fichaFila('Corriente nominal (IG)', _escFicha(inNom)),
    _fichaFila('Nivel de cortocircuito', _escFicha(m.icc)),
    _fichaFila('Tensión de aislamiento', _escFicha(m.uaisl)),
    _fichaFila('Tensión de mando', _escFicha(m.umando))
  ]);
}


function _fichaPesoKg(d, dims) {
  if (!d || !dims) return null;
  var W = dims.w * PX_TO_MM, H = dims.h * PX_TO_MM, D = d.profGabMm || 120;
  var inset = 30;

  var bM = (typeof _mandilMarcoBoundsDe === 'function') ? _mandilMarcoBoundsDe(dims.w, dims.h) : null;
  var areas = {
    cuerpo: W * H + 2 * H * D + 2 * W * D,
    puerta: W * H,
    placa: Math.max(0, W - 2 * inset) * Math.max(0, H - 2 * inset),
    mandil: bM ? (bM.width * PX_TO_MM) * (bM.height * PX_TO_MM)
               : Math.max(0, W - 2 * inset) * Math.max(0, H - 2 * inset)
  };
  var kg = 0, alguno = false;
  Object.keys(areas).forEach(function(k) {
    var p = d[k];
    if (!p || !p.espesor) return;
    alguno = true;
    kg += areas[k] * parseFloat(p.espesor) * 7.85e-6;                               
  });
  return alguno ? kg : null;
}
function _fichaConstructivas(m) {
  var d = window._gabineteData;
  if (!d) return '<div class="modo-vacio">Sin gabinete.</div>';
  var PL = (typeof _PLANCHA_LBL !== 'undefined') ? _PLANCHA_LBL
         : { laf: 'LAF', lac: 'LAC', inox: 'Inox.', galv: 'Galv.' };
  var filas = [];
  filas.push(_fichaFila('Lugar de instalación', _escFicha(m.lugar)));
  filas.push(_fichaFila('Tipo de fijación', d.tipo === 'empotrado' ? 'Empotrado' : 'Adosado'));
  filas.push(_fichaFila('Grado de protección', d.ip ? ('IP ' + _escFicha(d.ip)) : '—'));
  var paneles = [
    { key: 'cuerpo', lbl: 'Cuerpo' }, { key: 'puerta', lbl: 'Puerta' },
    { key: 'placa', lbl: 'Placa base' }, { key: 'mandil', lbl: 'Mandil' }
  ].filter(function(pd) { return !!d[pd.key]; });
  paneles.forEach(function(pd) {
    var p = d[pd.key];
    var mat = (PL[p.plancha] || p.plancha || '') + (p.espesor ? ' ' + p.espesor + ' mm' : '');
    filas.push(_fichaFila('Chapa - ' + pd.lbl, _escFicha(mat)));
  });
  var pint = paneles.map(function(pd) { return d[pd.key]; }).filter(function(p) { return p.acabado === 'pintura'; })[0];
  if (pint) {
    filas.push(_fichaFila('Tipo de pintura', 'Electrostática' + (pint.micras ? ' · ' + pint.micras + ' µm' : '')));
    if (pint.ral) filas.push(_fichaFila('Color', 'RAL ' + _escFicha(pint.ral)));
  }
  var cer = (d.cerradura && d.cerradura.puerta) || {};
  var modelo = cer.modelo || (d.tipo === 'empotrado' ? 'MS603-3' : 'MS-705');
  var cerrLbl = (modelo === 'MS603-3') ? 'Push MS603-3' : 'Hermética circular MS-705';

  var cant = (typeof _cantidadChapaPuerta === 'function') ? _cantidadChapaPuerta(cer.cantidad)
           : (parseInt(cer.cantidad, 10) || 1);
  filas.push(_fichaFila('Cerradura de puerta', _escFicha(cerrLbl) + ' × ' + cant));
  var cerM = (d.cerradura && d.cerradura.mandil) || {};
  var cantM = (typeof _cantidadChapaMandil === 'function') ? _cantidadChapaMandil(cerM.cantidad)
            : (parseInt(cerM.cantidad, 10) || 1);
  filas.push(_fichaFila('Manija del mandil', _escFicha(cerM.modelo || 'MS-406') + ' × ' + cantM));
  var sen = d.senaletica || {};
  filas.push(_fichaFila('Señalética riesgo eléctrico', 'Sí' + (sen.tamano ? ' (' + String(sen.tamano).replace('x', ' × ') + ' mm)' : '')));
  var marco = document.getElementById('marco_gabinete');
  var dims = window._vistaFrontalDims || null;
  if (!dims && marco) dims = { w: parseFloat(marco.style.width) || 750, h: parseFloat(marco.style.height) || 750 };
  if (window._vistaActual !== 'lateral' && marco) {                                                             
    dims = { w: parseFloat(marco.style.width) || dims.w, h: parseFloat(marco.style.height) || dims.h };
  }
  if (dims) {
    var prof = (d.profGabMm || 120) + (d.profPuertaMm || 0);
    filas.push(_fichaFila('Dimensiones (Alt × An × Prof)', (dims.h * PX_TO_MM).toFixed(0) + ' × ' +
      (dims.w * PX_TO_MM).toFixed(0) + ' × ' + prof.toFixed(0) + ' mm'));
    var kg = _fichaPesoKg(d, dims);
    if (kg !== null) filas.push(_fichaFila('Peso estimado (chapa)', '~ ' + Math.round(kg) + ' kg'));
  }
  filas.push(_fichaFila('Entrada / salida de cables', _escFicha(m.entrada)));



  if (m.accLat !== 'Ocultar') filas.push(_fichaFila('Acceso lateral', _escFicha(m.accLat)));
  if (m.accPos !== 'Ocultar') filas.push(_fichaFila('Acceso posterior', _escFicha(m.accPos)));
  return _fichaTabla(filas);
}


function _fichaComponentes(m) {
  var itms = (typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []);
  var grupos = (typeof _bornerasGrupos === 'function') ? _bornerasGrupos() : [];
  function _siNo(n) { return n > 0 ? ('Sí (' + n + ')') : 'No'; }




  var nItm = itms.filter(function(i) { return i.tipo !== 'reserva'; }).length +
             (window._igData ? 1 : 0);
  var nRes = itms.filter(function(i) { return i.tipo === 'reserva'; }).length;
  var nDif = itms.filter(function(i) { return i.dif; }).length;
  var nDps = itms.filter(function(i) { return i.dps; }).length;
  var nCon = itms.filter(function(i) { return i.contactor && !i.contactor.reserva; }).length;
  var nPul = itms.filter(function(i) { return i.pulsador && i.contactor; }).length;
  var nTim = grupos.filter(function(g) { return _timerComprado(g); }).length;
  var nBor = grupos.filter(function(g) { return g.clase === 'bornera'; })
                   .reduce(function(a, g) { return a + (parseInt(g.cant, 10) || 0); }, 0);
  var nCan = Object.keys((typeof _canaletasFila === 'function') ? _canaletasFila() : {}).length +
             Object.keys((typeof _canaletasItm === 'function') ? _canaletasItm() : {}).length +
             (window._PRESENCIA_CANALETA ? 1 : 0) +
             grupos.filter(function(g) { return g.canaleta; }).length;



  var pares = [
    ['Interruptor general', window._igData ? 'Sí' : 'No'],
    ['Interruptores termomagnéticos', _siNo(nItm) + (nRes ? ' + ' + nRes + ' reserva' : '')],
    ['Interruptores diferenciales', _siNo(nDif)],
    ['Protección contra sobretensiones (DPS)', _siNo(nDps)],
    ['Contactores', _siNo(nCon)],
    ['Pulsadores / pilotos de mando', _siNo(nPul)],
    ['Temporizadores', _siNo(nTim)],
    ['Borneras de salida', nBor > 0 ? ('Sí (' + nBor + ')') : 'No'],



    ['Presencia de tensión', (typeof _presenciaHay === 'function' && _presenciaHay()) ? 'Sí' : 'No'],
    ['Medición (medidor multifunción)', window._MEDIDOR ? 'Sí' : 'No'],
    ['Canaletas', _siNo(nCan)],
    ['Ventilación / extracción', _escFicha(m.ventilacion)],
    ['Calefacción', _escFicha(m.calefaccion)],
    ['Iluminación interna', _escFicha(m.iluminacion)],
    ['Portacandado', _escFicha(m.portacandado)],
    ['Relé de falla de fase', _escFicha(m.releFase)]
  ].filter(function(p) { return String(p[1]).trim().toLowerCase() !== 'no'; });
  var filas = pares.length
    ? pares.map(function(p) { return _fichaFila(p[0], p[1]); })
    : [_fichaFila('—', 'Sin equipos')];
  return _fichaTabla(filas);
}


function _fichaAmbiente(m) {
  return _fichaTabla([
    _fichaFila('Temperatura de servicio', _escFicha(m.temperatura)),
    _fichaFila('Humedad relativa máxima', _escFicha(m.humedad)),
    _fichaFila('Altitud', _escFicha(m.altitud)),
    _fichaFila('Tipo de ambiente', _escFicha(m.ambiente))
  ]);
}



function _fichaCablesDef() {
  var d = window._panelBusbarData || {};
  var sp = 'Según proyecto';
  var filas = [['Potencia - fase R', 'Rojo', sp], ['Potencia - fase S', 'Negro', sp],
               ['Potencia - fase T', 'Azul', sp]];
  if (d.fases === '3F+N' || d.fases === '1F+N') filas.push(['Neutro', 'Blanco', sp]);
  filas.push(['Tierra', 'Verde / Amarillo', sp]);
  filas.push(['Circuito de mando - fase', 'Rojo', sp]);
  filas.push(['Circuito de mando - neutro', 'Blanco', sp]);
  return filas;
}
function _fichaCables(m) {
  var head = '<tr class="ft-head"><td>Tipo</td><td>Color</td><td>Sección</td></tr>';
  var filas = ((m && m.cables) || _fichaCablesDef()).map(function(f) {
    return '<tr><td class="ft-lbl">' + _escFicha(f[0] || '') + '</td><td class="ft-val">' +
      _escFicha(f[1] || '') + '</td><td class="ft-val">' + _escFicha(f[2] || '') + '</td></tr>';
  });
  return _fichaTabla(filas, head);
}


function _fichaBarras(m) {
  var d = window._panelBusbarData;
  if (!d) return '<div class="modo-vacio">Sin panel busbar.</div>';
  var act = { R: false, S: false, T: false };
  if (d.fases === '3F' || d.fases === '3F+N') { act.R = act.S = act.T = true; }
  else if (d.fases === '2F' && d.subfases) {
    d.subfases.split(' - ').forEach(function(x) { if (act[x] !== undefined) act[x] = true; });
  } else if (d.fases === '1F+N' && d.subfases) {
    var f1 = d.subfases.replace('-N', '').trim();
    if (act[f1] !== undefined) act[f1] = true;
  }
  var head = '<tr class="ft-head"><td>Tipo</td><td>Color</td></tr>';
  var col = [];
  if (act.R) col.push(_fichaFila('Fase R', 'Rojo'));
  if (act.S) col.push(_fichaFila('Fase S', 'Negro'));
  if (act.T) col.push(_fichaFila('Fase T', 'Azul'));
  if (d.fases === '3F+N' || d.fases === '1F+N') col.push(_fichaFila('Neutro', 'Blanco'));
  if (_tierraConPE(d)) col.push(_fichaFila('Tierra (PE)', 'Verde'));
  if (_tierraConAislada(d)) col.push(_fichaFila('Tierra aislada', 'Verde'));
  var ais = (d.aisladoTipo || '').indexOf('0.5s400') === 0 ? 'Aislador 0.5/400' : 'Aislador base';
  var gral = [
    _fichaFila('Material', _escFicha(m.matBarras)),
    _fichaFila('Tratamiento', _escFicha(m.tratBarras)),
    _fichaFila('Orden de barras', _escFicha(_fichaOrdenBusbar(d))),
    _fichaFila('Aislación', ais)
  ];


  var dim = _tablaFichaBarras().replace(
    /<tr><td colspan="2" class="ft-titulo">[^<]*<\/td><\/tr>/, '');
  return _fichaTabla(col, head) + '<div style="height:8px"></div>' + _fichaTabla(gral) +
         '<div style="height:8px"></div>' + dim;
}





function _fichaIdentDef() {
  var itms = (typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []);
  var grupos = (typeof _bornerasGrupos === 'function') ? _bornerasGrupos() : [];
  var hay = function(f) { return itms.some(f); };
  var nCan = Object.keys((typeof _canaletasFila === 'function') ? _canaletasFila() : {}).length +
             Object.keys((typeof _canaletasItm === 'function') ? _canaletasItm() : {}).length +
             (window._PRESENCIA_CANALETA ? 1 : 0) +
             grupos.filter(function(g) { return g.canaleta; }).length;
  var f = [];
  if (window._igData) f.push(['Interruptor general', 'IG']);
  if (itms.length) f.push(['Interruptor termomagnético', 'C-XX']);
  if (hay(function(i) { return i.dif; })) f.push(['Interruptor diferencial', 'ID-XX (del C-XX)']);
  if (hay(function(i) { return i.dps; })) f.push(['DPS', 'DPS (del C-XX)']);
  if (hay(function(i) { return i.contactor; })) f.push(['Contactor', 'K-XX (del C-XX)']);
  if (grupos.some(function(g) { return g.clase === 'timer'; }))
    f.push(['Temporizador', 'T-XX (del C-XX)']);
  if (grupos.some(function(g) { return g.clase === 'bornera'; }))
    f.push(['Borneras', '(B) + rótulo del origen']);

  if (typeof _presenciaHay === 'function' && _presenciaHay())
    f.push(['Presencia de tensión', 'PT · pilotos ' + _fasesPilotos().join(' / ')]);


  if (window._MEDIDOR) f.push(['Medidor multifunción', 'PM · ' + _medidorInfo().tcs.join(', ')]);

  if (window._REJILLA) {
    f.push(['Rejilla de ventilación', 'RV' +
      ((typeof _rejillaTermostato === 'function' && _rejillaTermostato()) ? ' · con termostato' : '')]);
  }
  if (nCan) f.push(['Canaletas', 'CA-XX · fusionadas CAF-XX']);
  return f;
}
function _fichaIdentificacion(m) {
  var head = '<tr class="ft-head"><td>Elemento</td><td>Rótulo</td></tr>';
  return _fichaTabla(((m && m.identificacion) || _fichaIdentDef()).map(function(f) {
    return _fichaFila(_escFicha(f[0] || ''), _escFicha(f[1] || ''));
  }), head);
}


function _fichaDocumentos(m) {
  var meta = window._pdfMeta || {};



  var ls = ["Plano mecánico Table_XD" + (meta.plano ? ' · N° ' + meta.plano : '')];


  if (m.enPdf !== false) ls.push('Ficha técnica');
  if (m.metradoEnPdf !== false) ls.push('Lista de materiales totalizada');
  if (m.senalEnPdf === true) ls.push('Lista de rótulos');
  String(m.documentos || '').split(/\r?\n/).forEach(function(l) { if (l.trim()) ls.push(l.trim()); });
  return _fichaLista(ls);
}









var _FICHA_CAJAS = [
  { n: 1, titulo: 'Características eléctricas',    html: function(m) { return _fichaElectricas(m); } },
  { n: 2, titulo: 'Normas y ensayos',              html: function(m) { return _fichaLista(String(m.normas || '').split(/\r?\n/)); } },
  { n: 6, titulo: 'Cables',                        html: function(m) { return _fichaCables(m); } },
  { n: 4, titulo: 'Componentes',                   html: function(m) { return _fichaComponentes(m); } },
  { n: 5, titulo: 'Condiciones de ambiente',       html: function(m) { return _fichaAmbiente(m); } },
  { n: 3, titulo: 'Características constructivas', html: function(m) { return _fichaConstructivas(m); } },
  { n: 7, titulo: 'Juego de barras',               html: function(m) { return _fichaBarras(m); } },
  { n: 8, titulo: 'Identificación',                html: function(m) { return _fichaIdentificacion(m); } },
  { n: 9, titulo: 'Documentos de referencia',      html: function(m) { return _fichaDocumentos(m); } }
];



function _fichaOcultas() {
  var o = (window._fichaMeta || {}).ocultas;
  return (o && typeof o === 'object') ? o : {};
}
function _fichaVerTabla(n, ver) {
  var oc = {}, vi = _fichaOcultas();
  Object.keys(vi).forEach(function(k) { if (vi[k]) oc[k] = true; });
  if (ver) delete oc[n]; else oc[n] = true;
  window._fichaMeta = Object.assign({}, window._fichaMeta || {}, { ocultas: oc });
  if (typeof guardarSesion === 'function') guardarSesion();
  try { if (window._metradoTab === 'ficha') _renderFichaTecnica(); }
  catch (e) { console.warn('[ficha] no se pudo repintar tras ocultar/mostrar:', e); }
}
function ocultarTablaFicha(n) { _fichaVerTabla(n, false); }
function mostrarTablaFicha(n) { _fichaVerTabla(n, true); }

function _fichaHtml(conBotones) {
  var m = _fichaDatos();
  var hayGab = !!window._gabineteData, hayPb = !!window._panelBusbarData;
  if (!hayGab && !hayPb) return '';
  var b = !!conBotones, oc = _fichaOcultas();


  return _FICHA_CAJAS.filter(function(c) { return !oc[c.n]; })
    .map(function(c) { return _fichaCard(c.n, c.titulo, c.html(m), b); }).join('');
}







function _fichaOcultasBarraHtml(inv) {
  var oc = _fichaOcultas();
  var chips = _FICHA_CAJAS.filter(function(c) { return oc[c.n]; }).map(function(c) {
    return '<button type="button" class="ficha-oculta-chip" onclick="mostrarTablaFicha(' + c.n + ')" ' +
      'title="Mostrar ' + c.titulo + '">' + _FICHA_OJO + _escFicha(c.titulo) + '</button>';
  });
  if (!chips.length) return '';


  var st = (inv && inv !== 1) ? (' style="zoom:' + inv + '"') : '';
  return '<div class="ficha-ocultas"' + st + '><span>Tablas ocultas:</span>' + chips.join('') + '</div>';
}










function _fichaPack(cardsHtml, widthPx, cols, gap, titulo, k) {
  var med = document.createElement('div');
  med.style.cssText = 'position:absolute;left:-100000px;top:0;width:' + widthPx +
    'px;visibility:hidden;pointer-events:none;';



  med.innerHTML = '<div class="ficha-grid ficha-pack">' +
    (titulo ? '<div class="metrado-titulo ficha-titulo"' + (k ? (' style="font-size:' + (24 * k) +
      'px;margin-bottom:' + (12 * k) + 'px;padding-bottom:' + (6 * k) + 'px;border-bottom-width:' + k +
      'px;--hk:' + k + '"') : '') + '>' + titulo + '</div>' : '') +
    cardsHtml + '</div>';
  document.body.appendChild(med);
  var colW = (widthPx - gap * (cols - 1)) / cols;
  var tit = med.querySelector('.ficha-titulo');
  var titH = 0;
  if (tit) {
    var cs = getComputedStyle(tit);
    titH = tit.offsetHeight + (parseFloat(cs.marginBottom) || 0);
  }
  var cards = [].slice.call(med.querySelectorAll('.ficha-card'));
  cards.forEach(function(c) { c.style.width = colW + 'px'; c.style.left = '0px'; c.style.top = '0px'; });
  var alturas = cards.map(function(c) { return c.offsetHeight; });
  var colH = [];
  for (var i = 0; i < cols; i++) colH.push(titH);
  cards.forEach(function(c, i) {
    var k = 0;
    for (var j = 1; j < cols; j++) if (colH[j] < colH[k] - 0.5) k = j;
    c.style.left = (k * (colW + gap)) + 'px';
    c.style.top = colH[k] + 'px';
    colH[k] += alturas[i] + gap;
  });




  cards.slice().sort(function(a, b) {
    var la = parseFloat(a.style.left), lb = parseFloat(b.style.left);
    if (Math.abs(la - lb) > 0.5) return la - lb;
    return parseFloat(a.style.top) - parseFloat(b.style.top);
  }).forEach(function(c, i) {
    var h3 = c.querySelector('h3');
    if (h3) h3.textContent = (i + 1) + '. ' + h3.textContent.replace(/^\s*\d+\.\s*/, '');
  });

  var total = Math.max.apply(null, colH) - gap;
  var wrap = med.firstChild;
  wrap.style.height = total + 'px';
  wrap.style.width = widthPx + 'px';
  var html = wrap.outerHTML;
  med.remove();
  return { html: html, height: total, alturas: alturas };
}






function _fichaPaginas(availW, availH, conBotones) {
  var full = _fichaHtml(conBotones);
  if (!full) return [];
  var tmp = document.createElement('div');
  tmp.innerHTML = full;
  var cards = [].slice.call(tmp.children).map(function(c) { return c.outerHTML; });
  var COLS = 4, GAP = 10, ZMIN = 0.42;
  var _titFicha = 'Ficha técnica' + (conBotones ? _barraImprimirHtml('ficha') : '');
  var zooms = [0.8, 0.75, 0.7, 0.65, 0.6, 0.56, 0.52, 0.48, 0.45, ZMIN];





  function _conMargen(html, z) {
    var k = 0.9 / z;
    return '<div style="padding:' + (6 * k) + 'px ' + (4 * k) + 'px">' + html + '</div>';
  }
  function _anchoUtil(z) { return availW / z - 8 * (0.9 / z); }
  function _altoUtil(z) { return availH / z - 12 * (0.9 / z); }
  for (var i = 0; i < zooms.length; i++) {
    var z = zooms[i];
    var pk = _fichaPack(cards.join(''), _anchoUtil(z), COLS, GAP, _titFicha, 0.9 / z);
    if (pk.height <= _altoUtil(z)) return [{ html: _conMargen(pk.html, z), zoom: z }];
  }


  var z2 = 0.5, pagW = _anchoUtil(z2), pagH = _altoUtil(z2);
  var pags = [], resto = cards.slice();
  while (resto.length) {
    var n = resto.length, tit = pags.length ? '' : _titFicha;
    while (n > 1 && _fichaPack(resto.slice(0, n).join(''), pagW, COLS, GAP, tit, 0.9 / z2).height > pagH) n--;
    pags.push({ html: _conMargen(_fichaPack(resto.slice(0, n).join(''), pagW, COLS, GAP, tit, 0.9 / z2).html, z2),
                zoom: z2 });
    resto = resto.slice(n);
  }
  return pags;
}






function _fichaAreaA4() {
  var MM = 96 / 25.4;
  var CAJ_BAND = 18, CAJ_TB = 64;
  var CAJ_W = 420 * MM - 2 * 20 - 2 * 4, CAJ_H = 297 * MM - 2 * 20 - 2 * 4;
  var pW = (297 - 20) * MM, pH = (210 - 20) * MM;
  return { w: pW * (1 - CAJ_BAND / CAJ_W) - 2 * 3 * MM - 4,
           h: pH * (1 - CAJ_BAND / CAJ_H - CAJ_TB / CAJ_H) - 2 * 3 * MM - 4,
           hojaW: pW, hojaH: pH };
}





function _renderFichaTecnica() {
  var cont = document.getElementById('ficha_contenido');
  if (!cont) return;
  if (!window._gabineteData && !window._panelBusbarData) {
    cont.innerHTML = '<div class="modo-vacio">Sin datos todavía — insertá el Gabinete y el ' +
      'Panel Busbar en el modo Diseño.</div>';
    return;
  }



  if (!_fichaHtml()) {
    cont.innerHTML = '<div class="ficha-ocultas-suelta">' + _fichaOcultasBarraHtml() + '</div>' +
      '<div class="modo-vacio">Todas las tablas están ocultas.</div>';
    return;
  }
  var area = _fichaAreaA4();
  var pags = _fichaPaginas(area.w, area.h, true);
  var wrapW = cont.clientWidth || 1000;
  var fit = Math.min(1, wrapW / area.hojaW);

  var tira = _fichaOcultasBarraHtml(1 / fit);



  var HP = window.hojaProtab;
  var conCaj = !_fichaDatos().sinCajetin && HP && typeof _cajetinMeta === 'function';
  var CB = 18, CT = 64;
  var x0 = area.hojaW * CB / (HP ? HP.ANCHO : 1), y0 = area.hojaH * CB / (HP ? HP.ALTO : 1);
  var tb = area.hojaH * CT / (HP ? HP.ALTO : 1);
  var aL = x0 + (area.hojaW - x0 - area.w) / 2, aT = y0 + (area.hojaH - y0 - tb - area.h) / 2;
  function _marco(i) {
    if (!conCaj) return '';
    var pag = 'Ficha técnica' + (pags.length > 1 ? ' (' + (i + 1) + '/' + pags.length + ')' : '');
    var sv = HP.componer({ l1: '', l2: '', alt: 'Ficha técnica' }, _cajetinMeta(pag, i + 1, pags.length, '—'),
      { svg: '<svg viewBox="0 0 1 1"></svg>', logo: './ProTAB_files/table-xd-report.svg' }).svg;
    sv = sv.replace(/<svg([^>]*?)\swidth="[^"]*"\s+height="[^"]*"/, '<svg$1 width="100%" height="100%" preserveAspectRatio="none"');
    return '<div class="ficha-hoja-marco">' + sv + '</div>';
  }
  cont.innerHTML = pags.map(function(pg, i) {
    return '<div class="ficha-hoja' + (conCaj ? ' ficha-hoja-caj' : '') + '" style="width:' + area.hojaW +
      'px;height:' + area.hojaH + 'px;zoom:' + fit +
      (conCaj ? ';--caj-tb:' + (tb * fit) + 'px' : '') + '">' + _marco(i) +
      '<div class="ficha-hoja-area" style="width:' + area.w + 'px;height:' + area.h + 'px' +
      (conCaj ? ';left:' + aL + 'px;top:' + aT + 'px;transform:none' : '') + '">' +


      '<div style="zoom:' + pg.zoom + ';--ficha-inv:' + (1 / (fit * pg.zoom)) + '">' + pg.html + '</div></div>' +
      (pags.length > 1 && !conCaj ? '<div class="ficha-hoja-num">Hoja ' + (i + 1) + ' / ' + pags.length + '</div>' : '') +
      (i === pags.length - 1 ? tira : '') +
      '</div>';
  }).join('');
}















var _MT_COLS = {
  rot:  { th: 'Rótulos',     cls: 'mt-rot',  val: function(f) { return _escFicha(_metradoRotTxt(f)); } },
  qty:  { th: 'Cantidad',    cls: 'mt-qty',  val: function(f) { return _escFicha(f.qty); } },
  und:  { th: 'Unidad',      cls: 'mt-und',  val: function(f) { return _escFicha(f.unidad || ''); } },
  desc: { th: 'Descripción', cls: 'mt-desc', val: function(f) { return _escFicha(String(f.desc).toUpperCase()); } },
  prov: { th: 'Marca',       cls: 'mt-prov', val: function(f) { return _escFicha(f.marca || ''); } }
};
var _MT_COLS_DEF = ['rot', 'qty', 'und', 'desc', 'prov'];







function _metradoTablaHtml(filas, titulo, conBotones, conBarra, cols, k) {
  cols = (cols && cols.length) ? cols : _MT_COLS_DEF;
  var nCols = cols.length;
  var stTit = (k && k !== 1) ? (' style="font-size:' + (24 * k) + 'px;margin-bottom:' + (12 * k) +
    'px;padding-bottom:' + (6 * k) + 'px;border-bottom-width:' + k + 'px;--hk:' + k + '"') : '';
  var html = (titulo ? '<div class="metrado-titulo sn-titulo"' + stTit + '>' + _escFicha(titulo) +
    ((conBotones && conBarra) ? _barraImprimirHtml('metrado') : '') + '</div>' : '') +
    '<table class="metrado-tabla"><thead><tr>' +
    cols.map(function(c) { return '<th class="' + _MT_COLS[c].cls + '">' + _MT_COLS[c].th + '</th>'; }).join('') +
    '</tr></thead><tbody>';
  filas.forEach(function(f) {


    if (f.subt) {
      html += '<tr class="mt-subt"><td colspan="' + nCols + '">' + _escFicha(f.subt) + '</td></tr>';
      return;
    }




    var btn = conBotones ? ('<button type="button" class="mt-edit" data-clave="' + _escAttr(f.clave) +
      '" onclick="abrirModalMetradoFila(this.dataset.clave)" title="Editar fila" aria-label="Editar fila">' +
      _FICHA_LAPIZ + '</button>') : '';


    var _ovF = document.getElementById('modalMetradoFila_overlay');
    var _ed = conBotones && _metradoFilaEditando && _metradoFilaEditando.clave === f.clave &&
              _ovF && _ovF.classList.contains('activo');
    var _cls = (_ed ? 'mt-editando ' : '') + (f.esTotal ? 'mt-total' : '');
    html += '<tr' + (_cls.trim() ? ' class="' + _cls.trim() + '"' : '') + '>' +
      cols.map(function(c, i) {
        var ult = (i === nCols - 1);
        return '<td class="' + _MT_COLS[c].cls + (ult ? ' mt-ult' : '') + '">' +
               _MT_COLS[c].val(f) + (ult ? btn : '') + '</td>';
      }).join('') + '</tr>';
  });
  return html + '</tbody></table>';
}







function _metradoBloques() {
  var b = [];
  var eq = _filasMetrado();
  if (eq.length) b.push({ titulo: 'Lista de materiales totalizada', filas: eq });
  var mp = _filasMaterialesPanel();


  if (mp.length) b.push({ titulo: 'Materiales del panel busbar', filas: mp,
                          cols: ['qty', 'und', 'desc'] });
  return b;
}




var _METRADO_ZOOMS = [0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45];

function _metradoPaginas(availW, availH, conBotones, bloques) {
  bloques = bloques || _metradoBloques();
  if (!bloques.length) return [];
  var pad = 12;
  var med = document.createElement('div');
  med.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(med);




  function _medir(bl, Z) {



    med.style.zoom = Z;
    med.style.width = (availW / Z) + 'px';
    med.innerHTML = '<div class="metrado-hoja-int">' +
      _metradoTablaHtml(bl.filas, bl.titulo, false, false, bl.cols, 0.9 / Z) + '</div>';
    var tit = med.querySelector('.metrado-titulo');
    var thead = med.querySelector('thead');



    var titMb = tit ? (parseFloat(getComputedStyle(tit).marginBottom) || 0) : 0;
    return { titH: tit ? tit.offsetHeight + titMb : 0,
             headH: thead ? thead.offsetHeight : 40,
             rowsH: [].slice.call(med.querySelectorAll('tbody tr')).map(function(tr) { return tr.offsetHeight; }) };
  }

  function _cortes(bl, Z) {
    var m = _medir(bl, Z), limite = availH / Z - pad;
    var out = [], i = 0, primera = true;
    while (i < bl.filas.length) {
      var usado = (primera ? m.titH : 0) + m.headH, j = i;
      while (j < bl.filas.length && usado + m.rowsH[j] <= limite) { usado += m.rowsH[j]; j++; }
      if (j === i) j = i + 1;                                   
      out.push([i, j]);
      i = j; primera = false;
    }
    return out;
  }







  var Z, cortes;
  for (var z = 0; z < _METRADO_ZOOMS.length; z++) {
    var cand = _METRADO_ZOOMS[z];
    var cs = bloques.map(function(bl) { return _cortes(bl, cand); });
    var entra = cs.every(function(c) { return c.length === 1; });
    if (entra || z === _METRADO_ZOOMS.length - 1) { Z = cand; cortes = cs; break; }
  }
  var pags = [];
  bloques.forEach(function(bl, nb) {
    cortes[nb].forEach(function(r, np) {
      pags.push({ html: '<div class="metrado-hoja-int">' +
                    _metradoTablaHtml(bl.filas.slice(r[0], r[1]), np === 0 ? bl.titulo : '',
                                      conBotones, nb === 0, bl.cols, 0.9 / Z) + '</div>',
                  zoom: Z, desc: bl.titulo });
    });
  });
  med.remove();
  return pags;
}




















var _SENAL_CARAC = 'Fondo negro y letras plateadas en aluminio';
var _SENAL_LETRA_TABLERO = 7;
var _SENAL_LETRA_EQUIPO = 6;



function _senalOrden(a, b) {
  var na = parseInt(String(a.rotulo || '').replace(/\D/g, ''), 10) || 0;
  var nb = parseInt(String(b.rotulo || '').replace(/\D/g, ''), 10) || 0;
  return na - nb;
}

function _filasSenalizacion() {
  var filas = [];
  var rotW = (typeof _MANDIL_ROTULO_W_MM === 'number') ? _MANDIL_ROTULO_W_MM : 30;
  var rotH = (typeof _MANDIL_ROTULO_H_MM === 'number') ? _MANDIL_ROTULO_H_MM : 15;



  var lineasTab = (typeof _tableroLineas === 'function') ? _tableroLineas() : [];
  if (lineasTab.length) {
    filas.push({ clave: 'placa-puerta', cant: 1, lineas: lineasTab, w: 100, h: 40,
                 carac: _SENAL_CARAC, letra: _SENAL_LETRA_TABLERO });
  }


  if (window._igData) {
    filas.push({ cant: 1, lineas: ['IG'], w: rotW, h: rotH,
                 carac: _SENAL_CARAC, letra: _SENAL_LETRA_EQUIPO });
  }




  function _placa(txt) {
    return { cant: 1, lineas: [txt], w: rotW, h: rotH,
             carac: _SENAL_CARAC, letra: _SENAL_LETRA_EQUIPO };
  }
  var _itmsS = ((typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []))
    .slice().sort(_senalOrden);
  _itmsS.forEach(function(it) { if (it.rotulo) filas.push(_placa(it.rotulo)); });
  _itmsS.forEach(function(it) {
    if (it.dif && it.rotulo) filas.push(_placa(_rotuloID(it.rotulo)));
  });


  var _grS = (typeof _bornerasGrupos === 'function') ? _bornerasGrupos() : [];


  var _tS = [], _tN = {};
  _grS.forEach(function(g) {
    if (!_timerComprado(g)) return;
    var r = (typeof _bornerasPertenece === 'function') ? _bornerasPertenece(g) : '';
    if (!r) return;
    if (!_tN[r]) { _tN[r] = 0; _tS.push(r); }
    _tN[r]++;
  });
  _tS.sort(function(a, b) { return _senalOrden({ rotulo: a }, { rotulo: b }); })
     .forEach(function(r) { var f = _placa(r); f.cant = _tN[r]; filas.push(f); });

  return _senalAplicarEdiciones(filas);
}







var _SENAL_CAMPOS = ['cant', 'desc', 'med', 'carac', 'letra'];
function _senalTextos(f) {
  return { cant: String(f.cant), desc: f.lineas.join('\n'),
           med: f.w + ' \u00d7 ' + f.h + ' mm', carac: f.carac, letra: f.letra + ' mm' };
}
function _senalAplicarEdiciones(filas) {
  var meta = window._senalMeta || {};
  var ed = meta.filas || {};
  filas.forEach(function(f) {
    f.clave = f.clave || ('rot:' + f.lineas[0]);
    f.auto = _senalTextos(f);
    f.txt = _senalTextos(f);



    if (typeof meta.caracTodas === 'string') f.txt.carac = meta.caracTodas;
    var e = ed[f.clave];
    if (!e) return;
    _SENAL_CAMPOS.forEach(function(k) { if (e[k] !== undefined) f.txt[k] = e[k]; });
  });
  return filas;
}






var _HOJA_FLAG = { metrado: 'metradoEnPdf', ficha: 'enPdf', senal: 'senalEnPdf' };

var _IMPRESORA_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<polyline points="6 9 6 2 18 2 18 9"/>' +
  '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>' +
  '<rect x="6" y="14" width="12" height="8"/></svg>';
function _barraImprimirHtml(tipo) {
  var fm = _fichaDatos();
  var anexada = (tipo === 'senal') ? fm.senalEnPdf === true : fm[_HOJA_FLAG[tipo]] !== false;
  return '<div class="sn-acciones">' +
    '<label class="sn-anexar"><input type="checkbox"' + (anexada ? ' checked' : '') +
    ' onchange="anexarHojaAlPlano(\'' + tipo + '\', this.checked)"> Anexar al plano mecánico</label>' +
    (tipo === 'ficha' ? '<label class="sn-anexar"><input type="checkbox"' + (fm.sinCajetin ? ' checked' : '') +
      ' onchange="fichaSinCajetin(this.checked)"> Mostrar sin cajetín</label>' : '') +
    '<button type="button" class="sn-imprimir exp-btn" onclick="abrirMenuExportar(this, \'' + tipo + '\')" ' +
    'title="Guardar como PDF o Excel">' + _EXPORTAR_SVG + 'Exportar</button>' +
    '</div>';
}

var _EXPORTAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>' +
  '<line x1="12" y1="15" x2="12" y2="3"/></svg>';
function imprimirHoja(tipo) {
  if (typeof exportarPDF === 'function') exportarPDF({ solo: tipo });
}





var _HOJA_ARCHIVO = { metrado: 'lista_de_materiales', ficha: 'ficha_tecnica', senal: 'lista_de_rotulos' };

function _textoCelda(el) {



  var lineas = [], cur = '';
  var cortar = function() { var t = cur.replace(/\s+/g, ' ').trim(); if (t) lineas.push(t); cur = ''; };
  [].forEach.call(el.childNodes, function(n) {
    if (n.nodeType === 3) { cur += n.textContent; return; }
    if (n.nodeType !== 1) return;
    var tag = n.tagName;
    if (tag === 'BR') { cortar(); return; }
    if (tag === 'DIV' || tag === 'LI' || tag === 'P') {
      cortar();
      var t = n.textContent.replace(/\s+/g, ' ').trim();
      if (t) lineas.push(t);
      return;
    }
    cur += n.textContent;
  });
  cortar();
  return lineas.join('\n');
}
function _xlsxNum(t) {
  return /^-?\d+(?:[.,]\d+)?$/.test(t) ? parseFloat(t.replace(',', '.')) : t;
}
function _xlsxCabecera(titulo, n) {
  var m = (typeof _cajetinMeta === 'function') ? _cajetinMeta('', 1, 1) : {};
  var tab = window._TABLERO || {};
  var E = XLSX_EST, filas = [];
  filas.push({ celdas: [{ v: titulo.toUpperCase(), s: E.titulo, span: n }], alto: 24 });
  var dato = function(lbl, v) { if (v) filas.push({ celdas: [{ v: lbl + ': ' + v, s: E.dato, span: n }] }); };
  dato('Tablero', (tab.nombre || '') + (tab.abreviatura ? ' (' + tab.abreviatura + ')' : ''));
  dato('Proyecto', m.proyecto);
  dato('Cliente', m.cliente);
  dato('Fecha', m.fecha);
  filas.push({ celdas: [], alto: 8 });
  return filas;
}




function _xlsxHojaFicha() {
  var html = _fichaHtml(false);
  if (!html) return null;
  var cont = document.createElement('div');
  cont.innerHTML = html;
  var N = 3, E = XLSX_EST;
  var filas = _xlsxCabecera('Ficha técnica', N);
  var cajas = [].slice.call(cont.querySelectorAll('.ficha-card')).sort(function(a, b) {
    return (parseInt(a.querySelector('h3').textContent, 10) || 0) - (parseInt(b.querySelector('h3').textContent, 10) || 0);
  });
  cajas.forEach(function(caja, ic) {
    if (ic) filas.push({ celdas: [], alto: 8 });
    filas.push({ celdas: [{ v: caja.querySelector('h3').textContent.trim(), s: E.seccion, span: N }], alto: 20 });
    [].forEach.call(caja.children, function(el) {
      if (el.tagName === 'TABLE') {
        [].forEach.call(el.querySelectorAll('tr'), function(tr) {
          var tds = [].slice.call(tr.children);
          if (!tds.length) return;
          var cab = tr.classList.contains('ft-head');
          var celdas = tds.map(function(td, k) {
            var ult = k === tds.length - 1;
            var s = cab ? E.encabezado
                  : (k === 0 ? E.etiqueta : (td.classList.contains('ft-num') ? E.numero : E.celda));
            return { v: _textoCelda(td), s: s, span: ult ? Math.max(1, N - k) : 1 };
          });
          filas.push({ celdas: celdas });
        });
      } else if (el.tagName === 'UL' || el.tagName === 'OL') {
        [].forEach.call(el.children, function(li) {
          var t = li.textContent.trim();
          if (t) filas.push({ celdas: [{ v: '•  ' + t, s: E.item, span: N }] });
        });
      } else if (el.tagName === 'DIV' && !el.textContent.trim()) {

        filas.push({ celdas: [], alto: 6 });
      }
    });
  });
  return { nombre: 'Ficha técnica', cols: [34, 30, 26], filas: filas };
}




var _XLSX_COL_NUM = /(^|\s)(mt-qty|sn-qty)(\s|$)/;
function _xlsxHojaTabla(nombre, titulo, tablaHtml) {
  var cont = document.createElement('div');
  cont.innerHTML = tablaHtml;
  var tabla = cont.querySelector('table');
  if (!tabla) return null;
  var E = XLSX_EST;
  var ths = [].slice.call(tabla.querySelectorAll('thead th'));
  var N = ths.length || 1;
  var esNum = ths.map(function(th) { return _XLSX_COL_NUM.test(th.className); });
  var anchos = ths.map(function(th) { return th.textContent.trim().length + 4; });
  var filas = _xlsxCabecera(titulo, N);
  filas.push({ celdas: ths.map(function(th) { return { v: th.textContent.trim(), s: E.encabezado }; }), alto: 20 });
  [].forEach.call(tabla.querySelectorAll('tbody tr'), function(tr) {
    if (tr.classList.contains('mt-subt')) {
      filas.push({ celdas: [{ v: tr.textContent.trim(), s: E.subtitulo, span: N }] });
      return;
    }
    var total = tr.classList.contains('mt-total');
    filas.push({ celdas: [].map.call(tr.children, function(td, k) {
      var t = _textoCelda(td);
      t.split('\n').forEach(function(l) { anchos[k] = Math.max(anchos[k] || 0, l.length + 3); });
      var num = esNum[k];
      return { v: num ? _xlsxNum(t) : t,
               s: total ? (num ? E.totalNum : E.total) : (num ? E.numero : E.celda) };
    }) });
  });
  var cols = anchos.map(function(w) { return Math.min(60, Math.max(9, w)); });
  return { nombre: nombre, cols: cols, filas: filas, horizontal: N >= 5 };
}

function _xlsxHojasDe(tipo) {
  if (tipo === 'ficha') { var hf = _xlsxHojaFicha(); return hf ? [hf] : []; }
  if (tipo === 'senal') {
    var fs = _filasSenalizacion();
    if (!fs.length) return [];
    return [_xlsxHojaTabla('Lista de rótulos', 'Lista de rótulos', _senalTablaHtml(fs, false, false))];
  }
  return _metradoBloques().map(function(b, i) {
    return _xlsxHojaTabla(i === 0 ? 'Lista de materiales' : 'Materiales panel busbar', b.titulo,
                          _metradoTablaHtml(b.filas, null, false, false, b.cols));
  }).filter(Boolean);
}

function exportarHojaExcel(tipo) {
  var hojas = [];
  try { hojas = _xlsxHojasDe(tipo); } catch (e) { console.warn('[exportarHojaExcel]', e); }
  if (!hojas.length) {
    if (typeof _avisoFlotante === 'function') _avisoFlotante('Esta hoja todavía no tiene datos.');
    return;
  }
  var datos = xlsxLibro(hojas);
  guardarArchivoBinario(nombreArchivoDoc(_HOJA_ARCHIVO[tipo] || tipo, 'xlsx'), datos, 'xlsx',
    'Libro de Excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').catch(function(e) {
    console.warn('[exportarHojaExcel] no se pudo guardar:', e);
    if (typeof _avisoFlotante === 'function') _avisoFlotante('No se pudo guardar el Excel.');
  });
}



function fichaSinCajetin(si) {
  window._fichaMeta = Object.assign({}, window._fichaMeta || {}, { sinCajetin: !!si });
  if (typeof guardarSesion === 'function') guardarSesion();
  try { if (window._metradoTab === 'ficha') _renderFichaTecnica(); }
  catch (e) { console.warn('[fichaSinCajetin] no se pudo repintar la ficha:', e); }
}
function anexarHojaAlPlano(tipo, si) {
  var o = {}; o[_HOJA_FLAG[tipo]] = !!si;
  window._fichaMeta = Object.assign({}, window._fichaMeta || {}, o);
  if (typeof guardarSesion === 'function') guardarSesion();


  try { if (window._metradoTab === 'ficha') _renderFichaTecnica(); }
  catch (e) { console.warn('[anexarHojaAlPlano] no se pudo repintar la ficha:', e); }
}

var _senalFilaEditando = null;
function abrirModalSenalFila(clave) {
  var f = null;
  _filasSenalizacion().forEach(function(x) { if (x.clave === clave) f = x; });
  if (!f) return;
  _senalFilaEditando = f;
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(x) { x.classList.remove('activo'); });
  var ov = document.getElementById('modalSenalFila_overlay');
  if (!ov) return;
  _pintarCamposSenalFila(f.txt);
  var chkT = document.getElementById('snFila_caracTodas');
  if (chkT) chkT.checked = typeof (window._senalMeta || {}).caracTodas === 'string';
  ov.classList.add('activo');
  _renderSenalizacion();                                             
  _ubicarPanelDocumentos();
}
function _pintarCamposSenalFila(val) {
  _SENAL_CAMPOS.forEach(function(k) {
    var el = document.getElementById('snFila_' + k);
    if (el) el.value = val[k] || '';
  });
  var d = document.getElementById('snFila_desc');
  if (d) d.rows = Math.max(1, String(val.desc || '').split('\n').length);
}
function restablecerSenalFila() {
  if (_senalFilaEditando) _pintarCamposSenalFila(_senalFilaEditando.auto);
}
function cerrarModalSenalFila() {
  var ov = document.getElementById('modalSenalFila_overlay');
  if (ov) ov.classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
  _soltarPanelDocumentos();
  var habia = !!_senalFilaEditando;
  _senalFilaEditando = null;
  if (habia) _renderSenalizacion();                           
}
function confirmarModalSenalFila() {
  var f = _senalFilaEditando;
  if (!f) { cerrarModalSenalFila(); return; }
  var meta = window._senalMeta || { filas: {} };
  if (!meta.filas) meta.filas = {};





  var chkT = document.getElementById('snFila_caracTodas');
  var elC = document.getElementById('snFila_carac');
  var carac = elC ? String(elC.value).replace(/\r/g, '').trim() : '';
  if (chkT && chkT.checked) {
    meta.caracTodas = carac;
    Object.keys(meta.filas).forEach(function(k) { delete meta.filas[k].carac; });
  }




  var e = {};
  _SENAL_CAMPOS.forEach(function(k) {
    var el = document.getElementById('snFila_' + k);
    var v = el ? String(el.value).replace(/\r/g, '').trim() : '';
    var base = (k === 'carac' && typeof meta.caracTodas === 'string') ? meta.caracTodas : f.auto[k];
    if (v !== String(base || '')) e[k] = v;
  });
  if (Object.keys(e).length) meta.filas[f.clave] = e;
  else delete meta.filas[f.clave];
  Object.keys(meta.filas).forEach(function(k) {
    if (!Object.keys(meta.filas[k]).length) delete meta.filas[k];
  });
  window._senalMeta = (Object.keys(meta.filas).length || typeof meta.caracTodas === 'string')
    ? meta : null;
  if (typeof guardarSesion === 'function') guardarSesion();
  cerrarModalSenalFila();
}

function _senalTablaHtml(filas, conTitulo, conBotones) {



  var acc = (conTitulo && conBotones) ? _barraImprimirHtml('senal') : '';
  var html = (conTitulo ? '<div class="metrado-titulo sn-titulo">Lista de rótulos' + acc + '</div>' : '') +
    '<table class="metrado-tabla"><thead><tr>' +
    '<th class="sn-qty">Total</th><th class="sn-desc">Descripción</th>' +
    '<th class="sn-med">Medida</th><th class="sn-carac">Características</th>' +
    '<th class="sn-letra">Tamaño de letra</th>' +
    '</tr></thead><tbody>';
  filas.forEach(function(f) {
    var t = f.txt || _senalTextos(f);
    var desc = String(t.desc).split('\n').map(function(l) {
      return '<div>' + _escFicha(String(l).toUpperCase()) + '</div>';
    }).join('');


    var btn = conBotones ? ('<button type="button" class="mt-edit" data-clave="' + _escAttr(f.clave) +
      '" onclick="abrirModalSenalFila(this.dataset.clave)" title="Editar fila" aria-label="Editar fila">' +
      _FICHA_LAPIZ + '</button>') : '';
    var ovS = document.getElementById('modalSenalFila_overlay');
    var ed = conBotones && _senalFilaEditando && _senalFilaEditando.clave === f.clave &&
             ovS && ovS.classList.contains('activo');
    html += '<tr' + (ed ? ' class="mt-editando"' : '') + '><td class="sn-qty">' + _escFicha(t.cant) + '</td>' +
      '<td class="sn-desc">' + desc + '</td>' +
      '<td class="sn-med">' + _escFicha(t.med) + '</td>' +
      '<td class="sn-carac">' + _escFicha(t.carac) + '</td>' +
      '<td class="sn-letra">' + _escFicha(t.letra) + btn + '</td></tr>';
  });
  return html + '</tbody></table>';
}



function _senalPaginas(availW, availH, conBotones) {
  var filas = _filasSenalizacion();
  if (!filas.length) return [];
  var Z = 0.9;
  var med = document.createElement('div');
  med.style.cssText = 'position:absolute;left:-100000px;top:0;width:' + (availW / Z) +
    'px;visibility:hidden;pointer-events:none;';
  med.innerHTML = '<div class="metrado-hoja-int">' + _senalTablaHtml(filas, true) + '</div>';
  document.body.appendChild(med);
  var tit = med.querySelector('.metrado-titulo');
  var thead = med.querySelector('thead');
  var titH = tit ? tit.offsetHeight + 12 : 0;
  var headH = thead ? thead.offsetHeight : 40;
  var rowsH = [].slice.call(med.querySelectorAll('tbody tr')).map(function(tr) { return tr.offsetHeight; });
  med.remove();
  var limite = availH / Z - 12;
  var pags = [], i = 0, primera = true;
  while (i < filas.length) {
    var usado = (primera ? titH : 0) + headH, j = i;
    while (j < filas.length && usado + rowsH[j] <= limite) { usado += rowsH[j]; j++; }
    if (j === i) j = i + 1;
    pags.push({ html: '<div class="metrado-hoja-int">' + _senalTablaHtml(filas.slice(i, j), primera, conBotones) + '</div>',
                zoom: Z });
    i = j; primera = false;
  }
  return pags;
}

function _renderSenalizacion() {
  var cont = document.getElementById('senal_contenido');
  if (!cont) return;
  var area = _fichaAreaA4();
  var pags = _senalPaginas(area.w, area.h, true);
  if (!pags.length) {
    cont.innerHTML = '<div class="modo-vacio">Sin rótulos todavía — nombrá el ' +
      'tablero e insertá los circuitos en el modo Diseño.</div>';
    return;
  }
  var wrapW = cont.clientWidth || 1000;
  var fit = Math.min(1, wrapW / area.hojaW);
  cont.innerHTML = pags.map(function(pg, i) {
    return '<div class="ficha-hoja" style="width:' + area.hojaW + 'px;height:' + area.hojaH +
      'px;zoom:' + fit + '">' +
      '<div class="ficha-hoja-area" style="width:' + area.w + 'px;height:' + area.h + 'px">' +
      '<div style="zoom:' + pg.zoom + '">' + pg.html + '</div></div>' +
      (pags.length > 1 ? '<div class="ficha-hoja-num">Hoja ' + (i + 1) + ' / ' + pags.length + '</div>' : '') +
      '</div>';
  }).join('');
}

function _renderModoMetrado() {
  var cont = document.getElementById('metrado_contenido');
  if (!cont) return;



  if (window._metradoTab && window._metradoTab !== 'metrado') {
    if (window._metradoTab === 'plano') { _renderModoPlano(); return; }
    if (window._metradoTab === 'unifilar' && typeof _renderUnifilarHoja === 'function') { _renderUnifilarHoja(); return; }
    if (window._metradoTab === 'control' && typeof _renderControlHojas === 'function') { _renderControlHojas(); return; }
    if (window._metradoTab === 'ficha') { _renderFichaTecnica(); return; }
    if (window._metradoTab === 'senal') { _renderSenalizacion(); return; }
    if (window._metradoTab === 'fab' && typeof _renderFabricacion === 'function') { _renderFabricacion(); return; }
    return;
  }
  var filas = _metradoBloques();
  if (!filas.length) {
    cont.innerHTML = '<div class="modo-vacio">Sin equipos todavía — insertá el ' +
      'Panel Busbar y los circuitos en el modo Diseño.</div>';
    if (window._metradoTab === 'ficha') _renderFichaTecnica();
    if (window._metradoTab === 'senal') _renderSenalizacion();
    return;
  }


  if (typeof fabMaterialesDatos === 'function' && !fabMaterialesDatos() &&
      typeof fabMaterialesCargar === 'function' && !window._metradoPidiendoMat) {
    window._metradoPidiendoMat = true;
    fabMaterialesCargar().then(function(x) {
      window._metradoPidiendoMat = false;
      if (x && window._modoEditor === 'metrado') _renderModoMetrado();
    }, function(e) {
      window._metradoPidiendoMat = false;
      console.warn('[metrado] no se pudo armar la lista de pletina y perneria:', e);
    });
  }
  var area = _fichaAreaA4();


  var pags = _metradoPaginas(area.w, area.h, true, filas);
  var wrapW = cont.clientWidth || 1000;
  var fit = Math.min(1, wrapW / area.hojaW);
  cont.innerHTML = pags.map(function(pg, i) {
    return '<div class="ficha-hoja" style="width:' + area.hojaW + 'px;height:' + area.hojaH +
      'px;zoom:' + fit + '">' +
      '<div class="ficha-hoja-area" style="width:' + area.w + 'px;height:' + area.h + 'px">' +
      '<div style="zoom:' + pg.zoom + ';--ficha-inv:' + (1 / (fit * pg.zoom)) + '">' + pg.html + '</div></div>' +
      (pags.length > 1 ? '<div class="ficha-hoja-num">Hoja ' + (i + 1) + ' / ' + pags.length + '</div>' : '') +
      '</div>';
  }).join('');
  if (window._metradoTab === 'ficha') _renderFichaTecnica();
  if (window._metradoTab === 'senal') _renderSenalizacion();
}








var _PLANO_QUITAR = '.elim-varios-x, .alim-cable, .cota-cv, .cota-pb, .cota-cr, .cota-ct, .cota-cp, .canaleta-guia, .canaleta-rotulo, .mover-inf-ctrl, ' +
  '.tri-clickeable, .tri-insertado, .itm-tri, .dif-tri, .ig-tri, .dps-tri, ' +
  '.contactor-tri, .puerta-puls-tri, .puerta-puls-aura, ' +
  '.bornera-tri, .bornera-presencia-tri, .barra-tri, .equipo-aura, .born-sitio, ' +
  '.dif-context-menu, #modo_copia_hint';






function _capturarVista(v, opts) {
  var _quitar = (opts && opts.sinCotasGab)
    ? (_PLANO_QUITAR + ', .cota-gab, .cota-gab-ext') : _PLANO_QUITAR;
  aplicarVista(v);
  var marco = document.getElementById('marco_gabinete');
  var zBk = marco.style.zoom;
  var fsBk = marco.style.flexShrink;
  marco.style.zoom = '1';




  marco.style.flexShrink = '0';
  try {
  var mW = parseFloat(marco.style.width) || marco.offsetWidth;
  var mH = parseFloat(marco.style.height) || marco.offsetHeight;






  var mR = marco.getBoundingClientRect();
  var minX = 0, minY = 0;
  var maxX = mW, maxY = mH;
  var src = marco.querySelectorAll('*');
  for (var b = 0; b < src.length; b++) {
    if (src[b].closest(_quitar)) continue;
    var csB = getComputedStyle(src[b]);
    if (csB.display === 'none' || csB.visibility === 'hidden') continue;
    var r = src[b].getBoundingClientRect();
    if (r.width < 1 && r.height < 1) continue;
    if (r.left - mR.left < minX) minX = r.left - mR.left;
    if (r.top - mR.top < minY) minY = r.top - mR.top;
    if (r.right - mR.left > maxX) maxX = r.right - mR.left;
    if (r.bottom - mR.top > maxY) maxY = r.bottom - mR.top;
  }

  var cl = marco.cloneNode(true);
  var dst = cl.querySelectorAll('*');
  for (var i = 0; i < src.length && i < dst.length; i++) {
    dst[i].removeAttribute('id');                                       
    var cs = getComputedStyle(src[i]);
    dst[i].style.display = cs.display;
    dst[i].style.visibility = cs.visibility;









    var _numCota = dst[i].classList.contains('cota-mi-val') ||
                   dst[i].classList.contains('cota-mi-val-v');
    if (cs.position !== 'static' && !_numCota) {

      dst[i].style.position = cs.position;
      dst[i].style.left = cs.left;
      dst[i].style.top = cs.top;
      dst[i].style.right = cs.right;
      dst[i].style.bottom = cs.bottom;
      dst[i].style.width = cs.width;
      dst[i].style.height = cs.height;
      dst[i].style.transform = cs.transform;
      dst[i].style.zIndex = cs.zIndex;
      dst[i].style.borderTop = cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor;
      dst[i].style.borderRight = cs.borderRightWidth + ' ' + cs.borderRightStyle + ' ' + cs.borderRightColor;
      dst[i].style.borderBottom = cs.borderBottomWidth + ' ' + cs.borderBottomStyle + ' ' + cs.borderBottomColor;
      dst[i].style.borderLeft = cs.borderLeftWidth + ' ' + cs.borderLeftStyle + ' ' + cs.borderLeftColor;
      dst[i].style.borderRadius = cs.borderRadius;
      dst[i].style.backgroundColor = cs.backgroundColor;
      dst[i].style.boxShadow = cs.boxShadow;
      dst[i].style.outline = cs.outline;
      dst[i].style.outlineOffset = cs.outlineOffset;
      dst[i].style.boxSizing = cs.boxSizing;
    }
  }
  cl.removeAttribute('id');



  cl.querySelectorAll(_quitar).forEach(function(el) { el.remove(); });

  var csM = getComputedStyle(marco);
  cl.style.cssText = 'position:absolute; margin:0; ' +
    'width:' + mW + 'px; height:' + mH + 'px; ' +
    'background:' + csM.backgroundColor + '; ' +
    'outline:2px solid #000; outline-offset:-1px;';

  return { el: cl, w: maxX - minX, h: maxY - minY, offX: -minX, offY: -minY };
  } finally {



    marco.style.zoom = zBk;
    marco.style.flexShrink = fsBk;
  }
}





function _planoHojaEscalar() {


  ['plano_grid', 'unifilar_doc_grid'].forEach(function(id) {
    var grid = document.getElementById(id);
    var caja = grid && grid.querySelector('.plano-hoja');
    var ifr = caja && caja.querySelector('iframe');
    if (!ifr || !grid.clientWidth) return;                                                
    var W = parseFloat(ifr.dataset.w), H = parseFloat(ifr.dataset.h);
    var aw = grid.clientWidth - 8, ah = grid.clientHeight - 8;
    var k = Math.max(0.2, Math.min(aw / W, ah / H));
    ifr.style.transform = 'scale(' + k + ')';
    caja.style.width = (W * k) + 'px';
    caja.style.height = (H * k) + 'px';
  });
}
function _renderModoPlano() {
  var grid = document.getElementById('plano_grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!window._gabineteData) {
    grid.innerHTML = '<div class="modo-vacio">Sin gabinete todavía — armá el ' +
      'tablero en el modo Diseño.</div>';
    return;
  }
  var html = _planoHtml({ preview: true });
  if (!html) return;




  var MMp = 96 / 25.4, W = (297 - 20) * MMp, H = (210 - 20) * MMp;
  html = html.replace('</head>', '<style>.pw-page { left: 1px !important; top: 1px !important; ' +
    'right: 1px !important; bottom: 1px !important; }</style></head>');
  var caja = document.createElement('div');
  caja.className = 'plano-hoja';
  var ifr = document.createElement('iframe');
  ifr.className = 'plano-hoja-ifr';
  ifr.setAttribute('title', 'Plano mecánico');
  ifr.style.width = W + 'px';
  ifr.style.height = H + 'px';
  ifr.dataset.w = W; ifr.dataset.h = H;
  caja.appendChild(ifr);
  grid.appendChild(caja);
  var d = ifr.contentDocument;
  d.open(); d.write(html); d.close();
  _planoHojaEscalar();
  if (!window._planoHojaResize) {
    window._planoHojaResize = true;
    window.addEventListener('resize', _planoHojaEscalar);
  }
}
