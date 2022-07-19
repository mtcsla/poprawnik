import { List } from "@mui/material";
import { SidebarListHeader, SidebarListItem } from "./SidebarListItem";

const ArticlesList = () => {
  return <List className={'mr-2 ml-2'}>
    <SidebarListHeader>
      <pre className={'text-xs'}>Czytaj</pre>
    </SidebarListHeader>
    <SidebarListItem link={'/articles'}>
      <p className={'text-sm'}>
        Wszystkie artykuły
      </p>
    </SidebarListItem>
  </List>
}

export default ArticlesList;