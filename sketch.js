// **WRAPPER ADDED**
// This function ensures that the code inside only runs after the entire HTML
// page has been loaded and is ready. This prevents errors where the script
// can't find the 'bg-canvas-container' because it hasn't been created yet.
window.addEventListener('DOMContentLoaded', () => {

    // Basic three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer();
    const container = document.getElementById('bg-canvas-container');
    
    // Check if the container exists before proceeding
    if (!container) {
        console.error("Error: The container #bg-canvas-container was not found in the DOM.");
        return;
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Uniforms are variables we pass from JS to the shader
    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_mouse: { value: new THREE.Vector2() }
    };

    // A plane that fills the screen
    const geometry = new THREE.PlaneGeometry(2, 2);

    // The shader material
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 u_resolution;
        uniform float u_time;

        // 2D simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          
          float noise = snoise(uv * 3.0 + u_time * 0.1);
          
          float color = smoothstep(0.2, 0.3, noise);
          
          gl_FragColor = vec4(vec3(color), 1.0);
        }
      `
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      uniforms.u_time.value += 0.05;
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        renderer.setSize(container.clientWidth, container.clientHeight);
        uniforms.u_resolution.value.x = renderer.domElement.width;
        uniforms.u_resolution.value.y = renderer.domElement.height;
    }

}); // **END OF WRAPPER**
