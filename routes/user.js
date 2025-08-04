require('dotenv').config();
const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { userModel } = require("../database");
const userRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Signup Route
userRouter.post('/signup', async function (req, res) {
  const userSchema = z.object({
    email: z.string().min(5).max(50).email(),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .max(16, "Password must be at most 16 characters")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[0-9]/, "Password must include at least one digit")
      .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
    firstName: z.string().min(2),
    lastName: z.string().min(2)
  });

  const parsedData = userSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Incorrect format",
      error: parsedData.error.issues.map(issue => issue.message),
    });
  }

  const { email, password, firstName, lastName } = parsedData.data;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    await newUser.save();
    res.status(201).json({ message: "Signed Up!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error signing up user" });
  }
});

// Signin Route
userRouter.post('/signin', async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "Incorrect Credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: "Incorrect Credentials" });
    }

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error signing in" });
  }
});

userRouter.get("/purchases", async function (req, res) {
  try{
    const userId = req.userId;
    const purchases = await purchaseModel.find({
      userId,
    });
    let purchasedCourseIds = [];
    for (let i = 0; i<purchases.length;i++){ 
      purchasedCourseIds.push(purchases[i].courseId)
    }
    const coursesData = await courseModel.find({
      _id: { $in: purchasedCourseIds }
    })
    res.json({
      purchases,
      coursesData
    })
  }
  catch(error){
    res.json({
      message : "Some error occured"
    })
  }
});

module.exports = {
  userRouter
};