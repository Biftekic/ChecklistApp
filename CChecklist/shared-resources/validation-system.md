# Template Validation System

## Overview

This validation system ensures all cleaning templates meet formatting standards, include required sections, and maintain consistency across different cleaning types. Use this guide to validate templates before finalization.

## Validation Rules

### 1. Document Structure Validation

#### Required Sections (In Order)
1. **Title Header** 
   - Format: `# Professional [Type] Cleaning Template - [Specification]`
   - Must include cleaning type and size/specification
   - ✓ Valid: `# Professional Office Cleaning Template - 10,000 sq ft`
   - ✗ Invalid: `# Cleaning Template`

2. **Master Supply List**
   - Must have three subsections:
     - `## Chemicals Needed` (with categories)
     - `## Tools & Equipment` (with categories)
     - `## Amenities to Restock` (if applicable)

3. **Cleaning Sequence & Timing**
   - Must include total time estimate
   - Room-by-room breakdown required
   - Each room must have time range

4. **Room Sections**
   - Each room must follow hierarchy
   - Tasks must be properly formatted

5. **Final Quality Check**
   - Must be last cleaning section
   - Include comprehensive checklist

6. **Reference Sections**
   - Quality Standards Reference
   - Time Standards
   - Chemical Reference Guide

### 2. Formatting Validation

#### Markdown Hierarchy Rules
```
✓ CORRECT:
# Document Title (one only)
## Major Sections
### ROOM NAME (time)
#### TASK: Task Name

✗ INCORRECT:
### Document Title
# Multiple Title Headers
## room name (lowercase)
### Task without TASK: prefix
```

#### Room Format Requirements
- **Format**: `### ROOM NAME (XX-XX minutes)`
- **Rules**:
  - Room name MUST be in ALL CAPS
  - Time MUST be in parentheses
  - Time MUST be a range (XX-XX format)
  - No decimal minutes

**Valid Examples**:
- `### KITCHEN (45-60 minutes)`
- `### MASTER BATHROOM (35-45 minutes)`
- `### LOBBY (20-30 minutes)`

**Invalid Examples**:
- `### Kitchen (45-60 minutes)` ❌ (not caps)
- `### KITCHEN - 45 minutes` ❌ (wrong format)
- `### KITCHEN (45 min)` ❌ (missing range)
- `### KITCHEN` ❌ (missing time)

### 3. Task Structure Validation

#### Required Task Elements
Every task MUST include ALL of these subsections in order:

```markdown
#### TASK: [Task Name] [FREQUENCY if recurring]
**Time: XX-XX minutes**

**Cleaning Steps:**
1. [Numbered step]
2. [Numbered step]
[Continue with numbers]

**Chemicals:** [Chemical list]

**Tools:** [Tool list]

**Safety:** [Safety note]

**Cleaning Standards:** [Standards description]

**Detailed Checklist:**
- [ ] [Checklist item]
- [ ] [Checklist item]
```

#### Task Validation Rules
1. **Task Title**: Must start with `#### TASK:`
2. **Time**: Must be a range in minutes
3. **Steps**: Must be numbered list (1. 2. 3.)
4. **Checklist**: Must use `- [ ]` format

### 4. Content Validation

#### Chemical References
- All chemicals must exist in `chemical-guide.md`
- PPM levels must be specified for sanitizers
- pH levels included for critical chemicals
- Never mix incompatible chemicals

#### Time Estimates
- Room times must sum to ±10% of total
- Task times must sum to room time
- Include buffer for recurring tasks
- Account for setup/breakdown

#### Safety Requirements
- PPE specified for each chemical
- Special precautions noted
- Industry-specific requirements included

### 5. Industry-Specific Validation

#### Medical/Healthcare
- [ ] Infection control protocols present
- [ ] PPE requirements by area
- [ ] Terminal cleaning procedures
- [ ] Contact times specified
- [ ] Biohazard handling included

