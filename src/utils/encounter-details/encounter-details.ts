const MILLISECOND_TO_MINUTE_CONVERSION_FACTOR = 60000
const SIXTY_MINUTES = 60

export const isConsultationEncounterActive = consultationEncounter => {
  const consultationEncounterDateTime = new Date(
    consultationEncounter.encounterDatetime,
  )
  const currentDatetime = new Date()

  const timeDifferenceInMinutes =
    (currentDatetime.getTime() - consultationEncounterDateTime.getTime()) /
    MILLISECOND_TO_MINUTE_CONVERSION_FACTOR

  return timeDifferenceInMinutes < SIXTY_MINUTES
}

export const getEncounters = visitResponse => {
  return visitResponse.results.length > 0
    ? visitResponse.results[0].encounters
    : null
}

export const getActiveConsultationEncounter = visitResponse => {
  const encounters = getEncounters(visitResponse)
  const consultationActiveEncounter = encounters?.find(
    encounter =>
      encounter.encounterType.display == 'Consultation' &&
      isConsultationEncounterActive(encounter),
  )
  return consultationActiveEncounter
}

export const getConsultationObs = consultationActiveEncounter => {
  const observations = consultationActiveEncounter.obs
  let consultationObs = null
  if (observations) {
    consultationObs = observations.find(obs => {
      return obs.display.match(/^Consultation Note:/) !== null
    })
  }
  return consultationObs
}
