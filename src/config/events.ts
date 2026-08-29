export const RANN_UTSAV_DATES = {
  season_2026: {
    start: new Date('2026-11-01'),
    end: new Date('2027-02-28'),
    label: 'Rann Utsav 2026–27'
  }
} as const

// Update this pointer each year to change the active countdown target
export const ACTIVE_RANN_UTSAV_START = 
  RANN_UTSAV_DATES.season_2026.start

export const ACTIVE_RANN_UTSAV_END = 
  RANN_UTSAV_DATES.season_2026.end

export const ACTIVE_RANN_UTSAV_LABEL = 
  RANN_UTSAV_DATES.season_2026.label
