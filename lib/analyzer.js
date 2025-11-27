const babel = require('@babel/core');
const ReactCompiler = require('babel-plugin-react-compiler');

function analyze(sourceCode) {
    const optimizedLines = [];

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
        plugins: [ReactCompiler, detectPlugin],
        ast: false,
        code: false,
    });

    // Output unique optimized line numbers as a JSON array
    console.log(JSON.stringify([...new Set(optimizedLines)]));
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
