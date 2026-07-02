import { IUserDocument, UserRole } from "./user.model";
import { createPaginationData, isLocationInIran } from "../../common/utils";

import { AppError } from "../../common/errors/AppError";
import bcrypt from "bcrypt";
import { AdminAddUserAddressDto } from "./dto/adminAddAddress.dto";
import { AdminDeleteUserAddressDto } from "./dto/adminDeleteAddress.dto";
import { AdminUpdateUserAddressDto } from "./dto/adminUpdateAddress.dto";
import { AdminUserDeleteDto } from "./dto/adminUserDelete.dto";
import { AdminUserUpdateDto } from "./dto/adminUserUpdate.dto";
import { CreateUserDto } from "./dto/createUser.dto";
import { GetAllUsersDto } from "./dto/getAllUsers.dto";
import { IPaginationData } from "../../common/types/utils";
import { UserIdDto } from "../../common/dto/userId.dto";
import { UserRepository } from "./user.repository";
import { UpdateMeDto } from "./dto/updateMe.dto";
import { DeleteMeDto } from "./dto/deleteMe.dto";
import { ChangePasswordDto } from "./dto/changePassword.dto";
import { RedisService } from "../../common/services/redis.service";
import { AddAddressDto } from "./dto/addAddress.dto";
import { UpdateAddressDto } from "./dto/updateAddress.dto";

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private redisService: RedisService,
  ) {}

  //* ========== Common User Methods ========== *\\

  async isUserExistsByPhone(phone: string) {
    const user = await this.userRepository.findByPhone(phone);
    return !!user;
  }
  async isUserExistsById(userId: string) {
    const user = await this.userRepository.findById(userId);
    return !!user;
  }
  async findOneByPhone(phone: string) {
    return await this.userRepository.findByPhone(phone);
  }
  async findOneById(userId: string) {
    return await this.userRepository.findById(userId);
  }
  async createUser(input: CreateUserDto) {
    const newUser = await this.userRepository.create(input);

    return newUser;
  }
  async changeUserPassword(userId: string, newPassword: string) {
    await this.userRepository.updatePasswordById(userId, newPassword);
  }
  async markUserAsBanned(userId: string) {
    await this.userRepository.updateUserById(userId, { isBanned: true });
  }
  async markUserAsUnbanned(userId: string) {
    await this.userRepository.updateUserById(userId, { isBanned: false });
  }

  //* ========== Admin User Management ========== *\\

  async getAllUsers(input: GetAllUsersDto) {
    const { data: users, meta } = await this.userRepository.findAll(
      {
        search: input.search,
        userId: input.userId,
        phone: input.phone,
        from: input.from,
        to: input.to,
        role: input.role,
        includeBanned: input.includeBanned,
      },
      input.limit!,
      input.page!,
      input.sort!,
    );

    const paginationData: IPaginationData = createPaginationData(
      meta.page,
      meta.limit,
      meta.total,
      "Users",
    );

    return {
      message: "Users fetched Successfully :)",
      data: {
        paginationData,
        users,
      },
    };
  }
  async getOneUser(input: UserIdDto) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User Not Found :(", 404);

    const safeUser = user.toObject();

    delete safeUser.password;
    delete safeUser.__v;

    return {
      message: "user fetched successfully :)",
      data: safeUser,
    };
  }
  async adminUserUpdate(
    input: AdminUserUpdateDto,
  ): Promise<{ message: string; data: IUserDocument }> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User Not Found", 404);

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new AppError("Cannot modify a SUPER_ADMIN", 403);
    }

    if (user.role === UserRole.ADMIN && input.adminRole === UserRole.ADMIN) {
      throw new AppError("Admins cannot modify other admins", 403);
    }

    if (input.fullname === user.fullname) {
      throw new AppError("No changes to update", 400);
    }

    const updatedUser = await this.userRepository.updateUserById(input.userId, {
      fullname: input.fullname,
    });

    if (!updatedUser)
      throw new AppError("Update failed :( Please try again later", 500);

    return { message: "User updated successfully", data: updatedUser };
  }
  async adminDeleteUser(input: AdminUserDeleteDto) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User Not Found", 404);

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new AppError("Cannot delete a SUPER_ADMIN", 403);
    }

    if (user.role === UserRole.ADMIN && input.adminRole === UserRole.ADMIN) {
      throw new AppError("Admins cannot delete other admins", 403);
    }

    //* Double Check
    const expectedPhrase = `DELETE USER ${input.userId}`;
    if (input.confirmationPhrase !== expectedPhrase) {
      throw new AppError(
        `Invalid confirmation phrase. Expected: ${expectedPhrase}`,
        400,
      );
    }

    await Promise.all([
      this.userRepository.deleteUserById(input.userId),
      this.userRepository.deleteUserRelatedData(input.userId),
    ]);

    return { message: "User deleted successfully" };
  }

  //* ========== Admin Address Management ========== *\\

  async adminAddUserAddress(input: AdminAddUserAddressDto) {
    const lat = Number(input.location.lat);
    const lng = Number(input.location.lng);
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User Not Found :(", 404);

    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      throw new AppError("You cant add address to admins", 400);
    }

    // Double Check
    const isAddressInIran = isLocationInIran(lat, lng);
    if (!isAddressInIran)
      throw new AppError("Location must be in iran !!!", 400);

    const isDuplicate = user.addresses.some(
      (addr) =>
        addr.title === input.title || addr.postalCode === input.postalCode,
    );
    if (isDuplicate) {
      throw new AppError(
        "This address title or postal code already exists",
        400,
      );
    }

    const data = await this.userRepository.createAddress(input);

    return { message: "Address Added Successfully :)", data };
  }
  async adminUpdateUserAddress(input: AdminUpdateUserAddressDto) {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new AppError("User not found :(", 404);
    }

    const address = user.addresses.find(
      (address) => address._id == input.addressId,
    );

    if (!address)
      throw new AppError("Address not found or its not for this user :(", 400);

    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      throw new AppError("You cant update admin address", 400);
    }

    if (input.title) {
      const isDuplicateTitle = user.addresses.some(
        (addr) => addr._id != input.addressId && addr.title === input.title,
      );
      if (isDuplicateTitle) {
        throw new AppError("An address with this title already exists", 400);
      }
    }

    if (input.postalCode) {
      const isDuplicatePostalCode = user.addresses.some(
        (addr) =>
          addr._id != input.addressId && addr.postalCode === input.postalCode,
      );
      if (isDuplicatePostalCode) {
        throw new AppError(
          "An address with this postal code already exists",
          400,
        );
      }
    }

    const inputLat =
      input.location?.lat !== undefined
        ? Number(input.location.lat)
        : undefined;

    const inputLng =
      input.location?.lng !== undefined
        ? Number(input.location.lng)
        : undefined;

    const locationChanged =
      input.location !== undefined &&
      ((inputLat !== undefined && inputLat !== address.location.lat) ||
        (inputLng !== undefined && inputLng !== address.location.lng));

    const hasChanges =
      (input.title !== undefined && input.title !== address.title) ||
      (input.postalCode !== undefined &&
        input.postalCode !== address.postalCode) ||
      (input.address !== undefined && input.address !== address.address) ||
      locationChanged;

    if (!hasChanges) {
      throw new AppError("No changes to update", 400);
    }

    const updatedUser = await this.userRepository.updateAddress(input);

    if (!updatedUser) {
      throw new AppError("Address not found for this user", 404);
    }

    return {
      message: "Address updated successfully :)",
      data: updatedUser,
    };
  }
  async adminDeleteUserAddress(input: AdminDeleteUserAddressDto) {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new AppError("User not found :(", 404);

    const address = user.addresses.find(
      (address) => address._id == input.addressId,
    );

    if (!address)
      throw new AppError("Address not found or its not for this user :(", 400);

    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      throw new AppError("You cant delete admin address", 400);
    }

    //* Double Check
    const expectedPhrase = `DELETE ADDRESS ${input.addressId}`;
    if (input.confirmationPhrase !== expectedPhrase) {
      throw new AppError(
        `Invalid confirmation phrase. Expected: ${expectedPhrase}`,
        400,
      );
    }

    const deletedAddress = await this.userRepository.deleteAddress(input);

    if (deletedAddress && deletedAddress?.modifiedCount == 0)
      throw new AppError(
        "Cannot delete address please try again later :(",
        500,
      );
    return {
      message: "Address Deleted Successfully :)",
    };
  }

  //* ========== Admin User Management ========== *\\

  async promoteUser(input: UserIdDto) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User not found :(", 404);

    if (user.role == UserRole.ADMIN || user.role == UserRole.SUPER_ADMIN) {
      throw new AppError(
        "The user already holds the highest access level (ADMIN) and cannot be promoted further",
        400,
      );
    }

    const updatedUser = await this.userRepository.updateUserById(input.userId, {
      role: UserRole.ADMIN,
    });

    if (!updatedUser)
      throw new AppError("Cannot promote user please try again later :(", 500);

    return { message: "User Promoted Successfully :)", data: updatedUser };
  }
  async demoteUser(input: UserIdDto) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User not found :(", 404);

    if (user.role == UserRole.USER) {
      throw new AppError(
        "The user already holds the lowest access level (USER) and cannot be demoted",
        400,
      );
    }

    if (user.role == UserRole.SUPER_ADMIN) {
      throw new AppError("SuperAdmin cannot get demoted", 400);
    }

    const updatedUser = await this.userRepository.updateUserById(input.userId, {
      role: UserRole.USER,
    });

    if (!updatedUser)
      throw new AppError("Cannot demote user please try again later :(", 500);

    return { message: "User Demoted Successfully :)", data: updatedUser };
  }

  //* ========== User Management ========== *\\

  async updateMe(input: UpdateMeDto) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User not found :(", 404);

    if (user.fullname === input.fullname) {
      throw new AppError("No changes detected in the provided data", 400);
    }

    const updatedUser = await this.userRepository.updateUserById(input.userId, {
      fullname: input.fullname,
    });

    if (!updatedUser)
      throw new AppError("Cannot update user please try again later :(", 500);

    return { message: "User Updated Successfully :)", data: updatedUser };
  }
  async deleteMe(input: DeleteMeDto) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User not found :(", 404);

    //* Double Check
    const expectedPhrase = `DELETE MY ACCOUNT ${user.phone}`;
    if (input.confirmationPhrase !== expectedPhrase) {
      throw new AppError(
        `Invalid confirmation phrase. Expected: ${expectedPhrase}`,
        400,
      );
    }

    await Promise.all([
      this.userRepository.deleteUserById(input.userId),
      this.userRepository.deleteUserRelatedData(input.userId),
    ]);

    return { message: "Account Deleted Successfully :(" };
  }
  async changePassword(input: ChangePasswordDto) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User not found :(", 404);

    //* Double Check
    if (input.newPassword !== input.confirmNewPassword)
      throw new AppError(
        "New password and confirm new password do not match",
        400,
      );

    const isCurrentPasswordValid = await bcrypt.compare(
      input.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);

    await Promise.all([
      this.userRepository.updatePasswordById(input.userId, hashedPassword),
      this.redisService.del(`refreshToken:${input.userId}`),
    ]);

    return { message: "Password Changed Successfully :)" };
  }

  //* ========== User Address Management ========== *\\

  async AddMyAddress(input: AddAddressDto) {
    const lat = Number(input.location.lat);
    const lng = Number(input.location.lng);
    const user = await this.userRepository.findById(input.userId);

    if (!user) throw new AppError("User not found :(", 404);

    // Double Check
    const isAddressInIran = isLocationInIran(lat, lng);
    if (!isAddressInIran)
      throw new AppError("Location must be in iran !!!", 400);

    const isDuplicate = user.addresses.some(
      (addr) =>
        addr.title === input.title || addr.postalCode === input.postalCode,
    );
    if (isDuplicate) {
      throw new AppError(
        "This address title or postal code already exists",
        400,
      );
    }

    const data = await this.userRepository.createAddress(input);

    return { message: "Address Added Successfully :)", data };
  }
  async updateMyAddress(input: UpdateAddressDto) {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new AppError("User not found :(", 404);

    const address = user.addresses.find(
      (address) => address._id == input.addressId,
    );
    if (!address)
      throw new AppError("Address not found or its not for this user :(", 400);

    if (input.title) {
      const isDuplicateTitle = user.addresses.some(
        (addr) => addr._id != input.addressId && addr.title === input.title,
      );
      if (isDuplicateTitle) {
        throw new AppError("An address with this title already exists", 400);
      }
    }

    if (input.postalCode) {
      const isDuplicatePostalCode = user.addresses.some(
        (addr) =>
          addr._id != input.addressId && addr.postalCode === input.postalCode,
      );
      if (isDuplicatePostalCode) {
        throw new AppError(
          "An address with this postal code already exists",
          400,
        );
      }
    }

    const inputLat =
      input.location?.lat !== undefined
        ? Number(input.location.lat)
        : undefined;

    const inputLng =
      input.location?.lng !== undefined
        ? Number(input.location.lng)
        : undefined;

    const locationChanged =
      input.location !== undefined &&
      ((inputLat !== undefined && inputLat !== address.location.lat) ||
        (inputLng !== undefined && inputLng !== address.location.lng));

    const hasChanges =
      (input.title !== undefined && input.title !== address.title) ||
      (input.postalCode !== undefined &&
        input.postalCode !== address.postalCode) ||
      (input.address !== undefined && input.address !== address.address) ||
      locationChanged;

    if (!hasChanges) {
      throw new AppError("No changes to update", 400);
    }

    const updatedUser = await this.userRepository.updateAddress(input);

    if (!updatedUser) {
      throw new AppError("Address not found for this user", 404);
    }

    return {
      message: "Address updated successfully :)",
      data: updatedUser,
    };
  }
}
