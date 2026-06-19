function StubPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <h2 className="text-xl font-bold text-primary">{title}</h2>
      <p className="max-w-md text-sm text-muted">{description}</p>
    </div>
  )
}

export default function CreatePage() {
  return (
    <StubPage
      title="Create"
      description="Create studio flow will be migrated next from backup/src/pages/create-page.tsx"
    />
  )
}
