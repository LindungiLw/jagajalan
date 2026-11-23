"use client";

import React, { useState } from "react";
import {
  Scale,
  FileText,
  Clock,
  Building2,
  ArrowRight,
  ExternalLink,
  MapPin,
  Lock,
  Server,
  ShieldCheck,
} from "lucide-react";

const LEGAL_INSTRUMENTS = [
  {
    index: "01",
    code: "UU 2/2022",
    fullTitle: "Undang-Undang Nomor 2 Tahun 2022 tentang Jalan",
    citation: "Perubahan Kedua UU 38/2004",
    roleTag: "Wewenang",
    headline: "Siapa Pemilik & Penanggung Jawab Jalan",
    citizenMeaning:
      "Setiap ruas jalan punya penyelenggara yang tegas—pusat, provinsi, kabupaten/kota, atau desa. Dinas tidak bisa lagi saling lempar tanggung jawab ketika jalan rusak.",
    platformFeature:
      "Peta GIS JagaJalan otomatis mengunci status jalan dan dinas penanggung jawabnya dari titik GPS laporanmu.",
    actionLabel: "Cek Peta Kewenangan",
    targetTab: "peta",
    legalUrl: "https://peraturan.bpk.go.id/Details/195878/uu-no-2-tahun-2022",
    icon: MapPin,
  },
  {
    index: "02",
    code: "UU 14/2008",
    fullTitle: "Undang-Undang Nomor 14 Tahun 2008 (KIP)",
    citation: "Pasal 7 & Pasal 11",
    roleTag: "Anggaran",
    headline: "Hak Warga Melihat Anggaran Proyek",
    citizenMeaning:
      "Perbaikan jalan dibiayai uang publik. Masyarakat berhak mengetahui besaran pagu APBN/APBD, nilai kontrak pemenang tender, dan progres pekerjaannya.",
    platformFeature:
      "Setiap koridor jalan di JagaJalan ditautkan ke data pagu, nilai kontrak, dan tautan portal resmi SPSE/SiRUP INAPROC.",
    actionLabel: "Lihat Anggaran Proyek",
    targetTab: "data-anggaran",
    legalUrl: "https://peraturan.bpk.go.id/Details/39047/uu-no-14-tahun-2008",
    icon: FileText,
  },
  {
    index: "03",
    code: "UU 25/2009",
    fullTitle: "Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik",
    citation: "Pasal 44 ayat (2)",
    roleTag: "Batas 14 Hari",
    headline: "Kepastian Tanggapan Maksimal 14 Hari Kerja",
    citizenMeaning:
      "Setelah laporan warga diterima penyelenggara, instansi wajib menyampaikan tanggapan dan jadwal penanganan dalam batas waktu paling lambat 14 hari kerja.",
    platformFeature:
      "JagaJalan menghitung mundur masa tanggap setiap laporan secara terbuka agar warga tahu apakah aduannya diproses tepat waktu.",
    actionLabel: "Pantau Batas 14 Hari",
    targetTab: "ombudsman",
    legalUrl: "https://peraturan.bpk.go.id/Details/38748/uu-no-25-tahun-2009",
    icon: Clock,
  },
  {
    index: "04",
    code: "UU 37/2008",
    fullTitle: "Undang-Undang Nomor 37 Tahun 2008 tentang Ombudsman RI",
    citation: "Pasal 1 & Pasal 24",
    roleTag: "Pengawasan",
    headline: "Jalur Resmi Lapor ke Ombudsman RI",
    citizenMeaning:
      "Jika dinas mengabaikan pengaduan melampaui batas waktu yang patut, warga punya hak hukum melaporkannya sebagai dugaan penundaan berlarut ke Ombudsman RI.",
    platformFeature:
      "Tersedia pembuat draf surat pengaduan Ombudsman RI siap cetak (PDF) yang otomatis memuat koordinat, foto, dan kronologi laporan.",
    actionLabel: "Buka Pantau Laporan",
    targetTab: "ombudsman",
    legalUrl: "https://peraturan.bpk.go.id/Details/39708/uu-no-37-tahun-2008",
    icon: Scale,
  },
  {
    index: "05",
    code: "Inpres 3/2023",
    fullTitle: "Instruksi Presiden Nomor 3 Tahun 2023 (IJD)",
    citation: "Konektivitas Jalan Daerah",
    roleTag: "Dukungan APBN",
    headline: "Bantuan Pusat untuk Jalan Daerah Rusak",
    citizenMeaning:
      "Saat kapasitas anggaran daerah terbatas, pemerintah pusat melalui Kementerian PU dapat membantu memperbaiki jalan provinsi dan kabupaten/kota rusak berat lewat APBN.",
    platformFeature:
      "Panel statistik 38 provinsi memetakan kesenjangan kondisi jalan daerah dan realisasi dukungan Inpres Jalan Daerah (Rp 14,6 T Tahap I).",
    actionLabel: "Lihat Statistik 38 Provinsi",
    targetTab: "nasional",
    legalUrl: "https://peraturan.bpk.go.id/Details/245516/inpres-no-3-tahun-2023",
    icon: Building2,
  },
  {
    index: "06",
    code: "UU 27/2022",
    fullTitle: "Undang-Undang Nomor 27 Tahun 2022 (UU PDP)",
    citation: "Pelindungan Data Pribadi",
    roleTag: "Privasi",
    headline: "Identitas & Kontak Pelapor Disamarkan",
    citizenMeaning:
      "Melaporkan jalan rusak tidak boleh membahayakan privasi warga. Data pribadi pelapor wajib dilindungi dan tidak dipublikasikan sembarangan.",
    platformFeature:
      "Nama pelapor di peta publik disamarkan otomatis (mis. R***) dan nomor kontak notifikasi tidak pernah ditampilkan di antarmuka umum.",
    actionLabel: "Lihat Transparansi Laporan",
    targetTab: "ombudsman",
    legalUrl: "https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022",
    icon: Lock,
  },
  {
    index: "07",
    code: "PP 71/2019",
    fullTitle: "Peraturan Pemerintah Nomor 71 Tahun 2019 (PSTE)",
    citation: "Penyelenggaraan Sistem Elektronik",
    roleTag: "Keamanan",
    headline: "Jejak Audit & Keamanan Data Sistem",
    citizenMeaning:
      "Platform layanan publik harus menjaga keandalan sistem, menyaring kiriman spam, dan menyimpan riwayat perubahan status secara tercatat.",
    platformFeature:
      "Dilengkapi filter foto anti-spam Gemini Vision AI, pembatasan frekuensi kirim, dan riwayat tindak lanjut yang tercatat per laporan.",
    actionLabel: "Jelajahi Peta GIS",
    targetTab: "peta",
    legalUrl: "https://peraturan.bpk.go.id/Details/122030/pp-no-71-tahun-2019",
    icon: Server,
  },
];

