



























var _dxfAssets = {};
var _dxfN = 0;




function _dxfCargarAsset(src) {
  var url = String(src).split('#')[0].split('?')[0];
  if (_dxfAssets[url]) return _dxfAssets[url];
  _dxfAssets[url] = fetch(url).then(function(r) {
    if (!r.ok) throw new Error(r.status + ' ' + url);
    return r.text();
  }).then(function(txt) { return _dxfPrepararSvg(txt, url); })
    .catch(function(e) { console.warn('[dxf-tablero] no se pudo leer', url, e); return null; });
  return _dxfAssets[url];
}

function _dxfPrefijar(inner, pre) {
  return inner
    .replace(/\bid="([^"]+)"/g, 'id="' + pre + '$1"')
    .replace(/url\(\s*#([^)\s]+)\s*\)/g, 'url(#' + pre + '$1)')
    .replace(/(xlink:href|href)="#([^"]+)"/g, '$1="#' + pre + '$2"')
    .replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, function(m, a, css) {
      return '<style' + a + '>' + css.replace(/\.([A-Za-z_][\w-]*)/g, '.' + pre + '$1') + '</style>';
    })
    .replace(/\bclass="([^"]+)"/g, function(m, c) {
      return 'class="' + c.trim().split(/\s+/).map(function(x) { return pre + x; }).join(' ') + '"';
    });
}

function _dxfPrepararSvg(txt, url) {
  var doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
  var root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg') return null;
  var vbA = root.getAttribute('viewBox');
  var vb = vbA ? vbA.trim().split(/[\s,]+/).map(parseFloat)
               : [0, 0, parseFloat(root.getAttribute('width')) || 100, parseFloat(root.getAttribute('height')) || 100];
  var ser = new XMLSerializer(), inner = '';
  for (var i = 0; i < root.childNodes.length; i++) inner += ser.serializeToString(root.childNodes[i]);
  var nombre = url.split('/').pop().replace(/\.svg$/i, '').replace(/-v[fl]$/i, '')
                  .replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toUpperCase();
  return { vb: vb, par: (root.getAttribute('preserveAspectRatio') || '').trim(),
           inner: _dxfPrefijar(inner, 'a' + (++_dxfN) + '-'), nombre: nombre };
}



function _dxfEncaje(vb, par, w, h) {
  if (!(vb[2] > 0) || !(vb[3] > 0)) return '';
  var sx = w / vb[2], sy = h / vb[3], ox = 0, oy = 0;
  if (!/^none/.test(par)) {
    var s = Math.min(sx, sy);
    ox = (w - vb[2] * s) / 2; oy = (h - vb[3] * s) / 2;
    sx = sy = s;
  }
  return 'translate(' + ox + ' ' + oy + ') scale(' + sx + ' ' + sy + ') translate(' + (-vb[0]) + ' ' + (-vb[1]) + ')';
}




function _dxfMatriz(el, raiz) {
  var cadena = [], cur = el;
  while (cur && cur !== raiz) {
    cadena.push(cur);
    cur = (cur instanceof HTMLElement) ? cur.offsetParent : cur.parentElement;
  }
  if (cur !== raiz) return null;
  var m = new DOMMatrix();
  for (var i = cadena.length - 1; i >= 0; i--) {
    var e = cadena[i], cs = getComputedStyle(e), t = new DOMMatrix();
    if (e instanceof HTMLElement) t = t.translate(e.offsetLeft, e.offsetTop);
    else t = t.translate(parseFloat(cs.left) || 0, parseFloat(cs.top) || 0);
    if (cs.transform && cs.transform !== 'none') {
      var o = cs.transformOrigin.split(' ').map(parseFloat);
      t = t.translate(o[0], o[1]).multiply(new DOMMatrix(cs.transform)).translate(-o[0], -o[1]);
    }
    m = m.multiply(t);
  }
  return m;
}

