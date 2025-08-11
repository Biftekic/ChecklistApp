# Claude Configuration for Perfex GraphQL Project

## Project Context
This project manages cleaning service checklists and templates for Perfex CRM using GraphQL API.

## GraphQL API Configuration
```yaml
Endpoint: https://uredno.com/graphql
Auth Header: authtoken: 1748040454
Method: POST
Content-Type: application/json
```

## Cleaning Template Import Process

### Trigger Phrases
- "Import cleaning template"
- "Import checklist to Perfex"
- "Create cleaning project from template"

### Import Workflow
```yaml
Process:
  1. Parse markdown structure:
     - H1 → Project name
     - H3 → Milestones (rooms)
     - H4 with "TASK:" → Tasks
     - Bold sections → Task metadata
     - Bullet points → Checklist items
  
  2. Generate GraphQL mutations in order:
     - addTblprojects → Get project ID
     - addTblmilestones → Get milestone IDs
     - addTbltasks → Get task IDs
     - addTblcustomfieldsvalues → Add metadata
     - addTbltask_checklist_items → Add checklists
  
  3. Map custom fields:
     - Time Estimate: fieldid 16
     - Cleaning Steps: fieldid 20
     - Chemicals: fieldid 21
     - Tools: fieldid 22
     - Safety Notes: fieldid 23
     - Quality Standards: fieldid 24
  
  4. Output format:
     - Provide executable curl commands
     - Include ID capture instructions
     - Show complete import sequence

Default Client: 28 (TEMPLATE)
Default Status: "2" (Active)
```

## Template Structure Requirements
```markdown
# [Title] → Project name

### ROOM NAME (time) → Milestone
#### TASK: [Name] → Task
**Time:** X minutes → Custom field 16
**Cleaning Steps:** → Custom field 20
**Chemicals:** → Custom field 21
**Tools:** → Custom field 22
**Safety:** → Custom field 23
**Cleaning Standards:** → Custom field 24
**Detailed Checklist:** → Checklist items
- [ ] Item 1
- [ ] Item 2
```

## Quick Commands

### Import Template
```
When user provides a cleaning template:
1. Parse according to structure above
2. Generate mutations with proper escaping
3. Provide step-by-step execution commands
4. Include ID tracking between steps
```

### Query Existing Data
```bash
# Get all projects
curl -X POST https://uredno.com/graphql \
  -H "Content-Type: application/json" \
  -H "authtoken: 1748040454" \
  -d '{"query":"{ tblprojects { id name status } }"}'

# Get tasks with milestones
curl -X POST https://uredno.com/graphql \
  -H "Content-Type: application/json" \
  -H "authtoken: 1748040454" \
  -d '{"query":"{ tbltasks { id name milestone rel_id } }"}'
```

## Important Notes

1. **No WHERE Clauses**: The GraphQL API doesn't support filtering. Fetch all data and filter client-side.

2. **String Types**: All mutation arguments accept String type, even for numbers.

3. **Relationships**:
   - Tasks → Projects: via `rel_id` and `rel_type="project"`
   - Tasks → Milestones: via `milestone` field
   - Custom Fields → Tasks: via `relid` and `fieldto="tasks"`
   - Checklist → Tasks: via `taskid`

4. **Error Handling**: Check for GraphQL errors in response before proceeding to next step.

## Project-Specific Behaviors

- When importing templates, always validate the markdown structure first
- Generate human-readable progress updates during import
- If client ID not specified, ask before defaulting to 28
- Escape special characters in text fields (quotes, newlines)
- Provide rollback instructions if import fails partway