//how to create a schema

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  photo: {
    type: [""]
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },
  phonenumber: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

//model of the database
module.exports = mongoose.model("profile", ProfileSchema);