function _dxfVisible(el) {
  if (el.checkVisibility) {
    return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true,
                                opacityProperty: true, visibilityProperty: true });
  }
  var cs = getComputedStyle(el);
  return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) !== 0;
}


function _dxfCapa(el) {
  var c = (el.className && el.className.baseVal !== undefined) ? el.className.baseVal : String(el.className || '');
  var src = (el.getAttribute && el.getAttribute('src')) || '';
  var id = el.id || '';
  if (el.closest('.itm-rotulo, .ig-rotulo, .bornera-rotulo, .canaleta-rotulo, .puerta-rotulo, .trafo-rotulo')) return 'ROTULOS';



  if (el.closest('.mandil-overlay[data-reserva]')) return 'MANDIL_RESERVA';
  if (el.closest('.mandil-overlay, .mandil-placa-overlay, .mandil-extra-izq, .mandil-extra-der')) return 'MANDIL';
  if (/canaleta/.test(c)) return 'CANALETAS';
  if (/con-svg|ig-insert/.test(c)) return 'CONECTORES';
  if (/busbar|bar-|ais/.test(c) || /\/(ais_|bar_|perno)/.test(src)) return 'BARRAS';
  if (el.closest('#img_gab_ext, #svg_marco_interno, #svg_placa_base, #svg_diagonales') ||
      /marco|placa|gab/.test(c + ' ' + id) || /Gabinete|cerradura/i.test(src)) return 'GABINETE';
  return 'EQUIPOS';
}


function _dxfRotuloDe(img) {
  var d = img.dataset || {}, it = null;
  var buscar = function(id) { return (typeof _buscarITM === 'function') ? _buscarITM(id) : null; };
  if (d.itmId && (it = buscar(d.itmId))) return it.rotulo || '';
  if (d.difItmId && (it = buscar(d.difItmId))) return _rotuloID(it.rotulo, '');
  if (d.contactorItmId && (it = buscar(d.contactorItmId))) return _rotuloK(it.rotulo, '');

  if (d.dpsItmId && (it = buscar(d.dpsItmId))) return 'DPS';

  var grp = img.closest('[data-born-grupo-id]');
  if (grp) {
    var id = grp.getAttribute('data-born-grupo-id');


    var raiz = img.closest('#marco_gabinete') || document.getElementById('marco_gabinete') || document;
    var rots = raiz.querySelectorAll('.bornera-rotulo[data-born-grupo-id]');
    for (var i = 0; i < rots.length; i++) {
      if (rots[i].getAttribute('data-born-grupo-id') === id) return rots[i].textContent.trim();
    }
  }
  if (/\big-img\b/.test(img.className)) return 'IG';
  return '';
}




var _DXF_PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'opacity', 'fill-opacity',
                  'display', 'visibility', 'font-size', 'text-anchor'];
function _dxfSvgEnLinea(svg) {
  var copia = svg.cloneNode(true);
  var orig = [svg].concat(Array.prototype.slice.call(svg.querySelectorAll('*')));
  var dest = [copia].concat(Array.prototype.slice.call(copia.querySelectorAll('*')));
  for (var i = 0; i < orig.length && i < dest.length; i++) {
    var cs = getComputedStyle(orig[i]);
    _DXF_PROPS.forEach(function(p) {
      var v = cs.getPropertyValue(p);
      if (v) dest[i].setAttribute(p, v);
    });
    dest[i].removeAttribute('class');
    dest[i].removeAttribute('style');
  }
  var ser = new XMLSerializer(), inner = '';
  for (var k = 0; k < copia.childNodes.length; k++) inner += ser.serializeToString(copia.childNodes[k]);
  return _dxfPrefijar(inner, 'i' + (++_dxfN) + '-');
}



var _DXF_QUITAR = '[class*="cota"], #modo_copia_hint';

function _dxfEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}



