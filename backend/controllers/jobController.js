import { Job } from "../models/jobSchema.js";

export const postJob = async (req, res) => {
    const {
        title,
        jobType,
        location,
        companyName,
        introduction,
        responsibilities,
        qualifications,
        offers,
        salary,
        hiringMultipleCandidates,
        personalWebsiteTitle,
        personalWebsiteUrl,
        jobNiche,
    } = req.body;
    if (
        !title ||
        !jobType ||
        !location ||
        !companyName ||
        !introduction ||
        !responsibilities ||
        !qualifications ||
        !salary ||
        !jobNiche
    ) {
        return res.status(400).send({ message: "Please provide full job details.", success: false });
    }
    if (
        (personalWebsiteTitle && !personalWebsiteUrl) ||
        (!personalWebsiteTitle && personalWebsiteUrl)
    ) {
        return res.status(400).send({ message: "Provide both the website url and title, or leave both blank.", success: false });
    }
    const postedBy = req.user._id;
    const job = await Job.create({
        title,
        jobType,
        location,
        companyName,
        introduction,
        responsibilities,
        qualifications,
        offers,
        salary,
        hiringMultipleCandidates,
        personalWebsite: {
            title: personalWebsiteTitle,
            url: personalWebsiteUrl,
        },
        jobNiche,
        postedBy,
    });
    return res.status(201).send({
        success: true,
        message: "Job posted successfully.",
        job,
    });
};

export const getAllJobs = async (req, res) => {
    const { city, niche, searchKeyword } = req.query;
    const query = {};
    if (city) {
        query.location = city;
    }
    if (niche) {
        query.jobNiche = niche;
    }
    if (searchKeyword) {
        query.$or = [
            { title: { $regex: searchKeyword, $options: "i" } },
            { companyName: { $regex: searchKeyword, $options: "i" } },
            { introduction: { $regex: searchKeyword, $options: "i" } },
        ];
    }
    const jobs = await Job.find(query);
    return res.status(200).json({
        success: true,
        jobs,
        count: jobs.length,
    });
};

export const getMyJobs = async (req, res) => {
    const myJobs = await Job.find({ postedBy: req.user._id });
    return res.status(200).json({
        success: true,
        myJobs,
    });
};

export const deleteJob = async (req, res) => {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
        return res.status(400).send({ message: "Oops! Job not found.", success: false });
    }
    await job.deleteOne();
    return res.status(200).send({
        success: true,
        message: "Job deleted.",
    });
};

export const getASingleJob = async (req, res) => {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
        return res.status(404).send({message:"Job not found.",success:false});
    }
    res.status(200).send({
        success: true,
        job,
    });
};