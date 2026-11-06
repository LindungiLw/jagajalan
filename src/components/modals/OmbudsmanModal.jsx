"use client";

import React, { useState } from "react";
import { X, Copy, Check, Printer, AlertCircle } from "lucide-react";

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
Provinsi Terkait
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
2. Berdasarkan UU No. 25 Tahun 2009 tentang Pelayanan Publik dan pedoman penanganan pengaduan Ombudsman RI, instansi penyelenggara pelayanan publik wajib memberikan kepastian tanggapan resmi dan jadwal tindak lanjut atas aduan masyarakat sesuai batas waktu standar pelayanan publik.
3. Bahwa hingga surat ini diterbitkan (${todayStr}), laporan pengaduan ini telah melewati batas waktu tanggapan resmi selama ${report.daysOverdue || 4} hari kerja tanpa adanya tanggapan maupun penanganan fisik di lapangan dari instansi terlapor.
4. Ketiadaan respons dan pembiaran kondisi jalan ini terindikasi memenuhi unsur dugaan Maladministrasi: "Penundaan Berlarut" (Undue Delay) sesuai Pasal 1 angka 3 UU No. 37 Tahun 2008 tentang Ombudsman Republik Indonesia.

TUNTUTAN:
Memohon kepada Ombudsman Republik Indonesia untuk:
1. Memeriksa dan memanggil pihak ${report.authorityLabel} atas dugaan penundaan berlarut perbaikan ruas ${report.roadName}.
2. Mendorong transparansi realisasi paket anggaran terkait agar tidak terjadi penyimpangan alokasi pemeliharaan jalan.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="rounded-[8px] bg-slate-100/80 p-2 sm:p-2.5 ring-1 ring-orange-200/50 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="relative w-full flex-1 flex flex-col rounded-[6px] bg-white shadow-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-[6px] bg-orange-50/80 p-2 shrink-0 flex items-center justify-center ring-1 ring-orange-200/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon/hukum_icon.png"
                  alt="Eskalasi Hukum Ombudsman"
                  width={28}
                  height={28}
                  style={{ width: "28px", height: "28px" }}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base font-heading">
                    Draf Pengaduan Maladministrasi Ombudsman RI
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200/60 font-sans">
                    UU No. 25/2009
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans">
                  Dokumen advokasi resmi berbasis bukti digital geotagged dan rekam jejak tenggat respons
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: Letter Paper */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs text-slate-700 space-y-4">
            <div className="p-3.5 rounded-[6px] bg-amber-50/70 ring-1 ring-amber-200/60 flex items-center gap-2.5 text-xs text-amber-900 font-sans">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>
                Format surat ini disesuaikan dengan standar pelaporan formal pada <strong>Ombudsman Republik Indonesia</strong> atas dugaan Penundaan Berlarut (<em>Undue Delay</em>).
              </span>
            </div>

            <pre className="whitespace-pre-wrap font-mono text-[11px] sm:text-xs text-slate-800 leading-relaxed bg-slate-50/80 p-5 rounded-[6px] select-all max-h-[380px] overflow-y-auto ring-1 ring-orange-200/40">
              {letterText}
            </pre>
          </div>

          {/* Modal Footer with Button-in-Button */}
          <div className="p-4 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 font-sans">
            <div className="text-xs text-slate-500">
              Nomor Tiket: <strong className="text-slate-900 font-sans tabular-nums font-bold">{report.ticketCode}</strong> (Melewati Batas Respons {report.daysOverdue} Hari)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Tersalin" : "Salin Teks Surat"}</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 pl-4 pr-2 py-2 rounded-full text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                <span>Cetak / Ekspor PDF</span>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Printer className="w-3 h-3 text-white" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
