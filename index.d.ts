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

  export interface Steps {
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
    wait(val: number | string): Steps;
    waitForNotFound(selector: string): Steps;
    rtl(): Steps;
    ltr(): Steps;
    end(): object[];
  }

  // tslint:disable-next-line
  export class Steps implements Steps {}

  export interface ScreenerProps {
    steps?: Steps;
    isScreenerComponent?: boolean;
  }

  export default class Screener extends React.Component<ScreenerProps> {}
}
