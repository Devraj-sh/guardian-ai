import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, AlertTriangle, Shield, ExternalLink, Phone, Ban, Flag, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScamNotification, ScamTactic } from '@/types/scam';
import { phase1Notifications } from '@/data/scamNotifications';

interface Phase2TrainingProps {
  onComplete: (trainedTactics: ScamTactic[]) => void;
}

type TrainingStep = 'recognize' | 'verify' | 'act';

interface HighlightedPhrase {
  text: string;
  type: 'urgency' | 'authority' | 'credibility';
  explanation: string;
}

const getHighlightedPhrases = (notification: ScamNotification): HighlightedPhrase[] => {
  const highlights: HighlightedPhrase[] = [];
  const content = notification.fullContent.toLowerCase();

  // Urgency phrases
  if (content.includes('urgent') || content.includes('immediately') || content.includes('24 hours') || 
      content.includes('expire') || content.includes('limited') || content.includes('tonight')) {
    highlights.push({
      text: 'URGENT/Immediately/24 hours/Expire/Limited/Tonight',
      type: 'urgency',
      explanation: 'Urgency prevents careful thinking and verification'
    });
  }

  // Authority phrases
  if (content.includes('bank') || content.includes('government') || content.includes('police') || 
      content.includes('cyber') || content.includes('income tax') || content.includes('aadhaar')) {
    highlights.push({
      text: 'Bank/Government/Police/Cyber/Income Tax/Aadhaar',
      type: 'authority',
      explanation: 'Impersonating authority to gain trust and compliance'
    });
  }

  // Credibility signals (links, account numbers, official-looking format)
  if (content.includes('http') || content.includes('www') || content.includes('.in') || content.includes('.com')) {
    highlights.push({
      text: 'Suspicious links or fake domains',
      type: 'credibility',
      explanation: 'Fake links designed to look official but aren\'t'
    });
  }

  return highlights;
};

