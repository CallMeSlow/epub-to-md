'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { MarkdownConverterOptions } from '../../utils/md-converter';
import { DownloadOptions } from '../../utils/download';

interface ConversionSettingsProps {
  markdownOptions: MarkdownConverterOptions;
  downloadOptions: DownloadOptions;
  onMarkdownOptionsChange: (options: Partial<MarkdownConverterOptions>) => void;
  onDownloadOptionsChange: (options: Partial<DownloadOptions>) => void;
}

export const ConversionSettings = ({
  markdownOptions,
  downloadOptions,
  onMarkdownOptionsChange,
  onDownloadOptionsChange
}: ConversionSettingsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={toggleExpand}>
        <h3 className={styles.title}>转换设置</h3>
        <button className={styles.expandButton}>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Markdown 格式</h4>
            <div className={styles.optionGroup}>
              <div className={styles.radioOption}>
                <input 
                  type="radio" 
                  id="standard" 
                  name="format" 
                  value="standard"
                  checked={markdownOptions.format === 'standard'}
                  onChange={() => onMarkdownOptionsChange({ format: 'standard' })}
                />
                <label htmlFor="standard">标准 Markdown</label>
              </div>
              <div className={styles.radioOption}>
                <input 
                  type="radio" 
                  id="gfm" 
                  name="format" 
                  value="gfm"
                  checked={markdownOptions.format === 'gfm'}
                  onChange={() => onMarkdownOptionsChange({ format: 'gfm' })}
                />
                <label htmlFor="gfm">GitHub Flavored Markdown (GFM)</label>
              </div>
            </div>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>图片处理</h4>
            <div className={styles.optionGroup}>
              <div className={styles.radioOption}>
                <input 
                  type="radio" 
                  id="inline" 
                  name="imageHandling" 
                  value="inline"
                  checked={markdownOptions.imageHandling === 'inline'}
                  onChange={() => onMarkdownOptionsChange({ imageHandling: 'inline' })}
                />
                <label htmlFor="inline">内联 Base64 (单文件，较大)</label>
              </div>
              <div className={styles.radioOption}>
                <input 
                  type="radio" 
                  id="separate" 
                  name="imageHandling" 
                  value="separate"
                  checked={markdownOptions.imageHandling === 'separate'}
                  onChange={() => onMarkdownOptionsChange({ imageHandling: 'separate' })}
                />
                <label htmlFor="separate">保存到独立文件夹</label>
              </div>
            </div>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>输出结构</h4>
            <div className={styles.optionGroup}>
              <div className={styles.radioOption}>
                <input 
                  type="radio" 
                  id="single" 
                  name="outputStructure" 
                  value="single"
                  checked={markdownOptions.outputStructure === 'single'}
                  onChange={() => onMarkdownOptionsChange({ outputStructure: 'single' })}
                />
                <label htmlFor="single">单文件输出</label>
              </div>
              <div className={styles.radioOption}>
                <input 
                  type="radio" 
                  id="chapter" 
                  name="outputStructure" 
                  value="chapter"
                  checked={markdownOptions.outputStructure === 'chapter'}
                  onChange={() => onMarkdownOptionsChange({ outputStructure: 'chapter' })}
                />
                <label htmlFor="chapter">按章节分割</label>
              </div>
            </div>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>下载选项</h4>
            <div className={styles.optionGroup}>
              <div className={styles.inputGroup}>
                <label htmlFor="filename">文件名</label>
                <input 
                  type="text" 
                  id="filename" 
                  value={downloadOptions.filename}
                  onChange={(e) => onDownloadOptionsChange({ filename: e.target.value })}
                  placeholder="converted-epub"
                  className={styles.textInput}
                />
              </div>
              <div className={styles.radioOption}>
                <input 
                  type="radio" 
                  id="zip" 
                  name="downloadFormat" 
                  value="zip"
                  checked={downloadOptions.format === 'zip'}
                  onChange={() => onDownloadOptionsChange({ format: 'zip' })}
                />
                <label htmlFor="zip">ZIP 打包下载</label>
              </div>
              <div className={styles.radioOption}>
                <input 
                  type="radio" 
                  id="individual" 
                  name="downloadFormat" 
                  value="individual"
                  checked={downloadOptions.format === 'individual'}
                  onChange={() => onDownloadOptionsChange({ format: 'individual' })}
                />
                <label htmlFor="individual">单独文件下载</label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
