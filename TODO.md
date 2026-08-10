# TODO - Fix Doctor Name Showing as DB ID

## Steps
1. [x] Analyze root cause: `getAllDoctors()` in `server/controllers/doctor-controller.js` falls back to `Dr. ${obj._id}` when no name found.
2. [ ] Edit `server/controllers/doctor-controller.js` to replace the DB-id fallback with a readable name derived from user/email.
3. [ ] Harden frontend `Patientappoinment.jsx` mapping to filter out any id-like name.
4. [ ] Restart server and verify doctor list shows full names.
