import { ArrowDownward, ArrowForward, ArrowLeft, ArrowRight, Close, Visibility } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Button, Chip, Dialog, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material';
import { cloneDeep } from 'lodash';
import React from "react";
import { FormDescription, useFormDescription } from '../../providers/FormDescriptionProvider/FormDescriptionProvider';
import { useFormTemplateDescription } from '../../providers/FormDescriptionProvider/FormTemplateDescriptionProvider';
import TemplateDescriptionProvider, { Expression, TemplateDescription, TemplatePath } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import TemplateEditor from '../template-edit/TemplateEditor';
import { FormUtility } from "../utility/FormUtility";
import { ConditionCalculationDisplay } from "./condition-calculation-editor/ConditionCalculationDisplay";
import { Condition, OperatorCondition } from './condition-calculation-editor/ConditionCalculationEditorProvider';
import { FormNormalize } from "./condition-calculation-editor/normalizers/FormNormalize";


export type ChangesProps = {
  deletionType: 'step';
  deletePath: [number, null, null];
  requiredChange: false;
  onSubmit: (newForm: FormDescription, newTemplate: TemplateDescription) => void | (() => void);
  onCancel: () => void;
  message: string;
  saving?: boolean;
} |
{
  deletionType: 'fragment';
  deletePath: [number, number, null];
  requiredChange: true | false;
  onSubmit: (newForm: FormDescription, newTemplate: TemplateDescription) => void | (() => void);
  onCancel: () => void;
  message: string;
  saving?: boolean;
} |
{
  deletionType: 'field';
  deletePath: [number, number, number];
  requiredChange: true | false;
  onSubmit: (newForm: FormDescription, newTemplate: TemplateDescription) => void | (() => void);
  onCancel: () => void;
  message: string;
  saving?: boolean;
}

const templateChangesDisplayContext = React.createContext<{
  deletionPaths: TemplatePath[],
  setDeletionPaths: React.Dispatch<TemplatePath[]>,
  changedConditions: [TemplatePath, Expression<Condition, OperatorCondition>][],
  setChangedConditions: React.Dispatch<[TemplatePath, Expression<Condition, OperatorCondition>][]>,
}>({
  deletionPaths: [],
  setDeletionPaths: (paths) => { },
  changedConditions: [],
  setChangedConditions: (conditions) => { }
});

export const useTemplateChangesDisplay = () => React.useContext(templateChangesDisplayContext);
export const TemplateChangesDisplayProvider = ({ children, initValues }: {
  children: React.ReactNode,
  initValues?: {
    changedConditions: [TemplatePath, Expression<Condition, OperatorCondition>][],
    deletionPaths: TemplatePath[]
  }
}) => {
  const [deletionPaths, setDeletionPaths] = React.useState<TemplatePath[]>(initValues?.deletionPaths ?? []);
  const [changedConditions, setChangedConditions] = React.useState<[TemplatePath, Expression<Condition, OperatorCondition>][]>(initValues?.changedConditions ?? []);
  return <templateChangesDisplayContext.Provider value={{ deletionPaths, setDeletionPaths, changedConditions, setChangedConditions }}>
    {children}
  </templateChangesDisplayContext.Provider>
}

const getNamesFromPath = (path: [number, number | null, number | null], description: FormDescription) => {
  const [stepIndex, fragmentIndex, fieldIndex] = path;
  const names: string[] = [];


  if (fragmentIndex === null && fieldIndex === null && stepIndex !== null) {
    if (description[stepIndex].name)
      names.push(description[stepIndex].name + '~', description[stepIndex].name);
    description[stepIndex].children.forEach((fragment, index) => {
      names.push(...getNamesFromPath([stepIndex, index, null], description));
    })
  }
  if (fieldIndex === null && fragmentIndex !== null && stepIndex !== null) {
    description[stepIndex].children[fragmentIndex as number].children.forEach((field, index) => {
      names.push(...getNamesFromPath([stepIndex, fragmentIndex, index], description));
    })
  }
  else if (fragmentIndex !== null && stepIndex !== null && fieldIndex !== null) {
    if (description[stepIndex].children[fragmentIndex as number].children[fieldIndex as number])
      names.push(description[stepIndex].children[fragmentIndex as number].children[fieldIndex as number].name);
  }

  return names;
}
const getConditionFromPath = (
  path: [number, number, number | null],
  description: FormDescription,
): Expression<Condition, OperatorCondition> => {
  const [stepIndex, fragmentIndex, fieldIndex] = path;
  try {

    if (fieldIndex === null) {
      return description[stepIndex].children[fragmentIndex].condition;
    }
    return description[stepIndex].children[fragmentIndex].children[fieldIndex as number].condition as Expression<Condition, OperatorCondition>;

  }
  catch (err) {
    throw new Error(`path ${path.toString()} err ${(err as any).message}`);
  }
}


