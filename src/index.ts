#! /usr/bin/env ts-node
import { Command } from 'commander';
import {execSync, spawn} from 'child_process';
import {homedir, userInfo} from 'os';
import {Docker} from 'node-docker-api';

import {existsSync, mkdirSync, readdirSync, writeFileSync} from "fs";
import StateContainer from "./state-container";
import ConfigManager from "./config-manager";
import {readdir} from "fs/promises";


const program = new Command();
const state = new StateContainer();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

function destroy(container) {
    console.log("stopping dfx docker container...");
    const stdout = execSync(`docker stop ${container}`);
    console.log(stdout.toString('utf8'))
    console.log("deleting dfx docker container...");
    const stdout2 = execSync(`docker rm ${container}`);
    console.log(stdout2.toString('utf8'))
    state.removeContainer(container).then()
}

function reset(container) {
    console.log("restart dfx docker container...");
    const stdout = execSync(`docker restart ${container}`);
    console.log(stdout.toString('utf8'))
}


async function containerReady(projectName): Promise<boolean> {
    const exists = await state.containerExists(projectName);
    if (!exists) {
        return false;
    }

    try {
        const dockerContainer = await docker.container.get(projectName);
        const containerWithStatus = await dockerContainer.status();
        const data: any = containerWithStatus.data;
        console.log(data.State)
        return data.State.Running;
    }catch (e) {
        return false;
    }

}



program.command("new")
    .description("creates new wdfx project")
    .argument("<Project-name>", "Specifies the name of the project to create")
    .option("--type <type>", "Choose the type of canister in the starter project. Default to be motoko [default: motoko] [possible values: motoko, rust]", "motoko")
    .action(async (projectName, options) => {
        mkdirSync("./" + projectName)
        const config = new ConfigManager("./" + projectName);
        await config.init();
        const image = config.getImage()
        const port = config.getPort()
        const realWorkingDirectory = process.cwd();

        const volumes = `${realWorkingDirectory}/${projectName}:/root/dfx/${projectName}`
        console.log(`creating dfx docker container for ${projectName} with image ${image}...`);
        try {
            execSync(`docker run -d --volume "${volumes}" -p ${port}:${port} --name ${projectName} ${image}`);
            await state.saveContainer(projectName);
        }catch (e) {
            if (e.message.includes("already in use")) {
                const containerExists = state.containerExists(projectName);
                if (!containerExists) {
                    console.warn("project in bad state, cleaning up")
                    destroy(projectName);
                } else {
                    console.warn("INFO: project already initiated")
                }
            }
        }

        let isContainerReady = false;
        while (!isContainerReady) {
            isContainerReady = await containerReady(projectName);
        }
        let userI = userInfo();

        const args = ['exec', '-w', `/root/dfx/${projectName}`, "-e"  , `HOST_UID=${userI.uid}`, '-it', `${projectName}`, '/bin/bash', '-c', `sh /root/dfx/dfx-new.sh ${projectName}`];

        if (options.type) {
            args.push("--type");
            args.push(options.type);
        }


        spawn('docker', args, {
            cwd: process.cwd(),
            detached: true,
            stdio: "inherit"
        });
    });

