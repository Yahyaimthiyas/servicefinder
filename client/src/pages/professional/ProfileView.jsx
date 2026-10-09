import { ProfessionalProfile } from "@/components/professionals/professional-profile"







export default function ProfessionalPage({ params }) {
  return <ProfessionalProfile professionalId={params.id} />
}
