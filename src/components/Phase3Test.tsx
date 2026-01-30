import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { TestAnswer } from '@/types/scam';
import { phase3Notifications } from '@/data/scamNotifications';

interface Phase3TestProps {
  onComplete: (answers: TestAnswer[]) => void;
}

export const Phase3Test = ({ onComplete }: Phase3TestProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decision, setDecision] = useState<'safe' | 'scam' | null>(null);
  const [confidence, setConfidence] = useState([50]);
  const [reasoning, setReasoning] = useState('');
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  const currentNotification = phase3Notifications[currentIndex];

  useEffect(() => {
    setStartTime(Date.now());
    setTimeElapsed(0);
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleSubmit = () => {
    if (!decision) return;

    const isCorrect = (decision === 'scam') === currentNotification.isScam;
    const timeTaken = Date.now() - startTime;

    const answer: TestAnswer = {
      notificationId: currentNotification.id,
      decision,
      confidence: confidence[0],
      reasoning: reasoning.trim() || undefined,
      isCorrect,
      timeTaken,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentIndex < phase3Notifications.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setDecision(null);
      setConfidence([50]);
      setReasoning('');
    } else {
      onComplete(newAnswers);
    }
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-start pt-12 px-4 pb-8 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-warning">Phase 3:</span> Adaptive Test
        </h2>
        <p className="text-muted-foreground">
          Now prove your improvement. No hints this time.
        </p>
      </motion.div>

      {/* Progress & Timer */}
      <div className="w-full max-w-2xl mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Test progress</span>
            <span>{currentIndex + 1} / {phase3Notifications.length}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-warning"
              animate={{ width: `${((currentIndex) / phase3Notifications.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-sm">{formatTime(timeElapsed)}</span>
        </div>
      </div>

      {/* Test Content */}
      <div className="w-full max-w-2xl flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNotification.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-6"
          >
            {/* Message Card */}
            <div className="glass-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-1 rounded bg-secondary text-muted-foreground text-xs font-medium">
                  NEW MESSAGE
                </div>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="font-semibold mb-2">{currentNotification.sender}</div>
                <p className="text-foreground">{currentNotification.fullContent}</p>
              </div>
            </div>

            {/* Decision */}
            <div className="space-y-3">
              <h3 className="font-semibold">Is this message Safe or a Scam?</h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  onClick={() => setDecision('safe')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    decision === 'safe'
                      ? 'border-success bg-success/10'
                      : 'border-border hover:border-success/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Shield className={`w-10 h-10 mx-auto mb-3 ${
                    decision === 'safe' ? 'text-success' : 'text-muted-foreground'
                  }`} />
                  <div className={`font-semibold ${
                    decision === 'safe' ? 'text-success' : 'text-foreground'
                  }`}>
                    Safe
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Legitimate message
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => setDecision('scam')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    decision === 'scam'
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border hover:border-destructive/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AlertTriangle className={`w-10 h-10 mx-auto mb-3 ${
                    decision === 'scam' ? 'text-destructive' : 'text-muted-foreground'
                  }`} />
                  <div className={`font-semibold ${
                    decision === 'scam' ? 'text-destructive' : 'text-foreground'
                  }`}>
                    Scam
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Fraudulent attempt
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Confidence Slider */}
            {decision && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">How confident are you?</h3>
                  <span className={`font-mono font-bold ${
                    confidence[0] >= 70 ? 'text-success' : 
                    confidence[0] >= 40 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {confidence[0]}%
                  </span>
                </div>
                <Slider
                  value={confidence}
                  onValueChange={setConfidence}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not sure</span>
                  <span>Very confident</span>
                </div>
              </motion.div>
            )}

            {/* Optional Reasoning */}
            {decision && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <h3 className="font-semibold">Why? (Optional)</h3>
                <Textarea
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Briefly explain your reasoning..."
                  className="bg-secondary/30 border-border resize-none"
                  rows={2}
                />
              </motion.div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full bg-warning text-warning-foreground hover:bg-warning/90"
              disabled={!decision}
            >
              <span className="flex items-center gap-2">
                {currentIndex < phase3Notifications.length - 1 ? 'Submit & Next' : 'Complete Test'}
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
