import { AlignHorizontalCenter, AlignHorizontalLeft, AlignHorizontalRight, Edit } from '@mui/icons-material';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { TextFormattingElement } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { ParentElementPropsType } from '../TemplateEditor';



export function TemplateParentTextFormattingEditor({ path, element, onChange }: ParentElementPropsType<TextFormattingElement>) {
  const [effect, setEffect] = React.useState(element?.effect ?? 'normal');
  const [_element, setElement] = React.useState(element?.element ?? 'p');
  const [align, setAlign] = React.useState(element?.align ?? 'left');

  React.useEffect(() => {
    onChange({ effect, element: _element, align, child: [], type: 'textFormatting' });
  }, [effect, _element, align]);
  React.useEffect(() => {
    onChange({ effect, element: _element, align, child: [], type: 'textFormatting' });
  }, []);

  return <>
    <FormControl>
      <InputLabel>
        rodzaj tekstu
      </InputLabel>
      <Select label='rodzaj tekstu'
        value={_element}
        onChange={(e, value) => {
          setElement(e.target?.value as TextFormattingElement['element']);
        }}>
        <MenuItem value='h1'><h1 className='m-0'>nagłówek 1</h1></MenuItem>,
        <MenuItem value='h2'><h2 className='m-0'>nagłówek 2</h2></MenuItem>,
        <MenuItem value='h3'><h3 className='m-0'>nagłówek 3</h3></MenuItem>,
        <MenuItem value='h4'><h4 className='m-0'>nagłówek 4</h4></MenuItem>,
        <MenuItem value='p'><p className='m-0'>normalny tekst</p></MenuItem>,
      </Select>
    </FormControl>

    <FormControl className='mt-8'>
      <InputLabel>
        efekt
      </InputLabel>
      <Select label='efekt'
        value={effect}
        onChange={(e, value) => {
          setEffect(e.target?.value as TextFormattingElement['effect']);
        }}>
        <MenuItem value='normal'><p>normalny tekst</p></MenuItem>,
        <MenuItem value='bold'><b>pogrubienie</b></MenuItem>,
        <MenuItem value='italic'><i>kursywa</i></MenuItem>,
        <MenuItem value='underline'><u>podkreślenie</u></MenuItem>,
        <MenuItem value='strikethrough'><del>przekreślenie</del></MenuItem>,
      </Select>
    </FormControl>

    <FormControl className='mt-8'>
      <InputLabel>
        wyrównanie tekstu
      </InputLabel>
      <Select label='wyrównanie tekstu'
        value={align}
        onChange={(e, value) => {
          setAlign(e.target?.value as TextFormattingElement['align']);
        }}>
        <MenuItem value='left'><p className='text-left w-full'><AlignHorizontalLeft className='mr-1' />do lewej</p></MenuItem>,
        <MenuItem value='center'><p className='text-center w-full'><AlignHorizontalCenter className='mr-1' />do środka</p></MenuItem>,
        <MenuItem value='right'><p className='text-right w-full'><AlignHorizontalRight className='mr-1' />do prawej</p></MenuItem>,
      </Select>
    </FormControl>

  </>;
}

export const TemplateParentTextFormattingDisplay = ({ element, children }: { element: TextFormattingElement, children: React.ReactNode }) => {
  return <div style={{ maxWidth: 800 }} className='bg-blue-500 rounded-lg sm:pt-6 pt-4 flex flex-col overflow-x-visible'>
    <span className='px-4 sm:px-6 pb-4 sm:pb-6 w-full inline-flex items-center flex-wrap justify-end gap-3'>
      <pre className='text-sm mb-4 text-white'>Formatowanie tekstu</pre>
      <div className='flex-1' />
      <Button className=' bg-white border-none self-end' size='small' color='primary'>Edytuj<Edit className='ml-2' /></Button>
    </span>
    <p className='text-sm mb-4 text-white mx-4 sm:mx-6'>Tekst będzie wyświetlany z następującym formatowaniem:
    </p>

    <pre className='text-xs mb-2 sm:mx-6 mx-4 text-white'>Rodzaj tekstu</pre> <div className='p-2 mb-2 bg-white flex flex-col mx-4 sm:mx-6 rounded-lg '>
      {
        element.element === 'p'
          ? <p className={`text-${element.align} m-0`}>normalny tekst</p>
          : element.element === 'h1'
            ? <h1 className={`text-${element.align} m-0`}>nagłówek 1</h1>
            : element.element === 'h2'
              ? <h2 className={`text-${element.align} m-0`}>nagłówek 2</h2>
              : element.element === 'h3'
                ? <h3 className={`text-${element.align} m-0`}>nagłówek 3</h3>
                : element.element === 'h4'
                  ? <h4 className={`text-${element.align} m-0`}>nagłówek 4</h4>
                  : null
      }
    </div>
    <pre className='text-xs mb-2 sm:mx-6 mx-4 text-white'>Wyrównanie tekstu</pre> <div className='p-2 mb-2 bg-white flex flex-col mx-4 sm:mx-6 rounded-lg '>
      {
        element.align === 'left' ? <p className='text-left w-full'><AlignHorizontalLeft className='mr-1' />do lewej</p>
          : element.align === 'center' ? <p className='text-center w-full'><AlignHorizontalCenter className='mr-1' />do środka</p>
            : <p className='text-right w-full'><AlignHorizontalRight className='mr-1' />do prawej</p>
      }
    </div>
    <pre className='text-xs mb-2 sm:mx-6 mx-4 text-white'>Efekt tekstu</pre>
    <div className='p-2 bg-white flex flex-col mx-4 sm:mx-6 rounded-lg '>
      {
        element.effect === 'normal' ? <p>normalny tekst</p>
          : element.effect === 'bold' ? <b>pogrubienie</b>
            : element.effect === 'italic' ? <i>kursywa</i>
              : element.effect === 'underline' ? <u>podkreślenie</u>
                : <del>przekreślenie</del>
      }
    </div>

    <div className='bg-blue-500 min-w-full pt-4 pb-4 sm:px-6 px-4 rounded-lg w-fit'>
      <div className='bg-white sm:p-4 p-2 rounded-lg'>
        {children}
      </div>
    </div>

  </div>;
}