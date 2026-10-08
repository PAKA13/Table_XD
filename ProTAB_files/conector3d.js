
























function _con3dSistema() {
  var d = window._panelBusbarData;
  var f = d && d.fases;
  if (f === '3F')   return '3F';
  if (f === '3F+N') return '3F + N';
  return null;
}

function _con3dCotas() {
  var d = window._panelBusbarData || {};
  return {
    alto:   (typeof d.conRielAltoMm   === 'number') ? d.conRielAltoMm   : CON_RIEL_ALTO_MM,
    recto:  (typeof d.conRielAnMm     === 'number') ? d.conRielAnMm     : 23,
    cabeza: (typeof d.conRielCabezaMm === 'number') ? d.conRielCabezaMm : CON_RIEL_CABEZA_MM
  };
}













function _barraPEDibujada() { return _barraSegsDibujada('.bar-pe-seg'); }


function _barraNDibujada() { return _barraSegsDibujada('.bar-n-seg'); }



function _barraSegsDibujada(sel) {
  var c = document.getElementById('panel_busbar_container');
  if (!c) return '';
  var segs = [].slice.call(c.querySelectorAll(sel)).filter(function(e) {
    return e.dataset.nivelPe === '1' || e.dataset.nivelPe === '2';
  });
  segs.sort(function(a, b) { return (parseFloat(a.style.left) || 0) - (parseFloat(b.style.left) || 0); });
  var out = '';
  for (var i = 0; i < segs.length; i++) {
    var d = segs[i].dataset;
    if (d.nivelPe === '2') { out += 'c'; continue; }
    out += (d.lado === 'inf') ? 'i' : 's';
  }
  return out;
}













function _barrasFaseDibujadas() {
  var c = document.getElementById("panel_busbar_container");
  if (!c) return null;
  var svgs = c.querySelectorAll(".busbar-rect");
  if (!svgs.length) return null;

  var lista = [], i;
  for (i = 0; i < svgs.length; i++) {
    lista.push({ el: svgs[i], fase: svgs[i].dataset.fase || "",
                 x: parseFloat(svgs[i].style.left) || 0 });
  }
  lista.sort(function(a, b) { return a.x - b.x; });

  var ref = lista[0].el;
  var largoPx = parseFloat(ref.getAttribute("height"));
  var anchoPx = parseFloat(ref.getAttribute("width"));
  var topPx = parseFloat(ref.style.top) || 0;
  if (!(largoPx > 0)) return null;
  var cx0 = lista[0].x + anchoPx / 2;                                     





  var ags = [], cs = ref.querySelectorAll("mask circle");
  for (i = 0; i < cs.length; i++) {
    var r = parseFloat(cs[i].getAttribute("r"));
    var cy = parseFloat(cs[i].getAttribute("cy"));
    if (!(r > 0) || !isFinite(cy)) continue;
    ags.push({ diam: 2 * r * PX_TO_MM, desdeArriba: cy * PX_TO_MM });
  }
  if (!ags.length) return null;
  ags.sort(function(a, b) { return a.desdeArriba - b.desdeArriba; });
  for (i = 0; i < ags.length; i++) {
    ags[i].rol = (ags.length > 2 && i === 0) ? "c" : "a";
  }

  return {
    fases: lista.map(function(b) { return b.fase; }).join(","),
    largo: (largoPx * PX_TO_MM).toFixed(1),
    sep: ((lista.length > 1 ? lista[1].x - lista[0].x : 0) * PX_TO_MM).toFixed(1),
    agujeros: ags.map(function(a) {
      return a.diam.toFixed(2) + "@" + a.desdeArriba.toFixed(1) + ":" + a.rol;
    }).join(","),
    aislador: _aisladorDibujado(c, cx0, topPx),
    conectores: _conectoresDibujados(c, topPx),
    ig: _igDibujado(c, lista, anchoPx, topPx)
  };
}






















