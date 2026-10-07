import type { IEmployeeService } from '../services/EmployeeService';

export interface IEmployeeTrackingProps {
  employeeService: IEmployeeService;
  isDarkTheme: boolean;
}
