/**
 * データ管理機能
 * 人物情報とチャット履歴の永続化を管理
 */

import { PersonInfo, ChatMessage } from '../types';

// データマネージャークラス
class DataManager {
  private readonly PERSONS_KEY = 'persons';
  private readonly CHAT_HISTORY_KEY = 'chatHistory';
  private readonly CURRENT_FILE_KEY = 'currentFile';
  private readonly CURRENT_FILE_TYPE_KEY = 'currentFileType';

  /**
   * 人物情報を保存
   * @param persons 人物情報配列
   * @param fileName ファイル名
   */
  addPersons(persons: PersonInfo[], fileName: string): void {
    try {
      localStorage.setItem(this.PERSONS_KEY, JSON.stringify(persons));
      localStorage.setItem(this.CURRENT_FILE_KEY, fileName);
      console.log(`${persons.length}件の人物情報を保存しました`);
    } catch (error) {
      console.error('人物情報保存エラー:', error);
    }
  }

  /**
   * 人物情報を取得
   * @returns 人物情報配列
   */
  getPersons(): PersonInfo[] {
    try {
      const data = localStorage.getItem(this.PERSONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('人物情報取得エラー:', error);
      return [];
    }
  }

  /**
   * チャットメッセージを追加
   * @param message チャットメッセージ
   */
  addChatMessage(message: ChatMessage): void {
    try {
      const history = this.getChatHistory();
      history.push(message);
      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('チャットメッセージ追加エラー:', error);
    }
  }

  /**
   * チャット履歴を取得
   * @returns チャット履歴配列
   */
  getChatHistory(): ChatMessage[] {
    try {
      const data = localStorage.getItem(this.CHAT_HISTORY_KEY);
      if (!data) return [];
      
      const parsedData = JSON.parse(data);
      
      // timestampをDateオブジェクトに変換
      return parsedData.map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }));
    } catch (error) {
      console.error('チャット履歴取得エラー:', error);
      return [];
    }
  }

  /**
   * チャット履歴をクリア
   */
  clearChatHistory(): void {
    try {
      localStorage.removeItem(this.CHAT_HISTORY_KEY);
      console.log('チャット履歴をクリアしました');
    } catch (error) {
      console.error('チャット履歴クリアエラー:', error);
    }
  }

  /**
   * 現在のファイル名を取得
   * @returns ファイル名
   */
  getCurrentFile(): string | null {
    try {
      return localStorage.getItem(this.CURRENT_FILE_KEY);
    } catch (error) {
      console.error('現在のファイル名取得エラー:', error);
      return null;
    }
  }

  /**
   * 現在のファイルタイプを取得
   * @returns ファイルタイプ
   */
  getCurrentFileType(): string | null {
    try {
      return localStorage.getItem(this.CURRENT_FILE_TYPE_KEY);
    } catch (error) {
      console.error('現在のファイルタイプ取得エラー:', error);
      return null;
    }
  }

  /**
   * 現在のファイルタイプを設定
   * @param fileType ファイルタイプ
   */
  setCurrentFileType(fileType: string): void {
    try {
      localStorage.setItem(this.CURRENT_FILE_TYPE_KEY, fileType);
    } catch (error) {
      console.error('ファイルタイプ設定エラー:', error);
    }
  }

  /**
   * 全データをリセット
   */
  resetAllData(): void {
    try {
      localStorage.removeItem(this.PERSONS_KEY);
      localStorage.removeItem(this.CHAT_HISTORY_KEY);
      localStorage.removeItem(this.CURRENT_FILE_KEY);
      localStorage.removeItem(this.CURRENT_FILE_TYPE_KEY);
      console.log('全データをリセットしました');
    } catch (error) {
      console.error('データリセットエラー:', error);
    }
  }

  /**
   * データの存在確認
   * @returns データが存在する場合はtrue
   */
  hasData(): boolean {
    try {
      const persons = this.getPersons();
      return persons.length > 0;
    } catch (error) {
      console.error('データ存在確認エラー:', error);
      return false;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const dataManager = new DataManager();