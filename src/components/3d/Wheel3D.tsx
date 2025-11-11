import React from 'react';
import { WheelConfig } from '../../types';

interface Wheel3DProps {
  wheel: WheelConfig;
}

const Wheel3D: React.FC<Wheel3DProps> = ({ wheel }) => {
  const { position, radius } = wheel;

  return (
    <mesh position={[position.x, position.y, position.z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[radius, radius, 0.2, 16]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
    </mesh>
  );
};

export default Wheel3D;
