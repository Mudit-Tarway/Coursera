require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const app = express();
mongoose.connect(process.env.MONGO_URL);

const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");

app.use(express.json()); 

app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/admin", adminRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});