'use strict';
const { Model } = require('sequelize');
const { Auction } = require('../models');

module.exports = (sequelize, DataTypes) => {
	class Guild extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			// define association here
			this.hasMany(models.Auction, { foreignKey: 'guild_id' });
			this.hasMany(models.Auction, {
				scope: { status: Auction.ONGOING_STATUS }, as: 'ongoingAuctions',
			});
			this.hasMany(models.Auction, {
				scope: { status: Auction.PENDING_STATUS }, as: 'pendingAuctions',
			});
			this.hasMany(models.Auction, {
				scope: { status: Auction.CANCELLED_STATUS }, as: 'cancelledAuctions',
			});
			this.hasMany(models.Auction, {
				scope: { status: Auction.FINISHED_STATUS }, as: 'finishedAuctions',
			});
		}
	}
	Guild.init({
		id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
		prefix: DataTypes.STRING,
		channel: DataTypes.STRING,
	}, {
		sequelize,
		modelName: 'Guild',
		tableName: 'guilds',
		underscored: true,
		timestamps: false,
	});
	return Guild;
};