function _dxfContorno(el, cs, w, h, capa, tr) {
  var ow = parseFloat(cs.outlineWidth) || 0;
  if (!(ow > 0) || cs.outlineStyle === 'none' || !(w > 0) || !(h > 0)) return '';
  var o = (parseFloat(cs.outlineOffset) || 0) + ow / 2;
  return '<g data-capa="' + capa + '" transform="' + tr + '"><rect x="' + (-o) + '" y="' + (-o) +
         '" width="' + (w + 2 * o) + '" height="' + (h + 2 * o) + '" fill="none" stroke="' + cs.outlineColor +
         '" stroke-width="' + ow + '"/></g>';
}





var _DXF_QUITAR_VISTA = {
  frontal_mandil: '#svg_placa_base, .mandil-fill-svg'
};




function _dxfVentanasMandil(marco) {

  if (window._vistaActual === 'frontal_mandil' && Array.isArray(window.__mandilCalados)) {
    return window.__mandilCalados.map(function(c) { return [c.x, c.y, c.w, c.h]; });
  }
  var p = marco.querySelector('.mandil-fill-svg path');
  if (!p) return [];
  var d = p.getAttribute('d') || '', re = /M\s*([-\d.]+)[ ,]+([-\d.]+)\s*h\s*([-\d.]+)\s*v\s*([-\d.]+)/g, m, v = [];
  while ((m = re.exec(d))) v.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])]);
  return v.slice(1);
}




