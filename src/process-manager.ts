import { FastifyInstance } from "fastify/fastify";
import { Project } from "./types";

const initProcessManager = (server: FastifyInstance, projects: Project[]) => {
  server.post('/projects/:name/process/start', async (request: any, reply) => {
    const project = projects.find(project => project.name === request.params.name);
    if (!project) {
      reply.status(404);
      return { error: 'Project not found' };
    }
    project.start();
    return { success: true };
  });

  server.post('/projects/:name/process/stop', async (request: any, reply) => {
    const project = projects.find(project => project.name === request.params.name);
    if (!project) {
      reply.status(404);
      return { error: 'Project not found' };
    }
    project.stop();
    return { success: true };
  });

  server.get('/projects/:name/process/logs', async (request: any, reply) => {
    const project = projects.find(project => project.name === request.params.name);
    if (!project) {
      reply.status(404);
      return { error: 'Project not found' };
    }
    return { logs: project.getLogs() };
  });

  server.post('/projects/:name/process/logs', async (request: any, reply) => {
    const project = projects.find(project => project.name === request.params.name);
    if (!project) {
      reply.status(404);
      return { error: 'Project not found' };
    }
    project.addLog(request.body);
    return { success: true };
  });

  server.get('/projects/:name/process/terminal', async (request: any, reply) => {
    const project = projects.find(project => project.name === request.params.name);
    if (!project) {
      reply.status(404);
      return { error: 'Project not found' };
    }
    return { output: project.getTerminalOutput() };
  });
}

export {
  initProcessManager
}
