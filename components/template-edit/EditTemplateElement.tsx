import { KeyboardReturn, SpaceBar } from '@mui/icons-material';
import { Chip } from '@mui/material';
import _ from 'lodash';
import React from 'react';
import { textFormattingContext } from '../../pages/account/lawyer/edit-document/template';
import { ModifyTemplate } from '../../providers/TemplateDescriptionProvider/ModifyTemplate';
import { TemplateElementType, TemplatePath, TextFormattingElement, useTemplateDescription } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useTemplateChangesDisplay } from '../form-edit/Changes';
import { ConditionCalculationDisplay } from '../form-edit/condition-calculation-editor/ConditionCalculationDisplay';
import TemplateParentElementDisplay from './nesting/TemplateParentElementDisplay';
import { useTemplateParenthesesEditor } from './TemplateEditor';

export const EditTemplateElement = ({ disabled, path, index, openMenu, menuTarget }: {
  path: TemplatePath;
  index: number;
  openMenu: (event: React.MouseEvent<HTMLElement>, index: number) => void;
  menuTarget: HTMLElement | null;
  disabled?: boolean
}) => {
  const { description, modifyDescription } = useTemplateDescription();

  const element = React.useMemo(
    () => ModifyTemplate.getElementFromPath(description, path, index),
    [description, path, index]
  );
  const parentElement = React.useMemo(
    () => <TemplateParentElementDisplay {...{ path, index, type: element.type as TemplateElementType['parent'] }} />
    , [path, index, element.type]);

  const RenderElement = React.useMemo(
    () => ({ hovered }: { hovered: boolean; }) => {


      if (element.type === 'text') {

        const textFormatting = React.useContext(textFormattingContext);
        const El = getTextElement(textFormatting?.textFormattingType, textFormatting?.element ?? 'p', textFormatting?.align ?? 'left', textFormatting?.effect ?? 'normal');


        return <div className='flex flex-col' >
          <pre className={`text-xs rounde ${hovered ? 'text-blue-500' : ''} -mb-2.5 z-30 ml-4  px-1 bg-white self-start`}>Tekst</pre>
          <div className={`p-2 ${hovered ? 'bg-blue-100 text-blue-500' : ''} text-sm flex-col flex sm:p-4 rounded-lg `}>
            <El>
              {element.text}
            </El>
          </div>
        </div>;
      }
      if (element.type === 'calculation')
        return <div className='flex flex-col' >
          <pre className={`text-xs rounde ${hovered ? 'text-blue-500' : ''} -mb-2.5 z-30 ml-4  px-1 bg-white self-start`}>Obliczenia</pre>
          <ConditionCalculationDisplay sequence={element.calculation} type='calculation' focused={hovered} />
        </div>;
      if (element.type === 'variable')
        return <div className='flex flex-col'  >
          <pre className={`text-xs rounde ${hovered ? 'text-blue-500' : ''} -mb-2.5 z-30 ml-4  px-1 bg-white self-start`}>Zmienna</pre>
          <div className={`p-2 ${hovered ? 'bg-blue-100 text-blue-500' : ''} text-sm flex-col flex sm:p-4 rounded-lg `}>
            <Chip label={element.variable} color='primary' className='pointer-events-none' />
          </div>
        </div>;
      if (element.type === 'enter')
        return <pre className={`text-center ${hovered ? 'text-blue-500 bg-blue-100' : ''} p-1 sm:p-2 rounded-lg  text-sm`}>
          <KeyboardReturn className='mr-2' />
          enter
        </pre>;
      if (element.type === 'space')
        return <pre className={`text-center ${hovered ? 'text-blue-500 bg-blue-100' : ''} p-1 sm:p-2 rounded-lg  text-sm`}>
          <SpaceBar className='mr-2' />
          spacja
        </pre>;
      if (['ifElse', 'exists', 'list', 'textFormatting'].includes(element.type))
        return parentElement;
      return <></>;
    },
    [element]
  );
  const ref = React.useRef<HTMLElement>();
  const menuOpen = React.useMemo(() => menuTarget === ref.current, [menuTarget, ref.current]);

  const parentheses = useTemplateParenthesesEditor();

  const [hovered, setHovered] = React.useState(false);
  React.useEffect(() => {
    if (!menuOpen)
      setHovered(false);
  }, [menuOpen]);

  const { changedConditions, deletionPaths } = useTemplateChangesDisplay();
  const toBeDeleted = React.useMemo(() => deletionPaths.findIndex(delpath => _.isEqual(path.concat([index]), delpath)) >= 0, [])

  return <span
    onClick={(e) => !['ifElse', 'exists', 'list', 'textFormatting'].includes(element.type) && openMenu(e, index)}
    ref={ref as any}
    onMouseOver={() => setHovered(true)}
    onMouseLeave={() => {
      if (!menuOpen)
        setHovered(false);
    }}
    className={
      `${(!disabled && !['ifElse', 'exists', 'list', 'textFormatting'].includes(element.type) && (hovered || menuOpen)) ? 'cursor-pointer' : ''} ${disabled ? 'cursor-not-allowed' : ''} ${(parentheses.path != null && path.length < parentheses.path!.length && !parentheses.path?.toString().startsWith(path.concat(index).toString())) ? 'opacity-20 pointer-events-none' : 'opacity-100'} max-w-none relative w-auto transition-transform `
    }>

    {((deletionPaths.length || changedConditions.length) && toBeDeleted)

      ? <div className='absolute rounded-lg bg-red-500 bg-opacity-50 z-50  -top-2 -bottom-2 -left-2 -right-2' />
      : null}
    <RenderElement hovered={!disabled && (hovered || menuOpen)} />
  </span>;
};


const getTextElement = (textFormattingType: TextFormattingElement['textFormattingType'], element: TextFormattingElement['element'], align: TextFormattingElement['align'], effect: TextFormattingElement['effect']) => {
  const Effect = getTextEffect(effect);

  switch (element) {
    case 'h1':
      return ({ children }: { children: React.ReactNode }) => <Effect><h1 className={getTextAlignment(align)}>{children}</h1></Effect>;
    case 'h2':
      return ({ children }: { children: React.ReactNode }) => <Effect><h2 className={getTextAlignment(align)}>{children}</h2></Effect>;
    case 'h3':
      return ({ children }: { children: React.ReactNode }) => <Effect><h3 className={getTextAlignment(align)}>{children}</h3></Effect>;
    case 'h4':
      return ({ children }: { children: React.ReactNode }) => <Effect><h4 className={getTextAlignment(align)}>{children}</h4></Effect>;
    default:
      return ({ children }: { children: React.ReactNode }) => <Effect><p className={getTextAlignment(align)}>{children}</p></Effect>;
  }
}
const getTextEffect = (effect: TextFormattingElement['effect']) => {
  switch (effect) {
    case 'bold':
      return ({ children }: { children: React.ReactNode }) => <strong>{children}</strong>;
    case 'italic':
      return ({ children }: { children: React.ReactNode }) => <em>{children}</em>;
    case 'underline':
      return ({ children }: { children: React.ReactNode }) => <u>{children}</u>;
    case 'strikethrough':
      return ({ children }: { children: React.ReactNode }) => <s>{children}</s>;
    default:
      return ({ children }: { children: React.ReactNode }) => <>{children}</>;
  }
}
const getTextAlignment = (alignment: TextFormattingElement['align']) => {
  switch (alignment) {
    case 'left':
      return 'text-left text-el';
    case 'center':
      return 'text-center text-el';
    case 'right':
      return 'text-right text-el';
    default:
      return 'text-el';
  }
}