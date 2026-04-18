# Amvasdev UI - Component Usage Guide

This guide provides comprehensive examples and instructions for using components, hooks, and utilities in the amvasdev-ui library.

## Installation & Setup

```bash
npm install amvasdev-ui
```

```jsx
// Import CSS at the root of your application
import "amvasdev-ui/dist/index.css";

// Import components
import { Button, Input, Modal } from "amvasdev-ui";
```

## Components

### Button

The Button component supports various sizes, variants, loading states, and styling options.

```jsx
import { Button } from "amvasdev-ui";

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="error">Error</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// Loading state
<Button isLoading>Loading...</Button>
<Button
  isLoading
  loadingStyles={{ type: "dots", size: "sm" }}
  disabledOnLoading={false}
>
  Custom Loading
</Button>

// Outlined style
<Button variant="primary" outlined>Outlined</Button>
```

**Available variants:** `base`, `neutral`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`, `ghost`, `link`

**Available sizes:** `xs`, `sm`, `md`, `lg`

**Loading types:** `spin`, `dots`, `ring`, `ball`, `bars`, `infinity`

### Input

The Input component provides form inputs with labels, icons, validation, and various styling options.

```jsx
import { Input } from "amvasdev-ui";
import { Search, User } from "lucide-react";

// Basic usage
<Input id="username" label="Username" />

// With icons
<Input
  id="search"
  label="Search"
  leftIcon={<Search size={16} />}
  placeholder="Search..."
/>

<Input
  id="profile"
  label="Profile"
  rightIcon={<User size={16} />}
/>

// Variants and sizes
<Input id="email" variant="primary" size="lg" />
<Input id="error-input" variant="error" errorMessage="This field is required" />

// Required field
<Input id="required" label="Required Field" required />

// Custom styling
<Input
  id="custom"
  className="custom-input-class"
  labelClassName="custom-label-class"
/>
```

**Available variants:** `base`, `ghost`, `primary`, `secondary`, `accent`, `success`, `info`, `warning`, `error`

**Available sizes:** `xs`, `sm`, `md`, `lg`

### PasswordInput

```jsx
import { PasswordInput } from "amvasdev-ui";

<PasswordInput
  id="password"
  label="Password"
  placeholder="Enter your password"
/>;
```

### Modal

The Modal component provides a flexible dialog with customizable close behavior and action buttons.

```jsx
import { Modal } from "amvasdev-ui";
import { useState } from "react";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      {isOpen && (
        <Modal
          onClose={() => setIsOpen(false)}
          title="Confirmation"
          closeOnClickOutside={true}
          closeOnEsc={true}
          showCloseButton={true}
        >
          <p>Are you sure you want to continue?</p>
        </Modal>
      )}
    </>
  );
}

// Modal with action buttons
<Modal
  onClose={() => setIsOpen(false)}
  title="Delete Item"
  cancelButton={{
    children: "Cancel",
    variant: "ghost",
  }}
  confirmButton={{
    children: "Delete",
    variant: "error",
    onClick: () => console.log("Deleted!"),
  }}
  closeOnCancel={true}
  closeOnConfirm={true}
>
  <p>This action cannot be undone.</p>
</Modal>;
```

### Combobox

The Combobox component provides searchable dropdown functionality with custom options.

```jsx
import { Combobox } from "amvasdev-ui";
import { useState } from "react";

function App() {
  const [value, setValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    { id: "1", text: "Apple" },
    { id: "2", text: "Banana" },
    { id: "3", text: "Cherry" },
    { id: "4", text: "Date" },
  ];

  return (
    <Combobox
      id="fruits"
      name="fruits"
      label="Select a fruit"
      options={options}
      value={value}
      onChange={setValue}
      selectedOption={selectedOption}
      onSelect={setSelectedOption}
      placeholder="Search fruits..."
      optionLimit={5}
    />
  );
}

// With custom option content
const optionsWithContent = [
  {
    id: "1",
    text: "Apple",
    content: (
      <div>
        <strong>Apple</strong> - Red fruit
      </div>
    ),
  },
];
```

### Calendar

The Calendar component provides a date picker interface using react-day-picker with daisyUI styling.

```jsx
import { Calendar } from "amvasdev-ui";
import { useState } from "react";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <Calendar
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  );
}

// With date range
<Calendar
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
  fromDate={new Date(2024, 0, 1)} // January 1, 2024
  toDate={new Date(2024, 11, 31)} // December 31, 2024
/>

// Custom styling
<Calendar
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
  className="ui:w-96 ui:shadow-xl"
/>
```

**Calendar Props:**
- `selectedDate?: Date` - Currently selected date
- `onDateChange?: (date: Date | undefined) => void` - Callback when date is selected
- `fromDate?: Date` - Minimum selectable date
- `toDate?: Date` - Maximum selectable date
- `disabled?: any` - Disabled dates (Date, Date[], or range objects)
- `showOutsideDays?: boolean` - Show days from previous/next months
- `className?: ClassValue` - Additional CSS classes

### DateInput

The DateInput component provides a form input with integrated calendar picker functionality.

```jsx
import { DateInput } from "amvasdev-ui";
import { useState } from "react";

