import { CategoryImage } from "../category.types";

export class CreateCategoryDto {
  public name: string;
  public slug: string;
  public description?: string;
  public parent?: string;
  public image?: CategoryImage | null;
  public path?: string[];
  public level?: number;
  public order?: number;
  public isActive?: boolean;

  constructor(data: {
    name: string;
    slug: string;
    description?: string;
    parent?: string;
    level?: number;
    image?: CategoryImage | null;
    path?: string[];
    order?: number;
    isActive?: boolean;
  }) {
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.parent = data.parent;
    this.level = data.level;
    this.image = data.image;
    this.path = data.path;
    this.order = data.order;
    this.isActive = data.isActive;
  }
}
