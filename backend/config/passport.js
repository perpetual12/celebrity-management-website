import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import client from './database.js';

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return done(null, false);
    }

    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

export default passport;
