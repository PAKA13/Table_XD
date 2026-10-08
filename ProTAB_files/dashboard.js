







var LOGIN_FLAG = 'protab_desktop_logged_in';


function mostrarVista(vista) {
  var login = document.getElementById('vista_login');
  var dash  = document.getElementById('vista_dashboard');
  var edit  = document.getElementById('vista_editor');
  if (login) login.style.display = (vista === 'login') ? 'flex' : 'none';
  if (vista === 'login') _loginPreparar();
  if (dash)  dash.style.display  = (vista === 'dashboard') ? 'flex' : 'none';
  if (edit)  edit.style.display  = (vista === 'editor') ? 'flex' : 'none';



  if (vista !== 'editor') {
    if (typeof _v3dAbierto === 'function' && _v3dAbierto()) cerrarConector3D();
    if (window._uniAbierto && typeof cerrarUnifilar === 'function') cerrarUnifilar();
  }
  if (vista === 'dashboard') renderDashboard();





  else {
    var _grid = document.getElementById('dash_grid');
    if (_grid) _grid.innerHTML = '';
  }
}





function _anotarArranque() {
  try {
    var k = 'protab_arranques';
    var a = JSON.parse(localStorage.getItem(k) || '[]');
    a.push(new Date().toISOString());
    localStorage.setItem(k, JSON.stringify(a.slice(-20)));
  } catch (e) {}
}

function appBoot() {
  _anotarArranque();
  var logged = localStorage.getItem(LOGIN_FLAG) === '1';
  if (!logged) { mostrarVista('login'); return; }



  var id = null;
  try { id = PM.meta().activeId; } catch (e) {}
  var existe = false;
  if (id) {
    try {
      existe = (PM.meta().projects || []).some(function(p) { return p.id === id; });
    } catch (e) {}
  }
  if (existe) { abrirProyecto(id); return; }
  mostrarVista('dashboard');
}





function _loginPreparar() {
  var v = document.getElementById('app_version');
  var lv = document.getElementById('login_version');
  if (v && lv) lv.textContent = v.textContent;
  var p = document.getElementById('login_pass');
  if (p) { p.type = 'password'; p.value = ''; }
  var ojo = document.querySelector('#vista_login .login-ojo');
  if (ojo) ojo.classList.remove('visible');
}

function loginVerPass(btn) {
  var p = document.getElementById('login_pass');
  if (!p) return;
  var ver = (p.type === 'password');
  p.type = ver ? 'text' : 'password';
  if (btn) btn.classList.toggle('visible', ver);
}



function handleLogin(e) {
  if (e) e.preventDefault();
  localStorage.setItem(LOGIN_FLAG, '1');
  mostrarVista('dashboard');
  return false;
}

function cerrarSesionApp() {
  localStorage.removeItem(LOGIN_FLAG);
  mostrarVista('login');
}


function renderDashboard() {
  var grid = document.getElementById('dash_grid');
  if (!grid) return;
  grid.innerHTML = '';

  var m = PM.meta();
  var projects = m.projects.slice().sort(function(a, b) {
    return _tsProyecto(b) - _tsProyecto(a);
  });

  projects.forEach(function(p) {
    grid.appendChild(_crearTarjetaProyecto(p));
  });


  var nueva = document.createElement('div');
  nueva.className = 'dash-card dash-card-nueva';
  nueva.onclick = nuevoProyecto;
  nueva.innerHTML =
    '<div class="dash-nueva-icon">+</div>' +
    '<div class="dash-nueva-label">Nuevo proyecto</div>';
  grid.appendChild(nueva);

  var vacio = document.getElementById('dash_vacio');
  if (vacio) vacio.style.display = projects.length === 0 ? 'block' : 'none';
}

