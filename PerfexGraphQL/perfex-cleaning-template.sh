#!/bin/bash

# =============================================================================
# PERFEX CRM CLEANING PROJECT IMPORT TEMPLATE
# =============================================================================
# This script is designed to be easily customized for any cleaning project
# Simply modify the PROJECT CONFIGURATION and TASK DATA sections below
# =============================================================================

# API CONFIGURATION (DO NOT CHANGE)
API_URL="https://uredno.com/graphql"
AUTH_TOKEN="1748040454"

# =============================================================================
# PROJECT CONFIGURATION - CUSTOMIZE THIS SECTION
# =============================================================================

# Option 1: Create new project (set to "new")
# Option 2: Use existing project (set to project ID like "51")
PROJECT_MODE="new"  

# If creating new project, fill these details:
PROJECT_NAME="Example Office Cleaning | 123 Business St"
PROJECT_DESCRIPTION="Professional office cleaning service for 200m² space"
PROJECT_CLIENT_ID="28"  # Change to actual client ID
PROJECT_START_DATE="2025-01-30"
PROJECT_DEADLINE="2025-01-31"

# If using existing project, set the ID here:
EXISTING_PROJECT_ID=""

# =============================================================================
# MILESTONE DATA - CUSTOMIZE THIS SECTION
# =============================================================================
# Format: "Name|Description|Order"
MILESTONES=(
    "Reception Area (30-45 min)|Front desk, waiting area, entrance|1"
    "Office Spaces (60-90 min)|All workstations and private offices|2"
    "Conference Rooms (45-60 min)|Meeting rooms and equipment|3"
    "Kitchen & Break Room (30-45 min)|Kitchen, dining area, appliances|4"
    "Restrooms (45-60 min)|All restroom facilities|5"
    "Common Areas (30-40 min)|Hallways, storage, utility rooms|6"
    "Final Inspection (20-30 min)|Quality check and documentation|7"
)

# =============================================================================
# TASK DATA - CUSTOMIZE THIS SECTION
# =============================================================================
# Each task is defined with all its details
# You can add or remove tasks as needed

# Array to store all task definitions
declare -a TASKS

# Task 1 - Example format (copy this structure for each task)
TASKS[1]=$(cat <<'EOF'
MILESTONE=1
NAME=Reception Desk Deep Clean
STEPS=1. Clear and organize desk surface
2. Disinfect all surfaces including keyboard and phone
3. Clean computer monitors and screens
4. Vacuum desk drawers and organize
5. Polish all surfaces
6. Clean and disinfect door handles
TIME=20-30 minutes
CHEMICALS=Disinfectant, glass cleaner, polish
TOOLS=Microfiber cloths, vacuum, duster
SAFETY=Use electronics-safe cleaners
STANDARDS=Professional appearance, no dust or fingerprints
CHECKLIST=Desk surface cleared and organized|All electronics cleaned|Drawers vacuumed|Surfaces polished|Door handles disinfected
EOF
)

# Task 2
TASKS[2]=$(cat <<'EOF'
MILESTONE=1
NAME=Waiting Area Cleaning
STEPS=1. Vacuum all upholstered furniture
2. Wipe down all hard surfaces
3. Clean and organize magazine racks
4. Disinfect high-touch areas
5. Clean windows and glass doors
6. Arrange furniture properly
TIME=15-20 minutes
CHEMICALS=Upholstery cleaner, glass cleaner, disinfectant
TOOLS=Vacuum with attachments, microfiber cloths
SAFETY=Test cleaners on fabric first
STANDARDS=Welcoming and professional appearance
CHECKLIST=Furniture vacuumed|Surfaces wiped|Reading materials organized|Windows streak-free|Furniture arranged
EOF
)

# Task 3
TASKS[3]=$(cat <<'EOF'
MILESTONE=2
NAME=Workstation Cleaning
STEPS=1. Clear desk surfaces with permission
2. Disinfect keyboards, mice, and phones
3. Clean monitors with appropriate cleaner
4. Vacuum chair and adjust
5. Empty waste bins
6. Organize cables
7. Dust all surfaces including under items
TIME=10-15 minutes per station
CHEMICALS=Electronics cleaner, disinfectant
TOOLS=Microfiber cloths, vacuum, compressed air
SAFETY=Handle personal items with care
STANDARDS=Clean and organized workspace
CHECKLIST=Electronics disinfected|Monitor streak-free|Chair cleaned|Waste bin emptied|Cables organized|All surfaces dusted
EOF
)

# Add more tasks as needed...
# TASKS[4]=$(cat <<'EOF'
# MILESTONE=2
# NAME=Your Task Name
# STEPS=1. Step one
# 2. Step two
# etc...
# EOF
# )

# =============================================================================
# SCRIPT EXECUTION - DO NOT MODIFY BELOW THIS LINE
# =============================================================================

echo "============================================================"
echo "Perfex CRM Cleaning Project Import"
echo "============================================================"
echo

