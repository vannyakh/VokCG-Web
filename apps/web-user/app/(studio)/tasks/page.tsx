function StubPage({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <h2 className="text-xl font-bold text-primary">{title}</h2>
    </div>
  )
}

export default function TasksPage() {
  return <StubPage title="Tasks" />
}
