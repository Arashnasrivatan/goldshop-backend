const required = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
  return value;
};

const configs = {
  app: {
    port: Number(process.env.PORT ?? 4000),
    domain: process.env.DOMAIN ?? "http://localhost:4000",
    cors: process.env.CORS ?? "*",
    env: process.env.NODE_ENV ?? "development",
    sessionSecretKey: process.env.SESSION_SECRET ?? "a_very_secret_key",
  },

  database: {
    mongoURI: required("MONGO_URI"),
  },

  redis: {
    uri: process.env.REDIS_URI ?? "redis://localhost:6379",
  },

  auth: {
    accessToken: {
      secret: required("ACCESS_TOKEN_SECRET_KEY"),
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS ?? 5000),
    },
    refreshToken: {
      secret: required("REFRESH_TOKEN_SECRET_KEY"),
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS ?? 60000),
    },
    resetToken: {
      cooldown: Number(process.env.RESET_TOKEN_COOLDOWN ?? 5), // 5 min
    },
    resetPassword: {
      link:
        process.env.RESET_PASSWORD_LINK ??
        "http://localhost:3000/reset-password",
    },
  },

  sms: {
    baseUrl: required("SMS_BASE_URL"),
    apiKey: required("SMS_API_KEY"),
    pattern: required("SMS_PATERN"),
    patternForgot: required("SMS_PATERN_FORGOT"),
  },

  storage: {
    arvan: {
      accessKey: required("ARVAN_ACCESS_KEY"),
      secretKey: required("ARVAN_SECRET_KEY"),
      bucketName: required("ARVAN_BUCKET_NAME"),
      endpoint: required("ARVAN_ENDPOINT"),
      publicUrl: required("ARVAN_PUBLIC_URL"),
    },
  },

  payment: {
    zibal: {
      merchant: required("ZIBAL_MERCHANT"),
      baseUrl: required("ZIBAL_BASE_URL"),
      paymentBaseUrl: required("ZIBAL_PAYMENT_BASE_URL"),
      callbackUrl: required("ZIBAL_CALLBACK_URL"),
    },
  },

  other: {
    categoryMaxDepth: Number(process.env.CATEGORY_MAX_DEPTH ?? 2),
  },
};

export default Object.freeze(configs);
