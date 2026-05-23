const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            firstName: profile.name.givenName || "User",
            lastName: profile.name.familyName || "GoogleUser",
            email,

            password: Math.random().toString(36) + "@Aa12345",

            oauthProvider: "google",
            oauthId: profile.id,

            avatar: {
              url: profile.photos[0]?.value || "",
            },

            isEmailVerified: true,
          });
        }

        return done(null, user);

      } catch (err) {
        console.log(err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;