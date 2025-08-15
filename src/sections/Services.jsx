import React, { useEffect, useRef } from "react";
import { SERVICES } from "../mock";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Check } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Services() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray("[data-reveal]").forEach((el, i) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: i * 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="servicos" ref={containerRef} className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl md:text-3xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Serviços</h2>
        <span className="text-xs text-white/50">Atendimento digital e presencial sob consulta</span>
      </div>
      <Separator className="my-6 bg-white/10" />
      <div className="grid md:grid-cols-3 gap-6">
        {SERVICES.map((s) => (
          <Card key={s.id} data-reveal className="border-white/10 bg-white/[0.03] backdrop-blur">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <Badge className="bg-teal-400/20 text-teal-300 border border-teal-400/30">{s.badge}</Badge>
              </div>
              <p className="text-sm text-white/70">{s.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/75">
                {s.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-teal-300" /> {h}</li>
                ))}
              </ul>
              <div className="mt-4 text-xs text-white/50">{s.priceHint}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}