var config = {
    host: 'localhost', //Host
    user: 'admin', //Seu usuário aqui
    password: 'JadSuporte@2021', //Sua senha aqui
    database: 'web_dashboard_hmg', //BD    
    waitForConnections: true,
    dialect: "mysql",
    multipleStatements: true,
    connectionLimit: 10,
    queueLimit: 0,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
};

module.exports = config;
//PortalSD@2023
