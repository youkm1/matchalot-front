export interface User {
  Id: number;
  nickname: string;
  email: string;
  trustScore: number;
  role?: string;
  createdAt?: string;
}

export interface StudyMaterial {
  id: number;
  title: string;
  subject: string;
  examType: string;
  semesterDisplay: string;
  questionCount: number;
  uploaderNickname: string;
  uploaderTrustScore: number;
  uploaderId: number;
  createdAt: string;
  tags?: string[];
}

export interface MatchResponse {
  id: number;
  requesterId: number;
  receiverId: number;
  requesterMaterialId: number;
  recevierMaterialId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'EXPIRED';
  requesterNickname: string;
  partnerNickname: string;
  requesterMaterialTitle: string;
  partnerMaterialTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchNotification {
  type: string;
  data: any;
}

export interface WebSocketMessage {
  type: string;
  data: any;
}