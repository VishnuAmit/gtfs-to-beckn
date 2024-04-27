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
exports.combineURLs = void 0;
const lodash_1 = __importDefault(require("lodash"));
const sequelize_1 = require("sequelize");
const axios = require('axios').default;
const Stops_model_1 = require("../db/models/Stops.model");
const { config } = require('../../config/config');
const index_1 = require("../db/index");
const auth_1 = require("./auth");
function combineURLs(baseURL, relativeURL) {
    return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
}
exports.combineURLs = combineURLs;
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
const findClosestStops = (gps) => __awaiter(void 0, void 0, void 0, function* () {
    const lat1 = parseFloat(gps.split(',')[0]);
    const lon1 = parseFloat(gps.split(',')[1]);
    const stops = yield getAllStations();
    var stops_obj = [];
    for (var stop of stops) {
        var stop_obj = stop.toJSON();
        const lat2 = parseFloat(stop.stop_lat);
        const lon2 = parseFloat(stop.stop_lon);
        const distance = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
        stop_obj.distance = distance;
        stops_obj.push(stop_obj);
    }
    const sortedStops = lodash_1.default.sortBy(stops_obj, ['distance']);
    const closestStop = sortedStops[0];
    var closestStops = [];
    closestStops.push(closestStop.stop_id);
    console.log(closestStop.stop_id, closestStop.distance, "kms away");
    if (closestStop.distance > config.DISTANCE_LIMIT_KM) {
        return [];
    }
    for (var this_stop of sortedStops.slice(1)) {
        if ((this_stop.distance - closestStop.distance) < config.THRESHOLD_DISTANCE_KM && sortedStops.indexOf(this_stop) < config.MAX_STATIONS) {
            closestStops.push(this_stop.stop_id);
            console.log(this_stop.stop_id, this_stop.distance, "kms away");
        }
        else {
            break;
        }
    }
    return closestStops;
});
const findClosestFromGMapsResponse = (sortedResponses) => {
    const closestStop = sortedResponses[0];
    var closestStops = [];
    closestStops.push(closestStop.stop_id);
    console.log("Closest is ", closestStop.stop_id, closestStop.distance.text, " and ", closestStop.duration.text, " away");
    if (closestStop.distance.value / 1000 > config.DISTANCE_LIMIT_KM) {
        return [];
    }
    for (var stop of sortedResponses.slice(1)) {
        const threshold_passed = config.USE_TIME_THRESHOLD ?
            (stop.duration.value / 60 - closestStop.duration.value / 60) < config.THRESHOLD_TIME_MIN :
            (stop.distance.value / 1000 - closestStop.distance.value / 1000) < config.THRESHOLD_DISTANCE_KM;
        //console.log("Delta distance:", (stop.distance.value / 1000 - closestStop.distance.value / 1000),"Delta time:" ,(stop.duration.value / 60 - closestStop.duration.value / 60));
        if (threshold_passed && sortedResponses.indexOf(stop) < config.MAX_STATIONS) {
            closestStops.push(stop.stop_id);
            console.log(stop.stop_id, stop.distance.text, " and ", stop.duration.text, " away selected");
        }
        else {
            break;
        }
    }
    return closestStops;
};
const findClosestStopsMaps = (gpsStart, gpsEnd) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stops = yield getAllStations();
        const origins = [gpsStart, gpsEnd].join('|');
        const destinations_array = [];
        for (var stop of stops) {
            destinations_array.push(`${stop.stop_lat},${stop.stop_lon}`);
        }
        const destinations = destinations_array.join('|');
        const response = yield axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                destinations: destinations,
                origins: origins,
                key: process.env.MAPS_KEY,
                mode: 'DRIVING'
            }
        });
        if (response.data.status !== 'OK') {
            console.log("Response from google maps:", response);
            throw ("Maps API error");
        }
        const origin_distances = response.data.rows[0].elements;
        const destination_distances = response.data.rows[1].elements;
        for (var index in origin_distances) {
            origin_distances[index].stop_id = stops[index].stop_id;
        }
        for (var index in destination_distances) {
            destination_distances[index].stop_id = stops[index].stop_id;
        }
        const sorted_origin_distances = lodash_1.default.sortBy(origin_distances, ['distance.value']);
        const origin_stations = findClosestFromGMapsResponse(sorted_origin_distances);
        const sorted_destination_distances = lodash_1.default.sortBy(destination_distances, ['distance.value']);
        const destination_stations = findClosestFromGMapsResponse(sorted_destination_distances);
        return [origin_stations, destination_stations];
    }
    catch (error) {
        console.log(error);
        throw (error);
    }
});
const validateGps = (gps) => {
    if (gps.split(',').length !== 2) {
        return false;
    }
    var [lat, lon] = gps.split(',');
    var lat_val = parseFloat(lat);
    var lon_val = parseFloat(lon);
    if (!(!isNaN(lat_val) && !isNaN(lat) && lat_val <= 90 && lat_val >= -90)) {
        return false;
    }
    if (!(!isNaN(lon_val) && !isNaN(lon) && lon_val <= 180 && lon_val >= -180)) {
        return false;
    }
    return true;
};
const validateInputs = (req) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
    const body = req.body;
    const context = req.body.context;
    if (!context) {
        return "Context not found";
    }
    if (context.city != config.city || context.domain != config.domain || context.country != config.country || context.core_version != config.core_version) {
        return "Wrong value in context";
    }
    var start_received = false;
    var end_received = false;
    var start_gps_valid = true;
    var end_gps_valid = true;
    if ((_e = (_d = (_c = (_b = (_a = body.message) === null || _a === void 0 ? void 0 : _a.intent) === null || _b === void 0 ? void 0 : _b.fulfillment) === null || _c === void 0 ? void 0 : _c.start) === null || _d === void 0 ? void 0 : _d.location) === null || _e === void 0 ? void 0 : _e.station_code) {
        start_received = true;
    }
    if ((_k = (_j = (_h = (_g = (_f = body.message) === null || _f === void 0 ? void 0 : _f.intent) === null || _g === void 0 ? void 0 : _g.fulfillment) === null || _h === void 0 ? void 0 : _h.end) === null || _j === void 0 ? void 0 : _j.location) === null || _k === void 0 ? void 0 : _k.station_code) {
        end_received = true;
    }
    if ((_q = (_p = (_o = (_m = (_l = body.message) === null || _l === void 0 ? void 0 : _l.intent) === null || _m === void 0 ? void 0 : _m.fulfillment) === null || _o === void 0 ? void 0 : _o.start) === null || _p === void 0 ? void 0 : _p.location) === null || _q === void 0 ? void 0 : _q.gps) {
        start_received = true;
        start_gps_valid = validateGps((_v = (_u = (_t = (_s = (_r = body.message) === null || _r === void 0 ? void 0 : _r.intent) === null || _s === void 0 ? void 0 : _s.fulfillment) === null || _t === void 0 ? void 0 : _t.start) === null || _u === void 0 ? void 0 : _u.location) === null || _v === void 0 ? void 0 : _v.gps);
    }
    if ((_0 = (_z = (_y = (_x = (_w = body.message) === null || _w === void 0 ? void 0 : _w.intent) === null || _x === void 0 ? void 0 : _x.fulfillment) === null || _y === void 0 ? void 0 : _y.end) === null || _z === void 0 ? void 0 : _z.location) === null || _0 === void 0 ? void 0 : _0.gps) {
        end_received = true;
        end_gps_valid = validateGps((_5 = (_4 = (_3 = (_2 = (_1 = body.message) === null || _1 === void 0 ? void 0 : _1.intent) === null || _2 === void 0 ? void 0 : _2.fulfillment) === null || _3 === void 0 ? void 0 : _3.end) === null || _4 === void 0 ? void 0 : _4.location) === null || _5 === void 0 ? void 0 : _5.gps);
    }
    if (start_received && end_received && start_gps_valid && end_gps_valid) {
        return null;
    }
    else {
        return "Start and end locations not passed in expected format";
    }
};
const createOnSearch = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29;
    const body = req.body;
    var start_codes = [];
    var end_codes = [];
    if ((_e = (_d = (_c = (_b = (_a = body.message) === null || _a === void 0 ? void 0 : _a.intent) === null || _b === void 0 ? void 0 : _b.fulfillment) === null || _c === void 0 ? void 0 : _c.start) === null || _d === void 0 ? void 0 : _d.location) === null || _e === void 0 ? void 0 : _e.station_code) {
        start_codes.push(body.message.intent.fulfillment.start.location.station_code);
    }
    if ((_k = (_j = (_h = (_g = (_f = body.message) === null || _f === void 0 ? void 0 : _f.intent) === null || _g === void 0 ? void 0 : _g.fulfillment) === null || _h === void 0 ? void 0 : _h.end) === null || _j === void 0 ? void 0 : _j.location) === null || _k === void 0 ? void 0 : _k.station_code) {
        end_codes.push(body.message.intent.fulfillment.end.location.station_code);
    }
    const date = ((_q = (_p = (_o = (_m = (_l = body.message) === null || _l === void 0 ? void 0 : _l.intent) === null || _m === void 0 ? void 0 : _m.fulfillment) === null || _o === void 0 ? void 0 : _o.start) === null || _p === void 0 ? void 0 : _p.time) === null || _q === void 0 ? void 0 : _q.timestamp) ?
        (_v = (_u = (_t = (_s = (_r = body.message) === null || _r === void 0 ? void 0 : _r.intent) === null || _s === void 0 ? void 0 : _s.fulfillment) === null || _t === void 0 ? void 0 : _t.start) === null || _u === void 0 ? void 0 : _u.time) === null || _v === void 0 ? void 0 : _v.timestamp :
        new Date().toISOString();
    const callback_url = req.subscriber_type === 'bg' ? req.subscriber_url : body.context.bap_uri;
    if ((start_codes.length === 0 || end_codes.length === 0) && config.ENABLE_LOCATION_SERVICES) {
        var start_location = (_0 = (_z = (_y = (_x = (_w = body.message) === null || _w === void 0 ? void 0 : _w.intent) === null || _x === void 0 ? void 0 : _x.fulfillment) === null || _y === void 0 ? void 0 : _y.start) === null || _z === void 0 ? void 0 : _z.location) === null || _0 === void 0 ? void 0 : _0.gps;
        var end_location = (_5 = (_4 = (_3 = (_2 = (_1 = body.message) === null || _1 === void 0 ? void 0 : _1.intent) === null || _2 === void 0 ? void 0 : _2.fulfillment) === null || _3 === void 0 ? void 0 : _3.end) === null || _4 === void 0 ? void 0 : _4.location) === null || _5 === void 0 ? void 0 : _5.gps;
        if (config.USE_MAPS_API) {
            try {
                console.log((_7 = (_6 = req.body) === null || _6 === void 0 ? void 0 : _6.context) === null || _7 === void 0 ? void 0 : _7.transaction_id, "Received search parameter start location :", start_location);
                console.log((_9 = (_8 = req.body) === null || _8 === void 0 ? void 0 : _8.context) === null || _9 === void 0 ? void 0 : _9.transaction_id, "Received search parameter end location :", end_location);
                [start_codes, end_codes] = yield findClosestStopsMaps(start_location, end_location);
            }
            catch (e) {
                console.log((_11 = (_10 = req.body) === null || _10 === void 0 ? void 0 : _10.context) === null || _11 === void 0 ? void 0 : _11.transaction_id, "MAPS API call failed. Using fallback algorithm");
                start_codes = yield findClosestStops(start_location);
                end_codes = yield findClosestStops(end_location);
            }
        }
        else {
            if (start_codes.length === 0) {
                var start_location = body.message.intent.fulfillment.start.location.gps;
                console.log((_13 = (_12 = req.body) === null || _12 === void 0 ? void 0 : _12.context) === null || _13 === void 0 ? void 0 : _13.transaction_id, "Received search parameter start location :", start_location);
                start_codes = yield findClosestStops(start_location);
            }
            if (end_codes.length === 0) {
                var end_location = body.message.intent.fulfillment.end.location.gps;
                console.log((_15 = (_14 = req.body) === null || _14 === void 0 ? void 0 : _14.context) === null || _15 === void 0 ? void 0 : _15.transaction_id, "Received search parameter end location :", end_location);
                end_codes = yield findClosestStops(end_location);
            }
        }
    }
    console.log((_17 = (_16 = req.body) === null || _16 === void 0 ? void 0 : _16.context) === null || _17 === void 0 ? void 0 : _17.transaction_id, 'start stations');
    console.log(start_codes);
    console.log((_19 = (_18 = req.body) === null || _18 === void 0 ? void 0 : _18.context) === null || _19 === void 0 ? void 0 : _19.transaction_id, 'end stations');
    console.log(end_codes);
    if ((start_codes.length === 0 || end_codes.length === 0) && config.ENABLE_LOCATION_SERVICES) {
        console.log((_21 = (_20 = req.body) === null || _20 === void 0 ? void 0 : _20.context) === null || _21 === void 0 ? void 0 : _21.transaction_id, "No routes found");
        return;
    }
    var locations = [];
    var items = [];
    var fulfillments = [];
    if ((!config.ENABLE_LOCATION_SERVICES) && (start_codes.length === 0 || end_codes.length === 0)) {
        var all_stops = yield getAllStations();
        for (var stop of all_stops) {
            var location = yield createLocationObject(stop.stop_id);
            locations.push(location);
        }
        const item = {
            "id": "sjt",
            "descriptor": {
                "name": "Single Journey Ticket",
                "code": "SJT"
            },
            "matched": true
        };
        items.push(item);
    }
    for (var start_code of start_codes) {
        for (var end_code of end_codes) {
            if (start_code == end_code) {
                continue;
            }
            console.log((_23 = (_22 = req.body) === null || _22 === void 0 ? void 0 : _22.context) === null || _23 === void 0 ? void 0 : _23.transaction_id, "ROUTE:", start_code, "TO", end_code);
            const stop_times = yield get_stop_times(start_code, end_code, date);
            if (stop_times.length !== 0) {
                const fare = yield get_fares(start_code, end_code);
                if (!lodash_1.default.find(locations, ['id', start_code])) {
                    const this_locations = yield createLocationObject(start_code);
                    locations.push(this_locations);
                }
                if (!lodash_1.default.find(locations, ['id', end_code])) {
                    const this_locations = yield createLocationObject(end_code);
                    locations.push(this_locations);
                }
                const { item, fulfillment_array } = yield createItemsArray(start_code, end_code, fare, stop_times);
                //console.log(fulfillment_array);
                items.push(item);
                fulfillments = fulfillments.concat(fulfillment_array);
            }
        }
    }
    if (items.length !== 0) {
        let response = {};
        response.context = body.context;
        response.context.action = 'on_search';
        response.context.bpp_id = config.bpp_id;
        response.context.bpp_uri = config.bpp_uri;
        const agency = yield getAgencyDetails();
        response.message = {
            "catalog": {
                "bpp/descriptor": {
                    "name": "BPP"
                },
                "bpp/providers": [
                    {
                        "id": agency.agency_id,
                        "descriptor": {
                            "name": agency.agency_name
                        },
                        "locations": locations,
                        "items": items,
                        "fulfillments": fulfillments
                    }
                ]
            }
        };
        /* if (fulfillments.length !== 0) {
             response.message.catalog['bpp/providers']['fulfillments'] = fulfillments
         }*/
        const url = combineURLs(callback_url, '/on_search');
        const axios_config = yield createHeaderConfig(response);
        console.log(JSON.stringify(response.message.catalog['bpp/providers']));
        console.log(JSON.stringify(response.message.catalog['bpp/providers']['fulfillments']));
        console.log(JSON.stringify(response));
        console.log((_25 = (_24 = req.body) === null || _24 === void 0 ? void 0 : _24.context) === null || _25 === void 0 ? void 0 : _25.transaction_id, "Response body", JSON.stringify(response));
        console.log((_27 = (_26 = req.body) === null || _26 === void 0 ? void 0 : _26.context) === null || _27 === void 0 ? void 0 : _27.transaction_id, "Header", axios_config.headers);
        console.log((_29 = (_28 = req.body) === null || _28 === void 0 ? void 0 : _28.context) === null || _29 === void 0 ? void 0 : _29.transaction_id, "Sending response to ", url);
        try {
            axios.post(url, response, axios_config);
        }
        catch (e) {
            console.log(e);
        }
    }
});
const createHeaderConfig = (request) => __awaiter(void 0, void 0, void 0, function* () {
    const header = yield (0, auth_1.createAuthorizationHeader)(request);
    const axios_config = {
        headers: {
            Authorization: header
        }
    };
    return axios_config;
});
const createItemsArray = (from, to, fare, stop_times) => __awaiter(void 0, void 0, void 0, function* () {
    const item_code = `${from}_TO_${to}`;
    const from_details = yield getStationDetails(from);
    const to_details = yield getStationDetails(to);
    const item_name = `${from_details.stop_name} to ${to_details.stop_name}`;
    const price = fare.price;
    const currency_type = fare.currency_type;
    var from_schedule = [];
    var to_schedule = [];
    const fulfillment_array = [];
    for (var time of stop_times) {
        from_schedule.push(time.arrival_time);
        to_schedule.push(time.destination_time);
        const fulfillment = {
            "id": item_code,
            "start": {
                "location": {
                    "id": from
                },
                "time": {
                    "timestamp": time.arrival_time
                }
            },
            "end": {
                "location": {
                    "id": to
                },
                "time": {
                    "timestamp": time.destination_time
                }
            }
        };
        fulfillment_array.push(fulfillment);
    }
    const item = {
        "id": "sjt",
        "descriptor": {
            "name": "Single Journey Ticket",
            "code": "SJT"
        },
        "price": {
            "currency": currency_type,
            "value": price
        },
        "location_id": from,
        "fulfillment_id": item_code,
        "matched": true
    };
    return ({ item, fulfillment_array });
});
const createLocationObject = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const station_details = yield getStationDetails(code);
    const gps = `${station_details.stop_lat},${station_details.stop_lon}`;
    const name = station_details.stop_name;
    const location = {
        "id": code,
        "descriptor": {
            "name": name
        },
        "station_code": code,
        "gps": gps
    };
    return location;
});
const getStationDetails = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const stop = yield Stops_model_1.Stops.findOne({ where: { stop_id: code } });
    if (stop) {
        return stop;
    }
    else {
        throw ("Stop not found");
    }
});
const getAllStations = () => __awaiter(void 0, void 0, void 0, function* () {
    const stops = yield Stops_model_1.Stops.findAll();
    return stops;
});
const getAgencyDetails = () => __awaiter(void 0, void 0, void 0, function* () {
    var agency = yield index_1.sequelize.query(`SELECT * FROM 'Agencies'`, { type: sequelize_1.QueryTypes.SELECT });
    return agency[0];
});
const get_stop_times = (start_stop, end_stop, date) => __awaiter(void 0, void 0, void 0, function* () {
    const date_obj = new Date(date);
    const date_ist = new Date(date_obj.getTime() - ((-330) * 60 * 1000));
    var weekday = new Array(7);
    weekday[0] = "sunday";
    weekday[1] = "monday";
    weekday[2] = "tuesday";
    weekday[3] = "wednesday";
    weekday[4] = "thursday";
    weekday[5] = "friday";
    weekday[6] = "saturday";
    const day = date_obj.getDay();
    var times = yield index_1.sequelize.query(`SELECT DISTINCT ori.*, end.arrival_time as destination_time
                    FROM 'StopTimes' ori, 'StopTimes' end, 'Trips' trip, 'Calendars' cal
                    WHERE ori.trip_id = end.trip_id AND
                    ori.stop_sequence < end.stop_sequence AND
                    ori.trip_id = trip.trip_id AND
                    trip.service_id = cal.service_id AND
                    ('${date_ist.toISOString().substring(0, 10)}' BETWEEN cal.start_date AND cal.end_date) AND
                    ori.stop_id = '${start_stop}' AND end.stop_id = '${end_stop}' AND
                    cal.${weekday[day]} = 1 order by ori.arrival_time`, { type: sequelize_1.QueryTypes.SELECT });
    for (var time of times) {
        time.arrival_time = new Date(date_ist.toISOString().substring(0, 10) + 'T' + time.arrival_time + '.000+05:30').toISOString();
        time.departure_time = new Date(date_ist.toISOString().substring(0, 10) + 'T' + time.departure_time + '.000+05:30').toISOString();
        time.destination_time = new Date(date_ist.toISOString().substring(0, 10) + 'T' + time.destination_time + '.000+05:30').toISOString();
    }
    return times;
});
const get_fares = (start, end) => __awaiter(void 0, void 0, void 0, function* () {
    var fare = yield index_1.sequelize.query(`SELECT attr.*
                                        FROM 'FareRules' fare, 'FareAttributes' attr
                                        WHERE fare.fare_id = attr.fare_id AND
                                        fare.origin_id =  '${start}' AND 
                                        fare.destination_id = '${end}'`, { type: sequelize_1.QueryTypes.SELECT });
    if (fare.length === 0) {
        throw ('Fare rule not found');
    }
    return fare[0];
});
module.exports = { createOnSearch, validateInputs };
