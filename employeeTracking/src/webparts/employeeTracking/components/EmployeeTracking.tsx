import * as React from 'react';
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  FluentProvider,
  Input,
  Option,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  webDarkTheme,
  webLightTheme
} from '@fluentui/react-components';
import {
  AddRegular,
  DeleteRegular,
  EditRegular
} from '@fluentui/react-icons';
import styles from './EmployeeTracking.module.scss';
import type { IEmployee, IEmployeeDraft } from '../services/EmployeeService';
import type { IEmployeeTrackingProps } from './IEmployeeTrackingProps';

const createEmptyDraft = (): IEmployeeDraft => ({
  employeeId: '',
  fullName: '',
  jobTitle: '',
  department: '',
  email: '',
  status: 'Active'
});

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'An unexpected error occurred.';

const EmployeeTracking: React.FC<IEmployeeTrackingProps> = ({ employeeService, isDarkTheme }) => {
  const [employees, setEmployees] = React.useState<IEmployee[]>([]);
  const [searchText, setSearchText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<IEmployee | undefined>();
  const [draft, setDraft] = React.useState<IEmployeeDraft>(createEmptyDraft);
  const [errorMessage, setErrorMessage] = React.useState('');

  const loadEmployees = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      setEmployees(await employeeService.getEmployees());
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [employeeService]);

  React.useEffect(() => {
    loadEmployees().catch((error: unknown) => {
      setErrorMessage(getErrorMessage(error));
      setIsLoading(false);
    });
  }, [loadEmployees]);

  const openCreateForm = (): void => {
    setEditingEmployee(undefined);
    setDraft(createEmptyDraft());
    setErrorMessage('');
    setIsFormOpen(true);
  };

  const openEditForm = (employee: IEmployee): void => {
    setEditingEmployee(employee);
    setDraft({
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      jobTitle: employee.jobTitle,
      department: employee.department,
      email: employee.email,
      status: employee.status
    });
    setErrorMessage('');
    setIsFormOpen(true);
  };

  const closeForm = (): void => {
    if (!isSaving) {
      setIsFormOpen(false);
    }
  };

  const updateDraft = (field: keyof IEmployeeDraft, value: string): void => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const saveEmployee = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, draft);
      } else {
        await employeeService.createEmployee(draft);
      }
      setIsFormOpen(false);
      await loadEmployees();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEmployee = async (employee: IEmployee): Promise<void> => {
    if (!window.confirm(`Delete ${employee.fullName}?`)) {
      return;
    }

    setErrorMessage('');
    try {
      await employeeService.deleteEmployee(employee.id);
      await loadEmployees();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const normalizedSearchText = searchText.trim().toLocaleLowerCase();
  const filteredEmployees = employees.filter((employee) =>
    [
      employee.employeeId,
      employee.fullName,
      employee.jobTitle,
      employee.department,
      employee.email,
      employee.status
    ].some((value) => value.toLocaleLowerCase().includes(normalizedSearchText))
  );

  return (
    <FluentProvider theme={isDarkTheme ? webDarkTheme : webLightTheme}>
      <section className={styles.employeeTracking} aria-labelledby="employee-tracking-title">
        <header className={styles.header}>
          <div>
            <Text as="h2" size={600} weight="semibold" id="employee-tracking-title">
              Employee directory
            </Text>
            <Text as="p" size={300}>
              {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
            </Text>
          </div>
          <Button appearance="primary" icon={<AddRegular />} onClick={openCreateForm}>
            Add employee
          </Button>
        </header>

        {errorMessage && (
          <div className={styles.error} role="alert">
            {errorMessage}
          </div>
        )}

        <Field label="Search employees">
          <Input
            type="search"
            value={searchText}
            onChange={(_event, data) => setSearchText(data.value)}
            placeholder="Search by name, department, or email"
          />
        </Field>

        {isLoading ? (
          <div className={styles.loading}>
            <Spinner label="Loading employees..." />
          </div>
        ) : filteredEmployees.length === 0 ? (
          errorMessage ? null : (
            <div className={styles.emptyState}>
              <Text weight="semibold">
                {employees.length === 0 ? 'No employees yet' : 'No matching employees'}
              </Text>
              <Text>
                {employees.length === 0
                  ? 'Add an employee to get started.'
                  : 'Try a different search.'}
              </Text>
            </div>
          )
        ) : (
          <div className={styles.tableContainer}>
            <Table aria-label="Employee directory" className={styles.table}>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Employee ID</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Job title</TableHeaderCell>
                  <TableHeaderCell>Department</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employeeId}</TableCell>
                    <TableCell>{employee.fullName}</TableCell>
                    <TableCell>{employee.jobTitle}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <a href={`mailto:${employee.email}`}>{employee.email}</a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        appearance="tint"
                        color={employee.status === 'Active' ? 'success' : 'subtle'}
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={styles.rowActions}>
                        <Button
                          appearance="subtle"
                          icon={<EditRegular />}
                          aria-label={`Edit ${employee.fullName}`}
                          onClick={() => openEditForm(employee)}
                        />
                        <Button
                          appearance="subtle"
                          icon={<DeleteRegular />}
                          aria-label={`Delete ${employee.fullName}`}
                          onClick={() => deleteEmployee(employee)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog
          open={isFormOpen}
          onOpenChange={(_event, data) => {
            if (!isSaving) {
              setIsFormOpen(data.open);
            }
          }}
        >
          <DialogSurface>
            <DialogBody>
              <DialogTitle>{editingEmployee ? 'Edit employee' : 'Add employee'}</DialogTitle>
              <DialogContent>
                {errorMessage && (
                  <div className={styles.error} role="alert">
                    {errorMessage}
                  </div>
                )}
                <form id="employee-form" className={styles.formFields} onSubmit={saveEmployee}>
                  <Field label="Employee ID" required>
                    <Input
                      required
                      value={draft.employeeId}
                      onChange={(_event, data) => updateDraft('employeeId', data.value)}
                    />
                  </Field>
                  <Field label="Full name" required>
                    <Input
                      required
                      value={draft.fullName}
                      onChange={(_event, data) => updateDraft('fullName', data.value)}
                    />
                  </Field>
                  <Field label="Job title" required>
                    <Input
                      required
                      value={draft.jobTitle}
                      onChange={(_event, data) => updateDraft('jobTitle', data.value)}
                    />
                  </Field>
                  <Field label="Department" required>
                    <Input
                      required
                      value={draft.department}
                      onChange={(_event, data) => updateDraft('department', data.value)}
                    />
                  </Field>
                  <Field label="Email" required>
                    <Input
                      required
                      type="email"
                      value={draft.email}
                      onChange={(_event, data) => updateDraft('email', data.value)}
                    />
                  </Field>
                  <Field label="Status">
                    <Dropdown
                      value={draft.status}
                      selectedOptions={[draft.status]}
                      onOptionSelect={(_event, data) => {
                        if (data.optionValue === 'Active' || data.optionValue === 'Inactive') {
                          updateDraft('status', data.optionValue);
                        }
                      }}
                    >
                      <Option value="Active">Active</Option>
                      <Option value="Inactive">Inactive</Option>
                    </Dropdown>
                  </Field>
                </form>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={closeForm} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  appearance="primary"
                  type="submit"
                  form="employee-form"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save employee'}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </section>
    </FluentProvider>
  );
};

export default EmployeeTracking;
