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