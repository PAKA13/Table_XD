















var UE_L = 9;
function _ueAncho(t) { return _uniAnchoTxt(t, UE_L); }
function _ueT(x, y, txt, anc) {
  return '<text x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" text-anchor="' + (anc || 'start') +
    '" font-family="Arial, Helvetica, sans-serif" font-weight="300" font-size="' + UE_L +
    '" fill="#000" stroke="none" letter-spacing="0.4">' + _uniEsc(txt) + '</text>';
}
function _ueZona(id, abierta, x0, y0, x1, y1) {
  return '<rect class="ue-zona' + (abierta === id ? ' on' : '') + '" data-zona="' + id + '" x="' + (x0 - 2).toFixed(2) +
    '" y="' + (y0 - 1.5).toFixed(2) + '" width="' + (x1 - x0 + 4).toFixed(2) + '" height="' + (y1 - y0 + 3).toFixed(2) + '" rx="1.5"/>';
}
function _uePieza(nombre) {
  var p = (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB[nombre] : null;
  return p ? { cuerpo: p.cuerpo, vb: p.vb } : null;
}
function _ueEstilo() { return '<style>' + (typeof UNIFILAR_ESTILOS !== 'undefined' ? UNIFILAR_ESTILOS : '') + '</style>'; }




function _ueFila(y, x0, xTxt, cable, tubo, simb, lineas) {
  var out = '', xFl = xTxt + Math.max(_ueAncho(cable), _ueAncho(tubo)) + 13;
  out += '<path class="s1" d="M' + x0.toFixed(2) + ' ' + y + 'L' + xFl.toFixed(2) + ' ' + y + '"/>';
  out += '<path class="s3" d="M' + xFl.toFixed(2) + ' ' + y + 'L' + (xFl - 4).toFixed(2) + ' ' + (y - 1.3) + 'L' +
         (xFl - 4).toFixed(2) + ' ' + (y + 1.3) + 'Z"/>';
  out += _ueT(xTxt, y - 2.5, cable) + _ueT(xTxt, y + 9.25, tubo);
  var xD = xFl + 4, ps = simb ? _uePieza(_UNI_TAB_SAL[simb]) : null;
  if (ps && ps.vb) {
    var k = 10 / ps.vb[3];
    out += '<g transform="translate(' + xD.toFixed(2) + ' ' + (y - 5) + ') scale(' + k.toFixed(4) + ') translate(' +
           (-ps.vb[0]) + ' ' + (-ps.vb[1]) + ')">' + ps.cuerpo + '</g>';
    xD += ps.vb[2] * k + 4;
  }
  lineas = lineas.filter(function(l) { return String(l).trim(); });
  var y0 = y + 3 - (lineas.length - 1) * 11 / 2, xFin = xD;
  lineas.forEach(function(l, i) { out += _ueT(xD, y0 + i * 11, l); xFin = Math.max(xFin, xD + _ueAncho(l)); });
  return { out: out, xFl: xFl, xFin: Math.max(xFin, xFl + 14),
           yTop: Math.min(y - 11, y0 - 8.5), yBot: Math.max(y + 11.5, y0 + (lineas.length - 1) * 11 + 2.5) };
}


function _ueOptsGrupos(grupos, valor) {
  return grupos.map(function(g) {
    return '<optgroup label="' + _uniEsc(g[0]) + '">' + g[1].map(function(v) {
      return '<option value="' + _uniEsc(v) + '"' + (v === valor ? ' selected' : '') + '>' + _uniEsc(v) + '</option>';
    }).join('') + '</optgroup>';
  }).join('');
}
function _ueSelOpts(sel, lista, valor) {

  sel.innerHTML = lista.map(function(o) { return '<option value="' + _uniEsc(o[0]) + '">' + _uniEsc(o[1]) + '</option>'; }).join('');
  sel.value = String(valor);
}
function _ueSeg(id, ops) {
  return '<div class="ue-seg" id="' + id + '">' + ops.map(function(o) {
    return '<span data-v="' + o[0] + '"' + (o[2] ? ' title="' + _uniEsc(o[2]) + '"' : '') + '>' + o[1] + '</span>';
  }).join('') + '</div>';
}
function _ueSegSimb(id) {
  return _ueSeg(id, [['', 'Ninguno'], ['empotrado', _uniSimbImg('empotrado'), 'Tablero empotrado'],
                     ['panel', _uniSimbImg('panel'), 'Panel de distribución']]);
}
function _ueSegPoner(raiz, id, v) {
  var s = raiz.querySelector('#' + id);
  if (s) [].forEach.call(s.children, function(b) { b.classList.toggle('on', b.getAttribute('data-v') === v); });
}
var _UE_SECS = function() { return UNI_SECS.map(function(s) { return [s, _uniNum(s) + ' mm²']; }); };
var _UE_PAR = [[1, 'No'], [2, '2 juegos'], [3, '3 juegos'], [4, '4 juegos']];
var _UE_NTUB = [[1, '1 tubo'], [2, '2 tubos'], [3, '3 tubos'], [4, '4 tubos']];
function _ueMedOpts(uni) {
  return UNI_MED.map(function(m) { return [m.mm, uni === 'in' ? m.pl : m.mm + ' mm']; });
}
function _ueAislT() {
  return '<option value="">Igual a las fases</option>' + _ueOptsGrupos(UNI_AISL) +
         '<optgroup label="Sin aislamiento"><option value="DESNUDO">Desnudo</option></optgroup>';
}


function _ueAbrir(html, acciones) {
  _uniEditorCerrar();
  var p = document.getElementById('modo_unifilar');
  if (!p) return null;
  var e = document.createElement('div');
  e.id = 'uni_editor';
  e.className = 'ue';
  e.innerHTML = html +
    '<div class="ue-pie"><button type="button" class="ue-btn ue-izq" data-acc="restaurar">Restaurar</button>' +
    '<button type="button" class="ue-btn" data-acc="cancelar">Cancelar</button>' +
    '<button type="button" class="ue-btn pri" data-acc="guardar">Guardar</button></div>';
  e.querySelector('[data-acc=cancelar]').onclick = _uniEditorCerrar;
  e.querySelector('[data-acc=restaurar]').onclick = acciones.restaurar;
  e.querySelector('[data-acc=guardar]').onclick = function() {
    acciones.guardar();
    _uniEditorCerrar();
    if (typeof guardarSesion === 'function') guardarSesion();


    if (typeof _dibujarAlimentadorIG === 'function') {
      _dibujarAlimentadorIG(document.getElementById('panel_busbar_container'));
    }
    if (_uniAuto) { _renderUnifilar(true); return; }
    var wrap = document.querySelector('#modo_unifilar .uni-wrap');
    var sl = wrap ? wrap.scrollLeft : 0, st = wrap ? wrap.scrollTop : 0;
    _renderUnifilar(false);
    if (wrap) { wrap.scrollLeft = sl; wrap.scrollTop = st; }
  };
  e.addEventListener('keydown', function(ev) { if (ev.key === 'Escape') _uniEditorCerrar(); });
  var tb = p.querySelector('.plano-toolbar');
  var top = (tb ? tb.offsetHeight : 60) + 12;
  e.style.top = top + 'px';
  e.style.maxHeight = 'calc(100% - ' + (top + 16) + 'px)';
  p.appendChild(e);
  return e;
}

function _ueZonas(e, estado, redibujar) {
  var abrir = function(id) {
    estado.zona = estado.zona === id ? '' : id;
    e.querySelectorAll('.ue-sec[data-zona]').forEach(function(s) {
      s.classList.toggle('oculta', s.getAttribute('data-zona') !== estado.zona);
    });
    redibujar();
  };
  e.querySelector('.ue-prev svg').addEventListener('click', function(ev) {
    var z = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-zona');
    if (z) abrir(z);
  });
  return abrir;
}


function editarSalidasUnifilar(soloId) {
  var D = _uniDatos();
  var c = null;
  D.circuitos.forEach(function(x) { if (x.id === soloId && !x.dpsFila) c = x; });
  if (!c) return;
  var todos = (typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []);
  var it = null;
  todos.forEach(function(x) { if (x.id === soloId) it = x; });
  if (!it) return;
  var pb = window._panelBusbarData || {};
  var ctx = { conN: /\+N/.test(pb.fases || ''), tierra: D.tierra };
  var meta = _uniMeta();
  var salG = meta.salidas[c.id] || meta.salidas[c.rotulo] || {};
  var destDef = _uniDestinoDefecto(c.rotulo, c.reserva);
  var nuevo = function(g) {
    return {




      zona: '', propio: !!g.propio || (!g.todos && !Object.keys(g).length),
      cfg: g.propio ? Object.assign({}, UNI_PROY_DEF, g.propio) : uniProy(),
      campos: Object.assign({}, g.campos || {}),
      cable: g.cable || '', tubo: g.tubo || '',
      destino: (g.destino && g.destino.length) ? g.destino.join('\n') : destDef,
      tablero: g.tablero || '',



      extra: g.extra ? { desde: ((g.extra.desde === 'contactor' && !it.contactor) ||
                                 (g.extra.desde === 'dif' && !it.dif) || !g.extra.desde)
                                ? (it.dif ? 'dif' : 'itm') : g.extra.desde, cable: g.extra.cable || '',
                         tubo: g.extra.tubo || '',
                         destino: (g.extra.destino && g.extra.destino.length) ? g.extra.destino.join('\n') : '',
                         tablero: g.extra.tablero || '' } : null
    };
  };
  var st = nuevo(salG);
  var queEs = c.reserva ? 'Reserva'
    : (c.polos + 'P' + (c.capacidad ? ' · ' + c.capacidad + 'A' : '') + (c.dif ? (c.dif.reserva ? ' · DIF Reserva' : ' · DIF ' + (c.dif.capacidad || '') + 'A') : ''));

  var html = '<div class="ue-cab"><h4>Salida ' + _uniEsc(c.rotulo) + '</h4><span class="ue-chip" id="ue-chip"></span></div>' +
    '<div class="ue-prev"><svg id="ue-prev" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="ue-amb"><span>Aislamiento y tubería</span>' +
      _ueSeg('ue-amb', [['todos', 'Todos los circuitos'], ['solo', 'Solo este circuito']]) + '</div>' +

    '<div class="ue-sec oculta" data-zona="cable"><div class="ue-tit">Cable</div><div id="ue-campos">' +
      '<div class="ue-grid"><label>Aislamiento<select id="ue-ais">' + _ueOptsGrupos(UNI_AISL) + '</select></label>' +
        '<label>Sección<select id="ue-sec"></select></label></div>' +
      '<div class="ue-grid"><label>Tierra<select id="ue-tie"></select></label>' +
        '<label>Forma' + _ueSeg('ue-forma', [['uni', 'Unipolares'], ['multi', 'Multipolar']]) + '</label></div>' +
      '<button type="button" class="ue-mas" id="ue-mas">Más opciones</button>' +
      '<div class="ue-grid ue-avz" id="ue-avz"><label>En paralelo<select id="ue-par"></select></label>' +
        '<label id="ue-neu-w">Neutro<select id="ue-neu"></select></label>' +
        '<label>Aislamiento de la tierra<select id="ue-ais-t">' + _ueAislT() + '</select></label></div>' +
    '</div><div class="ue-res"><input id="ue-desc" spellcheck="false"></div></div>' +

    '<div class="ue-sec oculta" data-zona="tubo"><div class="ue-tit">Tubería</div>' +
      '<div class="ue-grid"><label>Tipo<select id="ue-tubtipo">' + _ueOptsGrupos(UNI_TUBOS) + '</select></label>' +
        '<label id="ue-uni-w">Unidad' + _ueSeg('ue-uni', [['mm', 'Milímetros'], ['in', 'Pulgadas']]) + '</label></div>' +
      '<div class="ue-grid" id="ue-med-w"><label>Medida<select id="ue-med"></select></label>' +
        '<label>Cantidad<select id="ue-ntub"></select></label></div>' +
      '<div class="ue-res"><input id="ue-tub" spellcheck="false"></div></div>' +

    '<div class="ue-sec oculta" data-zona="destino"><div class="ue-tit">Destino</div>' +
      '<label>Símbolo' + _ueSegSimb('ue-simb') + '</label>' +
      '<label class="ue-sp">Destino<textarea id="ue-dest" rows="2"></textarea></label>' +
      '<label class="ue-check"><input type="checkbox" id="ue-adic"> Agregar una salida adicional</label></div>' +

    '<div class="ue-sec oculta" data-zona="adicional"><div class="ue-tit">Salida adicional</div>' +
      '<div class="ue-grid"><label>Sale de<select id="ue-ad-desde"></select></label>' +
        '<label>Símbolo' + _ueSegSimb('ue-ad-simb') + '</label></div>' +
      '<label>Cable<div class="ue-res ue-res-in"><input id="ue-ad-cable" spellcheck="false"></div></label>' +
      '<label class="ue-sp">Tubería<div class="ue-res ue-res-in"><input id="ue-ad-tub" spellcheck="false"></div></label>' +
      '<label class="ue-sp">Destino<textarea id="ue-ad-dest" rows="2"></textarea></label>' +
      '<button type="button" class="ue-mas ue-quitar" id="ue-ad-quitar">Quitar la salida adicional</button></div>';

  var e = _ueAbrir(html, { guardar: guardar, restaurar: function() {

    Object.assign(st, nuevo({}));
    e.querySelectorAll('.ue-sec[data-zona]').forEach(function(s) { s.classList.add('oculta'); });

    e.querySelector('#ue-avz').classList.remove('abierto');
    pintar();
  } });
  if (!e) return;
  var $ = function(id) { return e.querySelector('#' + id); };
  var abrirZona = _ueZonas(e, st, function() { vista(); });


  function sal() {
    var s = { campos: st.campos, cable: st.cable, tubo: st.tubo };
    if (st.propio) s.propio = st.cfg;
    else s.todos = true;
    return s;
  }
  function calcular() {

    var guard = window._unifilarMeta.proyecto;
    if (!st.propio) window._unifilarMeta.proyecto = st.cfg;
    var r = uniSalida(it, sal(), ctx);
    var x = st.extra ? uniSalidaExtra(it, { extra: { cable: st.extra.cable, tubo: st.extra.tubo } }, ctx, r, st.extra.desde) : null;
    window._unifilarMeta.proyecto = guard;
    return { r: r, x: x };
  }

  function pintar() {
    var k = calcular(), r = k.r, o = r.o;
    $('ue-chip').textContent = queEs + (st.propio ? ' · Propio' : '');
    _ueSegPoner(e, 'ue-amb', st.propio ? 'solo' : 'todos');
    var cfg = st.cfg;
    $('ue-ais').value = cfg.ais; $('ue-ais-t').value = cfg.aisT || '';
    _ueSegPoner(e, 'ue-forma', cfg.forma);
    $('ue-tubtipo').value = cfg.tub; _ueSegPoner(e, 'ue-uni', cfg.uni);

    var hay = !!o;
    $('ue-campos').style.display = hay ? '' : 'none';
    if (hay) {
      _ueSelOpts($('ue-sec'), _UE_SECS(), o.S);
      $('ue-sec').classList.toggle('bajo', o.bajo);
      _ueSelOpts($('ue-par'), _UE_PAR, o.k);
      _ueSelOpts($('ue-tie'), (ctx.tierra ? [[0, 'Sin tierra']].concat(_UE_SECS()) : [[0, 'Sin tierra']]), o.T);
      $('ue-tie').disabled = !ctx.tierra;
      var neuOn = r.cond.n && r.cond.nF === 3;
      $('ue-neu-w').style.visibility = neuOn ? '' : 'hidden';
      if (neuOn) _ueSelOpts($('ue-neu'), UNI_SECS.filter(function(v) { return v <= o.S; }).map(function(v) {
        return [v, v === o.S ? 'Igual a la fase' : _uniNum(v) + ' mm²'];
      }), o.SN);
      $('ue-ais-t').disabled = !o.T;
      if (o.k > 1) $('ue-avz').classList.add('abierto');
    }
    $('ue-campos').classList.toggle('suelto', !!st.cable);
    if (document.activeElement !== $('ue-desc')) $('ue-desc').value = r.cable;

    var bandeja = cfg.tub === 'EN BANDEJA', tr = r.tuboRes || {};
    $('ue-med-w').style.display = bandeja ? 'none' : '';
    $('ue-uni-w').style.visibility = bandeja ? 'hidden' : '';
    if (tr.txt) {
      _ueSelOpts($('ue-med'), _ueMedOpts(cfg.uni), UNI_MED[tr.i].mm);
      _ueSelOpts($('ue-ntub'), _UE_NTUB, tr.n);
      $('ue-med').classList.toggle('bajo', !!tr.bajo);
    }
    if (document.activeElement !== $('ue-tub')) $('ue-tub').value = r.tubo;

    _ueSegPoner(e, 'ue-simb', st.tablero);
    if (document.activeElement !== $('ue-dest')) $('ue-dest').value = st.destino;
    $('ue-adic').checked = !!st.extra;

    var dsd = $('ue-ad-desde');
    dsd.innerHTML = '<option value="itm">Salida del ITM</option>' + (it.dif ? '<option value="dif">Salida del diferencial</option>' : '') +
      (it.contactor ? '<option value="contactor">Salida del contactor</option>' : '');
    if (st.extra) {
      dsd.value = st.extra.desde;
      _ueSegPoner(e, 'ue-ad-simb', st.extra.tablero);
      if (document.activeElement !== $('ue-ad-cable')) $('ue-ad-cable').value = k.x.cable;
      if (document.activeElement !== $('ue-ad-tub')) $('ue-ad-tub').value = k.x.tubo;
      if (document.activeElement !== $('ue-ad-dest')) $('ue-ad-dest').value = st.extra.destino || st.destino;
    }
    vista(k);
  }

  function vista(k) {
    k = k || calcular();
    var svg = $('ue-prev'), out = '', zonas = '', xTxt = 10, adic = !!st.extra, xIni = adic ? -26 : 0;
    var f1 = _ueFila(0, xIni, xTxt, k.r.cable, k.r.tubo, st.tablero, st.destino.split('\n'));
    out += f1.out;
    var xFin = f1.xFin, yMin = Math.min(-26, f1.yTop - 3), yMax = Math.max(26, f1.yBot + 4);
    zonas += _ueZona('cable', st.zona, xTxt, -11, xTxt + _ueAncho(k.r.cable), -0.8) +
             _ueZona('tubo', st.zona, xTxt, 2.2, xTxt + _ueAncho(k.r.tubo), 11.5) +
             _ueZona('destino', st.zona, f1.xFl + 4, f1.yTop, f1.xFin, f1.yBot);
    if (adic) {
      var PASO = 34, xP = -12, nom = st.extra.desde === 'dif' ? 'DIF' : (st.extra.desde === 'contactor' ? 'K' : 'ITM');
      var f2 = _ueFila(PASO, xP + 6, xTxt, k.x.cable, k.x.tubo, st.extra.tablero, (st.extra.destino || st.destino).split('\n'));
      out += '<path class="s1" fill="none" d="M' + xP + ' 0L' + xP + ' ' + (PASO - 6) + 'Q' + xP + ' ' + PASO + ' ' + (xP + 6) + ' ' + PASO + '"/>' + f2.out;
      out += '<circle class="s3" cx="' + xP + '" cy="0" r="1.4"/>';
      out += '<text x="' + (xIni + 1) + '" y="-3" font-family="Arial, Helvetica, sans-serif" font-size="6" fill="#98a2b3">' + nom + '</text>';
      zonas += _ueZona('adicional', st.zona, xP - 3, PASO - 11, f2.xFin, f2.yBot);
      xFin = Math.max(xFin, f2.xFin); yMax = Math.max(yMax, f2.yBot + 12);
    }
    out += '<path class="s1" stroke-dasharray="4 2" d="M0 ' + (yMin + 4) + 'L0 ' + (yMax - 4) + '"/>';
    svg.setAttribute('viewBox', [xIni - 6, yMin, xFin + 6 - (xIni - 6), yMax - yMin].map(function(v) { return v.toFixed(2); }).join(' '));
    svg.innerHTML = _ueEstilo() + out + zonas;
  }

  function guardar() {
    var k = calcular(), r = k.r, o = r.o, m = _uniMeta(), s = {};


    if (st.propio) s.propio = st.cfg;
    else { m.proyecto = st.cfg; s.todos = true; }

    var cp = {};
    if (o) {
      if (st.campos.sec && st.campos.sec !== o.prop.sec) cp.sec = st.campos.sec;
      if (st.campos.par && st.campos.par !== o.prop.k) cp.par = st.campos.par;
      if (st.campos.tie != null) cp.tie = st.campos.tie;
      if (st.campos.neu && st.campos.neu < o.S) cp.neu = st.campos.neu;
    }
    if (st.campos.med != null) { cp.med = st.campos.med; cp.ntub = st.campos.ntub || 1; }
    if (Object.keys(cp).length) s.campos = cp;
    if (st.cable && st.cable !== r.cableAuto) s.cable = st.cable;
    if (st.tubo && st.tubo !== r.tuboAuto) s.tubo = st.tubo;
    var lin = function(t) { return String(t || '').split('\n').map(function(x) { return x.trim(); }).filter(function(x) { return x; }); };
    var des = lin(st.destino);
    if (!(des.length === 1 && des[0] === destDef)) s.destino = des;
    if (st.tablero) s.tablero = st.tablero;
    if (st.extra) {
      var ex = { desde: st.extra.desde, tablero: st.extra.tablero || '' };
      if (st.extra.cable && st.extra.cable !== k.x.cableAuto) ex.cable = st.extra.cable;
      if (st.extra.tubo && st.extra.tubo !== k.x.tuboAuto) ex.tubo = st.extra.tubo;
      var dx = lin(st.extra.destino);
      if (dx.length && dx.join('\n') !== des.join('\n')) ex.destino = dx;
      s.extra = ex;
    }
    delete m.salidas[c.rotulo];
    if (Object.keys(s).length) m.salidas[c.id] = s;
    else delete m.salidas[c.id];
  }


  var segClick = function(id, fn) {
    [].forEach.call($(id).children, function(b) { b.addEventListener('click', function() { fn(b.getAttribute('data-v')); pintar(); }); });
  };

  var alCable = function(fn) { return function() { fn(this); st.cable = ''; pintar(); }; };
  $('ue-ais').addEventListener('change', alCable(function(el) { st.cfg.ais = el.value; }));
  $('ue-ais-t').addEventListener('change', alCable(function(el) { st.cfg.aisT = el.value; }));
  $('ue-sec').addEventListener('change', alCable(function(el) { st.campos.sec = +el.value; }));
  $('ue-par').addEventListener('change', alCable(function(el) { st.campos.par = +el.value; }));
  $('ue-tie').addEventListener('change', alCable(function(el) { st.campos.tie = +el.value; }));
  $('ue-neu').addEventListener('change', alCable(function(el) { st.campos.neu = +el.value; }));
  segClick('ue-forma', function(v) { st.cfg.forma = v; st.cable = ''; });
  $('ue-mas').addEventListener('click', function() { $('ue-avz').classList.toggle('abierto'); });
  $('ue-desc').addEventListener('input', function() { st.cable = this.value; pintar(); });
  var alTubo = function(fn) { return function() { fn(this); st.tubo = ''; pintar(); }; };
  $('ue-tubtipo').addEventListener('change', alTubo(function(el) { st.cfg.tub = el.value; }));
  $('ue-med').addEventListener('change', alTubo(function(el) { st.campos.med = +el.value; st.campos.ntub = +$('ue-ntub').value; }));
  $('ue-ntub').addEventListener('change', alTubo(function(el) { st.campos.med = +$('ue-med').value; st.campos.ntub = +el.value; }));
  segClick('ue-uni', function(v) { st.cfg.uni = v; st.tubo = ''; });
  $('ue-tub').addEventListener('input', function() { st.tubo = this.value; vista(); });
  segClick('ue-amb', function(v) {
    st.propio = v === 'solo';

    if (!st.propio) st.cfg = uniProy();
  });
  segClick('ue-simb', function(v) { st.tablero = v; });
  $('ue-dest').addEventListener('input', function() { st.destino = this.value; pintar(); });
  $('ue-adic').addEventListener('change', function() {
    if (this.checked) {
      st.extra = { desde: it.dif ? 'dif' : 'itm', cable: '', tubo: '', destino: '', tablero: '' };
      st.zona = ''; pintar(); abrirZona('adicional');
    } else {
      st.extra = null;
      if (st.zona === 'adicional') abrirZona('adicional'); else pintar();
    }
  });
  $('ue-ad-desde').addEventListener('change', function() { st.extra.desde = this.value; st.extra.cable = ''; st.extra.tubo = ''; pintar(); });
  segClick('ue-ad-simb', function(v) { if (st.extra) st.extra.tablero = v; });
  $('ue-ad-cable').addEventListener('input', function() { st.extra.cable = this.value; vista(); });
  $('ue-ad-tub').addEventListener('input', function() { st.extra.tubo = this.value; vista(); });
  $('ue-ad-dest').addEventListener('input', function() { st.extra.destino = this.value; vista(); });
  $('ue-ad-quitar').addEventListener('click', function() { $('ue-adic').checked = false; $('ue-adic').dispatchEvent(new Event('change')); });
  pintar();
}


function editarEntradaUnifilar() {
  var D = _uniDatos();
  var pb = window._panelBusbarData || {}, ig = window._igData;
  var nF = parseInt(pb.fases, 10) || 3, conN = /\+N/.test(pb.fases || ''), tierra = D.tierra;
  var meta = _uniMeta();
  var nuevo = function(me) {
    var cfg = uniEntradaCfg(me), rot = (me.patRotulo && me.patRotulo.length) ? me.patRotulo : ['PAT-01', '25 ohm'];
    return {
      zona: '', cfg: cfg, campos: Object.assign({}, me.campos || {}),
      cable: me.cable || '', tubo: me.tubo || '',
      pat: !!me.pat && tierra,
      contador: !!me.contador, codigo: me.contadorCodigo || 'M-1',
      mostrarOrigen: me.mostrarOrigen !== false, oriTocado: me.mostrarOrigen !== undefined,
      origen: me.origen || '', patRot: rot[0] || 'PAT-01', patOhm: rot[1] || '25 ohm',
      patCampos: Object.assign({}, me.patCampos || {}), patCable: me.patCable || '', patTubo: me.patTubo || ''
    };
  };
  var st = nuevo(meta.entrada || {});
  var html = '<div class="ue-cab"><h4>Entrada</h4><span class="ue-chip" id="ue-chip"></span></div>' +
    '<div class="ue-prev"><svg id="ue-prev" xmlns="http://www.w3.org/2000/svg"></svg></div>' +

    '<div class="ue-sec oculta" data-zona="llegada"><div class="ue-tit">Llegada</div>' +
      '<label class="ue-check ue-check0"><input type="checkbox" id="ue-med-on"> Viene de un medidor</label>' +
      '<div class="ue-grid ue-sp" id="ue-med-w2"><label>Código<select id="ue-cod"></select></label>' +
        '<label>Fases<div class="ue-res ue-res-in"><input id="ue-fases" readonly></div></label></div>' +
      '<label class="ue-check"><input type="checkbox" id="ue-ori"> Mostrar el origen</label>' +
      '<label class="ue-sp" id="ue-ori-w">Origen<div class="ue-res ue-res-in"><input id="ue-ori-txt" spellcheck="false"></div></label>' +
      (tierra ? '<label class="ue-check"><input type="checkbox" id="ue-pat"> Tierra a pozo (PAT)</label>' : '') +
      '</div>' +

    '<div class="ue-sec oculta" data-zona="cable"><div class="ue-tit">Cable</div><div id="ue-campos">' +
      '<div class="ue-grid"><label>Aislamiento<select id="ue-ais">' + _ueOptsGrupos(UNI_AISL) + '</select></label>' +
        '<label>Sección<select id="ue-sec"></select></label></div>' +
      '<div class="ue-grid"><label>Tierra<select id="ue-tie"></select></label>' +
        '<label>Forma' + _ueSeg('ue-forma', [['uni', 'Unipolares'], ['multi', 'Multipolar']]) + '</label></div>' +
      '<button type="button" class="ue-mas" id="ue-mas">Más opciones</button>' +
      '<div class="ue-grid ue-avz" id="ue-avz"><label>En paralelo<select id="ue-par"></select></label>' +
        '<label id="ue-neu-w">Neutro<select id="ue-neu"></select></label>' +
        '<label>Aislamiento de la tierra<select id="ue-ais-t">' + _ueAislT() + '</select></label></div>' +
    '</div><div class="ue-res"><input id="ue-desc" spellcheck="false"></div></div>' +

    '<div class="ue-sec oculta" data-zona="tubo"><div class="ue-tit">Tubería</div>' +
      '<div class="ue-grid"><label>Tipo<select id="ue-tubtipo">' + _ueOptsGrupos(UNI_TUBOS) + '</select></label>' +
        '<label id="ue-uni-w">Unidad' + _ueSeg('ue-uni', [['mm', 'Milímetros'], ['in', 'Pulgadas']]) + '</label></div>' +
      '<div class="ue-grid" id="ue-med-w"><label>Medida<select id="ue-med"></select></label>' +
        '<label>Cantidad<select id="ue-ntub"></select></label></div>' +
      '<div class="ue-res"><input id="ue-tub" spellcheck="false"></div></div>' +

    (tierra ?
    '<div class="ue-sec oculta" data-zona="pozo"><div class="ue-tit">Pozo a tierra</div>' +
      '<div class="ue-grid"><label>Rótulo<select id="ue-pat-rot"></select></label>' +
        '<label>Resistencia<select id="ue-pat-ohm"></select></label></div>' +
      '<div class="ue-grid"><label>Aislamiento del cable<select id="ue-pat-ais"><option value="">Igual a la entrada</option>' +
          _ueOptsGrupos(UNI_AISL) + '<optgroup label="Sin aislamiento"><option value="DESNUDO">Desnudo</option></optgroup></select></label>' +
        '<label>Sección<select id="ue-pat-sec"></select></label></div>' +
      '<div class="ue-res ue-mb"><input id="ue-pat-cable" spellcheck="false"></div>' +
      '<div class="ue-grid"><label>Tubería<select id="ue-pat-tubtipo"><option value="">Igual a la entrada</option>' + _ueOptsGrupos(UNI_TUBOS) + '</select></label>' +
        '<label>Medida<select id="ue-pat-med"></select></label></div>' +
      '<div class="ue-res"><input id="ue-pat-tub" spellcheck="false"></div></div>' : '');

  var e = _ueAbrir(html, { guardar: guardar, restaurar: function() {
    Object.assign(st, nuevo({}));
    e.querySelectorAll('.ue-sec[data-zona]').forEach(function(s) { s.classList.add('oculta'); });

    e.querySelector('#ue-avz').classList.remove('abierto');
    pintar();
  } });
  if (!e) return;
  var $ = function(id) { return e.querySelector('#' + id); };
  var abrirZona = _ueZonas(e, st, function() { vista(); });

  function me() {
    return { ais: st.cfg.ais, aisT: st.cfg.aisT, forma: st.cfg.forma, tub: st.cfg.tub, uni: st.cfg.uni,
             campos: st.campos, cable: st.cable, tubo: st.tubo, pat: st.pat,
             patCampos: st.patCampos, patCable: st.patCable, patTubo: st.patTubo };
  }
  var calcular = function() { return uniEntrada(me(), ig, nF, conN, tierra); };
  var origenDef = function() { return st.contador ? 'VIENE DE ' + st.codigo : 'VIENE DE RED'; };

  function pintar() {
    var r = calcular(), o = r.o, cfg = st.cfg;
    $('ue-chip').textContent = ig ? ('IG ' + ig.polos + 'P · ' + ig.corriente + 'A') : 'Sin IG';

    $('ue-med-on').checked = st.contador;
    $('ue-med-w2').style.display = st.contador ? '' : 'none';
    var cods = ['M-1', 'M-2', 'M-3', 'M-4', 'M-5'];
    if (cods.indexOf(st.codigo) === -1) cods.unshift(st.codigo);
    _ueSelOpts($('ue-cod'), cods.map(function(v) { return [v, v]; }), st.codigo);
    $('ue-fases').value = nF + 'Ø' + (conN ? '+N' : '');
    if (!st.oriTocado) st.mostrarOrigen = !st.contador;
    $('ue-ori').checked = st.mostrarOrigen;
    $('ue-ori-w').style.display = st.mostrarOrigen ? '' : 'none';
    if (document.activeElement !== $('ue-ori-txt')) $('ue-ori-txt').value = st.origen || origenDef();
    if ($('ue-pat')) $('ue-pat').checked = st.pat;

    _ueSegPoner(e, 'ue-forma', cfg.forma);
    $('ue-ais').value = cfg.ais; $('ue-ais-t').value = cfg.aisT || '';
    $('ue-campos').style.display = o ? '' : 'none';
    if (o) {
      _ueSelOpts($('ue-sec'), _UE_SECS(), o.S);
      $('ue-sec').classList.toggle('bajo', o.bajo);
      _ueSelOpts($('ue-par'), _UE_PAR, o.k);
      var tieOps = [[0, 'Sin tierra']];
      if (tierra) tieOps = tieOps.concat(_UE_SECS()).concat([['PAT', 'Al pozo (PAT)']]);
      _ueSelOpts($('ue-tie'), tieOps, st.pat ? 'PAT' : o.T);
      $('ue-tie').disabled = !tierra;
      $('ue-neu-w').style.visibility = conN ? '' : 'hidden';
      if (conN) _ueSelOpts($('ue-neu'), UNI_SECS.filter(function(v) { return v <= o.S; }).map(function(v) {
        return [v, v === o.S ? 'Igual a la fase' : _uniNum(v) + ' mm²'];
      }), o.SN);
      $('ue-ais-t').disabled = st.pat || !o.T;
      if (o.k > 1) $('ue-avz').classList.add('abierto');
    }
    $('ue-campos').classList.toggle('suelto', !!st.cable);
    if (document.activeElement !== $('ue-desc')) $('ue-desc').value = r.cable;

    var bandeja = cfg.tub === 'EN BANDEJA', tr = r.tuboRes || {};
    $('ue-tubtipo').value = cfg.tub; _ueSegPoner(e, 'ue-uni', cfg.uni);
    $('ue-med-w').style.display = bandeja ? 'none' : '';
    $('ue-uni-w').style.visibility = bandeja ? 'hidden' : '';
    if (tr.txt && tr.i != null) {
      _ueSelOpts($('ue-med'), _ueMedOpts(cfg.uni), UNI_MED[tr.i].mm);
      _ueSelOpts($('ue-ntub'), _UE_NTUB, tr.n);
      $('ue-med').classList.toggle('bajo', !!tr.bajo);
    }
    if (document.activeElement !== $('ue-tub')) $('ue-tub').value = r.tubo;

    if ($('ue-pat-rot')) {
      var rots = ['PAT-01', 'PAT-02', 'PAT-03'], ohms = ['5 ohm', '10 ohm', '15 ohm', '25 ohm'];
      if (rots.indexOf(st.patRot) === -1) rots.unshift(st.patRot);
      if (ohms.indexOf(st.patOhm) === -1) ohms.unshift(st.patOhm);
      _ueSelOpts($('ue-pat-rot'), rots.map(function(v) { return [v, v]; }), st.patRot);
      _ueSelOpts($('ue-pat-ohm'), ohms.map(function(v) { return [v, v]; }), st.patOhm);
      $('ue-pat-ais').value = st.patCampos.ais || '';
      _ueSelOpts($('ue-pat-sec'), _UE_SECS(), r.patSec || 16);
      $('ue-pat-tubtipo').value = st.patCampos.tub || '';
      var pt = r.patTuboRes || {};
      if (pt.txt && pt.i != null) _ueSelOpts($('ue-pat-med'), _ueMedOpts(cfg.uni), UNI_MED[pt.i].mm);
      $('ue-pat-med').disabled = (st.patCampos.tub || cfg.tub) === 'EN BANDEJA';
      if (document.activeElement !== $('ue-pat-cable')) $('ue-pat-cable').value = r.patCable;
      if (document.activeElement !== $('ue-pat-tub')) $('ue-pat-tub').value = r.patTubo;

      if (!st.pat && st.zona === 'pozo') abrirZona('pozo');
    }
    vista(r);
  }

  function vista(r) {
    r = r || calcular();
    var svg = $('ue-prev'), out = '', zonas = '', z = st.zona;
    var cable = r.cable, tubo = r.tubo;
    var xTxt = 10, xGab = xTxt + Math.max(_ueAncho(cable), _ueAncho(tubo)) + 30, xMin = -16, yMin = -24, yMax = 30;
    var cont = _uePieza('contador');
    if (st.contador && cont) {
      var cu = cont.cuerpo.replace(/(<tspan id="codigo">)[^<]*/, '$1' + _uniEsc(st.codigo))
                          .replace(/(<tspan id="fases">)[^<]*/, '$1' + nF + 'Ø' + (conN ? '+N' : ''));
      out += '<g transform="scale(0.9) translate(-9.77 -40.42)">' + cu + '</g>';
      zonas += _ueZona('llegada', z, -24, -50, 10, 0);
      yMin = -56; xMin = -42;
    } else {
      out += '<path class="s3" d="M0 0L-9 -5L-9 5Z"/>';
      zonas += _ueZona('llegada', z, -9, -5, 0, 5);
    }
    out += '<path class="s1" d="M0 0L' + xGab.toFixed(2) + ' 0"/>';
    out += _ueT(xTxt, -2.5, cable) + _ueT(xTxt, 9.25, tubo);
    zonas += _ueZona('cable', z, xTxt, -11, xTxt + _ueAncho(cable), -0.8) + _ueZona('tubo', z, xTxt, 2.2, xTxt + _ueAncho(tubo), 11.5);
    if (st.mostrarOrigen) {
      var xE = xGab - 14, txt = st.origen || origenDef(), w = _ueAncho(txt), xT = xE - 10;
      out += '<ellipse class="s2" fill="none" cx="' + xE.toFixed(2) + '" cy="0" rx="3.5" ry="9"/>';
      out += _ueT(xT, 25, txt, 'end') + '<path class="s2" fill="none" d="M' + (xT - w).toFixed(2) + ' 27L' + xT.toFixed(2) + ' 27L' + xE.toFixed(2) + ' 9"/>';
      zonas += _ueZona('llegada', z, xT - w, 17, xE + 3.5, 27);
      yMax = Math.max(yMax, 32);
    }
    var tp = _uePieza('tierra-proteccion');
    if (st.pat && tp) {
      var yP = 52, xP = 14, pc = r.patCable, pt = r.patTubo, xPt = xP + 12;
      out += '<path class="s1" d="M' + xP + ' ' + yP + 'L' + xGab.toFixed(2) + ' ' + yP + '"/>';
      out += '<g transform="translate(' + xP + ' ' + yP + ') scale(0.6) translate(0 28.21)">' + tp.cuerpo + '</g>';
      out += _ueT(xPt, yP - 2.5, pc) + _ueT(xPt, yP + 9.25, pt);
      out += _ueT(xP, yP + 34, st.patRot, 'middle') + _ueT(xP, yP + 45, st.patOhm, 'middle');
      zonas += _ueZona('pozo', z, xP - 12, yP - 11, Math.max(xPt + _ueAncho(pc), xPt + _ueAncho(pt)), yP + 47);
      xGab = Math.max(xGab, xPt + Math.max(_ueAncho(pc), _ueAncho(pt)) + 10);
      yMax = yP + 52;
    }
    out += '<path class="s1" stroke-dasharray="4 2" d="M' + xGab.toFixed(2) + ' ' + (yMin + 2) + 'L' + xGab.toFixed(2) + ' ' + (yMax - 2) + '"/>';
    svg.setAttribute('viewBox', [xMin, yMin, xGab + 8 - xMin, yMax - yMin].map(function(v) { return v.toFixed(2); }).join(' '));
    svg.innerHTML = _ueEstilo() + out + zonas;
  }

  function guardar() {
    var r = calcular(), o = r.o, m = _uniMeta(), p = uniProy(), en = {};
    ['ais', 'aisT', 'forma', 'tub', 'uni'].forEach(function(k) {
      var def = (k === 'aisT') ? '' : (k === 'forma' ? 'uni' : p[k]);
      if (st.cfg[k] && st.cfg[k] !== def) en[k] = st.cfg[k];
    });
    var cp = {};
    if (o) {
      if (st.campos.sec && st.campos.sec !== o.prop.sec) cp.sec = st.campos.sec;
      if (st.campos.par && st.campos.par !== o.prop.k) cp.par = st.campos.par;
      if (st.campos.tie != null) cp.tie = st.campos.tie;
      if (st.campos.neu && st.campos.neu < o.S) cp.neu = st.campos.neu;
    }
    if (st.campos.med != null) { cp.med = st.campos.med; cp.ntub = st.campos.ntub || 1; }
    if (Object.keys(cp).length) en.campos = cp;
    if (st.cable && st.cable !== r.cableAuto) en.cable = st.cable;
    if (st.tubo && st.tubo !== r.tuboAuto) en.tubo = st.tubo;
    var ori = (st.origen || '').trim();
    if (ori && ori !== origenDef()) en.origen = ori;
    else if (st.contador) en.origen = origenDef();
    en.mostrarOrigen = st.mostrarOrigen;


    ['alimVer', 'alimLlegada', 'alimLado', 'alimHaz', 'alimDx', 'alimAlto'].forEach(function(k) {
      if (m.entrada && m.entrada[k] !== undefined) en[k] = m.entrada[k];
    });
    en.contador = st.contador;
    en.contadorCodigo = st.codigo;
    if (tierra) {
      en.pat = st.pat;
      en.patRotulo = [st.patRot, st.patOhm];
      var pc = {};
      ['sec', 'ais', 'tub', 'med'].forEach(function(k) { if (st.patCampos[k]) pc[k] = st.patCampos[k]; });
      if (Object.keys(pc).length) en.patCampos = pc;
      if (st.patCable && st.patCable !== r.patAuto) en.patCable = st.patCable;
      if (st.patTubo && st.patTubo !== r.patTuboAuto) en.patTubo = st.patTubo;
    }
    m.entrada = en;
  }


  var segClick = function(id, fn) {
    [].forEach.call($(id).children, function(b) { b.addEventListener('click', function() { fn(b.getAttribute('data-v')); pintar(); }); });
  };
  var alCable = function(fn) { return function() { fn(this); st.cable = ''; pintar(); }; };
  $('ue-med-on').addEventListener('change', function() { st.contador = this.checked; st.origen = ''; pintar(); });
  $('ue-cod').addEventListener('change', function() { st.codigo = this.value; if (st.contador) st.origen = ''; pintar(); });
  $('ue-ori').addEventListener('change', function() { st.mostrarOrigen = this.checked; st.oriTocado = true; pintar(); });
  $('ue-ori-txt').addEventListener('input', function() { st.origen = this.value; vista(); });
  var ponerPat = function(on) { st.pat = on; st.cable = ''; if (!on) delete st.campos.tie; };
  if ($('ue-pat')) $('ue-pat').addEventListener('change', function() { ponerPat(this.checked); pintar(); });
  $('ue-ais').addEventListener('change', alCable(function(el) { st.cfg.ais = el.value; }));
  $('ue-ais-t').addEventListener('change', alCable(function(el) { st.cfg.aisT = el.value; }));
  $('ue-sec').addEventListener('change', alCable(function(el) { st.campos.sec = +el.value; }));
  $('ue-par').addEventListener('change', alCable(function(el) { st.campos.par = +el.value; }));
  $('ue-neu').addEventListener('change', alCable(function(el) { st.campos.neu = +el.value; }));
  $('ue-tie').addEventListener('change', alCable(function(el) {
    if (el.value === 'PAT') ponerPat(true);
    else { st.pat = false; st.campos.tie = +el.value; }
  }));
  segClick('ue-forma', function(v) { st.cfg.forma = v; st.cable = ''; });
  $('ue-mas').addEventListener('click', function() { $('ue-avz').classList.toggle('abierto'); });
  $('ue-desc').addEventListener('input', function() { st.cable = this.value; pintar(); });
  var alTubo = function(fn) { return function() { fn(this); st.tubo = ''; pintar(); }; };
  $('ue-tubtipo').addEventListener('change', alTubo(function(el) { st.cfg.tub = el.value; }));
  $('ue-med').addEventListener('change', alTubo(function(el) { st.campos.med = +el.value; st.campos.ntub = +$('ue-ntub').value; }));
  $('ue-ntub').addEventListener('change', alTubo(function(el) { st.campos.med = +$('ue-med').value; st.campos.ntub = +el.value; }));
  segClick('ue-uni', function(v) { st.cfg.uni = v; st.tubo = ''; });
  $('ue-tub').addEventListener('input', function() { st.tubo = this.value; vista(); });
  if ($('ue-pat-rot')) {
    $('ue-pat-rot').addEventListener('change', function() { st.patRot = this.value; vista(); });
    $('ue-pat-ohm').addEventListener('change', function() { st.patOhm = this.value; vista(); });
    $('ue-pat-ais').addEventListener('change', function() { st.patCampos.ais = this.value; st.patCable = ''; pintar(); });
    $('ue-pat-sec').addEventListener('change', function() { st.patCampos.sec = +this.value; st.patCable = ''; st.patTubo = ''; pintar(); });
    $('ue-pat-tubtipo').addEventListener('change', function() { st.patCampos.tub = this.value; st.patTubo = ''; pintar(); });
    $('ue-pat-med').addEventListener('change', function() { st.patCampos.med = +this.value; st.patTubo = ''; pintar(); });
    $('ue-pat-cable').addEventListener('input', function() { st.patCable = this.value; vista(); });
    $('ue-pat-tub').addEventListener('input', function() { st.patTubo = this.value; vista(); });
  }
  pintar();
}
