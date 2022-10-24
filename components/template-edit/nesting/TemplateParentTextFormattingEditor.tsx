import { AlignHorizontalCenter, AlignHorizontalLeft, AlignHorizontalRight, Edit } from '@mui/icons-material';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { textFormattingContext } from '../../../pages/account/lawyer/edit-document/template';
import { TextFormattingElement } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useTemplateChangesDisplay } from '../../form-edit/Changes';
import { ParentElementPropsType } from '../TemplateEditor';



export function TemplateParentTextFormattingEditor({ path, element, onChange }: ParentElementPropsType<TextFormattingElement>) {
  const [effect, setEffect] = React.useState(element?.effect ?? 'normal');
  const [_element, setElement] = React.useState(element?.element ?? 'p');
  const [align, setAlign] = React.useState(element?.align ?? 'left');

  const [textFormattingType, setTextFormattingType] = React.useState<'element' | 'effect'>(element?.textFormattingType ?? 'effect');
  const textFormatContextValue = React.useContext(textFormattingContext);

  React.useEffect(() => {
    onChange({ effect, element: _element, align, child: element?.child?.length ? element?.child : [], type: 'textFormatting', textFormattingType });
  }, [effect, _element, align, textFormattingType]);
  React.useEffect(() => {
    onChange({ effect, element: _element, align, child: element?.child?.length ? element?.child : [], type: 'textFormatting', textFormattingType });
  }, []);

  return <>
    <FormControl className='mb-8'>
      <InputLabel>rodzaj formatowania</InputLabel>
      <Select value={textFormattingType} onChange={(e) => setTextFormattingType(e.target?.value as TextFormattingElement['textFormattingType'])} label='rodzaj formatowania'>
        <MenuItem value='effect'>efekt</MenuItem>
        <MenuItem value='element' disabled={textFormatContextValue.textFormattingType === 'element'}>element</MenuItem>
      </Select>

    </FormControl>
    <div className='w-full border-b mb-8' />


    <div className='flex flex-col w-full relative'>
      {textFormattingType == 'element' ? <>
        <FormControl className='mb-8'>
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
        <FormControl className='mb--8'>
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
      </>
        :
        <FormControl >
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
      }
    </div>

  </>;
}

export const TemplateParentTextFormattingDisplay = ({ element, children, edit }: { element: TextFormattingElement, children: React.ReactNode, edit: () => void }) => {
  const { changedConditions, deletionPaths } = useTemplateChangesDisplay();
  const textFormatContextValue = React.useContext(textFormattingContext);
  return <div style={{ maxWidth: 800 }} className='rounded-lg sm:pt-6 pt-4 flex flex-col overflow-x-visible bg-sky-100'>
    <span className='px-4 sm:px-6 pb-4 sm:pb-6 w-full inline-flex items-center flex-wrap justify-end gap-3'>
      <pre className='text-sm mb-4'>Formatowanie tekstu</pre>
      <div className='flex-1' />
      {
        changedConditions.length || deletionPaths.length
          ? null
          : <Button className='bg-white border-none self-end' size='small' color='primary' onClick={edit}>Edytuj<Edit className='ml-2' /></Button>
      }
    </span>
    <p className='text-sm mb-4 mx-4 sm:mx-6'>Tekst będzie wyświetlany z następującym formatowaniem:
    </p>

    {element.textFormattingType === 'element' ? <>
      <pre className='text-xs mb-2 sm:mx-6 mx-4 '>Rodzaj tekstu</pre> <div className='p-2 mb-2 bg-white flex flex-col mx-4 sm:mx-6 rounded-lg '>
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
      <pre className='text-xs mb-2 sm:mx-6 mx-4'>Wyrównanie tekstu</pre> <div className='p-2 mb-2 bg-white flex flex-col mx-4 sm:mx-6 rounded-lg '>
        {
          element.align === 'left' ? <p className='text-left w-full'><AlignHorizontalLeft className='mr-1' />do lewej</p>
            : element.align === 'center' ? <p className='text-center w-full'><AlignHorizontalCenter className='mr-1' />do środka</p>
              : <p className='text-right w-full'><AlignHorizontalRight className='mr-1' />do prawej</p>
        }
      </div>

    </>
      : <>
        <pre className='text-xs mb-2 sm:mx-6 mx-4'>Efekt tekstu</pre>
        <div className='p-2 bg-white flex flex-col mx-4 sm:mx-6 rounded-lg '>
          {
            element.effect === 'normal' ? <p>normalny tekst</p>
              : element.effect === 'bold' ? <b>pogrubienie</b>
                : element.effect === 'italic' ? <i>kursywa</i>
                  : element.effect === 'underline' ? <u>podkreślenie</u>
                    : <del>przekreślenie</del>
          }
        </div>
      </>
    }

    <div className='bg-sky-100 min-w-full pt-4 pb-4 sm:pb-6 sm:px-6 px-4 rounded-lg w-fit'>
      <div className='bg-white sm:p-4 p-2 rounded-lg'>
        <textFormattingContext.Provider value={{
          textFormattingType: element.textFormattingType || 'effect',

          align: element.textFormattingType === 'element' ? element.align || 'left' : textFormatContextValue.align,
          effect: element.textFormattingType === 'effect' ? element.effect || 'normal' : textFormatContextValue.effect,
          element: element.textFormattingType === 'element' ? element.element || 'p' : textFormatContextValue.element,
        }}>
          {children}
        </textFormattingContext.Provider>
      </div>
    </div>

  </div>;
}