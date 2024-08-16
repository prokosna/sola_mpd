import { useColorMode } from "@chakra-ui/react";
import { Item, ItemParams, Menu, Separator, Submenu } from "react-contexify";

import { ContextMenuProps } from "../types/contextMenuTypes";

export function ContextMenu<T>(props: ContextMenuProps<T>) {
  const { colorMode } = useColorMode();

  function onClick(params: ItemParams<T, unknown>) {
    for (const section of props.sections) {
      for (const item of section.items) {
        switch (item.type) {
          case "Item":
            if (item.name === params.id) {
              item.onClick(params?.props);
            }
            break;
          case "SubItemsParent":
            for (const subItem of item.subItems) {
              if (subItem.name === params.id) {
                subItem.onClick(params?.props);
              }
            }
            break;
          default:
            throw new Error(`Undefined context menu item type: ${item}`);
        }
      }
    }
  }

  const items = props.sections
    .map((section) =>
      section.items.map((item) =>
        item.type === "Item" ? (
          <Item key={item.name} id={item.name} onClick={onClick}>
            {item.name}
          </Item>
        ) : (
          <Submenu key={item.name} label={item.name}>
            {item.subItems.map((subItem) => (
              <Item key={subItem.name} id={subItem.name} onClick={onClick}>
                {subItem.name}
              </Item>
            ))}
          </Submenu>
        ),
      ),
    )
    .reduce(
      (prev, curr, index) => [...prev, ...curr, <Separator key={index} />],
      [],
    )
    .slice(0, -1);

  return (
    <>
      <Menu id={props.id} animation={"scale"} theme={colorMode}>
        {items}
      </Menu>
    </>
  );
}
