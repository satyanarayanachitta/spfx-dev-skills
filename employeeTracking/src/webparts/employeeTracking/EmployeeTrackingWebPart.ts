import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { spfi, SPFx } from '@pnp/sp';
import { EmployeeService } from './services/EmployeeService';
import EmployeeTracking from './components/EmployeeTracking';
import { IEmployeeTrackingProps } from './components/IEmployeeTrackingProps';

export default class EmployeeTrackingWebPart extends BaseClientSideWebPart<Record<string, never>> {

  private _isDarkTheme: boolean = false;
  private _employeeService!: EmployeeService;

  public render(): void {
    const element: React.ReactElement<IEmployeeTrackingProps> = React.createElement(
      EmployeeTracking,
      {
        employeeService: this._employeeService,
        isDarkTheme: this._isDarkTheme
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    const sp = spfi().using(SPFx(this.context));
    this._employeeService = new EmployeeService(sp);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    this.render();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
