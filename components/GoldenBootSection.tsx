"use client";

import { useMemo, useState } from "react";

export type GoldenBootOption = {
  id: string;
  name: string;
  position: string;
  club: string | null;
  teamId: string | null;
  teamName: string;
};

type Props = {
  value: string;
  options: GoldenBootOption[];
  onSearch: (query: string) => void;
  onChange: (value: string) => void;
};

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/á/g, "a")
    .replace(/à/g, "a")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

export default function GoldenBootSection({
  value,
  options,
  onSearch,
  onChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    const search = normalizeSearch(query.trim());

    if (!search) {
      return options.slice(0, 25);
    }

    return options
      .filter((option) => {
        const haystack = normalizeSearch(
          `${option.name ?? ""} ${option.teamName ?? ""}`
        );

        return haystack.includes(search);
      })
      .slice(0, 25);
  }, [options, query]);

  function selectOption(option: GoldenBootOption) {
    onChange(option.name);
    setQuery(`${option.name} – ${option.teamName}`);
    setIsOpen(false);
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-5 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-black text-slate-900 sm:text-xl md:text-2xl">
          Skyttekung
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Sök och välj en spelare från de importerade VM-trupperna.
        </p>
      </div>

      <label
        htmlFor="golden-boot-search"
        className="mb-2 block text-sm font-bold text-slate-800"
      >
        Din skyttekung
      </label>

      <div className="relative">
        <input
          id="golden-boot-search"
          type="text"
          value={query || value}
          onChange={(event) => {
            const nextQuery = event.target.value;

            setQuery(nextQuery);
            setIsOpen(true);
            onSearch(nextQuery);

            if (!nextQuery.trim()) {
              onChange("");
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            onSearch(query || value);
          }}
          placeholder="Sök spelare, t.ex. Mbappé..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
        />

        {isOpen && (
          <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectOption(option);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm hover:bg-emerald-50"
                >
                  <span className="font-bold text-slate-900">
                    {option.name}
                  </span>
                  <span className="text-slate-500"> – {option.teamName}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">
                Ingen spelare hittades.
              </div>
            )}
          </div>
        )}
      </div>

      {value && (
        <p className="mt-3 text-sm text-slate-600">
          Vald spelare: <span className="font-bold">{value}</span>
        </p>
      )}
    </div>
  );
}