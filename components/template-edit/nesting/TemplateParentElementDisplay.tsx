import _ from 'lodash';
import React from 'react';
import { ModifyTemplate } from '../../../providers/TemplateDescriptionProvider/ModifyTemplate';
import { ExistsElement, IfElseElement, ListElement, TemplateElementType, TemplatePath, TextFormattingElement, useTemplateDescription } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useTemplateChangesDisplay } from '../../form-edit/Changes';
import { EditTemplateDescription } from '../EditTemplateDescription';
import { useTemplateParenthesesEditor } from '../TemplateEditor';
import { TemplateParentExistsDisplay } from './TemplateParentExistsEditor';
import { TemplateParentIfElseDisplay } from './TemplateParentIfElseEditor';
import { TemplateParentListDisplay } from './TemplateParentListEditor';
import { TemplateParentTextFormattingDisplay } from './TemplateParentTextFormattingEditor';

const TemplateParentElementDisplay = ({
  path, type, index
}: {
  path: TemplatePath,
  index: number,
  type: TemplateElementType['parent']
}) => {
  const { description } = useTemplateDescription();
  const { setEditing, setPath, setParentheses } = useTemplateParenthesesEditor();

  const { changedConditions, deletionPaths } = useTemplateChangesDisplay();
  const toBeDeleted = React.useMemo(() => deletionPaths.findIndex(delpath => _.isEqual(path.concat([index]), delpath)) >= 0, [deletionPaths, path]);

  const element = React.useMemo(
    () => ModifyTemplate.getElementFromPath(
      description, path, index
    ), [description, path, index]
  )
  const children = React.useMemo(
    () => ModifyTemplate.getDescriptionFromPath(description, path),
    [description, path]
  )
  const edit = React.useCallback(() => {
    setEditing(
      true
    );
    setPath(path);
    setParentheses([index, index]);
  }, [])

  const Wrapper = React.useMemo(
    () => {
      switch (type) {
        case 'ifElse':
          return ({ children }: { children: React.ReactNode }) =>
            <TemplateParentIfElseDisplay {...{ element: element as IfElseElement, edit, path, index }}>
              {children}
            </TemplateParentIfElseDisplay>
        case 'exists':
          return ({ children }: { children: React.ReactNode }) =>
            <TemplateParentExistsDisplay {...{ element: element as ExistsElement, edit }}>
              {children}
            </TemplateParentExistsDisplay>
        case 'list':
          return ({ children }: { children: React.ReactNode }) =>
            <TemplateParentListDisplay {...{ element: element as ListElement, edit, path, index }}>
              {children}
            </TemplateParentListDisplay>
        case 'textFormatting':
          return ({ children }: { children: React.ReactNode }) =>
            <TemplateParentTextFormattingDisplay {...{ element: element as TextFormattingElement, edit }}>
              {children}
            </TemplateParentTextFormattingDisplay>
        default:
          return ({ children }: { children: React.ReactNode }) => <>{children}</>
      }
    },
    [type]
  )

  return <div className='relative' >
    {((deletionPaths.length || changedConditions.length) && toBeDeleted)
      ? <div className='absolute rounded-lg bg-red-500 bg-opacity-50 z-50 top-0 bottom-0 left-0 right-0' />
      : null
    }
    <Wrapper>
      <EditTemplateDescription path={path.concat([index])} />
    </Wrapper>
  </div>
}
export default TemplateParentElementDisplay; 