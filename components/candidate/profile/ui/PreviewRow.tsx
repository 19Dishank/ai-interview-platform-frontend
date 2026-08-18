type PreviewRowPropsType = {
  label: string;
  value: string;
};

export function PreviewRow({ label, value }: PreviewRowPropsType) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
