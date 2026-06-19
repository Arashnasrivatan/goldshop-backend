import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { UserService } from "../../modules/User/user.service";
import { BanService } from "../../modules/Ban/ban.service";
import { AppError } from "../errors/AppError";
import { IUserDocument } from "../../modules/User/user.model";

export const createLocalStrategy = (
  userService: UserService,
  banService: BanService,
): LocalStrategy => {
  return new LocalStrategy(
    { usernameField: "phone" },
    async (phone: string, password: string, done) => {
      try {
        const user: IUserDocument | null =
          await userService.findOneByPhone(phone);

        if (!user) {
          return done(null, false);
        }

        const isBanned = await banService.isPhoneBanned(user.phone);
        if (isBanned) {
          return done(
            new AppError("You are banned from accessing this service.", 403),
          );
        }
        if (!user.password) {
          return done(null, false);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false);
        }
          const cleanedUser = user.toObject();
          delete cleanedUser.password;
          delete cleanedUser.__v;
          
        return done(null, cleanedUser);
      } catch (err) {
        return done(err);
      }
    },
  );
};
