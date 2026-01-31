export type NotificationType = 'whatsapp' | 'sms' | 'email' | 'alert' | 'call';

export type ScamTactic = 
  | 'urgency' 
  | 'authority' 
  | 'emotional' 
  | 'fake-link' 
  | 'impersonation'
  | 'reward'
  | 'threat';

export interface ScamNotification {
  id: string;
  type: NotificationType;
  sender: string;
  preview: string;
  fullContent: string;
  isScam: boolean;
  tactics: ScamTactic[];
  explanation: string;
  timestamp: string;
  voiceScript?: string; // For AI voice call scams
}

export interface UserInteraction {
  notificationId: string;
  action: 'opened' | 'ignored';
  reactionTime: number;
  timestamp: number;
}

export interface TestAnswer {
  notificationId: string;
  decision: 'safe' | 'scam';
  confidence: number;
  reasoning?: string;
  isCorrect?: boolean;
  timeTaken: number;
}

export interface UserProfile {
  weaknesses: ScamTactic[];
  strengths: ScamTactic[];
  overallScore: number;
  improvementPercentage: number;
  phase1Interactions: UserInteraction[];
  testAnswers: TestAnswer[];
}

export type Phase = 'landing' | 'phase1' | 'phase1-reveal' | 'phase2' | 'phase3' | 'results';
