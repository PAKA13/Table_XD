








function bibInsertarGabinete() {
  abrirModalGab();
}



function actualizarBibliotecaGabinete() {
  var item   = document.getElementById('bib_item_gabinete');
  var estado = document.getElementById('bib_gab_estado');
  var editBtn = document.getElementById('bib_gab_editbtn');
  var d = window._gabineteData;
  if (d) {
    if (item) item.classList.add('insertado');
    if (estado) {
      var tipoLabel = d.tipo === 'empotrado' ? 'Empotrado' : 'Adosado';
      estado.textContent = tipoLabel;
    }
    if (editBtn) editBtn.style.display = '';
  } else {
    if (item) item.classList.remove('insertado');
    if (estado) estado.textContent = 'Sin insertar';
    if (editBtn) editBtn.style.display = 'none';
  }
  actualizarBibliotecaPB();                                           
}






function _tableroListo() {
  return !!(window._gabineteData && window._panelBusbarData);
}





function _bibGateSinGabinete() {
  var sin = !_tableroListo();
  document.body.classList.toggle('sin-tablero', sin);


  var bC = document.getElementById('bib_tab_btn_cotas');
  if (sin && bC && bC.classList.contains('activo')) bibSwitchTab('estructura');
}



function _bibExpandir() {
  if (document.body.classList.contains('bib-colapsada')) bibToggleColapsar();
}


function bibInsertarPB() {
  if (!window._gabineteData) {
    if (typeof onTriangleClick === 'function') {
      var aviso = document.getElementById('aviso_flotante');
      if (!aviso) {
        aviso = document.createElement('div');
        aviso.id = 'aviso_flotante';
        aviso.className = 'aviso-flotante';
        document.body.appendChild(aviso);
      }
      aviso.textContent = 'Primero inserta el Gabinete — el Panel Busbar vive dentro de él.';
      aviso.style.display = 'block';
      clearTimeout(aviso._t);
      aviso._t = setTimeout(function() { aviso.style.display = 'none'; }, 2600);
    }
    return;
  }
  abrirModalPB();
}


function actualizarBibliotecaPB() {
  var item    = document.getElementById('bib_item_pb');
  var estado  = document.getElementById('bib_pb_estado');
  var editBtn = document.getElementById('bib_pb_editbtn');
  var pb  = window._panelBusbarData;
  var gab = window._gabineteData;
  if (pb) {
    if (item) { item.classList.add('insertado'); item.classList.remove('bib-item-disabled'); }
    if (estado) estado.textContent = _pbTextoCorto(pb);
    if (editBtn) editBtn.style.display = '';
  } else {
    if (item) {
      item.classList.remove('insertado');
      item.classList.toggle('bib-item-disabled', !gab);
    }
    if (estado) estado.textContent = gab ? 'Sin insertar' : 'Requiere Gabinete';
    if (editBtn) editBtn.style.display = 'none';
  }
  if (typeof actualizarBibliotecaIG === 'function') actualizarBibliotecaIG();
  _bibGateSinGabinete();
}


function bibInsertarIG() {
  if (!window._panelBusbarData) {
    _avisoFlotante('Primero inserta el Panel Busbar — el IG se conecta a sus busbars.');
    return;
  }
  abrirModalIG();
}

function actualizarBibliotecaIG() {
  var item    = document.getElementById('bib_item_ig');
  var estado  = document.getElementById('bib_ig_estado');
  var editBtn = document.getElementById('bib_ig_editbtn');
  var ig = window._igData;
  var pb = window._panelBusbarData;
  var tipoLabels = { riel: 'ITM Riel', cm_fijo: 'ITM CM Fijo', cm_reg: 'ITM CM Reg' };
  if (ig) {
    if (item) { item.classList.add('insertado'); item.classList.remove('bib-item-disabled'); }
    if (estado) {
      estado.textContent = (tipoLabels[ig.tipo] || ig.tipo) + ' ' +
                           ig.polos + 'P' + (ig.corriente ? ' ' + ig.corriente + 'A' : '');
    }
    if (editBtn) editBtn.style.display = '';
  } else {
    if (item) {
      item.classList.remove('insertado');
      item.classList.toggle('bib-item-disabled', !pb);
    }
    if (estado) estado.textContent = pb ? 'Sin insertar' : 'Requiere Panel Busbar';
    if (editBtn) editBtn.style.display = 'none';
  }
  if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
  if (typeof actualizarBibliotecaOtros === 'function') actualizarBibliotecaOtros();
}






function bibInsertarITM() {
  if (!window._panelBusbarData) {
    _avisoFlotante('Primero inserta el Panel Busbar — los ITMs se conectan a sus polos.');
    return;
  }
  var ctr = document.getElementById('panel_busbar_container');
  var tris = ctr ? ctr.querySelectorAll('.tri-clickeable') : [];
  if (!tris.length) {
    _avisoFlotante('No quedan polos libres en el panel para insertar más ITMs.');
    return;
  }
  _avisoFlotante('Haz click en uno de los triángulos rojos del panel para insertar el ITM.');
  _pulsarTemporal(tris);
}

function bibInsertarDIF() {
  if (!window._panelBusbarData) {
    _avisoFlotante('Primero inserta el Panel Busbar y al menos un ITM.');
    return;
  }
  if (!window._itmList || !window._itmList.length) {
    _avisoFlotante('Primero inserta un ITM — el diferencial se asocia a un circuito derivado.');
    return;
  }

  var ctr = document.getElementById('panel_busbar_container');
  var candidatos = [];
  if (ctr) {
    ctr.querySelectorAll('.itm-tri').forEach(function(tri) {
      if (!tri.src || tri.src.indexOf('boton_trian_rojo') === -1) return;
      var itm = (typeof _buscarITM === 'function') ? _buscarITM(tri.dataset.itmId) : null;
      if (!itm || itm.dif) return;
      if (typeof _itmPuedeUsarDIF === 'function' && !_itmPuedeUsarDIF(itm)) return;
      candidatos.push(tri);
    });
  }
  if (!candidatos.length) {
    _avisoFlotante('Todos los ITMs ya tienen DIF o no admiten diferencial (solo Riel y CM Fijo Mod1).');
    return;
  }
  _avisoFlotante('Haz click en el triángulo de un ITM (pulsando) y elige Agregar → Interruptor Diferencial.');
  _pulsarTemporal(candidatos);
}


function _pulsarTemporal(els) {
  var arr = Array.prototype.slice.call(els);
  arr.forEach(function(el) { el.classList.add('tri-pulse'); });
  setTimeout(function() {
    arr.forEach(function(el) { el.classList.remove('tri-pulse'); });
  }, 2600);
}





var _listaCircuitosAbierta = false;

