








































(function (raiz) {
  'use strict';




  const CAT = {
    S: {ancho: 10, espesor: 2, radio: 2, base: 19, alto: 44.5, recto: 23,
        cabeza: 11, inclinacion: 3.97, cuello: 5.2, radioPunta: 2.6,
        curvaEscalon: true, agujero: 5},
    SOPORTE_RT: {ancho: 10, espesor: 2, radio: 2, saliente: 2, pie: 16.66,
                 ranura: {desde: 6.5, largo: 7, ancho: 5},
                 escalon: {alto: 11.3, angulo: 42, tramo: 15.49},
                 alto: 44.5, brida: {largo: 7.5, agujero: 5, desde: 3.5}},
    SOPORTE_INTER: {ancho: 10, espesor: 2, radio: 2, saliente: 2, pie: 15,
                    ranura: {desde: 6.5, largo: 7, ancho: 5}, escalon: null,
                    alto: 44.5, brida: {largo: 10, agujero: 5, desde: 4.5}},
    PLACA: {ancho: 10, espesor: 2, recto: 23, cabeza: 11, cuello: 5.2,
            radioPunta: 2.6, curvaEscalon: true, agujero: 5},















    S_M1: {ancho: 15, espesor: 3, radio: 3, base: 28.5, alto: 44.5, recto: 35,
           cabeza: 18, inclinacion: 0, cuello: 15, radioPunta: 0,
           curvaEscalon: false, agujero: 6.6},
    SOPORTE_RT_M1: {ancho: 15, espesor: 3, radio: 3, saliente: 0, pie: 18,
                    ranura: {desde: 10, largo: 8.6, ancho: 6.6},
                    escalon: {alto: 11.3, angulo: 42, tramo: 13.5},
                    alto: 44.5, brida: {largo: 22, agujero: 5, desde: 3.5}},
    SOPORTE_INTER_M1: {ancho: 15, espesor: 3, radio: 3, saliente: 0, pie: 15.5,
                       ranura: {desde: 10, largo: 8.6, ancho: 6.6}, escalon: null,
                       alto: 44.5, brida: {largo: 22, agujero: 5, desde: 4.5}},
    PLACA_M1: {ancho: 15, espesor: 3, recto: 35, cabeza: 18, cuello: 15,
               radioPunta: 0, curvaEscalon: false, agujero: 5},
    C1: {ancho: 20, espesor: 3, salto: 22, agujero: 7, desdeA: 10,
         desdeB: 9, entre: 46, radio: 3, avance: 16.17,
         pestanaA: 22.4, pestanaB: 26.43},
    BARRA: {ancho: 20, espesor: 3},
    PERNO_CONECTOR: 3 / 16 * 25.4,

    PERNO_CONECTOR_M1: 6.35
  };



  const PE_SEG = {
    s: {ancho: 10, dz:  3.5, agujero: 4.7625, pieza: 'tornillo'},
    i: {ancho: 10, dz: -3.5, agujero: 4.7625, pieza: 'tornillo'},
    c: {ancho: 20, dz:  0,   agujero: 6.35,   pieza: 'perno'}
  };
  function celdasDeTexto(txt) {
    return String(txt || '').split('').filter(c => PE_SEG[c])
      .map(c => Object.assign({}, PE_SEG[c]));
  }











  function celdasPE(ej) {
    const p = ej.pe || {};
    if (p.celdas) return p.celdas.map(c => Object.assign({}, c));
    const c = [];
    if (p.segIG) c.push({ancho: p.segIG, agujero: 6.35, pieza: 'perno'});
    for (let i = 0; i < (p.circuitos || 0) + (p.aux || 0); i++)
      c.push({ancho: 10, dz: (i % 2 ? -3.5 : 3.5)});
    return c;
  }





  const T_3_8   = 'tornillo 3/16" × 3/8"';
  const PRES316 = 'arandela de presión 3/16"';
  const PLAN316 = 'arandela plana 3/16" corta';
  const PERNO34 = 'perno 1/4" × 3/4"';
  const PERNO12 = 'perno 1/4" × 1/2"';
  const PHIL34  = 'tornillo phillips 1/4" × 3/4"';
  const PRES14  = 'arandela de presión 1/4"';
  const PLAN14  = 'arandela plana 1/4" corta';
  const TUER14  = 'tuerca 1/4"';
  const TINTA = '#16202e', TINTA2 = '#5b6778', COBRE = '#c76b30';
  const PAPEL = '#ffffff', BANDA = '#eef1f5', LINEA = '#c7cfda';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const n1 = v => v.toFixed(1);
  const dia = d => 'Ø' + (Math.abs(d - Math.round(d)) < 5e-3 ? d.toFixed(0) : d.toFixed(2));







  function crear(dep, op) {
    op = op || {};
    const THREE = dep.THREE, util = dep.util, desplegadoSVG = dep.desplegadoSVG;
    const construirConectorS = dep.construirConectorS;
    const construirSoporteRT = dep.construirSoporteRT;
    const construirPlacaRT = dep.construirPlacaRT;
    const construirConectorC1 = dep.construirConectorC1;
    const construirBarraPE = dep.construirBarraPE;
    const Columna = dep.Columna;
    const c1AlIG = dep.c1AlIG;
    const pts = desplegadoSVG.puntos;

    const pisa = k => Object.assign({}, CAT[k], (op.cat || {})[k]);
    const S_M1 = pisa('S_M1'), SOPORTE_RT_M1 = pisa('SOPORTE_RT_M1'),
          SOPORTE_INTER_M1 = pisa('SOPORTE_INTER_M1'), PLACA_M1 = pisa('PLACA_M1');
    const PERNO_CONECTOR_M1 = CAT.PERNO_CONECTOR_M1;


    const uDe = c => (typeof c === 'number') ? c : c.u;
    const famDe = c => (typeof c === 'number') ? 'riel'
                       : (c.tipo === 'm1' ? 'm1' : 'riel');
    const S_CAT = pisa('S'), SOPORTE_RT = pisa('SOPORTE_RT'),
          SOPORTE_INTER = pisa('SOPORTE_INTER'), PLACA_CAT = pisa('PLACA'),
          C1_CAT = pisa('C1'), BARRA = pisa('BARRA');
    const PERNO_CONECTOR = CAT.PERNO_CONECTOR;



    function s_conectorS(ficha) {
      const S = ficha || S_CAT, W = S.ancho;
      const c = construirConectorS(THREE, S);
      const Rm = S.radio + S.espesor / 2;
      const arco = Rm * (Math.PI / 2 + S.inclinacion * Math.PI / 180);
      const xc = c.desarrollo / 2 - arco - c.pata - arco - c.uPunta;
      if (!(xc > 0)) throw new Error('la S: con esta base los pliegues se tocan');


      const brazo = new THREE.Shape();
      brazo.moveTo(0, 0);
      brazo.lineTo(c.uEscalon, 0);
      util.trazarCabeza(brazo, W, c.uEscalon, c.uPunta, S.cuello, S.radioPunta,
                        S.curvaEscalon, 1);
      brazo.lineTo(0, W);
      const B = pts(brazo, 28);
      const xB = xc + arco + c.pata + arco;

      const cont = [[-xB, 0]];
      for (const p of B) cont.push([xB + p[0], p[1]]);
      cont.push([-xB, W]);
      for (let i = B.length - 1; i >= 0; i--) cont.push([-xB - B[i][0], B[i][1]]);

      return {
        nombre: 'conector-s-desplegado',
        titulo: 'conector S',
        contorno: cont,
        agujeros: [{x: 0, y: W / 2, r: S.agujero / 2}],
        cadena: [
          {desde: xc, hasta: xc + arco, texto: n1(arco)},
          {desde: xc + arco, hasta: xc + arco + c.pata, texto: n1(c.pata)},
          {desde: xc + arco + c.pata, hasta: xB, texto: n1(arco)},
          {desde: xB, hasta: c.desarrollo / 2, texto: n1(c.uPunta)}
        ],
        abajo: [
          {desde: -xc, hasta: xc, texto: n1(2 * xc) + ' base'},
          {desde: -c.desarrollo / 2, hasta: c.desarrollo / 2,
           texto: n1(c.desarrollo) + ' desarrollado'}
        ],
        pletina: true,                                                              
        ficha: `pletina ${W} × ${S.espesor} · agujero Ø${S.agujero} · pliegues R${S.radio} interior`,
        nota: 'cabezas por matriz · el otro lado es el espejo',
        comprueba: c.desarrollo
      };
    }






    function s_soporte(id, O, titulo) {
      const W = O.ancho, sal = O.saliente;
      const c = construirSoporteRT(THREE, O);
      const uAg = c.desarrollo - O.brida.largo + O.brida.desde;                       

      const forma = new THREE.Shape();
      forma.moveTo(0, 0);
      forma.lineTo(c.desarrollo, 0);
      util.trazarPunta(forma, W, c.desarrollo, sal, 1);
      forma.lineTo(0, W);
      util.trazarPunta(forma, W, 0, sal, -1);
      forma.closePath();


      const r = O.ranura.ancho / 2, a = O.ranura.largo / 2 - r, cu = O.ranura.desde;
      const ran = new THREE.Path();
      ran.moveTo(cu - a, W / 2 - r);
      ran.lineTo(cu + a, W / 2 - r);
      ran.absarc(cu + a, W / 2, r, -Math.PI / 2, Math.PI / 2, false);
      ran.lineTo(cu - a, W / 2 + r);
      ran.absarc(cu - a, W / 2, r, Math.PI / 2, Math.PI * 1.5, false);
      ran.closePath();




      const cadena = c.plano.map(t => ({desde: t.desde, hasta: t.hasta, texto: n1(t.largo)}));

      return {
        nombre: id,
        titulo: titulo,
        contorno: pts(forma, 28),
        huecos: [pts(ran, 20)],
        agujeros: [{x: uAg, y: W / 2, r: O.brida.agujero / 2}],
        cadena: cadena,





        abajo: [
          {desde: -sal, hasta: c.desarrollo + sal,
           texto: n1(c.desarrollo + 2 * sal) + ' de punta a punta'},
          {desde: 0, hasta: c.desarrollo, texto: n1(c.desarrollo) + ' desarrollado'}
        ],


        pletina: true,
        ficha: `pletina ${W} × ${O.espesor} · ranura ${O.ranura.largo} × ${O.ranura.ancho}` +
               ` · agujero Ø${O.brida.agujero} · pliegues R${O.radio} interior`,
        nota: c.plano.filter(t => t.tipo === 'giro').length + ' pliegues · puntas por matriz',
        eje: false,
        comprueba: c.desarrollo + 2 * sal
      };
    }








    function s_placa(ficha) {
      const P = ficha || PLACA_CAT, W = P.ancho;
      const c = construirPlacaRT(THREE, P);
      const uS = P.recto / 2, uT = uS + P.cabeza;

      const s = new THREE.Shape();
      s.moveTo(-uS, 0);
      s.lineTo(uS, 0);
      util.trazarCabeza(s, W, uS, uT, P.cuello, P.radioPunta, P.curvaEscalon, 1);
      s.lineTo(-uS, W);
      const cab = new THREE.Shape();
      cab.moveTo(-uS, 0);
      util.trazarCabeza(cab, W, uS, uT, P.cuello, P.radioPunta, P.curvaEscalon, -1);
      for (const q of cab.getPoints(28).reverse()) s.lineTo(q.x, q.y);
      s.closePath();

      return {
        nombre: 'conector-placa-desplegada',
        titulo: 'placa del RT y del intermedio',
        contorno: pts(s, 28),
        agujeros: [{x: 0, y: W / 2, r: P.agujero / 2}],
        cadena: [
          {desde: -uT, hasta: -uS, texto: n1(P.cabeza)},
          {desde: -uS, hasta: uS, texto: n1(P.recto)},
          {desde: uS, hasta: uT, texto: n1(P.cabeza)}
        ],
        abajo: [{desde: -uT, hasta: uT, texto: n1(c.desarrollo) + ' de largo'}],
        pletina: true,
        ficha: `pletina ${W} × ${P.espesor} · corte ${n1(c.desarrollo)} × ${W} · agujero Ø${P.agujero} · no dobla`,
        nota: 'cabezas por matriz · la misma en el RT y en el intermedio',
        comprueba: c.desarrollo
      };
    }








    function c1Desplegado(id, titulo, c, O) {
      const W = O.ancho, LX = c.largo, pb = c.puntaB;

      let cont;
      if (pb) {
        const z0 = W / 2 + pb.desvio - pb.ancho / 2, z1 = z0 + pb.ancho;
        cont = [[0, 0], [pb.desde, 0], [pb.desde, z0], [LX, z0],
                [LX, z1], [pb.desde, z1], [pb.desde, W], [0, W]];
      } else {
        cont = [[0, 0], [LX, 0], [LX, W], [0, W]];
      }

      const ags = (c.agujeros || []).map(a => ({x: a.u, y: a.v, r: a.r}))
        .sort((p, q) => p.x - q.x);
      const cadena = [];
      if (ags.length === 2) {
        cadena.push({desde: 0, hasta: ags[0].x, texto: n1(ags[0].x)});
        cadena.push({desde: ags[0].x, hasta: ags[1].x, texto: n1(ags[1].x - ags[0].x)});
        cadena.push({desde: ags[1].x, hasta: LX, texto: n1(LX - ags[1].x)});
      }

      return {
        nombre: id,
        titulo: titulo,
        contorno: cont,
        agujeros: ags,
        cadena: cadena,
        abajo: [{desde: 0, hasta: LX, texto: n1(c.desarrollo) + ' desarrollado'}],
        ficha: `pletina ${W} × ${O.espesor} · agujero${ags.length === 1 ? '' : 's'} ` +
               `Ø${O.agujero}` +
               ` · pliegue ${n1(c.pliegue)}° R${O.radio} en la fibra media` +
               (Math.abs(c.lateral) > 0.05 ? ` · líneas en inglete ${n1(c.alfa)}°` : '') +

               (c.enS && Math.abs(c.canto || 0) > 0.05
                 ? ` · dos curvas de canto a ${n1(c.canto)}° R${n1(c.radioPlanta)}` : ''),
        nota: (Math.abs(c.lateral) > 0.05 || Math.abs(c.corrio || 0) > 0.05)
                ? 'se corre ' + n1(Math.abs(c.corrio || c.lateral)) + ' de lado'
                : 'sin corrimiento',
        eje: false,
        comprueba: c.desarrollo,
        desarrollo: c.desarrollo
      };
    }



    function s_c1(id, lateral, titulo) {
      const O = Object.assign({}, C1_CAT, {lateral: lateral, alfa: 45, alfaMax: 45,
                                           pliegueMax: 70, recorta: true});



      const c = construirConectorC1(O);
      const p = c1Desplegado(id, titulo, c, O);



      p.pedido = {lateral: lateral, tiene: c.lateral || 0};
      return p;
    }






    function c1DelTablero(ej) {
      const ig = ej.c1ig;
      if (!ig) return [];
      const cfg = {construirConectorC1: construirConectorC1, C1: C1_CAT,
                   salto: (typeof ig.salto === 'number') ? ig.salto : C1_CAT.salto};
      const plan = c1AlIG.plan(Object.assign({}, cfg, {
        fases: ej.fases, alIG: ig.alIG, filasIG: ig.filasIG,
        hastaIG: ig.hastaIG, desdeArriba: ig.desdeArriba}));
      const grupos = [];
      plan.fases.forEach(function (q) {
        let c;
        try {
          c = c1AlIG.esCatalogo(cfg, q, plan.entreUsado)
            ? construirConectorC1(Object.assign({}, C1_CAT, {lateral: 0, alfa: 45,
                alfaMax: 45, pliegueMax: 70, recorta: true}))
            : c1AlIG.acodado(cfg, q.lat, plan.entreUsado, q.reb, q.ancho, false,
                             plan.encajar, q.dib);
        } catch (e) { return; }                                                  
        const O = Object.assign({}, C1_CAT, {ancho: q.ancho});



        const pb = c.puntaB;
        const firma = [n1(q.ancho), n1(c.largo), pb ? n1(pb.ancho) : '-',
                       pb ? n1(pb.largo) : '-', pb ? n1(Math.abs(pb.desvio)) : '-',
                       n1(Math.abs(q.lat))].join('|');
        const hay = grupos.filter(g => g.firma === firma)[0];
        if (hay) { hay.fases.push(q.fase); hay.espejo = hay.espejo || (hay.signo !== Math.sign(q.lat)); }
        else grupos.push({firma: firma, fases: [q.fase], c: c, O: O,
                          signo: Math.sign(q.lat), espejo: false,
                          recto: Math.abs(q.lat) < 0.05});
      });
      return grupos;
    }



    const FAMILIA = {
      riel: {S: S_CAT, RT: SOPORTE_RT, INTER: SOPORTE_INTER, PLACA: PLACA_CAT,
             perno: PERNO_CONECTOR, etiqueta: 'Riel'},
      m1:   {S: S_M1, RT: SOPORTE_RT_M1, INTER: SOPORTE_INTER_M1, PLACA: PLACA_M1,
             perno: PERNO_CONECTOR_M1, etiqueta: 'CM Fijo'}
    };
    const seccionDe = fam => FAMILIA[fam].S.ancho + ' × ' + FAMILIA[fam].S.espesor;




    function porPiezaYFamilia(ej) {
      const g = {};
      for (const f of ej.fases) {
        const pieza = ej.piezas[f];
        for (const c of (ej.conectores[f] || [])) {
          const fam = famDe(c), k = pieza + '|' + fam;
          const e = g[k] || (g[k] = {pieza: pieza, fam: fam, n: 0, fases: []});
          e.n++;
          if (e.fases.indexOf(f) === -1) e.fases.push(f);
        }
      }
      return g;
    }
    const ORDEN_PIEZA = ['s', 'rt', 'inter'];
    const ORDEN_FAM   = ['riel', 'm1'];
    const NOMBRE_PIEZA = {s: 'S', rt: 'soporte del RT', inter: 'soporte del intermedio'};



















    function s_conectores(id, ej) {











      const alinea = p => {
        const x0 = Math.min(...p.contorno.map(q => q[0]));
        const mx = q => [q[0] - x0, q[1]];
        const pz = {
          contorno: p.contorno.map(mx),
          huecos: (p.huecos || []).map(h => h.map(mx)),
          agujeros: (p.agujeros || []).map(a => Object.assign({}, a, {x: a.x - x0,
                                                                     texto: dia(2 * a.r)})),
          pletina: !!p.pletina,
          ejes: true
        };
        const L = Math.max(...pz.contorno.map(q => q[0]));
        const yy = pz.contorno.map(q => q[1]);
        pz.cotaAncho = n1(Math.max(...yy) - Math.min(...yy));


        const ref = pz.agujeros.map(a => a.x).concat(
          pz.huecos.map(h => {
            const xs = h.map(q => q[0]);
            return (Math.min(...xs) + Math.max(...xs)) / 2;
          })).sort((a, b) => a - b);







        const cortes = [];
        let ant = 0;
        for (const u of ref) { cortes.push(u - ant); ant = u; }
        if (L - ant > 0.05) cortes.push(L - ant);
        const dec = v => Math.round(v * 10) / 10;
        const rd = cortes.map(dec);
        rd[rd.length - 1] = dec(dec(L) - rd.slice(0, -1).reduce((a, b) => a + b, 0));
        const suma = rd.reduce((a, b) => a + b, 0);
        if (Math.abs(suma - dec(L)) > 5e-9)
          throw new Error('la cadena suma ' + suma + ' y la pieza mide ' + dec(L));
        pz.cadena = [];
        ant = 0;
        cortes.forEach((c, i) => {
          pz.cadena.push({desde: ant, hasta: ant + c, texto: rd[i].toFixed(1)});
          ant += c;
        });
        return pz;
      };
      const filas = [];




      const deCircuito = fases => fases.reduce((n, f) => n + (ej.conectores[f] || []).length, 0);
      const conAlguno = fases => (fases || []).filter(f => (ej.conectores[f] || []).length);
      const pon = (p, nombre, fases, largo, cuantas) => {
        const pz = alinea(p);
        pz.etiqueta = nombre + ' ×' + (cuantas === undefined ? deCircuito(fases) : cuantas);
        pz.nota = fases.join(', ') + ' · ' + n1(largo) + ' desarrollado';
        filas.push(pz);
      };



      const grupos = porPiezaYFamilia(ej);
      const hayDos = ORDEN_FAM.every(fm =>
        Object.keys(grupos).some(k => grupos[k].fam === fm));
      const apellido = fam => hayDos ? ' · ' + FAMILIA[fam].etiqueta : '';
      const conPlaca = {};
      for (const fam of ORDEN_FAM) for (const pieza of ORDEN_PIEZA) {
        const g = grupos[pieza + '|' + fam];
        if (!g) continue;
        const F = FAMILIA[fam];
        const p = (pieza === 's') ? s_conectorS(F.S)
                : s_soporte('x', pieza === 'rt' ? F.RT : F.INTER, 'x');
        const largo = (pieza === 's') ? construirConectorS(THREE, F.S).desarrollo
                                      : p.comprueba;
        pon(p, NOMBRE_PIEZA[pieza] + apellido(fam), g.fases, largo, g.n);

        if (pieza !== 's') {
          const cp = conPlaca[fam] || (conPlaca[fam] = {n: 0, fases: []});
          cp.n += g.n;
          g.fases.forEach(f => { if (cp.fases.indexOf(f) === -1) cp.fases.push(f); });
        }
      }
      for (const fam of ORDEN_FAM) {
        const cp = conPlaca[fam];
        if (!cp) continue;
        const p = s_placa(FAMILIA[fam].PLACA);
        pon(p, 'placa' + apellido(fam), cp.fases, p.comprueba, cp.n);
      }
      const c1 = ej.c1 || (ej.sep === 50 ? 'catalogo' : 'recto');
      if (c1 === 'tablero') {

        const gs = c1DelTablero(ej);
        gs.forEach(function (g) {
          const pz = c1Desplegado('x', 'x', g.c, g.O);
          pon(pz, 'C1 ' + (g.recto ? 'recto' : 'acodado') + ', al IG',
              g.fases, pz.desarrollo, g.fases.length);
          if (g.espejo) filas[filas.length - 1].nota += ' · en espejo';
        });
      } else if (c1 !== 'no') {
        const c1r = s_c1('x', 0, 'x');
        if (c1 === 'catalogo') {
          pon(c1r, 'C1 recto, al IG', ['S'], c1r.comprueba, 1);
          const c1a = s_c1('x', 9.5, 'x');
          pon(c1a, 'C1 acodado, al IG', ['R', 'T'], c1a.comprueba, 2);
        } else {
          pon(c1r, 'C1 al IG', ej.fases, c1r.comprueba, ej.fases.length);
        }
      }
      if (!filas.length) return null;
      const largos = filas.map(pz => Math.max(...pz.contorno.map(q => q[0])));
      return {
        nombre: id,
        titulo: 'conectores del ' + ej.titulo,
        piezas: filas,
        escala: 5,
        separacion: 12,
        ficha: 'pletina ' + (hayDos
                 ? '10 × 2 las de Riel y 15 × 3 las del CM Fijo'
                 : (Object.keys(grupos).some(k => grupos[k].fam === 'm1')
                      ? '15 × 3 las de circuito' : '10 × 2 las de circuito')) +
               (c1 === 'no' ? '' : ', 20 × 3 el C1') +
               ' · cadena hasta cada agujero, ' +
               'su Ø debajo y el ancho a la derecha · sin cotas de plegado',
        nota: '×n: cuántas lleva el tablero, y en qué fases' +
              (c1 === 'recto' ? ' · el C1 acodado lo pone el IG, ver 8.3' : '') +
              (c1 === 'tablero' ? ' · los C1 van como en el dibujo: rectos sobre la ' +
                                  'barra, en S de canto R40 hasta la columna del borne ' +
                                  'y rectos al borne; las curvas salen con la pieza' : '') +
              (ej.avisoConectores ? ' · ' + ej.avisoConectores : ''),
        eje: false,
        comprueba: Math.max(...largos)
      };
    }























    function s_barraPE(id, ej) {
      const celdas = celdasPE(ej);
      const pe = construirBarraPE({celdas: celdas, ancho: BARRA.ancho,
                                   espesor: BARRA.espesor});
      const W = pe.ancho, L = pe.desarrollo;
      const arco = Math.PI / 2 * pe.codo;
      const off = pe.pata + arco + pe.vert + arco;                          


      const aLargo = a => (a.y < pe.alto / 2)
        ? ((a.x < pe.largo / 2) ? a.x : L - (pe.largo - a.x))
        : off + (a.x - pe.xPuente);
      const ags = pe.agujeros.map(a => ({x: aLargo(a), y: W / 2 + a.z, r: a.r, dz: a.z}))
                             .sort((p, q) => p.x - q.x);
      if (ags.length !== celdas.length + 2)
        throw new Error('la PE trae ' + ags.length + ' agujeros y se esperaban ' +
                        (celdas.length + 2));




      const vistos = {};
      for (const a of ags) {
        const t = dia(2 * a.r);
        if (!vistos[t]) { vistos[t] = true; a.texto = t; }
      }


      const xs = [0].concat(ags.map(a => a.x), [L]);
      const cadena = [];
      const igual = (a, b) => Math.abs(a - b) < 1e-3;
      for (let i = 0; i + 1 < xs.length;) {
        const paso = xs[i + 1] - xs[i];
        let j = i + 1;

        if (i >= 1) while (j + 1 < xs.length - 1 && igual(xs[j + 1] - xs[j], paso)) j++;
        const n = j - i;
        if (n >= 3) {
          cadena.push({desde: xs[i], hasta: xs[j],
                       texto: n + ' × ' + n1(paso) + ' = ' + n1(n * paso)});
          i = j;
        } else {
          if (paso > 0.05) cadena.push({desde: xs[i], hasta: xs[i + 1], texto: n1(paso)});
          i++;
        }
      }
      const suma = cadena.reduce((a, c) => a + (c.hasta - c.desde), 0);

      const corridos = ags.filter(a => Math.abs(a.dz) > 1e-6);
      return {
        nombre: id,
        titulo: 'barra PE del ' + ej.titulo,
        piezas: [{
          contorno: [[0, 0], [L, 0], [L, W], [0, W]],
          agujeros: ags,
          cadena: cadena,
          cotaAncho: n1(W),
          ejes: true



        }],
        abajo: [{desde: 0, hasta: L, texto: n1(L) + ' desarrollado'}],
        escala: 4,
        ficha: `pletina ${W} × ${pe.espesor} · ${celdas.length} segmentos · puente ` +
               `${n1(pe.puente)} · alas de ${n1(pe.pata)} · pliegues R${pe.radio} interior`,
        nota: (corridos.length
                ? corridos.length + ' agujeros ' + dia(2 * corridos[0].r) +
                  ' a ±' + n1(Math.abs(corridos[0].dz)) + ' del eje, alternos · '
                : '') +
              (op.programa ? 'sin cotas de plegado'
                           : 'sin cotas de plegado: los pliegues van en el 10 del manual'),
        eje: false,
        comprueba: L,
        suma: suma
      };
    }








    function s_barras(id, ej) {
      const W = BARRA.ancho;
      const alcances = ej.fases.map(f => Columna.ALCANCE[ej.piezas[f]]);
      const rep = Columna.reparto(alcances, ej.sep);

      const piezas = ej.fases.map((f, i) => {
        const dv = rep[i].agujero;
        const cons = ej.conectores[f] || [];



        const yEje = i * ej.sep;



        const ags = ej.estructura.map(a => ({x: a.u, y: yEje, r: a.d / 2,
                                             texto: dia(a.d)}))
          .concat(cons.map(c => {


            const D = FAMILIA[famDe(c)].perno;
            return {x: uDe(c), y: yEje + dv, r: D / 2, texto: dia(D)};
          }));
        const pz = {
          contorno: [[0, yEje - W / 2], [ej.largo, yEje - W / 2],
                     [ej.largo, yEje + W / 2], [0, yEje + W / 2]],
          agujeros: ags,
          etiqueta: f,





          nota: (cons.length && Math.abs(dv) >= 0.05)
                  ? ((dv > 0 ? '+' : '') + dv.toFixed(2) + ' del eje') : '',
          ejes: true
        };



        const ref = ej.estructura.map(a => a.u)
                      .concat(cons.map(uDe)).sort((a, b) => a - b);
        pz.cadena = [];
        let ant = 0;
        for (const u of ref) {
          pz.cadena.push({desde: ant, hasta: u, texto: n1(u - ant)});
          ant = u;
        }
        if (ej.largo - ant > 0.05)
          pz.cadena.push({desde: ant, hasta: ej.largo, texto: n1(ej.largo - ant)});
        return pz;
      });

      const corridos = ej.fases.filter((f, i) => (ej.conectores[f] || []).length &&
                                                 Math.abs(rep[i].agujero) >= 0.05);
      const noLlegan = ej.fases
        .map((f, i) => ({f: f, sobra: Math.abs(rep[i].sobra || 0),
                         hay: (ej.conectores[f] || []).length}))
        .filter(x => x.hay && x.sobra >= 0.05)
        .map(x => x.f + ' (faltan ' + x.sobra.toFixed(1) + ')');
      return {
        nombre: id,
        titulo: 'barras del ' + ej.titulo,
        piezas: piezas,
        apilar: false,


        escala: 4,





        cotasV: ej.fases.map((f, i) => ({
          desde: i * ej.sep - W / 2, hasta: i * ej.sep + W / 2, texto: n1(W)
        })),
        abajo: [{desde: 0, hasta: ej.largo, texto: n1(ej.largo) + ' de largo'}],
        ficha: `pletina ${W} × ${BARRA.espesor} · paso entre barras ${n1(ej.sep)}` +
               (ej.fases.some(f => (ej.conectores[f] || []).some(c => famDe(c) === 'm1'))
                  ? ` · Ø4.76 el conector de Riel -3/16"- y Ø6.35 el del CM Fijo -1/4"-`
                  : ` · el Ø4.76 del conector es el 3/16"`) +
               ` · entre barras quedan ${n1(ej.sep - W)} de aire`,
        nota: (corridos.length
                ? 'agujero de conector corrido en ' + corridos.join(', ')
                : 'todos los agujeros en el eje') +




              (noLlegan.length ? ' · OJO: a este paso no llegan a la columna ' +
                                 noLlegan.join(', ') : '') +
              (ej.avisoBarras ? ' · ' + ej.avisoBarras : ''),
        eje: false,
        comprueba: ej.largo,

        suma: piezas[0].cadena.reduce((a, c) => a + (c.hasta - c.desde), 0),
        sumas: piezas.map(z => z.cadena.reduce((a, c) => a + (c.hasta - c.desde), 0))
      };
    }











    function s_materiales(ej, M) {
      M = M || {};


      const grupos = porPiezaYFamilia(ej);
      const cuantos = (pieza, fam) => (grupos[pieza + '|' + fam] || {n: 0}).n;
      const nSop = fam => cuantos('rt', fam) + cuantos('inter', fam);
      const nSoportes = nSop('riel') + nSop('m1');







      const largosDe = fam => {
        const F = FAMILIA[fam];
        return {
          S: construirConectorS(THREE, F.S).desarrollo,
          RT: construirSoporteRT(THREE, F.RT).desarrollo + 2 * F.RT.saliente,
          INTER: construirSoporteRT(THREE, F.INTER).desarrollo + 2 * F.INTER.saliente,
          PLACA: construirPlacaRT(THREE, F.PLACA).desarrollo
        };
      };

      const seccionFamilia = fam => {
        const L = largosDe(fam), ap = FAMILIA[fam].etiqueta;
        const dos = ORDEN_FAM.every(fm => nSop(fm) + cuantos('s', fm) > 0);
        const nom = t => t + (dos ? ' · ' + ap : '');
        const filas = [
          cuantos('s', fam)     ? {q: cuantos('s', fam), pieza: nom('Conector S'), largo: L.S} : null,
          cuantos('rt', fam)    ? {q: cuantos('rt', fam), pieza: nom('Soporte del RT'),
                                   largo: L.RT, nota: 'de punta a punta'} : null,
          cuantos('inter', fam) ? {q: cuantos('inter', fam), pieza: nom('Soporte del intermedio'),
                                   largo: L.INTER, nota: 'de punta a punta'} : null,
          nSop(fam)             ? {q: nSop(fam), pieza: nom('Placa'), largo: L.PLACA} : null
        ].filter(Boolean);
        return filas.length ? {seccion: seccionDe(fam), filas: filas} : null;
      };
      const c1r   = construirConectorC1(Object.assign({}, C1_CAT,
                      {lateral: 0, alfa: 45, alfaMax: 45, pliegueMax: 70, recorta: true}));
      const c1a   = construirConectorC1(Object.assign({}, C1_CAT,
                      {lateral: 9.5, alfa: 45, alfaMax: 45, pliegueMax: 70, recorta: true}));




      function filasC1(ej, M, c1r, c1a) {
        if (M.c1 === 'no') return [];
        if (M.c1 === 'tablero')
          return c1DelTablero(ej).map(function (g) {
            return {q: g.fases.length,
                    pieza: 'C1 ' + (g.recto ? 'recto' : 'acodado') + ', al IG',
                    largo: g.c.desarrollo, nota: g.fases.join(', ')};
          });
        return [{q: 1, pieza: 'C1 recto, al IG', largo: c1r.desarrollo},
                {q: ej.fases.length - 1, pieza: 'C1 acodado, al IG',
                 largo: c1a.desarrollo, nota: 'de catálogo'}];
      }




      const celdas = celdasPE(ej);
      const pe = celdas.length
        ? construirBarraPE({celdas: celdas, ancho: BARRA.ancho, espesor: BARRA.espesor}) : null;

      const cobre = [
        {seccion: BARRA.ancho + ' × ' + BARRA.espesor, filas: [
          {q: ej.fases.length, pieza: 'Barra principal ' + ej.fases.join(', '), largo: ej.largo},
          celdas.length ? {q: 1, pieza: 'Barra PE', largo: pe.desarrollo,
                           nota: celdas.length + ' segmentos'} : null,
        ].concat(filasC1(ej, M, c1r, c1a)).filter(Boolean)},
      ].concat(ORDEN_FAM.map(seccionFamilia).filter(Boolean));
      cobre.forEach(s => {
        s.filas.forEach(f => { f.total = f.q * f.largo; });
        s.total = s.filas.reduce((a, f) => a + f.total, 0);
      });



      const saco = {};
      const pon = (pieza, n, donde) => {
        if (!n) return;
        const e = saco[pieza] || (saco[pieza] = {n: 0, donde: []});
        e.n += n;
        e.donde.push(donde + ' ' + n);
      };



      const pilas = fam => cuantos('s', fam) + 2 * nSop(fam);
      pon(T_3_8,   pilas('riel'), 'conectores');
      pon(PRES316, pilas('riel'), 'conectores');
      pon(PLAN316, pilas('riel'), 'conectores');
      pon(PERNO12, pilas('m1'), 'conectores CM Fijo');
      pon(PRES14,  pilas('m1'), 'conectores CM Fijo');
      pon(PLAN14,  pilas('m1'), 'conectores CM Fijo');


      const nC1 = (typeof M.nC1 === 'number') ? M.nC1 : ej.fases.length;
      pon(PERNO34, nC1, 'C1');
      pon(PRES14,  2 * nC1, 'C1');
      pon(PLAN14,  nC1, 'C1');
      pon(TUER14,  nC1, 'C1');

      const nAis = ej.estructura.filter(a => a.rol === 'a').length * ej.fases.length;
      if (M.aislador === 'base') {
        pon(PHIL34, nAis, 'aislador');
        pon(PLAN14, nAis, 'aislador');
        pon(PRES14, nAis, 'aislador');
        pon(TUER14, nAis, 'aislador');
      } else if (M.aislador !== 'ninguno') {                                      
        pon(PERNO12, 2 * nAis, 'aislador');
        pon(PLAN14,  2 * nAis, 'aislador');
        pon(PRES14,  2 * nAis, 'aislador');
      }




      const nPEperno = celdas.filter(c => c.pieza === 'perno').length;
      const nPE10 = celdas.length - nPEperno;
      if (nPEperno) { pon(PERNO12, nPEperno, 'barra PE'); pon(PLAN14, nPEperno, 'barra PE'); pon(PRES14, nPEperno, 'barra PE'); }
      pon(T_3_8,   nPE10, 'barra PE');
      pon(PRES316, nPE10, 'barra PE');

      const ORDEN = [T_3_8, PRES316, PLAN316, PERNO34, PERNO12, PHIL34, PRES14, PLAN14, TUER14];
      const perneria = ORDEN.filter(k => saco[k]).map(k => ({
        pieza: k, n: saco[k].n, donde: saco[k].donde.join(' · ')
      }));


      const nSegPE = celdas.length;
      const RH = 26, PAD = 18, GAP = 26;
      const CW = [250, 40, 82, 96], PW = CW.reduce((a, b) => a + b, 0);              
      const QW = [262, 44, 170],    QW_ = QW.reduce((a, b) => a + b, 0);                
      const W = PAD * 2 + PW + GAP + QW_;

      const P = [];
      const txt = (x, y, s, o) => {
        o = o || {};
        return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"' +
          (o.fin ? ' text-anchor="end"' : '') +
          ' font-size="' + (o.fs || 13) + '"' +
          (o.peso ? ' font-weight="' + o.peso + '"' : '') +
          ' fill="' + (o.color || TINTA) + '">' + esc(s) + '</text>';
      };
      const linea = (x, y, w) => '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) +
                                 ' h' + w.toFixed(1) + '" stroke="' + LINEA + '"/>';
      const banda = (x, y, w) => '<rect x="' + x.toFixed(1) + '" y="' + (y - RH + 7).toFixed(1) +
        '" width="' + w.toFixed(1) + '" height="' + RH + '" fill="' + BANDA + '"/>';


      let x = PAD, y = PAD + 20;
      const cx = [x, x + CW[0], x + CW[0] + CW[1], x + CW[0] + CW[1] + CW[2], x + PW];
      P.push(banda(x, y, PW));
      P.push(txt(cx[0] + 6, y, 'COBRE · pletina', {peso: 700}));
      P.push(txt(cx[2] - 6, y, '×n', {fin: true, color: TINTA2, fs: 11.5}));
      P.push(txt(cx[3] - 6, y, 'largo', {fin: true, color: TINTA2, fs: 11.5}));
      P.push(txt(cx[4] - 6, y, 'total', {fin: true, color: TINTA2, fs: 11.5}));
      let general = 0;
      for (const s of cobre) {
        y += RH;
        P.push(txt(cx[0] + 6, y, 'Pletina ' + s.seccion + ' mm', {peso: 600, color: COBRE}));
        for (const f of s.filas) {
          y += RH;
          P.push(linea(x, y - RH + 7, PW));
          P.push(txt(cx[0] + 16, y, f.pieza));
          if (f.nota) P.push(txt(cx[0] + 16 + f.pieza.length * 6.9 + 8, y, f.nota,
                                 {fs: 10.5, color: TINTA2}));
          P.push(txt(cx[2] - 6, y, String(f.q), {fin: true}));
          P.push(txt(cx[3] - 6, y, n1(f.largo), {fin: true, color: TINTA2}));
          P.push(txt(cx[4] - 6, y, n1(f.total), {fin: true}));
        }
        y += RH;
        P.push(linea(x, y - RH + 7, PW));
        P.push(txt(cx[0] + 16, y, 'Metros lineales', {peso: 600}));
        P.push(txt(cx[4] - 6, y, (s.total / 1000).toFixed(2) + ' m', {fin: true, peso: 700, color: COBRE}));
        general += s.total;
      }
      y += RH;
      P.push(banda(x, y, PW));
      P.push(txt(cx[0] + 6, y, 'Total de pletina', {peso: 700}));
      P.push(txt(cx[4] - 6, y, (general / 1000).toFixed(2) + ' m', {fin: true, peso: 700, color: COBRE}));
      const finCobre = y;


      x = PAD + PW + GAP; y = PAD + 20;
      const qx = [x, x + QW[0], x + QW[0] + QW[1], x + QW_];
      P.push(banda(x, y, QW_));
      P.push(txt(qx[0] + 6, y, 'PERNERÍA', {peso: 700}));
      P.push(txt(qx[2] - 6, y, '×n', {fin: true, color: TINTA2, fs: 11.5}));
      P.push(txt(qx[2] + 6, y, 'dónde va', {color: TINTA2, fs: 11.5}));
      let tot = 0;
      for (const f of perneria) {
        y += RH;
        P.push(linea(x, y - RH + 7, QW_));
        P.push(txt(qx[0] + 6, y, f.pieza));
        P.push(txt(qx[2] - 6, y, String(f.n), {fin: true, peso: 600}));
        P.push(txt(qx[2] + 6, y, f.donde, {fs: 10.5, color: TINTA2}));
        tot += f.n;
      }
      y += RH;
      P.push(banda(x, y, QW_));
      P.push(txt(qx[0] + 6, y, 'Piezas de pernería', {peso: 700}));
      P.push(txt(qx[2] - 6, y, String(tot), {fin: true, peso: 700}));

      const pie = Math.max(finCobre, y) + RH + 6;
      const notas = M.notas || [];


      const cabe = Math.floor((W - 2 * PAD) / 5.4);
      const lineas = [];
      for (const t of notas) {
        let resto = t;
        while (resto.length > cabe) {
          let corte = resto.lastIndexOf(' ', cabe);
          if (corte <= 0) corte = cabe;
          lineas.push(resto.slice(0, corte));
          resto = resto.slice(corte + 1);
        }
        lineas.push(resto);
      }
      lineas.forEach((t, i) => P.push(txt(PAD, pie + i * 17, t, {fs: 11, color: TINTA2})));
      const H = pie + lineas.length * 17 + 4;

      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + Math.round(H) +
        '"\n     viewBox="0 0 ' + W + ' ' + Math.round(H) + '" role="img"\n' +
        '     font-family="Segoe UI,system-ui,Arial,sans-serif"\n' +
        '     aria-label="Lista de materiales del ' + esc(ej.titulo).replace(/"/g, '&quot;') +
        ': metros lineales de pletina de cada medida y perneria">\n' +
        '  <rect width="' + W + '" height="' + Math.round(H) + '" fill="' + PAPEL + '"/>\n  ' +
        P.join('\n  ') + '\n</svg>\n';



      return {svg: svg, ancho: W, alto: Math.round(H), metros: general / 1000,
              piezas: tot, segmentosPE: nSegPE,
              cobre: cobre, perneria: perneria, notas: M.notas || []};
    }





    function dibujar(p) {
      const conts = p.piezas ? p.piezas.map(z => z.contorno) : [p.contorno];
      const xs = [].concat(...conts.map(cc => cc.map(q => q[0])));
      const largo = Math.max(...xs) - Math.min(...xs);
      for (const su of (p.sumas || (typeof p.suma === 'number' ? [p.suma] : [])))
        if (Math.abs(su - p.comprueba) > 2e-3)
          throw new Error(p.titulo + ': una cadena suma ' + su.toFixed(3) +
                          ' y la pieza mide ' + p.comprueba.toFixed(3));
      if (Math.abs(largo - p.comprueba) > 2e-3)
        throw new Error(p.titulo + ': la silueta mide ' + largo.toFixed(3) +
                        ' y el modulo dice ' + p.comprueba.toFixed(3));
      if (p.pedido && Math.abs(p.pedido.lateral - p.pedido.tiene) > 1e-3)
        throw new Error(p.titulo + ': se pidio un corrimiento de ' + p.pedido.lateral +
                        ' y la pieza trae ' + p.pedido.tiene.toFixed(3));
      return desplegadoSVG.dibujar(Object.assign({
        alt: p.titulo + ' desplegado: pletina de ' + n1(p.comprueba) + ' mm'
      }, p));
    }

    return {
      cat: {S: S_CAT, SOPORTE_RT: SOPORTE_RT, SOPORTE_INTER: SOPORTE_INTER,
            PLACA: PLACA_CAT, C1: C1_CAT, BARRA: BARRA,
            S_M1: S_M1, SOPORTE_RT_M1: SOPORTE_RT_M1,
            SOPORTE_INTER_M1: SOPORTE_INTER_M1, PLACA_M1: PLACA_M1},
      conectorS: s_conectorS, soporte: s_soporte, placa: s_placa, c1: s_c1,
      conectores: s_conectores, barraPE: s_barraPE, barras: s_barras,
      materiales: s_materiales,
      dibujar: dibujar
    };
  }

  const api = {CAT: CAT, PE_SEG: PE_SEG, celdasPE: celdasPE,
               celdasDeTexto: celdasDeTexto, crear: crear};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.laminasCobre = api;

})(typeof globalThis !== 'undefined' ? globalThis : this);
