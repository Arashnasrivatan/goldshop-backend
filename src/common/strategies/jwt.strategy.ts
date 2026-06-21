import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UserService } from "../../modules/User/user.service";
import { BanService } from "../../modules/Ban/ban.service";
import { AppError } from "../errors/AppError";
import { IUserDocument } from "../../modules/User/user.model";
import configs from "../../configs/env.config";

interface JwtPayload {
  id: string;
}

export const createJwtStrategy = (
  userService: UserService,
  banService: BanService,
) => {
  return new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configs.auth.accessToken.secret,
    },
    async (payload: JwtPayload, done) => {
      try {
        const user: IUserDocument | null = await userService.findOneById(
          payload.id,
        );

        if (!user) {
          return done(new AppError("Please Try to login again", 404), false);
        }

        const isBanned = await banService.isPhoneBanned(user.phone);
        if (isBanned) {
          return done(
            new AppError("You are banned from accessing this service.", 403),
            false,
          );
        }

        const cleanedUser = user.toObject();
        delete cleanedUser.password;
        delete cleanedUser.__v;

        return done(null, cleanedUser);
      } catch (err) {
        return done(err, false);
      }
    },
  );
};
