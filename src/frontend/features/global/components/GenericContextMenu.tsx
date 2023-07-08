"use client";
import React from "react";
import { Item, ItemParams, Menu, Separator, Submenu } from "react-contexify";

export type GenericContextMenuProps<T> = {
  id: string;
  items: GenericContextMenuItem<T>[][];
};

export type GenericContextMenuItem<T> = {
  name: string;
  handlers: [string, (selected: T | undefined) => Promise<void>][];
};

export default function GenericContextMenu<T>(
  props: GenericContextMenuProps<T>,
) {
  function onClick(params: ItemParams<T, unknown>) {
    props.items
      .flat()
      .map((v) => v.handlers)
      .flat()
      .filter((v) => v[0] === params.id)
      .forEach((v) => v[1](params?.props));
  }

  const items = props.items
    .map((group) =>
      group.map((v) => {
        if (v.handlers.length === 1) {
          return (
            <Item
              key={v.handlers[0][0]}
              id={v.handlers[0][0]}
              onClick={onClick}
            >
              {v.handlers[0][0]}
            </Item>
          );
        }
        return (
          <Submenu key={v.name} label={v.name}>
            {v.handlers.map((sub) => (
              <Item key={sub[0]} id={sub[0]} onClick={onClick}>
                {sub[0]}
              </Item>
            ))}
          </Submenu>
        );
      }),
    )
    .reduce(
      (prev, curr, index) => [...prev, ...curr, <Separator key={index} />],
      [],
    )
    .slice(0, -1);

  return (
    <>
      <Menu id={props.id} animation={"scale"} theme={"light"}>
        {items}
      </Menu>
    </>
  );
}
