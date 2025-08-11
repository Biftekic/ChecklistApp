# CLAUDE Module: Interactive Template Generator

## Module Overview

This module enables interactive, question-based template generation through simple Q&A format. It works alongside other modules to create customized cleaning templates through user-friendly conversations.

## Implementation Architecture

### Integration Points

1. **Primary Integration**: Add to main `CLAUDE.md` as a special module
2. **Module Type**: Meta-module that uses other modules
3. **Activation**: Triggered by phrases like "I need [type] cleaning" or "Create cleaning template"

## Interactive Flow Structure

### Step 1: Initial Recognition
When user says "I need office cleaning" or similar:
```markdown
I'll help you create a customized office cleaning template. I'll ask you a series of simple questions. Most will be yes/no or short answers.

Ready to start? (yes/no)
```

### Step 2: Progressive Questioning
Questions are asked one at a time, building on previous answers.

## Question Templates

### Facility Type Questions
```markdown
Q1: You need OFFICE cleaning, correct? (yes/no)
[If no, show menu of options]
```

### Size Questions
```markdown
Q2: What is the total area in square meters?
Answer: ___ m²
```

### Room Inventory
```markdown
Q3: How many of each room type do you have?
- Standard offices: ___
- Meeting rooms: ___
- Restrooms: ___
[Continue list based on facility type]
```

## Data Collection Format

### Internal Data Structure
```yaml
template_generation:
  session_id: [unique]
  facility_type: [type]
  responses:
    q1_facility_confirm: yes
    q2_total_area: 350
    q3_floors: 2
    q4_floor_breakdown: 
      floor_1: 175
      floor_2: 175
    [continues...]
```

## Integration with Existing Modules

### Module Selection Logic
```python
if facility_type == "office":
    load_module("CLAUDE-office.md")
elif facility_type == "medical":
    load_module("CLAUDE-medical.md")
# etc...
```

### Resource Integration
- Pull chemicals from `chemical-guide.md`
- Apply routes from `route-optimization.md`
- Validate with `validation-system.md`
- Use components from `base-components.md`

## Question Bank

### Universal Questions (All Facility Types)
1. Facility confirmation
2. Total area
3. Number of floors
4. Room inventory
5. Cleaning frequency
6. Service timing
7. Occupancy status
8. Special requirements

### Type-Specific Questions

#### Office-Specific
- Conference room technology?
- Executive offices?
- Sensitive documents?
- IT/Server rooms?

#### Medical-Specific  
- Patient rooms vs clinical?
- Isolation rooms?
- Operating rooms?
- Biohazard handling?

#### Restaurant-Specific
- Kitchen size?
- Dining capacity?
- Bar area?
- Outdoor seating?

## Response Processing

### Time Calculation Matrix
```yaml
base_times:
  office:
    small: 15  # minutes
    medium: 20
    large: 25
  restroom:
    single: 15
    multi: 25
  kitchen:
    small: 25
    large: 50
```

### Modifiers
```yaml
frequency_modifiers:
  daily: 0.7
  weekly: 1.0
  monthly: 1.5
  
occupancy_modifiers:
  empty: 1.0
  occupied: 1.3
```

## Output Generation

### Template Assembly Process
1. Load base template structure
2. Insert facility-specific data
3. Calculate all timings
4. Add only relevant rooms
5. Include special requirements
6. Apply validation checks

## Usage Instructions

### For Claude/AI Assistant

When user requests cleaning template:

1. **Recognize Intent**
   - "I need cleaning"
   - "Create template"
   - "Office cleaning help"

2. **Start Interactive Mode**
   ```markdown
   I'll help you create a customized [TYPE] cleaning template. 
   I'll ask simple questions - mostly yes/no or numbers.
   
   Let's start:
   ```

3. **Ask Questions Sequentially**
   - One question at a time
   - Wait for response
   - Validate input
   - Ask follow-up if needed

4. **Process Responses**
   - Store in structured format
   - Calculate derived values
   - Build template sections

5. **Generate Template**
   - Use appropriate modules
   - Apply all customizations
   - Format properly
   - Validate output

## Photo Processing Guidelines

When user provides photos:

1. **Analyze for:**
   - Room types and layouts
   - Approximate sizes
   - Floor types
   - Special equipment
   - Soil levels
   - Access challenges

2. **Extract Information:**
   - Number of workstations
   - Type of flooring
   - Kitchen equipment
   - Restroom fixtures
   - Special features

3. **Apply to Template:**
   - Adjust time estimates
   - Add specific tasks
   - Note special requirements
   - Include in final output

## Error Handling

### Invalid Responses
```markdown
I didn't understand that response. 
Please answer with [expected format].
For example: [example]
```

### Missing Information
```markdown
This information is important for accurate timing.
Would you like to:
1. Provide an estimate
2. Skip this section
3. Use standard defaults
```

## Progress Tracking

### Session State
- Current question number
- Completed sections
- Remaining questions
- Estimated completion time

### Progress Messages
```markdown
Great! We're 50% complete.
Just 10 more quick questions...
```

## Final Output Options

### Template Formats
1. **Full Detail** - Complete template with all sections
2. **Checklist Only** - Simple checklist format
3. **Time Summary** - Focus on timing and sequence
4. **Custom Export** - Specific sections only

### Delivery Methods
- Display in chat
- Generate downloadable file
- Email-ready format
- Print-optimized version

---

*This module enables user-friendly template creation through guided conversation rather than complex forms.*