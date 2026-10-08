



























var _CTL_RP = 2.4, _CTL_RA = 2.5, _CTL_LETRA = 9, _CTL_ANCHO_LETRA = 0.58;



var _CTL_Y_L2 = 226;

function _ctlExtra(yL2natural, tramos) {
  return Math.max(0, (_CTL_Y_L2 - yL2natural) / tramos);
}

var _CTL_LAMINA_H = 320;

var _CTL_K_MAX = 2.6;


function _ctlPieza(k) {
  return (typeof UNIFILAR_LIB !== 'undefined') ? UNIFILAR_LIB[k] : null;
}


function _ctlL() {
  var p = _ctlPieza('bornera-paso');
  return p ? (p.vb[3] - 6) / 0.9 : 48.84;
}
function _ctlCelda(k) {
  var p = _ctlPieza(k);
  if (!p) return null;
  var w = p.vb[2] - 6, h = p.vb[3] - 6;
  return { svg: p.cuerpo, w: w, h: h, cx: w / 2, bloque: p.bloque };
}
function _ctlContacto(k) {
  var p = _ctlPieza(k);
  if (!p) return null;
  var H = p.con.b[1], a = H / 3, nc = /-nc$/.test(k), puls = /^pulsador/.test(k);
  var piv = [0, H - a], fin = nc ? [0.3 * H, a - 0.05 * H] : [-0.25 * H, a + 0.1 * H];
  var xAcc = puls ? -0.6 * H : null;
  return { svg: p.cuerpo, H: H, bloque: p.bloque, xAcc: xAcc,
           med: [(piv[0] + fin[0]) / 2, (piv[1] + fin[1]) / 2],
           izq: puls ? xAcc : (nc ? 0 : fin[0]) };
}

function _ctlBobina(k) {
  var p = _ctlPieza(k);
  if (!p) return null;
  var c = -p.con.a1[1];
  return { svg: p.cuerpo, bloque: p.bloque, c: c, h: p.con.a2[1] - c, w: p.vb[2] - 6 };
}
function _ctlFusible() {
  var p = _ctlPieza('fusible-general');
  if (!p) return null;
  var c = -p.con.entrada[1];
  return { svg: p.cuerpo, bloque: p.bloque, c: c, h: p.con.salida[1] - c, w: p.vb[2] - 6 };
}
function _ctlSelector() {
  var p = _ctlPieza('selector-moa');
  if (!p) return null;
  return { svg: p.cuerpo, bloque: p.bloque, H: p.con.p1[1], d: p.con.p2[0] };
}

var _CTL_PC = 7.37, _CTL_P_ENT = -6, _CTL_P_LARGO = 26.74;
function _ctlPiloto(conFase) {
  var p = _ctlPieza('piloto');
  if (!p) return null;
  return conFase ? p.cuerpo : p.cuerpo.replace(/<text[\s\S]*?<\/text>/g, '');
}

function _ctlPilotoSinTramos() {
  var s = _ctlPiloto(false);
  return s && s.replace(/<path class="s2" d="M[\d.]+ -[\d.]+L[\d.]+ 0"\/>/, '')
    .replace(/<path class="s2" d="M([\d.]+) ([\d.]+)L\1 ([\d.]+)"\/>/, function(m0, a, b, c) { return (+c > +b ? '' : m0); });
}

function _ctlTxtAttr(tam) {
  return 'font-family="Arial, Helvetica, sans-serif" font-weight="300" font-size="' + _uniF(tam) +
         '" fill="#000" stroke="none" letter-spacing="0.4"';
}
function _ctlT(x, y, s, tam, anc) {
  return '<text x="' + _uniF(x) + '" y="' + _uniF(y) + '" text-anchor="' + (anc || 'start') + '" ' +
         _ctlTxtAttr(tam) + '>' + _uniEsc(s) + '</text>';
}
function _ctlBloque(bloque, x, y, s, extra) {
  return '<g data-bloque="' + bloque + '" transform="translate(' + _uniF(x) + ' ' + _uniF(y) + ')' + (extra || '') + '">' + s + '</g>';
}
function _ctlBorne(x, y, rB) {
  return '<circle class="s2" fill="none" cx="' + _uniF(x) + '" cy="' + _uniF(y) + '" r="' + _uniF(rB) + '"/>';
}
function _ctlPunto(q) {
  return '<circle class="s3" cx="' + _uniF(q[0]) + '" cy="' + _uniF(q[1]) + '" r="' + _uniF(_CTL_RP) + '"/>';
}
function _ctlSvg(xMin, yMin, xMax, yMax, out) {
  var f = _uniF;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + [xMin, yMin, xMax - xMin, yMax - yMin].map(f).join(' ') +
    '" width="' + Math.round((xMax - xMin) * 3) + '" height="' + Math.round((yMax - yMin) * 3) + '">' +
    '<style>' + (typeof UNIFILAR_ESTILOS !== 'undefined' ? UNIFILAR_ESTILOS : '') + '</style>' +
    '<rect x="' + f(xMin) + '" y="' + f(yMin) + '" width="' + f(xMax - xMin) + '" height="' + f(yMax - yMin) + '" fill="#fff"/>' +
    out + '</svg>';
}







function _ctlCablesConSaltos(cables, RA) {
  var f = _uniF, E = 0.01, horiz = [];
  cables.forEach(function(c, i) {
    for (var k = 1; k < c.pts.length; k++) {
      var a = c.pts[k - 1], b = c.pts[k];
      if (Math.abs(a[1] - b[1]) < E && Math.abs(a[0] - b[0]) > E)
        horiz.push({ i: i, y: a[1], x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0]) });
    }
  });
  return cables.map(function(c, i) {
    var d = 'M' + f(c.pts[0][0]) + ' ' + f(c.pts[0][1]);
    for (var k = 1; k < c.pts.length; k++) {
      var a = c.pts[k - 1], b = c.pts[k];
      if (Math.abs(a[0] - b[0]) < E && Math.abs(a[1] - b[1]) > E) {
        var x = a[0], baja = b[1] > a[1], y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]);
        var cruces = horiz.filter(function(h) {
          return h.i !== i && x > h.x0 + RA && x < h.x1 - RA && h.y > y0 + RA && h.y < y1 - RA;
        }).map(function(h) { return h.y; }).sort(function(p, q) { return baja ? p - q : q - p; });
        cruces.forEach(function(yc) {
          d += 'L' + f(x) + ' ' + f(baja ? yc - RA : yc + RA) + 'A' + RA + ' ' + RA + ' 0 0 ' + (baja ? 1 : 0) + ' ' +
               f(x) + ' ' + f(baja ? yc + RA : yc - RA);
        });
      }
      d += 'L' + f(b[0]) + ' ' + f(b[1]);
    }
    return '<path class="s1" fill="none"' + (c.trazos ? ' stroke-dasharray="6 3"' : '') + ' d="' + d + '"/>';
  }).join('');
}


function _ctlLlegadaN(x, y) {
  var f = _uniF, chica = _CTL_LETRA * 0.8;
  return '<path class="s3" d="M' + f(x) + ' ' + f(y + 4) + 'L' + f(x - 2) + ' ' + f(y) + 'L' + f(x + 2) + ' ' + f(y) + 'Z"/>' +
         _ctlT(x, y + 4 + chica, 'BARRA N', chica, 'middle');
}


