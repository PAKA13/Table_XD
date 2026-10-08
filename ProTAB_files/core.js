






var PX_TO_MM        = 0.2;
var GAB_DEFAULT_MM  = 150;                                           
var PB_INSET_MM     = 30;                                       
var PLACA_MM        = 90;                                     
var PERNO_OFFSET_MM = 20;                                                
var PERNO_SIZE_MM   = 19;                                
var SUBMARCO_GAP_MM = 9;                              


var CV_TOP_PX    = 500;                                            
var CV_LEFT_PX   = 750;                                                                 
var CV_RIGHT_PX  = 750;                                       
var GAB_BOT_GAP_PX = 350;                                                     
var IG_GAP         = 350;                                                  
var IG_MARGIN_TOP  = 850;                                                                   
var RIEL_CON_W   = 115;                                                                    
var CM_CON_W     = 175;                                      
var CM_REG_CON_W = 225;                                          





var PLATINA = {
  riel:   { anchoMm: 10, espesorMm: 2 },
  mod1:   { anchoMm: 15, espesorMm: 2 },                                             
  mod2:   { anchoMm: 20, espesorMm: 2 }                                              
};


var BUSBAR_COLORS = { R: '#cc0000', S: '#2d2d2d', T: '#0044cc', N: '#ffffff' };



window._gabineteData    = null;                                                     
window._panelBusbarData = null;                                                            
window._igData          = null;                                      
window._itmList         = [];                                                          
window._igExtraTop      = 0;                                                            
window._colorGabSel    = '#D7D7D7';
window._colorPlacaSel  = '#F75E25';
window._colorPuertaSel = '#D7D7D7';
window._colorMandilSel = '#D7D7D7';
var modalGabTipoActual = null;


function _applyConDims(pb) {
  if (!pb) return;
  RIEL_CON_W   = (pb.conRielAnMm  || 23) / PX_TO_MM;
  CM_CON_W     = (pb.conMod1AnMm  || 35) / PX_TO_MM;
  CM_REG_CON_W = (pb.conMod2AnMm  || 45) / PX_TO_MM;
}



function _tsValido(t) {
  return (typeof t === 'number' && isFinite(t) && Math.abs(t) <= 8.64e15) ? t : NaN;
}










