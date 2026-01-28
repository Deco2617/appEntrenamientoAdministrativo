// Skeleton Loaders para estados de carga animados
import Sidebar from './Sidebar';

export function SkeletonCard() {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center animate-pulse">
            <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 w-16 bg-gray-300 rounded"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
    );
}

export function SkeletonTableRow() {
    return (
        <tr className="animate-pulse">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
            </td>
            <td className="p-4">
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </td>
            <td className="p-4">
                <div className="h-4 w-28 bg-gray-200 rounded"></div>
            </td>
        </tr>
    );
}

export function SkeletonTable({ rows = 5 }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
                <div className="h-9 w-40 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="p-4"><div className="h-3 w-16 bg-gray-200 rounded"></div></th>
                            <th className="p-4"><div className="h-3 w-12 bg-gray-200 rounded"></div></th>
                            <th className="p-4"><div className="h-3 w-20 bg-gray-200 rounded"></div></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {Array.from({ length: rows }).map((_, i) => (
                            <SkeletonTableRow key={i} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Skeleton para el Dashboard completo
export function DashboardSkeleton() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar real para alineación perfecta */}
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header skeleton */}
                <div className="mb-8 animate-pulse">
                    <div className="h-7 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-64 bg-gray-100 rounded"></div>
                </div>

                {/* Cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>

                {/* Table skeleton */}
                <SkeletonTable rows={5} />
            </main>
        </div>
    );
}
