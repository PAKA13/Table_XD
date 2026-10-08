






















'use strict';




var CON_RIEL_ALTO_MM   = 44.5;
var CON_RIEL_CABEZA_MM = 11;
var CM_CON_H     = 125;
var CM_REG_CON_H = 175;
var CV_TOP_INNER = 350;
var EXT_SUP_MIN_MM = 15;
var EXT_SUP_MAX_MM = 150;
var PLACA_IG_MAX_MM = 40;
var TC_ANCHO_MM = 52.1;
var TC_ALTO_MM  = 32.3;
var IG_SOLAPE_MM = 20;
var TC_AIRE_BARRA_MM = 30;
var TC_FILA_GAP_MM = 3;
var TC_PRIMARIOS = [50, 60, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 800, 1000, 1200, 1250, 1500, 2000, 2500, 3000];



window.API_BASE = window.API_BASE || '';

var _RULES_FUNCIONES = ["tcAireMm","tcBaseMm","separacionBarrasMm","tcFilasNecesarias","tcFilasAltoMm","extSupMinConTcMm","tcAireMaxMm","tcPrimarioNormalizado","buildGabinete","calcAisladorHoles","polosPanelError","buildPanelBusbar","rangoOcupado","verificarPolosLibres","itmPolosPermitidos","clasificarTamanoITM","verificarSlotTipoCompatible","buildCmSets","getConY","getTotalConH","calcSpliceN","itmPuedeUsarDIF","buildDIF","itmLateralEdgeRelX","getReferenceItmCV14","getSaltos","getFilaDeDif","clasificarNivelBarra","igConectaABarraN","itmsParaBarraN","ordenarItmsPorNivel","itmsOrdenadosBarraPE","itmsOrdenadosBarraN","igSegmentoAncho","anchoTotalSegmentosBarraR","buildLateralPlan","buildPuertaPlan","calcQuitarNIGDelCiclo","outerItmEdgeRelX","acomodarItmsPlan"];
var _RULES_LOCALES = ["separacionBarrasMm","tcFilasNecesarias","extSupMinConTcMm","tcFilasAltoMm","tcAireMaxMm","tcPrimarioNormalizado","clasificarTamanoITM","getConY","getTotalConH","clasificarNivelBarra","igSegmentoAncho","itmsParaBarraN","ordenarItmsPorNivel","itmsOrdenadosBarraPE","itmsOrdenadosBarraN","anchoTotalSegmentosBarraR","_busbarExtMm","tcAireMm","tcBaseMm","polosPanelError"];
var _rulesCache = {};
var _rulesCacheN = 0;







var _RULES_CACHE_MAX = 30000;






