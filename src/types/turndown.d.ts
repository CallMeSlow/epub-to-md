declare module 'turndown' {
  interface TurndownOptions {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: '-' | '+' | '*';
    codeBlockStyle?: 'indented' | 'fenced';
    emDelimiter?: '_' | '*';
    strongDelimiter?: '__' | '**';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
  }

  interface Rule {
    filter: string[] | ((node: HTMLElement) => boolean);
    replacement: (content: string, node?: HTMLElement, options?: any) => string;
  }

  interface TurndownService {
    addRule(key: string, rule: Rule): TurndownService;
    use(plugin: any | any[]): TurndownService;
    remove(key: string): TurndownService;
    keep(filter: string[] | ((node: HTMLElement) => boolean)): TurndownService;
    remove(filter: string[] | ((node: HTMLElement) => boolean)): TurndownService;
    escape(str: string): string;
    turndown(html: string | HTMLElement): string;
  }

  class TurndownService {
    constructor(options?: TurndownOptions);
    addRule(key: string, rule: Rule): TurndownService;
    use(plugin: any | any[]): TurndownService;
    remove(key: string): TurndownService;
    keep(filter: string[] | ((node: HTMLElement) => boolean)): TurndownService;
    remove(filter: string[] | ((node: HTMLElement) => boolean)): TurndownService;
    escape(str: string): string;
    turndown(html: string | HTMLElement): string;
  }

  export = TurndownService;
}
