const { Sequelize } = require('sequelize');

var sequelize = require("./setSequelize.js");

var Setting = sequelize.define('settings', {
    key: {
        type: Sequelize.STRING,
        field: '_key',
        primaryKey: true
    },
    type: {
        type: Sequelize.INTEGER,
        field: 'type'
    },
    value: {
        type: Sequelize.STRING,
        field: '_value'
    },
    createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
    freezeTableName: true
});


module.exports = Setting;
