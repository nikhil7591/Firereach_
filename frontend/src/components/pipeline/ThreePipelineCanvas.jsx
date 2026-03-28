import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const STATUS_COLOR = {
  pending: '#6b7280',
  'in-progress': '#7c3aed',
  completed: '#22c55e',
  failed: '#ef4444',
};

export default function ThreePipelineCanvas({ nodes = [] }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const point = new THREE.PointLight(0x7c3aed, 1.1, 20);
    point.position.set(0, 1.5, 4);
    scene.add(point);

    const nodeCount = Math.max(nodes.length, 4);
    const spheres = [];
    const edges = [];

    for (let i = 0; i < nodeCount; i += 1) {
      const t = (i / Math.max(nodeCount - 1, 1)) * 2 - 1;
      const y = Math.sin(i * 0.65) * 0.45;

      const geometry = new THREE.SphereGeometry(0.13, 20, 20);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(STATUS_COLOR.pending),
        emissive: new THREE.Color(0x222222),
        emissiveIntensity: 0.6,
        roughness: 0.25,
        metalness: 0.35,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(t * 2.6, y, 0);
      scene.add(sphere);
      spheres.push(sphere);

      if (i > 0) {
        const prev = spheres[i - 1].position;
        const points = [new THREE.Vector3(prev.x, prev.y, prev.z), new THREE.Vector3(sphere.position.x, sphere.position.y, sphere.position.z)];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.75 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        edges.push(line);
      }
    }

    const particles = [];
    for (let i = 0; i < 22; i += 1) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9 }),
      );
      particle.userData.progress = Math.random();
      particles.push(particle);
      scene.add(particle);
    }

    let raf = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      spheres.forEach((sphere, index) => {
        const node = nodes[index];
        const status = node?.status || 'pending';
        const color = STATUS_COLOR[status] || STATUS_COLOR.pending;
        sphere.material.color.set(color);
        sphere.material.emissive.set(color);
        sphere.material.emissiveIntensity = status === 'in-progress' ? 1.35 + Math.sin(elapsed * 4 + index) * 0.3 : 0.45;
        sphere.scale.setScalar(status === 'in-progress' ? 1.06 + Math.sin(elapsed * 5 + index) * 0.06 : 1);
      });

      particles.forEach((particle, idx) => {
        const p = (particle.userData.progress + elapsed * 0.06 + idx * 0.01) % 1;
        const segment = Math.min(Math.floor(p * Math.max(spheres.length - 1, 1)), Math.max(spheres.length - 2, 0));
        const local = (p * Math.max(spheres.length - 1, 1)) - segment;

        const a = spheres[segment]?.position || new THREE.Vector3(-2, 0, 0);
        const b = spheres[segment + 1]?.position || new THREE.Vector3(2, 0, 0);
        particle.position.set(
          a.x + (b.x - a.x) * local,
          a.y + (b.y - a.y) * local + Math.sin(elapsed * 8 + idx) * 0.03,
          0,
        );
      });

      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 640;
      const h = mount.clientHeight || 260;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      spheres.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      particles.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      edges.forEach((line) => {
        line.geometry.dispose();
        line.material.dispose();
      });
    };
  }, [nodes]);

  return <div ref={mountRef} className="w-full h-[230px] md:h-[270px] rounded-xl border border-white/10 bg-black/30" />;
}
