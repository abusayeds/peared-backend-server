"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = paginationBuilder;
function paginationBuilder({ totalData, currentPage, limit, }) {
    const totalPage = Math.ceil(totalData / limit) || 1;
    const prevPage = currentPage - 1 > 0 ? currentPage - 1 : null;
    const nextPage = currentPage + 1 <= totalPage ? currentPage + 1 : null;
    return {
        totalPage,
        currentPage,
        prevPage,
        nextPage,
        totalData,
    };
}