#### Restaurant/Food Service
- [ ] Food safety protocols prominent
- [ ] Sanitizer PPM levels specified
- [ ] Grease management included
- [ ] Temperature monitoring steps
- [ ] Health code references

#### Educational
- [ ] Child safety measures
- [ ] Green cleaning emphasized
- [ ] After-hours scheduling
- [ ] Age-appropriate methods
- [ ] Special area procedures

### 6. Quality Checklist Validation

Final quality check must include:
- [ ] Visual inspection points
- [ ] All rooms covered
- [ ] Safety verification
- [ ] Supply check
- [ ] Documentation complete

## Validation Process

### Step 1: Structure Check
```
1. Count # symbols - only one # allowed
2. Verify section order
3. Check all required sections present
4. Confirm hierarchy levels correct
```

### Step 2: Format Check
```
1. All room names in CAPS
2. All times in (XX-XX minutes) format
3. All tasks start with #### TASK:
4. All checklists use - [ ] format
```

### Step 3: Content Check
```
1. Chemicals exist in guide
2. Times are realistic
3. Safety measures adequate
4. Industry requirements met
```

### Step 4: Completeness Check
```
1. No missing subsections in tasks
2. All rooms have tasks
3. Quality check comprehensive
4. References complete
```

## Common Validation Errors

### Formatting Errors
1. **Mixed Case Rooms**: "Kitchen" instead of "KITCHEN"
2. **Missing Time Ranges**: "(45 minutes)" instead of "(45-60 minutes)"
3. **Wrong Task Format**: "### Clean Surfaces" instead of "#### TASK: Clean Surfaces"
4. **Incorrect Checklist**: "- Clean sink" instead of "- [ ] Clean sink"

### Content Errors
1. **Missing Chemicals**: Tools listed but no chemicals
2. **Unrealistic Times**: 5 minutes for entire bathroom
3. **Missing Safety**: No PPE mentioned for harsh chemicals
4. **Generic Standards**: "Clean thoroughly" vs specific criteria

### Structure Errors
1. **Out of Order**: Quality check before room sections
2. **Missing Sections**: No supply list or references
3. **Duplicate Headers**: Multiple # headers
4. **Nested Errors**: Wrong hierarchy levels

## Validation Tools

### Quick Validation Checklist
Print and use while reviewing templates:

```
STRUCTURE VALIDATION
□ Single # header
□ All required sections present
□ Correct section order
□ Proper hierarchy throughout

FORMAT VALIDATION  
□ Room names in ALL CAPS
□ Times in (XX-XX minutes)
□ Tasks start with #### TASK:
□ Checklists use - [ ]

CONTENT VALIDATION
□ Chemicals in guide
□ Realistic time estimates
□ Safety measures included
□ Industry requirements met

COMPLETENESS
□ All task subsections
□ All rooms covered
□ Quality check complete
□ References included
```

### Validation Report Template

```
TEMPLATE VALIDATION REPORT
========================
Template: [Name]
Date: [Date]
Validator: [Name]

PASS/FAIL: [Status]

Issues Found:
1. [Issue description] - [Location]
2. [Issue description] - [Location]

Corrections Needed:
1. [Required fix]
2. [Required fix]

Notes:
[Additional observations]
```

## Automated Validation Rules

For future automation, templates must pass these regex checks:

1. **Title Check**: `^# Professional .+ Cleaning Template - .+$`
2. **Room Check**: `^### [A-Z\s]+ \(\d+-\d+ minutes\)$`
3. **Task Check**: `^#### TASK: .+$`
4. **Checklist Check**: `^- \[ \] .+$`
5. **Time Format**: `\d+-\d+ minutes`

## Validation Frequency

- **Initial Creation**: Full validation
- **Module Updates**: Re-validate affected templates
- **Quarterly Review**: Spot-check all templates
- **Client Customization**: Validate changes only
- **Major Updates**: Full re-validation

---

*Version 1.0 - Integrated with CChecklist template system*