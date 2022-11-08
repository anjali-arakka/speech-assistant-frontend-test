import {getApiCall} from '../api-utils'
import {providerUrl} from '../constants'

const MILLISECOND_TO_MINUTE_CONVERSION_FACTOR = 60000
const SIXTY_MINUTES = 60

const getProviderUuid = async consultationEncounter => {
  const response = await getApiCall(
    providerUrl(
      consultationEncounter.uuid,
      consultationEncounter.encounterProviders[0].uuid,
    ),
  )
  return response?.provider?.uuid
}

const isConsultationEncounterActive = async consultationEncounter => {
  const consultationEncounterDateTime = new Date(
    consultationEncounter.encounterDatetime,
  )
  const currentDatetime = new Date()

  const timeDifferenceInMinutes =
    (currentDatetime.getTime() - consultationEncounterDateTime.getTime()) /
    MILLISECOND_TO_MINUTE_CONVERSION_FACTOR

  console.log('timeDifferenceInMinutes < SIXTY_MINUTES')
  console.log(timeDifferenceInMinutes < SIXTY_MINUTES)
  return timeDifferenceInMinutes < SIXTY_MINUTES
}

const isProviderSame = async (consultationEncounter, puuid) => {
  let provider = await getProviderUuid(consultationEncounter)

  console.log('providerUuid from get provider method')
  console.log(provider)
  console.log('providerUuid from session ')
  console.log(puuid)

  return provider == puuid
}

export const getEncounters = visitResponse => {
  return visitResponse.results.length > 0
    ? visitResponse.results[0].encounters
    : null
}

export const getActiveConsultationEncounter = (visitResponse, puuid) => {
  const encounters = getEncounters(visitResponse)
  console.log('getActiveConsultationEncounter--1')
  // const consultationActiveEncounter = encounters?.find(
  //   encounter =>
  //     encounter.encounterType.display == 'Consultation' &&
  //     isConsultationEncounterActive(encounter, puuid),
  // )
  let consultationActiveEncounter = null
  encounters.forEach(async encounter => {
    let a =
      encounter.encounterType.display == 'Consultation' &&
      isConsultationEncounterActive(encounter) &&
      (await isProviderSame(encounter, puuid))
    console.log('a')
    console.log(a)
    if (a) {
      console.log('inside if -2')
      consultationActiveEncounter = encounter
    }
  })
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