function _ctlConexionPilotos(fases, conN) {
  var f = _uniF, pil = _ctlPiloto(true), pBloque = (_ctlPieza('piloto') || {}).bloque;
  var cel = _ctlCelda('bornera-portafusible'), tope = _ctlCelda('bornera-tope'), sep = _ctlCelda('bornera-separador');
  if (!pil || !cel || !tope || !sep) return null;
  var pcx = _CTL_PC, pEnt = _CTL_P_ENT, pSal = 20.74, pcy = pcx;
  var marcas = fases.map(function(q, i) { return 'L' + (i + 1); }).concat(conN ? ['N'] : []);
  var SP = conN ? 32 : 44, AIRE = 12, LT = _CTL_LETRA;
  var out = '';
  var yTop = 10, yEntP = yTop + (conN ? 8 : 16), yCP = yEntP - pEnt + pcy, pBase = yCP - pcy;
  var ySalP = pBase + pSal, yNudo = ySalP + 10, yJ1 = (conN ? ySalP : yNudo) + AIRE, yJ2 = yJ1 + 8;
  var yCel = conN ? yJ2 + 14 : yJ1 + 14;
  var x = 0;
  out += _ctlBloque(tope.bloque, x, yCel, tope.svg);
  x += tope.w;
  var cx = [];
  marcas.forEach(function(m) {
    out += _ctlBloque(cel.bloque, x, yCel, cel.svg.replace(/(<tspan id="borne">)[^<]*/, '$1' + _uniEsc(m)));
    cx.push(x + cel.cx);
    x += cel.w;
  });
  out += _ctlBloque(sep.bloque, x, yCel, sep.svg);
  var xFin = x + sep.w, yBajo = yCel + cel.h;

  var xm = (cx[0] + cx[fases.length - 1]) / 2;
  var px = fases.map(function(q, i) { return xm + (i - (fases.length - 1) / 2) * SP; });
  fases.forEach(function(q, i) {
    out += _ctlBloque(pBloque, px[i] - pcx, pBase, pil.replace(/(<tspan id="fase">)[^<]*/, '$1' + _uniEsc(q)));
    out += '<path class="s1" fill="none" d="M' + f(px[i]) + ' ' + f(ySalP) + 'L' + f(px[i]) + ' ' + f(yJ1) +
      'L' + f(cx[i]) + ' ' + f(yJ1) + 'L' + f(cx[i]) + ' ' + f(yCel) + '"/>';
  });
  if (conN) {

    var xN = cx[cx.length - 1], xD = Math.max(px[px.length - 1] + 24, xN + 16);
    var d = 'M' + f(px[0]) + ' ' + f(yEntP) + 'L' + f(px[0]) + ' ' + f(yTop) + 'L' + f(xD) + ' ' + f(yTop) +
      'L' + f(xD) + ' ' + f(yJ2) + 'L' + f(xN) + ' ' + f(yJ2) + 'L' + f(xN) + ' ' + f(yCel);
    for (var i = 1; i < px.length; i++) d += 'M' + f(px[i]) + ' ' + f(yEntP) + 'L' + f(px[i]) + ' ' + f(yTop);
    out += '<path class="s1" fill="none" d="' + d + '"/>';
    for (i = 1; i < px.length; i++) out += _ctlPunto([px[i], yTop]);
  } else {


    var y1 = yEntP - 8, n = px.length, dT = '';
    for (var k = 0; k < n - 1; k++) {
      var xa = (px[k] + px[k + 1]) / 2;
      dT += 'M' + f(px[k]) + ' ' + f(yEntP) + 'L' + f(px[k]) + ' ' + f(y1) + 'L' + f(xa) + ' ' + f(y1) +
        'L' + f(xa) + ' ' + f(yNudo) + 'L' + f(px[k + 1]) + ' ' + f(yNudo);
    }
    var xI = px[0] - 18;
    dT += 'M' + f(px[n - 1]) + ' ' + f(yEntP) + 'L' + f(px[n - 1]) + ' ' + f(yTop) + 'L' + f(xI) + ' ' + f(yTop) +
      'L' + f(xI) + ' ' + f(yNudo) + 'L' + f(px[0]) + ' ' + f(yNudo);
    out += '<path class="s1" fill="none" d="' + dT + '"/>';
    px.forEach(function(xp) { out += _ctlPunto([xp, yNudo]); });
  }

  var yB0 = yBajo + 18, PASO = 12, RA = _CTL_RA, xBi = -34, xBd = xFin + 20;
  marcas.forEach(function(m, k) {
    var yb = yB0 + k * PASO;
    out += '<path class="s1" d="M' + f(xBi) + ' ' + f(yb) + 'L' + f(xBd) + ' ' + f(yb) + '"/>';
    out += _ctlT(xBi - 4, yb + LT * 0.36, m, LT, 'end');
    var dd = 'M' + f(cx[k]) + ' ' + f(yBajo);
    for (var j = 0; j < k; j++) {
      var yc = yB0 + j * PASO;
      dd += 'L' + f(cx[k]) + ' ' + f(yc - RA) + 'A' + RA + ' ' + RA + ' 0 0 1 ' + f(cx[k]) + ' ' + f(yc + RA);
    }
    dd += 'L' + f(cx[k]) + ' ' + f(yb);
    out += '<path class="s1" fill="none" d="' + dd + '"/>';
    out += _ctlPunto([cx[k], yb]);
  });
  var yFin = yB0 + (marcas.length - 1) * PASO;
  var xMin = Math.min(xBi - 4 - 2 * LT * _CTL_ANCHO_LETRA, px[0] - 18) - 8, xMax = Math.max(xBd, px[px.length - 1] + 30) + 8;
  return _ctlSvg(xMin, yTop - 8, xMax, yFin + 10, out);
}


function _ctlMandoPilotos(fases, conN) {
  var f = _uniF, pil = _ctlPiloto(false), pBloque = (_ctlPieza('piloto') || {}).bloque, fg = _ctlFusible();
  if (!pil || !fg) return null;
  var pc = _CTL_PC, pEnt = -6, LP = 26.74, SP = 50, LT = _CTL_LETRA, chica = LT * 0.8;
  var lineas = fases.map(function(q, i) { return 'L' + (i + 1); });
  var yL = {};
  lineas.forEach(function(m, k) { yL[m] = k * 12; });
  var xs = fases.map(function(q, k) { return 30 + k * SP; }), xIzq = 0, xDer = xs[xs.length - 1] + SP;
  var yF0 = yL[lineas[lineas.length - 1]] + 20, yFr = yF0 + fg.c, yF1 = yFr + fg.h + fg.c;
  var out = '', cables = [], puntos = [], yFin;
  var fusible = function(x, k) {
    out += _ctlBloque(fg.bloque, x, yFr, fg.svg);
    out += _ctlT(x + fg.w / 2 + 3, yFr + fg.h / 2 + chica * 0.36, 'F' + (k + 1), chica);
  };
  var rotulo = function(k) { return 'H' + (k + 1) + ' (' + fases[k] + ')'; };
  if (conN) {
    var yP0 = yF1 + 10, yP1 = yP0 + LP, yN = yP1 + 20;
    fases.forEach(function(q, k) {
      var x = xs[k];
      fusible(x, k);
      out += _ctlBloque(pBloque, x - pc, yP0 - pEnt, pil);
      out += _ctlT(x + pc + 4, yP0 - pEnt + pc + chica * 0.36, rotulo(k), chica);
      cables.push({ pts: [[x, yL[lineas[k]]], [x, yF0]] }, { pts: [[x, yF1], [x, yP0]] }, { pts: [[x, yP1], [x, yN]] });
      puntos.push([x, yL[lineas[k]]], [x, yN]);
    });
    cables.push({ pts: [[xIzq, yN], [xDer, yN]] });
    yL.N = yN;
    yFin = yN;
  } else {
    var yA = yF1 + 18, yBb = yA + 28, n = fases.length;
    var acostado = function(xm, y, k) {
      out += _ctlBloque(pBloque, xm + pc, y - pc, pil, ' rotate(90)');
      out += _ctlT(xm, y - pc - 4, rotulo(k), chica, 'middle');
    };
    fases.forEach(function(q, k) {
      var x = xs[k], hasta = (k === 0 || k === n - 1) ? yBb : yA;
      fusible(x, k);
      cables.push({ pts: [[x, yL[lineas[k]]], [x, yF0]] }, { pts: [[x, yF1], [x, hasta]] });
      puntos.push([x, yL[lineas[k]]], [x, yA]);
    });
    for (var k = 0; k < n - 1; k++) {
      var xm = (xs[k] + xs[k + 1]) / 2;
      acostado(xm, yA, k);
      cables.push({ pts: [[xs[k], yA], [xm - LP / 2, yA]] }, { pts: [[xm + LP / 2, yA], [xs[k + 1], yA]] });
    }
    var xm3 = (xs[0] + xs[n - 1]) / 2;
    acostado(xm3, yBb, n - 1);
    cables.push({ pts: [[xs[0], yBb], [xm3 - LP / 2, yBb]] }, { pts: [[xm3 + LP / 2, yBb], [xs[n - 1], yBb]] });
    yFin = yBb;
  }
  lineas.forEach(function(m) { cables.push({ pts: [[xIzq, yL[m]], [xDer, yL[m]]] }); });
  out += _ctlCablesConSaltos(cables, _CTL_RA);
  puntos.forEach(function(q) { out += _ctlPunto(q); });
  lineas.concat(conN ? ['N'] : []).forEach(function(m) { out += _ctlT(xIzq - 4, yL[m] + LT * 0.36, m, LT, 'end'); });
  return _ctlSvg(xIzq - 4 - 2 * LT * _CTL_ANCHO_LETRA - 8, -10, xDer + 8, yFin + 10, out);
}


