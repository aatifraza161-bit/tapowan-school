const moduleConfig = require('./public/app.js').moduleConfig || {
  admissions: {}, dashboard: {}, myProfile: {}, students: {}, teachers: {}, classes: {},
  subjects: {}, exams: {}, timetable: {}, holidays: {},
  attendance: {}, teacherAttendance: {},
  fees: {}, dueManagement: {}, payroll: {}, booksAndDress: {}, whatsappAlerts: {},
  library: {}, transport: {}, hostel: {}, users: {}, backup: {}
};

const NAV_GROUPS = {
  'Core': ['admissions', 'dashboard', 'myProfile', 'students', 'teachers', 'classes'],
  'Academic': ['subjects', 'exams', 'timetable', 'holidays'],
  'Daily': ['attendance', 'teacherAttendance'],
  'Finance': ['fees', 'dueManagement', 'payroll', 'booksAndDress', 'whatsappAlerts'],
  'Resources': ['library', 'transport', 'hostel', 'users', 'backup']
};

const visible = new Set(Object.keys(moduleConfig));
let expectedButtonCount = 0;
for (const [groupName, modules] of Object.entries(NAV_GROUPS)) {
  const visibleInGroup = modules.filter(mod => moduleConfig[mod] && visible.has(mod));
  expectedButtonCount += visibleInGroup.length;
}
console.log('Expected Button Count:', expectedButtonCount);