function _rulesHuella(str) {
  var h1 = 0xdeadbeef, h2 = 0x41c6ce57, i, ch;
  for (i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}






function _rulesItmBorde(it) {
  return it ? { side: it.side, tipo: it.tipo, conIndex: it.conIndex,
                capacidad: it.capacidad, conH: it.conH } : it;
}
var _RULES_PROYECCION = {

  itmLateralEdgeRelX: function(a) { return [_rulesItmBorde(a[0])].concat(a.slice(1)); },

  outerItmEdgeRelX: function(a) {
    return [a[0], (a[1] || []).map(_rulesItmBorde)].concat(a.slice(2));
  },





  verificarSlotTipoCompatible: function(a) {
    var it = a[0];
    var src = it ? { t: clasificarTamanoITM(it), polos: parseInt(it.polos, 10) || 0,
                     invertirN: !!it.invertirN } : it;
    return [src].concat(a.slice(1));
  }
};

function _rulesSinPosicion(k, v) {
  return (k === 'conX' || k === 'conY' || k === 'conW') ? undefined : v;
}

function _rulesKey(fn, args) {
  try {
    if (_RULES_PROYECCION[fn] && Array.isArray(args)) args = _RULES_PROYECCION[fn](args);





    var t = JSON.stringify(args, _rulesSinPosicion);
    return fn + '|' + t.length + '|' + _rulesHuella(t);
  } catch (e) { return null; }
}
function _rulesClone(v) {
  return (v === undefined) ? undefined : JSON.parse(JSON.stringify(v));
}
function _rulesGuardar(key, val) {
  if (!key) return;
  if (!(key in _rulesCache)) _rulesCacheN++;
  _rulesCache[key] = val;
}





var _rulesCacheViejo = {};
function _rulesTiene(key) {
  return !!key && ((key in _rulesCache) || (key in _rulesCacheViejo));
}
function _rulesLeer(key) {
  if (!key) return undefined;
  if (key in _rulesCache) return _rulesCache[key];
  if (key in _rulesCacheViejo) {
    var v = _rulesCacheViejo[key];
    _rulesGuardar(key, v);
    return v;
  }
  return undefined;
}


function _rulesHacerLugar(n) {
  if (_rulesCacheN + n > _RULES_CACHE_MAX / 2) {
    _rulesCacheViejo = _rulesCache; _rulesCache = {}; _rulesCacheN = 0;
  }
}

function _rulesXhr(url, body) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', window.API_BASE + url, false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  try {
    xhr.send(JSON.stringify(body));
  } catch (e) {
    console.error('[rules] sin conexion con el servidor de reglas:', e);


    var ahora = Date.now();
    if (typeof _avisoFlotante === 'function' && !(ahora - (_rulesXhr._avisado || 0) < 5000)) {
      _rulesXhr._avisado = ahora;
      try { _avisoFlotante('Sin conexión con el servidor. Prueba de nuevo.'); } catch (e2) { }
    }
    throw e;
  }
  if (xhr.status !== 200) {
    console.error('[rules] ' + url + ' -> HTTP ' + xhr.status + ' ' + xhr.responseText);
    throw new Error('rules: HTTP ' + xhr.status);
  }
  return JSON.parse(xhr.responseText);
}







function _expandirProd(args, prod) {
  var salidas = [args.slice()];
  (prod || []).forEach(function(dim) {
    var next = [];
    salidas.forEach(function(base) {
      dim.v.forEach(function(val) {
        var a = base.slice();
        a[dim.i] = val;
        next.push(a);
      });
    });
    salidas = next;
  });
  return salidas;
}

function _rulesProductos(fn, args) {
  var pb = window._panelBusbarData || {};
  var nCiclo = Math.max((pb.ciclo || []).length, 1);
  var slots = [];
  for (var i = 0; i < nCiclo; i++) slots.push(i);
  if (fn === 'verificarPolosLibres') {
    return [{ fn: fn, args: args, prod: [
      { i: 0, v: slots },
      { i: 1, v: [1, 2, 3, 4] },
      { i: 2, v: ['left', 'right'] },
      { i: 5, v: [null, false, true] }
    ] }];
  }
  if (fn === 'verificarSlotTipoCompatible') {
    return [{ fn: fn, args: args, prod: [
      { i: 1, v: slots },
      { i: 2, v: ['left', 'right'] }
    ] }];
  }
  return [];
}




function _rulesSlotInfo(it) {
  if (!it || it.tipo !== 'reserva') return null;
  var pb = window._panelBusbarData || {}, lst = window._itmList || [];
  var cm = _rulesLeer(_rulesKey('buildCmSets', [lst, !!pb.invertirNConectores])) ||
           _rulesLeer(_rulesKey('buildCmSets', [lst, pb.invertirNConectores]));
  if (!cm) return undefined;
  var idx = parseInt(it.conIndex);
  var reg = !!(cm.cmRegConSet || {})[idx];
  return { esCmReg: reg, esCmFijo: !reg && !!(cm.cmConSet || {})[idx] };
}




