export type LearningMode = 'answer_spell' | 'mystery_spell';

export type SubjectCategory =
  | 'All Subjects'
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Computer Science'
  | 'Biology'
  | 'Literature & History';

export interface AttachedImage {
  name: string;
  mimeType: string;
  base64: string; // base64 string without data:image/* prefix
  dataUrl: string; // complete data:image/...;base64,... string for rendering
  sizeFormatted?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  mode: LearningMode;
  subject?: SubjectCategory;
  image?: AttachedImage;
  isError?: boolean;
  canRetry?: boolean;
}

export interface HealthStatus {
  ok: boolean;
  activeModel: string;
  isDefaultAvailable: boolean;
  availableGemmaModels: string[];
  verifiedModels: string[];
  supportsVision: boolean;
  warning?: string;
  latencyMs?: number;
}

export interface SampleQuestion {
  title: string;
  prompt: string;
  subject: SubjectCategory;
  recommendedMode: LearningMode;
  icon: string;
  difficulty: 'Apprentice' | 'Adept' | 'Archmage';
  sampleImage?: {
    name: string;
    dataUrl: string;
    description: string;
  };
}
