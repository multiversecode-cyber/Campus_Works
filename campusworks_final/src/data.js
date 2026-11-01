export const opportunities = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    organization: "Tech Club",
    owner: "Tech Club",
    type: "Internship",
    location: "On Campus",
    deadline: "Oct 20, 2026",
    payment: "Certificate + Stipend",
    skills: ["React", "JavaScript", "CSS"],
    description: "Build and improve the club's student technology portal while working with a small campus development team.",
    posted: "2 days ago"
  },
  {
    id: 2,
    title: "Event Volunteer",
    organization: "Cultural Committee",
    owner: "Cultural Committee",
    type: "Volunteer",
    location: "VIT Pune",
    deadline: "Oct 15, 2026",
    payment: "Certificate",
    skills: ["Communication", "Teamwork", "Event Management"],
    description: "Help coordinate an upcoming college cultural event, manage registrations and support event-day operations.",
    posted: "3 days ago"
  },
  {
    id: 3,
    title: "Research Assistant",
    organization: "Computer Engineering Department",
    owner: "Dr. Priya Shah",
    type: "Research",
    location: "Department Lab",
    deadline: "Oct 25, 2026",
    payment: "Certificate + Project Credit",
    skills: ["Python", "Research", "Machine Learning"],
    description: "Assist faculty with data collection, experimentation and basic machine learning analysis for a student research project.",
    posted: "5 days ago"
  },
  {
    id: 4,
    title: "Graphic Designer",
    organization: "Photography Club",
    owner: "Photography Club",
    type: "Part-time",
    location: "Hybrid",
    deadline: "Oct 18, 2026",
    payment: "Certificate",
    skills: ["Figma", "Canva", "Photoshop"],
    description: "Design posters, social media creatives and promotional material for campus activities.",
    posted: "1 week ago"
  },
  {
    id: 5,
    title: "Backend API Developer",
    organization: "Coding Club",
    owner: "Coding Club",
    type: "Project",
    location: "Hybrid",
    deadline: "Oct 30, 2026",
    payment: "Certificate + Project Credit",
    skills: ["Python", "Flask", "SQL"],
    description: "Create simple REST APIs for an internal campus project and document the endpoints.",
    posted: "1 week ago"
  },
  {
    id: 6,
    title: "Social Media Coordinator",
    organization: "Entrepreneurship Cell",
    owner: "E-Cell",
    type: "Volunteer",
    location: "On Campus",
    deadline: "Nov 2, 2026",
    payment: "Certificate",
    skills: ["Content", "Social Media", "Communication"],
    description: "Plan and coordinate social media content for workshops, competitions and entrepreneurship events.",
    posted: "1 week ago"
  }
];

export const initialApplications = [
  { id: 1, opportunityId: 1, title: "Frontend Developer Intern", organization: "Tech Club", date: "Oct 5, 2026", status: "Shortlisted" },
  { id: 2, opportunityId: 3, title: "Research Assistant", organization: "Computer Engineering Department", date: "Oct 2, 2026", status: "Under Review" },
  { id: 3, opportunityId: 2, title: "Event Volunteer", organization: "Cultural Committee", date: "Sep 28, 2026", status: "Completed" },
  { id: 4, opportunityId: 4, title: "Graphic Designer", organization: "Photography Club", date: "Sep 24, 2026", status: "Rejected" }
];

export const applicants = [
  { id: 1, name: "Aarav Mehta", course: "B.Tech CSE", year: "3rd Year", skills: ["React", "JavaScript", "Git"], status: "Applied" },
  { id: 2, name: "Neha Patil", course: "B.Tech IT", year: "3rd Year", skills: ["Python", "ML", "SQL"], status: "Shortlisted" },
  { id: 3, name: "Rohan Kulkarni", course: "B.Tech CSE", year: "2nd Year", skills: ["Java", "Spring Boot", "SQL"], status: "Under Review" },
  { id: 4, name: "Isha Sharma", course: "B.Des", year: "2nd Year", skills: ["Figma", "Canva", "Photoshop"], status: "Selected" }
];