function _ctlAnalizador(conN, tcTxt, mando) {
  var f = _uniF, L = _ctlL();
  var fus = _ctlCelda('bornera-portafusible'), paso = _ctlCelda('bornera-paso');
  var tope = _ctlCelda('bornera-tope'), sep = _ctlCelda('bornera-separador'), tcP = _ctlPieza('tc');
  if (!fus || !paso || !tope || !sep || !tcP) return null;
  var rB = 0.035 * L, LT = _CTL_LETRA, chica = LT * 0.8;
  var lineas = ['L1', 'L2', 'L3'].concat(conN ? ['N'] : []), tensiones = ['V1', 'V2', 'V3'].concat(conN ? ['VN'] : []);
  var out = '';
  var celdas = [['I1', paso], ['I2', paso], ['I3', paso], ['PE', paso]]
    .concat(tensiones.map(function(m) { return [m, fus]; }));
  var x = 0;
  if (!mando) out += _ctlBloque(tope.bloque, 0, 0, tope.svg);
  x += tope.w;
  var cx = {};
  celdas.forEach(function(c) {
    if (!mando) out += _ctlBloque(c[1].bloque, x, 0, c[1].svg.replace(/(<tspan id="borne">)[^<]*/, '$1' + _uniEsc(c[0])));
    cx[c[0]] = x + c[1].cx;
    x += c[1].w;
  });
  if (!mando) out += _ctlBloque(sep.bloque, x, 0, sep.svg);
  var xFin = x + sep.w, yB = mando ? 30 : fus.h;
  if (mando) {
    var ult = tensiones[tensiones.length - 1], xa = cx.I1 - 14, xb = cx[ult] + 14;
    out += '<rect class="s2" fill="none" x="' + f(xa) + '" y="0" width="' + f(xb - xa) + '" height="' + f(yB) + '"/>';
    out += _ctlT((xa + xb) / 2, 11, 'ANALIZADOR DE RED', chica, 'middle');
    ['I1', 'I2', 'I3'].concat(tensiones).forEach(function(m) {
      out += _ctlBorne(cx[m], yB, rB) + _ctlT(cx[m], yB - rB - 3, m, chica, 'middle');
    });
  }
  var y0 = mando ? yB + rB : yB;
  var yV = tensiones.map(function(m, k) { return yB + 8 + (tensiones.length - 1 - k) * 8; });
  var yC = yB + 8 + tensiones.length * 8 + 8, yJ3 = yC + 10, yJ2 = yJ3 + 8;
  var yL = {}, PASO = 30;
  lineas.concat(['PE']).forEach(function(m, k) { yL[m] = yJ2 + 26 + (mando ? 36 : 0) + k * PASO; });

  var mR = /A([\d.]+) /.exec(tcP.cuerpo), r = mR ? +mR[1] : 0.146 * L / 2;
  var tcSvg = '<path class="s2" fill="none" d="M0 0A' + f(r) + ' ' + f(r) + ' 0 0 1 ' + f(2 * r) + ' 0A' + f(r) + ' ' + f(r) +
              ' 0 0 1 ' + f(4 * r) + ' 0"/>';
  var TCS = [0, 1, 2].map(function(k) {
    var s1 = cx.I1 + k * 48, yl = yL[lineas[k]];
    return { k: k, yl: yl, xT: s1 - r, s1: s1, s2: s1 + 2 * r, yTope: yl - r - 2 * rB };
  });
  var xPE = TCS[2].s2 + 14, xV0 = xPE + 20, VSP = mando ? 20 : 12;
  var xIzq = -34, xDer = xV0 + (tensiones.length - 1) * VSP + 20;
  TCS.forEach(function(c) {
    out += _ctlBloque(tcP.bloque, c.xT, c.yl, tcSvg);
    [c.s1, c.s2].forEach(function(xs) { out += _ctlBorne(xs, c.yl - r - rB, rB); });
    var xr = c.xT + 2 * r;
    out += _ctlT(xr, c.yl + 3 + chica, 'TC' + (c.k + 1), chica, 'middle');
    out += _ctlT(xr, c.yl + 3 + chica * 2.25, tcTxt, chica, 'middle');
  });
  var cables = [];
  lineas.concat(['PE']).forEach(function(m) { cables.push({ pts: [[xIzq, yL[m]], [xDer, yL[m]]], trazos: m === 'PE' }); });
  cables.push({ pts: [[cx.I1, y0], [TCS[0].s1, TCS[0].yTope]] });
  cables.push({ pts: [[cx.I2, y0], [cx.I2, yJ2], [TCS[1].s1, yJ2], [TCS[1].s1, TCS[1].yTope]] });
  cables.push({ pts: [[cx.I3, y0], [cx.I3, yJ3], [TCS[2].s1, yJ3], [TCS[2].s1, TCS[2].yTope]] });
  cables.push({ pts: [[TCS[0].s2, TCS[0].yTope], [TCS[0].s2, yC], [xPE, yC], [xPE, yL.PE]] });
  cables.push({ pts: [[TCS[1].s2, TCS[1].yTope], [TCS[1].s2, yC]] });
  cables.push({ pts: [[TCS[2].s2, TCS[2].yTope], [TCS[2].s2, yC]] });
  if (!mando) cables.push({ pts: [[cx.PE, yB], [cx.PE, yC]], trazos: true });
  tensiones.forEach(function(m, k) {
    var xv = xV0 + k * VSP;
    cables.push({ pts: [[cx[m], y0], [cx[m], yV[k]], [xv, yV[k]], [xv, yL[lineas[k]]]] });
  });
  out += _ctlCablesConSaltos(cables, _CTL_RA);
  var fg = _ctlFusible();
  if (mando && fg) {
    tensiones.forEach(function(m, k) {
      var xv = xV0 + k * VSP, yRect = yJ2 + 6 + fg.c;
      out += _ctlBloque(fg.bloque, xv, yRect, fg.svg);
      out += _ctlT(xv + fg.w / 2 + 2, yRect + fg.h / 2 + chica * 0.36, 'F' + (k + 1), chica);
    });
  }
  var puntos = [[TCS[1].s2, yC], [TCS[2].s2, yC]].concat(mando ? [] : [[cx.PE, yC]]).concat([[xPE, yL.PE]])
    .concat(tensiones.map(function(m, k) { return [xV0 + k * VSP, yL[lineas[k]]]; }));
  puntos.forEach(function(q) { out += _ctlPunto(q); });
  lineas.concat(['PE']).forEach(function(m) { out += _ctlT(xIzq - 4, yL[m] + LT * 0.36, m, LT, 'end'); });
  return _ctlSvg(xIzq - 4 - 2 * LT * _CTL_ANCHO_LETRA - 8, -8, Math.max(xDer, xFin) + 8, yL.PE + 10, out);
}




function _ctlAparatoContactor(xA, yCt, yCb, nombre, marco) {
  var f = _uniF, L = _ctlL(), rB = 0.035 * L, chica = _CTL_LETRA * 0.8, mini = _CTL_LETRA * 0.6;
  var na = _ctlContacto('contacto-na'), bob = _ctlBobina('bobina'), PC = 20;
  var xt = { A1: xA, '1': xA + PC, '3': xA + 2 * PC, '5': xA + 3 * PC, '13': xA + 4 * PC };
  var yCc = (yCt + yCb) / 2 - na.H / 2, out = '';
  out += '<rect class="s1" fill="none" stroke-dasharray="4 2" x="' + f(xA - marco[0]) + '" y="' + f(yCt - marco[1]) +
    '" width="' + f(4 * PC + 2 * marco[0]) + '" height="' + f(yCb - yCt + marco[2]) + '"/>';
  out += _ctlT(xA + 2 * PC, yCb + 16, 'CONTACTOR ' + nombre, chica, 'middle');
  var yRb = (yCt + yCb) / 2 - bob.h / 2;
  out += _ctlBloque(bob.bloque, xA, yRb, bob.svg) +
    '<path class="s2" d="M' + f(xA) + ' ' + f(yCt + rB) + 'L' + f(xA) + ' ' + f(yRb - bob.c) + 'M' + f(xA) + ' ' +
    f(yRb + bob.h + bob.c) + 'L' + f(xA) + ' ' + f(yCb - rB) + '"/>';
  [['1', '2'], ['3', '4'], ['5', '6'], ['13', '14']].forEach(function(q) {
    var xc = xt[q[0]];
    out += _ctlBloque(na.bloque, xc, yCc, na.svg) +
      '<path class="s2" d="M' + f(xc) + ' ' + f(yCt + rB) + 'L' + f(xc) + ' ' + f(yCc) + 'M' + f(xc) + ' ' + f(yCc + na.H) +
      'L' + f(xc) + ' ' + f(yCb - rB) + '"/>';
  });
  [['A1', 'A2'], ['1', '2'], ['3', '4'], ['5', '6'], ['13', '14']].forEach(function(q) {
    var xc = xt[q[0]];
    out += _ctlBorne(xc, yCt, rB) + _ctlBorne(xc, yCb, rB) + _ctlT(xc + 2.5, yCt - 1, q[0], mini) + _ctlT(xc + 2.5, yCb + mini, q[1], mini);
  });
  var yLk = yCc + na.med[1];
  out += '<path class="s1" fill="none" stroke-dasharray="1.6 1" d="M' + f(xA + bob.w / 2) + ' ' + f(yLk) + 'L' +
    f(xt['13'] + na.med[0]) + ' ' + f(yLk) + '"/>';
  return { out: out, xt: xt };
}




function _ctlAparatoTimer(x0, y0, tension, nombre) {
  var f = _uniF, L = _ctlL(), rB = 0.035 * L, chica = _CTL_LETRA * 0.8, mini = _CTL_LETRA * 0.6;
  var tA1 = x0 + 14, tA2 = x0 + 32, yTt = y0 + 6, xNC = x0 + 8, xC = x0 + 23, xNO = x0 + 38, yTb = y0 + 60;
  var out = '<rect class="s1" fill="none" stroke-dasharray="4 2" x="' + f(x0) + '" y="' + f(y0 - 2) + '" width="46" height="72"/>';
  out += _ctlBorne(tA1, yTt, rB) + _ctlBorne(tA2, yTt, rB) + _ctlT(tA1 - 2.5, yTt + mini * 0.36, 'A1', mini, 'end') +
         _ctlT(tA2 + 2.5, yTt + mini * 0.36, 'A2', mini);
  var ycc = y0 + 24, rc = 8, xcc = x0 + 23, t = String(tension).split(' ');
  out += '<path class="s2" d="M' + f(tA1) + ' ' + f(yTt + rB) + 'L' + f(tA1) + ' ' + f(ycc - 4) + 'L' + f(xcc - rc * 0.7) + ' ' + f(ycc - 4) +
    'M' + f(tA2) + ' ' + f(yTt + rB) + 'L' + f(tA2) + ' ' + f(ycc - 4) + 'L' + f(xcc + rc * 0.7) + ' ' + f(ycc - 4) + '"/>';
  out += '<circle class="s2" fill="none" cx="' + f(xcc) + '" cy="' + f(ycc) + '" r="' + rc + '"/>' +
    _ctlT(xcc, ycc - 1.5, t[0], mini * 0.75, 'middle') + _ctlT(xcc, ycc + 2.8, t.slice(1).join(' '), mini * 0.75, 'middle') +
    '<path class="s1" fill="none" d="M' + f(xcc - 3) + ' ' + f(ycc + 5) + 'Q' + f(xcc - 1.5) + ' ' + f(ycc + 3.6) + ' ' +
    f(xcc) + ' ' + f(ycc + 5) + 'T' + f(xcc + 3) + ' ' + f(ycc + 5) + '"/>';
  out += _ctlT(xcc, y0 + 42, 'TIMER ' + nombre, chica, 'middle');
  var yTop = y0 + 50, yCc = y0 + 54;
  out += '<path class="s2" fill="none" d="M' + f(xNC) + ' ' + f(yTb - rB) + 'L' + f(xNC) + ' ' + f(yTop) +
    'M' + f(xNO) + ' ' + f(yTb - rB) + 'L' + f(xNO) + ' ' + f(yTop) +
    'M' + f(xC) + ' ' + f(yTb - rB) + 'L' + f(xC) + ' ' + f(yCc) + 'L' + f(xNC + 0.8) + ' ' + f(yTop + 0.3) + '"/>' +
    '<circle class="s3" cx="' + f(xNO) + '" cy="' + f(yTop) + '" r="0.9"/>';
  [[xNC, 'NC'], [xC, 'C'], [xNO, 'NO']].forEach(function(q) {
    out += _ctlBorne(q[0], yTb, rB) + _ctlT(q[0], yTb + rB + mini + 1, q[1], mini, 'middle');
  });
  return { out: out, tA1: tA1, tA2: tA2, yTt: yTt, xNC: xNC, xC: xC, xNO: xNO, yTb: yTb };
}





