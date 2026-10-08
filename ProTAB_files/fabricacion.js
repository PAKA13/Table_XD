






























var _fabThree = null;
function _fabDeps() {
  if (!_fabThree) {
    _fabThree = import(new URL('vendor/three/build/three.module.js', document.baseURI).href);



    _fabThree.catch(function() { _fabThree = null; });
  }
  return _fabThree.then(function(THREE) {
    return {
      THREE: THREE,
      util: window.mallaUtil,
      desplegadoSVG: window.desplegadoSVG,
      construirConectorS: window.construirConectorS,
      construirSoporteRT: window.construirSoporteRT,
      construirPlacaRT: window.construirPlacaRT,
      construirConectorC1: window.construirConectorC1,
      construirBarraPE: window.construirBarraPE,
      Columna: window.Columna,
      c1AlIG: window.c1AlIG
    };
  });
}






var _fabCasoMemo = null;
function _fabCaso() {
  if (_fabCasoMemo) return _fabCasoMemo;
  var _r = _fabCasoCalc();
  _fabCasoMemo = _r;
  setTimeout(function() { _fabCasoMemo = null; }, 0);
  return _r;
}
function _fabCasoCalc() {
  var d = window._panelBusbarData;
  if (!d) return { error: 'Sin panel busbar todavía — armá el tablero en el modo Diseño.' };
  var sis = (typeof _con3dSistema === 'function') ? _con3dSistema() : null;
  if (!sis) {
    return { error: 'El plano de fabricación existe para 3F y 3F + N. ' +
                    'Los demás sistemas todavía no tienen modelo de sus piezas.' };
  }
  var bf = _barrasFaseDibujadas();
  if (!bf) return { error: 'No se pudieron leer las barras del dibujo.' };

  var fases = bf.fases.split(',').filter(Boolean);
  var estructura = bf.agujeros.split(',').map(function(par) {
    var m = /^([\d.]+)@([\d.]+):(\w)$/.exec(par);
    return m ? { d: parseFloat(m[1]), u: parseFloat(m[2]), rol: m[3] } : null;
  }).filter(Boolean);








  var conectores = {}, sinModelo = 0, nRiel = 0, nM1 = 0;
  fases.forEach(function(f) { conectores[f] = []; });
  (bf.conectores || '').split(',').forEach(function(par) {
    var m = /^([RSTN])@(-?[\d.]+):(\w+)$/.exec(par);
    if (!m || !conectores[m[1]]) return;
    var u = parseFloat(m[2]);
    if (m[3] === 'r')       { conectores[m[1]].push(u); nRiel++; }
    else if (m[3] === 'm1') { conectores[m[1]].push({u: u, tipo: 'm1'}); nM1++; }
    else sinModelo++;
  });
  var uCon = function(c) { return (typeof c === 'number') ? c : c.u; };
  fases.forEach(function(f) {
    conectores[f].sort(function(a, b) { return uCon(a) - uCon(b); });
  });





  var filasIG = null, alIG = null;
  if (bf.ig && bf.ig.alIG) {
    filasIG = {}; alIG = {};
    bf.ig.alIG.split(',').forEach(function(par) {
      var t = par.split('@'), f = (t[0] || '').trim();
      var q = (t[1] || '').split(';').map(parseFloat);
      if (!/^[RSTN]$/.test(f) || q.length < 7 || !q.every(isFinite)) return;
      alIG[f] = q[0];
      filasIG[f] = {dx1: q[0], w1: q[1], h1: q[2], dx2: q[3], w2: q[4], h2: q[5], y2: q[6],
                    y4: (q.length >= 8 && isFinite(q[7])) ? q[7] : 0};
    });
    if (!Object.keys(filasIG).length) { filasIG = null; alIG = null; }
  }


  var empalme = null;
  for (var ei = 0; ei < estructura.length; ei++)
    if (estructura[ei].rol === 'c') { empalme = estructura[ei]; break; }




  var igCompleto = !!filasIG && fases.every(function(f) { return !!filasIG[f]; });
  var c1ig = (igCompleto && empalme && typeof bf.ig.hastaIG === 'string')
    ? { filasIG: filasIG, alIG: alIG, hastaIG: parseFloat(bf.ig.hastaIG),
        desdeArriba: empalme.u }
    : null;



  var piezas = {};
  fases.forEach(function(f, i) { piezas[f] = Columna.piezaPorPosicion(fases.length, i) || 's'; });

  var nombreEl = document.getElementById('editor_proyecto_nombre');
  var nombre = (nombreEl && nombreEl.textContent.trim()) || 'proyecto';
  var aviso = sinModelo
    ? sinModelo + (sinModelo === 1 ? ' conector' : ' conectores') +
      ' de Mod2/CM Reg sin dibujar: todavía no tienen pieza modelada'
    : '';
  var c = _con3dCotas();
  var ais = (bf.aislador || '').charAt(0);
  return {
    nombre: nombre, sis: sis, polos: _pbPolosEfectivos(d), nM1: nM1,
    caso: {
      titulo: 'tablero «' + nombre + '» · ' + sis,
      fases: fases,
      largo: parseFloat(bf.largo),
      sep: parseFloat(bf.sep),
      estructura: estructura,
      conectores: conectores,
      piezas: piezas,
      pe: { celdas: laminasCobre.celdasDeTexto(_barraPEDibujada()) },



      c1: c1ig ? 'tablero' : 'no',
      c1ig: c1ig,
      avisoBarras: aviso ? 'sin el taladro de ' + aviso : '',
      avisoConectores: aviso
    },

    cat: {
      S: { alto: c.alto, recto: c.recto, cabeza: c.cabeza },
      SOPORTE_RT: { alto: c.alto },
      SOPORTE_INTER: { alto: c.alto },
      PLACA: { recto: c.recto, cabeza: c.cabeza }
    },
    aislador: ais === 'b' ? 'base' : (ais === 'd' ? 'disco' : 'ninguno'),
    hayIG: !!bf.ig, conC1: !!c1ig, sinModelo: sinModelo, nRiel: nRiel
  };
}







