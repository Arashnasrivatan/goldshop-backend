
export class GetActiveShippingsDto {
  public name: string;
  

  constructor(data: {
    name: string;
  }) {
    this.name = data.name;
  }
}
