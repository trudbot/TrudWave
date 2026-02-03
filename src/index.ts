import fs from 'fs';
import {compile} from 'moo';

class TrudWave {
    static hadError: boolean = false;
    static runFile(pth: string) {
        const content = fs.readFileSync(pth, 'utf-8');
        if (this.hadError) process.exit(65);
        this.run(content);
    }

    private static report(line: number, where: string, message: string) {
        console.error(`[Line ${line}] Error at ${where}: ${message}`);
        this.hadError = true;
    }

    static compile(source: string) {
        
    }

    static run(source: string) {

    }
}