function App() {
  const [selectedDate, setSelectedDate] = useState();

  return (
    <DateInput
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      label="Birth Date"
      placeholder="Select your birth date"
    />
  );
}

// With validation
<DateInput
  selectedDate={selectedDate}
  setSelectedDate={setSelectedDate}
  label="Event Date"
  required
  errorMessage="Please select a date"
/>

// Different sizes
<DateInput size="sm" />
<DateInput size="md" /> {/* default */}
<DateInput size="lg" />

// With date constraints
<DateInput
  selectedDate={selectedDate}
  setSelectedDate={setSelectedDate}
  label="Appointment Date"
  fromDate={new Date()} // Today onwards
  toDate={new Date(2024, 11, 31)} // Until end of 2024
/>

// Custom formatting and locale
import { es } from "date-fns/locale";

<DateInput
  selectedDate={selectedDate}
  setSelectedDate={setSelectedDate}
  dateLocale={es} // Spanish locale
  placeholder="Selecciona una fecha"
/>

// Without calendar icon
<DateInput
  selectedDate={selectedDate}
  setSelectedDate={setSelectedDate}
  showCalendarIcon={false}
/>
```

**DateInput Props:**
- `selectedDate?: Date` - Currently selected date
- `setSelectedDate: (date: Date | undefined) => void` - Function to update selected date
- `label?: string` - Input label text
- `required?: boolean` - Mark field as required
- `placeholder?: string` - Placeholder text when no date selected
- `dateLocale?: Locale` - date-fns locale for formatting (default: enUS)
- `size?: "sm" | "md" | "lg"` - Input size (default: "md")
- `calendarIcon?: ReactNode` - Custom calendar icon
- `showCalendarIcon?: boolean` - Show/hide calendar icon (default: true)
- `errorMessage?: string` - Error message to display
- `matchInputWidth?: boolean` - Match calendar width to input (default: true)
- `calendarClassName?: ClassValue` - Additional CSS classes for calendar
- `fromDate?: Date` - Minimum selectable date
- `toDate?: Date` - Maximum selectable date
- `disabled?: any` - Disabled dates (Date, Date[], or range objects)
- `showOutsideDays?: boolean` - Show days from previous/next months
- `className?: ClassValue` - Additional CSS classes for container

### Select

```jsx
import { Select } from "amvasdev-ui";

const options = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
];

<Select id="select" label="Choose an option" options={options} size="md" />;
```

### RadioGroup

```jsx
import { RadioGroup } from "amvasdev-ui";

const options = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

<RadioGroup
  name="confirmation"
  options={options}
  orientation="horizontal"
  size="md"
  variant="primary"
/>;
```

### Checkbox

```jsx
import { Checkbox } from "amvasdev-ui";

<Checkbox id="terms" label="I agree to the terms and conditions" required />;
```

### DateInput

```jsx
import { DateInput } from "amvasdev-ui";

<DateInput
  id="birthdate"
  label="Birth Date"
  onChange={(date) => console.log(date)}
/>;
```

### Tooltip

```jsx
import { Tooltip } from "amvasdev-ui";

<Tooltip content="This is a helpful tooltip">
  <Button>Hover me</Button>
</Tooltip>;
```

### Dropdown

```jsx
import { Dropdown } from "amvasdev-ui";

<Dropdown trigger={<Button>Menu</Button>} position="bottom-start">
  <li>
    <a>Profile</a>
  </li>
  <li>
    <a>Settings</a>
  </li>
  <li>
    <a>Logout</a>
  </li>
</Dropdown>;
```

### Breadcrumbs

```jsx
import { Breadcrumbs } from "amvasdev-ui";

const items = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { label: "Current Page" },
];

<Breadcrumbs items={items} />;
```

### ActionModal

```jsx
import { ActionModal } from "amvasdev-ui";

<ActionModal
  type="success"
  title="Success!"
  message="Your action was completed successfully."
  onClose={() => setIsOpen(false)}
/>;
```

### ColorPalette

```jsx
import { ColorPalette } from "amvasdev-ui";

<ColorPalette
  colors={["#ff0000", "#00ff00", "#0000ff"]}
  onColorSelect={(color) => console.log(color)}
/>;
```

### IconButton

```jsx
import { IconButton } from "amvasdev-ui";
import { Settings } from "lucide-react";

<IconButton
  icon={<Settings size={16} />}
  onClick={() => console.log("Settings clicked")}
/>;
```

## Hooks

### useClosableContainer

Hook for managing closable containers like modals, dropdowns, and popovers.

```jsx
import { useClosableContainer } from "amvasdev-ui";
import { useRef } from "react";

