'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Auction extends Model {

    /**
     * Default auction price
     */
    static DEFAULT_PRICE = 1;

    /**
     * Default auction end after set days 
     */
    static DEFAULT_END_AFTER = 1

    /**
     * status constants
     */
    static ONGOING_STATUS = "En cours";
    static PENDING_STATUS = "En attente";
    static FINISHED_STATUS = "Terminée";
    static CANCELLED_STATUS = "Annulée";

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {foreignKey: 'user_id'});
      this.belongsTo(models.Guild, {foreignKey: 'guild_id'});
      this.hasMany(models.AuctionParticipation, {foreignKey: 'auction_id'})
    }

    getEmbedColor() {
      let color;
      switch(this.status) {
        case Auction.ONGOING_STATUS: {color = 0x5BC0DE; break;}
        case Auction.PENDING_STATUS: {color = 0xAAAAAA; break;}
        case Auction.CANCELLED_STATUS : {color = 0xBB2124; break;}
        case Auction.FINISHED_STATUS: {color = 0x22BB33; break;}
        default: {color = 0xFFFFFF}
      }
      return color;
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
    status: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'Auction',
    tableName: 'auctions',
    underscored: true
  });
  return Auction;
};