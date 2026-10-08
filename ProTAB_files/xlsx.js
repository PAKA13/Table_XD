















var XLSX_EST = {
  normal: 0, titulo: 1, seccion: 2, encabezado: 3, celda: 4,
  etiqueta: 5, numero: 6, subtitulo: 7, total: 8, dato: 9, totalNum: 10, item: 11
};

var _XLSX_STYLES =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<fonts count="5">' +
    '<font><sz val="10"/><name val="Calibri"/><family val="2"/></font>' +
    '<font><b/><sz val="10"/><name val="Calibri"/><family val="2"/></font>' +
    '<font><b/><sz val="16"/><color rgb="FF121753"/><name val="Calibri"/><family val="2"/></font>' +
    '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>' +
    '<font><sz val="10"/><color rgb="FF475467"/><name val="Calibri"/><family val="2"/></font>' +
  '</fonts>' +
  '<fills count="6">' +
    '<fill><patternFill patternType="none"/></fill>' +
    '<fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FF121753"/><bgColor indexed="64"/></patternFill></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FFDDE3EE"/><bgColor indexed="64"/></patternFill></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FFF4F6FB"/><bgColor indexed="64"/></patternFill></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FFEEF0F4"/><bgColor indexed="64"/></patternFill></fill>' +
  '</fills>' +
  '<borders count="2">' +
    '<border><left/><right/><top/><bottom/><diagonal/></border>' +
    '<border><left style="thin"><color rgb="FFA9B1C1"/></left><right style="thin"><color rgb="FFA9B1C1"/></right>' +
    '<top style="thin"><color rgb="FFA9B1C1"/></top><bottom style="thin"><color rgb="FFA9B1C1"/></bottom><diagonal/></border>' +
  '</borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="12">' +

    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +

    '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +

    '<xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">' +
      '<alignment vertical="center"/></xf>' +

    '<xf numFmtId="0" fontId="1" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">' +
      '<alignment horizontal="center" vertical="center" wrapText="1"/></xf>' +

    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">' +
      '<alignment vertical="top" wrapText="1"/></xf>' +

    '<xf numFmtId="0" fontId="1" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">' +
      '<alignment vertical="top" wrapText="1"/></xf>' +

    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">' +
      '<alignment horizontal="center" vertical="top" wrapText="1"/></xf>' +

    '<xf numFmtId="0" fontId="1" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">' +
      '<alignment vertical="center"/></xf>' +

    '<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">' +
      '<alignment vertical="top" wrapText="1"/></xf>' +

    '<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +

    '<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">' +
      '<alignment horizontal="center" vertical="top"/></xf>' +

    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">' +
      '<alignment vertical="top" wrapText="1" indent="1"/></xf>' +
  '</cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  '</styleSheet>';

function _xlsxEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}
function _xlsxCol(n) {                         
  var s = '';
  n++;
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}


function _xlsxAlto(fila, cols) {
  var lineas = 1, c = 0;
  fila.celdas.forEach(function(cel) {
    var span = cel.span || 1, ancho = 0;
    for (var k = 0; k < span; k++) ancho += (cols[c + k] || 10);
    c += span;
    if (typeof cel.v !== 'string') return;
    var n = 0;
    cel.v.split('\n').forEach(function(l) { n += Math.max(1, Math.ceil(l.length * 1.08 / Math.max(4, ancho - 1))); });
    lineas = Math.max(lineas, n);
  });
  return lineas > 1 ? lineas * 13.5 + 3 : null;
}
function _xlsxHoja(h) {
  var merges = [];
  var filasXml = h.filas.map(function(fila, i) {
    var r = i + 1, c = 0, celdas = '';
    fila.celdas.forEach(function(cel) {
      var span = cel.span || 1, s = cel.s || 0, ref = _xlsxCol(c) + r;
      if (cel.v === '' || cel.v == null) {
        celdas += '<c r="' + ref + '" s="' + s + '"/>';
      } else if (typeof cel.v === 'number' && isFinite(cel.v)) {
        celdas += '<c r="' + ref + '" s="' + s + '"><v>' + cel.v + '</v></c>';
      } else {
        celdas += '<c r="' + ref + '" s="' + s + '" t="inlineStr"><is><t xml:space="preserve">' +
          _xlsxEsc(cel.v) + '</t></is></c>';
      }


      for (var k = 1; k < span; k++) celdas += '<c r="' + _xlsxCol(c + k) + r + '" s="' + s + '"/>';
      if (span > 1) merges.push(ref + ':' + _xlsxCol(c + span - 1) + r);
      c += span;
    });
    var alto = fila.alto || _xlsxAlto(fila, h.cols);
    return '<row r="' + r + '"' + (alto ? ' ht="' + alto + '" customHeight="1"' : '') + '>' + celdas + '</row>';
  }).join('');
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>' +
    '<sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews>' +
    '<sheetFormatPr defaultRowHeight="15"/>' +
    '<cols>' + h.cols.map(function(w, i) {
      return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>';
    }).join('') + '</cols>' +
    '<sheetData>' + filasXml + '</sheetData>' +
    (merges.length ? '<mergeCells count="' + merges.length + '">' +
      merges.map(function(m) { return '<mergeCell ref="' + m + '"/>'; }).join('') + '</mergeCells>' : '') +
    '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>' +
    '<pageSetup paperSize="9" orientation="' + (h.horizontal ? 'landscape' : 'portrait') +
    '" fitToWidth="1" fitToHeight="0"/>' +
    '</worksheet>';
}


