'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  connections: number[]
}

export function NeuralParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configuración del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Configuración de partículas
    const particleCount = 50
    const connectionDistance = 150
    const maxConnections = 3

    // Crear partículas
    const createParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          connections: []
        })
      }
    }

    // Calcular conexiones entre partículas
    const calculateConnections = () => {
      particlesRef.current.forEach((particle, i) => {
        particle.connections = []
        particlesRef.current.forEach((otherParticle, j) => {
          if (i !== j) {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < connectionDistance && particle.connections.length < maxConnections) {
              particle.connections.push(j)
            }
          }
        })
      })
    }

    // Actualizar partículas
    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        // Mover partícula
        particle.x += particle.vx
        particle.y += particle.vy

        // Rebotar en los bordes
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1
        }

        // Mantener dentro del canvas
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Variar opacidad sutilmente
        particle.opacity += (Math.random() - 0.5) * 0.01
        particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity))
      })
    }

    // Dibujar partículas y conexiones
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Dibujar conexiones
      particlesRef.current.forEach((particle, i) => {
        particle.connections.forEach((connectionIndex) => {
          const connectedParticle = particlesRef.current[connectionIndex]
          if (connectedParticle) {
            const dx = particle.x - connectedParticle.x
            const dy = particle.y - connectedParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            // Opacidad basada en la distancia
            const opacity = (1 - distance / connectionDistance) * 0.3
            
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(connectedParticle.x, connectedParticle.y)
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      // Dibujar partículas
      particlesRef.current.forEach((particle) => {
        // Círculo exterior (glow)
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity * 0.3})`
        ctx.fill()

        // Círculo principal
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`
        ctx.fill()

        // Punto central brillante
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.8})`
        ctx.fill()
      })
    }

    // Loop de animación
    const animate = () => {
      updateParticles()
      calculateConnections()
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    // Inicializar
    createParticles()
    calculateConnections()
    animate()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}
