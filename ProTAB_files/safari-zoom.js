


























(function () {
  if (window.__TAURI_INTERNALS__ || window.__TAURI__) return;

  function tieneDefecto() {
    var p = document.createElement('div');
    p.style.cssText = 'position:absolute;left:-9999px;top:0;zoom:0.5;visibility:hidden';
    var t = document.createElement('span');
    t.style.cssText = 'font-size:40px;line-height:1;display:inline-block';
    t.textContent = 'A';
    p.appendChild(t);
    document.body.appendChild(p);
    var h = t.getBoundingClientRect().height;
    p.remove();
    return h > 30;                                      
  }


  var SIN_TEXTO = { path: 1, line: 1, rect: 1, circle: 1, ellipse: 1, polyline: 1,
                    polygon: 1, use: 1, image: 1, defs: 1, clippath: 1, mask: 1,
                    lineargradient: 1, radialgradient: 1, stop: 1, pattern: 1, marker: 1,
                    script: 1, style: 1, br: 1, img: 1 };

  function zoomPropio(cs) {
    var z = parseFloat(cs.zoom);
    return (z > 0) ? z : 1;
  }




  function pasada(doc) {
    var gcs = function (el) { return doc.defaultView.getComputedStyle(el); };


    var hechos = doc.querySelectorAll('[data-szfs]');
    for (var i = 0; i < hechos.length; i++) {
      var e = hechos[i];
      if (e.style.fontSize === e.getAttribute('data-szfs')) {
        e.style.fontSize = e.getAttribute('data-szfs-o') || '';
      }
      e.removeAttribute('data-szfs');
      e.removeAttribute('data-szfs-o');
    }

    var cand = doc.querySelectorAll('[style*="zoom"]'), raices = [];
    for (var j = 0; j < cand.length; j++) {
      var c = cand[j];
      if (zoomPropio(gcs(c)) === 1) continue;
      var dentro = false;
      for (var a = c.parentElement; a; a = a.parentElement) {
        if (a.getAttribute && /zoom/.test(a.getAttribute('style') || '') &&
            zoomPropio(gcs(a)) !== 1) { dentro = true; break; }
      }
      if (!dentro) raices.push(c);
    }

    var cambios = [];






    function recorrer(el, zA, fsPadre, padreCorregido) {
      var cs = gcs(el);
      if (cs.display === 'none') return;
      var fs = parseFloat(cs.fontSize);
      var corregido = false;
      if (zA !== 1 && fsPadre !== null &&
          (Math.abs(fs - fsPadre) > 0.01 || padreCorregido)) {
        cambios.push([el, (fs * zA * zA) + 'px']);
        corregido = true;
      }
      var zPropio = zoomPropio(cs);
      var zHijos = zA * zPropio;
      for (var k = el.firstElementChild; k; k = k.nextElementSibling) {
        if (SIN_TEXTO[k.tagName.toLowerCase()]) continue;
        recorrer(k, zHijos, fs, corregido && zPropio === 1);
      }
    }
    for (var r = 0; r < raices.length; r++) {
      var raiz = raices[r];
      var csR = gcs(raiz);
      var fsR = parseFloat(csR.fontSize), zR = zoomPropio(csR);
      for (var h = raiz.firstElementChild; h; h = h.nextElementSibling) {
        if (SIN_TEXTO[h.tagName.toLowerCase()]) continue;
        recorrer(h, zR, fsR, false);
      }
    }
    for (var w = 0; w < cambios.length; w++) {
      var el = cambios[w][0];
      el.setAttribute('data-szfs-o', el.style.fontSize || '');
      el.style.fontSize = cambios[w][1];
      el.setAttribute('data-szfs', el.style.fontSize);
    }

    if (doc.__szObs) doc.__szObs.takeRecords();
  }












  function arreglarLaminas(doc) {
    var svgs = doc.querySelectorAll('svg.pw-fit');
    for (var i = 0; i < svgs.length; i++) {
      var svg = svgs[i];
      var fo = svg.querySelector('foreignObject');
      var d = fo && fo.firstElementChild;
      var vb = svg.viewBox && svg.viewBox.baseVal;
      if (!d || !vb || !vb.width || !vb.height) continue;
      var VW = vb.width, VH = vb.height;
      var w = doc.createElement('div');
      w.className = svg.getAttribute('class');
      w.style.position = 'relative';
      w.style.overflow = 'visible';
      svg.parentNode.replaceChild(w, svg);
      w.appendChild(d);
      d.style.position = 'absolute';
      d.style.left = '0';
      d.style.top = '0';
      d.style.transformOrigin = '0 0';
      (function (w, d, VW, VH) {
        var ajustar = function () {
          var W = w.clientWidth, H = w.clientHeight;
          if (!W || !H) return;
          var k = Math.min(W / VW, H / VH);
          d.style.transform = 'translate(' + ((W - VW * k) / 2) + 'px,' + ((H - VH * k) / 2) + 'px) scale(' + k + ')';
        };
        ajustar();
        var win = doc.defaultView;
        if (win.ResizeObserver) new win.ResizeObserver(ajustar).observe(w);
        win.addEventListener('beforeprint', ajustar);
        win.addEventListener('afterprint', ajustar);
        if (win.matchMedia) {
          var mq = win.matchMedia('print');
          if (mq.addEventListener) mq.addEventListener('change', ajustar);
          else if (mq.addListener) mq.addListener(ajustar);
        }
      })(w, d, VW, VH);
    }
  }

  function pedirPasada(doc) {
    if (doc.__szEnPasada) return;
    doc.__szEnPasada = true;
    try { arreglarLaminas(doc); pasada(doc); } finally { doc.__szEnPasada = false; }

    var ifrs = doc.querySelectorAll('iframe');
    for (var i = 0; i < ifrs.length; i++) vigilarIframe(ifrs[i]);
  }

  function instalar(doc) {
    if (!doc || !doc.body || doc.__szObs) return;
    var o = new MutationObserver(function () { pedirPasada(doc); });
    doc.__szObs = o;
    o.observe(doc.body, { subtree: true, childList: true, characterData: false,
                          attributes: true, attributeFilter: ['style', 'class', 'font-size'] });
    pedirPasada(doc);
  }



  function vigilarIframe(ifr) {
    var d = null;
    try { d = ifr.contentDocument; } catch (e) { return; }
    if (d && d.body && d.body.firstChild) instalar(d);
    if (!ifr.__szLoad) {
      ifr.__szLoad = true;
      ifr.addEventListener('load', function () {
        var d2 = null;
        try { d2 = ifr.contentDocument; } catch (e) { return; }
        instalar(d2);
      });
    }
  }








  var viejo = null, cambioId = 0;
  function terminarCambio(c) {
    if (viejo) { viejo.remove(); viejo = null; }
    if (c) c.style.visibility = '';
    window._redibujoSafariEnCurso = false;
  }
  function envolverRedibujo(nombre) {
    var f = window[nombre];
    if (typeof f !== 'function' || f.__sinParpadeo) return;
    var dentro = false;
    var w = function () {
      if (dentro) return f.apply(this, arguments);
      var c = document.getElementById('panel_busbar_container');
      if (!c || !c.parentNode || !c.firstChild) return f.apply(this, arguments);
      if (!viejo) {
        viejo = c.cloneNode(false);
        viejo.removeAttribute('id');
        viejo.style.pointerEvents = 'none';
        while (c.firstChild) viejo.appendChild(c.firstChild);


        var conId = viejo.querySelectorAll('[id]');
        for (var i = 0; i < conId.length; i++) conId[i].removeAttribute('id');
        c.parentNode.insertBefore(viejo, c.nextSibling);
      }
      c.style.visibility = 'hidden';



      window._redibujoSafariEnCurso = true;
      var r;
      dentro = true;
      try { r = f.apply(this, arguments); }
      catch (e) { dentro = false; terminarCambio(c); throw e; }
      dentro = false;
      var id = ++cambioId, t0 = performance.now();
      var imgs = Array.prototype.slice.call(c.querySelectorAll('img'));
      var hecho = false;
      var listo = function (motivo) {
        if (id !== cambioId || hecho) return;                                        
        hecho = true;


        requestAnimationFrame(function () { requestAnimationFrame(function () {
          if (id !== cambioId) return;
          terminarCambio(c);
          if (window._spLog) window._spLog(motivo + ' ' + Math.round(performance.now() - t0) + ' ms, ' + imgs.length + ' img');
        }); });
      };
      Promise.all(imgs.map(function (im) {
        return (im.decode ? im.decode() : Promise.resolve()).catch(function () {});
      })).then(function () { listo('listas'); });
      setTimeout(function () { listo('TIEMPO'); }, 1000);
      return r;
    };
    w.__sinParpadeo = true;
    window[nombre] = w;
  }

  function arrancar() {
    if (!tieneDefecto()) return;
    window._safariZoomTexto = true;



    window._safariZoomAhora = function () { pedirPasada(document); };
    envolverRedibujo('dibujarPanelBusbar');
    instalar(document);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
