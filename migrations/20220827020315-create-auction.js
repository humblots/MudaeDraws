'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('auctions', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			guild_id: {
				type: Sequelize.STRING,
				references: {
					model: 'guilds',
					key: 'id',
				},
				allowNull: false,
			},
			user_id: {
				type: Sequelize.STRING,
				references: {
					model: 'users',
					key: 'id',
				},
				allowNull: false,
			},
			winner_id: {
				type: Sequelize.STRING,
				references: {
					model: 'users',
					key: 'id',
				},
				defaultValue: null,
			},
			character: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			img_url: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			entry_price: {
				type: Sequelize.INTEGER,
				defaultValue: null,
			},
			max_entries: {
				type: Sequelize.INTEGER,
				defaultValue: null,
			},
			max_user_entries: {
				type: Sequelize.INTEGER,
				defaultValue: null,
			},
			start_date: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			end_date: {
				type: Sequelize.DATE,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: new Date(),
			},
			updated_at: {
				type: Sequelize.DATE,
			},
			status: {
				type: Sequelize.STRING,
				allowNull: false,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('auctions');
	},
};