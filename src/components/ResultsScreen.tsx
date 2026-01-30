import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Brain, Target, TrendingUp, RotateCcw, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TestAnswer, UserInteraction, ScamTactic } from '@/types/scam';
import { phase1Notifications, phase3Notifications, getTacticsForTraining } from '@/data/scamNotifications';

interface ResultsScreenProps {
  phase1Interactions: UserInteraction[];
  testAnswers: TestAnswer[];
  onRestart: () => void;
}

export const ResultsScreen = ({ phase1Interactions, testAnswers, onRestart }: ResultsScreenProps) => {
  const tactics = getTacticsForTraining();
  
  // Calculate Phase 1 stats
  const phase1ScamsOpened = phase1Interactions.filter(i => {
    const notification = phase1Notifications.find(n => n.id === i.notificationId);
    return notification?.isScam && i.action === 'opened';
  }).length;
  const phase1TotalScams = phase1Notifications.filter(n => n.isScam).length;
  const phase1VulnerabilityRate = Math.round((phase1ScamsOpened / phase1TotalScams) * 100);

  // Calculate Phase 3 stats
  const correctAnswers = testAnswers.filter(a => a.isCorrect);
  const accuracy = Math.round((correctAnswers.length / testAnswers.length) * 100);
  const avgConfidence = Math.round(testAnswers.reduce((sum, a) => sum + a.confidence, 0) / testAnswers.length);
  const avgTimeTaken = Math.round(testAnswers.reduce((sum, a) => sum + a.timeTaken, 0) / testAnswers.length / 1000);

  // Calculate AI Discernment Score
  const confidenceCalibration = correctAnswers.reduce((sum, a) => sum + a.confidence, 0) / Math.max(correctAnswers.length, 1);
  const discernmentScore = Math.round((accuracy * 0.6) + (confidenceCalibration * 0.3) + (avgTimeTaken < 30 ? 10 : avgTimeTaken < 60 ? 5 : 0));

  // Identify weaknesses (missed scam tactics)
  const missedScamIds = testAnswers
    .filter(a => !a.isCorrect && phase3Notifications.find(n => n.id === a.notificationId)?.isScam)
    .map(a => a.notificationId);
  
  const weaknesses: ScamTactic[] = [];
  missedScamIds.forEach(id => {
    const notification = phase3Notifications.find(n => n.id === id);
    notification?.tactics.forEach(t => {
      if (!weaknesses.includes(t)) weaknesses.push(t);
    });
  });

  // Calculate improvement
  const improvement = Math.max(0, phase1VulnerabilityRate - (100 - accuracy));

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-start pt-12 px-4 pb-8 relative z-10"
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
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Analysis Complete</span>
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Evaluator AI Diagnosis
        </h2>
        <p className="text-muted-foreground">
          Your scam resistance profile has been analyzed.
        </p>
      </motion.div>

      {/* Main Score Card */}
      <motion.div
        className="w-full max-w-2xl glass-card rounded-2xl p-8 mb-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Ring */}
          <div className="relative">
            <svg className="w-40 h-40" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${discernmentScore * 2.83} 283`}
                transform="rotate(-90 50 50)"
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray: `${discernmentScore * 2.83} 283` }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-4xl font-bold text-gradient-cyber"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {discernmentScore}
              </motion.span>
              <span className="text-sm text-muted-foreground">AI Score</span>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold">AI Discernment Score</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold text-success">{accuracy}%</div>
                <div className="text-xs text-muted-foreground">Test Accuracy</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold text-primary">{avgConfidence}%</div>
                <div className="text-xs text-muted-foreground">Avg Confidence</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold text-warning">{avgTimeTaken}s</div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold text-success">
                  {correctAnswers.length}/{testAnswers.length}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comparison Card */}
      <motion.div
        className="w-full max-w-2xl glass-card rounded-xl p-6 mb-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-success" />
          Before vs After Training
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="text-3xl font-bold text-destructive">{phase1VulnerabilityRate}%</div>
            <div className="text-sm text-muted-foreground">Scam Vulnerability (Before)</div>
            <div className="text-xs text-destructive mt-1">
              Opened {phase1ScamsOpened} of {phase1TotalScams} scams
            </div>
          </div>
          <div className="text-center p-4 rounded-lg bg-success/10 border border-success/30">
            <div className="text-3xl font-bold text-success">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Detection Accuracy (After)</div>
            <div className="text-xs text-success mt-1">
              +{improvement}% improvement
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cognitive Failures */}
      {weaknesses.length > 0 && (
        <motion.div
          className="w-full max-w-2xl glass-card rounded-xl p-6 mb-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-warning" />
            Identified Cognitive Vulnerabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weaknesses.map((weakness, i) => (
              <motion.div
                key={weakness}
                className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.1 }}
              >
                <span className="text-2xl">{tactics[weakness].icon}</span>
                <div>
                  <div className="font-medium text-warning">{tactics[weakness].name}</div>
                  <div className="text-xs text-muted-foreground">{tactics[weakness].description}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4 italic">
            "Most Indian scam victims fall for urgency + authority signals."
          </p>
        </motion.div>
      )}

      {/* India Context */}
      <motion.div
        className="w-full max-w-2xl glass-card rounded-xl p-6 mb-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Why This Matters in India
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📱', stat: '66%', text: 'Rise in UPI fraud cases (2023-24)' },
            { icon: '💼', stat: '₹1,750 Cr', text: 'Lost to WhatsApp job scams' },
            { icon: '🏦', stat: '40%', text: 'Victims trusted fake KYC alerts' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="p-4 rounded-lg bg-secondary/30 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 + i * 0.1 }}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-xl font-bold text-gradient-cyber">{item.stat}</div>
              <div className="text-xs text-muted-foreground">{item.text}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Next Attack Preview */}
      {weaknesses.length > 0 && (
        <motion.div
          className="w-full max-w-2xl glass-card rounded-xl p-6 mb-8 border border-primary/30"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Next Attack Adjusted</h3>
                <p className="text-sm text-muted-foreground">
                  Generator AI will target: <span className="text-warning">{tactics[weaknesses[0]].name}</span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>
      )}

      {/* Final Quote */}
      <motion.div
        className="text-center mb-8 max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-lg text-muted-foreground font-mono">
          "We don't stop scams by blocking messages.
          <br />
          <span className="text-gradient-cyber font-semibold">We stop scams by upgrading human judgment.</span>"
        </p>
      </motion.div>

      {/* Restart Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.7 }}
      >
        <Button
          onClick={onRestart}
          size="lg"
          className="group px-8 py-6 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(45,212,191,0.4)]"
        >
          <RotateCcw className="w-5 h-5 mr-2 transition-transform group-hover:rotate-180 duration-500" />
          Train Again
        </Button>
      </motion.div>
    </motion.div>
  );
};
