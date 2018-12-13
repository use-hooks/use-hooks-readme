#!/usr/bin/env node

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { render } = require('ejs');

const pkg = require(join(process.cwd(), 'package.json'));

if (!/^@use-hooks\//.test(pkg.name)) {
  console.error('ERROR: Only for @use-hooks packages.');
  process.exit(0);
}

const jsdocRegex = /[ \t]*\/\*\*\s*\n([^*]*(\*[^/])?)*\*\//g;
const sourceCode = readFileSync(join(process.cwd(), 'src/index.js'), 'utf8');

const jsdocs = sourceCode.match(jsdocRegex);

if (
  !jsdocs
  || jsdocs.length !== 2
  || !jsdocs[0].includes('Params')
  || !jsdocs[1].includes('Returns')
) {
  console.error('ERROR: Invalid format of JSDoc.');
  process.exit(0);
}

const example = readFileSync(join(process.cwd(), 'example/App.jsx'), 'utf8');

const readmeTpl = readFileSync(join(__dirname, 'README.TEMPLATE.md'), 'utf8');

const readme = render(readmeTpl, {
  name: pkg.name.split('/')[1],
  desc: pkg.description,
  params: jsdocs[0],
  returns: jsdocs[1],
  example: example.replace('../src', pkg.name),
});

writeFileSync(join(process.cwd(), 'README.md'), readme, 'utf8');
