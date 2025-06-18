declare module '@stagewise/toolbar' {
  export interface ToolbarConfig {
    plugins: any[];
  }

  export function initToolbar(config: ToolbarConfig): void;
} 