# Perfex CRM GraphQL API - Advanced Examples

## Authentication Setup

```bash
# Base configuration
ENDPOINT="https://uredno.com/graphql"
TOKEN="YOUR_API_TOKEN"
```

## Project Management Queries

### Get All Projects with Details
```graphql
{
  tblprojects {
    id
    name
    description
    status
    start_date
    deadline
    project_cost
    project_rate_per_hour
    estimated_hours
    progress
    progress_from_tasks
    deadline_notified
    addedfrom
    date_created
    date_finished
    clientid
  }
}
```

### Get Projects with Associated Milestones
```graphql
{
  projects: tblprojects {
    id
    name
    status
  }
  
  milestones: tblmilestones {
    id
    name
    project_id
    due_date
    milestone_order
  }
}
```

## Task Queries

### Get Tasks with Custom Fields
```graphql
{
  tasks: tbltasks {
    id
    name
    description
    priority
    status
  }
  
  # Note: Filter custom fields client-side for fieldto: "tasks"
  taskCustomFields: tblcustomfieldsvalues {
    id
    relid
    fieldid
    value
    fieldto
  }
}
```

### Get Task Details for Cleaning Service
```graphql
{
  tbltasks {
    id
    name
    description
    priority
    status
    dateadded
    startdate
    duedate
    rel_id
    rel_type
  }
}
```

### Get Tasks with Checklist Items
```graphql
{
  tasks: tbltasks {
    id
    name
    status
  }
  
  checklistItems: tbltask_checklist_items {
    id
    taskid
    description
    finished
    finished_from
    dateadded
    list_order
    assigned
  }
}
```

### Get Checklist for Specific Task
```graphql
{
  tbltask_checklist_items(where: {taskid: "123"}) {
    id
    description
    finished
    finished_from
    list_order
    assigned
  }
}
```

### Get Checklist Templates
```graphql
{
  tbltasks_checklist_templates {
    id
    description
  }
}
```

## Milestone Queries

### Get Milestones by Project
```graphql
{
  tblmilestones(where: {project_id: "1"}) {
    id
    name
    description
    due_date
    milestone_order
    color
  }
}
```

### Get All Milestones Ordered
```graphql
{
  tblmilestones(orderBy: {milestone_order: ASC}) {
    id
    name
    project_id
    due_date
    milestone_order
  }
}
```

## Custom Fields Queries

### Get All Task Custom Fields
```graphql
{
  tblcustomfields(where: {fieldto: "tasks"}) {
    id
    name
    slug
    type
    options
    required
  }
}
```

### Get Custom Field Values for Specific Task
```graphql
{
  tblcustomfieldsvalues(where: {fieldto: "tasks", relid: "123"}) {
    fieldid
    value
  }
}
```

## Client Management

### Get Client Information
```graphql
{
  tblclients {
    userid
    company
    vat
    phonenumber
    country
    city
    zip
    state
    address
    website
    datecreated
    active
    leadid
  }
}
```

### Get Client Contacts
```graphql
{
  tblcontacts {
    id
    userid
    firstname
    lastname
    email
    phonenumber
    title
    datecreated
    password
    is_primary
    active
  }
}
```

## Staff Queries

### Get Staff Members
```graphql
{
  tblstaff {
    staffid
    email
    firstname
    lastname
    facebook
    linkedin
    phonenumber
    skype
    password
    datecreated
    profile_image
    last_ip
    last_login
    last_activity
    last_password_change
    new_pass_key
    new_pass_key_requested
    admin
    role
    active
    default_language
    direction
    media_path_slug
    is_not_staff
    hourly_rate
    two_factor_auth_enabled
    two_factor_auth_code
    two_factor_auth_code_requested
    email_signature
    google_auth_secret
  }
}
```

## Complex Relationship Queries

### Get Projects with Tasks and Milestones
```graphql
{
  projects: tblprojects {
    id
    name
    status
  }
  
  tasks: tbltasks {
    id
    name
    rel_id
    rel_type
    status
  }
  
  milestones: tblmilestones {
    id
    name
    project_id
    due_date
  }
}
```

### Get Complete Task Information with Custom Fields
```graphql
{
  tasks: tbltasks {
    id
    name
    description
    priority
    status
  }
  
  customFields: tblcustomfields(where: {fieldto: "tasks"}) {
    id
    name
    slug
    type
  }
  
  customValues: tblcustomfieldsvalues(where: {fieldto: "tasks"}) {
    relid
    fieldid
    value
  }
}
```

## Filtering and Sorting

### Filter Projects by Status
```graphql
{
  tblprojects(where: {status: "2"}) {
    id
    name
    deadline
  }
}
```

### Sort Tasks by Priority
```graphql
{
  tbltasks(orderBy: {priority: DESC, dateadded: DESC}) {
    id
    name
    priority
    dateadded
  }
}
```

## Pagination

### Paginated Results
```graphql
{
  tblprojects(limit: 10, offset: 0) {
    id
    name
    status
  }
}
```

## Using Variables

### Query with Variables
```graphql
query GetProject($projectId: ID!) {
  tblprojects(where: {id: $projectId}) {
    id
    name
    description
    status
  }
}
```

Variables:
```json
{
  "projectId": "1"
}
```

## Error Handling

When a field doesn't exist, you'll receive an error like:
```json
{
  "errors": [{
    "message": "Cannot query field \"projects\" on type \"Query\". Did you mean \"tblprojects\"?",
    "locations": [{"line": 1, "column": 3}]
  }]
}
```