# Create or get project ID
if [ "$PROJECT_MODE" = "new" ]; then
    echo "Creating new project: $PROJECT_NAME"
    
    PROJECT_RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "authtoken: $AUTH_TOKEN" \
        -d "{\"query\": \"mutation { addTblprojects(name: \\\"$PROJECT_NAME\\\", description: \\\"$PROJECT_DESCRIPTION\\\", status: \\\"2\\\", clientid: \\\"$PROJECT_CLIENT_ID\\\", billing_type: \\\"1\\\", start_date: \\\"$PROJECT_START_DATE\\\", deadline: \\\"$PROJECT_DEADLINE\\\") { id name } }\"}")
    
    PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.data.addTblprojects.id')
    echo "✓ Created project with ID: $PROJECT_ID"
else
    PROJECT_ID=$EXISTING_PROJECT_ID
    echo "Using existing project ID: $PROJECT_ID"
fi

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
    echo "Error: Failed to create or find project"
    exit 1
fi

# Create milestones
echo
echo "Creating milestones..."

declare -A MILESTONE_IDS

for i in "${!MILESTONES[@]}"; do
    IFS='|' read -r name desc order <<< "${MILESTONES[$i]}"
    
    RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "authtoken: $AUTH_TOKEN" \
        -d "{\"query\": \"mutation { addTblmilestones(name: \\\"$name\\\", project_id: \\\"$PROJECT_ID\\\", description: \\\"$desc\\\", milestone_order: \\\"$order\\\") { id } }\"}")
    
    ID=$(echo "$RESPONSE" | jq -r '.data.addTblmilestones.id')
    MILESTONE_IDS[$order]=$ID
    
    echo "✓ Created: $name (ID: $ID)"
done

# Create tasks
echo
echo "Creating tasks..."

for i in "${!TASKS[@]}"; do
    if [ -n "${TASKS[$i]}" ]; then
        # Parse task data
        eval "${TASKS[$i]}"
        
        # Get milestone ID
        MILESTONE_ID=${MILESTONE_IDS[$MILESTONE]}
        
        # Escape steps for JSON
        ESCAPED_STEPS=$(echo "$STEPS" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')
        
        # Create task
        RESPONSE=$(curl -s -X POST "$API_URL" \
            -H "Content-Type: application/json" \
            -H "authtoken: $AUTH_TOKEN" \
            -d "{\"query\": \"mutation { addTbltasks(name: \\\"$NAME\\\", description: \\\"$ESCAPED_STEPS\\\", priority: \\\"2\\\", status: \\\"1\\\", rel_type: \\\"project\\\", rel_id: \\\"$PROJECT_ID\\\", milestone: \\\"$MILESTONE_ID\\\") { id } }\"}")
        
        TASK_ID=$(echo "$RESPONSE" | jq -r '.data.addTbltasks.id')
        
        if [ -n "$TASK_ID" ] && [ "$TASK_ID" != "null" ]; then
            echo "✓ Created task: $NAME (ID: $TASK_ID)"
            
            # Add custom fields
            curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" \
                -d "{\"query\": \"mutation { addTblcustomfieldsvalues(relid: \\\"$TASK_ID\\\", fieldid: \\\"16\\\", fieldto: \\\"tasks\\\", value: \\\"$TIME\\\") { id } }\"}" > /dev/null
            
            curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" \
                -d "{\"query\": \"mutation { addTblcustomfieldsvalues(relid: \\\"$TASK_ID\\\", fieldid: \\\"21\\\", fieldto: \\\"tasks\\\", value: \\\"$CHEMICALS\\\") { id } }\"}" > /dev/null
            
            curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" \
                -d "{\"query\": \"mutation { addTblcustomfieldsvalues(relid: \\\"$TASK_ID\\\", fieldid: \\\"22\\\", fieldto: \\\"tasks\\\", value: \\\"$TOOLS\\\") { id } }\"}" > /dev/null
            
            curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" \
                -d "{\"query\": \"mutation { addTblcustomfieldsvalues(relid: \\\"$TASK_ID\\\", fieldid: \\\"23\\\", fieldto: \\\"tasks\\\", value: \\\"$SAFETY\\\") { id } }\"}" > /dev/null
            
            curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" \
                -d "{\"query\": \"mutation { addTblcustomfieldsvalues(relid: \\\"$TASK_ID\\\", fieldid: \\\"24\\\", fieldto: \\\"tasks\\\", value: \\\"$STANDARDS\\\") { id } }\"}" > /dev/null
            
            # Add checklist items
            IFS='|' read -ra CHECKLIST_ITEMS <<< "$CHECKLIST"
            ORDER=1
            for item in "${CHECKLIST_ITEMS[@]}"; do
                curl -s -X POST "$API_URL" -H "Content-Type: application/json" -H "authtoken: $AUTH_TOKEN" \
                    -d "{\"query\": \"mutation { addTbltask_checklist_items(taskid: \\\"$TASK_ID\\\", description: \\\"$item\\\", finished: \\\"0\\\", list_order: \\\"$ORDER\\\") { id } }\"}" > /dev/null
                ((ORDER++))
            done
        fi
    fi
done

echo
echo "============================================================"
echo "Import Complete!"
echo "============================================================"
echo
echo "Project: $PROJECT_NAME"
echo "Project ID: $PROJECT_ID"
echo "Created: ${#MILESTONE_IDS[@]} milestones, ${#TASKS[@]} tasks"
echo
echo "View at: https://uredno.com/admin/projects/view/$PROJECT_ID"