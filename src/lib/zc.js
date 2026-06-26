// Zewail City (UST) schools and their undergraduate programs.
// Source: official "UST Schools" pages on zewailcity.edu.eg. Program names are
// used as-is; parenthetical abbreviations / "(Current Program)" labels are dropped.
export const SCHOOL_MAJORS = {
  'School of Engineering': [
    'Aerospace Engineering',
    'Communications and Information Engineering',
    'Nanotechnology and Nanoelectronics Engineering',
    'Environmental Engineering',
    'Renewable Energy Engineering',
    'Energy and Bioprocess Engineering',
    'Mechatronics Engineering',
    'Electric Power Engineering',
    'Chemical and Environmental Engineering',
  ],
  'School of Computational Sciences & Artificial Intelligence': [
    'Software Development',
    'Data Science and Artificial Intelligence',
    'Information Technology',
    'Cyber Security',
  ],
  'School of Science': [
    'Biomedical Sciences',
    'Nano Science',
    'Physics',
    'Materials Science',
    'Biotechnology',
  ],
  'School of Business': [
    'Finance and Investment Management (FIM)',
    'Marketing, Entrepreneurship, and Innovation Management (MEIM)',
    'Operations, Supply Chain, and Technology Management (OSCTM)',
    'Human Resources Management',
    'Business Informatics',
    'Financial Technology',
    'Digital Marketing',
    'Supply Chain and Logistics',
  ],
}

export const SCHOOLS = Object.keys(SCHOOL_MAJORS)

export function majorsForSchool(school) {
  return SCHOOL_MAJORS[school] || []
}

// Find which school a (possibly legacy/free-text) major belongs to, so the
// dropdowns can preselect sensibly when editing an existing profile.
export function schoolForMajor(major) {
  if (!major) return ''
  for (const [school, majors] of Object.entries(SCHOOL_MAJORS)) {
    if (majors.includes(major)) return school
  }
  return ''
}
