export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  FAST_CHAT = 'FAST_CHAT',
  SEARCH_GROUNDING = 'SEARCH_GROUNDING',
  RESEARCHER = 'THE_RESEARCHER',
  VIDEO_ANALYSIS = 'VIDEO_ANALYSIS',
  GENERAL_CHAT = 'GENERAL_CHAT',
  DOCUMENTATION = 'DOCUMENTATION'
}

export interface Attachment {
  type: 'image' | 'text' | 'video';
  content: string; // Base64 for image/video, raw text for code/text files
  mimeType: string;
  name: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  attachment?: Attachment;
  isThinking?: boolean;
  groundingMetadata?: GroundingMetadata;
  timestamp: number;
  // For UI state
  error?: boolean;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: any[];
  webSearchQueries?: string[];
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface VideoFile {
  data: string; // Base64
  mimeType: string;
  name: string;
}