/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true, // recommended for S3 hosting
};

export default nextConfig;
