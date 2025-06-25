import { animated, useSpring } from "@react-spring/three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import "./app.css";



function Cube(props) {
  // Use useRef hook to access the mesh element
  const mesh = useRef();

  // State values for hover and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  //Basic animation to rotate our cube using animation frame
  useFrame(() => (mesh.current.rotation.x += 0.01));

  //Spring animation hook that scales size based on active state
  const { scale } = useSpring({ scale: active ? 1.5 : 1 });

  // Jsx to render our 3d cube. Our cube will have height
  // width and depth equal 2 units.
  // You also need a material so that you can add color
  // and show shadows. We are using the standard
  // material <<meshStandardMaterial />

  return (
    <animated.mesh
      ref={mesh}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
      onClick={(event) => setActive(!active)}
      scale={scale}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </animated.mesh>
  );
}

function App() {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Cube />
    </Canvas>
  );
}

export default App;