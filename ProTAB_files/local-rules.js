(function () {
  'use strict';
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function num(value, fallback) { var n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function valid(data) { return { ok: true, data: data, errors: [] }; }
  function invalid(message) { return { ok: false, errors: [message] }; }
  function phases(d) {
    if (d.fases === '3F' || d.fases === '3F+N') return ['R', 'S', 'T'];
    if (d.fases === '2F') return String(d.subfases || 'R - S').split(/\s*-\s*/);
    var f = String(d.subfases || 'R-N').split(/\s*-\s*/);
    return d.invertirN && f.length === 2 ? f.slice().reverse() : f;
  }
  function cycle(d) {
    var order = phases(d), out = [], count = Math.ceil(Number(d.polos) / 2);
    for (var i = 0; i < count; i++) out.push(order[i % order.length]);
    return out;
  }
  window.buildGabinete = function (input) {
    if (!input || ['adosado', 'empotrado', 'mural'].indexOf(input.tipo) < 0) return invalid('Selecciona el tipo de fijación.');
    var d = copy(input);
    d.tipo = d.tipo === 'mural' ? 'adosado' : d.tipo;
    d.profPuertaMm = d.tipo === 'empotrado' ? 0 : num(d.profPuertaMm, 15);
    d.profTotalMm = num(d.profTotalMm, 120 + d.profPuertaMm);
    d.profGabMm = d.profTotalMm - d.profPuertaMm;
    if (d.profGabMm <= 0) return invalid('La profundidad del gabinete debe ser positiva.');
    d.colorGab = d.colorGab || '#D7D7D7';
    d.colorPlaca = d.colorPlaca || '#F75E25';
    d.colorPuerta = d.colorPuerta || d.colorGab;
    d.colorMandil = d.colorMandil || d.colorGab;
    return valid(d);
  };
  window.calcAisladorHoles = function (d) {
    var four = !!d.usarAis4f, width = num(d.aisNatW, four ? 715 : 650);
    var names = four ? ['R', 'S', 'T', 'N'] : ['R', 'S', 'T'];
    var two = d.fases === '2F' || d.fases === '1F+N';
    var gap = two ? num(d.aisGap2f, 100) * 5 : (four ? num(d.aisGap4f, 33.5) : num(d.aisGap3f, 50)) * 5;
    var count = two ? 2 : names.length, left = (width - gap * (count - 1)) / 2;
    var holes = {};
    if (two) {
      holes.R = { x: left, diam: 42.1 };
      holes.S = { x: width / 2, diam: 42.1 };
      holes.T = { x: left + gap, diam: 42.1 };
    } else names.forEach(function (f, i) { holes[f] = { x: left + gap * i, diam: four ? 31.7 : 42.1 }; });
    return { holes: holes };
  };
  window.rangoOcupado = function (it, inverse) {
    var start = parseInt(it.conIndex, 10), poles = parseInt(it.polos, 10) || 1;
    var end = start + poles;
    if (it.tieneConN && (!!inverse !== !!it.invertirN)) end = start + poles;
    else if (it.tieneConN) { start--; end--; }
    return { start: start, end: end };
  };
  window.buildPanelBusbar = function (input, previous, list) {
    var error = polosPanelError(input.polos);
    if (error) return invalid(error);
    if (['3F', '3F+N', '2F', '1F+N'].indexOf(input.fases) < 0) return invalid('Selecciona el sistema de fases.');
    var d = Object.assign({}, previous || {}, copy(input));
    d.polos = Number(d.polos);
    d.ciclo = cycle(d);
    if (previous && previous.ciclo && previous.fases === d.fases && previous.subfases === d.subfases) {
      var delta = (d.polos - Number(previous.polos)) / 2;
      d.ciclo = previous.ciclo.slice();
      if (delta < 0) d.ciclo = d.ciclo.slice(0, Math.max(0, d.ciclo.length + delta));
      if (delta > 0) {
        var order = phases(d), used = d.ciclo.filter(function (f) { return f !== 'N'; }).length;
        for (var extra = 0; extra < delta; extra++) d.ciclo.push(order[(used + extra) % order.length]);
      }
    }
    var outside = (list || []).filter(function (it) { return rangoOcupado(it, d.invertirNConectores).end > d.ciclo.length; });
    if (outside.length) return { ok: false, errors: ['El panel necesita más polos para los circuitos existentes.'], outOfRange: outside.map(function (it) { return it.rotulo || it.id; }) };
    d.aisladoTipo = d.aisladoTipo || 'base_3F';
    d.barraTierra = d.barraTierra || 'pe';
    d.barraN = d.barraN || 'con';
    d.conRielAnMm = num(d.conRielAnMm, 23);
    d.conMod1AnMm = num(d.conMod1AnMm, 35);
    d.conMod2AnMm = num(d.conMod2AnMm, 45);
    return valid(d);
  };
  window.itmPolosPermitidos = function (d, type, data) {
    var size = clasificarTamanoITM(Object.assign({ tipo: type }, data || {}));
    if (size === 'cm_reg') return d.fases === '3F+N' ? [3, 4] : [3];
    if (d.fases === '3F') return [1, 2, 3];
    if (d.fases === '3F+N') return [1, 2, 3, 4];
    if (d.fases === '2F') return [1, 2];
    return String(d.subfases || '').includes('-N') ? [1, 2] : [1];
  };
  function needsN(d, poles) { return d.fases === '3F+N' && d.subfases !== 'R - S - T' && (poles === 2 || poles === 4); }
  window.verificarPolosLibres = function (index, poles, side, list, d, invert) {
    index = Number(index); poles = Number(poles);
    if (!Number.isInteger(index) || !Number.isInteger(poles) || poles < 1) return { libre: false, razon: 'Cantidad de polos inválida.' };
    var length = needsN(d, poles) ? poles - 1 : poles;
    if (index < 0 || index + length > (d.ciclo || []).length) return { libre: false, razon: 'La corrida termina antes del último polo.' };
    var slice = d.ciclo.slice(index, index + length);
    var monoPair = d.fases === '1F+N' && poles === 2 && slice.length === 2 && slice.includes('N');
    if (slice.includes('N') && !monoPair) return { libre: false, razon: 'Slot ' + (index + slice.indexOf('N')) + ' es N.' };
    if (length === 3 && slice.join(',') !== 'R,S,T') return { libre: false, razon: 'El circuito trifásico debe iniciar en R y continuar en S y T.' };
    if (d.fases === '1F+N' && poles === 2) {
      slice = d.ciclo.slice(index, index + poles);
      if (slice.length === 2 && slice.includes('N')) length = poles;
    }
    var match = (list || []).find(function (it) {
      if (it.side !== side) return false;
      var range = rangoOcupado(it, d.invertirNConectores);
      return index < range.end && index + length > range.start;
    });
    return match ? { libre: false, razon: 'Espacio ocupado por ' + (match.rotulo || match.id) } : { libre: true };
  };
  window.verificarSlotTipoCompatible = function (it, index, side, list, d) {
    var range = rangoOcupado(Object.assign({}, it, { conIndex: Number(index), tieneConN: false }), d.invertirNConectores);
    var size = clasificarTamanoITM(it);
    var opposite = (list || []).filter(function (other) {
      var r = rangoOcupado(other, d.invertirNConectores);
      return other.side !== side && range.start < r.end && range.end > r.start;
    });
    return { compatible: opposite.every(function (other) { var s = clasificarTamanoITM(other); return !size || !s || s === size; }) };
  };
  window.buildCmSets = function (list, inverse) {
    var cm = {}, reg = {};
    (list || []).forEach(function (it) {
      var size = clasificarTamanoITM(it), range = rangoOcupado(it, inverse);
      for (var i = Math.max(0, range.start); i < range.end; i++) {
        if (size === 'cm_reg') reg[i] = true;
        else if (size === 'cm_fijo') cm[i] = true;
      }
    });
    return { cmConSet: cm, cmRegConSet: reg };
  };
  window.calcSpliceN = function (it, d, list) {
    var index = Number(it.conIndex), poles = Number(it.polos), inverse = !!d.invertirNConectores !== !!it.invertirN;
    var at = inverse ? index + poles - 1 : index;
    var existing = inverse ? at : index - 1;
    var reused = d.ciclo[existing] === 'N';
    var next = d.ciclo.slice(), shifts = [];
    if (!reused) {
      var cutting = (list || []).some(function (other) { var r = rangoOcupado(other, d.invertirNConectores); return r.start < at && r.end > at; });
      if (cutting) return { ok: false, error: 'El neutro partiría un circuito existente.' };
      next.splice(at, 0, 'N');
      (list || []).forEach(function (other) { if (Number(other.conIndex) >= at) shifts.push({ id: other.id, newConIndex: Number(other.conIndex) + 1 }); });
    }
    return { ok: true, newCiclo: next, newAisladoTipo: (d.aisladoTipo || 'base_3F').replace('_3F', '_4F'), newItmConIndex: index + (!reused && !inverse ? 1 : 0), itmShifts: shifts, reusedExistingN: reused };
  };
  window.itmPuedeUsarDIF = function (it, slot) {
    return { eligible: !!it && (it.tipo === 'riel' || (it.tipo === 'reserva' && !(slot && (slot.esCmFijo || slot.esCmReg)))) };
  };
  window.buildDIF = function (input, it, slot) {
    if (!itmPuedeUsarDIF(it, slot).eligible) return invalid('Este tipo de componente no admite el diferencial de riel.');
    if (['lateral', 'inferior'].indexOf(input.ubicacion) < 0) return invalid('Selecciona la ubicación del diferencial.');
    var d = copy(input); d.polos = Number(it.polos) <= 2 ? 2 : 4;
    return valid(d);
  };
  window.itmLateralEdgeRelX = function (it, side, width, cm, reg, rielW, cmW, regW) {
    if (!it || it.tipo === 'reserva') return null;
    var index = Number(it.conIndex), connector = reg[index] ? regW : (cm[index] ? cmW : rielW);
    var size = clasificarTamanoITM(it), body = size === 'cm_reg' ? 825 : (size === 'cm_fijo' ? 650 : 425);
    return side === 'left' ? (width - connector) / 2 - body : (width + connector) / 2 + body;
  };
  window.outerItmEdgeRelX = function (side, list, width, cm, reg, riel, fixed, adjustable) {
    var values = (list || []).filter(function (it) { return it.side === side; }).map(function (it) { return itmLateralEdgeRelX(it, side, width, cm, reg, riel, fixed, adjustable); }).filter(function (v) { return v !== null; });
    return values.length ? (side === 'left' ? Math.min.apply(null, values) : Math.max.apply(null, values)) : null;
  };
  window.getReferenceItmCV14 = function (list, side) {
    var items = (list || []).filter(function (it) { return it.side === side && it.tipo !== 'reserva'; });
    return items.length ? items[0] : null;
  };
  window.igConectaABarraN = function (ig, d) { return { conecta: !!ig && Number(ig.polos) % 2 === 0 && !!d && (d.fases === '3F+N' || d.fases === '1F+N') }; };
  window.buildPuertaPlan = function (input) {
    var d = input.gabineteData || {}, w = Number(input.gabWmm) * 5, h = Number(input.gabHmm) * 5;
    var lock = (d.cerradura || {}).puerta || {}, count = Number(lock.cantidad) || 1, push = /push/i.test(lock.modelo || '');
    var x = num(input.chapaXmm, Number(input.gabWmm) - 25) * 5;
    var y = num(input.chapaYmm, Number(input.gabHmm) * (count > 1 ? 0.25 : 0.5)) * 5;
    var y2 = count > 1 ? num(input.chapaY2mm, Number(input.gabHmm) * 0.75) * 5 : null;
    var pos = function (cy) { return cy === null ? null : { left: x - 70, top: cy - (push ? 207.5 : 70) }; };
    var chapas = { hermetica1: null, hermetica2: null, push1: null, push2: null };
    chapas[push ? 'push1' : 'hermetica1'] = pos(y); chapas[push ? 'push2' : 'hermetica2'] = pos(y2);
    return {
      senaletica: { visible: true }, chapas: chapas,
      chapaNominal: { tipo: push ? 'push' : 'hermetica', cant: count, xPx: x, yPx: y, y2Px: y2 },
      marcosEmpotrado: { visible: d.tipo === 'empotrado', colorFondo: d.colorPuerta, bisagraStep: 100 },
      cotasCP: [
        { code: 'CP-01', kind: 'h', leftPx: 0, topPx: y, lenPx: x, valueMm: x / 5 },
        { code: 'CP-02', kind: 'v', leftPx: w + 100, topPx: 0, lenPx: y, valueMm: y / 5 },
        { code: 'CP-03', kind: 'v', leftPx: w + 100, topPx: y2 === null ? y : y2, lenPx: h - (y2 === null ? y : y2), valueMm: (h - (y2 === null ? y : y2)) / 5 }
      ].concat(y2 === null ? [] : [{ code: 'CP-04', kind: 'v', leftPx: w + 100, topPx: y, lenPx: y2 - y, valueMm: (y2 - y) / 5 }])
    };
  };
  window.buildLateralPlan = function (input) {
    var d = input.gabineteData || {}, depth = num(d.profTotalMm, 135) * 5, height = Number(input.gabHmm) * 5;
    return { marco: { latWpx: depth, latHpx: height }, puertaAdosado: { visible: true, x: depth - num(d.profPuertaMm, 15) * 5, y: 0, w: Math.max(10, num(d.profPuertaMm, 15) * 5), h: height, fill: d.colorPuerta || d.colorGab }, puertaEmpotrado: { visible: false } };
  };
  window.rulesPreparar = function () { return Promise.resolve(); };
  window._TABLE_XD_LOCAL_RULES = true;
})();
