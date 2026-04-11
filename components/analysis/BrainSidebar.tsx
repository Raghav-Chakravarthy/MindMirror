"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Topic } from "@/lib/types";

interface Props {
  activeTopic: Topic | null;
}

// Map a 0-1 activation value to an RGB color (blue → cyan → green → yellow → red)
function activationToColor(v: number): THREE.Color {
  const c = new THREE.Color();
  // Use HSL: 240° (blue) to 0° (red) as v goes 0→1
  c.setHSL((1 - v) * 0.67, 1, 0.5);
  return c;
}

// Build a simple stylized brain mesh using two merged tori (left + right hemisphere silhouettes)
// This is a placeholder geometry until real fsaverage5 meshes are loaded
function buildPlaceholderBrain(): THREE.BufferGeometry {
  const group = new THREE.BufferGeometry();
  const geometries: THREE.BufferGeometry[] = [];

  // Left hemisphere
  const left = new THREE.SphereGeometry(1, 32, 24);
  left.applyMatrix4(new THREE.Matrix4().makeTranslation(-0.55, 0, 0));
  left.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.82, 0.88));
  geometries.push(left);

  // Right hemisphere
  const right = new THREE.SphereGeometry(1, 32, 24);
  right.applyMatrix4(new THREE.Matrix4().makeTranslation(0.55, 0, 0));
  right.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.82, 0.88));
  geometries.push(right);

  // Merge using BufferGeometryUtils approach manually
  const merged = mergeGeometries(geometries);
  return merged;
}

function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVertices = 0;
  let totalIndices = 0;

  for (const g of geos) {
    totalVertices += (g.getAttribute("position") as THREE.BufferAttribute).count;
    if (g.index) totalIndices += g.index.count;
  }

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const colors = new Float32Array(totalVertices * 3);
  const indices: number[] = [];

  let vOffset = 0;
  let iOffset = 0;

  for (const g of geos) {
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    const nor = g.getAttribute("normal") as THREE.BufferAttribute;
    const count = pos.count;

    positions.set(pos.array, vOffset * 3);
    normals.set(nor.array, vOffset * 3);

    // Default gray color
    for (let i = 0; i < count; i++) {
      colors[(vOffset + i) * 3] = 0.2;
      colors[(vOffset + i) * 3 + 1] = 0.2;
      colors[(vOffset + i) * 3 + 2] = 0.2;
    }

    if (g.index) {
      const idx = g.index.array;
      for (let i = 0; i < idx.length; i++) {
        indices.push((idx[i] as number) + vOffset);
      }
    }

    vOffset += count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  merged.setIndex(indices);
  return merged;
}

export default function BrainSidebar({ activeTopic }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    brain: THREE.Mesh;
    animFrame: number;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "unavailable">("idle");

  // Initialize Three.js scene
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 3, 4);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    // Brain mesh
    const geo = buildPlaceholderBrain();
    const mat = new THREE.MeshPhongMaterial({
      vertexColors: true,
      shininess: 30,
      side: THREE.FrontSide,
    });
    const brain = new THREE.Mesh(geo, mat);
    scene.add(brain);

    // Slow rotation
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      brain.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const observer = new ResizeObserver(() => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    });
    observer.observe(container);

    sceneRef.current = { renderer, scene, camera, brain, animFrame: frame };

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

  // Fetch TRIBE v2 activation when topic changes
  const fetchActivation = useCallback(async (topicName: string) => {
    if (!sceneRef.current) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: topicName }),
      });
      const data: { activation: number[] | null } = await res.json();

      if (!data.activation || !sceneRef.current) {
        setStatus("unavailable");
        return;
      }

      // Apply activation to vertex colors
      const { brain } = sceneRef.current;
      const colorAttr = brain.geometry.getAttribute("color") as THREE.BufferAttribute;
      const vertexCount = colorAttr.count;
      const activation = data.activation;

      // Normalize to 0-1
      const min = Math.min(...activation);
      const max = Math.max(...activation);
      const range = max - min || 1;

      for (let i = 0; i < vertexCount; i++) {
        // Map vertex index to activation index (tile if more vertices than activation values)
        const actIdx = i % activation.length;
        const normalized = (activation[actIdx] - min) / range;
        const color = activationToColor(normalized);
        colorAttr.setXYZ(i, color.r, color.g, color.b);
      }
      colorAttr.needsUpdate = true;
      setStatus("idle");
    } catch {
      setStatus("unavailable");
    }
  }, []);

  // Reset brain to gray when no topic
  const resetColors = useCallback(() => {
    if (!sceneRef.current) return;
    const { brain } = sceneRef.current;
    const colorAttr = brain.geometry.getAttribute("color") as THREE.BufferAttribute;
    for (let i = 0; i < colorAttr.count; i++) {
      colorAttr.setXYZ(i, 0.2, 0.2, 0.2);
    }
    colorAttr.needsUpdate = true;
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (activeTopic) {
      fetchActivation(activeTopic.name);
    } else {
      resetColors();
    }
  }, [activeTopic, fetchActivation, resetColors]);

  return (
    <div className="relative w-full h-full">
      <div ref={canvasRef} className="w-full h-full" />

      {/* Overlay status */}
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-[10px] text-[#444] tracking-widest animate-pulse">
            COMPUTING...
          </div>
        </div>
      )}

      {status === "unavailable" && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-[10px] text-[#333]">Brain map unavailable</p>
        </div>
      )}

      {/* Axis labels */}
      <div className="absolute top-2 right-2 space-y-0.5 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-px" style={{ background: "linear-gradient(to right, #0066ff, #ff0000)" }} />
          <span className="text-[8px] text-[#333]">low → high</span>
        </div>
      </div>
    </div>
  );
}
