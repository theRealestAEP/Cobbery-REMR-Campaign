const GLOBAL_FUNCTIONS = ['end_call', 'start'];

function validateFlow(flowJson) {
    const errors = [];
    const warnings = [];
    const definedStates = new Set(Object.keys(flowJson));
    const referencedFunctions = new Set();

    // get every function
    Object.values(flowJson).forEach(state => {
        if (state.functions) {
            state.functions.forEach(func => {
                referencedFunctions.add(func.name);
                
                // check all fucntion params
                if (func.parameters) {
                    validateFunctionParameters(func, errors);
                }
            });
        }

        // Check for required fields in state
        if (!state.messages) {
            warnings.push(`State is missing 'messages' array`);
        }
        if (!state.functions) {
            warnings.push(`State is missing 'functions' array`);
        }
    });

    // Check for orphaned function references i.e Im stupid and call non existent functions
    referencedFunctions.forEach(funcName => {
        if (!GLOBAL_FUNCTIONS.includes(funcName) && !definedStates.has(funcName)) {
            errors.push(`Function "${funcName}" is referenced but not defined as a state`);
        }
    });

    // Check for required start state
    if (!flowJson.start) {
        errors.push('Flow is missing required "start" state');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

function validateFunctionParameters(func, errors) {
    //AI generated to check json schema in each param,
    const params = func.parameters;
    
    // Validate required fields exist 
    if (params.required) {
        params.required.forEach(requiredField => {
            if (!params.properties || !params.properties[requiredField]) {
                errors.push(
                    `Function "${func.name}" requires field "${requiredField}" but it's not defined in properties`
                );
            }
        });
    }

    // Validate property types
    if (params.properties) {
        Object.entries(params.properties).forEach(([propName, propDef]) => {
            if (!propDef.type) {
                errors.push(
                    `Property "${propName}" in function "${func.name}" is missing type definition`
                );
            }
        });
    }
}

try {
    const filePath = process.argv[2];
    
    if (!filePath) {
        console.error('Please provide a file path: node flowValidator.js <path-to-flow-json>');
        process.exit(1);
    }

    const flowJson = require(filePath);
    const validation = validateFlow(flowJson);
    
    if (validation.isValid) {
        console.log('Flow validation passed!');
        if (validation.warnings.length > 0) {
            console.log('\nWarnings:');
            validation.warnings.forEach(warning => console.log(`- ${warning}`));
        }
    } else {
        console.log('Flow validation failed!');
        console.log('\nErrors:');
        validation.errors.forEach(error => console.log(`- ${error}`));
        if (validation.warnings.length > 0) {
            console.log('\nWarnings:');
            validation.warnings.forEach(warning => console.log(`- ${warning}`));
        }
        process.exit(1);
    }
} catch (error) {
    console.error('Failed to parse flow JSON:', error.message);
    process.exit(1);
}
