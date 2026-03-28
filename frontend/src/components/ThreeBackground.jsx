import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ─── Palette ─── */
const FIRE  = 0xFF6B35;
const INDIGO = 0x6366F1;
const PURPLE = 0xA855F7;
const CYAN   = 0x22D3EE;
const GREEN  = 0x10B981;
const GOLD   = 0xF59E0B;
const PINK   = 0xEC4899;

const STEP_COLORS_HEX = [FIRE, INDIGO, GREEN, PURPLE, GOLD, CYAN, FIRE];
const PALETTE = [FIRE, INDIGO, PURPLE, CYAN, GREEN, GOLD, PINK];

function ThreeBackground({ className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ─── RENDERER ─── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 28);

    /* ─── LIGHTING ─── */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(INDIGO, 0.6, 50);
    pointLight1.position.set(0, 0, 15);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(FIRE, 0.4, 40);
    pointLight2.position.set(-10, 5, 10);
    scene.add(pointLight2);
    const pointLight3 = new THREE.PointLight(PURPLE, 0.3, 40);
    pointLight3.position.set(10, -5, 10);
    scene.add(pointLight3);

    /* ─── NODE POSITIONS (7-step arc) ─── */
    const nodeCount = 7;
    const getPos = (i) => {
      const angle = (i / (nodeCount - 1)) * Math.PI - Math.PI / 2;
      const r = 11;
      return new THREE.Vector3(
        Math.cos(angle) * r,
        Math.sin(angle) * r * 0.38,
        -5 + Math.sin(angle) * 3
      );
    };

    /* ─── 1. PIPELINE NODES — glowing spheres + rings + aura ─── */
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const pos = getPos(i);
      const color = new THREE.Color(STEP_COLORS_HEX[i]);

      // Core sphere (emissive glow)
      const coreMat = new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: 2.0, toneMapped: false,
      });
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), coreMat);
      core.position.copy(pos);
      scene.add(core);

      // Energy ring
      const ringMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.035, 16, 64), ringMat);
      ring.position.copy(pos);
      scene.add(ring);

      // Outer aura
      const auraMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.06,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
      });
      const aura = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 16), auraMat);
      aura.position.copy(pos);
      scene.add(aura);

      nodes.push({ core, ring, aura, pos, phase: i * 0.9 });
    }

    /* ─── 2. CONNECTION LINES ─── */
    const lineMat = new THREE.LineBasicMaterial({
      color: INDIGO, transparent: true, opacity: 0.12,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const connectionLines = [];
    for (let i = 0; i < nodeCount - 1; i++) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        nodes[i].pos, nodes[i + 1].pos,
      ]);
      const mat = lineMat.clone();
      mat.color = new THREE.Color(STEP_COLORS_HEX[i]);
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      connectionLines.push(mat);
    }

    /* ─── 3. DATA STREAM PARTICLES (instanced) ─── */
    const streamCount = 80;
    const streamGeo = new THREE.SphereGeometry(0.05, 6, 6);
    const streamMat = new THREE.MeshBasicMaterial({
      color: FIRE, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const streamMesh = new THREE.InstancedMesh(streamGeo, streamMat, streamCount);
    scene.add(streamMesh);

    const streamDummy = new THREE.Object3D();
    const streams = [];
    for (let i = 0; i < streamCount; i++) {
      streams.push({
        seg: Math.floor(Math.random() * 6),
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.006,
        offX: (Math.random() - 0.5) * 0.6,
        offY: (Math.random() - 0.5) * 0.4,
        size: 0.6 + Math.random() * 0.8,
      });
    }

    /* ─── 4. AMBIENT PARTICLES ─── */
    const particleCount = 400;
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const pVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3]     = (Math.random() - 0.5) * 60;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 6;
      const c = new THREE.Color(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      pColors[i * 3]     = c.r;
      pColors[i * 3 + 1] = c.g;
      pColors[i * 3 + 2] = c.b;
      pVelocities.push({
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.004,
        z: (Math.random() - 0.5) * 0.003,
      });
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.1, vertexColors: true, transparent: true, opacity: 0.55,
      sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ─── 5. ORBIT RINGS ─── */
    const orbits = [];
    const orbitConfigs = [
      { r: 14, color: FIRE, opa: 0.06, rotX: Math.PI / 2 },
      { r: 16.5, color: INDIGO, opa: 0.05, rotX: Math.PI / 2 + 0.3 },
      { r: 19, color: PURPLE, opa: 0.04, rotX: Math.PI / 2 + 0.6 },
    ];
    orbitConfigs.forEach((cfg, i) => {
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color, transparent: true, opacity: cfg.opa,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, 0.03, 8, 128), mat);
      mesh.rotation.x = cfg.rotX;
      mesh.rotation.y = i * 0.5;
      scene.add(mesh);
      orbits.push(mesh);
    });

    /* ─── 6. HEX GRID BACKGROUND ─── */
    const hexPoints = [];
    const hexGridSize = 8;
    const hexSpacing = 3;
    // Seeded random for consistency
    let seed = 42;
    const sRand = () => { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; };
    for (let gx = -hexGridSize; gx <= hexGridSize; gx++) {
      for (let gy = -hexGridSize; gy <= hexGridSize; gy++) {
        if (sRand() > 0.25) continue;
        for (let h = 0; h < 6; h++) {
          const a1 = (h * Math.PI * 2) / 6;
          const a2 = ((h + 1) * Math.PI * 2) / 6;
          hexPoints.push(
            new THREE.Vector3(gx * hexSpacing + Math.cos(a1) * 1.2, gy * hexSpacing * 0.6 + Math.sin(a1) * 1.2, -14),
            new THREE.Vector3(gx * hexSpacing + Math.cos(a2) * 1.2, gy * hexSpacing * 0.6 + Math.sin(a2) * 1.2, -14),
          );
        }
      }
    }
    const hexGeo = new THREE.BufferGeometry().setFromPoints(hexPoints);
    const hexMat = new THREE.LineBasicMaterial({
      color: INDIGO, transparent: true, opacity: 0.03,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    scene.add(new THREE.LineSegments(hexGeo, hexMat));

    /* ─── MOUSE TRACKING ─── */
    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    document.addEventListener('mousemove', onMouse);

    /* ─── RESIZE ─── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    /* ─── ANIMATION LOOP ─── */
    let frameId = 0;
    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = performance.now() * 0.001;

      // ── Camera: cinematic float + mouse parallax
      const floatX = Math.sin(t * 0.15) * 0.8;
      const floatY = Math.cos(t * 0.12) * 0.5;
      camera.position.x = lerp(camera.position.x, mouseX * 1.8 + floatX, 0.025);
      camera.position.y = lerp(camera.position.y, -mouseY * 1.2 + floatY, 0.025);
      camera.position.z = 28 + Math.sin(t * 0.1) * 0.5;
      camera.lookAt(0, 0, 0);

      // ── Nodes: pulse + ring spin + aura breathe
      nodes.forEach((n, i) => {
        const pulse = 1 + Math.sin(t * 1.5 + n.phase) * 0.12;
        n.core.scale.setScalar(pulse);
        n.ring.rotation.z = t * 0.4 + i * 0.7;
        n.ring.rotation.x = Math.sin(t * 0.3 + n.phase) * 0.3;
        const auraScale = 1 + Math.sin(t * 0.8 + n.phase) * 0.15;
        n.aura.scale.setScalar(auraScale);
        n.aura.material.opacity = 0.06 + Math.sin(t + n.phase) * 0.03;
      });

      // ── Connection lines: pulse opacity
      connectionLines.forEach((mat, i) => {
        mat.opacity = 0.12 + Math.sin(t * 1.2 + i * 0.4) * 0.06;
      });

      // ── Data streams: flowing between nodes
      streams.forEach((s, i) => {
        s.t += s.speed;
        if (s.t > 1) { s.t = 0; s.seg = Math.floor(Math.random() * 6); }
        const a = nodes[s.seg].pos;
        const b = nodes[s.seg + 1].pos;
        const px = lerp(a.x, b.x, s.t) + Math.sin(t * 2 + i) * s.offX;
        const py = lerp(a.y, b.y, s.t) + Math.cos(t * 1.5 + i) * s.offY;
        const pz = lerp(a.z, b.z, s.t);
        streamDummy.position.set(px, py, pz);
        const sc = s.size * (1 + Math.sin(t * 3 + i) * 0.3);
        streamDummy.scale.setScalar(sc);
        streamDummy.updateMatrix();
        streamMesh.setMatrixAt(i, streamDummy.matrix);
      });
      streamMesh.instanceMatrix.needsUpdate = true;

      // ── Particles: drift + boundary bounce
      const pos = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3]     += pVelocities[i].x;
        pos[i * 3 + 1] += pVelocities[i].y;
        pos[i * 3 + 2] += pVelocities[i].z;
        if (Math.abs(pos[i * 3]) > 32)     pVelocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 18) pVelocities[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 18) pVelocities[i].z *= -1;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.015;

      // ── Orbits: gentle rotation
      orbits.forEach((mesh, i) => {
        mesh.rotation.x = orbitConfigs[i].rotX + t * 0.06 * (i + 1);
        mesh.rotation.z = t * 0.04 * (i + 1);
      });

      // ── Lights: subtle color shift
      pointLight1.intensity = 0.5 + Math.sin(t * 0.5) * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    /* ─── CLEANUP ─── */
    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`three-bg ${className}`.trim()}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

export default ThreeBackground;
