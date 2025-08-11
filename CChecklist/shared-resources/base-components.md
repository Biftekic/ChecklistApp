# Base Components Library

## Overview

This library contains reusable components and base templates to reduce redundancy across cleaning templates. Components can be inherited and customized for specific needs while maintaining consistency.

## Base Room Components

### Standard Room Base
```markdown
### [ROOM NAME] ([TIME] minutes)

#### TASK: Empty Trash & Replace Liners [DAILY]
**Time: 2-3 minutes**

**Cleaning Steps:**
1. Remove trash bag and tie securely
2. Clean inside of bin if needed
3. Install new liner
4. Return bin to proper location

**Chemicals:** Disinfectant spray (as needed)

**Tools:** Trash bags, gloves

**Safety:** Wear gloves when handling waste

**Cleaning Standards:** No debris in or around bin, fresh liner installed

**Detailed Checklist:**
- [ ] Trash removed and bin empty
- [ ] Bin interior clean and odor-free
- [ ] New liner properly installed
- [ ] Bin returned to correct position
```

### High-Touch Surface Component
```markdown
#### TASK: Disinfect High-Touch Surfaces [DAILY]
**Time: 3-5 minutes**

**Cleaning Steps:**
1. Spray disinfectant on all high-touch points
2. Allow proper contact time (check label)
3. Wipe with clean microfiber cloth
4. Pay attention to handles, switches, buttons

**Chemicals:** EPA-approved disinfectant

**Tools:** Microfiber cloths, spray bottle

**Safety:** Ensure proper ventilation

**Cleaning Standards:** All surfaces visibly clean, no streaks

**Detailed Checklist:**
- [ ] Door handles cleaned both sides
- [ ] Light switches disinfected
- [ ] [ROOM-SPECIFIC TOUCHES]
- [ ] Contact time observed
```

### Floor Cleaning Base
```markdown
#### TASK: Floor Cleaning
**Time: [ADJUST BY ROOM SIZE] minutes**

**Cleaning Steps:**
1. Remove debris and loose dirt
2. [FLOOR-TYPE SPECIFIC STEP]
3. [FLOOR-TYPE SPECIFIC STEP]
4. Ensure edges and corners are clean
5. Allow proper drying time

**Chemicals:** [FLOOR-TYPE SPECIFIC]

**Tools:** [FLOOR-TYPE SPECIFIC]

**Safety:** Place wet floor signs, ensure proper ventilation

**Cleaning Standards:** Floor clean, no visible soil, proper shine level

**Detailed Checklist:**
- [ ] All debris removed
- [ ] Edges and corners clean
- [ ] No streaks or residue
- [ ] Proper shine/appearance
- [ ] Wet floor signs placed
```

## Base Supply Lists

### Universal Cleaning Supplies
```markdown
## Chemicals Needed

### Multi-Purpose
- All-purpose cleaner (pH neutral)
- Glass cleaner
- Disinfectant (EPA-approved)
- Floor cleaner (appropriate type)

### Specialized
- [INDUSTRY-SPECIFIC CHEMICALS]

## Tools & Equipment

### Basic Tools
- Microfiber cloths (color-coded)
- Mop and bucket system
- Vacuum cleaner (HEPA filter)
- Cleaning cart
- Gloves (nitrile)
- Trash bags (various sizes)

### Safety Equipment
- Wet floor signs
- Safety glasses
- [INDUSTRY-SPECIFIC PPE]
```

## Common Task Templates

### Dusting Template
```markdown
#### TASK: Comprehensive Dusting
**Time: [TIME] minutes**

**Cleaning Steps:**
1. Work from high to low
2. Use appropriate tool for surface
3. Move items to dust underneath
4. Pay attention to corners and edges
5. Return items to exact position

**Chemicals:** Dusting spray (if needed)

**Tools:** Microfiber cloths, dusters, extension pole

**Safety:** Use ladder safely for high areas

**Cleaning Standards:** No visible dust on any surface

**Detailed Checklist:**
- [ ] High surfaces (ceiling fans, vents)
- [ ] Mid-level (desks, tables, shelves)
- [ ] Low areas (baseboards, chair legs)
- [ ] Electronics (appropriate method)
- [ ] Decorative items handled carefully
```

