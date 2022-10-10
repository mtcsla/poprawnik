import { KeyboardReturn, SpaceBar } from '@mui/icons-material';
import { Chip } from '@mui/material';
import React from 'react';
import { ModifyTemplate } from '../../providers/TemplateDescriptionProvider/ModifyTemplate';
import { TemplatePath, useTemplateDescription } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { ConditionCalculationDisplay } from '../form-edit/condition-calculation-editor/ConditionCalculationDisplay';
import TemplateParentElementDisplay from './nesting/TemplateParentElementDisplay';

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
  const RenderElement = React.useMemo(
    () => ({ hovered }: { hovered: boolean; }) => {
      if (element.type === 'text')
        return <div className='flex flex-col'>
          <pre className={`text-xs ${hovered ? 'text-blue-500' : ''} -mb-2.5 z-50 ml-4  px-1 bg-white self-start`}>Tekst</pre>
          <div className={`p-2 ${hovered ? 'border-blue-500 text-blue-500' : ''} text-sm flex-col flex sm:p-4 rounded-lg border`}>
            <p>
              {element.text}
            </p>
          </div>
        </div>;
      if (element.type === 'calculation')
        return <div className='flex flex-col'>
          <pre className={`text-xs ${hovered ? 'text-blue-500' : ''} -mb-2.5 z-50 ml-4  px-1 bg-white self-start`}>Obliczenia</pre>
          <ConditionCalculationDisplay sequence={element.calculation} type='calculation' focused={hovered} />
        </div>;
      if (element.type === 'variable')
        return <div className='flex flex-col'>
          <pre className={`text-xs ${hovered ? 'text-blue-500' : ''} -mb-2.5 z-50 ml-4  px-1 bg-white self-start`}>Zmienna</pre>
          <div className={`p-2 ${hovered ? 'border-blue-500 text-blue-500' : ''} text-sm flex-col flex sm:p-4 rounded-lg border`}>
            <Chip label={element.variable} color='primary' className='pointer-events-none' />
          </div>
        </div>;
      if (element.type === 'enter')
        return <pre className={`text-center ${hovered ? 'text-blue-500 border-blue-500' : ''} p-1 sm:p-2 rounded-lg border text-sm`}>
          <KeyboardReturn className='mr-2' />
          enter
        </pre>;
      if (element.type === 'space')
        return <pre className={`text-center ${hovered ? 'text-blue-500 border-blue-500' : ''} p-1 sm:p-2 rounded-lg border text-sm`}>
          <SpaceBar className='mr-2' />
          spacja
        </pre>;
      if (['ifElse', 'exists', 'list', 'textFormatting'].includes(element.type))
        return <TemplateParentElementDisplay {...{ path, index, type: element.type }} />
      return <></>;
    },
    [element]
  );
  const ref = React.useRef<HTMLElement>();
  const menuOpen = React.useMemo(() => menuTarget === ref.current, [menuTarget, ref.current]);

  const [hovered, setHovered] = React.useState(false);
  React.useEffect(() => {
    if (!menuOpen)
      setHovered(false);
  }, [menuOpen]);

  return <span
    onClick={(e) => !['ifElse', 'exists', 'list', 'textFormatting'].includes(element.type) && openMenu(e, index)}
    ref={ref as any}
    onMouseOver={() => setHovered(true)}
    onMouseLeave={() => {
      if (!menuOpen)
        setHovered(false);
    }}
    className={
      `${(!disabled && !['ifElse', 'exists', 'list', 'textFormatting'].includes(element.type) && (hovered || menuOpen)) ? 'cursor-pointer scale-102' : ''} ${disabled ? 'cursor-not-allowed' : ''} max-w-none w-auto transition-transform `
    }>
    <RenderElement hovered={!disabled && (hovered || menuOpen)} />
  </span>;
};
