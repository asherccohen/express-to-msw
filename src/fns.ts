import * as ts from 'typescript';

// Function to transform Express handlers to MSW handlers
export function transformExpressToMsw(sourceFile: ts.SourceFile): string[] {
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
        const mswHandler = `http.${method}('${path}', async ({ request, params }) => {
  // TODO: Implement handler logic
  // You may need to adapt the following based on your Express handler:
  // - Parse request body: const body = await request.json();
  // - Access query parameters: const searchParams = new URL(request.url).searchParams;
  // - Handle route parameters: params object contains route parameters
  
  return HttpResponse.json({
    // Add your response data here
  });
})`;

        mswHandlers.push(mswHandler);
      }
    }
  });

  return mswHandlers;
}

// Function to generate the final MSW handlers code
export function generateMswHandlersCode(handlers: string[]): string {
  return `import { http, HttpResponse } from 'msw';

export const handlers = [
  ${handlers.join(',\n  ')}
];

// Optional: Export a function to conditionally use MSW in development
export function setupMsw() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = require('./mswWorker');
    worker.start();
  }
}
`;
}
