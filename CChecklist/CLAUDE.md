# CLAUDE.md - Cleaning Templates System Orchestrator

This file provides core guidance to Claude Code (claude.ai/code) for creating professional cleaning templates. For detailed guidance, load the appropriate module based on the cleaning type.

## Project Overview

This system creates professional cleaning templates for various property types and cleaning scenarios. The modular architecture allows for industry-specific customization while maintaining consistent standards.

## System Architecture

```
/CChecklist/
├── CLAUDE.md                    # This file - main orchestrator
├── claude-modules/              # Industry-specific modules
│   ├── CLAUDE-office.md         # Office/commercial cleaning
│   ├── CLAUDE-residential.md    # Home/apartment cleaning
│   ├── CLAUDE-medical.md        # Healthcare facility cleaning
│   ├── CLAUDE-hospitality.md    # Hotel/motel cleaning
│   └── [other modules]
├── shared-resources/            # Common resources
│   ├── safety-protocols.md      # Universal safety guidelines
│   ├── chemical-guide.md        # Chemical categorization & usage
│   ├── equipment-list.md        # Standard equipment catalog
│   └── recurring-tasks.md       # Universal & frequency-based tasks
└── templates/                   # Generated templates by category
```

## Module Loading Instructions

**IMPORTANT: Default to Interactive Mode - Ask Questions First!**

When creating cleaning templates, ALWAYS:

1. **Identify the request type**:
   - If user says "create", "I need cleaning", "help me create", or mentions a company name → Load `CLAUDE-interactive.md` FIRST
   - If user provides COMPLETE details (type, size, rooms, frequency, etc.) → Load specific industry module
   - If user explicitly says "quick template" or "standard template" → Use standard modules directly
   - DEFAULT ACTION: Always start with interactive mode unless user provides exhaustive details

2. **For Interactive Mode** (Recommended for new users):
   - Load `./claude-modules/CLAUDE-interactive.md`
   - Begin Q&A process
   - System will automatically load other modules as needed
   - Process any photos if provided

3. **For Direct Creation** (When all details provided):
   - Load the appropriate industry module
   - Reference shared resources
   - Apply all specifications immediately

4. **Always integrate**:
   - Recurring tasks based on frequency
   - Route optimization
   - Quality standards
   - Validation checks

## Module Loading Decision Matrix

### Primary Decision Factors:
1. **Request Completeness Score**:
   - Company name only: 1 point → Interactive Mode
   - Property type specified: 2 points
   - Size/area provided: 2 points
   - Room count given: 2 points
   - Frequency stated: 1 point
   - Special requirements mentioned: 1 point
   - **Total 6+ points → Direct Module Loading**
   - **Total <6 points → Interactive Mode**

2. **Hybrid Scenarios**:
   - Office + Restaurant areas → Load both modules, merge sections carefully
   - Residential + Home office → Use residential as base, add office elements
   - Medical + Administrative areas → Use medical as primary, add office components
   - Always validate combined templates for conflicts
   - Document which modules were combined

3. **Module Loading Priority**:
   - Primary module: Based on main facility type
   - Secondary modules: For additional areas/features
   - Always load interactive mode if unclear
   - When multiple modules apply, use the more stringent standards

### Module Selection Guide

#### Standard Modules (Direct Template Creation)
- **Office/Commercial Buildings** → Load `./claude-modules/CLAUDE-office.md` ✓
- **Residential/Homes/Apartments** → Load `./claude-modules/CLAUDE-residential.md` ✓
- **Medical/Healthcare Facilities** → Load `./claude-modules/CLAUDE-medical.md` ✓
- **Hotels/Motels/Hospitality** → Load `./claude-modules/CLAUDE-hospitality.md` ✓
- **Restaurants/Food Service** → Load `./claude-modules/CLAUDE-restaurant.md` ✓
- **Industrial/Warehouses** → Load `./claude-modules/CLAUDE-industrial.md` ✓
- **Retail/Stores** → Load `./claude-modules/CLAUDE-retail.md` ✓
- **Schools/Universities** → Load `./claude-modules/CLAUDE-educational.md` ✓
- **Move-In/Move-Out Deep Cleaning** → Load `./claude-modules/CLAUDE-moveinout.md` ✓
- **Post-Construction Cleanup** → Load `./claude-modules/CLAUDE-postconstruction.md` ✓
- **Airbnb/Vacation Rentals** → Load `./claude-modules/CLAUDE-airbnb.md` ✓
- **Lawn Care & Outdoor Services** → Load `./claude-modules/CLAUDE-lawncare.md` ✓

