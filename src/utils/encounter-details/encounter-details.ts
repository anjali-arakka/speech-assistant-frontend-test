import {
  PatientDetails,
  usePatientDetails,
} from '../../context/consultation-context'
import {getApiCall} from '../api-utils'
import {providerUrl} from '../constants'

const MILLISECOND_TO_MINUTE_CONVERSION_FACTOR = 60000
const SIXTY_MINUTES = 60
const patientDetails: PatientDetails = usePatientDetails()

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

  return timeDifferenceInMinutes < SIXTY_MINUTES
}

const isProviderSame = async consultationEncounter => {
  console.log(consultationEncounter.uuid)
  console.log('encounterProviders uuid from isConsultationEncounterActive')
  console.log(consultationEncounter.encounterProviders[0].uuid)

  let provider = await getProviderUuid(consultationEncounter)

  console.log('providerUuid from get provider method')
  console.log(provider)
  console.log('providerUuid from context')
  console.log(patientDetails.providerUuid)
  console.log(
    "provider == puuid && consultationEncounter.encounterType.display == 'Consultation'",
  )
  console.log(provider == patientDetails.providerUuid)

  return provider == patientDetails.providerUuid
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
      isConsultationEncounterActive(encounter) &&
      isProviderSame(encounter),
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
