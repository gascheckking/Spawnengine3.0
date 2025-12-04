// Full WebGL Mesh Explorer used as animated background.
// IMPORTANT: we do NOT call it automatically here;
// app.js anropar window.initMeshExplorer(canvas, {lowGPU: ...})

window.initMeshExplorer = function (canvasElement, options = {}) {
  const gl = canvasElement.getContext("webgl", { antialias: true });
  if (!gl) {
    console.error("WebGL not supported, falling back to basic display.");
    canvasElement.style.backgroundColor = "#101018";
    return;
  }

  const opts = { lowGPU: false, ...options };
  const NODE_COUNT = 10;
  const ORB_COUNT = opts.lowGPU ? 150 : 350;
  const PARALLAX_STRENGTH = 0.05;
  const ORB_SPEED = opts.lowGPU ? 0.005 : 0.01;

  let width = 0;
  let height = 0;
  let mouseX = 0;
  let mouseY = 0;
  let nodes = [];
  let connections = [];
  let orbs = [];
  let program;
  let uniformLocations = {};
  let buffer = null;
  let lastTime = 0;
  let dataGenerated = false;

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
      position.xy += u_parallaxOffset;
      
      gl_Position = u_matrix * position;
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
      float dist = length(gl_PointCoord - 0.5);
      float glow = 1.0 - smoothstep(0.4, 0.5, dist);
      float pulse = 0.8 + 0.2 * sin(u_time * 5.0 * v_color.w);
      color.rgb *= pulse;
      color.a *= glow;
      gl_FragColor = color;
    }
  `;

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
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    uniformLocations.matrix = gl.getUniformLocation(program, "u_matrix");
    uniformLocations.time = gl.getUniformLocation(program, "u_time");
    uniformLocations.resolution = gl.getUniformLocation(program, "u_resolution");
    uniformLocations.parallaxOffset = gl.getUniformLocation(
      program,
      "u_parallaxOffset"
    );

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const a_position = gl.getAttribLocation(program, "a_position");
    const a_color = gl.getAttribLocation(program, "a_color");
    const a_size = gl.getAttribLocation(program, "a_size");
    const stride = 9 * Float32Array.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(a_position, 4, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(a_position);

    gl.vertexAttribPointer(
      a_color,
      4,
      gl.FLOAT,
      false,
      stride,
      4 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(a_color);

    gl.vertexAttribPointer(
      a_size,
      1,
      gl.FLOAT,
      false,
      stride,
      8 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(a_size);

    resize();
    dataGenerated = generateInitialData();
    if (!dataGenerated) {
      console.error("Failed to generate mesh data.");
    }
  }

  function generateInitialData() {
    const NEON_COLORS = [
      [0.0, 1.0, 1.0, 0.9],
      [0.8, 0.2, 1.0, 0.9],
      [0.2, 1.0, 0.6, 0.9],
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

    for (let i = 0; i < NODE_COUNT * 2; i++) {
      const fromNode = nodes[Math.floor(Math.random() * NODE_COUNT)];
      const toNode = nodes[Math.floor(Math.random() * NODE_COUNT)];
      if (fromNode.id !== toNode.id) {
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
      if (Math.random() < 0.0005) {
        node.targetX = Math.random() * 2 - 1;
        node.targetY = Math.random() * 2 - 1;
      }

      const dx = node.targetX - node.x;
      const dy = node.targetY - node.y;
      node.vx += dx * 0.01 * timeFactor;
      node.vy += dy * 0.01 * timeFactor;

      nodes.forEach((other) => {
        if (node.id !== other.id && node.clusterId === other.clusterId) {
          const distSq = (node.x - other.x) ** 2 + (node.y - other.y) ** 2;
          if (distSq < 0.1) {
            node.vx -= (other.x - node.x) * 0.005 * timeFactor;
            node.vy -= (other.y - node.y) * 0.005 * timeFactor;
          } else {
            node.vx += (other.x - node.x) * gravityStrength * timeFactor;
            node.vy += (other.y - node.y) * gravityStrength * timeFactor;
          }
        }
      });

      node.vx *= 0.99;
      node.vy *= 0.99;
      node.x += node.vx * timeFactor * 0.5;
      node.y += node.vy * timeFactor * 0.5;

      node.x = Math.max(-1.0, Math.min(1.0, node.x));
      node.y = Math.max(-1.0, Math.min(1.0, node.y));
      node.pulse *= 0.9;
    });

    orbs.forEach((orb) => {
      orb.progress += orb.speed * timeFactor;
      if (orb.progress >= 1.0) {
        orb.progress = 0.0;
        orb.connection.activeTime = 1;
        orb.connection.to.pulse = 1.0;
      }
    });

    connections.forEach((conn) => {
      conn.strength = Math.max(0.1, conn.strength * 0.99);
      conn.activeTime = Math.max(0, conn.activeTime - timeFactor * 0.005);
    });

    if (Math.random() < 0.005) {
      const node = nodes[Math.floor(Math.random() * NODE_COUNT)];
      node.pulse = 1.0;
      connections
        .filter((c) => c.from.id === node.id || c.to.id === node.id)
        .forEach((c) => (c.activeTime = 1));
    }
  }

  function fillBuffer() {
    const vertexData = [];
    const Z_NODE = 0.0;
    const Z_ORB = 0.5;
    const Z_LINE = -0.5;

    connections.forEach((conn) => {
      const color = conn.color;
      const pulseBoost = conn.activeTime * 0.5;
      const alpha = conn.strength + pulseBoost;

      vertexData.push(conn.from.x, conn.from.y, Z_LINE, 1.0);
      vertexData.push(color[0], color[1], color[2], alpha);
      vertexData.push(conn.strength * 20.0);

      vertexData.push(conn.to.x, conn.to.y, Z_LINE, 1.0);
      vertexData.push(color[0], color[1], color[2], alpha);
      vertexData.push(conn.strength * 20.0);
    });

    const lineCount = vertexData.length / 9;

    nodes.forEach((node) => {
      const pulseSize = node.pulse * 20;
      const pulseAlpha = node.pulse * 0.3;

      vertexData.push(node.x, node.y, Z_NODE, 1.0);
      vertexData.push(
        node.color[0],
        node.color[1],
        node.color[2],
        node.color[3] + pulseAlpha
      );
      vertexData.push(node.size + pulseSize);
    });

    const nodeCount = vertexData.length / 9 - lineCount;

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

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.DYNAMIC_DRAW);
    return {
      totalVertices: vertexData.length / 9,
      lineVertices: lineCount,
      nodeVertices: nodeCount,
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

    const matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix);

    const linesToDraw = vertexCounts.lineVertices;
    if (linesToDraw > 0) {
      gl.lineWidth(2.0);
      gl.drawArrays(gl.LINES, 0, linesToDraw);
    }

    const pointsStart = linesToDraw;
    const pointsToDraw =
      vertexCounts.nodeVertices +
      (vertexCounts.totalVertices - (linesToDraw + vertexCounts.nodeVertices));
    if (pointsToDraw > 0) {
      gl.drawArrays(gl.POINTS, pointsStart, pointsToDraw);
    }
  }

  function resize() {
    const rect = canvasElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvasElement.width = width;
    canvasElement.height = height;
    gl.viewport(0, 0, width, height);
  }

  function handlePointerMove(event) {
    event.preventDefault();
    const clientX =
      event.clientX !== undefined ? event.clientX : event.touches[0].clientX;
    const clientY =
      event.clientY !== undefined ? event.clientY : event.touches[0].clientY;

    mouseX = (clientX / width) * 2 - 1;
    mouseY = (clientY / height) * 2 - 1;
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

  function init() {
    setupWebGL();
    window.addEventListener("resize", resize);
    canvasElement.addEventListener("mousemove", handlePointerMove);
    canvasElement.addEventListener("touchmove", handlePointerMove);
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
  };
};