function _ctlBotonera(mando, piloto, conN, K) {
  var f = _uniF, L = _ctlL(), rB = 0.035 * L, LT = _CTL_LETRA, chica = LT * 0.8, mini = LT * 0.6;
  var R2 = conN ? 'N' : 'L2';
  var pnc = _ctlContacto('pulsador-nc'), pna = _ctlContacto('pulsador-na'), na = _ctlContacto('contacto-na');
  var nc = _ctlContacto('contacto-nc'), bob = _ctlBobina('bobina'), paso = _ctlCelda('bornera-paso');
  var tope = _ctlCelda('bornera-tope'), sep = _ctlCelda('bornera-separador');
  var pilTxt = _ctlPiloto(false), pBloque = (_ctlPieza('piloto') || {}).bloque;
  if (!pnc || !pna || !na || !nc || !bob || !paso || !tope || !sep || !pilTxt) return null;
  var PC_ = _CTL_PC, P_ENT = _CTL_P_ENT, P_LARGO = _CTL_P_LARGO;
  var out = '', cables = [], puntos = [], xMin, xMax, yMax, yMinV;
  if (mando) {



    var x0 = 40, xK = x0 + 32, H = pnc.H, xDer = xK + 56;
    var ySB1, yN1, yK, yN2, yA1, yRect, yA2, yPc, yP0, yP1, yL2;
    var armar = function(e) {
      ySB1 = 30 + e; yN1 = ySB1 + H + 22 + e; yK = yN1 + 18 + e; yN2 = yK + H + 22 + e; yA1 = yN2 + 22 + e;
      yRect = yA1 + bob.c; yA2 = yRect + bob.h + bob.c;
      yPc = yRect + bob.h / 2; yP0 = yPc - PC_ + P_ENT; yP1 = yP0 + P_LARGO;
      yL2 = (piloto ? Math.max(yA2, yP1) : yA2) + 30 + e;
    };
    armar(0); armar(_ctlExtra(yL2, 6));
    if (piloto) {
      out += _ctlBloque(pBloque, xK - PC_, yPc - PC_, pilTxt);
      out += _ctlT(xK + PC_ + 3, yPc + chica * 0.36, 'H1', chica) + _ctlT(xK + 1.5, yP0 + mini * 0.9, 'X1', mini) + _ctlT(xK + 1.5, yP1, 'X2', mini);
      cables.push({ pts: [[xK, yN2], [xK, yP0]] }, { pts: [[xK, yP1], [xK, yL2]] });
      puntos.push([xK, yN2], [xK, yL2]);
    }
    out += _ctlBloque(pnc.bloque, x0, ySB1, pnc.svg) + _ctlBloque(pna.bloque, x0, yK, pna.svg) +
           _ctlBloque(na.bloque, xK, yK, na.svg) + _ctlBloque(bob.bloque, x0, yRect, bob.svg);
    var yMed = function(y) { return y + H / 2 + chica * 0.36; };
    out += _ctlT(x0 + pnc.xAcc - 2, yMed(ySB1), 'SB1', chica, 'end') + _ctlT(x0 + pna.xAcc - 2, yMed(yK), 'SB2', chica, 'end');
    out += _ctlT(xK + 3, yMed(yK), K, chica) + _ctlT(x0 - bob.w / 2 - 2, yRect + bob.h / 2 + chica * 0.36, K, chica, 'end');
    [[x0, ySB1, '1', '2'], [x0, yK, '3', '4'], [xK, yK, '13', '14']].forEach(function(q) {
      out += _ctlT(q[0] + 1.5, q[1] + mini, q[2], mini) + _ctlT(q[0] + 1.5, q[1] + H, q[3], mini);
    });
    out += _ctlT(x0 + 1.5, yA1 + mini * 0.9, 'A1', mini) + _ctlT(x0 + 1.5, yA2, 'A2', mini);
    cables.push({ pts: [[0, 0], [xDer, 0]] }, { pts: [[0, yL2], [xDer, yL2]] });
    cables.push({ pts: [[x0, 0], [x0, ySB1]] }, { pts: [[x0, ySB1 + H], [x0, yK]] }, { pts: [[x0, yN1], [xK, yN1], [xK, yK]] });
    cables.push({ pts: [[x0, yK + H], [x0, yA1]] }, { pts: [[xK, yK + H], [xK, yN2], [x0, yN2]] }, { pts: [[x0, yA2], [x0, yL2]] });
    puntos.push([x0, 0], [x0, yN1], [x0, yN2], [x0, yL2]);
    out += _ctlT(-4, LT * 0.36, 'L1', LT, 'end') + _ctlT(-4, yL2 + LT * 0.36, R2, LT, 'end');
    xMin = -4 - 2 * LT * _CTL_ANCHO_LETRA - 8; xMax = xDer + 8; yMax = yL2 + 10; yMinV = -10;
  } else {


    var yBor = 80, x = 0, cx = {};
    var conL2 = piloto || conN;
    out += _ctlBloque(tope.bloque, 0, yBor, tope.svg); x += tope.w;
    (conL2 ? ['A1', 'L1', 'L2', 'NO'] : ['A1', 'L1', 'NO']).forEach(function(m) {
      out += _ctlBloque(paso.bloque, x, yBor, paso.svg.replace(/(<tspan id="borne">)[^<]*/, '$1' + _uniEsc(m === 'L2' ? R2 : m)));
      cx[m] = x + paso.cx; x += paso.w;
    });
    out += _ctlBloque(sep.bloque, x, yBor, sep.svg);
    var xFinB = x + sep.w, yBorB = yBor + paso.h;

    var w = paso.w, xs2 = xFinB + 18, xs1 = xs2 + w, xl = xs1 + w, yb0 = 16, yb1 = 52, yBt = 20, yBb = 48;
    var nCel = piloto ? 3 : 2;
    out += '<rect class="s2" fill="none" x="' + f(xs2 - w / 2) + '" y="' + f(yb0) + '" width="' + f(nCel * w) + '" height="' + f(yb1 - yb0) + '"/>';
    for (var i = 1; i < nCel; i++) out += '<path class="s2" d="M' + f(xs2 - w / 2 + i * w) + ' ' + f(yb0) + 'L' + f(xs2 - w / 2 + i * w) + ' ' + f(yb1) + '"/>';
    if (piloto) {
      var yPcB = (yBt + yBb) / 2;
      out += _ctlBloque(pBloque, xl - PC_, yPcB - PC_, _ctlPilotoSinTramos());
      out += '<path class="s2" d="M' + f(xl) + ' ' + f(yBt + rB) + 'L' + f(xl) + ' ' + f(yPcB - PC_) + 'M' + f(xl) + ' ' +
        f(yPcB + PC_) + 'L' + f(xl) + ' ' + f(yBb - rB) + '"/>';
      out += _ctlBorne(xl, yBt, rB) + _ctlBorne(xl, yBb, rB) + _ctlT(xl + 2.5, yBt - 1, 'X2', mini) + _ctlT(xl + 2.5, yBb + mini, 'X1', mini);
      out += _ctlT(xl + w / 2 + 2, yPcB + chica * 0.36, 'H1', chica);
    }
    var yC = (yBt + yBb) / 2 - na.H / 2;
    out += _ctlBloque(na.bloque, xs2, yC, na.svg) + _ctlBloque(nc.bloque, xs1, yC, nc.svg);
    out += '<path class="s2" d="M' + f(xs2) + ' ' + f(yBt + rB) + 'L' + f(xs2) + ' ' + f(yC) + 'M' + f(xs2) + ' ' + f(yC + na.H) +
      'L' + f(xs2) + ' ' + f(yBb - rB) + 'M' + f(xs1) + ' ' + f(yBt + rB) + 'L' + f(xs1) + ' ' + f(yC) + 'M' + f(xs1) + ' ' +
      f(yC + nc.H) + 'L' + f(xs1) + ' ' + f(yBb - rB) + '"/>';
    out += _ctlBorne(xs2, yBt, rB) + _ctlBorne(xs2, yBb, rB) + _ctlBorne(xs1, yBt, rB) + _ctlBorne(xs1, yBb, rB);
    out += _ctlT(xs2 + 2.5, yBt - 1, '4', mini) + _ctlT(xs2 + 2.5, yBb + mini, '3', mini) +
           _ctlT(xs1 + 2.5, yBt - 1, '2', mini) + _ctlT(xs1 + 2.5, yBb + mini, '1', mini);
    var yLink = yC + (na.med[1] + nc.med[1]) / 2, xAc = xs2 - w / 2 - 8, g = 0.12 * na.H, s = 0.08 * na.H;
    out += '<path class="s1" fill="none" stroke-dasharray="1.6 1" d="M' + f(xs1 + nc.med[0]) + ' ' + f(yLink) + 'L' + f(xAc) + ' ' + f(yLink) + '"/>' +
      '<path class="s2" fill="none" d="M' + f(xAc + s) + ' ' + f(yLink - g) + 'L' + f(xAc) + ' ' + f(yLink - g) + 'L' + f(xAc) + ' ' +
      f(yLink + g) + 'L' + f(xAc + s) + ' ' + f(yLink + g) + '"/>';
    out += _ctlT(xAc - 2, yLink - 4, 'SB2', chica, 'end') + _ctlT(xAc - 2, yLink + 4 + chica * 0.72, 'SB1', chica, 'end');
    var xR = piloto ? xl + w / 2 + 18 : xs1 + w;
    cables.push({ pts: [[xs1, yBb + rB], [xs1, 60], [cx.L1, 60], [cx.L1, yBor]] });
    cables.push({ pts: [[xs1, yBt - rB], [xs1, 10], [xR, 10], [xR, 66], [cx.NO, 66], [cx.NO, yBor]] });
    cables.push({ pts: [[xs2, yBb + rB], [xs2, 66]] });
    puntos.push([xs2, 66]);
    if (piloto) {
      cables.push({ pts: [[xl, yBt - rB], [xl, 6], [cx.A1, 6], [cx.A1, yBor]] }, { pts: [[xs2, yBt - rB], [xs2, 6]] });
      cables.push({ pts: [[xl, yBb + rB], [xl, 72], [cx.L2, 72], [cx.L2, yBor]] });
      puntos.push([xs2, 6]);
    } else cables.push({ pts: [[xs2, yBt - rB], [xs2, 6], [cx.A1, 6], [cx.A1, yBor]] });
    var yCt = 162, yCb = 188, xA = cx.A1;
    var ap = _ctlAparatoContactor(xA, yCt, yCb, K, [12, 10, 30]), xt = ap.xt;
    out += ap.out;
    cables.push({ pts: [[cx.A1, yBorB], [xA, yCt - rB]] });
    cables.push({ pts: [[cx.L1, yBorB], [cx.L1, 136], [xt['1'], 136], [xt['1'], yCt - rB]] });
    cables.push({ pts: [[cx.NO, yBorB], [cx.NO, conL2 ? 128 : 130], [xt['13'], conL2 ? 128 : 130], [xt['13'], yCt - rB]] });
    cables.push({ pts: [[xt['13'], yCb + rB], [xt['13'], yCb + 28], [xA - 16, yCb + 28], [xA - 16, 138], [xA, 138]] });
    xMin = xA - 24 - 8; xMax = Math.max(xR, xt['13'] + 12) + 10; yMax = yCb + 36 + 8; yMinV = -2;
    if (conN) {


      var xNb = xA + 4 * 20 + 40, yN2c = yCb + 36, yNb = yN2c + 20;
      cables.push({ pts: [[cx.L2, yBorB], [cx.L2, 132], [xNb, 132], [xNb, yNb]] });
      cables.push({ pts: [[xA, yCb + rB], [xA, yN2c], [xNb, yN2c]] });
      puntos.push([xNb, yN2c]);
      out += _ctlLlegadaN(xNb, yNb);
      xMax = Math.max(xMax, xNb + 20); yMax = yNb + 4 + chica + 6;
    } else if (piloto) {
      cables.push({ pts: [[cx.L2, yBorB], [cx.L2, 132], [xt['3'], 132], [xt['3'], yCt - rB]] });
      cables.push({ pts: [[xA, yCb + rB], [xA, yCb + 36], [xA - 24, yCb + 36], [xA - 24, 148], [xt['3'], 148]] });
      puntos.push([xt['3'], 148]);
    } else {
      cables.push({ pts: [[xA, yCb + rB], [xA, yCb + 36], [xA - 24, yCb + 36], [xA - 24, 148], [xt['3'], 148], [xt['3'], yCt - rB]] });
    }
    puntos.push([xA, 138]);
  }
  out += _ctlCablesConSaltos(cables, _CTL_RA);
  puntos.forEach(function(q) { out += _ctlPunto(q); });
  return _ctlSvg(xMin, yMinV, xMax, yMax, out);
}


