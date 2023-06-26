'use strict';
const {
	Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			// define association here
			this.hasMany(models.AuctionParticipation, { foreignKey: 'user_id' });
		}
	}

	User.init({
		id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
		occupied: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
		created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: new Date() },
	}, {
		sequelize,
		modelName: 'User',
		tableName: 'users',
		underscored: true,
		timestamps: false,
	});
	return User;
};