function _igDibujado(c, barras, anchoPx, topBarraPx) {
  var f4 = c.querySelectorAll("[data-ig-f4]");
  if (!f4.length) return null;
  var num = function(el) {
    var t = el.querySelector(".ig-insert-num");
    return t ? parseInt(t.textContent, 10) : NaN;
  };
  var f1 = {}, f2 = {}, divs = c.querySelectorAll("div.ig-insert"), i, j, k;
  for (i = 0; i < divs.length; i++) {
    var nd = num(divs[i]);
    if (nd >= 1 && nd <= 4) f1[nd] = divs[i];
    else if (nd >= 5 && nd <= 8) f2[nd - 4] = divs[i];
  }
  var caja = function(el) {
    return { l: parseFloat(el.style.left) || 0, w: parseFloat(el.style.width) || 0,
             t: parseFloat(el.style.top) || 0, h: parseFloat(el.style.height) || 0 };
  };
  var partes = [], hasta = null, mm = PX_TO_MM;
  for (k = 0; k < f4.length; k++) {
    var hi = num(f4[k]) - 13, e1 = f1[hi + 1], e2 = f2[hi + 1];
    if (!e1 || !e2) continue;
    var cx4 = (parseFloat(f4[k].style.left) || 0) +
              (parseFloat(f4[k].getAttribute("width")) || 0) / 2;
    var mejor = null, dm = Infinity;
    for (j = 0; j < barras.length; j++) {
      var dd = Math.abs(barras[j].x + anchoPx / 2 - cx4);
      if (dd < dm) { dm = dd; mejor = barras[j]; }
    }
    if (!mejor || dm > anchoPx) continue;
    var c1 = caja(e1), c2 = caja(e2);
    var dx1 = (c1.l + c1.w / 2 - cx4) * mm, dx2 = (c2.l + c2.w / 2 - cx4) * mm;
    var y2 = (topBarraPx - (c2.t + c2.h)) * mm;                              




    var y4 = (topBarraPx - (parseFloat(f4[k].style.top) || 0)) * mm;
    partes.push(mejor.fase + "@" + [dx1, c1.w * mm, c1.h * mm, dx2, c2.w * mm,
                                     c2.h * mm, y2, y4].map(function(x) {
      return x.toFixed(1);
    }).join(";"));
    var yB = parseFloat(e1.dataset.borneY);
    if (isFinite(yB)) hasta = ((topBarraPx - yB) * mm).toFixed(1);
  }
  if (!partes.length) return null;
  return { alIG: partes.join(","), hastaIG: hasta };
}














function _conectoresDibujados(c, topBarraPx) {
  var els = c.querySelectorAll('.con-svg');
  var out = [], i;
  for (i = 0; i < els.length; i++) {
    var e = els[i];
    var t = parseFloat(e.style.top), h = parseFloat(e.getAttribute('height'));
    var f = e.dataset.fase || '';
    if (!isFinite(t) || !(h > 0) || !/^[RSTN]$/.test(f)) continue;

    var t3d = e.dataset.tipo3d;
    out.push(f + '@' + (((t + h / 2) - topBarraPx) * PX_TO_MM).toFixed(1) +
             ':' + (t3d === 'riel' ? 'r' : (t3d === 'cm_fijo' ? 'm1' : 'c')));
  }
  return out.join(',');
}














function _aisladorDibujado(c, cx0, topBarraPx) {
  function filas(els) {

    var ys = [], j, k, t, hay;
    for (j = 0; j < els.length; j++) {
      t = parseFloat(els[j].style.top);
      if (!isFinite(t)) continue;
      for (k = 0, hay = false; k < ys.length; k++) if (Math.abs(ys[k] - t) < 1) hay = true;
      if (!hay) ys.push(t);
    }
    ys.sort(function(a, b) { return a - b; });
    return ys.map(function(t) { return ((t - topBarraPx) * PX_TO_MM).toFixed(1); });
  }

  var bloques = c.querySelectorAll("img[src*=\"ais_3f\"], img[src*=\"ais_4f\"]");
  if (bloques.length) {
    var b0 = bloques[0];
    var w = parseFloat(b0.style.width), h = parseFloat(b0.style.height);
    var l = parseFloat(b0.style.left);
    if (!(w > 0) || !(h > 0) || !isFinite(l)) return "";
    return ["b", (w * PX_TO_MM).toFixed(1), (h * PX_TO_MM).toFixed(1),
            ((l - cx0) * PX_TO_MM).toFixed(1)]
      .concat(filas(bloques)).join(",");
  }

  var discos = c.querySelectorAll(".ais05s400-img");
  if (discos.length) {
    var d0 = discos[0], dw = parseFloat(d0.style.width);
    if (!(dw > 0)) return "";
    return ["d", (dw * PX_TO_MM).toFixed(1)].concat(filas(discos)).join(",");
  }

  return "";
}






