'use client';

import { useState, useRef, ChangeEvent } from 'react';
import styles from './styles.module.css';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const UploadZone = ({ onFilesSelected }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList | null): File[] => {
    if (!files || files.length === 0) {
      return [];
    }

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach(file => {
      if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`不支持的文件格式: ${invalidFiles.join(', ')}。请上传EPUB文件。`);
    } else if (validFiles.length > 0) {
      setError(null);
    }

    return validFiles;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const validFiles = validateFiles(e.dataTransfer.files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateFiles(e.target.files);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        className={styles.fileInput}
        accept=".epub,application/epub+zip"
        onChange={handleFileInputChange}
        multiple
      />
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <div className={styles.icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="#4dabf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.pointerIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm5.08 2.26H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-4.04-.85-1.21 1.23L10.13 24h8.67l-1.06-7.62-3.66-2.88z" fill="#ff6b6b"/>
            </svg>
          </div>
        </div>
        <span className={styles.mainText}>点击上传</span>
        <span className={styles.fileType}>或拖拽文件到此处</span>
        <span className={styles.fileFormat}>.epub 文件</span>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
};