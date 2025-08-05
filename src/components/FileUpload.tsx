/**
 * ファイルアップロードコンポーネント
 * Excel・CSVファイルのドラッグ&ドロップ・選択機能を提供
 */

'use client';

import React, { useRef, useState, useCallback } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading?: boolean;
}

/**
 * ファイルアップロードコンポーネント
 * Excel・CSVファイルのドラッグ&ドロップ・選択機能を提供
 */
export default function FileUpload({ onFileUpload, isUploading = false }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * ファイル選択時の処理
   * @param event ファイル選択イベント
   */
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('ファイル選択:', file.name, file.size);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  /**
   * ファイル選択ボタンクリック時の処理
   */
  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  /**
   * ドラッグオーバー時の処理
   * @param event ドラッグイベント
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  /**
   * ドラッグリーブ時の処理
   * @param event ドラッグイベント
   */
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  /**
   * ドロップ時の処理
   * @param event ドラッグイベント
   */
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('ファイルドロップ:', file.name, file.size);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
      <h3 className="text-sm font-semibold text-gray-800 mb-2 text-center">ファイルアップロード</h3>
      
      {/* コンパクトなドラッグ&ドロップエリア */}
      <div
        className={`border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : isUploading 
              ? 'border-orange-300 bg-orange-50 cursor-not-allowed'
              : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {/* アップロード中の表示 */}
        {isUploading && (
          <div className="flex flex-col items-center space-y-1">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-xs text-orange-600">処理中...</p>
          </div>
        )}
        
        {/* 通常時の表示 */}
        {!isUploading && (
          <div className="flex flex-col items-center space-y-1">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-xs text-gray-600">
              ドラッグ&ドロップ または クリック
            </p>
            <p className="text-xs text-gray-500">
              Excel/CSV (5MB以下)
            </p>
          </div>
        )}
      </div>
      
      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}