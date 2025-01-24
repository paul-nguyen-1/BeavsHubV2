import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/resumes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/resumes"!</div>
}
