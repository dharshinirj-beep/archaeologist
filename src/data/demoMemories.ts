import type { Memory } from '@/types';

export const DEMO_MEMORIES: Memory[] = [
  {
    id: 'demo-1',
    filename: 'Coorix_Data_Analyst_Internship_Offer.pdf',
    content:
      'Internship offer for Data Analyst Intern position. Monthly stipend up to ₹15,000. Internship opportunity connected with Bengaluru. We are pleased to offer you the Data Analyst Intern role at Coorix. Your internship will be based in Bengaluru and carries a monthly stipend of ₹15,000. Please confirm your acceptance by March 20.',
    summary:
      'Internship offer from Coorix for a Data Analyst Intern role in Bengaluru with a monthly stipend of ₹15,000.',
    people: [],
    organizations: ['Coorix'],
    dates: ['2026-03-14'],
    locations: ['Bengaluru'],
    amounts: ['₹15,000'],
    topics: ['Data Analyst', 'Internship', 'Offer'],
    documentType: 'Offer Letter',
    createdAt: '2026-03-14T10:00:00Z',
  },
  {
    id: 'demo-2',
    filename: 'Coorix_Interview_Invitation.txt',
    content:
      'Interview invitation for the Data Analyst Internship at Coorix. You are invited to attend a technical interview for the Data Analyst Intern position on March 16. The interview will be conducted online.',
    summary:
      'Interview invitation from Coorix for the Data Analyst Internship, scheduled for March 16.',
    people: [],
    organizations: ['Coorix'],
    dates: ['2026-03-16'],
    locations: [],
    amounts: [],
    topics: ['Data Analyst', 'Internship', 'Interview'],
    documentType: 'Email',
    createdAt: '2026-03-16T09:00:00Z',
  },
  {
    id: 'demo-3',
    filename: 'Coorix_Selection_Confirmation.txt',
    content:
      'Selection confirmation for the internship. Congratulations! You have been selected for the Data Analyst Internship at Coorix. Your selection is confirmed as of March 18.',
    summary:
      'Selection confirmation from Coorix for the Data Analyst Internship, confirmed on March 18.',
    people: [],
    organizations: ['Coorix'],
    dates: ['2026-03-18'],
    locations: [],
    amounts: [],
    topics: ['Data Analyst', 'Internship', 'Selection'],
    documentType: 'Email',
    createdAt: '2026-03-18T14:00:00Z',
  },
  {
    id: 'demo-4',
    filename: 'Internship_Certificate.pdf',
    content:
      'Certificate related to successful completion of the internship. This certifies that you have successfully completed the Data Analyst Internship at Coorix. Issued on April 20.',
    summary:
      'Completion certificate for the Data Analyst Internship at Coorix, issued April 20.',
    people: [],
    organizations: ['Coorix'],
    dates: ['2026-04-20'],
    locations: [],
    amounts: [],
    topics: ['Data Analyst', 'Internship', 'Certificate', 'Completion'],
    documentType: 'Certificate',
    createdAt: '2026-04-20T16:00:00Z',
  },
  {
    id: 'demo-5',
    filename: 'Srishti_Data_Science_Internship.md',
    content:
      'Short data science internship experience. A brief data science internship at Srishti where I worked on analytics and visualization tasks.',
    summary:
      'A short data science internship experience at Srishti focused on analytics and visualization.',
    people: [],
    organizations: ['Srishti'],
    dates: [],
    locations: [],
    amounts: [],
    topics: ['Data Science', 'Internship', 'Analytics', 'Visualization'],
    documentType: 'Notes',
    createdAt: '2026-05-02T12:00:00Z',
  },
  {
    id: 'demo-6',
    filename: 'College_Project_Notes.md',
    content:
      'Notes about an AI project and machine learning concepts. Covered supervised learning, neural networks, and model evaluation techniques for our college AI project.',
    summary:
      'College project notes covering AI and machine learning concepts including neural networks.',
    people: [],
    organizations: [],
    dates: [],
    locations: [],
    amounts: [],
    topics: ['Artificial Intelligence', 'Machine Learning', 'Neural Networks', 'Project'],
    documentType: 'Notes',
    createdAt: '2026-06-01T08:00:00Z',
  },
];

export const DEMO_QUERY =
  'Find that internship document I received around March. I don\'t remember the company name, but I remember the stipend was around ₹15,000 and it was related to Bengaluru.';