var _xlsxCrcTabla = null;
function _xlsxCrc(b) {
  if (!_xlsxCrcTabla) {
    _xlsxCrcTabla = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      _xlsxCrcTabla[n] = c >>> 0;
    }
  }
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < b.length; i++) crc = _xlsxCrcTabla[(crc ^ b[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function _xlsxZip(archivos) {
  var enc = new TextEncoder();
  var hoy = new Date();
  var hora = (hoy.getHours() << 11) | (hoy.getMinutes() << 5) | (hoy.getSeconds() >> 1);
  var fecha = ((hoy.getFullYear() - 1980) << 9) | ((hoy.getMonth() + 1) << 5) | hoy.getDate();
  var partes = [], central = [], off = 0;
  var u16 = function(a, v) { a.push(v & 0xFF, (v >>> 8) & 0xFF); };
  var u32 = function(a, v) { a.push(v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF); };
  archivos.forEach(function(f) {
    var nom = enc.encode(f.nombre), dat = enc.encode(f.texto), crc = _xlsxCrc(dat);
    var h = [];
    u32(h, 0x04034b50); u16(h, 20); u16(h, 0x0800); u16(h, 0); u16(h, hora); u16(h, fecha);
    u32(h, crc); u32(h, dat.length); u32(h, dat.length); u16(h, nom.length); u16(h, 0);
    partes.push(new Uint8Array(h), nom, dat);
    var c = [];
    u32(c, 0x02014b50); u16(c, 20); u16(c, 20); u16(c, 0x0800); u16(c, 0); u16(c, hora); u16(c, fecha);
    u32(c, crc); u32(c, dat.length); u32(c, dat.length); u16(c, nom.length); u16(c, 0); u16(c, 0);
    u16(c, 0); u16(c, 0); u32(c, 0); u32(c, off);
    central.push(new Uint8Array(c), nom);
    off += h.length + nom.length + dat.length;
  });
  var tamCentral = central.reduce(function(s, a) { return s + a.length; }, 0);
  var fin = [];
  u32(fin, 0x06054b50); u16(fin, 0); u16(fin, 0); u16(fin, archivos.length); u16(fin, archivos.length);
  u32(fin, tamCentral); u32(fin, off); u16(fin, 0);
  var todo = partes.concat(central, [new Uint8Array(fin)]);
  var out = new Uint8Array(todo.reduce(function(s, a) { return s + a.length; }, 0)), p = 0;
  todo.forEach(function(a) { out.set(a, p); p += a.length; });
  return out;
}

function xlsxLibro(hojas) {
  var nombres = {};
  hojas.forEach(function(h, i) {

    var n = String(h.nombre || ('Hoja ' + (i + 1))).replace(/[:\\\/?*\[\]]/g, ' ').slice(0, 31);
    while (nombres[n]) n = n.slice(0, 28) + ' ' + (i + 1);
    nombres[n] = true;
    h._nombre = n;
  });
  var archivos = [
    { nombre: '[Content_Types].xml', texto:
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      hojas.map(function(h, i) {
        return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ' +
          'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
      }).join('') + '</Types>' },
    { nombre: '_rels/.rels', texto:
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>' },
    { nombre: 'xl/workbook.xml', texto:
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
      hojas.map(function(h, i) {
        return '<sheet name="' + _xlsxEsc(h._nombre) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>';
      }).join('') + '</sheets></workbook>' },
    { nombre: 'xl/_rels/workbook.xml.rels', texto:
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      hojas.map(function(h, i) {
        return '<Relationship Id="rId' + (i + 1) + '" ' +
          'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" ' +
          'Target="worksheets/sheet' + (i + 1) + '.xml"/>';
      }).join('') +
      '<Relationship Id="rId' + (hojas.length + 1) + '" ' +
      'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      '</Relationships>' },
    { nombre: 'xl/styles.xml', texto: _XLSX_STYLES }
  ];
  hojas.forEach(function(h, i) {
    archivos.push({ nombre: 'xl/worksheets/sheet' + (i + 1) + '.xml', texto: _xlsxHoja(h) });
  });
  return _xlsxZip(archivos);
}
