import { FilterQuery, Query } from "mongoose";
class queryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;
  constructor(modelQuery: Query<T[], T>, Query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = Query;
  }
  search(searchableFields: Array<keyof T>): this {
    const searchTerm = this.query.searchTerm;
    if (typeof searchTerm === 'string') {
      const keywords: string[] = searchTerm
        .trim()
        .split(/\s+/) 
        .filter(Boolean); 
      if (keywords.length > 0) {
        const andConditions = keywords.map((keyword: string) => ({
          $or: searchableFields.map((field: keyof T) => ({
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
    const copyQuery = { ...this?.query };
    const excludeField = ["searchTerm", "sort", "limit", "page", "fields"];
    excludeField.forEach((el) => delete copyQuery[el]);
    this.modelQuery = this?.modelQuery?.find(copyQuery as FilterQuery<T>);
    return this;
  }

  sort() {
    const sort =
      (this?.query?.sort as string)?.split(",")?.join(" ") || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort as string);
    return this;
  }
  fields() {
    const fields =
      (this?.query?.fields as string)?.split(",")?.join(" ") || "-__v";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  async paginate(model: any): Promise<{ totalData: number }> {
    const searchTerm = this.query?.searchTerm;
    const sort = this.query?.sort;
    const filterKeys = Object.keys(this.query || {}).filter(
      (key) => !["searchTerm", "sort", "limit", "page", "fields"].includes(key)
    );
    let totalData;
    if (!searchTerm && !sort && filterKeys.length === 0) {
      totalData = await model.countDocuments();
      const page = Number(this?.query?.page) || 1;
      const limit = Number(this?.query?.limit) || 10;
      const skip = (page - 1) * limit;
      this.modelQuery = this?.modelQuery?.skip(skip).limit(limit);
    } else {
      totalData = await this.modelQuery.clone().countDocuments();
      const page = Number(this?.query?.page) || 1;
      const limit = Number(this?.query?.limit) || 10;
      const skip = (page - 1) * limit;
      this.modelQuery = this?.modelQuery?.skip(skip).limit(limit);
    }
    return { totalData };
  }
  calculatePagination({
    totalData,
    currentPage,
    limit,
  }: {
    totalData: number;
    currentPage: number ;
    limit: number;
  }): {
    totalPage: number;
    currentPage: number;
    prevPage: number 
    nextPage: number 
    totalData: number;
  } {
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

export default queryBuilder;