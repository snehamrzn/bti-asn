const mongoose = require("mongoose");
require("dotenv").config();

const bcrypt = require("bcryptjs");

let Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
  country: String,
});

let User;

function Initialize() {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(process.env.MONGODB);
    db.on("error", (err) => {
      console.error("MongoDB connection error:", err);

      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      console.log("MongoDB connection established");
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

function registerUser(userData) {
  return new Promise(async (resolve, reject) => {
    if (userData.password != userData.password2) {
      reject("Passwords do not match");
    }
    try {
      const hash = await bcrypt.hash(userData.password, 10);
      userData.password = hash;
    } catch (err) {
      reject("There was an error encrypting the password");
    }
    try {
      let newUser = new User(userData);
      await newUser.save();
      resolve();
    } catch (err) {
      if (err.code == 11000) {
        reject("User Name already taken");
      } else {
        reject(`There was an error creating the user: ${err}`);
      }
    }
  });
}

function checkUser(userData) {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await User.find({ userName: userData.userName });
      if (users.length === 0) {
        reject(`Unable to find user: ${userData.userName}`);
      }

      const Match = await bcrypt.compare(userData.password, users[0].password);
      if (!Match) {
        reject(`Incorrect Password for user: ${userData.userName}`);
      }

      if (users[0].loginHistory.length == 8) {
        users[0].loginHistory.pop;
      }

      users[0].loginHistory.unshift({
        dateTime: new Date().toString(),
        userAgent: userData.userAgent,
      });

      try {
        const updateResult = await User.updateOne(
          { userName: users[0].userName },
          { $set: { loginHistory: users[0].loginHistory } }
        );
      } catch (err) {
        reject(`There was an error verifying the user: ${err} `);
      }
      resolve(users[0]);
    } catch (err) {
      reject(`Unable to find user: ${userData.userName}`);
    }
  });
}
module.exports = { Initialize, registerUser, checkUser };
