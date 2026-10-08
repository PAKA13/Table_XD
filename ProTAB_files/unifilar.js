

























var UNI_ESC = 2.5;                                                        


var _UNI = {
  ROT_ALTO: 9, ROT_INTERLINEA: 1.25, ROT_ANCHO_LETRA: 0.58,
  TOP: 2, PASO: 40, BUS_A_ITM: 50, ITM_A_DIF: 28.5, ANCHO_BUS: 2.16,
  IG_A_BUS: 135, DESP_IG: 62, CAJA_AIRE: 12, ESPACIO_EQUIPOS: 90,
  SAL_AIRE: 6, EXTRA_AIRE: 18, ELI_FUERA: 20, ELI_RX: 5, ELI_RY: 14, SEP_N: 28, MARGEN: 8
};

function _uniF(v) { return (+v).toFixed(2); }
function _uniEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}





var _uniCtxTxt = null;
function _uniAnchoTxt(t, letra) {
  t = String(t || '');
  if (!t) return 0;
  if (_uniCtxTxt === null) {
    try { _uniCtxTxt = (typeof document !== 'undefined') ? document.createElement('canvas').getContext('2d') : false; }
    catch (e) { _uniCtxTxt = false; }
  }
  if (_uniCtxTxt) {
    _uniCtxTxt.font = '300 ' + letra + 'px Arial, Helvetica, sans-serif';
    return _uniCtxTxt.measureText(t).width + 0.4 * t.length;
  }
  return t.length * letra * _UNI.ROT_ANCHO_LETRA * 1.1;
}
var _UNI_TXT = 'font-family="Arial, Helvetica, sans-serif" font-weight="300" fill="#000" stroke="none"';












function _uniSinTramos(p) {
  if (p._sinTramos != null) return p._sinTramos;
  var e = p.con && p.con.entrada, s = p.con && p.con.salida, cuerpo = p.cuerpo;
  if (e && s && Math.abs(e[1] - s[1]) < 0.5) {
    cuerpo = cuerpo.replace(/<path[^>]*\bd="([^"]*)"[^>]*\/>/g, function(tag, d, off) {

      var antes = cuerpo.slice(0, off);
      if ((antes.match(/<g[^>]*transform=/g) || []).length > (antes.match(/<\/g>/g) || []).length) return tag;
      if (/[^MLml\d\s.,-]/.test(d)) return tag;
      var sub = d.split(/(?=[Mm])/), fuera = sub.length > 0;
      sub.forEach(function(sp) {
        var n = (sp.match(/-?\d+(?:\.\d+)?/g) || []).map(parseFloat);
        if (n.length < 4) { fuera = false; return; }
        var izq = true, der = true;
        for (var i = 0; i < n.length; i += 2) {
          if (Math.abs(n[i + 1] - e[1]) > 0.5) { fuera = false; return; }
          if (n[i] > e[0] + 0.05) izq = false;
          if (n[i] < s[0] - 0.05) der = false;
        }
        if (!izq && !der) fuera = false;
      });
      return fuera ? '' : tag;
    });
  }
  p._sinTramos = cuerpo;
  return cuerpo;
}

