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
exports.Trips = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Calendar_model_1 = require("./Calendar.model");
let Trips = class Trips extends sequelize_typescript_1.Model {
};
exports.Trips = Trips;
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Trips.prototype, "route_id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    (0, sequelize_typescript_1.ForeignKey)(() => Calendar_model_1.Calendar),
    __metadata("design:type", String)
], Trips.prototype, "service_id", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Trips.prototype, "trip_id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Trips.prototype, "trip_headsign", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Trips.prototype, "direction_id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Trips.prototype, "shape_id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Trips.prototype, "zone_id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Trips.prototype, "wheelchair_accessible", void 0);
exports.Trips = Trips = __decorate([
    sequelize_typescript_1.Table
], Trips);
