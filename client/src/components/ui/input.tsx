import { Input, CloseButton } from "@mantine/core";
import { IconAt } from "@tabler/icons-react";

interface MantineInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MantineInput({ value, onChange }: MantineInputProps) {
  return (
    <Input
      placeholder="Search tips"
      leftSection={<IconAt size={16} />}
      value={value}
      onChange={onChange}
      rightSectionPointerEvents="all"
      mt="md"
      rightSection={
        <CloseButton
          aria-label="Clear input"
          onClick={() =>
            onChange({
              target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>)
          }
        />
      }
    />
  );
}
