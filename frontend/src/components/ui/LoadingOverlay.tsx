'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Compass } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({ isVisible, message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden"
        >
          {/* Decorative Background Elements (Consistent with Dashboard) */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[140px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
                x: [0, -40, 0],
                y: [0, 40, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" 
            />
            <div className="absolute top-[20%] left-[10%] w-px h-[60%] bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />
            <div className="absolute top-[30%] right-[15%] w-px h-[40%] bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Branding Logo Type */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                Safari<span className="text-blue-600">Hub</span>
              </span>
            </motion.div>

            {/* Main Glassmorphic Card (Matching Dashboard GlassCard) */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/70 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/20 dark:border-gray-800/50 rounded-[3.5rem] p-12 sm:p-16 shadow-2xl shadow-blue-500/10 flex flex-col items-center gap-10"
            >
              <div className="relative">
                {/* Multi-layered Animated Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-[3px] border-blue-500/5 border-t-blue-600 rounded-full"
                />
                
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border-[1px] border-emerald-500/20 border-b-emerald-500 rounded-full"
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Compass className="w-12 h-12 text-blue-600" />
                  </motion.div>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="space-y-1">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-black text-gray-900 dark:text-white tracking-tight text-center"
                  >
                    {message}
                  </motion.p>
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Please wait while we prepare your journey
                  </p>
                </div>

                <div className="flex gap-2 mt-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -8, 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut"
                      }}
                      className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Footer Note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-600"
            >
              Verified Secure Session
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
