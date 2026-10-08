












window._pdfMeta = window._pdfMeta || null;

function abrirModalPDF() {

  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'flex';
  document.querySelectorAll('.sp-modal').forEach(function(x) { x.classList.remove('activo'); });
  var ov = document.getElementById('modalPDF_overlay');
  if (!ov) return;
  ov.classList.add('activo');
  var m = window._pdfMeta || {};
  function set(id, v) { var el = document.getElementById(id); if (el) el.value = v || ''; }
  var proyNombre = '';
  try {
    var meta = PM.meta();
    var p = meta.projects.find(function(x) { return x.id === meta.activeId; });
    proyNombre = p ? p.name : '';
  } catch (e) {}
  set('pdf_cliente', m.cliente);
  set('pdf_proyecto', m.proyecto || proyNombre);
  set('pdf_titulo', m.titulo);
  set('pdf_cotizacion', m.cotizacion);
  set('pdf_orden', m.orden);
  set('pdf_plano', m.plano);
  set('pdf_hoja', m.hoja || '1');
  set('pdf_hojas_total', m.hojasTotal || '1');
  set('pdf_rev', m.rev || '1');
  set('pdf_dis_nombre', m.disNombre); set('pdf_dis_fecha', m.disFecha);

  var elT = document.getElementById('pdf_titulo');
  if (elT && !elT.value) elT.value = 'Plano mecánico';

  var btnG = document.querySelector('#modalPDF_overlay .m1-guardar');
  var _tau = window.__TAURI_INTERNALS__;
  if (btnG) btnG.textContent = (_tau && typeof _tau.invoke === 'function') ? 'Guardar PDF' : 'Imprimir PDF';


}

function cerrarModalPDF() {
  var ov = document.getElementById('modalPDF_overlay');
  if (ov) ov.classList.remove('activo');
  var side = document.getElementById('sidepanel');
  if (side) side.style.display = 'none';
}

