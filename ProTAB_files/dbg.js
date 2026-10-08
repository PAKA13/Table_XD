


(function() {
  if (location.search.indexOf('dbg') === -1) return;
  var box = document.createElement('pre');
  box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;background:#111;color:#0f0;' +
    'font:12px/1.4 monospace;padding:8px 10px;border-radius:8px;max-width:90vw;white-space:pre-wrap;' +
    'pointer-events:none;opacity:.92';
  document.body.appendChild(box);
  function med() {
    var marco = document.getElementById('marco_gabinete');
    function visible(sel) {
      var els = document.querySelectorAll(sel);
      for (var i = 0; i < els.length; i++) {
        var rr = els[i].getBoundingClientRect();
        if (rr.width > 0 && rr.height > 0) return els[i];
      }
      return null;
    }
    var lbl = visible('.cota-mi-val');
    var badge = visible('.itm-rotulo-badge');
    var meta = document.querySelector('meta[name=viewport]');
    var out = ['UA: ' + navigator.userAgent.slice(0, 70),
               'viewport: ' + innerWidth + 'x' + innerHeight + ' dpr ' + devicePixelRatio +
               ' | pantalla: ' + screen.width + 'x' + screen.height +
               ' | zoom pagina ~' + Math.round(screen.width / innerWidth * 100) + '%' +
               (window.visualViewport ? ' | vv.scale ' + window.visualViewport.scale.toFixed(2) : '')];
    out.push('meta viewport: ' + (meta ? meta.getAttribute('content') : '-') +
             ' | docW ' + document.documentElement.clientWidth +
             (window.visualViewport ? ' | vv ' + Math.round(window.visualViewport.width) + 'x' + Math.round(window.visualViewport.height) : ''));
    if (marco) {
      var rm = marco.getBoundingClientRect();
      out.push('marco style.zoom=' + marco.style.zoom + ' computed zoom=' + getComputedStyle(marco).zoom +
               ' | style.width=' + marco.style.width + ' rect.width=' + Math.round(rm.width));
      out.push('--cota-font=' + getComputedStyle(marco).getPropertyValue('--cota-font'));
      out.push('tsa html=' + getComputedStyle(document.documentElement).webkitTextSizeAdjust +
               ' marco=' + getComputedStyle(marco).webkitTextSizeAdjust);
    }
    if (lbl) {
      var r = lbl.getBoundingClientRect();
      var z = parseFloat(marco && marco.style.zoom) || 1;
      var esperado = 12 / z;
      var real = parseFloat(getComputedStyle(lbl).fontSize);
      out.push('cota "' + lbl.textContent + '": font pedido=' + esperado.toFixed(1) + 'px computed=' + real.toFixed(1) +
               'px => INFLACION x' + (real / esperado).toFixed(2) +
               ' | rect=' + Math.round(r.width) + 'x' + Math.round(r.height) + ' (en pantalla)');
    }
    if (badge) {
      var rb = badge.getBoundingClientRect();
      var realB = parseFloat(getComputedStyle(badge).fontSize);
      out.push('badge "' + badge.textContent + '": font pedido=54px computed=' + realB.toFixed(1) +
               'px => INFLACION x' + (realB / 54).toFixed(2) +
               ' | rect=' + Math.round(rb.width) + 'x' + Math.round(rb.height));
    }
    box.textContent = out.join('\n');
  }
  setInterval(med, 1000);
})();
