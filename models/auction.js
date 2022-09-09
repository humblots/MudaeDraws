'use strict';
const {
	Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Auction extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			this.belongsTo(models.User, { foreignKey: 'user_id' });
			this.belongsTo(models.Guild, { foreignKey: 'guild_id' });
			this.hasMany(models.AuctionParticipation, { foreignKey: 'auction_id' });
		}

		getEmbedColor() {
			return Auction.STATUS_COLORS[this.status];
		}

		getStatusSymbol() {
			return Auction.STATUS_SYMBOLS[this.status];
		}
	}

	/**
   * Auction's default price
   */
	Auction.DEFAULT_PRICE = 1;

	/**
   * Auction's default end after set days
   */
	Auction.DEFAULT_END_AFTER = 1;

	/**
   * status constants
   */
	Auction.ONGOING_STATUS = 'En cours';
	Auction.PENDING_STATUS = 'En attente';
	Auction.FINISHED_STATUS = 'Terminée';
	Auction.CANCELLED_STATUS = 'Annulée';

	Auction.STATUS_COLORS = {
		[Auction.ONGOING_STATUS]: 0x5BC0DE,
		[Auction.PENDING_STATUS] : 0xAAAAAA,
		[Auction.FINISHED_STATUS] : 0x22BB33,
		[Auction.CANCELLED_STATUS] : 0xBB2124,
	};

	Auction.STATUS_SYMBOLS = {
		[Auction.ONGOING_STATUS] : '🔵',
		[Auction.PENDING_STATUS] : '⚪',
		[Auction.FINISHED_STATUS] : '🟢',
		[Auction.CANCELLED_STATUS] : '🔴',
	};

	Auction.init({
		guild_id: { type: DataTypes.STRING, allowNull: false },
		user_id: { type: DataTypes.STRING, allowNull: false },
		winner_id: { type: DataTypes.STRING, defaultValue: null },
		character: { type: DataTypes.STRING, allowNull: false },
		img_url: { type: DataTypes.TEXT, allowNull: false },
		entry_price: { type: DataTypes.INTEGER, defaultValue: null },
		max_entries: { type: DataTypes.INTEGER, defaultValue: null },
		max_user_entries: { type: DataTypes.INTEGER, defaultValue: null },
		start_date: { type: DataTypes.DATE, allowNull: false },
		end_date: DataTypes.DATE,
		created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: new Date() },
		updated_at: DataTypes.DATE,
		status: { type: DataTypes.STRING, allowNull: false },
	}, {
		sequelize,
		modelName: 'Auction',
		tableName: 'auctions',
		underscored: true,
	});
	return Auction;
};