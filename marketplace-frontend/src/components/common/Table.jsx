function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "Aucune donnée disponible.",
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {loading ? (
        <div className="flex min-h-40 items-center justify-center p-8">
          <p className="text-sm text-slate-500">
            Chargement...
          </p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center p-8">
          <p className="text-sm text-slate-500">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row, index) => (
                <tr
                  key={row.id ?? index}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-5 py-4 text-sm text-slate-600"
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Table;