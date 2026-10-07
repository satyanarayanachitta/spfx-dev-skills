import type { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

export type EmployeeStatus = 'Active' | 'Inactive';

export interface IEmployee {
  id: number;
  employeeId: string;
  fullName: string;
  jobTitle: string;
  department: string;
  email: string;
  status: EmployeeStatus;
}

export type IEmployeeDraft = Omit<IEmployee, 'id'>;

export interface IEmployeeService {
  getEmployees(): Promise<IEmployee[]>;
  createEmployee(employee: IEmployeeDraft): Promise<void>;
  updateEmployee(id: number, employee: IEmployeeDraft): Promise<void>;
  deleteEmployee(id: number): Promise<void>;
}

const EMPLOYEES_LIST_TITLE = 'Employees';
const EMPLOYEE_FIELDS = ['Id', 'Title', 'EmployeeId', 'JobTitle', 'Department', 'Email', 'Status'];

export class EmployeeService implements IEmployeeService {
  public constructor(private readonly _sp: SPFI) {}

  public async getEmployees(): Promise<IEmployee[]> {
    const items = this._sp.web.lists
      .getByTitle(EMPLOYEES_LIST_TITLE)
      .items.select(...EMPLOYEE_FIELDS)
      .orderBy('Title', true)
      .top(500);

    const employees: IEmployee[] = [];
    for await (const page of items) {
      for (const item of page) {
        employees.push({
          id: Number(item.Id),
          employeeId: String(item.EmployeeId ?? ''),
          fullName: String(item.Title ?? ''),
          jobTitle: String(item.JobTitle ?? ''),
          department: String(item.Department ?? ''),
          email: String(item.Email ?? ''),
          status: item.Status === 'Inactive' ? 'Inactive' : 'Active'
        });
      }
    }
    return employees;
  }

  public async createEmployee(employee: IEmployeeDraft): Promise<void> {
    await this._sp.web.lists.getByTitle(EMPLOYEES_LIST_TITLE).items.add(this._toListItem(employee));
  }

  public async updateEmployee(id: number, employee: IEmployeeDraft): Promise<void> {
    await this._sp.web.lists
      .getByTitle(EMPLOYEES_LIST_TITLE)
      .items.getById(id)
      .update(this._toListItem(employee));
  }

  public async deleteEmployee(id: number): Promise<void> {
    await this._sp.web.lists.getByTitle(EMPLOYEES_LIST_TITLE).items.getById(id).delete();
  }

  private _toListItem(employee: IEmployeeDraft): Record<string, string> {
    return {
      Title: employee.fullName.trim(),
      EmployeeId: employee.employeeId.trim(),
      JobTitle: employee.jobTitle.trim(),
      Department: employee.department.trim(),
      Email: employee.email.trim(),
      Status: employee.status
    };
  }
}
