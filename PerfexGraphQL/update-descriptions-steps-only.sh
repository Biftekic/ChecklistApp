#!/bin/bash

# Update task descriptions to contain ONLY cleaning steps
API_URL="https://uredno.com/graphql"
AUTH_TOKEN="1748040454"

echo "================================================"
echo "Updating Descriptions - Cleaning Steps Only"
echo "================================================"
echo

# Task 1129 - Oven & Stovetop
cat > /tmp/task1129.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1129, description: \"1. Remove oven racks, drip pans, burner elements\\n2. Apply heavy-duty oven cleaner to interior\\n3. Let dwell for 20 minutes minimum\\n4. Clean stovetop thoroughly, including under elements\\n5. Scrub oven interior with appropriate tools\\n6. Clean oven door inside and out, including between glass\\n7. Clean and replace all removable parts\\n8. Clean oven drawer/warming drawer\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1129.json > /dev/null
echo "✓ Task 1129 - Deep Clean Oven & Stovetop"

# Task 1130 - Refrigerator
cat > /tmp/task1130.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1130, description: \"1. Remove all shelves and drawers\\n2. Clean interior with disinfectant\\n3. Clean door seals with detail brush\\n4. Pull out and clean behind/under\\n5. Clean coils if accessible\\n6. Sanitize all shelves and drawers\\n7. Clean exterior including top\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1130.json > /dev/null
echo "✓ Task 1130 - Refrigerator Deep Clean"

# Task 1131 - Shower
cat > /tmp/task1131.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1131, description: \"1. Apply mold/mildew remover to all surfaces\\n2. Let chemicals dwell 10-15 minutes\\n3. Scrub all grout lines thoroughly\\n4. Clean shower door/curtain tracks\\n5. Remove all soap scum from surfaces\\n6. Clean and descale showerhead\\n7. Polish all fixtures\\n8. Clean drain and remove hair\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1131.json > /dev/null
echo "✓ Task 1131 - Shower Deep Clean"

# Task 1132 - Windows
cat > /tmp/task1132.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1132, description: \"1. Remove and clean window treatments\\n2. Clean window tracks with detail brush\\n3. Wash windows inside (and outside if accessible)\\n4. Clean window sills thoroughly\\n5. Clean window frames\\n6. Polish glass to streak-free\\n7. Clean any window hardware\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1132.json > /dev/null
echo "✓ Task 1132 - Window Deep Clean"

# Task 1133 - Balcony
cat > /tmp/task1133.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1133, description: \"1. Remove all items and debris\\n2. Sweep thoroughly\\n3. Clean railings inside and out\\n4. Wash floor with appropriate cleaner\\n5. Clean any windows/sliding door\\n6. Clean door tracks thoroughly\\n7. Clean light fixtures\\n8. Remove any cobwebs\\n9. Clean any drain areas\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1133.json > /dev/null
echo "✓ Task 1133 - Balcony Deep Clean"

# Task 1134 - Pre-Cleaning
cat > /tmp/task1134.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1134, description: \"1. Document any existing damage with photos\\n2. Remove all personal items\\n3. Set up equipment and ventilation\\n4. Check that utilities are working\\n5. Apply heavy-duty cleaners to problem areas (let dwell)\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1134.json > /dev/null
echo "✓ Task 1134 - Pre-Cleaning Setup"

# Task 1135 - Cabinets
cat > /tmp/task1135.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1135, description: \"1. Empty all cabinets completely\\n2. Vacuum crumbs and debris\\n3. Wash interior with TSP solution\\n4. Clean exterior doors and handles\\n5. Clean inside drawers\\n6. Polish wood if applicable\\n7. Clean cabinet tops\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1135.json > /dev/null
echo "✓ Task 1135 - Cabinet Deep Clean"

# Task 1136 - Sink & Countertop
cat > /tmp/task1136.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1136, description: \"1. Clear and clean countertops completely\\n2. Remove sink stains with appropriate cleaner\\n3. Clean and sanitize garbage disposal\\n4. Polish faucet to shine\\n5. Clean backsplash thoroughly\\n6. Seal cleaning (if applicable)\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1136.json > /dev/null
echo "✓ Task 1136 - Sink & Countertop Deep Clean"

# Task 1137 - Kitchen Floor
cat > /tmp/task1137.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1137, description: \"1. Move all appliances possible\\n2. Sweep/vacuum thoroughly\\n3. Clean baseboards\\n4. Mop with appropriate cleaner\\n5. Clean under appliances\\n6. Detail corners and edges\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1137.json > /dev/null
echo "✓ Task 1137 - Kitchen Floor Deep Clean"

# Task 1138 - Toilet
cat > /tmp/task1138.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1138, description: \"1. Apply toilet bowl cleaner, let dwell\\n2. Clean tank exterior and behind toilet\\n3. Scrub bowl thoroughly, including under rim\\n4. Use pumice stone for mineral rings\\n5. Clean toilet seat hinges completely\\n6. Disinfect all exterior surfaces\\n7. Clean floor around toilet base\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1138.json > /dev/null
echo "✓ Task 1138 - Toilet Deep Clean"

