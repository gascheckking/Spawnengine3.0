// mesh-bg.js
// WebGL-baserad neon-mesh som bakgrund till SpawnEngine HUD

(function () {
  // Exponera funktionen om du vill använda den på fler ställen
  window.initMeshExplorer = function (canvasElement, options = {}) {
    const gl = canvasElement.getContext("webgl", { antialias: true });
    if (!gl) {
      console.error("WebGL not supported, falling back to basic display.");
      canvasElement.style.backgroundColor = "#101018";
      return;
    }

    const opts = { lowGPU: false, ...options };
    const NODE_COUNT = 15; // Ökat nodantal för ett tätare nät
    const ORB_COUNT = opts.lowGPU ? 150 : 350;
    const PARALLAX_STRENGTH = 0.05;
    const ORB_SPEED = opts.lowGPU ? 0.005 : 0.01;

    let width = 0;
    let height = 0;
    let mouseX = 0;
    let mouseY = 0; // Inverteras i hanteraren
    let nodes = [];
    let connections = [];
    let orbs = [];
    let program;
    let uniformLocations = {};
    let buffer = null;
    let lastTime = 0;
    let dataGenerated = false;

    // --- Shaders ---

    const vertexShaderSource = `
      attribute vec4 a_position;
      attribute vec4 a_color;
      attribute float a_size;

      uniform mat4 u_matrix;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_parallaxOffset;

      varying vec4 v_color;
      
      void main() {
        vec4 position = a_position;
        // Z-värdet används för parallax, lägre Z rör sig mindre (mock)
        float parallaxFactor = mix(u_parallaxOffset.x, u_parallaxOffset.x * 0.5, position.z);
        
        position.xy += u_parallaxOffset * (1.0 - position.z); // Använd Z för djup/parallax
        
        gl_Position = u_matrix * position;
        
        // Skala point size baserat på upplösning för konsistent utseende
        gl_PointSize = a_size * (u_resolution.y / 1000.0);
        v_color = a_color;
      }
    `;

    const fragmentShaderSource = `
      precision highp float;

      uniform float u_time;
      varying vec4 v_color;

      void main() {
        vec4 color = v_color;
        
        // Om det är en punkt (gl_PointCoord existerar), applicera glow/puls
        if (gl_FrontFacing) {
            float dist = length(gl_PointCoord - 0.5);
            float glow = 1.0 - smoothstep(0.4, 0.5, dist);
            
            // Variabel färg.w (alpha i a_color) används som pulsfrekvens
            float pulse = 0.8 + 0.2 * sin(u_time * 5.0 * v_color.w);
            color.rgb *= pulse;
            color.a *= glow; 
        }
        
        gl_FragColor = color;
      }
    `;
    
    // --- WebGL Setup ---

    function createShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function setupWebGL() {
      const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
      );

      program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking error:", gl.getProgramInfoLog(program));
        return;
      }

      gl.useProgram(program);

      // Hämta Uniforms
      uniformLocations.matrix = gl.getUniformLocation(program, "u_matrix");
      uniformLocations.time = gl.getUniformLocation(program, "u_time");
      uniformLocations.resolution = gl.getUniformLocation(
        program,
        "u_resolution"
      );
      uniformLocations.parallaxOffset = gl.getUniformLocation(
        program,
        "u_parallaxOffset"
      );

      // Globala inställningar
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending för glow-effekt
      gl.disable(gl.DEPTH_TEST);

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

      // Definiera attribut-layout
      const a_position = gl.getAttribLocation(program, "a_position");
      const a_color = gl.getAttribLocation(program, "a_color");
      const a_size = gl.getAttribLocation(program, "a_size");
      
      const elementSize = Float32Array.BYTES_PER_ELEMENT;
      const stride = (4 + 4 + 1) * elementSize; // Pos(4) + Färg(4) + Storlek(1) = 9 floats

      gl.vertexAttribPointer(a_position, 4, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(a_position);

      gl.vertexAttribPointer(
        a_color,
        4,
        gl.FLOAT,
        false, 
        stride,
        4 * elementSize // Börjar efter a_position (4 floats)
      );
      gl.enableVertexAttribArray(a_color);

      // Notera: a_size används inte av gl.LINES, men data måste ändå skickas
      gl.vertexAttribPointer(
        a_size,
        1,
        gl.FLOAT,
        false,
        stride,
        8 * elementSize // Börjar efter a_position + a_color (8 floats)
      );
      gl.enableVertexAttribArray(a_size);

      resize();
      dataGenerated = generateInitialData();
      if (!dataGenerated) {
        console.error("Failed to generate mesh data.");
      }
    }

    // --- Data / Fysik ---

    function generateInitialData() {
      const NEON_COLORS = [
        [0.0, 1.0, 1.0, 0.9], // Cyan
        [0.8, 0.2, 1.0, 0.9], // Magenta
        [0.2, 1.0, 0.6, 0.9], // Grön
      ];

      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          id: i,
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          size: 8 + Math.random() * 10,
          color: NEON_COLORS[i % NEON_COLORS.length],
          vx: 0,
          vy: 0,
          pulse: 0.0,
          targetX: Math.random() * 2 - 1,
          targetY: Math.random() * 2 - 1,
          clusterId: i % 3,
        });
      }

      // Generera connections (nu med mer slumpmässighet)
      for (let i = 0; i < NODE_COUNT * 3; i++) {
          const fromNode = nodes[Math.floor(Math.random() * NODE_COUNT)];
          const toNode = nodes[Math.floor(Math.random() * NODE_COUNT)];
          
          // Undvik själv-koppling och dubbletter (förenklat)
          if (fromNode.id !== toNode.id && Math.random() < 0.6) {
              connections.push({
                  from: fromNode,
                  to: toNode,
                  color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
                  strength: 0.1 + Math.random() * 0.5,
                  activeTime: 0,
                  duration: 500,
                  id: i,
              });
          }
      }
      
      // Partiklar (Orbs)
      if (connections.length === 0) return false; // Säkerhetskontroll

      for (let i = 0; i < ORB_COUNT; i++) {
        const conn = connections[Math.floor(Math.random() * connections.length)];
        orbs.push({
          connection: conn,
          progress: Math.random(),
          size: 1 + Math.random() * 3,
          color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
          speed: ORB_SPEED * (0.5 + Math.random()),
        });
      }
      return true;
    }

    function updatePhysics(deltaTime) {
      const timeFactor = deltaTime / 1000.0;
      const gravityStrength = 0.005;

      nodes.forEach((node) => {
        // Uppdatera målposition slumpmässigt
        if (Math.random() < 0.0005 * timeFactor * 1000) {
          node.targetX = Math.random() * 2 - 1;
          node.targetY = Math.random() * 2 - 1;
        }

        // Dragningskraft mot mål
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        node.vx += dx * 0.01 * timeFactor;
        node.vy += dy * 0.01 * timeFactor;

        // Klustergravitation/repulsion
        nodes.forEach((other) => {
          if (node.id !== other.id && node.clusterId === other.clusterId) {
            const distSq =
              (node.x - other.x) ** 2 + (node.y - other.y) ** 2;
            
            // Mindre repellerar, större attraherar
            if (distSq < 0.1) {
              node.vx -= (other.x - node.x) * 0.005 * timeFactor;
              node.vy -= (other.y - node.y) * 0.005 * timeFactor;
            } else {
              node.vx += (other.x - node.x) * gravityStrength * timeFactor;
              node.vy += (other.y - node.y) * gravityStrength * timeFactor;
            }
          }
        });

        // Friktion
        node.vx *= 0.99;
        node.vy *= 0.99;
        
        // Uppdatera position
        node.x += node.vx * timeFactor * 0.5;
        node.y += node.vy * timeFactor * 0.5;

        // Håll inom bounds
        node.x = Math.max(-1.0, Math.min(1.0, node.x));
        node.y = Math.max(-1.0, Math.min(1.0, node.y));
        
        // Pulsera ut
        node.pulse = Math.max(0.0, node.pulse - timeFactor * 0.5);
      });

      // Partikelrörelse
      orbs.forEach((orb) => {
        orb.progress += orb.speed * timeFactor;
        if (orb.progress >= 1.0) {
          orb.progress = 0.0;
          orb.connection.activeTime = 1.0; // Aktivera linjepuls
          orb.connection.to.pulse = 1.0; // Aktivera nodpuls
        }
      });

      // Linjestyrka/pulstid
      connections.forEach((conn) => {
        conn.strength = Math.max(0.1, conn.strength * 0.995);
        conn.activeTime = Math.max(0, conn.activeTime - timeFactor * 0.8);
      });

      // Slumpmässig nodpuls/linjeaktivering
      if (Math.random() < 0.005) {
        const node = nodes[Math.floor(Math.random() * NODE_COUNT)];
        node.pulse = 1.0;
        connections
          .filter((c) => c.from.id === node.id || c.to.id === node.id)
          .forEach((c) => (c.activeTime = 1.0));
      }
    }

    // --- Rendering ---

    function fillBuffer() {
      // Dataformat: x, y, z, w, r, g, b, a, size (9 floats per vertex)
      const vertexData = [];
      const Z_NODE = 0.5; // Framför linjer
      const Z_ORB = 1.0;  // Framför noder
      const Z_LINE = 0.0; // Längst bak

      // 1. Linjer (gl.LINES)
      connections.forEach((conn) => {
        const color = conn.color;
        const pulseBoost = conn.activeTime * 0.5;
        const alpha = conn.strength + pulseBoost;

        // Startpunkt
        vertexData.push(conn.from.x, conn.from.y, Z_LINE, 1.0);
        vertexData.push(color[0], color[1], color[2], alpha);
        vertexData.push(conn.strength * 20.0); // Storlek (används ej för linjer)

        // Slutpunkt
        vertexData.push(conn.to.x, conn.to.y, Z_LINE, 1.0);
        vertexData.push(color[0], color[1], color[2], alpha);
        vertexData.push(conn.strength * 20.0); // Storlek (används ej för linjer)
      });

      const lineVertices = vertexData.length / 9;

      // 2. Noder (gl.POINTS)
      nodes.forEach((node) => {
        const pulseSize = node.pulse * 20;
        const pulseAlpha = node.pulse * 0.3;

        vertexData.push(node.x, node.y, Z_NODE, 1.0);
        vertexData.push(
          node.color[0],
          node.color[1],
          node.color[2],
          node.color[3] + pulseAlpha // Ökad alpha vid puls
        );
        vertexData.push(node.size + pulseSize);
      });

      const nodeVertices = (vertexData.length / 9) - lineVertices;

      // 3. Orbs (gl.POINTS)
      orbs.forEach((orb) => {
        const start = orb.connection.from;
        const end = orb.connection.to;
        const progress = orb.progress;
        const x = start.x + (end.x - start.x) * progress;
        const y = start.y + (end.y - start.y) * progress;

        vertexData.push(x, y, Z_ORB, 1.0);
        vertexData.push(orb.color[0], orb.color[1], orb.color[2], 1.0);
        vertexData.push(orb.size);
      });

      const totalVertices = vertexData.length / 9;
      const orbVertices = totalVertices - (lineVertices + nodeVertices);


      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertexData),
        gl.DYNAMIC_DRAW
      );
      return {
        totalVertices,
        lineVertices,
        nodeVertices,
        orbVertices,
      };
    }

    function draw(time, vertexCounts) {
      gl.viewport(0, 0, width, height);
      gl.clearColor(0.03, 0.03, 0.05, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.uniform1f(uniformLocations.time, time / 1000);
      gl.uniform2f(uniformLocations.resolution, width, height);
      gl.uniform2f(
        uniformLocations.parallaxOffset,
        mouseX * PARALLAX_STRENGTH,
        mouseY * PARALLAX_STRENGTH
      );

      // Enkel identitetsmatris
      const matrix = [
        1, 0, 0, 0, //
        0, 1, 0, 0, //
        0, 0, 1, 0, //
        0, 0, 0, 1,
      ];
      gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix);

      // --- RITA LINJER (Connections) ---
      const linesToDraw = vertexCounts.lineVertices;
      if (linesToDraw > 0) {
        gl.lineWidth(2.0); // Sätter tjocklek (begränsad av WebGL standarder)
        gl.drawArrays(gl.LINES, 0, linesToDraw);
      }

      // --- RITA PUNKTER (Noder och Orbs) ---
      const pointsStart = linesToDraw;
      const pointsToDraw = vertexCounts.nodeVertices + vertexCounts.orbVertices;

      if (pointsToDraw > 0) {
        gl.drawArrays(gl.POINTS, pointsStart, pointsToDraw);
      }
    }

    // --- Händelsehanterare ---

    function resize() {
      width = canvasElement.clientWidth;
      height = canvasElement.clientHeight;
      canvasElement.width = width;
      canvasElement.height = height;
      gl.viewport(0, 0, width, height);
    }

    function handlePointerMove(event) {
      event.preventDefault();
      const clientX =
        event.clientX !== undefined
          ? event.clientX
          : event.touches && event.touches[0]
          ? event.touches[0].clientX
          : 0;
      const clientY =
        event.clientY !== undefined
          ? event.clientY
          : event.touches && event.touches[0]
          ? event.touches[0].clientY
          : 0;

      // Normalisera till [-1, 1]
      mouseX = (clientX / width) * 2 - 1;
      
      // Invertera Y för parallax. Om musen går upp (högre clientY), vill vi
      // att scenen ska glida ner (negativ Y-förskjutning) för att simulera djup.
      mouseY = -((clientY / height) * 2 - 1); 
    }

    function animate(time) {
      const deltaTime = time - lastTime;
      lastTime = time;

      if (dataGenerated) {
        updatePhysics(deltaTime);
        const vertexCounts = fillBuffer();
        draw(time, vertexCounts);
      }

      requestAnimationFrame(animate);
    }

    // --- Init ---

    function init() {
      setupWebGL();
      window.addEventListener("resize", resize);
      canvasElement.addEventListener("mousemove", handlePointerMove);
      canvasElement.addEventListener("touchmove", handlePointerMove, {
        passive: false,
      });
      requestAnimationFrame(animate);
    }

    init();

    return {
      cleanup: () => {
        window.removeEventListener("resize", resize);
        canvasElement.removeEventListener("mousemove", handlePointerMove);
        canvasElement.removeEventListener("touchmove", handlePointerMove);
        gl.deleteProgram(program);
        gl.deleteBuffer(buffer);
      },
      // Exponera Mesh-data (valfritt)
      getNodes: () => nodes
    };
  };

  // Auto-init när sidan är klar
  window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("mesh-canvas");
    if (!canvas) return;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    // Skapa en global referens till cleanup för enklare hantering om du vill byta bakgrund
    window.meshExplorerInstance = window.initMeshExplorer(canvas, { lowGPU: isMobile });
  });
})();
