import { useEffect, useRef } from "react"

/**
 * Wireframe-style particle background with connecting lines (ported from MLVScan-site).
 * Particles move and bounce; lines connect nearby particles with distance-based opacity.
 */
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    const particlesArray: Particle[] = []
    const numberOfParticles = Math.min(150, Math.floor(window.innerWidth / 10))
    // Reduced opacity colors
    const colors = [
      "rgba(45, 212, 191, 0.4)",
      "rgba(6, 182, 212, 0.4)",
      "rgba(34, 197, 94, 0.4)",
      "rgba(255, 255, 255, 0.2)",
    ]

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * (canvas?.width ?? window.innerWidth)
        this.y = Math.random() * (canvas?.height ?? window.innerHeight)
        this.size = Math.random() * 3 + 1.5
        this.speedX = (Math.random() - 0.5) * 1.25
        this.speedY = (Math.random() - 0.5) * 1.25
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        if (!canvas) return
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY
        this.x += this.speedX
        this.y += this.speedY
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)" // Reduced stroke opacity
        ctx.lineWidth = 0.3
        ctx.stroke()
      }
    }

    const init = () => {
      particlesArray.length = 0
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle())
      }
    }

    const maxDistance = 180
    const connect = () => {
      if (!ctx) return
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x
          const dy = particlesArray[a].y - particlesArray[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.15 // Reduced max connection opacity
            ctx.strokeStyle = `rgba(45, 212, 191, ${opacity})`
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
            ctx.stroke()
          }
        }
      }
    }

    let rafId = 0
    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
      }
      connect()
      rafId = requestAnimationFrame(animate)
    }

    init()
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 opacity-20 pointer-events-none" // Reduced overall opacity
      style={{ zIndex: -10 }}
      aria-hidden="true"
    />
  )
}

export default ParticleBackground
