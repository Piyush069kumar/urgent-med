import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import createError from "http-errors";
import * as userService from "../../api/user/user.service";
import { type Request } from "express";
import { IAuthUser } from "../../api/user/user.dto";

const isValidPassword = async (plain: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(plain, hash);
};

export const initPassport = (): void => {
  // 1. Passport JWT Strategy (if used directly)
  passport.use(
    new Strategy(
      {
        secretOrKey: process.env.JWT_SECRET ?? "",
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token: { user: Request["user"] }, done) => {
        try {
          done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  // 2. Local Strategy (Email & Password Login)
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Query user by email (joins credential + hospital)
          const dbUser = await userService.getActiveUserByEmail(email);

          if (!dbUser) {
            return done(createError(401, "Invalid email or password"), false);
          }

          // Check if credential has password_hash
          if (!dbUser.password_hash) {
            return done(createError(500, "Password hash missing from database"), false);
          }

          // Verify password with bcrypt
          const isMatch = await isValidPassword(password, dbUser.password_hash);
          if (!isMatch) {
            return done(createError(401, "Invalid email or password"), false);
          }

          // Construct the IAuthUser payload for JWT (excluding password_hash!)
          const authUser: IAuthUser = {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role,
            hospital_id: dbUser.hospital_id,
            hospital_name: dbUser.hospital_name,
            hospital_status: dbUser.hospital_status,
          };

          return done(null, authUser, { message: "Logged in successfully" });
        } catch (error: any) {
          return done(createError(500, error.message));
        }
      }
    )
  );
};

// 3. Issue JWT Token
export const createUserTokens = (user: IAuthUser) => {
  const jwtSecret = process.env.JWT_SECRET ?? "";
  const token = jwt.sign(user, jwtSecret, { expiresIn: "7d" });
  return { accessToken: token };
};

// 4. Decode JWT Token helper
export const decodeToken = (token: string): IAuthUser => {
  return jwt.decode(token) as IAuthUser;
};
