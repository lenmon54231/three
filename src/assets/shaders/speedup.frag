export default `
varying vec2 vUv;
uniform float uTime;
uniform float uSpeedFactor;

void main() {
  // 条带随时间和x坐标移动
  float band = sin((vUv.x + uTime) * 10.0);
  float alpha = smoothstep(0.4, 0.5, band);

  // 彩色扰动
  float r = 0.5 + 0.5 * sin(uTime + vUv.x * 10.0);
  float g = 0.5 + 0.5 * sin(uTime + vUv.y * 10.0 + 2.0);
  float b = 0.5 + 0.5 * sin(uTime + vUv.x * 10.0 + 4.0);

  // 边缘渐隐
  float edge = smoothstep(0.02, 0.1, vUv.x) * smoothstep(0.02, 0.1, 1.0 - vUv.x)
             * smoothstep(0.01, 0.1, vUv.y) * smoothstep(0.01, 0.1, 1.0 - vUv.y);
  alpha *= edge;

  gl_FragColor = vec4(r, g, b, alpha);
}
`; 