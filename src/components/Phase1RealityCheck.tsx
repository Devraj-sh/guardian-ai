import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, AlertCircle, Smartphone, X } from 'lucide-react';
import { ScamNotification, UserInteraction, NotificationType } from '@/types/scam';
import { phase1Notifications } from '@/data/scamNotifications';

interface Phase1RealityCheckProps {
  onComplete: (interactions: UserInteraction[]) => void;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'whatsapp':
      return <MessageSquare className="w-5 h-5 text-success" />;
    case 'sms':
      return <Smartphone className="w-5 h-5 text-blue-400" />;
    case 'email':
      return <Mail className="w-5 h-5 text-warning" />;
    case 'alert':
      return <AlertCircle className="w-5 h-5 text-destructive" />;
  }
};

const getNotificationClass = (type: NotificationType) => {
  switch (type) {
    case 'whatsapp':
      return 'notification-whatsapp';
    case 'sms':
      return 'notification-sms';
    case 'email':
      return 'notification-email';
    case 'alert':
      return 'notification-danger';
  }
};

export const Phase1RealityCheck = ({ onComplete }: Phase1RealityCheckProps) => {
  const [visibleNotifications, setVisibleNotifications] = useState<ScamNotification[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isComplete, setIsComplete] = useState(false);

  const addNotification = useCallback(() => {
    if (currentIndex < phase1Notifications.length) {
      setVisibleNotifications(prev => [phase1Notifications[currentIndex], ...prev]);
      setCurrentIndex(prev => prev + 1);
      setStartTime(Date.now());
    } else if (visibleNotifications.length === 0 && interactions.length > 0) {
      setIsComplete(true);
    }
  }, [currentIndex, visibleNotifications.length, interactions.length]);

  useEffect(() => {
    const timer = setTimeout(addNotification, currentIndex === 0 ? 500 : 2500);
    return () => clearTimeout(timer);
  }, [currentIndex, addNotification]);

  useEffect(() => {
    if (isComplete) {
      onComplete(interactions);
    }
  }, [isComplete, interactions, onComplete]);

  const handleInteraction = (notification: ScamNotification, action: 'opened' | 'ignored') => {
    const reactionTime = Date.now() - startTime;
    
    setInteractions(prev => [...prev, {
      notificationId: notification.id,
      action,
      reactionTime,
      timestamp: Date.now(),
    }]);

    setVisibleNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  const scamsOpened = interactions.filter(i => {
    const notification = phase1Notifications.find(n => n.id === i.notificationId);
    return notification?.isScam && i.action === 'opened';
  }).length;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-start pt-20 px-4 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-destructive">Phase 1:</span> Reality Check
        </h2>
        <p className="text-muted-foreground">
          Your phone is buzzing. React naturally — Open or Ignore each notification.
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div 
        className="w-full max-w-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Messages processed</span>
          <span>{interactions.length} / {phase1Notifications.length}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(interactions.length / phase1Notifications.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Notification Stack */}
      <div className="w-full max-w-md space-y-3 relative">
        <AnimatePresence>
          {visibleNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              className={`${getNotificationClass(notification.type)} rounded-lg p-4 glass-card cursor-pointer relative overflow-hidden`}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1, y: index * 8, scale: 1 - index * 0.02 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ zIndex: visibleNotifications.length - index }}
              onClick={() => handleInteraction(notification, 'opened')}
            >
              {/* Scan line effect */}
              <div className="absolute inset-0 scan-line opacity-30 pointer-events-none" />
              
              <div className="flex items-start gap-3 relative">
                <div className="mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-foreground truncate">
                      {notification.sender}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.preview}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInteraction(notification, 'ignored');
                  }}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Action hint */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInteraction(notification, 'opened');
                  }}
                  className="flex-1 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded transition-colors"
                >
                  Open
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInteraction(notification, 'ignored');
                  }}
                  className="flex-1 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded transition-colors"
                >
                  Ignore
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Waiting for more */}
        {visibleNotifications.length === 0 && currentIndex < phase1Notifications.length && (
          <motion.div
            className="text-center py-8 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>More messages incoming...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Hidden scam counter */}
      {scamsOpened > 0 && (
        <motion.div
          className="fixed bottom-4 right-4 bg-destructive/20 text-destructive px-4 py-2 rounded-lg font-mono text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.6, y: 0 }}
        >
          ⚠ {scamsOpened} potential threats engaged
        </motion.div>
      )}
    </motion.div>
  );
};
