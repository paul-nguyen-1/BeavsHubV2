import { Autocomplete, CloseButton, Image } from "@mantine/core";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import searchIcon from "../../assets/Hero_search_button.svg";

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
  };

  return (
    <Autocomplete
      label={label}
      placeholder={placeHolder}
      value={value || ""}
      onChange={(value) => {
        handleInputChange(value);
      }}
      data={data}
      rightSection={
        isPrimarySelector ? (
          <Image
            src={searchIcon}
            h={32}
            alt="Search"
            className="relative left-0.5 cursor-pointer transition-transform hover:scale-110"
            onClick={() => {
              handleInputChange(value);
              if (routerState.location.pathname !== "/courses") {
                navigate({ to: "/courses" });
              }
            }}
          />
        ) : value ? (
          <CloseButton
            aria-label="Clear input"
            onClick={() => onChange(null)}
          />
        ) : null
      }
    />
  );
}
