#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs/promises';
import * as ts from 'typescript';

// Define the main function to run the CLI
async function main() {
  // Set up Commander for parsing command-line arguments
  program
    .version('1.0.0')
    .description('Refactor Express handlers to MSW V2 handlers')
    .requiredOption('-i, --input <path>', 'Input Express routes file')
    .requiredOption('-o, --output <path>', 'Output MSW handlers file')
    .parse(process.argv);

  const options = program.opts();

  try {
    // Read the input Express routes file
    const inputCode = await fs.readFile(options.input, 'utf-8');

    // Parse the TypeScript code
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      inputCode,
      ts.ScriptTarget.Latest,
      true
    );

    // Transform Express handlers to MSW handlers
    const mswHandlers = transformExpressToMsw(sourceFile);

    // Generate the output MSW handlers code
    const outputCode = generateMswHandlersCode(mswHandlers);

    // Write the output to the specified file
    await fs.writeFile(options.output, outputCode);

    console.log(`MSW handlers successfully generated at ${options.output}`);
  } catch (error) {
    console.error('Error:', (error as any).message);
    process.exit(1);
  }
}

// Function to transform Express handlers to MSW handlers
function transformExpressToMsw(sourceFile: ts.SourceFile): string[] {
  const mswHandlers: string[] = [];

  // Traverse the AST to find Express route definitions
  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isExpressionStatement(node) &&
      ts.isCallExpression(node.expression)
    ) {
      const { expression } = node;
      if (
        ts.isPropertyAccessExpression(expression.expression) &&
        ['get', 'post', 'put', 'delete', 'patch'].includes(
          expression.expression.name.text
        )
      ) {
        // Extract route information
        const method = expression.expression.name.text;
        const path = (expression.arguments[0] as ts.StringLiteral).text;

        // Generate MSW handler
        const mswHandler = `http.${method}('${path}', ({ request }) => {
  // TODO: Implement handler logic
  return HttpResponse.json({});
})`;

        mswHandlers.push(mswHandler);
      }
    }
  });

  return mswHandlers;
}

// Function to generate the final MSW handlers code
function generateMswHandlersCode(handlers: string[]): string {
  return `import { http, HttpResponse } from 'msw';

export const handlers = [
  ${handlers.join(',\n  ')}
];
`;
}

// Run the main function
main();
