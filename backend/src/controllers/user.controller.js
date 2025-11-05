import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


async  function registerUser (req, res) {
    const {fullName:{firstName, lastName}, email, password} = req.body;

    const isUserAlreadyExists =await userModel.findOne({email});

    if (isUserAlreadyExists) {
        return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create ({
        fullName:{
            firstName,
            lastName
        },
        email,
        password: hashedPassword
    }) 

    const token = jwt.sign ({
        id: user._id
    }, process.env.JWT_SECRET);

    res.cookie("token", token);


    res.status(201).json ({
        message: "User created successfully",
        user:{
            id: user._id,
        fullName: user.fullName,
        email: user.email,
        
        token
        }
    });
}

async function loginUser (req, res) {
    const {email, password} = req.body;

    const user = await userModel.findOne({email});

    if (!user) {
        return res.status(400).send("Invalid email or password!");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(400).send("Invalid email or password!");
    }

    const token = jwt.sign ({
        id: user._id
    }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(200).json ({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        
        token
    });
}

export default {
     registerUser,
    loginUser
}

