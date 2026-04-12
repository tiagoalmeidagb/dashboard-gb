"use client"

type Tab = "sales" | "website" | "email"

export function TopTabs({
  value,
  onChange,
}: {
  value: Tab
  onChange: (tab: Tab) => void
}) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "sales", label: "Sales" },
    { key: "website", label: "Website" },
    { key: "email", label: "Email" },
  ]

  return (
    <div className="flex justify-center w-full">
      <div className="flex rounded-2xl border bg-gray-100 p-1">

        {tabs.map((tab) => {
          const active = value === tab.key

          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`px-6 py-2 text-sm rounded-xl transition-all
                ${
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}

      </div>
    </div>
  )
}