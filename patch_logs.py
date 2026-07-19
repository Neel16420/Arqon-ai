import pathlib

logs_path = pathlib.Path('src/pages/Logs.tsx')
content = logs_path.read_text(encoding='utf-8')

# Desktop table patch
# 1. Update the table tag to add border-separate and spacing
old_table = '<table className="w-full text-sm">'
new_table = '<table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}>'
content = content.replace(old_table, new_table)

# 2. Update the tbody tr styling
old_tr = """                    <tr
                      key={row.id}
                      className="cursor-pointer transition-colors animate-fade-in-up"
                      style={{
                        ...getStaggerDelay(i),
                        borderBottom: i < paginated.length - 1 ? '1px solid #1C1C1E' : 'none',
                        background: selected?.id === row.id ? 'var(--color-surface-2)' : 'transparent',
                      }}
                      onClick={() => setSelected(selected?.id === row.id ? null : row)}
                      onMouseEnter={(e) => { if (selected?.id !== row.id) e.currentTarget.style.background = 'var(--color-surface-2)' }}
                      onMouseLeave={(e) => { if (selected?.id !== row.id) e.currentTarget.style.background = 'transparent' }}
                    >"""

new_tr = """                    <tr
                      key={row.id}
                      className={`group cursor-pointer animate-fade-in-up transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl relative ${selected?.id === row.id ? 'shadow-sm' : ''}`}
                      style={{
                        ...getStaggerDelay(i),
                        background: selected?.id === row.id ? 'var(--color-surface-2)' : 'transparent',
                        boxShadow: selected?.id === row.id ? 'inset 2px 0 0 var(--color-accent)' : 'none',
                      }}
                      onClick={() => setSelected(selected?.id === row.id ? null : row)}
                      onMouseEnter={(e) => {
                        if (selected?.id !== row.id) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selected?.id !== row.id) {
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >"""

content = content.replace(old_tr, new_tr)

# Mobile table patch
# 1. Update the container
old_mobile = '<div className="md:hidden divide-y" style={{ borderColor: \'var(--color-border)\' }}>'
new_mobile = '<div className="md:hidden flex flex-col gap-2 p-2">'
content = content.replace(old_mobile, new_mobile)

# 2. Update the row items
old_mobile_row = """                <div
                  key={row.id}
                  className="px-4 py-3 cursor-pointer animate-fade-in-up"
                  style={{ 
                    ...getStaggerDelay(i),
                    background: selected?.id === row.id ? 'var(--color-surface-2)' : 'transparent' 
                  }}
                  onClick={() => setSelected(selected?.id === row.id ? null : row)}
                >"""

new_mobile_row = """                <div
                  key={row.id}
                  className="px-4 py-3 rounded-xl cursor-pointer animate-fade-in-up transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  style={{ 
                    ...getStaggerDelay(i),
                    background: selected?.id === row.id ? 'var(--color-surface-2)' : 'transparent',
                    borderLeft: selected?.id === row.id ? '2px solid var(--color-accent)' : '2px solid transparent'
                  }}
                  onClick={() => setSelected(selected?.id === row.id ? null : row)}
                  onMouseEnter={(e) => {
                    if (selected?.id !== row.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selected?.id !== row.id) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >"""

content = content.replace(old_mobile_row, new_mobile_row)

# Also fix the inner padding of the table so it breathes properly
old_table_wrapper = """        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">"""

new_table_wrapper = """        <div
          className="rounded-xl"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto px-4 pb-4">"""

content = content.replace(old_table_wrapper, new_table_wrapper)

logs_path.write_text(content, encoding='utf-8')
print("Patched Logs.tsx successfully.")
