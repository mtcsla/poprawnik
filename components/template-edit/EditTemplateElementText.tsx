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

  return <div className='w-full flex flex-col'>
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      className='w-full rounded-lg border p-2 sm:p-4' placeholder='treść tekstu' style={{ minHeight: 200 }} />
  </div>;
};

