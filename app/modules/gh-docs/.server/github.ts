import { Octokit } from "octokit";
import invariant from "tiny-invariant";

const { GH_TOKEN } = process.env;
invariant(GH_TOKEN, "expected GH_TOKEN");

const octokit = new Octokit();

export { octokit };
