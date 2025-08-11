# Interactive Template Generator - Quick Start Guide

## How It Works

### For Users
Simply say: **"I need office cleaning"** (or any cleaning type)

The system will:
1. Confirm the cleaning type
2. Ask simple questions (mostly yes/no or numbers)
3. Build a customized template
4. All measurements in metric (m², meters)
5. All time in hours/minutes

### For Claude/AI Implementation

## Step 1: Recognition
When user says any of these:
- "I need [type] cleaning"
- "Create cleaning template"
- "Help with cleaning checklist"
- "Cleaning template for my office"

**Action**: Load `./claude-modules/CLAUDE-interactive.md`

## Step 2: Start Interactive Mode
```markdown
I'll help you create a customized [TYPE] cleaning template. 
I'll ask you simple questions - mostly yes/no or short numbers.
All measurements will be in square meters (m²) and time in hours/minutes.

Ready to start? (yes/no)
```

## Step 3: Question Flow

### Core Questions Sequence:
1. **Confirm type**: "You need OFFICE cleaning, correct?"
2. **Size**: "Total area in square meters?"
3. **Floors**: "How many floors?"
4. **Rooms**: "How many offices/meeting rooms/restrooms?"
5. **Frequency**: "How often? (daily/weekly/monthly)"
6. **Timing**: "When? (business hours/after hours)"

### Example Interaction:
```
User: I need office cleaning

Claude: I'll help you create a customized office cleaning template.
I'll ask you simple questions - mostly yes/no or short numbers.

Ready to start? (yes/no)

User: yes

Claude: Great! You need OFFICE cleaning, correct? (yes/no)

User: yes

Claude: What is the total area in square meters?

User: 350

Claude: How many floors?

User: 2

[Continue through all questions...]
```

## Step 4: Data Storage
Store responses in structured format:
```yaml
responses:
  type: office
  area: 350
  floors: 2
  offices: 11
  meeting_rooms: 1
  restrooms: 2
  frequency: weekly
  timing: after_hours
```

## Step 5: Generate Template
1. Load appropriate industry module
2. Apply all collected parameters
3. Calculate times based on inputs
4. Generate customized template

## Photo Handling
If user mentions photos:
```markdown
Claude: Do you have photos to share? (yes/no)

User: yes

Claude: Great! Please upload photos of:
- Main areas needing cleaning
- Any problem areas
- Special equipment or features

I'll analyze them to customize your template better.
```

## Key Features

### Question Types
- **Yes/No**: Most questions
- **Numbers**: Areas, counts, times
- **Multiple Choice**: 1-5 options max
- **Short Text**: Only when necessary

### Smart Skipping
- Skip irrelevant questions
- Group related items
- Adjust based on facility type

### Time Calculations
```
Office (15-20 min) × Frequency modifier × Size modifier
Weekly = 1.0, Daily = 0.7, Monthly = 1.5
Small = 0.9, Medium = 1.0, Large = 1.1
```

### Validation
- Check numeric inputs are reasonable
- Confirm critical information
- Allow corrections

## Quick Implementation Test

Try this flow:
```
User: "I need office cleaning"
[Run through interactive questions]
[Generate template]
[Ask if adjustments needed]
```

## Benefits
- ✅ No cleaning knowledge required
- ✅ Gets all needed information
- ✅ Creates professional template
- ✅ Takes only 10-15 minutes
- ✅ Fully customized output

---

*This system makes professional template creation accessible to anyone through simple conversation.*