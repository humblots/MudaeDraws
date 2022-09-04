'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('guilds', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      prefix: {
        type: Sequelize.STRING
      },
      channel: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('guilds');
  }
};