function _ctlTimer(mando, tension, conN, K, T) {
  var f = _uniF, L = _ctlL(), rB = 0.035 * L, LT = _CTL_LETRA, chica = LT * 0.8, mini = LT * 0.6;
  var R2 = conN ? 'N' : 'L2';
  var na = _ctlContacto('contacto-na'), bob = _ctlBobina('bobina'), bt = _ctlBobina('bobina-temporizador');
  if (!na || !bob || !bt) return null;
  var out = '', cables = [], puntos = [], xMin, xMax, yMin, yMax;
  if (mando) {
    var x1 = 40, x2 = x1 + 34, H = na.H, xDer = x2 + 40, yC0, yA1, yRect, yA2, yL2;
    var armar = function(e) {
      yC0 = 24 + e; yA1 = yC0 + H + 10 + e; yRect = yA1 + bob.c; yA2 = yRect + bob.h + bob.c; yL2 = yA2 + 12 + e;
    };
    armar(0); armar(_ctlExtra(yL2, 3));
    out += _ctlBloque(bt.bloque, x1, yRect, bt.svg) + _ctlBloque(na.bloque, x2, yC0, na.svg) + _ctlBloque(bob.bloque, x2, yRect, bob.svg);
    var yMedB = yRect + bob.h / 2 + chica * 0.36;
    out += _ctlT(x1 - bt.w / 2 - 2, yMedB, T, chica, 'end') + _ctlT(x2 - bob.w / 2 - 2, yMedB, K, chica, 'end');
    out += _ctlT(x2 + na.izq - 2, yC0 + H / 2 + chica * 0.36, T, chica, 'end');
    out += _ctlT(x2 + 1.5, yC0 + mini, 'C', mini) + _ctlT(x2 + 1.5, yC0 + H, 'NO', mini);
    [x1, x2].forEach(function(x) { out += _ctlT(x + 1.5, yA1 + mini * 0.9, 'A1', mini) + _ctlT(x + 1.5, yA2, 'A2', mini); });
    cables.push({ pts: [[0, 0], [xDer, 0]] }, { pts: [[0, yL2], [xDer, yL2]] });
    cables.push({ pts: [[x1, 0], [x1, yA1]] }, { pts: [[x1, yA2], [x1, yL2]] });
    cables.push({ pts: [[x2, 0], [x2, yC0]] }, { pts: [[x2, yC0 + H], [x2, yA1]] }, { pts: [[x2, yA2], [x2, yL2]] });
    puntos.push([x1, 0], [x2, 0], [x1, yL2], [x2, yL2]);
    out += _ctlT(-4, LT * 0.36, 'L1', LT, 'end') + _ctlT(-4, yL2 + LT * 0.36, R2, LT, 'end');
    xMin = -4 - 2 * LT * _CTL_ANCHO_LETRA - 8; xMax = xDer + 8; yMin = -10; yMax = yL2 + 10;
  } else {
    var tm = _ctlAparatoTimer(0, 0, tension, T);
    out += tm.out;
    var xA = 70, yCt = tm.yTt, yCb = yCt + 26;
    var ap = _ctlAparatoContactor(xA, yCt, yCb, K, [10, 8, 28]), xt = ap.xt;
    out += ap.out;
    var xR = xA + 4 * 20 + 20;
    cables.push({ pts: [[xt['1'], yCt - rB], [xt['1'], -10], [tm.tA1, -10], [tm.tA1, tm.yTt - rB]] });                                  
    cables.push({ pts: [[tm.xC, tm.yTb + rB], [tm.xC, 80], [-8, 80], [-8, -10], [tm.tA1, -10]] });                  
    cables.push({ pts: [[tm.xNO, tm.yTb + rB], [tm.xNO, 86], [54, 86], [54, -2], [xA, -2], [xA, yCt - rB]] });                             
    puntos.push([tm.tA1, -10]);
    yMax = 92;
    if (conN) {


      var yNb = 96;
      cables.push({ pts: [[tm.tA2, tm.yTt - rB], [tm.tA2, -18], [xR, -18], [xR, yNb]] });
      cables.push({ pts: [[xA, yCb + rB], [xA, 62], [xR, 62]] });
      puntos.push([xR, 62]);
      out += _ctlLlegadaN(xR, yNb);
      yMax = yNb + 4 + chica + 6;
    } else {
      cables.push({ pts: [[xt['3'], yCt - rB], [xt['3'], -18], [tm.tA2, -18], [tm.tA2, tm.yTt - rB]] });
      cables.push({ pts: [[xA, yCb + rB], [xA, 62], [xR, 62], [xR, -18], [xt['3'], -18]] });
      puntos.push([xt['3'], -18]);
    }
    xMin = -16; xMax = xR + 8 + (conN ? 12 : 0); yMin = -26;
  }
  out += _ctlCablesConSaltos(cables, _CTL_RA);
  puntos.forEach(function(q) { out += _ctlPunto(q); });
  return _ctlSvg(xMin, yMin, xMax, yMax, out);
}







