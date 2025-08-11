# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This project facilitates importing cleaning service checklists and templates into Perfex CRM using GraphQL API. The import process uses bash scripts generated from markdown templates, with Claude AI handling the parsing and script generation.

## Architecture & Structure
```yaml
Type: Documentation & API Integration Project
Purpose: Convert markdown cleaning templates → Perfex CRM data
Method: Semi-automated using Claude AI for parsing/generation
Output: Executable bash scripts with GraphQL mutations

Directory Structure:
  /perfex-graphql-docs/     # All project documentation
    examples.md             # GraphQL query examples
    import-process.md       # Step-by-step import guide
    plan.md                 # Comprehensive implementation plan
    quick-reference.md      # API endpoints reference
    test-data-analysis.md   # Entity relationships & test data
  *.md files in root        # Cleaning template examples
  *.sh files in root        # Generated import scripts
```

## GraphQL API Configuration
```yaml
Endpoint: https://uredno.com/graphql
Auth Header: authtoken: 1748040454
Method: POST
Content-Type: application/json

Key Limitations:
  - No WHERE clause support (must filter client-side)
  - All mutation args are String type (even numbers)
  - Sequential execution required for relationships
```

## Core Data Model & Relationships
```yaml
Hierarchy:
  Project (H1) → Milestones (H3) → Tasks (H4) → Custom Fields & Checklists

Relationships:
  - Tasks → Projects: rel_id + rel_type="project"
  - Tasks → Milestones: milestone field
  - Custom Fields → Tasks: relid + fieldto="tasks"
  - Checklist Items → Tasks: taskid

Custom Field IDs:
  16: Time Estimate
  21: Chemicals
  22: Tools
  23: Safety Notes
  24: Quality Standards

Default Values:
  Client ID: 28 (TEMPLATE)
  Status: "2" (Active)
  Priority: "2" (Normal)
```

## Import Process Workflow

### Template Structure Requirements

