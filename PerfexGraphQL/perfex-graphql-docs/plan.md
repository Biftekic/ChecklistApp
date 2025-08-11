# Perfex CRM Cleaning Checklist Import Plan

## Overview
This document outlines the plan for importing cleaning checklists (like the Airbnb cleaning template) into Perfex CRM using GraphQL API. The system will maintain all relationships and structure from the source document.

## Data Mapping Structure

### 1. Hierarchy Mapping
```
Markdown Document          →  Perfex CRM
================             ==========
# Title (H1)              →  Project
### Room/Area (H3)        →  Milestone  
#### TASK: Name (H4)      →  Task
Task Metadata             →  Custom Fields
- [ ] Checklist items     →  Task Checklist Items
```

### 2. Detailed Field Mapping

#### Project Level
- **Source**: Main title (H1) of the document
- **Target**: `tblprojects`
- **Fields**:
  - `name`: Document title
  - `description`: "Cleaning checklist template"
  - `status`: "2" (Active)
  - `clientid`: Assign to template client or specific client

#### Milestone Level  
- **Source**: Room/area sections (H3 headings with timing)
- **Target**: `tblmilestones`
- **Fields**:
  - `name`: Room name (e.g., "BEDROOM", "KITCHEN")
  - `description`: Extracted timing (e.g., "35-45 minutes")
  - `project_id`: Link to created project
  - `milestone_order`: Sequential based on document order
  - `due_date`: Calculate based on total time

#### Task Level
- **Source**: Task sections (H4 headings starting with "TASK:")
- **Target**: `tbltasks`
- **Fields**:
  - `name`: Task name after "TASK:"
  - `description`: Task overview if provided
  - `rel_id`: Project ID
  - `rel_type`: "project"
  - `milestone`: Milestone ID of parent room
  - `milestone_order`: Sequential within milestone
  - `priority`: "2" (Normal)
  - `status`: "1" (Not Started)

#### Custom Fields Mapping
- **Time Estimate** (Field ID: 16)
  - Source: `**Time:** X minutes`
  - Extract: Numeric value only
  
- **Cleaning Steps** (Field ID: 20)
  - Source: `**Cleaning Steps:**` section
  - Format: Numbered list as multi-line text
  
- **Chemicals** (Field ID: 21)
  - Source: `**Chemicals:**` section
  - Format: Comma-separated list
  
- **Tools** (Field ID: 22)
  - Source: `**Tools:**` section
  - Format: Comma-separated list
  
- **Safety Notes** (Field ID: 23)
  - Source: `**Safety:**` section
  - Format: Complete text
  
- **Quality Standards** (Field ID: 24)
  - Source: `**Cleaning Standards:**` section
  - Format: Complete text

#### Checklist Items
- **Source**: Items under `**Detailed Checklist:**`
- **Target**: `tbltask_checklist_items`
- **Fields**:
  - `taskid`: Parent task ID
  - `description`: Checklist item text (without "- [ ]")
  - `finished`: "0" (Not completed)
  - `list_order`: Sequential order
  - `assigned`: Can be left empty

## Import Process Flow

### Phase 1: Document Parsing
1. **Read markdown file**
2. **Extract structure**:
   ```javascript
   {
     title: "Professional Airbnb Cleaning Template...",
     milestones: [
       {
         name: "BEDROOM",
         time: "35-45 minutes",
         tasks: [
           {
             name: "Strip Beds and Start Laundry",
             time: "10-15 minutes",
             cleaningSteps: ["Strip all beds...", "Check for stains..."],
             chemicals: "Stain pre-treatment spray",
             tools: "Laundry basket, washing machine",
             safety: "Wear gloves when handling soiled linens",
             standards: "Mattress free of stains...",
             checklist: [
               "All bedding removed...",
               "Stains pre-treated...",
               // ...
             ]
           }
         ]
       }
     ]
   }
   ```

### Phase 2: GraphQL Mutation Generation

#### 2.1 Create Project
```graphql
mutation {
  addTblprojects(
    name: "Professional Airbnb Cleaning Template - 1-2 Bedroom Apartment"
    description: "Cleaning checklist template"
    status: "2"
    clientid: "28"
  ) {
    id
    name
  }
}
```

#### 2.2 Create Milestones
```graphql
mutation {
  addTblmilestones(
    name: "BEDROOM"
    description: "35-45 minutes"
    project_id: "${projectId}"
    milestone_order: "1"
    due_date: "${calculatedDate}"
  ) {
    id
    name
  }
}
```

#### 2.3 Create Tasks
```graphql
mutation {
  addTbltasks(
    name: "Strip Beds and Start Laundry"
    rel_id: "${projectId}"
    rel_type: "project"
    milestone: "${milestoneId}"
    milestone_order: "1"
    status: "1"
    priority: "2"
  ) {
    id
    name
  }
}
```

#### 2.4 Add Custom Field Values
```graphql
mutation {
  addTblcustomfieldsvalues(
    relid: "${taskId}"
    fieldid: "16"
    value: "10"
    fieldto: "tasks"
  ) {
    id
    value
  }
}
```