function _ctlMOA(mando, tension, conN, K, T) {
  var f = _uniF, L = _ctlL(), rB = 0.035 * L, LT = _CTL_LETRA, chica = LT * 0.8, mini = LT * 0.6;
  var R2 = conN ? 'N' : 'L2', HP = 'H1';
  var na = _ctlContacto('contacto-na'), nc = _ctlContacto('contacto-nc'), pna = _ctlContacto('pulsador-na');
  var pnc = _ctlContacto('pulsador-nc'), bob = _ctlBobina('bobina'), bt = _ctlBobina('bobina-temporizador');
  var sel = _ctlSelector(), paso = _ctlCelda('bornera-paso'), tope = _ctlCelda('bornera-tope'), sep = _ctlCelda('bornera-separador');
  var pilTxt = _ctlPiloto(false), pBloque = (_ctlPieza('piloto') || {}).bloque;
  if (!na || !nc || !pna || !pnc || !bob || !bt || !sel || !paso || !tope || !sep || !pilTxt) return null;
  var PC_ = _CTL_PC, P_ENT = _CTL_P_ENT, P_LARGO = _CTL_P_LARGO;
  var out = '', cables = [], puntos = [], xMin, xMax, yMin, yMax;
  if (mando) {
    var xT = 20, xM = 60, xAu = xM + 30, xS = (xM + xAu) / 2, xK = xM + 24, xR = xAu + 30, H = na.H;

    var yS, yAb, ySB1, yN1, yK, yN2, yA1, yRect, yA2, yPc, yP0, yP1, yL2, xDer = xR + 20;
    var armar = function(e) {
      yS = 22 + e; yAb = yS + sel.H + 8 + e; ySB1 = yAb + 14 + e; yN1 = ySB1 + H + 18 + e; yK = yN1 + 16 + e;
      yN2 = yK + H + 18 + e; yA1 = yN2 + 18 + e;
      yRect = yA1 + bob.c; yA2 = yRect + bob.h + bob.c; yPc = yRect + bob.h / 2; yP0 = yPc - PC_ + P_ENT; yP1 = yP0 + P_LARGO;
      yL2 = Math.max(yA2, yP1) + 24 + e;
    };
    armar(0); armar(_ctlExtra(yL2, 8));
    out += _ctlBloque(sel.bloque, xS, yS, sel.svg) + _ctlBloque(pnc.bloque, xM, ySB1, pnc.svg) + _ctlBloque(na.bloque, xAu, ySB1, na.svg);
    out += _ctlBloque(pna.bloque, xM, yK, pna.svg) + _ctlBloque(na.bloque, xK, yK, na.svg);
    out += _ctlBloque(bt.bloque, xT, yRect, bt.svg) + _ctlBloque(bob.bloque, xM, yRect, bob.svg) + _ctlBloque(pBloque, xK - PC_, yPc - PC_, pilTxt);
    var yMed = function(y) { return y + H / 2 + chica * 0.36; }, yMedB = yRect + bob.h / 2 + chica * 0.36;
    out += _ctlT(xS + 1.5, yS + mini * 0.9, 'C', mini) +
      _ctlT(xS - sel.d - 1.2, yS + sel.H, '1', mini, 'end') + _ctlT(xS + sel.d + 1.2, yS + sel.H, '2', mini);
    out += _ctlT(xM + pnc.xAcc - 2, yMed(ySB1), 'SB1', chica, 'end') + _ctlT(xM + pna.xAcc - 2, yMed(yK), 'SB2', chica, 'end');
    out += _ctlT(xAu + na.izq - 2, yMed(ySB1), T, chica, 'end') + _ctlT(xK + 3, yMed(yK), K, chica);
    out += _ctlT(xT - bt.w / 2 - 2, yMedB, T, chica, 'end') + _ctlT(xM - bob.w / 2 - 2, yMedB, K, chica, 'end') +
           _ctlT(xK + PC_ + 3, yPc + chica * 0.36, HP, chica);
    [[xM, ySB1, '1', '2'], [xAu, ySB1, 'C', 'NO'], [xM, yK, '3', '4'], [xK, yK, '13', '14']].forEach(function(q) {
      out += _ctlT(q[0] + 1.5, q[1] + mini, q[2], mini) + _ctlT(q[0] + 1.5, q[1] + H, q[3], mini);
    });
    [xT, xM].forEach(function(x) { out += _ctlT(x + 1.5, yA1 + mini * 0.9, 'A1', mini) + _ctlT(x + 1.5, yA2, 'A2', mini); });
    out += _ctlT(xK + 1.5, yP0 + mini * 0.9, 'X1', mini) + _ctlT(xK + 1.5, yP1, 'X2', mini);
    cables.push({ pts: [[0, 0], [xDer, 0]] }, { pts: [[0, yL2], [xDer, yL2]] });
    cables.push({ pts: [[xT, 0], [xT, yA1]] }, { pts: [[xT, yA2], [xT, yL2]] });
    cables.push({ pts: [[xS, 0], [xS, yS]] });
    cables.push({ pts: [[xS - sel.d, yS + sel.H], [xS - sel.d, yAb], [xM, yAb], [xM, ySB1]] }, { pts: [[xM, ySB1 + H], [xM, yK]] },
                { pts: [[xM, yN1], [xK, yN1], [xK, yK]] });
    cables.push({ pts: [[xM, yK + H], [xM, yA1]] }, { pts: [[xK, yK + H], [xK, yN2], [xM, yN2]] });
    cables.push({ pts: [[xS + sel.d, yS + sel.H], [xS + sel.d, yAb], [xAu, yAb], [xAu, ySB1]] },
                { pts: [[xAu, ySB1 + H], [xAu, ySB1 + H + 4], [xR, ySB1 + H + 4], [xR, yN2], [xK, yN2]] });
    cables.push({ pts: [[xK, yN2], [xK, yP0]] }, { pts: [[xK, yP1], [xK, yL2]] }, { pts: [[xM, yA2], [xM, yL2]] });
    puntos.push([xM, yN1], [xM, yN2], [xK, yN2], [xT, 0], [xS, 0], [xT, yL2], [xM, yL2], [xK, yL2]);
    out += _ctlT(-4, LT * 0.36, 'L1', LT, 'end') + _ctlT(-4, yL2 + LT * 0.36, R2, LT, 'end');
    xMin = -4 - 2 * LT * _CTL_ANCHO_LETRA - 8; xMax = xDer + 8; yMin = -10; yMax = yL2 + 10;
  } else {
    var yBor = 100, x = 0, cx = {};
    out += _ctlBloque(tope.bloque, 0, yBor, tope.svg); x += tope.w;
    ['A1', 'L1', 'L2', 'NO', 'A'].forEach(function(m) {
      out += _ctlBloque(paso.bloque, x, yBor, paso.svg.replace(/(<tspan id="borne">)[^<]*/, '$1' + _uniEsc(m === 'L2' ? R2 : m)));
      cx[m] = x + paso.cx; x += paso.w;
    });
    out += _ctlBloque(sep.bloque, x, yBor, sep.svg);
    var yBorB = yBor + paso.h, w = paso.w;

    var xs2 = cx.A1 - w, xl = cx.A1, xs1 = cx.L1, yb0 = 16, yb1 = 52, yBt = 20, yBb = 48, xB0 = xs2 - w / 2;
    out += '<rect class="s2" fill="none" x="' + f(xB0) + '" y="' + f(yb0) + '" width="' + f(3 * w) + '" height="' + f(yb1 - yb0) + '"/>';
    [1, 2].forEach(function(i) { out += '<path class="s2" d="M' + f(xB0 + i * w) + ' ' + f(yb0) + 'L' + f(xB0 + i * w) + ' ' + f(yb1) + '"/>'; });
    var yC = (yBt + yBb) / 2 - na.H / 2;
    out += _ctlBloque(na.bloque, xs2, yC, na.svg) + _ctlBloque(nc.bloque, xs1, yC, nc.svg);
    [xs2, xs1].forEach(function(xc) {
      out += '<path class="s2" d="M' + f(xc) + ' ' + f(yBt + rB) + 'L' + f(xc) + ' ' + f(yC) + 'M' + f(xc) + ' ' + f(yC + na.H) +
        'L' + f(xc) + ' ' + f(yBb - rB) + '"/>';
    });
    var yPcB = (yBt + yBb) / 2;
    out += _ctlBloque(pBloque, xl - PC_, yPcB - PC_, _ctlPilotoSinTramos()) +
      '<path class="s2" d="M' + f(xl) + ' ' + f(yBt + rB) + 'L' + f(xl) + ' ' + f(yPcB - PC_) + 'M' + f(xl) + ' ' + f(yPcB + PC_) +
      'L' + f(xl) + ' ' + f(yBb - rB) + '"/>';
    [xs2, xl, xs1].forEach(function(xc) { out += _ctlBorne(xc, yBt, rB) + _ctlBorne(xc, yBb, rB); });
    out += _ctlT(xs2 + 2.5, yBt - 1, '4', mini) + _ctlT(xs2 + 2.5, yBb + mini, '3', mini) + _ctlT(xl + 2.5, yBt - 1, 'X2', mini) +
      _ctlT(xl + 2.5, yBb + mini, 'X1', mini) + _ctlT(xs1 + 2.5, yBt - 1, '2', mini) + _ctlT(xs1 + 2.5, yBb + mini, '1', mini);
    out += _ctlT(xs2 + 1.5, yb0 - 3, 'SB2', mini) + _ctlT(xl + 1.5, yb0 - 3, HP, mini) + _ctlT(xs1 + 1.5, yb0 - 3, 'SB1', mini);

    var xSe = cx.A + 30, ySe = 34, rSe = 18, x1s = xSe - 7, x2s = xSe + 7, yTs = ySe - 12, yCs = ySe + 13, xRs = xSe + 30;
    out += '<circle class="s2" fill="none" cx="' + f(xSe) + '" cy="' + f(ySe) + '" r="' + rSe + '"/>' + _ctlBorne(x1s, yTs, rB) +
      _ctlBorne(x2s, yTs, rB) + _ctlBorne(xSe, yCs, rB) +
      _ctlT(x1s, yTs + rB + mini + 0.8, '1', mini, 'middle') + _ctlT(x2s, yTs + rB + mini + 0.8, '2', mini, 'middle') +
      _ctlT(xSe, yCs - rB - 1.2, 'C', mini, 'middle') + _ctlT(xSe + rSe + 2, ySe + chica * 0.36, 'MOA', chica);
    var yT2 = -3, yT1 = 4, yB1 = 62, yB2 = 70, yCw = 80, yAw = 88, xL1 = xB0 - 7, xL2 = xB0 - 14;
    cables.push({ pts: [[xs2, yBt - rB], [xs2, yT1], [xL1, yT1], [xL1, yB1], [cx.A1, yB1]] });
    cables.push({ pts: [[xl, yBb + rB], [cx.A1, yBor]] });
    cables.push({ pts: [[xs2, yBb + rB], [xs2, yB2], [xL2, yB2], [xL2, yT2], [cx.NO, yT2], [cx.NO, yBor]] });
    cables.push({ pts: [[xs1, yBt - rB], [xs1, yT2]] });
    cables.push({ pts: [[xl, yBt - rB], [xl, yT1], [cx.L2, yT1], [cx.L2, yBor]] });
    cables.push({ pts: [[xs1, yBb + rB], [xs1, yB1], [cx.A, yB1], [cx.A, yT1], [x1s, yT1], [x1s, yTs - rB]] });
    cables.push({ pts: [[xSe, yCs + rB], [xSe, yCw], [cx.L1, yCw], [cx.L1, yBor]] });
    cables.push({ pts: [[x2s, yTs - rB], [x2s, yT1], [xRs, yT1], [xRs, yAw], [cx.A, yAw], [cx.A, yBor]] });
    puntos.push([cx.A1, yB1], [xs1, yT2]);

    var tm = _ctlAparatoTimer(-56, 170, tension, T);
    out += tm.out;
    var xA = cx.A1, yCt = 186, yCb = yCt + 26;
    var ap = _ctlAparatoContactor(xA, yCt, yCb, K, [10, 8, 28]), xt = ap.xt;
    out += ap.out;
    cables.push({ pts: [[cx.A1, yBorB], [xA, yCt - rB]] });
    cables.push({ pts: [[cx.L1, yBorB], [cx.L1, 152], [xt['1'], 152], [xt['1'], yCt - rB]] });
    var xNb = xA + 4 * 20 + 40, yNb = 276;
    if (!conN) cables.push({ pts: [[cx.L2, yBorB], [cx.L2, 156], [xt['3'], 156], [xt['3'], yCt - rB]] });
    else cables.push({ pts: [[cx.L2, yBorB], [cx.L2, 156], [xNb, 156], [xNb, yNb]] });
    cables.push({ pts: [[cx.NO, yBorB], [cx.NO, 148], [xt['13'], 148], [xt['13'], yCt - rB]] });
    cables.push({ pts: [[tm.tA1, tm.yTt - rB], [tm.tA1, 158], [xt['1'], 158]] });
    if (!conN) {
      cables.push({ pts: [[tm.tA2, tm.yTt - rB], [tm.tA2, 164], [xt['3'], 164]] });
      cables.push({ pts: [[xA, yCb + rB], [xA, 246], [130, 246], [130, 170], [xt['3'], 170]] });
    } else {
      cables.push({ pts: [[tm.tA2, tm.yTt - rB], [tm.tA2, 164], [xNb, 164]] });
      cables.push({ pts: [[xA, yCb + rB], [xA, 246], [xNb, 246]] });
      out += _ctlLlegadaN(xNb, yNb);
    }
    cables.push({ pts: [[xt['13'], yCb + rB], [xt['13'], 240], [2, 240], [2, 150], [xA, 150]] });
    cables.push({ pts: [[tm.xNO, tm.yTb + rB], [tm.xNO, 250], [2, 250], [2, 240]] });
    cables.push({ pts: [[cx.A, yBorB], [cx.A, 146], [120, 146], [120, 258], [tm.xC, 258], [tm.xC, tm.yTb + rB]] });
    puntos.push([xt['1'], 158], [xA, 150], [2, 240]);
    if (!conN) puntos.push([xt['3'], 164], [xt['3'], 170]); else puntos.push([xNb, 164], [xNb, 246]);
    xMin = -56 - 8; xMax = Math.max(xRs, xA + 4 * 20 + 10, conN ? xNb + 20 : 0) + 10; yMin = -8;
    yMax = conN ? yNb + 4 + chica + 6 : 266;
  }
  out += _ctlCablesConSaltos(cables, _CTL_RA);
  puntos.forEach(function(q) { out += _ctlPunto(q); });
  return _ctlSvg(xMin, yMin, xMax, yMax, out);
}





