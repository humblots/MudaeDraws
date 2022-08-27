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
      $this.belongsToOne(models.User, {foreignKey: 'user_id'});
      $this.belongsToOne(models.Guild, {foreignKey: 'guild_id'});
      $this.hasMany(models.AuctionParticipation, {foreignKey: 'auction_id'})
    }
  }
  Auction.init({
    guild_id: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.STRING, allowNull: false },
    character: { type: DataTypes.STRING, allowNull: false },
    img_url: { type: DataTypes.TEXT, allowNull: false },
    entry_price: DataTypes.INTEGER,
    max_entries: DataTypes.INTEGER,
    max_user_entries: DataTypes.INTEGER,
    start_date: { type: DataTypes.DATE, allowNull: false },
    end_date: DataTypes.DATE,
    created_at: { type: DataTypes.DATE, allowNull: false},
    updated_at: DataTypes.DATE,
    status: { type: DataTypes.STRING, allowNull: false}
  }, {
    sequelize,
    modelName: 'Auction',
    underscored: true
  });
  return Auction;
};