'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auctions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      guild_id: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'guilds',
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
      character: {
        type: Sequelize.STRING,
        allowNull: false
      },
      img_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      entry_price: {
        type: Sequelize.INTEGER
      },
      max_entries: {
        type: Sequelize.INTEGER
      },
      max_user_entries: {
        type: Sequelize.INTEGER
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('auctions');
  }
};