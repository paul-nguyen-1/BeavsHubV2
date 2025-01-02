import { useState } from "react";
import { Input, CloseButton } from "@mantine/core";
import { IconAt } from "@tabler/icons-react";

export function MantineInput() {
  const [value, setValue] = useState("");
  return (
    <>
      <Input
        placeholder="Search tips"
        leftSection={<IconAt size={16} />}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        rightSectionPointerEvents="all"
        mt="md"
        rightSection={
          <CloseButton
            aria-label="Clear input"
            onClick={() => setValue("")}
            style={{ display: value ? undefined : "none" }}
          />
        }
      />
    </>
  );
}
