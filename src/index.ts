#!/usr/bin/env node

import * as path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { Config, ProjectConfig } from './types.js';
import { glob } from 'glob'
import Fastify from 'fastify';
import { initProjects } from './state.js';
import { initProcessManager } from './process-manager.js';

const server = Fastify({
  logger: true,
  bodyLimit: 1048576 * 100,
});

const cwd = process.cwd();

const readFile = async <T extends object>(localPath: string, parser: (content: string) => T = JSON.parse) => {
  const fileContent = await fs.promises.readFile(path.resolve(cwd, localPath), 'utf-8');
  return parser ? parser(fileContent) : fileContent;
}

const getProjectPackageJsonFiles = async (paths: readonly (readonly [ProjectConfig, string[]])[]) => {
  const promiseResults = await Promise.allSettled(paths.flatMap(([project, projectPaths]) => 
    projectPaths.map(async projectPath => 
      [project, await readFile(path.resolve(projectPath, 'package.json')), projectPath] as const)
    ));
  return promiseResults.filter((result) => result.status === 'fulfilled').map(result => result.value);
};

const getProjectsFromGlob = async (projects: ProjectConfig[]) => {
  return (await Promise.all(projects.map(async project => [project, await glob(project.path)] as const)));
}

(async () => {
  const config: Config = await readFile('kumpel.yml', YAML.parse);
  const packageJson = await readFile('package.json');
  const projectPaths = await getProjectsFromGlob(config.projects);
  const projectPackageJson = await getProjectPackageJsonFiles(projectPaths);
  const projects = await initProjects(projectPackageJson);

  server.get('/projects', async (request, reply) => {
    return projects.map(project => ({
      name: project.name,
      isStarted: project.isStarted(),
    }));
  });

  initProcessManager(server, projects);

  // Run the server!
  try {
    await server.listen({ port: 33222 })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
})();