function _rulesVariantes(fn, args) {
  var out = [];
  var pb = window._panelBusbarData || {};
  var nCiclo = (pb.ciclo || []).length;
  var itms = window._itmList || [];
  if (fn === 'outerItmEdgeRelX') {

    ['left', 'right'].forEach(function(sd) {
      out.push({ fn: fn, args: [sd].concat(args.slice(1)) });
    });
  } else if (fn === 'itmLateralEdgeRelX') {

    itms.forEach(function(it) {
      ['left', 'right'].forEach(function(sd) {
        out.push({ fn: fn, args: [it, sd].concat(args.slice(2)) });
      });
    });
  } else if (fn === 'itmPuedeUsarDIF') {



    itms.forEach(function(it) {
      var si = _rulesSlotInfo(it);
      if (si !== undefined) out.push({ fn: fn, args: [it, si] });
    });
  } else if (fn === 'rangoOcupado') {

    itms.forEach(function(it) {
      out.push({ fn: fn, args: [it].concat(args.slice(1)) });
    });
  } else if (fn === 'buildCmSets') {

    var inv = pb.invertirNConectores;
    out.push({ fn: fn, args: [args[0], !!inv] });
    out.push({ fn: fn, args: [args[0], inv] });
  }
  return out;
}




















var _REFS = ['_itmList', '_panelBusbarData', '_igData', '_gabineteData'];
var _receta = [];
var _recetaVista = {};
var _RECETA_MAX = 80;
var _RECETA_LS = 'protab_rules_receta';





try {
  var _guardada = JSON.parse(localStorage.getItem(_RECETA_LS) || '[]');
  if (Array.isArray(_guardada)) {
    _guardada.slice(0, _RECETA_MAX).forEach(function(rc) {
      if (!rc || !rc.fn || !Array.isArray(rc.plantilla)) return;
      _recetaVista[rc.fn + '|' + JSON.stringify(rc.plantilla)] = 1;
      _receta.push(rc);
    });
  }
} catch (e) { }

function _igualJson(a, b) {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; }
}







function _rulesPlantilla(args, paraReceta) {
  var pb = window._panelBusbarData || {};
  var lst = window._itmList || [];
  var cms = [
    _rulesLeer(_rulesKey('buildCmSets', [lst, !!pb.invertirNConectores])),
    _rulesLeer(_rulesKey('buildCmSets', [lst, pb.invertirNConectores]))
  ];
  return args.map(function(a) {
    var i;
    for (i = 0; i < _REFS.length; i++) if (a === window[_REFS[i]]) return { __ref: _REFS[i] };
    if (a && typeof a === 'object') {
      for (i = 0; i < cms.length; i++) {
        if (!cms[i]) continue;
        if (_igualJson(a, cms[i].cmConSet))    return { __from: i, path: 'cmConSet' };
        if (_igualJson(a, cms[i].cmRegConSet)) return { __from: i, path: 'cmRegConSet' };
      }


      if (paraReceta) {
        for (i = 0; i < lst.length; i++) if (a === lst[i]) return { __itm: 1 };
      }
    }
    return a;
  });
}


function _rulesHidratar(plantilla) {
  var lst = window._itmList || [];
  var falla = false;
  var out = plantilla.map(function(a) {
    if (a && typeof a === 'object') {
      if (a.__ref) return { __ref: a.__ref };
      if (a.__itm) { if (!lst.length) falla = true; return lst[0]; }
    }
    return a;
  });
  return falla ? null : out;
}



function _tieneMarcaSuelta(args) {
  return (args || []).some(function(a) {
    return a && typeof a === 'object' && (a.__itm || typeof a.__ref === 'string' || typeof a.__from === 'number');
  });
}

