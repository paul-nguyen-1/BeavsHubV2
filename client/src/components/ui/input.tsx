import { TextInput, CloseButton } from "@mantine/core";
import { IconAt } from "@tabler/icons-react";

interface MantineInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MantineInput({ value, onChange }: MantineInputProps) {
  return (
    <TextInput
      label="Search"
      placeholder="Course reviews"
      leftSection={<IconAt size={16} />}
      value={value}
      onChange={onChange}
      rightSectionPointerEvents="all"
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
