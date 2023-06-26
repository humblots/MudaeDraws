'use strict';
const {
	Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class DrawParticipation extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.User, { foreignKey: 'user_id' });
			this.belongsTo(models.Draw, { foreignKey: 'draw_id' });
		}
	}

	DrawParticipation.init({
		draw_id: { type: DataTypes.INTEGER, allowNull: false },
		user_id: { type: DataTypes.STRING, allowNull: false },
		entries: { type: DataTypes.INTEGER, allowNull: false },
		created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: new Date() },
		updated_at: DataTypes.DATE,
	}, {
		sequelize,
		modelName: 'DrawParticipation',
		tableName: 'draw_participations',
		underscored: true,
	});
	return DrawParticipation;
};
