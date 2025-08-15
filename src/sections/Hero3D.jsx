import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Button } from "../components/ui/button";
import { BRAND } from "../mock";
import { MessageCircle, Zap } from "lucide-react";
import { gsap } from "gsap";

const WhatsCTA = ({ text = "Iniciar atendimento" }) => (
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

export default function Hero3D() {
  const mountRef = useRef(null);
  const rendererRef = useRef();
  const composerRef = useRef();
  const reqRef = useRef();

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b0c0d");

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0.45, 0.6, 3.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights cinematic
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0x88fff0, 1.7);
    mainLight.position.set(2.5, 3, 1.2);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x0a0f10, 0.6);
    rimLight.position.set(-2.2, 1.2, -2.2);
    scene.add(rimLight);

    // Ground soft
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({ color: "#0b0f10", roughness: 0.95, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.12;
    scene.add(ground);

    // Phone body
    const body = new THREE.Mesh(
      new RoundedBoxGeometry(1.6, 3.2, 0.18, 12, 0.18),
      new THREE.MeshPhysicalMaterial({
        color: "#111417",
        metalness: 0.65,
        roughness: 0.35,
        clearcoat: 1.0,
        clearcoatRoughness: 0.15,
      })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    scene.add(body);

    // Screen
    const screen = new THREE.Mesh(
      new RoundedBoxGeometry(1.48, 3.0, 0.02, 10, 0.12),
      new THREE.MeshPhysicalMaterial({
        color: "#0b0f0e",
        emissive: new THREE.Color(BRAND.accent),
        emissiveIntensity: 0.14,
        metalness: 0.3,
        roughness: 0.25,
      })
    );
    screen.position.z = 0.09;
    body.add(screen);

    // Floating neon ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.008, 16, 160),
      new THREE.MeshBasicMaterial({ color: BRAND.accent, transparent: true, opacity: 0.2 })
    );
    ring.position.y = -0.2;
    scene.add(ring);

    // Particles subtle
    const particles = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          new Array(600).fill(0).flatMap(() => [
            (Math.random() - 0.5) * 6,
            Math.random() * 3 - 0.5,
            (Math.random() - 0.5) * 6,
          ]),
          3
        )
      ),
      new THREE.PointsMaterial({ size: 0.01, color: BRAND.accent, transparent: true, opacity: 0.3 })
    );
    scene.add(particles);

    // Postprocessing composer with bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.6, 0.8, 0.75);
    composer.addPass(bloom);
    composerRef.current = composer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 4.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;
    controls.autoRotateSpeed = 0.7;

    // --- Fit camera to phone so it never apareça "cortado" ---
    // Calcula a caixa do corpo do telefone (inclui tela porque é filha)
    try {
      const bbox = new THREE.Box3().setFromObject(body);
      const size = bbox.getSize(new THREE.Vector3());
      const center = bbox.getCenter(new THREE.Vector3());

      // Garante que o conjunto (body) esteja centrado
      body.position.sub(center);

      // Distância ideal da câmera com base no FOV vertical
      const fitOffset = 1.2; // margem
      const vFOV = THREE.MathUtils.degToRad(camera.fov); // em radianos
      const distance = (size.y * fitOffset) / (2 * Math.tan(vFOV / 2));

      // Mantém a direção original da câmera, só ajusta o comprimento
      const dir = new THREE.Vector3().copy(camera.position).normalize();
      camera.position.copy(dir.multiplyScalar(distance));

      // Mira levemente acima do centro geométrico para compor melhor
      const target = new THREE.Vector3(0, Math.min(size.y * 0.15, 0.5), 0);
      controls.target.copy(target);

      // Ajusta clipping e limites de zoom
      camera.near = Math.max(distance / 100, 0.01);
      camera.far  = distance * 100;
      camera.updateProjectionMatrix();

      controls.minDistance = distance * 0.6;
      controls.maxDistance = distance * 3.0;
      controls.update();
    } catch (e) {
      console.warn("fit camera skipped:", e);
    }


    // Cinematic motion (gsap)
    gsap.fromTo(body.rotation, { x: 0.15, y: -0.6 }, { x: 0.2, y: 0.6, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(mainLight, { intensity: 1.4, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(ring.position, { y: -0.1, duration: 3.5, yoyo: true, repeat: -1, ease: "sine.inOut" });

    // Cursor parallax
    const target = new THREE.Vector2();
    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      target.set((x - 0.5) * 0.6, (y - 0.5) * 0.6);
    };
    window.addEventListener("pointermove", onPointerMove);

    const onResize = () => {
      const w = mountRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
      composer.setSize(w, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      camera.position.x += (target.x - camera.position.x) * 0.03;
      camera.position.y += (0.6 + target.y - camera.position.y) * 0.03;
      controls.update();
      composer.render();
      reqRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(reqRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement && mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-10 items-center pt-12 md:pt-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
            <Zap className="h-3.5 w-3.5 text-teal-400" />
            Tecnologia 3D cinematográfica
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Desbloqueio de Celular, MDM e PayJoy com estética moderna
          </h1>
          <p className="mt-4 text-white/70 max-w-prose">
            Experiência imersiva, animações fluidas e suporte premium. Segurança e velocidade em primeiro lugar.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <WhatsCTA />
            <a href="#servicos" className="text-white/70 hover:text-white text-sm">Ver serviços</a>
          </div>
        </div>
        <div ref={mountRef} className="w-full rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(0,229,204,0.15),rgba(0,0,0,0)_40%),linear-gradient(180deg,rgba(12,14,16,0.6),rgba(12,14,16,0.6))]" style={{ height: "calc(100vh - 84px)" }}" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(0,229,204,0.25), transparent 60%)" }} />
      </div>
    </section>
  );
}
