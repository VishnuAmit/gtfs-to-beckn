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
exports.Calendar = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
let Calendar = class Calendar extends sequelize_typescript_1.Model {
};
exports.Calendar = Calendar;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Calendar.prototype, "service_id", void 0);
__decorate([
    (0, sequelize_typescript_1.IsIn)([["0", "1"]]),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Calendar.prototype, "monday", void 0);
__decorate([
    (0, sequelize_typescript_1.IsIn)([["0", "1"]]),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Calendar.prototype, "tuesday", void 0);
__decorate([
    (0, sequelize_typescript_1.IsIn)([["0", "1"]]),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Calendar.prototype, "wednesday", void 0);
__decorate([
    (0, sequelize_typescript_1.IsIn)([["0", "1"]]),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Calendar.prototype, "thursday", void 0);
__decorate([
    (0, sequelize_typescript_1.IsIn)([["0", "1"]]),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Calendar.prototype, "friday", void 0);
__decorate([
    (0, sequelize_typescript_1.IsIn)([["0", "1"]]),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Calendar.prototype, "saturday", void 0);
__decorate([
    (0, sequelize_typescript_1.IsIn)([["0", "1"]]),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Calendar.prototype, "sunday", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Calendar.prototype, "start_date", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Calendar.prototype, "end_date", void 0);
exports.Calendar = Calendar = __decorate([
    sequelize_typescript_1.Table
], Calendar);
