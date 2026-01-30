import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { LandingScreen } from '@/components/LandingScreen';
import { Phase1RealityCheck } from '@/components/Phase1RealityCheck';
import { Phase1Reveal } from '@/components/Phase1Reveal';
import { Phase2Training } from '@/components/Phase2Training';
import { Phase3Test } from '@/components/Phase3Test';
import { ResultsScreen } from '@/components/ResultsScreen';
import { Phase, UserInteraction, TestAnswer, ScamTactic } from '@/types/scam';

const Index = () => {
  const [phase, setPhase] = useState<Phase>('landing');
  const [phase1Interactions, setPhase1Interactions] = useState<UserInteraction[]>([]);
  const [trainedTactics, setTrainedTactics] = useState<ScamTactic[]>([]);
  const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([]);

  const handleStart = useCallback(() => {
    setPhase('phase1');
  }, []);

  const handlePhase1Complete = useCallback((interactions: UserInteraction[]) => {
    setPhase1Interactions(interactions);
    setPhase('phase1-reveal');
  }, []);

  const handlePhase1RevealContinue = useCallback(() => {
    setPhase('phase2');
  }, []);

  const handlePhase2Complete = useCallback((tactics: ScamTactic[]) => {
    setTrainedTactics(tactics);
    setPhase('phase3');
  }, []);

  const handlePhase3Complete = useCallback((answers: TestAnswer[]) => {
    setTestAnswers(answers);
    setPhase('results');
  }, []);

  const handleRestart = useCallback(() => {
    setPhase('landing');
    setPhase1Interactions([]);
    setTrainedTactics([]);
    setTestAnswers([]);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AnimatedBackground />
      
      <AnimatePresence mode="wait">
        {phase === 'landing' && (
          <LandingScreen key="landing" onStart={handleStart} />
        )}
        
        {phase === 'phase1' && (
          <Phase1RealityCheck key="phase1" onComplete={handlePhase1Complete} />
        )}
        
        {phase === 'phase1-reveal' && (
          <Phase1Reveal
            key="phase1-reveal"
            interactions={phase1Interactions}
            onContinue={handlePhase1RevealContinue}
          />
        )}
        
        {phase === 'phase2' && (
          <Phase2Training key="phase2" onComplete={handlePhase2Complete} />
        )}
        
        {phase === 'phase3' && (
          <Phase3Test key="phase3" onComplete={handlePhase3Complete} />
        )}
        
        {phase === 'results' && (
          <ResultsScreen
            key="results"
            phase1Interactions={phase1Interactions}
            testAnswers={testAnswers}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