function _crearTarjetaProyecto(p) {
  var card = document.createElement('div');
  card.className = 'dash-card';
  card.onclick = function() { abrirProyecto(p.id); };


  var thumb = document.createElement('div');
  thumb.className = 'dash-thumb';
  if (p.thumbHtml && p.thumbW > 0) {
    var inner = document.createElement('div');
    inner.className = 'dash-thumb-inner';
    inner.innerHTML = p.thumbHtml;
    var marco = inner.firstElementChild;
    if (marco) {
      marco.style.display = 'block';
      marco.style.margin = '0';
      marco.style.zoom = '';

      var scale = Math.min(200 / p.thumbW, 140 / p.thumbH);
      marco.style.transform = 'scale(' + scale + ')';
      marco.style.transformOrigin = 'top left';
      inner.style.width = (p.thumbW * scale) + 'px';
      inner.style.height = (p.thumbH * scale) + 'px';
    }
    thumb.appendChild(inner);
  } else {
    thumb.innerHTML =
      '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c3c9d6" stroke-width="1.4" stroke-linecap="round">' +
      '<rect x="3" y="2" width="18" height="20" rx="2"/><rect x="7" y="6" width="10" height="12" rx="1"/>' +
      '<line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>';
  }
  card.appendChild(thumb);


  var info = document.createElement('div');
  info.className = 'dash-info';
  var nombre = document.createElement('div');
  nombre.className = 'dash-nombre';
  nombre.textContent = p.name;
  var resumen = document.createElement('div');
  resumen.className = 'dash-resumen';
  resumen.textContent = p.resumen || 'Vacío';
  var fecha = document.createElement('div');
  fecha.className = 'dash-fecha';
  fecha.textContent = _fechaRelativa(p.updatedAt);
  info.appendChild(nombre);
  info.appendChild(resumen);
  info.appendChild(fecha);
  card.appendChild(info);


  var menuBtn = document.createElement('button');
  menuBtn.className = 'dash-menu-btn';
  menuBtn.textContent = '⋮';
  menuBtn.title = 'Opciones';
  menuBtn.onclick = function(e) {
    e.stopPropagation();
    _toggleMenuProyecto(card, p);
  };
  card.appendChild(menuBtn);

  return card;
}

function _toggleMenuProyecto(card, p) {
  _cerrarMenusProyecto();
  var menu = document.createElement('div');
  menu.className = 'dash-menu';
  var opciones = [
    { label: 'Abrir',     fn: function() { abrirProyecto(p.id); } },
    { label: 'Renombrar', fn: function() { renombrarProyecto(p.id, p.name); } },
    { label: 'Duplicar',  fn: function() { PM.duplicate(p.id); renderDashboard(); } },
    { label: 'Eliminar',  fn: function() { eliminarProyecto(p.id, p.name); }, danger: true }
  ];
  opciones.forEach(function(op) {
    var btn = document.createElement('button');
    btn.textContent = op.label;
    if (op.danger) btn.className = 'dash-menu-danger';
    btn.onclick = function(e) { e.stopPropagation(); _cerrarMenusProyecto(); op.fn(); };
    menu.appendChild(btn);
  });
  card.appendChild(menu);
}

function _cerrarMenusProyecto() {
  document.querySelectorAll('.dash-menu').forEach(function(mn) { mn.remove(); });
}
document.addEventListener('click', _cerrarMenusProyecto);





function _tsProyecto(p) {
  var t = PM._ts(p && p.updatedAt);
  return isNaN(t) ? 0 : t;
}

function _fechaRelativa(v) {
  var ts = PM._ts(v);
  if (isNaN(ts)) return '';
  var diff = Date.now() - ts;
  var min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return 'hace ' + min + ' min';
  var h = Math.floor(min / 60);
  if (h < 24) return 'hace ' + h + ' h';
  var dias = Math.floor(h / 24);
  if (dias === 1) return 'ayer';
  if (dias < 30) return 'hace ' + dias + ' días';
  return new Date(ts).toLocaleDateString('es-PE');
}










var _NP_TENSIONES = {
  '3F':   ['220 V', '380 V', '440 V', '460 V'],
  '3F+N': ['220 / 127 V', '380 / 220 V', '400 / 230 V', '440 / 254 V'],
  '2F':   ['220 V', '380 V', '440 V'],
  '1F+N': ['127 V', '220 V', '230 V']
};
var _NP_TENSION_DEF = { '3F': '380 V', '3F+N': '380 / 220 V', '2F': '220 V', '1F+N': '220 V' };



