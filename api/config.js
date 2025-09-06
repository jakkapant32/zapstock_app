module.exports = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://zapstock_user:jb3uWpZlFoG3f2d1PI21ZFX0frHSGrDW@dpg-d2q1vder433s73dqf0lg-a.oregon-postgres.render.com/zapstock_db',
    ssl: { rejectUnauthorized: false }
  },
  port: process.env.PORT || 3000,
  cors: {
    allowedOrigins: ['*']
  }
};
