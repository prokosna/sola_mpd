import { Stat, StatHelpText, StatLabel, StatNumber } from "@chakra-ui/react";

export type CardStatsNumberProps = {
  isSelected: boolean;
  label: string;
  count?: number | string;
};

export function CardStatsNumber(props: CardStatsNumberProps) {
  return (
    <>
      <Stat>
        <StatLabel color={props.isSelected ? "brand.400" : undefined}>
          {props.label}
        </StatLabel>
        <StatNumber>{props.count ?? "Loading"}</StatNumber>
        <StatHelpText />
      </Stat>
    </>
  );
}
