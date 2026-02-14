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
  // Desabilitar coleta estática apenas em build para evitar problema do NextAuth
  ...(process.env.VERCEL === '1' && {
    experimental: {
      ...this?.experimental,
      staticPageGenerationTimeout: 1000,
    },
  }),
}

module.exports = nextConfig
