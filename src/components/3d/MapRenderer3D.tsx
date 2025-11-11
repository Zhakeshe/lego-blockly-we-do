import React from 'react';
import { useBox } from '@react-three/cannon';
import { Map } from '../../types';

interface MapRenderer3DProps {
  map: Map;
}

const MapRenderer3D: React.FC<MapRenderer3DProps> = ({ map }) => {
  const { terrain, obstacles } = map;

  // Ground plane
  const [groundRef] = useBox(() => ({
    type: 'Static',
    position: [0, -0.5, 0],
    args: [terrain.width, 1, terrain.depth],
  }));

  return (
    <group>
      {/* Terrain/Ground */}
      <mesh ref={groundRef} receiveShadow>
        <boxGeometry args={[terrain.width, 1, terrain.depth]} />
        <meshStandardMaterial color="#4ade80" roughness={0.8} />
      </mesh>

      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}
    </group>
  );
};

const Obstacle: React.FC<{ obstacle: any }> = ({ obstacle }) => {
  const { position, scale, rotation, color, type, physics } = obstacle;

  const [ref] = useBox(() => ({
    type: physics.mass > 0 ? 'Dynamic' : 'Static',
    mass: physics.mass,
    position: [position.x, position.y, position.z],
    rotation: [rotation.x, rotation.y, rotation.z],
    args: [scale.x, scale.y, scale.z],
    material: {
      friction: physics.friction,
      restitution: physics.restitution,
    },
  }));

  const getGeometry = () => {
    switch (type) {
      case 'box':
        return <boxGeometry args={[scale.x, scale.y, scale.z]} />;
      case 'cylinder':
        return <cylinderGeometry args={[scale.x / 2, scale.x / 2, scale.y, 16]} />;
      case 'sphere':
        return <sphereGeometry args={[scale.x / 2, 16, 16]} />;
      default:
        return <boxGeometry args={[scale.x, scale.y, scale.z]} />;
    }
  };

  return (
    <mesh ref={ref} castShadow receiveShadow>
      {getGeometry()}
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default MapRenderer3D;
