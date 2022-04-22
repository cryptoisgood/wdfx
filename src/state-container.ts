import {homedir, userInfo} from 'os';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";

function createConfigDir(hDir: string) {
    if (!existsSync(`${hDir}/.wdfx`)) {
        mkdirSync(`${hDir}/.wdfx`);
    }
}

function getDbObj(file): any[] {
    const containersRaw = readFileSync(file, {encoding: "utf-8"});
    console.log(containersRaw);
    return JSON.parse(containersRaw);
}

function saveToFile(file, data) {
    const dataToSave = JSON.stringify(data);
    writeFileSync(file, dataToSave);
}

export default class StateContainer{
    private base = homedir() + "/.wdfx"
    private containerDb = `${this.base}/container.json`;
    constructor() {
        createConfigDir(homedir())

        if (!existsSync(this.containerDb)){
            writeFileSync(this.containerDb, "[]")
        }
    }

    async saveContainer(containerName): Promise<string> {
        const container = getDbObj(this.containerDb);
        container.push(containerName);
        saveToFile(this.containerDb, containerName)
        return containerName;
    }

    async removeContainer(containerName): Promise<string> {
        const container = getDbObj(this.containerDb);
        console.log(container)
        saveToFile(this.containerDb, container.filter(x => x != containerName))
        return containerName;
    }

    async getAllContainers(): Promise<string[]> {
        return getDbObj(this.containerDb);
    }

   async containerExists(containerName): Promise<boolean> {
        return (await this.getAllContainers()).includes(containerName)
    }
}
