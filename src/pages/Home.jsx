import React, { useState } from "react";
import Experience3D from "../sections/Experience3D";
import Services from "../sections/Services";
import PricingContact from "../sections/PricingContact";
import SmoothScroll from "../components/SmoothScroll";
import CursorSpotlight from "../components/CursorSpotlight";
import { BRAND } from "../mock";
import { Button } from "../components/ui/button";
import { MessageCircle, Menu, X } from "lucide-react";

const WhatsCTA = ({ text = "WhatsApp" }) => (
  <a
    href={`https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent(
      "Olá! Vim pelo site e quero desbloquear meu dispositivo."
    )}`}
    target="_blank"
    rel="noreferrer"
  >
    <Button className="bg-teal-400/90 hover:bg-teal-300 text-black font-semibold shadow-[0_0_30px_rgba(0,229,204,0.35)]">
      <MessageCircle className="mr-2 h-4 w-4" /> {text}
    </Button>
  </a>
);

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0b0c0d] text-white relative">
      <SmoothScroll />
      <CursorSpotlight />

      {/* NAVBAR */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/30">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-teal-400/90 shadow-[0_0_25px_rgba(0,229,204,0.5)]" />
            <span className="text-lg md:text-xl font-semibold tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Shyyxn solucions</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <a href="#servicos" className="hover:text-white">Serviços</a>
            <a href="#precos" className="hover:text-white">Preços</a>
            <a href="#contato" className="hover:text-white">Contato</a>
            <WhatsCTA text="WhatsApp" />
          </nav>
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menu"
              className="text-white"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <WhatsCTA text="WhatsApp" />
          </div>
        </div>
        {menuOpen && (
          <nav className="md:hidden bg-black/90 backdrop-blur-sm py-4">
            <div className="flex flex-col items-center gap-4 text-sm">
              <a href="#servicos" onClick={() => setMenuOpen(false)} className="hover:text-white">Serviços</a>
              <a href="#precos" onClick={() => setMenuOpen(false)} className="hover:text-white">Preços</a>
              <a href="#contato" onClick={() => setMenuOpen(false)} className="hover:text-white">Contato</a>
            </div>
          </nav>
        )}
      </header>

      {/* Cinematic pinned 3D experience */}
      <Experience3D />
      <Services />
      <PricingContact />

      {/* Grain overlay for cinematic feel */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.65\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>')" }} />
    </div>
  );
}