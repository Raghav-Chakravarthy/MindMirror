"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Topic, TopicDomain } from "@/lib/types";

interface Props {
  activeTopic: Topic | null;
  topics: Topic[];
  onTopicSelect: (topic: Topic | null) => void;
}

interface TopRegion {
  id: number;
  name: string;
  mean_activation: number;
  max_activation: number;
  vertex_count: number;
}

const DOMAIN_COLORS: Record<TopicDomain, string> = {
  ai: "#7c3aed",
  frontend: "#0ea5e9",
  backend: "#10b981",
  devops: "#f59e0b",
  design: "#ec4899",
  product: "#6366f1",
  other: "#6b7280",
};

const FRIENDLY_REGION_NAMES: Record<string, string> = {
  "G_and_S_frontomargin": "Frontomarginal Gyrus — Planning & Attention",
  "G_and_S_occipital_inf": "Inferior Occipital — Visual Processing",
  "G_and_S_paracentral": "Paracentral Lobule — Motor Control",
  "G_and_S_subcentral": "Subcentral Gyrus — Sensorimotor",
  "G_and_S_transv_frontopol": "Frontopolar — Abstract Reasoning",
  "G_and_S_cingul-Ant": "Anterior Cingulate — Decision Making",
  "G_and_S_cingul-Mid-Ant": "Mid-Anterior Cingulate — Conflict Monitoring",
  "G_and_S_cingul-Mid-Post": "Mid-Posterior Cingulate — Self-Reflection",
  "G_cingul-Post-dorsal": "Posterior Cingulate — Memory Retrieval",
  "G_cingul-Post-ventral": "Ventral Posterior Cingulate — Default Mode",
  "G_cuneus": "Cuneus — Visual Processing",
  "G_front_inf-Opercular": "Broca's Area (Opercular) — Speech Production",
  "G_front_inf-Orbital": "Inferior Frontal (Orbital) — Language",
  "G_front_inf-Triangul": "Broca's Area (Triangular) — Language Comprehension",
  "G_front_middle": "Middle Frontal Gyrus — Working Memory",
  "G_front_sup": "Superior Frontal — Executive Function",
  "G_Ins_lg_and_S_cent_ins": "Insular Cortex — Emotional Awareness",
  "G_insular_short": "Short Insular — Interoception",
  "G_occipital_middle": "Middle Occipital — Visual Association",
  "G_occipital_sup": "Superior Occipital — Visual Processing",
  "G_oc-temp_lat-fusifor": "Fusiform Gyrus — Face & Word Recognition",
  "G_oc-temp_med-Lingual": "Lingual Gyrus — Visual Memory",
  "G_oc-temp_med-Parahip": "Parahippocampal — Memory Encoding",
  "G_orbital": "Orbital Gyrus — Reward Processing",
  "G_pariet_inf-Angular": "Angular Gyrus — Semantic Processing",
  "G_pariet_inf-Supramar": "Supramarginal Gyrus — Language & Math",
  "G_parietal_sup": "Superior Parietal — Spatial Reasoning",
  "G_postcentral": "Somatosensory Cortex — Touch Processing",
  "G_precentral": "Primary Motor Cortex — Movement",
  "G_precuneus": "Precuneus — Self-Awareness & Imagery",
  "G_rectus": "Gyrus Rectus — Personality & Judgment",
  "G_subcallosal": "Subcallosal Gyrus — Emotional Regulation",
  "G_temp_sup-G_T_transv": "Heschl's Gyrus — Auditory Processing",
  "G_temp_sup-Lateral": "Superior Temporal — Language Comprehension",
  "G_temp_sup-Plan_polar": "Planum Polare — Auditory Association",
  "G_temp_sup-Plan_tempo": "Planum Temporale — Language Lateralization",
  "G_temporal_inf": "Inferior Temporal — Object Recognition",
  "G_temporal_middle": "Middle Temporal — Semantic Memory",
  "Lat_Fis-ant-Horizont": "Lateral Fissure — Language Processing",
  "Lat_Fis-ant-Vertical": "Lateral Fissure (Vertical) — Auditory",
  "Lat_Fis-post": "Posterior Lateral Fissure — Auditory",
  "Pole_occipital": "Occipital Pole — Primary Vision",
  "Pole_temporal": "Temporal Pole — Social Cognition",
  "S_calcarine": "Calcarine Sulcus — Primary Visual Cortex",
  "S_central": "Central Sulcus — Motor/Sensory Boundary",
  "S_cingul-Marginalis": "Cingulate Sulcus — Attention",
  "S_circular_insula_ant": "Anterior Circular Insular — Emotion",
  "S_circular_insula_inf": "Inferior Circular Insular — Visceral",
  "S_circular_insula_sup": "Superior Circular Insular — Awareness",
  "S_collat_transv_ant": "Anterior Collateral — Memory",
  "S_collat_transv_post": "Posterior Collateral — Visual Memory",
  "S_front_inf": "Inferior Frontal Sulcus — Cognitive Control",
  "S_front_middle": "Middle Frontal Sulcus — Attention",
  "S_front_sup": "Superior Frontal Sulcus — Planning",
  "S_interm_prim-Jensen": "Intermediate Sulcus — Language",
  "S_intrapariet_and_P_trans": "Intraparietal Sulcus — Numerical Cognition",
  "S_oc_middle_and_Lunatus": "Middle Occipital Sulcus — Vision",
  "S_oc_sup_and_transversal": "Superior Occipital Sulcus — Vision",
  "S_oc-temp_lat": "Occipitotemporal Sulcus — Reading",
  "S_oc-temp_med_and_Lingual": "Medial Occipitotemporal — Visual Memory",
  "S_orbital_lateral": "Lateral Orbital Sulcus — Decision Making",
  "S_orbital_med-olfact": "Medial Orbital — Olfaction & Reward",
  "S_orbital-H_Shaped": "H-Shaped Orbital — Reward Evaluation",
  "S_parieto_occipital": "Parieto-Occipital Sulcus — Visual-Spatial",
  "S_pericallosal": "Pericallosal Sulcus — Interhemispheric",
  "S_postcentral": "Postcentral Sulcus — Somatosensory",
  "S_precentral-inf-part": "Inferior Precentral — Motor Planning",
  "S_precentral-sup-part": "Superior Precentral — Motor Execution",
  "S_suborbital": "Suborbital Sulcus — Emotional Processing",
  "S_subparietal": "Subparietal Sulcus — Default Mode",
  "S_temporal_inf": "Inferior Temporal Sulcus — Object Processing",
  "S_temporal_sup": "Superior Temporal Sulcus — Social Cognition",
  "S_temporal_transverse": "Transverse Temporal — Auditory",
};

