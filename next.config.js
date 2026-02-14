/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignorar arquivos README e markdown no build
      config.module.rules.push({
        test: /\.(md|txt)$/,
        loader: 'ignore-loader',
      })
      
      // Configurações para libsql
      config.externals.push({
        '@libsql/client': 'commonjs @libsql/client',
        'better-sqlite3': 'commonjs better-sqlite3',
      })
    }
    return config
  },
}

module.exports = nextConfig
