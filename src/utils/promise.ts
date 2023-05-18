/**
 * @description Executes an array of async functions concurrently, up to a maximum number at a time.
 *
 * @param tasks An array of functions that return promises.
 * @param concurrencyLimit The maximum number of functions to execute concurrently.
 *
 * @returns A promise that resolves with an array of results in the same order as the input functions.
 */
export async function concurrentTaskQueue<T>(
    tasks: Array<() => Promise<T>>,
    concurrencyLimit: number
): Promise<T[]> {
    if (concurrencyLimit < 1) {
        throw new Error("concurrencyLimit must be greater than 0");
    }

    const results: Array<T> = Array(tasks.length).fill(null);
    const taskQueue: Array<Promise<void>> = [];

    async function executeTask(index: number) {
        try {
            results[index] = await tasks[index]();
        } catch (error) {
            console.error(`Error executing task at index ${index}:`, error);
        }
    }

    for (let i = 0; i < tasks.length; i++) {
        const task = executeTask(i);

        if (taskQueue.length < concurrencyLimit) {
            taskQueue.push(task);
        } else {
            const index = await Promise.race(taskQueue.map((t, idx) => t.then(() => idx)));
            taskQueue[index] = task;
        }
    }

    await Promise.all(taskQueue);

    return results;
}