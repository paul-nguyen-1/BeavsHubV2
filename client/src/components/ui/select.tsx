import { Autocomplete } from "@mantine/core";
import {
  lowerDivisionOne,
  lowerDivisionTwo,
  upperDivisionOne,
  upperDivisionTwo,
} from "../../lib/const";

export default function SelectMantine() {
  return (
    <Autocomplete
      label="All Classes"
      placeholder="Pick a class"
      data={[
        { group: "100-199", items: lowerDivisionOne },
        { group: "200-299", items: lowerDivisionTwo },
        { group: "300-399", items: upperDivisionOne },
        { group: "400-499", items: upperDivisionTwo },
      ]}
    />
  );
}
