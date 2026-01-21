'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface CallOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAvatar: string;
}

export default function CallOverlay({ isOpen, onClose, recipientName, recipientAvatar }: CallOverlayProps) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isOpen) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-text-main/80 backdrop-blur-md z-[-1]"
          />

          {/* Call Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-[380px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col items-center p-10 relative"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>

            {/* Recipient Info */}
            <div className="relative mb-10 flex flex-col items-center z-10">
              <div className="relative">
                <div className="size-28 rounded-4xl bg-cover bg-center border-4 border-white shadow-xl" style={{ backgroundImage: `url('${recipientAvatar}')` }}></div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-4 border-2 border-primary rounded-[2.5rem] pointer-events-none"
                ></motion.div>
              </div>

              <h3 className="text-2xl font-black text-text-main mt-8 tracking-tight">{recipientName}</h3>
              <p className="text-primary font-black text-xs uppercase tracking-[0.2em] mt-2 mb-1">On Call</p>
              <p className="text-text-main font-black text-xl tabular-nums">{formatTime(timer)}</p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-6 w-full z-10 mb-10">
              <div className="flex flex-col items-center gap-2">
                <button className="size-14 rounded-full bg-gray-50 flex items-center justify-center text-text-secondary hover:bg-gray-100 transition-all active:scale-90">
                  <span className="material-symbols-outlined text-2xl">mic_off</span>
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Mute</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="size-14 rounded-full bg-gray-50 flex items-center justify-center text-text-secondary hover:bg-gray-100 transition-all active:scale-90">
                  <span className="material-symbols-outlined text-2xl">volume_up</span>
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Speaker</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button className="size-14 rounded-full bg-gray-50 flex items-center justify-center text-text-secondary hover:bg-gray-100 transition-all active:scale-90">
                  <span className="material-symbols-outlined text-2xl">videocam</span>
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Video</span>
              </div>
            </div>

            {/* End Call Button */}
            <div className="w-full flex flex-col gap-3">
              <a
                href="tel:+2348000000000"
                className="w-full h-16 bg-primary hover:bg-primary-hover text-white rounded-[1.25rem] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 font-black tracking-tight transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-2xl">call</span>
                Real-life Call
              </a>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 bg-gray-100 text-text-secondary rounded-[1.25rem] flex items-center justify-center gap-2 font-black tracking-tight text-xs uppercase transition-all"
              >
                End Simulation
              </motion.button>
            </div>

            {/* Security Note */}
            <p className="mt-8 text-[10px] text-text-secondary font-black uppercase tracking-[0.2em] opacity-40">
              End-to-end Encrypted Voice
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
