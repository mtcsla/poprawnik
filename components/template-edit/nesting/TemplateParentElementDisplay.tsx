import React from 'react';
import { ModifyTemplate } from '../../../providers/TemplateDescriptionProvider/ModifyTemplate';
import { ExistsElement, IfElseElement, ListElement, TemplateElementType, TemplatePath, TextFormattingElement, useTemplateDescription } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { EditTemplateDescription } from '../EditTemplateDescription';
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

  const element = React.useMemo(
    () => ModifyTemplate.getElementFromPath(
      description, path, index
    ), [description, path, index]
  )
  const children = React.useMemo(
    () => ModifyTemplate.getDescriptionFromPath(description, path),
    [description, path]
  )

  const Wrapper = React.useMemo(
    () => {
      switch (type) {
        case 'ifElse':
          return ({ children }: { children: React.ReactNode }) =>
            <TemplateParentIfElseDisplay {...{ element: element as IfElseElement }}>
              {children}
            </TemplateParentIfElseDisplay>
        case 'exists':
          return ({ children }: { children: React.ReactNode }) =>
            <TemplateParentExistsDisplay {...{ element: element as ExistsElement }}>
              {children}
            </TemplateParentExistsDisplay>
        case 'list':
          return ({ children }: { children: React.ReactNode }) =>
            <TemplateParentListDisplay {...{ element: element as ListElement }}>
              {children}
            </TemplateParentListDisplay>
        case 'textFormatting':
          return ({ children }: { children: React.ReactNode }) =>
            <TemplateParentTextFormattingDisplay {...{ element: element as TextFormattingElement }}>
              {children}
            </TemplateParentTextFormattingDisplay>
        default:
          return ({ children }: { children: React.ReactNode }) => <>{children}</>
      }
    },
    [type]
  )

  return <div >
    <Wrapper>
      <EditTemplateDescription path={path.concat([index])} />
    </Wrapper>
  </div>
}
export default TemplateParentElementDisplay; 