var _NP_ORDEN_DEF = { '3F': 'R - S - T', '3F+N': 'R - S - T - N', '2F': 'R - S', '1F+N': 'R-N' };
function _npSeg(id, val) {
  document.querySelectorAll('#' + id + ' button').forEach(function(b) {
    b.classList.toggle('activo', b.dataset.val === val);
  });
}
function _npSegValor(id) {
  var b = document.querySelector('#' + id + ' button.activo');
  return b ? b.dataset.val : '';
}
function _npTensiones(fases) {
  var sel = document.getElementById('np_tension');
  if (!sel) return;

  sel.disabled = !_NP_TENSIONES[fases];                                         
  if (!_NP_TENSIONES[fases]) {
    sel.innerHTML = '<option value="" disabled selected>— Elige las fases —</option>';
    return;
  }
  sel.innerHTML = _NP_TENSIONES[fases].map(function(t) {
    return '<option value="' + t + '">' + t + '</option>';
  }).join('');
  if (_NP_TENSION_DEF[fases]) sel.value = _NP_TENSION_DEF[fases];
}


var _npEditando = false;
function _npModo(editar) {
  _npEditando = !!editar;
  var t = document.getElementById('np_titulo'), b = document.getElementById('np_ok');
  if (t) t.textContent = editar ? "Modificar datos del proyecto" : "Crear un proyecto";
  if (b) b.textContent = editar ? "Guardar cambios" : "Comenzar proyecto";
}


var _NP_TABLEROS = [
  ['Tablero General', 'TG'],
  ['Tablero de Distribución', 'TD'],
  ['Sub Tablero', 'ST'],
  ['Tablero de Fuerza', 'TF'],
  ['Tablero de Alumbrado', 'TA'],
  ['Tablero de Servicios Generales', 'TSG'],



  ['Tablero de Emergencia', 'TE'],
  ['Tablero de Aire Acondicionado', 'TAA'],
  ['Tablero de Control', 'TC']
];
function _npSugCerrar() {
  var l = document.getElementById('np_sug_lista');
  if (l) l.style.display = 'none';
}
function _npSugAbrir() {
  var l = document.getElementById('np_sug_lista');
  if (!l) return;
  if (l.style.display !== 'none') { _npSugCerrar(); return; }
  l.innerHTML = '';
  _NP_TABLEROS.forEach(function(t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'np-sug-item';
    b.innerHTML = '<span></span><b></b>';
    b.firstChild.textContent = t[0];
    b.lastChild.textContent = t[1];
    b.onclick = function() {
      document.getElementById('np_nombre').value = t[0];
      document.getElementById('np_abrev').value = t[1];
      _npSugCerrar();
    };
    l.appendChild(b);
  });
  l.style.display = 'block';
}



function _npSyncSegs() {
  _npSeg('np_fases_seg', (document.getElementById('np_fases') || {}).value || '');
  _npSeg('np_barra_seg', (document.getElementById('np_barra_pe') || {}).value || 'pe');
}


