















'use strict';

(function() {




  var pedido = false;
  try {
    pedido = window.location.search.indexOf('diag=1') !== -1;
    if (pedido) sessionStorage.setItem('protab_diag', '1');
    else pedido = sessionStorage.getItem('protab_diag') === '1';
  } catch (e) { }
  if (!pedido) return;


  var errores = [];
  window.addEventListener('error', function(ev) {
    var d = ev && ev.error;
    errores.push((d && d.message) || ev.message || 'error sin mensaje');
    if (ev.filename) errores.push('   en ' + String(ev.filename).split('/').pop() + ':' + ev.lineno);
  });
  window.addEventListener('unhandledrejection', function(ev) {
    var r = ev && ev.reason;
    errores.push('promesa: ' + ((r && r.message) || String(r)));
  });

  function num(sel) {
    try { return document.querySelectorAll(sel).length; } catch (e) { return -1; }
  }

  function medida(prop) {
    try {
      var m = document.getElementById('marco_gabinete');
      var v = m ? Math.round(parseFloat(m.style[prop]) * 0.2) : NaN;
      return isFinite(v) ? v : '—';
    } catch (e) { return '—'; }
  }

  function pintar(caja, reglas) {
    var itms = 0, pb = 'no', gab = 'no';
    try { itms = (window._itmList || []).length; } catch (e) { }
    try { pb = window._panelBusbarData ? 'si' : 'no'; } catch (e) { }
    try { gab = window._gabineteData ? 'si' : 'no'; } catch (e) { }

    var lineas = [
      "DIAGNOSTICO Table_XD",
      '',
      'direccion   ' + window.location.pathname,
      'API         ' + (window.API_BASE === '' ? '(raiz)' : window.API_BASE),
      'reglas      ' + reglas,
      '',
      'gabinete    ' + gab + '   panel ' + pb + '   equipos ' + itms,
      'tamano      ' + medida('width') + ' x ' + medida('height') + ' mm',
      '',
      'DIBUJADO EN PANTALLA',
      'barras      ' + num('[data-busbar-fase]'),
      'imagenes    ' + num('#panel_busbar_container img'),
      'conectores  ' + num('.con-svg'),
      'triangulos  ' + num('.tri-clickeable'),
      'equipos     ' + num('.itm-img, .itm-reserva'),
      'cotas       ' + num('.cota-mi-val, .cota-mi-val-v'),
      '',
      'ERRORES     ' + (errores.length ? '' : 'ninguno')
    ].concat(errores.slice(0, 8));

    lineas.push('');
    lineas.push('navegador   ' + navigator.userAgent.slice(0, 90));

    caja.textContent = lineas.join('\n');
  }

  function crearCaja() {
    var caja = document.createElement('pre');
    caja.id = 'protab_diag';
    caja.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:99999;' +
      'max-width:92vw;max-height:70vh;overflow:auto;margin:0;padding:10px 12px;' +
      'background:#0b1020;color:#cfe3ff;border:1px solid #3b5bdb;border-radius:8px;' +
      'font:11px/1.45 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap';
    document.body.appendChild(caja);

    var btn = document.createElement('button');
    btn.textContent = 'Actualizar';
    btn.style.cssText = 'position:fixed;right:8px;bottom:calc(70vh + 14px);z-index:99999;' +
      'padding:6px 10px;border-radius:6px;border:1px solid #3b5bdb;background:#1c2b5a;' +
      'color:#cfe3ff;font:12px system-ui;cursor:pointer';
    btn.onclick = function() { medir(caja); };
    document.body.appendChild(btn);
    return caja;
  }



  function medir(caja) {
    caja.textContent = 'midiendo...';
    var base = (typeof window.API_BASE === 'string') ? window.API_BASE : '';
    fetch(base + '/api/health')
      .then(function(r) { return r.ok ? r.json() : { status: 'HTTP ' + r.status }; })
      .then(function(j) { pintar(caja, (j && j.status) ? (j.status + ' · ' + (j.reglas || '?') + ' reglas') : 'respuesta rara'); })
      .catch(function(e) { pintar(caja, 'NO CONTESTAN · ' + (e && e.message)); });
  }

  function arrancar() {
    var caja = crearCaja();
    setTimeout(function() { medir(caja); }, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
