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
    }
  }
  AuctionParticipation.init({
    auction_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    entries: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AuctionParticipation',
  });
  return AuctionParticipation;
};