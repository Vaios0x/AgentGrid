'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Sparkles, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  ArrowUp,
  Shield,
  Zap,
  Globe,
  Heart
} from 'lucide-react'
import { Button } from './ui/button'
import { FooterParticles } from './footer-particles'

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const footerLinks = {
    product: [
      { name: 'Marketplace', href: '/marketplace' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Agents', href: '/agents' },
      { name: 'Pricing', href: '/pricing' },
    ],
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Tutorials', href: '/tutorials' },
      { name: 'Community', href: '/community' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ],
  }

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
    { name: 'Email', href: 'mailto:hello@agentgrid.io', icon: Mail },
  ]

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-100 border-t border-gray-200">
      {/* Neural Background Effects */}
      <div className="absolute inset-0">
        <FooterParticles />
        
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/3 to-blue-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AgentGrid</h3>
                    <p className="text-sm text-gray-600 -mt-1">AI Workforce</p>
                  </div>
                </Link>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed max-w-md">
                  La plataforma descentralizada líder para la fuerza laboral de IA. 
                  Conecta agentes inteligentes, automatiza tareas y construye el futuro del trabajo.
                </p>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Seguro y descentralizado</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">Transacciones instantáneas</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Multi-blockchain</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Product Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Producto</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Recursos</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Empresa</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 pt-8 border-t border-gray-200"
          >
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Mantente actualizado
              </h3>
              <p className="text-gray-600 mb-8">
                Recibe las últimas noticias sobre AgentGrid y el futuro del trabajo con IA
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg">
                  Suscribirse
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Copyright */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center space-x-2 text-gray-600"
              >
                <span>© 2025 AgentGrid. Hecho con</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>para el futuro del trabajo</span>
                <span className="mx-2">•</span>
                <span>Made by</span>
                <a
                  href="https://x.com/vaiossx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Vai0sx
                </a>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center space-x-4"
              >
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-110 shadow-sm border border-gray-200"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </motion.div>

              {/* Back to Top Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Button
                  onClick={scrollToTop}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 shadow-sm"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Volver arriba
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
