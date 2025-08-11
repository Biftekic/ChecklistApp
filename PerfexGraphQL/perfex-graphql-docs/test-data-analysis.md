# Perfex CRM Test Data Analysis & Relationships

## Overview
This document analyzes the test data created in Perfex CRM and shows how all entities are connected through the GraphQL API.

## Test Data Summary

### 1. Project: Test01
- **ID**: 50
- **Name**: Test01
- **Status**: 2 (Active/In Progress)
- **Client**: TEMPLATE (clientid: 28)

### 2. Task: test task
- **ID**: 1128
- **Name**: test task
- **Status**: 1 (Not Started)
- **Priority**: 2 (Medium)
- **Related to**: Project 50 (rel_type: "project", rel_id: "50")
- **Milestone**: 88 (test room)
- **Milestone Order**: 0
- **Date Added**: 2025-07-02 17:50:35
- **Start Date**: 2025-07-02
- **Due Date**: null

### 3. Milestone: test room
- **ID**: 88
- **Name**: test room
- **Description**: test room 30min
- **Due Date**: 2025-07-02
- **Project**: 50
- **Milestone Order**: 1

### 4. Checklist Item: test checklist item
- **ID**: 33
- **Task ID**: 1128
- **Description**: test checklist item
- **Finished**: 0 (Not completed)
- **List Order**: 1

## Entity Relationships

```
Project (Test01, ID: 50)
│
├── Client (TEMPLATE, ID: 28)
│
├── Task (test task, ID: 1128) → Linked to Milestone 88
│   │
│   ├── Checklist Item (test checklist item, ID: 33)
│   │
│   └── Custom Fields:
│       ├── Time Estimate: 30 minutes
│       ├── Cleaning Steps: "1. test step"
│       ├── Chemicals: "1 test chemical"
│       ├── Tools: "axe"
│       ├── Safety Notes: "careful"
│       └── Quality Standards: "pristine"
│
├── Milestone (test room, ID: 88)
│
└── Project Custom Fields:
    ├── Service Type: "Standard Residential Clean"
    ├── Property Size/Details: 100
    ├── Required Equipment/Supplies: "axe"
    ├── Difficulty: "Average"
    ├── Expectations: "Demanding"
    └── Challenges: "Hard"
```

## Custom Fields Analysis

### Project Custom Fields (Project ID: 50)
| Field Name | Field ID | Value |
|------------|----------|-------|
| Service Type | 9 | Standard Residential Clean |
| Property Size/Details | 10 | 100 |
| Required Equipment/Supplies | 11 | axe |
| Difficulty | 25 | Average |
| Expectations | 26 | Demanding |
| Challenges | 27 | Hard |

### Task Custom Fields (Task ID: 1128)
| Field Name | Field ID | Value |
|------------|----------|-------|
| Time Estimate | 16 | 30 |
| Cleaning steps | 20 | 1. test step |
| Chemicals | 21 | 1 test chemical |
| Tools | 22 | axe |
| Safety notes | 23 | careful |
| Quality standards | 24 | pristine |

## GraphQL Queries to Retrieve Connected Data

### 1. Get Complete Project Information
```graphql
{
  # Project Details
  project: tblprojects(where: {id: "50"}) {
    id
    name
    status
    clientid
  }
  
  # Associated Tasks
  tasks: tbltasks(where: {rel_id: "50", rel_type: "project"}) {
    id
    name
    status
    priority
  }
  
  # Project Milestones
  milestones: tblmilestones(where: {project_id: "50"}) {
    id
    name
    due_date
    milestone_order
  }
  
  # Project Custom Fields
  projectCustomFields: tblcustomfieldsvalues(where: {relid: "50", fieldto: "projects"}) {
    fieldid
    value
  }
}
```

### 2. Get Task with All Related Data
```graphql
{
  # Task Details
  task: tbltasks(where: {id: "1128"}) {
    id
    name
    rel_id
    rel_type
    milestone
    milestone_order
    status
    priority
  }
  
  # Task Checklist Items
  checklist: tbltask_checklist_items(where: {taskid: "1128"}) {
    id
    description
    finished
    list_order
  }
  
  # Task Custom Fields
  taskCustomFields: tblcustomfieldsvalues(where: {relid: "1128", fieldto: "tasks"}) {
    fieldid
    value
  }
}
```

### 3. Get All Data in One Query
```graphql
{
  # Project
  tblprojects {
    id
    name
    status
    clientid
  }
  
  # Tasks
  tbltasks {
    id
    name
    rel_id
    rel_type
    status
  }
  
  # Milestones
  tblmilestones {
    id
    name
    project_id
    due_date
  }
  
  # Checklist Items
  tbltask_checklist_items {
    id
    taskid
    description
    finished
  }
  
  # All Custom Field Values
  tblcustomfieldsvalues {
    relid
    fieldid
    value
    fieldto
  }
}
```

## Key Relationships

1. **Project → Client**: Projects are linked to clients via `clientid` field
2. **Project → Tasks**: Tasks are linked to projects via `rel_id` and `rel_type` fields
3. **Project → Milestones**: Milestones are linked to projects via `project_id` field
4. **Task → Milestone**: Tasks are linked to milestones via `milestone` field (contains milestone ID)
5. **Task → Checklist**: Checklist items are linked to tasks via `taskid` field
6. **Entities → Custom Fields**: Custom field values are linked via `relid` and `fieldto` fields

## Data Flow for Cleaning Service

Based on your test data, here's how a typical cleaning service workflow would use these relationships:

1. **Project Creation** (Test01)
   - Linked to client (TEMPLATE)
   - Service type defined (Standard Residential Clean)
   - Property details captured (100 sq units)
   - Difficulty and expectations set

2. **Milestone Setup** (test room)
   - Defines phases of the cleaning project
   - Has due dates for scheduling

3. **Task Assignment** (test task)
   - Linked to the project
   - Has estimated time (30 minutes)
   - Includes detailed instructions:
     - Cleaning steps
     - Required chemicals
     - Tools needed
     - Safety considerations
     - Quality standards

4. **Checklist Management**
   - Each task can have multiple checklist items
   - Track completion status
   - Ensure nothing is missed

## How Tasks Connect to Milestones

Tasks connect to milestones through the `milestone` field in the `tbltasks` table:
- The `milestone` field contains the ID of the associated milestone
- In our test data: Task 1128 has `milestone: "88"` which links it to the "test room" milestone
- Tasks also have a `milestone_order` field to define their order within a milestone

### Example Query to Get Tasks by Milestone
```graphql
{
  # Get all tasks for a specific milestone
  tbltasks {
    id
    name
    milestone
    milestone_order
  }
  
  # Get milestone details
  tblmilestones {
    id
    name
    project_id
  }
}
```

## Notes on API Usage

- The GraphQL API doesn't support filtering with `where` clauses in the current implementation
- All data must be fetched and filtered client-side
- Table names use the "tbl" prefix
- Custom field values are stored separately from the main entities
- Relationships are maintained through ID references
- Task-to-milestone connection is direct via the `milestone` field (not through a junction table)