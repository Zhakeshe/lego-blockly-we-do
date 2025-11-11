import React from 'react';
import { SensorConfig } from '../../types';

interface Sensor3DProps {
  sensor: SensorConfig;
}

const Sensor3D: React.FC<Sensor3DProps> = ({ sensor }) => {
  const { position, type } = sensor;

  const getColor = () => {
    switch (type) {
      case 'distance':
        return '#00ff00';
      case 'tilt':
        return '#0000ff';
      case 'motion':
        return '#ff00ff';
      default:
        return '#ffffff';
    }
  };

  return (
    <mesh position={[position.x, position.y, position.z]} castShadow>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color={getColor()} emissive={getColor()} emissiveIntensity={0.3} />
    </mesh>
  );
};

export default Sensor3D;
