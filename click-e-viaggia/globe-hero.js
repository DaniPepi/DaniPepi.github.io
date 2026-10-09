/* Local WebGL globe. Natural Earth silhouettes, satin metal and quiet travel arcs. */
(() => {
  'use strict';
  const canvas = document.getElementById('metal-globe');
  const hero = canvas?.closest('.hero');
  const stage = canvas?.closest('.globe-stage');
  if (!canvas || !hero || !stage || !document.body.classList.contains('globe-home')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let gl, sphereProgram, routeProgram, quadBuffer, routeBuffer, markerBuffer, texture;
  let raf = 0, previous = 0, phase = 0, frames = 0;
  let ready = false, contextLost = false, inView = true, leaving = false, disposed = false;
  let targetX = 0, targetY = 0, easedX = 0, easedY = 0, dpr = 1;
  const routes = [];
  const listeners = [];
  const vector = ([lat, lon]) => {
    const p = lat * Math.PI / 180, l = lon * Math.PI / 180;
    return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
  };
  const origin = vector([41.9, 12.5]);
  const destinations = [[39.6, -8.66], [48.85, 2.35], [-13.3, 48.2], [25.1, 34.8]].map(vector);
  const endpoints = [origin, ...destinations];
  function listen(target, event, callback, options) {
    target.addEventListener(event, callback, options);
    listeners.push(() => target.removeEventListener(event, callback, options));
  }
  function fallback() {
    ready = false;
    cancelAnimationFrame(raf); raf = 0;
    stage.classList.remove('is-ready');
    stage.classList.add('is-fallback');
    canvas.dataset.renderer = 'fallback';
    canvas.dataset.motion = 'static';
  }
  function shader(type, source) {
    const item = gl.createShader(type);
    gl.shaderSource(item, source); gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) { gl.deleteShader(item); throw new Error('Globe shader unavailable'); }
    return item;
  }
  function program(vertex, fragment) {
    const item = gl.createProgram(), a = shader(gl.VERTEX_SHADER, vertex), b = shader(gl.FRAGMENT_SHADER, fragment);
    gl.attachShader(item, a); gl.attachShader(item, b); gl.linkProgram(item);
    gl.deleteShader(a); gl.deleteShader(b);
    if (!gl.getProgramParameter(item, gl.LINK_STATUS)) { gl.deleteProgram(item); throw new Error('Globe renderer unavailable'); }
    return item;
  }
  function uniforms(item, names) { return Object.fromEntries(names.map(name => [name, gl.getUniformLocation(item, name)])); }
  function matrix(yaw, pitch) {
    const a = Math.cos(yaw), b = Math.sin(yaw), c = Math.cos(pitch), d = Math.sin(pitch);
    return new Float32Array([a, d * b, -c * b, 0, c, d, b, -d * a, c * a]);
  }
  function interpolate(destination, t, lift = true) {
    const angle = Math.acos(Math.max(-1, Math.min(1, origin.reduce((s, n, i) => s + n * destination[i], 0))));
    const denominator = Math.sin(angle) || 1;
    const a = Math.sin((1 - t) * angle) / denominator, b = Math.sin(t * angle) / denominator;
    const radius = 1.012 + (lift ? Math.sin(t * Math.PI) * .07 : 0);
    return origin.map((n, i) => (n * a + destination[i] * b) * radius);
  }
  function landTexture(data) {
    const map = document.createElement('canvas'); map.width = 2048; map.height = 1024;
    const ctx = map.getContext('2d');
    if (!ctx || !Array.isArray(data.polygons)) throw new Error('Globe geography unavailable');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, map.width, map.height);
    ctx.fillStyle = '#fff';
    data.polygons.forEach(polygon => {
      if (!Array.isArray(polygon)) return;
      const rings = polygon.map(ring => {
        let last = null;
        return ring.map(([lon, lat]) => {
          let x = (lon + 180) / 360 * map.width;
          if (last !== null) {
            while (x - last > map.width / 2) x -= map.width;
            while (x - last < -map.width / 2) x += map.width;
          }
          last = x;
          return [x, (90 - lat) / 180 * map.height];
        });
      });
      [-map.width, 0, map.width].forEach(offset => {
        ctx.beginPath();
        rings.forEach(ring => { ring.forEach(([x, y], i) => i ? ctx.lineTo(x + offset, y) : ctx.moveTo(x + offset, y)); ctx.closePath(); });
        ctx.fill('evenodd');
      });
    });
    const item = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, item);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, map);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return item;
  }
  const sphereVertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position;gl_Position=vec4(position,0.,1.);}`;
  const sphereFragment = `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D land;
    uniform mat3 orientation;
    uniform float pixel;
    const float PI=3.14159265359;
    void main(){
      vec2 p=uv/.84;
      float rr=dot(p,p);
      float radius=sqrt(rr);
      if(radius>1.045)discard;
      if(rr>1.){
        float glow=exp(-(radius-1.)*170.)*.16;
        gl_FragColor=vec4(vec3(.71,.77,.62),glow);return;
      }
      vec3 n=vec3(p,sqrt(max(0.,1.-rr)));
      vec3 world=vec3(dot(orientation[0],n),dot(orientation[1],n),dot(orientation[2],n));
      vec2 st=vec2(atan(world.x,world.z)/(2.*PI)+.5,.5-asin(clamp(world.y,-1.,1.))/PI);
      float mask=smoothstep(.19,.85,texture2D(land,st).r);
      vec3 light=normalize(vec3(-.55,.72,.9));
      float diffuse=max(dot(n,light),0.);
      float broad=pow(max(dot(n,normalize(light+vec3(0.,0.,1.))),0.),28.);
      float sharp=pow(max(dot(n,normalize(vec3(-.9,.4,1.8))),0.),95.);
      float fresnel=pow(1.-n.z,3.2);
      float stripe=exp(-pow((n.x+n.y*.25+.31)*4.7,2.));
      float grain=(sin(st.y*8100.+sin(st.x*800.)*.2)+sin(st.y*29000.))*.004;
      vec3 sea=vec3(.057,.077,.095)*(.35+diffuse*.86)+vec3(.19,.23,.26)*broad*.26;
      vec3 steel=vec3(.56,.62,.67)*(.2+diffuse*.78)+vec3(.86,.9,.95)*(broad*.4+sharp*.25)+vec3(.18,.2,.21)*stripe+grain;
      vec3 color=mix(sea,steel,mask);
      vec2 grid=abs(sin(vec2(st.x*36.,st.y*18.)*PI));
      float lines=1.-smoothstep(.008,.025,min(grid.x,grid.y));
      color+=vec3(.16,.21,.24)*lines*(1.-mask)*.23;
      color+=vec3(.38,.45,.37)*fresnel*.33;
      float vignette=smoothstep(.0,.25,n.z);
      color*=.65+vignette*.35;
      float edge=1.-smoothstep(1.-pixel*1.7,1.,radius);
      gl_FragColor=vec4(color,edge);
    }`;
  const routeVertex = `
    attribute vec4 position;
    uniform mat3 orientation;
    uniform float pointSize;
    varying float depth; varying float progress;
    void main(){vec3 p=orientation*position.xyz;depth=p.z;progress=position.w;gl_Position=vec4(p.xy*.84,0.,1.);gl_PointSize=pointSize;}`;
  const routeFragment = `
    precision mediump float;
    varying float depth; varying float progress;
    uniform float mode;
    uniform float time;
    void main(){
      if(depth<.025)discard;
      float alpha=smoothstep(.025,.16,depth);
      vec3 color=vec3(.77,.86,.60);
      if(mode>.5){
        float d=length(gl_PointCoord-vec2(.5));
        if(d>.5)discard;
        float core=1.-smoothstep(.1,.27,d);
        alpha*=mix(.13,1.,core)*(1.-smoothstep(.35,.5,d));
        color=mix(color,vec3(.94,.97,.84),core);
      }else{
        float pulse=exp(-pow((progress-fract(time*.11))*8.,2.));
        alpha*=.28+pulse*.55;
      }
      gl_FragColor=vec4(color,alpha);
    }`;
  let sphereUniforms, routeUniforms, spherePosition, routePosition;
  function initialise(data) {
    if (disposed) return;
    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
      if (!gl) return fallback();
      sphereProgram = program(sphereVertex, sphereFragment);
      routeProgram = program(routeVertex, routeFragment);
      sphereUniforms = uniforms(sphereProgram, ['land', 'orientation', 'pixel']);
      routeUniforms = uniforms(routeProgram, ['orientation', 'pointSize', 'mode', 'time']);
      spherePosition = gl.getAttribLocation(sphereProgram, 'position');
      routePosition = gl.getAttribLocation(routeProgram, 'position');
      quadBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      routes.length = 0;
      destinations.forEach(destination => {
        const points = [];
        for (let i = 0; i <= 48; i++) points.push(...interpolate(destination, i / 48), i / 48);
        routes.push(new Float32Array(points));
      });
      routeBuffer = gl.createBuffer(); markerBuffer = gl.createBuffer();
      texture = landTexture(data);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      contextLost = false; ready = true;
      stage.classList.remove('is-fallback'); stage.classList.add('is-ready');
      canvas.dataset.renderer = 'webgl';
      resize(); refresh();
    } catch { fallback(); }
  }
  function resize() {
    if (!ready || contextLost) return;
    const size = stage.getBoundingClientRect().width;
    dpr = Math.min(devicePixelRatio || 1, size < 600 ? 1.5 : 1.35);
    const pixels = Math.max(1, Math.min(1280, Math.round(size * dpr)));
    if (canvas.width !== pixels || canvas.height !== pixels) { canvas.width = pixels; canvas.height = pixels; }
    gl.viewport(0, 0, pixels, pixels);
    render();
  }
  function render() {
    if (!ready || contextLost) return;
    const yaw = -.28 + (reduced.matches ? 0 : Math.sin(phase * .027) * .10 + easedX * .32);
    const pitch = .21 + (reduced.matches ? 0 : Math.sin(phase * .038) * .025 + easedY * .13);
    const orientation = matrix(yaw, pitch);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(sphereProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer); gl.enableVertexAttribArray(spherePosition);
    gl.vertexAttribPointer(spherePosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix3fv(sphereUniforms.orientation, false, orientation);
    gl.uniform1f(sphereUniforms.pixel, 2 / canvas.width);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.uniform1i(sphereUniforms.land, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.useProgram(routeProgram); gl.uniformMatrix3fv(routeUniforms.orientation, false, orientation);
    gl.uniform1f(routeUniforms.time, phase); gl.uniform1f(routeUniforms.mode, 0); gl.uniform1f(routeUniforms.pointSize, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, routeBuffer); gl.enableVertexAttribArray(routePosition);
    gl.vertexAttribPointer(routePosition, 4, gl.FLOAT, false, 0, 0);
    routes.forEach(points => { gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW); gl.drawArrays(gl.LINE_STRIP, 0, points.length / 4); });
    const markers = [];
    endpoints.forEach(point => markers.push(...point.map(n => n * 1.014), 0));
    if (!reduced.matches) destinations.forEach((point, i) => markers.push(...interpolate(point, (phase * .052 + i * .23) % 1), 0));
    gl.uniform1f(routeUniforms.mode, 1); gl.uniform1f(routeUniforms.pointSize, 8 * dpr);
    gl.bindBuffer(gl.ARRAY_BUFFER, markerBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(markers), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(routePosition, 4, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.POINTS, 0, markers.length / 4);
    frames++;
    canvas.dataset.frame = String(frames);
    canvas.dataset.yaw = yaw.toFixed(3); canvas.dataset.pitch = pitch.toFixed(3);
  }
  function blocked() { return leaving || document.hidden || !inView || Boolean(document.querySelector('dialog[open]')); }
  function loop(now) {
    raf = 0;
    if (!ready || contextLost || reduced.matches || blocked()) return refresh();
    if (now - previous >= 1000 / 30) {
      const dt = previous ? Math.min((now - previous) / 1000, .1) : 1 / 30;
      previous = now; phase += dt;
      const amount = 1 - Math.exp(-dt * 3.7);
      easedX += (targetX - easedX) * amount; easedY += (targetY - easedY) * amount;
      render();
    }
    raf = requestAnimationFrame(loop);
  }
  function refresh() {
    if (!ready || contextLost) return;
    cancelAnimationFrame(raf); raf = 0; previous = 0;
    if (blocked()) { canvas.dataset.motion = 'paused'; return; }
    if (reduced.matches) {
      targetX = targetY = easedX = easedY = 0;
      canvas.dataset.motion = 'reduced'; render(); return;
    }
    canvas.dataset.motion = 'active'; raf = requestAnimationFrame(loop);
  }
  listen(hero, 'pointermove', event => {
    if (!finePointer.matches || reduced.matches || event.pointerType === 'touch' || blocked()) return;
    const rect = hero.getBoundingClientRect();
    targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, 1 - (event.clientY - rect.top) / rect.height * 2));
  }, { passive: true });
  listen(hero, 'pointerleave', () => { targetX = targetY = 0; }, { passive: true });
  listen(document, 'visibilitychange', refresh);
  listen(reduced, 'change', refresh);
  listen(window, 'pagehide', event => {
    leaving = true; refresh();
    if (event.persisted) return;
    disposed = true;
    observer?.disconnect(); resizeObserver?.disconnect(); modalObserver.disconnect();
    listeners.forEach(remove => remove());
    clearTimeout(timer); controller.abort();
    if (gl && !contextLost) {
      [quadBuffer, routeBuffer, markerBuffer].forEach(item => { if (item) gl.deleteBuffer(item); });
      [sphereProgram, routeProgram].forEach(item => { if (item) gl.deleteProgram(item); });
      if (texture) gl.deleteTexture(texture);
    }
    ready = false;
  });
  listen(window, 'pageshow', () => { leaving = false; refresh(); });
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting && entries[0].intersectionRatio > .1;
    refresh();
  }, { threshold: [0, .1] }) : null;
  observer?.observe(hero);
  const modalObserver = new MutationObserver(refresh);
  modalObserver.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(stage);
  if (!resizeObserver) listen(window, 'resize', resize, { passive: true });
  let geography;
  listen(canvas, 'webglcontextlost', event => { event.preventDefault(); contextLost = true; fallback(); });
  listen(canvas, 'webglcontextrestored', () => { if (geography) initialise(geography); });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  fetch('./data/globe-land.json', { signal: controller.signal }).then(response => {
    if (!response.ok) throw new Error('Globe geography unavailable');
    return response.json();
  }).then(data => { geography = data; initialise(data); }).catch(fallback).finally(() => clearTimeout(timer));
})();
