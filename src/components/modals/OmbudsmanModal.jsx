"use client";

import React, { useState } from "react";
import { X, Copy, Check, Printer, FileText, AlertCircle, ShieldCheck } from "lucide-react";

export default function OmbudsmanModal({ isOpen, onClose, report }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const letterText = `HAL: LAPORAN PENGADUAN DUGAAN MALADMINISTRASI PENUNDAAN BERLARUT (UNDUE DELAY)
DAN PENELANTARAN INFRASTRUKTUR JALAN PUBLIK

Kepada Yth.
Kepala Kantor Perwakilan Ombudsman Republik Indonesia
Provinsi Jawa Barat / DKI Jakarta
di Tempat

Dengan hormat,
Saya yang bertanda tangan di bawah ini melalui Platform Advokasi Transparansi JagaJalan:
- Identitas Pelapor : ${report.reporterName || "Warga Pengguna Jalan"}
- Tiket Pengaduan  : ${report.ticketCode}
- Tanggal Lapor    : ${new Date(report.reportDate).toLocaleDateString("id-ID")}
- Lokasi Objek     : ${report.roadName} (${report.address})
- Titik Koordinat  : ${report.coordinates?.join(", ")}

Dengan ini bermaksud menyampaikan Laporan Pengaduan Maladministrasi terhadap:
- Instansi Terlapor : ${report.authorityLabel}
- Dasar Kewenangan  : ${report.legalBasis}
- Paket Anggaran   : ${report.matchingBudget?.packageName || "Pemeliharaan Jalan Berkala"} (Pagu: Rp ${((report.matchingBudget?.paguRp || 0)/1000000000).toFixed(1)} Miliar)

POKOK PERMASALAHAN & KRONOLOGI:
1. Bahwa pada tanggal ${new Date(report.reportDate).toLocaleDateString("id-ID")}, telah dilaporkan kondisi kerusakan jalan berstatus "${report.categoryLabel}" dengan estimasi rekomendasi bahaya keselamatan AI ${report.hazardScore}/100.
2. Berdasarkan UU No. 25 Tahun 2009 tentang Pelayanan Publik dan pedoman penanganan pengaduan Ombudsman RI, instansi penyelenggara pelayanan publik wajib memberikan tanggapan resmi atas aduan masyarakat dalam kurun waktu 14 (empat belas) hari kerja.
3. Bahwa hingga surat ini diterbitkan (${todayStr}), laporan pengaduan ini telah melewati batas pemantauan tanggapan selama ${report.daysOverdue || 4} hari kerja tanpa adanya tanggapan resmi maupun penanganan fisik di lapangan dari instansi terlapor.
4. Ketiadaan respons dan pembiaran kondisi jalan ini terindikasi memenuhi unsur dugaan Maladministrasi: "Penundaan Berlarut" (Undue Delay) sesuai Pasal 1 angka 3 UU No. 37 Tahun 2008 tentang Ombudsman Republik Indonesia.

TUNTUTAN:
Memohon kepada Ombudsman Republik Indonesia untuk:
1. Memeriksa dan memanggil pihak ${report.authorityLabel} atas dugaan penundaan berlarut perbaikan ruas ${report.roadName}.
2. Mendorong transparansi realisasi paket anggaran APBD terkait agar tidak terjadi penyimpangan alokasi pemeliharaan jalan.
3. Menerbitkan Rekomendasi/Tindakan Korektif agar jalan tersebut segera diperbaiki demi menjamin keselamatan jiwa masyarakat.

Demikian laporan ini dibuat secara sadar dengan melampirkan bukti digital geotagged dan verifikasi Computer Vision AI.

Hormat saya,
${report.reporterName || "Perwakilan Warga / Pengguna Jalan"}
(Terverifikasi via JagaJalan Platform)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Draf Pengaduan Maladministrasi Ombudsman RI
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                  UU No. 25/2009
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Otomatis di-generate berdasarkan bukti digital geotagged dan pelanggaran batas SLA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Letter Paper */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs text-slate-700 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              Format surat ini telah disesuaikan dengan standar pelaporan formal pada <strong>Ombudsman Republik Indonesia</strong> atas dugaan Penundaan Berlarut (*Undue Delay*).
            </span>
          </div>

          <pre className="whitespace-pre-wrap font-mono text-[11px] sm:text-xs text-slate-800 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-200 select-all max-h-[380px] overflow-y-auto">
            {letterText}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Nomor Tiket: <strong className="text-slate-900 font-mono">{report.ticketCode}</strong> (Overdue {report.daysOverdue} Hari)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin!" : "Salin Teks Surat"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Ekspor PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
