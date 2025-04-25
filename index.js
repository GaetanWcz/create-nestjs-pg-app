#!/usr/bin/env node

import degit from 'degit';
import fs from 'fs-extra';
import prompts from 'prompts';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { execa } from 'execa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.on('SIGINT', () => {
  console.log('\n❌ Operation cancelled.');
  process.exit(1);
});

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    noInstall: args.includes('--no-install'),
  };
  const projectName = args.find(arg => !arg.startsWith('--'));
  return { options, projectName };
};

(async () => {
  const { options, projectName: argProjectName } = parseArgs();

  const response = await prompts([
    {
      type: argProjectName ? null : 'text',
      name: 'projectName',
      message: '📦 What\'s your project name?',
      initial: 'my-nest-app',
    },
    {
      type: 'select',
      name: 'packageManager',
      message: '📁 Choose a package manager:',
      choices: [
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'pnpm', value: 'pnpm' },
      ],
      initial: 0,
    },
  ]);

  const projectName = argProjectName || response.projectName;
  const packageManager = response.packageManager;
  const repo = 'GaetanWcz/nestjs-production-ready-starter';
  const targetPath = resolve(__dirname, projectName);

  console.log(`🚀 Scaffolding from ${repo} into ./${projectName}`);
  const emitter = degit(repo, {
    cache: false,
    force: true,
    verbose: true,
  });

  await emitter.clone(targetPath);
  process.chdir(targetPath);

  // Update project name in package.json
  const pkgPath = resolve(targetPath, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = projectName;
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  if (!options.noInstall) {
    console.log(`📦 Installing dependencies using ${packageManager}...`);
    await execa(packageManager, ['install'], { stdio: 'inherit' });
  } else {
    console.log('⏭️  Skipping dependency installation (--no-install)');
  }

  console.log(`✅ Your project "${projectName}" is ready! Happy coding 🧑‍💻`);
  process.exit(0)
})();
