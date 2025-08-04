require('dotenv').config();
const {Router} = require("express");
const adminRouter = Router();
const {adminModel , courseModel} = require("../database")
const bcrypt = require("bcrypt");
const {z} = require("zod");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_ADMIN_SECRET;
const { adminMiddleware } = require("../middleware/adminMiddleware");

//Signup Route for admin
adminRouter.post('/signup', async function(req, res) {
    const adminSchema = z.object({
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
  const parsedData = adminSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Incorrect format",
      error: parsedData.error.issues.map(issue => issue.message),
    });
  }
  const { email, password, firstName, lastName } = parsedData.data;
  try {
      const existingAdmin = await adminModel.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new adminModel({
        email,
        password: hashedPassword,
        firstName,
        lastName
      });
      await newAdmin.save();
      res.status(201).json({ message: "Signed Up!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error signing up user" });
    }
});

//signin route for admin
adminRouter.post('/signin',async function(req,res){
    const { email, password } = req.body;
      try {
        const admin = await adminModel.findOne({ email });
        if (!admin) {
          return res.status(403).json({ message: "Incorrect Credentials" });
        }
    
        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
          return res.status(403).json({ message: "Incorrect Credentials" });
        }
    
        const token = jwt.sign({ id: admin._id.toString() }, JWT_SECRET);
        res.status(200).json({ token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error signing in" });
      }
})

//Admin will add a course
adminRouter.post('/addcourse',adminMiddleware, async function(req,res){
    try {
        const adminId = req.userId;
        const { title, description, imageUrl, price } = req.body;
        const course = await courseModel.create({
            title,
            description,
            imageUrl,
            price,
            creatorId: adminId
        });
        res.json({
            message: "Course created",
            courseId: course._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating course" });
    }
});

//Here admin will update the course
adminRouter.post('/updatecourse',adminMiddleware,async function(req,res){
    try{
        const adminId = req.userId;
        const { title, description, imageUrl, price, courseId } = req.body;
        const course = await courseModel.updateOne({
            _id: courseId, 
            creatorId: adminId 
        }, {
            title: title, 
            description: description, 
            imageUrl: imageUrl, 
            price: price
        })
        res.json({
            message: "Courses fetched successfully",
            course
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: "Error updating course" });
    }
})

//Dispaly all the courses of the admin
adminRouter.get('/allcourseadmin',adminMiddleware, async function(req,res){
    try{
        const adminId = req.userId;
        const courses = await courseModel.find({
            creatorId: adminId 
        });
        res.json({
            message: "Course updated",
            courses
        })
    }
    catch(error){
        console.error(error);
        res.status(500).json({ message: "Error in displaying course" });
    }
})

module.exports = {
    adminRouter : adminRouter
}