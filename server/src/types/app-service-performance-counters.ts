export interface AppServicePerformanceCounters {
    [counterName: string]: number;
    userTime: number;
    kernelTime: number;
    pageFaults: number;
    processes: number;
    processLimit: number;
    threads: number;
    threadLimit: number;
    connections: number;
    connectionLimit: number;
    sections: number;
    sectionLimit: number;
    namedPipes: number;
    namedPipeLimit: number;
    readIoOperations: number;
    writeIoOperations: number;
    otherIoOperations: number;
    readIoBytes: number;
    writeIoBytes: number;
    otherIoBytes: number;
    privateBytes: number;
    handles: number;
    contextSwitches: number;
    remoteOpens: number;
    remoteWrites: number;
    remoteWriteKBs: number;
}
