import { Autocomplete, CloseButton } from "@mantine/core";

interface SelectMantineProps {
  value: string | null;
  onChange: (value: string | null) => void;
  charSize?: number;
  label?: string;
  placeHolder?: string;
  data: string[];
}

export default function SelectMantine({
  value,
  onChange,
  charSize,
  label,
  placeHolder,
  data,
}: SelectMantineProps) {
  const handleInputChange = (inputValue: string | null) => {
    if (inputValue && charSize) {
      const limitedValue = inputValue.slice(0, charSize);
      onChange(limitedValue);
    } else {
      onChange(inputValue);
    }
  };

  return (
    <Autocomplete
      label={label}
      placeholder={placeHolder}
      value={value || ""}
      onChange={handleInputChange}
      data={data}
      rightSection={
        value ? (
          <CloseButton
            aria-label="Clear input"
            onClick={() => onChange(null)}
          />
        ) : null
      }
    />
  );
}
