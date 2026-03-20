function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-100", className)}
      {...props}
    />
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export { Skeleton }
