import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// LEGO part types
export interface LegoPart {
  id: string;
  type: "brick" | "motor" | "wheel" | "axle" | "hub";
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  size?: [number, number, number];
}

// Brick Component
const Brick = ({ position, rotation, color, size = [2, 1, 1] }: any) => {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Motor Component
const Motor = ({ position, rotation, color = "#4CAF50", speed = 0 }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && speed !== 0) {
      meshRef.current.rotation.x += speed * 0.01;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Motor body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Motor shaft */}
      <mesh ref={meshRef} position={[0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </group>
  );
};

// Wheel Component
const Wheel = ({ position, rotation, color = "#2196F3", speed = 0 }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && speed !== 0) {
      meshRef.current.rotation.x += speed * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[0.6, 0.6, 0.3, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Hub Component (WeDo Hub)
const Hub = ({ position, rotation, ledColor = "#000" }: any) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Hub body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.8, 2]} />
        <meshStandardMaterial color="#90CAF9" />
      </mesh>
      {/* LED indicator */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={ledColor !== "#000" ? 2 : 0} />
      </mesh>
    </group>
  );
};

// Axle Component
const Axle = ({ position, rotation, length = 2 }: any) => {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={[0.1, 0.1, length, 16]} />
      <meshStandardMaterial color="#666" />
    </mesh>
  );
};

interface Scene3DProps {
  parts: LegoPart[];
  motorSpeed?: number;
  ledColor?: string;
}

// Main 3D Scene
const Scene3D = ({ parts, motorSpeed = 0, ledColor = "#000" }: Scene3DProps) => {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Grid */}
      <gridHelper args={[20, 20, "#ccc", "#e0e0e0"]} position={[0, -1.99, 0]} />

      {/* Render parts */}
      {parts.map((part) => {
        switch (part.type) {
          case "brick":
            return <Brick key={part.id} position={part.position} rotation={part.rotation} color={part.color} size={part.size} />;
          case "motor":
            return <Motor key={part.id} position={part.position} rotation={part.rotation} color={part.color} speed={motorSpeed} />;
          case "wheel":
            return <Wheel key={part.id} position={part.position} rotation={part.rotation} color={part.color} speed={motorSpeed} />;
          case "hub":
            return <Hub key={part.id} position={part.position} rotation={part.rotation} ledColor={ledColor} />;
          case "axle":
            return <Axle key={part.id} position={part.position} rotation={part.rotation} />;
          default:
            return null;
        }
      })}

      {/* Camera and Controls */}
      <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
      <OrbitControls enableDamping dampingFactor={0.05} />
    </>
  );
};

interface LegoConstructor3DProps {
  parts: LegoPart[];
  motorSpeed?: number;
  ledColor?: string;
  onPartsChange?: (parts: LegoPart[]) => void;
}

export const LegoConstructor3D = ({ parts, motorSpeed = 0, ledColor = "#000", onPartsChange }: LegoConstructor3DProps) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border1 bg-surface1">
      <Canvas shadows>
        <Scene3D parts={parts} motorSpeed={motorSpeed} ledColor={ledColor} />
      </Canvas>
    </div>
  );
};