program.command("init")
    .description("configured wdfx for your project")
    .action(async () => {
        const config = new ConfigManager();

        await config.init();
        const hDir = homedir();
        const dfxExists = existsSync("./dfx.json");
        if (!dfxExists) {
            console.error("Error: must be in an existing icp project, maybe run wdfx new");
            return;
        }
        if (!existsSync(`${hDir}/.wdfx`)){
            mkdirSync(`${hDir}/.wdfx`);
            if (!existsSync(`${hDir}/.wdfx/containers`)){
                mkdirSync(`${hDir}/.wdfx/containers`);
            }
            if (!existsSync(`${hDir}/.wdfx/state`)){
                mkdirSync(`${hDir}/.wdfx/state`);
            }
        }

        const realWorkingDirectory = process.cwd();
        const projectName = realWorkingDirectory.split("/").at(-1);
        const volumes = `${realWorkingDirectory}:/root/dfx/${projectName}`
        const image = config.getImage()
        const port = config.getPort()
        console.log(`creating dfx docker container for ${projectName} with image ${image}...`);
        try {
            execSync(`docker run -d --volume "${volumes}" -p ${port}:${port} --name ${projectName} ${image}`);
            await state.saveContainer(projectName);
        }catch (e) {
            if (e.message.includes("already in use")) {
                const containerExists = state.containerExists(projectName);
                if (!containerExists) {
                    console.warn("project in bad state, cleaning up")
                    destroy(projectName);
                } else {
                    console.warn("INFO: project already initiated")
                }
            }
        }

    });

program.command("reset")
    .description("restart wdfx container")
    .option("--all", "resets all containers and state of all projects", false)
    .option("--name", "resets project by name", null)
    .action(async (props) => {
        const containers = [];

        if (props.name) {
            containers.push(props.name);
            return;
        }

        if (!props.all) {
            const realWorkingDirectory = process.cwd();
            const projectName = realWorkingDirectory.split("/").at(-1);
            containers.push(projectName);
        } else {
            containers.push(...await state.getAllContainers());
        }

        containers.forEach(container => {
            reset(container);
        });
    });



program
    .command('destroy')
    .description('destroys container and state of project')
    .option("--all", "destroys all containers and state of all projects", false)
    .argument("<name>", "destroys project by name")
    .action(async (arg, props) => {
        const containersToDestroy = [];

        if (arg) {
            destroy(arg);
            return;
        }

        if (!props.all) {
            const realWorkingDirectory = process.cwd();
            const projectName = realWorkingDirectory.split("/").at(-1);
            containersToDestroy.push(projectName);
        }

        containersToDestroy.forEach(container => {
            destroy(container);
        });
    });




program
    .command('deploy')
    .description('Deploys all or a specific canister from the code in your project. By default, all canisters are deployed')
    .option('--canister-name', `Specifies the name of the canister you want to deploy. If you don’t specify a canister name, all canisters defined in the dfx.json file are deployed`)
    .option("--reinstall", "Force to reinstall")
    .action(async (props) => {
        const realWorkingDirectory = process.cwd();
        const projectName = realWorkingDirectory.split("/").at(-1);
        let isContainerReady = false;
        while (!isContainerReady) {
            isContainerReady = await containerReady(projectName);
        }
        if (isContainerReady) {
            let userI = userInfo();

            spawn('docker', ['exec', '-w', `/root/dfx/${projectName}`, "-e",  `HOST_UID=${userI.uid}`, '-it', `${projectName}`, '/bin/bash', '-c', 'sh /root/dfx/deploy.sh'], {
                cwd: process.cwd(),
                detached: true,
                stdio: "inherit"
            });
        }

    });


program
    .command('start')
    .option('--clean', 'Cleans the state of the current project')
    .description('Starts the local replica and a web server for the current project')
    .action(async (source) => {
        const realWorkingDirectory = process.cwd();
        const projectName = realWorkingDirectory.split("/").at(-1);
        const ready = await containerReady(projectName);
        if (ready) {
            const config = new ConfigManager();
            const port = config.getPort()
            console.log(port);
            let userI = userInfo();

            const args = ["exec", "-w", `/root/dfx/${projectName}`, "-e",  `HOST_UID=${userI.uid}`, "-it", `${projectName}`, '/bin/bash', '-c', `sh /root/dfx/dfx-start.sh --host 127.0.0.1:${port}`];
            if (source.clean) {
                args.push("--clean");
            }
            const shell = spawn("docker", args, {stdio: 'inherit'});
            shell.on('close', (code) => {
                console.log('[shell] terminated :', code)
            })
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            console.log("INFO: container is stopped run wdfx reset")
        }
    });

program.parse();