function _rulesResolver(args, resultados, bolsa, estado) {
  return (args || []).map(function(a) {
    if (a && typeof a === 'object') {
      if (typeof a.__ref === 'string') {
        if (a.__ref.charAt(0) === '$') return (bolsa || {})[a.__ref];
        return estado ? estado[a.__ref] : window[a.__ref];
      }
      if (typeof a.__from === 'number') {
        var r = resultados[a.__from];
        var base = r && r.result;
        return (base && a.path) ? base[a.path] : base;
      }
    }
    return a;
  });
}





var _RULES_NO_ANOTAR = { acomodarItmsPlan: 1, buildDIF: 1, buildGabinete: 1 };

function _rulesAnotar(fn, args) {
  if (_RULES_NO_ANOTAR[fn]) return;
  var plantilla = _rulesPlantilla(args, true);




  _rulesProductos(fn, plantilla).forEach(function(v) {
    (v.prod || []).forEach(function(dim) { plantilla[dim.i] = dim.v[0]; });
  });
  var k = fn + '|' + JSON.stringify(plantilla);
  if (_recetaVista[k]) return;
  if (_receta.length >= _RECETA_MAX) return;
  _recetaVista[k] = 1;
  _receta.push({ fn: fn, plantilla: plantilla });
  try { localStorage.setItem(_RECETA_LS, JSON.stringify(_receta)); } catch (e) { }
}







function _rulesYaEnCache(f, a, prod) {
  var pb = window._panelBusbarData || {};
  var lst = window._itmList || [];
  var cms = [
    _rulesLeer(_rulesKey('buildCmSets', [lst, !!pb.invertirNConectores])),
    _rulesLeer(_rulesKey('buildCmSets', [lst, pb.invertirNConectores]))
  ];
  var falta = false;
  var base = (a || []).map(function(x) {
    if (x && typeof x === 'object') {
      if (typeof x.__ref === 'string') {
        if (x.__ref.charAt(0) === '$') { falta = true; return x; }
        return window[x.__ref];
      }
      if (typeof x.__from === 'number') {
        var c = cms[x.__from];
        if (!c) { falta = true; return x; }
        return x.path ? c[x.path] : c;
      }
      if (x.__itm) { falta = true; return x; }
    }
    return x;
  });
  if (falta) return false;
  if (!prod) {
    var k = _rulesKey(f, base);


    return _rulesLeer(k) !== undefined;
  }



  return _rulesMarcaProd(f, base, prod) in _rulesCache;
}

function _rulesMarcaProd(f, base, prod) {
  var combos = _expandirProd(base, prod);
  return 'P|' + (combos.length ? _rulesKey(f, combos[0]) : f) + '|' + JSON.stringify(prod);
}







function _rulesPlan(fn, args) {
  var pb = window._panelBusbarData || {};
  var lst = window._itmList || [];
  var plan = [
    { fn: 'buildCmSets', args: [{ __ref: '_itmList' }, !!pb.invertirNConectores] },
    { fn: 'buildCmSets', args: [{ __ref: '_itmList' }, pb.invertirNConectores] }
  ];



  var vistos = {};
  plan.forEach(function(c, i) { vistos[c.fn + '|' + JSON.stringify(c.args)] = i; });
  function sumar(f, a, opcional) {
    var k = f + '|' + JSON.stringify(a);
    if (k in vistos) return vistos[k];
    if (opcional && _rulesYaEnCache(f, a)) return -1;
    var i = plan.push({ fn: f, args: a }) - 1;
    vistos[k] = i;
    return i;
  }
  function sumarProd(f, a, prod) {
    var k = 'P|' + f + '|' + JSON.stringify(a) + '|' + JSON.stringify(prod);
    if (k in vistos) return;
    if (_rulesYaEnCache(f, a, prod)) return;
    vistos[k] = plan.push({ fn: f, args: a, prod: prod }) - 1;
  }
  function sumarTodo(f, a) {
    _rulesVariantes(f, a).forEach(function(v) { sumar(v.fn, v.args, true); });
    _rulesProductos(f, a).forEach(function(v) { sumarProd(v.fn, v.args, v.prod); });
  }
  var idxPedido = -1;
  if (fn) {
    var plantillaPedida = _rulesPlantilla(args);
    idxPedido = sumar(fn, plantillaPedida);
    sumarTodo(fn, plantillaPedida);
  }




  {
    _receta.forEach(function(rc) {


      if (_RULES_NO_ANOTAR[rc.fn]) return;
      var a = _rulesHidratar(rc.plantilla);
      if (!a) return;
      sumar(rc.fn, a, true);
      sumarTodo(rc.fn, a);
    });
  }
  return { plan: plan, idxPedido: idxPedido };
}