function abrirConector3D(modelo) {
  var sis = _con3dSistema();
  if (!sis) {
    alert('La vista 3D existe para 3F y 3F+N.\n' +
          'Los demás sistemas todavía no tienen modelo.');
    return;
  }
  var ov = document.getElementById('con3d_overlay');
  var fr = document.getElementById('con3d_frame');
  if (!ov || !fr) return;

  if (window._uniAbierto && typeof cerrarUnifilar === 'function') cerrarUnifilar();
  _v3dModelo = modelo || '';
  _v3dQuery = _con3dQuery(sis, modelo);



  _v3dCargando(true);
  fr.src = 'conector3d.html?v=' + Date.now() + _v3dQuery;
  fr.onload = function() { _v3dAvisarEstado(); _v3dEsperarListo(fr); };
  ov.style.display = 'flex';
  _v3dAplicarForma(_v3dLeer() === '1');
}









var _V3D_KEY = 'protab_v3d_dividido';
var _v3dModelo = '', _v3dQuery = '';
function _v3dLeer() { try { return localStorage.getItem(_V3D_KEY); } catch (e) { return null; } }
function _v3dAbierto() {
  var ov = document.getElementById('con3d_overlay');
  return !!(ov && ov.style.display === 'flex');
}
function _v3dAplicarForma(dividida) {
  var antes = document.body.classList.contains('v3d-dividido');
  document.body.classList.toggle('v3d-dividido', dividida);
  if (dividida && typeof _uniFijarAncho === 'function') {
    var a = null;
    try { a = parseFloat(localStorage.getItem('protab_uni_ancho')); } catch (e) {}
    _uniFijarAncho(isNaN(a) || a == null ? 50 : a);
  }
  _v3dAvisarEstado();

  if (antes !== dividida && typeof zoomAjustar === 'function') {
    requestAnimationFrame(function() { zoomAjustar(0); });
  }
}
function _v3dAvisarEstado() {
  var fr = document.getElementById('con3d_frame');
  if (!fr || !fr.contentWindow) return;
  try {
    fr.contentWindow.postMessage({ tipo: 'protab-conector3d-estado',
      dividida: document.body.classList.contains('v3d-dividido') }, '*');
  } catch (e) {}
}
function _v3dAlternar() {
  var div = !document.body.classList.contains('v3d-dividido');
  try { localStorage.setItem(_V3D_KEY, div ? '1' : '0'); } catch (e) {}
  _v3dAplicarForma(div);
}



var _v3dRefrescoT = null;
function _v3dRefrescarDiferido() {
  if (!_v3dAbierto() || !document.body.classList.contains('v3d-dividido')) return;
  clearTimeout(_v3dRefrescoT);
  _v3dRefrescoT = setTimeout(function() {
    if (!_v3dAbierto()) return;
    var sis = _con3dSistema();
    if (!sis) { cerrarConector3D(); return; }
    var q = _con3dQuery(sis, _v3dModelo);
    if (q === _v3dQuery) return;
    _v3dQuery = q;
    var fr = document.getElementById('con3d_frame');
    if (fr) { _v3dCargando(true); fr.src = 'conector3d.html?v=' + Date.now() + q; }
  }, 600);
}











var V3D_QUIETO_MS = 450, V3D_CARGA_MAX_MS = 10000;
var _v3dCargaT = null, _v3dCargaN = 0, _v3dTopeT = null;
function _v3dCargando(on) {
  _v3dCargaN++;                                                                   
  var el = document.getElementById('con3d_cargando');
  if (el) el.style.display = on ? 'flex' : 'none';
  clearTimeout(_v3dTopeT); _v3dTopeT = null;
  if (!on) { clearInterval(_v3dCargaT); _v3dCargaT = null; return; }



  var gen = _v3dCargaN;
  _v3dTopeT = setTimeout(function() { if (gen === _v3dCargaN) _v3dCargando(false); },
                         V3D_CARGA_MAX_MS + 2000);
}
function _v3dEsperarListo(fr) {
  var w = null;
  try { w = fr.contentWindow; } catch (e) {}






  try { if (!w || !/conector3d/.test(String(w.location.href))) return; } catch (e) { return; }
  clearInterval(_v3dCargaT);
  var n = -1, quieto = 0, t0 = Date.now(), PASO = 150, gen = _v3dCargaN;
  _v3dCargaT = setInterval(function() {
    var c = n;
    try { c = w.performance.getEntriesByType('resource').length; } catch (e) {}
    if (c === n) quieto += PASO; else { quieto = 0; n = c; }
    if (quieto >= V3D_QUIETO_MS || Date.now() - t0 > V3D_CARGA_MAX_MS) {
      clearInterval(_v3dCargaT); _v3dCargaT = null;


      var hecho = false, fin = function() {
        if (hecho || gen !== _v3dCargaN) return;
        hecho = true; _v3dCargando(false);
      };
      requestAnimationFrame(function() { requestAnimationFrame(fin); });
      setTimeout(fin, 250);
    }
  }, PASO);
}





