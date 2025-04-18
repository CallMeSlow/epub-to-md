import { EpubContent, EpubChapter, EpubImage, EpubTocItem } from './epub-parser';
import TurndownService from 'turndown';

export interface MarkdownOutput {
  readme: string;
  summary: string;
  chapters: MarkdownChapter[];
  images: EpubImage[];
}

export interface MarkdownChapter {
  id: string;
  title: string;
  content: string; // Markdown content
  filename: string;
  order: number;
}

export interface MarkdownConverterOptions {
  format: 'standard' | 'gfm';
  imageHandling: 'inline' | 'separate';
  outputStructure: 'single' | 'chapter';
}

export class MarkdownConverter {
  private turndownService: TurndownService;
  private options: MarkdownConverterOptions;

  constructor(options: MarkdownConverterOptions) {
    this.options = options;
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*'
    });

    // Enable GitHub Flavored Markdown if selected
    if (options.format === 'gfm') {
      this.turndownService.use([
        // Add GFM plugins if available
      ]);
    }

    // Add custom rules for better conversion
    this.addCustomRules();
  }

  /**
   * Convert EPUB content to Markdown
   */
  convert(epubContent: EpubContent): MarkdownOutput {
    // Generate README.md with book metadata
    const readme = this.generateReadme(epubContent);

    // Generate SUMMARY.md with table of contents
    const summary = this.generateSummary(epubContent.toc);

    // Convert chapters to Markdown
    const chapters = this.convertChapters(epubContent.chapters, epubContent.images);

    return {
      readme,
      summary,
      chapters,
      images: epubContent.images
    };
  }

  /**
   * Generate README.md with book metadata
   */
  private generateReadme(epubContent: EpubContent): string {
    const { metadata } = epubContent;
    let readme = `# ${metadata.title}\n\n`;

    if (metadata.creator) {
      readme += `> 作者：${metadata.creator}\n>\n`;
    }

    if (metadata.publisher) {
      readme += `> 出版商：${metadata.publisher}\n>\n`;
    }

    readme += `> 转换时间：${new Date().toLocaleDateString()}\n\n`;

    if (metadata.description) {
      readme += `## 简介\n\n${metadata.description}\n\n`;
    }

    readme += `## 目录\n\n`;

    // Add a simplified table of contents
    epubContent.toc.forEach(item => {
      const indent = '  '.repeat(item.level - 1);
      readme += `${indent}- [${item.title}](${this.getChapterFilename(item.id)})\n`;

      // Add children
      this.addTocChildrenToReadme(item.children, readme);
    });

    return readme;
  }

  /**
   * Add TOC children to README recursively
   */
  private addTocChildrenToReadme(children: EpubTocItem[], readme: string): string {
    children.forEach(child => {
      const indent = '  '.repeat(child.level - 1);
      readme += `${indent}- [${child.title}](${this.getChapterFilename(child.id)})\n`;

      if (child.children.length > 0) {
        this.addTocChildrenToReadme(child.children, readme);
      }
    });

    return readme;
  }

  /**
   * Generate SUMMARY.md with table of contents
   */
  private generateSummary(toc: EpubTocItem[]): string {
    let summary = `# 目录\n\n`;

    toc.forEach(item => {
      const indent = '  '.repeat(item.level - 1);
      summary += `${indent}- [${item.title}](${this.getChapterFilename(item.id)})\n`;

      // Add children
      if (item.children.length > 0) {
        this.addTocChildrenToSummary(item.children, summary);
      }
    });

    return summary;
  }

  /**
   * Add TOC children to SUMMARY recursively
   */
  private addTocChildrenToSummary(children: EpubTocItem[], summary: string): string {
    children.forEach(child => {
      const indent = '  '.repeat(child.level - 1);
      summary += `${indent}- [${child.title}](${this.getChapterFilename(child.id)})\n`;

      if (child.children.length > 0) {
        this.addTocChildrenToSummary(child.children, summary);
      }
    });

    return summary;
  }

  /**
   * Convert chapters to Markdown
   */
  private convertChapters(chapters: EpubChapter[], images: EpubImage[]): MarkdownChapter[] {
    return chapters.map(chapter => {
      // Convert HTML to Markdown
      let content = this.turndownService.turndown(chapter.content);

      // Process images based on options
      if (this.options.imageHandling === 'inline') {
        content = this.processInlineImages(content, images);
      } else {
        content = this.processExternalImages(content, images);
      }

      return {
        id: chapter.id,
        title: chapter.title,
        content,
        filename: this.getChapterFilename(chapter.id),
        order: chapter.order
      };
    });
  }

  /**
   * Process images for inline base64 embedding
   */
  private processInlineImages(content: string, images: EpubImage[]): string {
    // Replace image references with base64 data URLs
    images.forEach(image => {
      const regex = new RegExp(`!\\[.*?\\]\\(.*${image.filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?\\)`, 'g');
      content = content.replace(regex, `![${image.filename}](data:${image.mimeType};base64,${image.data})`);
    });

    return content;
  }

  /**
   * Process images for external file references
   */
  private processExternalImages(content: string, images: EpubImage[]): string {
    // Replace image references with paths to the images folder
    images.forEach(image => {
      const regex = new RegExp(`!\\[.*?\\]\\(.*${image.filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?\\)`, 'g');
      content = content.replace(regex, `![${image.filename}](./images/${image.filename})`);
    });

    return content;
  }

  /**
   * Get chapter filename from ID
   */
  private getChapterFilename(id: string): string {
    return `${id.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
  }

  /**
   * Add custom rules to the Turndown service
   */
  private addCustomRules(): void {
    // Handle tables better
    this.turndownService.addRule('tables', {
      filter: ['table'],
      replacement: function(content) {
        // This is a simplified example - a real implementation would be more complex
        const tableContent = content.trim();
        return '\n\n' + tableContent + '\n\n';
      }
    });

    // Handle code blocks better
    this.turndownService.addRule('codeBlocks', {
      filter: function(node) {
        return (
          node.nodeName === 'PRE' &&
          node.firstChild &&
          node.firstChild.nodeName === 'CODE'
        );
      },
      replacement: function(content, node) {
        const code = node.textContent || '';
        const language = node.getAttribute('data-language') || '';
        return '\n\n```' + language + '\n' + code.trim() + '\n```\n\n';
      }
    });

    // Handle footnotes
    this.turndownService.addRule('footnotes', {
      filter: function(node) {
        return (
          node.nodeName === 'SPAN' &&
          node.classList.contains('footnote')
        );
      },
      replacement: function(content, node) {
        const id = node.getAttribute('id') || '';
        return '[^' + id + ']';
      }
    });
  }
}