function _rulesComprimir(plan) {
  var cuenta = {}, bolsa = {}, nombre = {}, n = 0;
  function jsonDe(v) { try { return JSON.stringify(v); } catch (e) { return null; } }
  function fijo(a) { return !a || typeof a !== 'object' || a.__ref || typeof a.__from === 'number'; }
  plan.forEach(function(c) {
    (c.args || []).forEach(function(a) {
      if (fijo(a)) return;
      var j = jsonDe(a);
      if (!j || j.length < 60) return;
      cuenta[j] = (cuenta[j] || 0) + 1;
    });
  });
  plan.forEach(function(c) {
    c.args = (c.args || []).map(function(a) {
      if (fijo(a)) return a;
      var j = jsonDe(a);
      if (!j || cuenta[j] < 2) return a;
      if (!nombre[j]) { nombre[j] = '$' + (n++); bolsa[nombre[j]] = a; }
      return { __ref: nombre[j] };
    });
  });
  return bolsa;
}

function _rulesEstado() {
  var e = {};
  _REFS.forEach(function(n) { if (window[n] !== undefined) e[n] = window[n]; });
  return e;
}


function _ruleCall(fn, args) {
  var key = _rulesKey(fn, args);
  if (_rulesTiene(key)) return _rulesClone(_rulesLeer(key));

  var armado = _rulesPlan(fn, args);
  var bolsa = _rulesComprimir(armado.plan);
  var estado = _rulesEstado();
  Object.keys(bolsa).forEach(function(k) { estado[k] = bolsa[k]; });
  var res = _rulesXhr('/api/rules/batch', { calls: armado.plan, estado: estado });
  var resultados = res.results || [];
  _rulesGuardarLote(armado.plan, resultados, bolsa);
  _rulesAnotar(fn, args);

  var pedido = resultados[armado.idxPedido];
  if (!pedido || pedido.error) throw new Error('rules: ' + fn + ': ' + (pedido && pedido.error));
  return _rulesClone(pedido.result);
}



function _rulesGuardarLote(plan, resultados, bolsa, estado) {
  _rulesHacerLugar(resultados.reduce(function(t, rr) {
    return t + ((rr && rr.results) ? rr.results.length : 1);
  }, 0));
  plan.forEach(function(c, i) {
    var rr = resultados[i];
    if (!rr) return;
    var base = _rulesResolver(c.args, resultados, bolsa, estado);
    if (_tieneMarcaSuelta(base)) return;
    if (c.prod) {


      var combos = _expandirProd(base, c.prod);
      var lista = rr.results || [];
      if (lista.length !== combos.length) return;
      var completa = true;
      combos.forEach(function(a, k) {
        if (lista[k] && !lista[k].error) _rulesGuardar(_rulesKey(c.fn, a), lista[k].result);
        else completa = false;
      });
      if (completa) _rulesGuardar(_rulesMarcaProd(c.fn, base, c.prod), 1);
      return;
    }
    if (rr.error) return;
    _rulesGuardar(_rulesKey(c.fn, base), rr.result);
  });
}








