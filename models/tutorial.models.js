module.exports = (sequelize, Sequelize) => {
    const Tutorial = sequelize.define("tb_upload_ov_xls", {
      cod_ordem: {
        type: Sequelize.STRING
      },
      empresa: {
        type: Sequelize.STRING
      },
      canal_dist: {
        type: Sequelize.STRING
      },
      setor_ativ: {
        type: Sequelize.STRING
      },
      cliente: {
        type: Sequelize.STRING
      },

    });
    return Tutorial;
  };