function actualizarBibliotecaCircuitos() {
  var pb = window._panelBusbarData;



  var _estPB = document.getElementById('bib_pb_estado');
  if (pb && _estPB) _estPB.textContent = _pbTextoCorto(pb);
  var itms = (typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []);
  var nItms = itms.length;
  var nDifs = itms.filter(function(i) { return i.dif; }).length;
  var nDps  = itms.filter(function(i) { return i.dps; }).length;
  var nCont = itms.filter(function(i) { return i.contactor; }).length;

  var item   = document.getElementById('bib_item_circuitos');
  var estado = document.getElementById('bib_circuitos_estado');
  if (item) {
    item.classList.toggle('bib-item-disabled', !pb);
    item.classList.toggle('insertado', nItms > 0);
  }
  if (estado) {
    if (!pb) {
      estado.textContent = 'Requiere Panel Busbar';
    } else if (nItms === 0) {
      estado.textContent = 'Sin insertar';
    } else {
      var txt = nItms + ' ITM' + (nItms > 1 ? 's' : '');
      if (nDifs > 0) txt += ' · ' + nDifs + ' DIF' + (nDifs > 1 ? 's' : '');
      if (nDps > 0)  txt += ' · ' + nDps + ' DPS';
      if (nCont > 0) txt += ' · ' + nCont + ' Contactor' + (nCont > 1 ? 'es' : '');
      estado.textContent = txt;
    }
  }

  if (!pb && _listaCircuitosAbierta) _listaCircuitosAbierta = false;
  _renderListaCircuitos();
}

function toggleListaCircuitos() {
  if (!window._panelBusbarData) {
    _avisoFlotante('Primero inserta el Panel Busbar — los ITMs se conectan a sus polos.');
    return;
  }


  if (!((typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || [])).length) {
    bibInsertarITM();
    _enfocarTriangulos();


    if (!_listaCircuitosAbierta) { _listaCircuitosAbierta = true; _renderListaCircuitos(); }
    return;
  }
  _listaCircuitosAbierta = !_listaCircuitosAbierta;
  _renderListaCircuitos();
}




function _enfocarTriangulos() {

  setTimeout(_enfocarTriangulosNow, 30);
}

function _enfocarTriangulosNow() {
  var ctr = document.getElementById('panel_busbar_container');
  var marco = document.getElementById('marco_gabinete');
  var canvas = document.getElementById('canvas_main');
  if (!ctr || !marco || !canvas) return;
  var tris = ctr.querySelectorAll('.tri-clickeable');
  if (!tris.length) return;

  var cL = parseFloat(ctr.style.left) || 0;
  var cT = parseFloat(ctr.style.top) || 0;
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  tris.forEach(function(t) {
    var x = cL + (parseFloat(t.style.left) || 0);
    var y = cT + (parseFloat(t.style.top) || 0);
    var w = parseFloat(t.style.width) || 45;
    var h = parseFloat(t.style.height) || 90;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  });


  var pad = 120;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  var boxW = maxX - minX;
  var boxH = maxY - minY;

  var zoom = Math.min(
    (canvas.clientWidth * 0.9) / boxW,
    (canvas.clientHeight * 0.9) / boxH,
    1
  );
  zoom = Math.max(0.05, zoom);
  marco.style.zoom = zoom;
  if (typeof actualizarIndicadorZoom === 'function') actualizarIndicadorZoom(Math.round(zoom * 100));
  if (typeof actualizarCotasEscala === 'function') actualizarCotasEscala();


  requestAnimationFrame(function() {
    var mRect = marco.getBoundingClientRect();
    var cRect = canvas.getBoundingClientRect();
    var cx = mRect.left + (minX + boxW / 2) * zoom;
    var cy = mRect.top + (minY + boxH / 2) * zoom;
    canvas.scrollLeft += cx - (cRect.left + cRect.width / 2);
    canvas.scrollTop += cy - (cRect.top + cRect.height / 2);
  });
}


function _labelTipoITM(itm) {
  if (itm.tipo === 'reserva') {
    var t = itm.tamano === 'cm_reg' ? 'CM Reg' : itm.tamano === 'cm_fijo' ? 'CM Fijo' : 'Riel';
    return 'Reserva (' + t + ')';
  }
  if (itm.tipo === 'cm_reg') return 'ITM CM Reg';
  if (itm.tipo === 'cm_fijo') {
    return (parseInt(itm.capacidad, 10) >= 125) ? 'ITM CM Fijo Mod2' : 'ITM CM Fijo Mod1';
  }
  return 'ITM Riel';
}




function _bibCircFila(wrap, o) {
  var row = document.createElement('div');
  row.className = 'bib-circ-row' + (o.sub ? ' bib-circ-row-dif' : '');
  row.title = o.title || '';
  row.onclick = function(e) { e.stopPropagation(); o.onclick(); };
  var badge = document.createElement('span');
  badge.className = 'bib-circ-badge' + (o.badgeCls ? ' ' + o.badgeCls : '');
  badge.textContent = o.badge;
  row.appendChild(badge);
  var specs = document.createElement('span');
  specs.className = 'bib-circ-specs';
  specs.textContent = o.specs;
  row.appendChild(specs);
  var edit = document.createElement('span');
  edit.className = 'bib-circ-edit';
  edit.textContent = '\u270e';
  row.appendChild(edit);
  wrap.appendChild(row);
  return row;
}

