import fragmentSource from '../shaders/artpop-iridescence.glsl?raw';

/** A quiet, locally rendered Radiant film surface; no external runtime. */
export function startMastheadShader(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, 'attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0,1);}');
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return;
  }
  const program = gl.createProgram();
  if (!program) return;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const time = gl.getUniformLocation(program, 'u_time');
  const resolution = gl.getUniformLocation(program, 'u_res');
  gl.uniform1f(gl.getUniformLocation(program, 'u_filmThickness'), .7);
  gl.uniform1f(gl.getUniformLocation(program, 'u_flowSpeed'), .07);
  gl.uniform2f(gl.getUniformLocation(program, 'u_center'), .5, .5);
  gl.uniform1f(gl.getUniformLocation(program, 'u_scale'), 1.8);
  gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), -1, -1);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let disposed = false;
  const draw = () => {
    gl.uniform1f(time, reducedMotion.matches ? 0 : elapsed / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const tick = (now: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden || reducedMotion.matches) return;
    if (now - previous >= 1000 / 24) {
      elapsed += Math.min(now - previous, 100);
      previous = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  };
  const refresh = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    draw();
    previous = performance.now();
    if (!reducedMotion.matches) frame = requestAnimationFrame(tick);
  };
  const resize = new ResizeObserver(() => {
    // The faint texture needs no more than 640 pixels across, even on retina screens.
    const bounds = canvas.getBoundingClientRect();
    const scale = Math.min(1, 640 / Math.max(1, bounds.width));
    canvas.width = Math.max(1, Math.round(bounds.width * scale));
    canvas.height = Math.max(1, Math.round(bounds.height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolution, canvas.width, canvas.height);
    refresh();
  });
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    refresh();
  });
  resize.observe(canvas);
  intersection.observe(canvas);
  reducedMotion.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  const dispose = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    intersection.disconnect();
    reducedMotion.removeEventListener('change', refresh);
    document.removeEventListener('visibilitychange', refresh);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };
  canvas.addEventListener('webglcontextlost', dispose, { once: true });
  document.addEventListener('astro:before-swap', dispose, { once: true });
}
