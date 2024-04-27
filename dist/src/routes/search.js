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
const express_1 = __importDefault(require("express"));
const utils = require('../utils/util');
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log('Received search');
        console.log((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.context) === null || _b === void 0 ? void 0 : _b.transaction_id, req.rawBody);
        var errorMessage = utils.validateInputs(req);
        if (!errorMessage) {
            utils.createOnSearch(req);
            res.status(200).send({
                "message": {
                    "ack": {
                        "status": "ACK"
                    }
                }
            });
        }
        else {
            res.status(400).send({
                "message": {
                    "ack": {
                        "status": "NACK"
                    }
                },
                "error": {
                    "type": "JSON-SCHEMA-ERROR",
                    "message": errorMessage
                }
            });
        }
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
module.exports = router;
