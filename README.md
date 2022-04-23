# Wrapped DFX

WDFX is a cli tool that runs ICP DFX cli inside a docker container

## <span style="color:RED">Warning</span>
This is an experimental tool and has not been thoroughly tested nor audited. Only meant to be used in development environment.

## Requirements

- [Docker](https://docs.docker.com/get-docker/)

## Installation
Use the package manager [NPM](https://github.com/nvm-sh/nvm/blob/master/README.md) to install WDFX.

```bash
npm install -g wdfx
docker pull cryptoisgood/wdfx
```

## Usage

```CLI
Usage: wdfx [options] [command]

Options:
  -h, --help                       display help for command

Commands:
  new [options] <Project-name>     creates new wdfx project
  init                             configured wdfx for your project
  reset [options]                  restart wdfx container
  destroy [options] <name>         destroys container and state of project
  deploy [options] <canisterName>  Deploys all or a specific canister from the code in your
                                   project. By default, all canisters are deployed
  start [options]                  Starts the local replica and a web server for the current
                                   project
  ssh                              allows you to enter wdfx environment and execute dfx commands
                                   directly. for advanced users only
  help [command]                   display help for command

```

### Existing Projects
Calling wsdx within existing project will create a .wdfx configuration and launch a dfx container within your docker environment.

Will not edit anything else.
```CLI
wdfx init
```

### New Projects
```CLI
wdfx new <project-name>
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)