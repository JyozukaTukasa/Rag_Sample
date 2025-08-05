/**
 * チャットUIコンポーネント
 * メッセージの送受信と表示を担当
 */

import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatUI.module.css';
import { ChatMessage } from '../types';

// プロパティの型定義
interface ChatUIProps {
  onSendMessage: (message: string) => void;
  onExampleClick: (example: string) => void;
  isLoading: boolean;
  messages: ChatMessage[];
  onClearHistory?: () => void; // 追加
}

/**
 * チャットUIコンポーネント
 */
export default function ChatUI({ 
  onSendMessage, 
  onExampleClick, 
  isLoading, 
  messages,
  onClearHistory 
}: ChatUIProps) {
  // 入力メッセージの状態
  const [inputMessage, setInputMessage] = useState<string>('');
  // テキストエリアの参照
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // メッセージコンテナの参照
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  /**
   * メッセージ送信処理
   */
  const handleSendMessage = () => {
    const message = inputMessage.trim();
    if (message && !isLoading) {
      onSendMessage(message);
      setInputMessage('');
      
      // テキストエリアの高さをリセット
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  /**
   * Enterキーでの送信処理
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * 時刻をフォーマット
   */
  const formatTime = (date: Date | string): string => {
    // 文字列の場合はDateオブジェクトに変換
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // 有効なDateオブジェクトかチェック
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '--:--';
    }
    
    return dateObj.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * メッセージをレンダリング
   */
  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <div 
        key={index}
        className={`${styles.message} ${isUser ? styles.userMessage : styles.botMessage}`}
      >
        <div className={styles.messageContent}>
          <div className={styles.messageText}>
            {formatMessageContent(message.content, isUser)}
          </div>
          <span className={styles.timestamp}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  };

  /**
   * メッセージ内容をフォーマット
   * @param content メッセージ内容
   * @param isUser ユーザーメッセージかどうか
   * @returns フォーマットされたメッセージ
   */
  const formatMessageContent = (content: string, isUser: boolean) => {
    if (isUser) {
      // ユーザーメッセージはそのまま表示
      return <p>{content}</p>;
    }

    // アシスタントメッセージ（Geminiからの回答）をフォーマット
    const lines = content.split('\n');
    
    return (
      <div className={styles.formattedContent}>
        {lines.map((line, lineIndex) => {
          const trimmedLine = line.trim();
          
          // 空行の場合は改行のみ
          if (trimmedLine === '') {
            return <br key={lineIndex} />;
          }
          
          // 検索結果の場合は特別なフォーマット
          if (trimmedLine.startsWith('検索結果:')) {
            return (
              <div key={lineIndex} className={styles.searchResultHeader}>
                <h3>{trimmedLine}</h3>
              </div>
            );
          }
          
          // 番号付きリスト（1. 2. など）
          if (/^\d+\./.test(trimmedLine)) {
            return (
              <div key={lineIndex} className={styles.numberedList}>
                <span className={styles.listNumber}>
                  {trimmedLine.match(/^\d+\./)?.[0]}
                </span>
                <span className={styles.listContent}>
                  {trimmedLine.replace(/^\d+\.\s*/, '')}
                </span>
              </div>
            );
          }
          
          // 部署、スキル、説明などの項目
          if (trimmedLine.startsWith('   部署:') || 
              trimmedLine.startsWith('   スキル:') || 
              trimmedLine.startsWith('   説明:') ||
              trimmedLine.startsWith('   関連性:')) {
            return (
              <div key={lineIndex} className={styles.listItem}>
                <span className={styles.itemLabel}>
                  {trimmedLine.split(':')[0].trim()}
                </span>
                <span className={styles.itemContent}>
                  {trimmedLine.split(':')[1]?.trim() || ''}
                </span>
              </div>
            );
          }
          
          // 通常のテキスト
          return (
            <p key={lineIndex} className={styles.paragraph}>
              {trimmedLine}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* タイトル */}
      <div className={styles.title}>
        チャット
      </div>

      {/* ヘッダー部分 */}
      <div className={styles.chatHeader}>
        <h2 className={styles.chatTitle}>チャット</h2>
        {onClearHistory && messages.length > 0 && (
          <button
            onClick={onClearHistory}
            className={styles.clearButton}
            title="チャット履歴を削除"
          >
            🗑️ 履歴削除
          </button>
        )}
      </div>

      {/* メッセージ表示エリア */}
      <div 
        ref={messagesContainerRef}
        className={styles.messagesContainer}
      >
        {messages.length === 0 ? (
          <div className={styles.botMessage}>
            <div className={styles.messageContent}>
              <p className={styles.messageText}>
                こんにちは！人物情報について質問してください。
              </p>
              <p className={styles.messageText}>
                例：「Pythonが得意な人は？」「開発部の人は？」など
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}

        {/* ローディング表示 */}
        {isLoading && (
          <div className={styles.botMessage}>
            <div className={styles.messageContent}>
              <p className={styles.loadingText}>
                考え中...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          className={styles.input}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力してください..."
          disabled={isLoading}
          rows={1}
        />
        <button
          className={`${styles.sendButton} ${isLoading ? styles.loading : ''}`}
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
        >
          送信
        </button>
      </div>
    </div>
  );
}