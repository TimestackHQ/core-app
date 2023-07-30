import { useEffect, useState } from "react";
import { UploadItem } from "../types/global";
import {uploadQueueWorker} from "../App";
import {UploadItemJob} from "../utils/UploadJobsQueue";

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
        const jobs: UploadItemJob[] = (await uploadQueueWorker.getAllJobs())
            .filter((job) => job.holderId.toString() === holderId.toString())
            .reverse();

        setJobs(jobs);
    };

    useEffect(() => {
        (async () => {
            await fetchJobs();
            for(let i = 0; i > -1; i) {
                await fetchJobs();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        })();
    }, []); // Runs the effect once, when the component mounts

    return jobs;
}