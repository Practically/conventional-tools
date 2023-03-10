import {Command} from '@oclif/core';

import {cosmiconfigSync} from 'cosmiconfig';
import * as execa from 'execa';
import * as Listr from 'listr';

const chalk = require('chalk');

const getObjectItem = (obj: any, item: any, defaultValue: any = undefined) => {
    const arr = typeof item === 'string' ? item.split('.') : item;
    while (arr.length && obj) {
        obj = obj[arr.shift()];
    }

    return obj || defaultValue;
};

let config: any;
const configGet = async (item: any, defaultValue: any) => {
    if (!config) {
        const explorerSync = cosmiconfigSync('ct');
        const searchedFor = explorerSync.search();
        config = searchedFor || {};
    }

    return getObjectItem(config.config, item, defaultValue);
};

export default class GitHook extends Command {
    static description = 'Manage git hooks under version control';

    static strict = false;
    static args = [{name: 'hook'}];
    async run() {
        const {args, argv} = await this.parse(GitHook);

        const hooks = await configGet(`hooks.${args.hook}`, []);
        const taskList = [];

        for (let hook of hooks) {
            for (const i in argv) {
                hook = hook.replace(new RegExp(`\\$\\{${i}\\}`, 'g'), argv[i]);
            }

            hook = hook.replace(/\$\{\d+\}/g, '');

            let title = hook;
            if (hook.includes('\n')) {
                title = hook.split('\n')[0].replace(/^#\s+(.*)/, '$1');
            }

            taskList.push({
                title: title,
                task: async () => {
                    try {
                        await execa.command(hook, {shell: true});
                    } catch (e: any) {
                        if (typeof e.message === 'string') {
                            throw new Error(e.message);
                        } else {
                            throw new Error(
                                `An error occurred running '${hook}'`,
                            );
                        }
                    }
                },
            });
        }

        if (taskList.length === 0) {
            process.exit(0);
        }

        console.log(chalk.blue(`\n ??? Running hooks for ${args.hook} \n`));
        const tasks = new Listr(taskList);
        tasks
            .run()
            .then(() =>
                console.log(
                    chalk.green('\n ??? All hooks have completed successfully\n'),
                ),
            )
            .catch((err: any) => {
                console.log(
                    chalk.red('\n ??? Hooks failed with the message\n\n') +
                        err.message,
                );
                process.exit(1);
            });
    }
}
