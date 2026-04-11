"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Topic, TopicDomain } from "@/lib/types";

interface Props {
  activeTopic: Topic | null;
  topics: Topic[];
  onTopicSelect: (topic: Topic | null) => void;
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

const REGION_LABELS = [
  { name: "Prefrontal Cortex", desc: "Planning & decision-making", pos: [0, 0.6, 1.1] },
  { name: "Temporal Lobe", desc: "Language & memory", pos: [-1.3, -0.2, 0.3] },
  { name: "Parietal Lobe", desc: "Spatial reasoning", pos: [0, 0.8, -0.2] },
  { name: "Occipital Lobe", desc: "Visual processing", pos: [0, 0.3, -1.1] },
  { name: "Motor Cortex", desc: "Action & execution", pos: [0, 1.0, 0.3] },
  { name: "Broca's Area", desc: "Speech production", pos: [-1.1, 0.3, 0.8] },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createBrainGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 64, 48);
  const pos = geo.attributes.position;
  const normals = geo.attributes.normal;
  const count = pos.count;

  for (let i = 0; i < count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const nx = normals.getX(i);
    const ny = normals.getY(i);
    const nz = normals.getZ(i);

    // Elongate front-to-back
    z *= 1.3;
    // Flatten top slightly
    if (y > 0.3) y *= 0.9;
    // Widen at temples
    const temple = Math.exp(-y * y * 3) * 0.15;
    x *= 1.0 + temple;

    // Central fissure (gap between hemispheres)
    const fissureDepth = 0.08 * Math.exp(-x * x * 80) * (0.5 + 0.5 * Math.max(0, y));
    y -= fissureDepth;

    // Sulci (wrinkle-like grooves) — multiple frequency noise
    const s1 = Math.sin(x * 12 + z * 8) * Math.cos(y * 10) * 0.03;
    const s2 = Math.sin(x * 20 + y * 15 + z * 18) * 0.015;
    const s3 = Math.sin(x * 35 + y * 25 - z * 30) * 0.008;
    const sulci = (s1 + s2 + s3) * (0.6 + 0.4 * Math.max(0, y));

    x += nx * sulci;
    y += ny * sulci;
    z += nz * sulci;

    // Flatten bottom
    if (y < -0.4) {
      y = -0.4 + (y + 0.4) * 0.3;
    }

    // Cerebellum bump at back-bottom
    const cbDist = Math.sqrt(x * x + (y + 0.5) * (y + 0.5) + (z + 1.0) * (z + 1.0));
    if (cbDist < 0.6) {
      const cbBump = (0.6 - cbDist) * 0.25;
      x += nx * cbBump;
      y += ny * cbBump;
      z += nz * cbBump;
    }

    // Frontal lobe bulge
    if (z > 0.8) {
      const frontBulge = (z - 0.8) * 0.12;
      x *= 1.0 + frontBulge * 0.3;
      y += frontBulge * 0.1;
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

const NODE_COUNT = 120;
const nodeActivations = new Float32Array(NODE_COUNT);

export default function BrainViewer({ activeTopic, topics, onTopicSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    brainMesh: THREE.Mesh;
    glowMesh: THREE.Mesh;
    particlesMesh: THREE.Points;
    nodes: THREE.Vector3[];
    frame: number;
    clock: THREE.Clock;
    targetColor: THREE.Color;
    currentColor: THREE.Color;
    activation: number;
    targetActivation: number;
    mouse: { x: number; y: number; down: boolean; prevX: number; prevY: number };
    rotY: number;
    rotX: number;
    targetRotY: number;
    targetRotX: number;
    autoRotate: boolean;
  } | null>(null);
  const [tribeAvailable, setTribeAvailable] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.5, 4);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x6644aa, 0.4);
    fillLight.position.set(-3, 1, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x7c3aed, 0.6);
    rimLight.position.set(0, -1, -3);
    scene.add(rimLight);

    // Brain mesh
    const brainGeo = createBrainGeometry();
    const vertCount = brainGeo.attributes.position.count;
    const colors = new Float32Array(vertCount * 3);
    const baseColor = new THREE.Color(0.75, 0.65, 0.7);
    for (let i = 0; i < vertCount; i++) {
      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }
    brainGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const brainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.65,
      metalness: 0.05,
      envMapIntensity: 0.3,
    });

    const brainMesh = new THREE.Mesh(brainGeo, brainMat);
    scene.add(brainMesh);

    // Glow/atmosphere mesh (slightly larger, transparent)
    const glowGeo = createBrainGeometry();
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x7c3aed) },
        uIntensity: { value: 0.0 },
        viewVector: { value: camera.position },
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float vIntensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          vIntensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.04, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying float vIntensity;
        void main() {
          float alpha = vIntensity * uIntensity * 0.6;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // Floating particles around brain
    const particleCount = 200;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);
    const rand = seededRandom(42);

    for (let i = 0; i < particleCount; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 1.8 + rand() * 1.5;
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
      particleSizes[i] = 1.5 + rand() * 3;
      particleColors[i * 3] = 0.4;
      particleColors[i * 3 + 1] = 0.3;
      particleColors[i * 3 + 2] = 0.6;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(uTime * 0.5 + position.x * 2.0) * 0.05;
          pos.x += cos(uTime * 0.3 + position.z * 1.5) * 0.03;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (2.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d) * 0.5;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesMesh);

    // Build node positions on the brain surface for activation mapping
    const nodes: THREE.Vector3[] = [];
    const brainPos = brainGeo.attributes.position;
    const step = Math.floor(vertCount / NODE_COUNT);
    for (let i = 0; i < NODE_COUNT; i++) {
      const idx = Math.min(i * step, vertCount - 1);
      nodes.push(new THREE.Vector3(
        brainPos.getX(idx),
        brainPos.getY(idx),
        brainPos.getZ(idx)
      ));
    }
    nodeActivations.fill(0);

    const clock = new THREE.Clock();
    const targetColor = new THREE.Color(0x7c3aed);
    const currentColor = new THREE.Color(0x7c3aed);
    const mouse = { x: 0, y: 0, down: false, prevX: 0, prevY: 0 };

    let rotY = 0;
    let rotX = 0.1;
    let targetRotY = 0;
    let targetRotX = 0.1;
    let autoRotate = true;

    // Mouse interaction
    const onMouseDown = (e: MouseEvent) => {
      mouse.down = true;
      mouse.prevX = e.clientX;
      mouse.prevY = e.clientY;
      autoRotate = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (mouse.down) {
        const dx = e.clientX - mouse.prevX;
        const dy = e.clientY - mouse.prevY;
        targetRotY += dx * 0.005;
        targetRotX += dy * 0.005;
        targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX));
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
      camera.position.z = Math.max(2.5, Math.min(6, camera.position.z + e.deltaY * 0.005));
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mouseleave", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    // Touch support
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
        const dx = e.touches[0].clientX - mouse.prevX;
        const dy = e.touches[0].clientY - mouse.prevY;
        targetRotY += dx * 0.005;
        targetRotX += dy * 0.005;
        targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX));
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
    const baseVertexColor = new THREE.Color(0.75, 0.65, 0.7);

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const ref = sceneRef.current;
      if (!ref) return;

      currentColor.lerp(ref.targetColor, 0.03);
      ref.activation += (ref.targetActivation - ref.activation) * 0.04;

      (particleMat.uniforms.uTime as { value: number }).value = t;

      // Update glow
      (glowMat.uniforms.uColor as { value: THREE.Color }).value.copy(currentColor);
      (glowMat.uniforms.uIntensity as { value: number }).value = ref.activation;

      // Update brain vertex colors based on activation
      const colorAttr = brainGeo.getAttribute("color") as THREE.BufferAttribute;
      const posAttr = brainGeo.getAttribute("position") as THREE.BufferAttribute;

      for (let i = 0; i < vertCount; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const vz = posAttr.getZ(i);

        let maxAct = 0;
        for (let n = 0; n < NODE_COUNT; n++) {
          if (nodeActivations[n] < 0.01) continue;
          const dx = vx - nodes[n].x;
          const dy = vy - nodes[n].y;
          const dz = vz - nodes[n].z;
          const dist2 = dx * dx + dy * dy + dz * dz;
          const act = nodeActivations[n] * Math.exp(-dist2 * 4);
          if (act > maxAct) maxAct = act;
        }

        const blend = maxAct * ref.activation;
        const pulse = Math.sin(t * 2 + i * 0.01) * 0.5 + 0.5;

        const r = baseVertexColor.r + blend * (currentColor.r - baseVertexColor.r) + blend * pulse * 0.15;
        const g = baseVertexColor.g + blend * (currentColor.g - baseVertexColor.g) + blend * pulse * 0.1;
        const b = baseVertexColor.b + blend * (currentColor.b - baseVertexColor.b) + blend * pulse * 0.1;

        colorAttr.setXYZ(i, Math.min(1, r), Math.min(1, g), Math.min(1, b));
      }
      colorAttr.needsUpdate = true;

      // Update particle colors
      const pc = particleGeo.getAttribute("color") as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const blend = ref.activation * 0.5;
        pc.setXYZ(i,
          0.4 + blend * currentColor.r,
          0.3 + blend * currentColor.g,
          0.6 + blend * currentColor.b
        );
      }
      pc.needsUpdate = true;

      // Rotation
      if (autoRotate) {
        targetRotY += 0.003;
      }
      rotY += (targetRotY - rotY) * 0.08;
      rotX += (targetRotX - rotX) * 0.08;

      brainMesh.rotation.y = rotY;
      brainMesh.rotation.x = rotX;
      glowMesh.rotation.y = rotY;
      glowMesh.rotation.x = rotX;
      particlesMesh.rotation.y = rotY * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    const observer = new ResizeObserver(() => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    });
    observer.observe(container);

    sceneRef.current = {
      renderer, scene, camera, brainMesh, glowMesh, particlesMesh,
      nodes, frame, clock,
      targetColor, currentColor,
      activation: 0, targetActivation: 0,
      mouse, rotY, rotX, targetRotY, targetRotX, autoRotate,
    };

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
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
      sceneRef.current = null;
    };
  }, []);

  const applyProceduralActivation = useCallback((topic: Topic) => {
    if (!sceneRef.current) return;
    const rand = seededRandom(topic.name.length * 137 + topic.count);
    const { nodes } = sceneRef.current;

    const hotspots: THREE.Vector3[] = [];
    const numHotspots = 2 + Math.floor(rand() * 3);
    for (let h = 0; h < numHotspots; h++) {
      const idx = Math.floor(rand() * NODE_COUNT);
      hotspots.push(nodes[idx].clone());
    }

    for (let i = 0; i < NODE_COUNT; i++) {
      let maxAct = 0;
      for (const hs of hotspots) {
        const dist = nodes[i].distanceTo(hs);
        const act = Math.exp(-dist * dist * 1.5);
        maxAct = Math.max(maxAct, act);
      }
      nodeActivations[i] = maxAct * (0.5 + rand() * 0.5);
    }
  }, []);

  const applyTribeActivation = useCallback((activation: number[]) => {
    const step = Math.floor(activation.length / NODE_COUNT);
    const min = Math.min(...activation);
    const max = Math.max(...activation);
    const range = max - min || 1;

    for (let i = 0; i < NODE_COUNT; i++) {
      const idx = Math.min(i * step, activation.length - 1);
      nodeActivations[i] = (activation[idx] - min) / range;
    }
  }, []);

  const activateForTopic = useCallback(async (topic: Topic) => {
    if (!sceneRef.current) return;

    const color = new THREE.Color(DOMAIN_COLORS[topic.domain]);
    sceneRef.current.targetColor = color;
    sceneRef.current.targetActivation = 1;

    try {
      const res = await fetch("/api/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: topic.name }),
      });
      const data: { activation: number[] | null } = await res.json();
      if (data.activation && data.activation.length > 0) {
        applyTribeActivation(data.activation);
        setTribeAvailable(true);
        return;
      }
    } catch {
      // Sidecar not running
    }

    applyProceduralActivation(topic);
  }, [applyTribeActivation, applyProceduralActivation]);

  const deactivate = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current.targetColor = new THREE.Color(0x7c3aed);
    sceneRef.current.targetActivation = 0;
    setHoveredRegion(null);
  }, []);

  useEffect(() => {
    if (activeTopic) {
      activateForTopic(activeTopic);
      setHoveredRegion(activeTopic.name);
    } else {
      deactivate();
    }
  }, [activeTopic, activateForTopic, deactivate]);

  const topSorted = [...topics].sort((a, b) => b.count - a.count).slice(0, 8);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-purple-500" style={{ boxShadow: '0 0 8px #7c3aed' }} />
        <h2 className="text-sm tracking-[0.2em] uppercase text-white/60 font-bold">
          Neural Activation Map
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />
        {tribeAvailable && (
          <span className="text-xs text-purple-400/60 font-medium">
            Powered by Meta TRIBE v2
          </span>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden border border-purple-500/15 relative" style={{ background: 'linear-gradient(135deg, #08080f, #0d0a18)' }}>
        {/* Brain canvas */}
        <div ref={containerRef} className="w-full h-[500px] cursor-grab active:cursor-grabbing" />

        {/* Active topic overlay */}
        {activeTopic && (
          <div className="absolute top-5 left-6 animate-fade-in pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: DOMAIN_COLORS[activeTopic.domain], boxShadow: `0 0 8px ${DOMAIN_COLORS[activeTopic.domain]}` }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: DOMAIN_COLORS[activeTopic.domain] }}>
                {activeTopic.domain}
              </span>
            </div>
            <p className="text-lg font-bold text-white/90">{activeTopic.name}</p>
            <p className="text-xs text-white/40 mt-1">
              {tribeAvailable ? "fMRI-predicted activation pattern" : "Estimated neural activation"}
            </p>
          </div>
        )}

        {/* Instructions */}
        {!activeTopic && (
          <div className="absolute top-5 left-6 pointer-events-none animate-fade-in">
            <p className="text-sm text-white/40">
              Select a topic below to see brain activation
            </p>
            <p className="text-xs text-white/20 mt-1">
              Drag to rotate &middot; Scroll to zoom
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-5 flex items-center gap-3 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #7c3aed, #ec4899)' }} />
            <span className="text-[10px] text-white/30">
              {tribeAvailable ? "fMRI prediction" : "Activation intensity"}
            </span>
          </div>
        </div>
      </div>

      {/* Topic chips — click to activate brain */}
      <div className="flex flex-wrap gap-2">
        {topSorted.map((topic, idx) => {
          const color = DOMAIN_COLORS[topic.domain];
          const isActive = activeTopic?.name === topic.name;
          return (
            <button
              key={`${topic.name}-${idx}`}
              onClick={() => onTopicSelect(isActive ? null : topic)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                isActive
                  ? "text-white scale-105"
                  : "text-white/60 hover:text-white/90 hover:scale-[1.02]"
              }`}
              style={{
                borderColor: isActive ? `${color}88` : `${color}22`,
                background: isActive ? `${color}25` : `${color}08`,
                boxShadow: isActive ? `0 0 20px ${color}33` : "none",
              }}
            >
              {topic.name}
              <span className="text-white/25 ml-1.5">{topic.count}&times;</span>
            </button>
          );
        })}
        {topics.length > 8 && (
          <span className="px-3 py-1.5 text-xs text-white/25">
            +{topics.length - 8} more below
          </span>
        )}
      </div>
    </section>
  );
}