function _renderListaCircuitos() {
  var wrap = document.getElementById('bib_circuitos_lista');
  var chevron = document.getElementById('bib_circuitos_chevron');
  if (!wrap) return;
  var abierta = _listaCircuitosAbierta && !!window._panelBusbarData;
  wrap.style.display = abierta ? 'block' : 'none';
  if (chevron) chevron.textContent = abierta ? '▴' : '▾';
  if (!abierta) return;

  wrap.innerHTML = '';


  var itms = ((typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || [])).slice().sort(function(a, b) {
    return _numRotuloITM(a.rotulo) - _numRotuloITM(b.rotulo);
  });


  if (itms.length > 1) {
    var ord = document.createElement('div');
    ord.className = 'bib-circ-ordenar';
    var ordLbl = document.createElement('span');
    ordLbl.textContent = 'Ordenar rótulos';
    var ordBtn = document.createElement('button');
    ordBtn.className = 'bib-circ-ordenar-btn';
    ordBtn.textContent = 'Ordenar';
    ordBtn.title = 'Izquierda de arriba abajo, luego derecha de arriba abajo';
    ordBtn.onclick = function(e) { e.stopPropagation(); ordenarRotulosITM(); };
    ord.appendChild(ordLbl);
    ord.appendChild(ordBtn);
    wrap.appendChild(ord);
  }



  if (itms.length) {
    var el = document.createElement('div');
    el.className = 'bib-circ-ordenar';
    var elLbl = document.createElement('span');
    elLbl.textContent = 'Eliminar varios';
    var elBtn = document.createElement('button');
    var _on = (typeof eliminarVariosActivo === 'function') && eliminarVariosActivo();
    elBtn.className = 'bib-circ-ordenar-btn bib-circ-elim-btn' + (_on ? ' activo' : '');
    elBtn.textContent = _on ? 'Listo' : 'Eliminar';
    elBtn.onclick = function(e) { e.stopPropagation(); toggleEliminarVarios(); };
    el.appendChild(elLbl);
    el.appendChild(elBtn);
    wrap.appendChild(el);
  }





  var add = document.createElement('div');
  add.className = 'bib-circ-row bib-circ-add bib-circ-add-arriba';
  add.textContent = '+ Insertar ITM libre';
  add.onclick = function(e) { e.stopPropagation(); abrirModalITMLibre(); };
  wrap.appendChild(add);

  itms.forEach(function(itm) {


    _bibCircFila(wrap, {
      title: 'Editar ' + itm.rotulo, badge: itm.rotulo,
      specs: _labelTipoITM(itm) + ' · ' + itm.polos + 'P' + (itm.capacidad ? ' · ' + itm.capacidad + 'A' : ''),
      onclick: function() {
        if (itm.libre && typeof editarITMLibre === 'function') editarITMLibre(itm.id);
        else editarITM(itm.id);
      }
    });


    if (itm.dif) {
      _bibCircFila(wrap, {
        sub: true, badgeCls: 'bib-circ-badge-dif',
        title: 'Editar ' + _rotuloID(itm.rotulo, ''), badge: _rotuloID(itm.rotulo, 'DIF'),
        specs: (itm.dif.tipo === 'reserva')
          ? ('DIF Reserva · ' + itm.dif.polos + 'P')
          : (itm.dif.sensibilidad + ' mA · ' + itm.dif.corriente + ' A · ' + itm.dif.polos + 'P'),
        onclick: function() { abrirModalDIF(itm.id); }
      });
    }



    if (itm.contactor) {
      _bibCircFila(wrap, {
        sub: true, badgeCls: 'bib-circ-badge-otros',
        title: 'Editar ' + _rotuloK(itm.rotulo, ''), badge: _rotuloK(itm.rotulo),
        specs: _contactorDesc(itm.contactor) + ' · ' + _ubicTxt(itm.contactor.ubicacion),
        onclick: function() { abrirModalContactor(itm.id); }
      });
    }


    if (itm.pulsador) {
      var _tp = (typeof _pulsadorTipo === 'function') ? _pulsadorTipo(itm) : 'doble';
      var _desc = (_tp === 'conjunto') ? 'Piloto + pulsadores V/R'
                : (_tp === 'columnas') ? 'Marcha y parada c/piloto'
                                       : 'Pulsador marcha/parada';
      var _leyB = (typeof _pulsadorLeyendaTexto === 'function') ? _pulsadorLeyendaTexto(itm) : '1 - 0 - 2';
      if (typeof _pulsadorBotoneraOn === 'function' && !_pulsadorBotoneraOn(itm)) {
        _desc = 'Selector ' + _leyB;
      } else if (typeof _pulsadorSelectorOn === 'function' && _pulsadorSelectorOn(itm)) {
        _desc += ' + selector ' + _leyB;
      }
      _bibCircFila(wrap, {
        sub: true, badgeCls: 'bib-circ-badge-otros',
        title: 'Pulsador de ' + _rotuloK(itm.rotulo, ''), badge: 'PUL',

        specs: _desc + (itm.libre ? '' : ' · Puerta'),
        onclick: function() { abrirModalPulsador(itm.id); }
      });
    }


    if (itm.dps) {
      var _oP = (typeof _dpsDatos === 'function') ? _dpsDatos(itm.dps) : null;
      _bibCircFila(wrap, {
        sub: true, badgeCls: 'bib-circ-badge-otros',
        title: 'Editar DPS de ' + itm.rotulo, badge: 'DPS',
        specs: _oP ? ('DPS · ' + _oP.polos + 'P · ' + _dpsTipoTxt(_oP.tipo) + ' · ' + _dpsCorrienteKa(_oP) + ' kA')
                   : ('DPS · ' + itm.dps.polos + 'P'),
        onclick: function() { abrirModalDPS(itm.id); }
      });
    }
  });
}




function abrirModalOtros() {
  if (!window._panelBusbarData) {
    _avisoFlotante('Primero inserta el Panel Busbar — la aparamenta cuelga de él.');
    return;
  }
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalOtros_overlay').classList.add('activo');
}

function cerrarModalOtros() {
  var ov = document.getElementById('modalOtros_overlay');
  if (ov) ov.classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
}

function seleccionarOtroEquipo(equipo) {
  cerrarModalOtros();
  if (equipo === 'pilotos') abrirModalPilotos();
  if (equipo === 'medidor') abrirModalMedidor();
  if (equipo === 'rejilla') abrirModalRejilla();
}












function _medidorInfo() {
  var fases = (typeof _fasesPilotos === 'function') ? _fasesPilotos() : ['R', 'S', 'T'];
  var tcs = fases.map(function(f, i) { return 'CT' + (i + 1); });
  var porFase = {};
  fases.forEach(function(f, i) { porFase[f] = tcs[i]; });


  var ig = window._igData;
  var prim = (typeof tcPrimarioNormalizado === 'function') ? tcPrimarioNormalizado(ig && ig.corriente) : 50;
  return { hay: !!window._MEDIDOR, fases: fases, nTc: fases.length, tcs: tcs, porFase: porFase,
           conN: /\+N/.test((window._panelBusbarData || {}).fases || ''),
           primario: prim, secundario: 5, relacionTxt: prim + '/5 A' };
}






function _medidorAsegurarAlto() {
  var d = window._panelBusbarData;
  if (!window._MEDIDOR || !d) return false;
  var filas = tcFilasNecesarias(d);
  var min = extSupMinConTcMm(d);
  var prev = d.conexionIG ? (d.conexionIGAltura || 20) : null;
  var cambio = false;
  if (!d.conexionIG) { d.conexionIG = true; cambio = true; }



  var alto = d.conexionIGAltura || 20;

  if (min > EXT_SUP_MAX_MM) min = EXT_SUP_MAX_MM;




  var filasAntes = window._MEDIDOR.filas || filas;
  if (filas < filasAntes && alto > min) alto = min;
  if (alto < min) alto = min;
  if (alto !== (d.conexionIGAltura || 20)) {
    d.conexionIGAltura = alto;
    if (prev !== null && typeof _igGapSigueAlCuadro === 'function') _igGapSigueAlCuadro(prev, alto);
    cambio = true;
  }
  window._MEDIDOR.filas = filas;



  if (cambio && typeof _recalcIgExtraTop === 'function') _recalcIgExtraTop();
  return cambio;
}








function _medidorGruposBorneras() {
  var todos = window._BORNERAS_GRUPOS || [];
  var meds = todos.filter(function(g) { return g.origen === 'medidor'; });
  if (!meds.length) return [];
  var ids = {};
  meds.forEach(function(g) { ids[g.id] = true; });
  var prim = null;
  for (var i = 0; i < meds.length; i++) {
    var g = meds[i];
    if (!(g.lugar === 'junto' && g.ref && ids[g.ref])) { prim = g; break; }
  }
  if (!prim) prim = meds[0];
  var out = [prim], act = prim, guard = 0;
  while (guard++ < 20) {
    var hijo = _bornerasGrupoDe('junto', act.id);
    if (!hijo || hijo.origen !== 'medidor') break;
    out.push(hijo);
    act = hijo;
  }
  return out;
}

function _medidorGrupoBorneras() {
  return _medidorGruposBorneras()[0] || null;
}







var _MEDIDOR_TIPO_OPTS = [['2.5', '2.5mm\u00b2'], ['4', '4mm\u00b2'], ['6', '6mm\u00b2'],
  ['pf4', 'Portafusible vidrio 4mm\u00b2'], ['pfcart', 'Portafusible tipo cartucho']];
var _MEDIDOR_EXT_OPTS = [['tope', 'Tope'], ['separador', 'Separador'], ['ninguno', 'Ninguno']];
var _MEDIDOR_CANT_OPTS = [1, 2, 3, 4, 5, 6, 8, 10, 12];




var _MEDIDOR_TIPO_PASO = _MEDIDOR_TIPO_OPTS.slice(0, 3);
var _MEDIDOR_TIPO_PF = _MEDIDOR_TIPO_OPTS.slice(3);



