var config = {
    isProduction: process.env.NODE_ENV === 'production',    
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8080,
    database: {
        name: process.env.DATABASE_NAME || 'wildhacks',
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST || '127.0.0.1',
        dialect: 'mysql',
    },
    auth: {
        gatekey: process.env.AUTH_GATEKEY,
        secret: process.env.AUTH_SECRET,
        expiresIn: process.env.AUTH_EXPIRATION || '7d',
    },
    dropbox: {
        key: process.env.DROPBOX_ACCESS_TOKEN,
    },
    sendgrid: {
        key: process.env.SEND_GRID_API_KEY,
        email: process.env.TEAM_EMAIL,
    },
};

module.exports = config;