#### Interactive Module (Question-Based Creation)
- **Interactive Generator** → Load `./claude-modules/CLAUDE-interactive.md` ✓
  - Use when: User says "I need cleaning" or requests help creating template
  - Guides through simple Q&A process
  - Automatically loads appropriate modules
  - Handles photo analysis if provided

### Frequency Selection Guide

- **Daily Cleaning** → High-traffic commercial, medical facilities, food service
- **2-3x Weekly** → Standard office cleaning, busy retail
- **Weekly** → Residential homes, small offices
- **Bi-Weekly** → Low-traffic offices, residential maintenance
- **Monthly** → Deep cleaning add-on services
- **Quarterly** → Seasonal deep cleaning
- **One-Time** → Move-in/out, post-construction, special events

## Universal Formatting Rules

These rules apply to ALL cleaning templates regardless of type:

### Markdown Hierarchy
- `#` - Document title only
- `##` - Major sections (MASTER SUPPLY LIST, CLEANING SEQUENCE & TIMING, etc.)
- `###` - Room names (BEDROOM, KITCHEN, BATHROOM, etc.)
- `####` - Task names within rooms
- `**Bold**` - Subsection headers (Cleaning Steps, Chemicals, Tools, etc.)
- Regular text - All content

### Room Title Format
- Always use: `### ROOM NAME (XX-XX minutes)`
- Room name in ALL CAPS
- Time range in parentheses
- Examples: `### KITCHEN (45-60 minutes)`, `### BATHROOM (35-45 minutes)`

### Task Structure (MANDATORY FORMAT)
```markdown
#### TASK: [Task Name] [FREQUENCY TAG if recurring]
**Time: XX-XX minutes**

**Cleaning Steps:**
1. [Step one]
2. [Step two]
3. [Continue numbered list]

**Chemicals:** [List chemicals with commas]

**Tools:** [List tools with commas]

**Safety:** [Safety note - one line]

**Cleaning Standards:** [Visual, touch, smell standards in one line]

**Detailed Checklist:**
- [ ] [Specific measurable item]
- [ ] [Continue with consistent format]

*Note: Use [DAILY], [WEEKLY], [MONTHLY], or [QUARTERLY] tags for recurring tasks*
```

### Universal Template Structure

Every template MUST include these sections in order:

1. **Title Header**
   - Format: `# Professional [Type] Cleaning Template - [Size/Specification]`

2. **Master Supply List**
   - Chemicals Needed (reference `shared-resources/chemical-guide.md`)
   - Tools & Equipment (reference `shared-resources/equipment-list.md`)
   - Amenities to Restock (industry-specific from modules)

3. **Cleaning Sequence & Timing**
   - Total time estimate (including recurring tasks)
   - Room-by-room breakdown
   - Tasks within each room
   - Recurring task integration
   - Route optimization notes

4. **Final Quality Check**
   - Title: `### FINAL QUALITY CHECK (XX-XX minutes)`
   - Comprehensive walkthrough
   - Master checklist

5. **Reference Sections**
   - Quality Standards Reference
   - Time Standards
   - Chemical Reference Guide
   - Professional Certifications (when applicable)

## Shared Resources Usage

### Safety Protocols
Always reference `./shared-resources/safety-protocols.md` for:
- PPE requirements
- Chemical handling procedures
- Emergency procedures
- Industry-specific safety considerations

### Chemical Guide
Always reference `./shared-resources/chemical-guide.md` for:
- Chemical categorization
- pH levels and compatibility
- Dilution ratios
- Surface-specific recommendations

### Equipment List
Always reference `./shared-resources/equipment-list.md` for:
- Standard tool specifications
- Color-coding systems
- Maintenance schedules
- Equipment by facility size

