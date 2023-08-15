'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.addColumn('draws', 'draw_id', {
			type: DataTypes.INTEGER,
			allowNull: false,
		});

		await queryInterface.addConstraint('draws', {
			fields: ['draw_id', 'guild_id'],
			type: 'unique',
			name: 'UQ_DRAW_DRAW_GUILD',
		});

		await queryInterface.addColumn('draw_participations', 'guild_id', {
			type: DataTypes.STRING,
			allowNull: false,
		});

		return await queryInterface.addConstraint('draw_participations', {
			fields: ['draw_id', 'user_id', 'guild_id'],
			type: 'unique',
			name: 'UQ_DRAW_PARTICIPATION_DRAW_GUILD_USER',
		});
	},

	down: async (queryInterface) => {
		await queryInterface.removeConstraint('draws', 'UQ_DRAW_DRAW_GUILD');
		await queryInterface.removeColumn('draws', 'draw_id');
		await queryInterface.removeConstraint('draw_participations', 'UQ_DRAW_PARTICIPATION_DRAW_GUILD_USER');
		return await queryInterface.removeColumn('draw_participations', 'guild_id');
	},
};
