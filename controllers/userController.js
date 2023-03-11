const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const mongoose = require('mongoose');

// generate token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, { expiresIn: '7d' });
}

// register user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exist = await userModel.findOne({ email });

    if (exist) {
      return res.status(400).json("Email already exists");
    }

    if (!name || !email || !password) {
      return res.status(400).json("All fields are required!")
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json("Invalid Email")
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json("Password must contain uppercase, lowercase, number & symbol!")
    }

    // generate salt
    const salt = await bcrypt.genSalt(10);

    // hash password
    const hash = await bcrypt.hash(password, salt);

    // create an user
    const user = await userModel.create({ name, email, password: hash });

    // create token
    const token = createToken(user._id);

    res.status(200).json({ id: user._id, name, email, password: hash, token });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json("Incorrect email or password");
    }

    // check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json("Password does not match!");
    }

    const token = createToken(user._id);

    res.status(200).json({ id: user._id, name: user.name, email, password: user.password, token });
  } catch (err) {
    res.status(500).json(err);
  }
}

// find an user
const findUser = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json("Invalid id");
    }

    // const user = await userModel.findOne({_id:userId});
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json("Can't find any user using this id!");
    }
    res.status(200).json(user);

  } catch (err) {
    res.status(500).json(err);
  }
}

// get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    if (!users) {
      return res.status(400).json("No users found!");
    }
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
}

module.exports = {
  registerUser,
  loginUser,
  findUser,
  getAllUsers
}