function rulesPreparar() {
  if (!_receta.length) return Promise.resolve();
  var armado = _rulesPlan(null, null);




  if (armado.plan.length <= 2 && armado.plan.every(function(c) {
    return _rulesYaEnCache(c.fn, c.args);
  })) return Promise.resolve();
  var bolsa = _rulesComprimir(armado.plan);
  var estado = _rulesEstado();
  Object.keys(bolsa).forEach(function(k) { estado[k] = bolsa[k]; });
  var cuerpo = JSON.stringify({ calls: armado.plan, estado: estado });




  var enviado = JSON.parse(cuerpo).estado;
  return fetch(window.API_BASE + '/api/rules/batch', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: cuerpo
  }).then(function(r) { return r.ok ? r.json() : null; }).then(function(res) {
    if (res) _rulesGuardarLote(armado.plan, res.results || [], bolsa, enviado);
  }).catch(function(e) { console.warn('[rules] preparar:', e); });
}


var PX_TO_MM_R = 0.2;
function separacionBarrasMm(d) {
  if (!d) return 50;
  var f = d.fases;
  if (f === '1F+N') return Infinity;


  if (f === '2F') {
    var es05 = (d.aisladoTipo === '0.5s400_3F' || d.aisladoTipo === '0.5s400_4F');
    return es05 ? (d.aisGap2f != null ? d.aisGap2f : 100) : 100;
  }
  var es4f = (d.aisladoTipo === 'base_4F' || d.aisladoTipo === '0.5s400_4F');
  if (d.aisladoTipo === '0.5s400_3F' || d.aisladoTipo === '0.5s400_4F') {
    return es4f ? (d.aisGap4f != null ? d.aisGap4f : 33.5)
                : (d.aisGap3f != null ? d.aisGap3f : 50);
  }
  return es4f ? 33.5 : 50;                                                  
}

function tcFilasNecesarias(d) {
  return (separacionBarrasMm(d) < TC_ANCHO_MM) ? 2 : 1;
}

function extSupMinConTcMm(d) {
  var alto = IG_SOLAPE_MM + tcAireMm(d) + tcFilasAltoMm(d);
  return Math.ceil(alto / 5) * 5;
}

function tcFilasAltoMm(d) {
  return TC_ALTO_MM + (tcFilasNecesarias(d) === 2 ? TC_FILA_GAP_MM + TC_ALTO_MM : 0);
}

function tcAireMaxMm(d) {
  return Math.max(10, Math.min(100, Math.floor(EXT_SUP_MAX_MM - IG_SOLAPE_MM - tcFilasAltoMm(d))));
}

function tcPrimarioNormalizado(amp) {
  var a = parseFloat(amp) || 0;
  for (var i = 0; i < TC_PRIMARIOS.length; i++) if (TC_PRIMARIOS[i] >= a) return TC_PRIMARIOS[i];
  return TC_PRIMARIOS[TC_PRIMARIOS.length - 1];
}

function clasificarTamanoITM(itm) {
  if (!itm) return null;
  if (itm.tipo === 'cm_reg') return 'cm_reg';
  if (itm.tipo === 'cm_fijo') return (parseInt(itm.capacidad, 10) >= 125) ? 'cm_reg' : 'cm_fijo';
  if (itm.tipo === 'riel') return 'riel';
  if (itm.tipo === 'reserva') {
    if (itm.tamano === 'cm_reg')  return 'cm_reg';
    if (itm.tamano === 'cm_fijo') return 'cm_fijo';
    if (itm.tamano === 'riel')    return 'riel';
    return null;
  }
  return null;
}

function getConY(conIndex, conectoresStartY, cmConSet, cmRegConSet) {
  var y = conectoresStartY;
  var idx = parseInt(conIndex);
  for (var j = 0; j < idx; j++) {
    if (cmRegConSet && cmRegConSet[j]) y += CM_REG_CON_H;
    else if (cmConSet && cmConSet[j]) y += CM_CON_H;
    else y += 90;
  }
  return y;
}

