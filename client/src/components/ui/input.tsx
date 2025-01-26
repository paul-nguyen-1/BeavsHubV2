import { TextInput, CloseButton } from "@mantine/core";
import { IconAt } from "@tabler/icons-react";

interface MantineInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
}

export function MantineInput({
  value,
  onChange,
  label,
  placeholder,
}: MantineInputProps) {
  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      leftSection={<IconAt size={16} />}
      value={value}
      onChange={onChange}
      rightSectionPointerEvents="all"
      className="w-full"
      rightSection={
        value ? (
          <CloseButton
            aria-label="Clear input"
            onClick={() =>
              onChange({
                target: { value: "" },
              } as React.ChangeEvent<HTMLInputElement>)
            }
          />
        ) : null
      }
    />
  );
}
