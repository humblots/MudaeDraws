'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('auction_participations', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			auction_id: {
				type: Sequelize.INTEGER,
				references: {
					model: 'auctions',
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
			entries: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: new Date(),
			},
			updated_at: {
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('auction_participations');
	},
};