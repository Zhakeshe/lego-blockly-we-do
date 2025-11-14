import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

export interface LegoPart {
  id: string;
  type: "brick" | "motor" | "wheel" | "axle" | "hub";
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  size?: [number, number, number];
}

interface LegoConstructor3DProps {
  parts: LegoPart[];
  motorSpeed: number;
  ledColor: string;
  onPartsChange?: (parts: LegoPart[]) => void;
}

// LEGO кірпіш компоненті
const Brick = ({ part }: { part: LegoPart }) => {
  const size = part.size || [1.5, 1, 1.5];

  return (
    <group position={part.position} rotation={part.rotation}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={part.color} />
      </mesh>
      {/* LEGO studs (кішкентай дөңгелектер үстінде) */}
      {Array.from({ length: Math.floor(size[0]) }).map((_, i) =>
        Array.from({ length: Math.floor(size[2]) }).map((_, j) => (
          <mesh
            key={`${i}-${j}`}
            position={[
              (i - Math.floor(size[0]) / 2 + 0.5) * 0.8,
              size[1] / 2 + 0.1,
              (j - Math.floor(size[2]) / 2 + 0.5) * 0.8,
            ]}
          >
            <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
            <meshStandardMaterial color={part.color} />
          </mesh>
        ))
      )}
    </group>
  );
};

// Мотор компоненті
const Motor = ({ part, speed }: { part: LegoPart; speed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && speed !== 0) {
      meshRef.current.rotation.z += speed * 0.01;
    }
  });

  return (
    <group position={part.position} rotation={part.rotation}>
      <mesh>
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial color={part.color} />
      </mesh>
      {/* Айналмалы бөлік */}
      <mesh ref={meshRef} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Мотор порты */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </group>
  );
};

// Дөңгелек компоненті
const Wheel = ({ part, speed }: { part: LegoPart; speed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && speed !== 0) {
      meshRef.current.rotation.x += speed * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={part.position} rotation={part.rotation}>
      <cylinderGeometry args={[0.7, 0.7, 0.4, 32]} />
      <meshStandardMaterial color={part.color} />
      {/* Дөңгелек ортасындағы тесік */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </mesh>
  );
};

// Осьтер компоненті
const Axle = ({ part }: { part: LegoPart }) => {
  return (
    <mesh position={part.position} rotation={part.rotation}>
      <cylinderGeometry args={[0.15, 0.15, 1.6, 16]} />
      <meshStandardMaterial color={part.color} />
    </mesh>
  );
};

// Hub (басқару блогы) компоненті
const Hub = ({ part, ledColor }: { part: LegoPart; ledColor: string }) => {
  return (
    <group position={part.position} rotation={part.rotation}>
      <mesh>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color={part.color} />
      </mesh>
      {/* LED индикаторы */}
      <mesh position={[0, 0.76, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={ledColor !== "#000" ? 0.8 : 0}
        />
      </mesh>
      {/* Портар */}
      <mesh position={[-0.6, -0.6, 0.8]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.6, -0.6, 0.8]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};

// Негізгі сахна
const Scene = ({ parts, motorSpeed, ledColor }: Omit<LegoConstructor3DProps, "onPartsChange">) => {
  return (
    <>
      {/* Жарық көздері */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.4} />

      {/* Еден (grid) */}
      <gridHelper args={[20, 20, "#999", "#666"]} />

      {/* LEGO бөлшектері */}
      {parts.map((part) => {
        switch (part.type) {
          case "brick":
            return <Brick key={part.id} part={part} />;
          case "motor":
            return <Motor key={part.id} part={part} speed={motorSpeed} />;
          case "wheel":
            return <Wheel key={part.id} part={part} speed={motorSpeed} />;
          case "axle":
            return <Axle key={part.id} part={part} />;
          case "hub":
            return <Hub key={part.id} part={part} ledColor={ledColor} />;
          default:
            return null;
        }
      })}

      {/* Камера және басқару */}
      <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={30}
      />
    </>
  );
};

export const LegoConstructor3D = ({ parts, motorSpeed, ledColor, onPartsChange }: LegoConstructor3DProps) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-sky-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Canvas shadows>
        <Scene parts={parts} motorSpeed={motorSpeed} ledColor={ledColor} />
      </Canvas>
    </div>
  );
};
