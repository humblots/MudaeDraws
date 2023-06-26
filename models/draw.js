'use strict';
const {
	Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Draw extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.User, { foreignKey: 'user_id' });
			this.belongsTo(models.Guild, { foreignKey: 'guild_id' });
			this.hasMany(models.DrawParticipation, { foreignKey: 'draw_id' });
		}

		getEmbedColor() {
			return Draw.STATUS_COLORS[this.status];
		}

		getStatusSymbol() {
			return Draw.STATUS_SYMBOLS[this.status];
		}
	}

	/**
	 * Draw's default price
	 */
	Draw.DEFAULT_PRICE = 1;

	/**
	 * Draw's default end after set days
	 */
	Draw.DEFAULT_END_AFTER = 1;

	/**
	 * status constants
	 */
	Draw.ONGOING_STATUS = 'En cours';
	Draw.PENDING_STATUS = 'En attente';
	Draw.FINISHED_STATUS = 'Terminée';
	Draw.CANCELLED_STATUS = 'Annulée';

	Draw.STATUS_COLORS = {
		[Draw.ONGOING_STATUS]: 0x5BC0DE,
		[Draw.PENDING_STATUS]: 0xAAAAAA,
		[Draw.FINISHED_STATUS]: 0x22BB33,
		[Draw.CANCELLED_STATUS]: 0xBB2124,
	};

	Draw.STATUS_SYMBOLS = {
		[Draw.ONGOING_STATUS]: '🔵',
		[Draw.PENDING_STATUS]: '⚪',
		[Draw.FINISHED_STATUS]: '🟢',
		[Draw.CANCELLED_STATUS]: '🔴',
	};

	Draw.init({
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
		modelName: 'Draw',
		tableName: 'draws',
		underscored: true,
	});
	return Draw;
};