import { ProductRepository } from "./product.repository";
import { IProductDocument } from "./product.model";

import { AppError } from "../../common/errors/AppError";
import configs from "../../configs/env.config";
import ImageProcessor from "../../common/services/image.processor";
import { createPaginationData } from "../../common/utils";
import { IPaginationData } from "../../common/types/utils";

import S3StorageService, {
  type UploadedFile,
} from "../../common/services/S3StorageService";

export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly storageService: S3StorageService,
  ) {
        
  }
}
