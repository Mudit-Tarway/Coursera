const express = require('express');
const mongoose = require("mongoose");
const app = express();

// FIXED import paths – use forward slashes '/' and make sure they're relative if needed
const { userRouter } = require("routes/user");
const { courseRouter } = require("./routes/courses");
const { adminRouter } = require("./routes/admin");

app.use(express.json()); // JSON middleware should come before the routes

app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/admin", adminRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});