// src/sections/Experience3D.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { BRAND } from "../mock";
import { Button } from "../components/ui/button";
import { MessageCircle } from "lucide-react";
import LoadingOverlay from "../components/LoadingOverlay";

// Mapeamento de faixas de scroll para nomes de animações
const ANIM_MAP = [
  { range: [0, 20], name: "Idle" },
  { range: [20, 60], name: "Walk" },
  { range: [60, 100], name: "Run" },
];

const WhatsCTA = () => (
  <a
    href={`https://wa.me/${BRAND.whatsappIntl}?text=${encodeURIComponent(
      "Olá! Vim pelo site e quero desbloquear meu dispositivo."
    )}`}
    target="_blank"
    rel="noreferrer"
  >
    <Button className="bg-teal-400/90 hover:bg-teal-300 text-black font-semibold shadow-[0_0_36px_rgba(0,229,204,0.45)]">
      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
    </Button>
  </a>
);

export default function Experience3D() {
  const wrapRef = useRef(null);
  const mountRef = useRef(null);
  const phoneRef = useRef(null);
  const reqRef = useRef(null);
  const [loading, setLoading] = useState({ show: false, progress: 0 });

  useEffect(() => {
    console.log("[EXPERIENCE3D] patch ativo");
    // ---------- Base ----------
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#090a0b");

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.01, 100);
    camera.position.set(0, 0.9, 5.5); // distância maior para enquadrar o corpo todo
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    const isMobile =
      window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x0b1012, 1);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // Expor para debug rápido
    window.__SCENE = scene;
    window.__CAMERA = camera;

    // ---------- Ambiente (PMREM "Room") ----------
    const pmrem = new THREE.PMREMGenerator(renderer);
    try {
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
    } catch {}

    // ---------- Luzes ----------
    const key = new THREE.SpotLight(0xe0fff8, 1.6, 12, Math.PI / 6, 0.4, 1.2);
    key.position.set(2.6, 3.0, 2.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0002;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x1a272b, 0.9);
    rim.position.set(-2.2, 0.8, -1.8);
    scene.add(rim);

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x0b0e10, 0.5);
    scene.add(hemi);

    // Sweep (anima no unlock)
    const sweep = new THREE.SpotLight(0xffffff, 0.0, 8, Math.PI / 9, 0.8, 1.4);
    sweep.position.set(-1.4, 1.5, 2.2);
    scene.add(sweep);

    // ---------- Piso receptor de sombra ----------
    const shadowMat = new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.35 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), shadowMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.18;
    floor.receiveShadow = true;
    scene.add(floor);

    // ---------- UI da Tela (CanvasTexture) ----------
    const uiCanvas = document.createElement("canvas");
    uiCanvas.width = 768;
    uiCanvas.height = 1664; // ~19.5:9
    const uiCtx = uiCanvas.getContext("2d");
    const uiTex = new THREE.CanvasTexture(uiCanvas);
    uiTex.colorSpace = THREE.SRGBColorSpace;
    uiTex.flipY = false;
    uiTex.anisotropy = Math.min(
      renderer.capabilities.maxAnisotropy || 1,
      8
    );
    uiTex.needsUpdate = true;

    const drawUI = (t) => {
      const w = uiCanvas.width,
        h = uiCanvas.height;
      const grad = uiCtx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#0a0f12");
      grad.addColorStop(1, "#0d1418");
      uiCtx.fillStyle = grad;
      uiCtx.fillRect(0, 0, w, h);

      uiCtx.fillStyle = "#e9f7f5";
      uiCtx.font =
        "bold 56px Inter, system-ui, -apple-system, Segoe UI, Roboto";
      uiCtx.textAlign = "center";
      uiCtx.fillText("Desbloqueio", w / 2, 160);

      uiCtx.font = "32px Inter, system-ui";
      uiCtx.fillStyle = "#9ddbd6";
      let step = "Iniciando...";
      if (t < 0.33) step = "Verificando IMEI...";
      else if (t < 0.66) step = "Desbloqueando...";
      else if (t < 0.98) step = "Finalizando...";
      else step = "Finalizado";
      uiCtx.fillText(step, w / 2, 260);

      const barW = w * 0.72,
        barH = 36,
        bx = (w - barW) / 2,
        by = 320;
      uiCtx.fillStyle = "#1b2a30";
      uiCtx.fillRect(bx, by, barW, barH);
      const pw = Math.max(0, Math.min(1, t)) * barW;
      uiCtx.fillStyle = "#02e5cc";
      uiCtx.fillRect(bx, by, pw, barH);
      uiCtx.lineWidth = 4;
      uiCtx.strokeStyle = "#0c3b3a";
      uiCtx.strokeRect(bx + 2, by + 2, barW - 4, barH - 4);

      uiCtx.fillStyle = "#d3f3ee";
      uiCtx.font = "bold 30px Inter, system-ui";
      uiCtx.fillText(`${Math.round(t * 100)}%`, w / 2, by + 84);

      uiCtx.fillStyle = "#8cb7b3";
      uiCtx.font = "26px Inter, system-ui";
      uiCtx.fillText("Role para desbloquear", w / 2, h - 80);

      uiTex.needsUpdate = true;
    };

    const attachScreenPlane = (targetGroup) => {
      const bbox = new THREE.Box3().setFromObject(targetGroup);
      const size = bbox.getSize(new THREE.Vector3());
      const center = bbox.getCenter(new THREE.Vector3());

      const planeW = size.x * 0.85;
      const planeH = size.y * 0.82;

      const geo = new THREE.PlaneGeometry(planeW, planeH, 1, 1);
      const mat = new THREE.MeshPhysicalMaterial({
        map: uiTex,
        emissive: new THREE.Color("#0a0f12"),
        emissiveMap: uiTex,
        emissiveIntensity: 0.85,
        metalness: 0.0,
        roughness: 0.9,
        transparent: false,
      });
      const plane = new THREE.Mesh(geo, mat);
      plane.name = "ScreenPlane";
      plane.position.copy(
        center.clone().add(new THREE.Vector3(0, 0, 1).multiplyScalar(size.z * 0.51))
      );
      plane.lookAt(camera.position.clone().setZ(camera.position.z + 1e-3));
      targetGroup.add(plane);
      plane.renderOrder = 2;
      return plane;
    };

    // desenha interface inicial
    drawUI(0);

    // ---------- Fallback Phone ----------
    const makeFallbackPhone = () => {
      const group = new THREE.Group();
      group.scale.set(0.95, 0.95, 0.95);

      const body = new THREE.Mesh(
        new RoundedBoxGeometry(1.6, 3.2, 0.18, 20, 0.18),
        new THREE.MeshPhysicalMaterial({
          color: "#0f1215",
          metalness: 0.9,
          roughness: 0.18,
          clearcoat: 1.0,
          clearcoatRoughness: 0.06,
          envMapIntensity: 1.25,
        })
      );
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const rimMesh = new THREE.Mesh(
        new RoundedBoxGeometry(1.62, 3.22, 0.22, 20, 0.2),
        new THREE.MeshPhysicalMaterial({
          color: "#0b0e10",
          metalness: 1.0,
          roughness: 0.12,
          envMapIntensity: 1.4,
        })
      );
      rimMesh.scale.set(1.02, 1.02, 1.02);
      group.add(rimMesh);

      const screen = new THREE.Mesh(
        new RoundedBoxGeometry(1.48, 3.0, 0.02, 16, 0.12),
        new THREE.MeshPhysicalMaterial({
          color: "#070a0a",
          emissive: new THREE.Color(BRAND.accent),
          emissiveIntensity: 0.11,
          metalness: 0.35,
          roughness: 0.22,
        })
      );
      screen.position.z = 0.09;
      body.add(screen);

      const notch = new THREE.Mesh(
        new RoundedBoxGeometry(0.42, 0.08, 0.03, 8, 0.03),
        new THREE.MeshStandardMaterial({ color: "#0e1215", metalness: 0.6, roughness: 0.35 })
      );
      notch.position.set(0, 1.46, 0.092);
      group.add(notch);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.26, 0.011, 16, 220),
        new THREE.MeshBasicMaterial({ color: BRAND.accent, transparent: true, opacity: 0.2 })
      );
      ring.position.y = -0.22;
      group.add(ring);

      return group;
    };

    let phone = makeFallbackPhone();
    scene.add(phone);
    attachScreenPlane(phone);
    phone.rotation.set(0, 0, 0);
    phone.position.set(0, 0, 0);
    phoneRef.current = phone;

    // ---------- Animation setup ----------
    let mixer = null;
    const actions = {};
    let activeAction = null;

    function initAnimations(model, clips) {
      mixer = new THREE.AnimationMixer(model);
      clips.forEach((clip) => {
        actions[clip.name] = mixer.clipAction(clip);
      });
      console.log("Clips:", clips.map((c) => c.name));
    }

    function playClip(name, fade = 0.3) {
      const next = actions[name];
      if (!next) {
        console.warn(`Animação "${name}" não encontrada.`);
        return;
      }
      if (activeAction === next) return;
      next.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(fade).play();
      if (activeAction) activeAction.crossFadeTo(next, fade, false);
      activeAction = next;
    }

    // ---------- Scroll Handler ----------
    let lastTarget = null;
    let lastCall = 0;
    function onScroll() {
      const now = performance.now();
      if (now - lastCall < 120) return; // throttle ~120ms
      lastCall = now;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        Math.max(0, Math.min(1, window.scrollY / maxScroll)) * 100;
      const target = ANIM_MAP.find(
        (s) => progress >= s.range[0] && progress < s.range[1]
      );
      if (!target) return;
      if (lastTarget !== target.name) {
        playClip(target.name, 0.4);
        lastTarget = target.name;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // Pausa quando fora da viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!mixer) return;
          mixer.timeScale = entry.isIntersecting ? 1 : 0;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(mountRef.current);

    // ---------- Loop & Resize ----------
    const onResize = () => {
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    onResize();

    const clock = new THREE.Clock();
    const animate = () => {
      reqRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      renderer.render(scene, camera);
    };
    animate();

    // ---------- Loader GLB ----------
    const manager = new THREE.LoadingManager();
    manager.onStart = () => setLoading({ show: true, progress: 0 });
    manager.onProgress = (_url, loaded, total) =>
      setLoading({ show: true, progress: (loaded / total) * 100 });
    manager.onError = () => setLoading({ show: false, progress: 100 });
    manager.onLoad = () => setLoading({ show: false, progress: 100 });

    const loader = new GLTFLoader(manager);

    (async () => {
      const candidates = ["/models/phone.glb", "/models/phone.gltf"];
      for (const url of candidates) {
        try {
          const gltf = await loader.loadAsync(url);
          const loaded = gltf.scene || gltf.scenes?.[0];
          if (!loaded) throw new Error("GLTF sem cena");

          // Substitui fallback
          scene.remove(phone);
          phone = loaded;

          // Norm/escala/centro
          const box = new THREE.Box3().setFromObject(phone);
          const size = box.getSize(new THREE.Vector3());
          const scale = 1.2 / Math.max(size.y || 1e-3, 1e-3); // modelo menor
          phone.scale.setScalar(scale);
          const center = box.getCenter(new THREE.Vector3());
          phone.position.sub(center.multiplyScalar(1));

          // Pose
          phone.rotation.set(0.12, -0.2, 0);

          // Materiais/sombras
          phone.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = o.receiveShadow = true;
              if (o.material && o.material.metalness !== undefined) {
                o.material.envMapIntensity = 1.2;
              }
            }
          });

          scene.add(phone);
          attachScreenPlane(phone);
          phoneRef.current = phone;

          if (gltf.animations && gltf.animations.length) {
            initAnimations(phone, gltf.animations);
            onScroll();
          }

          break;
        } catch (e) {
          // tenta próximo candidato
        }
      }
    })();

    // ---------- Cleanup ----------
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      cancelAnimationFrame(reqRef.current);
      window.removeEventListener("resize", onResize);
      try { renderer.dispose(); } catch {}
      if (renderer.domElement && mountRef.current) {
        try { mountRef.current.removeChild(renderer.domElement); } catch {}
      }
      if (mixer) mixer.stopAllAction();
    };
  }, []);

  return (
    <section
      ref={wrapRef}
      className="relative h-[100vh] w-full flex items-center justify-center overflow-hidden"
    >
      {/* 3D Canvas */}
      <div
        ref={mountRef}
        id="canvas-container"
        className="absolute inset-0 z-30"
      />

      <LoadingOverlay
        show={loading.show}
        progress={loading.progress}
        text="Carregando modelo 3D..."
      />

      {/* Cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.6)_100%)]" />

      {/* CTA */}
      <div className="relative z-40">
        <WhatsCTA />
      </div>
    </section>
  );
}