#### 2.5 Create Checklist Items
```graphql
mutation {
  addTbltask_checklist_items(
    taskid: "${taskId}"
    description: "All bedding removed - sheets, pillowcases, duvet covers"
    finished: "0"
    list_order: "1"
  ) {
    id
    description
  }
}
```

## Implementation Script Structure

### 1. Parser Module (`parser.js`)
```javascript
class CleaningChecklistParser {
  parseMarkdown(content) {
    // Extract title
    // Parse milestones (H3 sections)
    // Parse tasks (H4 sections)
    // Extract task metadata
    // Extract checklist items
    return structuredData;
  }
}
```

### 2. GraphQL Client (`graphql-client.js`)
```javascript
class PerfexGraphQLClient {
  constructor(endpoint, authToken) {
    this.endpoint = endpoint;
    this.authToken = authToken;
  }
  
  async executeQuery(query) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authtoken': this.authToken
      },
      body: JSON.stringify({ query })
    });
    return response.json();
  }
  
  async createProject(data) {
    const query = `
      mutation {
        addTblprojects(
          name: "${data.name}"
          description: "${data.description}"
          status: "${data.status}"
          clientid: "${data.clientid}"
        ) {
          id
          name
        }
      }
    `;
    return this.executeQuery(query);
  }
  
  async createMilestone(data) {
    const query = `
      mutation {
        addTblmilestones(
          name: "${data.name}"
          description: "${data.description}"
          project_id: "${data.project_id}"
          milestone_order: "${data.milestone_order}"
          due_date: "${data.due_date}"
        ) {
          id
          name
        }
      }
    `;
    return this.executeQuery(query);
  }
  
  async createTask(data) {
    const query = `
      mutation {
        addTbltasks(
          name: "${data.name}"
          description: "${data.description}"
          rel_id: "${data.rel_id}"
          rel_type: "${data.rel_type}"
          milestone: "${data.milestone}"
          status: "${data.status}"
          priority: "${data.priority}"
        ) {
          id
          name
        }
      }
    `;
    return this.executeQuery(query);
  }
  
  async createCustomFieldValue(data) {
    const query = `
      mutation {
        addTblcustomfieldsvalues(
          relid: "${data.relid}"
          fieldid: "${data.fieldid}"
          value: "${data.value}"
          fieldto: "${data.fieldto}"
        ) {
          id
        }
      }
    `;
    return this.executeQuery(query);
  }
  
  async createChecklistItem(data) {
    const query = `
      mutation {
        addTbltask_checklist_items(
          taskid: "${data.taskid}"
          description: "${data.description}"
          finished: "${data.finished}"
          list_order: "${data.list_order}"
        ) {
          id
        }
      }
    `;
    return this.executeQuery(query);
  }
}
```

### 3. Import Orchestrator (`import.js`)
```javascript
class ChecklistImporter {
  async importChecklist(markdownFile) {
    // 1. Parse markdown
    // 2. Create project
    // 3. Create milestones
    // 4. Create tasks with relationships
    // 5. Add custom field values
    // 6. Create checklist items
    // 7. Verify import
  }
}
```

## Error Handling & Validation

### Pre-Import Validation
1. Verify markdown structure matches expected format
2. Check for required custom fields in Perfex
3. Validate client exists
4. Ensure no duplicate project names

### Import Error Handling
1. Transaction-like approach (rollback on failure)
2. Log all created entity IDs
3. Retry mechanism for network failures
4. Detailed error reporting

### Post-Import Validation
1. Verify all relationships are correct
2. Check task counts match source
3. Validate checklist item counts
4. Generate import report

## Usage Instructions

### For End Users
1. Prepare markdown file following the template structure
2. Run import command:
   ```bash
   node import-checklist.js --file airbnb-cleaning.md --client 28
   ```
3. Review import report
4. Verify in Perfex CRM

### Template Requirements
- Use exact heading structure (H1, H3, H4)
- Mark tasks with "TASK:" prefix
- Use bold markers for metadata sections
- Include "Detailed Checklist:" section
- Use `- [ ]` format for checklist items

## Future Enhancements

### Version 2.0
1. Support for multiple templates in one file
2. Template library management
3. Custom field mapping configuration
4. Bulk import capabilities
5. Update existing checklists

### Version 3.0
1. GUI interface for imports
2. Template builder/editor
3. Export from Perfex to markdown
4. Version control for templates
5. Multi-language support

## Testing Strategy

### Unit Tests
- Markdown parser accuracy
- GraphQL mutation builders
- Field extraction logic

### Integration Tests
- Full import flow
- Relationship verification
- Error recovery

### End-to-End Tests
- Complete template import
- Data integrity checks
- Performance benchmarks

## Maintenance

### Regular Tasks
1. Update field IDs if Perfex schema changes
2. Adjust parser for new template formats
3. Monitor API performance
4. Update documentation

### Monitoring
1. Track import success rates
2. Log common errors
3. Monitor import times
4. User feedback collection