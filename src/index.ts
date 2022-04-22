#! /usr/bin/env ts-node
import { Command } from 'commander';
import {execSync, spawn} from 'child_process';
import {readFileSync} from "fs";

const program = new Command();

program
    .command('destroy')
    .description('destroys container and state of project')
    .action(async () => {
        const realWorkingDirectory = process.cwd();
        const projectName = realWorkingDirectory.split("/").at(-1);
        console.log("stopping dfx docker container...");
        const stdout = execSync(`docker stop icp-${projectName}`);
        console.log("deleting dfx docker container...");
        const stdout2 = execSync(`docker rm icp-${projectName}`);
    });

program
    .command('deploy')
    .description('Deploys all or a specific canister from the code in your project. By default, all canisters are deployed')
    .option('--canister-name', `Specifies the name of the canister you want to deploy. If you don’t specify a canister name, all canisters defined in the dfx.json file are deployed`)
    .option("--reinstall", "Force to reinstall")
    .action(async (props) => {
        const realWorkingDirectory = process.cwd();
        const projectName = realWorkingDirectory.split("/").at(-1);
        const args = ["exec", "-w", `/root/dfx/${projectName}`, "-it",  `icp-${projectName}`, "/bin/bash"];

        spawn('docker', ['exec', '-w', `/root/dfx/${projectName}`, '-it', `icp-${projectName}`, '/bin/bash', '-c', 'sh /root/dfx/deploy.sh'], {
            cwd: process.cwd(),
            detached: true,
            stdio: "inherit"
        });

        // const shell = spawn("docker", args, { stdio: 'inherit' });
        // shell.on('close',(code)=>{console.log('[shell] terminated :',code)})
    });


program
    .command('start')
    .option('--clean', 'Cleans the state of the current project')
    .option('--port', 'Cleans the state of the current project', "8000")

    .description('Starts the local replica and a web server for the current project')
    .action(async (source) => {
        const realWorkingDirectory = process.cwd();
        const projectName = realWorkingDirectory.split("/").at(-1);
        const volumes = `${realWorkingDirectory}:/root/dfx/${projectName}`
        console.log("starting dfx docker container...");
        try {
            execSync(`docker run -d --volume "${volumes}" -p ${source.port}:${source.port} --name icp-${projectName} icp:latest`);
        }catch (e) {
            if (e.message.includes("already in use")) {
                console.warn("container exists, skipping step");
            }
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
        const args = ["exec", "-w", `/root/dfx/${projectName}`, "-it",  `icp-${projectName}`, "dfx",  "start", "--host", `127.0.0.1:${source.port}`];
        if (source.clean) {
            args.push("--clean");
        }
        const shell = spawn("docker", args, { stdio: 'inherit' });
        shell.on('close',(code)=>{console.log('[shell] terminated :',code)})
        await new Promise(resolve => setTimeout(resolve, 3000));
    });

program.parse();