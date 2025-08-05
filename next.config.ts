import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // ブラウザ環境でのfsモジュールエラーを回避
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
    }

    // PDF.jsのSSR問題を解決
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pdfjs-dist');
    }

    return config;
  },
}

export default nextConfig
