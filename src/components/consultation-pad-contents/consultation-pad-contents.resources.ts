import {postApiCall, getApiCall} from '../../utils/api-utils'
import {
  getActiveConsultationEncounter,
  getConsultationObs,
} from '../../utils/encounter-details/encounter-details'
import {
  visitUrl,
  consultationEncounterTypeUrl,
  encounterUrl,
  unknownEncounterRoleUrl,
  consultationNotesConceptUrl,
  saveNotesUrl,
  updateObsUrl,
} from '../../utils/constants'

interface ObsType {
  person: string
  concept: string
  obsDatetime: string
  value: string
  location: string
  encounter: string
}

interface EncounterProvidersType {
  provider: string
  encounterRole: string
}

interface EncounterObsType {
  concept: string
  value: string
}

interface EncounterType {
  encounterDatetime: string
  patient: string
  encounterType: string
  location: string
  encounterProviders: EncounterProvidersType[]
  obs: EncounterObsType[]
  visit: string
}

const requestbody = (
  person,
  concept,
  obsDatetime,
  value,
  location,
  encounter,
): ObsType => {
  return {
    person: person,
    concept: concept,
    obsDatetime: obsDatetime,
    value: value,
    location: location,
    encounter: encounter,
  }
}

const encounterRequestBody = (
  encounterDatetime,
  visitUuid,
  encounterTypeUuid,
  encounterRoleUuid,
  conceptuuid,
  value,
  patientDetails,
): EncounterType => {
  return {
    encounterDatetime: encounterDatetime,
    patient: patientDetails.patientUuid,
    encounterType: encounterTypeUuid,
    location: patientDetails.locationUuid,
    encounterProviders: [
      {
        provider: patientDetails.providerUuid,
        encounterRole: encounterRoleUuid,
      },
    ],
    obs: [
      {
        concept: conceptuuid,
        value: value,
      },
    ],
    visit: visitUuid,
  }
}

export const createConsultationObs = async (
  encounterDatetime,
  consultationText,
  patientUuid,
  location,
  encounterUuid,
) => {
  const consultationNotesConceptUuid = await getconsultationNotesConceptUuid()
  const body = requestbody(
    patientUuid,
    consultationNotesConceptUuid,
    encounterDatetime,
    consultationText,
    location,
    encounterUuid,
  )

  await postApiCall(saveNotesUrl, body).then(response => response.json())
}

const getEncounterTypeUuid = async () => {
  const response = await getApiCall(consultationEncounterTypeUrl)
  return response?.results[0]?.uuid
}
const getEncounterRoleUuid = async () => {
  const response = await getApiCall(unknownEncounterRoleUrl)
  return response?.results[0]?.uuid
}

const getconsultationNotesConceptUuid = async () => {
  const response = await getApiCall(consultationNotesConceptUrl)
  return response?.results[0]?.uuid
}

async function createEncounterWithObs(
  encounterDatetime,
  visitUuid,
  consultationText,
  patientDetails,
) {
  const encounterTypeUuid = await getEncounterTypeUuid()
  const encounterRoleUuid = await getEncounterRoleUuid()
  const consultationNotesConceptUuid = await getconsultationNotesConceptUuid()

  const requestbody = encounterRequestBody(
    encounterDatetime,
    visitUuid,
    encounterTypeUuid,
    encounterRoleUuid,
    consultationNotesConceptUuid,
    consultationText,
    patientDetails,
  )
  postApiCall(encounterUrl, requestbody).then(response => response.json())
}

export const updateConsultationObs = (obsUuid, consultationText) => {
  const body = {value: consultationText}
  postApiCall(updateObsUrl(obsUuid), body).then(response => response.json())
}

const saveConsultationObs = (
  consultationActiveEncounter,
  consultationText,
  encounterDatetime,
  patientDetails,
) => {
  const consultationObs = getConsultationObs(consultationActiveEncounter)
  if (consultationObs) {
    const obsUuid = consultationObs.uuid
    updateConsultationObs(obsUuid, consultationText)
  } else {
    createConsultationObs(
      encounterDatetime,
      consultationText,
      patientDetails.patientUuid,
      patientDetails.location,
      consultationActiveEncounter.uuid,
    )
  }
}

export const saveConsultationNotes = async (
  consultationText,
  patientDetails,
) => {
  const visitResponse = await getApiCall(
    visitUrl(patientDetails.patientUuid, patientDetails.locationUuid),
  )
  console.log('visit response before save')
  console.log(visitResponse)
  const consultationActiveEncounter = await getActiveConsultationEncounter(
    visitResponse,
  )
  console.log(
    'consultationActiveEncounter from save consultation notes true or false',
  )
  console.log(consultationActiveEncounter)
  const visitUuid = visitResponse?.results[0]?.uuid
  const encounterDatetime = new Date().toISOString()

  if (consultationActiveEncounter) {
    saveConsultationObs(
      consultationActiveEncounter,
      consultationText,
      encounterDatetime,
      patientDetails,
    )
    console.log('visit response after save')
    console.log(visitResponse)
  } else
    createEncounterWithObs(
      encounterDatetime,
      visitUuid,
      consultationText,
      patientDetails,
    )
  console.log('createEncounterWithObs')
}
