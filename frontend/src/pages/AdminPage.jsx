import DashboardLayout from "../components/DashboardLayout"

const AdminPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage users, interviews, and system settings.</p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <h2 className="text-lg font-medium text-yellow-800 dark:text-yellow-400">Admin Page Under Construction</h2>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-500">
            The admin dashboard is currently being developed. Check back soon for full functionality.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminPage

