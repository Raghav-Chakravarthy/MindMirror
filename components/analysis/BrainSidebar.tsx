"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Topic, TopicDomain } from "@/lib/types";

interface Props {
  activeTopic: Topic | null;
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

const NODE_COUNT = 120;
const EDGE_COUNT = 180;
const nodeActivations = new Float32Array(NODE_COUNT);

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildBrainNetwork() {
  const rand = seededRandom(42);
  const nodes: THREE.Vector3[] = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = 1.2 + rand() * 0.6;

    const x = r * Math.sin(phi) * Math.cos(theta) * (1 + 0.3 * Math.sin(phi * 3));
    const y = r * Math.sin(phi) * Math.sin(theta) * 0.85;
    const z = r * Math.cos(phi) * 0.9;

    nodes.push(new THREE.Vector3(x, y, z));
  }

  const edges: [number, number][] = [];
  for (let i = 0; i < EDGE_COUNT; i++) {
    const a = Math.floor(rand() * NODE_COUNT);
    let b = Math.floor(rand() * NODE_COUNT);
    if (b === a) b = (a + 1) % NODE_COUNT;
    if (nodes[a].distanceTo(nodes[b]) < 1.8) {
      edges.push([a, b]);
    }
  }

  return { nodes, edges };
}

export default function BrainSidebar({ activeTopic }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    nodesMesh: THREE.Points;
    edgesMesh: THREE.LineSegments;
    glowMesh: THREE.Points;
    nodes: THREE.Vector3[];
    edges: [number, number][];
    frame: number;
    clock: THREE.Clock;
    targetColor: THREE.Color;
    currentColor: THREE.Color;
    activation: number;
    targetActivation: number;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "active">("idle");
  const [tribeAvailable, setTribeAvailable] = useState(false);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.15);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 4.5);

    const { nodes, edges } = buildBrainNetwork();

    // Nodes as points
    const nodePositions = new Float32Array(NODE_COUNT * 3);
    const nodeSizes = new Float32Array(NODE_COUNT);
    const nodeColors = new Float32Array(NODE_COUNT * 3);
    nodeActivations.fill(0);

    for (let i = 0; i < NODE_COUNT; i++) {
      nodePositions[i * 3] = nodes[i].x;
      nodePositions[i * 3 + 1] = nodes[i].y;
      nodePositions[i * 3 + 2] = nodes[i].z;
      nodeSizes[i] = 3 + Math.random() * 4;
      nodeColors[i * 3] = 0.25;
      nodeColors[i * 3 + 1] = 0.22;
      nodeColors[i * 3 + 2] = 0.35;
      nodeActivations[i] = 0;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute("size", new THREE.BufferAttribute(nodeSizes, 1));
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

    const nodeMat = new THREE.ShaderMaterial({
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
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (3.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, d);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const nodesMesh = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodesMesh);

    // Glow particles (larger, dimmer)
    const glowPositions = new Float32Array(NODE_COUNT * 3);
    const glowSizes = new Float32Array(NODE_COUNT);
    const glowColors = new Float32Array(NODE_COUNT * 3);

    for (let i = 0; i < NODE_COUNT; i++) {
      glowPositions[i * 3] = nodes[i].x;
      glowPositions[i * 3 + 1] = nodes[i].y;
      glowPositions[i * 3 + 2] = nodes[i].z;
      glowSizes[i] = 12 + Math.random() * 8;
      glowColors[i * 3] = 0.12;
      glowColors[i * 3 + 1] = 0.10;
      glowColors[i * 3 + 2] = 0.18;
    }

    const glowGeo = new THREE.BufferGeometry();
    glowGeo.setAttribute("position", new THREE.BufferAttribute(glowPositions, 3));
    glowGeo.setAttribute("size", new THREE.BufferAttribute(glowSizes, 1));
    glowGeo.setAttribute("color", new THREE.BufferAttribute(glowColors, 3));

    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (3.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d) * 0.4;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const glowMesh = new THREE.Points(glowGeo, glowMat);
    scene.add(glowMesh);

    // Edges
    const edgePositions = new Float32Array(edges.length * 6);
    const edgeColors = new Float32Array(edges.length * 6);

    for (let i = 0; i < edges.length; i++) {
      const [a, b] = edges[i];
      edgePositions[i * 6] = nodes[a].x;
      edgePositions[i * 6 + 1] = nodes[a].y;
      edgePositions[i * 6 + 2] = nodes[a].z;
      edgePositions[i * 6 + 3] = nodes[b].x;
      edgePositions[i * 6 + 4] = nodes[b].y;
      edgePositions[i * 6 + 5] = nodes[b].z;
      for (let j = 0; j < 6; j++) {
        edgeColors[i * 6 + j] = 0.15;
      }
    }

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
    edgeGeo.setAttribute("color", new THREE.BufferAttribute(edgeColors, 3));

    const edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const edgesMesh = new THREE.LineSegments(edgeGeo, edgeMat);
    scene.add(edgesMesh);

    const clock = new THREE.Clock();
    const targetColor = new THREE.Color(0.25, 0.22, 0.35);
    const currentColor = new THREE.Color(0.25, 0.22, 0.35);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const ref = sceneRef.current;
      if (!ref) return;

      currentColor.lerp(ref.targetColor, 0.02);
      ref.activation += (ref.targetActivation - ref.activation) * 0.03;

      (nodeMat.uniforms.uTime as { value: number }).value = t;

      const nc = nodeGeo.getAttribute("color") as THREE.BufferAttribute;
      const ns = nodeGeo.getAttribute("size") as THREE.BufferAttribute;
      const gc = glowGeo.getAttribute("color") as THREE.BufferAttribute;

      for (let i = 0; i < NODE_COUNT; i++) {
        const pulse = Math.sin(t * 2 + i * 0.5) * 0.5 + 0.5;
        const act = nodeActivations[i];
        const blend = act * ref.activation;

        const baseR = 0.25 + blend * (currentColor.r - 0.25);
        const baseG = 0.22 + blend * (currentColor.g - 0.22);
        const baseB = 0.35 + blend * (currentColor.b - 0.35);

        nc.setXYZ(i,
          baseR + pulse * blend * 0.3,
          baseG + pulse * blend * 0.2,
          baseB + pulse * blend * 0.1
        );
        ns.setX(i, (3 + Math.random() * 2) + blend * 4);

        gc.setXYZ(i,
          baseR * 0.4,
          baseG * 0.4,
          baseB * 0.4
        );
      }
      nc.needsUpdate = true;
      ns.needsUpdate = true;
      gc.needsUpdate = true;

      const ec = edgeGeo.getAttribute("color") as THREE.BufferAttribute;
      for (let i = 0; i < edges.length; i++) {
        const [a, b] = edges[i];
        const avgAct = (nodeActivations[a] + nodeActivations[b]) / 2;
        const blend = avgAct * ref.activation;
        const wave = Math.sin(t * 3 + i * 0.3) * 0.5 + 0.5;

        const r = 0.06 + blend * currentColor.r * 0.5 + wave * blend * 0.1;
        const g = 0.06 + blend * currentColor.g * 0.5 + wave * blend * 0.1;
        const bv = 0.06 + blend * currentColor.b * 0.5 + wave * blend * 0.1;

        ec.setXYZ(i * 2, r, g, bv);
        ec.setXYZ(i * 2 + 1, r, g, bv);
      }
      ec.needsUpdate = true;

      const group = nodesMesh.parent!;
      group.rotation.y = t * 0.15;
      group.rotation.x = Math.sin(t * 0.1) * 0.1;

      renderer.render(scene, camera);
    };

    // Group everything for rotation
    const group = new THREE.Group();
    scene.remove(nodesMesh, glowMesh, edgesMesh);
    group.add(nodesMesh, glowMesh, edgesMesh);
    scene.add(group);

    animate();

    const observer = new ResizeObserver(() => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    });
    observer.observe(container);

    sceneRef.current = {
      renderer, scene, camera, nodesMesh, edgesMesh, glowMesh,
      nodes, edges, frame, clock,
      targetColor, currentColor,
      activation: 0, targetActivation: 0,
    };

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
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
    const nodeGeo = sceneRef.current.nodesMesh.geometry;
    const positions = nodeGeo.getAttribute("position") as THREE.BufferAttribute;

    const hotspots: THREE.Vector3[] = [];
    const numHotspots = 2 + Math.floor(rand() * 3);
    for (let h = 0; h < numHotspots; h++) {
      const idx = Math.floor(rand() * NODE_COUNT);
      hotspots.push(new THREE.Vector3(
        positions.getX(idx),
        positions.getY(idx),
        positions.getZ(idx)
      ));
    }

    for (let i = 0; i < NODE_COUNT; i++) {
      const pos = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
      let maxAct = 0;
      for (const hs of hotspots) {
        const dist = pos.distanceTo(hs);
        const act = Math.exp(-dist * dist * 0.8);
        maxAct = Math.max(maxAct, act);
      }
      nodeActivations[i] = maxAct * (0.6 + rand() * 0.4);
    }
  }, []);

  const applyTribeActivation = useCallback((activation: number[]) => {
    // TRIBE v2 returns ~20,484 vertex activations on fsaverage5
    // Map them onto our NODE_COUNT particles by sampling evenly
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
    setStatus("active");

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
      // Sidecar not running — use procedural fallback
    }

    applyProceduralActivation(topic);
  }, [applyTribeActivation, applyProceduralActivation]);

  const deactivate = useCallback(() => {
    if (!sceneRef.current) return;
    setStatus("idle");
    sceneRef.current.targetColor = new THREE.Color(0.25, 0.22, 0.35);
    sceneRef.current.targetActivation = 0;
  }, []);

  useEffect(() => {
    if (activeTopic) {
      activateForTopic(activeTopic);
    } else {
      deactivate();
    }
  }, [activeTopic, activateForTopic, deactivate]);

  return (
    <div className="relative w-full h-full">
      <div ref={canvasRef} className="w-full h-full" />

      {status === "active" && activeTopic && (
        <div className="absolute top-3 left-3 right-3 pointer-events-none">
          <div
            className="text-[10px] tracking-widest uppercase px-2 py-1 inline-block"
            style={{
              color: DOMAIN_COLORS[activeTopic.domain],
              background: `${DOMAIN_COLORS[activeTopic.domain]}15`,
              border: `1px solid ${DOMAIN_COLORS[activeTopic.domain]}33`,
            }}
          >
            {activeTopic.domain}
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
        {tribeAvailable && (
          <span className="text-[9px] text-white/30 tracking-wider font-bold">
            TRIBE v2 &middot; Meta
          </span>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <div
            className="w-4 h-[2px] rounded-full"
            style={{ background: "linear-gradient(to right, #7c3aed, #ec4899)" }}
          />
          <span className="text-[9px] text-white/25">
            {tribeAvailable ? "fMRI prediction" : "neural activity"}
          </span>
        </div>
      </div>
    </div>
  );
}