# Task 1139 - Bathroom Sink & Vanity
cat > /tmp/task1139.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1139, description: \"1. Empty all vanity storage\\n2. Clean inside cabinets/drawers\\n3. Remove mineral deposits from sink\\n4. Polish faucet and fixtures\\n5. Clean mirror to streak-free\\n6. Clean light fixtures\\n7. Sanitize all surfaces\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1139.json > /dev/null
echo "✓ Task 1139 - Bathroom Sink & Vanity Deep Clean"

# Task 1140 - Washing Machine
cat > /tmp/task1140.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1140, description: \"1. Run self-clean cycle if available\\n2. Clean rubber door seal thoroughly\\n3. Clean detergent dispenser drawers\\n4. Wipe exterior and control panel\\n5. Clean lint filter\\n6. Check and clean drain filter\\n7. Move and clean behind/under\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1140.json > /dev/null
echo "✓ Task 1140 - Washing Machine Deep Clean"

# Task 1141 - Bathroom Floor & Walls
cat > /tmp/task1141.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1141, description: \"1. Clean exhaust fan and cover\\n2. Wash walls with TSP solution\\n3. Clean all switch plates\\n4. Deep clean floor, including behind toilet\\n5. Clean baseboards thoroughly\\n6. Check and clean air vents\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1141.json > /dev/null
echo "✓ Task 1141 - Bathroom Floor & Walls Deep Clean"

# Task 1142 - TV Area
cat > /tmp/task1142.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1142, description: \"1. Dust all electronics carefully\\n2. Clean TV screen with appropriate cleaner\\n3. Vacuum inside TV closet thoroughly\\n4. Clean all shelves and surfaces\\n5. Clean cable management areas\\n6. Dust and clean all corners\\n7. Polish any glass surfaces\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1142.json > /dev/null
echo "✓ Task 1142 - TV Area & Entertainment Center Deep Clean"

# Task 1143 - Living Room Walls
cat > /tmp/task1143.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1143, description: \"1. Dust walls from top to bottom\\n2. Spot clean any marks with magic eraser\\n3. Wash walls with TSP if needed\\n4. Clean all baseboards thoroughly\\n5. Clean all switch plates and outlets\\n6. Remove any adhesive residue\\n7. Check for and document any damage\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1143.json > /dev/null
echo "✓ Task 1143 - Living Room Walls, Baseboards & Outlets"

# Task 1144 - Living Room Floor
cat > /tmp/task1144.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1144, description: \"1. Move all furniture possible\\n2. Vacuum thoroughly including edges\\n3. Clean under furniture\\n4. Mop with appropriate cleaner\\n5. Detail corners and edges\\n6. Clean any floor vents\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1144.json > /dev/null
echo "✓ Task 1144 - Living Room Floor Deep Clean"

# Task 1145 - Entrance Closet
cat > /tmp/task1145.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1145, description: \"1. Empty closet completely\\n2. Vacuum floor and corners\\n3. Wash walls and shelves\\n4. Clean closet rod\\n5. Clean door (both sides) and tracks\\n6. Polish door hardware\\n7. Clean light fixture if present\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1145.json > /dev/null
echo "✓ Task 1145 - Entrance Closet Deep Clean"

# Task 1146 - Entry Door
cat > /tmp/task1146.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1146, description: \"1. Clean door thoroughly (both sides)\\n2. Clean door frame and threshold\\n3. Polish hardware and locks\\n4. Clean peephole\\n5. Clean doorbell/intercom\\n6. Clean light fixtures\\n7. Clean any windows in door\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1146.json > /dev/null
echo "✓ Task 1146 - Entry Door & Area Deep Clean"

# Task 1147 - Entry Floor
cat > /tmp/task1147.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1147, description: \"1. Vacuum thoroughly\\n2. Clean corners and edges\\n3. Mop with appropriate cleaner\\n4. Clean baseboards\\n5. Check for scuff marks\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1147.json > /dev/null
echo "✓ Task 1147 - Entry Floor Deep Clean"

# Task 1148 - Complete Walkthrough
cat > /tmp/task1148.json << 'EOF'
{
  "query": "mutation { updateTbltasks(id: 1148, description: \"1. Turn on all lights for inspection\\n2. Check each room systematically\\n3. Look for missed spots from multiple angles\\n4. Test all fixtures and appliances\\n5. Check for any odors\\n6. Take after photos\\n7. Complete move-out checklist\") { id } }"
}
EOF

curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" -d @/tmp/task1148.json > /dev/null
echo "✓ Task 1148 - Complete Property Walkthrough"

# Clean up
rm -f /tmp/task*.json

echo
echo "================================================"
echo "All Descriptions Updated - Steps Only!"
echo "================================================"
echo
echo "Task descriptions now contain ONLY the cleaning steps."
echo "Other details (time, chemicals, tools, safety) remain in custom fields:"
echo "- Field 16: Time Estimate"
echo "- Field 21: Chemicals"
echo "- Field 22: Tools"
echo "- Field 23: Safety"
echo "- Field 24: Standards"
echo
echo "View at: https://uredno.com/admin/projects/view/51"