const renderMessageWithHighlights = (text: string, showHighlights: boolean) => {
  if (!showHighlights) return <div className="text-white whitespace-pre-wrap">{text}</div>;

  const urgencyWords = ['URGENT', 'urgent', 'immediately', '24 hours', 'expire', 'expires', 'Limited', 'tonight', 'midnight', 'blocked'];
  const authorityWords = ['Bank', 'BANK', 'Government', 'Police', 'Cyber', 'Income Tax', 'Aadhaar', 'KYC', 'account'];
  const linkPattern = /(http:\/\/[^\s]+|www\.[^\s]+|[a-z-]+\.in\/[^\s]+|[a-z-]+\.com\/[^\s]+)/gi;

  let parts: JSX.Element[] = [];
  let lastIndex = 0;
  let key = 0;

  // Highlight links first
  const linkMatches = [...text.matchAll(linkPattern)];
  linkMatches.forEach(match => {
    if (match.index !== undefined) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
      }
      parts.push(
        <span key={key++} className="bg-yellow-500/30 text-yellow-200 px-1 rounded border border-yellow-400">
          {match[0]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
  });

  // Add remaining text
  let remainingText = text.slice(lastIndex);
  
  // Highlight urgency and authority words
  urgencyWords.concat(authorityWords).forEach(word => {
    const regex = new RegExp(`(${word})`, 'gi');
    const newParts: (string | JSX.Element)[] = [];
    
    if (typeof remainingText === 'string') {
      const splits = remainingText.split(regex);
      splits.forEach((part, idx) => {
        if (part.toLowerCase() === word.toLowerCase()) {
          const isUrgency = urgencyWords.some(w => w.toLowerCase() === word.toLowerCase());
          newParts.push(
            <span 
              key={`${word}-${idx}`}
              className={isUrgency 
                ? "bg-red-500/30 text-red-200 px-1 rounded border border-red-400"
                : "bg-orange-500/30 text-orange-200 px-1 rounded border border-orange-400"
              }
            >
              {part}
            </span>
          );
        } else {
          newParts.push(part);
        }
      });
      remainingText = newParts;
    }
  });

  parts.push(<span key={key++}>{remainingText}</span>);

  return <div className="text-white whitespace-pre-wrap">{parts}</div>;
};

export const Phase2Training = ({ onComplete }: Phase2TrainingProps) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [currentStep, setCurrentStep] = useState<TrainingStep>('recognize');
  const [timer, setTimer] = useState(45);
  const [isPaused, setIsPaused] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedVerify, setSelectedVerify] = useState<string | null>(null);
  const [selectedAct, setSelectedAct] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const scamNotifications = phase1Notifications.filter(n => n.isScam);
  const currentNotification = scamNotifications[currentRound % scamNotifications.length];

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && !isPaused && currentStep === 'recognize') {
      const interval = setInterval(() => {
        setTimer(t => Math.max(0, t - 0.1));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [timer, isPaused, currentStep]);

  const getBackgroundColor = () => {
    if (currentStep !== 'recognize') return 'from-gray-950 via-gray-900 to-slate-950';
    
    if (timer > 30) {
      return 'from-green-950 via-green-900 to-emerald-950';
    } else if (timer > 15) {
      return 'from-yellow-950 via-yellow-900 to-orange-950';
    } else {
      return 'from-red-950 via-red-900 to-rose-950';
    }
  };

  const handleDefuse = () => {
    setIsPaused(true);
    setShowHighlights(true);
  };

  const handleNextToVerify = () => {
    setCurrentStep('verify');
    setShowHighlights(false);
  };

  const handleVerifyOption = (option: string) => {
    setSelectedVerify(option);
    
    if (option === 'official-app') {
      setTimeout(() => {
        setCurrentStep('act');
        setSelectedVerify(null);
      }, 800);
    } else {
      // Wrong answer - shake and retry
      setShowError(true);
      setErrorMessage(option === 'click-link' 
        ? 'âŒ Never click suspicious links! They can steal your data.' 
        : 'âŒ Don\'t reply to scam messages. It confirms your number is active.');
      
      setTimeout(() => {
        setShowError(false);
        setSelectedVerify(null);
      }, 2000);
    }
  };

  const handleActOption = (option: string) => {
    setSelectedAct(option);
    
    if (option === 'block-report') {
      setShowSuccess(true);
      setSuccessCount(prev => prev + 1);
      
      setTimeout(() => {
        if (successCount + 1 >= 3) {
          // Training complete
          const trainedTactics: ScamTactic[] = [];
          scamNotifications.slice(0, successCount + 1).forEach(n => {
            trainedTactics.push(...n.tactics);
          });
          onComplete([...new Set(trainedTactics)]);
        } else {
          // Next round
          setCurrentRound(prev => prev + 1);
          setCurrentStep('recognize');
          setTimer(45);
          setIsPaused(false);
          setShowHighlights(false);
          setShowSuccess(false);
          setSelectedAct(null);
        }
      }, 3000);
    } else {
      // Wrong answer
      setShowError(true);
      setErrorMessage(option === 'ignore' 
        ? 'âŒ Ignoring doesn\'t stop scammers. Always report!' 
        : 'âŒ Never forward scams! You could spread it to vulnerable people.');
      
      setTimeout(() => {
        setShowError(false);
        setSelectedAct(null);
      }, 2000);
    }
  };

  const highlights = getHighlightedPhrases(currentNotification);

  return (
    <motion.div
      className={`min-h-screen bg-gradient-to-br ${getBackgroundColor()} transition-all duration-1000 relative overflow-hidden`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Error shake animation */}
      <AnimatePresence>
        {showError && (
          <motion.div
            className="fixed inset-0 bg-red-500/20 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              x: [0, -10, 10, -10, 10, 0]
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-red-900/90 border-2 border-red-500 rounded-lg p-6 text-white text-xl font-bold">
              {errorMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 bg-green-500/20 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-green-900/90 border-2 border-green-500 rounded-lg p-8 text-center"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">âœ“ Scam Defused!</h3>
              <p className="text-green-200 text-lg">
                Progress: {successCount + 1}/3 scams handled correctly
              </p>
              <div className="mt-4 text-sm text-gray-300 bg-black/30 rounded p-3">
                <strong className="text-green-400">Remember:</strong> Block â†’ Report (1930) â†’ Don't Engage
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            ADVERSARIAL TRAINING
          </h2>
          <p className="text-gray-300 text-lg">
            Learn to RECOGNIZE â†’ VERIFY â†’ ACT under pressure
          </p>
        </motion.div>

        {/* Progress and Timer */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-black/40 px-4 py-2 rounded-lg border border-gray-700">
            <span className="text-gray-400 text-sm">Progress: </span>
            <span className="text-white font-bold">{successCount}/3</span>
          </div>
          
          {currentStep === 'recognize' && (
            <div className="bg-black/40 px-4 py-2 rounded-lg border border-gray-700">
              <span className="text-gray-400 text-sm">Time: </span>
              <span className={`font-bold ${timer > 15 ? 'text-green-400' : timer > 8 ? 'text-yellow-400' : 'text-red-400'}`}>
                {timer.toFixed(1)}s
              </span>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`px-4 py-2 rounded-lg ${currentStep === 'recognize' ? 'bg-blue-600' : 'bg-gray-700'} border border-gray-600`}>
            <Eye className="inline w-4 h-4 mr-2" />
            <span className="text-white font-semibold">1. RECOGNIZE</span>
          </div>
          <div className={`px-4 py-2 rounded-lg ${currentStep === 'verify' ? 'bg-blue-600' : 'bg-gray-700'} border border-gray-600`}>
            <Shield className="inline w-4 h-4 mr-2" />
            <span className="text-white font-semibold">2. VERIFY</span>
          </div>
          <div className={`px-4 py-2 rounded-lg ${currentStep === 'act' ? 'bg-blue-600' : 'bg-gray-700'} border border-gray-600`}>
            <Flag className="inline w-4 h-4 mr-2" />
            <span className="text-white font-semibold">3. ACT</span>
          </div>
        </div>

        {/* STEP 1: RECOGNIZE */}
        {currentStep === 'recognize' && (
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-black/60 rounded-lg border-2 border-gray-700 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  {currentNotification.type === 'whatsapp' && <span className="text-xl">ðŸ’¬</span>}
                  {currentNotification.type === 'sms' && <span className="text-xl">ðŸ“±</span>}
                  {currentNotification.type === 'email' && <span className="text-xl">ðŸ“§</span>}
                </div>
                <div>
                  <div className="text-white font-semibold">{currentNotification.sender}</div>
                  <div className="text-gray-400 text-sm">{currentNotification.timestamp}</div>
                </div>
              </div>
              
              <div className="text-lg leading-relaxed">
                {renderMessageWithHighlights(currentNotification.fullContent, showHighlights)}
              </div>
            </div>

            {!showHighlights ? (
              <Button
                onClick={handleDefuse}
                className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="mr-2 w-5 h-5" />
                Defuse This Scam
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/60 rounded-lg border border-yellow-600 p-4">
                  <h4 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Manipulation Tactics Detected:
                  </h4>
                  {highlights.map((h, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <div className={`inline-block px-2 py-1 rounded text-sm font-semibold mb-1 ${
                        h.type === 'urgency' ? 'bg-red-500/30 text-red-200 border border-red-400' :
                        h.type === 'authority' ? 'bg-orange-500/30 text-orange-200 border border-orange-400' :
                        'bg-yellow-500/30 text-yellow-200 border border-yellow-400'
                      }`}>
                        {h.text}
                      </div>
                      <p className="text-gray-300 text-sm mt-1">â†’ {h.explanation}</p>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={handleNextToVerify}
                  className="w-full py-6 text-lg bg-green-600 hover:bg-green-700"
                >
                  Continue to Verification
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: VERIFY */}
        {currentStep === 'verify' && (
          <motion.div
            className="w-full max-w-3xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              How should you verify this message?
            </h3>
            <p className="text-gray-300 text-center mb-8">
              Choose the safest action to take
            </p>

            <div className="grid gap-4">
              <button
                onClick={() => handleVerifyOption('click-link')}
                disabled={selectedVerify !== null}
                className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                  selectedVerify === 'click-link'
                    ? 'bg-red-900/50 border-red-500'
                    : 'bg-black/40 border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <ExternalLink className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold text-lg mb-1">Click the link in the message</div>
                    <div className="text-gray-400">Check if it looks legitimate</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleVerifyOption('reply')}
                disabled={selectedVerify !== null}
                className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                  selectedVerify === 'reply'
                    ? 'bg-red-900/50 border-red-500'
                    : 'bg-black/40 border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold text-lg mb-1">Reply or call the number</div>
                    <div className="text-gray-400">Ask them to verify their identity</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleVerifyOption('official-app')}
                disabled={selectedVerify !== null}
                className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                  selectedVerify === 'official-app'
                    ? 'bg-green-900/50 border-green-500'
                    : 'bg-black/40 border-gray-700 hover:border-green-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold text-lg mb-1">Open official app/website separately</div>
                    <div className="text-gray-400">Check your actual account directly (never through message links)</div>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: ACT */}
        {currentStep === 'act' && (
          <motion.div
            className="w-full max-w-3xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              What's the right response?
            </h3>
            <p className="text-gray-300 text-center mb-8">
              Choose how to handle this scam message
            </p>

            <div className="grid gap-4">
              <button
                onClick={() => handleActOption('ignore')}
                disabled={selectedAct !== null}
                className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                  selectedAct === 'ignore'
                    ? 'bg-red-900/50 border-red-500'
                    : 'bg-black/40 border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold text-lg mb-1">Ignore and hope it stops</div>
                    <div className="text-gray-400">Delete and move on</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleActOption('forward')}
                disabled={selectedAct !== null}
                className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                  selectedAct === 'forward'
                    ? 'bg-red-900/50 border-red-500'
                    : 'bg-black/40 border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold text-lg mb-1">Forward to friends/family as warning</div>
                    <div className="text-gray-400">Share so others are aware</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleActOption('block-report')}
                disabled={selectedAct !== null}
                className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                  selectedAct === 'block-report'
                    ? 'bg-green-900/50 border-green-500'
                    : 'bg-black/40 border-gray-700 hover:border-green-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Ban className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold text-lg mb-1">Block + Report + Don't Engage</div>
                    <div className="text-gray-400">
                      Block sender â†’ Report to bank/app â†’ Call 1930 (National Cybercrime Helpline)
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <h4 className="text-blue-300 font-semibold mb-2">ðŸ‡®ðŸ‡³ India-Specific Guidance:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>â€¢ Report cyber fraud: <strong className="text-white">cybercrime.gov.in</strong> or call <strong className="text-white">1930</strong></li>
                <li>â€¢ For bank fraud: Report in your bank's app immediately</li>
                <li>â€¢ For UPI scams: Report to <strong className="text-white">report@npci.org.in</strong></li>
                <li>â€¢ Never share OTP, UPI PIN, or click links in messages</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

