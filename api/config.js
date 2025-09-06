module.exports = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/zapstock'
  },
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key'
};
