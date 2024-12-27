import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  favicons: ['/logo.png'],
  themeConfig: {
    // name: 'TG',
    logo: '/logo.png',
  },
  styles: [
    `
      .markdown {
        font-size: 14px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji' !important;
      }
      .markdown h1, .markdown h2, .markdown h3, .markdown h4, .markdown h5, .markdown h6 {
        color: rgba(0, 0, 0, 0.88);
        font-weight: 500;
        font-family: Avenir, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
      }
      .markdown .dumi-default-table {
        overflow-x: auto;
        overflow-y: hidden;
        font-family: 'SFMono-Regular',Consolas,'Liberation Mono',Menlo,Courier,monospace;
        line-height: 1.5714285714285714;
      }
      .markdown .dumi-default-table-content {
        scrollbar-width: thin;
        scrollbar-gutter: stable;
      }
      .dumi-default-table-content {
        overflow: auto;
      }
      .markdown .dumi-default-table td:first-child {
        width: 18%;
        min-width: 58px;
        color: rgba(0, 0, 0, 0.88);
        font-weight: 600;
        white-space: nowrap;
      }
      .markdown .dumi-default-table td:nth-child(2) {
        min-width: 160px;
      }
      .markdown .dumi-default-table td:nth-child(3) {
        width: 22%;
        min-width: 80px;
        color: #c41d7f;
        font-size: 13px;
      }
      .markdown .dumi-default-table td:nth-child(4) {
        width: 15%;
        min-width: 60px;
        font-size: 13px;
      }
      .markdown .dumi-default-table td:nth-child(5) {
        min-width: 160px;
        font-size: 13px;
      }
    `,
  ],
});
