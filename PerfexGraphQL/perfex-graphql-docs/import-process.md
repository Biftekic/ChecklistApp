# Cleaning Template Import Process

## Best Approach: Semi-Automated with Claude

Since you're already using Claude effectively, the most practical approach is to use Claude to process templates and generate the GraphQL mutations, rather than building a full automated script.

## Step-by-Step Process

### 1. Prepare Your Template
Ensure your cleaning template follows this structure:
```markdown
# [Property Type] Cleaning Template - [Property Details]

### ROOM NAME (time estimate)

#### TASK: Task Name
**Time:** X minutes
**Cleaning Steps:**
1. Step one
2. Step two

**Chemicals:** List of chemicals
**Tools:** List of tools
**Safety:** Safety notes
**Cleaning Standards:** Quality standards

**Detailed Checklist:**
- [ ] Checklist item 1
- [ ] Checklist item 2
```

### 2. Give Template to Claude

When you have a new template, simply tell Claude:
```
"Import this cleaning template into Perfex CRM. Use client ID 28 (or specify client)."
[Paste your template]
```

### 3. Claude Will Generate

Claude will:
1. Parse your template structure
2. Generate all necessary GraphQL mutations in order
3. Provide you with a complete import script
4. Include proper IDs and relationships

### 4. Execute the Mutations

You can then:
- Copy the mutations and run them via GraphQL playground
- Or use curl commands that Claude provides
- Or save as a script for future use

## Example Workflow

```bash
# 1. Claude generates this for you:

# Create Project
curl -X POST https://uredno.com/graphql \
  -H "Content-Type: application/json" \
  -H "authtoken: 1748040454" \
  -d '{"query":"mutation { addTblprojects(name: \"Studio Apartment Deep Clean\", clientid: \"28\", status: \"2\") { id } }"}'

# Save the returned project ID, then create milestones...
# Claude will provide the complete sequence
```

## Why This Approach Works Best

1. **Flexibility** - Each template might have unique elements
2. **No Maintenance** - No scripts to update when Perfex changes
3. **Immediate Results** - No development time needed
4. **Error Handling** - Claude can adapt if something fails
5. **Learning** - You see exactly what's happening

## Alternative: Full Automation Script

If you import templates very frequently (multiple times per day), we could create:
1. A Node.js script that parses markdown
2. Automatically generates and executes mutations
3. Handles errors and retries

But for occasional imports, using Claude is more practical.

## Quick Command for Claude

Save this in your notes for quick reference:
```
Import cleaning template to Perfex:
- Client: [ID or "TEMPLATE"]
- Status: Active
- Parse all rooms as milestones
- Parse all tasks with custom fields
- Generate executable mutations
```

## Custom Field Reference

| Field | ID | For |
|-------|-----|-----|
| Time Estimate | 16 | tasks |
| Cleaning Steps | 20 | tasks |
| Chemicals | 21 | tasks |
| Tools | 22 | tasks |
| Safety Notes | 23 | tasks |
| Quality Standards | 24 | tasks |