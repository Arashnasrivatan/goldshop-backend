import { PriceRepository } from "./price.repository";

export class PriceService {
  constructor(private readonly priceRepository: PriceRepository) {}
}
