import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import LoadingOverlay from "../components/LoadingOverlay";

// Mapa de faixas de scroll -> animações
export const ANIM_MAP = [
  { range: [0, 20], name: "Idle" },
  { range: [20, 60], name: "Walk" },
  { range: [60, 100], name: "Run" },
];

export default function Hero3D() {
  const mountRef = useRef(null);
  const reqRef = useRef(null);
  const [loading, setLoading] = useState({ show: false, progress: 0 });

  useEffect(() => {
    let mixer = null;
    const actions = {};
    let activeAction = null;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Cena básica
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    // Pós-processamento (EffectComposer + UnrealBloom)
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.8,
      0.4,
      0.85
    );
    composer.addPass(bloom);

    // Controles (sem rotação)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.autoRotate = false;
    // desabilita zoom e pan para evitar que o scroll do mouse aproxime/afaste o modelo
    controls.enableZoom = false;
    controls.enablePan = false;

    // Iluminação simples
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(3, 3, 3);
    scene.add(dir);

    // Animation helpers -------------------------------------------------
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
        console.warn(`Animação '${name}' não encontrada`);
        return;
      }
      if (activeAction === next) return;
      next
        .reset()
        .setLoop(THREE.LoopRepeat, Infinity)
        .fadeIn(fade)
        .play();
      if (activeAction) activeAction.crossFadeTo(next, fade, false);
      activeAction = next;
    }

    // Scroll handler ----------------------------------------------------
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

    // IntersectionObserver (pausa quando fora de viewport) --------------
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

    // Loader GLB --------------------------------------------------------
    const manager = new THREE.LoadingManager();
    manager.onStart = () => setLoading({ show: true, progress: 0 });
    manager.onProgress = (_url, loaded, total) =>
      setLoading({ show: true, progress: (loaded / total) * 100 });
    manager.onLoad = () => setLoading({ show: false, progress: 100 });
    manager.onError = () => setLoading({ show: false, progress: 100 });

    const loader = new GLTFLoader(manager);
    loader.load(
      "/models/phone.glb",
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        initAnimations(model, gltf.animations);
        const initial = ANIM_MAP[0]?.name || gltf.animations?.[0]?.name;
        if (initial) playClip(initial, 0.2);
      },
      undefined,
      (err) => {
        console.error("Erro ao carregar GLB", err);
      }
    );

    // Loop de animação --------------------------------------------------
    const clock = new THREE.Clock();
    function animate() {
      reqRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      controls.update();
      composer.render();
    }
    animate();

    // Resize -------------------------------------------------------------
    function onResize() {
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloom.setSize(w, h);
    }
    window.addEventListener("resize", onResize);
    onResize();

    // Cleanup ------------------------------------------------------------
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      cancelAnimationFrame(reqRef.current);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      Object.values(actions).forEach((a) => a.stop());
    };
  }, []);

  return (
    <section className="relative h-[100vh] w-full overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" id="canvas-container" />
      <LoadingOverlay
        show={loading.show}
        progress={loading.progress}
        text="Carregando modelo 3D..."
      />
    </section>
  );
}