function _npFocoNombre() {
  var tactil = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (tactil) return;
  var n = document.getElementById('np_nombre');
  n.focus(); n.select();
}
function _npPreparar(ov) {
  if (ov._listo) return;
  ov._listo = true;
  var selF = document.getElementById('np_fases');
  if (selF) selF.onchange = function() { _npTensiones(selF.value); };
  document.querySelectorAll('#np_fases_seg button').forEach(function(b) {
    b.onclick = function() {
      selF.value = b.dataset.val;
      _npTensiones(selF.value);
      _npSeg('np_fases_seg', b.dataset.val);
    };
  });
  var sugBtn = document.getElementById('np_sug_btn');
  if (sugBtn) sugBtn.onclick = function(e) { e.stopPropagation(); _npSugAbrir(); };

  ov.addEventListener('mousedown', function(e) {
    if (!e.target.closest('.np-nombre-wrap')) _npSugCerrar();
  });
  document.querySelectorAll('#np_barra_seg button').forEach(function(b) {
    b.onclick = function() {
      document.getElementById('np_barra_pe').value = b.dataset.val;
      _npSeg('np_barra_seg', b.dataset.val);
    };
  });

  document.querySelectorAll('#nuevoProy_overlay .np-paso-btn').forEach(function(b) {
    b.onclick = function() {
      var inp = document.getElementById('np_polos');
      var v = parseInt(inp.value, 10);
      if (isNaN(v)) v = 12;
      else v += parseInt(b.dataset.paso, 10);
      v = Math.max(2, Math.min(60, v));
      if (v % 2) v += 1;
      inp.value = v;
    };
  });
  document.querySelectorAll('#np_frecuencia button').forEach(function(b) {
    b.onclick = function() { _npSeg('np_frecuencia', b.dataset.val); };
  });
  document.querySelectorAll('#np_tipo button').forEach(function(b) {
    b.onclick = function() { _npSeg('np_tipo', b.dataset.val); };
  });
  ov.addEventListener('keydown', function(e) { if (e.key === 'Escape') cerrarNuevoProyecto(); });
}
function nuevoProyecto() {
  var ov = document.getElementById('nuevoProy_overlay');
  if (!ov) return;
  _npModo(false);


  document.getElementById('np_nombre').value = '';
  document.getElementById('np_abrev').value = '';
  document.getElementById('np_polos').value = '';
  document.getElementById('np_barra_pe').value = 'pe';
  document.getElementById('np_error').textContent = '';
  document.getElementById('np_fases').value = '';
  _npTensiones('');
  _npSeg('np_frecuencia', '60 Hz');
  _npSeg('np_tipo', 'adosado');
  _npPreparar(ov);
  _npSyncSegs();
  ov.style.display = 'flex';
  _npFocoNombre();
}
function cerrarNuevoProyecto() {
  _npSugCerrar();
  var ov = document.getElementById('nuevoProy_overlay');
  if (ov) ov.style.display = 'none';
}
function confirmarNuevoProyecto() {
  var err = document.getElementById('np_error');
  var fases = document.getElementById('np_fases').value;
  var polos = parseInt(document.getElementById('np_polos').value, 10);
  if (!fases) { err.textContent = "Selecciona el sistema de fases para continuar."; return; }
  if (isNaN(polos)) { err.textContent = "Introduce la cantidad de polos."; return; }

  var _ePolos = polosPanelError(polos);
  if (_ePolos) { err.textContent = _ePolos; return; }
  var nombre = (document.getElementById('np_nombre').value || '').trim() ||
               (_npEditando ? (document.getElementById('editor_proyecto_nombre').textContent || '')
                            : ('Proyecto ' + (PM.meta().projects.length + 1)));
  var datos = {
    abreviatura: (document.getElementById('np_abrev').value || '').trim(),
    tension: document.getElementById('np_tension').value,
    frecuencia: _npSegValor('np_frecuencia') || '60 Hz',
    tipo: _npSegValor('np_tipo') || 'adosado',
    fases: fases, polos: polos,
    subfases: _NP_ORDEN_DEF[fases] || '',
    barraTierra: document.getElementById('np_barra_pe').value || 'pe'
  };
  cerrarNuevoProyecto();
  if (_npEditando) { _npModo(false); _aplicarEdicionProyecto(nombre, datos); return; }
  crearProyecto(nombre, datos);
}








