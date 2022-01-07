const { Sequelize } = require('sequelize');

var sequelize = require("./setSequelize.js");

var Photo = sequelize.define('photos', {
    id: {
        type: Sequelize.INTEGER,
        field: 'id',
        primaryKey: true,
        autoIncrement: true
    },
    path: {
        type: Sequelize.STRING,
        field: 'path'
    },
    title: {
        type: Sequelize.STRING,
        field: 'title',
        defaultValue: null
    },
    type: {
        type: Sequelize.INTEGER,
        field: 'type',
        defaultValue: 1
    },
    color: {
        type: Sequelize.STRING,
        field: 'color',
        defaultValue: '#CCCCCC'
    },
    transition: {
        type: Sequelize.STRING,
        field: 'transition',
        defaultValue: 'fade'
    },
    transitionDuration: {
        type: Sequelize.INTEGER,
        field: 'transition_duration',
        defaultValue: 1000
    },
    order: {
        type: Sequelize.INTEGER,
        field: '_order',
        defaultValue: 999999
    },
    area: {
        type: Sequelize.INTEGER,
        field: 'area',
        defaultValue: 0
    },
    delay: {
        type: Sequelize.INTEGER,
        field: 'delay',
        defaultValue: 5000
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


module.exports = Photo;