function confirmarModalPDF() {
  function get(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  window._pdfMeta = {
    cliente: get('pdf_cliente'), proyecto: get('pdf_proyecto'),
    titulo: get('pdf_titulo'), cotizacion: get('pdf_cotizacion'),
    orden: get('pdf_orden'), plano: get('pdf_plano'), hoja: get('pdf_hoja'),
    rev: get('pdf_rev'), hojasTotal: get('pdf_hojas_total'),
    disNombre: get('pdf_dis_nombre'), disFecha: get('pdf_dis_fecha'),


    revNombre: (window._pdfMeta || {}).revNombre || '', revFecha: (window._pdfMeta || {}).revFecha || '',
    aprNombre: (window._pdfMeta || {}).aprNombre || '', aprFecha: (window._pdfMeta || {}).aprFecha || ''
  };
  if (typeof guardarSesion === 'function') guardarSesion();
  cerrarModalPDF();

  if (window._modoEditor === 'metrado' && window._metradoTab === 'plano' &&
      typeof _renderModoPlano === 'function') _renderModoPlano();
  exportarPDF();
}




function _cajetinMeta(pagina, hoja, total, escala) {
  var m = window._pdfMeta || {};
  var nombre = '';
  try {
    var meta = PM.meta();
    var p = meta.projects.find(function(x) { return x.id === meta.activeId; });
    nombre = p ? p.name : '';
  } catch (e) {}
  var hoy = new Date(), dd = function(v) { return (v < 10 ? '0' : '') + v; };
  return {
    proyecto: m.proyecto || nombre, cliente: m.cliente || '',
    pagina: pagina, proyectista: m.disNombre || '',
    fecha: m.disFecha || (dd(hoy.getDate()) + '/' + dd(hoy.getMonth() + 1) + '/' + hoy.getFullYear()),
    plano: m.plano || '', cotizacion: m.cotizacion || '', orden: m.orden || '',
    rev: m.rev || '1', escala: escala || '—', hoja: String(hoja || 1), total: String(total || 1)
  };
}


function _escPdf(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _tablaListaEquiposPDF() {
  var filas = _filasMetrado();
  if (!filas.length) return '';
  var html = '<table class="cj-tabla"><tbody>' +
    '<tr><td colspan="3" class="cj-titulo">LISTA DE EQUIPOS</td></tr>' +
    '<tr class="cj-head"><td>DESIGNACIÓN</td><td>DESCRIPCIÓN</td><td>CANT.</td></tr>';
  filas.forEach(function(f) {
    html += '<tr><td>' + _escPdf(_metradoRotTxt(f) || '—') + '</td>' +
      '<td>' + _escPdf(f.desc) + '</td><td class="cj-c">' + _escPdf(f.qty) +
      (f.unidad ? ' ' + _escPdf(f.unidad) : '') + '</td></tr>';
  });
  return html + '</tbody></table>';
}

var _PLANCHA_LBL = { laf: 'LAF', lac: 'LAC', inox: 'Inox.', galv: 'Galv.' };

function _tablaCaracteristicasPDF() {
  var d = window._gabineteData;
  if (!d) return '';
  var html = '<table class="cj-tabla"><tbody>' +
    '<tr><td colspan="2" class="cj-titulo">CARACTERÍSTICAS CONSTRUCTIVAS</td></tr>' +
    '<tr><td>Tipo de fijación</td><td>' + (d.tipo === 'empotrado' ? 'Empotrado' : 'Adosado') + '</td></tr>';
  if (d.ip) html += '<tr><td>Grado de protección IP</td><td>IP ' + _escPdf(d.ip) + '</td></tr>';
  var paneles = [
    { key: 'cuerpo', lbl: 'Cuerpo' }, { key: 'puerta', lbl: 'Puerta' },
    { key: 'placa', lbl: 'Placa base' }, { key: 'mandil', lbl: 'Mandil' }
  ];
  paneles.forEach(function(pd) {
    var p = d[pd.key];
    if (!p) return;
    var mat = (_PLANCHA_LBL[p.plancha] || p.plancha) + ' ' + p.espesor + 'mm';
    var acab = (p.acabado === 'pintura')
      ? ('Pintura' + (p.ral ? ' RAL ' + _escPdf(p.ral) : '') + (p.micras ? ' · ' + p.micras + 'µ' : ''))
      : _escPdf(p.acabado || '');
    html += '<tr><td>' + pd.lbl + '</td><td>' + _escPdf(mat) + (acab ? ' · ' + acab : '') + '</td></tr>';
  });
  return html + '</tbody></table>';
}

function _tablaDimensionesPDF() {
  var d = window._gabineteData;
  var marco = document.getElementById('marco_gabinete');
  if (!d || !marco) return '';
  var dims = window._vistaFrontalDims || {
    w: parseFloat(marco.style.width) || 750,
    h: parseFloat(marco.style.height) || 750
  };
  if (window._vistaActual !== 'lateral') {                                                             
    dims = { w: parseFloat(marco.style.width) || dims.w, h: parseFloat(marco.style.height) || dims.h };
  }
  var profTotal = (d.profGabMm || 120) + (d.profPuertaMm || 0);
  return '<table class="cj-tabla"><tbody>' +
    '<tr><td colspan="2" class="cj-titulo">DIMENSIONES</td></tr>' +
    '<tr><td>Alto</td><td>' + (dims.h * PX_TO_MM).toFixed(0) + ' mm</td></tr>' +
    '<tr><td>Ancho</td><td>' + (dims.w * PX_TO_MM).toFixed(0) + ' mm</td></tr>' +
    '<tr><td>Profundidad</td><td>' + profTotal.toFixed(0) + ' mm</td></tr>' +
    '</tbody></table>';
}


function _tablaDimBarrasPDF() {
  var d = window._panelBusbarData;
  if (!d) return '';
  var itms = window._itmList || [];
  var html = '<table class="cj-tabla"><tbody>' +
    '<tr><td colspan="2" class="cj-titulo">DIMENSIONAMIENTO DE BARRAS</td></tr>' +
    '<tr><td>Barra principal</td><td>20 × 3 mm</td></tr>';
  var sets = buildCmSets(itms, !!d.invertirNConectores);
  var porTipo = { riel: [], cm_fijo: [], cm_reg: [] };
  itms.forEach(function(it) {
    var t = it.tipo;
    if (t === 'reserva') {
      var idx = parseInt(it.conIndex);
      t = sets.cmRegConSet[idx] ? 'cm_reg' : (sets.cmConSet[idx] ? 'cm_fijo' : 'riel');
    }
    if (porTipo[t] && it.rotulo) porTipo[t].push(it.rotulo);
  });
  var defs = [
    { k: 'riel', lbl: 'Derivación Riel', dim: '10 × 2 mm' },
    { k: 'cm_fijo', lbl: 'Derivación CM Fijo', dim: '15 × 3 mm' },
    { k: 'cm_reg', lbl: 'Derivación CM Reg', dim: '20 × 3 mm' }
  ];
  defs.forEach(function(df) {
    if (!porTipo[df.k].length) return;
    html += '<tr><td>' + df.lbl + '<div class="cj-sub">' +
      _escPdf(_rangosRotulos(porTipo[df.k])) + '</div></td><td>' + df.dim + '</td></tr>';
  });

  if (_hayBarraN(d)) html += '<tr><td>Barra N</td><td>20 × 3 mm</td></tr>';
  if (_hayBarraPE(d)) html += '<tr><td>Barra PE</td><td>20 × 3 mm</td></tr>';
  if (_hayBarraPEA(d)) html += '<tr><td>Barra PE Aislada</td><td>20 × 3 mm</td></tr>';
  return html + '</tbody></table>';
}


function _tablaColorPlatinaPDF() {
  var d = window._panelBusbarData;
  if (!d) return '';
  var act = { R: false, S: false, T: false };
  if (d.fases === '3F' || d.fases === '3F+N') { act.R = act.S = act.T = true; }
  else if (d.fases === '2F' && d.subfases) {
    d.subfases.split(' - ').forEach(function(f) { if (act[f] !== undefined) act[f] = true; });
  } else if (d.fases === '1F+N' && d.subfases) {
    var f1 = d.subfases.replace('-N', '').trim();
    if (act[f1] !== undefined) act[f1] = true;
  }
  var html = '<table class="cj-tabla"><tbody>' +
    '<tr><td colspan="2" class="cj-titulo">COLOR DE PLATINA</td></tr>';
  if (act.R) html += '<tr><td>R</td><td>ROJO</td></tr>';
  if (act.S) html += '<tr><td>S</td><td>NEGRO</td></tr>';
  if (act.T) html += '<tr><td>T</td><td>AZUL</td></tr>';
  var tieneN = d.fases === '3F+N' || d.fases === '1F+N';
  if (tieneN) html += '<tr><td>N</td><td>BLANCO</td></tr>';
  if (_tierraConPE(d)) html += '<tr><td>PE (Tierra)</td><td>VERDE</td></tr>';
  if (_tierraConAislada(d)) html += '<tr><td>PE Aislada</td><td>VERDE</td></tr>';
  return html + '</tbody></table>';
}

function _tablaDatosGeneralesPDF() {
  var m = window._pdfMeta || {};
  return '<table class="cj-tabla"><tbody>' +
    '<tr><td colspan="2" class="cj-titulo">DATOS GENERALES</td></tr>' +
    '<tr><td>CLIENTE</td><td>' + _escPdf(m.cliente) + '</td></tr>' +
    '<tr><td>PROYECTO</td><td>' + _escPdf(m.proyecto) + '</td></tr>' +
    '<tr><td>N° COTIZACIÓN</td><td>' + _escPdf(m.cotizacion) + '</td></tr>' +
    '<tr><td>N° ORDEN</td><td>' + _escPdf(m.orden) + '</td></tr>' +
    '<tr><td>N° PLANO</td><td>' + _escPdf(m.plano) + '</td></tr>' +
    '<tr><td>HOJA</td><td>' + _escPdf(m.hoja || '1 / 1') + '</td></tr>' +
    '</tbody></table>';
}

function _tablaFirmasPDF() {
  var m = window._pdfMeta || {};
  function fila(rol, nom, fec) {
    return '<tr><td>' + rol + '</td><td>' + _escPdf(nom) + '</td><td class="cj-firma"></td><td>' + _escPdf(fec) + '</td></tr>';
  }
  return '<table class="cj-tabla"><tbody>' +
    '<tr><td colspan="4" class="cj-titulo">PROCEDIMIENTO DE APROBACIÓN</td></tr>' +
    '<tr class="cj-head"><td></td><td>NOMBRE</td><td>FIRMA</td><td>FECHA</td></tr>' +
    fila('DIS.', m.disNombre, m.disFecha) +
    fila('REV.', m.revNombre, m.revFecha) +
    fila('APR.', m.aprNombre, m.aprFecha) +
    '</tbody></table>';
}


















function _planoHtml(opts) {
  opts = opts || {};
  var soloTipo = opts.solo || (opts.soloSenal ? 'senal' : '');
  var solo = !!soloTipo;
  if (!window._gabineteData) return null;
  var MM = 96 / 25.4;                                    
  var vistaOrig = window._vistaActual || 'frontal';
  var defs = [
    { v: 'frontal',        l1: 'VISTA FRONTAL', l2: '(SIN PUERTA / SIN MANDIL)' },
    { v: 'frontal_mandil', l1: 'VISTA FRONTAL', l2: '(SIN PUERTA / CON MANDIL)' },
    { v: 'frontal_puerta', l1: 'VISTA FRONTAL', l2: '(CON PUERTA)' },
    { v: 'lateral',        l1: 'VISTA LATERAL', l2: '' }
  ];




  var _sinCotasG = document.body.classList.contains('sin-cotas-gabinete');
  if (!solo && _sinCotasG) document.body.classList.remove('sin-cotas-gabinete');
  var caps;
  try {
    caps = solo ? [] : defs.map(function(dv) {
      var c = _capturarVista(dv.v);
      c.l1 = dv.l1; c.l2 = dv.l2;
      return c;
    });
  } finally {
    if (_sinCotasG) document.body.classList.add('sin-cotas-gabinete');


    if (!solo) aplicarVista(vistaOrig);
  }






  var CAJ_BAND = 18, CAJ_TARGET_CELL = 113;
  var CAJ_W = 420 * MM - 2 * 20 - 2 * 4;
  var CAJ_H = 297 * MM - 2 * 20 - 2 * 4;
  var CAJ_GRID_W = CAJ_W - 2 * CAJ_BAND, CAJ_GRID_H = CAJ_H - 2 * CAJ_BAND;
  var CAJ_COLS = Math.max(1, Math.round(CAJ_GRID_W / CAJ_TARGET_CELL));
  var CAJ_ROWS = Math.max(1, Math.round(CAJ_GRID_H / CAJ_TARGET_CELL));



  var CAJ_TB = 64;
  var CAJ_ROWS_H = CAJ_H - CAJ_BAND - CAJ_TB;
  var CAJ_CELL_W = CAJ_GRID_W / CAJ_COLS, CAJ_CELL_H = CAJ_ROWS_H / CAJ_ROWS;
  var svg = '<svg class="pw-grid" viewBox="0 0 ' + CAJ_W + ' ' + CAJ_H +
            '" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">';
  var i, x, y, t;
  for (i = 1; i < CAJ_COLS; i++) {
    x = CAJ_BAND + i * CAJ_CELL_W;
    svg += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + CAJ_BAND + '" stroke="#000" stroke-width="1"/>';
  }
  for (i = 1; i < CAJ_ROWS; i++) {
    y = CAJ_BAND + i * CAJ_CELL_H;
    svg += '<line x1="0" y1="' + y + '" x2="' + CAJ_BAND + '" y2="' + y + '" stroke="#000" stroke-width="1"/>';
  }
  var TXT = '" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="12" font-weight="600" fill="#000">';
  for (i = 0; i < CAJ_COLS; i++) {
    t = String.fromCharCode(65 + i); x = CAJ_BAND + (i + 0.5) * CAJ_CELL_W;
    svg += '<text x="' + x + '" y="' + (CAJ_BAND / 2) + TXT + t + '</text>';
  }
  for (i = 0; i < CAJ_ROWS; i++) {
    t = String(i + 1); y = CAJ_BAND + (i + 0.5) * CAJ_CELL_H;
    svg += '<text x="' + (CAJ_BAND / 2) + '" y="' + y + TXT + t + '</text>';
  }
  svg += '</svg>';





  var maxH = 1, totalW = 0, maxOffY = 0;
  caps.forEach(function(c) {
    if (c.h > maxH) maxH = c.h;
    totalW += c.w;
    if (c.offY > maxOffY) maxOffY = c.offY;
  });
  caps.forEach(function(c) { c.offY = maxOffY; c.h = maxH; });

  var IW = CAJ_W - CAJ_BAND - 1.5, IH = CAJ_H - CAJ_BAND - 1.5;
  var IHV = IH - CAJ_TB;
  var GAP = 8 * MM, LABEL_H = 12 * MM, PAD = 8 * MM;
  var innerW = IW - 2 * PAD, innerH = IHV - 2 * PAD - LABEL_H;
  var scale = caps.length ? Math.min(innerH / maxH,
                       (innerW - GAP * (caps.length - 1)) / totalW) : 1;




  var arrowCss = (3.5 * MM) / scale;
  var fontCss = (3.8 * MM) / scale;
  var colsHtml = '';
  caps.forEach(function(c) {
    c.el.style.transformOrigin = 'top left';
    c.el.style.transform = 'scale(' + scale + ') translate(' + c.offX + 'px,' + c.offY + 'px)';
    c.el.style.left = '0';
    c.el.style.top = '0';
    c.el.style.setProperty('--cota-arrow', arrowCss + 'px');
    c.el.style.setProperty('--cota-font', fontCss + 'px');
    var dentro = c.el.outerHTML;
    colsHtml += '<div class="pv-col">' +
      '<div class="pv-l1">' + c.l1 + '</div>' +
      '<div class="pv-l2">' + (c.l2 || '&nbsp;') + '</div>' +
      '<div class="pv-frame" style="width:' + (c.w * scale) + 'px;height:' + (c.h * scale) + 'px">' +
      dentro + '</div></div>';
  });







  var fitHtml = '<svg class="pw-fit" viewBox="0 0 ' + IW + ' ' + IHV + '" ' +
    'preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
    '<foreignObject x="0" y="0" width="' + IW + '" height="' + IHV + '">' +
    '<div xmlns="http://www.w3.org/1999/xhtml" class="pw-cols" style="width:' + IW + 'px;height:' + IHV + 'px">' +
    colsHtml + '</div></foreignObject></svg>';








  var m = window._pdfMeta || {};
  var _kA4 = 297 / 420;
  var _mmPapelPorReal = scale * (25.4 / 96) * _kA4 / PX_TO_MM;
  var escalaTxt = solo ? '—' : ('1 : ' + Math.round(1 / _mmPapelPorReal));
  function _cel(lbl, val, extra) {
    return '<div class="tb-cel' + (extra ? ' ' + extra : '') + '">' +
      '<div class="tb-lbl">' + lbl + '</div><div class="tb-val">' + _escPdf(val) + '</div></div>';
  }
  var TBW = CAJ_W;




  var fichaPags = [];
  try {
    var _fm = (typeof _fichaDatos === 'function') ? _fichaDatos() : { enPdf: false, metradoEnPdf: false };
    var _area = (typeof _fichaAreaA4 === 'function') ? _fichaAreaA4() : null;

    if (solo) _fm = { enPdf: soloTipo === 'ficha', metradoEnPdf: soloTipo === 'metrado',
                      senalEnPdf: soloTipo === 'senal' };

    if (opts.preview) _fm = { enPdf: false, metradoEnPdf: false, senalEnPdf: false };



    if (_area && _fm.enPdf !== false && typeof _fichaPaginas === 'function') {
      var _fp = _fichaPaginas(_area.w, _area.h);
      _fp.forEach(function(pg, i) {
        fichaPags.push({ html: pg.html, zoom: pg.zoom,
                         desc: 'Ficha técnica' + (_fp.length > 1 ? ' (' + (i + 1) + '/' + _fp.length + ')' : '') });
      });
    }
    if (_area && _fm.metradoEnPdf !== false && typeof _metradoPaginas === 'function') {
      _metradoPaginas(_area.w, _area.h).forEach(function(pg) {
        fichaPags.push({ html: pg.html, zoom: pg.zoom, desc: pg.desc || 'Lista de materiales' });
      });
    }


    if (_area && _fm.senalEnPdf === true && typeof _senalPaginas === 'function') {
      var _sp = _senalPaginas(_area.w, _area.h);
      _sp.forEach(function(pg, i) {
        fichaPags.push({ html: pg.html, zoom: pg.zoom,
                         desc: 'Lista de rótulos' + (_sp.length > 1 ? ' (' + (i + 1) + '/' + _sp.length + ')' : '') });
      });
    }
  } catch (e) { console.warn('[exportarPDF] hojas extra:', e); fichaPags = []; }
  var fichaHtml = fichaPags.length ? 'si' : '';
  var _sinCajFicha = soloTipo === 'ficha' && typeof _fichaDatos === 'function' &&
                     _fichaDatos().sinCajetin === true;
  var cajetinHtml = '<svg class="pw-tb" viewBox="0 0 ' + TBW + ' ' + CAJ_TB + '" ' +
    'preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
    '<foreignObject x="0" y="0" width="' + TBW + '" height="' + CAJ_TB + '">' +
    '<div xmlns="http://www.w3.org/1999/xhtml" class="tb" style="width:' + TBW + 'px;height:' + CAJ_TB + 'px">' +
      "<div class=\"tb-col tb-logo\"><img src=\"./ProTAB_files/table-xd-report.svg\" alt=\"Table_XD\"/></div>" +
      '<div class="tb-col tb-c2">' +
        _cel('Descripción del proyecto:', m.proyecto) +
        _cel('Cliente:', m.cliente) + '</div>' +
      '<div class="tb-col tb-c3">' + _cel('Descripción de la página:', m.titulo || 'Plano mecánico', 'tb-alta') + '</div>' +
      '<div class="tb-col tb-c4">' + _cel('Proyectista:', m.disNombre) + _cel('Fecha:', m.disFecha) + '</div>' +
      '<div class="tb-col tb-c5">' +
        _cel('N° de plano:', m.plano) +
        '<div class="tb-fila">' + _cel('N° cotización:', m.cotizacion) + _cel('N° orden:', m.orden) + '</div></div>' +
      '<div class="tb-col tb-c6">' + _cel('Rev.:', m.rev || '1') + _cel('Escala:', escalaTxt) + '</div>' +
      '<div class="tb-col tb-c7">' + _cel('Hoja:', m.hoja || '1') + _cel('Total de hojas:', m.hojasTotal || '1') + '</div>' +
    '</div></foreignObject></svg>';




  var _totalHojas = (solo ? 0 : 1) + fichaPags.length;
  function _cajHoja(caj, n, total) {
    return caj
      .replace(/(<div class="tb-lbl">Hoja:<\/div><div class="tb-val">)[^<]*/,
        function(m, ini) { return ini + n; })
      .replace(/(<div class="tb-lbl">Total de hojas:<\/div><div class="tb-val">)[^<]*/,
        function(m, ini) { return ini + total; });
  }

  var html =
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<link rel="stylesheet" href="css/app.css">' +
    '<style>' +




    '@page { size: A4 landscape; margin: 0; }' +
    'html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; ' +
    '  -webkit-print-color-adjust: exact; print-color-adjust: exact; ' +
    '  font-family: "Segoe UI", system-ui, Arial, sans-serif; overflow: hidden !important; }' +


    'html, body { width: 100%; height: 100%; }' +



    '.pw-page { position: absolute; left: 10mm; top: 10mm; right: 10mm; bottom: 10mm; }' +
    '.pw-rect { border: 1.5px solid #000; padding: 0; position: relative; ' +                                               
    '  box-sizing: border-box; width: 100%; height: 100%; }' +
    '.pw-grid { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }' +







    '.pw-inner { position: absolute; ' +
    '  left: ' + (CAJ_BAND / CAJ_W * 100) + '%; right: 0; ' +
    '  top: ' + (CAJ_BAND / CAJ_H * 100) + '%; bottom: ' + (CAJ_TB / CAJ_H * 100) + '%; ' +
    '  border: 0; border-top: 1.5px solid #000; border-left: 1.5px solid #000; ' +
    '  box-sizing: border-box; overflow: hidden; }' +
    '.pw-fit { display: block; width: 100%; height: 100%; }' +



    '.pw-tb { position: absolute; left: 0; bottom: 0; width: 100%; height: ' + (CAJ_TB / CAJ_H * 100) + '%; ' +
    '  display: block; border-top: 1.5px solid #000; box-sizing: border-box; }' +
    '.tb { display: flex; flex-direction: row; box-sizing: border-box; ' +
    '  font-family: "Segoe UI", Arial, sans-serif; color: #000; }' +
    '.tb-col { display: flex; flex-direction: column; border-right: 1.5px solid #000; ' +
    '  box-sizing: border-box; min-width: 0; }' +
    '.tb-col:last-child { border-right: 0; }' +
    '.tb-logo { flex: 0 0 9%; align-items: center; justify-content: center; padding: 6px; }' +
    '.tb-logo img { width: 100%; height: auto; max-height: 40px; object-fit: contain; }' +
    '.tb-c2 { flex: 0 0 27%; } .tb-c3 { flex: 0 0 17%; } .tb-c4 { flex: 0 0 9%; }' +
    '.tb-c5 { flex: 0 0 24%; } .tb-c6 { flex: 0 0 7%; } .tb-c7 { flex: 1 1 0; }' +



    '.tb-cel { flex: 0 0 50%; padding: 2px 5px; border-bottom: 1.5px solid #000; box-sizing: border-box; ' +
    '  overflow: hidden; min-width: 0; min-height: 0; }' +
    '.tb-col > .tb-cel:last-child, .tb-fila { border-bottom: 0; }' +
    '.tb-fila { display: flex; flex: 0 0 50%; min-width: 0; min-height: 0; }' +
    '.tb-fila .tb-cel { flex: 1 1 0; border-bottom: 0; border-right: 1.5px solid #000; }' +
    '.tb-fila .tb-cel:last-child { border-right: 0; }' +
    '.tb-alta { flex: 0 0 100%; }' +
    '.tb-lbl { font-size: 9px; line-height: 11px; color: #000; white-space: nowrap; }' +
    '.tb-val { font-size: 11px; line-height: 13px; min-height: 13px; font-weight: 600; white-space: nowrap; ' +
    '  overflow: hidden; text-overflow: ellipsis; }' +
    '.pw-cols { display: flex; flex-direction: row; justify-content: center; ' +
    '  align-items: flex-start; gap: ' + GAP + 'px; padding: ' + PAD + 'px; ' +
    '  box-sizing: border-box; overflow: hidden; }' +
    '.pv-col { display: flex; flex-direction: column; align-items: center; flex: 0 0 auto; }' +
    '.pv-l1 { font: 700 12px "Segoe UI", Arial, sans-serif; color: #000; white-space: nowrap; }' +
    '.pv-l2 { font: 500 10px "Segoe UI", Arial, sans-serif; color: #444; margin-bottom: 4mm; white-space: nowrap; }' +
    '.pv-frame { position: relative; overflow: visible; }' +




    '.pw-page-2 { position: absolute; left: 10mm; right: 10mm; ' +
    '  height: calc(100vh - 20mm); page-break-before: always; }' +
    '.pw-ficha { position: absolute; left: ' + (CAJ_BAND / CAJ_W * 100) + '%; right: 0; ' +
    '  top: ' + (CAJ_BAND / CAJ_H * 100) + '%; bottom: ' + (CAJ_TB / CAJ_H * 100) + '%; ' +
    '  border-top: 1.5px solid #000; border-left: 1.5px solid #000; box-sizing: border-box; ' +
    '  overflow: hidden; padding: 3mm; }' +
    '.pw-ficha .ficha-card { border-width: 2px; }' +
    (fichaHtml ? 'html, body { height: auto !important; min-height: 100%; overflow: visible !important; } ' +
                 'body { height: ' + (((solo ? 0 : 1) + fichaPags.length) * 100) + 'vh !important; }' : '') +
    '</style></head><body>' +
    (solo ? '' : ('<div class="pw-page"><div class="pw-rect">' + svg +
    '<div class="pw-inner">' + fitHtml + '</div>' + _cajHoja(cajetinHtml, 1, _totalHojas) +
    '</div></div>')) +
    fichaPags.map(function(pg, i) {
      var caj = _cajHoja(cajetinHtml, i + (solo ? 1 : 2), _totalHojas)
        .replace(/(<div class="tb-lbl">Descripci.n de la p.gina:<\/div><div class="tb-val">)[^<]*/,
          function(m, ini) { return ini + _escPdf(pg.desc); });


      var _n = i + (solo ? 0 : 1);



      if (_sinCajFicha) {
        return '<div class="pw-page pw-page-2" style="top:calc(' + (_n * 100) + 'vh + 10mm)' +
          (_n === 0 ? ';page-break-before:auto' : '') + '">' +
          '<div class="pw-rect" style="border:0">' +
          '<div class="pw-ficha" style="border:0"><div style="zoom:' + pg.zoom + '">' + pg.html + '</div></div>' +
          '</div></div>';
      }
      return '<div class="pw-page pw-page-2" style="top:calc(' + (_n * 100) + 'vh + 10mm)' +
        (_n === 0 ? ';page-break-before:auto' : '') + '">' +
        '<div class="pw-rect">' + svg +
        '<div class="pw-ficha"><div style="zoom:' + pg.zoom + '">' + pg.html + '</div></div>' + caj +
        '</div></div>';
    }).join('') +
    '</body></html>';
  return html;
}

function exportarPDF(opts) {
  var html = _planoHtml(opts);
  if (!html) {
    if (typeof _avisoFlotante === 'function') _avisoFlotante('Sin gabinete — armá el tablero primero.');
    return;
  }
  window._pdfUltimoHtml = html;                                        
  if (window._pdfExportando) return;                                    
  window._pdfExportando = true;
  var _suf = (opts && opts.solo && typeof _HOJA_ARCHIVO !== 'undefined' && _HOJA_ARCHIVO[opts.solo]) || 'plano';
  guardarPdfHtml(nombreArchivoDoc(_suf), html, function() { window._pdfExportando = false; });
}
