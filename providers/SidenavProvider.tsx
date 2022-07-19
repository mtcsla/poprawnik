import React from "react";

const sideNavContext = React.createContext<{ sideNavContent: React.ReactNode | null, setSideNavContent: React.Dispatch<React.ReactNode | null> }>({ sideNavContent: null, setSideNavContent: () => { } });

export const SidenavProvider = ({ children }: { children: React.ReactNode }) => {
  const [sideNavContent, setSideNavContent] = React.useState<React.ReactNode>(null)


  return <>
    <sideNavContext.Provider value={{ sideNavContent, setSideNavContent }}>
      {children}
    </sideNavContext.Provider>
  </>
}

export const useSideNav = () => React.useContext(sideNavContext);

export const SidenavContent = ({ children }: { children: React.ReactNode }) => {
  const { setSideNavContent } = React.useContext(sideNavContext);

  React.useEffect(() => {
    setSideNavContent(children);
  }, [children]);

  return <></>
}
