import { LoadingButton } from '@mui/lab';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Tab, Tabs } from '@mui/material';
import { cloneDeep } from 'lodash';
import React from "react";
import BodyScrollLock from "../../../providers/BodyScrollLock";
import { ModifyTemplate } from "../../../providers/TemplateDescriptionProvider/ModifyTemplate";
import { ExistsElement, IfElseElement, ListElement, TemplateElementType, TextFormattingElement, useTemplateDescription } from "../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider";
import { useTemplateParenthesesEditor } from "../TemplateEditor";
import { TemplateParentExistsEditor } from "./TemplateParentExistsEditor";
import { TemplateParentIfElseEditor } from "./TemplateParentIfElseEditor";
import { TemplateParentListEditor } from "./TemplateParentListEditor";
import { TemplateParentTextFormattingEditor } from "./TemplateParentTextFormattingEditor";




export const TemplateNestingParentEditor = ({ editing, adding }: { editing?: boolean; adding?: boolean; }) => {
  const { parentheses, setParentheses, path, setPath } = useTemplateParenthesesEditor();
  const { description, modifyDescription, updateFirebaseDoc } = useTemplateDescription();
  const cancel = () => { setParentheses([null, null]); setParentType('ifElse') };

  if (editing === adding && (editing !== undefined && adding !== undefined))
    throw new Error('Cannot be editing and adding at the same time.');

  const [parentType, setParentType] = React.useState<TemplateElementType['parent']>('ifElse');
  const [parent, setParent] = React.useState<IfElseElement | ExistsElement | ListElement | TextFormattingElement | null>(null);

  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  const save = () => {
    let newState = cloneDeep(description);

    if (adding) {
      const indices = (parentheses.includes(null) ? Array(2).fill(parentheses.filter(index => index != null)[0]) : parentheses) as [number, number];

      newState = ModifyTemplate.nestElements(
        newState, { type: 'nestElements', value: { path: path!, element: parent!, indices: indices } }
      )
      console.log('adding')
    } else if (editing) {
      const subsequence = ModifyTemplate.getDescriptionFromPath(newState, path!, true);
      subsequence[parentheses[0]!] = parent!;
      console.log('editing')
    }

    console.log(newState);

    setSaving(true);
    updateFirebaseDoc(newState).then(
      () => {
        modifyDescription({ type: 'setDescription', value: { description: newState } });
        cancel()

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

  const isValidParent = (
    type: TemplateElementType['parent'],
    element: IfElseElement | ExistsElement | ListElement | TextFormattingElement | null) => {
    if (type === 'ifElse')
      return !!(element as IfElseElement)?.condition.components.length;
    if (type === 'exists')
      return !!(element as ExistsElement)?.variables.length;
    if (type === 'list')
      return !!(element as ListElement)?.list;
    return !!element;
  };

  const valid = React.useMemo(() => isValidParent(parentType, parent), [parent]);

  React.useEffect(() => {
    if (editing)
      setParent(ModifyTemplate.getElementFromPath(description, path!, parentheses[0]!) as IfElseElement | ExistsElement | ListElement | TextFormattingElement);
  }, [editing]);
  React.useEffect(() => {
    setParent(null);
  }, [parentType]);

  return <>
    <Snackbar open={!!error}>
      <Alert severity='error'>
        {error}
      </Alert>
    </Snackbar>
    <Dialog open={parentheses[0] != null || parentheses[1] != null}>
      <DialogTitle><pre className='text-sm'>Dodajesz element okalający zagnieżdżenie</pre></DialogTitle>
      <DialogContent sx={{ maxWidth: 600 }} className='flex flex-col'>
        {parentheses[0] != null || parentheses[1] != null ? <>
          <BodyScrollLock>
            <Tabs className='border rounded-lg mb-8' onChange={(e, type) => setParentType(type)} value={parentType} variant='scrollable'>
              <Tab label='Fragment warunkowy' value={'ifElse'} />
              <Tab label='Asertacja istnienia' value={'exists'} />
              <Tab label='Interpretacja listy' value={'list'} />
              <Tab label='Formatowanie tekstu' value={'textFormatting'} />
            </Tabs>

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
        </> : null}
      </DialogContent>
      <DialogActions>
        <LoadingButton loading={saving} className='border-none' size='small' disabled={!valid} onClick={save}>Zapisz</LoadingButton>
        <Button className='border-none' size='small' color='error' onClick={cancel}>Anuluj</Button>
      </DialogActions>
    </Dialog>
  </>;
};
