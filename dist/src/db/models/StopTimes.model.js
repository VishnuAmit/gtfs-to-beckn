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
exports.StopTimes = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Stops_model_1 = require("./Stops.model");
const Trips_model_1 = require("./Trips.model");
let StopTimes = class StopTimes extends sequelize_typescript_1.Model {
};
exports.StopTimes = StopTimes;
__decorate([
    sequelize_typescript_1.Column,
    (0, sequelize_typescript_1.ForeignKey)(() => Trips_model_1.Trips),
    __metadata("design:type", String)
], StopTimes.prototype, "trip_id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], StopTimes.prototype, "arrival_time", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], StopTimes.prototype, "departure_time", void 0);
__decorate([
    sequelize_typescript_1.Column,
    (0, sequelize_typescript_1.ForeignKey)(() => Stops_model_1.Stops),
    __metadata("design:type", String)
], StopTimes.prototype, "stop_id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], StopTimes.prototype, "stop_sequence", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], StopTimes.prototype, "timepoint", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], StopTimes.prototype, "shape_dist_traveled", void 0);
exports.StopTimes = StopTimes = __decorate([
    sequelize_typescript_1.Table
], StopTimes);
