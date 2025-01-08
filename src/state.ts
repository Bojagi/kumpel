import { Project, ProjectConfig } from "./types";
import childProcess, { ChildProcess } from 'child_process';

const initProjects = (projectPackageJsonFiles: (readonly [ProjectConfig, string | object, string])[]): Project[] => {
  return projectPackageJsonFiles.map(([project, projectPackageJson, projectPath]: any) => {
    const command = projectPackageJson.scripts[project.commands.dev];
    let output: [string, string][] = [];
    let logs: object[] = [];
    let error = null;

    let process: ChildProcess = null;

    const start = () => {
      error = null;
      process = childProcess.exec(`yarn ${command}`, {
        cwd: projectPath,
      });
      process.stdout.on('data', (data) => {
        output.push([data.toString(), 'stdout']);
      });

      process.stderr.on('data', function (data) {
        output.push([data.toString(), 'stderr']);
      });

      process.on('exit', function (code) {
        if (code !== 0) {
          error = new Error(`Process exited with code ${code}`);
        }
        process = null;
      });
    };

    const stop = () => {
      if (process) {
        process.kill();
        process = null;
      }
    };

    const isStarted = () => !!process;

    return {
      name: projectPackageJson.name,
      addLog: (log: object) => { logs.push(log); },
      getLogs: () => logs,
      start,
      stop,
      isStarted,
      getTerminalOutput: () => output.map(([data]) => data).join(''),
    }
  });
}

export {
  initProjects
}
