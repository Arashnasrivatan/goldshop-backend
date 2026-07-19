export class GetCategoryBySlugDto {
  public slug: string;

  constructor(data: { slug: string }) {
    this.slug = data.slug;
  }
}
