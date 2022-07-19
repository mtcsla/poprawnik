import { ListItem } from "@mui/material";
import React from "react";
import { useRouter } from "next/router";
import { blue } from "@mui/material/colors";
import Link from "next/link";
import { SidebarListItemComponent } from "./ForLawyerList";


export const SidebarListItem = ({
  children, link, onClick,
}: {
  children: React.ReactNode;
  link?: string;
  onClick?: () => any;
}) => {
  const router = useRouter();

  const selected = () => router.pathname === link;

  return (
    <Link href={link || '/'} passHref>
      <a>
        <SidebarListItemComponent
          className={"pl-10 cursor-pointer  pt-1 mb-1 mt-1 pb-1 rounded mr-1 transition-colors"}
          style={selected()
            ? {
              backgroundColor: blue[50],
              color: blue[700],
            }
            : {}}
        >
          {children}
        </SidebarListItemComponent>
      </a>
    </Link>
  );
};
export const SidebarListHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ListItem className={"pl-10"}>{children}</ListItem>;
};
