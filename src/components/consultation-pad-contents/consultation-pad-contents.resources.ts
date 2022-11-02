import {postApiCall, getApiCall} from '../../utils/api-utils'
import {
  saveNotesUrl,
  conceptUrl,
  customVisitUrl,
  updateObsUrl,
} from '../../utils/constants'
import {
  getActiveConsultationEncounter,
  getConsultationObs,
} from '../../utils/encounter-details/encounter-details'

interface ObsType {
  person: string
  concept: string
  obsDatetime: string
  value: string
  location: string
  encounter: string
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

export const saveObsData = async (
  consultationText,
  patientUuid,
  location,
  encounterUuid,
) => {
  const conceptResponse = await getApiCall(conceptUrl)
  const conceptUuid = conceptResponse.results[0].uuid

  const obsDatetime = new Date().toISOString()

  const body = requestbody(
    patientUuid,
    conceptUuid,
    obsDatetime,
    consultationText,
    location,
    encounterUuid,
  )

  postApiCall(saveNotesUrl, body).then(response => response.json())
}

export const updateObsData = (obsUuid, consultationText) => {
  const body = {value: consultationText}
  postApiCall(updateObsUrl(obsUuid), body).then(response => response.json())
}

export const saveConsultationNotes = async (
  consultationText,
  patientDetails,
) => {
  const visitResponse = await getApiCall(
    customVisitUrl(patientDetails.patientUuid, patientDetails.locationUuid),
  )

  const consultationActiveEncounter = await getActiveConsultationEncounter(
    visitResponse,
  )

  if (consultationActiveEncounter) {
    const consultationObs = getConsultationObs(consultationActiveEncounter)
    if (consultationObs) {
      const obsUuid = consultationObs.uuid
      updateObsData(obsUuid, consultationText)
    } else {
      saveObsData(
        consultationText,
        patientDetails.patientUuid,
        patientDetails.location,
        consultationActiveEncounter.uuid,
      )
    }
  }
}
