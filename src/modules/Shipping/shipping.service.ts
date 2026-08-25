import S3StorageService from "../../common/services/S3StorageService";
import { ShippingRepository } from "./shipping.repository";

export class ShippingService {
  constructor(
    private readonly shippingRepository: ShippingRepository,
    private readonly storageService: S3StorageService,
  ) {}
}
