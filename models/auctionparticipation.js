'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AuctionParticipation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: 'user_id' });
      this.belongsTo(models.Auction, { foreignKey: 'auction_id' });
    }
  }
  AuctionParticipation.init({
    auction_id: { type: DataTypes.INTEGER, allowNull: false},
    user_id: { type: DataTypes.INTEGER, allowNull: false},
    entries: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false},
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'AuctionParticipation',
    underscored: true
  });
  return AuctionParticipation;
};