## Best Practices

1. **Use Table Prefixes**: All tables start with "tbl" (e.g., `tblprojects`, not `projects`)
2. **Request Only What You Need**: GraphQL allows you to specify exact fields
3. **Batch Related Queries**: Combine multiple entity queries in a single request
4. **Handle Empty Results**: Check for empty arrays in responses
5. **Use Meaningful Aliases**: When querying multiple entities, use aliases for clarity

## Mutation Examples

### Creating a Complete Cleaning Project

```graphql
# 1. Create the project
mutation CreateCleaningProject {
  addTblprojects(
    name: "Airbnb Cleaning - 456 Oak Street"
    description: "Weekly cleaning service"
    status: "2"
    clientid: "28"
  ) {
    id
    name
  }
}

# 2. Create milestones for each room
mutation CreateBedroomMilestone {
  addTblmilestones(
    name: "BEDROOM"
    description: "35-45 minutes"
    project_id: "50"
    milestone_order: "1"
    due_date: "2025-01-20"
  ) {
    id
    name
  }
}

# 3. Create tasks for the milestone
mutation CreateBedroomTask {
  addTbltasks(
    name: "Strip Beds and Start Laundry"
    description: "Remove and wash all bedding"
    rel_id: "50"
    rel_type: "project"
    milestone: "88"
    status: "1"
    priority: "2"
  ) {
    id
    name
  }
}

# 4. Add custom field values for the task
mutation AddTaskTimeEstimate {
  addTblcustomfieldsvalues(
    relid: "1128"
    fieldid: "16"  # Time Estimate
    value: "15"
    fieldto: "tasks"
  ) {
    id
  }
}

mutation AddCleaningSteps {
  addTblcustomfieldsvalues(
    relid: "1128"
    fieldid: "20"  # Cleaning Steps
    value: "1. Strip all beds completely\n2. Check for stains\n3. Start washing machine"
    fieldto: "tasks"
  ) {
    id
  }
}

# 5. Add checklist items
mutation AddChecklistItems {
  item1: addTbltask_checklist_items(
    taskid: "1128"
    description: "All bedding removed"
    list_order: "1"
  ) {
    id
  }
  
  item2: addTbltask_checklist_items(
    taskid: "1128"
    description: "Stains pre-treated"
    list_order: "2"
  ) {
    id
  }
  
  item3: addTbltask_checklist_items(
    taskid: "1128"
    description: "Washing machine started"
    list_order: "3"
  ) {
    id
  }
}
```

### Updating Task Status

```graphql
# Mark task as in progress
mutation StartTask {
  updateTbltasks(
    id: "1128"
    status: "4"  # In Progress
    startdate: "2025-01-15 09:00:00"
  ) {
    id
    status
  }
}

# Complete a checklist item
mutation CompleteChecklistItem {
  updateTbltask_checklist_items(
    id: "33"
    finished: "1"
    finished_from: "5"  # Staff ID who completed it
  ) {
    id
    finished
  }
}

# Complete the task
mutation CompleteTask {
  updateTbltasks(
    id: "1128"
    status: "5"  # Completed
    datefinished: "2025-01-15 09:45:00"
  ) {
    id
    status
    datefinished
  }
}
```

### Batch Operations

```graphql
# Create multiple tasks at once
mutation CreateMultipleTasks {
  bedroom: addTbltasks(
    name: "Clean Master Bedroom"
    rel_id: "50"
    rel_type: "project"
    milestone: "88"
  ) {
    id
    name
  }
  
  bathroom: addTbltasks(
    name: "Clean Bathroom"
    rel_id: "50"
    rel_type: "project"
    milestone: "89"
  ) {
    id
    name
  }
  
  kitchen: addTbltasks(
    name: "Clean Kitchen"
    rel_id: "50"
    rel_type: "project"
    milestone: "90"
  ) {
    id
    name
  }
}
```

### Delete Operations

```graphql
# Delete a checklist item
mutation DeleteChecklistItem {
  deleteTbltask_checklist_items(id: "33") {
    id
  }
}

# Delete a task (be careful!)
mutation DeleteTask {
  deleteTbltasks(id: "1128") {
    id
  }
}

# Delete custom field value
mutation DeleteCustomFieldValue {
  deleteTblcustomfieldsvalues(id: "110") {
    id
  }
}
```

### Error Handling

When mutations fail, you'll receive error responses:

```json
{
  "errors": [{
    "message": "Field 'clientid' is required",
    "locations": [{"line": 3, "column": 5}]
  }]
}
```

## Common Use Cases

### Dashboard Data
```graphql
{
  activeProjects: tblprojects(where: {status: "2"}) {
    id
    name
    deadline
  }
  
  pendingTasks: tbltasks(where: {status: "1"}) {
    id
    name
    priority
    duedate
  }
  
  upcomingMilestones: tblmilestones(where: {due_date_gte: "2025-01-01"}) {
    id
    name
    due_date
    project_id
  }
}
```

### Project Overview
```graphql
{
  project: tblprojects(where: {id: "1"}) {
    id
    name
    description
    status
    progress
  }
  
  projectTasks: tbltasks(where: {rel_id: "1", rel_type: "project"}) {
    id
    name
    status
    priority
  }
  
  projectMilestones: tblmilestones(where: {project_id: "1"}) {
    id
    name
    due_date
    milestone_order
  }
}
```