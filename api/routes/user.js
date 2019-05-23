const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
const passport = require('passport');

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
  //if input is not complete
  if (!req.body.email || !req.body.password) {
      // 400 for client errors
      res.status(400).json({ message: 'Need both email and password 💩' });
      return;
  }
  
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      // if user exists
      if (user.length > 0) {
        return res.status(409).json({
          message: "User exists"
        });
      } 
      // user doesn't exist
      else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          //bcrypt error
          if (err) {
            return res.status(500).json({
              error: err
            });
          } 
          // create user
          else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              name: req.body.name
            });
            user
              .save()
              // create user success
              .then(result => {
                console.log(result);
                
                //Automatically logs in after sign up
                req.login(user, (err) => {
                  if (err) {
                    console.log(err);
                    res.status(500).json({ message: '500: server fail while automatically loggin in after sign up' });
                    return;
                  }
                  
                  user.password = undefined;
                  res.status(201).json({
                    message: "User created & Logged in!",
                    user : user
                  });
                })
                
              })
              // save fail
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post('/login', (req, res, next) => {
  const authenticateFunction = passport.authenticate('local',(err, user, message) => {
    // Errors prevented us from deciding if login was a success or failure
    if (err) {
      res.status(500).json({ message: 'Serverfail while authenticating' });
      return;
    }
    
    console.log(req.body);
    console.log(user);

    if(!user) {
      // "message" contains feedback messages from LocalStrategy
      res.status(401).json(message);
      return;
    }
    
    // Login successful, save them in the session.
    req.login(user, (error) => {
        if (error) {
          res.status(500).json({ message: 'Session save error 💩' });
          return;
        }

        // Clear the encryptedPassword before sending to client
        user.password = undefined;
        // Everything worked! Send the user's information to the client.
        res.status(200).json(user);
    });
  });
  
  authenticateFunction(req, res, next);
});

router.post('/logout', (req, res, next) => {
  // req.logout() is defined by passport
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});

// router.get('/api/checklogin', (req, res, next) => {
//     if (!req.user) {
//       res.status(401).json({ message: 'Nobody logged in.' });
//       return;
//     }
// 
//     // Clear the encryptedPassword before sending
//     // (not from the database, just from the object)
//     req.user.encryptedPassword = undefined;
//     res.status(200).json(req.user);
// });

// router.post("/login", (req, res, next) => {
//   User.find({ email: req.body.email })
//     .exec()
//     .then(user => {
//       if (user.length < 1) {
//         return res.status(401).json({
//           message: "Auth failed"
//         });
//       }
//       bcrypt.compare(req.body.password, user[0].password, (err, result) => {
//         if (err) {
//           return res.status(401).json({
//             message: "Auth failed"
//           });
//         }
//         if (result) {
//           const token = jwt.sign(
//             {
//               email: user[0].email,
//               userId: user[0]._id
//             },
//             process.env.JWT_KEY,
//             {
//                 expiresIn: "1h"
//             }
//           );
//           return res.status(200).json({
//             message: "Auth successful",
//             token: token
//           });
//         }
//         res.status(401).json({
//           message: "Auth failed"
//         });
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });

// router.delete("/:userId", (req, res, next) => {
//   User.remove({ _id: req.params.userId })
//     .exec()
//     .then(result => {
//       res.status(200).json({
//         message: "User deleted"
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });

module.exports = router;
