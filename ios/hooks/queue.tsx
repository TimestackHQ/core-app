import { useEffect, useState } from "react";
import ExpoJobQueue from "expo-job-queue";
import { UploadItem } from "../types/global";

export const useQueueCounter = (holderId: string) => {
    const [queueCounter, setQueueCounter] = useState(0);

    const fetchJobs = async () => {
        if (!holderId) return;
        const jobs = (await ExpoJobQueue.getJobs())
            .map(job => JSON.parse(job.payload))
            .filter((job) => String(job.holderId) === String(holderId))
            .reverse();

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
        const jobs: UploadItem[] = (await ExpoJobQueue.getJobs())
            .map(job => JSON.parse(job.payload))
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