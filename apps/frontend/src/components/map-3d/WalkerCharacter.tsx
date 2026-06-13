'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

interface WalkerCharacterProps {
  waypoints: Vector3[];
  speed?: number;
  onReachDestination?: () => void;
}

export function WalkerCharacter({ waypoints, speed = 2, onReachDestination }: WalkerCharacterProps) {
  const group = useRef<Group>(null);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  
  useFrame((state, delta) => {
    if (!group.current || currentWaypointIndex >= waypoints.length) return;

    const target = waypoints[currentWaypointIndex];
    const currentPos = group.current.position;
    
    // Distance to target
    const distance = currentPos.distanceTo(target);
    
    if (distance < 0.1) {
      if (currentWaypointIndex === waypoints.length - 1) {
        onReachDestination?.();
      } else {
        setCurrentWaypointIndex(prev => prev + 1);
      }
    } else {
      // Move towards target
      const direction = target.clone().sub(currentPos).normalize();
      currentPos.add(direction.multiplyScalar(speed * delta));
      
      // Walking animation (bobbing)
      const time = state.clock.getElapsedTime();
      const bobbing = Math.sin(time * 10) * 0.1;
      group.current.position.y = 1 + bobbing; // Base height 1 + bobbing
      
      // Look at target
      group.current.lookAt(target.x, group.current.position.y, target.z);
    }
  });

  return (
    <group ref={group} position={waypoints[0] || [0, 1, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.4, 1, 4, 8]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#c7d2fe" />
      </mesh>
    </group>
  );
}
