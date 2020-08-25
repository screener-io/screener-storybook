import React from 'react';
import Screener, {Steps} from '../../../src/screener.js';
import { storiesOf } from '@storybook/react';

storiesOf('Welcome', module)
  .add('default', () => (
    <Screener steps={new Steps()
      .click('.myButton')
      .snapshot('name')
      .end()
    }>
      <button className="myButton">super button</button>
    </Screener>
  ));
