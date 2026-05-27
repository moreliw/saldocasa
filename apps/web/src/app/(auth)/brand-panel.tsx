'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-brand-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Gradient orbs animados */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full"
        style={{
          background: 'radial-gradient(closest-side, rgba(86,114,159,0.45), transparent 70%)',
        }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-[32rem] w-[32rem] rounded-full"
        style={{
          background: 'radial-gradient(closest-side, rgba(16,185,129,0.22), transparent 70%)',
        }}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src="/brand/logo-mark.png"
          alt="saldocasa"
          width={56}
          height={56}
          priority
          className="rounded-2xl bg-white/95 p-1.5 shadow-elevated"
        />
      </motion.div>

      <motion.h2
        className="relative max-w-md font-display text-4xl font-semibold leading-tight tracking-tight"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        A casa toda no azul.
      </motion.h2>

      <div className="relative text-xs text-white/40">© {new Date().getFullYear()} saldocasa</div>
    </div>
  );
}
