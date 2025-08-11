# Interactive Template Generator Plan

## Overview

This system will guide users through a series of simple questions to generate customized cleaning templates. Questions will be primarily yes/no or short answer format, using metric measurements (meters, square meters, centimeters) and time in hours/minutes.

## User Flow

### Phase 1: Initial Request
**User Input:** "I need office cleaning" (or similar)

**System Response:** Recognizes cleaning type and begins interactive questionnaire

### Phase 2: Interactive Questionnaire

## Question Categories & Sequence

### 1. BASIC FACILITY INFORMATION

#### 1.1 Facility Type Confirmation
```
Q1: You need OFFICE cleaning, correct? (yes/no)
If no → Show facility type menu:
   1. Office
   2. Medical
   3. Restaurant
   4. School
   5. Hotel
   6. Retail
   7. Industrial
   8. Residential
   Select number: _
```

#### 1.2 Facility Size
```
Q2: What is the total area in square meters? 
Answer: ___ m²

Q3: How many floors? 
Answer: ___ floors

Q4: Do you have the breakdown by floor? (yes/no)
If yes → For each floor:
   Floor [X] area in m²: ___
```

### 2. ROOM INVENTORY

#### 2.1 Room Count Collection
```
Q5: Let me collect room information. How many of each:

Standard offices: ___
Meeting/Conference rooms: ___
Reception areas: ___
Kitchen/Break rooms: ___
Restrooms: ___
Storage rooms: ___
Other special rooms: ___
```

#### 2.2 Detailed Room Information
For each room type with count > 0:
```
Q6-X: For your [COUNT] offices:
- Small offices (<15m²): ___
- Medium offices (15-30m²): ___
- Large offices (>30m²): ___

Q7-X: For your [COUNT] meeting rooms:
- Small (<10 seats): ___
- Medium (10-20 seats): ___
- Large (>20 seats): ___

Q8-X: For your [COUNT] restrooms:
- Single-user restrooms: ___
- Multi-stall restrooms: ___
- Include showers? (yes/no)
```

#### 2.3 Special Features
```
Q9: Any of these special areas? (yes/no for each)
- Server/IT room? (yes/no)
- Executive suite? (yes/no)
- Gym/Fitness area? (yes/no)
- Cafeteria? (yes/no)
- Outdoor areas? (yes/no)
```

### 3. SERVICE REQUIREMENTS

#### 3.1 Cleaning Frequency
```
Q10: How often will cleaning occur?
   1. Daily
   2. 2-3 times per week
   3. Weekly
   4. Bi-weekly
   5. Monthly
   6. One-time deep clean
   Select number: _
```

#### 3.2 Service Timing
```
Q11: When will cleaning happen?
   1. During business hours
   2. After hours (evening)
   3. Overnight
   4. Weekends
   5. Flexible
   Select number: _

Q12: Typical occupancy during cleaning? (yes/no)
```

#### 3.3 Service Level
```
Q13: Service level needed?
   1. Basic (trash, floors, restrooms)
   2. Standard (full cleaning)
   3. Premium (detailed service)
   4. Custom
   Select number: _
```

### 4. SPECIFIC REQUIREMENTS

#### 4.1 Special Considerations
```
Q14: Any special requirements? (yes/no for each)
- High security areas? (yes/no)
- Confidential document handling? (yes/no)
- Green/eco cleaning required? (yes/no)
- Special hours access only? (yes/no)
- Alarm system? (yes/no)
```

#### 4.2 Current Challenges
```
Q15: Current cleaning challenges? (yes/no for each)
- Heavy traffic areas? (yes/no)
- Persistent odors? (yes/no)
- Staining issues? (yes/no)
- Dust problems? (yes/no)
- Previous service issues? (yes/no)
```

### 5. DETAILED SPECIFICATIONS

#### 5.1 Floor Types
```
Q16: What floor types do you have? (yes/no for each)
- Carpet? (yes/no)
  If yes → Approximate m²: ___
- Hard floors? (yes/no)
  If yes → Type:
    1. Vinyl/VCT
    2. Wood
    3. Tile
    4. Concrete
    Select numbers: ___
```

#### 5.2 Facility Features
```
Q17: Which features need cleaning? (yes/no for each)
- Windows accessible from inside? (yes/no)
- Blinds or curtains? (yes/no)
- Kitchen appliances? (yes/no)
  If yes → List main appliances: ___
- Elevator? (yes/no)
  If yes → How many: ___
```