function _con3dQuery(sis, modelo) {
  var c = _con3dCotas();
  var pe = _barraPEDibujada();
  var bn = _barraNDibujada();
  var bf = _barrasFaseDibujadas();







  if (sis === '3F + N' && bf && bf.fases.split(',').filter(Boolean).length === 3) sis = '3F';
  return '&sis=' + encodeURIComponent(sis) +
           '&alto='   + c.alto +
           '&recto='  + c.recto +
           '&cabeza=' + c.cabeza +
           (pe ? '&pe=' + pe : '') +
           (bn ? '&bn=' + bn : '') +
           (bf ? '&bf=' + bf.fases + '&bl=' + bf.largo +
                 '&bs=' + bf.sep + '&bh=' + bf.agujeros +
                 (bf.aislador ? '&ba=' + bf.aislador : '') +
                 (bf.conectores ? '&bc=' + bf.conectores : '') +
                 (bf.ig ? '&bi=' + bf.ig.alIG +
                          (bf.ig.hastaIG ? '&bt=' + bf.ig.hastaIG : '') : '') : '') +
           (modelo ? '&modelo=' + encodeURIComponent(modelo) : '');
}




function abrirVisor3D() {
  if (!window._panelBusbarData) {
    if (typeof _avisoFlotante === 'function') _avisoFlotante('Primero insertá el Panel Busbar.');
    return;
  }
  abrirConector3D('barrasFase');
}

function cerrarConector3D() {
  var ov = document.getElementById('con3d_overlay');
  var fr = document.getElementById('con3d_frame');
  if (ov) ov.style.display = 'none';
  clearTimeout(_v3dRefrescoT);
  _v3dCargando(false);
  if (document.body.classList.contains('v3d-dividido')) {
    document.body.classList.remove('v3d-dividido');

    if (typeof zoomAjustar === 'function') requestAnimationFrame(function() { zoomAjustar(0); });
  }


  if (fr) fr.src = 'about:blank';
}





function _con3dGuardar(m) {
  var prev = window._panelBusbarData;
  if (!prev) return false;
  var nums = [m.alto, m.recto, m.cabeza].map(parseFloat);
  if (nums.some(function(x) { return isNaN(x); })) return false;
  var entrada = {};
  for (var k in prev) if (Object.prototype.hasOwnProperty.call(prev, k)) entrada[k] = prev[k];
  entrada.conRielAltoMm   = nums[0];
  entrada.conRielAnMm     = nums[1];
  entrada.conRielCabezaMm = nums[2];

  var resp = buildPanelBusbar(entrada, prev, window._itmList || []);
  if (!resp.ok) {
    alert('No se pudieron guardar las cotas: ' +
          ((resp.outOfRange && resp.outOfRange.length)
            ? ('fuera de rango ' + resp.outOfRange.join(', '))
            : (resp.errors || []).join(' / ')));
    return false;
  }
  window._panelBusbarData = resp.data;
  if (typeof _applyConDims === 'function') _applyConDims(window._panelBusbarData);
  if (typeof dibujarPanelBusbar === 'function') dibujarPanelBusbar();
  if (typeof actualizarBibliotecaPB === 'function') actualizarBibliotecaPB();
  if (typeof guardarSesion === 'function') guardarSesion();
  return true;
}

window.addEventListener('message', function(ev) {
  var m = ev.data;
  if (!m || m.tipo !== 'protab-conector3d') return;





  if (m.accion === 'plano' || m.accion === 'plano-auto') return;


  var fr = document.getElementById('con3d_frame');
  if (!fr || ev.source !== fr.contentWindow) return;
  if (m.accion === 'dividir') { _v3dAlternar(); return; }
  if (m.accion === 'listo') { _v3dCargando(false); return; }


  if (m.accion === 'guardar' && !_con3dGuardar(m)) return;
  cerrarConector3D();
});





