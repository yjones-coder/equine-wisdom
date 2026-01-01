import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Sun, 
  Sunset, 
  Moon,
  Plus,
  X,
  Clock,
  Wheat,
  Apple,
  Pill,
  Droplets,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types for feeding schedule
export interface FeedingSlot {
  id: string;
  name: string;
  time: string;
  icon: "morning" | "noon" | "evening" | "night" | "custom";
  hay: {
    amount: number;
    unit: "flakes" | "lbs" | "kg";
  };
  grain: {
    amount: number;
    unit: "lbs" | "cups" | "kg";
    type: string;
  };
  supplements: string[];
  water: boolean;
  notes: string;
}

export interface FeedingSchedule {
  type: "2x_daily" | "3x_daily" | "4x_daily" | "custom";
  slots: FeedingSlot[];
  weeklyVariations: boolean;
  variations: {
    dayOfWeek: number;
    slotId: string;
    changes: Partial<FeedingSlot>;
  }[];
}

// Common supplements list
const COMMON_SUPPLEMENTS = [
  "Joint Support",
  "Vitamin E",
  "Biotin",
  "Electrolytes",
  "Probiotics",
  "Omega-3",
  "Magnesium",
  "Salt Block",
  "Selenium",
  "Hoof Supplement",
];

// Time presets
const TIME_PRESETS = [
  { label: "5:00 AM", value: "05:00" },
  { label: "6:00 AM", value: "06:00" },
  { label: "7:00 AM", value: "07:00" },
  { label: "8:00 AM", value: "08:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "1:00 PM", value: "13:00" },
  { label: "5:00 PM", value: "17:00" },
  { label: "6:00 PM", value: "18:00" },
  { label: "7:00 PM", value: "19:00" },
  { label: "9:00 PM", value: "21:00" },
];

// Default slot configurations
const DEFAULT_SLOTS: Record<string, FeedingSlot> = {
  morning: {
    id: "morning",
    name: "Morning Feeding",
    time: "06:00",
    icon: "morning",
    hay: { amount: 3, unit: "flakes" },
    grain: { amount: 2, unit: "lbs", type: "" },
    supplements: [],
    water: true,
    notes: "",
  },
  noon: {
    id: "noon",
    name: "Noon Feeding",
    time: "12:00",
    icon: "noon",
    hay: { amount: 2, unit: "flakes" },
    grain: { amount: 0, unit: "lbs", type: "" },
    supplements: [],
    water: true,
    notes: "",
  },
  evening: {
    id: "evening",
    name: "Evening Feeding",
    time: "18:00",
    icon: "evening",
    hay: { amount: 3, unit: "flakes" },
    grain: { amount: 2, unit: "lbs", type: "" },
    supplements: [],
    water: true,
    notes: "",
  },
  night: {
    id: "night",
    name: "Night Feeding",
    time: "21:00",
    icon: "night",
    hay: { amount: 2, unit: "flakes" },
    grain: { amount: 0, unit: "lbs", type: "" },
    supplements: [],
    water: false,
    notes: "",
  },
};

// Schedule presets
const SCHEDULE_PRESETS = {
  "2x_daily": {
    label: "2x Daily",
    description: "Morning & Evening (most common)",
    slots: ["morning", "evening"],
  },
  "3x_daily": {
    label: "3x Daily",
    description: "Morning, Noon & Evening (recommended)",
    slots: ["morning", "noon", "evening"],
  },
  "4x_daily": {
    label: "4x Daily",
    description: "Morning, Noon, Evening & Night",
    slots: ["morning", "noon", "evening", "night"],
  },
  custom: {
    label: "Custom",
    description: "Create your own schedule",
    slots: [],
  },
};

interface FeedingScheduleBuilderProps {
  value?: FeedingSchedule;
  onChange: (schedule: FeedingSchedule) => void;
  compact?: boolean;
}

// Icon component for feeding slots
function SlotIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "morning":
      return <Sun className={cn("text-amber-500", className)} />;
    case "noon":
      return <Sun className={cn("text-yellow-500", className)} />;
    case "evening":
      return <Sunset className={cn("text-orange-500", className)} />;
    case "night":
      return <Moon className={cn("text-indigo-500", className)} />;
    default:
      return <Clock className={cn("text-gray-500", className)} />;
  }
}

