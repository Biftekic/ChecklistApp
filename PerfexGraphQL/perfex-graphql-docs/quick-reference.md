# Perfex CRM GraphQL API - Quick Reference

## Connection Details
- **Endpoint**: `https://uredno.com/graphql`
- **Method**: POST
- **Auth Header**: `authtoken: YOUR_TOKEN`
- **Content-Type**: `application/json`

## Basic Query Structure
```json
{
  "query": "{ tableName { field1 field2 } }"
}
```

## Common Tables

| Entity | Table Name | Key Fields |
|--------|------------|------------|
| Projects | `tblprojects` | id, name, status, clientid |
| Tasks | `tbltasks` | id, name, priority, status, rel_id |
| Milestones | `tblmilestones` | id, name, project_id, due_date |
| Clients | `tblclients` | userid, company, email |
| Staff | `tblstaff` | staffid, email, firstname, lastname |
| Invoices | `tblinvoices` | id, number, clientid, total |
| Custom Fields | `tblcustomfields` | id, name, fieldto, type |
| Custom Values | `tblcustomfieldsvalues` | relid, fieldid, value |
| Task Checklist | `tbltask_checklist_items` | id, taskid, description, finished |
| Checklist Templates | `tbltasks_checklist_templates` | id, description |

## Mutations

### Create Operations
| Entity | Mutation | Required Fields |
|--------|----------|-----------------|
| Project | `addTblprojects` | name, clientid, status |
| Task | `addTbltasks` | name, rel_id, rel_type |
| Milestone | `addTblmilestones` | name, project_id |
| Checklist | `addTbltask_checklist_items` | taskid, description |
| Custom Value | `addTblcustomfieldsvalues` | relid, fieldid, value, fieldto |

### Update Operations
| Entity | Mutation | Required Fields |
|--------|----------|-----------------|
| Project | `updateTblprojects` | id + fields to update |
| Task | `updateTbltasks` | id + fields to update |
| Milestone | `updateTblmilestones` | id + fields to update |
| Checklist | `updateTbltask_checklist_items` | id + fields to update |
| Custom Value | `updateTblcustomfieldsvalues` | id + fields to update |

### Delete Operations
| Entity | Mutation | Required Fields |
|--------|----------|-----------------|
| Project | `deleteTblprojects` | id |
| Task | `deleteTbltasks` | id |
| Milestone | `deleteTblmilestones` | id |
| Checklist | `deleteTbltask_checklist_items` | id |
| Custom Value | `deleteTblcustomfieldsvalues` | id |

## Quick Examples

### Create a project
```bash
curl -X POST https://uredno.com/graphql \
  -H "Content-Type: application/json" \
  -H "authtoken: YOUR_TOKEN" \
  -d '{"query":"mutation { addTblprojects(name: \"New Project\", clientid: \"28\", status: \"2\") { id name } }"}'
```

### Get all projects
```bash
curl -X POST https://uredno.com/graphql \
  -H "Content-Type: application/json" \
  -H "authtoken: YOUR_TOKEN" \
  -d '{"query":"{ tblprojects { id name status } }"}'
```

### Get tasks with custom fields
```graphql
{
  tbltasks {
    id
    name
    priority
  }
  tblcustomfieldsvalues(where: {fieldto: "tasks"}) {
    relid
    fieldid
    value
  }
}
```

### Get milestones for project
```graphql
{
  tblmilestones(where: {project_id: "1"}) {
    id
    name
    due_date
  }
}
```

## Custom Fields for Tasks (Your System)

| Field | ID | Type | Purpose |
|-------|-----|------|---------|
| Time Estimate | 16 | number | Estimated time for task |
| Completion Notes | 18 | textarea | Notes from cleaner |
| Cleaning Steps | 20 | textarea | Step-by-step instructions |
| Chemicals | 21 | textarea | Required chemicals |
| Tools | 22 | textarea | Required tools |
| Safety Notes | 23 | textarea | Safety considerations |
| Quality Standards | 24 | textarea | Quality requirements |

## Response Format
```json
{
  "data": {
    "tableName": [
      {
        "field1": "value1",
        "field2": "value2"
      }
    ]
  }
}
```

## Error Format
```json
{
  "errors": [{
    "message": "Error description",
    "locations": [{"line": 1, "column": 3}]
  }]
}
```