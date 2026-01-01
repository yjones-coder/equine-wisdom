# Feeding Schedule Calendar Research

## Horse Feeding Best Practices

### Feeding Frequency
- **Minimum**: 2 times per day (morning and evening)
- **Optimal**: 3-5 times per day to mimic natural grazing
- **Never exceed**: 5 lbs of concentrate per single feeding

### Typical Feeding Times
- **2x daily**: 7 AM and 7 PM (10-hour fasting gap - not ideal)
- **3x daily**: 6 AM, 12 PM, 6 PM (reduces fasting significantly)
- **Optimal 3x**: 5 AM, 1 PM, 9 PM (less than 8-hour fasting)
- **4-5x daily**: 6 AM, noon, 6 PM, midnight (labor intensive)

### Feed Categories
1. **Forage/Hay** - Primary feed, should be available most of day
2. **Concentrate/Grain** - Supplemental energy, limited portions
3. **Supplements** - Vitamins, minerals, joint support
4. **Treats** - Occasional rewards

### Key Considerations
- Horses naturally graze ~17 hours per day
- Constant stomach acid secretion requires regular feeding
- Long fasting periods can cause gastric ulcers and colic
- Hay nets can extend eating time, mimicking natural grazing

---

## UX Design Patterns for Recurring Schedules

### Three Core Components (from Medium article)
1. **Appointment Time** - Start/end date and time
2. **Recurrence Pattern** - Daily, weekly, monthly frequency
3. **Summary** - Visual confirmation of selections

### Best Practices

#### Time Input
- Support both 24-hour and AM/PM formats
- Show duration hints alongside end time
- Provide pre-defined time slots in dropdown (reduces typing)
- Avoid forcing keyboard/mouse switching

#### Date Selection
- Use abbreviated months to avoid confusion (Jan vs 01)
- Prevent selecting end date before start date
- Support "After X occurrences" option
- Include "No end date" option for ongoing schedules

#### Recurrence Settings
- Default recurrence value to 1 (error prevention)
- Combine value + unit (e.g., "Every 2 days")
- Options: Daily, Weekly, Monthly, Yearly

#### Summary/Preview
- Show text summary of all selections
- Optional: Visual calendar preview with highlighted dates
- Allow quick verification before saving

---

## Implementation Approach for Equine Wisdom

### Recommended Structure

```
Feeding Schedule
├── Schedule Type (preset or custom)
│   ├── 2x Daily (Morning/Evening)
│   ├── 3x Daily (Morning/Noon/Evening)
│   ├── Custom Schedule
│
├── Feeding Slots (expandable cards)
│   ├── Morning Feeding
│   │   ├── Time (with picker)
│   │   ├── Hay Amount
│   │   ├── Grain Amount
│   │   ├── Supplements (multi-select)
│   │   └── Notes
│   │
│   ├── Noon Feeding
│   │   └── (same fields)
│   │
│   └── Evening Feeding
│       └── (same fields)
│
├── Weekly Variations (optional)
│   └── Different schedule for specific days
│
└── Summary View
    └── Weekly calendar preview
```

### Feed Categories for Input

| Category | Input Type | Units | Notes |
|----------|-----------|-------|-------|
| Hay | Number input | lbs/flakes | Primary forage |
| Grain/Concentrate | Number input | lbs/cups | Limited per meal |
| Supplements | Multi-select chips | varies | From predefined list |
| Water | Checkbox | - | Fresh water reminder |
| Treats | Text input | optional | Special treats |

### Component Options (shadcn/ui compatible)

1. **Calendar** - shadcn/ui Calendar (react-day-picker based)
2. **Time Picker** - Custom time select or input
3. **Tabs** - For switching between feeding slots
4. **Cards** - For each feeding slot details
5. **Select** - For preset schedules
6. **Multi-select** - For supplements

### Database Schema Updates Needed

```sql
-- New feeding_schedules table
CREATE TABLE feeding_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  horse_id INT NOT NULL,
  schedule_type ENUM('2x_daily', '3x_daily', 'custom'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Feeding slots for each schedule
CREATE TABLE feeding_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  schedule_id INT NOT NULL,
  slot_name VARCHAR(50), -- 'morning', 'noon', 'evening', 'night'
  feed_time TIME,
  hay_amount DECIMAL(5,2),
  hay_unit VARCHAR(20),
  grain_amount DECIMAL(5,2),
  grain_unit VARCHAR(20),
  supplements JSON, -- Array of supplement names
  notes TEXT
);

-- Weekly variations (optional)
CREATE TABLE feeding_variations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slot_id INT NOT NULL,
  day_of_week TINYINT, -- 0-6 (Sunday-Saturday)
  override_time TIME,
  override_hay DECIMAL(5,2),
  override_grain DECIMAL(5,2)
);
```

---

## UI Mockup Concept

### Step 1: Choose Schedule Type
```
┌─────────────────────────────────────────────┐
│ How often do you feed your horse?           │
│                                             │
│ ○ 2x Daily (Morning & Evening)              │
│ ○ 3x Daily (Morning, Noon & Evening)  ←     │
│ ○ Custom Schedule                           │
└─────────────────────────────────────────────┘
```

### Step 2: Configure Each Feeding
```
┌─────────────────────────────────────────────┐
│ [Morning] [Noon] [Evening]                  │
├─────────────────────────────────────────────┤
│ 🌅 Morning Feeding                          │
│                                             │
│ Time: [6:00 AM ▼]                           │
│                                             │
│ ┌─────────────────┬─────────────────┐       │
│ │ 🌾 Hay          │ 🌽 Grain        │       │
│ │ [3] flakes      │ [2] lbs         │       │
│ └─────────────────┴─────────────────┘       │
│                                             │
│ 💊 Supplements: [Joint +] [Vitamin E +]     │
│                                             │
│ 📝 Notes: ___________________________       │
└─────────────────────────────────────────────┘
```

### Step 3: Weekly Calendar Preview
```
┌─────────────────────────────────────────────┐
│ Weekly Schedule Preview                      │
├─────────────────────────────────────────────┤
│      Mon   Tue   Wed   Thu   Fri   Sat  Sun │
│ 6AM   🌾    🌾    🌾    🌾    🌾    🌾    🌾  │
│ 12PM  🌾    🌾    🌾    🌾    🌾    🌾    🌾  │
│ 6PM   🌾    🌾    🌾    🌾    🌾    🌾    🌾  │
└─────────────────────────────────────────────┘
```
