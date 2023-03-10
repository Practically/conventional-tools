import {Command, CliUx} from '@oclif/core';
import secrets from '../lib/secret';
import chalk = require('chalk');

export default class Secret extends Command {
    static description = 'Stores a secret into the desktop secret store';
    static args = [{name: 'host', required: true}];

    async run() {
        const {args} = await this.parse(Secret);

        const password = await CliUx.ux.prompt(
            `Please enter the secret for '${args.host}'`,
            {type: 'hide'},
        );

        try {
            await secrets.storeSecret(args.host, password);
            this.log(chalk.green('Secret has been successfully stored'));
        } catch (e: any) {
            if (e.message.includes('unsupported OS')) {
                this.error(
                    chalk.red(
                        'Can not store secret your OS is not supported. Please use the environment variable "CT_TOKEN"',
                    ),
                );
            } else if (typeof e.message === 'string') {
                this.error(chalk.red(e.message));
            } else {
                this.error(
                    `An unknown error occured getting the secret for '${args.host}'`,
                );
            }
        }
    }
}
