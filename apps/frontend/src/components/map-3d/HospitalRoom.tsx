'use client';

import { Text } from '@react-three/drei';

interface HospitalRoomProps {
  position: [number, number, number];
  size: [number, number, number];
  name: string;
  color?: string;
  isDestination?: boolean;
}

export function HospitalRoom({ position, size, name, color = '#e0e7ff', isDestination = false }: HospitalRoomProps) {
  return (
    <group position={position}>
      {/* Room Box */}
      <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={isDestination ? '#818cf8' : color} 
          transparent 
          opacity={0.8} 
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      
      {/* Label */}
      <Text
        position={[0, size[1] + 0.5, 0]}
        fontSize={0.8}
        color={isDestination ? '#4338ca' : '#3730a3'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#ffffff"
      >
        {name}
      </Text>
    </group>
  );
}
