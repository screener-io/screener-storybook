/// <reference types='react' />

declare module 'screener-storybook/src/screener' {
  export type Key =
    | 'alt'
    | 'control'
    | 'enter'
    | 'escape'
    | 'return'
    | 'shift'
    | 'tab'
    | 'leftArrow'
    | 'upArrow'
    | 'rightArrow'
    | 'downArrow';

  export const Keys: Record<Key, string>;

  export interface SnapshotOpts {
    cropTo: string
  }

  export interface SetValueOpts {
    isPassword: boolean
  }

  export interface Locator {
    type: 'css selector';
    value: string;
  }

  export type StepType = 'url' |
    'saveScreenshot' |
    'cropScreenshot' |
    'clickElement' |
    'moveTo' |
    'clickAndHoldElement' |
    'releaseElement' |
    'setElementText' |
    'sendKeys' |
    'executeScript' |
    'ignoreElements' |
    'pause' |
    'waitForElementPresent' |
    'waitForElementNotPresent' |
    'cssAnimations';

  export interface Step {
    type: StepType;
    locator?: Locator;
    url?: string;
    name?: string;
    text?: string;
    isPassword?: boolean;
    keys?: string;
    code?: string;
    isAsync?: boolean;
    waitTime?: number;
    isEnabled?: boolean;
  }

  export class Steps {
    url(url: string): Steps;
    click(selector: string): Steps;
    cssAnimations(enabled: boolean): Steps;
    snapshot(name: string, options?: SnapshotOpts): Steps;
    focus(selector: string): Steps;
    hover(selector: string): Steps;
    mouseDown(selector: string): Steps;
    mouseUp(selector: string): Steps;
    keys(selector: string, keys: string): Steps;
    setValue(selector: string, value: string, options?: SetValueOpts): Steps;
    executeScript(code: string, isAsync?: boolean): Steps;
    ignore(selector: string): Steps;
    wait(selector: string): Steps;
    wait(ms: number): Steps;
    waitForNotFound(selector: string): Steps;
    rtl(): Steps;
    ltr(): Steps;
    end(): Step[];
  }

  export interface ScreenerProps {    
    children: React.ReactNode; 
    /**
     * Steps to run. Build using a `Steps` object and convert to an array using `.end()`.
     * @example new Steps().hover('.foo').snapshot('hovered').end()
     */
    steps?: Step[];
    isScreenerComponent?: boolean;
  }

  export default class Screener extends React.Component<ScreenerProps> {
    static Steps: typeof Steps;
    static Keys: typeof Keys;
  }
}
