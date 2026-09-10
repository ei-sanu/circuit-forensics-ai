export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'CIRCUIT Intelligence Server',
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/circuit_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'jwt-secret-circuit-auth-key-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'circuit-case-files',
    endpoint: process.env.R2_ENDPOINT || '',
    publicDomain: process.env.R2_PUBLIC_DOMAIN || '',
  },
  mlService: {
    url: process.env.ML_SERVICE_URL || 'http://localhost:8001',
    secret: process.env.ML_SERVICE_SECRET || 'ml-secret-internal-service-key-2026',
  },
  biometric: {
    enabled: process.env.BIOMETRIC_ENABLED !== 'false',
    matchThreshold: parseFloat(process.env.BIOMETRIC_MATCH_THRESHOLD) || 0.78,
    challengeTtlSeconds: parseInt(process.env.BIOMETRIC_CHALLENGE_TTL_SECONDS, 10) || 300,
    maxAttempts: parseInt(process.env.BIOMETRIC_MAX_ATTEMPTS, 10) || 3,
    lockoutSeconds: parseInt(process.env.BIOMETRIC_LOCKOUT_SECONDS, 10) || 900,
    encryptionKey: process.env.BIOMETRIC_ENCRYPTION_KEY || 'circuit-biometric-secret-encryption-key-2026-secure',
  },
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),
});
