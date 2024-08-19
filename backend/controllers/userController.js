import User from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { COOKIE_EXPIRE } from "../config/serverConfig.js";

export const register = async (req, res) => {
    try {
        const { name, email, phone, address, password, role, firstNiche, secondNiche, thirdNiche, coverLetter,applyAutomatically } = req.body;

        if (!name || !email || !phone || !address || !password || !role) {
            return res.status(400).send({ message: "All fields are required", success: false });
        }
        if (role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {

            return res.status(400).send({ message: "Please provide your preferred job niches", success: false });

        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: "User is already registered", success: false });
        }

        const userData = {
            name,
            email,
            phone,
            address,
            password,
            role,
            niches: {
                firstNiche,
                secondNiche,
                thirdNiche,
            },
            coverLetter,
            applyAutomatically
        };

        if (req.files && req.files.resume) {
            const { resume } = req.files;
            if (resume) {
                try {
                    const cloudinaryResponse = await cloudinary.uploader.upload(
                        resume.tempFilePath,
                        { folder: "Job_Seekers_Resume" }
                    );
                    if (!cloudinaryResponse || cloudinaryResponse.error) {

                        return res.status(500).send({ message: "Failed to upload resume to cloud", success: false });

                    }
                    userData.resume = {
                        public_id: cloudinaryResponse.public_id,
                        url: cloudinaryResponse.secure_url,
                    };
                } catch (error) {
                    console.log(error);
                    return res.status(500).send({ message: "Failed to upload resume to cloud", success: false });
                }
            }
        }
        const user = await User.create(userData);
        const token = user.getJWTToken();
        const options = {
            expires: new Date(
                Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
        };

        return res.status(200).cookie("token", token, options).send({ message: "Succesfully created a new user", success: true, user, token });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Unable to create new user", success: false });
    }
};

export const login = async (req, res) => {
    try {
        const { role, email, password } = req.body;
        if (!role || !email || !password) {
            return res.status(400).send({ message: "Email, password and role are required.", success: false });
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).send({ message: "Invalid Email or password", success: false });
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(400).send({ message: "Invalid Email or password", success: false });
        }
        if (user.role !== role) {
            return res.status(400).send({ message: "Invalid user role", success: false });
        }

        const token = user.getJWTToken();
        const options = {
            expires: new Date(
                Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
        };
        return res.status(200).cookie("token", token, options).send({ message: "Succesfully logged in", success: true, user, token });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Failed to sign in", success: false });
    }

};

export const logout = async (req, res) => {
    return res.status(200)
        .clearCookie("token")
        .send({
            success: true,
            message: "Logged out successfully.",
        });
};

export const getUser = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            message: "Fetched the user",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Unable to get user");
    }

};

export const updateProfile = async (req, res) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            coverLetter: req.body.coverLetter,
            niches: {
                firstNiche: req.body.firstNiche,
                secondNiche: req.body.secondNiche,
                thirdNiche: req.body.thirdNiche,
            },
            applyAutomatically:req.body.applyAutomatically
        };
        const { firstNiche, secondNiche, thirdNiche } = newUserData.niches;

        if (
            req.user.role === "Job Seeker" &&
            (!firstNiche || !secondNiche || !thirdNiche)
        ) {
            return res.status(400).send({ message: "Please provide your all preferred job niches.", success: false });
        }
        if (req.files) {
            const resume = req.files.resume;
            if (resume) {
                const currentResumeId = req.user.resume.public_id;
                if (currentResumeId) {
                    await cloudinary.uploader.destroy(currentResumeId);
                }
                const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
                    folder: "Job_Seekers_Resume",
                });
                newUserData.resume = {
                    public_id: newResume.public_id,
                    url: newResume.secure_url,
                };
            }
        }

        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        return res.status(200).send({
            success: true,
            user,
            message: "Profile updated.",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Unable to update profile")
    }

};

export const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("+password");

        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

        if (!isPasswordMatched) {
            return res.status(400).send({ message: "Old password is incorrect.", success: false });
        }

        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.status(400).send({ message: "New password & confirm password do not match.", success: false });
        }

        user.password = req.body.newPassword;
        await user.save();

        const token = user.getJWTToken();
        const options = {
            expires: new Date(
                Date.now() + COOKIE_EXPIRE * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
        };

        return res.status(200).cookie("token", token, options).send({ message: "Password updated succesfully", success: true, user, token });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to update password", success: false });
    }

};