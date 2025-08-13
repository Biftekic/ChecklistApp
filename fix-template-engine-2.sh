#!/bin/bash

# Add standard-cleaning to valid service types
sed -i "/validServiceTypes: string\[\] = \[/,/\]/s/\]/,'standard-cleaning'\]/" lib/services/template-engine.ts

# Fix the mergeTemplateWithQA ending
echo "}" >> lib/services/template-engine.ts

echo "Fixed template-engine.ts part 2"
