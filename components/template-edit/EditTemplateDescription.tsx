import { Add, AlignHorizontalRight, Cancel, Delete, Edit } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem, Snackbar, Tab, Tabs } from '@mui/material';
import _ from 'lodash';
import React from 'react';
import BodyScrollLock from '../../providers/BodyScrollLock';
import { ModifyTemplate } from '../../providers/TemplateDescriptionProvider/ModifyTemplate';
import { CalculationElement, Expression, TemplateDescription, TemplateElement, TemplatePath, TextElement, useTemplateDescription, VariableElement } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useTemplateChangesDisplay } from '../form-edit/Changes';
import { Calculation, OperatorCalculation } from '../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';
import { EditTemplateElement } from './EditTemplateElement';
import { EditTemplateElementCalculation } from "./EditTemplateElementCalculation";
import { EditTemplateElementText } from './EditTemplateElementText';
import { EditTemplateElementVariable } from './EditTemplateElementVariable';
import { TemplateNestingParentEditor } from './nesting/TemplateNestingParentEditor';
import { isValidElement, useTemplateParenthesesEditor } from './TemplateEditor';

export const EditTemplateDescription = (
  { path, bordered, noHeadline }: { path: TemplatePath; bordered?: boolean, noHeadline?: boolean }
) => {
  const { description, modifyDescription, updateFirebaseDoc } = useTemplateDescription();
  const nestedDescription = React.useMemo(() => ModifyTemplate.getDescriptionFromPath(description, path), [description, path]);

  const parentheses = useTemplateParenthesesEditor();
  const [localParentheses, setLocalParentheses] = React.useState<[number | null, number | null]>([null, null]);

  React.useEffect(() => {
    if (!parentheses.path)
      setLocalParentheses([null, null]);
  }, [parentheses.path])

  const addParenthesis = (index: number) => {
    if (localParentheses[0] === null)
      setLocalParentheses([index, null]);
    else if (localParentheses[1] === null)
      setLocalParentheses([localParentheses[0], index].sort((a, b) => a - b) as [number, number]);
  }

  const removeParenthesis = (index: number) => {
    if (localParentheses[0] === index)
      setLocalParentheses([localParentheses[1], null]);
    else if (localParentheses[1] === index)
      setLocalParentheses([localParentheses[0], null]);
  }


  const [addingElement, setAddingElement] = React.useState<boolean>(false);
  //
  const [editingElement, setEditingElement] = React.useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState<number | null>(null);
  //
  //
  const [elementType, setElementType] = React.useState<TemplateElement['type']>(editingElement != null ? nestedDescription[editingElement].type : 'text');
  const [element, setElement] = React.useState<TemplateElement | null>(editingElement != null ? nestedDescription[editingElement] : null);
  //
  const [menuTarget, setMenuTarget] = React.useState<HTMLElement | null>(null);

  //
  const [warning, setWarning] = React.useState<TemplateElement['type'] | null>(null);
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false);
  const [deleting, setDeleting] = React.useState<boolean>(false);


  const elementValid = React.useMemo(() => element != null && isValidElement(element), [element]);
  //
  React.useEffect(() => {
    if (editingElement != null) {
      setElementType(nestedDescription[editingElement].type);
      setElement(nestedDescription[editingElement]);
    }
    if (addingElement) {
      setElementType('text');
      setElement(null);
    }
  }, [editingElement, addingElement]);

  const setMenuTargetAndIndex = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setMenuTarget(event.currentTarget);
    setCurrentIndex(index);
  };
  const onCloseMenu = () => {
    setMenuTarget(null);
    setEditingElement(null);
  };

  const comparePaths = (path1: TemplatePath, path2: TemplatePath) => {
    if (path1.length !== path2.length)
      return false;
    for (let i = 0; i < path1.length; i++) {
      if (path1[i] !== path2[i])
        return false;
    }
    return true;
  }


  async function setDescriptionElement(element: TemplateElement, index: number | null) {
    let newDescription: TemplateDescription = [];

    if (index === null) {
      newDescription = ModifyTemplate.addElement(description, { type: 'addElement', value: { path: path, element: element } });
    }
    else {
      newDescription = ModifyTemplate.setElement(description, { type: 'setElement', value: { path: path, element: element, index: index } });
    }

    try {
      await updateFirebaseDoc(newDescription);
      modifyDescription({ type: 'setDescription', value: { description: newDescription } });
    }
    catch (err) {
      throw new Error(`Failed to update firebase doc: ${err}`);
    }
  }
  const handleTypeChange = (value: TemplateElement['type']) => {
    setElementType(value);
    setElement(
      Object.assign({
        type: value,
      },
        value === 'text'
          ? { text: '' }
          : value === 'calculation'
            ? { calculation: { components: [], operators: [] } as Expression<Calculation, OperatorCalculation> }
            : {}
      ) as TemplateElement
    );
  };

  const saveElement = () => {
    setLoading(true);
    setDescriptionElement(element!, addingElement ? null : editingElement!).then(() => {
      setAddingElement(false);
      setEditingElement(null);
      setLoading(false);

      onCloseMenu();
    }).catch((err) => {
      setLoading(false);
      setError('Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie później.');
      setTimeout(() => setError(''), 5000);
      throw err;
    });
  };

  const { changedConditions, deletionPaths } = useTemplateChangesDisplay();
  const toBeDeleted = React.useMemo(() => deletionPaths.findIndex(delpath => _.isEqual(path, delpath)) >= 0, [])

  return <div className='relative'>
    {((deletionPaths.length || changedConditions.length) && toBeDeleted)

      ? <div className='absolute rounded-lg bg-red-500 bg-opacity-50 z-50 top-0 bottom-0 left-0 right-0' />
      : null}

    <TemplateNestingParentEditor adding={!parentheses.editing} editing={parentheses.editing} editorPath={path} />
    {error
      ? <Snackbar open><Alert severity='error'>{error}</Alert></Snackbar>
      : null}
    <Menu open={!!menuTarget} anchorEl={menuTarget!} onClose={onCloseMenu}>
      <BodyScrollLock> </BodyScrollLock>
      <MenuItem onClick={() => { setEditingElement(currentIndex); }}><Edit color='primary' className='mr-2' /> Edytuj element</MenuItem>
      <MenuItem onClick={() => {
        setDeleteDialogOpen(true);
      }}><Delete color='error' className='mr-2' /> Usuń element</MenuItem>
    </Menu>
    <Dialog open={!!warning}>
      <DialogTitle><pre className='text-sm'>Uwaga</pre></DialogTitle>
      <DialogContent>
        <BodyScrollLock>
          <p>
            Zmiana typu elementu spowoduje utratę jego wartości. Czy na pewno chcesz kontynuować?
          </p>
        </BodyScrollLock>
      </DialogContent>
      <DialogActions>
        <Button size='small' className='border-none' onClick={() => {
          handleTypeChange(warning!);
          setWarning(null);
        }}>Tak</Button>
        <Button size='small' className='border-none' color='error' onClick={() => setWarning(null)}>Anuluj</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={!!deleteDialogOpen}>
      <DialogTitle><pre className='text-sm'>Usuwasz element</pre></DialogTitle>
      <DialogContent>
        <BodyScrollLock>
          Czy na pewno chcesz usunąć ten element?
        </BodyScrollLock>
      </DialogContent>
      <DialogActions>
        <LoadingButton loading={deleting} size='small' className='border-none' onClick={() => {
          setDeleting(true);
          const newDescription = ModifyTemplate.removeElement(description, {
            type: 'removeElement',
            value: {
              path,
              index: currentIndex as number,
            }
          });
          updateFirebaseDoc(newDescription).then(() => {
            setDeleting(false);
            modifyDescription({ type: 'setDescription', value: { description: newDescription } });
            setDeleteDialogOpen(false);
          }).catch(
            () => {
              setError('Wystąpił błąd podczas usuwania elementu. Spróbuj ponownie później.');
              setDeleting(false);
              setTimeout(() => setError(''), 5000);
            }
          )
        }}>Tak</LoadingButton>
        <Button disabled={deleting} size='small' className='border-none' color='error' onClick={() => setDeleteDialogOpen(false)}>Anuluj</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={addingElement || (editingElement != null)}>

      <DialogTitle><pre className='text-sm'>{addingElement ? 'Dodajesz' : 'Edytujesz'} element</pre></DialogTitle>
      <DialogContent style={{ minWidth: 600 }} className='flex flex-col'>
        <Tabs value={elementType}
          className='rounded-lg overflow-x-auto mb-8 border'>
          <Tab onClick={() => element
            && element.type !== 'text' && elementValid ? setWarning('text') : handleTypeChange('text')} value={'text'} label='tekst' />
          <Tab onClick={() => element
            && element.type !== 'calculation' && elementValid ? setWarning('calculation') : handleTypeChange('calculation')} value={'calculation'} label='obliczenia' />
          <Tab onClick={() => element
            && element.type !== 'variable' && elementValid ? setWarning('variable') : handleTypeChange('variable')} value={'variable'} label='zmienna' />
        </Tabs>
        {elementType === 'text'
          ? <EditTemplateElementText
            element={element as TextElement}
            path={path} index={null} onChange={(value) => {
              setElement(value);
            }} />
          : null}
        {elementType === 'calculation'
          ? <EditTemplateElementCalculation
            element={element as CalculationElement}
            path={path} index={null} onChange={(value) => {
              setElement(value);
            }} />
          : null}
        {elementType === 'variable'
          ? <EditTemplateElementVariable
            element={element as VariableElement}
            path={path} index={null} onChange={(value) => {
              setElement(value);
            }} />
          : null}

      </DialogContent>
      <DialogActions>
        <LoadingButton size='small'
          loading={loading}
          disabled={!elementValid}
          className='border-none' onClick={saveElement}>Zapisz</LoadingButton>
        <Button size='small' color='error' disabled={loading} className='border-none' onClick={() => { setAddingElement(false); setEditingElement(null); onCloseMenu(); }}>Anuluj</Button>
      </DialogActions>
    </Dialog>


    <div className={`inline-flex h-full gap-4 sm:gap-6 flex-col border-none  max-w-none w-full ${path.length ? 'rounded-lg border-none ' : ''}`} style={{ minWidth: 250 }}>
      {!noHeadline && (!path.length || (_.isEqual(parentheses.path, path) && !parentheses.editing))
        ? <span className='mb-4 pr-7 inline-flex items-center w-full gap-3'>
          <pre>
            {parentheses.path != null && !parentheses.editing
              ? 'Dodajesz zagnieżdżenie'
              : 'Edytujesz wzór pisma'
            }
          </pre>
          <div className='border-b flex-1' />
        </span>
        : null
      }
      {nestedDescription?.length
        ? nestedDescription.map(
          (item, index) =>
            !!parentheses.path
              ? <span className='flex items-stretch justify-between w-full'>

                {parentheses.path && comparePaths(parentheses.path, path) && !parentheses.editing
                  ? <div className={`flex items-end mr-2 ${localParentheses.includes(index)
                    || (localParentheses[0] !== null && localParentheses[1] !== null && localParentheses[0] < index && index < localParentheses[1])
                    ?
                    'bg-blue-200' : ''} rounded`}>
                    <Checkbox size='small' className='z-50' checked={
                      localParentheses.includes(index)
                      || (localParentheses[0] !== null && localParentheses[1] !== null && localParentheses[0] < index && index < localParentheses[1])

                    } disabled={!localParentheses.includes(index) && localParentheses[0] !== null && localParentheses[1] !== null} onChange={(e, checked) => {
                      const changeFn = checked ? addParenthesis : removeParenthesis;
                      changeFn(index);
                    }
                    } />
                  </div>
                  : null
                }
                <div className={`flex-1 `}>
                  <EditTemplateElement {...{ path, index, openMenu: setMenuTargetAndIndex, menuTarget }} disabled={!!parentheses.path} />
                </div>
              </span>
              : <EditTemplateElement {...{ path, index, openMenu: setMenuTargetAndIndex, menuTarget }} />

        )
        : <div className='w-full bg-slate-50 flex mb-4 items-center justify-center rounded-lg border p-3 sm:p-6'>
          <pre className='text-sm'>Brak elementów</pre>
        </div>}
      {(deletionPaths.length || changedConditions.length)
        ? null
        : <span className={`flex w-full items-center flex-wrap pb-4 justify-end ${!path?.length ? 'mt-auto' : 'mt-1'}`}>
          {parentheses.path && comparePaths(parentheses.path, path) && !parentheses.editing
            ? null
            : <Button className='border-none  self-start' size='small' disabled={(parentheses.path && !comparePaths(parentheses.path, path)) as boolean} onClick={() => setAddingElement(true)}>
              <Add className='mr-2' />
              Dodaj element
            </Button>
          }
          {parentheses.path && comparePaths(parentheses.path, path) && !parentheses.editing
            ? <Button onClick={() => parentheses.setParentheses(localParentheses)} disabled={localParentheses[0] === null && localParentheses[1] === null || !comparePaths(parentheses.path, path)} size='small' className='border-none ml-2'>
              Dodaj
              <Add className='ml-2' />
            </Button>
            : null
          }
          {nestedDescription?.length ?
            <Button color={parentheses.path && !parentheses.editing ? 'error' : 'primary'} disabled={(parentheses.path && !comparePaths(parentheses.path, path) && !parentheses.editing) as boolean} onClick={() => parentheses.setPath(parentheses.path ? null : path)} size='small' className='border-none ml-2'>
              {parentheses.path && comparePaths(parentheses.path, path) && !parentheses.editing
                ? <Cancel className='mr-2' />
                : <AlignHorizontalRight className='mr-2' />
              }
              {parentheses.path && comparePaths(parentheses.path, path) && !parentheses.editing
                ? 'Anuluj'
                : 'Dodaj zagnieżdżenie'
              }
            </Button>
            : null
          }
          <div className='border-b flex-1 ml-3' />
        </span>
      }
    </div>
  </div>;
};
