# Template Generator Configuration

## Overview

This configuration system enables automated generation of cleaning templates based on parameters. It combines modules, shared resources, and base components to create customized templates efficiently.

## Generator Parameters

### Required Parameters
```yaml
template_config:
  # Basic Information
  facility_type: [office|residential|medical|restaurant|educational|hospitality|retail|industrial]
  facility_size: [small|medium|large|extra_large]
  cleaning_frequency: [daily|weekly|bi_weekly|monthly|one_time]
  
  # Facility Details
  square_footage: [number]
  room_count: [number]
  special_areas: [list of special room types]
  
  # Service Level
  service_level: [basic|standard|premium|deep_clean]
  green_cleaning: [true|false]
  
  # Customization
  include_supplies: [true|false]
  include_pricing: [true|false]
  brand_name: [company name]
```

### Optional Parameters
```yaml
advanced_config:
  # Special Requirements
  compliance_standards: [OSHA|HIPAA|FDA|other]
  certifications_required: [list]
  
  # Operational Constraints  
  working_hours: [business_hours|after_hours|24_7]
  occupied_cleaning: [true|false]
  
  # Equipment Available
  equipment_tier: [basic|professional|industrial]
  team_size: [solo|small_team|large_team]
```

## Generation Rules

### Size-Based Adjustments

#### Small Facilities (<5,000 sq ft)
```yaml
small_facility:
  time_multiplier: 0.8
  task_complexity: simplified
  equipment: basic_tools
  chemical_variety: minimal
  team_size: 1-2
```

#### Medium Facilities (5,000-20,000 sq ft)
```yaml
medium_facility:
  time_multiplier: 1.0
  task_complexity: standard
  equipment: professional_tools
  chemical_variety: standard
  team_size: 2-4
```

#### Large Facilities (20,000-50,000 sq ft)
```yaml
large_facility:
  time_multiplier: 1.2
  task_complexity: detailed
  equipment: industrial_tools
  chemical_variety: comprehensive
  team_size: 4-8
```

#### Extra Large Facilities (>50,000 sq ft)
```yaml
extra_large_facility:
  time_multiplier: 1.5
  task_complexity: specialized
  equipment: fleet_required
  chemical_variety: full_range
  team_size: 8+
```

### Frequency-Based Modifications

#### Daily Cleaning
```yaml
daily_cleaning:
  focus: maintenance_and_sanitation
  time_reduction: 30%
  tasks:
    - trash_removal: required
    - high_touch_disinfection: required
    - floor_maintenance: quick_clean
    - restroom_service: multiple_daily
  skip_tasks:
    - deep_cleaning_items
    - periodic_maintenance
```

#### Weekly Cleaning
```yaml
weekly_cleaning:
  focus: thorough_cleaning
  time_reduction: 0%
  tasks:
    - all_standard_tasks: required
    - detail_work: included
    - floor_care: complete
    - dusting: comprehensive
```

#### Monthly/Deep Cleaning
```yaml
deep_cleaning:
  focus: restoration_level
  time_increase: 50%
  tasks:
    - all_standard_tasks: required
    - high_dusting: required
    - floor_stripping: as_needed
    - detail_cleaning: exhaustive
  additional:
    - carpet_extraction
    - wall_washing
    - vent_cleaning
```

## Template Assembly Process

### Step 1: Load Base Structure
```
1. Select primary module based on facility_type
2. Load universal formatting from CLAUDE.md
3. Import shared resources
4. Apply base components
```

### Step 2: Room Selection
```yaml
room_selection_logic:
  if facility_type == "office":
    include_rooms:
      - reception
      - private_offices: scale_by_room_count
      - conference_rooms: min(room_count/10, 5)
      - break_room
      - restrooms: scale_by_size
      
  if special_areas contains "kitchen":
    add: commercial_kitchen_component
    
  if special_areas contains "gym":
    add: fitness_center_component
```

