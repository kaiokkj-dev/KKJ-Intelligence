const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../database/db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.trim().toLowerCase();
        const name = profile.displayName;

        if (!email) {
          return done(new Error("Email do Google não encontrado"));
        }
        const { data: existingUser, error: findError } = await db
          .from("users")
          .select("*")
          .eq("email", email)
          .maybeSingle();
        if (findError) {
          return done(findError);
        }
        if (existingUser) {
          return done(null, existingUser);
        }
        const { data: newUser, error: insertError } = await db
          .from("users")
          .insert([
            {
              name,
              email,
              password: null,
            },
          ])
          .select()
          .single();
        if (insertError) {
          return done(insertError);
        }
        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
