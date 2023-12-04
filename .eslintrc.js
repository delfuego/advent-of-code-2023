module.exports = {
	'env': {
		'browser': true,
		'commonjs': true,
		'node': true,
		'es6': true,
		'jquery': true,
		'mocha': true,
	},
	'plugins': [
	],
	'parserOptions': {
		'ecmaVersion': 2020,
	},
	'extends': 'eslint:recommended',
	'rules': {
		'indent': ['error', 'tab', { 'SwitchCase': 1 }],
		'linebreak-style': ['error', 'unix'],
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
		'no-var': 'warn',
		'space-before-function-paren': ['error', { 'anonymous': 'always', 'named': 'never', 'asyncArrow': 'always' }],
		'no-unused-vars': ['error', { 'args': 'none' }], // stops checking function arguments for unused vars
		'comma-dangle': ['error', 'always-multiline'],
		'no-dupe-keys': 'error',
		'no-empty': 'error',
		'no-ex-assign': 'error',
		'no-func-assign': 'error',
		'no-unreachable': 'error',
		'no-obj-calls': 'error',
		'valid-typeof': 'error',
		'no-else-return': 'error',
		'no-return-assign': 'error',
		'curly': 'error',
		'dot-notation': 'error',
	},
};
