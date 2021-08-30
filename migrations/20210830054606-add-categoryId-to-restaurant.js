'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Sequelize 的關聯設置中，預設了外鍵欄位名稱首字大寫(否則會找不到)
    await queryInterface.addColumn('Restaurants', 'CategoryId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      //指定migration生效時要把關聯設定起來
      references: {
        model: 'Categories',
        key: 'id'
      }
    })
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'CategoryId')
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