#### Hierarchical Parsing Rules
- **H1 (#)** → Project Title
- **H3 (###)** → Milestone/Room Name (with time estimate in parentheses)
- **H4 (####)** → Task Name (must be prefixed with "TASK:")
- **Bold sections (**)** → Field indicators

#### Field Mapping
```markdown
# [Project Title]                # → Project name

### ROOM NAME (XX-XX minutes)    # → Milestone
#### TASK: Task Name             # → Task
**Time:** X minutes              # → Custom field 16
**Cleaning Steps:**              # → Task description field
1. Step one
2. Step two

**Chemicals:**                   # → Custom field 21
**Tools:**                       # → Custom field 22
**Safety:**                      # → Custom field 23
**Cleaning Standards:**          # → Custom field 24
**Detailed Checklist:**          # → Checklist items
- [ ] Step 1
- [ ] Step 2
```

### Template Validation Checklist
Before import, validate:
- [ ] H1 heading exists for project title
- [ ] All room sections use H3 headings
- [ ] Room names include time estimates in format "(XX-XX minutes)"
- [ ] All tasks use H4 headings with "TASK:" prefix
- [ ] Each task contains all required fields
- [ ] Cleaning steps are properly formatted (will go to description)
- [ ] Checklist items use markdown checkbox format

### Import Execution Order
1. **Parse** markdown structure according to mapping above
2. **Generate** executable bash script with:
   - Project configuration variables
   - Milestone array definitions
   - Task array definitions with all fields
   - Sequential GraphQL mutations with ID tracking
3. **Script Structure**:
   ```bash
   #!/bin/bash
   # API Configuration
   API_URL="https://uredno.com/graphql"
   AUTH_TOKEN="1748040454"
   
   # Project Configuration
   PROJECT_NAME="[From H1]"
   PROJECT_CLIENT_ID="28"  # Or specified
   
   # Milestones array
   MILESTONES=(
     "Room Name|Description|Order"
   )
   
   # Execute mutations with ID tracking
   PROJECT_ID=$(curl ... | jq -r '.data.addTblprojects.id')
   ```
4. **Execute** mutations in order:
   - `addTblprojects` → capture project ID
   - `addTblmilestones` → capture milestone IDs
   - `addTbltasks` → capture task IDs
   - `addTblcustomfieldsvalues` → add metadata
   - `addTbltask_checklist_items` → add checklist items
5. **Validate** responses for errors before proceeding

## Common Operations

### Query All Projects
```bash
curl -X POST https://uredno.com/graphql \
  -H "Content-Type: application/json" \
  -H "authtoken: 1748040454" \
  -d '{"query":"{ tblprojects { id name status clientid } }"}'
```

### Query Tasks with Relations
```bash
curl -X POST https://uredno.com/graphql \
  -H "Content-Type: application/json" \
  -H "authtoken: 1748040454" \
  -d '{"query":"{ tbltasks { id name milestone rel_id rel_type } }"}'
```

### Import Template Trigger
When user says "import cleaning template" or provides a markdown file:
1. Validate markdown structure using validation checklist
2. Ask for client ID if not specified (default: 28)
3. Generate executable bash script (not just curl commands)
4. Include error handling and response validation
5. Provide rollback instructions with generated IDs

## Important Implementation Notes

### Data Handling
- **Escape** all special characters in strings (quotes, newlines, backslashes)
- **Track** IDs between mutation steps using bash variables
- **Validate** each response for errors before continuing
- **Filter** query results client-side (no server-side WHERE support)
- **Special Characters**: Use proper bash escaping:
  ```bash
  NAME="Task with \"quotes\" and \$special chars"
  DESCRIPTION=$(cat <<'EOF'
  Multi-line content
  with proper formatting
  EOF
  )
  ```

### Error Handling Patterns
```bash
# Check for GraphQL errors
RESPONSE=$(curl ...)
if echo "$RESPONSE" | jq -e '.errors' > /dev/null; then
    echo "Error: $(echo "$RESPONSE" | jq -r '.errors[0].message')"
    exit 1
fi

# Extract and validate ID
ID=$(echo "$RESPONSE" | jq -r '.data.addTblprojects.id')
if [ -z "$ID" ] || [ "$ID" = "null" ]; then
    echo "Failed to get project ID"
    exit 1
fi
```

### Error Recovery
- Generate rollback script with all created IDs
- Include delete mutations in reverse order
- Log all responses for debugging
- Example rollback:
  ```bash
  # Rollback script
  curl ... -d '{"query":"mutation { deleteTbltasks(id: \"123\") }"}'
  curl ... -d '{"query":"mutation { deleteTblmilestones(id: \"45\") }"}'
  curl ... -d '{"query":"mutation { deleteTblprojects(id: \"67\") }"}'
  ```

### Current Limitations
- No batch operations (sequential mutations only)
- No direct project↔task queries (must join client-side)
- No timestamp handling for due dates
- All mutation arguments must be strings (even IDs)

## Script Generation Examples

### Task Definition Format
When generating bash scripts, use this format for task arrays:
```bash
# Task array format: "milestone_name|task_name|description|time|chemicals|tools|safety|standards|checklist_items"
TASKS=(
    "BEDROOM|Strip Beds and Start Laundry|Strip all beds completely...|10-15 minutes|Stain pre-treatment spray|Laundry basket, washing machine|Wear gloves when handling soiled linens|Mattress free of stains...|All bedding removed§Stains pre-treated§Washing machine started"
)
```

### Parsing Checklist Items
Convert markdown checkboxes to pipe-separated format:
```bash
# From markdown:
# - [ ] Item 1
# - [ ] Item 2
# To bash: "Item 1§Item 2"
```

## Development Status
**Active Development**: Project uses bash scripts for import execution. Claude AI generates complete import scripts from markdown templates. The scripts include full error handling, ID tracking, and rollback capabilities.