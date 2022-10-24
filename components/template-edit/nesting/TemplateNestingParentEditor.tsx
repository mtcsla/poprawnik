import { LoadingButton as Button, LoadingButton } from '@mui/lab';
import { Alert, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Tab, Tabs } from '@mui/material';
import _, { cloneDeep } from 'lodash';
import React from "react";
import BodyScrollLock from "../../../providers/BodyScrollLock";
import { ModifyTemplate } from "../../../providers/TemplateDescriptionProvider/ModifyTemplate";
import { ExistsElement, IfElseElement, ListElement, TemplateDescription, TemplateElementType, TemplatePath, TextFormattingElement, useTemplateDescription } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useTemplateParenthesesEditor } from "../TemplateEditor";
import { TemplateParentExistsEditor } from "./TemplateParentExistsEditor";
import { TemplateParentIfElseEditor } from "./TemplateParentIfElseEditor";
import { TemplateParentListEditor } from "./TemplateParentListEditor";
import { TemplateParentTextFormattingEditor } from "./TemplateParentTextFormattingEditor";


const parentNestingPrototype = {
  ifElse: (child: TemplateDescription | null) => ({
    type: 'ifElse',
    condition: { components: [], operators: [] },
    child
  }),
  exists: (child: TemplateDescription | null) => ({
    type: 'exists',
    variables: [],
    child
  }),
  list: (child: TemplateDescription | null) => ({
    type: 'list',
    list: '',
    filter: { components: [], operators: [] },
    child
  }),
  textFormatting: (child: TemplateDescription | null) => ({
    type: 'textFormatting',
    effect: 'normal',
    align: 'left',
    element: 'p',
    child
  })
}


