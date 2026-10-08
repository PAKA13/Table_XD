









function zoomAjustar(delta) {
  var marcoGab = document.getElementById('marco_gabinete');
  if (!marcoGab || marcoGab.style.display === 'none') return;

  var currentZoom = parseFloat(marcoGab.style.zoom) || 1;

  if (delta === 0) {

    var canvas = document.getElementById('canvas_main');
    var gabW = marcoGab.offsetWidth || 750;
    var gabH = marcoGab.offsetHeight || 750;
    var canvasW = canvas ? canvas.clientWidth : 800;
    var canvasH = canvas ? canvas.clientHeight : 600;


    var BUFFER = 200;
    var fitZoom = Math.min(
      (canvasW - BUFFER) / gabW,
      (canvasH - BUFFER) / gabH,
      1
    );
    marcoGab.style.zoom = Math.max(0.05, fitZoom);
    if (canvas) {
      requestAnimationFrame(function() {
        canvas.scrollLeft = Math.max(0, (canvas.scrollWidth - canvas.clientWidth) / 2);
        canvas.scrollTop = 0;
      });
    }
  } else {
    var next = Math.max(0.05, Math.min(1.0, parseFloat((currentZoom + delta).toFixed(2))));
    marcoGab.style.zoom = next;
  }

  actualizarIndicadorZoom(Math.round(parseFloat(marcoGab.style.zoom) * 100));


  if (typeof actualizarCotasEscala === 'function') actualizarCotasEscala();

  if (typeof _alimEscalarMarcas === 'function') _alimEscalarMarcas();

  if (typeof _elimVarios !== 'undefined' && _elimVarios && typeof _elimVariosPintar === 'function') _elimVariosPintar();



  if (typeof posicionarCotasGabinete === 'function') posicionarCotasGabinete();


  if (typeof _reubicarMenusAnclados === 'function') _reubicarMenusAnclados();
}

function actualizarIndicadorZoom(pct) {
  var el = document.getElementById('zoom_indicator');
  if (el) el.textContent = pct + '%';
}


window.addEventListener('DOMContentLoaded', function() {
  var canvas = document.getElementById('canvas_main');
  if (!canvas) return;
  canvas.addEventListener('wheel', function(e) {
    if (!e.ctrlKey) return;                                   
    e.preventDefault();
    zoomAjustar(e.deltaY < 0 ? 0.05 : -0.05);
  }, { passive: false });





  var zIni = null;
  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
    var marco = document.getElementById('marco_gabinete');
    zIni = (canvas.contains(e.target) && marco) ? (parseFloat(marco.style.zoom) || 1) : null;
  }, { passive: false });
  document.addEventListener('gesturechange', function(e) {
    e.preventDefault();
    if (zIni === null) return;
    var marco = document.getElementById('marco_gabinete');
    if (!marco) return;
    var actual = parseFloat(marco.style.zoom) || 1;
    var meta = Math.max(0.05, Math.min(1.0, zIni * e.scale));
    var d = parseFloat((meta - actual).toFixed(2));
    if (Math.abs(d) >= 0.01) zoomAjustar(d);
  }, { passive: false });
  document.addEventListener('gestureend', function(e) { e.preventDefault(); zIni = null; }, { passive: false });
});
