import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const postApplication = async (req, res, next) => {
    const { id } = req.params;
    const { name, email, phone, address, coverLetter } = req.body;
    if (!name || !email || !phone || !address || !coverLetter) {
        return res.status(400).send({message:"All fields are required.",success:false});
    }
    const jobSeekerInfo = {
        id: req.user._id,
        name,
        email,
        phone,
        address,
        coverLetter,
        role: "Job Seeker",
    };
    const jobDetails = await Job.findById(id);
    if (!jobDetails) {
        return res.status(404).send({message:"Job not found.",success:false});
    }
    const isAlreadyApplied = await Application.findOne({
        "jobInfo.jobId": id,
        "jobSeekerInfo.id": req.user._id,
    });
    if (isAlreadyApplied) {
        return res.status(400).send({message:"You have already applied for this job.",success:false});
    }
    if (req.files && req.files.resume) {
        console.log("Entered into the file uploading section");
        const { resume } = req.files;
        try {
            const cloudinaryResponse = await cloudinary.uploader.upload(
                resume.tempFilePath,
                {
                    folder: "Job_Seekers_Resume",
                }
            );
            if (!cloudinaryResponse || cloudinaryResponse.error) {
                return res.status(500).send({ message: "Failed to upload resume to cloud", success: false });
            }
            jobSeekerInfo.resume = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            };
        } catch (error) {
            return res.status(500).send({ message: "Failed to upload resume", success: false });
        }
    } else {
        if (req.user && !req.user.resume.url) {
            return res.status(400).send({ message: "Please upload your resume", success: false });

        }
        jobSeekerInfo.resume = {
            public_id: req.user && req.user.resume.public_id,
            url: req.user && req.user.resume.url,
        };
    }
    const employerInfo = {
        id: jobDetails.postedBy,
        role: "Employer",
    };
    const jobInfo = {
        jobId: id,
        jobTitle: jobDetails.title,
    };
    const application = await Application.create({
        jobSeekerInfo,
        employerInfo,
        jobInfo,
    });
    res.status(201).json({
        success: true,
        message: "Application submitted.",
        application,
    });
};

export const employerGetAllApplication = 
    async (req, res, next) => {
        const { _id } = req.user;
        const applications = await Application.find({
            "employerInfo.id": _id,
            "deletedBy.employer": false,
        });
        res.status(200).json({
            success: true,
            applications,
        });
    };

export const jobSeekerGetAllApplication = 
    async (req, res, next) => {
        const { _id } = req.user;
        const applications = await Application.find({
            "jobSeekerInfo.id": _id,
            "deletedBy.jobSeeker": false,
        });
        res.status(200).json({
            success: true,
            applications,
        });
    };

export const deleteApplication =async (req, res, next) => {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
        return res.status(404).send({message:"Application not found.",success:false});
    }
    const { role } = req.user;
    switch (role) {
        case "Job Seeker":
            application.deletedBy.jobSeeker = true;
            await application.save();
            break;
        case "Employer":
            application.deletedBy.employer = true;
            await application.save();
            break;

        default:
            console.log("Default case for application delete function.");
            break;
    }

    if (
        application.deletedBy.employer === true &&
        application.deletedBy.jobSeeker === true
    ) {
        await application.deleteOne();
    }
    res.status(200).json({
        success: true,
        message: "Application Deleted.",
    });
};