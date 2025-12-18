"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.Currency = exports.Language = exports.ServiceType = exports.InvoiceLineType = exports.InvoiceStatus = exports.RentType = exports.UnitStatus = exports.UsageType = exports.FurnishingStatus = void 0;
var FurnishingStatus;
(function (FurnishingStatus) {
    FurnishingStatus["FURNISHED"] = "furnished";
    FurnishingStatus["UNFURNISHED"] = "unfurnished";
})(FurnishingStatus || (exports.FurnishingStatus = FurnishingStatus = {}));
var UsageType;
(function (UsageType) {
    UsageType["APARTMENT"] = "apartment";
    UsageType["HOTEL"] = "hotel";
})(UsageType || (exports.UsageType = UsageType = {}));
var UnitStatus;
(function (UnitStatus) {
    UnitStatus["AVAILABLE"] = "available";
    UnitStatus["OCCUPIED"] = "occupied";
})(UnitStatus || (exports.UnitStatus = UnitStatus = {}));
var RentType;
(function (RentType) {
    RentType["MONTHLY"] = "monthly";
    RentType["DAILY"] = "daily";
})(RentType || (exports.RentType = RentType = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["POSTED"] = "posted";
    InvoiceStatus["PAID"] = "paid";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var InvoiceLineType;
(function (InvoiceLineType) {
    InvoiceLineType["RENT"] = "rent";
    InvoiceLineType["SERVICE"] = "service";
    InvoiceLineType["METER"] = "meter";
})(InvoiceLineType || (exports.InvoiceLineType = InvoiceLineType = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["METERED"] = "metered";
    ServiceType["FIXED"] = "fixed";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
var Language;
(function (Language) {
    Language["AR"] = "ar";
    Language["EN"] = "en";
})(Language || (exports.Language = Language = {}));
var Currency;
(function (Currency) {
    Currency["SAR"] = "SAR";
    Currency["YER"] = "YER";
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
})(Currency || (exports.Currency = Currency = {}));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
//# sourceMappingURL=index.js.map