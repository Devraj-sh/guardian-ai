import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingScreenProps {
  onStart: () => void;
}

export const LandingScreen = ({ onStart }: LandingScreenProps) => {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-primary/20"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield size={60} />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-destructive/20"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <AlertTriangle size={50} />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-20 text-warning/20"
          animate={{ y: [-5, 15, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap size={40} />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        className="text-center max-w-4xl"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">
            Adversarial AI Training System
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Would <span className="text-gradient-cyber">YOU</span> fall for
          <br />
          this digital scam?
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          An adversarial AI system training Indians to resist cyber fraud.
          <br />
          <span className="text-foreground/80">UPI fraud • Fake KYC alerts • WhatsApp scams • Cybercrime warnings</span>
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="group relative px-8 py-6 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(45,212,191,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start 2-Minute Training
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[
            { value: '₹1,750 Cr', label: 'Lost to digital scams in 2023' },
            { value: '65%', label: 'Victims trusted "official" messages' },
            { value: '2 Min', label: 'To build resistance' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-gradient-cyber">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom Quote */}
      <motion.div
        className="absolute bottom-8 text-center text-muted-foreground/60 text-sm font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        "We don't stop scams by blocking messages. We stop scams by upgrading human judgment."
      </motion.div>
    </motion.div>
  );
};