function MyModal({ onClose }) {
  const ref = useRef(null);
  const { isClosing, handleClose } = useClosableContainer(ref, onClose, {
    closeTimeout: 300,
    closeOnEsc: true,
    closeOnClickOutside: true,
  });

  return (
    <div
      ref={ref}
      className={isClosing ? "animate-fade-out" : "animate-fade-in"}
    >
      <button onClick={handleClose}>Close</button>
      <p>Modal content</p>
    </div>
  );
}
```

**Options:**

- `closeTimeout` - Animation duration before calling onClose (default: 280ms)
- `closeOnEsc` - Close when Escape key is pressed (default: true)
- `closeOnClickOutside` - Close when clicking outside (default: true)

### useThemeChange

Hook for changing daisyUI themes dynamically.

```jsx
import { useThemeChange } from "amvasdev-ui";

function ThemeSelector() {
  const { changeTheme } = useThemeChange();

  return (
    <select onChange={(e) => changeTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="emerald">Emerald</option>
      <option value="dracula">Dracula</option>
      <option value="winter">Winter</option>
      <option value="night">Night</option>
      <option value="halloween">Halloween</option>
      <option value="autumn">Autumn</option>
      <option value="business">Business</option>
      <option value="nord">Nord</option>
      <option value="dim">Dim</option>
      <option value="lemonade">Lemonade</option>
      <option value="sunset">Sunset</option>
      <option value="valentine">Valentine</option>
    </select>
  );
}
```

### useEventListener

Hook for adding event listeners with automatic cleanup.

```jsx
import { useEventListener } from "amvasdev-ui";
import { useRef } from "react";

function MyComponent() {
  const buttonRef = useRef(null);

  // Listen to window events
  useEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      console.log("Escape key pressed");
    }
  });

  // Listen to element events
  useEventListener(
    "click",
    (event) => {
      console.log("Button clicked");
    },
    buttonRef
  );

  return <button ref={buttonRef}>Click me</button>;
}
```

### useOnClickOutside

Hook for detecting clicks outside of an element.

```jsx
import { useOnClickOutside } from "amvasdev-ui";
import { useRef, useState } from "react";

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useOnClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });

  return (
    <div ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  );
}
```

### useToggle

Hook for toggling boolean values.

```jsx
import { useToggle } from "amvasdev-ui";

function ToggleExample() {
  const [isVisible, toggleVisibility] = useToggle(false);
  const [isEnabled, toggleEnabled] = useToggle(true);

  return (
    <div>
      <button onClick={toggleVisibility}>{isVisible ? "Hide" : "Show"}</button>
      <button onClick={toggleEnabled}>
        {isEnabled ? "Disable" : "Enable"}
      </button>
    </div>
  );
}
```

### useIsomorphicLayoutEffect

Hook that uses useLayoutEffect on the client and useEffect on the server (for SSR compatibility).

```jsx
import { useIsomorphicLayoutEffect } from "amvasdev-ui";
import { useState } from "react";

function ResponsiveComponent() {
  const [width, setWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const updateWidth = () => setWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return <div>Width: {width}px</div>;
}
```

## Utilities

### Button Utilities

```jsx
import { getButtonClasses, getButtonVariant, getButtonSize } from "amvasdev-ui";

// Get complete button classes
const buttonClasses = getButtonClasses({
  variant: "primary",
  size: "lg",
  outlined: true,
});

// Get only variant classes
const variantClasses = getButtonVariant("primary");

// Get only size classes
const sizeClasses = getButtonSize("lg");
```

### Input Utilities

```jsx
import { getInputClasses, getInputVariant, getInputSize } from "amvasdev-ui";

// Get complete input classes
const inputClasses = getInputClasses({
  variant: "primary",
  size: "md",
  bordered: true,
});

// Get only variant classes
const variantClasses = getInputVariant("primary");

// Get only size classes
const sizeClasses = getInputSize("md");
```

### Loading Utilities

```jsx
import { getLoadingClasses } from "amvasdev-ui";

// Get loading spinner classes
const loadingClasses = getLoadingClasses({
  type: "spin",
  size: "md",
});

// Use in custom component
<span className={`loading ${loadingClasses}`} />;
```

**Loading types:** `spin`, `dots`, `ring`, `ball`, `bars`, `infinity`

**Loading sizes:** `xs`, `sm`, `md`, `lg`

## Theme System

The library includes 14 predefined daisyUI themes:

```jsx
import { THEME_LIST } from "amvasdev-ui";

console.log(THEME_LIST);
// ["emerald", "dracula", "winter", "night", "light", "halloween",
//  "autumn", "business", "nord", "dim", "lemonade", "sunset", "valentine"]
```

## Styling Notes

- All components use the `ui:` prefix for TailwindCSS classes to prevent conflicts
- Components are built with daisyUI styling system
- Custom animations are available: `fade-in`, `fade-out`, `to-top`, `to-bottom`, `scale-up`, `scale-down`
- Safari-specific styling variant `safari-only:` is available for browser-specific fixes
- Always import the CSS file in your root component: `import "amvasdev-ui/dist/index.css"`

## TypeScript Support

All components are fully typed with TypeScript. Import types as needed:

```tsx
import {
  ButtonProps,
  InputProps,
  ModalProps,
  ComboboxProps,
  IComboboxOption,
  ButtonVariant,
  InputSize,
} from "amvasdev-ui";
```
