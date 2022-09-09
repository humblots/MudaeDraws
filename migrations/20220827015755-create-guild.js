'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('guilds', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.STRING,
			},
			prefix: {
				type: Sequelize.STRING,
				defaultValue: null,
			},
			channel: {
				type: Sequelize.STRING,
				defaultValue: null,
			},
			role: {
				type: Sequelize.STRING,
				defaultValue: null,
			},
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('guilds');
	},
};