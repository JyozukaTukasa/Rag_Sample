/**
 * 共通型定義
 * アプリケーション全体で使用する型を定義
 */

// 人物情報の型定義
export interface PersonInfo {
  name: string;           // 氏名
  department: string;     // 部署
  skills: string[];       // スキル配列
  qualifications: string[]; // 資格配列
  selfPR: string;         // 自己PR
  experience: string;     // 開発経験
  yearsOfExperience: number; // 経験年数
}

// チャットメッセージの型定義
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ファイル読み込み結果の型定義
export interface FileReadResult {
  success: boolean;
  data?: PersonInfo[];
  error?: string;
  fileType?: 'excel' | 'csv';
}

// エラー情報の型定義
export interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
} 