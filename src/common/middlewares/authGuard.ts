import passport from "passport";

const authGuard = passport.authenticate("accessToken", { session: false });

export default authGuard;
