export interface AttachedDamagePhoto {
  name: string;
  url: string;
  size: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  matched_topic?: string;
  escalate?: boolean;
  summary_for_agent?: string;
  timestamp: string;
  feedback?: 'helpful' | 'unhelpful' | null;
  attachedPhoto?: AttachedDamagePhoto | null;
}

export interface PolicyRule {
  id: string;
  title: string;
  category: 'auto' | 'escalation';
  summary: string;
  fullRule: string;
  samplePrompt: string;
}
