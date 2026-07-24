"use client";

import { useId, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "./Checkbox";

type DatePickerType = "date" | "datetime" | "month" | "year";

interface DatePickerProps {
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
  className?: string;
  placeholder?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  type?: DatePickerType;
  currentToggle?: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
  };
}

const formatByType: Record<DatePickerType, string> = {
  date: "dd MMM yyyy",
  datetime: "dd MMM yyyy, HH:mm",
  month: "MMM yyyy",
  year: "yyyy",
};

const placeholderByType: Record<DatePickerType, string> = {
  date: "Select date",
  datetime: "Select date & time",
  month: "Select month",
  year: "Select year",
};

// Maps every react-day-picker part to your theme's Tailwind tokens instead of
// relying on the library's own stylesheet (which used its own color system).
const dayPickerClassNames = {
  months: "flex flex-col",
  month: "space-y-3",
  month_caption: "flex justify-center items-center h-9 relative",
  caption_label: "text-sm font-medium text-foreground",
  nav: "flex items-center justify-between absolute inset-x-0 top-0 h-9 px-1",
  button_previous: cn(
    "h-7 w-7 flex items-center justify-center rounded-md border border-border bg-card",
    "hover:bg-secondary transition-colors cursor-pointer",
  ),
  button_next: cn(
    "h-7 w-7 flex items-center justify-center rounded-md border border-border bg-card",
    "hover:bg-secondary transition-colors cursor-pointer",
  ),
  month_grid: "w-full border-collapse mt-2",
  weekdays: "flex",
  weekday:
    "text-muted-foreground text-xs font-medium w-9 h-9 flex items-center justify-center",
  week: "flex w-full",
  day: "h-9 w-9 text-center text-sm p-0 relative",
  day_button: cn(
    "h-9 w-9 rounded-md flex items-center justify-center text-sm transition-colors cursor-pointer",
    "hover:bg-secondary",
  ),
  selected:
    "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:opacity-90",
  today: "[&>button]:border [&>button]:border-primary/50",
  outside: "[&>button]:text-muted-foreground/40",
  disabled: "[&>button]:opacity-30 [&>button]:cursor-not-allowed",
  // `dropdowns` wraps each month/year control; `dropdown_root` is the visible
  // box; `dropdown` is the *actual* <select> and must stay invisible — it
  // sits on top of `dropdown_root` only to capture clicks/keyboard input.
  // `caption_label` is the visible text shown inside dropdown_root (the
  // library renders it as an aria-hidden span next to the hidden select).
  dropdowns: "flex gap-2 justify-center items-center",
  dropdown_root: cn(
    "relative inline-flex items-center gap-1 h-8 rounded-md border border-border bg-card px-2 text-sm",
    "hover:bg-secondary transition-colors cursor-pointer",
    "focus-within:ring-2 focus-within:ring-ring",
  ),
  dropdown: "absolute inset-0 opacity-0 cursor-pointer",
};

const navButtonClass = cn(
  "h-7 w-7 flex items-center justify-center rounded-md border border-border bg-card",
  "hover:bg-secondary transition-colors cursor-pointer",
);

function gridButtonClass(isSelected: boolean, isCurrent: boolean) {
  return cn(
    "h-9 rounded-md text-sm flex items-center justify-center transition-colors cursor-pointer hover:bg-secondary",
    isSelected &&
      "bg-primary text-primary-foreground hover:bg-primary hover:opacity-90",
    !isSelected && isCurrent && "border border-primary/50",
  );
}

