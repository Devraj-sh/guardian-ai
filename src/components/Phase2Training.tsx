import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Lightbulb, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScamNotification, ScamTactic } from '@/types/scam';
import { phase1Notifications, getTacticsForTraining } from '@/data/scamNotifications';

interface Phase2TrainingProps {
  onComplete: (trainedTactics: ScamTactic[]) => void;
}

export const Phase2Training = ({ onComplete }: Phase2TrainingProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTactics, setSelectedTactics] = useState<ScamTactic[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [trainedTactics, setTrainedTactics] = useState<ScamTactic[]>([]);

  const scamNotifications = phase1Notifications.filter(n => n.isScam);
  const currentNotification = scamNotifications[currentIndex];
  const tactics = getTacticsForTraining();
  const allTactics = Object.keys(tactics) as ScamTactic[];

  const handleTacticToggle = (tactic: ScamTactic) => {
    if (showExplanation) return;
    setSelectedTactics(prev =>
      prev.includes(tactic)
        ? prev.filter(t => t !== tactic)
        : [...prev, tactic]
    );
  };

  const handleReveal = () => {
    setShowExplanation(true);
    // Add the tactics from this notification to trained list
    const newTrainedTactics = [...new Set([...trainedTactics, ...currentNotification.tactics])];
    setTrainedTactics(newTrainedTactics);
  };

  const handleNext = () => {
    if (currentIndex < scamNotifications.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedTactics([]);
      setShowExplanation(false);
    } else {
      onComplete(trainedTactics);
    }
  };

  const correctSelections = selectedTactics.filter(t => currentNotification.tactics.includes(t));
  const missedTactics = currentNotification.tactics.filter(t => !selectedTactics.includes(t));

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
          <span className="text-primary">Phase 2:</span> Skill Training
        </h2>
        <p className="text-muted-foreground">
          Learn to identify manipulation tactics used by scammers.
        </p>
      </motion.div>

      {/* Progress */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Training progress</span>
          <span>{currentIndex + 1} / {scamNotifications.length}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((currentIndex + (showExplanation ? 1 : 0)) / scamNotifications.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-2xl flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNotification.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
          >
            {/* Scam Message Card */}
            <div className="glass-card rounded-xl p-6 mb-6 border border-destructive/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="px-2 py-1 rounded bg-destructive/20 text-destructive text-xs font-semibold">
                  SCAM CONTENT
                </div>
                <span className="text-sm text-muted-foreground">
                  This content was designed to manipulate you.
                </span>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="font-semibold mb-2">{currentNotification.sender}</div>
                <p className="text-foreground">{currentNotification.fullContent}</p>
              </div>
            </div>

            {/* Tactic Selection */}
            {!showExplanation ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Which manipulation tactics do you see?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allTactics.map((tacticKey) => {
                    const tactic = tactics[tacticKey];
                    const isSelected = selectedTactics.includes(tacticKey);
                    
                    return (
                      <motion.button
                        key={tacticKey}
                        onClick={() => handleTacticToggle(tacticKey)}
                        className={`p-4 rounded-lg text-left transition-all border ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-secondary/30 hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tactic.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{tactic.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {tactic.description}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <Button
                  onClick={handleReveal}
                  className="w-full mt-4"
                  size="lg"
                  disabled={selectedTactics.length === 0}
                >
                  Check My Analysis
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Results */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    AI Coach Analysis
                  </h3>

                  {/* Correct selections */}
                  {correctSelections.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-success mb-2">
                        ✓ You correctly identified:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {correctSelections.map(t => (
                          <span
                            key={t}
                            className="px-3 py-1 rounded-full bg-success/20 text-success text-sm"
                          >
                            {tactics[t].icon} {tactics[t].name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missed tactics */}
                  {missedTactics.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-warning mb-2">
                        ⚠ You missed:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {missedTactics.map(t => (
                          <span
                            key={t}
                            className="px-3 py-1 rounded-full bg-warning/20 text-warning text-sm"
                          >
                            {tactics[t].icon} {tactics[t].name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="mt-4 p-4 bg-background/50 rounded-lg border-l-2 border-primary">
                    <div className="text-sm font-medium text-primary mb-2">
                      Why this is dangerous:
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentNotification.explanation}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <span className="flex items-center gap-2">
                    {currentIndex < scamNotifications.length - 1 ? 'Next Scam' : 'Start Test'}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Trained Tactics Summary */}
      {trainedTactics.length > 0 && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 glass-card rounded-xl p-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="text-sm font-medium mb-2">You are now trained against:</div>
          <div className="flex flex-wrap gap-2">
            {trainedTactics.map(t => (
              <span
                key={t}
                className="px-2 py-1 rounded bg-primary/20 text-primary text-xs"
              >
                ✓ {tactics[t].name}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
