import React from 'react';
import {render,screen} from '@testing-library/react';
import {describe,expect,it,vi} from 'vitest';
import {MealDayCoverageCard} from './MealDayCoverageCard';

vi.mock('../i18n',()=>({useLanguage:()=>({language:'en'})}));

const moment=(id:string,date:string)=>({id,date,createdAt:0} as never);

describe('MealDayCoverageCard',()=>{
  it('shows distinct seven-day coverage when history is meaningful',()=>{
    render(<MealDayCoverageCard referenceDate="2026-10-02" moments={[moment('real-a','2026-10-02'),moment('real-b','2026-10-01'),moment('real-c','2026-09-29')]}/>);
    expect(screen.getByTestId('meal-day-coverage')).toHaveTextContent('3 of the last 7 days are represented');
    expect(screen.getByLabelText('3/7')).toBeInTheDocument();
  });

  it('does not pressure sparse-history users with a coverage card',()=>{
    const {container}=render(<MealDayCoverageCard referenceDate="2026-10-02" moments={[moment('real-a','2026-10-02')]}/>);
    expect(container).toBeEmptyDOMElement();
  });
});
