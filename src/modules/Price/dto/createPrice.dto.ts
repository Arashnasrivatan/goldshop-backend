export class CreatePriceDto {
  public gold18k: number;
  public goldBuy: number;
  public goldExchange: number;
  public coinQuarter: number;
  public coinHalf: number;
  public coinFull: number;
  public coinEmami: number;

  constructor(data: {
    gold18k: number;
    goldBuy: number;
    goldExchange: number;
    coinQuarter: number;
    coinHalf: number;
    coinFull: number;
    coinEmami: number;
  }) {
    this.gold18k = data.gold18k;
    this.goldBuy = data.goldBuy;
    this.goldExchange = data.goldExchange;
    this.coinQuarter = data.coinQuarter;
    this.coinHalf = data.coinHalf;
    this.coinFull = data.coinFull;
    this.coinEmami = data.coinEmami;
  }
}
