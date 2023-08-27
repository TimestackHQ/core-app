import { useEffect, useState } from "react";
import { UploadItem } from "../types/global";
import {UploadItemJob, UploadJobsRepository} from "../utils/UploadJobsQueue";
import * as React from "react";


export const uploadQueueWorker = new UploadJobsRepository();
uploadQueueWorker.init().then(async () => {
    await uploadQueueWorker.clearUploads()
    uploadQueueWorker.runQueueWatcher();
    uploadQueueWorker.startQueue();
});

export const useQueueCounter = () => {
    const [queueCounter, setQueueCounter] = useState(0);

    const fetchJobs = async () => {
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

export const useQueue = (): UploadItemJob[] => {

    const [jobs, setJobs] = useState<UploadItemJob[]>([]);

    const fetchJobs = async () => {
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

export const QueueContext = React.createContext([0, []]);