### Recurring Tasks
Always reference `./shared-resources/recurring-tasks.md` for:
- Universal tasks for all rooms
- Frequency-based task schedules
- Task batching strategies
- Route optimization
- Industry-specific recurring requirements

### Validation System
Always reference `./shared-resources/validation-system.md` for:
- Template structure validation
- Formatting compliance checks
- Content verification rules
- Industry-specific requirements
- Common error prevention

### Route Optimization
Always reference `./shared-resources/route-optimization.md` for:
- Efficient cleaning sequences
- Multi-floor strategies
- Equipment movement plans
- Task batching methods
- Time-saving techniques

### Quality Standards
Always reference `./shared-resources/quality-standards.md` for:
- Measurable quality metrics
- Industry-specific benchmarks
- Inspection criteria
- Performance standards
- Customer satisfaction targets

### Base Components
Always reference `./shared-resources/base-components.md` for:
- Reusable task templates
- Common room components
- Inheritance patterns
- Time calculation formulas
- Standard checklists

### Module Template
Always reference `./shared-resources/module-template.md` for:
- Creating new industry modules
- Module structure guidelines
- Required sections checklist
- Customization instructions

### Template Generator
Always reference `./tools/template-generator-config.md` for:
- Automated template creation
- Parameter-based generation
- Size and frequency adjustments
- Validation rules
- Output format options

## Photo Analysis Protocol

When users provide photos:

1. **Room Identification**:
   - Ask: "Which room is shown in this photo?" if unclear
   - Confirm room type before proceeding
   - Note any multi-purpose areas

2. **Identify Key Elements**:
   - **Surfaces**: Wood, marble, tile, carpet, laminate
   - **Fixtures**: Type and material (stainless, chrome, brass)
   - **Equipment/Furniture**: Density and arrangement
   - **Special Items**: Electronics, artwork, delicate surfaces
   - **Problem Areas**: Stains, buildup, damage, clutter

3. **Adjust Template Based on Observations**:
   - High clutter → Add 15-20% to time estimates
   - Special surfaces → Include specific chemicals/tools
   - Dense furniture → Add furniture moving time
   - Visible soil level → Adjust cleaning intensity
   - Multiple floor types → Add transition cleaning

4. **Create Custom Room Checklist**:
   - List all visible items requiring attention
   - Group by cleaning method/chemical needed
   - Order by efficient cleaning sequence
   - Include specific techniques for observed materials

5. **Document Photo-Based Additions**:
   - Add comment: "*Based on provided photos: [specific observations]*"
   - Note any special handling requirements
   - Flag items needing extra care

## Resource Integration Protocol

### When Creating Templates:

1. **Chemical Selection Process**:
   - Open and read `chemical-guide.md` for full chemical list
   - Match chemicals to observed/stated surfaces
   - Select 3-5 primary chemicals per template
   - Always include core trio: all-purpose, disinfectant, glass cleaner
   - Add specialty chemicals based on:
     - Surface types (wood polish, stainless cleaner)
     - Soil levels (degreaser, lime remover)
     - Industry requirements (medical-grade disinfectants)

2. **Equipment Selection**:
   - Load `equipment-list.md` and match to facility size:
     - <100m²: Basic residential kit
     - 100-500m²: Commercial portable equipment
     - >500m²: Industrial equipment
   - Always use proper color-coding system:
     - Blue: General areas
     - Red: Restrooms
     - Green: Kitchen/food areas
     - Yellow: Special surfaces
   - Include size-appropriate vacuum type

3. **Recurring Tasks Integration**:
   - Load `recurring-tasks.md` for complete task list
   - Filter tasks by selected frequency
   - Insert [FREQUENCY] tags on all applicable tasks
   - Merge with room-specific tasks (no duplicates)
   - Maintain task hierarchy: safety → sanitation → appearance

4. **Validation Requirements**:
   - Run each section through `validation-system.md`
   - Check formatting compliance
   - Verify time calculations
   - Confirm all required elements present

## Error Handling & Edge Cases

### Common Scenarios:

1. **Unknown Property Type**:
   - Default to interactive mode immediately
   - Show available options list:
     ```
     I don't have a specific module for that type. Which is closest:
     - Office/Commercial
     - Residential
     - Medical/Healthcare
     [continue list]
     ```
   - Guide user to closest match
   - Document adaptations needed

