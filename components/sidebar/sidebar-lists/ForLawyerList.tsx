import styled from "@emotion/styled";
import { List, ListItem } from "@mui/material";
import { SidebarListHeader, SidebarListItem } from "./SidebarListItem";

export const SidebarListItemComponent = styled(ListItem)`
  &:hover {
    background-color: rgb(248 250 252);
  }
`;

const ForLawyerList = () => {
  return (
    <List className={"mr-2 ml-2"}>
      <SidebarListHeader>
        <pre className={"text-xs"}>Informacje</pre>
      </SidebarListHeader>
      <SidebarListItem link={"/"}>
        <p className={"text-sm"}>Program współpracy</p>
      </SidebarListItem>
      <SidebarListItem link={"/"}>
        <p className={"text-sm"}>Nasi partnerzy</p>
      </SidebarListItem>
    </List>
  );
};

export default ForLawyerList;