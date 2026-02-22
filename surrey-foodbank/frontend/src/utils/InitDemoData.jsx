// If it does't already exist, saves an array of demo applicant
// accounts to local storage. Persists through browser refreshes.
export function initDemoData() {
  const existingUsers = localStorage.getItem("users");
  if (!existingUsers) {
    localStorage.setItem(
      "users",
      JSON.stringify([
        { email: "harnoor@example.com", password: "1234567890" },
      ]),
    );
  }
}
