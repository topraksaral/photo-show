const { Sequelize } = require('sequelize');

var sequelize = require("./setSequelize.js");

var Module = sequelize.define('modules', {
    key: {
        type: Sequelize.STRING,
        field: '_key'
    },
    name: {
        type: Sequelize.STRING,
        field: 'name'
    },
    x: {
        type: Sequelize.INTEGER,
        field: 'x',
        defaultValue: 10
    },
    y: {
        type: Sequelize.INTEGER,
        field: 'y',
        defaultValue: 10
    },
    w: {
        type: Sequelize.INTEGER,
        field: 'w',
        defaultValue: 250
    },
    h: {
        type: Sequelize.INTEGER,
        field: 'h',
        defaultValue: 250
    },
    settings: {
        type: Sequelize.STRING,
        field: 'settings'
    },
    data: {
        type: Sequelize.STRING,
        field: 'data'
    },
    status: {
        type: Sequelize.INTEGER,
        field: 'status',
        defaultValue: 1
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


module.exports = Module;