async function _dxfSvgVista(marco, vista) {
  var MM = (typeof PX_TO_MM === 'number') ? PX_TO_MM : 0.2;
  var quitar = (typeof _PLANO_QUITAR === 'string' ? _PLANO_QUITAR + ', ' : '') + _DXF_QUITAR +
               (_DXF_QUITAR_VISTA[vista] ? ', ' + _DXF_QUITAR_VISTA[vista] : '');
  var W = parseFloat(marco.style.width) || marco.offsetWidth;
  var H = parseFloat(marco.style.height) || marco.offsetHeight;
  var rm = marco.getBoundingClientRect();

  var todos = Array.prototype.slice.call(marco.querySelectorAll('*'));
  var imgs = todos.filter(function(e) { return e.tagName === 'IMG' && /\.svg(\?|#|$)/i.test(e.getAttribute('src') || ''); });
  var assets = {};
  await Promise.all(imgs.map(function(img) {
    var src = img.getAttribute('src');
    return _dxfCargarAsset(src).then(function(a) { assets[src] = a; });
  }));

  var bb = { x0: 0, y0: 0, x1: W * MM, y1: H * MM };
  var crecer = function(el) {
    var r = el.getBoundingClientRect();
    if (!(r.width > 0) && !(r.height > 0)) return;
    bb.x0 = Math.min(bb.x0, (r.left - rm.left) * MM); bb.x1 = Math.max(bb.x1, (r.right - rm.left) * MM);
    bb.y0 = Math.min(bb.y0, (r.top - rm.top) * MM);   bb.y1 = Math.max(bb.y1, (r.bottom - rm.top) * MM);
  };






  var ventanas = vista === 'frontal_mandil' ? _dxfVentanasMandil(marco) : [];


  var tras = vista === 'frontal_mandil' ? document.getElementById('panel_busbar_container') : null;
  var atras = '';

  var out = '';

  out += '<g data-capa="GABINETE"><rect x="0" y="0" width="' + W * MM + '" height="' + H * MM +
         '" fill="none" stroke="#000" stroke-width="0.4"/></g>';

  var mm = function(m) {
    return 'matrix(' + [m.a * MM, m.b * MM, m.c * MM, m.d * MM, m.e * MM, m.f * MM].join(' ') + ')';
  };

  todos.forEach(function(el) {

    var q = el.closest(quitar);
    if (q && marco.contains(q)) return;
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return;                             
    if (el.tagName.toLowerCase() === 'svg' && el.parentElement && el.parentElement.closest('svg')) return;
    if (!_dxfVisible(el)) return;
    var m = _dxfMatriz(el, marco);
    if (!m) return;
    var capa = _dxfCapa(el);
    var tag = el.tagName.toLowerCase();


    var esTras = !!(tras && tras.contains(el));
    var outBk = out;
    if (esTras) out = '';
    (function() {
    if (tag === 'img') {
      var a = assets[el.getAttribute('src')];
      var w = el.offsetWidth, h = el.offsetHeight;
      if (!a || !(w > 0) || !(h > 0)) return;
      var det = m.a * m.d - m.b * m.c;
      var encaje = _dxfEncaje(a.vb, a.par, w, h);
      var rot = _dxfRotuloDe(el);
      if (det > 0 && !esTras) {

        var k = Math.sqrt(det), ang = Math.atan2(m.b, m.a) * 180 / Math.PI;
        out += '<g data-bloque="' + a.nombre + '" data-capa="' + capa + '" transform="translate(' + (m.e * MM) + ' ' +
               (m.f * MM) + ') rotate(' + ang + ')">' +
               '<g transform="scale(' + (k * MM) + ') ' + encaje + '">' + a.inner + '</g>' +
               (rot ? '<text data-oculto="1" x="0" y="0" font-size="3.5"><tspan id="rotulo">' + _dxfEsc(rot) + '</tspan></text>' : '') +
               '</g>';
      } else {

        out += '<g data-capa="' + capa + '" transform="' + mm(m) + ' ' + encaje + '">' + a.inner + '</g>';
      }
    } else if (tag === 'svg') {
      var vbS = el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal.width
        ? [el.viewBox.baseVal.x, el.viewBox.baseVal.y, el.viewBox.baseVal.width, el.viewBox.baseVal.height] : null;

      var csS = getComputedStyle(el);
      var ws = parseFloat(csS.width) || parseFloat(el.getAttribute('width')) || 0;
      var hs = parseFloat(csS.height) || parseFloat(el.getAttribute('height')) || 0;
      var enc = vbS ? _dxfEncaje(vbS, el.getAttribute('preserveAspectRatio') || '', ws, hs) : '';
      out += '<g data-capa="' + capa + '" transform="' + mm(m) + ' ' + enc + '">' + _dxfSvgEnLinea(el) + '</g>';
      out += _dxfContorno(el, csS, ws, hs, capa, mm(m));
    } else if (el instanceof HTMLElement) {

      var cs = getComputedStyle(el);
      var wd = el.offsetWidth, hd = el.offsetHeight;
      if (!(wd > 0) || !(hd > 0)) return;
      var bw = parseFloat(cs.borderTopWidth) || 0;
      var borde = bw > 0 && cs.borderTopStyle !== 'none' && !/rgba\(.*,\s*0\)$/.test(cs.borderTopColor);
      var fondo = cs.backgroundColor && !/rgba\(.*,\s*0\)$/.test(cs.backgroundColor) && cs.backgroundColor !== 'transparent';
      var g = '';


      var _rad = cs.borderTopLeftRadius || '';
      var _redonda = /%$/.test(_rad) ? parseFloat(_rad) >= 50
                                     : (parseFloat(_rad) || 0) >= Math.min(wd, hd) / 2 - 0.5;
      if ((borde || fondo) && _redonda) {
        g += '<ellipse cx="' + (wd / 2) + '" cy="' + (hd / 2) + '" rx="' + (wd / 2) + '" ry="' + (hd / 2) +
             '" fill="' + (fondo ? cs.backgroundColor : 'none') +
             '" stroke="' + (borde ? cs.borderTopColor : 'none') + '" stroke-width="' + (borde ? bw : 0) + '"/>';
      } else if (borde || fondo) {
        g += '<rect x="0" y="0" width="' + wd + '" height="' + hd + '" fill="' + (fondo ? cs.backgroundColor : 'none') +
             '" stroke="' + (borde ? cs.borderTopColor : 'none') + '" stroke-width="' + (borde ? bw : 0) + '"' +
             (cs.borderTopStyle === 'dashed' ? ' stroke-dasharray="6 3"' : '') + '/>';
      }
      var propio = '';
      for (var n = 0; n < el.childNodes.length; n++) {
        if (el.childNodes[n].nodeType === 3) propio += el.childNodes[n].nodeValue;
      }
      propio = propio.replace(/\s+/g, ' ').trim();
      if (propio) {
        var fs = parseFloat(cs.fontSize) || 12;
        g += '<text x="' + (wd / 2) + '" y="' + (hd / 2 + fs * 0.35) + '" text-anchor="middle" font-size="' + fs +
             '" fill="' + cs.color + '">' + _dxfEsc(propio) + '</text>';
      }
      if (g) out += '<g data-capa="' + capa + '" transform="' + mm(m) + '">' + g + '</g>';
      out += _dxfContorno(el, cs, wd, hd, capa, mm(m));
    }
    })();
    if (esTras) { atras += out; out = outBk; return; }
    if (out.length > outBk.length) crecer(el);
  });

  if (atras && ventanas.length) {
    out += '<g data-recorte="' + ventanas.map(function(w) {
      return [w[0] * MM, w[1] * MM, w[2] * MM, w[3] * MM].join(',');
    }).join(';') + '">' + atras + '</g>';
  }




  var cotas = [];
  marco.querySelectorAll('.cota-mi.cota-gab').forEach(function(c) {
    if (!_dxfVisible(c)) return;
    var r = c.getBoundingClientRect();
    var val = c.querySelector('.cota-mi-val, .cota-mi-val-v');
    var txt = (val ? val.textContent : c.textContent).replace(/\s+/g, ' ').trim();
    if (!txt) return;
    var hor = c.classList.contains('cota-mi-h');
    cotas.push(hor
      ? { h: true,  a0: (r.left - rm.left) * MM, a1: (r.right - rm.left) * MM, pos: (r.top + r.height / 2 - rm.top) * MM, txt: txt }
      : { h: false, a0: (r.top - rm.top) * MM,   a1: (r.bottom - rm.top) * MM, pos: (r.left + r.width / 2 - rm.left) * MM, txt: txt });
  });

  return { inner: out, bb: bb, cotas: cotas, W: W * MM, H: H * MM };
}



var _DXF_COL_COTA = '#9b59b6';
function _dxfCotaSvg(c, lin, desde, th) {
  var fs = th / 0.72, fl = th * 0.9, an = th * 0.3, gap = th * 0.3, s = '';
  var L = function(x1, y1, x2, y2) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + _DXF_COL_COTA + '" stroke-width="0.25"/>';
  };
  var T = function(pts) {
    return '<polygon points="' + pts.map(function(p) { return p[0] + ',' + p[1]; }).join(' ') +
           '" fill="none" stroke="' + _DXF_COL_COTA + '" stroke-width="0.25"/>';
  };
  var ext = th * 0.6;


  var corta = (c.a1 - c.a0) < fl * 2.5;
  var d = corta ? -1 : 1;
  var b0 = corta ? c.a0 - fl * 1.6 : c.a0, b1 = corta ? c.a1 + fl * 1.6 : c.a1;
  var tMedio = (c.a0 + c.a1) / 2;
  if (c.h) {
    s += L(c.a0, desde + gap, c.a0, lin + ext) + L(c.a1, desde + gap, c.a1, lin + ext) + L(b0, lin, b1, lin);
    s += T([[c.a0, lin], [c.a0 + d * fl, lin - an], [c.a0 + d * fl, lin + an]]);
    s += T([[c.a1, lin], [c.a1 - d * fl, lin - an], [c.a1 - d * fl, lin + an]]);
    s += '<text x="' + (corta ? b1 + th * 0.3 : tMedio) + '" y="' + (corta ? lin + th * 0.5 : lin - th * 0.4) +
         '" text-anchor="' + (corta ? 'start' : 'middle') + '" font-size="' + fs +
         '" fill="' + _DXF_COL_COTA + '">' + _dxfEsc(c.txt) + '</text>';
  } else {
    s += L(desde + gap, c.a0, lin + ext, c.a0) + L(desde + gap, c.a1, lin + ext, c.a1) + L(lin, b0, lin, b1);
    s += T([[lin, c.a0], [lin - an, c.a0 + d * fl], [lin + an, c.a0 + d * fl]]);
    s += T([[lin, c.a1], [lin - an, c.a1 - d * fl], [lin + an, c.a1 - d * fl]]);
    var tx = corta ? lin + th * 0.5 : lin - th * 0.4, ty = corta ? b0 - th * 0.3 : tMedio;
    s += '<text x="' + tx + '" y="' + ty + '" transform="rotate(-90 ' + tx + ' ' + ty + ')" text-anchor="' +
         (corta ? 'start' : 'middle') + '" font-size="' + fs +
         '" fill="' + _DXF_COL_COTA + '">' + _dxfEsc(c.txt) + '</text>';
  }
  return '<g data-capa="COTAS">' + s + '</g>';
}





function _dxfCotasVista(v, th) {
  var s = '', der = v.bb.x1, abajo = v.bb.y1;
  var agrupar = function(lista) {
    var filas = [];



    var pisa = function(f, c) {
      return f.some(function(o) { return c.a0 < o.a1 - 0.01 && c.a1 > o.a0 + 0.01; });
    };
    lista.slice().sort(function(a, b) { return a.pos - b.pos; }).forEach(function(c) {
      var f = filas.length ? filas[filas.length - 1] : null;
      if (f && Math.abs(f[0].pos - c.pos) < th * 3 && !pisa(f, c)) f.push(c); else filas.push([c]);
    });
    return filas;
  };
  var paso = th * 2.4;
  agrupar(v.cotas.filter(function(c) { return c.h; })).forEach(function(fila, k) {
    var lin = v.bb.y1 + th * 2 + k * paso;
    fila.forEach(function(c) { s += _dxfCotaSvg(c, lin, v.H, th); });
    abajo = lin + th;
  });
  agrupar(v.cotas.filter(function(c) { return !c.h; })).forEach(function(col, k) {
    var lin = v.bb.x1 + th * 2 + k * paso;
    col.forEach(function(c) { s += _dxfCotaSvg(c, lin, v.W, th); });
    der = lin + th;
  });
  return { svg: s, der: der, abajo: abajo };
}

















var _DXF_TXT_PAPEL = 2.5;                                                    
async function _dxfConHoja(armar) {
  var HP = window.hojaProtab;
  if (!HP || typeof HP.componer !== 'function') {
    var r0 = armar(20);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + r0.caja.x + ' ' + r0.caja.y + ' ' +
           r0.caja.w + ' ' + r0.caja.h + '">' + r0.cuerpo + '</svg>';
  }

  var PXMM = 96 / 25.4, BAND = 18, TB = 64;
  var W = HP.ANCHO, H = HP.ALTO;
  var IW = W - BAND, IH = H - BAND - TB, PAD = 8 * PXMM, LABEL = 12 * PXMM;
  var aW = IW - 2 * PAD, aH = IH - 2 * PAD - LABEL;
  var cabe = function(N, r) {
    return r.caja.w * PXMM / N <= aW * 0.98 && r.caja.h * PXMM / N <= aH * 0.98;
  };


  var solo = armar(0);
  var N = Math.max(1, Math.ceil(Math.max(solo.caja.w * PXMM / aW, solo.caja.h * PXMM / aH)));
  var r = armar(_DXF_TXT_PAPEL * N);
  for (var vuelta = 0; vuelta < 500 && !cabe(N, r); vuelta++) {
    N++;
    r = armar(_DXF_TXT_PAPEL * N);
  }
  var cuerpo = r.cuerpo, caja = r.caja;
  var k = PXMM / N;                                                            
  var rw = aW / k, rh = aH / k;

  var rx = caja.x + caja.w / 2 - rw / 2, ry = caja.y - rh * 0.01;
  var lamina = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + rx + ' ' + ry + ' ' + rw + ' ' + rh + '">' +
               cuerpo + '</svg>';


  var m = window._pdfMeta || {};
  var proy = '';
  try {
    var pm = PM.meta();
    (pm.projects || []).forEach(function(p) { if (p.id === pm.activeId) proy = p.name || ''; });
  } catch (e) {}
  var v = function(x) { return x == null ? '' : String(x); };
  var datos = {
    proyecto: v(m.proyecto || proy), cliente: v(m.cliente), pagina: v(m.titulo || 'Plano mecánico'),
    proyectista: v(m.disNombre), fecha: v(m.disFecha), plano: v(m.plano),
    cotizacion: v(m.cotizacion), orden: v(m.orden), rev: v(m.rev || '1'),
    escala: '1 : ' + N + ' (A3)', hoja: '1', total: '1'
  };
  var hoja = HP.componer({ l1: '', l2: '', alt: 'Plano mecánico' }, datos,
                         { svg: lamina, logo: '__LOGO__' }).svg;



  var logo = await _dxfCargarAsset('./ProTAB_files/table-xd-report.svg');
  hoja = _dxfHojaSinImagen(hoja, logo, '__LOGO__');
  var cuerpoHoja = hoja.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');


  var escala = 1 / k;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W * escala + ' ' + H * escala + '">' +
         '<g data-capa="CAJETIN" transform="scale(' + escala + ')">' + cuerpoHoja + '</g></svg>';
}




function _dxfHojaSinImagen(hoja, logo, href) {
  var i = hoja.indexOf('href="' + href + '"');
  if (i !== -1) {
    var a = hoja.lastIndexOf('<image', i), b = hoja.indexOf('/>', i) + 2;
    var tag = hoja.slice(a, b), rep = '';
    if (logo) {
      var at = function(n) { var q = tag.match(new RegExp('\s' + n + '="([^"]+)"')); return q ? parseFloat(q[1]) : 0; };
      rep = '<g data-bloque="PROTAB_LOGO" data-capa="CAJETIN" transform="translate(' + at('x') + ' ' + at('y') + ')">' +
            '<g transform="' + _dxfEncaje(logo.vb, '', at('width'), at('height')) + '">' +


            logo.inner.replace(/#14213D/gi, '#000000') + '</g></g>';
    }
    hoja = hoja.slice(0, a) + rep + hoja.slice(b);
  }
  return hoja.replace(/<rect[^>]*fill="#fff"\/>/, '');
}






async function dxfDeHojas(hojas) {
  var logo = await _dxfCargarAsset('./ProTAB_files/table-xd-report.svg');
  var PXMM = 96 / 25.4, SEP = 40 * PXMM, x = 0, hMax = 0, partes = [];
  hojas.forEach(function(svg) {
    if (!svg) return;
    var vb = ((svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 0 0').split(/[\s,]+/).map(Number);
    var hoja = _dxfHojaSinImagen(svg, logo, './ProTAB_files/table-xd-report.svg');
    var cuerpo = hoja.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    partes.push('<g transform="translate(' + (x - vb[0]) + ' ' + (-vb[1]) + ')">' + cuerpo + '</g>');
    x += vb[2] + SEP;
    hMax = Math.max(hMax, vb[3]);
  });
  var w = Math.max(0, x - SEP), k = 1 / PXMM;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w * k + ' ' + hMax * k + '">' +
         '<g data-capa="CAJETIN" transform="scale(' + k + ')">' + partes.join('') + '</g></svg>';
}


var _DXF_VISTAS = [
  { key: 'frontal',        l1: 'VISTA FRONTAL', l2: '(SIN PUERTA / SIN MANDIL)' },
  { key: 'frontal_mandil', l1: 'VISTA FRONTAL', l2: '(SIN PUERTA / CON MANDIL)' },
  { key: 'frontal_puerta', l1: 'VISTA FRONTAL', l2: '(CON PUERTA)' },
  { key: 'lateral',        l1: 'VISTA LATERAL', l2: '' }
];




async function exportarTableroDxf() {
  if (typeof convertirSvgADxf !== 'function') return;
  var marco = document.getElementById('marco_gabinete');
  if (!marco || !window._gabineteData) return;
  var vistaOrig = window._vistaActual || 'frontal';
  var zBk = marco.style.zoom, fsBk = marco.style.flexShrink;

  var sinCotas = document.body.classList.contains('sin-cotas-gabinete');



  if (window._dxfTableroExportando) return;
  window._dxfTableroExportando = true;
  var dxf = null, archivo = '';
  try {
    document.body.classList.remove('sin-cotas-gabinete');
    var vistas = [];
    for (var i = 0; i < _DXF_VISTAS.length; i++) {
      aplicarVista(_DXF_VISTAS[i].key);
      marco.style.zoom = '1';
      marco.style.flexShrink = '0';
      var v = await _dxfSvgVista(marco, _DXF_VISTAS[i].key);
      v.def = _DXF_VISTAS[i];
      vistas.push(v);
    }




    var armar = function(th) {
    var cuerpo = '', x = 0, maxX = 0, minY = 0, maxY = 0;
    vistas.forEach(function(v) {
      var c = _dxfCotasVista(v, th);
      var off = x - v.bb.x0;
      var cx = (v.bb.x0 + v.bb.x1) / 2;
      var tit = '';
      var y2 = v.bb.y0 - th * 1.6, y1 = v.def.l2 ? v.bb.y0 - th * 3.6 : y2;
      tit += '<text x="' + cx + '" y="' + y1 + '" text-anchor="middle" font-size="' + (th * 1.3 / 0.72) +
             '" fill="#000">' + _dxfEsc(v.def.l1) + '</text>';
      if (v.def.l2) {
        tit += '<text x="' + cx + '" y="' + y2 + '" text-anchor="middle" font-size="' + (th / 0.72) +
               '" fill="#000">' + _dxfEsc(v.def.l2) + '</text>';
      }
      cuerpo += '<g transform="translate(' + off + ' 0)">' + v.inner + c.svg +
                '<g data-capa="TEXTOS">' + tit + '</g></g>';
      maxX = off + c.der;
      minY = Math.min(minY, y1 - th * 1.3);
      maxY = Math.max(maxY, c.abajo);
      x = maxX + th * 4;
    });
    return { cuerpo: cuerpo, caja: { x: 0, y: minY, w: maxX, h: maxY - minY } };
    };
    var svg = await _dxfConHoja(armar);
    dxf = convertirSvgADxf(svg, { soloLineas: true });

    var nombre = 'tablero';
    try {
      var pm = PM.meta();
      (pm.projects || []).forEach(function(p) { if (p.id === pm.activeId) nombre = p.name || nombre; });
    } catch (e) {}
    archivo = String(nombre).replace(/[^\w.-]+/g, '_') + '_plano.dxf';
  } catch (e) {
    console.warn('[dxf-tablero] no se pudo exportar:', e);
    if (typeof _avisoFlotante === 'function') _avisoFlotante('No se pudo exportar el DXF.');
  } finally {
    if (sinCotas) document.body.classList.add('sin-cotas-gabinete');


    marco.style.zoom = zBk;
    marco.style.flexShrink = fsBk;
    if (typeof aplicarVista === 'function') aplicarVista(vistaOrig);
  }

  try {
    if (dxf) await guardarArchivoTexto(archivo, dxf, 'dxf', 'Dibujo DXF');
  } catch (e) {
    console.warn('[dxf-tablero] no se pudo guardar:', e);
    if (typeof _avisoFlotante === 'function') _avisoFlotante('No se pudo guardar el DXF.');
  }
  window._dxfTableroExportando = false;
}
