import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError";
import { ProductRepository } from "../Product/product.repository";
import { UserRepository } from "../User/user.repository";
import { CartRepository } from "./cart.repository";
import { AddItemDto } from "./dto/addItem.dto";

export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async addItemToCart(input: AddItemDto) {
    const { productId, userId } = input;
    const product = await this.productRepository.findById(productId);

    if (!product) throw new AppError("Product not found", 404);

    if (!product.isActive || product.isDeleted)
      throw new AppError("This product is currently unavailable", 400);

    if (!product.inStock)
      throw new AppError("This product is out of stock", 400);

    let cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      cart = await this.cartRepository.create({
        userId: new Types.ObjectId(userId),
      });
    }

    const updatedCart = await this.cartRepository.addItemIfNotExists(
      userId,
      productId,
    );

    if (!updatedCart) {
      throw new AppError("Product already exists in your cart", 409);
    }

    return { message: "Product Added Successfully", data: updatedCart };
  }

  async getCart(userId: string) {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      return {
        message: "Cart retrieved successfully",
        data: {
          userId,
          items: [],
        },
      };
    }

    return {
      message: "Cart retrieved successfully",
      data: cart,
    };
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepository.clearCart(userId);

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    return {
      message: "Cart cleared successfully",
      data: cart,
    };
  }
}
