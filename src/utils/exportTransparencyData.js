"use client";

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatTimestampId() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function formatReadableDate() {
  return new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function colIndexToLetters(index) {
  let n = index + 1;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

// Standard IEEE 802.3 CRC32 table for valid PKZIP (.xlsx) archive generation without third-party CVEs
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function computeCrc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipArchive(entries) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes =
      entry.content instanceof Uint8Array ? entry.content : encoder.encode(String(entry.content));
    const crc = computeCrc32(dataBytes);
    const size = dataBytes.length;

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0x21, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + size;
  }

  let centralSize = 0;
  for (const part of centralParts) centralSize += part.length;

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLength = offset + centralSize + eocd.length;
  const output = new Uint8Array(totalLength);
  let cursor = 0;
  for (const part of localParts) {
    output.set(part, cursor);
    cursor += part.length;
  }
  for (const part of centralParts) {
    output.set(part, cursor);
    cursor += part.length;
  }
  output.set(eocd, cursor);
  return output;
}

function buildWorksheetXml({ aoa, merges, colWidths, headerRowIdx }) {
  const colsXml = colWidths
    .map(
      (w, idx) =>
        `<col min="${idx + 1}" max="${idx + 1}" width="${w.wch}" customWidth="1"/>`
    )
    .join("");

  const rowsXml = aoa
    .map((row, rIdx) => {
      const rowNum = rIdx + 1;
      const cellsXml = row
        .map((val, cIdx) => {
          const ref = `${colIndexToLetters(cIdx)}${rowNum}`;
          let styleAttr = "";
          if (rIdx === 0) styleAttr = ' s="1"';
          else if (rIdx === headerRowIdx) styleAttr = ' s="2"';

          if (typeof val === "number" && Number.isFinite(val)) {
            return `<c r="${ref}"${styleAttr}><v>${val}</v></c>`;
          }
          const strVal = val === null || val === undefined ? "" : String(val);
          if (!strVal) {
            return styleAttr ? `<c r="${ref}"${styleAttr}/>` : "";
          }
          return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t xml:space="preserve">${escapeXml(strVal)}</t></is></c>`;
        })
        .filter(Boolean)
        .join("");

      return `<row r="${rowNum}">${cellsXml}</row>`;
    })
    .join("");

  const mergesXml =
    merges.length > 0
      ? `<mergeCells count="${merges.length}">${merges
          .map(
            (m) =>
              `<mergeCell ref="${colIndexToLetters(m.s.c)}${m.s.r + 1}:${colIndexToLetters(m.e.c)}${m.e.r + 1}"/>`
          )
          .join("")}</mergeCells>`
      : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<cols>${colsXml}</cols>
<sheetData>${rowsXml}</sheetData>
${mergesXml}
</worksheet>`;
}

function buildXlsxBytes({ sheetName, aoa, merges, colWidths, headerRowIdx }) {
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="10"/><name val="Calibri"/></font>
    <font><b/><sz val="13"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
  </cellXfs>
</styleSheet>`;

  const sheetXml = buildWorksheetXml({ aoa, merges, colWidths, headerRowIdx });

  return createZipArchive([
    { name: "[Content_Types].xml", content: contentTypesXml },
    { name: "_rels/.rels", content: rootRelsXml },
    { name: "xl/workbook.xml", content: workbookXml },
    { name: "xl/_rels/workbook.xml.rels", content: workbookRelsXml },
    { name: "xl/styles.xml", content: stylesXml },
    { name: "xl/worksheets/sheet1.xml", content: sheetXml },
  ]);
}

export function exportToExcel({
  filename = "Laporan_Transparansi_JagaJalan",
  sheetName = "Data Transparansi",
  title = "LAPORAN TRANSPARANSI DATA PUBLIK — JAGAJALAN",
  subtitle = "Data Terbuka Kewenangan Jalan, Anggaran Proyek LPSE, dan Tindak Lanjut Pengaduan",
  summaryMetrics = [],
  columns = [],
  rows = [],
}) {
  if (typeof window === "undefined") return;

  const colCount = Math.max(columns.length, 4);
  const generatedAt = formatReadableDate();
  const safeSheetName =
    (sheetName || "Data Transparansi").slice(0, 31).replace(/[\\/?*[\]:]/g, "") || "Data";

  const aoa = [];
  const merges = [];

  const titleRow = [title];
  for (let i = 1; i < colCount; i++) titleRow.push("");
  aoa.push(titleRow);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } });

  const subTitleRow = [`${subtitle} • Waktu Unduh: ${generatedAt} WIB`];
  for (let i = 1; i < colCount; i++) subTitleRow.push("");
  aoa.push(subTitleRow);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } });

  aoa.push(new Array(colCount).fill(""));

  if (summaryMetrics.length > 0) {
    const numMetrics = summaryMetrics.length;
    const baseSpan = Math.floor(colCount / numMetrics);
    let remainder = colCount % numMetrics;
    const metricSpans = summaryMetrics.map(() => {
      let span = baseSpan;
      if (remainder > 0) {
        span += 1;
        remainder -= 1;
      }
      return Math.max(1, span);
    });

    const labelRow = [];
    const valRow = [];
    let currentC = 0;
    summaryMetrics.forEach((m, idx) => {
      const span = metricSpans[idx];
      labelRow.push(m.label || "");
      valRow.push(m.value || "");
      for (let s = 1; s < span; s++) {
        labelRow.push("");
        valRow.push("");
      }
      if (span > 1) {
        merges.push({ s: { r: aoa.length, c: currentC }, e: { r: aoa.length, c: currentC + span - 1 } });
        merges.push({ s: { r: aoa.length + 1, c: currentC }, e: { r: aoa.length + 1, c: currentC + span - 1 } });
      }
      currentC += span;
    });

    aoa.push(labelRow);
    aoa.push(valRow);
    aoa.push(new Array(colCount).fill(""));
  }

  const headerRowIdx = aoa.length;
  const headerRow = columns.map((col) => col.header || "");
  while (headerRow.length < colCount) headerRow.push("");
  aoa.push(headerRow);

  rows.forEach((row, rowIdx) => {
    const dataRow = columns.map((col) => {
      const val = typeof col.accessor === "function" ? col.accessor(row, rowIdx) : row[col.key];
      if (val === null || val === undefined) return "";
      return val;
    });
    while (dataRow.length < colCount) dataRow.push("");
    aoa.push(dataRow);
  });

  aoa.push(new Array(colCount).fill(""));
  const footerRowIndex = aoa.length;
  const footerText =
    "JagaJalan — Ekosistem Partisipatif Transparansi Infrastruktur Jalan & Anggaran Publik (UU No. 14/2008 KIP & UU No. 2/2022 Jalan) • https://jagajalan.vercel.app";
  const footerRow = [footerText];
  for (let i = 1; i < colCount; i++) footerRow.push("");
  aoa.push(footerRow);
  merges.push({ s: { r: footerRowIndex, c: 0 }, e: { r: footerRowIndex, c: colCount - 1 } });

  const colWidths = columns.map((col) => {
    if (col.width && typeof col.width === "number") {
      return { wch: Math.max(10, Math.round(col.width / 6.5)) };
    }
    let maxLen = (col.header || "").length;
    for (let i = 0; i < Math.min(rows.length, 30); i++) {
      const val = typeof col.accessor === "function" ? col.accessor(rows[i], i) : rows[i]?.[col.key];
      if (val !== null && val !== undefined) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    }
    return { wch: Math.min(50, Math.max(12, maxLen + 3)) };
  });
  while (colWidths.length < colCount) colWidths.push({ wch: 15 });

  const excelBytes = buildXlsxBytes({
    sheetName: safeSheetName,
    aoa,
    merges,
    colWidths,
    headerRowIdx,
  });

  const blob = new Blob([excelBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${formatTimestampId()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function exportToPDF({
  title = "Laporan Transparansi Data Publik — JagaJalan",
  subtitle = "Audit Terbuka Kewenangan Jalan, Anggaran Proyek LPSE, dan Tindak Lanjut Pengaduan",
  documentCode = "DOC-JGJ-AUDIT",
  orientation = "landscape",
  summaryMetrics = [],
  columns = [],
  rows = [],
  legalNote = "Dokumen ini dihasilkan secara otomatis dari basis data terbuka JagaJalan sebagai instrumen analisis mandiri masyarakat sesuai UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik (KIP) dan UU No. 2 Tahun 2022 tentang Jalan.",
}) {
  if (typeof window === "undefined") return;

  const generatedAt = formatReadableDate();

  const summaryHtml =
    summaryMetrics.length > 0
      ? `
      <div class="summary-grid">
        ${summaryMetrics
          .map(
            (m) => `
          <div class="summary-card">
            <div class="summary-label">${escapeHtml(m.label)}</div>
            <div class="summary-value">${escapeHtml(m.value)}</div>
            ${m.sub ? `<div class="summary-sub">${escapeHtml(m.sub)}</div>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
    `
      : "";

  const tableHeadersHtml = columns
    .map(
      (col) => `
      <th style="text-align: ${col.align || "left"};">${escapeHtml(col.header)}</th>
    `
    )
    .join("");

  const tableRowsHtml = rows
    .map((row, rowIdx) => {
      return `
        <tr>
          ${columns
            .map((col) => {
              const rawVal = typeof col.accessor === "function" ? col.accessor(row, rowIdx) : row[col.key];
              const isMono = col.mono || col.type === "number" || col.type === "currency";
              return `
                <td style="text-align: ${col.align || "left"}; ${
                isMono ? "font-family: 'JetBrains Mono', Consolas, monospace; font-variant-numeric: tabular-nums;" : ""
              }">
                  ${escapeHtml(rawVal ?? "-")}
                </td>
              `;
            })
            .join("")}
        </tr>
      `;
    })
    .join("");

  const htmlDocument = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page {
            size: A4 ${orientation};
            margin: 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 9pt;
            line-height: 1.4;
          }
          .toolbar {
            background: #0f172a;
            color: #ffffff;
            padding: 10px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            border-radius: 6px;
          }
          .toolbar-btn {
            background: #c2410c;
            color: #ffffff;
            border: none;
            padding: 7px 14px;
            border-radius: 5px;
            font-weight: 700;
            font-size: 9pt;
            cursor: pointer;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #c2410c;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .brand {
            font-size: 9pt;
            font-weight: 800;
            color: #c2410c;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .doc-title {
            font-size: 14pt;
            font-weight: 800;
            color: #0f172a;
            margin: 3px 0;
          }
          .doc-subtitle {
            font-size: 8.5pt;
            color: #475569;
          }
          .meta-box {
            text-align: right;
            font-family: Consolas, monospace;
            font-size: 8pt;
            color: #334155;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 6px 10px;
            border-radius: 5px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(${Math.min(Math.max(summaryMetrics.length, 1), 4)}, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          }
          .summary-card {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 5px;
            padding: 8px 10px;
          }
          .summary-label {
            font-size: 7.5pt;
            font-weight: 700;
            color: #9a3412;
            text-transform: uppercase;
          }
          .summary-value {
            font-size: 11pt;
            font-weight: 800;
            color: #0f172a;
            margin-top: 2px;
            font-variant-numeric: tabular-nums;
          }
          .summary-sub {
            font-size: 7.5pt;
            color: #64748b;
            margin-top: 1px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          th {
            background: #0f172a;
            color: #ffffff;
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 7px 8px;
            border: 1px solid #0f172a;
          }
          td {
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
            font-size: 8pt;
            color: #1e293b;
            vertical-align: top;
          }
          tr:nth-child(even) td {
            background: #f8fafc;
          }
          .footer-note {
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 7.5pt;
            color: #475569;
          }
          @media print {
            .toolbar {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <div>
            <strong>Pratinjau Dokumen PDF JagaJalan</strong> — Pilih <em>"Save as PDF" / "Simpan sebagai PDF"</em> pada jendela cetak.
          </div>
          <button class="toolbar-btn" onclick="window.print()">Simpan / Cetak PDF Sekarang</button>
        </div>

        <div class="header">
          <div>
            <div class="brand">JagaJalan • Portal Transparansi Infrastruktur Jalan &amp; Anggaran Publik</div>
            <div class="doc-title">${escapeHtml(title)}</div>
            <div class="doc-subtitle">${escapeHtml(subtitle)}</div>
          </div>
          <div class="meta-box">
            <div><strong>KODE DOKUMEN:</strong> ${escapeHtml(documentCode)}-${formatTimestampId()}</div>
            <div><strong>TANGGAL CETAK:</strong> ${escapeHtml(generatedAt)} WIB</div>
            <div><strong>TOTAL REKAMAN:</strong> ${rows.length} Baris Data</div>
          </div>
        </div>

        ${summaryHtml}

        <table>
          <thead>
            <tr>${tableHeadersHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer-note">
          <div style="max-width: 72%;">${escapeHtml(legalNote)}</div>
          <div style="text-align: right; font-weight: 700; color: #0f172a;">
            Diperiksa Sistem Pemetaan &amp; Audit Terbuka JagaJalan
          </div>
        </div>

        <script>
          window.addEventListener("load", function () {
            setTimeout(function () {
              window.focus();
              window.print();
            }, 350);
          });
        </script>
      </body>
    </html>
  `;

  const printWin = window.open("", "_blank", "width=1120,height=800");
  if (printWin) {
    printWin.document.open();
    printWin.document.write(htmlDocument);
    printWin.document.close();
  }
}
