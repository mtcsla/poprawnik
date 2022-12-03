import React from "react";

export const bodyScrollLockContext = React.createContext<{
  addConsumer: () => void,
  removeConsumer: () => void
}>({
  addConsumer: () => { },
  removeConsumer: () => { },
});
export default function BodyScrollLockProvider({ children }: { children: React.ReactNode }) {
  const [consumers, setConsumers] = React.useState<number>(0);

  const addConsumer = () => setConsumers(consumers => consumers + 1);
  const removeConsumer = () => setConsumers(consumers => consumers - 1);

  React.useEffect(
    () => {
      if (consumers > 0) {
        document.body.style.overflowY = "hidden";
        document.getElementsByTagName("html")[0].style.overflowY = "hidden";
      } else {
        document.body.style.overflowY = "auto";
        document.getElementsByTagName("html")[0].style.overflowY = "auto";
      }
    }, [consumers]
  )


  return <bodyScrollLockContext.Provider value={{ addConsumer, removeConsumer }}>{children}</bodyScrollLockContext.Provider>
}

