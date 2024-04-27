"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const { Sequelize } = require('sequelize-typescript');
const { db_config } = require('../../config/db');
exports.sequelize = new Sequelize({
    dialect: 'sqlite',
    logging: false
});
