/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // 使用标准的 Next.js 输出，而不是静态导出
  // output: 'export',
  images: {
    unoptimized: true,
  },
  // 添加 trailingSlash 配置
  trailingSlash: true,
  // 确保生成正确的资源路径
  assetPrefix: './',
};

module.exports = nextConfig;