const Changes = ({ deletionType, deletePath, requiredChange, onSubmit, onCancel, message, saving }: ChangesProps) => {
  const [tab, setTab] = React.useState<number>(0);

  const { description, currentDescription } = useFormDescription();
  const templateDescriptionObject = useFormTemplateDescription();


  const { _description, templateDescription } = React.useMemo(() =>
  ({
    _description: deletionType === 'step' ? currentDescription : description,
    templateDescription: deletionType === 'step' ? templateDescriptionObject?.currentDescription : templateDescriptionObject?.description
  }),
    []);


  const { templateChanges, templateConditionChanges, formChanges, newTemplate, newForm } = React.useMemo(() => {
    const names = getNamesFromPath(deletePath as [number, number, number | null], _description)




    const formElementsToChange = FormUtility.removed(cloneDeep(_description), deletePath, requiredChange ? 'notRequired' : 'removed',);
    console.log(formElementsToChange, 'formelementstochange')

    const templateChanges = FormUtility.templateRemoved(
      templateDescription as TemplateDescription,
      [],
      names,
      requiredChange ? 'notRequired' : 'removed',
    );
    const templateConditionChanges = FormUtility.templateNormalizeConditions(
      templateDescription as TemplateDescription,
      [],
      names,
      requiredChange ? 'notRequired' : 'removed',
    )


    const formChanges:
      {
        condition: Expression<Condition, OperatorCondition>,
        path: [number, number, number | null]
      }[] = formElementsToChange.map(
        (element) => {
          return ({
            path: element.slice(0, 3) as [number, number, number | null],
            condition: FormUtility.normalizeCondition(
              getConditionFromPath(element.slice(0, 3) as [number, number, number | null], _description),
              element[3],
            ) as Expression<Condition, OperatorCondition>
          })
        }
      );



    const newTemplate = FormUtility.templateApplyRemoved(cloneDeep(templateDescription), templateChanges);

    const newForm = FormNormalize[requiredChange ? 'conditionsNotRequired' : 'conditions'](cloneDeep(_description), deletePath);
    FormUtility.removed(newForm, deletePath, requiredChange ? 'notRequired' : 'removed', true);
    FormUtility.templateNormalizeConditions(
      newTemplate as TemplateDescription,
      [],
      names,
      requiredChange ? 'notRequired' : 'removed',
      true
    )


    return { templateChanges, templateConditionChanges, formChanges, newTemplate, newForm };
  }, [requiredChange])

  const [currentFormChange, setCurrentFormChange] = React.useState(0);
  const [viewingTemplateChanges, setViewingTemplateChanges] = React.useState(false);

  const formChangesElements = React.useMemo(() =>
    formChanges.map(({ path, condition }, index) => {
      const newCondition = condition;
      const oldCondition = getConditionFromPath(path, _description);

      return <div key={index} className=" w-full inline-flex gap-6 items-stretch flex-col">
        <ConditionCalculationDisplay sequence={oldCondition as any} type={'condition'} />
        <div className="flex rounded justify-center p-3 bg-blue-50"><ArrowDownward color='primary' /> </div>
        <ConditionCalculationDisplay sequence={newCondition as any} type={'condition'} />
      </div>
    }), [formChanges])


  return <div className="self-stretch w-full mt-4 flex flex-col">

    {formChanges.length || templateChanges.length
      ? <>
        <p className="mb-2 font-bold">Wprowadzasz znaczące zmiany w formularzu. </p>
        <pre className="text-xs self-end">
          Tą zmianą spowodujesz następujące zmiany
        </pre>
        <Tabs className="w-full bg-white border rounded-lg" value={tab} onChange={(e, value) => { setTab(value) }}>
          {formChanges.length
            ? <Tab label="W Formularzu" value={0} />
            : null
          }
          {templateChanges.length
            ? <Tab label="We wzorze pisma" value={1} />
            : null
          }
        </Tabs>
        <div className="w-full flex flex-col overflow-y-auto" style={{ maxHeight: 600 }}>
          {
            tab === 0 && formChanges.length
              ? <>
                <div className='inline-flex justify-center gap-3 p-2 items-center rounded bg-gray-50 w-full my-2'>
                  {
                    _description[formChanges[currentFormChange].path[0]].name
                      ? <Chip label={_description[formChanges[currentFormChange].path[0]].name} color='warning' />
                      : <pre className='p-2 bg-blue-100 text-blue-500 rounded'>Krok {formChanges[currentFormChange].path[0] + 1}</pre>
                  }
                  <ArrowForward className='text-xl' />
                  <pre className='p-2 bg-blue-100 text-blue-500 rounded'>Fragment {formChanges[currentFormChange].path[1] + 1}</pre>
                  {formChanges[currentFormChange].path[2] != null
                    ? <>
                      <ArrowForward className='text-xl' />
                      <pre className='p-2 bg-blue-100 text-blue-500 rounded'>Pole {formChanges[currentFormChange].path[2] as number + 1}</pre>
                    </>
                    : null
                  }

                </div>
                <div className='w-full  inline-flex items-stretch gap-4'>
                  <Button onClick={() => setCurrentFormChange(currentFormChange - 1)} disabled={!currentFormChange} className={`border-none rounded ${currentFormChange ? 'bg-blue-200' : 'bg-gray-100'}`}>
                    <ArrowLeft />
                  </Button>
                  {
                    formChangesElements[currentFormChange]
                  }
                  <Button onClick={() => setCurrentFormChange(currentFormChange + 1)} disabled={currentFormChange === formChanges.length - 1} className={`border-none rounded ${currentFormChange < formChanges.length - 1 ? 'bg-blue-200' : 'bg-gray-100'}`}>
                    <ArrowRight />
                  </Button>
                </div>
              </>
              : templateChanges.length
                ?
                <TemplateDescriptionProvider id={''} form={_description} initTemplate={templateDescription}>
                  <pre className='mt-8 mb-4'>Zmiany we wzorze pisma</pre>
                  <div onClick={() => !viewingTemplateChanges && setViewingTemplateChanges(true)} className='w-full hover:border-blue-500 cursor-pointer overflow-x-hidden h-96 border rounded-lg  relative overflow-y-hidden'>
                    <div className='absolute right-0 left-0 bottom-0 top-0 rounded-lg' style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 75%)',
                      zIndex: 200,
                    }} />
                    <div className='absolute top-0 left-0 right-0 bottom-0'>
                      <div className='relative top-0 bottom-0 left-0 right-0' style={{ maxWidth: '100vw' }}>
                        <TemplateChangesDisplayProvider initValues={{ changedConditions: templateConditionChanges, deletionPaths: templateChanges }} >
                          <TemplateEditor display />
                          <Dialog scroll="body" open={viewingTemplateChanges}>
                            <DialogTitle>
                              <pre className='inline-flex gap-3 items-center'><Visibility /> Oglądasz zmiany wzoru pisma</pre>
                              <Button color='error' className='px-1.5 fixed top-12 right-12 bg-white border-none' onClick={() => {
                                setViewingTemplateChanges(false);
                              }} >
                                <Close />
                              </Button>
                              <p className='text-sm font-normal mt-2'>
                                <b className='px-4 py-1 mr-3 rounded text-purple-500 bg-purple-400'>
                                </b> zmiana w warunku
                              </p>
                              <p className='text-sm mt-2 font-normal'>
                                <b className='px-4 py-1 mr-3 rounded text-red-500 bg-red-400'>
                                </b> usunięcie fragmentu
                              </p>
                            </DialogTitle>
                            <DialogContent>
                              <div className='pointer-events-none'>
                                <TemplateEditor display />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TemplateChangesDisplayProvider>
                      </div>
                    </div>
                  </div>
                </TemplateDescriptionProvider>

                : null
          }
        </div>
      </> : null}

    {message
      ? <p className='mt-6 text-sm'>{message}</p>
      : null
    }


    <span className='mt-6 self-end inline-flex justify-center gap-3'>
      <LoadingButton loading={saving} className='border-none' size='small' onClick={() => onSubmit(newForm, newTemplate)}>Ok</LoadingButton>
      <Button disabled={saving} className='border-none' size='small' color='error' onClick={onCancel}>Anuluj</Button>
    </span>
  </div>
}

export default Changes;