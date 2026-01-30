import { motion } from 'framer-motion';
import { AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserInteraction } from '@/types/scam';
import { phase1Notifications } from '@/data/scamNotifications';

interface Phase1RevealProps {
  interactions: UserInteraction[];
  onContinue: () => void;
}

export const Phase1Reveal = ({ interactions, onContinue }: Phase1RevealProps) => {
  const scamsOpened = interactions.filter(i => {
    const notification = phase1Notifications.find(n => n.id === i.notificationId);
    return notification?.isScam && i.action === 'opened';
  });

  const scamsIgnored = interactions.filter(i => {
    const notification = phase1Notifications.find(n => n.id === i.notificationId);
    return notification?.isScam && i.action === 'ignored';
  });

  const totalScams = phase1Notifications.filter(n => n.isScam).length;
  const scamOpenRate = Math.round((scamsOpened.length / totalScams) * 100);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Warning Icon */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10, delay: 0.2 }}
      >
        <div className="relative">
          <AlertTriangle className="w-24 h-24 text-destructive" strokeWidth={1.5} />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-destructive"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Main Message */}
      <motion.div
        className="text-center max-w-2xl"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          You interacted with scam content
          <br />
          <span className="text-destructive">without realizing it.</span>
        </h2>

        <p className="text-lg text-muted-foreground mb-8">
          This is how most digital fraud begins in India.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 w-full max-w-2xl"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-destructive mb-2">
            {scamsOpened.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Scam messages opened
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-success mb-2">
            {scamsIgnored.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Scams correctly ignored
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 text-center col-span-2 md:col-span-1">
          <div className="text-4xl font-bold text-warning mb-2">
            {scamOpenRate}%
          </div>
          <div className="text-sm text-muted-foreground">
            Scam vulnerability rate
          </div>
        </div>
      </motion.div>

      {/* Opened Scams Preview */}
      {scamsOpened.length > 0 && (
        <motion.div
          className="w-full max-w-2xl mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-destructive" />
            Messages you opened (all scams):
          </h3>
          <div className="space-y-2">
            {scamsOpened.slice(0, 3).map((interaction, i) => {
              const notification = phase1Notifications.find(n => n.id === interaction.notificationId);
              if (!notification) return null;
              
              return (
                <motion.div
                  key={interaction.notificationId}
                  className="glass-card rounded-lg p-4 border-l-2 border-destructive"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-destructive">{notification.sender}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(interaction.reactionTime / 1000)}s reaction
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {notification.preview}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="group px-8 py-6 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(45,212,191,0.4)]"
        >
          <span className="flex items-center gap-2">
            Learn to Defend Yourself
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </motion.div>
    </motion.div>
  );
};