// Format time for display
function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Supplement selector component
function SupplementSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (supplements: string[]) => void;
}) {
  const [customSupplement, setCustomSupplement] = useState("");

  const toggleSupplement = (supplement: string) => {
    if (selected.includes(supplement)) {
      onChange(selected.filter((s) => s !== supplement));
    } else {
      onChange([...selected, supplement]);
    }
  };

  const addCustomSupplement = () => {
    if (customSupplement.trim() && !selected.includes(customSupplement.trim())) {
      onChange([...selected, customSupplement.trim()]);
      setCustomSupplement("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {COMMON_SUPPLEMENTS.map((supplement) => (
          <Badge
            key={supplement}
            variant={selected.includes(supplement) ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              selected.includes(supplement)
                ? "bg-green-600 hover:bg-green-700"
                : "hover:bg-muted"
            )}
            onClick={() => toggleSupplement(supplement)}
          >
            {selected.includes(supplement) && <Check className="w-3 h-3 mr-1" />}
            {supplement}
          </Badge>
        ))}
      </div>
      
      {/* Custom supplement input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add custom supplement..."
          value={customSupplement}
          onChange={(e) => setCustomSupplement(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSupplement())}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addCustomSupplement}
          disabled={!customSupplement.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Show custom supplements that aren't in the common list */}
      {selected.filter((s) => !COMMON_SUPPLEMENTS.includes(s)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected
            .filter((s) => !COMMON_SUPPLEMENTS.includes(s))
            .map((supplement) => (
              <Badge
                key={supplement}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                onClick={() => toggleSupplement(supplement)}
              >
                <Check className="w-3 h-3 mr-1" />
                {supplement}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}

// Single feeding slot editor
function FeedingSlotEditor({
  slot,
  onChange,
  onRemove,
  canRemove,
}: {
  slot: FeedingSlot;
  onChange: (slot: FeedingSlot) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <SlotIcon icon={slot.icon} className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base">{slot.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(slot.time)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canRemove && onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Feeding Time
            </Label>
            <Select
              value={slot.time}
              onValueChange={(value) => onChange({ ...slot, time: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Hay & Grain */}
          <div className="grid grid-cols-2 gap-4">
            {/* Hay */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-600" />
                Hay
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={slot.hay.amount}
                  onChange={(e) =>
                    onChange({
                      ...slot,
                      hay: { ...slot.hay, amount: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-20"
                />
                <Select
                  value={slot.hay.unit}
                  onValueChange={(value: "flakes" | "lbs" | "kg") =>
                    onChange({ ...slot, hay: { ...slot.hay, unit: value } })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flakes">flakes</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grain */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Apple className="w-4 h-4 text-orange-600" />
                Grain/Concentrate
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={0.25}
                  value={slot.grain.amount}
                  onChange={(e) =>
                    onChange({
                      ...slot,
                      grain: { ...slot.grain, amount: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-20"
                />
                <Select
                  value={slot.grain.unit}
                  onValueChange={(value: "lbs" | "cups" | "kg") =>
                    onChange({ ...slot, grain: { ...slot.grain, unit: value } })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="cups">cups</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Grain Type */}
          <div className="space-y-2">
            <Label>Grain Type (optional)</Label>
            <Input
              placeholder="e.g., Sweet feed, Pellets, Senior feed..."
              value={slot.grain.type}
              onChange={(e) =>
                onChange({
                  ...slot,
                  grain: { ...slot.grain, type: e.target.value },
                })
              }
            />
          </div>

          <Separator />

          {/* Supplements */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-green-600" />
              Supplements
            </Label>
            <SupplementSelector
              selected={slot.supplements}
              onChange={(supplements) => onChange({ ...slot, supplements })}
            />
          </div>

          <Separator />

          {/* Water & Notes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                Fresh Water Check
              </Label>
              <Switch
                checked={slot.water}
                onCheckedChange={(checked) => onChange({ ...slot, water: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any special instructions for this feeding..."
                value={slot.notes}
                onChange={(e) => onChange({ ...slot, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Weekly calendar preview
function WeeklyPreview({ schedule }: { schedule: FeedingSchedule }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Weekly Schedule Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Time</th>
                {days.map((day) => (
                  <th key={day} className="text-center py-2 px-2 font-medium text-muted-foreground">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.slots.map((slot) => (
                <tr key={slot.id} className="border-t">
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <SlotIcon icon={slot.icon} className="w-4 h-4" />
                      <span>{formatTime(slot.time)}</span>
                    </div>
                  </td>
                  {days.map((day) => (
                    <td key={day} className="text-center py-2 px-2">
                      <div className="flex justify-center gap-1">
                        {slot.hay.amount > 0 && (
                          <span title="Hay">🌾</span>
                        )}
                        {slot.grain.amount > 0 && (
                          <span title="Grain">🌽</span>
                        )}
                        {slot.supplements.length > 0 && (
                          <span title="Supplements">💊</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Main component
export function FeedingScheduleBuilder({
  value,
  onChange,
  compact = false,
}: FeedingScheduleBuilderProps) {
  const [schedule, setSchedule] = useState<FeedingSchedule>(
    value || {
      type: "3x_daily",
      slots: [
        { ...DEFAULT_SLOTS.morning },
        { ...DEFAULT_SLOTS.noon },
        { ...DEFAULT_SLOTS.evening },
      ],
      weeklyVariations: false,
      variations: [],
    }
  );

  const updateSchedule = useCallback(
    (updates: Partial<FeedingSchedule>) => {
      const newSchedule = { ...schedule, ...updates };
      setSchedule(newSchedule);
      onChange(newSchedule);
    },
    [schedule, onChange]
  );

  const handleTypeChange = (type: FeedingSchedule["type"]) => {
    const preset = SCHEDULE_PRESETS[type];
    const newSlots = preset.slots.map((slotId) => ({
      ...DEFAULT_SLOTS[slotId],
      id: slotId,
    }));
    updateSchedule({ type, slots: newSlots });
  };

  const updateSlot = (index: number, slot: FeedingSlot) => {
    const newSlots = [...schedule.slots];
    newSlots[index] = slot;
    updateSchedule({ slots: newSlots });
  };

  const removeSlot = (index: number) => {
    const newSlots = schedule.slots.filter((_, i) => i !== index);
    updateSchedule({ slots: newSlots, type: "custom" });
  };

  const addCustomSlot = () => {
    const newSlot: FeedingSlot = {
      id: `custom-${Date.now()}`,
      name: `Feeding ${schedule.slots.length + 1}`,
      time: "12:00",
      icon: "custom",
      hay: { amount: 2, unit: "flakes" },
      grain: { amount: 0, unit: "lbs", type: "" },
      supplements: [],
      water: true,
      notes: "",
    };
    updateSchedule({ slots: [...schedule.slots, newSlot], type: "custom" });
  };

  return (
    <div className="space-y-6">
      {/* Schedule Type Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">How often do you feed your horse?</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(SCHEDULE_PRESETS) as [FeedingSchedule["type"], typeof SCHEDULE_PRESETS["2x_daily"]][]).map(
            ([type, preset]) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all",
                  schedule.type === type
                    ? "border-amber-500 bg-amber-50"
                    : "border-border hover:border-amber-300 hover:bg-muted/50"
                )}
              >
                <div className="font-medium">{preset.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {preset.description}
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Important Note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>Tip:</strong> Horses naturally graze throughout the day. Feeding 3+ times daily 
          helps prevent digestive issues and mimics natural eating patterns. Never exceed 5 lbs 
          of grain per feeding.
        </div>
      </div>

      {/* Feeding Slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Feeding Schedule Details</Label>
          {schedule.type === "custom" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomSlot}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feeding
            </Button>
          )}
        </div>

        <Tabs defaultValue={schedule.slots[0]?.id} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            {schedule.slots.map((slot) => (
              <TabsTrigger
                key={slot.id}
                value={slot.id}
                className="flex items-center gap-2"
              >
                <SlotIcon icon={slot.icon} className="w-4 h-4" />
                {slot.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {schedule.slots.map((slot, index) => (
            <TabsContent key={slot.id} value={slot.id} className="mt-4">
              <FeedingSlotEditor
                slot={slot}
                onChange={(updatedSlot) => updateSlot(index, updatedSlot)}
                onRemove={() => removeSlot(index)}
                canRemove={schedule.slots.length > 1}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Weekly Preview */}
      {!compact && schedule.slots.length > 0 && (
        <WeeklyPreview schedule={schedule} />
      )}

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-600" />
            <span>
              <strong>{schedule.slots.length}</strong> feeding{schedule.slots.length !== 1 ? "s" : ""} per day
              {schedule.slots.some(s => s.supplements.length > 0) && (
                <> with <strong>{schedule.slots.reduce((acc, s) => acc + s.supplements.length, 0)}</strong> supplement{schedule.slots.reduce((acc, s) => acc + s.supplements.length, 0) !== 1 ? "s" : ""}</>
              )}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FeedingScheduleBuilder;
