'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { UploadZone } from '../UploadZone';
import { FilePreview } from '../FilePreview';
import { ConversionSettings } from '../ConversionSettings';
import { ConversionActions } from '../ConversionActions';
import { ConversionAnimation } from '../ConversionAnimation';
import { useEpubConverter } from '../../hooks/useEpubConverter';

export const EpubConverter = () => {
  const [
    { files, progress, options },
    {
      addFiles,
      removeFile,
      clearFiles,
      convertFiles,
      cancelConversion,
      updateMarkdownOptions,
      updateDownloadOptions
    }
  ] = useEpubConverter();

  const [isConverting, setIsConverting] = useState(false);

  // Check if any file is being converted
  useEffect(() => {
    const converting = progress.some(p =>
      p.status === 'parsing' ||
      p.status === 'converting' ||
      p.status === 'downloading'
    );
    setIsConverting(converting);
  }, [progress]);

  const handleConvert = async () => {
    await convertFiles();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>EPUB 转 Markdown</h1>
        <p className={styles.description}>
          上传EPUB文件，转换为Markdown格式，支持图片和格式保留
        </p>
      </div>

      <div className={styles.uploadCard}>
        <UploadZone onFilesSelected={addFiles} />
      </div>

      {files.length > 0 && (
        <div className={styles.previewCard}>
          <FilePreview
            files={files}
            onRemoveFile={removeFile}
            conversionProgress={isConverting ? progress[0]?.progress : undefined}
          />

          <ConversionSettings
            markdownOptions={options.markdown}
            downloadOptions={options.download}
            onMarkdownOptionsChange={updateMarkdownOptions}
            onDownloadOptionsChange={updateDownloadOptions}
          />

          <ConversionActions
            hasFiles={files.length > 0}
            isConverting={isConverting}
            onConvert={handleConvert}
            onCancel={cancelConversion}
            onClear={clearFiles}
          />
        </div>
      )}

      <ConversionAnimation
        isConverting={isConverting}
        progress={progress[0]?.progress || 0}
      />
    </div>
  );
};
