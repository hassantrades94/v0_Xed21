import AdminLayout from "@/components/admin/admin-layout"
import ContentManagement from "@/components/admin/content-management"

export default function AdminContentPage() {
  const mockAdmin = {
    id: "admin-1",
    full_name: "Hassan Admin",
    email: "hassan.jobs07@gmail.com",
    role: "super_admin",
    is_active: true,
  }

  // Mock content data matching your screenshots
  const mockBoards = [
    {
      id: "cbse",
      name: "CBSE/NCERT",
      code: "CBSE",
      description: "Central Board of Secondary Education",
      subjects: [
        {
          id: "english-1",
          name: "English",
          code: "ENG",
          grade: 1,
          topics: [
            { id: "grammar", name: "Grammar", description: "Basic grammar concepts" },
            { id: "literature", name: "Literature", description: "Reading and comprehension" },
            { id: "writing", name: "Writing Skills", description: "Writing practice" },
            { id: "reading", name: "Reading Comprehension", description: "Reading skills" },
            { id: "poetry", name: "Poetry", description: "Poems and rhymes" },
          ],
        },
        {
          id: "hindi-1",
          name: "Hindi",
          code: "HIN",
          grade: 1,
          topics: [
            { id: "hindi-grammar", name: "व्याकरण", description: "Hindi grammar" },
            { id: "hindi-literature", name: "साहित्य", description: "Hindi literature" },
            { id: "hindi-writing", name: "लेखन", description: "Hindi writing" },
            { id: "hindi-reading", name: "पठन", description: "Hindi reading" },
            { id: "hindi-poetry", name: "कविता", description: "Hindi poetry" },
          ],
        },
        {
          id: "science-1",
          name: "Science",
          code: "SCI",
          grade: 1,
          topics: [
            { id: "magnets", name: "The Wonderful World of Science", description: "Introduction to science" },
            { id: "materials", name: "Materials Around Us", description: "Different materials" },
          ],
        },
      ],
    },
  ]

  return (
    <AdminLayout admin={mockAdmin}>
      <ContentManagement boards={mockBoards} />
    </AdminLayout>
  )
}