var _fabCapturas = {};
var _FAB_CAPTURAS_MAX = 6;
var _fabCola = Promise.resolve();
function _fabIsometrica(sis, modelo, sinIG) {
  var clave = _con3dQuery(sis, modelo) + (sinIG ? '&sinig=1' : '');
  if (_fabCapturas[clave]) return _fabCapturas[clave];
  var p = _fabCola.then(function() { return _fabCapturar(clave, modelo); });
  _fabCola = p.catch(function() {});
  _fabCapturas[clave] = p;
  p.catch(function() { delete _fabCapturas[clave]; });                                




  var claves = Object.keys(_fabCapturas);
  while (claves.length > _FAB_CAPTURAS_MAX) delete _fabCapturas[claves.shift()];
  return p;
}
function _fabCapturar(query, modelo) {
  return new Promise(function(ok, mal) {
    var fr = document.createElement('iframe');
    fr.setAttribute('aria-hidden', 'true');
    fr.tabIndex = -1;
    fr.style.cssText = 'position:fixed;left:-20000px;top:0;width:1200px;height:900px;' +
                       'border:0;pointer-events:none';
    var fin = false, reloj = null;
    function cerrar() {
      fin = true;
      clearTimeout(reloj);
      window.removeEventListener('message', oir);
      fr.src = 'about:blank';
      if (fr.parentNode) fr.parentNode.removeChild(fr);
    }
    function oir(ev) {
      var m = ev.data;
      if (fin || ev.source !== fr.contentWindow) return;
      if (!m || m.tipo !== 'protab-conector3d' || m.accion !== 'plano-auto') return;
      cerrar();
      if (m.error || !m.imagen) return mal(new Error(m.error || 'el visor no mandó imagen'));
      _fabRecortar(m.imagen).then(ok, mal);
    }
    window.addEventListener('message', oir);
    reloj = setTimeout(function() {
      if (fin) return;
      cerrar();
      mal(new Error('el visor 3D no contestó a tiempo'));
    }, 30000);
    fr.src = 'conector3d.html?v=' + Date.now() + query + '&auto=plano';
    document.body.appendChild(fr);
  });
}





