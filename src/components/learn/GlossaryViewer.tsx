import React, { useState, useMemo } from "react";
import { GLOSSARY_TERMS, GlossaryTerm } from "../../data/learnContent";
import { Search, BookA, Tag, ExternalLink, X, Compass } from "lucide-react";

interface GlossaryViewerProps {
  onSelectTerm?: (term: string) => void;
  onNavigateToTopic?: (topicId: string) => void;
}

export const GlossaryViewer: React.FC<GlossaryViewerProps> = ({ onSelectTerm, onNavigateToTopic }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLetter, setSelectedLetter] = useState<string>("All");

  const categories = ["All", "Blockchain", "Algorand", "Escrow", "Smart Contracts", "Security", "DeFi"];

  // Unique starting letters
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    GLOSSARY_TERMS.forEach((t) => letters.add(t.term[0].toUpperCase()));
    return ["All", ...Array.from(letters).sort()];
  }, []);

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((term) => {
      const matchesSearch =
        searchQuery === "" ||
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.example.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || term.category === selectedCategory;

      const matchesLetter =
        selectedLetter === "All" || term.term.toUpperCase().startsWith(selectedLetter);

      return matchesSearch && matchesCategory && matchesLetter;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory, selectedLetter]);

  return (
    <div className="space-y-6">
      {/* Header & Search Controls */}
      <div className="p-6 rounded-xl bg-[#141715] border border-[#2B302B] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#F5F5F0] flex items-center gap-2">
              <BookA className="w-4 h-4 text-[#C6FF4D]" /> Web3 & Algorand Glossary
            </h3>
            <p className="text-xs text-[#9A9E98] mt-1">
              Searchable, plain-English reference of essential terms across cryptography, smart contracts, and decentralized escrow.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6B7068] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search definitions, e.g. MBR, PPoS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-[#0B0D0C] border border-[#2B302B] focus:border-[#C6FF4D] rounded-lg text-xs text-[#F5F5F0] placeholder-[#6B7068] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7068] hover:text-[#F5F5F0]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills: Category and Alphabet */}
        <div className="pt-2 border-t border-[#2B302B] space-y-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[11px] text-[#6B7068] uppercase font-bold mr-1">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#C6FF4D] text-[#0B0D0C] font-semibold"
                    : "bg-[#191D19] border border-[#2B302B] text-[#9A9E98] hover:text-[#F5F5F0]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Letter Index Jump */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px] font-mono">
            <span className="text-[#6B7068] uppercase font-bold mr-1 font-sans">Index:</span>
            {availableLetters.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLetter(l)}
                className={`w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors ${
                  selectedLetter === l
                    ? "bg-[#F5F5F0] text-[#0B0D0C] font-bold"
                    : "text-[#9A9E98] hover:bg-[#191D19] hover:text-[#F5F5F0]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Terms Grid */}
      {filteredTerms.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#141715] border border-[#2B302B] space-y-3">
          <Compass className="w-8 h-8 text-[#6B7068] mx-auto" />
          <h4 className="text-sm font-bold text-[#F5F5F0]">No matching glossary terms</h4>
          <p className="text-xs text-[#9A9E98]">
            Try adjusting your search query or reset the letter and category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedLetter("All");
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#191D19] border border-[#2B302B] text-xs font-semibold text-[#F5F5F0] hover:bg-[#202520] transition-colors inline-block mt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((t) => (
            <div
              key={t.term}
              className="p-5 rounded-xl bg-[#141715] border border-[#2B302B] hover:border-[#3D443D] transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#F5F5F0] tracking-tight">{t.term}</h4>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                      t.category === "Algorand"
                        ? "bg-[#C6FF4D]/10 text-[#C6FF4D] border-[#C6FF4D]/30"
                        : t.category === "Escrow"
                        ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
                        : t.category === "Security"
                        ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
                        : "bg-[#191D19] text-[#9A9E98] border-[#2B302B]"
                    }`}
                  >
                    {t.category}
                  </span>
                </div>

                <p className="text-xs text-[#9A9E98] leading-relaxed">{t.definition}</p>

                <div className="p-3 rounded-lg bg-[#0B0D0C] border border-[#2B302B]/70 text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#6B7068] block mb-1">
                    Example Usage:
                  </span>
                  <p className="text-[#F5F5F0] italic">"{t.example}"</p>
                </div>
              </div>

              {/* Related terms */}
              {t.relatedTerms && t.relatedTerms.length > 0 && (
                <div className="pt-2 border-t border-[#2B302B]/60 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#6B7068]">Related:</span>
                  {t.relatedTerms.map((rt) => (
                    <button
                      key={rt}
                      onClick={() => setSearchQuery(rt)}
                      className="text-[10px] text-[#C6FF4D] hover:underline font-mono bg-[#191D19] px-1.5 py-0.5 rounded border border-[#2B302B]"
                    >
                      {rt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