function friendlyName(raw: string): string {
  return FRIENDLY_REGION_NAMES[raw] || raw.replace(/_/g, " ").replace(/^[GS]_/, "");
}

// Cold blue-green to hot red/maroon brain activity colormap — 10 colors
function activationColor(value: number): [number, number, number] {
  if (value < 0.1) return [0.0, 0.15, 0.3];      // dark teal-blue
  if (value < 0.2) return [0.0, 0.35, 0.45];     // teal
  if (value < 0.3) return [0.05, 0.6, 0.35];     // green
  if (value < 0.4) return [0.4, 0.8, 0.15];      // lime-yellow
  if (value < 0.5) return [0.95, 0.9, 0.1];      // bright yellow
  if (value < 0.6) return [1.0, 0.6, 0.05];      // vivid orange
  if (value < 0.7) return [1.0, 0.35, 0.05];     // blood orange
  if (value < 0.8) return [0.95, 0.12, 0.05];    // vivid red
  if (value < 0.9) return [0.7, 0.05, 0.03];     // deep red
  return [0.38, 0.02, 0.02];                     // dark maroon
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function smoothActivationColor(v: number): [number, number, number] {
  const stops: { t: number; c: [number, number, number] }[] = [
    { t: 0.0, c: [0.0, 0.12, 0.25] },      // 1. dark teal-blue
    { t: 0.11, c: [0.0, 0.35, 0.45] },     // 2. teal
    { t: 0.22, c: [0.05, 0.6, 0.35] },     // 3. green
    { t: 0.33, c: [0.4, 0.82, 0.15] },     // 4. lime-yellow
    { t: 0.44, c: [0.95, 0.92, 0.1] },     // 5. bright yellow
    { t: 0.55, c: [1.0, 0.62, 0.05] },     // 6. vivid orange
    { t: 0.66, c: [1.0, 0.35, 0.05] },     // 7. blood orange
    { t: 0.77, c: [0.95, 0.12, 0.05] },    // 8. vivid red
    { t: 0.88, c: [0.7, 0.05, 0.03] },     // 9. deep red
    { t: 1.0, c: [0.38, 0.02, 0.02] },     // 10. dark maroon
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    if (v <= stops[i + 1].t) {
      const local = (v - stops[i].t) / (stops[i + 1].t - stops[i].t);
      return lerpColor(stops[i].c, stops[i + 1].c, local);
    }
  }
  return stops[stops.length - 1].c;
}

export default function BrainViewer({ activeTopic, topics, onTopicSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    brainMesh: THREE.Mesh;
    activationData: Float32Array | null;
    targetActivation: Float32Array | null;
    sulcData: Float32Array | null;
    animProgress: number;
  } | null>(null);
  const [tribeAvailable, setTribeAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [predictionSource, setPredictionSource] = useState<"tribe" | "procedural" | null>(null);
  const [topRegions, setTopRegions] = useState<TopRegion[]>([]);
  const [meshLoaded, setMeshLoaded] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);

  // Load mesh and set up Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 0.2, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0); // Transparent for white bg
    container.appendChild(renderer.domElement);

    // Lighting — brighter for white theme
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight1.position.set(2, 3, 4);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 0.2);
    dirLight2.position.set(-3, -1, -2);
    scene.add(dirLight2);

    // Load the real fsaverage5 mesh
    let brainMesh: THREE.Mesh;
    let sulcData: Float32Array | null = null;
    let vertexCount = 0;

    Promise.all([
      fetch("/fsaverage5.json").then((r) => r.json()),
      fetch("/fsaverage5_sulc.json").then((r) => r.json()),
    ]).then(([meshData, sulcArray]) => {
      const vertices = new Float32Array(meshData.vertices);
      const indices = new Uint32Array(meshData.faces);
      vertexCount = meshData.total_vertices;

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      geometry.computeVertexNormals();

      // Set up vertex colors from sulcal depth (light gray/silver look)
      sulcData = new Float32Array(sulcArray);
      const colors = new Float32Array(vertexCount * 3);
      for (let i = 0; i < vertexCount; i++) {
        const s = sulcData[i];
        // Sulci (deep) = darker, Gyri (ridges) = lighter — light silver base
        const base = 0.85 + (1 - s) * 0.1;
        colors[i * 3] = base;
        colors[i * 3 + 1] = base;
        colors[i * 3 + 2] = base + 0.05;
      }
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        shininess: 40,
        specular: new THREE.Color(0x444444),
        transparent: true,
        opacity: 0.9,
      });

      brainMesh = new THREE.Mesh(geometry, material);
      // Rotate to match standard neuroimaging view (nose forward)
      brainMesh.rotation.x = -Math.PI / 2;
      brainMesh.rotation.z = Math.PI;
      scene.add(brainMesh);

      sceneRef.current = {
        brainMesh,
        activationData: new Float32Array(vertexCount).fill(0),
        targetActivation: null,
        sulcData,
        animProgress: 0,
      };

      setMeshLoaded(true);
    });

    // Mouse interaction
    const mouse = { down: false, prevX: 0, prevY: 0 };
    let rotY = 0;
    let rotX = -0.2;
    let targetRotY = 0;
    let targetRotX = -0.2;
    let autoRotate = true;

    const onMouseDown = (e: MouseEvent) => {
      mouse.down = true;
      mouse.prevX = e.clientX;
      mouse.prevY = e.clientY;
      autoRotate = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (mouse.down) {
        targetRotY += (e.clientX - mouse.prevX) * 0.005;
        targetRotX += (e.clientY - mouse.prevY) * 0.005;
        targetRotX = Math.max(-0.8, Math.min(0.8, targetRotX));
        mouse.prevX = e.clientX;
        mouse.prevY = e.clientY;
      }
    };
    const onMouseUp = () => {
      mouse.down = false;
      setTimeout(() => { autoRotate = true; }, 3000);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(2.5, Math.min(7, camera.position.z + e.deltaY * 0.005));
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mouseleave", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    // Touch
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        mouse.down = true;
        mouse.prevX = e.touches[0].clientX;
        mouse.prevY = e.touches[0].clientY;
        autoRotate = false;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (mouse.down && e.touches.length === 1) {
        targetRotY += (e.touches[0].clientX - mouse.prevX) * 0.005;
        targetRotX += (e.touches[0].clientY - mouse.prevY) * 0.005;
        targetRotX = Math.max(-0.8, Math.min(0.8, targetRotX));
        mouse.prevX = e.touches[0].clientX;
        mouse.prevY = e.touches[0].clientY;
      }
    };
    const onTouchEnd = () => {
      mouse.down = false;
      setTimeout(() => { autoRotate = true; }, 3000);
    };
    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: true });
    renderer.domElement.addEventListener("touchend", onTouchEnd);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const ref = sceneRef.current;
      if (!ref || !ref.brainMesh) return;

      // Smooth rotation
      if (autoRotate) targetRotY += 0.002;
      rotY += (targetRotY - rotY) * 0.08;
      rotX += (targetRotX - rotX) * 0.08;

      ref.brainMesh.rotation.x = -Math.PI / 2 + rotX;
      ref.brainMesh.rotation.z = Math.PI + rotY;

      // Animate vertex colors toward target
      if (ref.targetActivation && ref.sulcData) {
        ref.animProgress = Math.min(1, ref.animProgress + 0.025);
        const t = ref.animProgress;
        const colorAttr = ref.brainMesh.geometry.getAttribute("color") as THREE.BufferAttribute;
        const count = ref.sulcData.length;

        for (let i = 0; i < count; i++) {
          const target = ref.targetActivation[i];
          const current = ref.activationData![i];
          const val = current + (target - current) * t;
          ref.activationData![i] = val;

          if (val > 0.15) {
            const [r, g, b] = smoothActivationColor(val);
            colorAttr.setXYZ(i, r, g, b);
          } else {
            const s = ref.sulcData[i];
            // Match the light silver base from initialization
            const base = 0.85 + (1 - s) * 0.1;
            colorAttr.setXYZ(i, base, base, base + 0.05);
          }
        }
        colorAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth;
      camera.aspect = nw / h;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("mouseleave", onMouseUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      renderer.domElement.removeEventListener("touchmove", onTouchMove);
      renderer.domElement.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const applyActivation = useCallback((activation: number[]) => {
    const ref = sceneRef.current;
    if (!ref) return;
    const target = new Float32Array(activation.length);
    for (let i = 0; i < activation.length; i++) {
      target[i] = activation[i];
    }
    ref.targetActivation = target;
    ref.animProgress = 0;
  }, []);

  const clearActivation = useCallback(() => {
    const ref = sceneRef.current;
    if (!ref || !ref.sulcData) return;
    const count = ref.sulcData.length;
    ref.targetActivation = new Float32Array(count).fill(0);
    ref.animProgress = 0;
    setTopRegions([]);
    setPredictionSource(null);
  }, []);

  const activateForTopic = useCallback(async (topic: Topic) => {
    if (!sceneRef.current) return;
    setLoading(true);
    setTopRegions([]);

    try {
      const res = await fetch("/api/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: topic.name }),
      });
      const data = await res.json();
      if (data.activation && data.activation.length > 0) {
        applyActivation(data.activation);
        setTribeAvailable(true);
        setPredictionSource("tribe");
        if (data.top_regions) setTopRegions(data.top_regions);
        setLoading(false);
        return;
      }
    } catch {
      // Sidecar not running
    }

    setPredictionSource("procedural");
    setLoading(false);
  }, [applyActivation]);

  useEffect(() => {
    if (activeTopic) {
      activateForTopic(activeTopic);
    } else {
      clearActivation();
    }
  }, [activeTopic, activateForTopic, clearActivation]);

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
          <h2 className="text-xs tracking-[0.3em] uppercase text-black/40 font-bold">
            Neural Activation Map
          </h2>
        </div>
        {tribeAvailable && (
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/40">
            Powered by Meta TRIBE v2
          </span>
        )}
      </div>

      <div className="relative rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div ref={containerRef} className="w-full h-[500px]" />

        {/* Overlays */}
        {activeTopic && predictionSource === "tribe" && (
          <div className="absolute top-6 left-8 animate-fade-in pointer-events-none max-w-[320px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: DOMAIN_COLORS[activeTopic.domain] }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: DOMAIN_COLORS[activeTopic.domain] }}>
                {activeTopic.domain}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100 font-bold tracking-widest uppercase">
                TRIBE v2
              </span>
            </div>
            <p className="text-xl font-bold text-black">{activeTopic.name}</p>
            <p className="text-[10px] text-black/40 mt-1 uppercase tracking-widest font-bold">
              fMRI-predicted · Cortical Map
            </p>
          </div>
        )}

        {activeTopic && predictionSource === "procedural" && (
          <div className="absolute top-6 left-8 animate-fade-in pointer-events-none">
            <p className="text-lg font-bold text-black/80">{activeTopic.name}</p>
            <p className="text-[10px] text-black/30 mt-1 font-bold uppercase tracking-widest">Procedural approximation</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/40 backdrop-blur-[2px]">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white shadow-lg border border-gray-100">
              <div className="w-4 h-4 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
              <span className="text-xs font-bold text-black/60 uppercase tracking-widest">Predicting activation...</span>
            </div>
          </div>
        )}

        {!activeTopic && !loading && meshLoaded && (
          <div className="absolute top-6 left-8 pointer-events-none animate-fade-in">
            <p className="text-xs font-bold text-black/40 uppercase tracking-[0.2em]">Select a topic below</p>
            <p className="text-[10px] text-black/20 mt-1 font-medium tracking-widest uppercase">Interactive fMRI Mapping</p>
          </div>
        )}

        {/* Color scale legend */}
        <div className="absolute bottom-6 right-8 flex items-center gap-3 pointer-events-none px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-gray-50">
          <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest">Low</span>
          <div className="w-24 h-1.5 rounded-full" style={{
            background: "linear-gradient(to right, #002040, #005973, #0d995a, #66d126, #f2eb1a, #ff9e0d, #ff5908, #f21e0d, #b30d05, #610505)"
          }} />
          <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest">High</span>
        </div>

        {/* TRIBE v2 status */}
        <div className="absolute bottom-4 left-5 pointer-events-none">
          {tribeAvailable ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600/40 font-bold tracking-wider">
                Meta TRIBE v2 · fsaverage5
              </span>
            </div>
          ) : meshLoaded ? (
            <span className="text-[10px] text-black/10">
              Start TRIBE v2 sidecar for real fMRI predictions
            </span>
          ) : null}
        </div>
      </div>

      {/* Top activated regions */}
      {topRegions.length > 0 && predictionSource === "tribe" && (
        <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow animate-slide-up">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-[10px] text-black/40 uppercase tracking-[0.2em] font-black">
              Most Activated Brain Regions
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topRegions.map((region, i) => (
              <div key={region.id} className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-black/[0.02] border border-black/[0.03] transition-all duration-300 hover:bg-black/[0.04]">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm" style={{
                  background: `rgba(${Math.round(smoothActivationColor(region.mean_activation)[0] * 255)}, ${Math.round(smoothActivationColor(region.mean_activation)[1] * 255)}, ${Math.round(smoothActivationColor(region.mean_activation)[2] * 255)}, 0.1)`,
                  color: `rgb(${Math.round(smoothActivationColor(region.mean_activation)[0] * 255)}, ${Math.round(smoothActivationColor(region.mean_activation)[1] * 255)}, ${Math.round(smoothActivationColor(region.mean_activation)[2] * 255)})`,
                  border: `1px solid rgba(${Math.round(smoothActivationColor(region.mean_activation)[0] * 255)}, ${Math.round(smoothActivationColor(region.mean_activation)[1] * 255)}, ${Math.round(smoothActivationColor(region.mean_activation)[2] * 255)}, 0.2)`,
                }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black/70 truncate">{friendlyName(region.name)}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 h-1.5 bg-black/[0.05] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${region.mean_activation * 100}%`,
                        background: `linear-gradient(to right, #005973, #66d126, #f2eb1a, #ff5908, #b30d05, #610505)`,
                      }} />
                    </div>
                    <span className="text-sm text-black font-black w-10 text-right tabular-nums tracking-tighter">
                      {(region.mean_activation * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic chips */}
      <div className="flex flex-wrap gap-3">
        {(showAllTopics ? topics : topics.slice(0, 8)).map((topic) => {
          const isActive = activeTopic?.name === topic.name;
          const color = DOMAIN_COLORS[topic.domain];
          return (
            <button
              key={topic.name}
              onClick={() => onTopicSelect(isActive ? null : topic)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs transition-all duration-300 press-effect border shadow-sm group"
              style={{
                borderColor: isActive ? `${color}44` : "rgba(0,0,0,0.06)",
                background: isActive ? `${color}0d` : "white",
                color: isActive ? color : "rgba(0,0,0,0.5)",
              }}
            >
              <span className="font-bold group-hover:text-black transition-colors">{topic.name}</span>
              <span className="text-black/20 font-black tracking-tighter group-hover:text-black/40 transition-colors">{topic.count}&times;</span>
            </button>
          );
        })}
        {!showAllTopics && topics.length > 8 && (
          <button
            onClick={() => setShowAllTopics(true)}
            className="text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black/60 self-center px-4 py-2 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-sm"
          >
            +{topics.length - 8} more
          </button>
        )}
        {showAllTopics && topics.length > 8 && (
          <button
            onClick={() => setShowAllTopics(false)}
            className="text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black/60 self-center px-4 py-2 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-sm"
          >
            show less
          </button>
        )}
      </div>
    </section>
  );
}
