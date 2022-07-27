export interface Args {
    inputspec: string;
    output: string;
    filename: string;
    multiplefiles: boolean;
}

export class Args implements Args{
    // destruct data
    constructor(inputspec: string, output: string, filename: string,multiplefiles: boolean) {
        this.inputspec = inputspec;
        this.output = output;
        this.filename = filename;
        this.multiplefiles = multiplefiles;
    }

    toObject(): Args {
        // destruct all own properties
        // (not methods in prototype)
        return {...this};
    }
}