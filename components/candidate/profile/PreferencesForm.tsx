export default function PreferencesForm() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-xl font-semibold mb-2">Preferences</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Salary expectation</label>
          <select defaultValue="₹32–38 LPA" className="h-10 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>₹20–25 LPA</option>
            <option>₹25–32 LPA</option>
            <option value="₹32–38 LPA">₹32–38 LPA</option>
            <option>₹38–50 LPA</option>
            <option>₹50+ LPA</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Notice period</label>
          <select defaultValue="30 days" className="h-10 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Immediate</option>
            <option>15 days</option>
            <option value="30 days">30 days</option>
            <option>45 days</option>
            <option>60 days</option>
            <option>90 days</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Preferred locations</label>
        <div className="flex flex-wrap gap-2">
          {['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Remote'].map(loc => (
            <label key={loc} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked={['Bangalore', 'Remote'].includes(loc)} className="accent-primary" />
              {loc}
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Work type preference</label>
        <div className="flex flex-wrap gap-2">
          {['Full-time', 'Contract', 'Part-time', 'Open to all'].map(wt => (
            <label key={wt} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked={wt === 'Full-time'} className="accent-primary" />
              {wt}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