function _aplicarEdicionProyecto(nombre, datos) {
  var id = PM.meta().activeId;
  if (!id) return;
  var t = window._TABLERO || {};
  window._TABLERO = { nombre: nombre, abreviatura: datos.abreviatura || '', sistema: t.sistema || '' };
  var span = document.getElementById('editor_proyecto_nombre');
  if (nombre && span && nombre !== span.textContent) {
    PM.rename(id, nombre);
    span.textContent = nombre;
  }
  window._fichaMeta = Object.assign({}, window._fichaMeta || {},
    { tension: datos.tension || '', frecuencia: datos.frecuencia || '' });

  var gab = window._gabineteData;
  if (gab && typeof abrirModalGab === 'function' && typeof confirmarModalGab === 'function') {
    var tipoAct = gab.tipo === 'empotrado' ? 'empotrado' : 'adosado';
    if (tipoAct !== datos.tipo) {
      abrirModalGab();
      if (typeof setGabTipo === 'function') setGabTipo(datos.tipo);
      confirmarModalGab();
    }
  }

  var pb = window._panelBusbarData;
  if (pb && typeof abrirModalPB === 'function' && typeof confirmarModalPB === 'function') {
    var cambiaFases = pb.fases !== datos.fases;
    var cambia = cambiaFases || String(pb.polos) !== String(_pbPolosDesdeCampo(datos.polos)) ||
                 (pb.barraTierra || 'pe') !== datos.barraTierra;
    if (cambia) {
      abrirModalPB();
      if (cambiaFases) {
        var fSel = document.getElementById('modalPB_fases');
        if (fSel) fSel.value = datos.fases;
        if (typeof onFasesChange === 'function') onFasesChange();
        var sSel = document.getElementById('modalPB_subfases_sel');
        if (sSel && Array.prototype.some.call(sSel.options, function(o) { return o.value === datos.subfases; })) {
          sSel.value = datos.subfases;
          if (typeof onSubfasesChange === 'function') onSubfasesChange();
        }
      }
      var pSel = document.getElementById('modalPB_polos');
      if (pSel) pSel.value = datos.polos;
      var btSel = document.getElementById('modalPB_barraTierra');
      if (btSel) btSel.value = datos.barraTierra;
      confirmarModalPB();
    }
  } else if (!pb) {
    window._pbInicial = { fases: datos.fases, polos: datos.polos, subfases: datos.subfases || '',
                          barraTierra: datos.barraTierra || 'pe' };
  }


  if (window._vistaActual === 'frontal_puerta' && typeof aplicarVista === 'function') {
    aplicarVista('frontal_puerta');
  }
  if (typeof guardarSesion === 'function') guardarSesion();
}

function crearProyecto(nombre, datos) {
  datos = datos || {};
  var id = PM.create(nombre);
  resetEstado();
  var m = PM.meta(); m.activeId = id; PM._saveMeta(m);



  PM._cargado = id;
  window._TABLERO = { nombre: nombre, abreviatura: datos.abreviatura || '', sistema: '' };
  if (datos.tension || datos.frecuencia) {
    window._fichaMeta = { tension: datos.tension || '', frecuencia: datos.frecuencia || '' };
  }
  window._pbInicial = datos.fases ? { fases: datos.fases, polos: datos.polos, subfases: datos.subfases || '',
                                       barraTierra: datos.barraTierra || 'pe' } : null;
  mostrarVista('editor');
  if (typeof setModoEditor === 'function') setModoEditor('diseno');




  if (typeof bibSwitchTab === 'function') bibSwitchTab('estructura');
  if (typeof _bibExpandir === 'function') _bibExpandir();
  document.getElementById('editor_proyecto_nombre').textContent = nombre;
  if (typeof guardarSesion === 'function') guardarSesion();
  _armarTableroInicial(datos);
}






function _armarTableroInicial(datos) {
  if (!datos || !datos.tipo) return;
  if (typeof abrirModalGab !== 'function' || typeof confirmarModalGab !== 'function') return;
  abrirModalGab();
  if (typeof setGabTipo === 'function') setGabTipo(datos.tipo);
  confirmarModalGab();
  if (!window._gabineteData || !datos.fases) return;
  if (typeof abrirModalPB !== 'function' || typeof confirmarModalPB !== 'function') return;
  abrirModalPB();                                                  
  confirmarModalPB();
}

