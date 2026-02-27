if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

export const JWT_SECRET = process.env.JWT_SECRET;
