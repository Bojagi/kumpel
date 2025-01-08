interface ProjectConfig {
  name?: string;
  path: string;
  type: 'npm' | 'yarn';
  commands: {
    dev?: string;
    test?: string;
  }
}

interface Config {
  projects: ProjectConfig[];
}

interface Project {
  name: string;
  addLog: (log: object) => void;
  getLogs: () => object[];
  start: () => void;
  stop: () => void;
  isStarted: () => boolean;
  getTerminalOutput: () => string;
}

export type {
  ProjectConfig,
  Config,
  Project
}

