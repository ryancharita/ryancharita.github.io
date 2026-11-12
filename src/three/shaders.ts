// 3D simplex noise by Ian McEwan / Ashima Arts (MIT).
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

export const coreVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
${noise}

float displace(vec3 p){
  float n = snoise(p * uFreq + vec3(0.0, uTime * 0.18, uTime * 0.12));
  n += 0.5 * snoise(p * uFreq * 2.1 - uTime * 0.25);
  return n * uAmp;
}

void main(){
  vec3 p = position;
  float d = displace(normalize(p));
  vec3 displaced = p + normal * d;

  // Recompute the normal from two nearby displaced points on the tangent plane.
  vec3 t = normalize(cross(normal, vec3(0.0, 1.0, 0.0001)));
  vec3 b = normalize(cross(normal, t));
  float e = 0.01;
  vec3 pt = p + t * e; pt += normalize(pt) * displace(normalize(pt));
  vec3 pb = p + b * e; pb += normalize(pb) * displace(normalize(pb));
  vec3 n = normalize(cross(pt - displaced, pb - displaced));

  vDisp = d;
  vNormal = normalize(normalMatrix * n);
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const coreFragment = /* glsl */ `
uniform vec3 uAccent;
uniform vec3 uBase;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;

void main(){
  vec3 n = normalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  float fres = pow(1.0 - max(dot(n, vView), 0.0), 2.4);

  // Soft key light from the upper left.
  float key = max(dot(n, normalize(vec3(-0.6, 0.8, 0.6))), 0.0);

  // Thin-film style shift on the rim: mint into a cool cyan-violet.
  vec3 film = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + fres * 0.9 + vDisp * 1.5 + uTime * 0.03));
  vec3 rim = mix(uAccent, film * vec3(0.55, 0.95, 1.0), 0.35);

  vec3 col = uBase + uBase * key * 2.2;
  col += rim * fres * 1.25;
  col += uAccent * smoothstep(0.12, 0.35, vDisp) * 0.35;

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
attribute float aScale;
attribute float aSeed;
varying float vAlpha;

void main(){
  vec3 p = position;
  p.y += sin(uTime * 0.3 + aSeed * 6.2831) * 0.08;
  p.x += cos(uTime * 0.2 + aSeed * 12.0) * 0.06;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z);
  vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 0.8 + aSeed * 40.0));
}
`;

export const particleFragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, a * vAlpha);
}
`;