function _medidorCantFijas() {
  var mi = _medidorInfo();
  return [mi.nTc + 1, mi.nTc + (mi.conN ? 1 : 0)];
}
function _medidorSeccionesFijas(prev) {
  prev = prev || [];
  var cant = _medidorCantFijas();
  var es = function(opts, t) { return opts.some(function(o) { return o[0] === t; }); };
  var p0 = prev[0] || {}, p1 = prev[1] || {}, dos = prev.length >= 2;
  return [
    { tipo: es(_MEDIDOR_TIPO_PASO, p0.tipo) ? p0.tipo : '2.5', cant: cant[0],
      extIzq: p0.extIzq || _BORN_EXT_IZQ_DEF, extDer: dos ? (p0.extDer || 'ninguno') : 'ninguno', cantManual: false },
    { tipo: es(_MEDIDOR_TIPO_PF, p1.tipo) ? p1.tipo : 'pf4', cant: cant[1],
      extIzq: dos ? (p1.extIzq || 'ninguno') : 'ninguno', extDer: p1.extDer || _BORN_EXT_DER_DEF, cantManual: false }
  ];
}
function _medidorFija() { return { cant: _medidorCantFijas(), tipos: [_MEDIDOR_TIPO_PASO, _MEDIDOR_TIPO_PF] }; }

function _medidorOpts(opts, val) {
  return opts.map(function(o) {
    var v = (o instanceof Array) ? o[0] : String(o);
    var t = (o instanceof Array) ? o[1] : String(o);
    return '<option value="' + v + '"' + (String(val) === v ? ' selected' : '') + '>' + t + '</option>';
  }).join('');
}

function _medidorSeccionDefault() {
  return { tipo: '2.5', cant: _bornerasPorFases(),
           extIzq: _BORN_EXT_IZQ_DEF, extDer: _BORN_EXT_DER_DEF, cantManual: false };
}

function _seccCont(x) {
  return (typeof x === 'string') ? document.getElementById(x) : x;
}
function _seccDom(contId) {
  var cont = _seccCont(contId);
  return cont ? [].slice.call(cont.querySelectorAll('.med-secc')) : [];
}
function _medidorSeccionesDom() { return _seccDom('medidor_secciones'); }



function _medidorLeerSecciones() { return _seccLeer('medidor_secciones'); }

function _seccLeer(contId) {
  return _seccDom(contId).map(function(el) {
    var c = parseInt((el.querySelector('.med-secc-cant') || {}).value, 10);
    return {
      tipo:   (el.querySelector('.med-secc-tipo') || {}).value || '2.5',
      cant:   isNaN(c) ? _bornerasPorFases() : c,
      extIzq: (el.querySelector('.med-secc-izq') || {}).value || _BORN_EXT_IZQ_DEF,
      extDer: (el.querySelector('.med-secc-der') || {}).value || _BORN_EXT_DER_DEF,
      cantManual: el.dataset.cantManual === '1'
    };
  });
}

function _medidorRenderSecciones(secs) { _seccRender('medidor_secciones', secs, _medidorFija()); }