2. **Conflicting Requirements**:
   - User wants "daily deep clean":
     - Explain: "Daily deep cleaning isn't sustainable. I recommend:"
     - Suggest: "Weekly deep clean with daily maintenance"
     - Provide both options with time/cost implications
   - Unrealistic time expectations:
     - Show amateur vs professional times
     - Explain factors affecting duration
     - Offer efficiency tips

3. **Missing Modules**:
   - Exact type unavailable → use closest match
   - Document all adaptations
   - Examples:
     - "Dental office" → Medical module + office elements
     - "Gym" → Commercial + medical sanitation standards
     - "Daycare" → Educational + enhanced sanitation

4. **Size/Scope Mismatches**:
   - Template exceeds practical limits:
     - Split into zones/phases
     - Suggest team approach
     - Provide rotation schedule
   - Tiny spaces with complex requirements:
     - Focus on essential tasks
     - Merge similar activities
     - Adjust frequencies

5. **Technical Limitations**:
   - Missing shared resources → Use embedded defaults
   - Module loading errors → Fallback to base template
   - Validation failures → List specific issues and fixes

## Template Creation Workflow

1. **Identify Cleaning Type & Frequency**
   - Determine property type and industry
   - Identify cleaning frequency (daily, weekly, etc.)
   - Note any special requirements

2. **Load Appropriate Module**
   - Load industry-specific CLAUDE module
   - Review unique requirements and standards

3. **Reference Shared Resources**
   - Check safety protocols for the industry
   - Select appropriate chemicals from guide
   - Choose equipment based on facility size
   - **Load recurring tasks for the cleaning frequency**

4. **Integrate Recurring Tasks**
   - Add universal recurring tasks to each room
   - Include frequency-specific tasks
   - Apply task batching for efficiency
   - Note route optimization

5. **Follow Module Guidelines**
   - Apply industry-specific room types
   - Use specialized task modifications
   - Include required compliance sections

6. **Maintain Universal Standards**
   - Use consistent formatting rules
   - Follow standard template structure
   - Include all required sections
   - Mark recurring tasks with frequency tags

## Quality Assurance

Before finalizing any template:
- ✓ Run full validation using `validation-system.md`
- ✓ Verify all formatting follows universal rules
- ✓ Confirm industry-specific requirements are met
- ✓ Check chemical compatibility and safety
- ✓ Validate time estimates are realistic
- ✓ Ensure all required sections are present
- ✓ Test with validation checklist
- ✓ Document any customizations

## Interactive Template Creation

When creating a new template:
1. First determine which module to load based on property type
2. **Identify cleaning frequency** (daily, weekly, monthly, etc.)
3. Load and review the specific module
4. Follow the module's customization guidelines
5. Reference shared resources including recurring tasks
6. Apply universal formatting rules
7. Integrate appropriate recurring tasks based on frequency

## Decision Tree for Template Creation

```
User Request
    ↓
Contains "create" or company name? → YES → Use Interactive Mode
    ↓ NO
Provides complete details (type, size, rooms, frequency)? → YES → Direct Creation
    ↓ NO
Says "quick" or "standard" template? → YES → Use Standard Module
    ↓ NO
DEFAULT → Use Interactive Mode (Ask Questions!)
```

**Key Phrases That Trigger Interactive Mode:**
- "create [company] cleaning"
- "I need cleaning template"
- "help me create"
- "make a checklist for [company]"
- Any mention of specific company/business names
- Vague or incomplete requests

## Time Calculation Guidelines

### Base Time Formula (Amateur Cleaner Standards):
**Note**: Professional cleaners typically work 2-3x faster due to training, tools, and team-based methods.

#### Per Room Base Times (for 100m² reference property):
- **Kitchen**: 45-75 minutes (amateur) | 20-30 minutes (professional)
  - Deep clean with oven: +30-60 minutes
  - Size variations: Small kitchenette 30-45 min, Large kitchen 75-120 min
- **Bathroom**: 30-45 minutes (amateur) | 15-20 minutes (professional)
  - Full bathroom with tub/shower: 35-45 minutes
  - Half bathroom (toilet + sink): 15-20 minutes
  - Master bathroom with separate shower/tub: 45-60 minutes
