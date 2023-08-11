import { useEffect, useState } from "react";
import { UploadItem } from "../types/global";
import {UploadItemJob, UploadJobsRepository} from "../utils/UploadJobsQueue";


const uploadQueueWorker = new UploadJobsRepository();
uploadQueueWorker.init().then(async () => {
    await uploadQueueWorker.clearUploads()
    uploadQueueWorker.runQueueWatcher();
    uploadQueueWorker.startQueue();
});

export const useQueueCounter = (holderId: string) => {
    const [queueCounter, setQueueCounter] = useState(0);

    const fetchJobs = async () => {
        if (!holderId) return;
        const jobs = await uploadQueueWorker.getAllJobs();

        setQueueCounter(jobs.length);
    };

    useEffect(() => {
        const interval = setInterval(fetchJobs, 100); // Calls fetchJobs every 100 milliseconds

        return () => {
            clearInterval(interval); // Clears the interval when the component unmounts
        };
    }, []); // Runs the effect once, when the component mounts

    return queueCounter;
};

export const useQueue = (holderId: string): UploadItemJob[] => {

    const [jobs, setJobs] = useState<UploadItemJob[]>([]);

    const fetchJobs = async () => {
        if (!holderId) return;
        console.log("Fetching jobs")
        const jobs = await uploadQueueWorker.getAllJobs();
        console.log("Jobs", jobs)

        setJobs(jobs);
    };

    useEffect(() => {
        const interval = setInterval(fetchJobs, 1000); // Calls fetchJobs every 100 milliseconds

        return () => {
            clearInterval(interval); // Clears the interval when the component unmounts
        };
    }, []); // Runs the effect once, when the component mounts

    return jobs;
}