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
      const scrollPosition = window.pageYOffset;

      const $html = document.getElementsByTagName('html')[0];
      const $body = document.body;

      if (consumers > 0) {
        $body.style.overflow = 'hidden';
        $html.style.overflow = 'hidden';
        if (window.innerWidth < 640) {
          $body.style.position = 'fixed';
          $body.style.top = `-${scrollPosition}px`;
          $body.style.width = '100%';
        }
      }

      //position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow-y: auto;
      else {
        $html.style.removeProperty('overflow');
        $body.style.removeProperty('overflow');
        $body.style.removeProperty('position');
        $body.style.removeProperty('top');
        $body.style.removeProperty('width');
        window.scrollTo(0, scrollPosition);

      }
    }, [consumers]
  )


  return <bodyScrollLockContext.Provider value={{ addConsumer, removeConsumer }}>{children}</bodyScrollLockContext.Provider>
}

