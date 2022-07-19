import React from "react";

export type RerenderFunction = () => void;

const Rerenderer = (
  { children, setRerenderFunction, afterSettingRerender }:
    {
      children: React.ReactNode,
      setRerenderFunction: React.Dispatch<RerenderFunction>
      afterSettingRerender?: (rerender: () => void) => void
    }) => {
  const [val, setVal] = React.useState({})

  React.useEffect(() => {
    if (!setRerenderFunction) throw new Error('setRerendererFunction is a required parameter.');
    setRerenderFunction(() => setVal({}));
    if (afterSettingRerender)
      afterSettingRerender(() => setVal({}));
  }, []);

  return <>{children}</>;
}

export default Rerenderer;