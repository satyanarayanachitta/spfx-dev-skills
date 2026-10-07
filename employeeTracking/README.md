# Employee Tracking

An SPFx React web part for searching and managing employee records in a SharePoint list. It uses SPFx 1.23.2, Heft, Fluent UI, and PnPjs.

## Features

- List and search employee records
- Add, edit, and delete employees
- Display employee ID, name, job title, department, email, and status
- Show loading, empty, and error states

## SharePoint list setup

Create a custom SharePoint list named **Employees** on the site where the web part will be used. The signed-in user needs permission to read and add, edit, and delete list items.

Keep the built-in `Title` column and create these **single line of text** columns with the exact internal names shown:

| Internal name | Purpose |
| --- | --- |
| `EmployeeId` | Employee identifier |
| `JobTitle` | Job title |
| `Department` | Department |
| `Email` | Email address |
| `Status` | `Active` or `Inactive` |

The web part stores the employee's full name in `Title`. The list is not created automatically; if it or one of its columns is missing, the web part displays the SharePoint error.

## Run and build

Use Node.js `>=22.14.0 <23.0.0`.

```powershell
npm install
npm run start
```

Add the web part to a SharePoint page or hosted workbench after configuring the `Employees` list. To create a production package:

```powershell
npm run build
```

The `.sppkg` package is written to `sharepoint/solution/employee-tracking.sppkg`.
