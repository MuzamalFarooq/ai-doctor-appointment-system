import { uploadPatientAvatar, removePatientAvatar } from '../actions/patient.actions.js';
import { uploadDoctorAvatar, removeDoctorAvatar } from '../actions/doctor.actions.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runAuthTests() {
  console.log('--- STARTING AVATAR AUTH & RBAC SECURITY TESTS ---\n');

  // When auth() returns null (unauthenticated)
  // Patient actions
  const patientUploadUnauth = await uploadPatientAvatar(new FormData());
  assert(
    patientUploadUnauth.error && patientUploadUnauth.error.includes('Unauthorized'),
    'Unauthenticated patient upload is rejected with 401 Unauthorized'
  );

  const patientRemoveUnauth = await removePatientAvatar();
  assert(
    patientRemoveUnauth.error && patientRemoveUnauth.error.includes('Unauthorized'),
    'Unauthenticated patient remove is rejected with 401 Unauthorized'
  );

  // Doctor actions
  const doctorUploadUnauth = await uploadDoctorAvatar(new FormData());
  assert(
    doctorUploadUnauth.error && doctorUploadUnauth.error.includes('Unauthorized'),
    'Unauthenticated doctor upload is rejected with 401 Unauthorized'
  );

  const doctorRemoveUnauth = await removeDoctorAvatar();
  assert(
    doctorRemoveUnauth.error && doctorRemoveUnauth.error.includes('Unauthorized'),
    'Unauthenticated doctor remove is rejected with 401 Unauthorized'
  );

  console.log(`\n--- AUTH TESTS: ${passed} PASSED, ${failed} FAILED ---`);
  process.exit(failed > 0 ? 1 : 0);
}

runAuthTests().catch(err => {
  console.error('Auth test failed:', err);
  process.exit(1);
});

