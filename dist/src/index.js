"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./utils/auth");
const app = express();
//app.use(express.json());
app.use((0, cors_1.default)());
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
const index_1 = require("./db/index");
const models_1 = require("./db/models");
const setupData_1 = require("./db/models/setupData");
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield index_1.sequelize.addModels(models_1.MODELS);
        yield index_1.sequelize.sync();
        yield (0, setupData_1.setupData)('./gtfs-data/');
        console.log('Connection has been established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    if (process.env.sign_public_key === '' || process.env.sign_public_key === undefined || process.env.sign_private_key === '' || process.env.sign_private_key === undefined) {
        throw ("Keys not found");
    }
    const PORT = process.env.PORT || 8000;
    app.use('/search', auth_1.auth, require("./routes/search"));
    app.use('/auth', require("./routes/auth"));
    app.use('/health', require("./routes/health"));
    app.listen(PORT, () => {
        console.log(`Transit BPP listening on port ${PORT}`);
    });
}))();