function MonthGrid({
  value,
  onSelect,
}: {
  value?: Date;
  onSelect: (date: Date) => void;
}) {
  const [viewYear, setViewYear] = useState(
    value?.getFullYear() ?? new Date().getFullYear(),
  );
  const now = new Date();

  return (
    <div className="w-64">
      <div className="flex items-center justify-between h-9 mb-2">
        <button
          type="button"
          className={navButtonClass}
          onClick={() => setViewYear((y) => y - 1)}
          aria-label="Previous year"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-medium text-foreground">{viewYear}</span>
        <button
          type="button"
          className={navButtonClass}
          onClick={() => setViewYear((y) => y + 1)}
          aria-label="Next year"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }, (_, m) => m).map((m) => {
          const isSelected =
            value?.getFullYear() === viewYear && value?.getMonth() === m;
          const isCurrent =
            now.getFullYear() === viewYear && now.getMonth() === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onSelect(new Date(viewYear, m, 1))}
              className={gridButtonClass(isSelected, isCurrent)}
            >
              {format(new Date(viewYear, m, 1), "MMM")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YearGrid({
  value,
  onSelect,
}: {
  value?: Date;
  onSelect: (date: Date) => void;
}) {
  const initialStart =
    Math.floor((value?.getFullYear() ?? new Date().getFullYear()) / 12) * 12;
  const [decadeStart, setDecadeStart] = useState(initialStart);
  const years = Array.from({ length: 12 }, (_, i) => decadeStart + i);
  const now = new Date();

  return (
    <div className="w-64">
      <div className="flex items-center justify-between h-9 mb-2">
        <button
          type="button"
          className={navButtonClass}
          onClick={() => setDecadeStart((y) => y - 12)}
          aria-label="Previous years"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-medium text-foreground">
          {years[0]}–{years[years.length - 1]}
        </span>
        <button
          type="button"
          className={navButtonClass}
          onClick={() => setDecadeStart((y) => y + 12)}
          aria-label="Next years"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map((y) => {
          const isSelected = value?.getFullYear() === y;
          const isCurrent = now.getFullYear() === y;
          return (
            <button
              key={y}
              type="button"
              onClick={() => onSelect(new Date(y, 0, 1))}
              className={gridButtonClass(isSelected, isCurrent)}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DatePicker({
  label,
  error,
  hint,
  id,
  className,
  placeholder,
  value,
  onChange,
  disabled,
  currentToggle,
  type = "date",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const fieldId = id || generatedId;
  const isDisabled = disabled || currentToggle?.checked;
  const resolvedPlaceholder = placeholder ?? placeholderByType[type];

  return (
    <div className="flex flex-col gap-1.5">
      {(label || currentToggle) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={fieldId}
              className="text-sm font-medium text-foreground"
            >
              {label}
            </label>
          )}
          {currentToggle && (
            <Checkbox
              size="sm"
              label={currentToggle.label}
              checked={currentToggle.checked}
              onCheckedChange={currentToggle.onChange}
            />
          )}
        </div>
      )}

      <Popover.Root open={open && !isDisabled} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            id={fieldId}
            disabled={isDisabled}
            className={cn(
              "h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground",
              "flex items-center justify-between gap-2 text-left cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-ring transition-shadow duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary",
              error && "border-destructive focus:ring-destructive/50",
              className,
            )}
          >
            <span className={!value ? "text-muted-foreground" : ""}>
              {value ? format(value, formatByType[type]) : resolvedPlaceholder}
            </span>
            <CalendarDays
              size={14}
              className="text-muted-foreground shrink-0"
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className="rounded-md border border-border bg-card shadow-lg p-3 z-50"
          >
            {type === "month" && (
              <MonthGrid
                value={value}
                onSelect={(d) => {
                  onChange(d);
                  setOpen(false);
                }}
              />
            )}

            {type === "year" && (
              <YearGrid
                value={value}
                onSelect={(d) => {
                  onChange(d);
                  setOpen(false);
                }}
              />
            )}

            {(type === "date" || type === "datetime") && (
              <>
                <DayPicker
                  mode="single"
                  captionLayout="dropdown"
                  selected={value}
                  onSelect={(d) => {
                    if (!d) {
                      onChange(undefined);
                      return;
                    }
                    // Preserve whatever time was already set when the user
                    // just picks a different day.
                    if (type === "datetime" && value) {
                      d.setHours(value.getHours(), value.getMinutes());
                    }
                    onChange(d);
                    if (type === "date") setOpen(false);
                  }}
                  defaultMonth={value}
                  classNames={dayPickerClassNames}
                  components={{
                    Chevron: ({ orientation }) => {
                      if (orientation === "left")
                        return <ChevronLeft size={14} />;
                      if (orientation === "right")
                        return <ChevronRight size={14} />;
                      // "down" — the little caret inside each dropdown
                      return (
                        <ChevronDown
                          size={12}
                          className="text-muted-foreground"
                        />
                      );
                    },
                  }}
                />
                {type === "datetime" && (
                  <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
                    <label
                      htmlFor={`${fieldId}-time`}
                      className="text-xs text-muted-foreground shrink-0"
                    >
                      Time
                    </label>
                    <input
                      id={`${fieldId}-time`}
                      type="time"
                      className="h-8 flex-1 rounded-md border border-border bg-card px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={value ? format(value, "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value
                          .split(":")
                          .map(Number);
                        const base = value ? new Date(value) : new Date();
                        base.setHours(hours || 0, minutes || 0, 0, 0);
                        onChange(base);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export { DatePicker };
export type { DatePickerType };
