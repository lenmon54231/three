import React, { useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import texturePath from '@/assets/texture/light_rock/light_rock.jpg'
import BackButton from '@/components/BackButton/BackButton'

import frag from './ripple.frag.ts'
// import frag from './origin_ripple.ts'

import vert from './ripple.vert.ts'

const RipplePlane: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const texture = useLoader(THREE.TextureLoader, texturePath)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh ref={meshRef} scale={[10, 10, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vert}
        fragmentShader={frag}
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uTexture: { value: texture },
        }}
      />
    </mesh>
  )
}

const TestPage: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#fff' }}>
      <BackButton />
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <RipplePlane />
      </Canvas>
    </div>
  )
}

export default TestPage
