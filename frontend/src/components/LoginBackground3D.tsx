"use client";
import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// -------------------------------------------------------------
// Realistic Astrophotography & Optical Diffraction Canvas Textures
// -------------------------------------------------------------

// 1. Soft Circular Radial Glow Texture
function createRadialTexture(
  innerCol: string,
  midCol: string,
  outerCol: string,
  size = 64
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.95);
  grad.addColorStop(0.0, innerCol);
  grad.addColorStop(0.25, midCol);
  grad.addColorStop(0.65, outerCol);
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 2. Realistic Pinprick Star Texture (Sharp luminous core with natural astronomical falloff)
function createRealisticPinprickStarTexture(size = 64): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.95);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.25, "rgba(255, 255, 255, 0.98)");
  grad.addColorStop(0.48, "rgba(224, 242, 254, 0.75)");
  grad.addColorStop(0.72, "rgba(56, 189, 248, 0.35)");
  grad.addColorStop(0.88, "rgba(14, 165, 233, 0.12)");
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 3. Alpha Star with Optical Diffraction Spikes (Hubble / James Webb Space Telescope Astrophotography)
function createCrossStarTexture(size = 128): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const center = size / 2;

  // Center radial flare
  const radGrad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.52);
  radGrad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  radGrad.addColorStop(0.18, "rgba(255, 255, 255, 0.98)");
  radGrad.addColorStop(0.42, "rgba(186, 230, 253, 0.80)");
  radGrad.addColorStop(0.75, "rgba(56, 189, 248, 0.28)");
  radGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, size, size);

  // Horizontal primary diffraction spike
  const horiz = ctx.createLinearGradient(0, center, size, center);
  horiz.addColorStop(0.0, "rgba(255, 255, 255, 0)");
  horiz.addColorStop(0.22, "rgba(186, 230, 253, 0.35)");
  horiz.addColorStop(0.5, "rgba(255, 255, 255, 1.0)");
  horiz.addColorStop(0.78, "rgba(186, 230, 253, 0.35)");
  horiz.addColorStop(1.0, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = horiz;
  ctx.fillRect(0, center - 1.5, size, 3);

  // Vertical primary diffraction spike
  const vert = ctx.createLinearGradient(center, 0, center, size);
  vert.addColorStop(0.0, "rgba(255, 255, 255, 0)");
  vert.addColorStop(0.22, "rgba(186, 230, 253, 0.35)");
  vert.addColorStop(0.5, "rgba(255, 255, 255, 1.0)");
  vert.addColorStop(0.78, "rgba(186, 230, 253, 0.35)");
  vert.addColorStop(1.0, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = vert;
  ctx.fillRect(center - 1.5, 0, 3, size);

  // Subtle 45-degree diagonal secondary spikes
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(Math.PI / 4);
  const diag = ctx.createLinearGradient(-center * 0.75, 0, center * 0.75, 0);
  diag.addColorStop(0.0, "rgba(255, 255, 255, 0)");
  diag.addColorStop(0.5, "rgba(255, 255, 255, 0.6)");
  diag.addColorStop(1.0, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = diag;
  ctx.fillRect(-center * 0.75, -0.75, center * 1.5, 1.5);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 4. Procedural Gaseous Nebula Cloud Texture
function createNebulaCloudTexture(size = 128): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center * 0.95);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 0.75)");
  grad.addColorStop(0.25, "rgba(56, 189, 248, 0.45)");
  grad.addColorStop(0.55, "rgba(147, 51, 234, 0.22)");
  grad.addColorStop(0.80, "rgba(236, 72, 153, 0.08)");
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// -------------------------------------------------------------
// Continental Point Cloud Generator
// -------------------------------------------------------------
function generateContinentPoints(radius: number) {
  if (typeof document === "undefined") {
    return { positions: new Float32Array(0), colors: new Float32Array(0) };
  }

  const w = 360;
  const h = 180;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { positions: new Float32Array(0), colors: new Float32Array(0) };

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  const toX = (lon: number) => ((lon + 180) / 360) * w;
  const toY = (lat: number) => ((90 - lat) / 180) * h;

  // Real Continental Polygons
  const continents: number[][][] = [
    // North America
    [[-165, 68], [-140, 70], [-105, 73], [-80, 75], [-60, 58], [-65, 45], [-75, 36], [-81, 25], [-97, 26], [-105, 20], [-120, 35], [-125, 49], [-140, 58], [-165, 62]],
    // South America
    [[-80, 10], [-60, 8], [-35, -5], [-38, -15], [-50, -30], [-65, -53], [-75, -45], [-80, -10]],
    // Eurasia
    [[-10, 36], [0, 44], [10, 54], [25, 60], [35, 70], [60, 72], [100, 75], [140, 72], [170, 66], [160, 55], [142, 50], [130, 42], [122, 30], [108, 22], [100, 10], [80, 15], [70, 25], [50, 30], [35, 32], [28, 41], [15, 38], [-5, 36]],
    // Africa
    [[-15, 32], [10, 37], [32, 31], [42, 12], [50, 10], [40, -15], [30, -33], [18, -34], [12, -10], [0, 5], [-17, 15]],
    // Australia
    [[115, -22], [125, -15], [135, -12], [148, -18], [152, -32], [140, -38], [128, -36], [115, -30]],
    // Japan & UK & Islands
    [[130, 32], [135, 35], [141, 44], [145, 43], [140, 36]],
    [[-5, 50], [-1, 58], [2, 52], [-5, 50]]
  ];

  ctx.fillStyle = "#ffffff";
  continents.forEach((poly) => {
    ctx.beginPath();
    poly.forEach((pt, i) => {
      const x = toX(pt[0]);
      const y = toY(pt[1]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  });

  const imgData = ctx.getImageData(0, 0, w, h).data;
  const pts: number[] = [];
  const cols: number[] = [];

  const cCyan = new THREE.Color("#00f0ff");
  const cSky = new THREE.Color("#38bdf8");
  const cBright = new THREE.Color("#ffffff");

  const step = 1.9; // High-density grid
  for (let lat = -82; lat <= 82; lat += step) {
    const yPx = Math.floor(toY(lat));
    for (let lon = -180; lon <= 180; lon += step) {
      const xPx = Math.floor(toX(lon));
      const idx = (yPx * w + xPx) * 4;
      if (imgData[idx] > 128) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);

        pts.push(x, y, z);

        const r = Math.random();
        const col = r > 0.85 ? cBright : (r > 0.35 ? cCyan : cSky);
        cols.push(col.r, col.g, col.b);
      }
    }
  }

  return {
    positions: new Float32Array(pts),
    colors: new Float32Array(cols),
  };
}

// Convert Lat/Lon to 3D Coordinates
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// -------------------------------------------------------------
// Global Cyber Threat & Defense Nodes (13 Strategic Hubs)
// -------------------------------------------------------------
interface ThreatNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  color: string;
  pulseRate: number;
}

const THREAT_NODES: ThreatNode[] = [
  { id: "nyc", name: "NEW YORK", lat: 40.71, lon: -74.0, color: "#ff3366", pulseRate: 1.8 },
  { id: "sfo", name: "SAN FRANCISCO", lat: 37.77, lon: -122.42, color: "#ff3366", pulseRate: 2.2 },
  { id: "tor", name: "TORONTO", lat: 43.65, lon: -79.38, color: "#00f0ff", pulseRate: 1.5 },
  { id: "lon", name: "LONDON", lat: 51.51, lon: -0.13, color: "#ff3366", pulseRate: 2.4 },
  { id: "fra", name: "FRANKFURT", lat: 50.11, lon: 8.68, color: "#ffaa00", pulseRate: 1.9 },
  { id: "par", name: "PARIS", lat: 48.86, lon: 2.35, color: "#00f0ff", pulseRate: 1.6 },
  { id: "tok", name: "TOKYO", lat: 35.68, lon: 139.77, color: "#ff3366", pulseRate: 2.3 },
  { id: "sin", name: "SINGAPORE", lat: 1.35, lon: 103.82, color: "#00f0ff", pulseRate: 1.7 },
  { id: "del", name: "DELHI", lat: 28.61, lon: 77.21, color: "#ff3366", pulseRate: 2.0 },
  { id: "dxb", name: "DUBAI", lat: 25.20, lon: 55.27, color: "#ffaa00", pulseRate: 1.8 },
  { id: "sao", name: "SAO PAULO", lat: -23.55, lon: -46.63, color: "#ff3366", pulseRate: 1.4 },
  { id: "jnb", name: "JOHANNESBURG", lat: -26.20, lon: 28.04, color: "#00f0ff", pulseRate: 1.5 },
  { id: "syd", name: "SYDNEY", lat: -33.87, lon: 151.21, color: "#00f0ff", pulseRate: 2.1 },
];

// -------------------------------------------------------------
// High-Density Network Flows Above Earth (22 Ballistic Arcs)
// -------------------------------------------------------------
interface NetworkFlow {
  from: string;
  to: string;
  color: string;
  speed: number;
  arcHeight: number;
  packets: number;
}

const NETWORK_FLOWS: NetworkFlow[] = [
  // Trans-Pacific Ballistic Streams
  { from: "tok", to: "sfo", color: "#ff0055", speed: 1.15, arcHeight: 1.42, packets: 2 },
  { from: "tok", to: "nyc", color: "#ff5500", speed: 0.95, arcHeight: 1.48, packets: 2 },
  { from: "sin", to: "sfo", color: "#00f0ff", speed: 1.05, arcHeight: 1.38, packets: 2 },
  { from: "syd", to: "sfo", color: "#38bdf8", speed: 0.85, arcHeight: 1.45, packets: 2 },

  // Trans-Atlantic High-Volume Defense
  { from: "lon", to: "nyc", color: "#00f0ff", speed: 1.25, arcHeight: 1.32, packets: 3 },
  { from: "fra", to: "nyc", color: "#ffaa00", speed: 0.90, arcHeight: 1.28, packets: 2 },
  { from: "par", to: "tor", color: "#c084fc", speed: 1.10, arcHeight: 1.26, packets: 2 },
  { from: "lon", to: "sfo", color: "#ff3366", speed: 0.88, arcHeight: 1.44, packets: 2 },

  // Eurasian & Middle Eastern High-Speed Backbone
  { from: "lon", to: "fra", color: "#00f0ff", speed: 1.60, arcHeight: 1.14, packets: 2 },
  { from: "fra", to: "dxb", color: "#ffaa00", speed: 1.00, arcHeight: 1.24, packets: 2 },
  { from: "dxb", to: "del", color: "#ff3366", speed: 1.15, arcHeight: 1.20, packets: 2 },
  { from: "del", to: "sin", color: "#00f0ff", speed: 1.30, arcHeight: 1.22, packets: 2 },
  { from: "sin", to: "tok", color: "#38bdf8", speed: 1.20, arcHeight: 1.28, packets: 2 },
  { from: "del", to: "fra", color: "#c084fc", speed: 0.80, arcHeight: 1.36, packets: 2 },

  // North-South Americas Links
  { from: "tor", to: "nyc", color: "#00f0ff", speed: 1.70, arcHeight: 1.12, packets: 2 },
  { from: "nyc", to: "sao", color: "#ff3366", speed: 0.95, arcHeight: 1.35, packets: 2 },
  { from: "sfo", to: "sao", color: "#ff5500", speed: 0.85, arcHeight: 1.40, packets: 2 },

  // African & Southern Hemisphere Relays
  { from: "lon", to: "jnb", color: "#00f0ff", speed: 0.90, arcHeight: 1.35, packets: 2 },
  { from: "sao", to: "jnb", color: "#c084fc", speed: 0.75, arcHeight: 1.32, packets: 2 },
  { from: "jnb", to: "dxb", color: "#38bdf8", speed: 1.10, arcHeight: 1.26, packets: 2 },
  { from: "sin", to: "syd", color: "#00f0ff", speed: 1.20, arcHeight: 1.24, packets: 2 },

  // Polar Route High Ballistic Arc
  { from: "lon", to: "tok", color: "#ff3366", speed: 0.75, arcHeight: 1.55, packets: 2 },
];

// -------------------------------------------------------------
// Interactive 3D Cyber Globe & Network Defense Arcs
// -------------------------------------------------------------
const HolographicCyberGlobe = ({ isMobile }: { isMobile: boolean }) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const scanRingRef = useRef<THREE.Mesh>(null);
  const orbitGroupA = useRef<THREE.Group>(null);
  const orbitGroupB = useRef<THREE.Group>(null);
  const orbitGroupC = useRef<THREE.Group>(null);

  const [pointData, setPointData] = useState<{ positions: Float32Array; colors: Float32Array } | null>(null);
  const [dotTexture, setDotTexture] = useState<THREE.CanvasTexture | null>(null);

  const radius = 3.35;

  useEffect(() => {
    // Generate soft circular glowing sprite for points
    const tex = createRadialTexture(
      "rgba(255, 255, 255, 1.0)",
      "rgba(0, 240, 255, 0.85)",
      "rgba(0, 240, 255, 0.15)",
      64
    );
    setDotTexture(tex);

    // Generate continent coordinates
    const data = generateContinentPoints(radius);
    setPointData(data);
  }, []);

  // Compute 3D node positions
  const nodeVectors = useMemo(() => {
    const map: { [id: string]: THREE.Vector3 } = {};
    THREAT_NODES.forEach((n) => {
      map[n.id] = latLonToVec3(n.lat, n.lon, radius);
    });
    return map;
  }, [radius]);

  // Compute 3D quadratic Bezier curves for all 22 network flows
  const flowCurves = useMemo(() => {
    return NETWORK_FLOWS.map((flow) => {
      const p1 = nodeVectors[flow.from];
      const p2 = nodeVectors[flow.to];
      if (!p1 || !p2) return null;

      // Calculate elevated midpoint arching above the globe
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      const elevation = radius * (flow.arcHeight + dist * 0.05);
      mid.normalize().multiplyScalar(elevation);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(45);
      const geom = new THREE.BufferGeometry().setFromPoints(points);

      return {
        geom,
        curve,
        color: flow.color,
        speed: flow.speed,
        packets: flow.packets,
      };
    }).filter(Boolean);
  }, [nodeVectors, radius]);

  // Dynamic packet mesh references (2 packets per flow)
  const packetRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Ripple mesh references for active sonar radar rings
  const rippleRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Wireframe Latitude / Longitude Circles
  const wireRings = useMemo(() => {
    const rings: THREE.BufferGeometry[] = [];
    const segs = 90;
    [-1.8, 0, 1.8].forEach((yVal) => {
      const ringR = Math.sqrt(radius * radius - yVal * yVal);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segs; i++) {
        const th = (i / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(th) * ringR, yVal, Math.sin(th) * ringR));
      }
      rings.push(new THREE.BufferGeometry().setFromPoints(pts));
    });
    return rings;
  }, [radius]);

  // Orbital Satellite Trajectory Rings
  const orbitalRingA = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const r = radius * 1.34;
    for (let i = 0; i <= 80; i++) {
      const th = (i / 80) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(th) * r, 0, Math.sin(th) * r));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  const orbitalRingB = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const r = radius * 1.48;
    for (let i = 0; i <= 80; i++) {
      const th = (i / 80) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(th) * r, 0, Math.sin(th) * r));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  const orbitalRingC = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const r = radius * 1.62;
    for (let i = 0; i <= 80; i++) {
      const th = (i / 80) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(th) * r, 0, Math.sin(th) * r));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const mouse = state.mouse;

    // 1. Axial globe rotation with subtle mouse tilt
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y = t * 0.048 + mouse.x * 0.08;
      globeGroupRef.current.rotation.x = 0.18 - mouse.y * 0.06;
    }

    // 2. Animate all network flow packets streaming along 3D ballistic arcs
    let packetIdx = 0;
    flowCurves.forEach((flow) => {
      if (!flow) return;
      for (let p = 0; p < flow.packets; p++) {
        const mesh = packetRefs.current[packetIdx];
        if (mesh) {
          const offset = p * (1.0 / flow.packets);
          const progress = (t * flow.speed * 0.38 + offset) % 1.0;
          const pt = flow.curve.getPoint(progress);
          mesh.position.copy(pt);
        }
        packetIdx++;
      }
    });

    // 3. Animate Threat Node Sonar Ripple Rings (Radar ping expansion)
    THREAT_NODES.forEach((node, idx) => {
      const mesh = rippleRefs.current[idx];
      if (mesh) {
        const phase = (t * node.pulseRate) % 1.0;
        const scale = 1.0 + phase * 2.8;
        mesh.scale.set(scale, scale, 1);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = Math.max(0, 0.85 * (1.0 - phase));
        }
      }
    });

    // 4. Animate Sweeping Latitude Radar Wave (laser scanning line)
    if (scanRingRef.current) {
      const scanY = Math.sin(t * 1.3) * (radius * 0.94);
      const scanR = Math.sqrt(Math.max(0.1, radius * radius - scanY * scanY));
      scanRingRef.current.position.y = scanY;
      scanRingRef.current.scale.set(scanR, scanR, 1);
    }

    // 5. Orbiting Defense Satellites
    if (orbitGroupA.current) {
      orbitGroupA.current.rotation.y = t * 0.16;
    }
    if (orbitGroupB.current) {
      orbitGroupB.current.rotation.y = -t * 0.12;
    }
    if (orbitGroupC.current) {
      orbitGroupC.current.rotation.y = t * 0.22;
    }
  });

  const globePos: [number, number, number] = isMobile ? [0, 2.2, -1.0] : [-3.9, -0.1, 0];

  return (
    <group ref={globeGroupRef} position={globePos}>
      {/* 1. Dark Occulting Core Sphere (Blocks Backside Points & Lines) */}
      <mesh>
        <sphereGeometry args={[radius * 0.985, 48, 48]} />
        <meshBasicMaterial color="#020817" />
      </mesh>

      {/* 2. Continents Dotted Point Cloud */}
      {pointData && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={pointData.positions.length / 3}
              array={pointData.positions}
              itemSize={3}
              args={[pointData.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              count={pointData.colors.length / 3}
              array={pointData.colors}
              itemSize={3}
              args={[pointData.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.15}
            map={dotTexture || undefined}
            vertexColors
            transparent
            opacity={0.92}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* 3. Glowing Atmospheric Shell */}
      <mesh>
        <sphereGeometry args={[radius * 1.035, 48, 48]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.065}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Latitude Wireframe Circles */}
      {wireRings.map((g, i) => (
        <lineLoop key={i} geometry={g}>
          <lineBasicMaterial color="#00f0ff" transparent opacity={0.16} blending={THREE.AdditiveBlending} />
        </lineLoop>
      ))}

      {/* 5. Sweeping Latitude Radar Scanner Ring */}
      <mesh ref={scanRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.02, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* 6. Threat & Defense Hotspot Nodes */}
      {THREAT_NODES.map((node, idx) => {
        const v = nodeVectors[node.id];
        if (!v) return null;
        return (
          <group key={node.id} position={v}>
            {/* Center target dot */}
            <mesh>
              <sphereGeometry args={[0.075, 16, 16]} />
              <meshBasicMaterial color={node.color} />
            </mesh>
            {/* Static Inner Reticle Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.10, 0.13, 24]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.85} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* Animated Expanding Sonar Radar Ping */}
            <mesh
              ref={(el) => {
                rippleRefs.current[idx] = el;
              }}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[0.14, 0.18, 24]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.65} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        );
      })}

      {/* 7. 22 High-Altitude Network Flow Arcs with Multi-Packet Streams */}
      {flowCurves.map((flow, flowIdx) => {
        if (!flow) return null;
        return (
          <group key={flowIdx}>
            {/* Continuous glowing trajectory arc line */}
            <line {...({ geometry: flow.geom } as any)}>
              <lineBasicMaterial
                color={flow.color}
                transparent
                opacity={0.58}
                blending={THREE.AdditiveBlending}
              />
            </line>

            {/* Staggered Traveling Energy Data Packets */}
            {Array.from({ length: flow.packets }).map((_, pIdx) => {
              const globalIdx = flowIdx * 2 + pIdx;
              return (
                <mesh
                  key={pIdx}
                  ref={(el) => {
                    packetRefs.current[globalIdx] = el;
                  }}
                >
                  <sphereGeometry args={[0.095, 16, 16]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* 8. Luminous Orbital Defense Ring Alpha & Orbiting Satellites */}
      <group rotation={[0.55, 0.35, 0.15]}>
        <lineLoop geometry={orbitalRingA}>
          <lineBasicMaterial color="#00f0ff" transparent opacity={0.46} blending={THREE.AdditiveBlending} />
        </lineLoop>
        <group ref={orbitGroupA}>
          {/* Satellite 1 */}
          <group position={[radius * 1.34, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.14, 0.08, 0.08]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0.14, 0, 0]}>
              <boxGeometry args={[0.16, 0.04, 0.02]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>
            <mesh position={[-0.14, 0, 0]}>
              <boxGeometry args={[0.16, 0.04, 0.02]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>
          </group>
          {/* Satellite 2 */}
          <group position={[-radius * 1.34, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>
      </group>

      {/* 9. Luminous Orbital Reconnaissance Ring Beta & Orbiting Satellites */}
      <group rotation={[-0.65, 0.70, -0.25]}>
        <lineLoop geometry={orbitalRingB}>
          <lineBasicMaterial color="#c084fc" transparent opacity={0.40} blending={THREE.AdditiveBlending} />
        </lineLoop>
        <group ref={orbitGroupB}>
          <group position={[radius * 1.48, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.12, 0.06, 0.06]} />
              <meshBasicMaterial color="#c084fc" />
            </mesh>
          </group>
          <group position={[-radius * 1.48, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        </group>
      </group>

      {/* 10. Outer Inclined Orbital Ring Gamma & Orbital Beacon */}
      <group rotation={[0.20, -0.65, 0.40]}>
        <lineLoop geometry={orbitalRingC}>
          <lineBasicMaterial color="#38bdf8" transparent opacity={0.36} blending={THREE.AdditiveBlending} />
        </lineLoop>
        <group ref={orbitGroupC}>
          <group position={[radius * 1.62, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.085, 16, 16]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>
          </group>
        </group>
      </group>

      {/* 10. Floating 3D HUD Reticles around Globe */}
      <mesh position={[radius * 0.95, radius * 0.65, 0.4]} rotation={[0, -0.4, 0]}>
        <ringGeometry args={[0.3, 0.35, 32, 1, 0, Math.PI * 1.2]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[-radius * 0.8, -radius * 0.7, 0.5]} rotation={[0, 0.3, 0.5]}>
        <ringGeometry args={[0.25, 0.28, 32, 1, 0, Math.PI * 1.5]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// -------------------------------------------------------------
// 1. Realistic Pinprick Starfield (4,200 Astronomical Stars)
// Authentic Hertzsprung–Russell Spectral Classification Colors
// -------------------------------------------------------------
const RealisticStarfield = () => {
  const starsRef = useRef<THREE.Points>(null);
  const [pinTex, setPinTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    setPinTex(createRealisticPinprickStarTexture(64));
  }, []);

  const starCount = 4200;
  const { starPos, starCol, starPhs, starSpeeds } = useMemo(() => {
    const p = new Float32Array(starCount * 3);
    const c = new Float32Array(starCount * 3);
    const ph = new Float32Array(starCount);
    const sp = new Float32Array(starCount);

    // Astronomical star spectral classes (Blackbody radiation temperatures)
    const cClassO = new THREE.Color("#7dd3fc");       // Electric Sapphire (30,000K)
    const cClassB = new THREE.Color("#bae6fd");       // Deep Blue-White (20,000K, Rigel)
    const cClassA = new THREE.Color("#ffffff");       // Diamond White (10,000K, Sirius/Vega)
    const cClassF = new THREE.Color("#f1f5f9");       // Crisp White (7,500K, Procyon)
    const cClassG = new THREE.Color("#fef08a");       // Warm Solar Yellow (5,800K, Sun/Capella)
    const cClassK = new THREE.Color("#fed7aa");       // Amber Orange (4,500K, Arcturus)
    const cClassM = new THREE.Color("#fda4af");       // Soft Red Giant (3,000K, Betelgeuse)

    for (let i = 0; i < starCount; i++) {
      // Natural celestial distribution across spherical field
      p[i * 3] = (Math.random() - 0.5) * 80;
      p[i * 3 + 1] = (Math.random() - 0.5) * 60;
      p[i * 3 + 2] = -42 + Math.random() * 48;

      // Authentic stellar population distribution
      const r = Math.random();
      const chosen =
        r > 0.50
          ? cClassA
          : r > 0.28
          ? cClassB
          : r > 0.14
          ? cClassF
          : r > 0.07
          ? cClassG
          : r > 0.03
          ? cClassK
          : r > 0.01
          ? cClassM
          : cClassO;

      // Realistic stellar magnitude: faint stars are vastly more numerous
      const magnitude = Math.pow(Math.random(), 2.0) * 0.78 + 0.28;

      c[i * 3] = chosen.r * magnitude;
      c[i * 3 + 1] = chosen.g * magnitude;
      c[i * 3 + 2] = chosen.b * magnitude;

      ph[i] = Math.random() * Math.PI * 2;
      sp[i] = 1.2 + Math.random() * 3.5;
    }
    return { starPos: p, starCol: c, starPhs: ph, starSpeeds: sp };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.0035;
      starsRef.current.rotation.x = t * 0.0015;

      const attr = starsRef.current.geometry.attributes.color;
      // Staggered multi-frequency authentic atmospheric twinkling across all stars
      for (let i = 0; i < starCount; i += 3) {
        const pulse = 0.60 + 0.40 * Math.sin(t * starSpeeds[i] + starPhs[i]);
        attr.setXYZ(
          i,
          starCol[i * 3] * pulse,
          starCol[i * 3 + 1] * pulse,
          starCol[i * 3 + 2] * pulse
        );
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={starCount} array={starPos} itemSize={3} args={[starPos, 3]} />
        <bufferAttribute attach="attributes-color" count={starCount} array={starCol} itemSize={3} args={[starCol, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.42}
        map={pinTex || undefined}
        vertexColors
        transparent
        opacity={0.96}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// -------------------------------------------------------------
// 2. Alpha Stars with 4-Point & 8-Point Optical Diffraction Spikes
// (Hubble / James Webb Space Telescope Astrophotography Effect)
// -------------------------------------------------------------
const AlphaStars = () => {
  const meshRef = useRef<THREE.Points>(null);
  const [crossTex, setCrossTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    setCrossTex(createCrossStarTexture(128));
  }, []);

  const count = 48; // 48 primary landmark celestial stars
  const { positions, colors, phases } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const ph = new Float32Array(count);

    const palette = [
      new THREE.Color("#ffffff"), // Pure Diamond Vega
      new THREE.Color("#dbeafe"), // Blue-White Rigel
      new THREE.Color("#38bdf8"), // Electric Sirius
      new THREE.Color("#fef08a"), // Solar Capella
      new THREE.Color("#fed7aa"), // Amber Arcturus
      new THREE.Color("#fda4af"), // Crimson Betelgeuse
      new THREE.Color("#e0e7ff"), // Polar Altair
    ];

    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 72;
      p[i * 3 + 1] = (Math.random() - 0.5) * 54;
      p[i * 3 + 2] = -14 - Math.random() * 26;

      const col = palette[i % palette.length];
      c[i * 3] = col.r * 1.25;
      c[i * 3 + 1] = col.g * 1.25;
      c[i * 3 + 2] = col.b * 1.25;

      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: p, colors: c, phases: ph };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.0035;
      meshRef.current.rotation.x = t * 0.0015;

      const attr = meshRef.current.geometry.attributes.color;
      for (let i = 0; i < count; i++) {
        // Multi-frequency lens flare pulsation for alpha stars
        const scin = 0.78 + 0.32 * Math.sin(t * 1.8 + phases[i]);
        attr.setXYZ(
          i,
          colors[i * 3] * scin,
          colors[i * 3 + 1] * scin,
          colors[i * 3 + 2] * scin
        );
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={2.2}
        map={crossTex || undefined}
        vertexColors
        transparent
        opacity={0.98}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// -------------------------------------------------------------
// 3. Multi-Meteor High-Velocity Shooting Star Shower Engine
// -------------------------------------------------------------
const ShootingStars = () => {
  const meteors = useRef([
    {
      active: false,
      startTime: 0,
      duration: 1.1,
      startPos: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      length: 6.2,
      nextSpawn: 1.0,
      positions: new Float32Array(6),
    },
    {
      active: false,
      startTime: 0,
      duration: 1.3,
      startPos: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      length: 5.4,
      nextSpawn: 3.2,
      positions: new Float32Array(6),
    },
    {
      active: false,
      startTime: 0,
      duration: 0.95,
      startPos: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      length: 7.0,
      nextSpawn: 5.5,
      positions: new Float32Array(6),
    },
  ]);

  const lineRefs = useRef<(THREE.Line | null)[]>([]);
  const headRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    meteors.current.forEach((m, idx) => {
      if (!m.active && t > m.nextSpawn) {
        m.active = true;
        m.startTime = t;
        m.duration = 0.85 + Math.random() * 0.75;

        // Spawn in celestial upper hemisphere
        const startX = (Math.random() - 0.3) * 44;
        const startY = 10 + Math.random() * 14;
        const startZ = -8 - Math.random() * 18;
        m.startPos.set(startX, startY, startZ);

        // Trajectory heading down diagonally with high velocity
        const angle = -Math.PI * 0.22 - Math.random() * 0.28;
        m.dir.set(Math.cos(angle) * 26, Math.sin(angle) * 26, -1.8).normalize();
        m.length = 5.0 + Math.random() * 3.5;
      }

      if (m.active) {
        const elapsed = t - m.startTime;
        const progress = elapsed / m.duration;

        if (progress >= 1.0) {
          m.active = false;
          m.nextSpawn = t + 1.8 + Math.random() * 4.2; // Frequent spawn: 1.8 - 6.0 seconds
          const line = lineRefs.current[idx];
          const head = headRefs.current[idx];
          if (line) (line.material as THREE.LineBasicMaterial).opacity = 0;
          if (head) head.scale.set(0, 0, 0);
        } else {
          const dist = progress * 42;
          const headX = m.startPos.x + m.dir.x * dist;
          const headY = m.startPos.y + m.dir.y * dist;
          const headZ = m.startPos.z + m.dir.z * dist;

          const tailX = headX - m.dir.x * m.length;
          const tailY = headY - m.dir.y * m.length;
          const tailZ = headZ - m.dir.z * m.length;

          m.positions[0] = tailX;
          m.positions[1] = tailY;
          m.positions[2] = tailZ;
          m.positions[3] = headX;
          m.positions[4] = headY;
          m.positions[5] = headZ;

          const line = lineRefs.current[idx];
          if (line) {
            const attr = line.geometry.attributes.position;
            if (attr) {
              (attr as THREE.BufferAttribute).copyArray(m.positions);
              attr.needsUpdate = true;
            }
            const alpha = Math.sin(progress * Math.PI);
            (line.material as THREE.LineBasicMaterial).opacity = alpha * 0.95;
          }

          const head = headRefs.current[idx];
          if (head) {
            const alpha = Math.sin(progress * Math.PI);
            head.position.set(headX, headY, headZ);
            head.scale.setScalar(alpha * 0.18);
          }
        }
      }
    });
  });

  return (
    <group>
      {meteors.current.map((_, i) => (
        <group key={i}>
          <line
            {...({
              ref: (el: THREE.Line | null) => {
                lineRefs.current[i] = el;
              },
            } as any)}
          >
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={meteors.current[i].positions}
                itemSize={3}
                args={[meteors.current[i].positions, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#bae6fd"
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
            />
          </line>
          <mesh
            ref={(el) => {
              headRefs.current[i] = el;
            }}
            scale={[0, 0, 0]}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// -------------------------------------------------------------
// 4. Procedural Galactic Nebula Clouds (Hubble Deep Field Aesthetic)
// -------------------------------------------------------------
const MilkyWayDust = () => {
  const nebRef = useRef<THREE.Points>(null);
  const [dustTex, setDustTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    setDustTex(createNebulaCloudTexture(128));
  }, []);

  const count = 550;
  const { positions, colors } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);

    const cCosmicCyan = new THREE.Color("#00f0ff");
    const cAzureBlue = new THREE.Color("#0284c7");
    const cUltraviolet = new THREE.Color("#7c3aed");
    const cMagentaGlow = new THREE.Color("#d946ef");
    const cDeepIndigo = new THREE.Color("#312e81");

    for (let i = 0; i < count; i++) {
      // Sweeping celestial diagonal nebular ribbon
      const u = (Math.random() - 0.5) * 64;
      const v = u * 0.44 + (Math.random() - 0.5) * 18;
      const z = -22 - Math.random() * 24;

      p[i * 3] = u;
      p[i * 3 + 1] = v;
      p[i * 3 + 2] = z;

      const r = Math.random();
      const col =
        r > 0.65
          ? cCosmicCyan
          : r > 0.40
          ? cAzureBlue
          : r > 0.22
          ? cUltraviolet
          : r > 0.08
          ? cMagentaGlow
          : cDeepIndigo;

      c[i * 3] = col.r;
      c[i * 3 + 1] = col.g;
      c[i * 3 + 2] = col.b;
    }
    return { positions: p, colors: c };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (nebRef.current) {
      nebRef.current.rotation.z = -t * 0.005;
    }
  });

  return (
    <points ref={nebRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={8.5}
        map={dustTex || undefined}
        vertexColors
        transparent
        opacity={0.28}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// -------------------------------------------------------------
// 5. Procedural Cyber Constellation Network
// -------------------------------------------------------------
const ConstellationGrid = () => {
  const lineRef = useRef<THREE.LineSegments>(null);

  const { points, lineIndices } = useMemo(() => {
    // 28 key navigational nodes across background
    const pts = [
      // Ursa Major cluster (top left)
      [-22, 14, -18], [-18, 16, -18], [-14, 15, -18], [-11, 12, -18], [-10, 8, -18], [-14, 8, -18], [-15, 12, -18],
      // Orion cluster (center-top)
      [-2, 16, -20], [3, 17, -20], [0, 12, -20], [-1, 10, -20], [1, 10, -20], [-3, 6, -20], [4, 5, -20],
      // Cygnus Cross (top right)
      [14, 16, -19], [18, 14, -19], [22, 12, -19], [17, 18, -19], [19, 10, -19],
      // Cassiopeia 'W' (far right)
      [24, 6, -22], [26, 9, -22], [28, 5, -22], [30, 8, -22], [32, 4, -22],
    ];

    const idxs = [
      // Ursa Major connections
      0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 3,
      // Orion connections
      7, 9, 8, 9, 9, 10, 10, 11, 10, 12, 11, 13,
      // Cygnus Cross
      14, 15, 15, 16, 17, 15, 15, 18,
      // Cassiopeia
      19, 20, 20, 21, 21, 22, 22, 23
    ];

    const pos = new Float32Array(pts.flat());
    return { points: pos, lineIndices: new Uint16Array(idxs) };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.18 + 0.10 * Math.sin(t * 1.4);
    }
  });

  return (
    <lineSegments
      {...({
        ref: lineRef,
      } as any)}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} args={[points, 3]} />
        <bufferAttribute attach="index" count={lineIndices.length} array={lineIndices} itemSize={1} args={[lineIndices, 1]} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#38bdf8"
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
};

// -------------------------------------------------------------
// 6. Floating Cyber Data Motes (Volumetric Depth Bokeh)
// -------------------------------------------------------------
const FloatingCyberDust = () => {
  const dustRef = useRef<THREE.Points>(null);
  const [bokehTex, setBokehTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    setBokehTex(
      createRadialTexture(
        "rgba(255, 255, 255, 0.98)",
        "rgba(0, 240, 255, 0.75)",
        "rgba(0, 240, 255, 0.15)",
        64
      )
    );
  }, []);

  const dustCount = 160;
  const { dustPos, dustVel } = useMemo(() => {
    const p = new Float32Array(dustCount * 3);
    const v = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      p[i * 3] = (Math.random() - 0.5) * 36;
      p[i * 3 + 1] = (Math.random() - 0.5) * 24;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20 + 2;

      v[i * 3] = (Math.random() - 0.5) * 0.005;
      v[i * 3 + 1] = 0.003 + Math.random() * 0.008;
      v[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }
    return { dustPos: p, dustVel: v };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dustRef.current) {
      const pos = dustRef.current.geometry.attributes.position;
      for (let i = 0; i < dustCount; i++) {
        let y = pos.getY(i) + dustVel[i * 3 + 1];
        let x = pos.getX(i) + dustVel[i * 3] + Math.sin(t * 0.8 + i) * 0.003;
        if (y > 12) y = -12;
        if (x > 18) x = -18;
        if (x < -18) x = 18;
        pos.setY(i, y);
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <points ref={dustRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={dustCount} array={dustPos} itemSize={3} args={[dustPos, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.28}
        map={bokehTex || undefined}
        color="#00f0ff"
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// -------------------------------------------------------------
// Main 3D Canvas Background Component
// -------------------------------------------------------------
export default function LoginBackground3D() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-[#020409]">
      <Canvas
        camera={{ position: [0, 0, 11], fov: 46 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[-8, 6, 8]} intensity={2.5} color="#00f0ff" />
        <pointLight position={[8, -6, 5]} intensity={1.8} color="#a855f7" />

        {/* 1. 3D Holographic Cyber Threat Globe on Left Side */}
        <HolographicCyberGlobe isMobile={isMobile} />

        {/* 2. Realistic Pinprick Starfield (4,200 Astronomical Stars) */}
        <RealisticStarfield />

        {/* 3. Alpha Stars with 4-Point Optical Diffraction Cross Spikes */}
        <AlphaStars />

        {/* 4. Multi-Meteor High-Velocity Shooting Star Shower */}
        <ShootingStars />

        {/* 5. Procedural Galactic Nebula Clouds */}
        <MilkyWayDust />

        {/* 6. Procedural Cyber Constellation Network */}
        <ConstellationGrid />

        {/* 7. Floating Cyber Data Motes */}
        <FloatingCyberDust />

        {/* 8. Bloom Pass for Cyber Glow */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.12} mipmapBlur intensity={1.65} radius={0.75} />
        </EffectComposer>
      </Canvas>

      {/* Atmospheric depth vignette (softened so outer stars stay brilliant) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(2,4,9,0.30)_85%,rgba(2,4,9,0.65)_100%)] pointer-events-none" />
    </div>
  );
}
