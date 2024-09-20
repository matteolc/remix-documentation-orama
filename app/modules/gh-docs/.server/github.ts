import { Octokit } from "octokit";

const { GH_TOKEN } = process.env;

const octokit = new Octokit(GH_TOKEN ? { auth: GH_TOKEN } : undefined);

export { octokit };
