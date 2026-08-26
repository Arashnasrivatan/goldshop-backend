export class GetAllShippingsDto {
  public search: string;
  public isActive: string;

  constructor(data: { search: string; isActive: string }) {
    this.search = data.search;
    this.isActive = data.isActive;
  }
}
