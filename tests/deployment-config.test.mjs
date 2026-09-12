import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const distributionDirectory = new URL("../dist/", import.meta.url);
const packageJsonPath = new URL("../package.json", import.meta.url);
const wranglerTemplatePath = new URL("../wrangler.example.jsonc", import.meta.url);
const deploymentWorkflowPath = new URL(
  "../.github/workflows/deploy.yml",
  import.meta.url,
);
const qualityWorkflowPath = new URL(
  "../.github/workflows/quality.yml",
  import.meta.url,
);

test("builds a standalone Worker without Sites deployment metadata", async () => {
  const distributionEntries = await readdir(distributionDirectory);
  assert.equal(distributionEntries.includes(".openai"), false);

  const wranglerTemplate = await readFile(wranglerTemplatePath, "utf8");
  assert.match(wranglerTemplate, /"main": "\.\/dist\/server\/index\.js"/);
  assert.match(wranglerTemplate, /"binding": "DB"/);
  assert.match(wranglerTemplate, /"workers_dev": false/);
  assert.match(wranglerTemplate, /"preview_urls": false/);
  assert.doesNotMatch(wranglerTemplate, /"routes?":/);
});

test("deploys main only after validation and keeps manual deployment available", async () => {
  const deploymentWorkflow = await readFile(deploymentWorkflowPath, "utf8");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

  assert.match(deploymentWorkflow, /^\s{2}push:\s*$/mu);
  assert.match(deploymentWorkflow, /^\s{4}branches:\s*\[main\]\s*$/mu);
  assert.match(deploymentWorkflow, /^\s{2}workflow_dispatch:\s*$/mu);
  assert.doesNotMatch(deploymentWorkflow, /^\s{2}pull_request:\s*$/mu);

  const validationStepIndex = deploymentWorkflow.indexOf("run: npm run check");
  const deploymentStepIndex = deploymentWorkflow.indexOf(
    "name: Apply migrations and deploy",
  );
  assert.notEqual(validationStepIndex, -1);
  assert.notEqual(deploymentStepIndex, -1);
  assert.ok(validationStepIndex < deploymentStepIndex);

  assert.match(deploymentWorkflow, /d1 migrations apply .+ --remote/);
  assert.match(deploymentWorkflow, /deploy --config wrangler\.jsonc/);
  assert.doesNotMatch(deploymentWorkflow, /wrangler\.jsonc --no-bundle/);
  assert.equal(
    packageJson.scripts["deploy:selfhost"],
    "npm run build && wrangler deploy --config wrangler.jsonc",
  );
});

test("validates pull requests without duplicating checks on main", async () => {
  const qualityWorkflow = await readFile(qualityWorkflowPath, "utf8");

  assert.match(qualityWorkflow, /^\s{2}pull_request:\s*$/mu);
  assert.doesNotMatch(qualityWorkflow, /^\s{2}push:\s*$/mu);
  assert.match(qualityWorkflow, /run: npm run check/);
});
