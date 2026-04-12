"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function HeroBrain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    brainGroup: THREE.Group;
  } | null>(null);
  const [meshLoaded, setMeshLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight1 = new THREE.DirectionalLight(0xa855f7, 0.4); // Purple tint
    dirLight1.position.set(2, 3, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-2, -1, -2);
    scene.add(dirLight2);

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Load the real fsaverage5 mesh
    fetch("/fsaverage5.json")
      .then((r) => r.json())
      .then((meshData) => {
        const vertices = new Float32Array(meshData.vertices);
        const indices = new Uint32Array(meshData.faces);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        geometry.computeVertexNormals();

        // Material for the translucent volume
        const volumeMaterial = new THREE.MeshPhongMaterial({
          color: 0x9333ea, // Purple
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide,
          depthWrite: false,
          shininess: 30,
        });

        const brainMesh = new THREE.Mesh(geometry, volumeMaterial);
        
        // Material for the outline (Wireframe)
        const wireframeGeometry = new THREE.WireframeGeometry(geometry);
        const wireMaterial = new THREE.LineBasicMaterial({
          color: 0x7c3aed, // Purple
          transparent: true,
          opacity: 0.15,
        });
        const brainWire = new THREE.LineSegments(wireframeGeometry, wireMaterial);

        // Add both to group
        brainGroup.add(brainMesh);
        brainGroup.add(brainWire);

        // Rotate to match standard neuroimaging view
        brainGroup.rotation.x = -Math.PI / 2;
        brainGroup.rotation.z = Math.PI;

        sceneRef.current = { brainGroup };
        setMeshLoaded(true);
      });

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (sceneRef.current?.brainGroup) {
        // Slow constant rotation
        sceneRef.current.brainGroup.rotation.z += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000"
      style={{ opacity: meshLoaded ? 0.6 : 0 }}
    />
  );
}
