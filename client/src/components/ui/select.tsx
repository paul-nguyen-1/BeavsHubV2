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
  };

  const goToReviews = () => {
    if (routerState.location.pathname !== "/reviews") {
      navigate({ to: "/reviews" });
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
      onOptionSubmit={(submitted) => {
        handleInputChange(submitted);
        if (isPrimarySelector) goToReviews();
      }}
      onKeyDown={
        isPrimarySelector
          ? (event) => {
              if (event.key === "Enter") goToReviews();
            }
          : undefined
      }
      data={data}
      size={isPrimarySelector ? "sm" : undefined}
      radius={isPrimarySelector ? "xl" : "lg"}
      classNames={
        isPrimarySelector
          ? {
              input:
                "!bg-transparent !border-0 !shadow-none !pl-4 !pr-4 !text-base !text-white placeholder:!text-white/60",
              dropdown:
                "!mt-2 !rounded-2xl !border !border-gray-100 !shadow-lg !overflow-hidden",
              option:
                "!rounded-lg !mx-1 !text-sm data-[combobox-selected]:!bg-[#d73f09] data-[combobox-selected]:!text-white hover:!bg-orange-50",
            }
          : undefined
      }
      rightSection={
        !isPrimarySelector && value ? (
          <CloseButton aria-label="Clear input" onClick={() => onChange(null)} />
        ) : null
      }
    />
  );
}
