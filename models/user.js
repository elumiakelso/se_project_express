const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  validate: {
    validator: function(v) {
      // If the value is empty or not provided, return true (valid)
      if (!v || v === '') {
        return true;
      }
      // Otherwise check the length
      return v.length >= 2 && v.length <= 30;
    },
    message: 'Name must be between 2 and 30 characters'
  }
  },
  avatar: {
    type: String,
  validate: {
    validator(value) {
      return !value || validator.isURL(value);  // Changed to handle undefined/null
    },
    message: "You must enter a valid URL"
  }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: "You must enter a valid email",
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error("Incorrect email or password"));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error("Incorrect email or password"));
        }
        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
