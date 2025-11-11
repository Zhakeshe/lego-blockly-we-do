import React from 'react';
import { MotorConfig } from '../../types';

interface Motor3DProps {
  motor: MotorConfig;
}

const Motor3D: React.FC<Motor3DProps> = ({ motor }) => {
  const { position } = motor;

  return (
    <mesh position={[position.x, position.y, position.z]} castShadow>
      <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
      <meshStandardMaterial color="#ff6b00" metalness={0.5} roughness={0.5} />
    </mesh>
  );
};

export default Motor3D;
