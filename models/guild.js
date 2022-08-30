'use strict';
const {
  Model
} = require('sequelize');
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
    }
  }
  Guild.init({
    id: { type: DataTypes.STRING, allowNull: false, primaryKey: true},
    prefix: DataTypes.STRING,
    channel: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Guild',
    tableName: 'guilds',
    underscored: true,
    timestamps: false
  });
  return Guild;
};