var PM = {
  META_KEY: 'protab_meta',
  PROJ_PREFIX: 'protab_project_',





  _ts: function(v) {
    if (typeof v === 'number') return _tsValido(v);
    if (typeof v === 'string' && v) {
      if (/^\d+$/.test(v)) return _tsValido(parseInt(v, 10));
      return _tsValido(Date.parse(v));
    }
    return NaN;
  },


  _iso: function(v) {
    var t = this._ts(v);
    return isNaN(t) ? '' : new Date(t).toISOString();
  },




  _migrarFechas: function(m) {
    var self = this, cambio = false;
    (m.projects || []).forEach(function(p) {
      if (!p) return;
      ['createdAt', 'updatedAt'].forEach(function(k) {
        if (p[k] === undefined || p[k] === null) return;
        var iso = self._iso(p[k]);
        if (iso && iso !== p[k]) { p[k] = iso; cambio = true; }
      });
    });
    return cambio;
  },

  meta: function() {
    var m = null;
    try {
      var raw = localStorage.getItem(this.META_KEY);
      if (raw) m = JSON.parse(raw);
    } catch (e) {}
    if (!m || !Array.isArray(m.projects)) return { projects: [], activeId: null };
    if (this._migrarFechas(m)) this._saveMeta(m);
    return m;
  },

  _saveMeta: function(m) {
    try { localStorage.setItem(this.META_KEY, JSON.stringify(m)); }
    catch (e) { console.warn('[PM] no se pudo guardar meta:', e); }
  },

  _serialize: function() {
    var _est = {
      gabinete: window._gabineteData,
      panelBusbar: window._panelBusbarData,
      igData: window._igData,
      itmList: window._itmList || [],
      itmNextRotulo: (typeof _itmNextRotulo !== 'undefined') ? _itmNextRotulo : 1,
      itmLibres: window._itmLibres || [],
      cotas: (typeof _cotasConstantes === 'function') ? _cotasConstantes() : null,
      vista: window._vistaActual || 'frontal',
      pdfMeta: window._pdfMeta || null,
      unifilarMeta: window._unifilarMeta || null,
      fichaMeta: window._fichaMeta || null,
      metradoMeta: window._metradoMeta || null,
      senalMeta: window._senalMeta || null,
      tablero: window._TABLERO || null,
      pbInicial: window._pbInicial || null,
      mandil: _mandilVars(),
      puertaRotuloTopMm: (typeof window._PUERTA_ROTULO_TOP_MM === 'number')
        ? window._PUERTA_ROTULO_TOP_MM : null,
      medidor: window._MEDIDOR || null,
      medidorPrevio: window._MEDIDOR_PREVIO || null,
      medidorEncendioExt: !!window._medidorEncendioExt,
      pilotosLeds: window._PILOTOS_LEDS || 0,
      pilotosColor: window._PILOTOS_COLOR || 'verde',
      bornerasCant: window._BORNERAS_CANT || 0,
      presenciaSecciones: window._PRESENCIA_SECCIONES || null,
      bornerasGrupos: window._BORNERAS_GRUPOS || [],
      autosnapComercial: (window._autosnapComercial === true),
      extIzq: window._EXT_IZQ || null,
      extDer: window._EXT_DER || null,
      topesCant: window._TOPES_CANT || null,                                 
      bornerasTipo: window._BORNERAS_TIPO || '2.5',
      bornerasGapMm: (typeof window._BORNERAS_GAP_MM === 'number')
        ? window._BORNERAS_GAP_MM : null,
      barrasUbic: window._BARRAS_UBIC || {},
      barrasLadoMm: window._BARRAS_LADO_MM || {},
      analizadorTopMm: (typeof window._ANALIZADOR_TOP_MM === 'number')
        ? window._ANALIZADOR_TOP_MM : null,
      pilotosTopMm: (typeof window._PILOTOS_TOP_MM === 'number')
        ? window._PILOTOS_TOP_MM : null,
      pulsadoresTopMm: (typeof window._PULSADORES_TOP_MM === 'number')
        ? window._PULSADORES_TOP_MM : null,
      pulsPrefs: window._PULS_PREFS || null,
      senaleticaTopMm: (typeof window._SENALETICA_TOP_MM === 'number')
        ? window._SENALETICA_TOP_MM : null,
      rejilla: !!window._REJILLA,
      rejillaTopMm: (typeof window._REJILLA_TOP_MM === 'number')
        ? window._REJILLA_TOP_MM : null,
      chapaPuertaXMm: (typeof window._PUERTA_CHAPA_X_MM === 'number')
        ? window._PUERTA_CHAPA_X_MM : null,
      chapaPuertaYMm: (typeof window._PUERTA_CHAPA_Y_MM === 'number')
        ? window._PUERTA_CHAPA_Y_MM : null,
      chapaPuertaY2Mm: (typeof window._PUERTA_CHAPA_Y2_MM === 'number')
        ? window._PUERTA_CHAPA_Y2_MM : null,
      colorGab: window._colorGabSel,
      colorPlaca: window._colorPlacaSel,
      colorPuerta: window._colorPuertaSel,
      colorMandil: window._colorMandilSel
    };

    canaletasGuardarEn(_est);
    if (typeof uniPodarSalidas === 'function') uniPodarSalidas();
    return _est;
  },


  _resumen: function(s) {
    var parts = [];
    if (s.gabinete) parts.push(s.gabinete.tipo === 'empotrado' ? 'Empotrado' : 'Adosado');
    if (s.panelBusbar) parts.push(_pbTextoCorto(s.panelBusbar));
    if (s.igData) parts.push('IG ' + s.igData.polos + 'P');

    var _todos = (s.itmList || []).concat(s.itmLibres || []);
    if (_todos.length) parts.push(_todos.length + ' ITM' + (_todos.length > 1 ? 's' : ''));
    var nDifs = _todos.filter(function(i) { return i.dif; }).length;
    if (nDifs) parts.push(nDifs + ' DIF' + (nDifs > 1 ? 's' : ''));
    var nDps = _todos.filter(function(i) { return i.dps; }).length;
    if (nDps) parts.push(nDps + ' DPS');
    var nCont = _todos.filter(function(i) { return i.contactor; }).length;
    if (nCont) parts.push(nCont + ' Contactor' + (nCont > 1 ? 'es' : ''));
    return parts.length ? parts.join(' · ') : 'Vacío';
  },



  _thumb: function() {
    var marco = document.getElementById('marco_gabinete');
    if (!marco || marco.style.display === 'none') return null;



    if (window._vistaActual && window._vistaActual !== 'frontal') return null;
    var html = marco.outerHTML
      .replace(/\sid="[^"]*"/g, '')
      .replace(/\smask="url\([^)]*\)"/g, '')


      .replace(/modo-copia-target/g, '')
      .replace(/tri-pulse/g, '');
    return {
      html: html,
      w: parseFloat(marco.style.width) || 750,
      h: parseFloat(marco.style.height) || 750
    };
  },

  create: function(name) {
    var m = this.meta();
    var id = 'p' + Date.now();
    m.projects.push({
      id: id,
      name: name || ('Proyecto ' + (m.projects.length + 1)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resumen: 'Vacío',
      thumbHtml: null, thumbW: 0, thumbH: 0
    });
    m.activeId = id;
    this._saveMeta(m);
    try { localStorage.setItem(this.PROJ_PREFIX + id, JSON.stringify({})); } catch (e) {}
    return id;
  },






  _ultimaMini: 0,








  _cargado: null,
  save: function(opts) {
    var m = this.meta();
    if (!m.activeId) return;
    if (this._cargado !== m.activeId) {
      console.warn('[PM] guardado omitido: el proyecto activo no termino de cargarse en esta pagina');
      return;
    }
    var s = this._serialize();
    try { localStorage.setItem(this.PROJ_PREFIX + m.activeId, JSON.stringify(s)); }
    catch (e) { console.warn('[PM] no se pudo guardar proyecto:', e); return; }
    var ahora = Date.now();
    if (!(opts && opts.miniatura) && (ahora - this._ultimaMini) < 2000) return;
    this._ultimaMini = ahora;
    for (var i = 0; i < m.projects.length; i++) {
      if (m.projects[i].id === m.activeId) {
        m.projects[i].updatedAt = new Date().toISOString();
        m.projects[i].resumen = this._resumen(s);
        var t = this._thumb();
        if (t) {
          m.projects[i].thumbHtml = t.html;
          m.projects[i].thumbW = t.w;
          m.projects[i].thumbH = t.h;
        }
        break;
      }
    }
    this._saveMeta(m);
  },

  open: function(id) {
    var m = this.meta();

    this._cargado = null;
    m.activeId = id;
    this._saveMeta(m);
    resetEstado();
    var s = null;
    try {
      var raw = localStorage.getItem(this.PROJ_PREFIX + id);
      if (raw) s = JSON.parse(raw);
    } catch (e) {}

    window._pdfMeta = (s && s.pdfMeta) || null;
    window._unifilarMeta = (s && s.unifilarMeta) || null;
    window._fichaMeta = (s && s.fichaMeta) || null;
    window._metradoMeta = (s && s.metradoMeta) || null;
    window._senalMeta = (s && s.senalMeta) || null;
    window._TABLERO = (s && s.tablero) || null;
    window._pbInicial = (s && s.pbInicial) || null;
    _mandilVarsRestore(s && s.mandil);
    window._PUERTA_ROTULO_TOP_MM = (s && typeof s.puertaRotuloTopMm === 'number')
      ? s.puertaRotuloTopMm : 40;
    window._MEDIDOR = (s && s.medidor) || null;
    window._MEDIDOR_PREVIO = (s && s.medidorPrevio) || null;
    window._medidorEncendioExt = !!(s && s.medidorEncendioExt);
    window._PILOTOS_LEDS = (s && s.pilotosLeds) || 0;
    window._PILOTOS_COLOR = (s && s.pilotosColor) || 'verde';
    window._BORNERAS_CANT = (s && s.bornerasCant) || 0;
    window._PRESENCIA_SECCIONES = (s && s.presenciaSecciones) || null;
    window._BORNERAS_GRUPOS = (s && Array.isArray(s.bornerasGrupos)) ? s.bornerasGrupos : [];


    canaletasRestaurarDe(s);



    (function() {
      var vistos = {};
      (window._BORNERAS_GRUPOS || []).forEach(function(g) {
        if (g.lugar !== 'contactor') return;

        var itm = ((s && s.itmList) || []).filter(function(i) { return i.id === g.ref; })[0];
        var sd = (itm && itm.side === 'right') ? 'right' : 'left';
        if (!vistos[sd]) {
          g.lugar = 'lat-' + sd;
          g.ref = null;
          vistos[sd] = g.id;
        } else {
          g.lugar = 'junto';
          g.ref = vistos[sd];
          vistos[sd] = g.id;
        }
      });
    })();
    window._TOPES_CANT = (s && s.topesCant) || null;
    window._autosnapComercial = !!(s && s.autosnapComercial);
    window._EXT_IZQ = (s && s.extIzq) || null;
    window._EXT_DER = (s && s.extDer) || null;
    window._BORNERAS_TIPO = (s && s.bornerasTipo) || '2.5';

    if (s && s.borneras4Cant > 0 && !(s.bornerasCant > 0)) {
      window._BORNERAS_TIPO = '4';
      window._BORNERAS_CANT = s.borneras4Cant;
    }
    window._BORNERAS_GAP_MM = (s && typeof s.bornerasGapMm === 'number')
      ? s.bornerasGapMm : 30;
    window._BARRAS_UBIC = (s && s.barrasUbic) ? JSON.parse(JSON.stringify(s.barrasUbic)) : {};
    window._BARRAS_LADO_MM = (s && s.barrasLadoMm) ? JSON.parse(JSON.stringify(s.barrasLadoMm)) : {};
    window._ANALIZADOR_TOP_MM = (s && typeof s.analizadorTopMm === 'number')
      ? s.analizadorTopMm : null;                                      
    window._PILOTOS_TOP_MM = (s && typeof s.pilotosTopMm === 'number')
      ? s.pilotosTopMm : 150;
    window._PULSADORES_TOP_MM = (s && typeof s.pulsadoresTopMm === 'number')
      ? s.pulsadoresTopMm : 200;
    window._PULS_PREFS = (s && s.pulsPrefs) ? s.pulsPrefs : null;
    window._SENALETICA_TOP_MM = (s && typeof s.senaleticaTopMm === 'number')
      ? s.senaleticaTopMm : null;
    window._REJILLA = !!(s && s.rejilla);
    window._REJILLA_TOP_MM = (s && typeof s.rejillaTopMm === 'number')
      ? s.rejillaTopMm : null;                                       

    window._PUERTA_CHAPA_X_MM = (s && typeof s.chapaPuertaXMm === 'number')
      ? s.chapaPuertaXMm : null;
    window._PUERTA_CHAPA_Y_MM = (s && typeof s.chapaPuertaYMm === 'number')
      ? s.chapaPuertaYMm : null;
    window._PUERTA_CHAPA_Y2_MM = (s && typeof s.chapaPuertaY2Mm === 'number')
      ? s.chapaPuertaY2Mm : null;
    if (s && s.cotas && typeof _aplicarCotasGuardadas === 'function') {
      _aplicarCotasGuardadas(s.cotas);
      if (typeof _recalcIgExtraTop === 'function') _recalcIgExtraTop();
    }



    if (s && s.gabinete && !s.gabinete.tipo) {
      console.warn('[PM.open] gabinete corrupto descartado (sin tipo):', s.gabinete);
      s.gabinete = null;
    }
    if (s && s.gabinete) {
      window._gabineteData   = s.gabinete;
      window._colorGabSel    = s.colorGab    || '#D7D7D7';
      window._colorPlacaSel  = s.colorPlaca  || '#F75E25';
      window._colorPuertaSel = s.colorPuerta || '#D7D7D7';
      window._colorMandilSel = s.colorMandil || '#D7D7D7';
      dibujarGabinete();
      if (s.panelBusbar) {
        window._panelBusbarData = s.panelBusbar;





        var _pbMig = window._panelBusbarData;
        if (typeof _pbMig.busbarExtMm !== 'number') _pbMig.busbarExtMm = 20;


        if (typeof _pbMig.conRielAltoMm   !== 'number') _pbMig.conRielAltoMm   = CON_RIEL_ALTO_MM;
        if (typeof _pbMig.conRielCabezaMm !== 'number') _pbMig.conRielCabezaMm = CON_RIEL_CABEZA_MM;
        _applyConDims(window._panelBusbarData);
        if (s.igData) {
          window._igData = s.igData;
          _recalcIgExtraTop();
        }


        window._itmList = s.itmList || [];
        window._itmLibres = (s && s.itmLibres) ? s.itmLibres : [];



        window._itmList.concat(window._itmLibres).forEach(function(it) {
          if (!it) return;
          if (it.contactor && !it.contactor.padre) it.contactor.padre = 'itm';



          if (it.pulsador === true) it.pulsador = { tipo: 'doble', botonera: true };
          if (it.pulsador && !it.pulsador.padre) it.pulsador.padre = 'contactor';
          if (it.dps && !it.dps.padre) it.dps.padre = 'itm';
        });
        if (typeof _itmNextRotulo !== 'undefined') {
          _itmNextRotulo = s.itmNextRotulo || 1;
        }


        if (typeof sincronizarPilotosConFases === 'function') sincronizarPilotosConFases();

        if (typeof _bornerasLimpiarHuerfanas === 'function') {
          var _nH = _bornerasLimpiarHuerfanas();
          if (_nH) console.warn('[PM.open] ' + _nH + ' borneras/timers sin su contactor: quitados');
        }


        if (!window._REJILLA && window._BORNERAS_GRUPOS &&
            window._BORNERAS_GRUPOS.some(function(g) { return g.origen === 'rejilla'; })) {
          window._BORNERAS_GRUPOS = window._BORNERAS_GRUPOS.filter(function(g) { return g.origen !== 'rejilla'; });
          console.warn('[PM.open] grupos de una rejilla quitada: borrados');
        }
        if (typeof _medidorNormalizarBorneras === 'function' && _medidorNormalizarBorneras()) {
          console.warn('[PM.open] medidor: borneras encadenadas al final de la tira de presencia');
        }
        if (typeof _medidorAsegurarAlto === 'function' && _medidorAsegurarAlto()) {
          if (typeof _recalcIgExtraTop === 'function') _recalcIgExtraTop();
          console.warn('[PM.open] medidor: cuadro subido al minimo de los transformadores');
        }
        dibujarPanelBusbar();
      }
      setTimeout(function() { zoomAjustar(0); }, 50);

      if (s.vista && s.vista !== 'frontal' && typeof aplicarVista === 'function') {
        var _vGuardada = s.vista;

        setTimeout(function() { if (PM.meta().activeId === id) aplicarVista(_vGuardada); }, 80);
      }
    }
    actualizarBibliotecaGabinete();                        

    this._cargado = id;
  },




  rename: function(id, newName) {
    var m = this.meta();
    for (var i = 0; i < m.projects.length; i++) {
      if (m.projects[i].id === id) { m.projects[i].name = newName; break; }
    }
    this._saveMeta(m);
    try {
      var raw = localStorage.getItem(this.PROJ_PREFIX + id);
      if (raw) {
        var s = JSON.parse(raw) || {};
        s.tablero = Object.assign({}, s.tablero || {}, { nombre: newName });
        localStorage.setItem(this.PROJ_PREFIX + id, JSON.stringify(s));
      }
    } catch (e) { console.warn('[PM] renombrar tablero:', e); }

    if (this._cargado === id) {
      window._TABLERO = Object.assign({}, window._TABLERO || {}, { nombre: newName });
    }
  },

  duplicate: function(id) {
    var m = this.meta();
    var src = null;
    for (var i = 0; i < m.projects.length; i++) {
      if (m.projects[i].id === id) { src = m.projects[i]; break; }
    }
    if (!src) return null;
    var newId = 'p' + Date.now();
    var copy = JSON.parse(JSON.stringify(src));
    copy.id = newId;
    copy.name = src.name + ' (copia)';
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    m.projects.push(copy);
    this._saveMeta(m);
    try {
      var data = localStorage.getItem(this.PROJ_PREFIX + id) || '{}';
      localStorage.setItem(this.PROJ_PREFIX + newId, data);
    } catch (e) {}
    return newId;
  },

  remove: function(id) {
    var m = this.meta();
    m.projects = m.projects.filter(function(p) { return p.id !== id; });
    if (m.activeId === id) m.activeId = null;
    this._saveMeta(m);
    try { localStorage.removeItem(this.PROJ_PREFIX + id); } catch (e) {}
  },


  migrateLegacy: function() {
    var LEGACY_KEY = 'protab_desktop_session_v1';
    try {
      var raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return;
      var s = JSON.parse(raw);
      if (!s || !s.gabinete) { localStorage.removeItem(LEGACY_KEY); return; }
      var m = this.meta();
      if (m.projects.length > 0) { localStorage.removeItem(LEGACY_KEY); return; }
      var id = this.create('Proyecto 1');
      localStorage.setItem(this.PROJ_PREFIX + id, raw);
      var m2 = this.meta();
      for (var i = 0; i < m2.projects.length; i++) {
        if (m2.projects[i].id === id) { m2.projects[i].resumen = this._resumen(s); break; }
      }
      m2.activeId = null;                                               
      this._saveMeta(m2);
      localStorage.removeItem(LEGACY_KEY);
    } catch (e) { console.warn('[PM] migracion legacy:', e); }
  }
};






window.addEventListener('beforeunload', function() {
  try { if (PM.meta().activeId) PM.save({ miniatura: true }); } catch (e) {}
});











function _pbTextoCorto(pb) {
  if (!pb) return '';
  var f = pb.fases;
  if (pb.fases === '2F' && pb.subfases) f = '2F (' + pb.subfases.replace(/ - /g, '') + ')';
  return f + ', ' + _pbPolosEfectivos(pb) + 'p';
}
function _pbPolosEfectivos(pb) {
  if (!pb) return 0;
  var n = (pb.ciclo && pb.ciclo.length) ? pb.ciclo.length * 2 : 0;
  return n || parseInt(pb.polos, 10) || 0;
}



function _pbPolosDesdeCampo(valor) {
  var pb = window._panelBusbarData;
  var v = parseInt(valor, 10);
  if (pb && !isNaN(v) && v === _pbPolosEfectivos(pb)) return parseInt(pb.polos, 10) || v;
  return v;
}




function _txtSalir() {
  var tactil = window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  return tactil ? 'tocá fuera para salir' : 'ESC para salir';
}







function _cancelarModalAbierto() {
  document.querySelectorAll('.sp-modal.activo').forEach(function(m) {
    var bs = m.querySelectorAll('.m1-footer button, button');
    var cancel = null;
    for (var i = 0; i < bs.length && !cancel; i++) {
      if (bs[i].classList.contains('m1-cancel') ||
          /^(Cancelar|Quedarme ac[áa])$/.test(bs[i].textContent.trim())) cancel = bs[i];
    }
    if (cancel) cancel.click();
    m.classList.remove('activo');
  });
}









function _conReglas(seguir) {
  if (typeof rulesPreparar !== 'function') { seguir(); return; }
  var p = null;
  try { p = rulesPreparar(); } catch (e) { p = null; }
  if (!p || typeof p.then !== 'function') { seguir(); return; }
  p.then(seguir, seguir);
}

function guardarSesion() {
  PM.save();

  if (window._uniAbierto && typeof _uniRefrescarDiferido === 'function') {
    try { _uniRefrescarDiferido(); } catch (e) { console.warn('_uniRefrescarDiferido:', e); }
  }

  if (typeof _v3dRefrescarDiferido === 'function') {
    try { _v3dRefrescarDiferido(); } catch (e) { console.warn('_v3dRefrescarDiferido:', e); }
  }
  if (typeof actualizarBibliotecaCircuitos === 'function') {
    try { actualizarBibliotecaCircuitos(); } catch (e) { console.warn('actualizarBibliotecaCircuitos:', e); }
  }
}


function resetEstado() {

  if (window._uniAbierto && typeof cerrarUnifilar === 'function') cerrarUnifilar();
  if (typeof _v3dAbierto === 'function' && _v3dAbierto()) cerrarConector3D();
  window._gabineteData = null;
  window._panelBusbarData = null;
  window._igData = null;
  window._itmList = [];
  if (typeof _itmNextRotulo !== 'undefined') _itmNextRotulo = 1;
  window._itmLibres = [];
  window._igExtraTop = 0;

  if (typeof _resetCotasConstantes === 'function') _resetCotasConstantes();
  window._pdfMeta = null;
  window._unifilarMeta = null;
  window._fichaMeta = null;
  window._metradoMeta = null;
  window._senalMeta = null;



  if (typeof fabOlvidarTodo === 'function') fabOlvidarTodo();
  window._TABLERO = null;
  window._pbInicial = null;
  _mandilVarsRestore(null);
  window._PUERTA_ROTULO_TOP_MM = 40;
  window._PILOTOS_LEDS = 0;
  window._PILOTOS_COLOR = 'verde';
  window._BORNERAS_CANT = 0;
  window._MEDIDOR = null;
  window._MEDIDOR_PREVIO = null;
  window._medidorEncendioExt = false;
  window._BORNERAS_GRUPOS = [];


  canaletasReset();                                                 
  window._BORNERAS_GAP_MM = 30;
  window._BARRAS_UBIC = {};
  window._BARRAS_LADO_MM = {};
  window._TOPES_CANT = null;
  window._PRESENCIA_SECCIONES = null;
  window._autosnapComercial = false;

  window._SNAP_EXTRA_PX = 0;
  window._EXT_IZQ = null;
  window._EXT_DER = null;
  window._BORNERAS_TIPO = '2.5';
  window._PILOTOS_TOP_MM = 150;
  window._ANALIZADOR_TOP_MM = null;
  window._PULSADORES_TOP_MM = 200;
  window._PULS_PREFS = null;
  window._SENALETICA_TOP_MM = null;
  window._REJILLA = false;
  window._REJILLA_TOP_MM = null;
  window._PUERTA_CHAPA_X_MM = null;
  window._PUERTA_CHAPA_Y_MM = null;
  window._PUERTA_CHAPA_Y2_MM = null;

  window._vistaActual = 'frontal';
  window._vistaFrontalDims = null;


  document.body.classList.remove('vista-puerta-active', 'vista-lateral-active', 'vista-mandil-active');
  document.body.classList.remove('gab-empotrado', 'gab-adosado');
  var _selVistaReset = document.getElementById('sel_vista');
  if (_selVistaReset) _selVistaReset.value = 'frontal';
  if (typeof _syncVistaUI === 'function') _syncVistaUI();
  if (typeof _limpiarOverlaysVistas === 'function') _limpiarOverlaysVistas();

  ['chk_cotas_gab', 'chk_cotas_equi', 'chk_cotas_cp'].forEach(function(id) {
    var chk = document.getElementById(id);
    if (chk) chk.checked = true;
  });


  ['chk_cotas_pb', 'chk_cotas_rotulos', 'chk_cotas_ct'].forEach(function(id) {
    var chk = document.getElementById(id);
    if (chk) chk.checked = false;
  });
  document.body.classList.remove('sin-cotas-gabinete', 'sin-cotas-equi', 'sin-cotas-cp');
  document.body.classList.add('sin-cotas-pb');
  document.body.classList.add('sin-cotas-rotulos');
  document.body.classList.add('sin-cotas-ct');
  if (typeof _actualizarCotasSegunVista === 'function') _actualizarCotasSegunVista('frontal');
  var _marcoCotas = document.getElementById('marco_gabinete');
  if (_marcoCotas) {
    _marcoCotas.querySelectorAll('.cota-mi, .cota-gab-ext').forEach(function(el) { el.remove(); });
  }
  window._colorGabSel = '#D7D7D7';
  window._colorPlacaSel = '#F75E25';
  window._colorPuertaSel = '#D7D7D7';
  window._colorMandilSel = '#D7D7D7';
  modalGabTipoActual = null;

  RIEL_CON_W = 115; CM_CON_W = 175; CM_REG_CON_W = 225;
  var marco = document.getElementById('marco_gabinete');
  if (marco) { marco.style.display = 'none'; marco.style.width = ''; marco.style.height = ''; marco.style.zoom = ''; }
  if (typeof limpiarPanelBusbar === 'function') limpiarPanelBusbar();
  if (typeof actualizarBibliotecaGabinete === 'function') actualizarBibliotecaGabinete();
  if (typeof actualizarIndicadorZoom === 'function') actualizarIndicadorZoom(100);
}


function _gabHmm() {
  var marco = document.getElementById('marco_gabinete');
  return marco ? (parseFloat(marco.style.height) || 0) * PX_TO_MM : 0;
}



function _cantidadChapaMandil(savedCantidad) {
  var cant = parseInt(savedCantidad, 10);
  if (isNaN(cant) || cant < 1) cant = (_gabHmm() >= 500) ? 2 : 1;
  return cant;
}
function _cantidadChapaPuerta(savedCantidad) {
  var cant = parseInt(savedCantidad, 10);
  if (isNaN(cant) || cant < 1) cant = (_gabHmm() >= 500) ? 2 : 1;
  return cant;
}








function _autoBumpCerradura() {
  var d = window._gabineteData;
  if (!d || !d.cerradura) return;
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  var gabHmm = (parseFloat(marco.style.height) || 0) * PX_TO_MM;

  if (window._vistaActual === 'lateral' && window._vistaFrontalDims) {
    gabHmm = window._vistaFrontalDims.h * PX_TO_MM;
  }
  var def = (gabHmm >= 500) ? 2 : 1;
  var cambio = false;
  ['mandil', 'puerta'].forEach(function(k) {
    var c = d.cerradura[k];
    if (!c || c.userOverride === true) return;
    if (parseInt(c.cantidad, 10) !== def) { c.cantidad = def; cambio = true; }
  });
  if (cambio) {

    if (typeof _reaplicarVistaSiNoFrontal === 'function') _reaplicarVistaSiNoFrontal();
    if (typeof guardarSesion === 'function') guardarSesion();
  }
}


window.addEventListener('DOMContentLoaded', function() {
  PM.migrateLegacy();
  if (typeof appBoot === 'function') appBoot();
});













var _menusAnclados = [];






function _rectTrianguloVisible(r) {
  var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  if (r.width > 2.2 * r.height) {
    return { left: cx - r.height, right: cx + r.height, top: r.top, bottom: r.bottom,
             width: 2 * r.height, height: r.height };
  }
  if (r.height > 2.2 * r.width) {
    return { left: r.left, right: r.right, top: cy - r.width, bottom: cy + r.width,
             width: r.width, height: 2 * r.width };
  }
  return r;
}

function _anclarMenuAlTriangulo(menu, triImg, opts) {
  opts = opts || {};
  var lado = opts.lado || 'right';
  var centrado = !!opts.centrado;

  menu.style.position = 'fixed';
  menu.style.zIndex = '100002';

  function _ubicar() {
    if (!menu.isConnected) return;
    if (!triImg.isConnected) { menu.remove(); return; }
    var r = _rectTrianguloVisible(triImg.getBoundingClientRect());
    var canvas = document.getElementById('canvas_main');
    if (canvas) {
      var c = canvas.getBoundingClientRect();
      var cy = r.top + r.height / 2;
      if (cy < c.top || cy > c.bottom || r.right < c.left || r.left > c.right) {
        menu.style.visibility = 'hidden';
        return;
      }
    }
    menu.style.visibility = '';
    if (lado === 'left') {
      menu.style.left = (r.left - 5) + 'px';
      menu.style.transform = centrado
        ? 'translateX(-100%) translateY(-50%)' : 'translateX(-100%)';
    } else {
      menu.style.left = (r.right + 5) + 'px';
      menu.style.transform = centrado ? 'translateY(-50%)' : '';
    }
    var top = centrado ? (r.top + r.height / 2) : r.top;




    var c2 = canvas ? canvas.getBoundingClientRect() : null;
    if (c2) {
      var h = menu.offsetHeight || 0;
      var alto = centrado ? (top - h / 2) : top;
      var min = c2.top + 4, max = c2.bottom - h - 4;
      if (alto < min) top += (min - alto);
      else if (alto > max && max > min) top -= (alto - max);
    }
    menu.style.top = top + 'px';
  }

  function _soltar() {
    window.removeEventListener('scroll', _ubicar, true);
    window.removeEventListener('resize', _ubicar);
    var k = _menusAnclados.indexOf(_ubicar);
    if (k !== -1) _menusAnclados.splice(k, 1);
    if (obs) obs.disconnect();
  }

  _ubicar();

  window.addEventListener('scroll', _ubicar, true);
  window.addEventListener('resize', _ubicar);
  _menusAnclados.push(_ubicar);



  var obs = null;
  if (typeof MutationObserver === 'function') {
    obs = new MutationObserver(function() { if (!menu.isConnected) _soltar(); });
    obs.observe(document.body, { childList: true });
  }
  return _ubicar;
}








var _MENU_TRI_IDS = ['tri_context_menu', 'itm_context_menu'];
var _menuTriAbierto = null;                      
function _cerrarMenusTriangulo() {
  _MENU_TRI_IDS.forEach(function(id) {
    var m = document.getElementById(id);
    if (m) m.remove();
  });
  if (_menuTriAbierto && _menuTriAbierto.menu.isConnected) _menuTriAbierto.menu.remove();
  _menuTriAbierto = null;
  document.removeEventListener('click', _menuTriClickFuera);
  document.removeEventListener('keydown', _menuTriEsc);
}
function _menuTriClickFuera(e) {
  var a = _menuTriAbierto;
  if (!a || !a.menu.isConnected) { _cerrarMenusTriangulo(); return; }
  if (a.menu.contains(e.target) || e.target === a.tri) return;
  _cerrarMenusTriangulo();
}
function _menuTriEsc(e) {
  if (e.key === 'Escape') _cerrarMenusTriangulo();
}


function _abrirMenuTriangulo(menu, triImg, opts) {
  _cerrarMenusTriangulo();



  if (typeof _cancelarModalAbierto === 'function') _cancelarModalAbierto();
  document.body.appendChild(menu);
  _anclarMenuAlTriangulo(menu, triImg, opts);
  _menuTriAbierto = { menu: menu, tri: triImg };



  menu.addEventListener('click', function(e) {
    if (e.target.closest && e.target.closest('.dif-context-btn')) {
      setTimeout(function() { if (_menuTriAbierto && _menuTriAbierto.menu === menu) _cerrarMenusTriangulo(); }, 0);
    }
  });

  setTimeout(function() {
    if (!_menuTriAbierto || _menuTriAbierto.menu !== menu) return;
    document.addEventListener('click', _menuTriClickFuera);
    document.addEventListener('keydown', _menuTriEsc);
  }, 10);
  return menu;
}








var ELIM_VARIOS_SEL = '.itm-tri, .dif-tri, .dps-tri, .contactor-tri, .bornera-tri, ' +
                      '.bornera-presencia-tri, .puerta-puls-tri, .barra-tri';
var _elimVarios = false, _elimVariosObs = null, _elimVariosRaf = 0;

function eliminarVariosActivo() { return _elimVarios; }

function toggleEliminarVarios() {
  if (_elimVarios) terminarEliminarVarios(); else iniciarEliminarVarios();
}

function iniciarEliminarVarios() {
  if (_elimVarios) return;

  _cerrarMenusTriangulo();
  ['_desactivarModoCopia', '_desactivarModoCopiaDIF', '_desactivarModoCopiaContactor',
   '_desactivarModoCopiaGrupo', '_desactivarModoCopiaPulsador', '_bornerasCancelarUbicacion'
  ].forEach(function(f) { if (typeof window[f] === 'function') { try { window[f](); } catch (e) {} } });
  if (typeof _moverInf !== 'undefined' && _moverInf && typeof _moverInfTerminar === 'function') _moverInfTerminar(false);
  _elimVarios = true;
  document.body.classList.add('elim-varios');
  document.addEventListener('click', _elimVariosClick, true);
  document.addEventListener('keydown', _elimVariosTecla);
  var marco = document.getElementById('marco_gabinete');
  if (marco && typeof MutationObserver === 'function') {

    _elimVariosObs = new MutationObserver(function(muts) {
      var propias = muts.every(function(m) {
        var n = [].slice.call(m.addedNodes).concat([].slice.call(m.removedNodes));
        return n.length && n.every(function(x) { return x.classList && x.classList.contains('elim-varios-x'); });
      });
      if (!propias) _elimVariosAgendar();
    });
    _elimVariosObs.observe(marco, { childList: true, subtree: true });
  }
  _elimVariosBarra(true);
  _elimVariosPintar();
  if (typeof _renderListaCircuitos === 'function') _renderListaCircuitos();
}

function terminarEliminarVarios() {
  if (!_elimVarios) return;
  _elimVarios = false;
  document.body.classList.remove('elim-varios');
  document.removeEventListener('click', _elimVariosClick, true);
  document.removeEventListener('keydown', _elimVariosTecla);
  if (_elimVariosObs) { _elimVariosObs.disconnect(); _elimVariosObs = null; }
  document.querySelectorAll('.elim-varios-x').forEach(function(x) { x.remove(); });
  _elimVariosBarra(false);
  _cerrarMenusTriangulo();
  if (typeof _renderListaCircuitos === 'function') _renderListaCircuitos();
}

function _elimVariosTecla(e) {
  if (e.key === 'Escape' || e.key === 'Enter') terminarEliminarVarios();
}

function _elimVariosAgendar() {


  if (_elimVariosRaf) return;
  _elimVariosRaf = setTimeout(function() { _elimVariosRaf = 0; _elimVariosPintar(); }, 30);
}


function _elimVariosPintar() {
  if (!_elimVarios) return;
  var marco = document.getElementById('marco_gabinete');
  if (!marco) return;
  marco.querySelectorAll('.elim-varios-x').forEach(function(x) { x.remove(); });
  marco.querySelectorAll(ELIM_VARIOS_SEL).forEach(function(t) {
    var p = t.parentElement;
    if (!p || t.style.display === 'none' || !t.offsetParent) return;
    var l = parseFloat(t.style.left), tp = parseFloat(t.style.top);
    var w = parseFloat(t.style.width) || t.offsetWidth, h = parseFloat(t.style.height) || t.offsetHeight;
    if (isNaN(l) || isNaN(tp)) { l = t.offsetLeft; tp = t.offsetTop; }


    var z = parseFloat(marco.style.zoom) || 1;
    var d = Math.max(Math.min(w, h) * 1.2, 24 / z);
    var x = document.createElement('div');
    x.className = 'elim-varios-x';
    x.textContent = '\u2715';
    x.style.cssText = 'left:' + (l + w / 2) + 'px;top:' + (tp + h / 2) + 'px;width:' + d +
      'px;height:' + d + 'px;font-size:' + Math.round(d * 0.62) + 'px;line-height:' + d + 'px;';
    p.appendChild(x);
  });
}



function _elimVariosClick(e) {
  var t = e.target && e.target.closest ? e.target.closest(ELIM_VARIOS_SEL) : null;
  if (!t) return;
  setTimeout(function() {
    var a = _menuTriAbierto, b = null;
    if (a && a.menu && a.menu.isConnected) {
      [].slice.call(a.menu.querySelectorAll('.dif-context-btn')).forEach(function(x) {
        var tx = (x.textContent || '').trim();
        if (!b && (tx.indexOf('Eliminar') === 0 || tx.indexOf('Quitar canaleta') === 0 || tx.indexOf('Quitar las ') === 0)) b = x;
      });
    }
    if (b) b.click(); else _cerrarMenusTriangulo();
  }, 0);
}


function _elimVariosBarra(on) {
  var bar = document.getElementById('elim_varios_barra');
  if (!on) { if (bar) bar.remove(); return; }
  if (bar) return;
  bar = document.createElement('div');
  bar.id = 'elim_varios_barra';
  bar.className = 'elim-varios-barra';
  var tx = document.createElement('span');
  tx.textContent = 'Eliminar varios: clic en una \u2715 elimina ese equipo';
  var ok = document.createElement('button');
  ok.textContent = 'Listo';
  ok.onclick = function(ev) { ev.stopPropagation(); terminarEliminarVarios(); };
  bar.appendChild(tx);
  bar.appendChild(ok);
  document.body.appendChild(bar);
}


function _reubicarMenusAnclados() {
  _menusAnclados.slice().forEach(function(f) { f(); });
}








function _tableroLineas() {
  var t = window._TABLERO || {};
  var nombreProy = '';
  try {
    var meta = PM.meta();
    var p = (meta.projects || []).find(function(x) { return x.id === meta.activeId; });
    nombreProy = p ? p.name : '';
  } catch (e) {}
  var sistema = t.sistema;
  if (!sistema || !String(sistema).trim()) {
    var fm = (typeof _fichaDatos === 'function') ? _fichaDatos() : (window._fichaMeta || {});
    var pb = window._panelBusbarData || window._pbInicial || {};
    var sinEsp = function(x) { return String(x || '').replace(/\s+/g, ''); };


    var tierra = (typeof _tierraConfigurada === 'function') ? _tierraConfigurada(pb) : !!(pb.barraTierra && pb.barraTierra !== 'ninguno');
    var fasesT = pb.fases ? (pb.fases + (tierra ? '+T' : '')) : '';
    sistema = [sinEsp(fm.tension), fasesT, sinEsp(fm.frecuencia)]
      .filter(function(x) { return x; }).join(' ');
  }
  return [t.nombre || nombreProy, t.abreviatura, sistema]
    .filter(function(x) { return x && String(x).trim(); });
}





function _rotuloK(rotulo, faltante) {
  if (!rotulo) return (faltante !== undefined) ? faltante : 'K-XX';
  return String(rotulo).replace(/^C-/, 'K-');
}


function _rotuloID(rotulo, faltante) {
  if (!rotulo) return (faltante !== undefined) ? faltante : 'ID-XX';
  return String(rotulo).replace(/^C-/, 'ID-');
}





var _LED_HEX = { blanco: '#ffffff', verde: '#2eb85c', rojo: '#e5322c' };
