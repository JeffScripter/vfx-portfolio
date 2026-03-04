window.addEventListener("DOMContentLoaded", () => {

const container = document.getElementById("bg-canvas-container");
if (!container) return;

/* -----------------------------
   THREE SETUP
----------------------------- */

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(
  -1, 1, 1, -1, 0, 1
);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

/* -----------------------------
   UNIFORMS
----------------------------- */

const uniforms = {
  u_time: { value: 0 },
  u_resolution: {
    value: new THREE.Vector2(
      renderer.domElement.width,
      renderer.domElement.height
    )
  }
};

/* -----------------------------
   FULLSCREEN PLANE
----------------------------- */

const geometry = new THREE.PlaneGeometry(2, 2);

/* -----------------------------
   SHADER MATERIAL
----------------------------- */

const material = new THREE.ShaderMaterial({

uniforms,

vertexShader: `
void main(){
  gl_Position = vec4(position,1.0);
}
`,

fragmentShader: `

uniform vec2 u_resolution;
uniform float u_time;


/* ===== SIMPLEX NOISE ===== */

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}

float snoise(vec2 v){
const vec4 C=vec4(
0.211324865405187,
0.366025403784439,
-0.577350269189626,
0.024390243902439);

vec2 i=floor(v+dot(v,C.yy));
vec2 x0=v-i+dot(i,C.xx);

vec2 i1=(x0.x>x0.y)?
vec2(1.0,0.0):vec2(0.0,1.0);

vec4 x12=x0.xyxy+C.xxzz;
x12.xy-=i1;

i=mod289(i);
vec3 p=permute(
permute(i.y+vec3(0.0,i1.y,1.0))
+i.x+vec3(0.0,i1.x,1.0));

vec3 m=max(
0.5-vec3(
dot(x0,x0),
dot(x12.xy,x12.xy),
dot(x12.zw,x12.zw)),0.0);

m=m*m;
m=m*m;

vec3 x=2.0*fract(p*C.www)-1.0;
vec3 h=abs(x)-0.5;
vec3 ox=floor(x+0.5);
vec3 a0=x-ox;

m*=1.79284291400159-
0.85373472095314*
(a0*a0+h*h);

vec3 g;
g.x=a0.x*x0.x+h.x*x0.y;
g.yz=a0.yz*x12.xz+h.yz*x12.yw;

return 130.0*dot(m,g);
}

/* ===== METAL FLUID ===== */

void main(){

vec2 uv = gl_FragCoord.xy / u_resolution.xy;
uv -= 0.5;
uv.x *= u_resolution.x/u_resolution.y;

/* layered flowing noise */
float n = snoise(uv*3.0 + u_time*0.15);
n += snoise(uv*6.0 - u_time*0.1)*0.5;
n += snoise(uv*12.0 + u_time*0.05)*0.25;

n = n*0.5 + 0.5;

/* fluid mask */
float fluid = smoothstep(0.45,0.6,n);

/* fake lighting */
float highlight =
smoothstep(0.55,0.8,n) -
smoothstep(0.8,1.0,n);

/* chrome shading */
vec3 metal =
vec3(0.05) +
vec3(0.8)*highlight +
vec3(0.3)*fluid;

/* black background */
vec3 color = mix(vec3(0.0), metal, fluid);

gl_FragColor = vec4(color,1.0);
}
`
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

/* -----------------------------
   ANIMATION
----------------------------- */

function animate(){
  requestAnimationFrame(animate);
  uniforms.u_time.value += 0.01;
  renderer.render(scene,camera);
}

animate();

/* -----------------------------
   RESIZE
----------------------------- */

window.addEventListener("resize", () => {

renderer.setSize(
container.clientWidth,
container.clientHeight
);

uniforms.u_resolution.value.set(
renderer.domElement.width,
renderer.domElement.height
);

});

});
