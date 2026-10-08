
















(function (raiz) {
  'use strict';

  var CANA_PIE     = 3 / 16 * 25.4;                                        
  var RANURA_PIE   = 7;                                                                 
  var TOPE_AGUJERO = 4;                                                              


  var ALCANCE = {rt: 50, inter: 19, s: 0};


  function holguraRanura() { return (RANURA_PIE - CANA_PIE) / 2; }


  function margen() { return TOPE_AGUJERO + holguraRanura(); }






  function rangoPaso(n) {
    var M = margen(), lo, hi;
    if (n === 3) { lo = ALCANCE.rt - M; hi = ALCANCE.rt + M; }
    else if (n === 4) {
      lo = Math.max((ALCANCE.rt - M) / 1.5, 2 * (ALCANCE.inter - M));
      hi = Math.min((ALCANCE.rt + M) / 1.5, 2 * (ALCANCE.inter + M));
    } else return null;
    lo = Math.ceil(lo * 10) / 10; hi = Math.floor(hi * 10) / 10;
    return (lo <= hi) ? {min: lo, max: hi} : null;
  }


















  function reparto(alcances, sep, holguras) {
    var n = alcances.length, centro = ((n - 1) * sep) / 2;
    return alcances.map(function (alc, i) {
      var h = (holguras && typeof holguras[i] === 'number')
                ? holguras[i] : holguraRanura();
      var barX = i * sep;
      var lado = (alc && centro !== barX) ? Math.sign((centro - barX) * alc) : 1;
      var falta = centro - (barX + lado * alc);
      var agujero = Math.max(-TOPE_AGUJERO, Math.min(TOPE_AGUJERO, falta));
      var ranura = Math.max(-h, Math.min(h, falta - agujero));
      return {falta: falta, agujero: agujero, ranura: ranura,
              sobra: falta - agujero - ranura, lado: lado, h: h};
    });
  }








  function piezaPorPosicion(n, i) {
    if (n === 3) return (i === 1) ? 's' : 'rt';
    if (n === 4) return (i === 0 || i === 3) ? 'rt' : 'inter';
    return null;
  }

  raiz.Columna = {
    CANA_PIE: CANA_PIE, RANURA_PIE: RANURA_PIE, TOPE_AGUJERO: TOPE_AGUJERO,
    ALCANCE: ALCANCE, holguraRanura: holguraRanura, margen: margen,
    rangoPaso: rangoPaso, reparto: reparto, piezaPorPosicion: piezaPorPosicion
  };
})(typeof module !== 'undefined' && module.exports ? module.exports : window);
