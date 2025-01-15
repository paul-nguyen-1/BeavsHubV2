import { Autocomplete, CloseButton } from "@mantine/core";
import {
  lowerDivisionOne,
  lowerDivisionTwo,
  upperDivisionOne,
  upperDivisionTwo,
} from "../../lib/const";

interface SelectMantineProps {
  value: string | null;
  onChange: (value: string | null) => void;
  charSize?: number;
}

export default function SelectMantine({
  value,
  onChange,
  charSize,
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
      label="All Classes"
      placeholder="Pick a class"
      value={value || ""}
      onChange={handleInputChange}
      data={[
        { group: "100-199", items: lowerDivisionOne },
        { group: "200-299", items: lowerDivisionTwo },
        { group: "300-399", items: upperDivisionOne },
        { group: "400-499", items: upperDivisionTwo },
      ]}
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
