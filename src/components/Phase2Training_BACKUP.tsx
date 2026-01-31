import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScamNotification, ScamTactic } from '@/types/scam';
import { phase1Notifications } from '@/data/scamNotifications';

interface Phase2TrainingProps {
  onComplete: (trainedTactics: ScamTactic[]) => void;
}

type DefuseStep = 1 | 2 | 3;

type TacticOption = 'urgency' | 'authority' | 'emotional' | 'fake-link';
type VerificationOption = 'check-link' | 'official-source' | 'ignore-urgency' | 'cross-check';
type ActionOption = 'ignore' | 'report' | 'block';

const getTacticMapping = (): Record<TacticOption, ScamTactic[]> => ({
  'urgency': ['urgency'],
  'authority': ['authority', 'impersonation'],
  'emotional': ['emotional', 'threat', 'reward'],
  'fake-link': ['fake-link'],
});

export const Phase2Training = ({ onComplete }: Phase2TrainingProps) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [currentStep, setCurrentStep] = useState<DefuseStep>(1);
  const [timer, setTimer] = useState(20);
  const [consecutiveSuccess, setConsecutiveSuccess] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedTactic, setSelectedTactic] = useState<TacticOption | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<VerificationOption | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showAdaptiveMessage, setShowAdaptiveMessage] = useState(false);
  const [trainedTactics, setTrainedTactics] = useState<ScamTactic[]>([]);

  const scamNotifications = phase1Notifications.filter(n => n.isScam);
  const currentNotification = scamNotifications[currentRound % scamNotifications.length];

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && !showFeedback && !isComplete && !timerPaused) {
      const interval = setInterval(() => {
        setTimer(t => Math.max(0, t - 0.1));
      }, 100);
      return () => clearInterval(interval);
    } else if (timer <= 0 && !showFeedback) {
      handleTimerExpired();
    }
  }, [timer, showFeedback, isComplete, timerPaused]);

  const handleTimerExpired = () => {
    setFeedbackMessage('â±ï¸ Time expired! Stay calm and analyze faster next time.');
    setIsCorrect(false);
    setShowFeedback(true);
    setConsecutiveSuccess(0);
    setTimeout(() => {
      nextRound();
    }, 2500);
  };

  const getBackgroundGradient = () => {
    if (timer > 12) {
      return 'from-green-950 via-green-900 to-emerald-950';
    } else if (timer > 6) {
      return 'from-yellow-950 via-yellow-900 to-orange-950';
    } else {
      return 'from-red-950 via-red-900 to-rose-950';
    }
  };

  const checkTacticMatch = (selected: TacticOption): boolean => {
    const mapping = getTacticMapping();
    const mappedTactics = mapping[selected];
    return currentNotification.tactics.some(t => mappedTactics.includes(t));
  };

  const handleStep1 = (tactic: TacticOption) => {
    setSelectedTactic(tactic);
    const correct = checkTacticMatch(tactic);
    
    if (correct) {
      setFeedbackMessage('âœ“ Correct! Tactic identified.');
      setIsCorrect(true);
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        setCurrentStep(2);
      }, 1200);
    } else {
      setFeedbackMessage('âœ— Not quite. Focus on the core manipulation.');
      setIsCorrect(false);
      setShowFeedback(true);
      setTimerPaused(true);
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedTactic(null);
        setTimerPaused(false);
        setTimer(t => Math.min(t + 2, 20));
      }, 1500);
    }
  };

  const handleStep2 = (verification: VerificationOption) => {
    setSelectedVerification(verification);
    setFeedbackMessage('âœ“ Good verification strategy!');
    setIsCorrect(true);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      setCurrentStep(3);
    }, 1200);
  };

  const handleStep3 = (action: ActionOption) => {
    setSelectedAction(action);
    const successCount = consecutiveSuccess + 1;
    setConsecutiveSuccess(successCount);
    
    const newTrainedTactics = [...new Set([...trainedTactics, ...currentNotification.tactics])];
    setTrainedTactics(newTrainedTactics);

    if (successCount >= 3) {
      setFeedbackMessage('ðŸŽ¯ Pattern mastered! You resisted this manipulation.');
      setIsCorrect(true);
      setShowFeedback(true);
      setTimeout(() => {
        onComplete(newTrainedTactics);
      }, 2500);
    } else {
      setFeedbackMessage(`âœ“ Scam defused! Streak: ${successCount}/3`);
      setIsCorrect(true);
      setShowFeedback(true);
      setTimeout(() => {
        nextRound();
      }, 2000);
    }
  };

  const nextRound = () => {
    setShowFeedback(false);
    setShowAdaptiveMessage(true);
    
    const newTimer = Math.max(10, 20 - consecutiveSuccess * 2);
    
    setTimeout(() => {
      setShowAdaptiveMessage(false);
      setCurrentRound(r => r + 1);
      setCurrentStep(1);
      setTimer(newTimer);
      setSelectedTactic(null);
      setSelectedVerification(null);
      setSelectedAction(null);
      setTimerPaused(false);
    }, 2000);
  };

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => {
        onComplete(trainedTactics);
      }, 1000);
    }
  }, [isComplete, trainedTactics, onComplete]);

  if (isComplete) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-950 via-emerald-900 to-teal-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="text-center max-w-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            <Shield className="w-12 h-12 text-green-400" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Pattern Mastered
          </h2>
          <p className="text-xl text-green-300 mb-2">
            You resisted this manipulation pattern.
          </p>
          <p className="text-lg text-gray-300">
            This scam no longer works on you.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`min-h-screen relative transition-all duration-1000 bg-gradient-to-br ${getBackgroundGradient()}`}
      animate={{
        opacity: timer < 3 ? [1, 0.95, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: timer < 3 ? Infinity : 0,
      }}
    >
      <AnimatePresence>
        {showAdaptiveMessage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center px-6"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <AlertTriangle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <p className="text-2xl font-bold text-white">
                Attack adjusted to test your weakest defense.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            DEFUSE THE SCAM
          </h2>
          <p className="text-gray-300 text-lg">
            Cyber fire drill â€¢ Adversarial AI pressure training
          </p>
        </motion.div>

        <motion.div
          className="mb-8"
          animate={{
            scale: timer < 6 ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: timer < 6 ? Infinity : 0,
          }}
        >
          <div className="text-center">
            <div className={`text-7xl font-mono font-bold transition-colors duration-500 ${
              timer > 12 ? 'text-green-400' :
              timer > 6 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {timer.toFixed(1)}s
            </div>
            <div className="text-gray-400 text-sm mt-2">
              Streak: {consecutiveSuccess}/3
            </div>
          </div>
        </motion.div>

        <motion.div
          className="w-full max-w-2xl mb-8 bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="text-white font-bold mb-1">{currentNotification.sender}</div>
              <div className="text-sm text-gray-400 mb-3">{currentNotification.type.toUpperCase()}</div>
              <p className="text-white leading-relaxed">{currentNotification.fullContent}</p>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-4 mb-6">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                currentStep === step
                  ? 'bg-white/20 border-2 border-white'
                  : currentStep > step
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : 'bg-white/5 border border-white/20'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep > step ? 'bg-green-500 text-white' :
                currentStep === step ? 'bg-white text-black' :
                'bg-white/20 text-gray-400'
              }`}>
                {currentStep > step ? 'âœ“' : step}
              </div>
              <span className={`text-sm font-medium ${
                currentStep >= step ? 'text-white' : 'text-gray-500'
              }`}>
                Step {step}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-3"
              >
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Identify the attack tactic
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'urgency' as TacticOption, label: 'Urgency', desc: 'Time pressure tactics' },
                    { id: 'authority' as TacticOption, label: 'Authority impersonation', desc: 'Fake official sources' },
                    { id: 'emotional' as TacticOption, label: 'Emotional manipulation', desc: 'Fear, greed, sympathy' },
                    { id: 'fake-link' as TacticOption, label: 'Fake credibility', desc: 'Suspicious links/domains' },
                  ].map((option) => (
                    <Button
                      key={option.id}
                      onClick={() => handleStep1(option.id)}
                      disabled={showFeedback}
                      className={`h-auto py-4 px-6 flex flex-col items-start text-left transition-all ${
                        selectedTactic === option.id
                          ? 'bg-white/20 border-2 border-white'
                          : 'bg-white/10 hover:bg-white/15 border border-white/20'
                      }`}
                      variant="ghost"
                    >
                      <div className="font-bold text-white text-lg">{option.label}</div>
                      <div className="text-sm text-gray-300 mt-1">{option.desc}</div>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-3"
              >
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Verify safely
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'check-link' as VerificationOption, label: 'Check link pattern', desc: 'Examine domain carefully' },
                    { id: 'official-source' as VerificationOption, label: 'Look for official source', desc: 'Verify sender authenticity' },
                    { id: 'ignore-urgency' as VerificationOption, label: 'Ignore urgency', desc: 'Take time to think' },
                    { id: 'cross-check' as VerificationOption, label: 'Cross-check channel', desc: 'Verify through official app' },
                  ].map((option) => (
                    <Button
                      key={option.id}
                      onClick={() => handleStep2(option.id)}
                      disabled={showFeedback}
                      className={`h-auto py-4 px-6 flex flex-col items-start text-left transition-all ${
                        selectedVerification === option.id
                          ? 'bg-white/20 border-2 border-white'
                          : 'bg-white/10 hover:bg-white/15 border border-white/20'
                      }`}
                      variant="ghost"
                    >
                      <div className="font-bold text-white text-lg">{option.label}</div>
                      <div className="text-sm text-gray-300 mt-1">{option.desc}</div>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-3"
              >
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Final decision
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'ignore' as ActionOption, label: 'Ignore', desc: 'Delete and move on' },
                    { id: 'report' as ActionOption, label: 'Report', desc: 'Flag as scam' },
                    { id: 'block' as ActionOption, label: 'Block', desc: 'Block sender' },
                  ].map((option) => (
                    <Button
                      key={option.id}
                      onClick={() => handleStep3(option.id)}
                      disabled={showFeedback}
                      className={`h-auto py-6 px-6 flex flex-col items-center text-center transition-all ${
                        selectedAction === option.id
                          ? 'bg-white/20 border-2 border-white'
                          : 'bg-white/10 hover:bg-white/15 border border-white/20'
                      }`}
                      variant="ghost"
                    >
                      <div className="font-bold text-white text-2xl mb-2">{option.label}</div>
                      <div className="text-sm text-gray-300">{option.desc}</div>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={`px-8 py-6 rounded-2xl backdrop-blur-md ${
                  isCorrect
                    ? 'bg-green-500/20 border-2 border-green-400'
                    : 'bg-red-500/20 border-2 border-red-400'
                }`}
                initial={{ scale: 0.8, y: 20 }}
                animate={{
                  scale: isCorrect ? 1 : [1, 0.95, 1, 0.95, 1],
                  y: 0,
                }}
                transition={{
                  duration: isCorrect ? 0.3 : 0.5,
                }}
              >
                <div className="flex items-center gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400" />
                  )}
                  <p className="text-xl font-bold text-white">{feedbackMessage}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