function abrirProyecto(id) {
  mostrarVista('editor');
  if (typeof setModoEditor === 'function') setModoEditor('diseno');
  PM.open(id);
  var m = PM.meta();
  var proy = m.projects.find(function(p) { return p.id === id; });
  document.getElementById('editor_proyecto_nombre').textContent = proy ? proy.name : '';
}






function editarNombreProyecto() {
  var id = PM.meta().activeId;
  if (!id) return;
  var t = window._TABLERO || {};
  var span = document.getElementById('editor_proyecto_nombre');



  var ov = document.getElementById('nuevoProy_overlay');
  if (ov) {
    _npPreparar(ov);
    _npModo(true);
    var gab = window._gabineteData || {};
    var pb = window._panelBusbarData || window._pbInicial || {};
    var fm = (typeof _fichaDatos === 'function') ? _fichaDatos() : (window._fichaMeta || {});
    var fases = _NP_TENSIONES[pb.fases] ? pb.fases : '3F+N';
    document.getElementById('np_nombre').value = t.nombre || (span ? span.textContent : '');
    document.getElementById('np_abrev').value = t.abreviatura || '';
    _npSeg('np_tipo', gab.tipo === 'empotrado' ? 'empotrado' : 'adosado');
    document.getElementById('np_fases').value = fases;
    _npTensiones(fases);
    var tSel = document.getElementById('np_tension');
    if (fm.tension) {

      if (!Array.prototype.some.call(tSel.options, function(o) { return o.value === fm.tension; })) {
        var op = document.createElement('option');
        op.value = op.textContent = fm.tension;
        tSel.appendChild(op);
      }
      tSel.value = fm.tension;
    }
    document.getElementById('np_polos').value = _pbPolosEfectivos(pb) || '12';
    document.getElementById('np_barra_pe').value = pb.barraTierra || 'pe';
    _npSeg('np_frecuencia', fm.frecuencia === '50 Hz' ? '50 Hz' : '60 Hz');
    _npSyncSegs();
    document.getElementById('np_error').textContent = '';
    ov.style.display = 'flex';
    _npFocoNombre();
    return;
  }

  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(m) { m.classList.remove('activo'); });
  document.getElementById('modalTablero_overlay').classList.add('activo');

  document.getElementById('tablero_nombre').value = t.nombre || (span ? span.textContent : '');
  document.getElementById('tablero_abrev').value = t.abreviatura || '';
  document.getElementById('tablero_sistema').value = t.sistema || '';
  document.getElementById('tablero_nombre').focus();
}

function cerrarModalTablero() {
  var ov = document.getElementById('modalTablero_overlay');
  if (ov) ov.classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
}

function confirmarModalTablero() {
  var id = PM.meta().activeId;
  var nombre = (document.getElementById('tablero_nombre').value || '').trim();
  window._TABLERO = {
    nombre: nombre,
    abreviatura: (document.getElementById('tablero_abrev').value || '').trim(),
    sistema: (document.getElementById('tablero_sistema').value || '').trim()
  };

  var span = document.getElementById('editor_proyecto_nombre');
  if (id && nombre && span && nombre !== span.textContent) {
    PM.rename(id, nombre);
    span.textContent = nombre;
  }
  cerrarModalTablero();

  if (window._vistaActual === 'frontal_puerta' && typeof aplicarVista === 'function') {
    aplicarVista('frontal_puerta');
  }
  if (typeof guardarSesion === 'function') guardarSesion();
}

function renombrarProyecto(id, nombreActual) {
  var nuevo = prompt('Nuevo nombre:', nombreActual);
  if (nuevo === null) return;
  nuevo = (nuevo || '').trim();
  if (!nuevo) return;
  PM.rename(id, nuevo);
  renderDashboard();
}

function eliminarProyecto(id, nombre) {
  if (!confirm('¿Eliminar "' + nombre + '"? Esta acción no se puede deshacer.')) return;
  PM.remove(id);
  renderDashboard();
}


function volverAlInicio() {
  PM.save({ miniatura: true });                                             
  mostrarVista('dashboard');
}
