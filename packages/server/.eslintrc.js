export default {
    "root": true,
    "env": {
        "browser": true,
        "commonjs": false,
        "es2021": true
    },
    "extends": [
        "standard-with-typescript",
        "plugin:@typescript-eslint/recommended",
        "eslint:recommended"
    ],
    "ignorePatterns": ["dist", ".eslintrc.json"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
    },
    "plugins": [
        "prettier"
    ],
    "rules": {
        "curly": "error",
        "arrow-body-style": [
            "error",
            "as-needed"
        ],
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "quotes": [
            "warn",
            "double",
            {
                "allowTemplateLiterals": true
            }
        ],
        "semi": "warn",
        "@typescript-eslint/consistent-type-imports": [
            "warn",
            {
                "prefer": "type-imports",
                "fixStyle": "inline-type-imports"
            }
        ],
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                "argsIgnorePattern": "^_"
            }
        ]
    }
}