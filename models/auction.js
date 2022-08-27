'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Auction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Auction.init({
    guild_id: DataTypes.STRING,
    user_id: DataTypes.STRING,
    character: DataTypes.STRING,
    img_url: DataTypes.TEXT,
    entry_price: DataTypes.INTEGER,
    max_entries: DataTypes.INTEGER,
    max_user_entries: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Auction',
  });
  return Auction;
};