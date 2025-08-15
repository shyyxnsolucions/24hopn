import React, { useEffect, useRef, useState } from "react";
import { PRICING, BRAND } from "../mock";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { ShieldCheck, Phone } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

const WhatsCTA = ({ text = "WhatsApp" }) => (
  <a
    href={`https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent(
      "Olá! Vim pelo site e quero desbloquear meu dispositivo."
    )}`}
    target="_blank"
    rel="noreferrer"
  >
    <Button className="bg-teal-400/90 hover:bg-teal-300 text-black font-semibold shadow-[0_0_30px_rgba(0,229,204,0.35)]">
      <Phone className="mr-2 h-4 w-4" /> {text}
    </Button>
  </a>
);

export default function PricingContact() {
  const containerRef = useRef(null);
  const [contact, setContact] = useState({ nome: "", email: "", mensagem: "" });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray("[data-reveal]").forEach((el, i) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: i * 0.06,
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const prev = JSON.parse(localStorage.getItem("contact_msgs") || "[]");
    const next = [...prev, { ...contact, ts: Date.now() }];
    localStorage.setItem("contact_msgs", JSON.stringify(next));
    setContact({ nome: "", email: "", mensagem: "" });
    toast("Mensagem enviada! Retornaremos em breve.");
  };

  return (
    <div ref={containerRef}>
      <section id="precos" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Planos &amp; Preços</h2>
          <span className="text-xs text-white/50">Valores indicativos. Confirmamos após avaliação.</span>
        </div>
        <Separator className="my-6 bg-white/10" />
        <div className="grid md:grid-cols-3 gap-6">
          {PRICING.map((p) => (
            <Card key={p.id} data-reveal className={`border-white/10 bg-white/[0.03] backdrop-blur ${p.popular ? "ring-1 ring-teal-400/30" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  {p.popular ? (
                    <Badge className="bg-teal-400/20 text-teal-300 border border-teal-400/30">Popular</Badge>
                  ) : null}
                </div>
                <div className="text-2xl">{p.price}</div>
                <p className="text-sm text-white/70">{p.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/80">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-300" /> {f}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <WhatsCTA text={p.cta} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="contato" className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-start">
          <div data-reveal>
            <h3 className="text-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Fale com um especialista</h3>
            <p className="mt-2 text-white/70 max-w-prose">
              Envie sua mensagem e retornamos em instantes. Se preferir, chame no WhatsApp para atendimento imediato.
            </p>
            <div className="mt-4"><WhatsCTA /></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3" data-reveal>
            <div>
              <label className="text-sm text-white/70">Nome</label>
              <input value={contact.nome} onChange={(e) => setContact({ ...contact, nome: e.target.value })} required className="mt-1 w-full rounded-md bg-white/5 px-3 py-2 outline-none border border-white/10 focus:border-teal-400/60" />
            </div>
            <div>
              <label className="text-sm text-white/70">E-mail</label>
              <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required className="mt-1 w-full rounded-md bg-white/5 px-3 py-2 outline-none border border-white/10 focus:border-teal-400/60" />
            </div>
            <div>
              <label className="text-sm text-white/70">Mensagem</label>
              <textarea value={contact.mensagem} onChange={(e) => setContact({ ...contact, mensagem: e.target.value })} rows={4} className="mt-1 w-full rounded-md bg-white/5 px-3 py-2 outline-none border border-white/10 focus:border-teal-400/60" />
            </div>
            <div className="pt-2">
              <Button type="submit" className="bg-white text-black hover:bg-white/90">Enviar</Button>
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-teal-300" />
            {BRAND.name} — desbloqueio profissional
          </div>
          <div>WhatsApp: {BRAND.whatsappIntl}</div>
        </div>
      </footer>
    </div>
  );
}