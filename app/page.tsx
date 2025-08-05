// メインページ（チャットUI・ファイルアップロード・検索例を統合）
'use client';

import React, { useState, useEffect } from 'react';
// 作成したコンポーネントをインポート
import FileUpload from '../src/components/FileUpload';
import ChatUI from '../src/components/ChatUI';
import SearchExamples from '../src/components/SearchExamples';

// Phase 3のライブラリをインポート
import { searchPersonsWithGemini, chatWithPersons, ChatMessage, isGeminiAvailable } from '../src/lib/gemini-api';
import { dataManager } from '../src/lib/data-manager';
// 統合ファイル読み込み機能をインポート
import { readFile, PersonInfo, getFileTypeDescription } from '../src/lib/file-reader';

/**
 * メインページコンポーネント
 * ファイルアップロード・チャットUI・検索例を統合
 */
export default function HomePage() {
  // アップロードされたファイルを管理
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // チャットのローディング状態を管理
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  // ファイルアップロードのローディング状態を管理
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  // 人物情報を管理
  const [persons, setPersons] = useState<PersonInfo[]>([]);
  // チャット履歴を管理
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  // 現在のファイル名を管理
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  // 現在のファイル形式を管理
  const [currentFileType, setCurrentFileType] = useState<'excel' | 'csv' | null>(null);

  // 初期化時にローカルストレージからデータを読み込み
  useEffect(() => {
    const loadData = () => {
      const loadedPersons = dataManager.getPersons();
      const loadedChatHistory = dataManager.getChatHistory();
      const loadedCurrentFile = dataManager.getCurrentFile();
      
      setPersons(loadedPersons);
      setChatHistory(loadedChatHistory);
      setCurrentFile(loadedCurrentFile);
    };
    
    loadData();
  }, []);

  /**
   * タイムアウト付きのPromiseを作成
   * @param promise 実行するPromise
   * @param timeout タイムアウト時間（ミリ秒）
   * @returns Promise
   */
  const withTimeout = <T>(promise: Promise<T>, timeout: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('タイムアウト')), timeout)
      )
    ]);
  };

  /**
   * ファイルアップロード時の処理
   * @param file アップロードされたファイル
   */
  const handleFileUpload = async (file: File) => {
    console.log('=== ファイルアップロード処理開始 ===');
    console.log('ファイル名:', file.name);
    console.log('ファイルサイズ:', file.size, 'bytes');
    
    setIsFileUploading(true);
    setUploadedFile(file);
    
    try {
      // ファイルサイズチェック
      if (file.size === 0) {
        throw new Error('ファイルが空です');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        throw new Error('ファイルサイズが大きすぎます（5MB以下にしてください）');
      }
      
      // ファイル形式チェック
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
        throw new Error('対応していないファイル形式です（.xlsx, .xls, .csv）');
      }
      
      // 統合ファイル読み込み・解析
      console.log('統合ファイル読み込み・解析開始...');
      const readResult = await withTimeout(readFile(file), 30000);
      console.log('統合ファイル読み込み・解析完了:', readResult);
      
      if (readResult.success && readResult.data) {
        // 人物情報をデータマネージャーに保存
        console.log('人物情報をデータマネージャーに保存中...');
        dataManager.addPersons(readResult.data, file.name);
        setPersons(readResult.data);
        setCurrentFile(file.name);
        setCurrentFileType(readResult.fileType);
        
        const fileTypeDesc = getFileTypeDescription(readResult.fileType);
        
        // 解析結果の詳細をログに出力
        readResult.data.forEach((person, index) => {
          console.log(`人物${index + 1}:`, {
            name: person.name,
            department: person.department,
            skills: person.skills,
            qualifications: person.qualifications,
            yearsOfExperience: person.yearsOfExperience
          });
        });
        
        console.log('=== ファイルアップロード処理完了 ===');
      } else {
        console.error('統合ファイル読み込み・解析エラー:', readResult.error);
      }
      
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
    } finally {
      setIsFileUploading(false);
      console.log('=== ファイルアップロード処理終了 ===');
    }
  };

  /**
   * メッセージを送信
   * @param message メッセージ内容
   */
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !persons.length) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      console.log('📤 メッセージ送信:', message);
      
      // Gemini APIが利用可能かチェック
      if (!isGeminiAvailable()) {
        console.warn('Gemini APIキーが設定されていません');
        return;
      }
      
      // 検索例と同じ処理を使用（高度な検索エンジンを使用）
      const response = await withTimeout(searchPersonsWithGemini(message, persons), 30000);
      
      const botMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, botMessage]);
      console.log('✅ 応答受信:', response);
      
    } catch (error) {
      console.error('❌ メッセージ送信エラー:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  /**
   * 検索例クリック時の処理
   * @param example 選択された検索例
   */
  const handleExampleClick = async (example: string) => {
    console.log('検索例選択:', example);
    
    try {
      // 人物情報が登録されていない場合の警告
      if (persons.length === 0) {
        console.warn('人物情報が登録されていません。先にファイルをアップロードしてください。');
        return;
      }
      
      // Gemini APIが利用可能かチェック
      if (!isGeminiAvailable()) {
        console.warn('Gemini APIキーが設定されていません');
        return;
      }
      
      // タイムアウト付きで検索を実行（30秒）
      const searchResults = await withTimeout(searchPersonsWithGemini(example, persons), 30000);
      
      if (searchResults && !searchResults.includes('該当する人物が見つかりませんでした') && !searchResults.includes('人物情報が登録されていません')) {
        // 検索結果をチャットメッセージとして表示（重複を避けるためプレフィックスを追加しない）
        const response = searchResults;
        
        // ユーザーメッセージとアシスタントメッセージを追加
        const userMessage: ChatMessage = {
          role: 'user',
          content: example,
          timestamp: new Date()
        };
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        
        const updatedChatHistory = [...chatHistory, userMessage, assistantMessage];
        setChatHistory(updatedChatHistory);
        dataManager.addChatMessage(userMessage);
        dataManager.addChatMessage(assistantMessage);
      }
      
    } catch (error) {
      console.error('検索処理エラー:', error);
    }
  };

  /**
   * チャット履歴を削除
   */
  const handleClearChatHistory = () => {
    console.log('チャット履歴削除');
    setChatHistory([]);
    dataManager.clearChatHistory();
  };

  /**
   * 全データをリセット
   */
  const handleResetAllData = () => {
    console.log('全データリセット');
    setPersons([]);
    setChatHistory([]);
    setCurrentFile(null);
    setCurrentFileType(null);
    setUploadedFile(null);
    dataManager.resetAllData();
  };

  return (
    <div 
      className="h-screen w-screen bg-gray-50"
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateColumns: '1fr 2fr',
        gap: '0',
        overflow: 'hidden'
      }}
    >
      {/* ヘッダー */}
      <header 
        className="bg-white border-b border-gray-200 px-6 py-3"
        style={{ gridColumn: '1 / -1', gridRow: '1' }}
      >
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            ドキュメント検索型チャットボット
          </h1>
          <p className="text-sm text-gray-600">
            Excel・CSVファイルから人物スキル情報を検索できます
          </p>
          {currentFile && (
            <p className="text-xs text-blue-600 mt-1">
              現在のファイル: {currentFile} ({persons.length}件の人物情報)
              {currentFileType && (
                <span className="ml-2 text-green-600">
                  [{getFileTypeDescription(currentFileType)}]
                </span>
              )}
            </p>
          )}
          {isFileUploading && (
            <p className="text-xs text-orange-600 mt-1">
              ⏳ ファイル読み込み・解析中...
            </p>
          )}
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <main 
        className="min-h-0 overflow-hidden"
        style={{ gridColumn: '1 / -1', gridRow: '2' }}
      >
        <div 
          className="h-full"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '0',
            overflow: 'hidden'
          }}
        >
          {/* 左側：ファイルアップロード・検索例 */}
          <div 
            className="flex flex-col border-r border-gray-200"
            style={{ overflow: 'hidden' }}
          >
            {/* ファイルアップロード（コンパクト化） */}
            <div className="p-2 flex-shrink-0">
              <FileUpload 
                onFileUpload={handleFileUpload} 
                isUploading={isFileUploading}
              />
            </div>
            
            {/* 検索例（ファイルアップロードの下） */}
            <div className="p-2 border-t border-gray-200 flex-shrink-0">
              <SearchExamples onExampleClick={handleExampleClick} />
            </div>
          </div>

          {/* 右側：チャット画面（フル表示・スクロール可能） */}
          <div 
            className="flex flex-col"
            style={{ overflow: 'hidden' }}
          >
            <div 
              className="flex-1"
              style={{ overflow: 'hidden' }}
            >
              <ChatUI 
                onSendMessage={handleSendMessage}
                onExampleClick={handleExampleClick}
                isLoading={isChatLoading}
                messages={chatHistory}
                onClearHistory={handleClearChatHistory}
              />
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer 
        className="bg-white border-t border-gray-200 px-6 py-2"
        style={{ gridColumn: '1 / -1', gridRow: '3' }}
      >
        <div className="text-center text-xs text-gray-500">
          <p>✅ Excel・CSV対応完了 | 🔧 RAG検索機能搭載</p>
          <p>高度な検索機能で人物情報を効率的に検索できます</p>
        </div>
      </footer>
    </div>
  );
}