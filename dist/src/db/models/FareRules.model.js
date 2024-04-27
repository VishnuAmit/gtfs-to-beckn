"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FareRules = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const FareAttributes_model_1 = require("./FareAttributes.model");
const Stops_model_1 = require("./Stops.model");
let FareRules = class FareRules extends sequelize_typescript_1.Model {
};
exports.FareRules = FareRules;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => FareAttributes_model_1.FareAttributes),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], FareRules.prototype, "fare_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Stops_model_1.Stops),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], FareRules.prototype, "origin_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Stops_model_1.Stops),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], FareRules.prototype, "destination_id", void 0);
exports.FareRules = FareRules = __decorate([
    sequelize_typescript_1.Table
], FareRules);
