















(function (raiz) {
  'use strict';


  var TINTA = '#16202e', TINTA2 = '#5b6778', LINEA = '#dfe3e9';
  var COBRE = '#c76b30', PAPEL = '#ffffff', RELLENO = '#fbfcfd';

  function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }









  function esc(v) {
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escAttr(v) { return esc(v).replace(/"/g, '&quot;'); }











































  function dibujar(o) {
    o = o || {};

    var piezas = o.piezas || [{contorno: o.contorno || [], huecos: o.huecos,
                               agujeros: o.agujeros, pletina: o.pletina}];
    if (!piezas.length || (piezas[0].contorno || []).length < 3)
      throw new Error('el desplegado necesita un contorno');

    var E = num(o.escala, 6);
    var SEP = num(o.separacion, 6);                                              



    var apila = (o.apilar !== false);
    var alto = 0, piso = Infinity, techo = -Infinity;
    piezas.forEach(function (pz, i) {
      var yy = pz.contorno.map(function (q) { return q[1]; });
      pz._min = Math.min.apply(null, yy);
      pz._alto = Math.max.apply(null, yy) - pz._min;
      pz._dy = apila ? (alto - pz._min) : 0;
      alto += pz._alto + (i < piezas.length - 1 ? SEP : 0);
      piso = Math.min(piso, pz._dy + pz._min);
      techo = Math.max(techo, pz._dy + pz._min + pz._alto);
    });
    var todosX = [];
    piezas.forEach(function (pz) {
      pz.contorno.forEach(function (q) { todosX.push(q[0]); });
    });
    var x0 = Math.min.apply(null, todosX), x1 = Math.max.apply(null, todosX);


    var y0 = piso, y1 = techo;

    var cadena = o.cadena || [], abajo = o.abajo || [];
    var MARGEN = 62;



    var MI = MARGEN;
    piezas.forEach(function (pz) {
      MI = Math.max(MI, (pz.etiqueta || '').length * 7 + 20,
                        (pz.nota || '').length * 5.5 + 20);
    });


    var conCadenaPropia = piezas.some(function (pz) { return (pz.cadena || []).length; });
    var ARRIBA = (cadena.length || conCadenaPropia) ? 78 : 46;

    if (cadena.some(function (c) { return (c.hasta - c.desde) * E < 30; })) ARRIBA += 16;










    var DISPO = (x1 - x0) * E;
    var CAB = [];
    if (o.ficha && o.nota &&
        (o.ficha.length + o.nota.length) * 5.7 + 30 < DISPO) {
      CAB.push({izq: o.ficha, der: o.nota});
    } else {
      [o.ficha, o.nota].forEach(function (t) {
        if (!t) return;
        var cabe = Math.max(20, Math.floor(DISPO / 5.7)), resto = t;
        while (resto.length > cabe) {
          var corte = resto.lastIndexOf(' ', cabe);
          if (corte <= 0) corte = cabe;
          CAB.push({izq: resto.slice(0, corte)});
          resto = resto.slice(corte + 1);
        }
        CAB.push({izq: resto});
      });
    }
    ARRIBA += 15 * Math.max(0, CAB.length - 1);


    var rotula = piezas.some(function (pz) {
      return (pz.agujeros || []).some(function (a) { return !!a.texto; });
    });
    var HUECO = rotula ? 18 : 0;
    var ABAJO = 30 + HUECO + 30 * Math.max(1, abajo.length);

    var cotasV = o.cotasV || [];
    var anchoPorPieza = piezas.some(function (pz) { return !!pz.cotaAncho; });
    var DER = (cotasV.length || anchoPorPieza) ? 64 : 0;                                    
    var AW = Math.round((x1 - x0) * E + MI + MARGEN + DER);
    var AH = Math.round((y1 - y0) * E + ARRIBA + ABAJO);
    var OX = MI - x0 * E, OY = ARRIBA - y0 * E;
    var X = function (mm) { return +(OX + mm * E).toFixed(2); };
    var Y = function (mm) { return +(OY + mm * E).toFixed(2); };




    function cota(a_mm, b_mm, y, txt, sube) {
      var a = X(a_mm), b = X(b_mm), fuera = (b - a) < 34;
      var yt = y - 9 - (sube ? 15 : 0);
      return '\n  <path d="M' + a + ' ' + (y - 5) + ' V' + (y + 5) + '" stroke="' + COBRE + '" stroke-width="1"/>' +
             '\n  <path d="M' + b + ' ' + (y - 5) + ' V' + (y + 5) + '" stroke="' + COBRE + '" stroke-width="1"/>' +
             '\n  <path d="M' + (fuera ? a - 16 : a) + ' ' + y + ' H' + (fuera ? b + 16 : b) + '" stroke="' + COBRE +
             '" stroke-width="1" marker-start="url(#fl)" marker-end="url(#fl)"/>' +
             (sube ? '\n  <path d="M' + ((a + b) / 2) + ' ' + (y - 6) + ' V' + (yt + 3) +
                     '" stroke="' + LINEA + '" stroke-width="1"/>' : '') +
             '\n  <text x="' + ((a + b) / 2) + '" y="' + yt + '" text-anchor="middle" font-size="12.5" fill="' +
             COBRE + '" font-weight="600">' + esc(txt) + '</text>';
    }


    function cotaV(a_mm, b_mm, x, txt) {
      var a = Y(a_mm), b = Y(b_mm);
      return '\n  <path d="M' + (x - 5) + ' ' + a + ' H' + (x + 5) + '" stroke="' + COBRE + '" stroke-width="1"/>' +
             '\n  <path d="M' + (x - 5) + ' ' + b + ' H' + (x + 5) + '" stroke="' + COBRE + '" stroke-width="1"/>' +
             '\n  <path d="M' + x + ' ' + a + ' V' + b + '" stroke="' + COBRE +
             '" stroke-width="1" marker-start="url(#fl)" marker-end="url(#fl)"/>' +
             '\n  <text x="' + (x + 8) + '" y="' + ((a + b) / 2 + 4) + '" font-size="12.5" fill="' +
             COBRE + '" font-weight="600">' + esc(txt) + '</text>';
    }


    function guia(mm, ya, yb) {
      return '\n  <path d="M' + X(mm) + ' ' + ya + ' V' + yb + '" stroke="' + LINEA + '" stroke-width="1"/>';
    }

    function poli(pts, dy) {
      dy = dy || 0;
      return pts.map(function (p, i) {
        return (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1] + dy);
      }).join(' ') + ' Z';
    }

    var partes = [];
    partes.push('  <rect width="' + AW + '" height="' + AH + '" fill="' + PAPEL + '"/>');



    piezas.forEach(function (pz) {
      var dy = pz._dy;



      if (pz.pletina) {
        var px = pz.contorno.map(function (q) { return q[0]; });
        var py = pz.contorno.map(function (q) { return q[1]; });
        var x0 = X(Math.min.apply(null, px)), x1 = X(Math.max.apply(null, px));
        var y0 = Y(Math.min.apply(null, py) + dy), y1 = Y(Math.max.apply(null, py) + dy);
        partes.push('  <rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0).toFixed(2) +
                    '" height="' + (y1 - y0).toFixed(2) + '" fill="none" stroke="' + TINTA2 +
                    '" stroke-width="1.1" stroke-dasharray="6 3"/>');
      }
      var d = poli(pz.contorno, dy);
      (pz.huecos || []).forEach(function (h) { d += ' ' + poli(h, dy); });
      partes.push('  <path d="' + d + '" fill-rule="evenodd" fill="' + RELLENO +
                  '" stroke="' + TINTA + '" stroke-width="1.6" stroke-linejoin="round"/>');
      (pz.agujeros || []).forEach(function (a) {
        partes.push('  <circle cx="' + X(a.x) + '" cy="' + Y(a.y + dy) + '" r="' + (a.r * E).toFixed(2) +
                    '" fill="' + PAPEL + '" stroke="' + TINTA + '" stroke-width="1.4"/>');


        if (a.texto)
          partes.push('  <text x="' + X(a.x) + '" y="' + (Y(dy + pz._min + pz._alto) + 11) +
                      '" text-anchor="middle" font-size="9.5" fill="' + TINTA2 + '">' +
                      esc(a.texto) + '</text>');
      });






      if (pz.ejes) {
        var yy = pz.contorno.map(function (q) { return q[1]; });
        var pa = Math.min.apply(null, yy) + dy, pb = Math.max.apply(null, yy) + dy;
        var xxs = pz.contorno.map(function (q) { return q[0]; });
        var ejeY = Y((pa + pb) / 2);
        partes.push('  <path d="M' + (X(Math.min.apply(null, xxs)) - 7) + ' ' + ejeY +
                    ' H' + (X(Math.max.apply(null, xxs)) + 7) + '" stroke="' + TINTA2 +
                    '" stroke-width="0.8" stroke-dasharray="9 3 2 3"/>');
        (pz.agujeros || []).forEach(function (a) {

          var yc = Y(a.y + dy), br = a.r * E + 6;
          partes.push('  <path d="M' + X(a.x) + ' ' + (yc - br).toFixed(2) +
                      ' V' + (yc + br).toFixed(2) + '" stroke="' + TINTA2 +
                      '" stroke-width="0.8"/>');
        });
      }





      (pz.desvios || []).forEach(function (v) {
        var xv = X(v.x), yv = Y(v.y + dy), yTop = Y(dy + pz._min) - 13;
        partes.push('  <path d="M' + xv + ' ' + yv + ' V' + yTop +
                    '" stroke="' + COBRE + '" stroke-width="1" stroke-dasharray="3 2"/>' +
                    '\n  <circle cx="' + xv + '" cy="' + yv + '" r="2.2" fill="' + COBRE + '"/>' +
                    '\n  <text x="' + (xv + 5) + '" y="' + (yTop + 4) +
                    '" font-size="11" fill="' + COBRE + '" font-weight="600">' +
                    esc(v.texto) + '</text>');
      });



      if (pz.cotaAncho) {
        var xxA = pz.contorno.map(function (q) { return q[0]; });
        partes.push(cotaV(dy + pz._min, dy + pz._min + pz._alto,
                          X(Math.max.apply(null, xxA)) + 22, pz.cotaAncho));
      }



      if ((pz.cadena || []).length) {
        var yC = Y(dy + pz._min) - 13, cortesP = {};
        pz.cadena.forEach(function (c) {
          partes.push(cota(c.desde, c.hasta, yC, c.texto,
                           (X(c.hasta) - X(c.desde)) < 30));
          cortesP[c.desde.toFixed(4)] = c.desde;
          cortesP[c.hasta.toFixed(4)] = c.hasta;
        });
        Object.keys(cortesP).forEach(function (k) {
          partes.push(guia(cortesP[k], yC + 6, Y(dy + pz._min) - 2));
        });
      }

      if (pz.etiqueta) {
        var yE = Y(dy + pz._min + pz._alto / 2);
        partes.push('  <text x="' + (MI - 12) + '" y="' + (yE + (pz.nota ? -2 : 4)) +
                    '" text-anchor="end" font-size="13" font-weight="600" fill="' + TINTA + '">' +
                    esc(pz.etiqueta) + '</text>');


        if (pz.nota)
          partes.push('  <text x="' + (MI - 12) + '" y="' + (yE + 12) +
                      '" text-anchor="end" font-size="10" fill="' + COBRE + '">' +
                      esc(pz.nota) + '</text>');
      }
    });

    if (o.eje !== false && !o.piezas && Math.abs(x0 + x1) < 1e-6)
      partes.push('  <path d="M' + X(0) + ' ' + (Y(y0) - 12) + ' V' + (Y(y1) + 12) + '" stroke="' + TINTA2 +
                  '" stroke-width="1" stroke-dasharray="9 3 2 3"/>');

    var yCad = ARRIBA - 26;
    if (cadena.length) {
      var cortes = {};
      cadena.forEach(function (c) {


        partes.push(cota(c.desde, c.hasta, yCad, c.texto,
                         (X(c.hasta) - X(c.desde)) < 30));
        cortes[c.desde.toFixed(4)] = c.desde; cortes[c.hasta.toFixed(4)] = c.hasta;
      });
      Object.keys(cortes).forEach(function (k) {
        partes.push(guia(cortes[k], yCad + 6, Y(y0) - 3));
      });
    }
    if (cotasV.length) {
      var xV = X(x1) + 26;
      cotasV.forEach(function (c) { partes.push(cotaV(c.desde, c.hasta, xV, c.texto)); });
    }
    abajo.forEach(function (c, i) {
      partes.push(cota(c.desde, c.hasta, Y(y1) + 28 + HUECO + 30 * i, c.texto));
    });






    CAB.forEach(function (l, i) {
      var y = 22 + i * 15;
      partes.push('  <text x="' + MI + '" y="' + y + '" font-size="11.5" fill="' + TINTA2 + '">' +
                  esc(l.izq) + '</text>');
      if (l.der)
        partes.push('  <text x="' + (AW - MARGEN - DER) + '" y="' + y +
                    '" text-anchor="end" font-size="11.5" fill="' + TINTA2 + '">' + esc(l.der) + '</text>');
    });







    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + AW + '" height="' + AH +
           '"\n     viewBox="0 0 ' + AW + ' ' + AH + '" role="img"' +
           '\n     font-family="Segoe UI,system-ui,Arial,sans-serif"\n     aria-label="' +
           escAttr(o.alt || 'pieza desplegada') + '">\n' +
      '  <defs>\n' +
      '    <marker id="fl" markerWidth="9" markerHeight="9" refX="7.4" refY="3.2" orient="auto">\n' +
      '      <path d="M0.6 0.6 L7.6 3.2 L0.6 5.8 Z" fill="' + COBRE + '"/>\n' +
      '    </marker>\n' +
      '  </defs>\n' +
      partes.join('\n') + '\n</svg>\n';
  }



  function puntos(shape, seg) {
    var P = shape.getPoints(seg || 28).map(function (p) { return [p.x, p.y]; });
    if (P.length > 1) {
      var a = P[0], b = P[P.length - 1];
      if (Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9) P.pop();
    }
    return P;
  }

  raiz.desplegadoSVG = {dibujar: dibujar, puntos: puntos};
})(typeof module !== 'undefined' && module.exports ? module.exports : window);
