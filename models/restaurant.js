'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      // define association here
      Restaurant.belongsTo(models.Category)  // 加入關聯設定
      Restaurant.hasMany(models.Comment)
    }
  };
  Restaurant.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    opening_hours: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    CategoryId: DataTypes.INTEGER,
    viewCounts: DataTypes.INTEGER,// 更新欄位清單
  }, {
    sequelize,
    modelName: 'Restaurant'
  })
  return Restaurant
}