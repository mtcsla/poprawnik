import React from 'react';
import { TemplatePath, TextElement } from '../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';

export const EditTemplateElementText = ({ path, index, onChange, element }: {
  path: TemplatePath; index: number | null; onChange: (element: TextElement) => void; element: TextElement | null;
}) => {

  const [text, setText] = React.useState<string>(element?.text ?? '');

  React.useEffect(() => {
    onChange({
      type: 'text',
      text,
      child: null as never
    });
  }, [text]);

  const process = React.useCallback((text: string) => {
    let newText = text;
    newText = newText.replace(/\n/g, '⮐')
    newText = newText.replace(/ /g, '•');
    newText = newText.replace(/\t/g, '••');
    newText = newText.replace(/••/g, '⇥');
    return newText;
  }, [])
  const normalize = React.useCallback((text: string) => {
    let newText = text;
    newText = newText.replace(/⇥/g, '\t');
    newText = newText.replace(/•/g, ' ');
    newText = newText.replace(/⮐/g, '\n');
    return newText
  }, []);

  return <div className='w-full flex flex-col'>
    {text}
    <textarea
      defaultValue={normalize(text)}
      onChange={(e) => {
        const newText = e.target.value;

        setText(
          process(newText)
        )
      }}
      className='w-full rounded-lg border p-2 sm:p-4' placeholder='treść tekstu' style={{ minHeight: 200 }} />
  </div>;
};

