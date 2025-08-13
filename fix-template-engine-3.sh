#!/bin/bash

# Fix the broken syntax
sed -i "s/validServiceTypes: string\[,'standard-cleaning'\]/validServiceTypes: string[]/" lib/services/template-engine.ts
sed -i "s/,'standard-cleaning'\];/,'standard-cleaning'];/" lib/services/template-engine.ts

# Remove duplicate closing brace
sed -i '477d' lib/services/template-engine.ts

echo "Fixed template-engine.ts part 3"
