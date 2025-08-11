#!/bin/bash

# =============================================================================
# HOTEL ROOM CLEANING IMPORT - EXAMPLE
# =============================================================================

# API CONFIGURATION
API_URL="https://uredno.com/graphql"
AUTH_TOKEN="1748040454"

# =============================================================================
# PROJECT CONFIGURATION
# =============================================================================
PROJECT_MODE="new"  
PROJECT_NAME="Hotel Marina | Room 305 Deep Clean"
PROJECT_DESCRIPTION="Deep cleaning service for deluxe hotel room with bathroom"
PROJECT_CLIENT_ID="28"  
PROJECT_START_DATE="2025-02-01"
PROJECT_DEADLINE="2025-02-01"

# =============================================================================
# MILESTONE DATA
# =============================================================================
MILESTONES=(
    "Bedroom Area (45-60 min)|Bed, furniture, surfaces, floors|1"
    "Bathroom (30-45 min)|Complete bathroom sanitization|2"
    "Windows & Balcony (20-30 min)|Windows, sliding door, balcony|3"
    "Final Touches (15-20 min)|Amenities, inspection, air quality|4"
)

# =============================================================================
# TASK DATA
# =============================================================================
declare -a TASKS

TASKS[1]=$(cat <<'EOF'
MILESTONE=1
NAME=Bed & Linens Service
STEPS=1. Strip all bed linens and pillowcases
2. Check mattress for stains or damage
3. Flip/rotate mattress if needed
4. Apply fresh fitted sheet with hospital corners
5. Add flat sheet and blanket/duvet
6. Place fresh pillowcases
7. Arrange decorative pillows
TIME=15-20 minutes
CHEMICALS=Fabric refresher spray
TOOLS=Fresh linen set, linen cart
SAFETY=Use proper lifting technique for mattress
STANDARDS=Hotel standard bed presentation
CHECKLIST=Old linens removed|Mattress checked|Fresh sheets applied|Hospital corners perfect|Pillows arranged|Bed skirt aligned
EOF
)

TASKS[2]=$(cat <<'EOF'
MILESTONE=1
NAME=Furniture & Surfaces
STEPS=1. Dust all furniture from top to bottom
2. Clean and disinfect nightstands
3. Disinfect TV remote and phone
4. Clean TV screen with appropriate cleaner
5. Wipe down all drawers inside and out
6. Polish wooden surfaces
7. Clean mirrors and picture frames
TIME=20-25 minutes
CHEMICALS=Wood polish, disinfectant, glass cleaner
TOOLS=Microfiber cloths, duster
SAFETY=Move furniture carefully
STANDARDS=No dust visible, surfaces shine
CHECKLIST=All surfaces dusted|Remote/phone disinfected|TV screen clean|Drawers cleaned|Wood polished|Mirrors streak-free
EOF
)

TASKS[3]=$(cat <<'EOF'
MILESTONE=1
NAME=Carpet & Floor Care
STEPS=1. Pick up any debris or items
2. Vacuum carpet thoroughly
3. Use crevice tool along baseboards
4. Vacuum under bed and furniture
5. Spot clean any stains
6. Deodorize if needed
TIME=10-15 minutes
CHEMICALS=Carpet spot cleaner, deodorizer
TOOLS=Vacuum with attachments, spot cleaning kit
SAFETY=Check for loose wires before moving furniture
STANDARDS=Carpet lines visible, no debris
CHECKLIST=Debris removed|Main areas vacuumed|Edges cleaned|Under furniture cleaned|Stains treated|Fresh scent
EOF
)

TASKS[4]=$(cat <<'EOF'
MILESTONE=2
NAME=Bathroom Deep Clean
STEPS=1. Apply toilet bowl cleaner and let sit
2. Spray shower/tub with cleaner
3. Clean mirror and light fixtures
4. Scrub toilet inside and out
5. Clean shower walls, tub, fixtures
6. Wipe down vanity and sink
7. Mop bathroom floor
8. Replace towels and amenities
TIME=25-30 minutes
CHEMICALS=Toilet cleaner, bathroom cleaner, glass cleaner
TOOLS=Toilet brush, scrub brush, mop
SAFETY=Ventilate bathroom, don't mix chemicals
STANDARDS=Sparkling clean, no water spots
CHECKLIST=Toilet sanitized|Shower/tub cleaned|Mirror streak-free|Sink polished|Floor mopped|Fresh towels placed|Amenities stocked
EOF
)

TASKS[5]=$(cat <<'EOF'
MILESTONE=3
NAME=Windows & Glass Doors
STEPS=1. Open curtains/blinds fully
2. Dust window sills and frames
3. Clean interior glass surfaces
4. Clean sliding door tracks
5. Wipe down door handles
6. Adjust curtains/blinds properly
TIME=15-20 minutes
CHEMICALS=Glass cleaner, all-purpose cleaner
TOOLS=Squeegee, microfiber cloths, detail brush
SAFETY=Secure ladder if needed for high windows
STANDARDS=Crystal clear glass, no streaks
CHECKLIST=Window sills dusted|Glass streak-free|Tracks cleaned|Handles disinfected|Curtains arranged
EOF
)

TASKS[6]=$(cat <<'EOF'
MILESTONE=3
NAME=Balcony Cleaning
STEPS=1. Remove any debris or items
2. Sweep balcony floor
3. Wipe down furniture
4. Clean glass railing/panels
5. Check for cobwebs
6. Arrange furniture nicely
TIME=10-15 minutes
CHEMICALS=All-purpose cleaner, glass cleaner
TOOLS=Broom, cloths, bucket
SAFETY=Be careful near railings
STANDARDS=Outdoor space inviting and clean
CHECKLIST=Debris removed|Floor swept|Furniture cleaned|Railings cleaned|No cobwebs|Furniture arranged
EOF
)

TASKS[7]=$(cat <<'EOF'
MILESTONE=4
NAME=Final Room Setup
STEPS=1. Check and adjust room temperature
2. Place fresh flowers if provided
3. Arrange welcome amenities
4. Fold towel decoratively
5. Place chocolates on pillow
6. Ensure all lights work
7. Light air freshener
8. Final visual inspection
TIME=10-15 minutes
CHEMICALS=Air freshener
TOOLS=Amenity kit, fresh flowers
SAFETY=Check electrical items are safe
STANDARDS=5-star hotel presentation
CHECKLIST=Temperature comfortable|Amenities placed|Towels arranged|Chocolates positioned|Lights checked|Fresh scent|Room photo-ready
EOF
)

# =============================================================================
# SCRIPT EXECUTION (Same as template - not modified)
# =============================================================================

echo "============================================================"
echo "Perfex CRM Cleaning Project Import"
echo "============================================================"
# ... rest of execution code is identical to template ...