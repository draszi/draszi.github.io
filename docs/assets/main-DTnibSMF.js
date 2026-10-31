import"./style-h0srv1Oj.js";var e=[{name:`Calcifer`,colors:[`#8a0000`,`#ffeb66`,`#fcff42`,`#db0037`],saturation:1.22556573275862},{name:`Mani`,colors:[`#f5a6d5`,`#a696ed`,`#8ce8e2`,`#ece4f7`],saturation:1.12},{name:`Jupiter`,colors:[`#d1b48d`,`#8b969e`,`#ecddbd`,`#07566c`],saturation:1},{name:`Mars`,colors:[`#2b1d2e`,`#ac1d58`,`#ffb4a2`,`#ff5f7e`],saturation:1},{name:`Neptune`,colors:[`#183b62`,`#70e6c0`,`#c0b4ff`,`#486bcc`],saturation:1},{name:`Venus`,colors:[`#873e59`,`#ffc875`,`#ffe6b5`,`#ef815f`],saturation:1},{name:`Uranus`,colors:[`#103c4a`,`#43cbb9`,`#d5f4c5`,`#368eae`],saturation:1}],t=e=>e.colors.flatMap(e=>[1,3,5].map(t=>Number.parseInt(e.slice(t,t+2),16)/255)),n=`
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`,r=`
  precision highp float;

  uniform vec2 resolution;
  uniform float time;
  uniform float gradientTime;
  uniform float fieldAngle;
  uniform vec3 palette0;
  uniform vec3 palette1;
  uniform vec3 palette2;
  uniform vec3 palette3;
  uniform float saturation;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float amplitude = 0.5;
    float value = 0.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + 13.1;
      amplitude *= 0.5;
    }
    return value;
  }

  float softFbm(vec2 p) {
    float broad = fbm(p * 0.52);
    float mid = fbm(p * 0.8 + 17.3);
    float fine = fbm(p * 1.75 - 9.1);
    float softened = mix(
      broad * 0.62 + mid * 0.38,
      broad * 0.70 + mid * 0.24 + fine * 0.06 * 0.707165948275862,
      0.65
    );
    return mix(fbm(p), softened, 0.742322198275862);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - resolution * 0.5) / min(resolution.x, resolution.y);
    float radius = 0.187992995689655;
    float r = length(uv);
    float angle = atan(uv.y, uv.x);
    float delta = atan(sin(angle - fieldAngle), cos(angle - fieldAngle));
    float directional = exp(-pow(abs(delta) / 1.721631869612067, 2.87786907327586));
    float directionMask = mix(0.45 + 0.55 * directional, directional, 0.368601831896552);

    float irregular = softFbm(vec2(cos(angle), sin(angle)) * 3.2 + vec2(time * 0.13, -time * 0.09));
    float secondary = softFbm(vec2(cos(angle), sin(angle)) * 4.2 + vec2(-time * 0.06, time * 0.12));
    float attraction = 1.4403286637931 * directionMask * (0.65 + 0.5 * irregular);
    float edge = radius * (1.0 + attraction * 0.25 + 0.38 * 0.025 * (secondary - 0.5) * directionMask);
    float outside = max(0.0, r - radius);
    float displacement = max(0.0, edge - radius);
    float stretch = clamp(displacement / (radius * 0.4), 0.0, 1.0);
    float localBlur = 2.2586880387931 * pow(max(0.0001, directionMask), 1.726721443965516);
    float hazeWidth = (0.001 + localBlur * 0.032 + 0.361779364224138 * 0.045 * directionMask) * (0.15 + stretch * 1.7);
    float crispWidth = mix(0.012, 0.0007, 0.447467672413793);
    float feather = mix(crispWidth, hazeWidth, clamp(directionMask * 1.20247508081897, 0.0, 1.0));
    float coherent = 1.0 - smoothstep(edge - feather * 0.5, edge + feather, r);
    float stable = 1.0 - smoothstep(radius * 0.86, radius * 1.03, r);
    float alpha = max(stable, coherent);

    float baseDecay = 0.004 + 0.361779364224138 * 0.07 + localBlur * 0.018;
    float diffuse = exp(-pow(outside / baseDecay, mix(1.0, 0.72, 0.851495150862069)));
    float breakup = softFbm(uv * 17.7 + vec2(time * 0.045, -time * 0.036));
    float scattered = smoothstep(
      mix(0.38, 0.20, 0.851495150862069),
      mix(0.70, 0.56, 0.851495150862069),
      breakup
    );
    float cloud = diffuse * stretch * 1.05 * 0.58 * scattered * directionMask;
    alpha = max(alpha, cloud * 0.55);

    vec2 gradientPoint = uv / radius;
    float rotation = gradientTime * 1.04741379310345 * 0.2;
    float cosine = cos(rotation);
    float sine = sin(rotation);
    gradientPoint = mat2(cosine, -sine, sine, cosine) * gradientPoint;
    vec2 p1 = vec2(-0.55, 0.55) + 1.68265086206897 * 0.22 * vec2(sin(gradientTime * 0.51), cos(gradientTime * 0.39));
    vec2 p2 = vec2(0.48, 0.12) + 1.68265086206897 * 0.22 * vec2(cos(gradientTime * 0.37 + 1.7), sin(gradientTime * 0.43));
    vec2 p3 = vec2(0.40, -0.60) + 1.68265086206897 * 0.18 * vec2(sin(gradientTime * 0.29 + 2.3), cos(gradientTime * 0.47));
    float gradientScale = 0.887042025862069;
    float gradientBlend = 1.14392510775862;
    float w1 = exp(-dot(gradientPoint - p1, gradientPoint - p1) / (gradientScale * gradientScale) * 2.0 / gradientBlend);
    float w2 = exp(-dot(gradientPoint - p2, gradientPoint - p2) / (gradientScale * gradientScale) * 2.0 / gradientBlend);
    float w3 = exp(-dot(gradientPoint - p3, gradientPoint - p3) / (gradientScale * gradientScale) * 2.0 / gradientBlend);
    float w4 = 0.22 + exp(-length(gradientPoint - vec2(0.2, -0.15)) * 1.2);
    vec3 orange = palette0;
    vec3 coral = palette1;
    vec3 pink = palette2;
    vec3 plum = palette3;
    vec3 colour = (orange * w1 + coral * w2 + pink * w3 + plum * w4) / (w1 + w2 + w3 + w4);
    float luminance = dot(colour, vec3(0.299, 0.587, 0.114));
    colour = mix(vec3(luminance), colour, saturation);

    float pixel = 1.77;
    float grain = hash(floor(gl_FragCoord.xy / pixel) + floor(time * 5.4));
    float g1 = hash(floor((gl_FragCoord.xy + vec2(pixel, 0.0)) / pixel) + floor(time * 2.25));
    float g2 = hash(floor((gl_FragCoord.xy + vec2(0.0, pixel)) / pixel) + floor(time * 2.25));
    float g3 = hash(floor((gl_FragCoord.xy + vec2(pixel)) / pixel) + floor(time * 2.25));
    grain = mix(grain, (grain + g1 + g2 + g3) * 0.25, 0.742322198275862);
    float edgeFactor = smoothstep(radius * 0.68, radius + 0.0736, r) * directionMask;
    float granular = (grain - 0.5) * 0.27 * edgeFactor * 0.3;
    alpha = clamp(alpha + granular * alpha, 0.0, 1.0);
    alpha *= 1.0 - smoothstep(0.38, 0.49, r);
    colour = clamp(colour + granular * 0.1, 0.0, 1.0);
    gl_FragColor = vec4(colour * alpha, alpha);
  }
`;function i(e,t,n){let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r);throw e.deleteShader(r),Error(t)}return r}function a(){let a=document.querySelector(`.logo-orb`),o=a?.querySelector(`.logo-orb__canvas`);if(!a||!o)return;let s=o.getContext(`webgl`,{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:`low-power`});if(s)try{let c=s.createProgram();if(s.attachShader(c,i(s,s.VERTEX_SHADER,n)),s.attachShader(c,i(s,s.FRAGMENT_SHADER,r)),s.linkProgram(c),!s.getProgramParameter(c,s.LINK_STATUS))throw Error(s.getProgramInfoLog(c));s.useProgram(c);let l=s.createBuffer();s.bindBuffer(s.ARRAY_BUFFER,l),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),s.STATIC_DRAW);let u=s.getAttribLocation(c,`position`);s.enableVertexAttribArray(u),s.vertexAttribPointer(u,2,s.FLOAT,!1,0,0);let d={resolution:s.getUniformLocation(c,`resolution`),time:s.getUniformLocation(c,`time`),gradientTime:s.getUniformLocation(c,`gradientTime`),fieldAngle:s.getUniformLocation(c,`fieldAngle`),palette:[0,1,2,3].map(e=>s.getUniformLocation(c,`palette${e}`)),saturation:s.getUniformLocation(c,`saturation`)},f=window.matchMedia(`(prefers-reduced-motion: reduce)`),p=`orb-last-palette`,m=null;try{m=sessionStorage.getItem(p)}catch{}let h=e.map((e,t)=>t).filter(t=>e[t].name!==m),g=h[Math.floor(Math.random()*h.length)],_=t(e[g]),v=[..._],y=e[g].saturation,b=y,x=-1/0,S=a.querySelector(`.logo-orb__palette`),C=()=>{let t=e[g].name,n=e[(g+1)%e.length].name;S?.setAttribute(`aria-label`,`Orb palette: ${t}. Click for ${n}.`),S&&(S.title=`${t} · click to change palette`);try{sessionStorage.setItem(p,t)}catch{}};C(),S?.addEventListener(`click`,()=>{_=[...v],y=b,g=(g+1)%e.length,x=performance.now(),C()});let w=0,T=0,E=performance.now(),D=2.7,O=0,k=D,A=!1;window.addEventListener(`pointermove`,e=>{let t=a.getBoundingClientRect(),n=t.left+t.width*.354,r=t.top+t.height*.207;k=Math.atan2(r-e.clientY,e.clientX-n),A=!0},{passive:!0}),window.addEventListener(`pointerout`,e=>{e.relatedTarget||(A=!1)},{passive:!0});let j=[...document.querySelectorAll(`a:not(.skip-link)`)],M=null,N=null,P=null,F=null,I=window.matchMedia(`(hover: hover) and (pointer: fine)`),L=null,R=0,z={x:0,y:0},B=()=>{a.classList.remove(`is-link-highlight`,`is-returning`),P=null,M=null,N=null,L=null,z={x:0,y:0}};I.addEventListener(`change`,()=>{I.matches||B()});let V=(e,t,n)=>{a.style.setProperty(`--orb-flight-x`,`${e}px`),a.style.setProperty(`--orb-flight-y`,`${t}px`),a.style.setProperty(`--orb-flight-size`,`${n}px`)},H=()=>{let e=a.getBoundingClientRect(),t=e.width*.693;return{x:e.left+e.width*.0072,y:e.top-e.height*.1295,size:t}},U=(e,t)=>{if(!e||!I.matches||t?.pointerType===`touch`)return;if(L=null,!a.classList.contains(`is-link-highlight`)){let e=o.getBoundingClientRect();P={x:e.left,y:e.top,size:e.width},V(e.left,e.top,e.width),a.classList.add(`is-link-highlight`),o.getBoundingClientRect()}a.classList.remove(`is-returning`);let n=e.getBoundingClientRect();F={x:t?t.clientX:n.left+n.width*.5,y:t?t.clientY:n.top+n.height*.5}},W=()=>{M||N||!a.classList.contains(`is-link-highlight`)||(L=performance.now(),z={x:0,y:0})};j.forEach(e=>{e.addEventListener(`pointerenter`,t=>{I.matches&&t.pointerType!==`touch`&&(M=e,U(e,t))}),e.addEventListener(`pointermove`,e=>{I.matches&&e.pointerType!==`touch`&&(F={x:e.clientX,y:e.clientY})}),e.addEventListener(`pointerleave`,()=>{M=null,W()}),e.addEventListener(`focus`,()=>{I.matches&&e.matches(`:focus-visible`)&&(N=e,U(e))}),e.addEventListener(`blur`,()=>{N=null,W()})});function G(n){let r=o.getBoundingClientRect(),i=Math.min(window.devicePixelRatio||1,1.5),c=Math.max(1,Math.round(r.width*i)),l=Math.max(1,Math.round(r.height*i));(o.width!==c||o.height!==l)&&(o.width=c,o.height=l,s.viewport(0,0,c,l));let u=Math.min((n-E)/1e3,.05);if(E=n,P){L!==null&&n>=L&&(a.classList.add(`is-returning`),L=null,R=0);let e=a.classList.contains(`is-returning`),t=e?H():{x:F.x-P.size*.5,y:F.y-P.size*.5},r=L!==null;e&&(R+=u);let i=e?Math.min(1,R/.35):1,o=1-Math.exp(-u/.16);for(let n of[`x`,`y`]){let a=(t[n]-P[n])/(e?.7:.47)*i;z[n]+=(a-z[n])*o,r||(P[n]+=z[n]*u),f.matches&&!r&&(P[n]=t[n])}V(P.x,P.y,P.size),e&&Math.hypot(t.x-P.x,t.y-P.y)<.15&&B()}if(!f.matches&&!document.hidden){w+=u*.407731681034483;let e=1+.380792025862069*(.35*Math.sin(T*.694841056034483*1.8)+.2*Math.sin(T*.694841056034483*.73+1.3));T+=u*1.33755387931034*Math.max(.05,e);let t=2.7+Math.sin(w*.8)*1.8+Math.sin(w*.31)*.8,n=A?k:t,r=Math.atan2(Math.sin(n-D),Math.cos(n-D));O=(O+r*u*5)*Math.exp(-u*2.346875*3),D+=O*u*5}s.uniform2f(d.resolution,c,l),s.uniform1f(d.time,w),s.uniform1f(d.gradientTime,T),s.uniform1f(d.fieldAngle,D);let p=e[g],m=f.matches?1:Math.min(1,(n-x)/850),h=m*m*(3-2*m);v=t(p).map((e,t)=>_[t]+(e-_[t])*h),b=y+(p.saturation-y)*h,d.palette.forEach((e,t)=>s.uniform3fv(e,v.slice(t*3,t*3+3))),s.uniform1f(d.saturation,b),s.drawArrays(s.TRIANGLES,0,6),requestAnimationFrame(G)}a.classList.add(`is-webgl`),requestAnimationFrame(G)}catch(e){console.warn(`The animated logo could not start; using the static logo fallback.`,e)}}a();