export const TemplateNestingParentEditor = ({ editing, adding, editorPath }: { editing?: boolean; adding?: boolean; editorPath: TemplatePath }) => {
  if (editing === adding && (editing !== undefined && adding !== undefined))
    throw new Error('Cannot be editing and adding at the same time.');

  const parenthesesEditor = useTemplateParenthesesEditor();
  const { parentheses, setParentheses, path, setPath, setEditing } = parenthesesEditor;
  const { description, modifyDescription, updateFirebaseDoc } = useTemplateDescription();

  const cancel = () => {
    setParentheses([null, null]);
    if (editing) {
      setEditing(false);
      setPath(null);
      setInitState(null);
    }
  };
  const save = (removeChildren?: true) => {
    let newState = cloneDeep(description);
    const _parent = cloneDeep(parent);

    if (removeChildren && _parent)
      _parent.child = [];

    if (adding) {
      const indices = (parentheses.includes(null) ? Array(2).fill(parentheses.filter(index => index != null)[0]) : parentheses) as [number, number];
      newState = ModifyTemplate.nestElements(
        newState, { type: 'nestElements', value: { path: path!, element: _parent!, indices: indices } }
      )
    } else if (editing) {
      const subsequence = ModifyTemplate.getDescriptionFromPath(newState, path!, true);
      subsequence[parentheses[0]!] = _parent!;
    }

    setSaving(true);
    updateFirebaseDoc(newState).then(
      () => {
        modifyDescription({ type: 'setDescription', value: { description: newState } });
        cancel();
        setSaving(false);
        setParentheses([null, null]);
        setPath(null);
      }
    ).catch(
      () => {
        setSaving(false);
        setError('Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie później.');
      }
    );
  }

  const deleteElement = () => {
    const newState = cloneDeep(description);

    const element = ModifyTemplate.getElementFromPath(newState, path!, parentheses[0]!);
    const subsequence = ModifyTemplate.getDescriptionFromPath(newState, path!, true);

    if (['ifElse', 'textFormatting'].includes(parentType))
      subsequence.splice(parentheses[0]!, 1, ...element!.child);
    else
      subsequence.splice(parentheses[0]!, 1);

    setSaving(true);
    updateFirebaseDoc(newState).then(
      () => {
        modifyDescription({ type: 'setDescription', value: { description: newState } });
        cancel();
        setSaving(false);
        setParentheses([null, null]);
        setPath(null);
        setDeleting(false);
      }
    ).catch(
      () => {
        setSaving(false);
        setError('Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie później.');
      }
    );
  }

  const isValidParent = (
    type: TemplateElementType['parent'],
    element: IfElseElement | ExistsElement | ListElement | TextFormattingElement | null) => {
    if (type === 'ifElse')
      return !!(element as IfElseElement)?.condition.components.length;
    if (type === 'exists')
      return !!(element as ExistsElement)?.variables.length;
    if (type === 'list')
      return !!(element as ListElement)?.list;
    if (type === 'textFormatting') {
      return !!(element as TextFormattingElement)?.textFormattingType && (
        (element as TextFormattingElement)?.textFormattingType === 'effect'
          ? (element as TextFormattingElement)?.effect
          : ((element as TextFormattingElement)?.align && (element as TextFormattingElement)?.element)
      );
    }
    return !!element;
  };

  const [parentType, setParentType] = React.useState<TemplateElementType['parent']>('ifElse');
  const [newType, setNewType] = React.useState<TemplateElementType['parent'] | null>(null);

  const [parent, setParent] = React.useState<IfElseElement | ExistsElement | ListElement | TextFormattingElement>(parentNestingPrototype['ifElse']([]) as IfElseElement);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [deleting, setDeleting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  const [editSaving, setEditSaving] = React.useState<boolean>(false);
  const [initState, setInitState] = React.useState<IfElseElement | ExistsElement | ListElement | TextFormattingElement | null>(null);


  const breakingChanges: string[] | string | null = React.useMemo(() => {
    if (!initState)
      return null;

    if (initState.type === 'exists') {
      if (parentType !== 'exists')
        return initState.variables;

      const missingVars: string[] = initState.variables.filter(variable => !(parent as ExistsElement)?.variables.includes(variable));
      if (missingVars.length)
        return missingVars;
    }
    if (initState.type === 'list') {
      if (parentType !== 'list')
        return initState.list;
      if (initState.list !== (parent as ListElement)?.list)
        return initState.list;
    }
    return null

  }, [initState, parent, parentType])

  const valid = React.useMemo(() => isValidParent(parentType, parent), [parent]);

  const initStateChanged = React.useMemo(() => {
    if (parentType !== initState?.type)
      return true;
    if (!parent || !initState)
      return false;

    switch (parentType) {
      case 'ifElse':
        if (_.isEqual((initState as IfElseElement).condition, (parent as IfElseElement).condition)) {
          return false;
        }
        break;
      case 'exists':
        if (_.isEqual((initState as ExistsElement).variables, (parent as ExistsElement).variables))
          return false;
        break;
      case 'list':
        if (_.isEqual((initState as ListElement).list, (parent as ListElement).list) && _.isEqual((initState as ListElement).filter, (parent as ListElement).filter))
          return false;
        break;
      case 'textFormatting':
        if (
          _.isEqual((initState as TextFormattingElement).textFormattingType, (parent as TextFormattingElement).textFormattingType) &&
          (initState as TextFormattingElement).element === (parent as TextFormattingElement).element
          &&
          (initState as TextFormattingElement).effect === (parent as TextFormattingElement).effect
          &&
          (initState as TextFormattingElement).align === (parent as TextFormattingElement).align
        )
          return false;
        break;
    }
    return true;
  }, [parent, initState, parentType]);

  React.useEffect(() => {
    if (editing) {
      if (path != null && parentheses[0] !== null) {
        const newParent = ModifyTemplate.getElementFromPath(description, path!, parentheses[0]!) as IfElseElement | ExistsElement | ListElement | TextFormattingElement;
        if (newParent) {
          setParentType(newParent.type);
          setParent(newParent)
          setInitState(cloneDeep(newParent));
        }
      }
    }
    else {
      setParentType('ifElse');
      setParent(parentNestingPrototype['ifElse']([]) as IfElseElement);
    }
  }, [editing, description, path, parentheses]);

  const [loaded, setLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (parent?.child?.length == 0 && editing) {
      const newParent = cloneDeep(parent);
      newParent.child = initState?.child ?? [];
    }
  }, [parent])


  return <>
    <Snackbar open={!!error}>
      <Alert sx={{ zIndex: 5000 }} severity='error'>
        {error}
      </Alert>
    </Snackbar>
    <Dialog open={(parentheses[0] != null || parentheses[1] != null) && _.isEqual(path, editorPath)}>
      <DialogTitle><pre className='text-sm'>{editing ? 'Edytujesz' : 'Dodajesz'} element okalający zagnieżdżenie</pre></DialogTitle>

      <DialogContent sx={{ maxWidth: 600 }} className='flex flex-col'>
        <Dialog open={deleting}>
          <DialogTitle><pre className='text-sm'>Usuwasz element okalający</pre></DialogTitle>
          <DialogContent>
            <p>
              {
                ['ifElse', 'textFormatting'].includes(parentType)
                  ? 'Usunięty zostanie tylko element okalający, elementy w nim zagnieżdżone pozostaną bez zmian.'
                  : 'Usunięty zostanie element okalający i wszystkie elementy w nim zagnieżdżone.'
              }
            </p>
          </DialogContent>
          <DialogActions>
            <LoadingButton loading={saving} size='small' className='border-none' onClick={deleteElement}>Usuń</LoadingButton>
            <Button size='small' className='border-none' color='error' onClick={() => { setDeleting(false); }} >Anuluj</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={!!newType}>
          <DialogTitle><pre className='text-sm'>Zmieniasz typ elementu okalającego</pre></DialogTitle>
          <DialogContent>
            <p>Wprowadzone wartości zostaną wyczyszczone, ale <i>zmiany wejdą w życie dopiero po zapisaniu elementu</i>.</p>
          </DialogContent>
          <DialogActions>
            <Button size='small' className='border-none' onClick={() => {
              setParent(parentNestingPrototype[newType!](parent?.child ?? []) as IfElseElement | ExistsElement | ListElement | TextFormattingElement);
              setParentType(newType!);
              setNewType(null)
            }} >Ok</Button>
            <Button size='small' className='border-none' color='error' onClick={() => { setNewType(null); }} >Anuluj</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={editSaving && !!breakingChanges}>
          <DialogTitle>
            <pre className='text-sm'>Zapisujesz znaczące zmiany</pre>
          </DialogTitle>
          <DialogContent>
            <p>Poniższe zmiany spowodują usunięcie zagniezdzonych elementów.</p>
            {
              initState?.type === 'exists'
                ? <>
                  <pre className='text-xs mb-2 mt-4'>Usunięto zmienne w asercji istnienia:</pre>
                  <span className='inline-flex gap-2 flex-wrap'>
                    {
                      ((parentType === 'exists' ? parent : initState) as ExistsElement)?.variables.concat(breakingChanges as string[]).filter((variable, index, arr) => arr.indexOf(variable) === index)
                        .map(
                          variable => <span className='inline-flex gap-1 items-center'>
                            <Chip label={`${breakingChanges?.includes(variable) ? '- ' : ''}${variable}`} size='small' variant={breakingChanges?.includes(variable) ? 'outlined' : 'filled'} color={breakingChanges?.includes(variable) ? 'error' : 'primary'} />
                          </span>
                        )
                    }
                  </span>
                </>
                : null
            }
            {
              initState?.type === 'list'
                ? <>

                </>
                : null
            }
          </DialogContent>
          <DialogActions>
            <LoadingButton loading={saving} size='small' className='border-none' onClick={() => { save(true); setEditSaving(false) }} >Ok</LoadingButton>
            <Button size='small' className='border-none' color='error' onClick={() => { setEditSaving(false); }} >Anuluj</Button>
          </DialogActions>
        </Dialog>

        <BodyScrollLock>
          <Tabs className='border rounded-lg' value={parentType} variant='scrollable'>
            <Tab value={'ifElse'} label='Fragment warunkowy' onClick={() => parentType !== 'ifElse' ? setNewType('ifElse') : {}} />
            <Tab value={'exists'} label='Asertacja istnienia' onClick={() => parentType !== 'exists' ? setNewType('exists') : {}} />
            <Tab value={'list'} label='Interpretacja listy' onClick={() => parentType !== 'list' ? setNewType('list') : {}} />
            <Tab value={'textFormatting'} label='Formatowanie tekstu' onClick={() => parentType !== 'textFormatting' ? setNewType('textFormatting') : {}} />
          </Tabs>

          {editing
            ? <Button className='border-none self-end ml-auto mb-8' size='small' color='error' onClick={() => setDeleting(true)}>usuń element</Button>
            : null
          }

          {parentType === 'ifElse'
            ? <TemplateParentIfElseEditor onChange={(element) => setParent(element)} path={path!} element={editing ? parent! as IfElseElement : undefined} />
            : null}
          {parentType === 'textFormatting'
            ? <TemplateParentTextFormattingEditor
              onChange={(element) => setParent(element)}
              path={path!}
              element={editing ? parent! as TextFormattingElement : undefined} />
            : null}
          {parentType === 'exists'
            ? <TemplateParentExistsEditor onChange={(element) => setParent(element)} path={path!} element={editing ? parent! as ExistsElement : undefined} />
            : null}
          {parentType === 'list'
            ? <TemplateParentListEditor onChange={(element) => setParent(element)} path={path!} element={editing ? parent! as ListElement : undefined} />
            : null}
        </BodyScrollLock>
      </DialogContent>
      <DialogActions>
        <LoadingButton loading={saving} className='border-none' size='small' disabled={!valid || (editing ? !initStateChanged : false)} onClick={editing && breakingChanges ? () => setEditSaving(true) : () => save()}>Zapisz</LoadingButton> <Button className='border-none' size='small' color='error' onClick={cancel}>Anuluj</Button>
      </DialogActions>
    </Dialog>
  </>;
};
