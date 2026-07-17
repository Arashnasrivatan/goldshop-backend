export class GetAllCategoriesDto {
  public search?: string;
  public catId?: string;
  public slug?: string;

  public parent?: string;
  public level?: string;

  public isActive?: string;

  public sort?: string;
  public limit?: number;
  public page?: number;

  constructor(data: {
    search?: string;
    catId?: string;
    slug?: string;
    parent?: string;
    level?: string;
    isActive?: string;
    sort?: string;
    limit?: number;
    page?: number;
  }) {
    this.search = data.search;
    this.catId = data.catId;
    this.slug = data.slug;
    this.parent = data.parent;
    this.level = data.level;
    this.sort = data.sort;

    this.isActive = data.isActive;

    this.limit = data.limit;
    this.page = data.page;
  }
}