function _ctlTension(conN) {
  var fm = (typeof _fichaDatos === 'function') ? _fichaDatos() : {};
  var t = String(fm.tension || '');
  var m = /(\d+)\s*\/\s*(\d+)/.exec(t), v;
  if (m) v = conN ? m[2] : m[1];
  else {
    var m1 = /(\d+)/.exec(t);
    v = m1 ? m1[1] : '220';
  }
  return v + ' VAC';
}



function _ctlListaRotulos(rots) {
  var num = function(r) { var m = /-(\d+)$/.exec(r); return m ? parseInt(m[1], 10) : NaN; };
  var partes = [], ini = 0;
  for (var i = 1; i <= rots.length; i++) {
    var sigue = i < rots.length && num(rots[i]) === num(rots[i - 1]) + 1 &&
                String(rots[i]).replace(/\d+$/, '') === String(rots[i - 1]).replace(/\d+$/, '');
    if (sigue) continue;
    var n = i - ini;
    if (n >= 3) partes.push(rots[ini] + ' al ' + rots[i - 1]);
    else for (var k = ini; k < i; k++) partes.push(rots[k]);
    ini = i;
  }
  if (partes.length <= 1) return partes.join('');
  return partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
}



function controlDiagramas() {
  if (typeof _uniDatos !== 'function' || !window._panelBusbarData) return { hojas: [], faltan: [] };
  var D = _uniDatos();
  var pb = window._panelBusbarData || {};
  var conN = /\+N/.test(pb.fases || '');
  var hojas = [], faltan = [];
  var poner = function(titulo, sub, mando, conexion) {
    if (mando && conexion) hojas.push({ titulo: titulo, sub: sub, mando: mando, conexion: conexion });
  };
  if (D.pilotos) {
    var fases = ['R', 'S', 'T'];
    poner('PILOTOS DE PRESENCIA DE TENSIÓN', conN ? '3F+N' : '3F',
          _ctlMandoPilotos(fases, conN), _ctlConexionPilotos(fases, conN));
  }
  if (D.medidor) {



    var _nTcCtl = (typeof _medidorInfo === 'function') ? _medidorInfo().nTc : 3;
    if (_nTcCtl !== 3) {
      faltan.push('PM (analizador en ' + (pb.fases || '') + ')');
    } else {
      var tc = D.tc || {}, tcTxt = (tc.primario || '') + '/' + (tc.secundario || 5) + 'A';                                  
      poner('ANALIZADOR DE RED', 'MEDIDOR MULTIFUNCIÓN', _ctlAnalizador(conN, tcTxt, true), _ctlAnalizador(conN, tcTxt, false));
    }
  }
  var tension = _ctlTension(conN);
  var entre = conN ? 'ENTRE L1 Y N' : 'ENTRE L1 Y L2';





  var grupos = [], porClave = {};
  (D.circuitos || []).forEach(function(c) {
    if (!c.contactor || c.dpsFila) return;
    var rot = String(c.rotulo || '');
    var sel = !!c.selector, tim = !!c.timer, bot = !!c.botonera;
    var itm = (typeof _buscarITM === 'function') ? _buscarITM(c.id) : null;
    var conPiloto = (typeof _pulsadorMando === 'function') ? _pulsadorMando(itm).conPiloto : false;
    var clave = null;
    if (sel && tim && bot) clave = 'moa';
    else if (bot && !sel && !tim) clave = conPiloto ? 'botonera-piloto' : 'botonera';
    else if (tim && !sel && !bot) clave = 'timer';
    else if (sel || tim || bot) {
      var tiene = [];
      if (sel) tiene.push('selector');
      if (tim) tiene.push('temporizador');
      if (bot) tiene.push('botonera');
      faltan.push(rot + ' (' + tiene.join(' y ') + ')');
    }
    if (!clave) return;
    if (!porClave[clave]) { porClave[clave] = { clave: clave, rots: [] }; grupos.push(porClave[clave]); }
    porClave[clave].rots.push(rot);
  });
  grupos.forEach(function(g) {
    g.rots.sort(function(a, b) {
      return (parseInt((/(\d+)$/.exec(a) || [0, 0])[1], 10) - parseInt((/(\d+)$/.exec(b) || [0, 0])[1], 10));
    });
    var uno = g.rots.length === 1;
    var K = uno ? _rotuloK(g.rots[0]) : 'K-XX';
    var T = uno ? g.rots[0].replace(/^C-/, 'T-') : 'T-XX';
    var quienes = _ctlListaRotulos(g.rots);
    var sub = uno ? entre
      : entre + ' · APLICA A ' + _ctlListaRotulos(g.rots.map(function(r) { return _rotuloK(r); }));
    if (g.clave === 'moa') {
      poner(quienes + ' · SELECTOR MOA CON BOTONERA, TEMPORIZADOR Y PILOTO', sub,
            _ctlMOA(true, tension, conN, K, T), _ctlMOA(false, tension, conN, K, T));
    } else if (g.clave === 'botonera' || g.clave === 'botonera-piloto') {
      var pil = g.clave === 'botonera-piloto';
      poner(quienes + ' · CONTACTOR CON BOTONERA DE MARCHA Y PARADA' + (pil ? ' Y PILOTO DE MARCHA' : ''), sub,
            _ctlBotonera(true, pil, conN, K), _ctlBotonera(false, pil, conN, K));
    } else if (g.clave === 'timer') {
      poner(quienes + ' · TEMPORIZADOR', sub,
            _ctlTimer(true, tension, conN, K, T), _ctlTimer(false, tension, conN, K, T));
    }
  });


  (window._itmLibres || []).forEach(function(it) {
    if (!it.contactor || it.contactor.reserva) return;
    var _tl = (typeof _timerComprado === 'function') && _timerComprado(_timerDe(it.id));
    if (it.pulsador || _tl) faltan.push((it.rotulo || '') + ' (ITM libre)');
  });
  return { hojas: hojas, faltan: faltan };
}



