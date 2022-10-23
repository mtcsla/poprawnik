import React from 'react';
import { TemplateDescription } from '../TemplateDescriptionProvider/TemplateDescriptionProvider';

const formTemplateDescriptionContext = React.createContext<
  {
    currentDescription: TemplateDescription,
    description: TemplateDescription,
    setCurrentDescription: React.Dispatch<TemplateDescription>,
    setDescription: React.Dispatch<TemplateDescription>,

    updateFirebaseDoc: (newDescription: TemplateDescription) => void,
  }>({
    currentDescription: [],
    description: [],
    setCurrentDescription: (description) => { },
    setDescription: (description) => { },
    updateFirebaseDoc: (newDescription) => { },
  });
export const useFormTemplateDescription = () => React.useContext(formTemplateDescriptionContext);

const FormTemplateDescriptionProvider = (
  {
    children,
    initValue
  }: { children: React.ReactNode, initValue: TemplateDescription }
) => {
  const [description, setDescription] = React.useState<TemplateDescription>(initValue ?? []);
  const [currentDescription, setCurrentDescription] = React.useState<TemplateDescription>(initValue ?? []);

  const updateFirebaseDoc = (newDescription: TemplateDescription) => {

  }

  return <formTemplateDescriptionContext.Provider value={{ description, setDescription, currentDescription, setCurrentDescription, updateFirebaseDoc }}>
    {children}
  </formTemplateDescriptionContext.Provider>
}
export default FormTemplateDescriptionProvider;