- **Bedroom**: 20-60 minutes (amateur) | 10-20 minutes (professional)
  - Depends heavily on clutter level
  - Add 30 min if decluttering needed
  - Master bedroom: 30-60 minutes
  - Guest bedroom: 20-30 minutes
- **Living Room**: 30-90 minutes (amateur) | 15-30 minutes (professional)
  - Simple layout: 30-45 minutes
  - With entertainment center/shelving: 45-90 minutes
- **Home Office**: 25-45 minutes (amateur) | 15-20 minutes (professional)
  - Add time for paper organization if needed
- **Dining Room**: 20-35 minutes (amateur) | 10-15 minutes (professional)
- **Hallways/Stairs**: 10-20 minutes per floor
- **Entryway**: 10-15 minutes

### Size Adjustments:
- **<50m²**: Base time × 0.7-0.8
- **50-100m²**: Base time × 1.0
- **100-150m²**: Base time × 1.2-1.3
- **150-200m²**: Base time × 1.4-1.5
- **200-300m²**: Base time × 1.6-1.8
- **>300m²**: Base time × 2.0+

### Frequency Modifiers:
- **Daily**: × 0.4-0.5 (maintenance only, skip deep tasks)
- **2-3x Weekly**: × 0.6-0.7 (light cleaning)
- **Weekly**: × 1.0 (standard cleaning)
- **Bi-weekly**: × 1.1-1.2 (accumulated dust/dirt)
- **Monthly**: × 1.4-1.5 (deeper cleaning needed)
- **Quarterly**: × 1.8-2.0 (heavy accumulation)
- **One-time/Move-out**: × 2.0-2.5 (complete deep clean)

### Condition Modifiers:
- **Well-maintained property**: × 0.9
- **Average condition**: × 1.0
- **Cluttered/disorganized**: × 1.3-1.5
- **Heavy soiling**: × 1.5-2.0
- **Pet household**: × 1.1-1.2
- **Smoker household**: × 1.2-1.3

### Total Time Calculation Example:
For a 120m² apartment with 2 bedrooms, 2 bathrooms, kitchen, living room:
- Kitchen: 45 min × 1.2 (size) = 54 minutes
- 2 Bathrooms: 35 min × 2 × 1.2 = 84 minutes
- 2 Bedrooms: 30 min × 2 × 1.2 = 72 minutes
- Living Room: 45 min × 1.2 = 54 minutes
- **Total**: 264 minutes (4.4 hours) for weekly amateur cleaning

## Frequency-Based Time Adjustments

### Daily Cleaning
- Base time: 40-50% of weekly clean time
- Focus on high-traffic areas and sanitation
- Skip deep cleaning tasks
- Typical tasks: Wipe surfaces, empty trash, quick vacuum

### Weekly Cleaning
- Base time: 100% standard time
- Include all standard tasks plus weekly recurring
- Full room coverage
- Typical time: 3-5 hours for average home

### Bi-Weekly Cleaning
- Base time: 110-120% standard time
- Additional attention to accumulated dust/dirt
- Include some monthly tasks
- Extra time for bathroom buildup

### Monthly Cleaning
- Base time: 140-150% standard time
- Deep cleaning focus
- Include quarterly tasks as needed
- Window cleaning, baseboards, detailed dusting

### One-Time Deep Cleaning
- Base time: 200-250% standard time
- Complete all tasks including quarterly
- Extra attention to neglected areas
- Move furniture, clean inside appliances

## Version Control

- Main Orchestrator Version: 3.0
- Last Updated: January 2025
- Module versions tracked independently
- Shared resources updated quarterly
- Recurring tasks system: v1.0
- Major Updates in v3.0:
  - Added comprehensive Module Loading Decision Matrix
  - Implemented detailed Time Calculation Guidelines with real amateur cleaner data
  - Added Photo Analysis Protocol with room identification
  - Enhanced Resource Integration Protocol with specific instructions
  - Added Error Handling & Edge Cases section
  - Improved decision factors for module selection

---

*This orchestrator file coordinates the modular cleaning template system. Always load appropriate modules and shared resources for comprehensive guidance.*