




















var UNI_AISL = [
  ['Libre de halógenos – Energía', ['N2XOH']],
  ['Libre de halógenos – Edificación', ['LSOH-80', 'NH-90', 'LSOH-90+', 'LSOHX-90', 'NHX-90']],
  ['PVC – Edificación', ['TW', 'THW', 'THW-90', 'THHN', 'THWN-2']],
  ['PVC – Energía', ['NYY', 'N2XY']]
];
var UNI_TUBOS = [
  ['Metálica', ['CONDUIT EMT', 'CONDUIT IMC', 'CONDUIT RMC']],
  ['PVC', ['PVC SAP', 'PVC SEL']],
  ['Flexible', ['FLEXIBLE METÁLICO', 'FLEXIBLE LT']],
  ['Enterrado / sin tubo', ['DUCTO HDPE', 'EN BANDEJA']]
];



var UNI_MED = [
  { mm: 15, pl: '1/2"', di: 15.8 }, { mm: 20, pl: '3/4"', di: 20.9 }, { mm: 25, pl: '1"', di: 26.6 },
  { mm: 35, pl: '1 1/4"', di: 35.1 }, { mm: 40, pl: '1 1/2"', di: 40.9 }, { mm: 50, pl: '2"', di: 52.5 },
  { mm: 65, pl: '2 1/2"', di: 69.4 }, { mm: 80, pl: '3"', di: 85.2 }, { mm: 100, pl: '4"', di: 110.1 }
];
var UNI_MED_MIN = 1;
var UNI_SECS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
var UNI_PROY_DEF = { ais: 'N2XOH', aisT: '', forma: 'uni', tub: 'CONDUIT EMT', uni: 'mm' };

function _uniNum(v) { return String(v).replace(/\.0+$/, ''); }


function uniProy() {
  var m = window._unifilarMeta || {};
  return Object.assign({}, UNI_PROY_DEF, m.proyecto || {});
}
function uniCfgDe(sal) {
  return (sal && sal.propio) ? Object.assign({}, UNI_PROY_DEF, sal.propio) : uniProy();
}





function uniCond(polosCable, conN) {
  var p = parseInt(polosCable, 10) || 1;
  if (conN) {
    if (p <= 2) return { nF: 1, n: true };
    if (p >= 4) return { nF: 3, n: true };
    return { nF: 3, n: false };
  }


  return { nF: Math.min(p, 3), n: false };
}




function uniCableTxt(cond, o) {
  var A = o.A, marca = o.marca || '', nucleo;
  if (o.forma === 'multi') {
    nucleo = '1-' + cond.nF + 'x' + _uniNum(o.S) + (cond.n ? '+1x' + _uniNum(o.SN) + '(N)' : '') + 'mm2 ' + marca + A;
  } else {
    nucleo = (cond.nF === 1 ? '1x' : cond.nF + '-1x') + _uniNum(o.S) + 'mm2 ' + marca + A +
             (cond.n ? ' + 1x' + _uniNum(o.SN) + 'mm2 ' + A + '(N)' : '');
  }
  if (o.k > 1) nucleo = o.k + '(' + nucleo + ')';
  return nucleo + (o.T ? ' + 1x' + _uniNum(o.T) + 'mm2 ' + (o.AT || A) + '(T)' : '');
}



function uniResolver(cond, cap, cfg, campos, conTierra) {
  var pr = _uniSeccion(parseFloat(cap));
  if (!pr) return null;
  campos = campos || {};
  var S = campos.sec || pr.sec, k = campos.par || pr.k;
  var T = !conTierra ? 0 : (campos.tie != null ? campos.tie : _uniTierraSec(S * k));
  var SN = (cond.n && cond.nF === 3 && campos.neu) ? Math.min(campos.neu, S) : S;
  return { A: cfg.ais, AT: cfg.aisT, forma: cfg.forma, S: S, k: k, T: T, SN: SN,
           prop: pr, bajo: S * k < pr.sec * pr.k };
}



function uniLlenado(cond, o) {
  var area = 0, cant = 0;
  var suma = function(q, s) { var d = _uniDiamConductor(s); cant += q; area += q * Math.PI * d * d / 4; };
  if (o.forma === 'multi') {
    var d = _uniDiamConductor(o.S) * Math.sqrt(cond.nF + (cond.n ? 1 : 0)) * 1.15;
    cant += o.k; area += o.k * Math.PI * d * d / 4;
  } else {
    suma(o.k * cond.nF, o.S);
    if (cond.n) suma(o.k, o.SN);
  }
  if (o.T) suma(1, o.T);
  return { area: area, llen: cant === 1 ? 0.53 : (cant === 2 ? 0.31 : 0.40) };
}

function uniLlenadoTxt(cable) {
  var cs = _uniConductores(cable), area = 0, cant = 0;
  cs.forEach(function(c) { var d = _uniDiamConductor(c.s); cant += c.n; area += c.n * Math.PI * d * d / 4; });
  if (!cant) return null;
  return { area: area, llen: cant === 1 ? 0.53 : (cant === 2 ? 0.31 : 0.40) };
}
function uniTuboCabe(L, i, nt) {
  return L.area / nt <= L.llen * Math.PI * UNI_MED[i].di * UNI_MED[i].di / 4;
}

function uniTuboProp(L) {
  for (var i = UNI_MED_MIN; i < UNI_MED.length; i++) if (uniTuboCabe(L, i, 1)) return { i: i, n: 1 };
  var u = UNI_MED.length - 1;
  return { i: u, n: Math.ceil(L.area / (0.40 * Math.PI * UNI_MED[u].di * UNI_MED[u].di / 4)) };
}
function uniMedIdx(mm) {
  for (var i = 0; i < UNI_MED.length; i++) if (UNI_MED[i].mm === +mm) return i;
  return -1;
}