function getTotalConH(ciclo, cmConSet, cmRegConSet) {
  if (!ciclo || !ciclo.length) return 0;
  var total = 0;
  for (var i = 0; i < ciclo.length; i++) {
    if (cmRegConSet && cmRegConSet[i]) total += CM_REG_CON_H;
    else if (cmConSet && cmConSet[i]) total += CM_CON_H;
    else total += 90;
  }
  return total;
}

function clasificarNivelBarra(tipo, corrienteAmp) {
  if (tipo !== 'riel' && tipo !== 'cm_fijo' && tipo !== 'cm_reg') {
    return { nivel: 1, anchoSegPx: 50, sufijoSvg: '_3s16' };
  }
  var cap = parseInt(corrienteAmp, 10);
  if (!cap || isNaN(cap)) return { nivel: 1, anchoSegPx: 50, sufijoSvg: '_3s16' };
  if (cap >= 60) return { nivel: 2, anchoSegPx: 100, sufijoSvg: '_1s4' };
  return { nivel: 1, anchoSegPx: 50, sufijoSvg: '_3s16' };
}

function igSegmentoAncho(igData) {
  if (!igData) return 50;
  return clasificarNivelBarra(igData.tipo, igData.corriente).nivel === 2 ? 100 : 50;
}

function itmsParaBarraN(itmList, panelBusbarData) {
  itmList = itmList || [];
  var d = panelBusbarData || {};
  var out = [];
  for (var i = 0; i < itmList.length; i++) {
    var itm = itmList[i];
    var p = parseInt(itm.polos, 10) || 0;
    if (p === 1) { out.push(itm); continue; }
    var pd = itm.dif ? (parseInt(itm.dif.polos, 10) || 0) : 0;
    if (pd > p && (d.fases === '3F+N' || d.fases === '1F+N')) { out.push(itm); continue; }
  }
  return out;
}

function ordenarItmsPorNivel(itms) {
  itms = itms || [];
  var n2 = [], n1 = [];
  for (var i = 0; i < itms.length; i++) {
    var lvl = clasificarNivelBarra(itms[i].tipo, itms[i].capacidad).nivel;
    if (lvl === 2) n2.push(itms[i]);
    else n1.push(itms[i]);
  }
  return n2.concat(n1);
}

function itmsOrdenadosBarraPE(itmList) { return ordenarItmsPorNivel(itmList || []); }

function itmsOrdenadosBarraN(itmList, panelBusbarData) {
  return ordenarItmsPorNivel(itmsParaBarraN(itmList, panelBusbarData));
}

function anchoTotalSegmentosBarraR(itmsOrdered, numMedio, numItmSegs) {
  itmsOrdered = itmsOrdered || [];
  var total = 0;
  for (var k = 0; k < numMedio; k++) {
    var isItm = (k < numItmSegs && itmsOrdered[k]);
    var nivel = isItm ? clasificarNivelBarra(itmsOrdered[k].tipo, itmsOrdered[k].capacidad).nivel : 1;
    total += (nivel === 2) ? 100 : 50;
  }
  return total;
}

function _busbarExtMm(d) {
  return (d && typeof d.busbarExtMm === 'number') ? d.busbarExtMm : 20;
}

function tcAireMm(d) {
  return (d && typeof d.tcAireMm === 'number') ? d.tcAireMm : TC_AIRE_BARRA_MM;
}

function tcBaseMm(d) {
  return _busbarExtMm(d) + tcAireMm(d);
}

function polosPanelError(polos) {
  var p = parseInt(polos, 10);
  if (isNaN(p) || p < 2 || p > 60) return 'Los polos van de 2 a 60.';
  if (p % 2 !== 0) return 'Los polos van de 2 en 2 (un número par).';
  return '';
}



_RULES_FUNCIONES.forEach(function(fn) {
  if (_RULES_LOCALES.indexOf(fn) !== -1) return;
  window[fn] = function() {
    return _ruleCall(fn, Array.prototype.slice.call(arguments));
  };
});