function _fabRecortar(href) {
  return new Promise(function(ok, mal) {
    var img = new Image();
    img.onload = function() {
      var w = img.naturalWidth, h = img.naturalHeight;
      var rec = { x: 0, y: 0, w: w, h: h };
      try {
        var cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        var g = cv.getContext('2d');
        g.drawImage(img, 0, 0);
        var px = g.getImageData(0, 0, w, h).data;
        var x0 = w, y0 = h, x1 = -1, y1 = -1, x, y, i;
        for (y = 0; y < h; y++) {
          for (x = 0; x < w; x++) {
            i = (y * w + x) * 4;
            if (px[i] < 245 || px[i + 1] < 245 || px[i + 2] < 245) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
        }
        if (x1 > x0 && y1 > y0) {
          var mg = Math.round(Math.max(x1 - x0, y1 - y0) * 0.06);
          x0 = Math.max(0, x0 - mg); y0 = Math.max(0, y0 - mg);
          x1 = Math.min(w - 1, x1 + mg); y1 = Math.min(h - 1, y1 + mg);
          rec = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
        }
      } catch (e) {                                      }
      ok({ href: href, w: w, h: h, recorte: rec });
    };
    img.onerror = function() { mal(new Error('la captura del visor no se pudo leer')); };
    img.src = href;
  });
}




function _fabMeta(info, total) {
  var m = window._pdfMeta || {};
  var hoy = new Date();
  function dd(n) { return (n < 10 ? '0' : '') + n; }
  return {
    proyecto: m.proyecto || info.nombre,
    cliente: m.cliente || '—',
    proyectista: m.disNombre || '—',
    fecha: m.disFecha || (dd(hoy.getDate()) + '/' + dd(hoy.getMonth() + 1) + '/' + hoy.getFullYear()),
    cotizacion: m.cotizacion || '—', orden: m.orden || '—',
    rev: m.rev || '1', total: String(total),
    base: m.plano || ''
  };
}



function _fabHojas(dep, info) {
  var L = laminasCobre.crear(dep, { cat: info.cat, programa: true });
  var ej = info.caso;
  var panel = '(PANEL ' + info.sis + ' · ' + (info.polos || '') + ' POLOS)';
  var lam = function(p) { return p ? L.dibujar(p) : null; };
  var hojas = [
    { l1: 'VISTA ISOMÉTRICA', l2: '(BARRAS PRINCIPALES)', pagina: 'Barras principales · montaje',
      cod: 'P3D-01', escala: 's/e', cotas: false,
      png: function() { return _fabIsometrica(info.sis, 'barrasFase', !info.hayIG); } },
    { l1: 'CONECTORES DESPLEGADOS', l2: panel, pagina: 'Conectores · desarrollo',
      cod: 'CON-01', pxPorMm: 5,
      svg: function() { return lam(L.conectores('fab-conectores', ej)); },
      vacio: 'Este tablero no lleva conectores con pieza modelada.' },
    { l1: 'BARRAS PRINCIPALES', l2: panel.replace(')', ' · ' + ej.fases.join(', ') + ')'),
      pagina: 'Barras principales · taladrado', cod: 'BAR-01', pxPorMm: 4,
      svg: function() { return lam(L.barras('fab-barras', ej)); } }
  ];
  if (ej.pe.celdas.length) {
    hojas.push(
      { l1: 'VISTA ISOMÉTRICA', l2: '(BARRA DE TIERRA · PE)', pagina: 'Barra de tierra · montaje',
        cod: 'PE-01', escala: 's/e', cotas: false,
        png: function() { return _fabIsometrica(info.sis, 'barraPE'); } },
      { l1: 'BARRA DE TIERRA DESPLEGADA', l2: panel, pagina: 'Barra de tierra · desarrollo',
        cod: 'PE-02', pxPorMm: 4,
        svg: function() { return lam(L.barraPE('fab-pe', ej)); } });
  }


  return hojas;
}




function _fabMaterialesOp(info) {
  var ej = info.caso, nC1 = info.hayIG ? ej.fases.length : 0;
  var conC1 = !!info.conC1;
  var nPerno = ej.pe.celdas.filter(function(c) { return c.pieza === 'perno'; }).length;
  var cont = document.getElementById('panel_busbar_container');
  var acostadas = cont && cont.querySelector('.bar-n-seg, .bar-pea-seg');
  var notas = [
    'Sale del dibujo de este tablero: ' + info.nRiel + ' conectores de Riel' +
      (info.nM1 ? ', ' + info.nM1 + ' de CM Fijo (pletina 15 × 3, perno de 1/4")' : '') +
      (ej.pe.celdas.length ? ', barra PE de ' + ej.pe.celdas.length + ' segmentos (' + nPerno +
                             ' con perno de 1/4")' : ', sin barra PE') +
      ' y aislador ' + (info.aislador === 'disco' ? '0.5/400, de disco' : info.aislador) + '.',
    'No entra' + ((nC1 && !conC1) ? ' el cobre de los ' + nC1 + ' C1 al IG, de 20 × 3 —su ' +
                        'largo depende del IG y este tablero no lo trae dibujado; su pernería ' +
                        'sí está contada—,' : '') +
      (info.sinModelo ? ' los ' + info.sinModelo + ' conectores de Mod1/Mod2,' : '') +
      (acostadas ? ' las barras N y PE aislada,' : '') +
      ' los tornillos del propio interruptor ni los que traen los ITM.'
  ];
  return { aislador: info.aislador, c1: conC1 ? 'tablero' : 'no', nC1: nC1,
           c1ig: ej.c1ig, fases: ej.fases, notas: notas };
}

function _fabEsc(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

var _fabEpoca = 0;


var _fabParaImprimir = [];
var _fabHojasEsperadas = 0;                                              






var _fabMatCache = null;

function _fabMatFirma() {
  var info = _fabCaso();
  if (info.error) return '';
  var pb = window._panelBusbarData || {};






  var geo = '';
  try { geo = (typeof _con3dQuery === 'function') ? _con3dQuery(info.sis, 'mat') : ''; }
  catch (e) { geo = 'sin-geo'; }
  return [info.sis, info.polos, info.aislador, info.hayIG, info.conC1, info.nRiel, info.nM1,
          info.sinModelo, (window._itmList || []).length, pb.barraTierra,
          (window._itmList || []).map(function(i) { return i.tipo + i.capacidad + i.polos; }).join(','),
          geo
         ].join('|');
}



function fabOlvidarTodo() {
  _fabMatCache = null;
  _fabParaImprimir = [];
  try { _fabCapturas = {}; } catch (e) {}
}



function fabMaterialesDatos() {
  var f = _fabMatFirma();
  return (_fabMatCache && _fabMatCache.firma === f) ? _fabMatCache.datos : null;
}

function fabMaterialesCargar() {
  var f = _fabMatFirma();
  if (!f) return Promise.resolve(null);
  if (_fabMatCache && _fabMatCache.firma === f) return Promise.resolve(_fabMatCache.datos);
  return _fabDeps().then(function(dep) {
    var info = _fabCaso();
    if (info.error) return null;
    var L = laminasCobre.crear(dep, { cat: info.cat, programa: true });
    var d = L.materiales(info.caso, _fabMaterialesOp(info));



    _fabMatCache = { firma: _fabMatFirma(),
                     datos: { cobre: d.cobre, perneria: d.perneria,
                              notas: d.notas, metros: d.metros, piezas: d.piezas } };
    return _fabMatCache.datos;
  });
}

var _fabImprimiendo = false;
function imprimirFabricacion() {




  var total = _fabHojasEsperadas;
  var hojas = _fabParaImprimir.filter(function(x) { return !!x; });
  if (!total || hojas.length !== total) {
    if (typeof _avisoFlotante === 'function') {
      _avisoFlotante(hojas.length
        ? ('Faltan hojas por armar (' + hojas.length + ' de ' + (total || '?') + '). Probá de nuevo en unos segundos.')
        : 'Las hojas todavía se están armando.');
    }
    return;
  }
  if (_fabImprimiendo) return;                                         
  _fabImprimiendo = true;
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
    '@page { size: A4 landscape; margin: 0; }' +
    'html, body { margin: 0; padding: 0; background: #fff; ' +
    '  -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
    '.h { position: relative; width: 100vw; height: 100vh; page-break-after: always; }' +
    '.h:last-child { page-break-after: auto; }' +
    '.h svg { position: absolute; left: 10mm; top: 10mm; width: calc(100% - 20mm); ' +
    '  height: calc(100% - 20mm); }' +
    '</style></head><body>' +
    hojas.map(function(svg) { return '<div class="h">' + svg + '</div>'; }).join('') +
    '</body></html>';
  guardarPdfHtml(nombreArchivoDoc('fabricacion'), html, function() { _fabImprimiendo = false; });
}

function _renderFabricacion() {
  var grid = document.getElementById('fab_grid');
  if (!grid) return;
  _fabParaImprimir = [];
  _fabHojasEsperadas = 0;
  var info = _fabCaso();
  if (info.error) {
    grid.innerHTML = '<div class="modo-vacio">' + _fabEsc(info.error) + '</div>';
    return;
  }
  var mia = ++_fabEpoca;
  grid.innerHTML = '<div class="modo-vacio">Preparando las hojas…</div>';
  _fabDeps().then(function(dep) {
    if (mia !== _fabEpoca) return;                                  
    var hojas = _fabHojas(dep, info), meta = _fabMeta(info, hojas.length);
    _fabHojasEsperadas = hojas.length;
    grid.innerHTML = '';

    hojas.forEach(function(h, i) {
      var sec = document.createElement('section');
      sec.className = 'fab-hoja';
      var pie = document.createElement('div');
      pie.className = 'fab-pie';
      pie.textContent = 'Hoja ' + (i + 1) + ' de ' + hojas.length + ' · ' + h.pagina;
      var papel = document.createElement('div');
      papel.className = 'fab-papel';
      sec.appendChild(papel);
      sec.appendChild(pie);
      grid.appendChild(sec);

      var m = Object.assign({}, meta, {
        pagina: h.pagina, hoja: String(i + 1), escala: h.escala || '',
        plano: (meta.base ? meta.base + '-' : '') + h.cod
      });
      function poner(F) {
        if (mia !== _fabEpoca) return;
        F.logo = './ProTAB_files/table-xd-report.svg';
        var C = { l1: h.l1, l2: h.l2, alt: h.pagina, pxPorMm: h.pxPorMm, cotas: h.cotas };
        if (F.png) C.recorte = F.png.recorte;


        var _ids = function(t) {
          return t.replace(/id="fl"/g, 'id="fl' + i + '"').replace(/url\(#fl\)/g, 'url(#fl' + i + ')');
        };
        _fabParaImprimir[i] = _ids(hojaProtab.componer(C, m, F).svg);
        C.sinCajetin = true;





        papel.innerHTML = _ids(hojaProtab.componer(C, m, F).svg);
      }
      function fallo(e) {
        if (mia !== _fabEpoca) return;
        papel.innerHTML = '<div class="fab-error">No se pudo armar esta hoja: ' +
                          _fabEsc(e && e.message || e) + '</div>';
      }
      try {
        if (h.png) {
          papel.innerHTML = '<div class="fab-espera">Sacando la vista isométrica del visor 3D…</div>';
          h.png().then(function(cap) { poner({ png: cap }); }, fallo);
        } else {
          var svg = h.svg();
          if (svg) poner({ svg: svg });
          else papel.innerHTML = '<div class="fab-espera">' + _fabEsc(h.vacio || 'Nada que dibujar.') + '</div>';
        }
      } catch (e) { fallo(e); }
    });



    var faltan = [];
    if (info.hayIG && !info.conC1)
      faltan.push('El <b>C1 al IG</b> desplegado: sube hasta el borne de este IG, y el dibujo ' +
        'no trae dónde cae ese borne. Se ve montado en la hoja 1.');
    if (info.sinModelo) faltan.push('Los <b>' + info.sinModelo + ' conectores de Mod2/CM Reg</b> ' +
      'y su taladro en las barras: todavía no tienen pieza modelada.');
    var cont = document.getElementById('panel_busbar_container');
    if (cont && cont.querySelector('.bar-n-seg, .bar-pea-seg'))
      faltan.push('Las <b>barras N y PE aislada</b>, las acostadas de abajo.');
    faltan.push('Las <b>cotas de plegado</b> de la S, los soportes y la placa, que en el manual ' +
      'van cada una en su lámina, y el <b>PDF</b> de estas hojas.');
    var sec = document.createElement('section');
    sec.className = 'fab-faltan';
    sec.innerHTML = '<b>Lo que este plano todavía no trae</b><ul><li>' +
                    faltan.join('</li><li>') + '</li></ul>';
    grid.appendChild(sec);
  }).catch(function(e) {
    if (mia !== _fabEpoca) return;
    grid.innerHTML = '<div class="modo-vacio">No se pudo preparar el plano de fabricación: ' +
      _fabEsc(e && e.message || e) + '</div>';
  });
}
