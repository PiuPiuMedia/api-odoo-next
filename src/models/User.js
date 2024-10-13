const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING);

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