### Restroom Cleaning Template
```markdown
### RESTROOM ([SIZE]-[SIZE] minutes)

#### TASK: Complete Restroom Sanitization
**Time: [ADJUST] minutes**

**Cleaning Steps:**
1. Apply toilet bowl cleaner and let dwell
2. Spray all surfaces with disinfectant
3. Clean mirrors and glass
4. Scrub and disinfect toilet completely
5. Clean and disinfect sink and counter
6. Mop floor from back to front
7. Restock all supplies
8. Final inspection

**Chemicals:** Toilet bowl cleaner, bathroom disinfectant, glass cleaner, floor cleaner

**Tools:** Bowl brush, microfiber cloths, mop, gloves

**Safety:** Ensure ventilation, wear gloves

**Cleaning Standards:** All surfaces sanitized, no odors, fully stocked

**Detailed Checklist:**
- [ ] Toilet bowl clean and disinfected
- [ ] All surfaces disinfected
- [ ] Mirror streak-free
- [ ] Sink and fixtures shining
- [ ] Floor clean and dry
- [ ] Supplies restocked
- [ ] Trash removed
- [ ] Pleasant scent
```

### Kitchen/Break Room Template
```markdown
### KITCHEN/BREAK ROOM (30-45 minutes)

[INHERIT: Standard Room Base - Trash]
[INHERIT: High-Touch Surface Component]

#### TASK: Kitchen Deep Clean
**Time: 20-30 minutes**

**Cleaning Steps:**
1. Clear and wipe all counters
2. Clean appliance exteriors
3. Clean inside microwave
4. Sanitize sink and faucet
5. Clean coffee station
6. Wipe down tables and chairs
7. Sweep and mop floor

**Chemicals:** Degreaser, all-purpose cleaner, floor cleaner

**Tools:** Microfiber cloths, scrub sponges, mop

**Safety:** Unplug appliances before cleaning

**Cleaning Standards:** Food-safe clean, no grease or crumbs

**Detailed Checklist:**
- [ ] Counters cleared and sanitized
- [ ] Appliances clean inside and out
- [ ] Sink empty and shining
- [ ] Coffee area organized and clean
- [ ] Tables and chairs wiped
- [ ] Floor swept and mopped
- [ ] Refrigerator exterior clean
```

## Inheritance Rules

### How to Use Inheritance

1. **Full Inheritance**
   ```
   [INHERIT: Component Name]
   ```
   Includes entire component as-is

2. **Partial Inheritance with Modification**
   ```
   [INHERIT: Component Name]
   [MODIFY: Field = New Value]
   ```
   Inherits component but changes specific fields

3. **Multiple Inheritance**
   ```
   [INHERIT: Component 1]
   [INHERIT: Component 2]
   [REMOVE: Duplicate Task]
   ```

### Customization Guidelines

- Always specify what's inherited at room level
- Override times based on room size
- Add room-specific items to checklists
- Adjust chemicals for surface types
- Maintain consistent formatting

## Time Calculation Formulas

### Base Time Calculations
- **Small Room** (<150 sq ft): Base time × 0.8
- **Medium Room** (150-300 sq ft): Base time × 1.0
- **Large Room** (300-500 sq ft): Base time × 1.3
- **Extra Large** (>500 sq ft): Base time × 1.5

### Adjustment Factors
- **Heavy soil**: Add 25%
- **Light soil**: Subtract 15%
- **Occupied room**: Add 30%
- **High-traffic**: Add 20%
- **After-hours**: Subtract 10%

## Quality Check Components

### Standard Quality Checklist
```markdown
### FINAL QUALITY CHECK (10-15 minutes)

**Visual Inspection:**
- [ ] All surfaces clean and dust-free
- [ ] Floors properly cleaned
- [ ] Glass and mirrors streak-free
- [ ] Trash removed and bins lined
- [ ] Supplies restocked

**Touch Test:**
- [ ] Surfaces feel clean (no residue)
- [ ] No sticky spots
- [ ] Fixtures properly polished

**Smell Test:**
- [ ] Pleasant, clean scent
- [ ] No chemical odors
- [ ] No musty/stale smells

**Functionality:**
- [ ] All equipment returned to place
- [ ] Lights and electronics working
- [ ] Doors and windows secure
- [ ] HVAC at proper settings
```

## Documentation Components

### Standard Documentation
```markdown
**Documentation Requirements:**
- [ ] Start time recorded
- [ ] Tasks completed checked off
- [ ] Any issues noted
- [ ] Supplies used recorded
- [ ] End time logged
- [ ] Quality check completed
- [ ] Client signature (if required)
```

---

*This component library reduces redundancy and ensures consistency across all cleaning templates. Components should be inherited and customized rather than duplicated.*