"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  icon = null,
  prefix = null,
  placeholder = "Pilih opsi...",
  className = "",
  dropdownClassName = "",
  align = "left",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return {
        value: opt.value ?? opt.id,
        label: opt.label ?? opt.name ?? String(opt.value),
        description: opt.description,
      };
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || normalizedOptions[0];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left font-sans">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-orange-300 text-xs font-semibold text-slate-800 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#c2410c] ${
          isOpen ? "ring-2 ring-orange-500/20 border-[#c2410c] bg-orange-50/20" : ""
        } ${className}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          {prefix && <span className="text-slate-400 font-medium text-[11px] shrink-0">{prefix}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#c2410c]" : ""
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 min-w-[220px] max-w-[340px] w-max bg-white rounded-xl border border-slate-200/90 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.06)] py-1.5 overflow-hidden focus:outline-none animate-in fade-in zoom-in-95 duration-100 ${
            align === "right" ? "right-0" : "left-0"
          } ${dropdownClassName}`}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between gap-3 cursor-pointer group ${
                  isSelected
                    ? "bg-orange-50/90 text-[#c2410c] font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{opt.label}</span>
                  {opt.description && (
                    <span className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                      {opt.description}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

