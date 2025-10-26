'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface NeuralCardProps {
  children: React.ReactNode
  className?: string
}

export function NeuralCard({ children, className = '' }: NeuralCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ['7.5deg', '-7.5deg'])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-7.5deg', '7.5deg'])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const x = (e.clientX - centerX) / rect.width
      const y = (e.clientY - centerY) / rect.height

      mouseX.set(x)
      mouseY.set(y)
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative group cursor-pointer',
        className
      )}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 glassmorphism rounded-2xl" />
      
      {/* Neural effect overlay */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
      
      {/* Border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/20 via-accent-500/20 to-primary-500/20 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="w-full h-full rounded-2xl bg-transparent" />
      </div>
    </motion.div>
  )
}
