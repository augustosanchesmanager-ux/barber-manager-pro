/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  output: 'standalone',
  // Configuração vazia do Turbopack para silenciar warning
  turbopack: {},
}

module.exports = nextConfig
