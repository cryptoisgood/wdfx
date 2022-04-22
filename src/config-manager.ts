import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import {findPort} from 'find-open-port';

export default class ConfigManager{
    private configFile = "";
    private defaultConfig = {
        image: "cryptoisgood/wdfx:latest",
        dfx: {
            hostPort: 8000
        }
    }

    constructor(path?) {
        this.configFile = path ? `${path}/wdfx.json` : "wdfx.json";
    }


    async init() {
        if (!existsSync(this.configFile)) {
            const webPort = 8000
            let openPort = 0;
            for(let i = webPort; i < 9000; i++) {
                const isOpenPort = await findPort.isAvailable(i);
                if(isOpenPort) {
                    openPort = i;
                    break;
                }
            }

            const usingConfig = this.defaultConfig;
            usingConfig.dfx.hostPort = openPort;
            writeFileSync(this.configFile, JSON.stringify(usingConfig))
        }
    }

    getPort() {
        const fileContains = readFileSync(this.configFile, {encoding: "utf-8"});
        const configs = JSON.parse(fileContains);
        return configs.dfx.hostPort;
    }

    getImage() {
        const fileContains = readFileSync(this.configFile, {encoding: "utf-8"});
        const configs = JSON.parse(fileContains);
        return configs.image;
    }


}
