const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./api/models/user');

// Save the user's ID in the bowl (called when user logs in)
passport.serializeUser((userFromDb, next) => {
    // console.log(userFromDb._id);
    next(null, userFromDb._id);
});

// Retrieve the user's info from the DB with the ID we got from the bowl
passport.deserializeUser((idFromBowl, next) => {
    // console.log(idFromBowl);
    User.findById(
      idFromBowl,
      (err, userFromDb) => {
          if (err) {
            next(err);
            return;
          }
          next(null, userFromDb);
      }
    );
});

// email & password login strategy
passport.use(new LocalStrategy(
  {
    usernameField : 'email',
    passwordField : 'password'
  },
  (email, password, next) => {
    
    User.findOne(
      { email: email},
      (err,userFromDb) => {
        if(err) {
          next(err);
          return;
        }
        
        if(userFromDb === null) {
          next(null, false, { message: 'This name does not exist' });
          return;
        }
        
        if(bcrypt.compare(password, userFromDb.password) === false){
          next(null, false, { message: 'Incorrect password' });
          return;
        }
        
        next(null, userFromDb);
      }
    );
    
  }
));