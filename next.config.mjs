/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/lab-project' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/lab-project/' : '',
};

// // export default nextConfig;
// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;