export default function LegalBasisSection({ onNavigateTab }) {
  const [activeCode, setActiveCode] = useState(LEGAL_INSTRUMENTS[0].code);

  const activeLaw =
    LEGAL_INSTRUMENTS.find((item) => item.code === activeCode) || LEGAL_INSTRUMENTS[0];
  const ActiveIcon = activeLaw.icon;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 font-sans">
      <div className="bg-slate-100/60 p-2 sm:p-2.5 rounded-[8px] ring-1 ring-orange-200/50">
        <div className="bg-white rounded-[6px] p-5 sm:p-7 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.03)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1 max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 tracking-tight">
                Hak Kamu di Jalan Raya &amp; Dasar Hukumnya
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                Pilih salah satu dari 7 aturan resmi negara untuk melihat perlindungan warga, penerapannya di JagaJalan, dan naskah resminya di JDIH BPK RI.
              </p>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#FAF7F2] border border-[#E7DDD0] text-xs font-semibold text-stone-700 shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#c2410c]" />
              <span>7 Aturan Resmi · JDIH BPK</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-5 rounded-[8px] bg-[#FAF7F2] border border-[#E7DDD0] text-stone-900 p-5 sm:p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-[6px] bg-[#c2410c] text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(194,65,12,0.2)]">
                      <ActiveIcon className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="font-mono text-[10.5px] text-stone-600 uppercase tracking-wider block tabular-nums">
                        Dasar Hukum {activeLaw.index} / 07
                      </span>
                      <span className="text-xs font-semibold text-[#9a3412]">
                        {activeLaw.roleTag}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-[5px] bg-white border border-[#E7DDD0] text-stone-700">
                    {activeLaw.citation}
                  </span>
                </div>

                <div className="pt-1 space-y-1.5">
                  <div className="font-mono text-2xl sm:text-[26px] font-bold tracking-tight text-stone-950 leading-none">
                    {activeLaw.code}
                  </div>
                  <p className="text-xs text-stone-600 leading-snug">
                    {activeLaw.fullTitle}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#E7DDD0] space-y-2">
                  <h3 className="text-sm sm:text-[15px] font-bold text-stone-950 leading-snug">
                    {activeLaw.headline}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-stone-700 leading-relaxed">
                    {activeLaw.citizenMeaning}
                  </p>
                </div>

                <div className="rounded-[6px] bg-white border border-[#E7DDD0] px-4 py-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#c2410c] font-semibold block">
                    Penerapan di JagaJalan
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {activeLaw.platformFeature}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab(activeLaw.targetTab)}
                  className="group inline-flex items-center gap-2.5 pl-4 pr-1.5 py-2 rounded-[6px] bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-semibold transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span>{activeLaw.actionLabel}</span>
                  <span className="w-6 h-6 rounded-[4px] bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </button>

                <a
                  href={activeLaw.legalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-[6px] bg-white hover:bg-orange-50/70 border border-[#DFD4C5] hover:border-[#c2410c]/50 text-stone-800 hover:text-[#9a3412] text-xs font-semibold transition-colors active:scale-[0.98]"
                >
                  <span>Baca Naskah Resmi</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#c2410c]" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between rounded-[8px] border border-slate-200/80 overflow-hidden bg-white">
              <div className="divide-y divide-slate-100">
                {LEGAL_INSTRUMENTS.map((reg) => {
                  const IconComponent = reg.icon;
                  const isSelected = reg.code === activeLaw.code;
                  return (
                    <div
                      key={reg.code}
                      className={`flex items-center justify-between gap-2 transition-colors ${
                        isSelected
                          ? "bg-[#FAF7F2]"
                          : "bg-white hover:bg-[#FAF7F2]/55"
                      }`}
                    >
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setActiveCode(reg.code)}
                        className="flex-1 min-w-0 text-left px-4 py-3 sm:px-4.5 sm:py-3.5 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`font-mono text-[11px] font-bold w-5 shrink-0 tabular-nums ${
                              isSelected ? "text-[#c2410c]" : "text-slate-500"
                            }`}
                          >
                            {reg.index}
                          </span>

                          <span
                            className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-[#c2410c] text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-mono text-xs font-bold tracking-tight ${
                                  isSelected ? "text-[#9a3412]" : "text-slate-900"
                                }`}
                              >
                                {reg.code}
                              </span>
                              <span className="text-slate-300 hidden sm:inline">·</span>
                              <span className="text-xs sm:text-[13px] font-semibold text-slate-900 truncate">
                                {reg.headline}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {reg.citation}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`hidden md:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-[4px] shrink-0 ${
                            isSelected
                              ? "bg-orange-100/90 text-[#9a3412]"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {reg.roleTag}
                        </span>
                      </button>

                      <a
                        href={reg.legalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Baca naskah resmi ${reg.code} di JDIH BPK RI`}
                        aria-label={`Baca naskah resmi ${reg.code} di JDIH BPK RI`}
                        className={`mr-3 sm:mr-4 p-1.5 rounded-[5px] transition-colors shrink-0 ${
                          isSelected
                            ? "text-[#c2410c] hover:bg-orange-100/80"
                            : "text-slate-400 hover:text-[#c2410c] hover:bg-orange-50"
                        }`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
