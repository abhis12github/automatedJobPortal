import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";

export const applyForJob = async ({ jobId, user }) => {
    const { name, email, phone, address, coverLetter, resume } = user;
    if (!name || !email || !phone || !address || !coverLetter || !resume) {
        throw new Error("All fields are required.");
    }

    const jobSeekerInfo = {
        id: user._id,
        name,
        email,
        phone,
        address,
        coverLetter,
        role: "Job Seeker",
        resume
    };

    const jobDetails = await Job.findById(jobId);
    if (!jobDetails) {
        throw new Error("Job not found.");
    }

    const isAlreadyApplied = await Application.findOne({
        "jobInfo.jobId": jobId,
        "jobSeekerInfo.id": user._id,
    });

    if (isAlreadyApplied) {
        throw new Error("You have already applied for this job.");
    }


    const employerInfo = {
        id: jobDetails.postedBy,
        role: "Employer",
    };

    const jobInfo = {
        jobId: jobId,
        jobTitle: jobDetails.title,
    };

    const application = await Application.create({
        jobSeekerInfo,
        employerInfo,
        jobInfo,
    });

    return application;
};
