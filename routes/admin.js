const {Router} = require("express");
const adminRouter = Router();
const {adminModel} = require("../database")
const bcrypt = require("bcrypt");
const {z} = require("zod");
const jwt = require("jsonwebtoken");
const {WT_ADMIN_SECRET} = require("config.js");

adminRouter.post('/signup', async function(req, res) {
    res.json({
        message : "Admin signup"
    })
});


adminRouter.post('/sigin',function(req,res){
    res.json({
        message : "Admin signup"
    })
})

adminRouter.post('/addcourse',function(req,res){
    res.json({
        message : "Admin added course"
    })
})

adminRouter.post('/deletecourse',function(req,res){
    res.json({
        message : "Ädmin deleted course"
    })
})

adminRouter.get('/allcouseadmin',function(req,res){
    res.json({
        message : "All courses admin have"
    })
})

module.exports = {
    adminRouter : adminRouter
}