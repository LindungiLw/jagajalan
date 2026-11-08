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

/**
 * Mengunduh dataset transparansi dalam format Microsoft Excel (.xls)
 * Kompatibel penuh dengan Microsoft Excel, Google Sheets, dan LibreOffice Calc
 * untuk analisis mandiri oleh masyarakat, jurnalis, akademisi, dan pemangku kepentingan.
 */
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

  const summaryRowsHtml =
    summaryMetrics.length > 0
      ? `
      <tr><td colspan="${colCount}" style="height: 8px;"></td></tr>
      <tr>
        ${summaryMetrics
          .map(
            (m) => `
          <td colspan="${Math.max(1, Math.floor(colCount / summaryMetrics.length))}" style="background-color: #fff7ed; border: 1px solid #fed7aa; padding: 8px 10px; font-family: Arial, sans-serif;">
            <div style="font-size: 9pt; color: #9a3412; font-weight: bold; text-transform: uppercase;">${escapeHtml(m.label)}</div>
            <div style="font-size: 12pt; color: #0f172a; font-weight: bold; margin-top: 2px;">${escapeHtml(m.value)}</div>
          </td>
        `
          )
          .join("")}
      </tr>
      <tr><td colspan="${colCount}" style="height: 10px;"></td></tr>
    `
      : `<tr><td colspan="${colCount}" style="height: 8px;"></td></tr>`;

  const tableHeaderHtml = `
    <tr>
      ${columns
        .map(
          (col) => `
        <th style="background-color: #c2410c; color: #ffffff; font-weight: bold; font-family: Arial, sans-serif; font-size: 9.5pt; padding: 8px 10px; border: 1px solid #9a3412; text-align: ${
          col.align || "left"
        };">
          ${escapeHtml(col.header)}
        </th>
      `
        )
        .join("")}
    </tr>
  `;

  const tableBodyHtml = rows
    .map((row, rowIdx) => {
      const bg = rowIdx % 2 === 0 ? "#ffffff" : "#f8fafc";
      return `
        <tr>
          ${columns
            .map((col) => {
              const rawVal = typeof col.accessor === "function" ? col.accessor(row, rowIdx) : row[col.key];
              const isNum = col.type === "number" || col.type === "currency";
              const numStyle =
                col.type === "currency"
                  ? "mso-number-format:'\\#\\,\\#\\#0';"
                  : col.type === "number"
                  ? "mso-number-format:'0\\.00';"
                  : "mso-number-format:'\\@';";
              return `
                <td style="background-color: ${bg}; font-family: Arial, sans-serif; font-size: 9pt; padding: 6px 10px; border: 1px solid #cbd5e1; color: #0f172a; text-align: ${
                col.align || (isNum ? "right" : "left")
              }; ${numStyle}">
                  ${escapeHtml(rawVal ?? "-")}
                </td>
              `;
            })
            .join("")}
        </tr>
      `;
    })
    .join("");

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${escapeHtml(sheetName.slice(0, 31))}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td colspan="${colCount}" style="background-color: #0f172a; color: #ffffff; font-family: Arial, sans-serif; font-size: 13pt; font-weight: bold; padding: 12px 14px;">
              ${escapeHtml(title)}
            </td>
          </tr>
          <tr>
            <td colspan="${colCount}" style="background-color: #1e293b; color: #fdba74; font-family: Arial, sans-serif; font-size: 9.5pt; padding: 6px 14px;">
              ${escapeHtml(subtitle)} • Waktu Unduh: ${escapeHtml(generatedAt)} WIB
            </td>
          </tr>
          ${summaryRowsHtml}
          ${tableHeaderHtml}
          ${tableBodyHtml}
          <tr><td colspan="${colCount}" style="height: 8px;"></td></tr>
          <tr>
            <td colspan="${colCount}" style="font-family: Arial, sans-serif; font-size: 8.5pt; color: #475569; padding: 6px 4px;">
              Sumber Data Terbuka: Platform JagaJalan (Kementerian PU Satu Data, BPS SIRUSA, LKPP LPSE/SiRUP, &amp; Ombudsman RI) — Berdasarkan UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(["\uFEFF", excelHtml], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${formatTimestampId()}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Membuka dan mencetak/menyimpan Laporan Transparansi Publik dalam format PDF (A4 Landscape/Portrait)
 * Siap disimpan sebagai berkas PDF resmi untuk audit mandiri masyarakat dan pemangku kepentingan.
 */
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
            Terverifikasi Sistem Geospasial &amp; Audit Terbuka JagaJalan
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

