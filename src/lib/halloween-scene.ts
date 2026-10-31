import { drawHalloweenParticle } from './halloween-particles'

const PUMPKIN = 0
const GHOST = 1
const BAT = 2

const LIGHT_RADIUS = 260
const NAVBAR_FADE_START = 64
const NAVBAR_FADE_RANGE = 48

/** Width of each side margin sprites may use; the centre column holds the page's text. */
export function halloweenGutter(width: number): number {
  const centre = width >= 1024 ? Math.min(980, width * 0.62) : width * 0.8
  const gutter = (width - centre) / 2
  return gutter >= 56 ? gutter : 0
}

export function halloweenSpriteCount(width: number, height: number): number {
  const gutter = halloweenGutter(width)
  return gutter ? Math.max(4, Math.min(18, Math.floor((2 * gutter * height) / 38000))) : 0
}

type Sprite = {
  kind: number
  side: 0 | 1
  x: number
  y: number
  vx: number
  vy: number
  size: number
  far: boolean
  phase: number
  glow: number
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function makeSprites(width: number, height: number): Sprite[] {
  const gutter = halloweenGutter(width)
  return Array.from({ length: halloweenSpriteCount(width, height) }, (_, i) => {
    const kind = i % 3
    const side = (i % 2) as 0 | 1
    const far = i < 3
    const size = far ? rand(40, 56) : rand(20, 30)
    const inset = rand(size / 2, Math.max(size / 2, gutter - size / 2))
    return {
      kind,
      side,
      far,
      size,
      x: side === 0 ? inset : width - inset,
      y: rand(NAVBAR_FADE_START + NAVBAR_FADE_RANGE + size, Math.max(height - size, NAVBAR_FADE_START + NAVBAR_FADE_RANGE + size)),
      vx: kind === BAT ? rand(0.45, 0.8) * (Math.random() < 0.5 ? -1 : 1) : 0,
      vy: kind === GHOST ? -rand(0.12, 0.22) : kind === PUMPKIN ? rand(0.03, 0.07) : 0,
      phase: rand(0, Math.PI * 2),
      glow: 0,
    }
  })
}

/**
 * Runs the seasonal background and returns a cleanup. Sprites stay in the side margins; the scene
 * makes no sound, stores nothing and reports nothing.
 *
 * Sprites rest dim and light up teal near a mouse pointer.
 */
export function startHalloweenScene(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  let sprites: Sprite[] = []
  let pointer: { x: number; y: number } | null = null
  let rafId = 0
  const start = performance.now()

  const flashlight = () => finePointer.matches && !reducedMotion.matches

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    sprites = makeSprites(canvas.width, canvas.height)
  }

  const step = (sprite: Sprite, t: number) => {
    const gutter = halloweenGutter(canvas.width)
    const min = sprite.side === 0 ? sprite.size / 2 : canvas.width - gutter + sprite.size / 2
    const max = sprite.side === 0 ? gutter - sprite.size / 2 : canvas.width - sprite.size / 2
    if (sprite.kind === BAT) {
      sprite.x += sprite.vx
      if (sprite.x < min || sprite.x > max) {
        sprite.vx = -sprite.vx
        sprite.x = Math.min(max, Math.max(min, sprite.x))
      }
      sprite.y += Math.sin(t / 900 + sprite.phase) * 0.6
    } else if (sprite.kind === GHOST) {
      sprite.y += sprite.vy
      sprite.x += Math.sin(t / 1400 + sprite.phase) * 0.25
      if (sprite.y < -sprite.size) sprite.y = canvas.height + sprite.size
    } else {
      sprite.y += sprite.vy
      if (sprite.y > canvas.height + sprite.size) sprite.y = -sprite.size
    }
  }

  const alphaFor = (sprite: Sprite, t: number) => {
    let alpha = sprite.far ? 0.35 : 0.8
    if (flashlight()) {
      const dist = pointer ? Math.hypot(pointer.x - sprite.x, pointer.y - sprite.y) : Infinity
      sprite.glow = Math.max(0, 1 - dist / LIGHT_RADIUS)
      alpha = (sprite.far ? 0.12 : 0.22) + sprite.glow * (sprite.far ? 0.5 : 0.78)

    }
    if (sprite.kind === GHOST) alpha *= 0.8 + 0.2 * Math.sin(t / 1100 + sprite.phase)
    // Fade out behind the site navbar so sprites never sit under its links and buttons.
    alpha *= Math.min(1, Math.max(0, (sprite.y - NAVBAR_FADE_START) / NAVBAR_FADE_RANGE))
    return Math.min(1, alpha)
  }

  const drawSprite = (sprite: Sprite, t: number, moving: boolean) => {
    ctx.save()
    ctx.globalAlpha = alphaFor(sprite, t)
    if (sprite.far) ctx.filter = 'blur(2px)'
    if (sprite.glow > 0.05) {
      ctx.shadowColor = `rgba(45, 212, 191, ${0.7 * sprite.glow})`
      ctx.shadowBlur = 16 * sprite.glow
    }
    ctx.translate(sprite.x, sprite.y)
    if (sprite.kind === PUMPKIN && moving) ctx.rotate(Math.sin(t / 1600 + sprite.phase) * 0.08)
    ctx.scale(sprite.size / 24, sprite.size / 24)
    const flap = sprite.kind === BAT && moving ? 0.55 + 0.45 * Math.abs(Math.sin(t / 140 + sprite.phase)) : 1
    drawHalloweenParticle(ctx, sprite.kind, flap)
    ctx.restore()
  }

  const drawLight = () => {
    if (!flashlight() || !pointer) return
    const light = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, LIGHT_RADIUS)
    light.addColorStop(0, 'rgba(45, 212, 191, 0.07)')
    light.addColorStop(1, 'rgba(45, 212, 191, 0)')
    ctx.fillStyle = light
    ctx.fillRect(pointer.x - LIGHT_RADIUS, pointer.y - LIGHT_RADIUS, LIGHT_RADIUS * 2, LIGHT_RADIUS * 2)
  }

  const frame = (t: number) => {
    const moving = !reducedMotion.matches
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawLight()
    for (const sprite of sprites) {
      if (moving) step(sprite, t)
      drawSprite(sprite, t, moving)
    }
    if (moving) rafId = requestAnimationFrame(frame)
  }

  const restart = () => {
    cancelAnimationFrame(rafId)
    frame(performance.now())
  }
  const onResize = () => {
    resize()
    restart()
  }
  const onPointerMove = (event: PointerEvent) => {
    pointer = { x: event.clientX, y: event.clientY }
  }
  const onPointerLeave = () => {
    pointer = null
  }

  resize()
  window.addEventListener('resize', onResize)
  reducedMotion.addEventListener('change', restart)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onPointerLeave)
  frame(start)

  return () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    reducedMotion.removeEventListener('change', restart)
    window.removeEventListener('pointermove', onPointerMove)
    document.documentElement.removeEventListener('pointerleave', onPointerLeave)
  }
}
