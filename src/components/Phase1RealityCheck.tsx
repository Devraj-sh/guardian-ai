import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, AlertCircle, Smartphone, X, Video, Send, ExternalLink, Download, CheckCheck } from 'lucide-react';
import { ScamNotification, UserInteraction, NotificationType } from '@/types/scam';
import { phase1Notifications } from '@/data/scamNotifications';
import { Button } from '@/components/ui/button';

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
  const [isVibrating, setIsVibrating] = useState(false);
  const [showIncomingAlert, setShowIncomingAlert] = useState(false);
  const [openedNotification, setOpenedNotification] = useState<ScamNotification | null>(null);

  const addNotification = useCallback(() => {
    if (currentIndex < phase1Notifications.length) {
      // Show incoming alert and vibrate
      setShowIncomingAlert(true);
      setIsVibrating(true);
      
      // Play notification sound if available
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      setTimeout(() => {
        setVisibleNotifications(prev => [phase1Notifications[currentIndex], ...prev]);
        setCurrentIndex(prev => prev + 1);
        setStartTime(Date.now());
        setShowIncomingAlert(false);
        setIsVibrating(false);
      }, 800);
    } else if (visibleNotifications.length === 0 && interactions.length > 0) {
      setIsComplete(true);
    }
  }, [currentIndex, visibleNotifications.length, interactions.length]);

  useEffect(() => {
    const timer = setTimeout(addNotification, currentIndex === 0 ? 500 : 5000);
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

    if (action === 'opened') {
      setOpenedNotification(notification);
    } else {
      setVisibleNotifications(prev => prev.filter(n => n.id !== notification.id));
    }
  };



  const closeOpenedNotification = (interacted: boolean = false) => {
    if (openedNotification) {
      if (!interacted) {
        // User closed without interacting - mark as ignored
        const reactionTime = Date.now() - startTime;
        setInteractions(prev => {
          // Remove the 'opened' interaction and replace with 'ignored'
          const filtered = prev.filter(i => i.notificationId !== openedNotification.id);
          return [...filtered, {
            notificationId: openedNotification.id,
            action: 'ignored',
            reactionTime,
            timestamp: Date.now(),
          }];
        });
      }
      setVisibleNotifications(prev => prev.filter(n => n.id !== openedNotification.id));
      setOpenedNotification(null);
    }
  };

  // Render realistic app interface based on type
  const renderAppInterface = (notification: ScamNotification) => {
    switch (notification.type) {
      case 'whatsapp':
        return (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0b141a] flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* WhatsApp Header */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
              <button onClick={() => closeOpenedNotification(false)} className="text-[#8696a0] hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#6fc276] flex items-center justify-center text-white font-bold">
                {notification.sender[0]}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{notification.sender}</div>
                <div className="text-xs text-[#8696a0]">online</div>
              </div>
              <Video className="w-5 h-5 text-[#8696a0]" />
            </div>

            {/* Chat Background */}
            <div className="flex-1 p-4 overflow-y-auto" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23182229\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z\'/%3E%3C/g%3E%3C/svg%3E")' }}>
              {/* Message Bubble */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-[#202c33] rounded-lg p-3 max-w-[85%] shadow-lg">
                  <p className="text-white text-sm whitespace-pre-wrap">{notification.fullContent}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-[#8696a0]">{notification.timestamp}</span>
                    <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="bg-[#202c33] p-4 space-y-2">
              {notification.isScam ? (
                <>
                  <Button
                    onClick={() => closeOpenedNotification(true)}
                    className="w-full bg-[#00a884] hover:bg-[#06cf9c] text-white font-medium py-3 rounded-lg"
                  >
                    {notification.id.includes('job') ? 'Apply Now' : 
                     notification.id.includes('loan') ? 'Reply YES' : 'Open Link'}
                  </Button>
                  <Button
                    onClick={() => closeOpenedNotification(false)}
                    variant="outline"
                    className="w-full border-[#8696a0] text-[#8696a0] hover:bg-[#202c33] py-3 rounded-lg"
                  >
                    Report & Block
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => closeOpenedNotification(false)}
                    className="w-full bg-[#202c33] hover:bg-[#2a3942] text-[#8696a0] border border-[#8696a0] py-3 rounded-lg"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => closeOpenedNotification(false)}
                    variant="ghost"
                    className="w-full text-[#8696a0] hover:bg-[#202c33] py-2 rounded-lg"
                  >
                    Close
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        );

      case 'sms':
        return (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* SMS Header */}
            <div className="bg-gradient-to-b from-blue-600 to-blue-700 px-4 py-4 flex items-center gap-3 text-white">
              <button onClick={() => closeOpenedNotification(false)}>
                <X className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <div className="text-lg font-medium">{notification.sender}</div>
                <div className="text-xs opacity-80">SMS Message</div>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 bg-gray-100 p-4">
              <motion.div
                className="bg-white rounded-2xl p-4 shadow-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {notification.sender[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{notification.sender}</div>
                    <div className="text-xs text-gray-500">{notification.timestamp}</div>
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{notification.fullContent}</p>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white p-4 border-t space-y-2">
              {notification.isScam ? (
                <>
                  <Button
                    onClick={() => closeOpenedNotification(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    {notification.id.includes('kyc') ? 'Update KYC Now' :
                     notification.id.includes('refund') ? 'Claim Refund' :
                     notification.id.includes('cybercrime') ? 'Call Number' :
                     notification.id.includes('delivery') ? 'Reschedule Now' : 'Open Link'}
                  </Button>
                  <Button
                    onClick={() => closeOpenedNotification(false)}
                    variant="outline"
                    className="w-full py-3 rounded-xl"
                  >
                    Delete Message
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => closeOpenedNotification(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl"
                  >
                    View in App
                  </Button>
                  <Button
                    onClick={() => closeOpenedNotification(false)}
                    variant="ghost"
                    className="w-full text-gray-500 py-2"
                  >
                    Close
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        );

      case 'email':
        return (
          <motion.div
            className="fixed inset-0 z-50 bg-white flex flex-col"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Email Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
              <button onClick={() => closeOpenedNotification(false)}>
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex-1 text-lg font-semibold text-gray-900">
                {notification.sender.split('@')[0]}
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
                {/* Email Sender Info */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                    {notification.sender[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{notification.sender}</div>
                    <div className="text-sm text-gray-500">to: me</div>
                  </div>
                  <div className="text-sm text-gray-500">{notification.timestamp}</div>
                </div>

                {/* Email Body */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">{notification.preview}</h3>
                  <div className="prose prose-sm">
                    <p className="text-gray-700 leading-relaxed">{notification.fullContent}</p>
                  </div>
                </div>

                {/* CTA Button in Email */}
                {notification.isScam && (
                  <div className="mt-6 pt-6 border-t">
                    <Button
                      onClick={() => closeOpenedNotification(true)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      {notification.id.includes('reward') ? 'Redeem Points Now' : 'Verify Account'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Email Actions */}
            <div className="bg-white border-t px-4 py-3 flex gap-2">
              {notification.isScam ? (
                <>
                  <Button
                    onClick={() => closeOpenedNotification(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Archive
                  </Button>
                  <Button
                    onClick={() => closeOpenedNotification(false)}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Report Spam
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => closeOpenedNotification(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Archive
                  </Button>
                  <Button
                    onClick={() => closeOpenedNotification(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Mark Read
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        );

      case 'alert':
        return (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-red-900 to-red-950 rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-red-500"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              {/* Alert Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Alert Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                URGENT SECURITY ALERT
              </h2>
              <div className="text-sm text-red-300 text-center mb-4">{notification.sender}</div>

              {/* Alert Message */}
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <p className="text-white leading-relaxed text-center">{notification.fullContent}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {notification.isScam ? (
                  <>
                    <Button
                      onClick={() => closeOpenedNotification(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-lg animate-pulse"
                    >
                      {notification.id.includes('cybercrime') ? 'CALL NOW' :
                       notification.id.includes('electricity') ? 'PAY NOW' : 'TAKE ACTION'}
                    </Button>
                    <Button
                      onClick={() => closeOpenedNotification(false)}
                      variant="ghost"
                      className="w-full text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Dismiss
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => closeOpenedNotification(false)}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl"
                    >
                      OK
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const scamsOpened = interactions.filter(i => {
    const notification = phase1Notifications.find(n => n.id === i.notificationId);
    return notification?.isScam && i.action === 'opened';
  }).length;

  return (
    <motion.div
      className={`min-h-screen flex flex-col items-center justify-start pt-20 px-4 relative z-10 transition-all duration-200 ${
        isVibrating ? 'animate-shake' : ''
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Phone Frame Simulation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 border-[16px] border-gray-900 rounded-[40px] shadow-2xl" />
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900/50 backdrop-blur-sm flex items-center justify-between px-6 text-white text-xs">
          <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex gap-2">
            <span>5G</span>
            <span>WiFi</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Incoming Notification Alert */}
      <AnimatePresence>
        {showIncomingAlert && (
          <motion.div
            className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="flex items-center gap-3 text-white">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">New notification incoming...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Notification LED Indicator */}
      {visibleNotifications.length > 0 && (
        <motion.div
          className="fixed top-4 right-8 w-3 h-3 rounded-full bg-red-500 z-50"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

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
              className={`rounded-2xl p-4 cursor-pointer relative overflow-hidden shadow-xl ${
                notification.type === 'whatsapp' ? 'bg-[#202c33]' :
                notification.type === 'sms' ? 'bg-white' :
                notification.type === 'email' ? 'bg-gradient-to-br from-orange-50 to-red-50' :
                'bg-gradient-to-br from-red-900 to-red-950'
              }`}
              initial={{ y: -100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 - index * 0.02 }}
              exit={{ x: index === 0 ? 0 : -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ zIndex: visibleNotifications.length - index }}
              onClick={() => handleInteraction(notification, 'opened')}
            >
              {/* Notification Badge */}
              <div className="absolute top-2 left-2">
                {notification.type === 'whatsapp' && (
                  <div className="w-8 h-8 rounded-full bg-[#25d366] flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                )}
                {notification.type === 'sms' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                )}
                {notification.type === 'email' && (
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                )}
                {notification.type === 'alert' && (
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              <div className="ml-12 mr-8">
                {/* Sender */}
                <div className={`font-bold mb-1 flex items-center justify-between ${
                  notification.type === 'sms' || notification.type === 'email' ? 'text-gray-900' : 'text-white'
                }`}>
                  <span className="truncate">{notification.sender}</span>
                  <span className={`text-xs font-normal ${
                    notification.type === 'sms' || notification.type === 'email' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {notification.timestamp}
                  </span>
                </div>

                {/* App Name */}
                <div className={`text-xs mb-2 ${
                  notification.type === 'sms' || notification.type === 'email' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {notification.type === 'whatsapp' ? 'WhatsApp' :
                   notification.type === 'sms' ? 'Messages' :
                   notification.type === 'email' ? 'Gmail' : 'Security Alert'}
                </div>

                {/* Preview */}
                <p className={`text-sm line-clamp-2 ${
                  notification.type === 'sms' || notification.type === 'email' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {notification.preview}
                </p>
              </div>

              {/* Swipe to dismiss hint */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInteraction(notification, 'ignored');
                }}
                className={`absolute top-1/2 -translate-y-1/2 right-3 p-2 rounded-full transition-all ${
                  notification.type === 'sms' || notification.type === 'email' 
                    ? 'hover:bg-gray-200 text-gray-600' 
                    : 'hover:bg-white/10 text-gray-400'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Tap to open hint */}
              <motion.div
                className={`absolute bottom-2 right-2 text-xs ${
                  notification.type === 'sms' || notification.type === 'email' ? 'text-gray-400' : 'text-gray-500'
                }`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Tap to open
              </motion.div>
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

      {/* Opened App Interface */}
      <AnimatePresence>
        {openedNotification && renderAppInterface(openedNotification)}
      </AnimatePresence>

      {/* Hidden scam counter */}
      {scamsOpened > 0 && (
        <motion.div
          className="fixed bottom-4 right-4 bg-destructive/20 text-destructive px-4 py-2 rounded-lg font-mono text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.6, y: 0 }}
        >
          WARNING: {scamsOpened} potential threats engaged
        </motion.div>
      )}
    </motion.div>
  );
};
