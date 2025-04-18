import JSZip from 'jszip';

export interface EpubMetadata {
  title: string;
  creator?: string;
  publisher?: string;
  language?: string;
  identifier?: string;
  description?: string;
  coverImage?: string; // base64 encoded image
}

export interface EpubContent {
  metadata: EpubMetadata;
  chapters: EpubChapter[];
  images: EpubImage[];
  toc: EpubTocItem[];
}

export interface EpubChapter {
  id: string;
  title: string;
  content: string; // HTML content
  order: number;
}

export interface EpubImage {
  id: string;
  filename: string;
  data: string; // base64 encoded image
  mimeType: string;
}

export interface EpubTocItem {
  id: string;
  title: string;
  level: number;
  children: EpubTocItem[];
}

export class EpubParser {
  private zip: JSZip | null = null;
  private rootFilePath: string = '';
  private contentFolderPath: string = '';
  private opfContent: Document | null = null;
  private ncxContent: Document | null = null;

  /**
   * Parse an EPUB file
   * @param file The EPUB file to parse
   * @returns The parsed EPUB content
   */
  async parse(file: File): Promise<EpubContent> {
    try {
      // Load the EPUB file as a zip archive
      this.zip = await JSZip.loadAsync(file);
      
      // Find the root file (container.xml)
      await this.findRootFile();
      
      // Parse the OPF file
      await this.parseOpf();
      
      // Parse the NCX file (table of contents)
      await this.parseNcx();
      
      // Extract metadata
      const metadata = await this.extractMetadata();
      
      // Extract chapters
      const chapters = await this.extractChapters();
      
      // Extract images
      const images = await this.extractImages();
      
      // Extract table of contents
      const toc = await this.extractToc();
      
      // Find and extract cover image
      await this.extractCoverImage(metadata);
      
      return {
        metadata,
        chapters,
        images,
        toc
      };
    } catch (error) {
      console.error('Error parsing EPUB:', error);
      throw new Error(`Failed to parse EPUB: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Find the root file (container.xml) and extract the path to the OPF file
   */
  private async findRootFile(): Promise<void> {
    if (!this.zip) {
      throw new Error('EPUB file not loaded');
    }

    const containerFile = this.zip.file('META-INF/container.xml');
    if (!containerFile) {
      throw new Error('Invalid EPUB: container.xml not found');
    }

    const containerContent = await containerFile.async('text');
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerContent, 'application/xml');
    
    const rootFilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
    if (!rootFilePath) {
      throw new Error('Invalid EPUB: rootfile path not found in container.xml');
    }

    this.rootFilePath = rootFilePath;
    this.contentFolderPath = rootFilePath.substring(0, rootFilePath.lastIndexOf('/') + 1);
  }

  /**
   * Parse the OPF file
   */
  private async parseOpf(): Promise<void> {
    if (!this.zip || !this.rootFilePath) {
      throw new Error('EPUB file not loaded or root file not found');
    }

    const opfFile = this.zip.file(this.rootFilePath);
    if (!opfFile) {
      throw new Error(`OPF file not found at path: ${this.rootFilePath}`);
    }

    const opfContent = await opfFile.async('text');
    const parser = new DOMParser();
    this.opfContent = parser.parseFromString(opfContent, 'application/xml');
  }

  /**
   * Parse the NCX file (table of contents)
   */
  private async parseNcx(): Promise<void> {
    if (!this.zip || !this.opfContent) {
      throw new Error('EPUB file not loaded or OPF file not parsed');
    }

    // Find the NCX file in the spine
    const ncxId = this.opfContent.querySelector('spine')?.getAttribute('toc');
    if (!ncxId) {
      // Some EPUBs might not have an NCX file
      return;
    }

    const ncxItem = this.opfContent.querySelector(`manifest item[id="${ncxId}"]`);
    if (!ncxItem) {
      return;
    }

    const ncxPath = ncxItem.getAttribute('href');
    if (!ncxPath) {
      return;
    }

    const fullNcxPath = this.contentFolderPath + ncxPath;
    const ncxFile = this.zip.file(fullNcxPath);
    if (!ncxFile) {
      return;
    }

    const ncxContent = await ncxFile.async('text');
    const parser = new DOMParser();
    this.ncxContent = parser.parseFromString(ncxContent, 'application/xml');
  }

  /**
   * Extract metadata from the OPF file
   */
  private async extractMetadata(): Promise<EpubMetadata> {
    if (!this.opfContent) {
      throw new Error('OPF file not parsed');
    }

    const metadata: EpubMetadata = {
      title: 'Unknown Title'
    };

    // Extract basic metadata
    const titleElement = this.opfContent.querySelector('metadata title');
    if (titleElement) {
      metadata.title = titleElement.textContent || 'Unknown Title';
    }

    const creatorElement = this.opfContent.querySelector('metadata creator');
    if (creatorElement) {
      metadata.creator = creatorElement.textContent || undefined;
    }

    const publisherElement = this.opfContent.querySelector('metadata publisher');
    if (publisherElement) {
      metadata.publisher = publisherElement.textContent || undefined;
    }

    const languageElement = this.opfContent.querySelector('metadata language');
    if (languageElement) {
      metadata.language = languageElement.textContent || undefined;
    }

    const identifierElement = this.opfContent.querySelector('metadata identifier');
    if (identifierElement) {
      metadata.identifier = identifierElement.textContent || undefined;
    }

    const descriptionElement = this.opfContent.querySelector('metadata description');
    if (descriptionElement) {
      metadata.description = descriptionElement.textContent || undefined;
    }

    return metadata;
  }

  /**
   * Extract chapters from the EPUB file
   */
  private async extractChapters(): Promise<EpubChapter[]> {
    if (!this.zip || !this.opfContent) {
      throw new Error('EPUB file not loaded or OPF file not parsed');
    }

    const chapters: EpubChapter[] = [];
    const spine = this.opfContent.querySelectorAll('spine itemref');
    const manifest = this.opfContent.querySelectorAll('manifest item');

    // Create a map of id to href from the manifest
    const idToHref = new Map<string, string>();
    manifest.forEach(item => {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      if (id && href) {
        idToHref.set(id, href);
      }
    });

    // Extract chapters from the spine
    let order = 0;
    for (const itemref of spine) {
      const idref = itemref.getAttribute('idref');
      if (!idref) continue;

      const href = idToHref.get(idref);
      if (!href) continue;

      const fullPath = this.contentFolderPath + href;
      const file = this.zip.file(fullPath);
      if (!file) continue;

      const content = await file.async('text');
      
      // Extract title from the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      let title = doc.querySelector('title')?.textContent || 
                  doc.querySelector('h1')?.textContent || 
                  `Chapter ${order + 1}`;

      chapters.push({
        id: idref,
        title,
        content,
        order: order++
      });
    }

    return chapters;
  }

  /**
   * Extract images from the EPUB file
   */
  private async extractImages(): Promise<EpubImage[]> {
    if (!this.zip || !this.opfContent) {
      throw new Error('EPUB file not loaded or OPF file not parsed');
    }

    const images: EpubImage[] = [];
    const imageItems = this.opfContent.querySelectorAll('manifest item[media-type^="image/"]');

    for (const item of imageItems) {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      const mimeType = item.getAttribute('media-type');

      if (!id || !href || !mimeType) continue;

      const fullPath = this.contentFolderPath + href;
      const file = this.zip.file(fullPath);
      if (!file) continue;

      const data = await file.async('base64');
      const filename = href.split('/').pop() || '';

      images.push({
        id,
        filename,
        data,
        mimeType
      });
    }

    return images;
  }

  /**
   * Extract table of contents from the NCX file
   */
  private async extractToc(): Promise<EpubTocItem[]> {
    if (!this.ncxContent) {
      return [];
    }

    const navPoints = this.ncxContent.querySelectorAll('navMap > navPoint');
    return this.processNavPoints(navPoints);
  }

  /**
   * Process navPoints recursively to build the table of contents
   */
  private processNavPoints(navPoints: NodeListOf<Element>, level: number = 1): EpubTocItem[] {
    const items: EpubTocItem[] = [];

    navPoints.forEach(navPoint => {
      const id = navPoint.getAttribute('id') || '';
      const labelText = navPoint.querySelector('navLabel text')?.textContent || '';
      
      const item: EpubTocItem = {
        id,
        title: labelText,
        level,
        children: []
      };

      // Process child navPoints recursively
      const childNavPoints = navPoint.querySelectorAll(':scope > navPoint');
      if (childNavPoints.length > 0) {
        item.children = this.processNavPoints(childNavPoints, level + 1);
      }

      items.push(item);
    });

    return items;
  }

  /**
   * Extract cover image from the EPUB file
   */
  private async extractCoverImage(metadata: EpubMetadata): Promise<void> {
    if (!this.zip || !this.opfContent) {
      return;
    }

    // Try to find cover image in different ways
    
    // Method 1: Look for meta element with name="cover"
    const coverMeta = this.opfContent.querySelector('metadata meta[name="cover"]');
    if (coverMeta) {
      const coverId = coverMeta.getAttribute('content');
      if (coverId) {
        const coverItem = this.opfContent.querySelector(`manifest item[id="${coverId}"]`);
        if (coverItem) {
          const href = coverItem.getAttribute('href');
          if (href) {
            await this.loadCoverImage(href, metadata);
            return;
          }
        }
      }
    }

    // Method 2: Look for item with properties="cover-image"
    const coverImageItem = this.opfContent.querySelector('manifest item[properties="cover-image"]');
    if (coverImageItem) {
      const href = coverImageItem.getAttribute('href');
      if (href) {
        await this.loadCoverImage(href, metadata);
        return;
      }
    }

    // Method 3: Look for item with id containing "cover"
    const coverIdItem = this.opfContent.querySelector('manifest item[id*="cover"][media-type^="image/"]');
    if (coverIdItem) {
      const href = coverIdItem.getAttribute('href');
      if (href) {
        await this.loadCoverImage(href, metadata);
        return;
      }
    }

    // Method 4: Look for item with href containing "cover"
    const coverHrefItem = this.opfContent.querySelector('manifest item[href*="cover"][media-type^="image/"]');
    if (coverHrefItem) {
      const href = coverHrefItem.getAttribute('href');
      if (href) {
        await this.loadCoverImage(href, metadata);
      }
    }
  }

  /**
   * Load cover image from the EPUB file
   */
  private async loadCoverImage(href: string, metadata: EpubMetadata): Promise<void> {
    if (!this.zip) {
      return;
    }

    const fullPath = this.contentFolderPath + href;
    const file = this.zip.file(fullPath);
    if (!file) {
      return;
    }

    const mimeType = this.getMimeTypeFromExtension(href);
    const data = await file.async('base64');
    metadata.coverImage = `data:${mimeType};base64,${data}`;
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeTypeFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'image/jpeg';
    }
  }
}
