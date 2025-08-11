# How to Use the Perfex Cleaning Template Script

## Overview
The `perfex-cleaning-template.sh` script is a reusable template for importing cleaning projects into Perfex CRM. You only need to modify the data sections - no programming knowledge required!

## Step-by-Step Guide

### 1. Copy the Template
```bash
cp perfex-cleaning-template.sh my-new-project.sh
chmod +x my-new-project.sh
```

### 2. Edit Project Configuration

Open the script and find the **PROJECT CONFIGURATION** section:

```bash
# Option 1: Create new project
PROJECT_MODE="new"  
PROJECT_NAME="Your Project Name | Address"
PROJECT_DESCRIPTION="Description of the cleaning service"
PROJECT_CLIENT_ID="28"  # Change to your client's ID
PROJECT_START_DATE="2025-01-30"
PROJECT_DEADLINE="2025-01-31"

# Option 2: Use existing project
PROJECT_MODE="existing"
EXISTING_PROJECT_ID="123"  # Your existing project ID
```

### 3. Define Milestones (Room/Area Groups)

Edit the **MILESTONE DATA** section:

```bash
MILESTONES=(
    "Kitchen (60-90 min)|Complete kitchen cleaning|1"
    "Bathrooms (45-60 min)|All bathroom facilities|2"
    "Bedrooms (60-80 min)|Master and guest bedrooms|3"
    # Add more as needed...
)
```

Format: `"Name|Description|Order"`

### 4. Define Tasks

Edit the **TASK DATA** section. Each task follows this structure:

```bash
TASKS[1]=$(cat <<'EOF'
MILESTONE=1                    # Which milestone (1=Kitchen, 2=Bathrooms, etc.)
NAME=Deep Clean Oven          # Task name
STEPS=1. First step           # Cleaning steps (will show in description)
2. Second step
3. Third step
TIME=30-45 minutes            # Time estimate
CHEMICALS=Oven cleaner, degreaser
TOOLS=Scrub brush, gloves
SAFETY=Use ventilation
STANDARDS=No grease visible
CHECKLIST=Interior cleaned|Door cleaned|Racks cleaned
EOF
)
```

### 5. Run the Script

```bash
./my-new-project.sh
```

## Example: Office Cleaning Project

```bash
# Project setup
PROJECT_NAME="ABC Corp Office | 123 Business Ave"
PROJECT_DESCRIPTION="Weekly office cleaning service - 150m²"

# Milestones
MILESTONES=(
    "Reception & Lobby (45 min)|Front entrance areas|1"
    "Office Spaces (90 min)|All workstations|2"
    "Meeting Rooms (60 min)|Conference and meeting areas|3"
    "Facilities (60 min)|Kitchen, restrooms|4"
)

# Task example
TASKS[1]=$(cat <<'EOF'
MILESTONE=1
NAME=Reception Desk Cleaning
STEPS=1. Clear desk surface
2. Disinfect all surfaces
3. Clean computer and phone
4. Vacuum drawers
5. Polish surfaces
TIME=20-30 minutes
CHEMICALS=Disinfectant, polish
TOOLS=Microfiber cloths, vacuum
SAFETY=Handle electronics carefully
STANDARDS=Professional appearance
CHECKLIST=Desk cleared|Surfaces disinfected|Electronics cleaned
EOF
)
```

## Tips

1. **Checklist Format**: Use pipe `|` to separate checklist items
2. **Multi-line Steps**: Just press Enter for new lines in STEPS
3. **Special Characters**: Avoid using quotes in your text
4. **Milestone Numbers**: Tasks reference milestones by order number
5. **Testing**: Test with a few tasks first before adding all

## Custom Fields Reference

The script automatically populates these Perfex custom fields:
- Field 16: Time Estimate
- Field 20: Cleaning Steps (backup)
- Field 21: Chemicals
- Field 22: Tools
- Field 23: Safety Notes
- Field 24: Quality Standards

## Troubleshooting

**Project not created?**
- Check CLIENT_ID is correct
- Verify date format (YYYY-MM-DD)

**Tasks not appearing?**
- Ensure MILESTONE number matches order
- Check for syntax errors in task definition

**Checklist missing?**
- Use pipe `|` between items
- No pipes in item text itself

## Quick Template for New Task

```bash
TASKS[X]=$(cat <<'EOF'
MILESTONE=1
NAME=Your Task Name
STEPS=1. Step one
2. Step two
3. Step three
TIME=XX-XX minutes
CHEMICALS=List chemicals
TOOLS=List tools
SAFETY=Safety notes
STANDARDS=Quality standards
CHECKLIST=Check 1|Check 2|Check 3
EOF
)
```

Replace X with next task number!