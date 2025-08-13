#!/bin/bash

# Fix template-engine.ts
sed -i 's/defaultItems/items/g' lib/services/template-engine.ts
sed -i "s/'regular' as ServiceType/industry === 'residential' ? 'standard-cleaning' as ServiceType : 'regular' as ServiceType/" lib/services/template-engine.ts
sed -i "s/validServiceTypes: ServiceType\[\]/validServiceTypes: string[]/" lib/services/template-engine.ts

echo "Fixed template-engine.ts"
