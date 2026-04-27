
import { Timestamp } from 'firebase/firestore';

export interface Site {
  id: string;
  region: string;
  regionType: '주거' | '상업' | '공업' | '민감' | string;
  siteName: string;
  phase: string | string[]; // Array to support multiple selections, string kept for backward compatibility
  completedCount: number;
  inProgressCount: number;
  mainContent: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  order: number;
}

export interface SiteImage {
  id: string; // Document ID in subcollection
  base64: string; // The base64 compressed string 
  fileName: string;
  order: number;
  createdAt: Timestamp;
}

export interface SiteComplaint {
  id: string;
  number: number;
  complainant: string;
  usage: string;
  owner: string;
  status: '완료' | '진행중';
  order: number;
  createdAt: Timestamp;
  stage?: '민원 발생' | '민원 대응' | '보상 협상' | '합의 및 집행' | '완료' | string;
  stageDetails?: {
    occurrence?: string;
    response?: string;
    negotiation?: string;
    agreement?: string;
  };
  responsePlans?: string[]; // Array of IDs or titles from actionPlanLinks
  similarCases?: { text: string; url?: string }[];
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  name?: string;
  role: 'admin' | 'manager';
  approved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ActivityLog {
  id?: string;
  actorEmail: string;
  actorName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  targetSiteName: string;
  targetId: string;
  details: string;
  createdAt: Timestamp;
}

