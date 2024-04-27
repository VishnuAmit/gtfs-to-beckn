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
exports.setupData = void 0;
const csvtojson_1 = __importDefault(require("csvtojson"));
const path_1 = __importDefault(require("path"));
const Calendar_model_1 = require("./Calendar.model");
const FareAttributes_model_1 = require("./FareAttributes.model");
const FareRules_model_1 = require("./FareRules.model");
const Stops_model_1 = require("./Stops.model");
const StopTimes_model_1 = require("./StopTimes.model");
const Trips_model_1 = require("./Trips.model");
const Agency_model_1 = require("./Agency.model");
const setupData = (data_path) => __awaiter(void 0, void 0, void 0, function* () {
    //Clear database
    Calendar_model_1.Calendar.destroy({ where: {} });
    FareAttributes_model_1.FareAttributes.destroy({ where: {} });
    FareRules_model_1.FareRules.destroy({ where: {} });
    Stops_model_1.Stops.destroy({ where: {} });
    StopTimes_model_1.StopTimes.destroy({ where: {} });
    Trips_model_1.Trips.destroy({ where: {} });
    Agency_model_1.Agency.destroy({ where: {} });
    const files = ['calendar', 'fare_attributes', 'fare_rules', 'stops', 'stop_times', 'trips', 'agency'];
    const MODELS = [Calendar_model_1.Calendar, FareAttributes_model_1.FareAttributes, FareRules_model_1.FareRules, Stops_model_1.Stops, StopTimes_model_1.StopTimes, Trips_model_1.Trips, Agency_model_1.Agency];
    for (let index = 0; index < files.length; index++) {
        const file_name = files[index] + '.txt';
        const model = MODELS[index];
        const data = yield (0, csvtojson_1.default)().fromFile(path_1.default.join(data_path, file_name));
        if (file_name === 'calendar.txt') {
            for (var row of data) {
                row.start_date = `${row.start_date.slice(0, 4)}-${row.start_date.slice(4, 6)}-${row.start_date.slice(6, 8)}`;
                row.end_date = `${row.end_date.slice(0, 4)}-${row.end_date.slice(4, 6)}-${row.end_date.slice(6, 8)}`;
            }
        }
        model.bulkCreate(data);
    }
});
exports.setupData = setupData;