### Step 3: Task Generation
```yaml
task_generation:
  for each room:
    1. Include base_room_tasks
    2. Add room_specific_tasks
    3. Apply frequency_filters
    4. Adjust_times_by_size
    5. Include_applicable_recurring_tasks
```

### Step 4: Chemical Selection
```yaml
chemical_selection:
  base_set: from_industry_module
  
  if green_cleaning:
    filter: epa_safer_choice_only
    
  if size == "small":
    limit: essential_chemicals_only
    
  apply: chemical_compatibility_check
```

### Step 5: Time Calculations
```python
def calculate_total_time(rooms, size_multiplier, frequency_modifier):
    base_time = sum(room.base_time for room in rooms)
    adjusted_time = base_time * size_multiplier * frequency_modifier
    
    # Add buffers
    setup_time = 15  # minutes
    breakdown_time = 15  # minutes
    travel_time = len(rooms) * 2  # 2 min between rooms
    
    total_time = adjusted_time + setup_time + breakdown_time + travel_time
    
    return {
        'minimum': total_time * 0.9,
        'maximum': total_time * 1.1,
        'recommended': total_time
    }
```

## Output Formats

### Standard Template Format
```markdown
# Professional [Facility Type] Cleaning Template - [Size]

Generated for: [Brand Name]
Date: [Current Date]
Facility Size: [Square Footage] sq ft

## Service Summary
- Frequency: [Cleaning Frequency]
- Service Level: [Service Level]
- Estimated Time: [Time Range]
- Team Size: [Recommended Team]

[Continue with standard template structure...]
```

### Checklist Format
```markdown
## Quick Reference Checklist

**[Room Name]** ⏱️ [Time]
□ [Task 1]
□ [Task 2]
□ [Task 3]

[Repeat for all rooms]

**Quality Verification**
□ All tasks completed
□ Supplies restocked
□ Documentation complete
```

### Pricing Format (if enabled)
```markdown
## Pricing Estimate

Base Service: $[calculated_base]
Frequency Discount: -[discount]%
Additional Services: $[add_ons]
**Total Estimate: $[total]**

*Pricing based on local market rates and facility specifications*
```

## Validation Rules

### Pre-Generation Validation
1. Verify all required parameters present
2. Check parameter value validity
3. Confirm module availability
4. Validate size/room count logic

### Post-Generation Validation
1. Run through validation-system.md
2. Check time calculations reasonable
3. Verify chemical compatibility
4. Confirm task completeness

## Customization Hooks

### Custom Room Types
```yaml
custom_rooms:
  clean_room:
    base: standard_room
    modifications:
      - air_quality_requirements
      - gowning_procedures
      - particle_counting
    time_multiplier: 2.0
```

### Industry Combinations
```yaml
hybrid_facilities:
  medical_office:
    primary: medical
    secondary: office
    weight: 70/30
    
  retail_restaurant:
    primary: restaurant
    secondary: retail
    weight: 60/40
```

## Error Handling

### Common Issues
```yaml
error_responses:
  missing_module:
    message: "Module not found for facility type"
    action: fall_back_to_general
    
  invalid_size:
    message: "Size parameters inconsistent"
    action: request_clarification
    
  time_calculation_error:
    message: "Time estimates unrealistic"
    action: apply_standard_times
```

## Future Enhancements

### Planned Features
1. **AI Learning**: Adjust times based on historical data
2. **Regional Variations**: Locale-specific requirements
3. **Integration APIs**: Connect to scheduling systems
4. **Mobile Optimization**: Responsive template output
5. **Multi-Language**: Template translation support

### Version Roadmap
- v1.0: Basic parameter-driven generation
- v1.5: Advanced customization options
- v2.0: Machine learning integration
- v2.5: Real-time optimization
- v3.0: Full automation suite

---

*This configuration enables automated template generation while maintaining quality and customization. Regular updates ensure optimal performance.*