'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auction_participations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      auction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'auctions',
            schema: 'schema'
          },
          key: 'id'
        },
        allowNull: false
      },
      user_id: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'users',
            schema: 'schema'
          },
          key: 'id'
        },
        allowNull: false
      },
      entries: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('auction_participations');
  }
};