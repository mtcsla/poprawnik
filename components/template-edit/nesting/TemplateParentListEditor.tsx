import { ArrowDownward, Edit } from '@mui/icons-material';
import { Button, Chip, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import _ from 'lodash';
import React from 'react';
import { listContext } from '../../../pages/account/lawyer/edit-document/template';
import { Expression, ListElement, TemplatePath, useTemplateDescription } from '../../../providers/TemplateDescriptionProvider/TemplateDescriptionProvider';
import { useTemplateChangesDisplay } from '../../form-edit/Changes';
import { ConditionCalculationDisplay } from '../../form-edit/condition-calculation-editor/ConditionCalculationDisplay';
import ConditionCalculationEditor, { Calculation, Condition, OperatorCalculation, OperatorCondition } from '../../form-edit/condition-calculation-editor/ConditionCalculationEditorProvider';
import { listStepsContext, ParentElementPropsType, useListSteps } from '../TemplateEditor';





export const TemplateParentListEditor = ({ path, element, onChange }: ParentElementPropsType<ListElement>) => {
  const [list, setList] = React.useState(element?.list ?? '');
  const [filter, setFilter] = React.useState<Expression<Condition, OperatorCondition>>(element?.filter ?? { operators: [], components: [] });
  const [displayType, setDisplayType] = React.useState<'all' | 'count'>(element?.displayType ?? 'all');
  const [displayCount, setDisplayCount] = React.useState(element?.displayCount ?? '-1');

  const [elementOrder, setElementOrder] = React.useState(element?.elementOrder ?? 'default');
  const [criterium, setCriterium] = React.useState(element?.criterium ?? { operators: [], components: [] });


  const [editingFilter, setEditingFilter] = React.useState(false);
  const [editingCriterium, setEditingCriterium] = React.useState(false);

  const { form } = useTemplateDescription();



  React.useEffect(() => {
    onChange({ type: 'list', list, filter, displayCount, elementOrder, criterium, displayType, child: element?.child?.length ? element?.child : [], });
  }, [
    list, filter, displayCount, elementOrder, criterium, displayType,
  ]);

  React.useEffect(
    () => {
      setFilter({ operators: [], components: [] });
      setCriterium({ operators: [], components: [] });
      setDisplayCount('-1');
      setDisplayType('all');
      setElementOrder('default');
    },
    [list]
  )
  React.useEffect(
    () => {
      setFilter(element?.filter ?? { operators: [], components: [] });
      setCriterium(element?.criterium ?? { operators: [], components: [] });
      setDisplayCount(element?.displayCount ?? '-1');
      setDisplayType(element?.displayType ?? 'all');
      setElementOrder(element?.elementOrder ?? 'default');
    },
    [element]
  )

  const listNames = React.useMemo(() => form.filter(step => step.type === 'list' && step.name).map(list => <MenuItem value={list.name} className='w-full flex items-center justify-between'>
    <Chip size='small' className='mr-2' color='warning' label={list.name} />
    lista
  </MenuItem>
  ),
    [form]);

  return <>
    <p className='mb-8 text-sm'>
      W miejscu tego elementu znajdzie się zagnieżdżony fragment dla każdego elementu listy. Jeśli wybierzesz warunek filtrujący, będą wyświetlane tylko te elementy, które spełniają warunek.
    </p>
    <FormControl>
      <InputLabel>
        nazwa listy
      </InputLabel>
      <Select label='nazwa listy'
        value={list}
        onChange={(e, value) => {
          setList(e.target.value as string);
        }}>
        <MenuItem disabled className='opacity-100'><pre>Listy</pre></MenuItem>
        {listNames}
      </Select>
    </FormControl>
    <div className='inline-flex gap-3 justify-between w-full'>
      <pre className='mt-8 mb-2 text-sm'>Warunek filtrujący</pre>
      <Button disabled={!list} className='self-end border-none' size='small' onClick={() => setEditingFilter(true)}>Zmień</Button>
    </div>
    {(element?.filter ?? filter).components.length
      ? <ConditionCalculationDisplay type='condition' sequence={element?.filter ?? filter} />
      : <div className='p-4 flex justify-center bg-slate-50 rounded-lg'>
        <pre>
          Brak warunku
        </pre>
      </div>}

    <FormControl className='mt-8'>
      <InputLabel>
        ilość elementów do wyświetlenia
      </InputLabel>
      <Select label='ilość elementów do wyświetlenia'
        value={displayType}
        disabled={!list}
        onChange={(e, value) => {
          if (e.target.value === 'all') {
            setDisplayCount('-1');
            setDisplayType('all');
          } else
            setDisplayType('count');
        }}>
        <MenuItem value={'all'}>
          wszystkie
        </MenuItem>
        <MenuItem value={'count'}>
          ustalona ilość
        </MenuItem>
      </Select>
    </FormControl>

    <TextField value={displayCount !== '-1' ? displayCount : ''} disabled={displayType === 'all' || !list}
      onChange={e => { setDisplayCount(e.target.value as `${number}`); }}
      className='mt-4'
      error={displayCount !== '0' && !displayCount?.match(/[1-9]+[0-9]*/)}
      label="liczba elementów do wyświetlenia" />

    <FormControl className='mt-4'>
      <InputLabel>
        kolejność elementów
      </InputLabel>
      <Select value={elementOrder} disabled={!list} onChange={(e) => {
        if (e.target.value === 'default')
          setCriterium(
            { operators: [], components: [] }
          )
        setElementOrder(e.target.value as any);
      }} label='kolejność elementów' >

        <MenuItem value={'default'}>
          ustalona przez użytkownika
        </MenuItem>
        <MenuItem value={'ascending'}>
          sortuj rosnąco
        </MenuItem>
        <MenuItem value={'descending'}>
          sortuj malejąco
        </MenuItem>
      </Select>
    </FormControl>

    <div className='inline-flex gap-3 justify-between w-full'>
      <pre className='mt-8 mb-2 text-sm'>Kryterium sortowania</pre>
      <Button disabled={elementOrder === 'default' || !list} className='self-end border-none' size='small' onClick={() => setEditingCriterium(true)}>Zmień</Button>
    </div>
    {(criterium).components.length
      ? <ConditionCalculationDisplay type='calculation' sequence={criterium} />
      : <div className='p-4 flex justify-center bg-slate-50 rounded-lg'>
        <pre>
          Brak kryterium
        </pre>
      </div>}




    {
      editingCriterium
        ? <ConditionCalculationEditor type='calculation' initValue={criterium} exit={() => setEditingCriterium(false)} save={(value) => {
          setCriterium(value as Expression<Calculation, OperatorCalculation>); setEditingCriterium(false)
        }} />
        : null
    }
    {
      editingFilter
        ? <ConditionCalculationEditor type='condition' initValue={filter} exit={() => setEditingFilter(false)} save={(value) => {
          setFilter(value as Expression<Condition, OperatorCondition>); setEditingFilter(false)
        }} />
        : null
    }

  </>;
};

export const TemplateParentListDisplay = ({ element, children, edit, path, index }: { element: ListElement, children: React.ReactNode, edit: () => void, path: TemplatePath, index: number }) => {
  const { form } = useTemplateDescription();
  const { changedConditions, deletionPaths } = useTemplateChangesDisplay();
  const listSteps = useListSteps();
  const lists = React.useContext(listContext);
  const changedCondition = React.useMemo(() => {
    const changed = changedConditions.find(condition => _.isEqual(condition[0], path.concat([index])));
    return changed ? changed[1] : null;
  }, [])


  return <div style={{ maxWidth: 800 }} className='rounded-lg sm:pt-6 pt-4 flex flex-col overflow-x-visible bg-yellow-100'>
    <span className='px-4 sm:px-6 pb-4 sm:pb-6 w-full inline-flex items-center flex-wrap justify-end gap-3'>
      <pre className='text-sm mb-4'>Interpretacja listy</pre>
      <div className='flex-1' />
      {
        changedConditions.length || deletionPaths.length
          ? null
          : <Button className='bg-white border-none self-end' size='small' color='primary' onClick={edit}>Edytuj<Edit className='ml-2' /></Button>
      }
    </span>
    <p className='text-sm mb-4 mx-4 sm:mx-6'>
      {element?.displayType === 'all' ? <>Każdy element listy
        <span className='inline-flex items-center mx-1 p-1 bg-white rounded-lg'><Chip size='small' color='warning' label={element.list} /></span>
        zostanie wstawiony jako poniższy fragment.
      </>
        : <>Pierwsze <span className='inline-flex items-center mx-1 p-1 bg-white rounded-lg'><Chip size='small' color='warning' label={element.displayCount} /></span> elementów listy
          <span className='inline-flex items-center mx-1 p-1 bg-white rounded-lg'><Chip size='small' color='warning' label={element.list} /></span> zostanie wstawionych jako poniższy fragment.</>
      }
    </p>

    <pre className='mx-4 sm:mx-6 mb-2 mt-4 text-xs'>Warunek filtrujący</pre>
    <p className='text-sm mb-4 mx-4 sm:mx-6'>
      Wstawione zostaną tylko te elementy listy, dla których warunek jest spełniony:
    </p>
    <div className={`${changedCondition ? 'bg-purple-100' : 'bg-white'} p-4 flex-col inline-flex gap-3 mb-6  mx-4 sm:mx-6 rounded-lg items-stretch justify-center`}>

      {element?.filter?.operators?.length
        ?
        <>

          <ConditionCalculationDisplay type='condition' sequence={element.filter as Expression<Condition, OperatorCondition>} />
          {

            changedCondition ?
              <>
                <div className="flex rounded justify-center p-3 bg-blue-500 bg-opacity-20"><ArrowDownward color='primary' /> </div>

                <ConditionCalculationDisplay type='condition' sequence={changedCondition as Expression<Condition, OperatorCondition>} />
              </> : null
          }
        </>

        : <div className='p-4 flex justify-center border rounded-lg'>
          <pre>
            Brak warunku
          </pre>
        </div>}
    </div>


    {element?.criterium?.components?.length ? <>

      <pre className='mx-4 sm:mx-6 mb-2 mt-4 text-xs'>Kryterium sortowania</pre>
      <p className='text-sm mb-4 mx-4 sm:mx-6'>
        Elementy zostaną posortowane <b>{
          element?.elementOrder === 'ascending' ? 'rosnąco'
            : 'malejąco'
        }</b> według kryterium:
      </p>
      <div className={`bg-white p-4 flex-col inline-flex gap-3 mb-6  mx-4 sm:mx-6 rounded-lg items-stretch justify-center`}>
        <ConditionCalculationDisplay type='calculation' sequence={element.criterium as Expression<Calculation, OperatorCalculation>} />
      </div>
    </> : null}


    <div className='bg-yellow-100 min-w-full pt-4 pb-4 sm:pb-6 sm:px-6 px-4 rounded-lg w-fit'>
      <div className='bg-white sm:p-4 p-2 rounded-lg'>
        <listContext.Provider value={element?.list != null ? lists.concat(element.list) : lists}>
          <listStepsContext.Provider value={lists.concat(element?.list).map((item) => form.findIndex((step) => step.type === 'list' && step.name === item))}>
            {children}
          </listStepsContext.Provider>
        </listContext.Provider>
      </div>
    </div>

  </div>;
}