function uniTuboTxt(tipo, uni, i, n) {
  if (tipo === 'EN BANDEJA') return tipo;
  var m = UNI_MED[i];
  return (n > 1 ? n + 'x' : '') + (uni === 'in' ? 'Ø' + m.pl + ' ' : m.mm + 'mmØ ') + tipo;
}


function uniTuboDe(L, cfg, campos) {
  campos = campos || {};
  if (!L) return { txt: '', bajo: false };
  var p = uniTuboProp(L);
  var iT = campos.med != null ? uniMedIdx(campos.med) : -1;
  var i = iT >= 0 ? iT : p.i, n = iT >= 0 ? (campos.ntub || 1) : p.n;
  return { txt: uniTuboTxt(cfg.tub, cfg.uni, i, n), i: i, n: n, prop: p,
           bajo: cfg.tub !== 'EN BANDEJA' && !uniTuboCabe(L, i, n) };
}



function uniCapCable(it, desde) {
  var a = parseFloat(it.capacidad);
  var ad = it.dif ? parseFloat(it.dif.corriente) : NaN;
  if (desde !== 'itm' && ad > a) return ad;
  return a;
}
function uniSalida(it, sal, ctx) {
  sal = sal || {};



  var polosCable = ctx.conN
    ? Math.max(parseInt(it.polos, 10) || 1, it.dif ? (parseInt(it.dif.polos, 10) || 0) : 0)
    : (parseInt(it.polos, 10) || 1);
  var cond = uniCond(polosCable, ctx.conN);
  var cfg = uniCfgDe(sal);
  var r = { cond: cond, cfg: cfg, o: null, cableAuto: '', tuboAuto: '', cable: '', tubo: '' };
  if (it.tipo === 'reserva') return r;
  var o = uniResolver(cond, uniCapCable(it), cfg, sal.campos, ctx.tierra);
  if (!o) return r;
  r.o = o;
  r.cableAuto = uniCableTxt(cond, o);
  r.cable = sal.cable || r.cableAuto;
  var L = sal.cable ? uniLlenadoTxt(sal.cable) : uniLlenado(cond, o);
  r.tuboRes = uniTuboDe(L, cfg, sal.campos);
  r.tuboAuto = r.tuboRes.txt;
  r.tubo = sal.tubo || r.tuboAuto;
  return r;
}


function uniSalidaExtra(it, sal, ctx, principal, desde) {
  var xs = (sal && sal.extra) || {};
  var cable = principal.cable, tubo = principal.tubo;
  if (it.tipo !== 'reserva' && uniCapCable(it, desde) !== uniCapCable(it)) {
    var o = uniResolver(principal.cond, uniCapCable(it, desde), principal.cfg, null, ctx.tierra);
    if (o) {
      cable = uniCableTxt(principal.cond, o);
      tubo = uniTuboDe(uniLlenado(principal.cond, o), principal.cfg).txt;
    }
  }
  return { cableAuto: cable, tuboAuto: tubo, cable: xs.cable || cable, tubo: xs.tubo || tubo };
}




function uniEntradaCfg(me) {
  var p = uniProy();
  return { ais: me.ais || p.ais, aisT: me.aisT || '', forma: me.forma || 'uni',
           tub: me.tub || p.tub, uni: me.uni || p.uni };
}
function uniEntrada(me, ig, nF, conN, tierra) {
  me = me || {};
  var cfg = uniEntradaCfg(me), cond = { nF: nF, n: conN };
  var patOn = !!me.pat && tierra;
  var r = { cfg: cfg, cond: cond, pat: patOn, o: null, cableAuto: '', tuboAuto: '', cable: '', tubo: '' };
  var campos = Object.assign({}, me.campos || {});
  var o = uniResolver(cond, ig ? ig.corriente : NaN, cfg, campos, tierra);
  if (o) {
    r.tierraSec = o.T || _uniTierraSec(o.S * o.k);
    if (patOn) o.T = 0;
    o.marca = '(' + nF + 'F) ';
    r.o = o;
    r.cableAuto = uniCableTxt(cond, o);
  }
  r.cable = me.cable || r.cableAuto;
  var L = me.cable ? uniLlenadoTxt(me.cable) : (o ? uniLlenado(cond, o) : null);
  r.tuboRes = uniTuboDe(L, cfg, campos);
  r.tuboAuto = r.tuboRes.txt;
  r.tubo = r.cable ? (me.tubo || r.tuboAuto) : '';


  var pc = me.patCampos || {};
  var sT = pc.sec || r.tierraSec || 0;
  r.patAuto = sT ? '1x' + _uniNum(sT) + 'mm2 ' + (pc.ais || cfg.ais) + '(T)' : '';
  r.patCable = me.patCable || r.patAuto;
  var cfgP = { tub: pc.tub || cfg.tub, uni: cfg.uni };
  var Lp = me.patCable ? uniLlenadoTxt(me.patCable) : (sT ? uniLlenado({ nF: 1, n: false }, { forma: 'uni', S: sT, k: 1, T: 0 }) : null);
  r.patTuboRes = uniTuboDe(Lp, cfgP, { med: pc.med, ntub: 1 });
  r.patTuboAuto = r.patTuboRes.txt;
  r.patTubo = r.patCable ? (me.patTubo || r.patTuboAuto) : '';
  r.patSec = sT;
  return r;
}