### 6. OPERATIONAL DETAILS

#### 6.1 Access & Security
```
Q18: Building access details:
- 24/7 access available? (yes/no)
- Security check-in required? (yes/no)
- Special key/card needed? (yes/no)
- Parking available? (yes/no)
```

#### 6.2 Supply Preferences
```
Q19: Supply preferences:
- You provide cleaning supplies? (yes/no)
- Specific product restrictions? (yes/no)
  If yes → Brief description: ___
- Supply storage on-site? (yes/no)
```

### 7. PHOTO ANALYSIS (Optional)

```
Q20: Do you have photos to share? (yes/no)
If yes → "Please upload photos of:
   - Main areas needing cleaning
   - Any problem areas
   - Special equipment or features"
   
[System analyzes photos for:
 - Room layouts
 - Soil levels
 - Special equipment
 - Access challenges]
```

### 8. FINAL CUSTOMIZATION

#### 8.1 Priorities
```
Q21: Top 3 priorities? (select 3)
   1. Restroom cleanliness
   2. Floor appearance  
   3. Dust control
   4. Kitchen sanitation
   5. Trash removal
   6. Window cleaning
   7. Disinfection
   Select 3 numbers: ___, ___, ___
```

#### 8.2 Budget/Time Constraints
```
Q22: Any constraints?
- Maximum hours per visit: ___ hours
- Preferred team size:
   1. Solo cleaner
   2. 2-person team
   3. Larger crew
   4. No preference
   Select number: ___
```

## System Processing

### Data Collection Structure
```yaml
facility_data:
  type: office
  total_area: 350
  floors: 2
  floor_breakdown:
    floor_1: 175
    floor_2: 175
    
room_inventory:
  offices:
    small: 3
    medium: 5
    large: 3
  meeting_rooms:
    small: 0
    medium: 1
    large: 0
  restrooms:
    single: 0
    multi_stall: 2
    
service_requirements:
  frequency: weekly
  timing: after_hours
  occupancy: false
  level: standard
  
special_features:
  server_room: false
  executive: false
  kitchen_size: large
  
operational:
  access_24_7: true
  security: true
  supplies: provided_by_cleaner
```

### Template Generation Logic

1. **Load Base Components**
   - Select primary module based on facility type
   - Load shared resources
   - Apply size modifiers

2. **Calculate Time Estimates**
   ```python
   def calculate_time(room_type, size, frequency, soil_level):
       base_time = ROOM_TIME_MATRIX[room_type][size]
       frequency_modifier = FREQUENCY_MODIFIERS[frequency]
       soil_modifier = SOIL_MODIFIERS[soil_level]
       
       return base_time * frequency_modifier * soil_modifier
   ```

3. **Build Room Sequence**
   - Apply route optimization
   - Group by floor
   - Order by clean-to-dirty

4. **Generate Custom Sections**
   - Include only relevant rooms
   - Add special requirements
   - Apply photo analysis insights

## Implementation Requirements

### 1. Question Engine
- Progressive questionnaire system
- Skip logic for conditional questions  
- Validation for numeric inputs
- Clear help text for each question

### 2. Photo Analysis Integration
- Accept multiple image formats
- Extract relevant cleaning information
- Identify room types and features
- Assess soil levels and challenges

### 3. Template Assembly
- Dynamic section generation
- Conditional content inclusion
- Time calculation engine
- Format validation

### 4. User Experience
- Save progress capability
- Back/edit previous answers
- Preview before finalization
- Export options (PDF, Word, etc.)

## Benefits of This Approach

1. **Simplicity**
   - No complex forms
   - Guided process
   - Clear, simple questions

2. **Accuracy**
   - Captures all needed details
   - Prevents missing information
   - Validates inputs

3. **Customization**
   - Truly tailored templates
   - Only relevant content included
   - Specific to actual facility

4. **Efficiency**
   - 10-15 minutes to complete
   - No cleaning knowledge required
   - Professional output

## Future Enhancements

### Phase 2 Features
- Multi-language support
- Voice input option
- Historical data learning
- Automated scheduling integration

### Phase 3 Features  
- Cost estimation
- Chemical quantity calculations
- Team size optimization
- Quality tracking integration

## Success Metrics

- Average completion time: <15 minutes
- Question abandonment rate: <5%
- Template accuracy: >95%
- User satisfaction: >90%

---

*This plan creates a user-friendly, question-based system that generates professional cleaning templates through simple interactions.*