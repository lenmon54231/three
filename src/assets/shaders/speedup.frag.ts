const speedupFrag = `
varying vec2 vUv;
uniform float uTime;
uniform float uSpeedFactor;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

// simplexNosie.glsl
vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1. + 2. * fract(sin(p) * 43758.5453123);
}

float noise(in vec2 p) {
  const float K1 = .366025404;
  const float K2 = .211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1. - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1. + 2. * K2;
  vec3 h = max(.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.);
  vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.)), dot(b, hash(i + o)), dot(c, hash(i + 1.)));
  return dot(n, vec3(70.));
}

vec3 getColor(vec2 uv) {
  uv += vec2(9., 0.);
  float r = random(uv + vec2(12., 2.));
  float g = random(uv + vec2(7., 5.));
  float b = random(uv);
  vec3 col = vec3(r, g, b);
  return col;
}

vec3 colorNoise(vec2 uv) {
  vec2 newUV = floor(uv);
  vec2 size = vec2(1.);
  vec3 v1 = getColor((newUV + vec2(0.)) / size);
  vec3 v2 = getColor((newUV + vec2(0., 1.)) / size);
  vec3 v3 = getColor((newUV + vec2(1., 0.)) / size);
  vec3 v4 = getColor((newUV + vec2(1.)) / size);
  vec2 factor = smoothstep(0., 1., fract(uv));
  vec3 v1Tov2 = mix(v1, v2, factor.y);
  vec3 v3Tov4 = mix(v3, v4, factor.y);
  vec3 mixColor = mix(v1Tov2, v3Tov4, factor.x);
  return mixColor;
}

float snoise(vec2 v)
{
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  vec3 p = mod(vec3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0), 289.0);
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 newUV = vUv;
  newUV.x += uTime * .5;
  float alpha = snoise(newUV * vec2(3., 100.));
  alpha = map(alpha, -1., 1., 0., 1.);
  alpha = pow(clamp(alpha - .05, 0., 1.), 13.);
  alpha = smoothstep(0., .04, alpha);
  vec3 col = vec3(1.);
  col = colorNoise(newUV * vec2(10., 100.));
  col *= vec3(1.5, 1., 400.);
  alpha *= smoothstep(0.2, 0.4, vUv.x) * smoothstep(0.2, 0.4, 1. - vUv.x);
  alpha *= smoothstep(0.2, 0.4, vUv.y) * smoothstep(0.2, 0.4, 1. - vUv.y);
  alpha *= smoothstep(0., 1., uSpeedFactor) * 5.;
  gl_FragColor = vec4(col, alpha);
}
`;

export default speedupFrag;