"use client";
import React from "react";
import { Item, ItemParams, Menu, Separator } from "react-contexify";

import { Song } from "@/models/song";
import { SongTableColumn } from "@/models/song_table";

export type SongTableContextMenuProps = {
  id: string;
  items: SongTableContextMenuItem[][];
};

export type SongTableContextMenuItem = {
  name: string;
  onClick: (song: Song | undefined, selectedSongs: Song[]) => void;
};

interface ItemProps {
  columns: SongTableColumn[];
  song: Song | undefined;
  selectedSongs: Song[];
}

export default function SongTableContextMenu(props: SongTableContextMenuProps) {
  function onClick(params: ItemParams<ItemProps, unknown>) {
    if (params.props === undefined) {
      return;
    }
    props.items
      .flat()
      .filter((v) => v.name === params.id)
      .forEach((v) =>
        v.onClick(params.props!.song, params.props!.selectedSongs)
      );
  }

  const items = props.items
    .map((group) =>
      group.map((v) => (
        <Item key={v.name} id={v.name} onClick={onClick}>
          {v.name}
        </Item>
      ))
    )
    .reduce(
      (prev, curr, index) => [...prev, ...curr, <Separator key={index} />],
      []
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