function _seccRender(contId, secs, cantFija) {
  var cont = _seccCont(contId);
  if (!cont) return;
  var fija = (cantFija !== undefined && cantFija !== null);
  cont.innerHTML = secs.map(function(s, i) {
    var cantI = (typeof cantFija === 'number') ? cantFija : (fija && cantFija.cant ? cantFija.cant[i] : undefined);
    var tiposI = (fija && cantFija.tipos && cantFija.tipos[i]) || _MEDIDOR_TIPO_OPTS;
    return '<div class="med-secc" data-cant-manual="' + (s.cantManual ? '1' : '0') + '">' +
      '<div class="med-secc-head">' +
        '<span class="med-secc-tit">Secci\u00f3n ' + (i + 1) + '</span>' +
        (secs.length > 1 && !fija
          ? '<button type="button" class="med-secc-del" title="Quitar secci\u00f3n" ' +
            'onclick="_medidorQuitarSeccion(this)">&times;</button>'
          : '') +
      '</div>' +
      '<div style="display:flex; gap:12px; align-items:flex-end;">' +
        '<div style="flex:1 1 0; min-width:0;">' +
          '<div class="m1-card-label">Tipo de bornera</div>' +
          '<select class="m1-input-text med-secc-tipo" style="width:100%">' +
            _medidorOpts(tiposI, s.tipo) + '</select>' +
        '</div>' +
        '<div style="flex:0 0 96px;">' +
          '<div class="m1-card-label">Cantidad</div>' +
          '<select class="m1-input-text med-secc-cant" style="width:100%" ' +
            (cantI !== undefined ? 'disabled title="Fija: la que pide su diagrama de control"'
                  : 'onchange="_medidorCantManual(this)"') + '>' +
            (cantI !== undefined ? '<option value="' + cantI + '" selected>' + cantI + '</option>'
                  : _medidorOpts(_MEDIDOR_CANT_OPTS, s.cant)) + '</select>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex; gap:12px; align-items:flex-end; margin-top:12px;">' +
        '<div style="flex:1 1 0; min-width:0;">' +
          '<div class="m1-card-label">Extremo izquierdo</div>' +
          '<select class="m1-input-text med-secc-izq" style="width:100%">' +
            _medidorOpts(_MEDIDOR_EXT_OPTS, s.extIzq) + '</select>' +
        '</div>' +
        '<div style="flex:1 1 0; min-width:0;">' +
          '<div class="m1-card-label">Extremo derecho</div>' +
          '<select class="m1-input-text med-secc-der" style="width:100%">' +
            _medidorOpts(_MEDIDOR_EXT_OPTS, s.extDer) + '</select>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}




function _medidorCantManual(sel) {
  var el = sel.closest ? sel.closest('.med-secc') : null;
  if (el) el.dataset.cantManual = '1';
}




function _seccAgregar(contId, cantDef) {
  var secs = _seccLeer(contId);
  var d = _medidorSeccionDefault();
  if (typeof cantDef === 'number') d.cant = cantDef;
  secs.push(d);
  _seccRender(contId, secs);
}



function _medidorQuitarSeccion(btn) {
  var el = btn.closest ? btn.closest('.med-secc') : null;
  var cont = el && el.parentNode;
  if (!el || !cont) return;
  var idx = _seccDom(cont).indexOf(el);
  if (idx < 0) return;
  var secs = _seccLeer(cont);
  secs.splice(idx, 1);
  if (!secs.length) secs = [_medidorSeccionDefault()];
  _seccRender(cont, secs);
}





function _medidorInsertarSeccion(prev, cfg) {
  var g = {
    id: _bornerasNuevoId(), clase: 'bornera', origen: 'medidor',
    lugar: 'ig-der', ref: null,
    tipo: cfg.tipo, cant: cfg.cant,
    extIzq: cfg.extIzq, extDer: cfg.extDer,
    cantManual: !!cfg.cantManual, gapMm: 30
  };
  if (!prev) {
    _medidorEncadenarBorneras(g);
  } else {
    var hijo = _bornerasGrupoDe('junto', prev.id);
    g.lugar = 'junto';
    g.ref = prev.id;
    if (prev.dentro) g.dentro = true;
    if (prev.dentroCanaleta) g.dentroCanaleta = true;
    if (hijo) hijo.ref = g.id;
  }
  window._BORNERAS_GRUPOS.push(g);
  return g;
}






function _medidorEncadenarBorneras(g) {








  var hayPres = !!window._PRESENCIA_POS || !!_bornerasGrupoDe('junto', 'presencia');
  var raiz = hayPres ? { id: 'presencia' } : _bornerasGrupoDe('ig-der');
  if (raiz && raiz.id === g.id) raiz = null;
  if (!raiz) { g.lugar = 'ig-der'; g.ref = null; return; }

  var actual = raiz, guard = 0;
  while (guard++ < 20) {
    var hijo = _bornerasGrupoDe('junto', actual.id);
    if (!hijo || hijo.id === g.id) break;
    actual = hijo;
  }
  g.lugar = 'junto'; g.ref = actual.id;
}




function _medidorNormalizarBorneras() {
  var gB = _medidorGrupoBorneras();
  if (!gB || gB.lugar !== 'ig-der') return false;


  var hayPres = !!window._igData && typeof _presenciaSecciones === 'function' &&
                _presenciaSecciones().length > 0;
  if (!hayPres) return false;
  _medidorEncadenarBorneras(gB);
  return gB.lugar === 'junto';
}

function _medidorToggleBorneras(on) {
  var c = document.getElementById('medidor_borneras_campos');
  if (c) c.style.display = on ? '' : 'none';
}

function abrirModalMedidor() {
  if (!window._panelBusbarData) {
    _avisoFlotante('Primero inserta el Panel Busbar — el medidor se conecta a sus barras.');
    return;
  }
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalMedidor_overlay').classList.add('activo');
  var btnQ = document.getElementById('medidor_btn_quitar');
  if (btnQ) btnQ.style.display = window._MEDIDOR ? '' : 'none';


  var gsB = _medidorGruposBorneras();
  var chk = document.getElementById('medidor_borneras_chk');


  var _hayIgM = !!window._igData;
  if (chk) {
    chk.checked = _hayIgM && gsB.length > 0;
    chk.disabled = !_hayIgM;
    var _lblM = chk.closest('label');
    if (_lblM) _lblM.style.opacity = _hayIgM ? '' : '0.45';
  }
  _medidorToggleBorneras(_hayIgM && gsB.length > 0);
  _medidorRenderSecciones(_medidorSeccionesFijas(gsB.map(function(g) {
    return { tipo: g.tipo, extIzq: g.extIzq, extDer: g.extDer };
  })));
}

function cerrarModalMedidor() {
  var ov = document.getElementById('modalMedidor_overlay');
  if (ov) ov.classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
}

function confirmarModalMedidor() {
  var d = window._panelBusbarData;
  if (!d) return;


  if (!window._MEDIDOR) {
    window._MEDIDOR_PREVIO = {
      alto: d.conexionIGAltura || 20,
      conexionIG: !!d.conexionIG,
      igGapPx: IG_GAP
    };
    if (!d.conexionIG) window._medidorEncendioExt = true;
    window._MEDIDOR = { presente: true, filas: tcFilasNecesarias(d) };
  }


  _medidorAsegurarAlto();




  var chk = document.getElementById('medidor_borneras_chk');
  var quiere = !!(chk && chk.checked && window._igData);

  if (quiere || window._igData) {
    _medidorAplicarSecciones(quiere ? _medidorSeccionesFijas(_medidorLeerSecciones()) : []);
  }
  _postCambioMedidor();
}


function _medidorAplicarSecciones(secs) {
  var vivos = _medidorGruposBorneras();
  var _i;
  for (_i = 0; _i < secs.length; _i++) {
    if (_i < vivos.length) {
      var gv = vivos[_i];
      gv.tipo = secs[_i].tipo;
      gv.cant = secs[_i].cant;
      gv.extIzq = secs[_i].extIzq;
      gv.extDer = secs[_i].extDer;
      gv.cantManual = secs[_i].cantManual;
    } else {
      vivos.push(_medidorInsertarSeccion(vivos[_i - 1] || null, secs[_i]));
    }
  }


  for (_i = vivos.length - 1; _i >= secs.length; _i--) {
    _bornerasDesenganchar(vivos[_i].id);
  }
}

function quitarMedidor() {
  window._MEDIDOR = null;
  var gsQ = _medidorGruposBorneras();
  for (var _q = gsQ.length - 1; _q >= 0; _q--) _bornerasDesenganchar(gsQ[_q].id);
  var d = window._panelBusbarData, prev = window._MEDIDOR_PREVIO;





  if (d && prev) {
    d.conexionIGAltura = prev.alto;
    d.conexionIG = prev.conexionIG;
    IG_GAP = prev.igGapPx;
    if (typeof _recalcIgExtraTop === 'function') _recalcIgExtraTop();
  } else if (window._medidorEncendioExt && d) {
    d.conexionIG = false;
    if (typeof _recalcIgExtraTop === 'function') _recalcIgExtraTop();
  }
  window._MEDIDOR_PREVIO = null;
  window._medidorEncendioExt = false;


  window._ANALIZADOR_TOP_MM = null;
  _postCambioMedidor();
}

function _postCambioMedidor() {
  cerrarModalMedidor();
  actualizarBibliotecaOtros();
  if (window._panelBusbarData && typeof dibujarPanelBusbar === 'function') {
    dibujarPanelBusbar();
  }


  if (window._vistaActual === 'frontal_puerta' || window._vistaActual === 'lateral') {
    aplicarVista(window._vistaActual);
  }



  if (window._modoEditor === 'metrado' && typeof _renderModoMetrado === 'function') _renderModoMetrado();
  if (typeof guardarSesion === 'function') guardarSesion();
}


function actualizarBibliotecaOtros() {


  var hayPB = !!window._panelBusbarData;
  var leds = window._PILOTOS_LEDS || 0;

  var itemOtros = document.getElementById('bib_item_otros');
  var estadoOtros = document.getElementById('bib_otros_estado');
  if (itemOtros) itemOtros.classList.toggle('bib-item-disabled', !hayPB);
  if (estadoOtros) estadoOtros.textContent = hayPB ? 'Agregar más equipos' : 'Requiere Panel Busbar';


  var itemPil = document.getElementById('bib_item_pilotos');
  var estadoPil = document.getElementById('bib_pilotos_estado');
  var editPil = document.getElementById('bib_pilotos_editbtn');
  if (itemPil) {
    itemPil.style.display = (leds > 0) ? '' : 'none';
    itemPil.classList.toggle('insertado', leds > 0);
  }
  if (estadoPil) estadoPil.textContent = leds + ' LED' + (leds > 1 ? 's' : '');
  if (editPil) editPil.style.display = (leds > 0) ? '' : 'none';


  var hayMed = !!window._MEDIDOR;
  var itemMed = document.getElementById('bib_item_medidor');
  var estadoMed = document.getElementById('bib_medidor_estado');
  var editMed = document.getElementById('bib_medidor_editbtn');
  if (itemMed) {
    itemMed.style.display = hayMed ? '' : 'none';
    itemMed.classList.toggle('insertado', hayMed);
  }
  if (estadoMed) {
    estadoMed.textContent = _medidorInfo().nTc + ' CT' +
      (_medidorGrupoBorneras() ? ' · borneras' : '');
  }
  if (editMed) editMed.style.display = hayMed ? '' : 'none';


  var hayRej = !!window._REJILLA;
  var itemRej = document.getElementById('bib_item_rejilla');
  var estadoRej = document.getElementById('bib_rejilla_estado');
  var editRej = document.getElementById('bib_rejilla_editbtn');
  if (itemRej) {
    itemRej.style.display = hayRej ? '' : 'none';
    itemRej.classList.toggle('insertado', hayRej);
  }
  if (estadoRej) {
    estadoRej.textContent = _REJILLA_LADO_MM + ' × ' + _REJILLA_LADO_MM + ' mm' +
      (_rejillaGrupoBorneras() ? ' · borneras' : '') +
      (_rejillaTermostato() ? ' · termostato' : '');
  }
  if (editRej) editRej.style.display = hayRej ? '' : 'none';
}
















function _presenciaPorFases() {
  var fases = _fasesPilotos();
  var f = (window._panelBusbarData || {}).fases;
  return { fases: fases, leds: fases.length,
           borneras: fases.length + (f === '3F+N' ? 1 : 0) };
}
function _ledsPorFases() { return _presenciaPorFases().leds; }



function _fasesPilotos() {
  var d = window._panelBusbarData || {};
  var f = d.fases;
  var sf = (d.subfases || '').trim();
  if (f === '3F' || f === '3F+N') return ['R', 'S', 'T'];
  if (f === '2F') {
    var p = sf.split('-').map(function(s) { return s.trim(); })
              .filter(function(s) { return s; });
    return (p.length === 2) ? p : ['R', 'S'];
  }
  if (f === '1F+N') return [sf.replace('-N', '').trim() || 'R'];
  return ['R'];
}

function _bornerasPorFases() { return _presenciaPorFases().borneras; }



function _presenciaHay() {
  return (window._PILOTOS_LEDS || 0) > 0 ||
         ((typeof _presenciaSecciones === 'function') && _presenciaSecciones().length > 0);
}





function _presenciaSetSecciones(secs) {
  secs = (secs && secs.length) ? secs : null;
  var _tot = 0;
  (secs || []).forEach(function(sc) { _tot += (sc.cant || 0); });
  window._PRESENCIA_SECCIONES = secs;
  window._BORNERAS_CANT = _tot;
  window._BORNERAS_TIPO = secs ? secs[0].tipo : '2.5';
  window._EXT_IZQ = secs ? secs[0].extIzq : null;
  window._EXT_DER = secs ? secs[0].extDer : null;
  window._TOPES_CANT = null;                                        
}




function _presenciaQuitarTira() {
  var habia = (window._PRESENCIA_SECCIONES && window._PRESENCIA_SECCIONES.length) ||
              (window._BORNERAS_CANT | 0) > 0;
  if (habia) _presenciaSoltarColgados();
  if (typeof _canaletaBorrarRef === 'function' && window._PRESENCIA_CANALETA) {
    _canaletaBorrarRef('presencia');
  }
  window._PRESENCIA_CANALETA = null;
  _presenciaSetSecciones(null);
}




function _presenciaReengancharIgDer() {
  if (typeof _bornerasGrupos !== 'function' || typeof _bornerasGrupoDe !== 'function') return;
  var raiz = null;
  _bornerasGrupos().forEach(function(g) { if (!raiz && g.lugar === 'ig-der') raiz = g; });
  if (!raiz) return;

  var ult = 'presencia', a = _bornerasGrupoDe('junto', 'presencia'), guard = 0;
  while (a && guard++ < 30) { ult = a.id; a = _bornerasGrupoDe('junto', a.id); }
  raiz.lugar = 'junto';
  raiz.ref = ult;
}





function sincronizarPilotosConFases() {
  if (window._PILOTOS_LEDS > 0) window._PILOTOS_LEDS = _ledsPorFases();




  if (window._BORNERAS_CANT > 0) {
    var _sp = window._PRESENCIA_SECCIONES;
    var _s0 = (_sp && _sp.length) ? _sp[0]
      : { tipo: window._BORNERAS_TIPO || '2.5', extIzq: window._EXT_IZQ || _BORN_EXT_IZQ_DEF,
          extDer: window._EXT_DER || _BORN_EXT_DER_DEF };
    _s0.cant = _bornerasPorFases();
    _s0.cantManual = false;
    _presenciaSetSecciones([_s0]);
  }


  var _gsM = (typeof _medidorGruposBorneras === 'function') ? _medidorGruposBorneras() : [];
  if (_gsM.length) _medidorAplicarSecciones(_medidorSeccionesFijas(_gsM.map(function(g) {
    return { tipo: g.tipo, extIzq: g.extIzq, extDer: g.extDer };
  })));
}



function abrirModalPilotos() {
  if (!window._panelBusbarData) {
    _avisoFlotante('Primero inserta el Panel Busbar — los pilotos salen de sus fases.');
    return;
  }
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalPilotos_overlay').classList.add('activo');

  var sel = document.getElementById('pilotos_cantidad');
  if (sel) { sel.dataset.valor = String(_ledsPorFases()); sel.textContent = sel.dataset.valor; }
  var selC = document.getElementById('pilotos_color');
  if (selC) selC.value = window._PILOTOS_COLOR || 'verde';

  var _secsP = (typeof _presenciaSecciones === 'function') ? _presenciaSecciones() : [];
  var chkP = document.getElementById('pilotos_borneras_chk');


  var _hayIgP = !!window._igData;
  if (chkP) {
    chkP.checked = _hayIgP && _secsP.length > 0;
    chkP.disabled = !_hayIgP;
    var _lblP = chkP.closest('label');
    if (_lblP) _lblP.style.opacity = _hayIgP ? '' : '0.45';
  }
  _presenciaToggleBorneras(_hayIgP && _secsP.length > 0);

  var _s0P = _secsP[0];
  _seccRender('presencia_secciones', [_s0P ? {
    tipo: _s0P.tipo || '2.5', cant: _bornerasPorFases(),
    extIzq: _s0P.extIzq || _BORN_EXT_IZQ_DEF, extDer: _s0P.extDer || _BORN_EXT_DER_DEF, cantManual: false
  } : _medidorSeccionDefault()], _bornerasPorFases());
  var btnQuitar = document.getElementById('pilotos_btn_quitar');
  if (btnQuitar) btnQuitar.style.display = (window._PILOTOS_LEDS > 0) ? '' : 'none';
}










function _presenciaSoltarColgados() {
  if (typeof _bornerasGrupoDe !== 'function') return 0;
  var hijo = _bornerasGrupoDe('junto', 'presencia');
  if (!hijo) return 0;


  if (typeof _canaletaSoltarDentro === 'function') _canaletaSoltarDentro('presencia');
  hijo.lugar = 'ig-der';
  hijo.ref = null;
  hijo.dentro = false;
  delete hijo.dentroCanaleta;
  if (typeof _avisoFlotante === 'function') {
    _avisoFlotante('Lo que colgaba de las borneras quedó a la derecha del IG.');
  }
  return 1;
}

function _presenciaToggleBorneras(on) {
  var c = document.getElementById('pilotos_borneras_campos');
  if (c) c.style.display = on ? '' : 'none';
}

function cerrarModalPilotos() {
  var ov = document.getElementById('modalPilotos_overlay');
  if (ov) ov.classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
}

function confirmarModalPilotos() {

  window._PILOTOS_LEDS = _ledsPorFases();
  var selC = document.getElementById('pilotos_color');
  window._PILOTOS_COLOR = (selC && selC.value) || 'verde';

  var chkP = document.getElementById('pilotos_borneras_chk');


  var secs = (chkP && chkP.checked && window._igData) ? _seccLeer('presencia_secciones').slice(0, 1) : [];
  secs.forEach(function(sc) { sc.cant = _bornerasPorFases(); sc.cantManual = false; });
  var _habia = _presenciaSecciones().length > 0;
  if (!secs.length) {


    if (_habia) _presenciaQuitarTira();
  } else {
    _presenciaSetSecciones(secs);
    if (!_habia) _presenciaReengancharIgDer();
  }
  _postCambioPilotos();
}





function onAnalizadorTriangleClick(triImg) {
  var prev = document.getElementById('tri_context_menu');
  if (prev) prev.remove();
  if (typeof _cerrarMenuTriangulo === 'function') _cerrarMenuTriangulo();
  var menu = document.createElement('div');
  menu.id = 'tri_context_menu';
  menu.className = 'dif-context-menu';
  var bE = document.createElement('button');
  bE.className = 'dif-context-btn'; bE.textContent = 'Editar';
  bE.addEventListener('click', function() { menu.remove(); abrirModalMedidor(); });
  menu.appendChild(bE);
  var bD = document.createElement('button');
  bD.className = 'dif-context-btn'; bD.textContent = 'Eliminar'; bD.style.color = '#ff6b6b';
  bD.addEventListener('click', function() { menu.remove(); quitarMedidor(); });
  menu.appendChild(bD);
  _abrirMenuTriangulo(menu, triImg);
}

function onPilotosTriangleClick(triImg) {
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
    abrirModalPilotos();
  });
  menu.appendChild(btnEditar);

  var btnEliminar = document.createElement('button');
  btnEliminar.className = 'dif-context-btn';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.style.color = '#ff6b6b';
  btnEliminar.addEventListener('click', function() {
    menu.remove();
    quitarPilotos();
  });
  menu.appendChild(btnEliminar);

  _abrirMenuTriangulo(menu, triImg);
}



function onBornerasPresenciaTriangleClick(triImg) {
  var prev = document.getElementById('tri_context_menu');
  if (prev) prev.remove();
  if (typeof _cerrarMenuTriangulo === 'function') _cerrarMenuTriangulo();

  var menu = document.createElement('div');
  menu.id = 'tri_context_menu';
  menu.className = 'dif-context-menu';





  if (typeof abrirModalEquipo === 'function') {
    var btnAgP = document.createElement('button');
    btnAgP.className = 'dif-context-btn';
    btnAgP.textContent = 'Agregar';
    btnAgP.addEventListener('click', function() {
      menu.remove();
      abrirModalEquipo(null, 'grupo', 'presencia');
    });
    menu.appendChild(btnAgP);
  }

  var btnEditar = document.createElement('button');
  btnEditar.className = 'dif-context-btn';
  btnEditar.textContent = 'Editar';
  btnEditar.addEventListener('click', function() {
    menu.remove();
    abrirModalPilotos();
  });
  menu.appendChild(btnEditar);

  var btnEliminar = document.createElement('button');
  btnEliminar.className = 'dif-context-btn';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.style.color = '#ff6b6b';
  btnEliminar.addEventListener('click', function() {
    menu.remove();
    quitarBornerasPresencia();
  });
  menu.appendChild(btnEliminar);

  _abrirMenuTriangulo(menu, triImg);
}


function quitarBornerasPresencia() {
  _presenciaQuitarTira();
  _postCambioPilotos();
}

function quitarPilotos() {
  window._PILOTOS_LEDS = 0;
  _presenciaQuitarTira();
  _postCambioPilotos();
}

function _postCambioPilotos() {
  cerrarModalPilotos();
  actualizarBibliotecaOtros();

  if (window._panelBusbarData && typeof dibujarPanelBusbar === 'function') {
    dibujarPanelBusbar();
  }
  if (window._vistaActual === 'frontal_puerta') aplicarVista('frontal_puerta');
  if (typeof guardarSesion === 'function') guardarSesion();
}












var _REJILLA_LADO_MM = 150;

function _rejillaGruposBorneras() {
  var g = (typeof _bornerasGrupos === 'function') ? _bornerasGrupos() : [];



  var todas = g.filter(function(x) {
    return x.origen === 'rejilla' && (x.clase || 'bornera') === 'bornera';
  });


  var cad = (typeof _rejillaCadenaGrupos === 'function') ? _rejillaCadenaGrupos() : [];
  var orden = cad.filter(function(x) { return todas.indexOf(x) !== -1; });
  todas.forEach(function(x) { if (orden.indexOf(x) === -1) orden.push(x); });
  return orden;
}

function _rejillaGrupoBorneras() {
  return _rejillaGruposBorneras()[0] || null;
}

function _rejillaTermostato() {
  var g = (typeof _bornerasGrupos === 'function') ? _bornerasGrupos() : [];
  for (var i = 0; i < g.length; i++) {
    if (g[i].origen === 'rejilla' && g[i].clase === 'termostato') return g[i];
  }
  return null;
}

function _rejillaSecciones() {
  return _rejillaGruposBorneras().map(function(g) {
    return { tipo: g.tipo, cant: g.cant, extIzq: g.extIzq,
             extDer: g.extDer, cantManual: !!g.cantManual };
  });
}

function _rejillaToggleBorneras(on) {
  var c = document.getElementById('rejilla_borneras_campos');
  if (c) c.style.display = on ? '' : 'none';
}

function abrirModalRejilla() {
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalRejilla_overlay').classList.add('activo');

  var secs = _rejillaSecciones();



  var _hayIgR = !!window._igData;
  var _bloq = function(el, marcado) {
    if (!el) return;
    el.checked = _hayIgR && marcado;
    el.disabled = !_hayIgR;
    var lb = el.closest('label');
    if (lb) lb.style.opacity = _hayIgR ? '' : '0.45';
  };
  var chkT = document.getElementById('rejilla_termostato_chk');
  _bloq(chkT, !!_rejillaTermostato());
  var chk = document.getElementById('rejilla_borneras_chk');
  _bloq(chk, secs.length > 0);
  _rejillaToggleBorneras(_hayIgR && secs.length > 0);
  _seccRender('rejilla_secciones', secs.length ? secs : [_medidorSeccionDefault()]);

  var btnQuitar = document.getElementById('rejilla_btn_quitar');
  if (btnQuitar) btnQuitar.style.display = window._REJILLA ? '' : 'none';
}

function cerrarModalRejilla() {
  var ov = document.getElementById('modalRejilla_overlay');
  if (ov) ov.classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
}









var _rejillaColgado = null;
var _rejillaSlot = null;
var _REJ_SLOT_CAMPOS = ['gapMm', 'filaRef', 'canaleta', 'dentroCanaleta', 'alFinal', 'dentro'];
function _rejillaGuardarSlot() {
  var cad = (typeof _rejillaCadenaGrupos === 'function') ? _rejillaCadenaGrupos() : [];
  var cab = cad[0] || null;
  _rejillaSlot = null;
  if (cab) {
    _rejillaSlot = { lugar: cab.lugar, ref: cab.ref };
    _REJ_SLOT_CAMPOS.forEach(function(k) { _rejillaSlot[k] = cab[k]; });
  }
  var fin = cad[cad.length - 1];
  var hijo = (fin && typeof _bornerasGrupoDe === 'function') ? _bornerasGrupoDe('junto', fin.id) : null;
  _rejillaColgado = (hijo && hijo.origen !== 'rejilla') ? hijo : null;
  if (_rejillaColgado) _rejillaColgado.ref = null;
}
function _rejillaPonerEnSlot(g) {
  var sl = _rejillaSlot;
  _rejillaSlot = null;
  if (!sl) { g.lugar = 'ig-der'; g.ref = null; _medidorEncadenarBorneras(g); return; }
  g.lugar = sl.lugar; g.ref = sl.ref;
  _REJ_SLOT_CAMPOS.forEach(function(k) {
    if (sl[k] !== undefined && sl[k] !== null) g[k] = sl[k];
    else if (k !== 'gapMm') delete g[k];
  });
}
function _rejillaAplicar(secs, quiereT) {
  _rejillaGuardarSlot();
  var termo = _rejillaTermostato();
  window._BORNERAS_GRUPOS = (window._BORNERAS_GRUPOS || []).filter(function(g) {
    return !(g.origen === 'rejilla' && (g.clase || 'bornera') === 'bornera');
  });
  if (!quiereT && termo) {
    window._BORNERAS_GRUPOS = window._BORNERAS_GRUPOS.filter(function(g) { return g !== termo; });
    termo = null;
  }
  var cadena = [];
  secs.forEach(function(sc) {
    var g = { id: _bornerasNuevoId(), clase: 'bornera', origen: 'rejilla',
              tipo: sc.tipo, cant: sc.cant, extIzq: sc.extIzq, extDer: sc.extDer,
              cantManual: !!sc.cantManual, gapMm: 30 };
    window._BORNERAS_GRUPOS.push(g);
    cadena.push(g);
  });

  if (quiereT) {
    if (!termo) {
      termo = { id: _bornerasNuevoId(), clase: 'termostato', origen: 'rejilla', cant: 1, gapMm: 30 };
      window._BORNERAS_GRUPOS.push(termo);
    }
    cadena.push(termo);
  }
  cadena.forEach(function(g, i) {
    if (i === 0) { _rejillaPonerEnSlot(g); return; }
    g.lugar = 'junto'; g.ref = cadena[i - 1].id;
    delete g.canaleta;                                                
  });
  var h = _rejillaColgado;
  _rejillaColgado = null;
  if (h && _bornerasGrupoPorId(h.id)) {
    if (cadena.length) { h.lugar = 'junto'; h.ref = cadena[cadena.length - 1].id; }
    else {


      var traeCan = !!(_rejillaSlot && _rejillaSlot.canaleta);
      _rejillaPonerEnSlot(h);
      if (traeCan) delete h.dentro;
    }
  }
  _rejillaSlot = null;
}

function confirmarModalRejilla() {
  window._REJILLA = true;

  if (window._igData) {
    var chk = document.getElementById('rejilla_borneras_chk');
    var secs = (chk && chk.checked) ? _seccLeer('rejilla_secciones') : [];
    var chkT = document.getElementById('rejilla_termostato_chk');
    _rejillaAplicar(secs, !!(chkT && chkT.checked));
  }
  _postCambioRejilla();
}

function quitarRejilla() {
  window._REJILLA = false;
  window._REJILLA_TOP_MM = null;
  _rejillaAplicar([], false);
  _postCambioRejilla();
}

function _postCambioRejilla() {
  cerrarModalRejilla();
  actualizarBibliotecaOtros();
  if (window._panelBusbarData && typeof dibujarPanelBusbar === 'function') {
    dibujarPanelBusbar();
  }
  if (window._vistaActual === 'frontal_puerta') aplicarVista('frontal_puerta');
  if (typeof guardarSesion === 'function') guardarSesion();
}


function onRejillaTriangleClick(triImg) {
  var prev = document.getElementById('tri_context_menu');
  if (prev) prev.remove();
  if (typeof _cerrarMenuTriangulo === 'function') _cerrarMenuTriangulo();
  var menu = document.createElement('div');
  menu.id = 'tri_context_menu';
  menu.className = 'dif-context-menu';
  var bE = document.createElement('button');
  bE.className = 'dif-context-btn'; bE.textContent = 'Editar';
  bE.addEventListener('click', function() { menu.remove(); abrirModalRejilla(); });
  menu.appendChild(bE);
  var bD = document.createElement('button');
  bD.className = 'dif-context-btn'; bD.textContent = 'Eliminar'; bD.style.color = '#ff6b6b';
  bD.addEventListener('click', function() { menu.remove(); quitarRejilla(); });
  menu.appendChild(bD);
  _abrirMenuTriangulo(menu, triImg);
}


function _avisoFlotante(msg) {
  var aviso = document.getElementById('aviso_flotante');
  if (!aviso) {
    aviso = document.createElement('div');
    aviso.id = 'aviso_flotante';
    aviso.className = 'aviso-flotante';
    document.body.appendChild(aviso);
  }
  aviso.textContent = msg;
  aviso.style.display = 'block';
  clearTimeout(aviso._t);
  aviso._t = setTimeout(function() { aviso.style.display = 'none'; }, 2600);
}




function toggleBiblioteca() {
  var panel = document.getElementById('biblioteca_panel');
  var btn   = document.getElementById('bib_expand_btn');
  if (!panel || !btn) return;
  var visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : 'flex';
  btn.style.display   = visible ? '' : 'none';
  document.body.classList.toggle('bib-colapsada', visible);
}




function bibSwitchTab(tab) {
  var esCotas = tab === 'cotas';
  if (esCotas && !_tableroListo()) return;                                
  var tE = document.getElementById('bib_tab_estructura');
  var tC = document.getElementById('bib_tab_cotas');
  var bE = document.getElementById('bib_tab_btn_estructura');
  var bC = document.getElementById('bib_tab_btn_cotas');
  if (tE) tE.style.display = esCotas ? 'none' : '';
  if (tC) tC.style.display = esCotas ? '' : 'none';
  if (bE) bE.classList.toggle('activo', !esCotas);
  if (bC) bC.classList.toggle('activo', esCotas);
}




var _BIB_PREF_COLAPSADA = 'protab_bib_colapsada';

function _bibPintarToggle(colapsada) {

  if (typeof _syncVistaUI === 'function') _syncVistaUI();
  var ic = document.getElementById('bib_toggle_icon');
  if (ic) ic.innerHTML = colapsada ? '&lsaquo;' : '&rsaquo;';
  var b = document.getElementById('bib_toggle');
  if (b) {
    var t = colapsada ? 'Mostrar panel' : 'Contraer panel';
    b.title = t;
    b.setAttribute('aria-label', t);
  }
}






var _bibCasaControles = null;                                                

function _bibReubicarControles(colapsada) {
  var hueco = document.getElementById('topbar_docked');
  var vista = document.getElementById('vista_flotante');
  var zoom = document.querySelector('.zoom-pill-flotante');
  if (!hueco || !vista || !zoom) return;
  if (!_bibCasaControles && vista.parentNode !== hueco) {
    _bibCasaControles = vista.parentNode;
  }
  if (colapsada) {

    hueco.appendChild(zoom);
    hueco.appendChild(vista);
  } else if (_bibCasaControles) {



    _bibCasaControles.appendChild(vista);
    _bibCasaControles.appendChild(zoom);
  }
}

function bibToggleColapsar() {
  var col = document.body.classList.toggle('bib-colapsada');
  _bibPintarToggle(col);
  _bibReubicarControles(col);
  try { localStorage.setItem(_BIB_PREF_COLAPSADA, col ? '1' : '0'); } catch (e) {}
}

window.addEventListener('DOMContentLoaded', function() {
  var col = false;
  try { col = localStorage.getItem(_BIB_PREF_COLAPSADA) === '1'; } catch (e) {}
  document.body.classList.toggle('bib-colapsada', col);
  _bibPintarToggle(col);

  _bibReubicarControles(col);
});
