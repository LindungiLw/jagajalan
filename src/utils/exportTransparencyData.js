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

  // Smart Column Width Calculation to prevent squishing/clipping in Excel
  const columnWidths = columns.map((col) => {
    if (col.width && typeof col.width === "number") return col.width;
    let maxLen = (col.header || "").length;
    for (let i = 0; i < Math.min(rows.length, 25); i++) {
      const row = rows[i];
      const val = typeof col.accessor === "function" ? col.accessor(row, i) : row[col.key];
      if (val !== null && val !== undefined) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    }

    const h = (col.header || "").toLowerCase();
    if (h.includes("no") && maxLen <= 4) return 50;
    if (h.includes("kode") || col.key === "ticketCode" || col.key === "packageId") return 110;
    if (h.includes("tanggal") || h.includes("date")) return 110;
    if (h.includes("koordinat") || h.includes("gis")) return 160;
    if (h.includes("kewenangan") || col.key === "authority") return 115;
    if (h.includes("status")) return 180;
    if (h.includes("indeks") || h.includes("bahaya") || h.includes("skor")) return 115;
    if (h.includes("pagu") || h.includes("kontrak") || h.includes("biaya") || col.type === "currency") return 145;
    if (h.includes("efisiensi") || h.includes("hemat") || h.includes("progres")) return 115;
    if (h.includes("alamat") || h.includes("lokasi")) return 270;
    if (h.includes("instansi") || h.includes("penanggung jawab")) return 260;
    if (h.includes("kategori") || h.includes("kerusakan")) return 210;
    if (h.includes("ruas") || h.includes("nama jalan")) return 220;
    if (h.includes("paket")) return 250;
    if (h.includes("kontraktor") || h.includes("rekanan")) return 210;

    return Math.min(320, Math.max(90, Math.round(maxLen * 8 + 25)));
  });

  const colgroupHtml = `
    <colgroup>
      ${columnWidths
        .map(
          (w) => `<col width="${w}" style="mso-width-source:userset;mso-width-alt:${Math.round(w * 36.5)};width:${w}pt;">`
        )
        .join("")}
    </colgroup>
  `;

  // Summary Metrics Cards: Distributed evenly across the FULL width (sum of colspans === colCount)
  let summaryRowsHtml = "";
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

    summaryRowsHtml = `
      <tr><td colspan="${colCount}" style="height: 10px;"></td></tr>
      <tr>
        ${summaryMetrics
          .map(
            (m, idx) => `
          <td colspan="${metricSpans[idx]}" style="background-color: #fffbeb; border: 1.5px solid #fcd34d; padding: 10px 12px; font-family: 'Segoe UI', Arial, sans-serif; text-align: center; vertical-align: middle;">
            <div style="font-size: 8.5pt; color: #92400e; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(
              m.label
            )}</div>
            <div style="font-size: 13pt; color: #78350f; font-weight: 800; margin-top: 3px; font-family: 'Segoe UI', Arial, sans-serif;">${escapeHtml(
              m.value
            )}</div>
            ${
              m.sub
                ? `<div style="font-size: 8pt; color: #a16207; margin-top: 2px;">${escapeHtml(
                    m.sub
                  )}</div>`
                : ""
            }
          </td>
        `
          )
          .join("")}
      </tr>
      <tr><td colspan="${colCount}" style="height: 12px;"></td></tr>
    `;
  } else {
    summaryRowsHtml = `<tr><td colspan="${colCount}" style="height: 10px;"></td></tr>`;
  }

  // Table Headers with Clean Institutional Safety Orange & Bold Center/Aligned Text
  const tableHeaderHtml = `
    <tr style="height: 32pt;">
      ${columns
        .map((col) => {
          const align = col.align || (col.mono || col.type === "number" || col.type === "currency" ? "center" : "left");
          return `
            <th style="background-color: #c2410c; color: #ffffff; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5pt; padding: 8px 10px; border: 1px solid #9a3412; text-align: ${align}; vertical-align: middle; height: 32pt; white-space: normal;">
              ${escapeHtml(col.header)}
            </th>
          `;
        })
        .join("")}
    </tr>
  `;

  // Table Data Rows with Alternate Zebra, Semantic Status Badges, and Proper Formatting
  const tableBodyHtml = rows
    .map((row, rowIdx) => {
      const isEven = rowIdx % 2 === 0;
      const baseBg = isEven ? "#ffffff" : "#f8fafc";
      return `
        <tr style="height: 24pt;">
          ${columns
            .map((col) => {
              const rawVal =
                typeof col.accessor === "function" ? col.accessor(row, rowIdx) : row[col.key];
              const strVal = rawVal !== null && rawVal !== undefined ? String(rawVal) : "-";
              const isNum = col.type === "number" || col.type === "currency";

              // Format text in Excel: '@' for text/codes (preserves leading zeros), numbers for amounts
              const numFormat =
                col.type === "currency"
                  ? "mso-number-format:'\\#\\,\\#\\#0';"
                  : col.type === "number"
                  ? "mso-number-format:'0\\.00';"
                  : "mso-number-format:'\\@';";

              // Determine cell alignment
              const align =
                col.align ||
                (col.type === "currency"
                  ? "right"
                  : col.mono || col.type === "number" || col.key === "authority"
                  ? "center"
                  : "left");

              // Status highlight styling if this is a status column
              let cellBg = baseBg;
              let cellColor = "#0f172a";
              let fontWeight = "normal";

              if (col.key === "status" || col.header?.toLowerCase().includes("status")) {
                if (strVal.includes("Melewati") || strVal.includes("OVERDUE") || strVal.includes("Terlambat")) {
                  cellBg = "#fef2f2";
                  cellColor = "#b91c1c";
                  fontWeight = "bold";
                } else if (strVal.includes("Selesai") || strVal.includes("Tuntas") || strVal.includes("Mantap")) {
                  cellBg = "#f0fdf4";
                  cellColor = "#15803d";
                  fontWeight = "bold";
                } else if (strVal.includes("Dalam") || strVal.includes("Proses") || strVal.includes("Verifikasi")) {
                  cellBg = "#fffbeb";
                  cellColor = "#b45309";
                  fontWeight = "bold";
                }
              } else if (col.key === "ticketCode" || col.key === "packageId") {
                cellBg = isEven ? "#fff7ed" : "#ffedd5";
                cellColor = "#9a3412";
                fontWeight = "bold";
              }

              const fontFam = col.mono
                ? "font-family: 'Consolas', 'Courier New', monospace; font-size: 8.5pt;"
                : "font-family: 'Segoe UI', Arial, sans-serif; font-size: 9pt;";

              return `
                <td style="background-color: ${cellBg}; ${fontFam} color: ${cellColor}; font-weight: ${fontWeight}; padding: 7px 10px; border: 1px solid #cbd5e1; text-align: ${align}; vertical-align: middle; ${numFormat}">
                  ${escapeHtml(strVal)}
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
          ${colgroupHtml}
          <!-- Row 1: Document Title (Centered, Royal Navy Header) -->
          <tr style="height: 42pt;">
            <td colspan="${colCount}" style="background-color: #0f172a; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14pt; font-weight: bold; text-align: center; vertical-align: middle; padding: 14px 16px; border: 1px solid #0f172a; letter-spacing: 0.3px;">
              ${escapeHtml(title)}
            </td>
          </tr>
          <!-- Row 2: Subtitle & Generation Timestamp (Centered, Deep Slate with Warm Amber Accent) -->
          <tr style="height: 24pt;">
            <td colspan="${colCount}" style="background-color: #1e293b; color: #fed7aa; font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5pt; font-weight: 500; text-align: center; vertical-align: middle; padding: 7px 16px; border-bottom: 2.5px solid #c2410c;">
              ${escapeHtml(subtitle)} • Waktu Unduh: ${escapeHtml(generatedAt)} WIB
            </td>
          </tr>
          ${summaryRowsHtml}
          ${tableHeaderHtml}
          ${tableBodyHtml}
          <tr><td colspan="${colCount}" style="height: 12px;"></td></tr>
          <!-- Row Footer: Open Government Transparency Legal Reference -->
          <tr>
            <td colspan="${colCount}" style="background-color: #f8fafc; border: 1px solid #e2e8f0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5pt; color: #475569; padding: 10px 14px; text-align: center; vertical-align: middle; line-height: 1.5;">
              <strong>JagaJalan — Ekosistem Partisipatif Transparansi Infrastruktur Jalan &amp; Anggaran Publik</strong><br/>
              Sumber Data Terbuka: Kementerian PU Satu Data, BPS SIRUSA, LKPP LPSE/SiRUP, dan Ombudsman RI — Berdasarkan UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik (KIP) &amp; UU No. 2 Tahun 2022 tentang Jalan.
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

