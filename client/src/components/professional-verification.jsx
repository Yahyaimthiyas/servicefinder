import { Badge } from "@/components/ui/badge"
import { CheckCircle, Shield, Award, Clock, Users } from "lucide-react"












export function VerificationBadges({ professional }) {
  const badges = [
    {
      key: "verified",
      condition: professional.verified,
      icon: <CheckCircle className="h-4 w-4" />,
      label: "Verified Professional",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      key: "background",
      condition: professional.backgroundCheck,
      icon: <Shield className="h-4 w-4" />,
      label: "Background Checked",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      key: "insurance",
      condition: professional.insurance,
      icon: <Shield className="h-4 w-4" />,
      label: "Insured & Bonded",
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      key: "experience",
      condition: professional.yearsExperience >= 5,
      icon: <Clock className="h-4 w-4" />,
      label: `${professional.yearsExperience}+ Years Experience`,
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    {
      key: "jobs",
      condition: professional.completedJobs >= 50,
      icon: <Users className="h-4 w-4" />,
      label: `${professional.completedJobs}+ Jobs Completed`,
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
  ]

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <Award className="h-4 w-4 text-blue-600" />
        Professional Credentials
      </h4>

      <div className="flex flex-wrap gap-2">
        {badges.map(
          (badge) =>
            badge.condition && (
              <Badge key={badge.key} variant="outline" className={`flex items-center gap-1 ${badge.color}`}>
                {badge.icon}
                {badge.label}
              </Badge>
            ),
        )}
      </div>

      {professional.certifications.length > 0 && (
        <div className="mt-3">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Certifications</h5>
          <div className="flex flex-wrap gap-1">
            {professional.certifications.map((cert, index) => (
              <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