function _uniPieza(clave, x, y, con, attrs, texto) {
  var p = (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB[clave] : null;
  if (!p) return '';
  var c = (con && p.con[con]) ? p.con[con] : [0, 0];
  var cuerpo = /^(itm|dif)/.test(clave) ? _uniSinTramos(p) : p.cuerpo;
  if (attrs) {
    Object.keys(attrs).forEach(function(k) {
      cuerpo = cuerpo.replace(new RegExp('(<tspan id="' + k + '">)[^<]*(</tspan>)', 'g'),
                              '$1' + _uniEsc(attrs[k]) + '$2');
    });
  }
  if (texto != null) {
    cuerpo = cuerpo.replace(/(<text[^>]*>)[\s\S]*?(<\/text>)/, '$1' + _uniEsc(texto) + '$2');
  }
  return '<g data-bloque="' + p.bloque + '" transform="translate(' + _uniF(x - c[0]) + ' ' +
         _uniF(y - c[1]) + ')">' + cuerpo + '</g>';
}















var _uniCtsGeoCache = null;
function _uniCtsGeo() {
  var p = (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB['contactor-timer-selector'] : null;
  if (!p) return null;
  if (_uniCtsGeoCache && _uniCtsGeoCache.p === p) return _uniCtsGeoCache;
  var der = (p.con && p.con.contacto_der_sobre_cable) || [21.22, 46.32];
  var izq = (p.con && p.con.contacto_izq) || [0.9, 38.92];
  var k = der[1] / 46.32;
  _uniCtsGeoCache = {
    p: p, k: k,
    xDer: der[0], yCable: der[1], xIzq: izq[0], yContacto: izq[1],
    finTimer: 9.66 * k, cortaTimer: 9.7 * k,
    sel0: 16.11 * k, sel1: 30.45 * k, cortaSel0: 16 * k, cortaSel1: 30.5 * k,
    cortaContacto: 38 * k,
    xMando: 11.06 * k, tocaContacto: 42.61 * k
  };
  return _uniCtsGeoCache;
}


function _uniEsTramoCable(s, yc) {
  var m = s.match(/\bd="M\s*(-?[\d.]+)[ ,](-?[\d.]+)\s*L\s*(-?[\d.]+)[ ,](-?[\d.]+)\s*"/);
  return !!(m && Math.abs(parseFloat(m[2]) - yc) < 0.02 && Math.abs(parseFloat(m[4]) - yc) < 0.02);
}








function _uniMandoGeo() {
  var p = (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB['mando-timer-selector-botonera'] : null;
  if (!p || !p.con || !p.con.contacto_der_sobre_cable) return null;
  var der = p.con.contacto_der_sobre_cable, izq = p.con.contacto_izq || der;

  var mt = p.cuerpo.match(/<g id="timer" transform="translate\((-?[\d.]+)[ ,]/);
  var mw = p.cuerpo.match(/<g id="timer"[^>]*>\s*<path[^>]*d="M0 0L(-?[\d.]+) 0/);
  var timerDer = (mt ? parseFloat(mt[1]) : 44.03) + (mw ? parseFloat(mw[1]) : 17.67);


  var mb = p.cuerpo.match(/<g id="botonera" transform="translate\((-?[\d.]+)/);
  var ms = p.cuerpo.match(/<g id="selector-am">\s*<path[^>]*d="M\s*(-?[\d.]+)/);
  var mc = p.cuerpo.match(/<g transform="translate\((-?[\d.]+)[ ,]-?[\d.]+\)">\s*<path[^>]*d="M\s*(-?[\d.]+)/);
  var bIzq = mb ? parseFloat(mb[1]) : 0;
  var sinIzq = Math.min(ms ? parseFloat(ms[1]) : izq[0], mc ? parseFloat(mc[1]) + parseFloat(mc[2]) : izq[0]);
  return { p: p, xDer: der[0], yCable: der[1], xIzq: izq[0],
           arriba: der[1] - (p.vb[1] + 3), timerDer: timerDer,
           izqBot: izq[0] - bIzq, izqSin: izq[0] - sinIzq };
}

function _uniMandoIzq(c) {
  var M = _uniMandoGeo();
  if (!M) return 0;
  return c.botonera ? M.izqBot : Math.max(0, M.izqSin);
}




function _uniUsaMando(c) {
  return !!(c && c.contactor && c.pulsador && c.selector && (c.timer || c.botonera) && _uniMandoGeo());
}

function _uniMandoSelDer(M) {
  var ms = M.p.cuerpo.match(/<g id="selector-am">\s*<path[^>]*d="M\s*-?[\d.]+[ ,]-?[\d.]+L\s*(-?[\d.]+)/);
  return ms ? parseFloat(ms[1]) : 37.3;
}
function _uniMando(xR, y, c) {
  var M = _uniMandoGeo();
  var cuerpo = M.p.cuerpo;



  var bDer = null, sDer = null;
  if (!c.botonera) {
    var mb = cuerpo.match(/<g id="botonera" transform="translate\((-?[\d.]+)[ ,]/);
    var mr = cuerpo.match(/<g id="botonera"[\s\S]*?<rect[^>]*\bwidth="([\d.]+)"/);
    bDer = (mb ? parseFloat(mb[1]) : 0) + (mr ? parseFloat(mr[1]) : 15.55);
    cuerpo = cuerpo.replace(/<g id="botonera"[\s\S]*?<\/g>\s*<\/g>/, '');
  }
  if (!c.timer) {
    sDer = _uniMandoSelDer(M);
    cuerpo = cuerpo.replace(/<g id="timer"[^>]*>[\s\S]*?<\/g>/, '');
  }
  if (bDer !== null || sDer !== null) {
    cuerpo = cuerpo.replace(/(<path[^>]*\bd=")([^"]*)(")/g, function(t, a, d, b) {
      var sub = d.split(/(?=M)/).filter(function(sp) {
        var n = (sp.match(/-?\d+(?:\.\d+)?/g) || []).map(parseFloat);
        if (n.length < 2) return true;
        if (bDer !== null && Math.abs(n[0] - bDer) < 0.05) return false;
        if (sDer !== null && Math.abs(n[0] - sDer) < 0.05) return false;
        return true;
      });
      return a + sub.join('') + b;
    });
    cuerpo = cuerpo.replace(/<path[^>]*d="\s*"[^>]*\/>/g, '');
  }

  cuerpo = cuerpo.replace(/<path[^>]*\/>/g, function(t) { return _uniEsTramoCable(t, M.yCable) ? '' : t; });



  if (c.rotulo) {
    cuerpo += '<text x="' + _uniF(M.xDer + 1.5) + '" y="' + _uniF(M.yCable - 3) + '" text-anchor="start" ' +
              _UNI_TXT + ' font-size="' + _UNI.ROT_ALTO + '" letter-spacing="0.4">' +
              _uniTs('rotulo', _rotuloK(c.rotulo)) + '</text>';
  }
  return '<g data-bloque="' + (c.timer && c.botonera ? M.p.bloque
                               : (c.timer ? 'MANDO_TIMER_SELECTOR' : 'MANDO_SELECTOR_BOTONERA')) + '" transform="translate(' +
         _uniF(xR - M.xDer) + ' ' + _uniF(y - M.yCable) + ')">' + cuerpo + '</g>';
}


function _uniMandoDer(c) {
  var M = _uniMandoGeo();
  if (!M) return 0;
  var k = c.rotulo ? _uniAnchoTxt(_rotuloK(c.rotulo), _UNI.ROT_ALTO) : 0;


  var der = c.timer ? M.timerDer : (_uniMandoSelDer(M) + 6);
  return Math.max(der - M.xDer, 1.5 + k);
}

var _uniCtsPartes = null;
function _uniCtsPartes_() {
  var G = _uniCtsGeo();
  if (!G) return null;
  if (_uniCtsPartes && _uniCtsPartes.p === G.p) return _uniCtsPartes;
  var p = G.p;
  var partes = { p: p, timer: '', selector: '', contacto: '' };




  var el, re = /<path[^>]*\/>|<circle[^>]*\/>|<text[^>]*>[\s\S]*?<\/text>/g;
  while ((el = re.exec(p.cuerpo))) {
    var s = el[0], ys = [];
    if (/^<text/.test(s)) {
      ys.push(parseFloat((s.match(/\by="([-\d.]+)"/) || [0, 0])[1]));
    } else if (/^<circle/.test(s)) {
      var cy = parseFloat((s.match(/\bcy="([-\d.]+)"/) || [0, 0])[1]);
      var r = parseFloat((s.match(/\br="([-\d.]+)"/) || [0, 0])[1]);
      ys.push(cy - r, cy + r);
    } else if (_uniEsTramoCable(s, G.yCable)) {
      continue;
    } else {
      var nums = ((s.match(/\bd="([^"]*)"/) || ['', ''])[1].match(/-?\d+(?:\.\d+)?/g) || []).map(parseFloat);
      for (var i = 1; i < nums.length; i += 2) ys.push(nums[i]);
    }
    if (!ys.length) continue;
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    if (y1 <= G.cortaTimer) partes.timer += s;
    else if (y0 >= G.cortaContacto) partes.contacto += s;
    else if (y0 >= G.cortaSel0 && y1 <= G.cortaSel1) partes.selector += s;

  }
  _uniCtsPartes = partes;
  return partes;
}




function _uniTimerSoloBaja(c) {
  if (!c || !c.timer || c.pulsador) return 0;
  var G = _uniCtsGeo(), M = _uniMandoGeo();
  return (G && M) ? Math.max(0, G.yCable - M.yCable) : 0;
}






function _uniBotoneraSola(c) {
  return !!(c && c.pulsador && !c.selector && c.botonera);
}
function _uniBotoneraGeo() {
  var G = _uniCtsGeo(), M = _uniMandoGeo();
  var b = (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB['botonera-doble'] : null;
  if (!G || !b) return null;
  var mr = b.cuerpo.match(/<rect[^>]*\bwidth="([\d.]+)"[^>]*\bheight="([\d.]+)"/);
  var w = mr ? parseFloat(mr[1]) : 15.55, h = mr ? parseFloat(mr[2]) : 10.21;
  var k = 1;
  if (M) {
    var ms = M.p.cuerpo.match(/<g id="selector-am">\s*<path[^>]*d="M\s*-?[\d.]+[ ,](-?[\d.]+)L\s*-?[\d.]+[ ,]-?[\d.]+L\s*-?[\d.]+[ ,](-?[\d.]+)/);
    var hSelM = ms ? (parseFloat(ms[2]) - parseFloat(ms[1])) : 0;
    if (hSelM > 0) k = (G.sel1 - G.sel0) / hSelM;
  }
  var cy = (G.sel0 + G.sel1) / 2;
  return { cuerpo: b.cuerpo, k: k, w: w * k, h: h * k, x0: G.xMando - w * k / 2,
           top: cy - h * k / 2, bot: cy + h * k / 2 };
}

function _uniCtsAlto(c) {
  if (_uniUsaMando(c)) return _uniMandoGeo().arriba;
  var G = _uniCtsGeo();
  if (!G) return 0;
  var B = _uniBotoneraSola(c) ? _uniBotoneraGeo() : null;
  var top = c.timer ? _uniTimerSoloBaja(c) : (c.pulsador ? (B ? B.top : G.sel0) : G.yContacto);
  return G.yCable - top;
}
function _uniCts(xR, y, c) {
  if (_uniUsaMando(c)) return _uniMando(xR, y, c);
  var P = _uniCtsPartes_(), G = _uniCtsGeo();
  if (!P || !G) return '';
  var cuerpo = P.contacto;
  var l = function(a, b) {
    return '<path class="s2" d="M' + _uniF(G.xMando) + ' ' + _uniF(a) + 'L' + _uniF(G.xMando) + ' ' + _uniF(b) + '"/>';
  };
  var B = _uniBotoneraSola(c) ? _uniBotoneraGeo() : null;
  if (c.pulsador) {
    if (B) {
      cuerpo += '<g transform="translate(' + _uniF(B.x0) + ' ' + _uniF(B.top) + ') scale(' + _uniF(B.k) + ')">' +
                B.cuerpo + '</g>' + l(B.bot, G.tocaContacto);
    } else {
      cuerpo += P.selector + l(G.sel1, G.tocaContacto);
    }
  }
  var bajaT = _uniTimerSoloBaja(c);
  if (c.timer) {
    cuerpo += (bajaT ? '<g transform="translate(0 ' + _uniF(bajaT) + ')">' + P.timer + '</g>' : P.timer) +
              l(G.finTimer + bajaT, c.pulsador ? (B ? B.top : G.sel0) : G.tocaContacto);
  }





  if (c.rotulo) {
    var kRot = _rotuloK(c.rotulo);
    var itmP = (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB.itm : null;
    var yRotItm = itmP ? parseFloat((itmP.cuerpo.match(/<text[^>]*\by="([-\d.]+)"/) || [0, NaN])[1]) : NaN;
    var sobre = (itmP && !isNaN(yRotItm)) ? (itmP.con.entrada[1] - yRotItm) : 10.56;
    var conMando = !!(c.timer || c.pulsador);
    var kx = conMando ? (G.xDer + 1.5) : ((G.xIzq + G.xDer) / 2);
    cuerpo += '<text x="' + _uniF(kx) + '" y="' + _uniF(G.yCable - sobre) + '" text-anchor="' + (conMando ? 'start' : 'middle') + '" ' +
              _UNI_TXT + ' font-size="' + _UNI.ROT_ALTO + '" letter-spacing="0.4">' + _uniTs('rotulo', kRot) + '</text>';
  }

  return '<g data-bloque="' + (c.timer ? 'CONTACTOR_TIMER' : 'CONTACTOR') +
         (c.pulsador ? (B ? '_BOTONERA' : '_SELECTOR') : '') + '" transform="translate(' + _uniF(xR - G.xDer) + ' ' +
         _uniF(y - G.yCable) + ')">' + cuerpo + '</g>';
}


function _uniDims() {
  var gab = window._gabineteData || {};
  var marco = document.getElementById('marco_gabinete');
  var dims = window._vistaFrontalDims || null;
  if (!dims && marco) dims = { w: parseFloat(marco.style.width) || 750, h: parseFloat(marco.style.height) || 750 };
  if (window._vistaActual !== 'lateral' && marco) {                                                             
    dims = { w: parseFloat(marco.style.width) || dims.w, h: parseFloat(marco.style.height) || dims.h };
  }
  if (!dims) return null;
  return { alto: Math.round(dims.h * PX_TO_MM), ancho: Math.round(dims.w * PX_TO_MM),
           prof: Math.round((gab.profGabMm || 120) + (gab.profPuertaMm || 0)) };
}



function _uniTcPrimario(amp) { return tcPrimarioNormalizado(amp); }                 



function _uniDpsPieza(dps, conN) {
  var pd = parseInt(dps && dps.polos, 10) || 2;


  var nf = Math.max(1, Math.min(3, conN ? pd - 1 : pd));
  var o = (typeof _dpsDatos === 'function') ? _dpsDatos(dps) : null;
  return { pieza: nf === 3 ? 'dps' : (nf === 2 ? 'dps-2f' : 'dps-1f'), fases: nf + 'F',
           tipo: o ? o.tipo : '', corriente: o ? _dpsCorrienteKa(o) : '', up: o ? o.up : '' };
}

function _uniDatos() {
  var pb = window._panelBusbarData || {}, gab = window._gabineteData || {}, ig = window._igData;
  var fm = (typeof _fichaDatos === 'function') ? _fichaDatos() : {};
  var meta = window._unifilarMeta || {};
  var fases = pb.fases || '3F';
  var nF = parseInt(fases, 10) || 3;
  var conN = /\+N/.test(fases);

  var tierra = _tierraConfigurada(pb);



  var conBarraN = conN && pb.barraN !== 'ninguno';
  var sinEsp = function(t) { return String(t || '').replace(/\s+/g, ''); };

  var nombreProy = '';
  try {
    var pm = PM.meta();
    for (var i = 0; i < (pm.projects || []).length; i++)
      if (pm.projects[i].id === pm.activeId) nombreProy = pm.projects[i].name || '';
  } catch (e) {}
  var tab = window._TABLERO || {};

  var itms = ((typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || [])).slice();
  itms.sort(typeof _senalOrden === 'function' ? _senalOrden : function() { return 0; });
  var grupos = (typeof _bornerasGrupos === 'function') ? _bornerasGrupos() : [];
  var salidas = meta.salidas || {};






  var dps = [];
  itms = itms.filter(function(it) {
    if (!it.libre) return true;



    if (!it.dps) {
      var salL = salidas[it.id] || salidas[it.rotulo] || {};
      dps.push({ id: it.id, rotulo: it.rotulo || '', polos: parseInt(it.polos, 10) || 1,
                 capacidad: it.capacidad || '', reserva: it.tipo === 'reserva', sinDps: true,
                 destino: (salL.destino && salL.destino.length) ? salL.destino
                          : [_uniDestinoDefecto(it.rotulo, it.tipo === 'reserva')] });
      return false;
    }
    var pzD = _uniDpsPieza(it.dps, conN);
    dps.push({ id: it.id, rotulo: it.rotulo || '', polos: parseInt(it.polos, 10) || 1,
               capacidad: it.capacidad || '', reserva: it.tipo === 'reserva',
               pieza: pzD.pieza, fases: pzD.fases,
               tipo: pzD.tipo, corriente: pzD.corriente, up: pzD.up });
    return false;
  });

  var circuitos = itms.map(function(it) {
    var polos = parseInt(it.polos, 10) || 1;
    var reserva = it.tipo === 'reserva';



    var dpsFila = null;
    if (it.dps && !it.libre) {
      dpsFila = _uniDpsPieza(it.dps, conN);
    }


    var sal = salidas[it.id] || salidas[it.rotulo] || {};


    var ctxC = { conN: conN, tierra: tierra };
    var salR = dpsFila ? null : uniSalida(it, sal, ctxC);
    var cableC = salR ? salR.cable : '';
    return {
      id: it.id,
      rotulo: it.rotulo || '',
      polos: polos,
      capacidad: it.capacidad || '',

      regulacion: it.tipo === 'cm_reg' ? (it.regulacion || null) : null,
      reserva: reserva,

      cm: it.tipo === 'cm_fijo' || it.tipo === 'cm_reg',
      dif: it.dif ? { polos: parseInt(it.dif.polos, 10) || polos, capacidad: it.dif.corriente || '',
                      sensibilidad: it.dif.sensibilidad || '', reserva: it.dif.tipo === 'reserva' } : null,
      contactor: !!it.contactor,


      timer: (typeof _timerComprado === 'function')
        ? _timerComprado(_timerDe(it.id))
        : grupos.some(function(g) { return g.clase === 'timer' && g.origen === it.id; }),
      pulsador: !!it.pulsador,

      selector: !!(it.pulsador && typeof _pulsadorSelectorOn === 'function' && _pulsadorSelectorOn(it)),
      botonera: !!(it.pulsador && (typeof _pulsadorBotoneraOn !== 'function' || _pulsadorBotoneraOn(it))),




      usaN: !dpsFila && conBarraN && polos === 1,


      polosCable: conN ? Math.max(polos, it.dif ? (parseInt(it.dif.polos, 10) || 0) : 0) : polos,
      cable: cableC,

      tubo: salR && cableC ? salR.tubo : '',
      destino: dpsFila ? [] : ((sal.destino && sal.destino.length) ? sal.destino : [_uniDestinoDefecto(it.rotulo, reserva)]),
      destinoPropio: !!(sal.destino && sal.destino.length),


      tablero: dpsFila ? '' : (sal.tablero || ''),




      extra: (function() {
        var xs = sal.extra;
        if (!xs || dpsFila) return null;
        var desde = (xs.desde === 'contactor' && it.contactor) ? 'contactor'
                  : (xs.desde === 'dif' && it.dif) ? 'dif'
                  : (xs.desde === 'itm') ? 'itm' : (it.dif ? 'dif' : 'itm');
        var exR = uniSalidaExtra(it, sal, ctxC, salR, desde);
        return { desde: desde, cable: exR.cable, tubo: exR.cable ? exR.tubo : '',

                 destino: (xs.destino && xs.destino.length) ? xs.destino
                          : ((sal.destino && sal.destino.length) ? sal.destino : [_uniDestinoDefecto(it.rotulo, reserva)]),
                 tablero: xs.tablero || '' };
      })(),
      dpsFila: dpsFila
    };
  });

  return {
    tipo: gab.tipo === 'empotrado' ? 'EMPOTRADO' : 'ADOSADO',
    ip: gab.ip ? ('IP' + String(gab.ip).replace(/^IP\s*/i, '')) : '',


    sistema: sinEsp(fm.tension) + ', ' + nF + 'Ø' + (conN ? '+N' : '') + (tierra ? '+T' : '') +
             (fm.frecuencia ? ', ' + sinEsp(fm.frecuencia) : ''),
    dims: _uniDims(),
    nombre: tab.abreviatura || tab.nombre || nombreProy || 'TABLERO',



    nombreLargo: (function() {
      var n = String(tab.nombre || nombreProy || '').trim();
      return (tab.abreviatura && n && n.toUpperCase() !== String(tab.abreviatura).toUpperCase()) ? n.toUpperCase() : '';
    })(),
    polos: _pbPolosEfectivos(pb) || '',



    rotBus: { sistema: (fases === '3F+N' && typeof _pbBarraConNeutro === 'function' &&
                        !_pbBarraConNeutro(pb)) ? '3F' : fases },
    ig: ig ? { cm: ig.tipo !== 'riel', polos: ig.polos, corriente: ig.corriente,
               regulacion: ig.tipo === 'cm_reg' ? (ig.regulacion || null) : null } : null,
    pilotos: (window._PILOTOS_LEDS || 0) > 0 && nF === 3,


    medidor: (typeof _medidorInfo === 'function') ? _medidorInfo().hay : !!window._MEDIDOR,
    tc: (typeof _medidorInfo === 'function')
      ? { cantidad: _medidorInfo().nTc, primario: _medidorInfo().primario, secundario: _medidorInfo().secundario }
      : { cantidad: nF, primario: _uniTcPrimario(ig && ig.corriente), secundario: 5 },


    neutro: conBarraN && circuitos.some(function(c) {
      return !c.dpsFila && (c.usaN || (c.dif && (parseInt(c.dif.polos, 10) || 0) > (parseInt(c.polos, 10) || 0)));
    }),
    tierra: tierra,



    tierraAis: tierra && _hayBarraPEA(pb),


    dosTierras: tierra && _hayBarraPEA(pb) && _hayBarraPE(pb),

    chasisAis: _tierraAisladaAlChasis(pb),
    entrada: (function() {
      var me = meta.entrada || {};



      var en = uniEntrada(me, ig, nF, conN, tierra);
      var patOn = en.pat, cab = en.cable, patCab = en.patCable;
      return { cable: cab,
               tubo: en.tubo,
               origen: me.origen || 'VIENE DE RED',
               mostrarOrigen: me.mostrarOrigen !== false,
               contador: !!me.contador,
               contadorCodigo: me.contadorCodigo || 'M-1',
               contadorFases: nF + 'F' + (conN ? '+N' : ''),
               pat: patOn,
               patRotulo: (me.patRotulo && me.patRotulo.length) ? me.patRotulo : ['PAT-01', '25 ohm'],
               patCable: patCab,
               patTubo: en.patTubo };
    })(),
    circuitos: circuitos,
    dps: dps
  };
}






function _uniCaja(bloque, lado, w, h, letra, lineas) {

  var borde = (lado === 'izq')
    ? 'M' + _uniF(w) + ' 0L' + _uniF(w) + ' ' + _uniF(h) + 'L0 ' + _uniF(h)
    : 'M0 0L0 ' + _uniF(h) + 'L' + _uniF(w) + ' ' + _uniF(h);
  var txt = lineas.map(function(ln) {
    return '<text x="' + _uniF(w / 2) + '" y="' + _uniF(ln.y) + '" text-anchor="middle" ' + _UNI_TXT +
           ' font-size="' + (ln.letra || letra) + '" letter-spacing="0.3">' + ln.html + '</text>';
  }).join('');
  return { bloque: bloque, w: w, h: h, svg: function(x, y) {
    return '<g data-bloque="' + bloque + '" transform="translate(' + _uniF(x) + ' ' + _uniF(y) + ')">' +
           '<path class="s1" d="' + borde + '"/>' + txt + '</g>';
  } };
}
function _uniTs(id, v) { return '<tspan id="' + id + '">' + _uniEsc(v) + '</tspan>'; }

function _uniPilas(D) {
  var ancho = function(textos, letra, min) {
    return Math.max(min, Math.max.apply(null, textos.map(function(t) { return _uniAnchoTxt(t, letra); })) + 10);
  };
  var dm = D.dims || { alto: '', ancho: '', prof: '' };
  var tIzq = ['TAB ' + D.tipo + (D.ip ? '-' + D.ip : ''), D.sistema,
              'DIMENSIONES:', dm.alto + ' x ' + dm.ancho + ' x ' + dm.prof + 'mm'];
  var wI = ancho(tIzq, 7, 60);
  var izq = [
    _uniCaja('CAJA_DATOS', 'izq', wI, 23.5, 7, [
      { y: 10.04, html: 'TAB ' + _uniTs('tipo', D.tipo) + (D.ip ? '-' + _uniTs('ip', D.ip) : '') },
      { y: 18.79, html: _uniTs('sistema', D.sistema) }]),
    _uniCaja('CAJA_DIMENSIONES', 'izq', wI, 23.5, 7, [
      { y: 10.04, html: 'DIMENSIONES:' },
      { y: 18.79, html: _uniTs('alto', dm.alto) + ' x ' + _uniTs('ancho', dm.ancho) + ' x ' +
                        _uniTs('prof', dm.prof) + 'mm' }])
  ];
  var wD = Math.max(ancho([D.nombre], 12, 50), ancho([D.polos + ' POLOS'], 9, 50),
                    D.nombreLargo ? ancho([D.nombreLargo], 7, 50) : 0);


  var der = [D.nombreLargo
    ? _uniCaja('CAJA_NOMBRE', 'der', wD, 31, 12, [
        { y: 10.3, html: _uniTs('tablero', D.nombreLargo), letra: 7 },
        { y: 25.2, html: _uniTs('nombre', D.nombre) }])
    : _uniCaja('CAJA_NOMBRE', 'der', wD, 23, 12, [{ y: 16.06, html: _uniTs('nombre', D.nombre) }])];
  der.push(_uniCaja('CAJA_POLOS', 'der', wD, 17.25, 9, [{ y: 12.04, html: _uniTs('polos', D.polos) + ' POLOS' }]));
  var alto = function(l) { return l.reduce(function(a, c) { return a + c.h; }, 0); };
  return { izq: izq, der: der, wI: wI, wD: wD, altoI: alto(izq), altoD: alto(der) };
}





function _uniDestinoDefecto(rotulo, reserva) {
  if (reserva) return 'RESERVA';
  var m = /(\d+)/.exec(rotulo || '');
  return m ? 'CIRCUITO ' + parseInt(m[1], 10) : 'CIRCUITO';
}










var _UNI_SECCIONES = [
  [16, 2.5], [20, 4], [32, 6], [40, 10], [63, 16], [80, 25], [100, 35],
  [125, 50], [160, 70], [200, 95], [250, 120], [315, 185], [400, 240]
];
var _UNI_NORMALES = [2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];




function _uniSeccion(a) {
  for (var k = 1; k <= 8; k++) {
    for (var i = 0; i < _UNI_SECCIONES.length; i++) {
      if (a / k <= _UNI_SECCIONES[i][0]) return { k: k, sec: _UNI_SECCIONES[i][1] };
    }
  }
  return null;
}


function _uniTierraSec(S) {
  if (S <= 16) return S;
  if (S <= 35) return 16;
  var h = S / 2;
  for (var i = 0; i < _UNI_NORMALES.length; i++) if (_UNI_NORMALES[i] >= h) return _UNI_NORMALES[i];
  return _UNI_NORMALES[_UNI_NORMALES.length - 1];
}






var _UNI_DIAM_N2XOH = [                                            
  [1.5, 3.3], [2.5, 3.8], [4, 4.4], [6, 5.0], [10, 6.2], [16, 7.4], [25, 9.2], [35, 10.4],
  [50, 12.0], [70, 13.9], [95, 16.1], [120, 17.9], [150, 20.0], [185, 22.3], [240, 25.4], [300, 28.3]
];
function _uniDiamConductor(sec) {
  for (var i = 0; i < _UNI_DIAM_N2XOH.length; i++) if (_UNI_DIAM_N2XOH[i][0] >= sec - 1e-6) return _UNI_DIAM_N2XOH[i][1];
  var u = _UNI_DIAM_N2XOH[_UNI_DIAM_N2XOH.length - 1];
  return u[1] * Math.sqrt(sec / u[0]);
}
function _uniConductores(txt) {
  var lista = [];
  var tok = function(t, k) {

    var re = /(?:(\d+)\s*-\s*)?(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*mm2|(\d+)\s*-\s*(\d+(?:[.,]\d+)?)\s*mm2/gi, m;
    while ((m = re.exec(t))) {
      var n = m[3] ? parseInt(m[1] || m[2], 10) : parseInt(m[4], 10);
      var sec = parseFloat((m[3] || m[5]).replace(',', '.'));
      lista.push({ n: n * k, s: sec });
    }
  };
  var resto = String(txt || '').replace(/(^|[\s+])(\d+)\(([^()]*)\)/g, function(m0, pre, k, adentro) {
    tok(adentro, parseInt(k, 10) || 1);
    return pre + ' ';
  });
  tok(resto, 1);
  return lista;
}


var _UNI_TAB_SAL = { empotrado: 'tablero-empotrado', panel: 'panel-distribucion' };
var _UNI_TAB_SAL_ALTO = 10, _UNI_TAB_SAL_AIRE = 4;
function _uniTabSal(tipo) {
  var p = tipo && (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB[_UNI_TAB_SAL[tipo]] : null;
  if (!p) return null;
  var k = _UNI_TAB_SAL_ALTO / (p.vb[3] - 6);
  return { p: p, k: k, w: (p.vb[2] - 6) * k };
}





function _uniCapReg(cap, reg) {
  var n = function(v) { return String(v).replace(/\.0+$/, ''); };
  var r = parseFloat(reg), a = parseFloat(cap);
  return (r > 0 && a > 0 && r !== a) ? n(reg) + '/' + n(cap) : cap;
}

function unifilarSvg(D) {
  D = D || _uniDatos();
  var U = _UNI, L = UNIFILAR_LIB;



  var zonas = [];
  var itmL = L.itm, difL = L.dif, cmL = L['itm-cm'], pilL = L.pilotos;
  var largoItm = itmL.con.salida[0] - itmL.con.entrada[0];                                         
  var largoDif = difL.con.salida[0] - difL.con.entrada[0];                     

  var difDer = (difL.vb[0] + difL.vb[2] - 3) - difL.con.entrada[0];


  var toroDif = 10.8;
  var C = D.circuitos, N = C.length;

  var pilas = _uniPilas(D);



  var alturas = [], acc = 0;
  for (var k = 0; k < N; k++) {



    var bajaDif = (C[k].contactor && !C[k].dif && k > 0 && C[k - 1].dif)
      ? (difL.vb[1] + difL.vb[3] - 3 - difL.con.entrada[1]) : 0;
    if (k > 0) acc += (C[k].contactor ? Math.max(U.PASO, _uniCtsAlto(C[k]) + 6 + bajaDif) : U.PASO) +

                      (C[k - 1].extra ? U.PASO : 0);
    alturas.push(acc);
  }
  var SPAN = N ? alturas[N - 1] : 0;

  var EXTRA_FIN = (N && C[N - 1].extra) ? U.PASO : 0;
  var pilSobre = pilL ? (pilL.con.punto[1] - pilL.vb[1]) : 0;
  var baseY0 = U.TOP + Math.max(pilas.altoI, pilas.altoD, 6) + 26;
  var conPil = D.pilotos ? (U.TOP + pilas.altoI + 8 + pilSobre - SPAN / 2) : 0;




  var conCts0 = (N && C[0].contactor)
    ? (U.TOP + pilas.altoD + 6 + _uniCtsAlto(C[0])) : 0;




  var conDif0 = (N && C[0].dif)
    ? (U.TOP + pilas.altoD + 6 + (difL.con.entrada[1] - difL.vb[1] - 3)) : 0;
  var Y0 = Math.max(baseY0, conPil, conCts0, conDif0);








  var nAntesDif = function(c) {
    return !!(D.neutro && c.dif && !c.dpsFila &&
              (parseInt(c.dif.polos, 10) || 0) > (parseInt(c.polos, 10) || 0));
  };
  var kbPrimero = -1;
  C.forEach(function(c, k) { if (kbPrimero < 0 && nAntesDif(c)) kbPrimero = k; });
  var cruzaCm = kbPrimero >= 0 && !!cmL && C.some(function(c, k) { return k >= kbPrimero && c.cm && !c.reserva; });
  var extraNDif = kbPrimero < 0 ? 0 : (cruzaCm ? 23 : 10);


  var hayNSalida = C.some(function(c) { return !c.dpsFila && c.usaN && !nAntesDif(c); });

  var xIn = U.ANCHO_BUS + U.BUS_A_ITM, xIout = xIn + largoItm;





  var AIRE_MANDO = 12;
  var _anchoC0 = (function() { var g = _uniCtsGeo(); return g ? (g.xDer - g.xIzq) : 20.32; })();
  var extraMandoSinDif = 0, extraMandoConDif = 0;
  C.forEach(function(c) {
    if (!_uniUsaMando(c)) return;
    var izqM = _uniMandoIzq(c);
    if (c.dif) {


      extraMandoConDif = Math.max(extraMandoConDif, AIRE_MANDO + 1.4 + _anchoC0 + izqM - 42);
    } else {
      var obst = (c.cm && !c.reserva && cmL) ? (xIn + 55.87) : xIout;
      var xDin0 = xIout + U.ITM_A_DIF + extraNDif;
      extraMandoSinDif = Math.max(extraMandoSinDif, AIRE_MANDO + izqM + obst - xDin0);
    }
  });



  var extraSalItm = C.some(function(c) {
    return c.extra && c.extra.desde === 'itm' && (c.dif || c.contactor);
  }) ? U.EXTRA_AIRE + 4 : 0;
  var xDin = xIout + U.ITM_A_DIF + extraNDif + extraMandoSinDif + extraSalItm, xDout = xDin + largoDif;
  var finRotDif = xDin + difDer;
  var xR = finRotDif + 42 + extraMandoConDif;                                    


  var LETRA_SAL = U.ROT_ALTO, LETRA_ENT = U.ROT_ALTO;





  var hayCont = C.some(function(c) { return c.contactor; });
  var hayDif = C.some(function(c) { return c.dif; });





  var _Gc = _uniCtsGeo();
  var anchoCts = _Gc ? (_Gc.xDer - _Gc.xIzq) : 20.32;
  var xRsinDif = xDin + anchoCts;                                                         
  var hayContConDif = C.some(function(c) { return c.contactor && c.dif; });
  var finEquipos = hayContConDif ? xR
    : (hayDif ? Math.max(finRotDif, hayCont ? xRsinDif : 0)
              : (hayCont ? xRsinDif : xIout));





  var salCm = cmL ? (cmL.con.salida[0] - cmL.con.entrada[0]) : largoItm;
  var bordeCm = cmL ? 55.87 : largoItm;
  var esCm = function(c) { return !!(c.cm && !c.reserva && cmL); };
  if (C.some(esCm)) finEquipos = Math.max(finEquipos, xIn + bordeCm);
  C.forEach(function(c) {

    if (_uniUsaMando(c)) finEquipos = Math.max(finEquipos, (c.dif ? xR : xRsinDif) + _uniMandoDer(c) + 8);
  });
  var DPS_F_W = 30.04, DPS_F_H = 9.77;
  C.forEach(function(c) {
    if (!c.dpsFila) return;
    var x0 = c.dif ? (xDout + 14) : xDin;
    var datosW = c.dpsFila.tipo ? _uniAnchoTxt(c.dpsFila.tipo + ' ' + c.dpsFila.corriente + 'kA', U.ROT_ALTO * 0.8) : 0;
    finEquipos = Math.max(finEquipos, x0 + DPS_F_W + 6 + datosW);
  });



  var aireExtra = C.some(function(c) { return !!c.extra; }) ? U.EXTRA_AIRE : 0;
  var bordeDer = finEquipos + (hayNSalida ? 56 : 56 - U.SEP_N) + aireExtra;




  var xMarco = bordeDer + 12;
  var maxCable = Math.max.apply(null, [0].concat(C.map(function(c) {
    return Math.max(_uniAnchoTxt(c.cable, LETRA_SAL), _uniAnchoTxt(c.tubo, LETRA_SAL),
                    c.extra ? _uniAnchoTxt(c.extra.cable, LETRA_SAL) : 0,
                    c.extra ? _uniAnchoTxt(c.extra.tubo, LETRA_SAL) : 0);
  })));


  var SALIDA_FUERA = Math.max(30, U.SAL_AIRE + maxCable + 13);
  var finCola = xMarco + SALIDA_FUERA;
  var anchoDest1 = function(sx) {
    var ts = _uniTabSal(sx.tablero);
    return (ts ? ts.w + _UNI_TAB_SAL_AIRE : 0) +
      Math.max.apply(null, [0].concat(sx.destino.map(function(t) { return _uniAnchoTxt(t, U.ROT_ALTO); })));
  };
  var anchoDestino = Math.max.apply(null, [0].concat(C.map(function(c) {
    return Math.max(anchoDest1(c), c.extra ? anchoDest1(c.extra) : 0);
  })));
  var anchoTotal = finCola + 3 + anchoDestino + 4;


  var barL = L['barra-tierra'];
  var cajaT = barL ? { x0: barL.vb[0] + 3, y0: barL.vb[1] + 3, h: barL.vb[3] - 6 } : null;
  var FILA_BARRA = cajaT ? (cajaT.h + U.ROT_ALTO * U.ROT_INTERLINEA + 6) : 0;
  var nBarras = (D.tierra ? 1 : 0) + (D.dosTierras ? 1 : 0) + (D.neutro ? 1 : 0);

  var PASO_BARRA = FILA_BARRA + 8;



  var BAJADA_T = 18;
  var ABAJO_T = (cajaT && nBarras) ? (nBarras * FILA_BARRA + 8 + (D.tierra ? BAJADA_T - 8 : 0)) : 0;
  var altoTotal = Y0 + SPAN + EXTRA_FIN + 36 + ABAJO_T;


  var ALIM = Math.max(60, 12 + U.ELI_FUERA + U.ELI_RX + 6 + _uniAnchoTxt(D.entrada.cable, LETRA_ENT) + 10);




  var patOnE = !!(D.entrada.pat && D.tierra && L['tierra-proteccion']);
  if (patOnE) {
    ALIM = Math.max(ALIM, 14 + 8 + Math.max(_uniAnchoTxt(D.entrada.patCable, LETRA_ENT),
                                            _uniAnchoTxt(D.entrada.patTubo, LETRA_ENT)) + U.CAJA_AIRE + 10);
  }
  var yIG = Y0 + SPAN / 2;











  var nDps = (D.dps || []).length;
  var extraDpsX = nDps ? (35 + 55 * (nDps - 1)) : 0;
  var hayIzq = !!(D.ig || D.pilotos || D.medidor || nDps);
  var xIGin, xIGe;
  if (hayIzq) {
    var gapBus = (D.medidor ? (U.IG_A_BUS - U.DESP_IG) : 45) + extraDpsX;
    var desp = (D.pilotos || D.medidor || nBarras) ? U.DESP_IG : 14;
    xIGe = -(gapBus + largoItm);                                             

    xIGin = Math.min(xIGe - desp, -(pilas.wI + 34) + U.CAJA_AIRE);
  } else {
    xIGin = -Math.max(pilas.wI + 34, 75) + U.CAJA_AIRE;
    xIGe = xIGin;
  }
  var cmXMax = cmL ? 55.87 : largoItm;                                                           
  var finIG = D.ig ? (xIGe + (D.ig.cm ? cmXMax : largoItm)) : xIGe;

  var out = '';
  var cable = function(x1, x2, y) {
    return '<path class="s1" d="M' + _uniF(x1) + ' ' + _uniF(y) + 'L' + _uniF(x2) + ' ' + _uniF(y) + '"/>';
  };
  var texto = function(x, y, t, letra, anc, extra) {
    return '<text x="' + _uniF(x) + '" y="' + _uniF(y) + '" text-anchor="' + (anc || 'start') + '" ' + _UNI_TXT +
           ' font-size="' + _uniF(letra) + '" letter-spacing="0.4"' + (extra || '') + '>' + t + '</text>';
  };








  var busL = L.busbar, hBus = SPAN + 40, rotBus = '';
  if (busL) {
    var yAlimLib = (busL.con && busL.con.alimentacion) ? busL.con.alimentacion[1] : null;
    if (yAlimLib == null) yAlimLib = parseFloat((busL.cuerpo.match(/<rect[^>]*\bheight="([\d.]+)"/) || [0, hBus])[1]) / 2;
    var mRot = busL.cuerpo.match(/<g id="rotulo-busbar">[\s\S]*?<\/g>/);
    if (mRot) {



      var lineasRot = mRot[0].match(/<text[\s\S]*?<\/text>/g) || [];
      var pegada = null, xPeg = -Infinity;
      lineasRot.forEach(function(t) {
        var xt = parseFloat((t.match(/\bx="([-\d.]+)"/) || [0, NaN])[1]);
        if (!isNaN(xt) && xt > xPeg) { xPeg = xt; pegada = t; }
      });
      if (pegada) {




        var txtSis = D.rotBus.sistema || '';
        var largoSis = _uniAnchoTxt(txtSis, U.ROT_ALTO) + txtSis.length * 0.4;
        var yAbajo = hBus - 2;
        var cabe = (yAbajo - largoSis) >= (hBus / 2 + 6);
        var yRot = cabe ? yAbajo
                        : (hBus / 2 - yAlimLib + parseFloat((pegada.match(/\by="([-\d.]+)"/) || [0, 0])[1]));
        var xRot = xPeg;
        rotBus = '<g id="rotulo-busbar">' +
          pegada.replace(/\sx="[-\d.]+"/, ' x="' + _uniF(xRot) + '"')
                .replace(/\sy="[-\d.]+"/, ' y="' + _uniF(yRot) + '"')
                .replace(/transform="rotate\([^)]*\)"/, 'transform="rotate(-90 ' + _uniF(xRot) + ' ' + _uniF(yRot) + ')"')
                .replace(/(<text[^>]*>)[\s\S]*(<\/text>)/,
                  '$1<tspan id="sistema">' + _uniEsc(txtSis) + '</tspan>$2') + '</g>';
      }
    }
  }
  out += '<g data-bloque="' + (busL ? busL.bloque : 'BUSBAR') + '" transform="translate(0 ' + _uniF(Y0 - 20) + ')">' +
         '<rect class="s0" x="0" y="0" width="' + U.ANCHO_BUS + '" height="' + _uniF(hBus) + '"/>' + rotBus + '</g>';


  out += '<path class="s1" d="M' + _uniF(xIGin - ALIM) + ' ' + _uniF(yIG) + 'L' + _uniF(D.ig ? xIGe : 0) + ' ' + _uniF(yIG) + '"/>';
  if (D.ig) {
    if (D.ig.cm) {
      out += _uniPieza('itm-cm', xIGe, yIG, 'entrada',
        { tipo: 'MCCB', polos: D.ig.polos, capacidad: _uniCapReg(D.ig.corriente, D.ig.regulacion) });
    } else {
      out += _uniPieza('itm', xIGe, yIG, 'entrada', { polos: D.ig.polos, capacidad: D.ig.corriente });
    }
    out += cable(xIGe + largoItm, 0, yIG);
  }


  if (D.pilotos && pilL) {
    out += _uniPieza('pilotos', xIGe - 32, yIG, 'punto',
      { faseR: 'R', faseS: 'S', faseT: 'T', polos: '3', capacidad: '2' });
  }





  if (D.medidor) {







    var LP = 48.84, f2 = _uniF;
    var rTc = 0.146 * LP / 2;
    var xPm = xIGe - 19, xTc = finIG + 0.16 * largoItm, dTc = xTc - xPm + 2 * rTc;
    var yM = 0.55 * LP, fl = 0.376 * LP, fw = 0.188 * LP;
    var mw = 0.615 * LP, mh = 0.2 * LP, letraM = 0.19 * LP;
    var tramo = Math.max(0.12 * LP, (dTc - fl - mw) / 3);
    var fx0 = tramo, fx1 = fx0 + fl, mx0 = fx1 + tramo, mx1 = mx0 + mw;
    var subida = (dTc >= mx0 + 4 && dTc <= mx1 - 4)
      ? ('M' + f2(dTc) + ' ' + f2(yM - mh / 2) + 'L' + f2(dTc) + ' 0')
      : ('M' + f2(mx1) + ' ' + f2(yM) + 'L' + f2(dTc) + ' ' + f2(yM) + 'L' + f2(dTc) + ' 0');
    var m = '<circle class="s4" style="fill:#000" cx="0" cy="0" r="2.4"/>' +
      '<path class="s2" fill="none" d="M0 0L0 ' + f2(yM) + 'L' + f2(fx0) + ' ' + f2(yM) +
        'M' + f2(fx1) + ' ' + f2(yM) + 'L' + f2(mx0) + ' ' + f2(yM) + '"/>' +
      '<path class="s2" fill="none" d="M' + f2(fx0) + ' ' + f2(yM - fw / 2) + 'L' + f2(fx1) + ' ' + f2(yM - fw / 2) +
        'L' + f2(fx1) + ' ' + f2(yM + fw / 2) + 'L' + f2(fx0) + ' ' + f2(yM + fw / 2) + 'Z' +
        'M' + f2(fx0 + fl / 4) + ' ' + f2(yM - fw / 2) + 'L' + f2(fx0 + fl / 4) + ' ' + f2(yM + fw / 2) +
        'M' + f2(fx0 + 3 * fl / 4) + ' ' + f2(yM - fw / 2) + 'L' + f2(fx0 + 3 * fl / 4) + ' ' + f2(yM + fw / 2) + '"/>' +
      '<rect class="s2" x="' + f2(mx0) + '" y="' + f2(yM - mh / 2) + '" width="' + f2(mw) + '" height="' + f2(mh) + '"/>' +
      '<text x="' + f2(mx0 + mw / 2) + '" y="' + f2(yM - mh / 2 + mh * 0.841) + '" text-anchor="middle" ' + _UNI_TXT +
        ' font-size="' + f2(letraM) + '" letter-spacing="0.6">' + _uniTs('nombre', 'MMF') + '</text>' +
      '<path class="s2" fill="none" d="' + subida + '"/>' +
      '<path class="s2" fill="none" d="M' + f2(dTc - 2 * rTc) + ' 0A' + f2(rTc) + ' ' + f2(rTc) + ' 0 0 1 ' + f2(dTc) +
        ' 0A' + f2(rTc) + ' ' + f2(rTc) + ' 0 0 1 ' + f2(dTc + 2 * rTc) + ' 0"/>' +
      '<text x="' + f2(dTc) + '" y="-15.45" text-anchor="middle" ' + _UNI_TXT + ' font-size="7.2" letter-spacing="0.4">TC/' +
        _uniTs('cantidad', D.tc.cantidad) + '</text>' +
      '<text x="' + f2(dTc) + '" y="-6.45" text-anchor="middle" ' + _UNI_TXT + ' font-size="7.2" letter-spacing="0.4">' +
        _uniTs('primario', D.tc.primario) + '/' + _uniTs('secundario', D.tc.secundario) + 'A</text>';
    out += '<g data-bloque="MEDIDOR" transform="translate(' + _uniF(xPm) + ' ' + _uniF(yIG) + ')">' + m + '</g>';
  }



  var cx0 = xIGin - U.CAJA_AIRE, cx1 = xMarco;
  var cy0 = U.TOP, cy1 = Y0 + SPAN + EXTRA_FIN + 30 + ABAJO_T;




  var DPS_W = 30.04, DPS_H = 9.77;
  var dpsBajo = 0;
  (D.dps || []).forEach(function(dp) {
    var b = dp.sinDps
      ? (U.BUS_A_ITM + largoItm + 20 + 3 + Math.max.apply(null, [0].concat((dp.destino || []).map(function(t) {
          return _uniAnchoTxt(t, U.ROT_ALTO); }))))
      : (U.BUS_A_ITM + largoItm + 14 + DPS_W);
    if (b > dpsBajo) dpsBajo = b;
  });




  if (patOnE && cajaT) {
    var faltaPat = (yIG + 52 + 55 + (D.neutro ? PASO_BARRA : 0) + (D.dosTierras ? PASO_BARRA : 0)) - cy1;
    if (faltaPat > 0) { cy1 += faltaPat; altoTotal += faltaPat; }
  }
  if (nDps) {

    var yLineaT = (cajaT && D.tierra)
      ? (cy1 - BAJADA_T - cajaT.h + barL.con.salida[1] - (D.dosTierras ? PASO_BARRA : 0)) : cy1;
    var faltaDps = (yIG + dpsBajo + 12) - yLineaT;
    if (faltaDps > 0) { cy1 += faltaDps; altoTotal += faltaDps; }
  }
  out += '<g data-bloque="GABINETE" transform="translate(' + _uniF(cx0) + ' ' + _uniF(cy0) + ')"><rect x="0" y="0" width="' +
         _uniF(cx1 - cx0) + '" height="' + _uniF(cy1 - cy0) + '" fill="none" stroke="#000" stroke-width="0.7" stroke-dasharray="8 4"/></g>';







  var nLineasEnt = (D.neutro ? 1 : 0) +
    ((D.tierra && !(D.entrada.pat && L['tierra-proteccion'])) ? (D.dosTierras ? 2 : 1) : 0);
  var eliRy = U.ELI_RY + (nLineasEnt > 2 ? 4 : 0);
  var ex = cx0 - U.ELI_FUERA, ey = yIG + (nLineasEnt > 2 ? 12 : 8);
  var ly = ey + eliRy + 14, lx = ex - 10, wO = _uniAnchoTxt(D.entrada.origen, U.ROT_ALTO);










  var E = D.entrada, xT = xIGin - ALIM;
  var ENT_DIAG = 20, ENT_TRI_L = 9, ENT_TRI_H = 10, MED_SUBE = 12, MED_N = 5, PAT_DX = 14, PAT_DY = 52;
  var medP = E.contador ? L.contador : null, patP = E.pat ? L['tierra-proteccion'] : null;
  var medCaja = null, medIzq = ENT_TRI_L;
  if (medP) {
    var mm = /M([\d.]+) ([\d.]+)L\1 ([\d.]+)"/.exec(medP.cuerpo);
    var tip = medP.con.salida;

    medCaja = mm ? (Math.max(+mm[2], +mm[3]) - Math.min(+mm[2], +mm[3])) : 16;

    medIzq = tip[0] + 3 + _uniAnchoTxt(E.contadorFases, U.ROT_ALTO) + 2;
  }
  var xP = xT + PAT_DX, yP = yIG + PAT_DY, patAbajo = 0;
  out += '<g id="entrada">' +
    (E.cable ? texto(ex - U.ELI_RX - 6, yIG - 3, _uniEsc(E.cable), LETRA_ENT, 'end') : '') +


    (E.tubo ? texto(ex - U.ELI_RX - 6 - _uniAnchoTxt(E.cable, LETRA_ENT),
                            yIG + 8 * nLineasEnt + 2.5 + LETRA_ENT * 0.75,
                            _uniEsc(E.tubo), LETRA_ENT, 'start') : '');
  if (E.mostrarOrigen) {
    out += '<ellipse class="s2" fill="none" cx="' + _uniF(ex) + '" cy="' + _uniF(ey) + '" rx="' + U.ELI_RX + '" ry="' + eliRy + '"/>' +
      texto(lx - 2, ly - 2, _uniEsc(E.origen), U.ROT_ALTO, 'end') +
      '<path class="s2" fill="none" d="M' + _uniF(lx - 4 - wO) + ' ' + _uniF(ly) + 'L' + _uniF(lx) + ' ' + _uniF(ly) +
        'L' + _uniF(ex) + ' ' + _uniF(ey + eliRy) + '"/>';
    (function() {
      var tx = ex, ty = ey + eliRy, dx = tx - lx, dy = ty - ly, dl = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / dl, uy = dy / dl, bx = tx - ux * 4, by = ty - uy * 4;
      out += '<path class="s3" d="M' + _uniF(tx) + ' ' + _uniF(ty) + 'L' + _uniF(bx - uy * 1.3) + ' ' + _uniF(by + ux * 1.3) +
             'L' + _uniF(bx + uy * 1.3) + ' ' + _uniF(by - ux * 1.3) + 'Z"/>';
    })();
  }
  if (medP) {
    out += _uniPieza('contador', xT, yIG - MED_SUBE, 'salida',
                     { codigo: E.contadorCodigo, fases: E.contadorFases }) +
      '<path class="s1" d="M' + _uniF(xT) + ' ' + _uniF(yIG - MED_SUBE) + 'L' + _uniF(xT) + ' ' + _uniF(yIG) + '"/>';
  } else {
    out += '<path class="s3" d="M' + _uniF(xT) + ' ' + _uniF(yIG) + 'L' + _uniF(xT - ENT_TRI_L) + ' ' +
      _uniF(yIG - ENT_TRI_H / 2) + 'L' + _uniF(xT - ENT_TRI_L) + ' ' + _uniF(yIG + ENT_TRI_H / 2) + 'Z"/>';
  }
  if (patP) {

    out += _uniPieza('tierra-proteccion', xP, yP, 'entrada');
    if (E.patCable) out += texto(xP + 8, yP - 3, _uniEsc(E.patCable), LETRA_ENT, 'start');
    if (E.patTubo) out += texto(xP + 8, yP + 2.5 + LETRA_ENT * 0.75, _uniEsc(E.patTubo), LETRA_ENT, 'start');
    var rP = /<circle[^>]*\br="([\d.]+)"/.exec(patP.cuerpo);
    var yR = yP - patP.con.entrada[1] + (rP ? +rP[1] : 12.21) + 4 + U.ROT_ALTO * 0.75;
    E.patRotulo.forEach(function(t, i) {
      out += texto(xP, yR + i * U.ROT_ALTO * U.ROT_INTERLINEA, _uniEsc(t), U.ROT_ALTO, 'middle');
    });
    patAbajo = yR + (E.patRotulo.length - 1) * U.ROT_ALTO * U.ROT_INTERLINEA + 3;
  }
  out += '</g>';


  var yc = cy0;
  pilas.izq.forEach(function(c) { out += c.svg(cx0, yc); yc += c.h; });
  yc = cy0;
  pilas.der.forEach(function(c) { out += c.svg(cx1 - pilas.wD, yc); yc += c.h; });












  function ponerBarra(clave, etiqueta, bx, byBase, yLlega, ini) {
    var p = L[clave];
    if (!p || !cajaT) return null;
    var by = byBase - 2 - cajaT.h;
    var ent = p.con.entrada, sal = p.con.salida, baj = p.con.bajada || [cajaT.h, cajaT.h];
    var ex = bx + ent[0], ey = by + ent[1], R = 8, xk = ex - R - 2;
    if (!ini) ini = 'M' + _uniF(xT) + ' ' + _uniF(yIG) + 'L' + _uniF(xT + ENT_DIAG) + ' ' + _uniF(yLlega);
    out += '<path class="s1" stroke-dasharray="6 3" fill="none" d="' + ini +
      'L' + _uniF(xk - R) + ' ' + _uniF(yLlega) + 'Q' + _uniF(xk) + ' ' + _uniF(yLlega) + ' ' + _uniF(xk) + ' ' +
      _uniF(yLlega + R) + 'L' + _uniF(xk) + ' ' + _uniF(ey - R) + 'Q' + _uniF(xk) + ' ' + _uniF(ey) + ' ' +
      _uniF(xk + R) + ' ' + _uniF(ey) + 'L' + _uniF(ex) + ' ' + _uniF(ey) + '"/>';
    out += '<g data-bloque="' + p.bloque + '" transform="translate(' + _uniF(bx) + ' ' + _uniF(by) + ')">' + p.cuerpo + '</g>';
    out += texto(bx + (p.vb[2] - 6) / 2, by - 3, etiqueta, U.ROT_ALTO, 'middle');
    return { x: bx + sal[0], y: by + sal[1], bajada: { x: bx + baj[0], y: by + baj[1] } };
  }


  var salT = null, salN = null;

  var iniN = medP ? ('M' + _uniF(xT - MED_N) + ' ' + _uniF(yIG - MED_SUBE - medCaja) +
                     'L' + _uniF(xT - MED_N) + ' ' + _uniF(yIG + 8)) : null;
  if (cajaT && nBarras) {
    if (D.tierra) {
      var byBaseT = cy1 - BAJADA_T + 2;







      var byRecibe = D.dosTierras ? byBaseT - PASO_BARRA : byBaseT;
      var xRecibe = D.dosTierras ? cx0 + 45 : cx0 + 30;
      var iniPat = patP ? 'M' + _uniF(xP) + ' ' + _uniF(yP) : null;
      if (D.dosTierras) {
        salT = ponerBarra('barra-tierra', 'TIERRA AISLADA', xRecibe, byRecibe, patP ? yP : yIG + (D.neutro ? 16 : 8), iniPat);
        var salChasis = ponerBarra('barra-tierra', 'TIERRA', cx0 + 30, byBaseT, patP ? yP : yIG + (D.neutro ? 24 : 16), iniPat);
        if (patP && L['barra-tierra']) {
          var xSep = cx0 + 30 + L['barra-tierra'].con.entrada[0] - 18;
          out += '<circle class="s4" style="fill:#000" cx="' + _uniF(xSep) + '" cy="' + _uniF(yP) + '" r="2.4"/>';
        }
      } else {


        salT = ponerBarra('barra-tierra', D.tierraAis ? 'TIERRA AISLADA' : 'TIERRA', xRecibe, byRecibe,
                          patP ? yP : yIG + (D.neutro ? 16 : 8), iniPat);
        var salChasis = (!D.tierraAis || D.chasisAis) ? salT : null;
      }
      if (D.neutro) salN = ponerBarra('barra-neutro', 'NEUTRO', xRecibe + 15, byRecibe - PASO_BARRA, yIG + 8, iniN);



      if (salChasis) {
        out += '<path class="s1" fill="none" d="M' + _uniF(salChasis.bajada.x) + ' ' + _uniF(salChasis.bajada.y) +
               'L' + _uniF(salChasis.bajada.x) + ' ' + _uniF(cy1) + '"/>' +
               '<circle class="s4" style="fill:#000" cx="' + _uniF(salChasis.bajada.x) + '" cy="' + _uniF(cy1) + '" r="2.4"/>';
      }
    } else if (D.neutro) {
      salN = ponerBarra('barra-neutro', 'NEUTRO', cx0 + 30, cy1 - 6, yIG + 8, iniN);
    }
  }







  (D.dps || []).forEach(function(dp, i) {
    var xb = -(10 + DPS_W / 2) - 55 * i;


    var yItm = yIG + U.BUS_A_ITM, ySal = yItm + largoItm, yDps = ySal + 14;
    var e = itmL.con.entrada, f2 = _uniF;
    var d = '<g id="dps-' + (i + 1) + '">';
    d += '<circle class="s4" style="fill:#000" cx="' + f2(xb) + '" cy="' + f2(yIG) + '" r="2.4"/>';
    var yFin = dp.sinDps ? (ySal + 20) : yDps;
    d += '<path class="s1" d="M' + f2(xb) + ' ' + f2(yIG) + 'L' + f2(xb) + ' ' + f2(yItm) +
         'M' + f2(xb) + ' ' + f2(ySal) + 'L' + f2(xb) + ' ' + f2(yFin) + '"/>';
    var lx = e[0] + largoItm / 2 + U.ROT_ALTO * 0.36, ly = e[1] + 4;
    var rot = dp.reserva ? 'RESERVA' : (_uniTs('polos', dp.polos) + 'x' + _uniTs('capacidad', dp.capacidad) + 'A');
    d += '<g data-bloque="' + itmL.bloque + '_V" transform="translate(' + f2(xb) + ' ' + f2(yItm) + ') rotate(90) translate(' +
         f2(-e[0]) + ' ' + f2(-e[1]) + ')">' + _uniSinTramos(itmL).replace(/<text[\s\S]*?<\/text>/, '') +
         '<text x="' + f2(lx) + '" y="' + f2(ly) + '" transform="rotate(-90 ' + f2(lx) + ' ' + f2(ly) + ')" text-anchor="end" ' +
         _UNI_TXT + ' font-size="' + U.ROT_ALTO + '" letter-spacing="0.4">' + rot + '</text></g>';




    if (dp.rotulo) {
      var rx = xb - 4, ry = yIG + 6;
      d += '<text x="' + f2(rx) + '" y="' + f2(ry) + '" transform="rotate(-90 ' + f2(rx) + ' ' + f2(ry) + ')" text-anchor="end" ' +
           _UNI_TXT + ' font-size="' + U.ROT_ALTO + '" letter-spacing="0.4">' + _uniEsc(dp.rotulo) + '</text>';
    }
    if (dp.sinDps) {



      d += '<path class="s3" d="M' + f2(xb) + ' ' + f2(yFin) + 'L' + f2(xb - 1.3) + ' ' + f2(yFin - 4) +
           'L' + f2(xb + 1.3) + ' ' + f2(yFin - 4) + 'Z"/>';
      (dp.destino || []).forEach(function(t, j) {
        var dx = xb + U.ROT_ALTO * 0.36 - j * U.ROT_ALTO * U.ROT_INTERLINEA, dy = yFin + 3;
        d += '<text x="' + f2(dx) + '" y="' + f2(dy) + '" transform="rotate(-90 ' + f2(dx) + ' ' + f2(dy) + ')" text-anchor="end" ' +
             _UNI_TXT + ' font-size="' + U.ROT_ALTO + '" letter-spacing="0.4">' + _uniEsc(t) + '</text>';
      });
      d += '</g>';
      out += d;
      return;
    }
    var pD = L[dp.pieza] || L.dps;
    var caja = pD ? ((pD.cuerpo.match(/<g id="dps">[\s\S]*?<\/g>/) || [''])[0]) : '';



    var fx = DPS_W / 2 + U.ROT_ALTO * 0.36, fy = DPS_H + 3, LD = U.ROT_ALTO * 0.8;
    var txtD = function(x, contenido, letra) {
      return '<text x="' + f2(x) + '" y="' + f2(fy) + '" transform="rotate(-90 ' + f2(x) + ' ' + f2(fy) + ')" text-anchor="end" ' +
             _UNI_TXT + ' font-size="' + f2(letra) + '" letter-spacing="0.4">' + contenido + '</text>';
    };
    var lineasD = txtD(fx - 6, _uniTs('fases', dp.fases), U.ROT_ALTO);
    if (dp.tipo) {
      lineasD += txtD(fx - 6 + U.ROT_ALTO * 1.05, _uniTs('tipo', dp.tipo) + ' ' + _uniTs('corriente', dp.corriente) + 'kA', LD);
      lineasD += txtD(fx - 6 + U.ROT_ALTO * 1.05 + LD * 1.25, 'Up≤' + _uniTs('up', dp.up) + 'kV', LD);
    }
    d += '<g data-bloque="' + (pD ? pD.bloque : 'DPS') + '" transform="translate(' + f2(xb) + ' ' + f2(yDps) +
         ') rotate(90) translate(0 ' + f2(-DPS_H / 2) + ')">' + caja + lineasD + '</g>';
    if (salT) {
      d += '<path class="s1" stroke-dasharray="6 3" d="M' + f2(xb) + ' ' + f2(yDps + DPS_W) + 'L' + f2(xb) + ' ' + f2(salT.y) + '"/>';
      d += '<circle class="s4" style="fill:#000" cx="' + f2(xb) + '" cy="' + f2(salT.y) + '" r="2.4"/>';
    }
    d += '</g>';
    out += d;
  });


  C.forEach(function(c, k) {
    var y = Y0 + alturas[k];


    zonas.push({ tipo: 'circuito', id: c.id, rotulo: c.rotulo, x: U.ANCHO_BUS + 2, y: y - 4 - U.ROT_ALTO - 1,
                 w: 4 + _uniAnchoTxt(c.rotulo, U.ROT_ALTO) + 4, h: U.ROT_ALTO + 4,
                 fw: xMarco - 3 - U.ANCHO_BUS, k: k, n: C.length });
    out += '<g id="circ-' + (k + 1) + '">';
    out += texto(U.ANCHO_BUS + 6, y - 4, _uniEsc(c.rotulo), U.ROT_ALTO, 'start');
    out += cable(U.ANCHO_BUS, xIn, y);
    out += c.reserva
      ? _uniPieza('itm', xIn, y, 'entrada', null, 'RESERVA')
      : (esCm(c)
          ? _uniPieza('itm-cm', xIn, y, 'entrada',
              { tipo: 'MCCB', polos: c.polos, capacidad: _uniCapReg(c.capacidad, c.regulacion) })
          : _uniPieza('itm', xIn, y, 'entrada', { polos: c.polos, capacidad: c.capacidad }));
    var x = esCm(c) ? (xIn + salCm) : xIout;


    zonas.push({ tipo: 'equipo', clase: 'itm', id: c.id, rotulo: c.rotulo,
                 x: xIn - (esCm(c) ? 8 : 2), y: y - (esCm(c) ? 19 : 21),
                 w: x - xIn + (esCm(c) ? 16 : 4), h: esCm(c) ? 38 : 28 });
    var sale = { itm: x };                                                        
    var sigue = {};                                                                  
    var finVis = { itm: x };                                                        
    if (c.dif) {
      sigue.itm = xDin;
      out += cable(x, xDin, y);
      out += c.dif.reserva
        ? _uniPieza('dif', xDin, y, 'entrada', { polos: c.dif.polos, capacidad: '', sensibilidad: '' })
            .replace(/(<text[^>]*>)[\s\S]*?(<\/text>)/, '$1RESERVA$2')
            .replace(/(<\/text>)(<text[^>]*>)[\s\S]*?(<\/text>)/, '$1')
        : _uniPieza('dif', xDin, y, 'entrada',
            { polos: c.dif.polos, capacidad: c.dif.capacidad, sensibilidad: c.dif.sensibilidad });


      var finTxtDif = c.contactor ? Math.min(xDout + 44, xR - anchoCts - 2) : xDout + 44;
      zonas.push({ tipo: 'equipo', clase: 'dif', id: c.id, rotulo: c.rotulo,
                   x: xDin - 2, y: y - 27, w: finTxtDif - xDin + 2, h: 40 });
      x = xDout;
      sale.dif = x;
      finVis.dif = x + toroDif;
    }
    if (c.contactor) {
      var xRc = c.dif ? xR : xRsinDif;
      sigue[c.dif ? 'dif' : 'itm'] = xRc - anchoCts;
      out += cable(x, xRc - anchoCts, y);
      out += _uniCts(xRc, y, c);
      zonas.push({ tipo: 'equipo', clase: 'contactor', id: c.id, rotulo: c.rotulo,
                   x: xRc - anchoCts - 2, y: y - 18, w: anchoCts + 4, h: 28 });
      x = xRc;
      sale.contactor = x;
      finVis.contactor = x;
    }
    if (c.dpsFila) {



      var dF = c.dpsFila, xD0 = c.dif ? (xDout + 14) : xDin;
      out += cable(x, xD0, y);
      var pF = L[dF.pieza] || L.dps;
      var cajaF = pF ? ((pF.cuerpo.match(/<g id="dps">[\s\S]*?<\/g>/) || [''])[0]) : '';
      var LDF = U.ROT_ALTO * 0.8;
      out += '<g data-bloque="' + (pF ? pF.bloque : 'DPS') + '" transform="translate(' + _uniF(xD0) + ' ' + _uniF(y - DPS_F_H / 2) + ')">' +
        cajaF +
        '<text x="' + _uniF(DPS_F_W / 2) + '" y="-3" text-anchor="middle" ' + _UNI_TXT + ' font-size="' + U.ROT_ALTO +
          '" letter-spacing="0.4">' + _uniTs('fases', dF.fases) + '</text>' +
        (dF.tipo ? ('<text x="' + _uniF(DPS_F_W / 2) + '" y="' + _uniF(DPS_F_H + LDF + 2) + '" text-anchor="middle" ' + _UNI_TXT +
          ' font-size="' + _uniF(LDF) + '" letter-spacing="0.4">' + _uniTs('tipo', dF.tipo) + ' ' + _uniTs('corriente', dF.corriente) +
          'kA · Up≤' + _uniTs('up', dF.up) + 'kV</text>') : '') + '</g>';
      if (salT) {
        out += '<path class="s1" stroke-dasharray="6 3" d="M' + _uniF(xD0 + DPS_F_W) + ' ' + _uniF(y) +
               'L' + _uniF(bordeDer - 15) + ' ' + _uniF(y) + '"/>';
      }
      out += '</g>';
      return;
    }

    out += cable(x, finCola, y);
    var tramoSalida = function(yS, sx) {
      var o = '<path class="s3" d="M' + _uniF(finCola) + ' ' + _uniF(yS) + 'L' + _uniF(finCola - 4) + ' ' + _uniF(yS - 1.3) +
              'L' + _uniF(finCola - 4) + ' ' + _uniF(yS + 1.3) + 'Z"/>';
      if (sx.cable) o += texto(xMarco + U.SAL_AIRE, yS - 2.5, _uniEsc(sx.cable), LETRA_SAL, 'start');

      if (sx.tubo) o += texto(xMarco + U.SAL_AIRE, yS + 2.5 + LETRA_SAL * 0.75, _uniEsc(sx.tubo), LETRA_SAL, 'start');


      var tsS = _uniTabSal(sx.tablero), xDest = finCola + 3;
      if (tsS) {
        o += '<g data-bloque="' + tsS.p.bloque + '" transform="translate(' + _uniF(finCola + 3) + ' ' +
             _uniF(yS - _UNI_TAB_SAL_ALTO / 2) + ') scale(' + tsS.k.toFixed(4) + ')">' + tsS.p.cuerpo + '</g>';
        xDest += tsS.w + _UNI_TAB_SAL_AIRE;
      }
      sx.destino.forEach(function(t, i) {
        o += texto(xDest, yS + U.ROT_ALTO * 0.36 + i * U.ROT_ALTO * U.ROT_INTERLINEA, _uniEsc(t), U.ROT_ALTO, 'start');
      });


      zonas.push({ tipo: 'salida', id: c.id, rotulo: c.rotulo, x: xMarco, y: yS - 13,
                   w: anchoTotal - xMarco, h: 26 + Math.max(0, sx.destino.length - 1) * U.ROT_ALTO * U.ROT_INTERLINEA });
      return o;
    };
    out += tramoSalida(y, c);


    if (c.extra) {



      var dsd = (sale[c.extra.desde] != null) ? c.extra.desde : 'itm';



      var xS = sale[dsd], xV = (finVis[dsd] != null) ? finVis[dsd] : xS;
      var xJ = (sigue[dsd] != null)
        ? xV + Math.max(5, Math.min(U.EXTRA_AIRE, (sigue[dsd] - xV) / 2))
        : xV + U.EXTRA_AIRE;
      var yE = y + U.PASO, RJ = 6;
      out += '<path class="s1" fill="none" d="M' + _uniF(xJ) + ' ' + _uniF(y) + 'L' + _uniF(xJ) + ' ' + _uniF(yE - RJ) +
             'Q' + _uniF(xJ) + ' ' + _uniF(yE) + ' ' + _uniF(xJ + RJ) + ' ' + _uniF(yE) +
             'L' + _uniF(finCola) + ' ' + _uniF(yE) + '"/>' +
             '<circle class="s4" style="fill:#000" cx="' + _uniF(xJ) + '" cy="' + _uniF(y) + '" r="2.4"/>';
      out += tramoSalida(yE, c.extra);
    }
    out += '</g>';
  });





  var pen = L['punto-pe-n'];
  function juego(xPunto, salida, cuales, conDps) {
    if (!pen || !salida) return;
    var ks = [], kd = [];
    C.forEach(function(c, k) {
      if (c.dpsFila) { if (conDps) kd.push(k); return; }
      if (cuales(c)) ks.push(k);
    });
    if (!ks.length && !kd.length) return;

    var ysP = [];
    ks.forEach(function(k) {
      ysP.push(Y0 + alturas[k]);
      if (C[k].extra) ysP.push(Y0 + alturas[k] + U.PASO);
    });
    ysP.forEach(function(yy) { out += _uniPieza('punto-pe-n', xPunto, yy, 'punto'); });
    var xv = xPunto - 15;

    kd.forEach(function(k) {
      out += '<circle class="s4" style="fill:#000" cx="' + _uniF(xv) + '" cy="' + _uniF(Y0 + alturas[k]) + '" r="2.4"/>';
    });
    var yIni = Math.min(ks.length ? Y0 + alturas[ks[0]] + 17.4 : Infinity,
                        kd.length ? Y0 + alturas[kd[0]] : Infinity);
    out += '<path class="s1" stroke-dasharray="6 3" fill="none" d="M' + _uniF(xv) + ' ' + _uniF(yIni) +
           'L' + _uniF(xv) + ' ' + _uniF(salida.y) + 'L' + _uniF(salida.x) + ' ' + _uniF(salida.y) + '"/>';
  }


  juego(bordeDer, salT, function() { return true; }, true);
  juego(bordeDer - U.SEP_N, salN, function(c) { return c.usaN && !nAntesDif(c); });
  var kb = [];
  C.forEach(function(c, k) { if (nAntesDif(c)) kb.push(k); });
  if (kb.length && salN) {




    var xNb, xvNb, yIniNb;
    if (pen) {
      xNb = xDin - 13;
      xvNb = xNb - 15;
      kb.forEach(function(k) { out += _uniPieza('punto-pe-n', xNb, Y0 + alturas[k], 'punto'); });
      yIniNb = Y0 + alturas[kb[0]] + 17.4;
    } else {
      xNb = xvNb = xIn + (bordeCm + (xDin - xIn)) / 2;
      kb.forEach(function(k) {
        out += '<circle class="s4" style="fill:#000" cx="' + _uniF(xNb) + '" cy="' + _uniF(Y0 + alturas[k]) + '" r="2.4"/>';
      });
      yIniNb = Y0 + alturas[kb[0]];
    }
    out += '<path class="s1" stroke-dasharray="6 3" fill="none" d="M' + _uniF(xvNb) + ' ' + _uniF(yIniNb) +
           'L' + _uniF(xvNb) + ' ' + _uniF(salN.y) + (hayNSalida ? '' : ('L' + _uniF(salN.x) + ' ' + _uniF(salN.y))) + '"/>';
    xNb = xvNb;

    if (hayNSalida) {
      out += '<circle class="s4" style="fill:#000" cx="' + _uniF(xNb) + '" cy="' + _uniF(salN.y) + '" r="2.4"/>';
    }
  }



  var izq = Math.min(xT - medIzq, D.entrada.mostrarOrigen ? (lx - 4 - wO) : Infinity,
                     patP ? (xP - 15) : Infinity) - U.MARGEN;

  if (patAbajo + U.MARGEN > altoTotal) altoTotal = patAbajo + U.MARGEN;
  var vbW = anchoTotal + U.MARGEN - izq;


  var zy0 = Math.max(0, yIG - (medP ? 44 : 22));
  var zy1 = Math.max(yIG + 30, E.mostrarOrigen ? ly + 4 : 0, patP ? patAbajo : 0);
  zonas.push({ tipo: 'entrada', x: izq + 2, y: zy0, w: cx0 - 4 - izq, h: zy1 - zy0 });
  window._uniZonas = zonas;
  return '<svg xmlns="http://www.w3.org/2000/svg" data-marco="' +
    [_uniF(cx0), _uniF(cy0), _uniF(cx1 - cx0), _uniF(cy1 - cy0)].join(' ') + '" viewBox="' +
    [_uniF(izq), 0, _uniF(vbW), _uniF(altoTotal)].join(' ') +
    '" width="' + Math.round(vbW * UNI_ESC) + '" height="' + Math.round(altoTotal * UNI_ESC) + '">' +
    '<style>' + (typeof UNIFILAR_ESTILOS !== 'undefined' ? UNIFILAR_ESTILOS : '') + '</style>' +
    '<rect x="' + _uniF(izq) + '" y="0" width="' + _uniF(vbW) + '" height="' + _uniF(altoTotal) + '" fill="#fff"/>' +
    out + '</svg>';
}









var _UNI_LEYENDA = [

  ['itm', 'itm', function(b) { return b.ITM || b.ITM_V; },

    function() { return 'INTERRUPTOR TERMOMAGNÉTICO'; }],
  ['mccb', 'itm-cm', function(b) { return b.ITM_CM; },
    function() { return 'INTERRUPTOR TERMOMAGNÉTICO EN CAJA MOLDEADA (MCCB)'; }],
  ['dif', 'dif', function(b) { return b.DIF; },
    function(x) { return 'INTERRUPTOR DIFERENCIAL DE CAPACIDAD INDICADA, SENSIBILIDAD ' + (x.sens || 'INDICADA'); }],
  ['contactor', 'contactor', function(b) { return b._contactor; },
    function() { return 'CONTACTOR SEGÚN CIRCUITO'; }],
  ['timer', 'timer', function(b) { return b._timer; },
    function() { return 'INTERRUPTOR HORARIO (TEMPORIZADOR)'; }],
  ['botonera', 'botonera-doble', function(b) { return b._botonera; },
    function() { return 'BOTONERA DE ENCENDIDO Y APAGADO'; }],
  ['selector', 'selector', function(b) { return b._selector; },
    function() { return 'SELECTOR DE 3 POSICIONES'; }],
  ['dps', 'dps', function(b) { return b.DPS || b.DPS_1F || b.DPS_2F; },
    function() { return 'DISPOSITIVO DE PROTECCIÓN CONTRA SOBRETENSIONES (DPS)'; }],
  ['piloto', 'piloto', function(b) { return b.PILOTOS; },
    function() { return 'LÁMPARA PILOTO DE PRESENCIA DE TENSIÓN'; }],
  ['mmf', 'mmf', function(b) { return b.MEDIDOR; },
    function() { return 'MEDIDOR MULTIFUNCIÓN'; }],
  ['tc', 'tc', function(b) { return b.MEDIDOR; },
    function() { return 'TRANSFORMADOR DE CORRIENTE'; }],
  ['fusible', 'fusible', function(b) { return b.MEDIDOR; },
    function() { return 'FUSIBLE DE PROTECCIÓN DEL MEDIDOR'; }],

  ['contador', 'contador', function(b) { return b.CONTADOR; },
    function() { return 'CONTADOR DE ENERGÍA'; }],
  ['pat', 'tierra-proteccion', function(b) { return b.TIERRA_PROTECCION; },
    function() { return 'POZO A TIERRA (PAT)'; }],
  ['tab-emp', 'tablero-empotrado', function(b) { return b.TABLERO_EMPOTRADO; },
    function() { return 'TABLERO EMPOTRADO'; }],
  ['tab-panel', 'panel-distribucion', function(b) { return b.PANEL_DISTRIBUCION; },
    function() { return 'PANEL DE DISTRIBUCIÓN O CENTRO DE CONTROL'; }]

];


function _uniBloquesUsados(svg) {
  var b = {}, re = /data-bloque="([A-Z0-9_]+)"/g, m;
  while ((m = re.exec(svg || ''))) {
    var n = m[1];
    b[n] = true;
    if (/^CONTACTOR/.test(n) || /^MANDO/.test(n)) b._contactor = true;
    if (/^CONTACTOR_TIMER/.test(n) || /^MANDO_TIMER/.test(n)) b._timer = true;
    if (/_SELECTOR/.test(n) || /^MANDO/.test(n)) b._selector = true;
    if (/_BOTONERA/.test(n)) b._botonera = true;
  }
  return b;
}







var _UNI_LEY_CON_TRAMOS = { itm: 1, mccb: 1, dif: 1, contactor: 1 };



var _UNI_LEY_SIN_TERMINAL = { contador: 1, pat: 1 };

var _UNI_LEY_DOBLE = { timer: 1, botonera: 1, selector: 1, piloto: 1, tc: 1, fusible: 1 };
function _uniLeyendaCuerpo(clave, pieza, tramo) {
  var p = (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB[pieza] : null;
  if (!p) return '';
  var c = /^itm/.test(pieza) ? _uniSinTramos(p) : p.cuerpo;
  var e = p.con && p.con.entrada, sa = p.con && p.con.salida;




  if (clave === 'contactor' && p.con && p.con.contacto_izq && p.con.contacto_der_sobre_cable) {
    e = [p.con.contacto_izq[0], p.con.contacto_der_sobre_cable[1]];
    sa = p.con.contacto_der_sobre_cable;
  }
  if (_UNI_LEY_CON_TRAMOS[clave] && e && sa && tramo) {
    c = c.replace(/<path[^>]*\/>/g, function(t) { return _uniEsTramoCable(t, e[1]) ? '' : t; });
    c += '<path class="s2" d="M' + _uniF(e[0] - tramo) + ' ' + _uniF(e[1]) + 'L' + _uniF(e[0]) + ' ' + _uniF(e[1]) +
         'M' + _uniF(sa[0]) + ' ' + _uniF(sa[1]) + 'L' + _uniF(sa[0] + tramo) + ' ' + _uniF(sa[1]) + '"/>';
  }



  c = c.replace(/<text[^>]*>[\s\S]*?<\/text>/g, function(t) {
    return /id="(?:tipo|nombre)"/.test(t) ? t : '';
  });



  if ((clave === 'dps' || clave === 'mmf') && e) {
    c = c.replace(/<path[^>]*\bd="([^"]*)"[^>]*\/>/g, function(t, d) {
      var sub = d.split(/(?=M)/), todos = sub.length > 0;
      sub.forEach(function(sp) {
        var n = (sp.match(/-?\d+(?:\.\d+)?/g) || []).map(parseFloat);
        if (n.length !== 4 || Math.abs(n[1] - e[1]) > 0.05 || Math.abs(n[3] - e[1]) > 0.05) todos = false;
      });
      return todos ? '' : t;
    });
  }
  if (_UNI_LEY_SIN_TERMINAL[clave] && p.con) {
    var _pts = [p.con.entrada, p.con.salida].filter(Boolean);
    var _toca = function(x, y) {
      return _pts.some(function(q) { return Math.abs(q[0] - x) < 0.05 && Math.abs(q[1] - y) < 0.05; });
    };
    c = c.replace(/<path([^>]*)\bd="([^"]*)"([^>]*)\/>/g, function(t, a1, d, a2) {
      var quedan = d.split(/(?=M)/).filter(function(sp) {
        var n = (sp.match(/-?\d+(?:\.\d+)?/g) || []).map(parseFloat);
        for (var k = 0; k + 1 < n.length; k += 2) if (_toca(n[k], n[k + 1])) return false;
        return true;
      });
      return quedan.length ? '<path' + a1 + 'd="' + quedan.join('') + '"' + a2 + '/>' : '';
    });
  }


  if (clave === 'piloto' || clave === 'fusible') c = '<g transform="rotate(90)">' + c + '</g>';
  return c;
}

function unifilarLeyendaSvg(svgDiagrama) {
  var b = _uniBloquesUsados(svgDiagrama || unifilarSvg());
  var fm = (typeof _fichaDatos === 'function') ? _fichaDatos() : {};
  var sens = {};
  ((window._itmList) || []).forEach(function(it) {
    if (it.dif && it.dif.tipo !== 'reserva' && it.dif.sensibilidad) sens[it.dif.sensibilidad] = true;
  });
  var ks = Object.keys(sens);
  var x = { icc: fm.icc ? String(fm.icc).replace(/\s*ka$/i, ' kA') : '',
            sens: ks.length === 1 ? (ks[0] + ' mA') : '' };

  var filas = _UNI_LEYENDA.filter(function(f) { return f[2](b); });

  var W_SIM = 90, H_TIT = 24, H_CAB = 20, H_FILA = 38, M = 5;

  var W_DESC = Math.max(260, 14 + Math.max.apply(null, [0].concat(filas.map(function(f) {
    return _uniAnchoTxt(f[3](x), 8) + f[3](x).length * 0.4;
  }))));
  var W = W_SIM + W_DESC, H = H_TIT + H_CAB + filas.length * H_FILA;
  var linea = function(x1, y1, x2, y2) {
    return '<path fill="none" stroke="#000" stroke-width="0.6" d="M' + _uniF(x1) + ' ' + _uniF(y1) +
           'L' + _uniF(x2) + ' ' + _uniF(y2) + '"/>';
  };
  var txt = function(tx, ty, t, letra, anchor, peso) {
    return '<text x="' + _uniF(tx) + '" y="' + _uniF(ty) + '" text-anchor="' + anchor + '" ' + _UNI_TXT +
           (peso ? ' style="font-weight:' + peso + '"' : '') + ' font-size="' + letra + '" letter-spacing="0.4">' +
           _uniEsc(t) + '</text>';
  };


  var med = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  med.setAttribute('style', 'position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden');
  document.body.appendChild(med);

  var out = '';
  out += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="none" stroke="#000" stroke-width="0.9"/>';
  out += txt(W / 2, H_TIT / 2 + 4.5, 'LEYENDA', 12, 'middle', 700);
  out += linea(0, H_TIT, W, H_TIT);
  out += txt(W_SIM / 2, H_TIT + H_CAB / 2 + 3.3, 'SÍMBOLO', 9, 'middle', 700);
  out += txt(W_SIM + W_DESC / 2, H_TIT + H_CAB / 2 + 3.3, 'DESCRIPCIÓN', 9, 'middle', 700);
  out += linea(0, H_TIT + H_CAB, W, H_TIT + H_CAB);
  out += linea(W_SIM, H_TIT, W_SIM, H);




  var cw = W_SIM - 2 * M, ch = H_FILA - 2 * M;
  var cuerpos = [], cajas = [];
  var cuchilla = function(pieza) {
    var p = (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB[pieza] : null, mx = 0;
    var re = /d="M\s*(-?[\d.]+)[ ,](-?[\d.]+)\s*L\s*(-?[\d.]+)[ ,](-?[\d.]+)\s*"/g, m;
    while (p && (m = re.exec(p.cuerpo))) {
      var dx = m[3] - m[1], dy = m[4] - m[2];
      if (Math.abs(dy) > 1 && Math.abs(dx) > 3) mx = Math.max(mx, Math.sqrt(dx * dx + dy * dy));
    }
    return mx;
  };
  var cItm = cuchilla('itm'), cCont = cuchilla('contactor');
  var relCont = (cItm && cCont) ? cItm / cCont : 1;
  var TRAMO = 16;
  filas.forEach(function(f, i) {
    cuerpos[i] = _uniLeyendaCuerpo(f[0], f[1], f[0] === 'contactor' ? TRAMO / relCont : TRAMO);
    med.innerHTML = '<g>' + cuerpos[i] + '</g>';
    try { cajas[i] = med.firstChild.getBBox(); } catch (e) { cajas[i] = null; }
  });


  var esBarra = function(f) {
    return f[0] === 'neutro' || f[0] === 'tierra' || f[0] === 'contador' ||
           f[0] === 'pat' || f[0] === 'tab-emp' || f[0] === 'tab-panel';
  };
  var kComun = 1.2;
  filas.forEach(function(f, i) {
    var bb = cajas[i];
    if (esBarra(f) || !bb || !(bb.width > 0) || !(bb.height > 0)) return;
    kComun = Math.min(kComun, cw / bb.width, ch / bb.height);
  });



  var kContactor = kComun * relCont;


  var anchoDe = function(clave, pieza) {
    med.innerHTML = '<g>' + _uniLeyendaCuerpo(clave, pieza, 0) + '</g>';
    try { return med.firstChild.getBBox().width; } catch (e) { return 0; }
  };
  var aTimer = anchoDe('timer', 'timer'), aCaja = anchoDe('dps', 'dps');
  var kCaja = (aTimer && aCaja) ? (2 * kComun) * aTimer / aCaja : kComun;
  filas.forEach(function(f, i) {
    var y0 = H_TIT + H_CAB + i * H_FILA;
    if (i) out += linea(0, y0, W, y0);
    var cuerpo = cuerpos[i], bb = cajas[i];
    if (bb && bb.width > 0 && bb.height > 0) {


      var k = esBarra(f) ? Math.min(kComun, cw / bb.width, ch / bb.height)
            : (f[0] === 'contactor') ? Math.min(kContactor, cw / bb.width, ch / bb.height)
            : _UNI_LEY_DOBLE[f[0]]
              ? Math.min(2 * kComun, cw / bb.width, ch / bb.height)
            : (f[0] === 'dps' || f[0] === 'mmf')
              ? Math.min(kCaja, cw / bb.width, ch / bb.height) : kComun;
      var tx = W_SIM / 2 - (bb.x + bb.width / 2) * k, ty = y0 + H_FILA / 2 - (bb.y + bb.height / 2) * k;
      out += '<g data-leyenda="' + f[0] + '" transform="translate(' + _uniF(tx) + ' ' + _uniF(ty) + ') scale(' +
             _uniF(k) + ')">' + cuerpo + '</g>';
    }
    out += txt(W_SIM + 6, y0 + H_FILA / 2 + 3.2, f[3](x), 8, 'start');
  });
  med.remove();

  var A = 8;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + [-A, -A, W + 2 * A, H + 2 * A].join(' ') +
    '" width="' + Math.round((W + 2 * A) * UNI_ESC) + '" height="' + Math.round((H + 2 * A) * UNI_ESC) + '">' +
    '<style>' + (typeof UNIFILAR_ESTILOS !== 'undefined' ? UNIFILAR_ESTILOS : '') + '</style>' +
    '<rect x="' + (-A) + '" y="' + (-A) + '" width="' + (W + 2 * A) + '" height="' + (H + 2 * A) + '" fill="#fff"/>' +
    out + '</svg>';
}


var _uniZoom = 1, _uniSvgTxt = '';









var _UNI_KEY_DIV = 'protab_uni_dividido', _UNI_KEY_ANCHO = 'protab_uni_ancho';



var _UNI_KEY_VISTA = 'protab_uni_vista';
function _uniVista() {
  var v = _uniLeer(_UNI_KEY_VISTA);
  return (v === 'tablero' || v === 'leyenda') ? v : 'completo';
}
function _uniPintarPestanas() {
  var v = _uniVista();
  document.querySelectorAll('#modo_unifilar [data-uni-vista]').forEach(function(b) {
    b.classList.toggle('activo', b.getAttribute('data-uni-vista') === v);
  });
}
function elegirVistaUnifilar(v) {
  _uniGuardar(_UNI_KEY_VISTA, (v === 'tablero' || v === 'leyenda') ? v : 'completo');
  if (v !== 'completo' && typeof _uniEditorCerrar === 'function') _uniEditorCerrar();
  _uniPintarPestanas();
  _renderUnifilar(true);
  _uniAutoAncho();
}


function _uniRecortarTablero(svg) {
  var m = svg.match(/data-marco="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/);
  if (!m) return svg;
  var A = 6;
  var x = parseFloat(m[1]) - A, y = parseFloat(m[2]) - A;
  var w = parseFloat(m[3]) + 2 * A, h = parseFloat(m[4]) + 2 * A;
  return svg.replace(/^<svg([^>]*)>/, function(t, attrs) {
    attrs = attrs.replace(/viewBox="[^"]*"/, 'viewBox="' + [_uniF(x), _uniF(y), _uniF(w), _uniF(h)].join(' ') + '"')
                 .replace(/\swidth="[\d.]+"/, ' width="' + Math.round(w * UNI_ESC) + '"')
                 .replace(/\sheight="[\d.]+"/, ' height="' + Math.round(h * UNI_ESC) + '"');
    return '<svg' + attrs + '>';
  }).replace(/<rect x="[-\d.]+" y="0" width="[\d.]+" height="[\d.]+" fill="#fff"\/>/,
             '<rect x="' + _uniF(x) + '" y="' + _uniF(y) + '" width="' + _uniF(w) + '" height="' + _uniF(h) + '" fill="#fff"/>');
}
function _uniLeer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function _uniGuardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function abrirUnifilar() {
  if (!window._panelBusbarData) {
    if (typeof _avisoFlotante === 'function') _avisoFlotante('Primero insertá el Panel Busbar.');
    return;
  }

  if (typeof _v3dAbierto === 'function' && _v3dAbierto()) cerrarConector3D();
  window._uniAbierto = true;


  _uniGuardar(_UNI_KEY_VISTA, 'tablero');
  var p = document.getElementById('modo_unifilar');
  if (p) p.style.display = 'flex';
  _uniPintarPestanas();
  _uniAplicarForma(_uniLeer(_UNI_KEY_DIV) === '1');
}

function cerrarUnifilar() {
  window._uniAbierto = false;
  _uniEditorCerrar();
  var dividida = document.body.classList.contains('uni-dividido');
  document.body.classList.remove('modo-unifilar', 'uni-dividido');
  var p = document.getElementById('modo_unifilar');
  if (p) p.style.display = 'none';

  if (dividida && typeof zoomAjustar === 'function') requestAnimationFrame(function() { zoomAjustar(0); });
}


function alternarUnifilarDividido() {
  var dividir = !document.body.classList.contains('uni-dividido');
  _uniGuardar(_UNI_KEY_DIV, dividir ? '1' : '0');
  _uniAplicarForma(dividir);
}

function _uniAplicarForma(dividida) {
  var b = document.body;
  b.classList.toggle('uni-dividido', dividida);


  b.classList.toggle('modo-unifilar', !dividida);
  var ancho = parseFloat(_uniLeer(_UNI_KEY_ANCHO));
  _uniFijarAncho(isNaN(ancho) ? 50 : ancho);
  var btn = document.getElementById('uni_btn_dividir');
  if (btn) {
    btn.textContent = dividida ? 'Pantalla completa' : 'Dividir pantalla';
    btn.title = dividida ? 'Ver solo el diagrama unifilar' : 'Ver el diagrama y el tablero lado a lado';
  }



  requestAnimationFrame(function() {
    _renderUnifilar(true);
    if (dividida) _uniAutoAncho();
  });
}








var _UNI_ZOOM_MAX_DIV = 1;
function _uniAutoAncho() {
  if (!document.body.classList.contains('uni-dividido')) return;
  var cont = document.getElementById('unifilar_lienzo'), lay = document.querySelector('.main-layout');
  var wrap = cont && cont.parentElement;
  var w = cont ? parseFloat(cont.dataset.w) : 0, h = cont ? parseFloat(cont.dataset.h) : 0;
  if (!wrap || !lay || !(w > 0 && h > 0) || !lay.clientWidth) return;
  var AIRE = 48 + 12;                                                                         
  var paso = function(n) {
    var ah = wrap.clientHeight - AIRE;




    var vista = _uniVista();
    if (vista === 'completo') _uniFijarAncho(75);
    else if (vista === 'tablero') _uniFijarAncho(35);
    else {
      var z = Math.min(_UNI_ZOOM_MAX_DIV, ah / h);
      _uniFijarAncho(Math.min(50, (w * z + AIRE) / lay.clientWidth * 100));
    }


    setTimeout(function() {
      if (n < 1 && Math.abs((wrap.clientHeight - AIRE) - ah) > 4) { paso(n + 1); return; }
      _renderUnifilar(true);
      if (typeof zoomAjustar === 'function') zoomAjustar(0);
    }, 30);
  };
  paso(0);
}

function _uniFijarAncho(pct) {
  pct = Math.max(20, Math.min(80, pct));
  document.documentElement.style.setProperty('--uni-ancho', pct + '%');
  return pct;
}


function _uniArrastrarDivisor(ev) {
  var lay = document.querySelector('.main-layout');
  if (!lay) return;
  ev.preventDefault();
  var r = lay.getBoundingClientRect(), pct = null;
  var mover = function(e) {
    pct = _uniFijarAncho((e.clientX - r.left) / r.width * 100);
  };
  var soltar = function() {
    document.removeEventListener('pointermove', mover);
    document.removeEventListener('pointerup', soltar);
    document.removeEventListener('pointercancel', soltar);
    document.body.classList.remove('uni-arrastrando');
    if (pct != null) _uniGuardar(_UNI_KEY_ANCHO, String(Math.round(pct * 10) / 10));

    if (pct != null) setTimeout(function() {
      _renderUnifilar(true);
      if (typeof zoomAjustar === 'function') zoomAjustar(0);
    }, 30);
  };
  document.body.classList.add('uni-arrastrando');

  document.addEventListener('pointermove', mover);
  document.addEventListener('pointerup', soltar);
  document.addEventListener('pointercancel', soltar);
}






function _uniEditorCerrar() {
  var e = document.getElementById('uni_editor');
  if (e) e.remove();
}



function _uniSimbImg(tipo) {
  var p = (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB[_UNI_TAB_SAL[tipo]] : null;
  if (!p) return '';
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + p.vb.join(' ') + '">' +
    '<style>' + (typeof UNIFILAR_ESTILOS !== 'undefined' ? UNIFILAR_ESTILOS : '') + '</style>' + p.cuerpo + '</svg>';
  return '<img alt="" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '">';
}
function _uniMeta() {
  var m = window._unifilarMeta || {};

  window._unifilarMeta = Object.assign({}, m, { entrada: m.entrada || {}, salidas: m.salidas || {} });
  return window._unifilarMeta;
}






var _uniRefrescoT = null, _uniAuto = true;
function _uniRefrescarDiferido() {


  if (!window._uniAbierto) return;
  clearTimeout(_uniRefrescoT);
  _uniRefrescoT = setTimeout(function() {
    if (!window._uniAbierto || !window._panelBusbarData) return;
    if (_uniAuto) { _renderUnifilar(true); return; }
    var wrap = document.querySelector('#modo_unifilar .uni-wrap');
    var sl = wrap ? wrap.scrollLeft : 0, st = wrap ? wrap.scrollTop : 0;
    _renderUnifilar(false);
    if (wrap) { wrap.scrollLeft = sl; wrap.scrollTop = st; }
  }, 250);
}

function _renderUnifilar(ajustar) {
  if (ajustar) _uniAuto = true;
  document.body.classList.remove('uni-moviendo');                                      
  var cont = document.getElementById('unifilar_lienzo');
  if (!cont) return;
  try {
    _uniSvgTxt = unifilarSvg();
  } catch (e) {
    console.warn('[unifilar] no se pudo armar:', e);
    cont.innerHTML = '<div class="modo-vacio">No se pudo armar el diagrama unifilar.</div>';
    return;
  }
  var _vUni = _uniVista();
  var verSvg = (_vUni === 'tablero') ? _uniRecortarTablero(_uniSvgTxt)
             : (_vUni === 'leyenda') ? unifilarLeyendaSvg(_uniSvgTxt) : _uniSvgTxt;
  var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(verSvg);
  var w = parseFloat((verSvg.match(/\bwidth="([\d.]+)"/) || [0, 800])[1]);
  var h = parseFloat((verSvg.match(/\bheight="([\d.]+)"/) || [0, 600])[1]);
  _uniVerSvg = (_vUni !== 'leyenda') ? verSvg : '';
  cont.innerHTML = '<img id="unifilar_img" alt="Diagrama unifilar" src="' + url + '">' +
    (_uniVerSvg ? _uniZonasHtml(_uniVerSvg) : '');
  _uniMoverEscuchar(cont);
  cont.dataset.w = w; cont.dataset.h = h;
  if (ajustar) {
    var wrap = cont.parentElement;
    var zw = (wrap.clientWidth - 48) / w, zh = (wrap.clientHeight - 48) / h;
    var zMax = document.body.classList.contains('uni-dividido') ? _UNI_ZOOM_MAX_DIV : 1.5;
    _uniZoom = Math.max(0.1, Math.min(zMax, Math.min(zw, zh) || 1));
  }
  _aplicarZoomUnifilar();
}




function _uniZonasHtml(svg) {
  var vb = ((svg.match(/viewBox="([^"]+)"/) || [])[1] || '').split(/[ ,]+/).map(Number);
  var zs = window._uniZonas || [];
  if (vb.length < 4 || !zs.length) return '';
  var out = '';
  var px = function(v, o, t) { return ((v - o) / t * 100).toFixed(3) + '%'; };
  zs.forEach(function(z) {
    var x0 = Math.max(z.x, vb[0]), y0 = Math.max(z.y, vb[1]);
    var x1 = Math.min(z.x + z.w, vb[0] + vb[2]), y1 = Math.min(z.y + z.h, vb[1] + vb[3]);
    if (x1 - x0 < 8 || y1 - y0 < 4) return;
    var circ = z.tipo === 'circuito';
    var tit = z.tipo === 'entrada' ? 'Editar la entrada'
            : circ ? 'Mover ' + z.rotulo + ' (click para el menú, o arrastrarlo)'
            : z.tipo === 'equipo' ? 'Editar o eliminar ' + _uniRotuloEquipo(z.clase, z.rotulo)
            : 'Editar la salida de ' + z.rotulo;
    out += '<div class="uni-zona' + (circ ? ' uni-zona-circ' : '') + '"' +
      ' title="' + _uniEsc(tit) + '" data-tipo="' + z.tipo + '"' +
      (z.id ? ' data-id="' + _uniEsc(z.id) + '"' : '') +
      (z.fw ? ' data-fw="' + (z.fw / vb[2] * 100).toFixed(3) + '"' : '') +
      (z.tipo === 'circuito' || z.tipo === 'equipo' ? ' data-rotulo="' + _uniEsc(z.rotulo) + '"' : '') +
      (z.clase ? ' data-clase="' + z.clase + '"' : '') +
      ' style="left:' + px(x0, vb[0], vb[2]) + ';top:' + px(y0, vb[1], vb[3]) +
      ';width:' + ((x1 - x0) / vb[2] * 100).toFixed(3) + '%;height:' + ((y1 - y0) / vb[3] * 100).toFixed(3) + '%"' +
      (circ ? '' : ' onclick="_uniZonaClick(this)"') + '></div>';
  });
  return out;
}
function _uniZonaClick(el) {
  var t = el.getAttribute('data-tipo');
  if (t === 'entrada') editarEntradaUnifilar();
  else if (t === 'equipo') _uniMenuEquipo(el);
  else editarSalidasUnifilar(el.getAttribute('data-id'));
}





function _uniRotuloEquipo(clase, rotulo) {
  if (clase === 'dif') return String(rotulo).replace(/^C-/, 'ID-');
  if (clase === 'contactor') return _rotuloK(rotulo);
  return rotulo;
}
function _uniMenuEquipo(el) {
  _uniCerrarMenuCirc();
  var id = el.getAttribute('data-id'), clase = el.getAttribute('data-clase');
  var rot = _uniRotuloEquipo(clase, el.getAttribute('data-rotulo') || '');
  var acciones = {
    itm:       { editar: function() { editarITM(id); },
                 eliminar: function() { eliminarITM(id); } },
    dif:       { editar: function() { abrirModalDIF(id); },
                 eliminar: function() { _eliminarDIF(id); } },
    contactor: { editar: function() { abrirModalContactor(id); },
                 eliminar: function() { _eliminarContactor(id); } }
  }[clase];
  if (!acciones) return;
  var menu = document.createElement('div');
  menu.className = 'dif-context-menu';
  menu.id = 'uni_circ_menu';
  var boton = function(txt, fn, rojo) {
    var b = document.createElement('button');
    b.className = 'dif-context-btn';
    b.textContent = txt;
    if (rojo) b.style.color = '#ff6b6b';
    b.addEventListener('click', function(e) {
      e.stopPropagation();
      _uniCerrarMenuCirc();
      fn();
    });
    menu.appendChild(b);
  };
  boton('Editar ' + rot, function() {


    if (!document.body.classList.contains('uni-dividido')) _uniAplicarForma(true);
    acciones.editar();
  });
  boton('Eliminar ' + rot, function() {
    acciones.eliminar();
    if (typeof guardarSesion === 'function') guardarSesion();
  }, true);
  boton('Anular', function() {});
  var r = el.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.left = (r.right + 6) + 'px';
  menu.style.top = r.top + 'px';
  menu.style.zIndex = '9999';
  document.body.appendChild(menu);
  setTimeout(function() {
    var fuera = function(e) {
      if (e.target.closest && e.target.closest('#uni_circ_menu')) return;
      _uniCerrarMenuCirc();
      document.removeEventListener('pointerdown', fuera, true);
    };
    document.addEventListener('pointerdown', fuera, true);
  }, 0);
}























var _UNI_GRUPOS_TIPO = { cm_reg: 'CM Reg', cm_fijo: 'CM Fijo', riel: 'Riel' };
var _uniReagrupar = { criterio: 'tipo', orden: { tipo: ['cm_reg', 'cm_fijo', 'riel'], polos: ['4', '3', '2', '1'] } };
function _uniGrupoDe(itm, criterio) {
  if (criterio === 'polos') return String(parseInt(itm.polos, 10) || 1);
  var t = itm.tipo === 'reserva' ? _uniClaseConector(itm) : itm.tipo;
  return _UNI_GRUPOS_TIPO[t] ? t : 'riel';
}


function _uniClaseConector(itm) {
  var t = clasificarTamanoITM(itm);
  if (!t && itm.tipo === 'reserva') {
    var d = window._panelBusbarData || {}, k = parseInt(itm.conIndex, 10);
    (window._itmList || []).forEach(function(o) {
      if (t || o.side === itm.side || o.tipo === 'reserva') return;
      var r = rangoOcupado(o, !!d.invertirNConectores);
      if (k >= r.start && k < r.end) t = clasificarTamanoITM(o);
    });
  }
  return t || 'riel';
}
function _uniNumRot(r) { var m = /(\d+)/.exec(r || ''); return m ? parseInt(m[1], 10) : 0; }
function _uniCircuitosTablero() {
  return (window._itmList || []).slice().sort(function(a, b) { return _uniNumRot(a.rotulo) - _uniNumRot(b.rotulo); });
}
function abrirReagruparUnifilar() {
  _uniCerrarMenuCirc();
  var ov = document.getElementById('uni_reagrupar');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'uni_reagrupar';
    ov.className = 'np-overlay';
    ov.innerHTML =
      '<div class="np-card uni-rg-card">' +
        '<div class="np-titulo">Reagrupar circuitos</div>' +
        '<div class="np-seg" id="uni_rg_criterio">' +
          '<button type="button" data-val="tipo">Por tipo</button>' +
          '<button type="button" data-val="polos">Por polos</button>' +
        '</div>' +
        '<div class="uni-rg-lista" id="uni_rg_lista"></div>' +
        '<div class="np-botones">' +
          '<button type="button" class="np-btn" id="uni_rg_cancelar">Cancelar</button>' +
          '<button type="button" class="np-btn np-btn-ok" id="uni_rg_aplicar">Aplicar</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('mousedown', function(e) { if (e.target === ov) ov.style.display = 'none'; });
    ov.querySelectorAll('#uni_rg_criterio button').forEach(function(b) {
      b.onclick = function() { _uniReagrupar.criterio = b.dataset.val; _uniReagruparPintar(); };
    });
    document.getElementById('uni_rg_cancelar').onclick = function() { ov.style.display = 'none'; };
    document.getElementById('uni_rg_aplicar').onclick = function() {
      ov.style.display = 'none';
      aplicarReagrupar(_uniReagrupar.criterio, _uniReagruparOrdenVigente());
    };
  }
  _uniReagruparPintar();
  ov.style.display = 'flex';
}

function _uniReagruparOrdenVigente() {
  var cr = _uniReagrupar.criterio;
  var hay = {};
  _uniCircuitosTablero().forEach(function(it) { hay[_uniGrupoDe(it, cr)] = true; });
  return _uniReagrupar.orden[cr].filter(function(g) { return hay[g]; });
}
function _uniReagruparPintar() {
  var cr = _uniReagrupar.criterio;
  document.querySelectorAll('#uni_rg_criterio button').forEach(function(b) {
    b.classList.toggle('activo', b.dataset.val === cr);
  });
  var lista = document.getElementById('uni_rg_lista');
  var grupos = _uniReagruparOrdenVigente();
  var circ = _uniCircuitosTablero();
  lista.innerHTML = '';
  grupos.forEach(function(g, i) {
    var de = circ.filter(function(it) { return _uniGrupoDe(it, cr) === g; });
    var fila = document.createElement('div');
    fila.className = 'uni-rg-fila';
    var nom = document.createElement('div');
    nom.className = 'uni-rg-nombre';
    nom.textContent = (cr === 'polos' ? g + 'P' : _UNI_GRUPOS_TIPO[g]) + '  ·  ' + de.length;
    var cs = document.createElement('div');
    cs.className = 'uni-rg-circ';
    cs.textContent = de.map(function(it) { return it.rotulo; }).join(', ');
    var txt = document.createElement('div');
    txt.className = 'uni-rg-txt';
    txt.appendChild(nom); txt.appendChild(cs);
    fila.appendChild(txt);
    [['▲', -1], ['▼', 1]].forEach(function(f) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'uni-rg-flecha';
      b.textContent = f[0];
      var j = i + f[1];
      b.disabled = j < 0 || j >= grupos.length;
      b.onclick = function() {
        var ord = _uniReagrupar.orden[cr];
        var a = ord.indexOf(grupos[i]), c = ord.indexOf(grupos[j]);
        ord[a] = grupos[j]; ord[c] = grupos[i];
        _uniReagruparPintar();
      };
      fila.appendChild(b);
    });
    lista.appendChild(fila);
  });
}
function aplicarReagrupar(criterio, grupos) {
  var circ = _uniCircuitosTablero();
  if (circ.length < 2 || typeof _acomodarItms !== 'function') return;
  _uniEditorCerrar();
  var rots = circ.map(function(it) { return it.rotulo; });                    





  var TAM_ORDEN = ['cm_reg', 'cm_fijo', 'riel'];
  var tam = function(it) { var t = _uniClaseConector(it); return TAM_ORDEN.indexOf(t) < 0 ? 'riel' : t; };
  var nuevo = [], plan = [], bi = 0;
  grupos.forEach(function(g) {
    var de = circ.filter(function(it) { return _uniGrupoDe(it, criterio) === g; });
    TAM_ORDEN.forEach(function(t) {
      var franja = de.filter(function(it) { return tam(it) === t; });
      if (!franja.length) return;
      franja = franja.filter(function(it) { return it.tipo !== 'reserva'; })
                     .concat(franja.filter(function(it) { return it.tipo === 'reserva'; }));
      var nIzq = Math.ceil(franja.length / 2);
      franja.forEach(function(it, k) {
        nuevo.push(it);
        plan.push({ it: it, side: k < nIzq ? 'left' : 'right', banda: bi });
      });
      bi++;
    });
  });
  var viejos = circ.map(function(it) { return it.rotulo; });
  var antes = {};
  nuevo.forEach(function(it, k) { antes[it.rotulo] = rots[k]; it.rotulo = rots[k]; });
  if (!_acomodarItms(plan)) {
    circ.forEach(function(it, k) { it.rotulo = viejos[k]; });
    if (typeof _avisoFlotante === 'function') _avisoFlotante('No se pudo acomodar el tablero en esos grupos.');
    return;
  }
  var um = window._unifilarMeta;
  if (um && um.salidas) {
    var s2 = {};
    Object.keys(um.salidas).forEach(function(k) { s2[/^C-/.test(k) ? (antes[k] || k) : k] = um.salidas[k]; });
    um.salidas = s2;
  }
  if (typeof _redibujarPanelConIG === 'function') _redibujarPanelConIG();
  if (window._vistaActual && window._vistaActual !== 'frontal' && typeof aplicarVista === 'function') {
    aplicarVista(window._vistaActual);
  }
  if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
  if (typeof guardarSesion === 'function') guardarSesion();
  var wrap = document.querySelector('#modo_unifilar .uni-wrap');
  var sl = wrap ? wrap.scrollLeft : 0, st = wrap ? wrap.scrollTop : 0;
  _renderUnifilar(false);
  if (wrap) { wrap.scrollLeft = sl; wrap.scrollTop = st; }
  if (typeof _avisoFlotante === 'function') _avisoFlotante('Circuitos reagrupados ' + (criterio === 'polos' ? 'por polos.' : 'por tipo.'));
}




function abrirReservasUnifilar() {
  _uniCerrarMenuCirc();
  var sug = (typeof sugerirReservas === 'function') ? sugerirReservas() : { piezas: [] };
  if (!sug.piezas.length) {
    if (typeof _avisoFlotante === 'function') {
      _avisoFlotante(sug.sueltas > 0 ? 'Los conectores libres no alcanzan para una reserva.'
                                     : 'No hay conectores libres para reservas.');
    }
    return;
  }
  var ov = document.getElementById('uni_reservas');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'uni_reservas';
    ov.className = 'np-overlay';
    ov.innerHTML =
      '<div class="np-card uni-rg-card">' +
        '<div class="np-titulo">Agregar reservas</div>' +
        '<div class="uni-rg-lista" id="uni_res_lista"></div>' +
        '<div class="np-botones">' +
          '<button type="button" class="np-btn" id="uni_res_cancelar">Cancelar</button>' +
          '<button type="button" class="np-btn np-btn-ok" id="uni_res_ok">Agregar</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('mousedown', function(e) { if (e.target === ov) ov.style.display = 'none'; });
    document.getElementById('uni_res_cancelar').onclick = function() { ov.style.display = 'none'; };
  }
  var lista = document.getElementById('uni_res_lista');
  lista.innerHTML = '';
  var TAM = { riel: '', cm_fijo: ' CM Fijo', cm_reg: ' CM Reg' };
  [['left', 'Izquierda'], ['right', 'Derecha']].forEach(function(l) {
    var de = sug.piezas.filter(function(p) { return p.side === l[0]; });
    if (!de.length) return;
    var cuenta = {};
    de.forEach(function(p) { var k = p.polos + 'P' + (TAM[p.tamano] || ''); cuenta[k] = (cuenta[k] || 0) + 1; });
    var fila = document.createElement('div');
    fila.className = 'uni-rg-fila';
    fila.innerHTML = '<div class="uni-rg-txt"><div class="uni-rg-nombre"></div><div class="uni-rg-circ"></div></div>';
    fila.querySelector('.uni-rg-nombre').textContent = l[1] + '  ·  ' + de.length;
    fila.querySelector('.uni-rg-circ').textContent = Object.keys(cuenta).map(function(k) {
      return cuenta[k] + ' × Reserva ' + k;
    }).join(', ');
    lista.appendChild(fila);
  });
  if (sug.sueltas > 0) {
    var nota = document.createElement('div');
    nota.className = 'uni-rg-circ';
    nota.textContent = sug.sueltas + (sug.sueltas === 1 ? ' conector queda libre.' : ' conectores quedan libres.');
    lista.appendChild(nota);
  }
  document.getElementById('uni_res_ok').onclick = function() {
    ov.style.display = 'none';
    var n = instalarReservas(sug.piezas);
    if (typeof _redibujarPanelConIG === 'function') _redibujarPanelConIG();
    if (window._vistaActual && window._vistaActual !== 'frontal' && typeof aplicarVista === 'function') {
      aplicarVista(window._vistaActual);
    }
    if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
    if (typeof guardarSesion === 'function') guardarSesion();
    var wrap = document.querySelector('#modo_unifilar .uni-wrap');
    var sl = wrap ? wrap.scrollLeft : 0, st = wrap ? wrap.scrollTop : 0;
    _renderUnifilar(false);
    if (wrap) { wrap.scrollLeft = sl; wrap.scrollTop = st; }
    if (typeof _avisoFlotante === 'function') _avisoFlotante(n + (n === 1 ? ' reserva agregada.' : ' reservas agregadas.'));
  };
  ov.style.display = 'flex';
}

var _uniVerSvg = '';
function moverCircuitoUnifilarA(id, dest) {
  var C = _uniDatos().circuitos;
  var ids = C.map(function(c) { return c.id; }), rots = C.map(function(c) { return c.rotulo; });
  var i = ids.indexOf(id);
  if (i < 0 || dest < 0 || dest >= ids.length || dest === i || typeof _buscarITM !== 'function') return;

  _uniEditorCerrar();
  ids.splice(i, 1);
  ids.splice(dest, 0, id);
  var antes = {}, itms = ids.map(function(x) { return _buscarITM(x); });
  if (itms.some(function(x) { return !x; })) return;
  var rotsViejos = itms.map(function(itm) { return itm.rotulo; });


  var plantilla = (typeof plantillaTablero === 'function')
    ? plantillaTablero(C.map(function(c) { return _buscarITM(c.id); })) : null;
  itms.forEach(function(itm, k) { antes[itm.rotulo] = rots[k]; });
  itms.forEach(function(itm, k) { itm.rotulo = rots[k]; });

  if (typeof reacomodarTableroPorNumero === 'function' && !reacomodarTableroPorNumero(plantilla)) {
    itms.forEach(function(itm, k) { itm.rotulo = rotsViejos[k]; });
    if (typeof _avisoFlotante === 'function') _avisoFlotante('No se pudo acomodar el tablero en ese orden.');
    return;
  }

  var um = window._unifilarMeta;
  if (um && um.salidas) {
    var s2 = {};
    Object.keys(um.salidas).forEach(function(k) { s2[/^C-/.test(k) ? (antes[k] || k) : k] = um.salidas[k]; });
    um.salidas = s2;
  }
  if (typeof _redibujarPanelConIG === 'function') _redibujarPanelConIG();
  if (window._vistaActual && window._vistaActual !== 'frontal' && typeof aplicarVista === 'function') {
    aplicarVista(window._vistaActual);
  }
  if (typeof actualizarBibliotecaCircuitos === 'function') actualizarBibliotecaCircuitos();
  if (typeof guardarSesion === 'function') guardarSesion();
  var wrap = document.querySelector('#modo_unifilar .uni-wrap');
  var sl = wrap ? wrap.scrollLeft : 0, st = wrap ? wrap.scrollTop : 0;
  _renderUnifilar(false);
  if (wrap) { wrap.scrollLeft = sl; wrap.scrollTop = st; }
  if (typeof _avisoFlotante === 'function') _avisoFlotante(rots[i] + ' pasó a ' + rots[dest] + '.');
}


function _uniMoverEscuchar(cont) {
  if (cont._uniMover) return;
  cont._uniMover = true;
  cont.addEventListener('pointerdown', function(ev) {
    var z = ev.target.closest ? ev.target.closest('.uni-zona-circ') : null;
    if (!z || ev.button !== 0 || window._uniMoviendoFila) return;
    ev.preventDefault();
    _uniCerrarMenuCirc();
    _uniMoverFila(cont, z, ev.clientY, 'arrastre');
  });
}

function _uniCerrarMenuCirc() {
  var m = document.getElementById('uni_circ_menu');
  if (m) m.remove();
}
function _uniMenuCirc(cont, z) {
  _uniCerrarMenuCirc();
  var rot = z.getAttribute('data-rotulo') || '';
  var menu = document.createElement('div');
  menu.className = 'dif-context-menu';
  menu.id = 'uni_circ_menu';
  var bM = document.createElement('button');
  bM.className = 'dif-context-btn';
  bM.textContent = 'Mover ' + rot;
  bM.addEventListener('click', function(e) {
    e.stopPropagation();
    _uniCerrarMenuCirc();
    var b = z.getBoundingClientRect();
    if (z.isConnected) _uniMoverFila(cont, z, b.top + b.height / 2, 'menu');
  });


  var bR = document.createElement('button');
  bR.className = 'dif-context-btn';
  bR.textContent = 'Reagrupar';
  bR.addEventListener('click', function(e) {
    e.stopPropagation();
    abrirReagruparUnifilar();
  });
  var bRes = document.createElement('button');
  bRes.className = 'dif-context-btn';
  bRes.textContent = 'Agregar reservas';
  bRes.addEventListener('click', function(e) {
    e.stopPropagation();
    abrirReservasUnifilar();
  });
  var bNo = document.createElement('button');
  bNo.className = 'dif-context-btn';
  bNo.textContent = 'Anular';
  bNo.addEventListener('click', function(e) { e.stopPropagation(); _uniCerrarMenuCirc(); });
  menu.appendChild(bM);
  menu.appendChild(bR);
  menu.appendChild(bRes);
  menu.appendChild(bNo);
  var r = z.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.left = (r.right + 6) + 'px';
  menu.style.top = r.top + 'px';
  menu.style.zIndex = '9999';
  document.body.appendChild(menu);

  setTimeout(function() {
    var fuera = function(e) {
      if (e.target.closest && e.target.closest('#uni_circ_menu')) return;
      _uniCerrarMenuCirc();
      document.removeEventListener('pointerdown', fuera, true);
    };
    document.addEventListener('pointerdown', fuera, true);
  }, 0);
}








function _uniMoverFila(cont, z, clientY, modo) {
  var img = document.getElementById('unifilar_img');
  var wrap = cont.parentElement;
  var zs = [].slice.call(cont.querySelectorAll('.uni-zona-circ'));
  var desde = zs.indexOf(z);
  if (desde < 0) return;
  if (zs.length < 2) {
    if (modo === 'menu' && typeof _avisoFlotante === 'function') _avisoFlotante('No hay otro circuito con el que cambiarlo.');
    if (modo === 'arrastre') _uniMenuCirc(cont, z);
    return;
  }
  var cr0 = cont.getBoundingClientRect();

  var filas = zs.map(function(e) {
    var b = e.getBoundingClientRect();
    return { top: b.top - cr0.top, bot: b.bottom - cr0.top, left: b.left - cr0.left, w: b.width };
  });
  var otros = filas.filter(function(f, k) { return k !== desde; });
  var y0 = clientY - cr0.top, arrastra = false, dest = desde, linea = null, hueco = null;
  window._uniMoviendoFila = true;
  var empezar = function() {
    arrastra = true;
    document.body.classList.add('uni-moviendo');
    z.classList.add('arrastrando');
    if (img) {
      var f = filas[desde];
      z.style.backgroundImage = 'url("' + img.src + '")';
      z.style.backgroundSize = img.offsetWidth + 'px ' + img.offsetHeight + 'px';
      z.style.backgroundPosition = (-f.left) + 'px ' + (-f.top) + 'px';
    }
    linea = document.createElement('div');
    linea.className = 'uni-drop';
    linea.style.display = 'none';
    cont.appendChild(linea);
    var fh = filas[desde];
    hueco = document.createElement('div');
    hueco.className = 'uni-hueco';
    hueco.style.cssText = 'left:' + fh.left + 'px;top:' + fh.top + 'px;width:' + fh.w + 'px;height:' + (fh.bot - fh.top) + 'px';
    cont.appendChild(hueco);
  };
  var mover = function(e) {
    if (!z.isConnected) { terminar(null, true); return; }
    var cr = cont.getBoundingClientRect(), y = e.clientY - cr.top, dy = y - y0;
    if (!arrastra) {
      if (Math.abs(dy) < 4) return;
      empezar();
    }
    z.style.transform = 'translateY(' + dy + 'px)';

    var n = 0;
    otros.forEach(function(f) { if ((f.top + f.bot) / 2 < y) n++; });
    dest = n;
    var yl = n === 0 ? otros[0].top - 2
           : (n >= otros.length ? otros[otros.length - 1].bot + 2 : (otros[n - 1].bot + otros[n].top) / 2);
    linea.style.top = yl + 'px';
    var fwp = parseFloat(zs[0].getAttribute('data-fw'));
    linea.style.left = filas[0].left + 'px';
    linea.style.width = (fwp > 0 ? cont.offsetWidth * fwp / 100 : filas[0].w) + 'px';
    linea.style.display = (dest === desde) ? 'none' : '';

    if (wrap) {
      var wr = wrap.getBoundingClientRect();
      if (e.clientY < wr.top + 36) wrap.scrollTop -= 14;
      else if (e.clientY > wr.bottom - 36) wrap.scrollTop += 14;
    }
  };
  var terminar = function(e, cancela) {
    window.removeEventListener('pointermove', mover);
    window.removeEventListener('pointerup', alSoltar);
    window.removeEventListener('pointercancel', alCancelar);
    window.removeEventListener('pointerdown', alClick, true);
    window.removeEventListener('keydown', tecla);
    window._uniMoviendoFila = false;
    document.body.classList.remove('uni-moviendo');
    if (linea) linea.remove();
    if (hueco) hueco.remove();
    z.classList.remove('arrastrando');
    z.style.transform = ''; z.style.backgroundImage = '';
    if (!cancela && arrastra && dest !== desde && z.isConnected) moverCircuitoUnifilarA(z.getAttribute('data-id'), dest);
  };
  var alSoltar = function(e) {

    var fueClick = !arrastra;
    terminar(e, false);
    if (fueClick && z.isConnected) _uniMenuCirc(cont, z);
  };
  var alCancelar = function(e) { terminar(e, true); };
  var alClick = function(e) {

    e.preventDefault(); e.stopPropagation();
    terminar(e, false);
  };
  var tecla = function(e) { if (e.key === 'Escape') terminar(e, true); };
  window.addEventListener('keydown', tecla);
  window.addEventListener('pointermove', mover);
  window.addEventListener('pointercancel', alCancelar);
  if (modo === 'menu') {
    empezar();
    window.addEventListener('pointerdown', alClick, true);
  } else {
    window.addEventListener('pointerup', alSoltar);
  }
}

function _aplicarZoomUnifilar() {
  var cont = document.getElementById('unifilar_lienzo');
  var img = document.getElementById('unifilar_img');
  if (!cont || !img) return;
  img.style.width = Math.round(parseFloat(cont.dataset.w) * _uniZoom) + 'px';
  img.style.height = Math.round(parseFloat(cont.dataset.h) * _uniZoom) + 'px';
  var ind = document.getElementById('unifilar_zoom_val');
  if (ind) ind.textContent = Math.round(_uniZoom * 100) + '%';
}

function zoomUnifilar(delta) {
  if (delta === 0) { _renderUnifilar(true); return; }
  _uniAuto = false;
  _uniZoom = Math.max(0.1, Math.min(4, _uniZoom + delta));
  _aplicarZoomUnifilar();
}





async function exportarUnifilarDxf() {
  if (typeof convertirSvgADxf !== 'function' || typeof dxfDeHojas !== 'function') return;
  var hoja = null;
  try { hoja = unifilarHojaSvg(); } catch (e) { console.warn('[unifilar] hoja:', e); }
  if (!hoja) {
    if (typeof _avisoFlotante === 'function') _avisoFlotante('No se pudo armar el diagrama unifilar.');
    return;
  }
  var dxf = convertirSvgADxf(await dxfDeHojas([hoja.svg]));
  var D = _uniDatos();
  var nombre = String(D.nombre || 'tablero').replace(/[^\w.-]+/g, '_') + '_unifilar.dxf';
  guardarArchivoTexto(nombre, dxf, 'dxf', 'Dibujo DXF').catch(function(e) {
    console.warn('[unifilar] no se pudo guardar:', e);
    if (typeof _avisoFlotante === 'function') _avisoFlotante('No se pudo guardar el DXF.');
  });
}









function _uniHojaPartes(s) {
  var vb = ((s.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 100 100').split(/[ ,]+/).map(Number);
  return { vb: vb, cuerpo: s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '') };
}
function _uniHojaAnidar(p, x, y, k) {
  return '<svg x="' + _uniF(x) + '" y="' + _uniF(y) + '" width="' + _uniF(p.vb[2] * k) +
    '" height="' + _uniF(p.vb[3] * k) + '" viewBox="' + p.vb.join(' ') + '" overflow="visible">' +
    p.cuerpo + '</svg>';
}



function _uniHojaConLeyenda() {
  return !(window._unifilarMeta && window._unifilarMeta.sinLeyenda);
}


function _uniHojaVertical() {
  return !!(window._unifilarMeta && window._unifilarMeta.hojaVertical);
}
function elegirOrientacionUnifilar(v) {
  _uniMeta().hojaVertical = (v === 'vertical');
  if (typeof guardarSesion === 'function') guardarSesion();
  _renderUnifilarHoja();
}
function alternarLeyendaUnifilar(con) {
  _uniMeta().sinLeyenda = !con;
  if (typeof guardarSesion === 'function') guardarSesion();
  _renderUnifilarHoja();
}
function _uniHojaLamina(dia) {
  var d = _uniHojaPartes(dia);
  if (!_uniHojaConLeyenda()) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + _uniF(d.vb[2]) + ' ' + _uniF(d.vb[3]) + '">' +
      '<g data-capa="UNIFILAR">' + _uniHojaAnidar(d, 0, 0, 1) + '</g></svg>';
  }
  var ley = _uniHojaPartes(unifilarLeyendaSvg(dia));
  var SEP = 24, MM = 96 / 25.4, HP = window.hojaProtab;


  var Mh = HP.medidas ? HP.medidas(_uniHojaVertical()) : { W: HP.ANCHO, H: HP.ALTO };
  var AW = Mh.W - 18 - 16 * MM, AH = Mh.H - 18 - 64 - 16 * MM, prop = AW / AH;
  var dW = d.vb[2], dH = d.vb[3], lW = ley.vb[2], lH = ley.vb[3];
  var lim = function(k) { return Math.max(0.6, Math.min(1, k)); };





  var kL = lim((dH * prop - dW - SEP) / lW);
  var lado = { w: dW + SEP + lW * kL, h: Math.max(dH, lH * kL), k: kL };
  var kB = lim((dW / prop - dH - SEP) / lH);
  var abajo = { w: Math.max(dW, lW * kB), h: dH + SEP + lH * kB, k: kB };
  var esc = function(o) { return Math.min(AW / o.w, AH / o.h); };
  var L, x, y;
  if (esc(lado) >= esc(abajo)) {
    L = lado;
    x = dW + SEP; y = L.h - lH * L.k;
  } else {
    L = abajo;
    x = L.w - lW * L.k; y = dH + SEP;
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + _uniF(L.w) + ' ' + _uniF(L.h) + '">' +
    '<g data-capa="UNIFILAR">' + _uniHojaAnidar(d, 0, 0, 1) +
    _uniHojaAnidar(ley, x, y, L.k) + '</g></svg>';
}
function unifilarHojaSvg() {
  if (!window.hojaProtab || !window._panelBusbarData) return null;
  var dia = unifilarSvg();
  _uniSvgTxt = dia;                                                          
  return window.hojaProtab.componer({ l1: '', l2: '', sinRotulo: true, vertical: _uniHojaVertical(),
                                     alt: 'Plano del diagrama unifilar' },
    _cajetinMeta('Diagrama unifilar', 1, 1, 'S/E'), { svg: _uniHojaLamina(dia), logo: './ProTAB_files/table-xd-report.svg' });
}
function _renderUnifilarHoja() {
  var grid = document.getElementById('unifilar_doc_grid');
  if (!grid) return;
  var chk = document.getElementById('uni_doc_leyenda');
  if (chk) chk.checked = _uniHojaConLeyenda();
  var ori = document.getElementById('uni_doc_hoja');
  if (ori) ori.value = _uniHojaVertical() ? 'vertical' : 'horizontal';
  grid.innerHTML = '';
  var hoja = null;
  try { hoja = unifilarHojaSvg(); }
  catch (e) { console.warn('[unifilar] no se pudo armar la hoja:', e); }
  if (!hoja) {
    grid.innerHTML = '<div class="modo-vacio">' + (window._panelBusbarData
      ? 'No se pudo armar el diagrama unifilar.'
      : 'Sin panel busbar todavía — armá el tablero en el modo Diseño.') + '</div>';
    return;
  }


  var caja = document.createElement('div');
  caja.className = 'plano-hoja';
  var ifr = document.createElement('iframe');
  ifr.className = 'plano-hoja-ifr';
  ifr.setAttribute('title', 'Diagrama unifilar');
  ifr.style.width = hoja.ancho + 'px';
  ifr.style.height = hoja.alto + 'px';
  ifr.dataset.w = hoja.ancho; ifr.dataset.h = hoja.alto;
  caja.appendChild(ifr);
  grid.appendChild(caja);
  var d = ifr.contentDocument;
  d.open();
  d.write('<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}' +
          'svg{display:block}</style></head><body>' + hoja.svg + '</body></html>');
  d.close();
  if (typeof _planoHojaEscalar === 'function') {
    _planoHojaEscalar();
    if (!window._planoHojaResize) {
      window._planoHojaResize = true;
      window.addEventListener('resize', _planoHojaEscalar);
    }
  }
}

function imprimirUnifilarHoja() {
  var hoja = null;
  try { hoja = unifilarHojaSvg(); } catch (e) { console.warn('[unifilar] hoja:', e); }
  if (!hoja) {
    if (typeof _avisoFlotante === 'function') _avisoFlotante('No se pudo armar el diagrama unifilar.');
    return;
  }
  if (window._uniImprimiendo) return;                                         
  window._uniImprimiendo = true;
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
    '@page { size: A4 ' + (_uniHojaVertical() ? 'portrait' : 'landscape') + '; margin: 0; }' +
    'html, body { margin: 0; padding: 0; background: #fff; ' +
    '  -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
    '.h { position: relative; width: 100vw; height: 100vh; }' +
    '.h svg { position: absolute; left: 10mm; top: 10mm; width: calc(100% - 20mm); ' +
    '  height: calc(100% - 20mm); }' +
    '</style></head><body><div class="h">' + hoja.svg + '</div></body></html>';
  guardarPdfHtml(nombreArchivoDoc('unifilar'), html, function() { window._uniImprimiendo = false; });
}







function uniPodarSalidas() {
  var m = window._unifilarMeta;
  if (!m || !m.salidas) return;



  if (window._itmEditandoId) return;
  var todos = (typeof _itmTodos === 'function') ? _itmTodos() : (window._itmList || []);
  var ids = {}, rots = {};
  todos.forEach(function(it) { if (it) { ids[it.id] = true; if (it.rotulo) rots[it.rotulo] = true; } });
  Object.keys(m.salidas).forEach(function(k) {
    if (!ids[k] && !rots[k]) delete m.salidas[k];
  });
}
