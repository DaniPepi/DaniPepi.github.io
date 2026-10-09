/* Local WebGL globe. Natural Earth coasts, softly beveled satin metal and travel arcs. */
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
  let targetX = 0, targetY = 0, easedX = 0, easedY = 0, dpr = 1, textureWidth = 2048;
  const routes = [];
  const listeners = [];
  const vector = ([lat, lon]) => {
    const p = lat * Math.PI / 180, l = lon * Math.PI / 180;
    return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
  };
  const origin = vector([41.9, 12.5]);
  const destinations = [[39.627, -8.665], [48.872, 2.779], [-13.3, 48.2], [25.067, 34.898]].map(vector);
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
    const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
    const maximum = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const preferred = !lowMemory && stage.getBoundingClientRect().width >= 600 && maximum >= 4096 ? 4096 : 2048;
    textureWidth = Math.min(preferred, 2 ** Math.floor(Math.log2(maximum)));
    const map = document.createElement('canvas'); map.width = textureWidth; map.height = textureWidth / 2;
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
    // Pack the real coastline, a softened height field and its two gradients.
    // The relief describes an engraved metal model, rather than invented terrain.
    const softened = document.createElement('canvas'); softened.width = map.width; softened.height = map.height;
    const soft = softened.getContext('2d');
    if (!soft) throw new Error('Globe surface unavailable');
    soft.fillStyle = '#000'; soft.fillRect(0, 0, map.width, map.height);
    soft.filter = `blur(${textureWidth / 1024}px)`;
    soft.drawImage(map, 0, 0);
    const coast = ctx.getImageData(0, 0, map.width, map.height).data;
    const height = soft.getImageData(0, 0, map.width, map.height).data;
    const packed = new Uint8Array(coast.length);
    const step = Math.max(1, textureWidth / 2048), stride = map.width * 4;
    for (let y = 0; y < map.height; y++) {
      const above = Math.max(0, y - step) * stride, below = Math.min(map.height - 1, y + step) * stride;
      const row = y * stride;
      for (let x = 0; x < map.width; x++) {
        const i = row + x * 4;
        const left = row + ((x - step + map.width) % map.width) * 4;
        const right = row + ((x + step) % map.width) * 4;
        packed[i] = coast[i];
        packed[i + 1] = 128 + (height[right] - height[left]) / step;
        packed[i + 2] = 128 + (height[below + x * 4] - height[above + x * 4]) / step;
        packed[i + 3] = height[i];
      }
    }
    const item = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, item);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, map.width, map.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, packed);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    if (gl.getError() !== gl.NO_ERROR) { gl.deleteTexture(item); throw new Error('Globe surface unavailable'); }
    const anisotropy = gl.getExtension('EXT_texture_filter_anisotropic');
    if (anisotropy) gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    canvas.dataset.texture = String(textureWidth);
    map.width = map.height = softened.width = softened.height = 1;
    return item;
  }
  const sphereVertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position;gl_Position=vec4(position,0.,1.);}`;
  const sphereFragment = `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D land;
    uniform mat3 orientation;
    uniform float pixel;
    uniform float reliefScale;
    const float PI=3.14159265359;
    void main(){
      vec2 p=uv/.84;
      float rr=dot(p,p);
      float radius=sqrt(rr);
      if(radius>1.045)discard;
      if(rr>1.){
        float glow=exp(-(radius-1.)*185.)*.13;
        gl_FragColor=vec4(vec3(.56,.66,.75),glow);return;
      }
      vec3 n=vec3(p,sqrt(max(0.,1.-rr)));
      vec3 world=vec3(dot(orientation[0],n),dot(orientation[1],n),dot(orientation[2],n));
      vec2 st=vec2(atan(world.x,world.z)/(2.*PI)+.5,.5-asin(clamp(world.y,-1.,1.))/PI);
      vec4 surface=texture2D(land,st);
      float mask=smoothstep(.18,.82,surface.r);
      float longitude=atan(world.x,world.z);
      float latitude=asin(clamp(world.y,-1.,1.));
      vec3 east=vec3(cos(longitude),0.,-sin(longitude));
      vec3 north=vec3(-sin(latitude)*sin(longitude),cos(latitude),-sin(latitude)*cos(longitude));
      vec2 gradient=(surface.gb-vec2(128./255.))*2.;
      // Transform the coastline bevel with the same orientation as the geography.
      vec3 tangent=east*gradient.x/max(.32,cos(latitude))-north*gradient.y;
      vec3 normal=normalize(n-orientation*tangent*reliefScale);
      vec3 light=normalize(vec3(-.65,.86,1.15));
      float diffuse=max(dot(normal,light),0.);
      float fill=max(dot(normal,normalize(vec3(.9,.15,1.))),0.);
      float broad=pow(max(dot(normal,normalize(light+vec3(0.,0.,1.))),0.),16.);
      float reflection=exp(-pow((normal.x+normal.y*.32+.31)*5.5,2.));
      float overhead=exp(-pow((normal.y-.76)*8.,2.));
      float fresnel=pow(1.-n.z,3.);
      float grain=(sin(st.y*420.+sin(st.x*83.)*.18)+sin(st.y*230.+st.x*34.))*.0012;
      float occlusion=(1.-mask)*surface.a*.18;
      vec3 sea=vec3(.044,.060,.077)*(.62+diffuse*.75)+vec3(.15,.19,.23)*reflection*.16+vec3(.14,.18,.22)*broad*.15;
      sea*=1.-occlusion;
      vec3 steel=vec3(.53,.59,.65)*(.27+diffuse*.53+fill*.12)+vec3(.74,.80,.86)*broad*.17+vec3(.20,.22,.24)*reflection+vec3(.62,.68,.74)*overhead*.10+grain;
      vec3 color=mix(sea,steel,mask);
      vec2 grid=abs(sin(vec2(st.x*36.,st.y*18.)*PI));
      float lines=1.-smoothstep(.01,.026,min(grid.x,grid.y));
      color+=vec3(.13,.17,.21)*lines*(1.-mask)*.14;
      color+=vec3(.36,.44,.53)*fresnel*.28;
      float vignette=smoothstep(.0,.25,n.z);
      color*=.72+vignette*.28;
      float edge=1.-smoothstep(1.-pixel*1.7,1.,radius);
      gl_FragColor=vec4(color,edge);
    }`;
  const routeVertex = `
    precision mediump float;
    attribute vec4 position;
    attribute vec4 direction;
    uniform mat3 orientation;
    uniform float pointSize;
    uniform float lineWidth;
    uniform float mode;
    varying float depth; varying float progress; varying float side;
    void main(){
      vec3 p=orientation*position.xyz;depth=p.z;progress=position.w;side=direction.w;
      vec2 screen=p.xy*.84;
      if(mode<.5){vec3 tangent=orientation*direction.xyz;vec2 edge=normalize(vec2(-tangent.y,tangent.x)+vec2(.00001));screen+=edge*direction.w*lineWidth;}
      gl_Position=vec4(screen,0.,1.);gl_PointSize=pointSize;
    }`;
  const routeFragment = `
    precision mediump float;
    varying float depth; varying float progress; varying float side;
    uniform float mode;
    uniform float time;
    void main(){
      if(depth<.025)discard;
      float alpha=smoothstep(.025,.16,depth);
      vec3 color=vec3(.68,.78,.66);
      if(mode>.5){
        float d=length(gl_PointCoord-vec2(.5));
        if(d>.5)discard;
        float core=1.-smoothstep(.1,.27,d);
        alpha*=mix(.13,1.,core)*(1.-smoothstep(.35,.5,d));
        color=mix(color,vec3(.90,.95,.91),core);
      }else{
        float pulse=exp(-pow((progress-fract(time*.11))*8.,2.));
        alpha*=(.32+pulse*.46)*(1.-smoothstep(.35,1.,abs(side)));
      }
      gl_FragColor=vec4(color,alpha);
    }`;
  let sphereUniforms, routeUniforms, spherePosition, routePosition, routeDirection;
  function initialise(data) {
    if (disposed) return;
    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
      if (!gl) return fallback();
      sphereProgram = program(sphereVertex, sphereFragment);
      routeProgram = program(routeVertex, routeFragment);
      sphereUniforms = uniforms(sphereProgram, ['land', 'orientation', 'pixel', 'reliefScale']);
      routeUniforms = uniforms(routeProgram, ['orientation', 'pointSize', 'lineWidth', 'mode', 'time']);
      spherePosition = gl.getAttribLocation(sphereProgram, 'position');
      routePosition = gl.getAttribLocation(routeProgram, 'position');
      routeDirection = gl.getAttribLocation(routeProgram, 'direction');
      quadBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      routes.length = 0;
      const ribbons = [];
      destinations.forEach(destination => {
        const offset = ribbons.length / 8;
        for (let i = 0; i <= 96; i++) {
          const point = interpolate(destination, i / 96);
          const before = interpolate(destination, Math.max(0, i - 1) / 96);
          const after = interpolate(destination, Math.min(96, i + 1) / 96);
          const tangent = after.map((n, index) => n - before[index]);
          [-1, 1].forEach(side => ribbons.push(...point, i / 96, ...tangent, side));
        }
        routes.push({ offset, count: ribbons.length / 8 - offset });
      });
      routeBuffer = gl.createBuffer(); markerBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, routeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ribbons), gl.STATIC_DRAW);
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
    dpr = Math.min(devicePixelRatio || 1, 2);
    const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
    const limit = size < 600 || lowMemory ? 960 : 1600;
    const pixels = Math.max(1, Math.min(limit, Math.round(size * dpr)));
    dpr = pixels / Math.max(1, size);
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
    gl.uniform1f(sphereUniforms.reliefScale, textureWidth * .006 / (8 * Math.PI));
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.uniform1i(sphereUniforms.land, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.useProgram(routeProgram); gl.uniformMatrix3fv(routeUniforms.orientation, false, orientation);
    gl.uniform1f(routeUniforms.time, phase); gl.uniform1f(routeUniforms.mode, 0); gl.uniform1f(routeUniforms.pointSize, 1);
    gl.uniform1f(routeUniforms.lineWidth, 2 * dpr / canvas.width);
    gl.bindBuffer(gl.ARRAY_BUFFER, routeBuffer); gl.enableVertexAttribArray(routePosition);
    gl.vertexAttribPointer(routePosition, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(routeDirection); gl.vertexAttribPointer(routeDirection, 4, gl.FLOAT, false, 32, 16);
    routes.forEach(route => gl.drawArrays(gl.TRIANGLE_STRIP, route.offset, route.count));
    const markers = [];
    endpoints.forEach(point => markers.push(...point.map(n => n * 1.014), 0));
    if (!reduced.matches) destinations.forEach((point, i) => markers.push(...interpolate(point, (phase * .052 + i * .23) % 1), 0));
    gl.uniform1f(routeUniforms.mode, 1); gl.uniform1f(routeUniforms.pointSize, 8 * dpr);
    gl.bindBuffer(gl.ARRAY_BUFFER, markerBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(markers), gl.DYNAMIC_DRAW);
    gl.disableVertexAttribArray(routeDirection); gl.vertexAttrib4f(routeDirection, 0, 0, 0, 0);
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
