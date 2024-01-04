import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../public', // 빌드 파일을 public 디렉토리로 지정
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',
        // chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/main.css`
      }
    }
  }
});
