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
Object.defineProperty(exports, "__esModule", { value: true });
class queryBuilder {
    constructor(modelQuery, Query) {
        this.modelQuery = modelQuery;
        this.query = Query;
    }
    search(searchableFields) {
        const searchTerm = this.query.searchTerm;
        if (typeof searchTerm === 'string') {
            const keywords = searchTerm
                .trim()
                .split(/\s+/)
                .filter(Boolean);
            if (keywords.length > 0) {
                const andConditions = keywords.map((keyword) => ({
                    $or: searchableFields.map((field) => ({
                        [field]: { $regex: keyword, $options: "i" },
                    })),
                }));
                this.modelQuery = this.modelQuery.find({
                    $and: andConditions,
                });
            }
        }
        return this;
    }
    filter() {
        var _a;
        const copyQuery = Object.assign({}, this === null || this === void 0 ? void 0 : this.query);
        const excludeField = ["searchTerm", "sort", "limit", "page", "fields"];
        excludeField.forEach((el) => delete copyQuery[el]);
        this.modelQuery = (_a = this === null || this === void 0 ? void 0 : this.modelQuery) === null || _a === void 0 ? void 0 : _a.find(copyQuery);
        return this;
    }
    sort() {
        var _a, _b, _c;
        const sort = ((_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.sort) === null || _b === void 0 ? void 0 : _b.split(",")) === null || _c === void 0 ? void 0 : _c.join(" ")) || "-createdAt";
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }
    fields() {
        var _a, _b, _c;
        const fields = ((_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0 ? void 0 : _b.split(",")) === null || _c === void 0 ? void 0 : _c.join(" ")) || "-__v";
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }
    paginate(model) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const searchTerm = (_a = this.query) === null || _a === void 0 ? void 0 : _a.searchTerm;
            const sort = (_b = this.query) === null || _b === void 0 ? void 0 : _b.sort;
            const filterKeys = Object.keys(this.query || {}).filter((key) => !["searchTerm", "sort", "limit", "page", "fields"].includes(key));
            let totalData;
            if (!searchTerm && !sort && filterKeys.length === 0) {
                totalData = yield model.countDocuments();
                const page = Number((_c = this === null || this === void 0 ? void 0 : this.query) === null || _c === void 0 ? void 0 : _c.page) || 1;
                const limit = Number((_d = this === null || this === void 0 ? void 0 : this.query) === null || _d === void 0 ? void 0 : _d.limit) || 10;
                const skip = (page - 1) * limit;
                this.modelQuery = (_e = this === null || this === void 0 ? void 0 : this.modelQuery) === null || _e === void 0 ? void 0 : _e.skip(skip).limit(limit);
            }
            else {
                totalData = yield this.modelQuery.clone().countDocuments();
                const page = Number((_f = this === null || this === void 0 ? void 0 : this.query) === null || _f === void 0 ? void 0 : _f.page) || 1;
                const limit = Number((_g = this === null || this === void 0 ? void 0 : this.query) === null || _g === void 0 ? void 0 : _g.limit) || 10;
                const skip = (page - 1) * limit;
                this.modelQuery = (_h = this === null || this === void 0 ? void 0 : this.modelQuery) === null || _h === void 0 ? void 0 : _h.skip(skip).limit(limit);
            }
            return { totalData };
        });
    }
    calculatePagination({ totalData, currentPage, limit, }) {
        const totalPage = Math.ceil(totalData / limit) || 1;
        const prevPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
        const nextPage = currentPage + 1 <= totalPage ? currentPage + 1 : 1;
        return {
            totalPage,
            currentPage,
            prevPage,
            nextPage,
            totalData,
        };
    }
}
exports.default = queryBuilder;