function _ctlLamina(h) {
  var partes = function(s) {
    var vb = ((s.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 100 100').split(/[ ,]+/).map(Number);
    return { vb: vb, cuerpo: s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '') };
  };
  var m = partes(h.mando), c = partes(h.conexion);
  var SEP = 40, TIT = 16, LT = _CTL_LETRA;
  var w = m.vb[2] + SEP + c.vb[2], hh = TIT + Math.max(m.vb[3], c.vb[3]);
  var anidar = function(p, x) {
    return '<svg x="' + _uniF(x) + '" y="' + TIT + '" width="' + _uniF(p.vb[2]) + '" height="' + _uniF(p.vb[3]) +
      '" viewBox="' + p.vb.join(' ') + '" overflow="visible">' + p.cuerpo + '</svg>';
  };
  var tit = function(x, t) {
    return '<text x="' + _uniF(x) + '" y="' + (LT) + '" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" ' +
      'font-weight="700" font-size="' + LT + '" fill="#000" letter-spacing="0.4">' + t + '</text>';
  };




  var MM = 96 / 25.4, HP = window.hojaProtab, W = w, Hh = hh, ox = 0, oy = 0;
  if (HP) {
    var aw = HP.ANCHO - 18 - 16 * MM, ah = HP.ALTO - 18 - 64 - 16 * MM - 12 * MM;
    if (Math.min(aw / w, ah / hh) > _CTL_K_MAX) {
      W = Math.max(w, aw / _CTL_K_MAX); Hh = Math.max(hh, ah / _CTL_K_MAX);
      W = Math.max(W, Hh * aw / ah); Hh = Math.max(Hh, W * ah / aw);



      ox = (W - w) / 2; oy = Math.max(0, (Hh - Math.max(hh, _CTL_LAMINA_H)) / 2);
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + [-ox, -oy, W, Hh].map(_uniF).join(' ') + '">' +
    tit(m.vb[2] / 2, 'ESQUEMA DE MANDO') + tit(m.vb[2] + SEP + c.vb[2] / 2, 'ESQUEMA DE CONEXIÓN') +

    '<g data-capa="CONTROL">' + anidar(m, 0) + anidar(c, m.vb[2] + SEP) + '</g></svg>';
}
function _ctlHojaSvg(h, i, total) {
  if (!window.hojaProtab) return null;
  var meta = (typeof _cajetinMeta === 'function')
    ? _cajetinMeta('Diagrama de control', i + 1, total, 'S/E')
    : { pagina: 'Diagrama de control', hoja: String(i + 1), total: String(total), escala: 'S/E' };
  return window.hojaProtab.componer({ l1: h.titulo, l2: h.sub || '', alt: 'Diagrama de control' },
    meta, { svg: _ctlLamina(h), logo: './ProTAB_files/table-xd-report.svg' });
}


var _ctlUltimas = [];
function _renderControlHojas() {
  var grid = document.getElementById('control_doc_grid');
  if (!grid) return;
  grid.innerHTML = '';
  var r;
  try { r = controlDiagramas(); } catch (e) {
    console.warn('[control] no se pudieron armar:', e);
    grid.innerHTML = '<div class="modo-vacio">No se pudieron armar los diagramas de control.</div>';
    return;
  }
  _ctlUltimas = r.hojas;
  if (r.faltan.length) {
    var av = document.createElement('div');
    av.className = 'ctl-faltan';
    av.innerHTML = '<b>Todavía sin diagrama</b> (su combinación de mando no está dibujada): ' +
      r.faltan.map(_uniEsc).join(', ') + '.';
    grid.appendChild(av);
  }
  if (!r.hojas.length) {
    var v = document.createElement('div');
    v.className = 'modo-vacio';
    v.textContent = 'Este tablero no lleva circuitos de control: se arman con los pilotos de presencia de tensión, ' +
      'el analizador de red o un contactor con botonera, temporizador o selector.';
    grid.appendChild(v);
    return;
  }
  r.hojas.forEach(function(h, i) {
    var hoja = null;
    try { hoja = _ctlHojaSvg(h, i, r.hojas.length); } catch (e) { console.warn('[control] hoja:', e); }
    if (!hoja) return;
    var sec = document.createElement('section');
    sec.className = 'ctl-hoja';
    var bar = document.createElement('div');
    bar.className = 'ctl-hoja-barra';
    bar.innerHTML = '<span>Hoja ' + (i + 1) + ' de ' + r.hojas.length + ' · ' + _uniEsc(h.titulo) + '</span>';
    var caja = document.createElement('div');
    caja.className = 'plano-hoja ctl-papel';
    var ifr = document.createElement('iframe');
    ifr.className = 'plano-hoja-ifr';
    ifr.setAttribute('title', h.titulo);
    ifr.style.width = hoja.ancho + 'px';
    ifr.style.height = hoja.alto + 'px';
    ifr.dataset.w = hoja.ancho; ifr.dataset.h = hoja.alto;
    caja.appendChild(ifr);
    sec.appendChild(bar);
    sec.appendChild(caja);
    grid.appendChild(sec);
    var d = ifr.contentDocument;
    d.open();
    d.write('<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}' +
            'svg{display:block}</style></head><body>' + hoja.svg + '</body></html>');
    d.close();
  });
  _ctlEscalar();
  if (!window._ctlResize) {
    window._ctlResize = true;
    window.addEventListener('resize', _ctlEscalar);
  }
}




function _ctlEscalar() {
  var grid = document.getElementById('control_doc_grid');
  if (!grid || !grid.clientWidth) return;
  var aw = grid.clientWidth - 8;
  var bar = grid.querySelector('.ctl-hoja-barra');
  var ah = grid.clientHeight - 8 - (bar ? bar.offsetHeight + 6 : 0);
  grid.querySelectorAll('.ctl-papel').forEach(function(caja) {
    var ifr = caja.querySelector('iframe');
    if (!ifr) return;
    var W = parseFloat(ifr.dataset.w), H = parseFloat(ifr.dataset.h), k = Math.max(0.2, Math.min(aw / W, ah / H));
    ifr.style.transform = 'scale(' + k + ')';
    caja.style.width = (W * k) + 'px';
    caja.style.height = (H * k) + 'px';
  });
}


function imprimirControl() {
  var r = controlDiagramas();
  var hojas = r.hojas.map(function(h, i) {
    try { var x = _ctlHojaSvg(h, i, r.hojas.length); return x && x.svg; } catch (e) { return null; }
  }).filter(function(s) { return !!s; });
  if (!hojas.length) {
    if (typeof _avisoFlotante === 'function') _avisoFlotante('Este tablero no lleva diagramas de control.');
    return;
  }
  if (window._ctlImprimiendo) return;
  window._ctlImprimiendo = true;
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
    '@page { size: A4 landscape; margin: 0; }' +
    'html, body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
    '.h { position: relative; width: 100vw; height: 100vh; page-break-after: always; }' +
    '.h:last-child { page-break-after: auto; }' +
    '.h svg { position: absolute; left: 10mm; top: 10mm; width: calc(100% - 20mm); height: calc(100% - 20mm); }' +
    '</style></head><body>' + hojas.map(function(s) { return '<div class="h">' + s + '</div>'; }).join('') + '</body></html>';
  guardarPdfHtml(nombreArchivoDoc('diagramas_de_control'), html, function() { window._ctlImprimiendo = false; });
}






async function exportarControlDxf() {
  if (typeof convertirSvgADxf !== 'function' || typeof dxfDeHojas !== 'function') return;
  var r = controlDiagramas();
  if (!r.hojas.length) {
    if (typeof _avisoFlotante === 'function') _avisoFlotante('Este tablero no lleva diagramas de control.');
    return;
  }
  var hojas = r.hojas.map(function(h, i) {
    var hs = null;
    try { hs = _ctlHojaSvg(h, i, r.hojas.length); } catch (e) { console.warn('[control] hoja:', e); }
    return hs ? hs.svg : null;
  });
  var dxf = convertirSvgADxf(await dxfDeHojas(hojas));
  var tab = window._TABLERO || {};
  var base = String(tab.abreviatura || tab.nombre || 'tablero') + '_diagramas_de_control';
  guardarArchivoTexto(base.replace(/[^\w.-]+/g, '_') + '.dxf', dxf, 'dxf', 'Dibujo DXF').catch(function(e) {
    console.warn('[control] no se pudo guardar:', e);
    if (typeof _avisoFlotante === 'function') _avisoFlotante('No se pudo guardar el DXF.');
  });
}
