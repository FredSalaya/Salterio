import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen({ storageKey }) {
    const [isVisible, setIsVisible] = useState(() => {
        // If running on client and storageKey is provided, check if visited
        if (typeof window !== 'undefined' && storageKey) {
            return !sessionStorage.getItem(storageKey)
        }
        return true
    })
    const [progress, setProgress] = useState(0)
    const [particles, setParticles] = useState([])
    const [bubbles, setBubbles] = useState([])

    useEffect(() => {
        // If not visible (already visited), don't run animations
        if (!isVisible) return

        // If we are showing it and have a key, mark as visited for next time
        if (storageKey && typeof window !== 'undefined') {
            sessionStorage.setItem(storageKey, 'true')
        }

        // Generate particles only on client side
        const newParticles = [...Array(20)].map((_, i) => ({
            id: i,
            initialX: Math.random() * window.innerWidth,
            initialY: window.innerHeight + 100,
            scale: Math.random() * 0.5 + 0.5,
            targetY: -100,
            targetX: Math.random() * window.innerWidth,
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
            width: Math.random() * 50 + 20,
            height: Math.random() * 50 + 20,
        }))
        setParticles(newParticles)

        // Generate bubbles
        const newBubbles = [...Array(10)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2,
            size: 4 + Math.random() * 6
        }))
        setBubbles(newBubbles)

        // Simulate progress
        const duration = 2500 // 2.5s (Faster)
        const interval = 50
        const steps = duration / interval
        const increment = 100 / steps

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + increment
                if (next >= 100) {
                    clearInterval(timer)
                    return 100
                }
                return next
            })
        }, interval)

        const exitTimer = setTimeout(() => {
            setIsVisible(false)
        }, duration + 500) // Wait a bit after 100%

        return () => {
            clearInterval(timer)
            clearTimeout(exitTimer)
        }
    }, [isVisible, storageKey])

    // Wave SVG Data URI
    const waveSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%23ffffff'/%3E%3C/svg%3E")`

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
                >
                    {/* Background Elements (Subtle Particles) */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {particles.map((p) => (
                            <motion.div
                                key={p.id}
                                className="absolute bg-blue-100 rounded-full opacity-30"
                                initial={{
                                    x: p.initialX,
                                    y: p.initialY,
                                    scale: p.scale
                                }}
                                animate={{
                                    y: p.targetY,
                                    x: p.targetX
                                }}
                                transition={{
                                    duration: p.duration,
                                    repeat: Infinity,
                                    ease: "linear",
                                    delay: p.delay
                                }}
                                style={{
                                    width: p.width,
                                    height: p.height,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">

                        {/* 1. Base Layer: Black Logo (Faded) */}
                        <img
                            src="/logos/logo_salterio_negro.svg"
                            alt="Salterio Outline"
                            className="absolute inset-0 w-full h-full object-contain opacity-10 grayscale"
                        />

                        {/* 2. Foreground: Color Logo (Revealed by Water) */}
                        <motion.div
                            initial={{ height: "0%" }}
                            animate={{ height: "100%" }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                            className="absolute bottom-0 left-0 w-full overflow-hidden z-10"
                        >
                            <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80">
                                <img
                                    src="/logos/logo_salterio_color.svg"
                                    alt="Salterio Color"
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                />
                            </div>

                            {/* Bubbles inside the water */}
                            {bubbles.map((b) => (
                                <motion.div
                                    key={`bubble-${b.id}`}
                                    className="absolute bg-white/40 rounded-full"
                                    initial={{ bottom: -20, left: `${b.left}%`, scale: 0 }}
                                    animate={{ bottom: '120%', scale: [0, 1, 0] }}
                                    transition={{
                                        duration: b.duration,
                                        repeat: Infinity,
                                        delay: b.delay,
                                        ease: "easeOut"
                                    }}
                                    style={{ width: b.size, height: b.size }}
                                />
                            ))}

                            {/* Wave 1 (Back/Slower) */}
                            <motion.div
                                className="absolute top-0 left-0 w-[200%] h-8 -mt-4 z-20 opacity-50"
                                style={{
                                    backgroundImage: waveSvg,
                                    backgroundSize: '50% 100%',
                                    backgroundRepeat: 'repeat-x'
                                }}
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Wave 2 (Front/Faster) */}
                            <motion.div
                                className="absolute top-0 left-0 w-[200%] h-8 -mt-4 z-30"
                                style={{
                                    backgroundImage: waveSvg,
                                    backgroundSize: '50% 100%',
                                    backgroundRepeat: 'repeat-x'
                                }}
                                animate={{ x: ["-50%", "0%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        </motion.div>
                    </div>

                    {/* Progress Counter & Text */}
                    <div className="mt-8 flex flex-col items-center z-20">
                        <motion.div
                            className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-mono"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {Math.round(progress)}%
                        </motion.div>
                        <motion.p
                            className="text-gray-400 text-xs tracking-[0.2em] uppercase mt-2"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            Cargando Salterio...
                        </motion.p>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    )
}
