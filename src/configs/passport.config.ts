import passport from "passport";
import { createLocalStrategy } from "../common/strategies/local.strategy";
import { UserRepository } from "../modules/User/user.repository";
import { UserService } from "../modules/User/user.service";
import { BanRepository } from "../modules/Ban/ban.repository";
import { BanService } from "../modules/Ban/ban.service";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

const banRepository = new BanRepository();
const banService = new BanService(banRepository, userService);

const localStrategy = createLocalStrategy(userService, banService);

passport.use("local", localStrategy);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userService.findOneById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
