// Palette order is also the order used when clicking the dot.
const ORB_PALETTES = [
  { name: 'Calcifer', colors: ['#8a0000', '#ffeb66', '#fcff42', '#db0037'], saturation: 1.22556573275862 },
  { name: 'Mani', colors: ['#f5a6d5', '#a696ed', '#8ce8e2', '#ece4f7'], saturation: 1.12 },
  { name: 'Jupiter', colors: ['#d1b48d', '#8b969e', '#ecddbd', '#07566c'], saturation: 1 },
  { name: 'Mars', colors: ['#2b1d2e', '#ac1d58', '#ffb4a2', '#ff5f7e'], saturation: 1 },
  { name: 'Neptune', colors: ['#183b62', '#70e6c0', '#c0b4ff', '#486bcc'], saturation: 1 },
  { name: 'Venus', colors: ['#873e59', '#ffc875', '#ffe6b5', '#ef815f'], saturation: 1 },
  { name: 'Uranus', colors: ['#103c4a', '#43cbb9', '#d5f4c5', '#368eae'], saturation: 1 },
]

const paletteChannels = (palette) => palette.colors.flatMap((hex) =>
  [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255),
)

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
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
`

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(message)
  }

  return shader
}

export function initLogoOrb() {
  const root = document.querySelector('.logo-orb')
  const canvas = root?.querySelector('.logo-orb__canvas')
  if (!root || !canvas) return

  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
  })

  if (!gl) return

  try {
    const program = gl.createProgram()
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER))
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program))
    }

    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'resolution'),
      time: gl.getUniformLocation(program, 'time'),
      gradientTime: gl.getUniformLocation(program, 'gradientTime'),
      fieldAngle: gl.getUniformLocation(program, 'fieldAngle'),
      palette: [0, 1, 2, 3].map((index) => gl.getUniformLocation(program, `palette${index}`)),
      saturation: gl.getUniformLocation(program, 'saturation'),
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const paletteStorageKey = 'orb-last-palette'
    let previousPalette = null
    try {
      previousPalette = sessionStorage.getItem(paletteStorageKey)
    } catch { /* Random selection still works when storage is unavailable. */ }
    const candidates = ORB_PALETTES.map((palette, index) => index)
      .filter((index) => ORB_PALETTES[index].name !== previousPalette)
    let paletteIndex = candidates[Math.floor(Math.random() * candidates.length)]
    let paletteFrom = paletteChannels(ORB_PALETTES[paletteIndex])
    let paletteCurrent = [...paletteFrom]
    let saturationFrom = ORB_PALETTES[paletteIndex].saturation
    let saturationCurrent = saturationFrom
    let paletteStarted = -Infinity
    const paletteButton = root.querySelector('.logo-orb__palette')
    const updatePaletteLabel = () => {
      const current = ORB_PALETTES[paletteIndex].name
      const next = ORB_PALETTES[(paletteIndex + 1) % ORB_PALETTES.length].name
      paletteButton?.setAttribute('aria-label', `Orb palette: ${current}. Click for ${next}.`)
      if (paletteButton) paletteButton.title = `${current} · click to change palette`
      try {
        sessionStorage.setItem(paletteStorageKey, current)
      } catch { /* Storage is optional. */ }
    }
    updatePaletteLabel()
    paletteButton?.addEventListener('click', () => {
      paletteFrom = [...paletteCurrent]
      saturationFrom = saturationCurrent
      paletteIndex = (paletteIndex + 1) % ORB_PALETTES.length
      paletteStarted = performance.now()
      updatePaletteLabel()
    })
    let elapsed = 0
    let gradientElapsed = 0
    let previous = performance.now()
    let currentAngle = 2.7
    let velocity = 0
    let pointerAngle = currentAngle
    let pointerActive = false

    const updatePointer = (event) => {
      const bounds = root.getBoundingClientRect()
      const dotX = bounds.left + bounds.width * 0.354
      const dotY = bounds.top + bounds.height * 0.207
      pointerAngle = Math.atan2(dotY - event.clientY, event.clientX - dotX)
      pointerActive = true
    }

    window.addEventListener('pointermove', updatePointer, { passive: true })
    window.addEventListener('pointerout', (event) => {
      if (!event.relatedTarget) pointerActive = false
    }, { passive: true })

    const links = [...document.querySelectorAll('a:not(.skip-link)')]
    let hoveredLink = null
    let focusedLink = null
    let flight = null
    let pointerTarget = null
    const desktopHover = window.matchMedia('(hover: hover) and (pointer: fine)')
    let returnAt = null
    let returnElapsed = 0
    let flightVelocity = { x: 0, y: 0 }

    const resetFlight = () => {
      root.classList.remove('is-link-highlight', 'is-returning')
      flight = null
      hoveredLink = null
      focusedLink = null
      returnAt = null
      flightVelocity = { x: 0, y: 0 }
    }
    desktopHover.addEventListener('change', () => {
      if (!desktopHover.matches) resetFlight()
    })

    const setFlightPosition = (x, y, size) => {
      root.style.setProperty('--orb-flight-x', `${x}px`)
      root.style.setProperty('--orb-flight-y', `${y}px`)
      root.style.setProperty('--orb-flight-size', `${size}px`)
    }

    const getHomePosition = () => {
      const bounds = root.getBoundingClientRect()
      const size = bounds.width * 0.693
      return {
        x: bounds.left + bounds.width * 0.0072,
        y: bounds.top - bounds.height * 0.1295,
        size,
      }
    }

    const moveOrbTo = (link, event) => {
      if (!link || !desktopHover.matches || event?.pointerType === 'touch') return
      returnAt = null

      if (!root.classList.contains('is-link-highlight')) {
        const start = canvas.getBoundingClientRect()
        flight = { x: start.left, y: start.top, size: start.width }
        setFlightPosition(start.left, start.top, start.width)
        root.classList.add('is-link-highlight')
        canvas.getBoundingClientRect()
      }

      root.classList.remove('is-returning')
      const target = link.getBoundingClientRect()
      pointerTarget = {
        x: event ? event.clientX : target.left + target.width * 0.5,
        y: event ? event.clientY : target.top + target.height * 0.5,
      }
    }

    const returnOrbHome = () => {
      if (hoveredLink || focusedLink || !root.classList.contains('is-link-highlight')) return
      returnAt = performance.now()
      flightVelocity = { x: 0, y: 0 }
    }

    links.forEach((link) => {
      link.addEventListener('pointerenter', (event) => {
        if (!desktopHover.matches || event.pointerType === 'touch') return
        hoveredLink = link
        moveOrbTo(link, event)
      })
      link.addEventListener('pointermove', (event) => {
        if (!desktopHover.matches || event.pointerType === 'touch') return
        pointerTarget = { x: event.clientX, y: event.clientY }
      })
      link.addEventListener('pointerleave', () => {
        hoveredLink = null
        returnOrbHome()
      })
      link.addEventListener('focus', () => {
        if (!desktopHover.matches || !link.matches(':focus-visible')) return
        focusedLink = link
        moveOrbTo(link)
      })
      link.addEventListener('blur', () => {
        focusedLink = null
        returnOrbHome()
      })
    })

    function draw(now) {
      const rect = canvas.getBoundingClientRect()
      const density = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.max(1, Math.round(rect.width * density))
      const height = Math.max(1, Math.round(rect.height * density))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }

      const delta = Math.min((now - previous) / 1000, 0.05)
      previous = now

      if (flight) {
        if (returnAt !== null && now >= returnAt) {
          root.classList.add('is-returning')
          returnAt = null
          returnElapsed = 0
        }
        const returning = root.classList.contains('is-returning')
        const target = returning ? getHomePosition() : {
          x: pointerTarget.x - flight.size * 0.5,
          y: pointerTarget.y - flight.size * 0.5,
        }
        const lingering = returnAt !== null
        if (returning) returnElapsed += delta
        const ramp = returning ? Math.min(1, returnElapsed / 0.35) : 1
        const response = 1 - Math.exp(-delta / 0.16)
        for (const axis of ['x', 'y']) {
          const desiredVelocity = (target[axis] - flight[axis]) / (returning ? 0.7 : 0.47) * ramp
          flightVelocity[axis] += (desiredVelocity - flightVelocity[axis]) * response
          if (!lingering) flight[axis] += flightVelocity[axis] * delta
          if (reducedMotion.matches && !lingering) flight[axis] = target[axis]
        }
        setFlightPosition(flight.x, flight.y, flight.size)
        if (returning && Math.hypot(target.x - flight.x, target.y - flight.y) < 0.15) {
          resetFlight()
        }
      }

      if (!reducedMotion.matches && !document.hidden) {
        elapsed += delta * 0.407731681034483
        const acceleration = 1 + 0.380792025862069 * (
          0.35 * Math.sin(gradientElapsed * 0.694841056034483 * 1.8) +
          0.2 * Math.sin(gradientElapsed * 0.694841056034483 * 0.73 + 1.3)
        )
        gradientElapsed += delta * 1.33755387931034 * Math.max(0.05, acceleration)
        const automaticAngle = 2.7 + Math.sin(elapsed * 0.8) * 1.8 + Math.sin(elapsed * 0.31) * 0.8
        const targetAngle = pointerActive ? pointerAngle : automaticAngle
        const angleDifference = Math.atan2(
          Math.sin(targetAngle - currentAngle),
          Math.cos(targetAngle - currentAngle),
        )
        velocity = (velocity + angleDifference * delta * 5) * Math.exp(-delta * 2.346875 * 3)
        currentAngle += velocity * delta * 5
      }

      gl.uniform2f(uniforms.resolution, width, height)
      gl.uniform1f(uniforms.time, elapsed)
      gl.uniform1f(uniforms.gradientTime, gradientElapsed)
      gl.uniform1f(uniforms.fieldAngle, currentAngle)
      const paletteTarget = ORB_PALETTES[paletteIndex]
      const progress = reducedMotion.matches ? 1 : Math.min(1, (now - paletteStarted) / 850)
      const eased = progress * progress * (3 - 2 * progress)
      const channels = paletteChannels(paletteTarget)
      paletteCurrent = channels.map((value, index) => paletteFrom[index] + (value - paletteFrom[index]) * eased)
      saturationCurrent = saturationFrom + (paletteTarget.saturation - saturationFrom) * eased
      uniforms.palette.forEach((location, index) => gl.uniform3fv(location, paletteCurrent.slice(index * 3, index * 3 + 3)))
      gl.uniform1f(uniforms.saturation, saturationCurrent)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      requestAnimationFrame(draw)
    }

    root.classList.add('is-webgl')
    requestAnimationFrame(draw)
  } catch (error) {
    console.warn('The animated logo could not start; using the static logo fallback.', error)
  }
}
