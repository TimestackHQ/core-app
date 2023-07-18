import { useEffect, useState } from "react";
import { UploadItem } from "../types/global";
import {uploadQueueWorker} from "../App";

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

export const useQueue = (holderId: string): UploadItem[] => {

    const [jobs, setJobs] = useState<UploadItem[]>([]);

    const fetchJobs = async () => {
        if (!holderId) return;
        const jobs: UploadItem[] = (await uploadQueueWorker.getAllJobs())
            .map(job => job.item)
            .filter((job) => job.holderId.toString() === holderId.toString())
            .reverse();

        setJobs(jobs);
    };

    useEffect(() => {
        const interval = setInterval(fetchJobs, 100); // Calls fetchJobs every 100 milliseconds

        return () => {
            clearInterval(interval); // Clears the interval when the component unmounts
        };
    }, []); // Runs the effect once, when the component mounts

    return jobs;
}