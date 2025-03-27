import { Autocomplete, CloseButton } from "@mantine/core";
import { useNavigate, useRouterState } from "@tanstack/react-router";

interface SelectMantineProps {
  value: string | null;
  onChange: (value: string | null) => void;
  charSize?: number;
  label?: string;
  placeHolder?: string;
  data: string[];
  isPrimarySelector?: boolean;
}

export default function SelectMantine({
  value,
  onChange,
  charSize,
  label,
  placeHolder,
  data,
  isPrimarySelector,
}: SelectMantineProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const handleInputChange = (inputValue: string | null) => {
    if (inputValue && charSize) {
      const limitedValue = inputValue.slice(0, charSize);
      onChange(limitedValue);
    } else {
      onChange(inputValue);
    }
    if (routerState.location.pathname !== "/courses") {
      navigate({ to: "/courses" });
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
          isPrimarySelector ? (
            ""
          ) : (
            <CloseButton
              aria-label="Clear input"
              onClick={() => onChange(null)}
            />
          )
        ) : null
      }
    />
  );
}
