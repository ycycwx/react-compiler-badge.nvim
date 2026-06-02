const babel = require('@babel/core');
const ReactCompiler = require('babel-plugin-react-compiler');

function uniqueSorted(lines) {
    return [...new Set(lines)].sort((a, b) => a - b);
}

function getFunctionName(path) {
    const node = path.node;

    if (node.id && node.id.name) {
        return node.id.name;
    }

    const parent = path.parentPath;
    if (!parent) {
        return null;
    }

    if (parent.isVariableDeclarator() && parent.node.id.type === 'Identifier') {
        return parent.node.id.name;
    }

    if (
        parent.isAssignmentExpression() &&
        parent.node.left.type === 'Identifier'
    ) {
        return parent.node.left.name;
    }

    if (
        parent.isObjectProperty() &&
        parent.node.key.type === 'Identifier'
    ) {
        return parent.node.key.name;
    }

    return null;
}

function isComponentName(name) {
    return typeof name === 'string' && /^[A-Z]/.test(name);
}

function functionReturnsJsx(path) {
    let found = false;

    path.traverse({
        JSXElement(returnPath) {
            found = true;
            returnPath.stop();
        },
        JSXFragment(returnPath) {
            found = true;
            returnPath.stop();
        },
        Function(nestedPath) {
            nestedPath.skip();
        },
    });

    return found;
}

function hasNoMemoDirective(path) {
    const body = path.node.body;
    if (!body || body.type !== 'BlockStatement') {
        return false;
    }

    return body.directives.some(directive => {
        return directive.value && directive.value.value === 'use no memo';
    });
}

function analyze(sourceCode) {
    const candidateLines = [];
    const optimizedLines = [];

    const candidatePlugin = function () {
        return {
            visitor: {
                Function(path) {
                    const name = getFunctionName(path);
                    if (
                        isComponentName(name) &&
                        functionReturnsJsx(path) &&
                        !hasNoMemoDirective(path) &&
                        path.node.loc
                    ) {
                        candidateLines.push(path.node.loc.start.line);
                    }
                },
            },
        };
    };

    const detectPlugin = function () {
        return {
            visitor: {
                Function(path) {
                    const body = path.get('body');
                    if (body.isBlockStatement()) {
                        const statements = body.get('body');
                        if (statements.length > 0) {
                            const firstNode = statements[0].node;

                            let isOptimized = false;

                            if (firstNode.type === 'VariableDeclaration') {
                                const decl = firstNode.declarations[0];
                                if (
                                    decl.id.name === '$' &&
                                    decl.init &&
                                    decl.init.callee &&
                                    decl.init.callee.name.includes('_c')
                                ) {
                                    isOptimized = true;
                                }
                            }

                            if (isOptimized && path.node.loc) {
                                optimizedLines.push(path.node.loc.start.line);
                            }
                        }
                    }
                },
            },
        };
    };

    babel.transformSync(sourceCode, {
        filename: 'file.tsx',
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
        plugins: [candidatePlugin, ReactCompiler.default || ReactCompiler, detectPlugin],
        ast: false,
        code: false,
    });

    const optimized = uniqueSorted(optimizedLines);
    const optimizedSet = new Set(optimized);
    const failed = uniqueSorted(candidateLines).filter(line => !optimizedSet.has(line));

    console.log(JSON.stringify({ optimized, failed }));
}

let code = '';
process.stdin.resume();
process.stdin.on('data', chunk => {
    code += chunk;
});
process.stdin.on('end', () => {
    try {
        analyze(code);
    } catch (e) {
        console.log('code', e);
    }
});
